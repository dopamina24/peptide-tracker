-- Add mood column to wellness_logs using an integer scale 1-5
ALTER TABLE wellness_logs 
ADD COLUMN IF NOT EXISTS mood_rating INTEGER;
