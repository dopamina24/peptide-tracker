-- ============================================================
-- Migration: Add rich peptide info columns
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================

ALTER TABLE peptides
  ADD COLUMN IF NOT EXISTS popular_for            TEXT,
  ADD COLUMN IF NOT EXISTS mechanism_of_action    TEXT,
  ADD COLUMN IF NOT EXISTS timing_notes           TEXT,
  ADD COLUMN IF NOT EXISTS frequency              TEXT,
  ADD COLUMN IF NOT EXISTS fda_status             TEXT DEFAULT 'research',
  ADD COLUMN IF NOT EXISTS also_known_as          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS evidence_level         TEXT,
  ADD COLUMN IF NOT EXISTS duration_notes         TEXT,
  ADD COLUMN IF NOT EXISTS dose_titration_notes   TEXT,
  ADD COLUMN IF NOT EXISTS administration_notes   TEXT;

-- ============================================================
-- BPC-157
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Recuperación de lesiones, sanación de tendones, úlceras GI, neuroprotección',
  mechanism_of_action   = 'Modula el sistema de óxido nítrico, promueve la angiogénesis y upregulación de receptores de GH. Interactúa con el sistema dopaminérgico y acelera la sanación de tendones estimulando la síntesis de colágeno.',
  timing_notes          = 'Mañana y tarde, o cerca del sitio de lesión',
  frequency             = '2 veces al día',
  fda_status            = 'research',
  evidence_level        = 'Preclínico (3 pilotos humanos)',
  duration_notes        = '4-12 semanas según protocolo',
  dose_titration_notes  = 'Iniciar con 200mcg/día y evaluar tolerancia. Aumentar hasta 500mcg/día según respuesta. No requiere escalada lenta — tolerancia generalmente inmediata.',
  administration_notes  = 'Subcutáneo near the site of injury for best results. Oral para patologías GI (alta tolerancia gástrica).'
WHERE slug = 'bpc-157';

-- ============================================================
-- TB-500
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Recuperación muscular, flexibilidad, reducción de inflamación crónica',
  mechanism_of_action   = 'Fragmento de Timosina Beta-4. Regula la actina, promueve migración celular, angiogénesis y diferenciación. Reduce inflamación via NF-κB.',
  timing_notes          = '2-3 veces por semana o según ciclo de carga',
  frequency             = 'Carga: 2 veces/semana. Mantenimiento: 1 vez/semana',
  fda_status            = 'research',
  evidence_level        = 'Preclínico',
  duration_notes        = '4-6 semanas carga, luego mantenimiento',
  dose_titration_notes  = 'Protocolo carga: 2-2.5mg 2x/semana por 4-6 semanas. Mantenimiento: 2-2.5mg 1x/semana.',
  administration_notes  = 'Subcutáneo o intramuscular. Rotar sitios de inyección. Reconstituir frío.'
WHERE slug = 'tb-500';

-- ============================================================
-- Semaglutida
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Pérdida de peso, control de apetito, manejo glucémico, riesgo cardiovascular',
  mechanism_of_action   = 'Imita la hormona GLP-1, enlentece el vaciado gástrico, aumenta secreción de insulina, reduce glucagón, actúa en centros cerebrales de apetito reduciendo el hambre y aumentando la saciedad. 94% similitud aminoacídica con GLP-1 humano.',
  timing_notes          = 'Mismo día cada semana, preferiblemente mañana para monitorear efectos secundarios',
  frequency             = '1 vez por semana',
  fda_status            = 'fda_approved',
  also_known_as         = ARRAY['Ozempic', 'Wegovy', 'Rybelsus'],
  evidence_level        = 'FDA Aprobado (T2D 2017, Obesidad 2021)',
  duration_notes        = 'Uso crónico / largo plazo',
  dose_titration_notes  = 'Iniciar con 0.25mg/semana × 4 sem → 0.5mg/semana × 4 sem → 1mg/semana. Para pérdida de peso: escalar hasta 2.4mg/semana. Aumentar solo si tolerado. Muchos mantienen a 1mg con buen resultado.',
  administration_notes  = 'Inyección subcutánea semanal en abdomen, muslo o brazo. Rotar sitios. También disponible como comprimido oral (Rybelsus) para T2D.'
