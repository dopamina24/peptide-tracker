-- Add Retatrutide to peptides table
INSERT INTO public.peptides (
    slug,
    name_es,
    name_en,
    description_es,
    description_en,
    half_life_hours,
    typical_dose_min,
    typical_dose_max,
    dose_unit,
    tags,
    side_effects_es,
    reconstitution_notes_es,
    routes,
    popular_for,
    mechanism_of_action,
    frequency,
    fda_status
) VALUES (
    'retatrutide',
    'Retatrutida',
    'Retatrutide',
    'Agonista triple de los receptores (GLP-1, GIP, Glucagón) de próxima generación para pérdida de peso potente.',
    'Next-generation triple receptor agonist (GLP-1, GIP, Glucagon) for potent weight loss.',
    144, -- ~6 days
    1,
    12,
    'mg',
    ARRAY['fat_loss', 'metabolism'],
    'Náuseas, vómitos, diarrea, aumento de frecuencia cardíaca.',
    'Reconstituir suavemente. No agitar. Mantener refrigerado.',
    ARRAY['subcutaneous'],
    'Pérdida de peso extrema, mejora metabólica',
    'Actúa sobre tres receptores hormonales (GLP-1, GIP y Glucagón) para reducir apetito, mejorar sensibilidad a insulina y aumentar gasto energético.',
    'Semanal',
    'investigational'
) ON CONFLICT (slug) DO UPDATE SET 
    name_es = EXCLUDED.name_es, -- Ensure updates if exists
    half_life_hours = EXCLUDED.half_life_hours;
