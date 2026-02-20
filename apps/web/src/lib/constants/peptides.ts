
export const PEPTIDE_DEFAULTS: Record<string, string> = {
    // ── Weight Loss (GLP-1/GIP) ──────────────────────────────────────────────
    "retatrutide": "weekly", "retatrutida": "weekly",
    "tirzepatide": "weekly", "tirzepatida": "weekly",
    "semaglutide": "weekly", "semaglutida": "weekly",
    "liraglutide": "daily", "liraglutida": "daily",
    "dulaglutide": "weekly", "dulaglutida": "weekly",
    "exenatide": "daily", "exenatida": "daily",
    "lixisenatide": "daily", "lixisenatida": "daily",
    "cagrilintide": "weekly", "cagrilintida": "weekly",
    "mazdutide": "weekly", "mazdutida": "weekly",
    "survodutide": "weekly", "survodutida": "weekly",

    // ── Healing & Repair ─────────────────────────────────────────────────────
    "bpc-157": "daily",
    "tb-500": "daily", // Often 2x week, but daily loading is common. Let's default to EOD or Daily. User can override with protocol.
    "thymosin beta 4": "daily",
    "kpv": "daily",
    "ll-37": "daily",
    "pentosan polysulfate": "biweekly", // often 2x week
    "ara-290": "daily",
    "ghk-cu": "daily",

    // ── Growth Hormone (GHS) ────────────────────────────────────────────────
    "ipamorelin": "daily",
    "cjc-1295 no dac": "daily", "cjc-1295 without dac": "daily",
    "cjc-1295 dac": "weekly", "cjc-1295 with dac": "weekly",
    "sermorelin": "daily",
    "tesamorelin": "daily",
    "ghrp-2": "daily",
    "ghrp-6": "daily",
    "hexarelin": "daily",
    "mk-677": "daily", "ibutamoren": "daily",
    "alexamorelin": "daily",
    "lenomorelin": "daily",
    "macimorelin": "daily",

    // ── Cognitive / Nootropic ───────────────────────────────────────────────
    "semax": "daily", "n-acetyl semax": "daily",
    "selank": "daily", "n-acetyl selank": "daily",
    "dihexa": "daily",
    "p21": "daily",
    "cerebrolysin": "daily", // usually courses 5x week
    "cortexin": "daily",
    "fgl": "daily",
    "noopept": "daily",
    "orexin-a": "daily",

    // ── Metabolic & Mitochondrial ───────────────────────────────────────────
    "mots-c": "3x_week", // often M-W-F
    "humanin": "daily",
    "ss-31": "daily",
    "5-amino-1mq": "daily",
    "aod-9604": "daily",
    "frag 176-191": "daily", "hgh frag": "daily",
    "sr-9009": "daily", "stenabolic": "daily",
    "gw-501516": "daily", "cardarine": "daily",

    // ── Longevity & Immune ──────────────────────────────────────────────────
    "epitalon": "daily",
    "thymalin": "daily",
    "thymosin alpha 1": "eod", // Ta1 often 2-3x week
    "foxo4-dri": "eod",
    "klotho": "daily", // theoretical

    // ── Sexual & Performance ────────────────────────────────────────────────
    "pt-141": "daily", // "As needed", but for tracker fallback daily is safer or assume active protocol
    "melanotan 1": "daily",
    "melanotan 2": "daily", // loading phase daily, then weekly. Default daily safer for active phase.
    "kisspeptin-10": "daily",
    "oxytocin": "daily",

    // ── Muscle ──────────────────────────────────────────────────────────────
    "peg-mgf": "biweekly", // post workout or 2x week
    "igf-1 lr3": "daily",
    "igf-1 des": "daily",
    "follistatin 344": "daily",
    "ace-031": "weekly",
    "myostatin": "weekly",

    // ── Sleep ───────────────────────────────────────────────────────────────
    "dsip": "eod", // Delta Sleep Inducing Peptide - often EOD or 3x week
    "epithalon": "daily",

    // ── Other ───────────────────────────────────────────────────────────────
    "selpercatinib": "daily", // drug?
    "tirzepatide/bpc-157": "weekly", // stack
    "tesofensine": "daily",
    "vip": "daily", // Vasoactive Intestinal Peptide - multiple times daily often
};

export const getFrequencyDays = (freq: string) => {
    switch (freq?.toLowerCase()) {
        case "daily": return 1;
        case "eod": return 2;
        case "3x_week": return 2.33;
        case "biweekly": return 3.5; // twice a week? or every 2 weeks? Bi-weekly usually means every 2 weeks in calendar, but here usually means 2x week (3.5 days). 
        // Actually "biweekly" in medical = every 2 weeks? Or twice a week? 
        // "Biweekly" = every 2 weeks. "Semi-weekly" = 2x week.
        // Common usage: "Twice weekly" -> 3.5 days.
        // Let's assume standard medical "q3.5d".
        case "weekly": return 7;
        case "monthly": return 30;
        default: return 1;
    }
};
