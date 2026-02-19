-- Add calories and detailed side effects tracking
ALTER TABLE wellness_logs 
ADD COLUMN IF NOT EXISTS calories INTEGER,
ADD COLUMN IF NOT EXISTS side_effects_detail JSONB DEFAULT '{}'::jsonb;

-- Example: side_effects_detail = {"nausea": 2, "headache": 1}
