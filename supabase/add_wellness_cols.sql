-- Add calories column to wellness_logs
ALTER TABLE wellness_logs 
ADD COLUMN IF NOT EXISTS calories INTEGER;

-- Add water_ml column just in case for future use
ALTER TABLE wellness_logs 
ADD COLUMN IF NOT EXISTS water_ml INTEGER;
