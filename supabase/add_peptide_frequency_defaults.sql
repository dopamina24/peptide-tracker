-- Add default_frequency to peptides table
ALTER TABLE peptides ADD COLUMN IF NOT EXISTS default_frequency TEXT CHECK (default_frequency IN ('daily', 'eod', '3x_week', 'weekly', 'biweekly', 'monthly'));

-- Update existing peptides with common frequencies
-- GLP-1s & GIP / Glucagon -> usually weekly
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Retatrutida%' OR name ILIKE '%Retatrutide%';
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Tirzepatida%' OR name ILIKE '%Tirzepatide%';
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Semaglutida%' OR name ILIKE '%Semaglutide%';

-- Healing peptides -> usually daily or EOD
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%BPC-157%' OR name ILIKE '%BPC-157%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%TB-500%' OR name ILIKE '%TB-500%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Ipamorelin%' OR name ILIKE '%Ipamorelin%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%CJC-1295%' OR name ILIKE '%CJC-1295%';

-- Others fallback to daily or as needed, maybe leave null or set daily
UPDATE peptides SET default_frequency = 'daily' WHERE default_frequency IS NULL;
