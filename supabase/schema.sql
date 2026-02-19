-- ============================================================
-- PeptideTracker — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PEPTIDE LIBRARY (public read, admin write)
-- ============================================================
CREATE TABLE IF NOT EXISTS peptides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  routes TEXT[] DEFAULT '{}',
  typical_dose_min NUMERIC,
  typical_dose_max NUMERIC,
  dose_unit TEXT DEFAULT 'mcg',
  half_life_hours NUMERIC,
  reconstitution_notes_es TEXT,
  side_effects_es TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  weight_kg NUMERIC,
  age INTEGER,
  sex TEXT,
  goals TEXT[] DEFAULT '{}',
  experience_level TEXT,
  preferred_locale TEXT DEFAULT 'es',
  dark_mode BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- PROTOCOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  cycle_on_weeks INTEGER,
  cycle_off_weeks INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROTOCOL ITEMS (peptides within a protocol)
-- ============================================================
CREATE TABLE IF NOT EXISTS protocol_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID REFERENCES protocols ON DELETE CASCADE NOT NULL,
  peptide_id UUID REFERENCES peptides NOT NULL,
  custom_name TEXT,
  dose_amount NUMERIC NOT NULL,
  dose_unit TEXT DEFAULT 'mcg',
  route TEXT DEFAULT 'subcutaneous',
  frequency_type TEXT DEFAULT 'daily', -- daily, eod, 3x_week, weekly, custom
  frequency_days INTEGER[] DEFAULT '{}',
  preferred_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOSE LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS dose_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  protocol_item_id UUID REFERENCES protocol_items ON DELETE SET NULL,
  peptide_id UUID REFERENCES peptides NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  dose_amount NUMERIC NOT NULL,
  dose_unit TEXT DEFAULT 'mcg',
  route TEXT DEFAULT 'subcutaneous',
  injection_site TEXT,
  lot_number TEXT,
  provider TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVENTORY (vials)
-- ============================================================
CREATE TABLE IF NOT EXISTS vials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  peptide_id UUID REFERENCES peptides NOT NULL,
  custom_name TEXT,
  amount_mg NUMERIC NOT NULL,
  provider TEXT,
  purchased_at DATE,
  reconstituted_at DATE,
  expires_at DATE,
  bac_water_ml NUMERIC,
  remaining_mg NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WELLNESS LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS wellness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  logged_date DATE DEFAULT CURRENT_DATE,
  sleep_quality SMALLINT CHECK (sleep_quality BETWEEN 1 AND 10),
  energy_level SMALLINT CHECK (energy_level BETWEEN 1 AND 10),
  mood SMALLINT CHECK (mood BETWEEN 1 AND 10),
  weight_kg NUMERIC,
  side_effects TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, logged_date)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vials ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE peptides ENABLE ROW LEVEL SECURITY;

-- Peptides: public read
CREATE POLICY "peptides_public_read" ON peptides FOR SELECT USING (true);

-- Profiles: user owns their own
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Protocols: user owns
CREATE POLICY "protocols_own" ON protocols FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Protocol items: via protocol ownership
CREATE POLICY "protocol_items_own" ON protocol_items FOR ALL USING (
  EXISTS (SELECT 1 FROM protocols WHERE protocols.id = protocol_items.protocol_id AND protocols.user_id = auth.uid())
);

-- Dose logs: user owns
CREATE POLICY "dose_logs_own" ON dose_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Vials: user owns
CREATE POLICY "vials_own" ON vials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wellness: user owns
CREATE POLICY "wellness_own" ON wellness_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_logged ON dose_logs (user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_protocols_user_active ON protocols (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_vials_user ON vials (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_wellness_user_date ON wellness_logs (user_id, logged_date DESC);
