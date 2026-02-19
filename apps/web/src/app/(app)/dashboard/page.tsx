"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { DoseLogModal } from "@/components/features/DoseLogModal";
import { HalfLifeChart } from "@/components/features/HalfLifeChart";

// ── Next dose arc gauge ───────────────────────────────────────────────────────
function NextDoseArc({ nextDoseDate, intervalDays }: { nextDoseDate: Date | null; intervalDays: number }) {
    if (!nextDoseDate) return null;
    const now = new Date();
    const hoursLeft = Math.max(0, (nextDoseDate.getTime() - now.getTime()) / 3600000);
    const totalHours = intervalDays * 24;
    const pct = Math.max(0, Math.min(1, hoursLeft / totalHours));

    // Semicircle arc (270° sweep, from bottom-left to bottom-right)
    const R = 80;
    const cx = 100; const cy = 105;
    const startAngle = 135;
    const sweepAngle = 270;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const arcStart = { x: cx + R * Math.cos(toRad(startAngle)), y: cy + R * Math.sin(toRad(startAngle)) };
    const endAngle = startAngle + sweepAngle * (1 - pct);
    const arcEnd = { x: cx + R * Math.cos(toRad(endAngle)), y: cy + R * Math.sin(toRad(endAngle)) };
    const largeArc = sweepAngle * (1 - pct) > 180 ? 1 : 0;
    const arcPath = `M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`;

    const daysLeft = Math.floor(hoursLeft / 24);
    const label = daysLeft >= 1 ? `${daysLeft} día${daysLeft !== 1 ? "s" : ""}` : `${Math.round(hoursLeft)}h`;

    return (
        <div className="flex flex-col items-center">
            <svg width="200" height="130" viewBox="0 0 200 130">
                {/* Track */}
                <path d={`M ${cx + R * Math.cos(toRad(startAngle))} ${cy + R * Math.sin(toRad(startAngle))} A ${R} ${R} 0 1 1 ${cx + R * Math.cos(toRad(startAngle + sweepAngle))} ${cy + R * Math.sin(toRad(startAngle + sweepAngle))}`}
                    stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" strokeLinecap="round" />
                {/* Filled arc */}
                {pct < 0.99 && (
                    <path d={arcPath} stroke="url(#arcGrad)" strokeWidth="12" fill="none" strokeLinecap="round" />
                )}
                <defs>
                    <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop stopColor="#FF3B30" />
                        <stop offset="0.5" stopColor="#FF9500" />
                        <stop offset="1" stopColor="#FFD60A" />
                    </linearGradient>
                </defs>
                {/* Center text */}
                <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="26" fontWeight="700">{label}</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11">para la próxima dosis</text>
                <text x={cx} y={cy + 30} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">
                    {format(nextDoseDate, "EEE d 'de' MMM 'a las' HH:mm", { locale: es })}
                </text>
            </svg>
        </div>
    );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex-1 bg-white/6 rounded-2xl px-3 py-3 min-w-0">
            <div className="text-base mb-0.5">{icon}</div>
            <div className="text-white font-bold text-[15px] leading-tight">{value}</div>
            <div className="text-white/40 text-[11px] mt-0.5 leading-tight">{label}</div>
        </div>
    );
}

