"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, addDays, subDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { HalfLifeChart } from "@/components/features/HalfLifeChart";
import { getPeptideCategory } from "@/lib/tagColors";

const INJECTION_SITES = [
    "Estómago - Sup. izquierda", "Estómago - Sup. derecha",
    "Estómago - Inf. izquierda", "Estómago - Inf. derecha",
    "Estómago - Bajo medio",
    "Muslo izquierdo", "Muslo derecho",
    "Glúteo izquierdo", "Glúteo derecho",
    "Deltoides izquierdo", "Deltoides derecho",
];

const ROUTES = [
    { value: "subcutaneous", label: "Subcutánea (SC)" },
    { value: "intramuscular", label: "Intramuscular (IM)" },
    { value: "nasal", label: "Nasal" },
    { value: "oral", label: "Oral" },
    { value: "topical", label: "Tópica" },
];

// Real columns from schema + migration add_peptide_info_columns.sql
type Peptide = {
    id: string;
    slug: string;
    name_es: string;
    name_en: string;
    description_es: string | null;
    description_en: string | null;
    half_life_hours: number | null;
    typical_dose_min: number | null;
    typical_dose_max: number | null;
    dose_unit: string;
    tags: string[];
    side_effects_es: string | null;
    reconstitution_notes_es: string | null;
    routes: string[];
    // New fields from add_peptide_info_columns.sql
    popular_for: string | null;
    mechanism_of_action: string | null;
    timing_notes: string | null;
    frequency: string | null;
    fda_status: string | null;
    also_known_as: string[];
    evidence_level: string | null;
    duration_notes: string | null;
    dose_titration_notes: string | null;
    administration_notes: string | null;
};

