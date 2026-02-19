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
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load profile for current stats
            const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            setProfile(userProfile);

            // Load wellness logs
            const { data: logs } = await supabase
                .from("wellness_logs")
                .select("*")
                .eq("user_id", user.id)
                .order("logged_date", { ascending: true });

            if (logs) {
                // Process logs for charts
                // Filter by range
                const now = new Date();
                let filteredLogs = logs;

                if (range !== "ALL") {
                    const months = range === "1M" ? 1 : range === "3M" ? 3 : 6;
                    const cutoff = subMonths(now, months);
                    filteredLogs = logs.filter(l => isAfter(parseISO(l.logged_date), cutoff));
                }

                setData(filteredLogs.map(l => ({
                    date: l.logged_date,
                    weight: l.weight_kg,
                    calories: l.calories || 0,
                    nausea: l.side_effects_detail?.nausea || 0, // Example side effect
                    formattedDate: format(parseISO(l.logged_date), "d MMM", { locale: es }),
                })));
            }
            setLoading(false);
        };

        loadData();
    }, [range]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!data.length || !profile) return null;
        const first = data[0];
        const last = data[data.length - 1];
        const totalChange = last.weight - first.weight;
        const percentChange = (totalChange / first.weight) * 100;
        const weeks = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24 * 7));
        const weeklyAvg = totalChange / weeks;

        // BMI = weight (kg) / height (m)^2 -- assuming height is stored or we just show weight for now if height missing
        // For now let's just show dynamic weight stats
        return {
            totalChange: totalChange.toFixed(1),
            percentChange: percentChange.toFixed(1),
            currentWeight: last.weight,
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
            doc.text(`Peso Inicial: ${data[0].weight}kg`, 14, 40);
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
