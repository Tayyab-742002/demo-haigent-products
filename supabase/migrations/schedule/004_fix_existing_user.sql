-- ============================================
-- FIX: Add existing auth users to users table
-- Run this if you created users before running 002_user_trigger.sql
-- ============================================

-- Insert any existing auth users that don't have a users record
INSERT INTO public.users (id, email, name, organization_id, role)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    '00000000-0000-0000-0000-000000000001',
    'admin'
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- Verify: Check if users are now in the table
-- SELECT * FROM public.users;