WHERE slug = 'semaglutide';

-- ============================================================
-- Tirzepatida
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Pérdida de peso superior, control metabólico dual, diabetes tipo 2',
  mechanism_of_action   = 'Agonista dual GIP/GLP-1. Activa dos receptores incretinas simultáneamente, produciendo mayor reducción calórica, mejor control glucémico y mayor pérdida de peso que los GLP-1 simples.',
  timing_notes          = 'Mismo día cada semana. Escalar dosis gradualmente (cada 4 semanas)',
  frequency             = '1 vez por semana',
  fda_status            = 'fda_approved',
  also_known_as         = ARRAY['Mounjaro', 'Zepbound'],
  evidence_level        = 'FDA Aprobado (T2D 2022, Obesidad 2023)',
  duration_notes        = 'Uso crónico / largo plazo',
  dose_titration_notes  = 'Iniciar con 2.5mg/semana × 4 sem → 5mg/semana × 4 sem → 7.5mg → 10mg → 12.5mg → 15mg. Mantener en la dosis donde haya buena tolerancia. Evitar escalar si náuseas significativas.',
  administration_notes  = 'Inyección subcutánea semanal con autoinyector precargado (Mounjaro / Zepbound). Abdomen, muslo o brazo.'
WHERE slug = 'tirzepatide';

-- ============================================================
-- Retatrutida
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Pérdida de peso superior (triple vía), metabolismo, diabetes tipo 2',
  mechanism_of_action   = 'Triple agonista de GLP-1, GIP y receptores de glucagón. La activación del receptor de glucagón aumenta el gasto energético basal, mientras que GLP-1 y GIP reducen el apetito, produciendo pérdida de peso ~24% — superior a agentes duales. Fabricado por Eli Lilly.',
  timing_notes          = 'Mismo día cada semana. Escalar dosis muy gradualmente (cada 4-8 semanas)',
  frequency             = '1 vez por semana',
  fda_status            = 'research',
  also_known_as         = ARRAY['LY3437943'],
  evidence_level        = 'Fase 3 en curso (Eli Lilly, 2024-2025) — no aprobado aún',
  duration_notes        = 'Uso crónico (pendiente aprobación FDA)',
  dose_titration_notes  = 'Iniciar con 0.5mg/semana × 4 sem → 1mg × 4 sem → 2mg → 4mg → 8mg → 12mg máx. Escalar solo si bien tolerado. Compuesto en desarrollo aún.',
  administration_notes  = 'Inyección subcutánea semanal. Rotar sitios: abdomen, muslo o brazo. Mantener refrigerado.'
WHERE slug = 'retatrutide';

-- ============================================================
-- CJC-1295
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Aumento de GH, composición corporal, antienvejecimiento, sueño',
  mechanism_of_action   = 'Análogo GHRH modificado con Drug Affinity Complex (DAC) que extiende la semivida unido a albúmina plasmática. Estimula la pituitaria para liberar GH de forma pulsátil y fisiológica.',
  timing_notes          = '1-2 veces por semana, usualmente antes de dormir para aprovechar el pulso nocturno',
  frequency             = '1-2 veces por semana',
  fda_status            = 'research',
  evidence_level        = 'Preclínico / Anecdótico',
  duration_notes        = '8-12 semanas, con descanso de 4 semanas',
  dose_titration_notes  = 'Iniciar con 1mcg/kg → escalar hasta 2mcg/kg según tolerancia. Dosis fija común: 1000-2000mcg/semana. Combinar con Ipamorelin para efecto sinérgico máximo.',
  administration_notes  = 'Subcutáneo en abdomen. Administrar en ayunas o 2h después de comida para maximizar pulso de GH.'
WHERE slug = 'cjc-1295';

