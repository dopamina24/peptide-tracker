"use client";
import { useState } from "react";
import { Beaker, Syringe, RotateCcw } from "lucide-react";

export default function CalculatorPage() {
    const [vialMg, setVialMg] = useState("");
    const [waterMl, setWaterMl] = useState("");
    const [desiredMcg, setDesiredMcg] = useState("");
    const [syringeType, setSyringeType] = useState<"u100" | "u40">("u100");

    const vialMgN = parseFloat(vialMg) || 0;
    const waterMlN = parseFloat(waterMl) || 0;
    const desiredMcgN = parseFloat(desiredMcg) || 0;

    const concentration = vialMgN > 0 && waterMlN > 0 ? (vialMgN * 1000) / waterMlN : 0; // mcg/ml
    const mlNeeded = concentration > 0 ? desiredMcgN / concentration : 0;
    const unitsOnSyringe = mlNeeded * (syringeType === "u100" ? 100 : 40);

    const reset = () => { setVialMg(""); setWaterMl(""); setDesiredMcg(""); };

    const syringePercent = Math.min((mlNeeded / (syringeType === "u100" ? 1 : 2.5)) * 100, 100);

    return (
        <div className="p-4 space-y-5">
            <div className="pt-4">
                <h1 className="text-2xl font-bold">Calculadora</h1>
                <p className="text-white/40 text-sm mt-0.5">Reconstitución y dosis</p>
            </div>

            {/* Inputs */}
            <div className="glass-card p-5 space-y-4">
                <h2 className="font-semibold flex items-center gap-2"><Beaker className="w-4 h-4 text-brand-electric" /> Datos del vial</h2>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/70">Contenido del vial (mg)</label>
                    <div className="relative">
                        <input type="number" value={vialMg} onChange={e => setVialMg(e.target.value)}
                            className="input-field pr-12" placeholder="5" step="any" min="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">mg</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/70">Agua bacteriostática a agregar (ml)</label>
                    <div className="relative">
                        <input type="number" value={waterMl} onChange={e => setWaterMl(e.target.value)}
                            className="input-field pr-12" placeholder="2" step="any" min="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">ml</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/70">Dosis deseada (mcg)</label>
                    <div className="relative">
                        <input type="number" value={desiredMcg} onChange={e => setDesiredMcg(e.target.value)}
                            className="input-field pr-14" placeholder="250" step="any" min="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">mcg</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/70">Tipo de jeringa</label>
                    <div className="flex gap-2">
                        {[["u100", "U-100 (1ml)"], ["u40", "U-40 (2.5ml)"]].map(([v, l]) => (
                            <button key={v} type="button" onClick={() => setSyringeType(v as "u100" | "u40")}
                                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all
                  ${syringeType === v ? "bg-brand-electric/20 border-brand-electric/50 text-white" : "border-surface-border text-white/50"}`}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={reset} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm py-2">
                    <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
                </button>
            </div>

            {/* Results */}
            {concentration > 0 && (
                <div className="glass-card p-5 space-y-4 animate-slide-up">
                    <h2 className="font-semibold flex items-center gap-2"><Syringe className="w-4 h-4 text-brand-neon" /> Resultados</h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass-elevated p-3 text-center rounded-xl">
                            <div className="text-2xl font-bold text-gradient">{concentration.toFixed(0)}</div>
                            <div className="text-xs text-white/40 mt-0.5">mcg/ml concentración</div>
                        </div>
                        {desiredMcgN > 0 && (
                            <div className="glass-elevated p-3 text-center rounded-xl">
                                <div className="text-2xl font-bold text-gradient-neon">{mlNeeded.toFixed(3)}</div>
                                <div className="text-xs text-white/40 mt-0.5">ml a extraer</div>
                            </div>
                        )}
                    </div>

                    {desiredMcgN > 0 && unitsOnSyringe > 0 && (
                        <>
                            <div className="glass-elevated p-4 rounded-xl text-center">
                                <div className="text-4xl font-bold text-brand-electric">{unitsOnSyringe.toFixed(1)}</div>
                                <div className="text-sm text-white/50 mt-1">unidades en jeringa {syringeType.toUpperCase()}</div>
                            </div>

                            {/* Syringe visual */}
                            <div className="space-y-2">
                                <div className="text-sm text-white/50 text-center">Marca en la jeringa</div>
                                <div className="relative h-12 glass-elevated rounded-xl overflow-hidden">
                                    <div className="absolute inset-0 flex items-center px-4">
                                        {/* Tick marks */}
                                        {Array.from({ length: 11 }).map((_, i) => (
                                            <div key={i} className="flex-1 relative">
                                                <div className={`h-3 w-px mx-auto ${i % 5 === 0 ? "bg-white/30" : "bg-white/10"}`} />
                                            </div>
                                        ))}
                                    </div>
                                    <div
                                        className="absolute left-4 top-3 bottom-3 rounded-full bg-gradient-to-r from-brand-electric to-brand-neon"
                                        style={{ width: `${syringePercent}%`, maxWidth: "calc(100% - 2rem)", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-white/20 px-1">
                                    <span>0</span>
                                    <span>{syringeType === "u100" ? "50U" : "20U"}</span>
                                    <span>{syringeType === "u100" ? "100U" : "40U"}</span>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-brand-electric/5 border border-brand-electric/20 text-xs text-white/60 leading-relaxed">
                                💡 <strong>Resumen:</strong> Disuelve {vialMgN}mg en {waterMlN}ml de agua bacteriostática.
                                Para {desiredMcgN}mcg extrae <strong className="text-white">{mlNeeded.toFixed(3)}ml ({unitsOnSyringe.toFixed(1)} unidades)</strong>.
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Info card */}
            <div className="glass-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-white/70">💉 Referencia rápida</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                        ["1 mg", "= 1000 mcg"],
                        ["U-100 jeringa", "100 unidades = 1ml"],
                        ["U-40 jeringa", "40 unidades = 1ml"],
                        ["BAC water", "Úsala siempre fría"],
                    ].map(([k, v]) => (
                        <div key={k} className="glass-elevated p-2 rounded-lg">
                            <div className="text-white/40">{k}</div>
                            <div className="text-white/70 font-medium">{v}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