// ── Info Panel — peptibase-style ──────────────────────────────────────────────
function PeptideInfoPanel({ peptide, onClose }: { peptide: Peptide; onClose: () => void }) {
    const cat = getPeptideCategory(peptide.tags || []);
    const peptibaseSlug = peptide.slug || peptide.name_en?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "";
    const isFDA = peptide.fda_status === 'fda_approved';

    const fdaColor = isFDA ? "text-emerald-400" : "text-amber-400";
    const fdaLabel = isFDA ? "FDA Aprobado" : "Investigación";
    const fdaBg = isFDA ? "bg-emerald-400/10 border-emerald-400/25" : "bg-amber-400/10 border-amber-400/25";

    return (
        <div className="absolute inset-0 z-20 bg-[#060911] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-12 pb-3.5 border-b border-white/[0.07]">
                <button onClick={onClose} className="text-[#22d3ee] text-[15px] font-medium">← Volver</button>
                <span className="text-white font-semibold text-[16px]">{peptide.name_es}</span>
                <a href={`https://peptibase.dev/peptides/${peptibaseSlug}`} target="_blank" rel="noopener noreferrer"
                    className="text-[#22d3ee] text-[12px] font-medium">Peptibase ↗</a>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none">
                <div className="px-4 pb-12 pt-4 space-y-3">

                    {/* Popular For */}
                    {peptide.popular_for && (
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{cat.emoji}</span>
                                <p className="text-white font-semibold text-[14px]">Popular Para</p>
                            </div>
                            <p className="text-white/70 text-[13px] leading-relaxed">{peptide.popular_for}</p>
                        </div>
                    )}
                    {/* Dosing Information */}
                    {(peptide.typical_dose_min || peptide.frequency || peptide.dose_titration_notes) && (
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-base">🧬</span>
                                <p className="text-white font-semibold text-[14px]">Información de Dosificación</p>
                            </div>
                            {/* Typical dosing row */}
                            <div className="border border-white/7 rounded-xl p-3 mb-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-semibold text-[#22d3ee]">Dosis Típica</span>
                                    <span className="text-[10px] text-white/30 italic">Experiencia comunitaria</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-2">
                                    {peptide.typical_dose_min && (
                                        <div>
                                            <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Rango</p>
                                            <p className="text-[#22d3ee] font-semibold text-[13px]">{peptide.typical_dose_min}–{peptide.typical_dose_max}<span className="text-white/50 text-[10px] ml-0.5">{peptide.dose_unit}</span></p>
                                        </div>
                                    )}
                                    {peptide.frequency && (
                                        <div className="col-span-2">
                                            <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Frecuencia</p>
                                            <p className="text-white text-[13px]">{peptide.frequency}</p>
                                        </div>
                                    )}
                                </div>
                                {peptide.dose_titration_notes && (
                                    <p className="text-[12px] text-white/55 leading-relaxed border-t border-white/6 pt-2 mt-1">{peptide.dose_titration_notes}</p>
                                )}
                            </div>
                            {/* Administration notes */}
                            {peptide.administration_notes && (
                                <div className="border border-white/7 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[11px] font-semibold text-indigo-400">Administración</span>
                                    </div>
                                    <p className="text-white/60 text-[12px] leading-relaxed">{peptide.administration_notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="glass-card p-4 space-y-3">
                        <p className="text-white font-semibold text-[14px] mb-3">Datos Clave</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                                <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Categoría</p>
                                <p className="text-white text-[13px] font-medium">{cat.label}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Estado FDA</p>
                                <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full border ${fdaBg} ${fdaColor}`}>
                                    {fdaLabel}
                                </span>
                            </div>
                            {peptide.typical_dose_min && (
                                <div>
                                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Dosis típica</p>
                                    <p className="text-[#22d3ee] text-[13px] font-semibold">
                                        {peptide.typical_dose_min}–{peptide.typical_dose_max} {peptide.dose_unit}
                                    </p>
                                </div>
                            )}
                            {peptide.frequency && (
                                <div>
                                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Frecuencia</p>
                                    <p className="text-white text-[13px]">{peptide.frequency}</p>
                                </div>
                            )}
                            {peptide.half_life_hours && (
                                <div>
                                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Vida media</p>
                                    <p className="text-white text-[13px] font-medium">{peptide.half_life_hours}h</p>
                                </div>
                            )}
                            {peptide.duration_notes && (
                                <div>
                                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Duración</p>
                                    <p className="text-white text-[13px]">{peptide.duration_notes}</p>
                                </div>
                            )}
                            {peptide.evidence_level && (
                                <div className="col-span-2">
                                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Nivel de evidencia</p>
                                    <p className="text-white/70 text-[13px]">{peptide.evidence_level}</p>
                                </div>
                            )}
                            {peptide.also_known_as && peptide.also_known_as.length > 0 && (
                                <div className="col-span-2">
                                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">También conocido como</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {peptide.also_known_as.map((name: string) => (
                                            <span key={name} className="px-2 py-0.5 bg-white/6 border border-white/8 rounded-full text-white/60 text-[11px]">{name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mechanism of Action */}
                    {peptide.mechanism_of_action && (
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-base">💡</span>
                                <p className="text-white font-semibold text-[14px]">Mecanismo de Acción</p>
                            </div>
                            <p className="text-white/65 text-[13px] leading-relaxed">{peptide.mechanism_of_action}</p>
                        </div>
                    )}

                    {/* Timing & Administration */}
                    {(peptide.timing_notes || peptide.routes?.length > 0) && (
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-base">⏰</span>
                                <p className="text-white font-semibold text-[14px]">Timing & Administración</p>
                            </div>
                            <div className="space-y-3">
                                {peptide.timing_notes && (
                                    <div className="border border-white/7 rounded-xl p-3">
                                        <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Mejor Momento</p>
                                        <p className="text-white/80 text-[13px]">{peptide.timing_notes}</p>
                                    </div>
                                )}
                                {peptide.routes && peptide.routes.length > 0 && (
                                    <div className="border border-white/7 rounded-xl p-3">
                                        <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1.5">Vías de Administración</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {peptide.routes.map((r: string) => (
                                                <span key={r} className="px-2.5 py-1 bg-[#22d3ee]/8 border border-[#22d3ee]/20 rounded-full text-[#22d3ee] text-[11px] font-medium capitalize">{r}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Side Effects */}
                    {peptide.side_effects_es && (
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-base">⚠️</span>
                                <p className="text-white font-semibold text-[14px]">Posibles Efectos Secundarios</p>
                            </div>
                            <p className="text-[11px] text-white/35 mb-2">No todos los usuarios los experimentan. Los efectos varían por dosis y tolernacia individual.</p>
                            <div className="space-y-1.5">
                                {peptide.side_effects_es.split(/[,;]/g).map((effect: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                        <span className="text-white/60 text-[13px]">{effect.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reconstitution */}
                    {peptide.reconstitution_notes_es && (
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-base">🧪</span>
                                <p className="text-white font-semibold text-[14px]">Reconstitución</p>
                            </div>
                            <p className="text-white/55 text-[13px] leading-relaxed">{peptide.reconstitution_notes_es}</p>
                        </div>
                    )}

                    {/* Peptibase link */}
                    <a href={`https://peptibase.dev/peptides/${peptibaseSlug}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#22d3ee]/25 bg-[#22d3ee]/5 text-[#22d3ee] text-[14px] font-medium hover:bg-[#22d3ee]/10 transition-colors">
                        Ver ficha completa en Peptibase ↗
                    </a>

                    <p className="text-[11px] text-white/18 text-center leading-relaxed pb-2">
                        ⚠️ Solo para fines educativos. Consulta a un profesional de salud antes de usar cualquier péptido.
                    </p>
                </div>
            </div>
        </div>
    );
}

type Props = {
    preselectedDose?: any;
    onClose: () => void;
    onSuccess: () => void;
};

// ── iOS-style section header ─────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
    return (
        <div className="px-4 pt-5 pb-1.5">
            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em]">{title}</p>
        </div>
    );
}

// ── iOS-style grouped row ────────────────────────────────────────────────────
function Row({ label, right, onPress, last = false }: { label: string; right: React.ReactNode; onPress?: () => void; last?: boolean }) {
    return (
        <button
            type="button"
            onClick={onPress}
            disabled={!onPress}
            className={`w-full flex items-center justify-between px-4 py-3 bg-white/6 hover:bg-white/9 transition-colors
        ${last ? "" : "border-b border-white/6"}`}
        >
            <span className="text-white text-[15px]">{label}</span>
            <span className="flex items-center gap-1">{right}</span>
        </button>
    );
}

export function DoseLogModal({ preselectedDose, onClose, onSuccess }: Props) {
    const [peptides, setPeptides] = useState<Peptide[]>([]);
    const [recentPeptideIds, setRecentPeptideIds] = useState<string[]>([]);
    const [selectedPeptideId, setSelectedPeptideId] = useState<string>(preselectedDose?.protocolItem?.peptide_id || "");
    const [doseAmount, setDoseAmount] = useState<string>(preselectedDose ? String(preselectedDose.protocolItem.dose_amount) : "");
    const [doseUnit, setDoseUnit] = useState<string>(preselectedDose?.protocolItem?.dose_unit || "mg");
    const [route, setRoute] = useState<string>(preselectedDose?.protocolItem?.route || "subcutaneous");
    const [injectionSite, setInjectionSite] = useState<string>("");
    const [painLevel, setPainLevel] = useState<number>(0);
    const [notes, setNotes] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>(format(new Date(), "HH:mm"));
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Picker popups
    const [showPeptidePicker, setShowPeptidePicker] = useState(false);
    const [showSitePicker, setShowSitePicker] = useState(false);
    const [showRoutePicker, setShowRoutePicker] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const loadPeptidesAndHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            // Load peptides
            const { data: peptidesData } = await supabase
                .from("peptides")
                .select("id,slug,name_es,name_en,half_life_hours,typical_dose_min,typical_dose_max,dose_unit,tags,description_es,side_effects_es,reconstitution_notes_es,routes,popular_for,mechanism_of_action,timing_notes,frequency,fda_status,also_known_as,evidence_level,duration_notes,dose_titration_notes,administration_notes")
                .order("name_es");

            if (peptidesData) setPeptides(peptidesData as any);

            // Load recent usage for suggestions
            if (user) {
                const { data: logs } = await supabase
                    .from("dose_logs")
                    .select("peptide_id")
                    .eq("user_id", user.id)
                    .order("logged_at", { ascending: false })
                    .limit(20);

                if (logs) {
                    const uniqueIds = Array.from(new Set(logs.map(l => l.peptide_id)));
                    setRecentPeptideIds(uniqueIds);
                }
            }
        };
        loadPeptidesAndHistory();
    }, []);

    const selectedPeptide = peptides.find(p => p.id === selectedPeptideId);
    const cat = selectedPeptide ? getPeptideCategory(selectedPeptide.tags || []) : null;

    const loggedAt = new Date(
        format(selectedDate, "yyyy-MM-dd") + "T" + selectedTime + ":00"
    );

    const handleSubmit = async () => {
        if (!selectedPeptideId || !doseAmount) return;
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("dose_logs").insert({
            user_id: user.id,
            protocol_item_id: preselectedDose?.protocolItem?.id || null,
            peptide_id: selectedPeptideId,
            logged_at: loggedAt.toISOString(),
            dose_amount: parseFloat(doseAmount),
            dose_unit: doseUnit,
            route,
            injection_site: injectionSite || null,
            notes: painLevel > 0 ? `Dolor: ${painLevel}/10${notes ? " · " + notes : ""}` : notes || null,
        });
        setLoading(false);
        onSuccess();
    };

    // Separate peptides into suggested and others
    const suggestedPeptides = peptides.filter(p => recentPeptideIds.includes(p.id));
    const otherPeptides = peptides.filter(p => !recentPeptideIds.includes(p.id));

    return (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#060911] flex flex-col h-full shadow-2xl relative">
                {/* Info panel overlay */}
                {showInfo && selectedPeptide && (
                    <PeptideInfoPanel peptide={selectedPeptide} onClose={() => setShowInfo(false)} />
                )}

                {/* Navigation bar */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.07]">
                    <button type="button" onClick={onClose} className="text-[#22d3ee] text-[17px]">Cancelar</button>
                    <span className="text-white font-semibold text-[17px]">Agregar Dosis</span>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !selectedPeptideId || !doseAmount}
                        className="text-[#22d3ee] text-[17px] font-semibold disabled:opacity-40"
                    >
                        {loading ? "..." : "Guardar"}
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">

                    {/* FECHA */}
                    <SectionHeader title="Fecha" />
                    <div className="mx-4 rounded-2xl overflow-hidden">
                        <div className="bg-white/6 flex items-center justify-between px-4 py-3 relative">
                            <label className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                                <input
                                    type="date"
                                    value={format(selectedDate, "yyyy-MM-dd")}
                                    onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                                    className="w-full h-full"
                                />
                            </label>
                            <span className="text-white text-[15px]">Fecha de registro</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[#0A84FF] font-medium text-[15px]">
                                    {format(selectedDate, "d MMMM yyyy", { locale: es })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TIEMPO */}
                    <SectionHeader title="Tiempo" />
                    <div className="mx-4 rounded-2xl overflow-hidden">
                        <div className="bg-white/6 flex items-center justify-between px-4 py-1.5">
                            <span className="text-white text-[15px]">Hora de la dosis</span>
                            <input
                                type="time"
                                value={selectedTime}
                                onChange={e => setSelectedTime(e.target.value)}
                                className="bg-transparent text-[#0A84FF] text-[15px] font-medium border-0 outline-none text-right"
                            />
                        </div>
                    </div>

                    {/* DETALLES */}
                    <SectionHeader title="Detalles" />
                    <div className="mx-4 rounded-2xl overflow-hidden">
                        {/* Medicamento */}
                        <Row
                            label="Medicamento"
                            onPress={() => setShowPeptidePicker(true)}
                            right={
                                <div className="flex items-center gap-2">
                                    {selectedPeptide && (
                                        <button
                                            type="button"
                                            onClick={e => { e.stopPropagation(); setShowInfo(true); }}
                                            className="w-5 h-5 rounded-full border border-[#22d3ee]/40 text-[#22d3ee] text-[11px] font-bold flex items-center justify-center hover:bg-[#22d3ee]/10"
                                        >
                                            i
                                        </button>
                                    )}
                                    {selectedPeptide ? (
                                        <span className={`text-[15px] font-medium ${cat?.text || "text-[#22d3ee]"}`}>
                                            {selectedPeptide.name_es} ↕
                                        </span>
                                    ) : (
                                        <span className="text-[#22d3ee] text-[15px]">Seleccionar ↕</span>
                                    )}
                                </div>
                            }
                        />

                        {/* Dosificación */}
                        <Row
                            label="Dosificación"
                            right={
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={doseAmount}
                                        onChange={e => setDoseAmount(e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        placeholder="0"
                                        step="any"
                                        min="0"
                                        className="bg-transparent text-right w-16 text-white outline-none text-[15px]"
                                    />
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cat?.bg || "bg-rose-400/15"} ${cat?.text || "text-rose-300"}`}>
                                        {doseUnit}
                                    </span>
                                    <select
                                        value={doseUnit}
                                        onChange={e => setDoseUnit(e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        className="bg-transparent text-[#0A84FF] text-[13px] outline-none -ml-1"
                                    >
                                        {["mcg", "mg", "IU"].map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            }
                        />

                        {/* Vía */}
                        <Row
                            label="Vía"
                            onPress={() => setShowRoutePicker(true)}
                            right={<span className="text-[#0A84FF] text-[15px]">{ROUTES.find(r => r.value === route)?.label} ↕</span>}
                        />

                        {/* Punto de inyección */}
                        {(route === "subcutaneous" || route === "intramuscular") && (
                            <Row
                                label="Punto"
                                onPress={() => setShowSitePicker(true)}
                                right={
                                    <span className="text-[#0A84FF] text-[15px] max-w-[180px] text-right truncate">
                                        {injectionSite || "Seleccionar"} ↕
                                    </span>
                                }
                            />
                        )}

                        {/* Nivel de dolor */}
                        <div className="bg-white/6 px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-[15px]">Nivel de dolor</span>
                                <span className="text-white/60 text-[15px]">{painLevel}</span>
                            </div>
                            <input
                                type="range"
                                min={0} max={10} step={1}
                                value={painLevel}
                                onChange={e => setPainLevel(Number(e.target.value))}
                                className="w-full accent-white"
                            />
                            <div className="flex justify-between text-[11px] text-white/30 mt-1">
                                <span>Sin dolor</span>
                                <span>Máximo</span>
                            </div>
                        </div>

                        {/* Dosis típica hint */}
                        {selectedPeptide?.typical_dose_min && (
                            <div className="bg-white/3 px-4 py-2.5 border-t border-white/6">
                                <p className="text-[12px] text-white/30 text-center">
                                    Rango habitual: {selectedPeptide.typical_dose_min}–{selectedPeptide.typical_dose_max} {selectedPeptide.dose_unit}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Vista previa nivel estimado */}
                    {selectedPeptide && doseAmount && (
                        <>
                            <SectionHeader title="Vista previa nivel estimado" />
                            <div className="mx-4">
                                <HalfLifeChart logs={[{
                                    logged_at: loggedAt.toISOString(),
                                    dose_amount: parseFloat(doseAmount) || 1,
                                    dose_unit: doseUnit,
                                    peptides: { name_es: selectedPeptide.name_es, half_life_hours: selectedPeptide.half_life_hours }
                                }]} />
                            </div>
                        </>
                    )}

                    {/* NOTAS */}
                    <SectionHeader title="Notas de dosis" />
                    <div className="mx-4 rounded-2xl overflow-hidden">
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Agregar notas"
                            rows={3}
                            className="w-full bg-white/6 px-4 py-3 text-[15px] text-white placeholder:text-white/25
                       outline-none resize-none border-0"
                        />
                    </div>

                    <div className="h-12" />
                </div>

                {/* ── Peptide picker modal ── */}
                {showPeptidePicker && (
                    <div className="absolute inset-0 bg-black/60 z-10 flex items-end" onClick={() => setShowPeptidePicker(false)}>
                        <div className="w-full bg-[#1C1C1E] rounded-t-3xl max-h-[70vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                                <span className="font-semibold text-white">Medicamento</span>
                                <button onClick={() => setShowPeptidePicker(false)}
                                    className="text-[#0A84FF] text-[15px]">Listo</button>
                            </div>
                            <div className="overflow-y-auto">
                                {suggestedPeptides.length > 0 && (
                                    <>
                                        <div className="px-5 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider bg-white/5">
                                            Sugeridos
                                        </div>
                                        {suggestedPeptides.map(p => {
                                            const c = getPeptideCategory(p.tags || []);
                                            return (
                                                <button key={p.id} onClick={() => { setSelectedPeptideId(p.id); setShowPeptidePicker(false); }}
                                                    className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-white/5
                                   ${selectedPeptideId === p.id ? "bg-white/5" : ""} hover:bg-white/5 transition-colors`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{c.emoji}</span>
                                                        <div className="text-left">
                                                            <div className="text-white text-[15px]">{p.name_es}</div>
                                                            <div className={`text-[11px] ${c.text}`}>{c.label}</div>
                                                        </div>
                                                    </div>
                                                    {selectedPeptideId === p.id && <span className="text-[#0A84FF] text-lg">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </>
                                )}

                                <div className="px-5 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider bg-white/5">
                                    Todos
                                </div>
                                {otherPeptides.map(p => {
                                    const c = getPeptideCategory(p.tags || []);
                                    return (
                                        <button key={p.id} onClick={() => { setSelectedPeptideId(p.id); setShowPeptidePicker(false); }}
                                            className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-white/5
                      ${selectedPeptideId === p.id ? "bg-white/5" : ""} hover:bg-white/5 transition-colors`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{c.emoji}</span>
                                                <div className="text-left">
                                                    <div className="text-white text-[15px]">{p.name_es}</div>
                                                    <div className={`text-[11px] ${c.text}`}>{c.label}</div>
                                                </div>
                                            </div>
                                            {selectedPeptideId === p.id && <span className="text-[#0A84FF] text-lg">✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Injection site picker ── */}
                {showSitePicker && (
                    <div className="absolute inset-0 bg-black/60 z-10 flex items-end" onClick={() => setShowSitePicker(false)}>
                        <div className="w-full bg-[#1C1C1E] rounded-t-3xl max-h-[60vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                                <span className="font-semibold text-white">Punto de inyección</span>
                                <button onClick={() => setShowSitePicker(false)} className="text-[#0A84FF] text-[15px]">Listo</button>
                            </div>
                            <div className="overflow-y-auto">
                                {INJECTION_SITES.map(site => (
                                    <button key={site} onClick={() => { setInjectionSite(site); setShowSitePicker(false); }}
                                        className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-white/5
                    ${injectionSite === site ? "bg-white/5" : ""} hover:bg-white/5 transition-colors`}>
                                        <span className="text-white text-[15px]">{site}</span>
                                        {injectionSite === site && <span className="text-[#0A84FF]">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Route picker ── */}
                {showRoutePicker && (
                    <div className="absolute inset-0 bg-black/60 z-10 flex items-end" onClick={() => setShowRoutePicker(false)}>
                        <div className="w-full bg-[#1C1C1E] rounded-t-3xl overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                                <span className="font-semibold text-white">Vía de administración</span>
                                <button onClick={() => setShowRoutePicker(false)} className="text-[#0A84FF] text-[15px]">Listo</button>
                            </div>
                            {ROUTES.map(r => (
                                <button key={r.value} onClick={() => { setRoute(r.value); setShowRoutePicker(false); }}
                                    className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-white/5
                  ${route === r.value ? "bg-white/5" : ""} hover:bg-white/5 transition-colors`}>
                                    <span className="text-white text-[15px]">{r.label}</span>
                                    {route === r.value && <span className="text-[#0A84FF]">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