-- ============================================================
-- Ipamorelin
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Liberación selectiva de GH, sueño reparador, composición corporal, anti-aging',
  mechanism_of_action   = 'Secretagogo de GH selectivo que actúa sobre receptores de ghrelina en la pituitaria con mínimo impacto en cortisol y prolactina — diferenciándolo del GHRP-6. Produce pulsos naturales y fisiológicos de GH.',
  timing_notes          = 'En ayunas (mínimo 2h sin comida): mañana, post-entreno, y antes de dormir para maximizar GH nocturna',
  frequency             = '2-3 × día en ayunas (o 1 × día antes de dormir mínimo)',
  fda_status            = 'research',
  evidence_level        = 'Preclínico',
  duration_notes        = '8-12 semanas con descanso de 4 semanas',
  dose_titration_notes  = 'Iniciar con 100mcg/dosis. Aumentar hasta 200-300mcg/dosis. Protocolo más común: 100-200mcg 3x/día. SIEMPRE en ayunas para no bluntar el pulso de GH.',
  administration_notes  = 'Subcutáneo en abdomen en ayunas. Nunca combinar con comida calórica — reduce efecto hasta 75%.'
WHERE slug = 'ipamorelin';

-- ============================================================
-- GHK-Cu
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Antienvejecimiento, salud de piel, producción de colágeno, longevidad',
  mechanism_of_action   = 'Péptido tripéptido de cobre que activa una amplia gama de genes regenerativos (>4000). Estimula colágeno, elastina, VEGF y factores de crecimiento. Tiene efectos antioxidantes y antiinflamatorios.',
  timing_notes          = 'Mañana y noche sistémico. Tópico: 2x/día directamente sobre zona a tratar',
  frequency             = '1-2 × día sistémico, 2 × día tópico',
  fda_status            = 'research',
  evidence_level        = 'Estudios in vitro y preclínicos (dermatología)',
  duration_notes        = 'Uso continuo — sin necesidad de ciclos. Resultados visibles tras 8-12 semanas.',
  dose_titration_notes  = 'Sistémico: iniciar con 500mcg/día, aumentar hasta 1-1.5mg/día según tolerancia. Tópico: concentración 0.1-1% en crema base.',
  administration_notes  = 'SC para efecto sistémico. Tópico puro o en crema/sérum para piel. Estable 4 semanas refrigerado.'
WHERE slug = 'ghk-cu';

-- ============================================================
-- Sermorelin
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Estimulación fisiológica de GH, anti-aging, sueño reparador',
  mechanism_of_action   = 'Análogo de GHRH nativo (1-29) que estimula la pituitaria de forma natural. Al ser más fisiológico que análogos modificados (CJC con DAC), produce efectos más graduales y con menor riesgo de desensibilización.',
  timing_notes          = 'Antes de dormir — aprovecha el pulso máximo nocturno de GH (inicio sueño profundo ~90min)',
  frequency             = '1 × día (antes de dormir)',
  fda_status            = 'research',
  evidence_level        = 'Investigación clínica (FDA aprobó versión pediatría antes)',
  duration_notes        = '3-6 meses continuos. Se puede mantener largo plazo con uso nocturno.',
  dose_titration_notes  = 'Iniciar con 0.2mg (200mcg)/noche. Mantener 3-6 meses. Sin escalada necesaria en la mayoría. Algunos usan 0.3mg con protocolos más agresivos.',
  administration_notes  = 'SC abdomen 30 min antes de dormir en ayunas (no comer 2h antes). Corta vida media — actúa rápido, no necesita timing complejo.'
WHERE slug = 'sermorelin';

