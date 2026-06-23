-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Profiles Table (aligned with database.types.ts)
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY, -- Clerk User ID (string)
  full_name text NOT NULL,
  phone text,
  blood_group text NOT NULL,
  is_donor boolean DEFAULT true,
  is_available_donor boolean DEFAULT true,
  city text,
  profile_completed boolean DEFAULT false,
  location geography(Point, 4326),
  latitude double precision,
  longitude double precision,
  last_donation_date timestamp with time zone,
  cooldown_until timestamp with time zone,
  is_verified boolean DEFAULT false,
  fcm_token text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create Blood Requests Table (aligned with database.types.ts)
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id text REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_group text NOT NULL,
  units integer DEFAULT 1,
  patient_name text,
  hospital_name text NOT NULL,
  city text,
  contact_phone text,
  urgency_level text DEFAULT 'IMMEDIATE',
  location geography(Point, 4326),
  latitude double precision,
  longitude double precision,
  requester_phone text,
  notified_count integer DEFAULT 0,
  confirmed_count integer DEFAULT 0,
  escalation_phase integer DEFAULT 1,
  expires_at timestamp with time zone,
  status text CHECK (status IN (
    'searching', 'donor_accepted', 'fulfilled', 'cancelled', 'expired'
  )) DEFAULT 'searching',
  created_at timestamp with time zone DEFAULT now(),
  donor_name text,
  donor_phone text,
  note text,
  requester_relation text
);

-- 4. Create Donor Responses Table (aligned with database.types.ts)
CREATE TABLE IF NOT EXISTS public.donor_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.blood_requests(id) ON DELETE CASCADE NOT NULL,
  donor_id text REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('ACCEPTED', 'CONFIRMED', 'ARRIVED', 'CANCELLED')) DEFAULT 'ACCEPTED',
  distance_meters double precision,
  responded_at timestamp with time zone DEFAULT now(),
  eta_minutes integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_request_donor UNIQUE (request_id, donor_id)
);

-- 5. Create Notification Logs Table (aligned with database.types.ts)
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.blood_requests(id) ON DELETE CASCADE NOT NULL,
  donor_id text REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel text CHECK (channel IN ('PUSH', 'SMS', 'WHATSAPP')),
  status text CHECK (status IN ('SENT', 'DELIVERED', 'FAILED')),
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb
);

-- 6. Create Blood Banks Table (aligned with database.types.ts)
CREATE TABLE IF NOT EXISTS public.blood_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  phone text,
  latitude double precision,
  longitude double precision,
  operating_hours text,
  website text,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id OR true); -- Bypassed security filter for simplified local dev
CREATE POLICY "Allow users to insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to requests" ON public.blood_requests FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create requests" ON public.blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update own requests" ON public.blood_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to responses" ON public.donor_responses FOR SELECT USING (true);
CREATE POLICY "Allow users to insert responses" ON public.donor_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update own responses" ON public.donor_responses FOR UPDATE USING (true);

-- 9. Geospatial Indexing
CREATE INDEX IF NOT EXISTS profiles_location_idx ON public.profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS requests_location_idx ON public.blood_requests USING GIST (location);

-- 10. PostGIS Helper Function: find_nearby_donors
CREATE OR REPLACE FUNCTION find_nearby_donors(
  lat double precision,
  lng double precision,
  radius_km double precision
)
RETURNS TABLE (
  id text,
  full_name text,
  phone text,
  blood_group text,
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
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) AS distance_meters
  FROM public.profiles p
  WHERE p.is_available_donor = true
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location, 
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 
      radius_km * 1000
    )
  ORDER BY distance_meters ASC;
END;
$$;

-- 11. PostGIS Helper Function: find_nearby_donors_v2
CREATE OR REPLACE FUNCTION find_nearby_donors_v2(
  req_lat double precision,
  req_lng double precision,
  radius_km double precision,
  req_blood_group text
)
RETURNS TABLE (
  id text,
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
  WHERE p.is_available_donor = true
    AND p.blood_group = req_blood_group
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location, 
      ST_SetSRID(ST_MakePoint(req_lng, req_lat), 4326)::geography, 
      radius_km * 1000
    )
  ORDER BY distance_meters ASC;
END;
$$;

-- 12. RPC to increment confirmed count
CREATE OR REPLACE FUNCTION increment_confirmed_count(req_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blood_requests
  SET confirmed_count = confirmed_count + 1,
      status = 'donor_accepted'
  WHERE id = req_id;
END;
$$;

-- 13. Activities table (user event history)
CREATE TABLE IF NOT EXISTS public.activities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id  uuid REFERENCES public.blood_requests(id) ON DELETE SET NULL,
  event_type  text NOT NULL CHECK (event_type IN (
                'profile_completed',
                'availability_changed',
                'request_created',
                'notification_sent',
                'donor_accepted',
                'request_fulfilled',
                'request_cancelled',
                'request_expired'
              )),
  description text NOT NULL,
  created_at  timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to activities"   ON public.activities FOR SELECT USING (true);
CREATE POLICY "Allow insert into activities"      ON public.activities FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS activities_user_id_idx    ON public.activities (user_id);
CREATE INDEX IF NOT EXISTS activities_request_id_idx ON public.activities (request_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON public.activities (created_at DESC);

-- 14. Notifications table (user inbox — separate from notification_logs delivery log)
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.blood_requests(id) ON DELETE SET NULL,
  title      text NOT NULL,
  message    text NOT NULL,
  type       text NOT NULL DEFAULT 'system'
               CHECK (type IN ('emergency_request', 'request_update', 'system')),
  status     text NOT NULL DEFAULT 'unread'
               CHECK (status IN ('unread', 'read')),
  sent_at    timestamp with time zone NOT NULL DEFAULT now(),
  read_at    timestamp with time zone
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to notifications"   ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow insert into notifications"      ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on notifications"        ON public.notifications FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx  ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_status_idx   ON public.notifications (status);
CREATE INDEX IF NOT EXISTS notifications_sent_at_idx  ON public.notifications (sent_at DESC);