// ── Wellness tap card ─────────────────────────────────────────────────────────
function WellnessCard({ icon, label, value, onTap }: { icon: string; label: string; value: string; onTap?: () => void }) {
    return (
        <button onClick={onTap}
            className="bg-white/6 rounded-2xl px-4 py-3 text-left hover:bg-white/9 transition-colors active:scale-95">
            <div className="text-lg">{icon}</div>
            <div className="text-white font-bold text-[16px] mt-0.5">{value}</div>
            <div className="text-white/40 text-[12px]">{label}</div>
        </button>
    );
}

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [todayLogs, setTodayLogs] = useState<any[]>([]);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [nextProtocolItem, setNextProtocolItem] = useState<any>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [wellness, setWellness] = useState<any>(null);
    const supabase = createClient();
    const today = format(new Date(), "yyyy-MM-dd");

    const loadData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [
            { data: profileData },
            { data: logsToday },
            { data: recentData },
            { data: protocols },
            { data: wellnessData },
        ] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("dose_logs").select("*, peptides(name_es, half_life_hours)")
                .eq("user_id", user.id)
                .gte("logged_at", `${today}T00:00:00`)
                .lte("logged_at", `${today}T23:59:59`)
                .order("logged_at", { ascending: false }),
            supabase.from("dose_logs").select("*, peptides(name_es, half_life_hours, dose_unit)")
                .eq("user_id", user.id)
                .order("logged_at", { ascending: false })
                .limit(10),
            supabase.from("protocols").select("*, protocol_items(*, peptides(name_es))")
                .eq("user_id", user.id).eq("is_active", true).limit(1),
            supabase.from("wellness_logs").select("*").eq("user_id", user.id).eq("logged_date", today).single(),
        ]);

        setProfile(profileData);
        setTodayLogs(logsToday || []);
        setRecentLogs(recentData || []);
        setWellness(wellnessData);

        // Compute next scheduled dose
        if (protocols?.[0]?.protocol_items?.length) {
            setNextProtocolItem(protocols[0].protocol_items[0]);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
    const userName = profile?.username || "tú";

    // Stats
    const totalDoses = recentLogs.length;
    const lastLog = recentLogs[0];
    const lastDoseLabel = lastLog
        ? `${lastLog.dose_amount}${lastLog.peptides?.dose_unit || lastLog.dose_unit}`
        : "—";

    // Next dose: rough calc — find last log for protocol item, add frequency interval
    const nextDoseDate = nextProtocolItem
        ? (() => {
            const last = recentLogs.find((l: any) => l.protocol_item_id === nextProtocolItem.id);
            if (!last) return new Date();
            const freqDays =
                nextProtocolItem.frequency_type === "daily" ? 1 :
                    nextProtocolItem.frequency_type === "eod" ? 2 :
                        nextProtocolItem.frequency_type === "weekly" ? 7 : 7;
            return new Date(new Date(last.logged_at).getTime() + freqDays * 86400000);
        })()
        : null;

    const intervalDays =
        nextProtocolItem?.frequency_type === "daily" ? 1 :
            nextProtocolItem?.frequency_type === "eod" ? 2 :
                nextProtocolItem?.frequency_type === "weekly" ? 7 : 7;

    const weightKg = profile?.weight_kg;

    return (
        <div className="bg-[#111113] min-h-full">
            {/* iOS-style nav bar */}
            <div className="flex items-center justify-between px-4 pt-14 pb-3">
                <button className="text-white/50 p-1">
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                        <rect y="0" width="20" height="2" rx="1" fill="currentColor" />
                        <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
                        <rect y="12" width="20" height="2" rx="1" fill="currentColor" />
                    </svg>
                </button>
                <span className="text-white font-semibold text-[17px]">Resumen</span>
                <button onClick={() => setShowLogModal(true)}
                    className="text-[#0A84FF] text-[15px] font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Agr. dosis
                </button>
            </div>

            <div className="px-4 space-y-6 pb-28">
                {/* Greeting */}
                <p className="text-white/40 text-[14px]">
                    {greeting}, <span className="text-white font-semibold">{userName}</span> 👋
                </p>

                {/* Stats row */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white font-bold text-[17px]">Historial de dosis</h2>
                        <button className="text-[#0A84FF] text-[14px] flex items-center gap-0.5">
                            Ver todos <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex gap-2.5">
                        <StatCard icon="💉" label="Dosis apl." value={String(totalDoses)} />
                        <StatCard icon="⏱️" label="Última dosis" value={lastDoseLabel} />
                        <StatCard icon="📈" label="Niv. est." value={lastLog ? `${lastLog.dose_amount}${lastLog.peptides?.dose_unit || ""}` : "—"} />
                    </div>
                </div>

                {/* Concentration chart */}
                {recentLogs.length > 0 && (
                    <div>
                        <h2 className="text-white font-bold text-[17px] mb-3">Niveles estimados de medicación</h2>
                        <HalfLifeChart logs={recentLogs as any} />
                    </div>
                )}

                {/* Next dose arc */}
                {nextDoseDate && (
                    <div>
                        <h2 className="text-white font-bold text-[17px] mb-1">Próxima dosis</h2>
                        <div className="bg-white/5 rounded-3xl pt-2 pb-4">
                            <NextDoseArc nextDoseDate={nextDoseDate} intervalDays={intervalDays} />
                            {nextProtocolItem && (
                                <p className="text-center text-white/40 text-[13px]">
                                    {nextProtocolItem.peptides?.name_es} · {nextProtocolItem.dose_amount}{nextProtocolItem.dose_unit}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Today section */}
                <div>
                    <h2 className="text-white font-bold text-[17px] mb-3">
                        Hoy, {format(new Date(), "d MMMM", { locale: es })}
                    </h2>
                    <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                        <WellnessCard icon="⚖️" label="Peso" value={wellness?.weight_kg ? `${wellness.weight_kg}kg` : "—"} />
                        <WellnessCard icon="🔥" label="Calorías" value="—" />
                        <WellnessCard icon="🥩" label="Proteína" value="—" />
                    </div>
                    <div className="space-y-2">
                        <button className="w-full bg-white/6 rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-white/9 transition-colors text-left">
                            <span className="text-lg">🤒</span>
                            <div>
                                <div className="text-white text-[14px] font-medium">Efectos secundarios</div>
                                <div className="text-white/35 text-[12px]">Toque para agregar efectos</div>
                            </div>
                        </button>
                        <button className="w-full bg-white/6 rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-white/9 transition-colors text-left">
                            <span className="text-lg">📝</span>
                            <div>
                                <div className="text-white text-[14px] font-medium">Notas del día</div>
                                <div className="text-white/35 text-[12px]">Toque para agregar notas</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Resultados */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white font-bold text-[17px]">Resultados</h2>
                        <button className="text-[#0A84FF] text-[14px] flex items-center gap-0.5">
                            Ver gráfico <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                        <WellnessCard icon="⚖️" label="Cambio total" value="0kg" />
                        <WellnessCard icon="🧮" label="IMC actual"
                            value={weightKg && profile?.age ? String(Math.round(weightKg / Math.pow(1.70, 2) * 10) / 10) : "—"} />
                        <WellnessCard icon="📊" label="Peso" value={weightKg ? `${weightKg}kg` : "—"} />
                        <WellnessCard icon="%" label="Porcentaje" value="0%" />
                        <WellnessCard icon="📅" label="Prom. sem." value="—" />
                        <WellnessCard icon="🏁" label="A meta" value="—" />
                    </div>
                </div>
            </div>

            {/* Dose log modal (full screen iOS) */}
            {showLogModal && (
                <DoseLogModal
                    onClose={() => setShowLogModal(false)}
                    onSuccess={() => { setShowLogModal(false); loadData(); toast.success("¡Dosis registrada! 💉"); }}
                />
            )}
        </div>
    );
}
