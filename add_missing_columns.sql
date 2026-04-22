-- Migration: Add missing columns to blood_requests
-- This migration fixes the "Could not find the 'note' column" error.

ALTER TABLE public.blood_requests 
ADD COLUMN IF NOT EXISTS note TEXT,
ADD COLUMN IF NOT EXISTS requester_relation TEXT;

-- Verify the columns exist (optional, but good for logs)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blood_requests' AND column_name='note') THEN
        RAISE NOTICE 'Column "note" added successfully.';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blood_requests' AND column_name='requester_relation') THEN
        RAISE NOTICE 'Column "requester_relation" added successfully.';
    END IF;
END $$;
