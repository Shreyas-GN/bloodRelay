-- ⚠️ CAUTION: THIS WILL PERMANENTLY DELETE ALL DATA IN THE SPECIFIED TABLES
-- To run this, go to your Supabase Dashboard -> SQL Editor -> New Query.

-- 1. Remove all donor responses
TRUNCATE TABLE public.donor_responses CASCADE;

-- 2. Remove all blood requests
TRUNCATE TABLE public.blood_requests CASCADE;

-- 3. Remove all notifications (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        EXECUTE 'TRUNCATE TABLE public.notifications CASCADE';
    END IF;
END $$;

-- 4. (Optional) Remove all user profiles
-- Uncomment the line below if you want EVERYONE (including you) to re-onboard from scratch.
-- TRUNCATE TABLE public.profiles CASCADE;

-- 4. Reset sequences (if any)
-- Supabase handles uuid defaults automatically, but for serial IDs:
-- ALTER SEQUENCE IF EXISTS blood_requests_id_seq RESTART WITH 1;
