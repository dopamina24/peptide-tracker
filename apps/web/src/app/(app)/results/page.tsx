"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { Download, Calendar, Filter, ChevronDown, Activity, Utensils, AlertCircle } from "lucide-react";
import { format, subMonths, isAfter, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TIME_RANGES = [
    { label: "1 mes", value: "1M" },
    { label: "3 meses", value: "3M" },
    { label: "6 meses", value: "6M" },
    { label: "Todo", value: "ALL" },
];

export default function ResultsPage() {
    const [range, setRange] = useState("3M");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [medicationLevels, setMedicationLevels] = useState<any[]>([]);
    const [activePeptides, setActivePeptides] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load profile
            const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            setProfile(userProfile);

            // Load wellness logs
            const { data: logs } = await supabase
                .from("wellness_logs")
                .select("*")
                .eq("user_id", user.id)
                .order("logged_date", { ascending: true });

            // Load dose logs & peptides for levels calculation
            const { data: doseLogs } = await supabase
                .from("dose_logs")
                .select("*, peptides(*)")
                .eq("user_id", user.id)
                .order("logged_at", { ascending: true });

            const { data: peptides } = await supabase.from("peptides").select("*");

            if (logs) {
                // Filter logs by range
                const now = new Date();
                const months = range === "1M" ? 1 : range === "3M" ? 3 : range === "6M" ? 6 : 120; // 120 months ~ 10 years for ALL
                const cutoff = subMonths(now, months);

                const filteredLogs = logs.filter(l => range === "ALL" || isAfter(parseISO(l.logged_date), cutoff));

                setData(filteredLogs.map(l => ({
                    date: l.logged_date,
                    weight: l.weight_kg,
                    calories: l.calories || 0,
                    nausea: l.side_effects_detail?.nausea || 0,
                    formattedDate: format(parseISO(l.logged_date), "d MMM", { locale: es }),
                })));
            }

            if (doseLogs && peptides) {
                // Calculate simulated levels
                // 1. Identify active peptides in the logs
                const uniquePeptideIds = Array.from(new Set(doseLogs.map(l => l.peptide_id)));
                const relevantPeptides = peptides.filter(p => uniquePeptideIds.includes(p.id));
                setActivePeptides(relevantPeptides);

                // 2. Simulation range (daily steps from first dose or range cutoff)
                const now = new Date();
                const months = range === "1M" ? 1 : range === "3M" ? 3 : range === "6M" ? 6 : 12;
                const startDate = subMonths(now, months);

                // If "ALL", start from the very first dose, else start from range cutoff
                const simulationStart = range === "ALL" && doseLogs.length > 0
                    ? new Date(doseLogs[0].logged_at)
                    : startDate;

                const simulationEnd = now;
                const daysToSimulate = Math.ceil((simulationEnd.getTime() - simulationStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                const levelsData = [];
                // Current levels for each peptide
                const currentLevels: Record<string, number> = {};
                relevantPeptides.forEach(p => currentLevels[p.id] = 0);

                // Group doses by date (YYYY-MM-DD)
                const dosesByDate: Record<string, any[]> = {};
                doseLogs.forEach(log => {
                    const day = log.logged_at.split("T")[0];
                    if (!dosesByDate[day]) dosesByDate[day] = [];
                    dosesByDate[day].push(log);
                });

                for (let i = 0; i < daysToSimulate; i++) {
                    const currentDate = new Date(simulationStart.getTime() + i * (1000 * 60 * 60 * 24));
                    const dateStr = currentDate.toISOString().split("T")[0];

                    const dailyData: any = {
                        date: dateStr,
                        formattedDate: format(currentDate, "d MMM", { locale: es })
                    };

                    relevantPeptides.forEach(p => {
                        // Decay from previous day: Amount(t) = Amount(t-1) * (0.5 ^ (24 / HalfLife))
                        const halfLife = p.half_life_hours || 24; // Default to 24h if missing
                        const decayFactor = Math.pow(0.5, 24 / halfLife);

                        let level = (currentLevels[p.id] || 0) * decayFactor;

                        // Add new doses for this day
                        const daysDoses = dosesByDate[dateStr]?.filter(d => d.peptide_id === p.id) || [];
                        daysDoses.forEach(d => {
                            // Assuming dose_amount is in same units (e.g. mg or mcg). 
                            // If mixing units, normalization is needed. visualizing raw numbers for now.
                            level += Number(d.dose_amount);
                        });

                        currentLevels[p.id] = level;
                        dailyData[p.name_es] = Number(level.toFixed(2)); // Store by name for the chart line
                        // Also store a normalized value if needed, but let's use raw for now
                    });

                    levelsData.push(dailyData);
                }
                setMedicationLevels(levelsData);
            }

            setLoading(false);
        };

        loadData();
    }, [range]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!data.length || !profile) return null;
        const last = data[data.length - 1];

        // Baseline: Profile starting weight if available, else first log in 'ALL' history (which we might not have full access to if range is filtered? 
        // Actually 'data' is filteredLogs. 
        // But for "Total Change", we ideally want All Time change. 
        // Let's assume profile.starting_weight_kg is the absolute truth for "Start".

        const startWeight = profile.starting_weight_kg || data[0].weight;
        const totalChange = last.weight - startWeight;
        const percentChange = (totalChange / startWeight) * 100;

        // Weekly average should probably be based on the selected range trends
        const firstVisible = data[0];
        const visibleWeeks = Math.max(1, (new Date(last.date).getTime() - new Date(firstVisible.date).getTime()) / (1000 * 60 * 60 * 24 * 7));
        const weeklyAvg = (last.weight - firstVisible.weight) / visibleWeeks;

        return {
            totalChange: totalChange.toFixed(1),
            percentChange: percentChange.toFixed(1),
            currentWeight: last.weight,
            startWeight: startWeight,
            weeklyAvg: weeklyAvg.toFixed(1),
        };
    }, [data, profile]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Reporte de Progreso AminFX", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generado el ${format(new Date(), "PP", { locale: es })}`, 14, 30);

        if (stats) {
            doc.text(`Peso Inicial: ${stats.startWeight}kg`, 14, 40);
            doc.text(`Peso Actual: ${stats.currentWeight}kg`, 14, 46);
            doc.text(`Cambio Total: ${stats.totalChange}kg (${stats.percentChange}%)`, 14, 52);
        }

        autoTable(doc, {
            startY: 60,
            head: [["Fecha", "Peso (kg)", "Calorías", "Náuseas (0-10)"]],
            body: data.map(d => [d.date, d.weight, d.calories, d.nausea]),
        });

        doc.save("aminfx-reporte.pdf");
    };

    const COLORS = ["#22d3ee", "#818cf8", "#f472b6", "#34d399", "#fbbf24"];

    return (
        <div className="space-y-6 pb-20">
            {/* Header with Title and Export */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Resultados</h1>
                <button onClick={exportPDF} className="flex items-center gap-2 text-brand-electric hover:text-brand-glow transition-colors text-sm font-medium">
                    <Download className="w-4 h-4" /> Exportar PDF
                </button>
            </div>

            {/* Time Range Selector */}
            <div className="bg-surface-elevated p-1 rounded-xl flex gap-1">
                {TIME_RANGES.map(r => (
                    <button
                        key={r.value}
                        onClick={() => setRange(r.value)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
                            ${range === r.value
                                ? "bg-brand-electric text-white shadow-lg shadow-brand-electric/20"
                                : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card p-4 space-y-1">
                        <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
                            <Activity className="w-3.5 h-3.5" /> Cambio Total
                        </div>
                        <div className="text-2xl font-bold flex items-baseline gap-1">
                            {stats.totalChange} <span className="text-sm font-normal text-white/40">kg</span>
                        </div>
                        <div className={`text-xs font-medium ${Number(stats.percentChange) < 0 ? "text-brand-neon" : "text-red-400"}`}>
                            {stats.percentChange}%
                        </div>
                    </div>
                    <div className="glass-card p-4 space-y-1">
                        <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5" /> Promedio Semanal
                        </div>
                        <div className="text-2xl font-bold flex items-baseline gap-1">
                            {stats.weeklyAvg} <span className="text-sm font-normal text-white/40">kg/sem</span>
                        </div>
                        <div className="text-xs text-white/30 font-medium">
                            Últimos {range === "ALL" ? "registros" : range}
                        </div>
                    </div>
                </div>
            )}

            {/* Medication Levels Chart */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Activity className="w-4 h-4 text-brand-neon" />
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-white/70">Niveles Estimados (Sangre)</h3>
                </div>
                <div className="glass-card p-4 h-64 w-full">
                    {medicationLevels.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={medicationLevels}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="formattedDate"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0e1520", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                {activePeptides.map((p, idx) => (
                                    <Line
                                        key={p.id}
                                        type="monotone"
                                        dataKey={p.name_es}
                                        stroke={COLORS[idx % COLORS.length]}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-white/30 text-xs text-center">
                            No hay dosis registradas para calcular niveles.
                        </div>
                    )}
                </div>
            </div>

            {/* Weight Chart */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Activity className="w-4 h-4 text-brand-electric" />
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-white/70">Tendencia de Peso</h3>
                </div>
                <div className="glass-card p-4 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="formattedDate"
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                domain={['auto', 'auto']}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#0e1520", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                itemStyle={{ color: "#fff" }}
                                labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="weight"
                                stroke="#22d3ee"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorWeight)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Calories Chart */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Utensils className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-white/70">Calorías Diarias</h3>
                </div>
                <div className="glass-card p-4 h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="formattedDate"
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: "#0e1520", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                            />
                            <Bar dataKey="calories" fill="#fb923c" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Side Effects Chart */}
            {data.some(d => d.nausea > 0) && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <AlertCircle className="w-4 h-4 text-green-400" />
                        <h3 className="text-sm font-semibold tracking-wide uppercase text-white/70">Efectos Secundarios</h3>
                    </div>
                    <div className="glass-card p-4 h-48 w-full bg-surface-elevated/50">
                        <p className="text-xs text-white/40 mb-2">Intensidad de náuseas (0-10)</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: "#0e1520", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                />
                                <Bar dataKey="nausea" fill="#4ade80" radius={[2, 2, 0, 0]} barSize={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
