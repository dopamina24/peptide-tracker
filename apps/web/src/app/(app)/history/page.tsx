"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { HalfLifeChart } from "@/components/features/HalfLifeChart";
import { getPeptideCategory } from "@/lib/tagColors";
import { DoseLogModal } from "@/components/features/DoseLogModal";

// ── Body map SVG ──────────────────────────────────────────────────────────────
const SITE_ZONES: Record<string, { cx: number; cy: number; label: string }> = {
    "Estómago - Sup. izquierda": { cx: 94, cy: 98, label: "Abd↖" },
    "Estómago - Sup. derecha": { cx: 106, cy: 98, label: "Abd↗" },
    "Estómago - Inf. izquierda": { cx: 92, cy: 110, label: "Abd↙" },
    "Estómago - Inf. derecha": { cx: 108, cy: 110, label: "Abd↘" },
    "Estómago - Bajo medio": { cx: 100, cy: 118, label: "Abd⬇" },
    "Muslo izquierdo": { cx: 90, cy: 158, label: "Muslo" },
    "Muslo derecho": { cx: 110, cy: 158, label: "Muslo" },
    "Glúteo izquierdo": { cx: 89, cy: 140, label: "Glút" },
    "Glúteo derecho": { cx: 111, cy: 140, label: "Glút" },
    "Deltoides izquierdo": { cx: 79, cy: 80, label: "Delt" },
    "Deltoides derecho": { cx: 121, cy: 80, label: "Delt" },
    "Antebrazo izquierdo": { cx: 74, cy: 108, label: "Antr" },
    "Antebrazo derecho": { cx: 126, cy: 108, label: "Antr" },
    // Fallbacks for old site names
    "Abdomen izq.": { cx: 93, cy: 104, label: "Abd" },
    "Abdomen der.": { cx: 107, cy: 104, label: "Abd" },
    "Muslo izq.": { cx: 90, cy: 158, label: "Muslo" },
    "Muslo der.": { cx: 110, cy: 158, label: "Muslo" },
    "Glúteo izq.": { cx: 89, cy: 140, label: "Glút" },
    "Glúteo der.": { cx: 111, cy: 140, label: "Glút" },
    "Deltoides izq.": { cx: 79, cy: 80, label: "Delt" },
    "Deltoides der.": { cx: 121, cy: 80, label: "Delt" },
    "Antebrazo izq.": { cx: 74, cy: 108, label: "Antr" },
    "Antebrazo der.": { cx: 126, cy: 108, label: "Antr" },
};

