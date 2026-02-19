// Peptide tag color categories — maps tag keywords to pastel color classes
export type TagCategory = {
    bg: string;
    text: string;
    border: string;
    emoji: string;
    label: string;
};

const CATEGORY_MAP: { keywords: string[]; style: TagCategory }[] = [
    {
        keywords: ["recuperación", "tejidos", "tendones", "músculos", "atletas", "cicatrización", "GI", "intestinal", "heridas"],
        style: { bg: "bg-emerald-400/15", text: "text-emerald-300", border: "border-emerald-400/25", emoji: "💚", label: "Recuperación" },
    },
    {
        keywords: ["pérdida de peso", "pérdida de grasa", "lipólisis", "metabolismo", "GLP-1", "GIP", "diabetes"],
        style: { bg: "bg-amber-400/15", text: "text-amber-300", border: "border-amber-400/25", emoji: "🔥", label: "Metabolismo" },
    },
    {
        keywords: ["HGH", "GHRH", "GHRP", "composición corporal", "apetito"],
        style: { bg: "bg-sky-400/15", text: "text-sky-300", border: "border-sky-400/25", emoji: "💪", label: "HGH / Composición" },
    },
    {
        keywords: ["longevidad", "antienvejecimiento", "telómeros", "sueño", "mitocondrias", "energía"],
        style: { bg: "bg-violet-400/15", text: "text-violet-300", border: "border-violet-400/25", emoji: "✨", label: "Longevidad" },
    },
    {
        keywords: ["sexual", "libido", "melanocortina", "bronceado"],
        style: { bg: "bg-rose-400/15", text: "text-rose-300", border: "border-rose-400/25", emoji: "🌹", label: "Sexual / Melanocortina" },
    },
    {
        keywords: ["nootrópico", "cognitivo", "memoria", "BDNF", "ansiedad", "estrés"],
        style: { bg: "bg-teal-400/15", text: "text-teal-300", border: "border-teal-400/25", emoji: "🧠", label: "Nootrópico" },
    },
    {
        keywords: ["piel", "colágeno", "antimicrobiano", "inmunidad", "infecciones", "inflamación", "antiflamatorio"],
        style: { bg: "bg-pink-400/15", text: "text-pink-300", border: "border-pink-400/25", emoji: "🌸", label: "Piel / Inmunidad" },
    },
    {
        keywords: ["cerebro", "neuroprotección", "SNC", "cardiovascular"],
        style: { bg: "bg-indigo-400/15", text: "text-indigo-300", border: "border-indigo-400/25", emoji: "🫀", label: "Neuro / Cardio" },
    },
];

export function getTagStyle(tag: string): TagCategory {
    const tagLower = tag.toLowerCase();
    for (const cat of CATEGORY_MAP) {
        if (cat.keywords.some(k => tagLower.includes(k) || k.includes(tagLower))) {
            return cat.style;
        }
    }
    // Default
    return { bg: "bg-white/8", text: "text-white/50", border: "border-white/10", emoji: "🔬", label: "Otro" };
}

export function getPeptideCategory(tags: string[]): TagCategory {
    for (const tag of tags) {
        const style = getTagStyle(tag);
        if (style.label !== "Otro") return style;
    }
    return { bg: "bg-white/8", text: "text-white/50", border: "border-white/10", emoji: "🔬", label: "Otro" };
}
