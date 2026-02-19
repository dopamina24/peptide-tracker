-- Add starting and target weight columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS starting_weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC;

-- Initial backfill: if starting_weight is null, set it to current weight (or first log if possible, but simplicity first)
UPDATE profiles 
SET starting_weight_kg = weight_kg 
WHERE starting_weight_kg IS NULL AND weight_kg IS NOT NULL;