function BodyMap({ siteCounts, activeColor }: {
    siteCounts: Record<string, number>;
    activeColor: string;
}) {
    const maxCount = Math.max(1, ...Object.values(siteCounts));
    return (
        <svg viewBox="50 20 100 180" width="100%" style={{ maxHeight: 220 }}>
            {/* Body silhouette — simplified human figure */}
            {/* Head */}
            <ellipse cx="100" cy="37" rx="11" ry="13" fill="#1a2235" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            {/* Neck */}
            <rect x="96" y="48" width="8" height="6" rx="2" fill="#1a2235" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            {/* Torso */}
            <path d="M82 54 Q80 54 79 56 L76 130 Q76 132 78 132 L122 132 Q124 132 124 130 L121 56 Q120 54 118 54 Z"
                fill="#1a2235" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            {/* Left arm */}
            <path d="M82 54 Q75 56 72 70 L68 105 Q67 110 70 112 L75 112 Q78 112 79 108 L83 76 Z"
                fill="#1a2235" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
            {/* Right arm */}
            <path d="M118 54 Q125 56 128 70 L132 105 Q133 110 130 112 L125 112 Q122 112 121 108 L117 76 Z"
                fill="#1a2235" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
            {/* Left leg */}
            <path d="M87 132 L83 185 Q83 190 88 190 L95 190 Q99 190 99 185 L98 132 Z"
                fill="#1a2235" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
            {/* Right leg */}
            <path d="M113 132 L117 185 Q117 190 112 190 L105 190 Q101 190 101 185 L102 132 Z"
                fill="#1a2235" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />

            {/* Injection site dots */}
            {Object.entries(SITE_ZONES).map(([site, { cx, cy }]) => {
                const count = siteCounts[site] || 0;
                if (count === 0) return null;
                const intensity = count / maxCount;
                const r = 5 + intensity * 3;
                return (
                    <g key={site}>
                        <circle cx={cx} cy={cy} r={r + 3} fill={activeColor} opacity={0.12} />
                        <circle cx={cx} cy={cy} r={r} fill={activeColor} opacity={0.7 + intensity * 0.3} />
                        <text x={cx} y={cy + 3.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="700">
                            {count}
                        </text>
                    </g>
                );
            })}

            {/* Empty sites hint */}
            {Object.values(siteCounts).every(v => v === 0) && (
                <text x="100" y="105" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8">
                    Sin sitios registrados
                </text>
            )}
        </svg>
    );
}

// ── Dose card ────────────────────────────────────────────────────────────────
function DoseCard({ log, onDelete }: { log: any; onDelete: (id: string) => void }) {
    const cat = getPeptideCategory((log.peptides as any)?.tags || []);
    const painMatch = log.notes?.match(/Dolor: (\d+)\/10/);
    const painLevel = painMatch ? parseInt(painMatch[1]) : null;
    const cleanNotes = log.notes?.replace(/Dolor: \d+\/10 · ?/, "").replace(/Dolor: \d+\/10/, "").trim();

    return (
        <div className="glass-card p-4 space-y-2.5 hover:border-white/12 transition-colors">
            {/* Top row: date + delete */}
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/35 font-medium uppercase tracking-wide">
                    {format(parseISO(log.logged_at), "EEE d MMM · HH:mm", { locale: es })}
                </span>
                <button onClick={() => onDelete(log.id)}
                    className="text-white/20 hover:text-red-400 transition-colors p-1 -mr-1">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Peptide name + dose pill */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <span className="text-white font-semibold text-[16px]">{log.peptides?.name_es}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.bg} ${cat.text} border ${cat.border}`}>
                    {log.dose_amount}{log.dose_unit}
                </span>
            </div>

            {/* Site + route */}
            {(log.injection_site || log.route) && (
                <div className="flex items-center gap-2 text-[12px] text-white/40">
                    {log.injection_site && <span>{log.injection_site}</span>}
                    {log.injection_site && log.route && <span>·</span>}
                    {log.route && <span className="capitalize">{log.route}</span>}
                </div>
            )}

            {/* Pain level */}
            {painLevel !== null && (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"
                            style={{ width: `${(painLevel / 10) * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-white/40">Dolor {painLevel}/10</span>
                </div>
            )}

            {/* Notes */}
            {cleanNotes && <p className="text-[12px] text-white/35 italic">"{cleanNotes}"</p>}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DosisPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [filterPeptide, setFilterPeptide] = useState<string | null>(null);
    const supabase = createClient();

    const loadLogs = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from("dose_logs")
            .select("*, peptides(name_es, half_life_hours, dose_unit, tags)")
            .eq("user_id", user.id)
            .order("logged_at", { ascending: false })
            .limit(200);
        setLogs((data || []) as any[]);
        setLoading(false);
    };

    useEffect(() => { loadLogs(); }, []);

    const handleDelete = async (id: string) => {
        await supabase.from("dose_logs").delete().eq("id", id);
        setLogs(prev => prev.filter(l => l.id !== id));
    };

    // All unique peptide names for filter
    const peptideNames = useMemo(() =>
        [...new Set(logs.map(l => l.peptides?.name_es).filter(Boolean))],
        [logs]
    );

    // Filter by selected peptide
    const visibleLogs = filterPeptide ? logs.filter(l => l.peptides?.name_es === filterPeptide) : logs;

    // Group by month-year
    const groupedLogs = useMemo(() => {
        const groups: Record<string, any[]> = {};
        for (const log of visibleLogs) {
            const key = format(parseISO(log.logged_at), "MMMM yyyy", { locale: es });
            if (!groups[key]) groups[key] = [];
            groups[key].push(log);
        }
        return groups;
    }, [visibleLogs]);

    // Site counts for body map (last 30 days)
    const siteCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        const cutoff = new Date(Date.now() - 30 * 86400000);
        for (const log of visibleLogs) {
            if (!log.injection_site) continue;
            if (new Date(log.logged_at) < cutoff) continue;
            counts[log.injection_site] = (counts[log.injection_site] || 0) + 1;
        }
        return counts;
    }, [visibleLogs]);

    // Active category color for body map
    const activeColor = filterPeptide
        ? (getPeptideCategory(logs.find(l => l.peptides?.name_es === filterPeptide)?.peptides?.tags || []).text
            .replace("text-", "").replace("-300", ""))
        : "#22d3ee";
    const bodyMapColor = "#22d3ee"; // always cyan for simplicity

    // Stats
    const totalDoses = visibleLogs.length;
    const totalPeptides = new Set(visibleLogs.map(l => l.peptides?.name_es)).size;
    const lastLog = visibleLogs[0];

    return (
        <div className="bg-[#060911] min-h-full">
            {/* iOS nav bar */}
            <div className="flex items-center justify-between px-4 pt-14 pb-3 border-b border-white/[0.06]">
                <span className="text-white font-semibold text-[17px]">Dosis</span>
                <button onClick={() => setShowModal(true)}
                    className="text-[#22d3ee] text-[15px] font-medium flex items-center gap-1">
                    + Agr. dosis
                </button>
            </div>

            <div className="px-4 pb-28 space-y-5 pt-4">

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2.5">
                    {[
                        { label: "Total dosis", value: String(totalDoses), icon: "💉" },
                        { label: "Péptidos", value: String(totalPeptides), icon: "🧪" },
                        { label: "Última", value: lastLog ? format(parseISO(lastLog.logged_at), "d MMM", { locale: es }) : "—", icon: "📅" },
                    ].map(s => (
                        <div key={s.label} className="glass-card p-3 text-center">
                            <div className="text-lg mb-0.5">{s.icon}</div>
                            <div className="text-white font-bold text-[17px]">{s.value}</div>
                            <div className="text-white/35 text-[11px]">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Concentration chart */}
                {visibleLogs.length > 0 && (
                    <div>
                        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                            Niveles estimados de concentración
                        </p>
                        <HalfLifeChart logs={visibleLogs.map(l => ({
                            logged_at: l.logged_at,
                            dose_amount: l.dose_amount,
                            dose_unit: l.dose_unit,
                            peptides: { name_es: l.peptides?.name_es || "?", half_life_hours: l.peptides?.half_life_hours ?? 4 }
                        }))} />
                    </div>
                )}

                {/* Body map + filter pills side by side */}
                <div className="glass-card p-4">
                    <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
                        Mapa de sitios inyectados (últimos 30 días)
                    </p>
                    <div className="flex gap-4 items-start">
                        <div className="w-36 flex-shrink-0">
                            <BodyMap siteCounts={siteCounts} activeColor={bodyMapColor} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-[11px] text-white/35">Filtrar por péptido:</p>
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    onClick={() => setFilterPeptide(null)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${!filterPeptide
                                            ? "bg-[#22d3ee]/15 border-[#22d3ee]/35 text-[#22d3ee]"
                                            : "border-white/8 text-white/35 hover:border-white/15"
                                        }`}>
                                    Todos
                                </button>
                                {peptideNames.map(name => {
                                    const cat = getPeptideCategory(logs.find(l => l.peptides?.name_es === name)?.peptides?.tags || []);
                                    const active = filterPeptide === name;
                                    return (
                                        <button key={name}
                                            onClick={() => setFilterPeptide(active ? null : name)}
                                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${active ? `${cat.bg} ${cat.border} ${cat.text}` : "border-white/8 text-white/35 hover:border-white/15"
                                                }`}>
                                            {cat.emoji} {name}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Site legend */}
                            <div className="mt-2 space-y-1">
                                {Object.entries(siteCounts)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([site, count]) => (
                                        <div key={site} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                                            <span className="text-[11px] text-white/50 flex-1">{site}</span>
                                            <span className="text-[11px] text-white/35 font-semibold">{count}x</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* History grouped by month */}
                {loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-card p-4 h-20 animate-pulse opacity-50" />
                        ))}
                    </div>
                ) : visibleLogs.length === 0 ? (
                    <div className="glass-card p-10 text-center text-white/25 text-sm">
                        Sin dosis registradas{filterPeptide ? ` de ${filterPeptide}` : ""}
                    </div>
                ) : (
                    Object.entries(groupedLogs).map(([month, monthLogs]) => (
                        <div key={month}>
                            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-3 px-0.5">
                                {month}
                            </p>
                            <div className="space-y-2">
                                {monthLogs.map(log => (
                                    <DoseCard key={log.id} log={log} onDelete={handleDelete} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <DoseLogModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); loadLogs(); }}
                />
            )}
        </div>
    );
}
