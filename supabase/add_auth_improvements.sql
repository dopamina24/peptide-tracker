-- ============================================================
-- Migration: Auth + Profile improvements
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add updated_at column to profiles if missing
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Update the trigger to also capture social login display name
--    (Google sends 'full_name', Apple sends 'name')
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name'
    ),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET username = COALESCE(
          EXCLUDED.username,
          profiles.username  -- don't overwrite if user already set a name
        ),
        updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger (DROP IF EXISTS + CREATE ensures latest version)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 3. Ensure Apple and Google are enabled as OAuth providers
--    (This must be done in the Supabase Dashboard → Authentication → Providers)
--    This SQL file just documents what's needed.

-- ============================================================
-- IMPORTANT: Supabase Dashboard Steps Required
-- ============================================================
-- 1. Go to Authentication → Providers → Google
--      - Enable: ON
--      - Add your Google Client ID + Secret from console.cloud.google.com
--      - Authorized redirect URI: https://YOUR_PROJECT.supabase.co/auth/v1/callback
--
-- 2. Go to Authentication → Providers → Apple
--      - Enable: ON
--      - Add your Apple Service ID, Team ID, Key ID, Private Key
--      - Authorized redirect URI: https://YOUR_PROJECT.supabase.co/auth/v1/callback
--
-- 3. Go to Authentication → URL Configuration
--      - Site URL: http://localhost:3000 (dev) / your prod URL
--      - Add to Redirect URLs: http://localhost:3000/auth/callback
-- ============================================================
