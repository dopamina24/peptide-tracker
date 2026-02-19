"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Peptide } from "@/types/database";
import { Search, ChevronRight, Syringe, Clock, AlertCircle, Beaker, Info } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
    subcutaneous: "Subcutánea",
    intramuscular: "Intramuscular",
    nasal: "Nasal",
    oral: "Oral",
    topical: "Tópica",
};

function PeptideDetailSheet({ peptide, onClose }: { peptide: Peptide; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg glass-card rounded-b-none rounded-t-3xl p-5 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-none">
                <div className="w-10 h-1 rounded-full bg-surface-border mx-auto mb-5" />
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-electric/10 border border-brand-electric/20 flex items-center justify-center flex-shrink-0">
                        <Beaker className="w-6 h-6 text-brand-electric" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{peptide.name_es}</h2>
                        <p className="text-sm text-white/50 italic">{peptide.name_en}</p>
                    </div>
                </div>

                <p className="text-sm text-white/70 leading-relaxed mb-5">{peptide.description_es}</p>

                <div className="space-y-4">
                    {/* Dosage */}
                    <div className="glass-elevated p-4 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-brand-electric uppercase tracking-wider mb-2">
                            <Syringe className="w-3.5 h-3.5" /> Dosificación
                        </div>
                        <div className="text-sm text-white/80">
                            <span className="font-semibold">{peptide.typical_dose_min}–{peptide.typical_dose_max} {peptide.dose_unit}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {peptide.routes.map(r => (
                                <span key={r} className="badge-pill bg-brand-electric/10 text-brand-electric border border-brand-electric/20">
                                    {ROUTE_LABELS[r] || r}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Half life */}
                    {peptide.half_life_hours && (
                        <div className="glass-elevated p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-brand-glow uppercase tracking-wider mb-2">
                                <Clock className="w-3.5 h-3.5" /> Vida Media
                            </div>
                            <p className="text-sm text-white/80">~{peptide.half_life_hours}h</p>
                        </div>
                    )}

                    {/* Reconstitution */}
                    {peptide.reconstitution_notes_es && (
                        <div className="glass-elevated p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-brand-neon uppercase tracking-wider mb-2">
                                <Beaker className="w-3.5 h-3.5" /> Reconstitución
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed">{peptide.reconstitution_notes_es}</p>
                        </div>
                    )}

                    {/* Side effects */}
                    {peptide.side_effects_es && (
                        <div className="glass-elevated p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">
                                <AlertCircle className="w-3.5 h-3.5" /> Efectos Secundarios
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed">{peptide.side_effects_es}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {peptide.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {peptide.tags.map(tag => (
                                <span key={tag} className="badge-pill bg-surface-elevated text-white/50 border border-surface-border text-xs">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Disclaimer */}
                <div className="mt-6 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-2">
                    <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-400/80 leading-relaxed">
                        Esta información es de carácter educativo. No constituye consejo médico. Consulta a un profesional de salud.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LibraryPage() {
    const [peptides, setPeptides] = useState<Peptide[]>([]);
    const [search, setSearch] = useState("");
    const [selectedRoute, setSelectedRoute] = useState("all");
    const [selectedPeptide, setSelectedPeptide] = useState<Peptide | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        supabase.from("peptides").select("*").order("name_es").then(({ data }) => {
            if (data) setPeptides(data);
            setLoading(false);
        });
    }, []);

    const filtered = peptides.filter(p => {
        const matchSearch = p.name_es.toLowerCase().includes(search.toLowerCase()) ||
            p.name_en.toLowerCase().includes(search.toLowerCase()) ||
            (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchRoute = selectedRoute === "all" || p.routes.includes(selectedRoute);
        return matchSearch && matchRoute;
    });

    const routes = ["all", "subcutaneous", "intramuscular", "nasal", "oral", "topical"];

    return (
        <div className="p-4 space-y-5">
            <div className="pt-4">
                <h1 className="text-2xl font-bold">Biblioteca</h1>
                <p className="text-white/40 text-sm mt-0.5">{peptides.length} péptidos disponibles</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    placeholder="Buscar péptido..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field pl-10"
                />
            </div>

            {/* Route filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {routes.map(r => (
                    <button key={r} onClick={() => setSelectedRoute(r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all flex-shrink-0
              ${selectedRoute === r ? "bg-brand-electric/20 border-brand-electric/50 text-white" : "border-surface-border text-white/50 hover:border-white/20"}`}>
                        {r === "all" ? "Todas" : ROUTE_LABELS[r] || r}
                    </button>
                ))}
            </div>

            {/* Peptide list */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-card p-4 animate-pulse h-16 bg-surface-elevated/50" />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(peptide => (
                        <button key={peptide.id} onClick={() => setSelectedPeptide(peptide)}
                            className="glass-card p-4 w-full flex items-start gap-4 hover:border-brand-electric/30 transition-all active:scale-[0.98]">
                            <div className="w-10 h-10 rounded-xl bg-brand-electric/10 flex items-center justify-center flex-shrink-0">
                                <Beaker className="w-5 h-5 text-brand-electric" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="font-semibold text-sm">{peptide.name_es}</div>
                                <div className="text-xs text-white/40 mt-0.5 italic">{peptide.name_en}</div>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {peptide.routes.slice(0, 2).map(r => (
                                        <span key={r} className="badge-pill bg-surface-elevated text-white/40 text-[10px]">
                                            {ROUTE_LABELS[r] || r}
                                        </span>
                                    ))}
                                    {peptide.tags?.slice(0, 2).map(t => (
                                        <span key={t} className="badge-pill bg-brand-neon/10 text-brand-neon text-[10px]">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-white/20 mt-1 flex-shrink-0">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-white/30">
                            <Beaker className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p>No se encontraron péptidos</p>
                        </div>
                    )}
                </div>
            )}

            {selectedPeptide && (
                <PeptideDetailSheet peptide={selectedPeptide} onClose={() => setSelectedPeptide(null)} />
            )}
        </div>
    );
}
