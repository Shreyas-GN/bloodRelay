-- 🩸 PulseAid V2 Database Migration

-- 1. Update Profiles Table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS last_donation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- 2. Update Blood Requests Table
ALTER TABLE public.blood_requests
ADD COLUMN IF NOT EXISTS requester_phone TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS notified_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS confirmed_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS escalation_phase INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Drop check constraint to modify it if needed, or update status enum logic if it was a check constraint.
-- Assuming status is currently a check constraint based on original schema:
ALTER TABLE public.blood_requests DROP CONSTRAINT IF EXISTS blood_requests_status_check;
ALTER TABLE public.blood_requests ADD CONSTRAINT blood_requests_status_check 
CHECK (status IN ('CREATED', 'SEARCHING_FOR_DONORS', 'DONOR_ACCEPTED', 'open', 'fulfilled', 'cancelled', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'SEARCHING', 'ACCEPTED', 'CONFIRMED', 'ARRIVING', 'FULFILLED'));

-- Normalize existing statuses to uppercase if desired (optional data migration step)
UPDATE public.blood_requests SET status = 'SEARCHING' WHERE status IN ('open', 'SEARCHING_FOR_DONORS');
UPDATE public.blood_requests SET status = 'FULFILLED' WHERE status IN ('fulfilled', 'COMPLETED');
UPDATE public.blood_requests SET status = 'CANCELLED' WHERE status IN ('cancelled');

-- 3. Update Donor Responses Table
ALTER TABLE public.donor_responses
ADD COLUMN IF NOT EXISTS distance_meters DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS eta_minutes INT;

-- 4. Create Notification Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL, -- Keep as UUID or string based on existing schema. Current schema uses string for id? No, looks like UUID based on initial setup. Wait, in initial setup it was gen_random_uuid().
    donor_id UUID,
    channel TEXT CHECK (channel IN ('PUSH', 'SMS', 'WHATSAPP')),
    status TEXT CHECK (status IN ('SENT', 'DELIVERED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Note: We might need to alter request_id/donor_id types if they are actually text/varchar in the existing DB.
-- In supabase_setup.sql, they are UUID.

-- 5. Create Blood Banks Table
CREATE TABLE IF NOT EXISTS public.blood_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    operating_hours TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Updated RPC Function: find_nearby_donors_v2
CREATE OR REPLACE FUNCTION find_nearby_donors_v2(
  req_lat double precision,
  req_lng double precision,
  radius_km double precision,
  req_blood_group text
)
RETURNS TABLE (
  id uuid,
  full_name text,
  phone text,
  blood_group text,
  fcm_token text,
  distance_meters double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.blood_group,
    p.fcm_token,
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(req_lng, req_lat), 4326)::geography) AS distance_meters
  FROM public.profiles p
  WHERE p.is_donor = true
    AND p.is_available_donor = true
    AND p.location IS NOT NULL
    AND p.blood_group = req_blood_group
    AND (p.cooldown_until IS NULL OR p.cooldown_until < NOW())
    AND ST_DWithin(
      p.location, 
      ST_SetSRID(ST_MakePoint(req_lng, req_lat), 4326)::geography, 
      radius_km * 1000
    )
  ORDER BY distance_meters ASC;
END;
$$;

-- 7. Blood Bank Proximity Search
CREATE OR REPLACE FUNCTION find_nearby_blood_banks(
  req_lat double precision,
  req_lng double precision,
  radius_km double precision
)
RETURNS TABLE (
  id uuid,
  name text,
  phone text,
  distance_meters double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.phone,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography, 
      ST_SetSRID(ST_MakePoint(req_lng, req_lat), 4326)::geography
    ) AS distance_meters
  FROM public.blood_banks b
  WHERE ST_DWithin(
    ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography, 
    ST_SetSRID(ST_MakePoint(req_lng, req_lat), 4326)::geography, 
    radius_km * 1000
  )
  ORDER BY distance_meters ASC;
END;
$$;

-- 8. Increment Confirmed Count Helper
CREATE OR REPLACE FUNCTION increment_confirmed_count(req_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blood_requests
  SET confirmed_count = confirmed_count + 1
  WHERE id = req_id;
END;
$$;

-- 11. OTP Verification Table
CREATE TABLE IF NOT EXISTS otp_verifications (
  phone TEXT PRIMARY KEY,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for OTP (Allow anonymous upsert for sending, but limited by logic in API)
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable anonymous upsert for OTP" ON otp_verifications
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_otp_verifications_updated_at
    BEFORE UPDATE ON otp_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
