-- Update Retatrutide to contain rich data
UPDATE public.peptides
SET 
  description_es = 'Agonista triple (GLP-1, GIP, Glucagón) de última generación. Actúa sobre tres vías hormonales simultáneamente para potenciar la pérdida de peso, mejorar la sensibilidad a la insulina y aumentar el gasto energético.',
  description_en = 'Next-generation triple agonist (GLP-1, GIP, Glucagon). Targets three hormonal pathways simultaneously to potentiate weight loss, improve insulin sensitivity, and increase energy expenditure.',
  mechanism_of_action = 'Mimetiza tres hormonas naturales: GLP-1 (sacia y controla glucosa), GIP (mejora metabolismo de lípidos y sensibilidad a insulina) y Glucagón (aumenta gasto energético y quema de grasa). Esta triple acción sinérgica produce resultados superiores a los agonistas simples.',
  popular_for = 'Pérdida de peso significativa, obesidad resistente, mejora metabólica integral.',
  side_effects_es = 'Náuseas, vómitos, diarrea, estreñimiento, aumento de frecuencia cardíaca, sensibilidad en la piel (disestesia). Los síntomas suelen ser transitorios.',
  half_life_hours = 144, -- ~6 days
  typical_dose_min = 1,
  typical_dose_max = 12,
  frequency = 'Semanal',
  dose_titration_notes = 'Iniciar con 2mg semanal por 4 semanas. Aumentar a 4mg por 4 semanas. Luego ajustar según tolerancia hasta dosis meta (max 12mg).',
  reconstitution_notes_es = 'Reconstituir con agua bacteriostática. Inyectar suavemente por la pared del vial. No agitar vigorosamente. Mantener refrigerado (2-8°C).',
  routes = ARRAY['subcutaneous'],
  fda_status = 'investigational',
  evidence_level = 'Ensayos Clínicos Fase 3 (Prometedores)',
  also_known_as = ARRAY['LY3437943', 'Giga-Mounjaro'],
  timing_notes = 'Administrar una vez a la semana, preferiblemente el mismo día. Se puede tomar con o sin comida.'
WHERE slug = 'retatrutide';