-- ============================================================
-- AOD-9604
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Quema de grasa localizada, lipólisis, sin efectos del HGH completo',
  mechanism_of_action   = 'Fragmento hGH(176-191). Activa beta-3 adrenoceptores en tejido graso estimulando lipólisis sin afectar IGF-1, insulina o crecimiento — los efectos secundarios típicos del HGH completo.',
  timing_notes          = 'En ayunas (mañana) y antes de ejercicio para maximizar lipólisis. Evitar cerca de comidas.',
  frequency             = '1-2 × día en ayunas',
  fda_status            = 'research',
  evidence_level        = 'Estudios humanos Fase 1-2 (completados), Fase 3 no finalizada',
  duration_notes        = '12-16 semanas por ciclo',
  dose_titration_notes  = 'Dosis estándar: 300-600mcg/día dividida en 1-2 inyecciones en ayunas. No requiere escalada lenta — inicio directo a dosis objetivo.',
  administration_notes  = 'SC abdomen en ayunas. Para lipólisis localizada, inyectar cerca de zona grasa objetivo. No hay evidencia suficiente de beneficio adicional ≥600mcg/día.'
WHERE slug = 'aod-9604';

-- ============================================================
-- PT-141
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Disfunción eréctil, libido femenino (HSDD), estimulación sexual central',
  mechanism_of_action   = 'Agonista del receptor de melanocortina (MC3R/MC4R). A diferencia del Viagra, actúa en el SNC para aumentar el deseo sexual en lugar de actuar periféricamente sobre el flujo sanguíneo.',
  timing_notes          = '1-2 horas antes de actividad sexual. Evitar comer 2h antes para mejor absorción.',
  frequency             = 'Según necesidad (máx. 1 vez cada 8-12h)',
  fda_status            = 'fda_approved',
  also_known_as         = ARRAY['Bremelanotide', 'Vyleesi'],
  evidence_level        = 'FDA Aprobado para HSDD en premenopáusicas (2019) — Vyleesi',
  duration_notes        = 'Uso según necesidad — no crónico',
  dose_titration_notes  = 'Iniciar con 0.75mg SC o 1mg nasal. Aumentar a 1.5-2mg SC si no hay efecto suficiente. No exceder 2mg/dosis. Algunos son sensibles a 0.5mg.',
  administration_notes  = 'SC abdomen o nasal. SC tiene inicio más lento (45-90 min) y más duradero. Nasal más rápido (30-60 min). Efectos duran 6-12h. Evitar en hipertensión severa.'
WHERE slug = 'pt-141';

-- ============================================================
-- Melanotan II
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Bronceado sin UV, aumento de libido, supresión del apetito',
  mechanism_of_action   = 'Análogo de α-MSH que activa receptores MC1R (pigmentación cutánea), MC3R/MC4R (libido, apetito). Produce melanina sin necesidad de exposición UV.',
  timing_notes          = 'Antes de dormir para minimizar náuseas. Dosis de carga iniciales: comenzar MUY bajo.',
  frequency             = 'Carga: diario 1-2 semanas. Mantenimiento: 2-3 × semana',
  fda_status            = 'research',
  evidence_level        = 'Investigación (sin aprobación — NO confundir con MT-1)',
  duration_notes        = 'Carga 2-4 semanas, luego mantenimiento indefinido a dosis bajas',
  dose_titration_notes  = 'COMENZAR con 0.1mg (100mcg) para evaluar sensibilidad. Aumentar 0.1mg cada día: → 0.25mg → 0.5mg → hasta 1mg máximo. Muchos logran bronceo completo con 0.5mg/día en carga.',
  administration_notes  = 'SC abdomen. Primera dosis SIEMPRE de noche y baja por riesgo de náuseas. Evitar sol las primeras horas post-inyección. Conservar en nevera.'
WHERE slug = 'melanotan-ii';

