"use client";
import { useState, useMemo } from "react";

type LogEntry = {
    logged_at: string;
    dose_amount: number;
    dose_unit: string;
    peptides: { name_es: string; half_life_hours: number | null } | null;
};

const COLORS = [
    "#22d3ee", "#818cf8", "#34d399", "#f472b6",
    "#fb923c", "#a78bfa", "#2dd4bf", "#fbbf24",
];

type Props = { logs: LogEntry[] };

export function HalfLifeChart({ logs }: Props) {
    const [activePeptides, setActivePeptides] = useState<Set<string>>(new Set());

    // Unique peptide names
    const peptideNames = useMemo(() =>
        [...new Set(logs.map(l => l.peptides?.name_es || "Desconocido"))],
        [logs]
    );

    const colorMap = useMemo(() => {
        const m: Record<string, string> = {};
        peptideNames.forEach((n, i) => { m[n] = COLORS[i % COLORS.length]; });
        return m;
    }, [peptideNames]);

    const isFiltered = activePeptides.size > 0;
    const visiblePeptides = isFiltered ? activePeptides : new Set(peptideNames);

    const togglePeptide = (name: string) => {
        setActivePeptides(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
    };

    if (!logs || logs.length === 0) return null;

    // Window: 24h before now → +24h future
    const now = new Date();
    const windowStart = new Date(now.getTime() - 24 * 3600000);
    const windowEnd = new Date(now.getTime() + 24 * 3600000);
    const totalMs = windowEnd.getTime() - windowStart.getTime();

    const W = 400; const H = 110;
    const PAD_L = 44; const PAD_B = 22; const PAD_T = 12;
    const CHART_W = W - PAD_L;
    const CHART_H = H - PAD_B - PAD_T;
    const STEPS = 120;

    // Group logs by peptide
    const byPeptide: Record<string, LogEntry[]> = {};
    for (const log of logs) {
        const name = log.peptides?.name_es || "Desconocido";
        if (!byPeptide[name]) byPeptide[name] = [];
        byPeptide[name].push(log);
    }

    // Find global max concentration for scaling
    let globalMax = 0;
    for (const [name, entries] of Object.entries(byPeptide)) {
        if (!visiblePeptides.has(name)) continue;
        for (let i = 0; i <= STEPS; i++) {
            const t = windowStart.getTime() + (i / STEPS) * totalMs;
            let c = 0;
            for (const e of entries) {
                const dt = (t - new Date(e.logged_at).getTime()) / 3600000;
                if (dt < 0) continue;
                const hl = e.peptides?.half_life_hours || 4;
                c += e.dose_amount * Math.exp((-Math.LN2 / hl) * dt);
            }
            if (c > globalMax) globalMax = c;
        }
    }
    if (globalMax === 0) globalMax = 1;

    // Build paths
    const paths: { name: string; color: string; d: string; areaD: string; peakVal: number; peakX: number }[] = [];
    for (const [name, entries] of Object.entries(byPeptide)) {
        if (!visiblePeptides.has(name)) continue;
        const pts: [number, number][] = [];
        let peakVal = 0; let peakStep = 0;
        for (let i = 0; i <= STEPS; i++) {
            const t = windowStart.getTime() + (i / STEPS) * totalMs;
            let c = 0;
            for (const e of entries) {
                const dt = (t - new Date(e.logged_at).getTime()) / 3600000;
                if (dt < 0) continue;
                const hl = e.peptides?.half_life_hours || 4;
                c += e.dose_amount * Math.exp((-Math.LN2 / hl) * dt);
            }
            if (c > peakVal) { peakVal = c; peakStep = i; }
            const x = PAD_L + (i / STEPS) * CHART_W;
            const y = PAD_T + CHART_H - (c / globalMax) * CHART_H;
            pts.push([x, y]);
        }
        if (peakVal < 0.001) continue;
        const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
        const areaD = d + ` L${(PAD_L + CHART_W).toFixed(1)},${(PAD_T + CHART_H).toFixed(1)} L${PAD_L},${(PAD_T + CHART_H).toFixed(1)} Z`;
        const peakX = PAD_L + (peakStep / STEPS) * CHART_W;
        paths.push({ name, color: colorMap[name], d, areaD, peakVal, peakX });
    }

    // Now marker
    const nowX = PAD_L + ((now.getTime() - windowStart.getTime()) / totalMs) * CHART_W;

    // X-axis labels — every 12h
    const xLabels: { x: number; label: string }[] = [];
    for (let h = -24; h <= 24; h += 12) {
        const t = new Date(now.getTime() + h * 3600000);
        const x = PAD_L + ((t.getTime() - windowStart.getTime()) / totalMs) * CHART_W;
        const label = h === 0 ? "ahora" : (h < 0 ? `${Math.abs(h)}h` : `+${h}h`);
        xLabels.push({ x, label });
    }

    // Y-axis: 4 ticks — show as % of peak or actual value
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
        y: PAD_T + CHART_H - pct * CHART_H,
        label: pct === 0 ? "0" : `${Math.round(pct * globalMax)} `,
    }));
    // Use unit from first log
    const unit = logs[0]?.dose_unit || "mcg";

    return (
        <div className="glass-card p-4 space-y-3">
            {/* Peptide filter pills */}
            {peptideNames.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    {peptideNames.map(name => {
                        const color = colorMap[name];
                        const active = !isFiltered || activePeptides.has(name);
                        return (
                            <button
                                key={name}
                                onClick={() => togglePeptide(name)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all"
                                style={{
                                    borderColor: active ? color + "55" : "rgba(255,255,255,0.07)",
                                    backgroundColor: active ? color + "18" : "transparent",
                                    color: active ? color : "rgba(255,255,255,0.3)",
                                }}
                            >
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: active ? color : "rgba(255,255,255,0.15)" }} />
                                {name}
                            </button>
                        );
                    })}
                    {isFiltered && (
                        <button onClick={() => setActivePeptides(new Set())}
                            className="px-3 py-1 rounded-full text-xs text-white/30 border border-white/6 hover:border-white/15">
                            Limpiar
                        </button>
                    )}
                </div>
            )}

            {/* Chart */}
            <div className="relative overflow-hidden rounded-lg">
                <svg
                    width="100%"
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="overflow-visible"
                >
                    <defs>
                        {paths.map(({ name, color }) => (
                            <linearGradient key={name} id={`g-${name.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Y-axis ticks & labels */}
                    {yTicks.map(({ y, label }, i) => (
                        <g key={i}>
                            <line x1={PAD_L - 2} x2={W} y1={y} y2={y}
                                stroke={i === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}
                                strokeWidth={i === 0 ? 1 : 1} />
                            <text x={PAD_L - 5} y={y + 3.5} textAnchor="end"
                                fill="rgba(255,255,255,0.28)" fontSize="7.5">
                                {label}{i > 0 ? unit : ""}
                            </text>
                        </g>
                    ))}

                    {/* X-axis */}
                    <line x1={PAD_L} x2={W} y1={PAD_T + CHART_H} y2={PAD_T + CHART_H}
                        stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                    {/* X labels */}
                    {xLabels.map(({ x, label }) => (
                        <g key={label}>
                            <line x1={x} x2={x} y1={PAD_T + CHART_H} y2={PAD_T + CHART_H + 4}
                                stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <text x={x} y={PAD_T + CHART_H + 13} textAnchor="middle"
                                fill={label === "ahora" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)"} fontSize="7.5"
                                fontWeight={label === "ahora" ? "600" : "400"}>
                                {label}
                            </text>
                        </g>
                    ))}

                    {/* Shaded past region */}
                    <rect x={PAD_L} y={PAD_T} width={Math.max(0, nowX - PAD_L)} height={CHART_H}
                        fill="rgba(0,0,0,0.15)" />

                    {/* Dose event markers */}
                    {logs.map((log, i) => {
                        const name = log.peptides?.name_es || "Desconocido";
                        if (!visiblePeptides.has(name)) return null;
                        const ms = new Date(log.logged_at).getTime();
                        if (ms < windowStart.getTime() || ms > windowEnd.getTime()) return null;
                        const x = PAD_L + ((ms - windowStart.getTime()) / totalMs) * CHART_W;
                        return (
                            <g key={i}>
                                <line x1={x} x2={x} y1={PAD_T} y2={PAD_T + CHART_H}
                                    stroke={colorMap[name]} strokeWidth="1" strokeDasharray="3,3" opacity={0.4} />
                                <circle cx={x} cy={PAD_T + CHART_H} r={3} fill={colorMap[name]} />
                            </g>
                        );
                    })}

                    {/* Concentration areas */}
                    {paths.map(({ name, areaD }) => (
                        <path key={`area-${name}`} d={areaD}
                            fill={`url(#g-${name.replace(/\s/g, "")})`} />
                    ))}

                    {/* Concentration lines */}
                    {paths.map(({ name, color, d }) => (
                        <path key={`line-${name}`} d={d}
                            stroke={color} strokeWidth="2" fill="none"
                            strokeLinecap="round" strokeLinejoin="round" />
                    ))}

                    {/* Peak labels */}
                    {paths.map(({ name, color, peakVal, peakX }) => {
                        const peakY = PAD_T + CHART_H - (peakVal / globalMax) * CHART_H;
                        return (
                            <g key={`peak-${name}`}>
                                <circle cx={peakX} cy={peakY} r={3} fill={color} />
                                <text x={peakX} y={peakY - 7} textAnchor="middle" fill={color} fontSize="8" fontWeight="600">
                                    {Math.round(peakVal)}{unit}
                                </text>
                            </g>
                        );
                    })}

                    {/* "Now" line */}
                    <line x1={nowX} x2={nowX} y1={PAD_T} y2={PAD_T + CHART_H + 4}
                        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4,3" />

                </svg>
            </div>

            {/* Legend */}
            {paths.length > 0 && (
                <div className="flex flex-wrap gap-3 text-xs text-white/40">
                    {paths.map(({ name, color }) => (
                        <div key={name} className="flex items-center gap-1.5">
                            <div className="w-5 h-0.5 rounded-full" style={{ background: color }} />
                            <span>{name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
