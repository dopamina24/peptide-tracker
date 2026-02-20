-- Add default_frequency to peptides table
ALTER TABLE peptides ADD COLUMN IF NOT EXISTS default_frequency TEXT CHECK (default_frequency IN ('daily', 'eod', '3x_week', 'weekly', 'biweekly', 'monthly'));

-- Weight Loss (GLP-1/GIP) - Weekly
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Retatrutida%' OR name ILIKE '%Retatrutide%';
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Tirzepatida%' OR name ILIKE '%Tirzepatide%';
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Semaglutida%' OR name ILIKE '%Semaglutide%';
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Dulaglutida%' OR name ILIKE '%Dulaglutide%';
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Cagrilintida%' OR name ILIKE '%Cagrilintide%';
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Mazdutida%' OR name ILIKE '%Mazdutide%';
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%Survodutida%' OR name ILIKE '%Survodutide%';

-- Weight Loss (GLP-1) - Daily
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Liraglutida%' OR name ILIKE '%Liraglutide%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Exenatida%' OR name ILIKE '%Exenatide%';

-- Healing (Daily)
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%BPC-157%' OR name ILIKE '%BPC-157%';
UPDATE peptides SET default_frequency = 'biweekly' WHERE name_es ILIKE '%TB-500%' OR name ILIKE '%TB-500%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%KPV%' OR name ILIKE '%KPV%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%GHK-Cu%' OR name ILIKE '%GHK-Cu%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%LL-37%' OR name ILIKE '%LL-37%';

-- GHS (Daily)
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Ipamorelin%' OR name ILIKE '%Ipamorelin%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%CJC-1295 No DAC%' OR name ILIKE '%CJC-1295 No DAC%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Sermorelin%' OR name ILIKE '%Sermorelin%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Tesamorelin%' OR name ILIKE '%Tesamorelin%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%GHRP-2%' OR name ILIKE '%GHRP-2%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%GHRP-6%' OR name ILIKE '%GHRP-6%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Hexarelin%' OR name ILIKE '%Hexarelin%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Ibutamoren%' OR name ILIKE '%Ibutamoren%';

-- GHS (Weekly)
UPDATE peptides SET default_frequency = 'weekly' WHERE name_es ILIKE '%CJC-1295 DAC%' OR name ILIKE '%CJC-1295 DAC%';

-- Metabolic (Daily/Mixed)
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%AOD-9604%' OR name ILIKE '%AOD-9604%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Frag 176-191%' OR name ILIKE '%Frag 176-191%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%5-Amino-1MQ%' OR name ILIKE '%5-Amino-1MQ%';
UPDATE peptides SET default_frequency = '3x_week' WHERE name_es ILIKE '%MOTS-c%' OR name ILIKE '%MOTS-c%';

-- Cognitive (Daily)
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Semax%' OR name ILIKE '%Semax%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Selank%' OR name ILIKE '%Selank%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Dihexa%' OR name ILIKE '%Dihexa%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Cerebrolysin%' OR name ILIKE '%Cerebrolysin%';

-- Sexual (As Needed -> Daily Default)
UPDATE peptides SET default_frequency = 'biweekly' WHERE name_es ILIKE '%PT-141%' OR name ILIKE '%PT-141%';
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Melanotan%' OR name ILIKE '%Melanotan%';

-- Longevity
UPDATE peptides SET default_frequency = 'daily' WHERE name_es ILIKE '%Epitalon%' OR name ILIKE '%Epitalon%';
UPDATE peptides SET default_frequency = 'eod' WHERE name_es ILIKE '%Thymosin Alpha 1%' OR name ILIKE '%Thymosin Alpha 1%';

-- Fallback
UPDATE peptides SET default_frequency = 'daily' WHERE default_frequency IS NULL;