-- ============================================================
-- Epitalon
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Longevidad, elongación de telómeros, calidad de sueño, antienvejecimiento',
  mechanism_of_action   = 'Tetrapéptido Ala-Glu-Asp-Gly que estimula la telomerasa, enzima que alarga los telómeros acortados. Regula la melatonina por la glándula pineal. Efectos inmunomoduladores y antioxidantes documentados en estudios rusos.',
  timing_notes          = 'Protocolo de 10 días: 1-2 × día, preferiblemente de noche para sincronizar con glándula pineal',
  frequency             = '1-2 × día durante el ciclo de 10 días',
  fda_status            = 'research',
  evidence_level        = 'Estudios rusos (preclínico y humanos limitados)',
  duration_notes        = '10 días por ciclo — 2 ciclos por año (primavera + otoño)',
  dose_titration_notes  = 'Protocolo estándar: 5-10mg/día × 10 días consecutivos, 2 × año. Algunos usan 5mg/día, otros 10mg. Sin escalada — dosis fija desde el inicio.',
  administration_notes  = 'SC o IM. Reconstituir en agua bacteriostática. Administrar durante 10 días consecutivos. Ciclos separados por 3-6 meses.'
WHERE slug = 'epithalon';

-- ============================================================
-- SS-31
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Energía celular, función mitocondrial, cardioprotección, longevidad',
  mechanism_of_action   = 'Se acumula selectivamente en la membrana mitocondrial interna unido a cardiolipina. Protege la cadena de transporte de electrones, reduce radicales libres (ROS) y mejora la función mitocondrial en células envejecidas.',
  timing_notes          = 'Mañana por el efecto energizante. Evitar noche si causa insomnio.',
  frequency             = '1 × día o en días alternos',
  fda_status            = 'research',
  evidence_level        = 'Ensayos clínicos Fase 2/3 activos (IC, ERC, envejecimiento)',
  duration_notes        = '4-8 semanas por ciclo con descanso',
  dose_titration_notes  = 'Dosis clínica: 1-5mg SC/día. Inicio: 1-2mg/día. Aumentar a 3-5mg según respuesta. MUY inestable una vez reconstituido — usar en 24h.',
  administration_notes  = 'SC exclusivamente. Reconstituir en agua bacteriostática y conservar en hielo. Usar dentro de las 24h de reconstitución. Nunca almacenar reconstituido.'
WHERE slug = 'ss-31';

-- ============================================================
-- DSIP
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Insomnio, sueño profundo (delta), reducción de cortisol, estrés',
  mechanism_of_action   = 'Neuropéptido que cruza la barrera hematoencefálica. Interactúa con receptores de opioides, bombesina, serotonina y modula la activación del hipotálamo para inducir ondas delta del sueño sin sedación farmacológica.',
  timing_notes          = '20-30 minutos antes de dormir. Funciona mejor en ciclos de 5-7 días.',
  frequency             = 'Diario durante el ciclo (5-7 días consecutivos)',
  fda_status            = 'research',
  evidence_level        = 'Estudios clínicos europeos (décadas 70-90)',
  duration_notes        = 'Ciclos de 5-7 días. Máximo 30 días seguidos. Descanso de 2 semanas entre ciclos.',
  dose_titration_notes  = 'Dosis habitual: 100-400mcg SC antes de dormir. Iniciar con 100mcg. Muchos logran efecto completo con 200-250mcg. No escalar más de 500mcg/dosis.',
  administration_notes  = 'SC abdomen 20-30 min antes de acostarse. Estable solo 48h reconstituido — preparar fresco. Evitar luz directa.'
WHERE slug = 'dsip';

-- ============================================================
-- Selank
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Ansiedad, función cognitiva, memoria, inmunomodulación',
  mechanism_of_action   = 'Regula BDNF, serotonina y dopamina. Derivado de tuftosina con tripéptido Pro-Gly-Pro estabilizador. Modula receptores GABA-A sin dependencia ni sedación. Inmunomodulador innato.',
  timing_notes          = 'Mañana y/o tarde. Nasal para efecto ansiolítico más rápido (10-15 min)',
  frequency             = '2-3 × día nasal, o 1-2 × día SC',
  fda_status            = 'research',
  also_known_as         = ARRAY['TP-7'],
  evidence_level        = 'Aprobado en Rusia (ansiedad); preclínico en occidente',
  duration_notes        = 'Ciclos de 10-14 días. Descanso 7 días entre ciclos.',
  dose_titration_notes  = 'Nasal: 250-1000mcg/dosis (2-8 gotas de solución 0.15%). SC: 100-300mcg/dosis. No hay tolerancia marcada — se puede usar ciclos cortos repetidos.',
  administration_notes  = 'Nasal: diluir en SSF 0.9% a 0.15mg/ml. SC: reconstituir en agua bacteriostática. Efecto ansiolítico notorio en 15-30 min por vía nasal.'
WHERE slug = 'selank';

-- ============================================================
-- Semax
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Cognición, memoria, concentración, neuroplasticidad, estado de ánimo',
  mechanism_of_action   = 'Derivado de ACTH(4-7) sin efectos esteroideos. Aumenta BDNF, NGF y estimula dopamina y serotonina. Mejora plasticidad sináptica y memoria de trabajo. Aprobado en Rusia para ACV.',
  timing_notes          = 'Mañana o antes de actividad cognitiva. Nasal tiene efecto en 10-20 min. Evitar tarde-noche si causa insomnio.',
  frequency             = '1-3 × día nasal o SC',
  fda_status            = 'research',
  also_known_as         = ARRAY['N-Acetyl-Semax', 'Semax Amidate'],
  evidence_level        = 'Aprobado Rusia para ACV y disfunción cognitiva',
  duration_notes        = 'Ciclos de 10-14 días. Hasta 30 días continuos.',
  dose_titration_notes  = 'Nasal: 200-3000mcg/día (empieza bajo: 200-400mcg/día). SC: 100-250mcg/dosis. N-Acetyl-Semax: más potente — reducir dosis 30-50%. Semax Amidate: más potente aún.',
  administration_notes  = 'Nasal: diluir en SSF 0.9%. SC: agua bacteriostática. Estable en refrigeración 3-4 semanas reconstituido. Para efecto cognitivo rápido → nasal.'
WHERE slug = 'semax';

-- ============================================================
-- KPV
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Inflamación intestinal (EII), Crohn, colitis, inflamación sistémica',
  mechanism_of_action   = 'Tripéptido C-terminal del α-MSH antiinflamatorio. Inhibe NF-κB y reduce citocinas inflamatorias (TNF-α, IL-6). Alta biodisponibilidad oral para tracto GI. Efecto también en inflamación sistémica SC.',
  timing_notes          = 'Con o sin alimentos (baja afectación por comida). Para GI: preferiblemente antes de comer.',
  frequency             = '2-3 × día oral o SC',
  fda_status            = 'research',
  evidence_level        = 'Preclínico + estudios en EII',
  duration_notes        = '4-8 semanas por ciclo',
  dose_titration_notes  = 'Oral para EII: 500-5000mcg/día. SC sistémico: 500-1000mcg/día. Iniciar dosis bajas. Escalada lenta en GI inflamado. Alta tolerancia general.',
  administration_notes  = 'Oral para patologías intestinales (alta biodisponibilidad GI). SC para efectos sistémicos. No requiere reconstituir si oral — disolver en agua.'
WHERE slug = 'kpv';

-- ============================================================
-- LL-37
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Antimicrobiano, infecciones crónicas, cicatrización de heridas, inmunidad',
  mechanism_of_action   = 'Único cathelicidín humano. Destruye membranas bacterianas por acción directa (amplio espectro). Inmunomodula macrófagos, neutrófilos y células dendríticas. Promueve angiogénesis en heridas crónicas.',
  timing_notes          = '1-2 × día. Tópico aplicar directamente sobre herida/zona infectada.',
  frequency             = '1-2 × día SC o tópico',
  fda_status            = 'research',
  evidence_level        = 'Estudios in vitro extensos, piloto clínico',
  duration_notes        = 'Según patología. Infecciones: 2-4 semanas. Heridas: hasta cierre.',
  dose_titration_notes  = 'SC: iniciar 100mcg/dosis. Rango: 100-500mcg/día. Tópico: concentración 0.01-0.1% en base gel/crema. Inyección en sitio puede arder — dosis lenta.',
  administration_notes  = 'SC o tópico. Tópico: diluir en gel hidrofílico. SC: reconstituir en agua bacteriostática. Estable solo 2 semanas refrigerado. Posible dolor local en inyección.'
WHERE slug = 'll-37';

-- ============================================================
-- Hexarelina
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Liberación potente de GH, volumen muscular, cardioprotección',
  mechanism_of_action   = 'Péptido GHRP de mayor potencia. Activa receptores de ghrelina más fuertemente que otros GHRP, pero también aumenta cortisol, prolactina y ACTH. Tiene efectos cardioprotectores directos independientes de GH.',
  timing_notes          = 'En ayunas (2-3h sin comida): mañana, post-entreno, antes de dormir',
  frequency             = '2-3 × día en ayunas',
  fda_status            = 'research',
  evidence_level        = 'Preclínico (extenso) + estudios cardíacos en humanos',
  duration_notes        = '6-8 semanas máximo por ciclo. Desensibilización rápida.',
  dose_titration_notes  = 'Iniciar 100mcg/dosis. No escalar más de 150-200mcg por desensibilización. Rotar días de uso si protocolo largo. Más corto = menos desensibilización.',
  administration_notes  = 'SC abdomen en ayunas estrictos. La ingesta de carbohidratos/grasas bloquea el pulso de GH. Reconstituir en agua bacteriostática — estable 30 días refrigerado.'
WHERE slug = 'hexarelin';

-- ============================================================
-- GHRP-6
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Liberación de GH, aumento de apetito intenso, volumen muscular',
  mechanism_of_action   = 'Péptido de la familia ghrelina. Estimula ghrelina endógena y libera GH de pituitaria. Genera hambre intensa post-inyección (efecto ghrelin). Aumenta también cortisol y prolactina aunque menos que hexarelina.',
  timing_notes          = 'En ayunas: mañana, post-entreno y antes de dormir. Prepararse para HAMBRE INTENSA en 15-30 min.',
  frequency             = '2-3 × día en ayunas',
  fda_status            = 'research',
  evidence_level        = 'Preclínico extenso',
  duration_notes        = '8-12 semanas. Ciclos con descanso de 4-6 semanas.',
  dose_titration_notes  = 'Iniciar 100mcg/dosis. Rango: 100-300mcg/dosis. No hay beneficio adicional ≥300mcg/dosis. Combinar con CJC-1295 o Sermorelin para efecto sinérgico.',
  administration_notes  = 'SC abdomen en ayunas estrictos. Tener alimento listo para después (hambre extrema en 20 min). Reconstituir en agua bacteriostática — estable 30 días.'
WHERE slug = 'ghrp-6';

-- ============================================================
-- BPC-157 Nasal
-- ============================================================
UPDATE peptides SET
  popular_for           = 'Neuroprotección, neuroplasticidad, inflamación neurológica, TBI, SNC',
  mechanism_of_action   = 'Formulación nasal del BPC-157 para mayor biodisponibilidad cerebral por vía intranasal (ByPass de barrera hematoencefálica parcial). Mismos mecanismos: óxido nítrico, dopamina, angiogénesis — pero con mayor penetración CNS.',
  timing_notes          = 'Mañana y tarde. Misma silla inclinada 45° atrás para mejor absorción nasal.',
  frequency             = '2 × día nasal',
  fda_status            = 'research',
  evidence_level        = 'Preclínico (adaptación de datos BPC-157 sistémico)',
  duration_notes        = '4-8 semanas por protocolo',
  dose_titration_notes  = 'Iniciar 250mcg/dosis nasal. Rango: 250-500mcg/dosis (2x/día). Disolver SOLO en SSF 0.9% — nunca agua bacteriostática para uso nasal (irritante).',
  administration_notes  = 'Nasal: diluir en SSF 0.9% estéril. 1-2 sprays por fosa nasal. Inclinar cabeza atrás 45°. NO usar agua bacteriostática — el alcohol bencílico irrita la mucosa nasal.'
WHERE slug = 'bpc-157-nasal';
