"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Protocol, Peptide } from "@/types/database";
import { Plus, PlayCircle, PauseCircle, Trash2, FlaskConical, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

const ROUTES = ["subcutaneous", "intramuscular", "nasal", "oral", "topical"];
const FREQUENCY_TYPES = [
    { value: "daily", label: "Diaria" },
    { value: "eod", label: "Cada 2 días" },
    { value: "3x_week", label: "3x semana" },
    { value: "weekly", label: "Semanal" },
    { value: "custom", label: "Días específicos" },
];

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function CreateProtocolModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [peptides, setPeptides] = useState<Peptide[]>([]);
    const [items, setItems] = useState<{
        peptideId: string; doseAmount: string; doseUnit: string;
        route: string; frequencyType: string; frequencyDays: number[]; preferredTime: string;
    }[]>([]);
    const [cycleOn, setCycleOn] = useState("");
    const [cycleOff, setCycleOff] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        supabase.from("peptides").select("*").order("name_es").then(({ data }) => { if (data) setPeptides(data); });
    }, []);

    const addItem = () => {
        setItems(prev => [...prev, {
            peptideId: "", doseAmount: "", doseUnit: "mcg",
            route: "subcutaneous", frequencyType: "daily", frequencyDays: [], preferredTime: "",
        }]);
    };

    const updateItem = (idx: number, field: string, value: any) => {
        setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
    };

    const handleSave = async () => {
        if (!name || items.length === 0) return;
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: protocol } = await supabase.from("protocols").insert({
            user_id: user.id, name, is_active: true,
            start_date: startDate || null,
            cycle_on_weeks: cycleOn ? parseInt(cycleOn) : null,
            cycle_off_weeks: cycleOff ? parseInt(cycleOff) : null,
        }).select().single();

        if (protocol) {
            for (const item of items) {
                if (!item.peptideId) continue;
                await supabase.from("protocol_items").insert({
                    protocol_id: protocol.id,
                    peptide_id: item.peptideId,
                    dose_amount: parseFloat(item.doseAmount) || 0,
                    dose_unit: item.doseUnit,
                    route: item.route,
                    frequency_type: item.frequencyType,
                    frequency_days: item.frequencyDays,
                    preferred_time: item.preferredTime || null,
                });
            }
        }
        toast.success("Protocolo creado 🧬");
        setLoading(false);
        onCreated();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg glass-card rounded-b-none rounded-t-3xl p-5 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-none">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold">Nuevo Protocolo</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-elevated text-white/50"><X className="w-4 h-4" /></button>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mb-5">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-brand-electric" : "bg-surface-elevated"}`} />
                    ))}
                </div>

                {step === 0 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-white/70 block mb-1.5">Nombre del protocolo</label>
                            <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Ej. Stack de recuperación" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium text-white/70 block mb-1.5">Semanas activo</label>
                                <input type="number" value={cycleOn} onChange={e => setCycleOn(e.target.value)} className="input-field" placeholder="4" min="1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white/70 block mb-1.5">Semanas descanso</label>
                                <input type="number" value={cycleOff} onChange={e => setCycleOff(e.target.value)} className="input-field" placeholder="2" min="0" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-white/70 block mb-1.5">Fecha de inicio</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
                        </div>
                        <button onClick={() => setStep(1)} disabled={!name} className="btn-primary w-full">Continuar →</button>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-sm text-white/50">Agrega los péptidos a este protocolo</p>
                        {items.map((item, idx) => (
                            <div key={idx} className="glass-elevated p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white/70">Péptido {idx + 1}</span>
                                    <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-400/60 hover:text-red-400 text-xs">Eliminar</button>
                                </div>
                                <select value={item.peptideId} onChange={e => updateItem(idx, "peptideId", e.target.value)} className="input-field text-sm">
                                    <option value="">Seleccionar péptido...</option>
                                    {peptides.map(p => <option key={p.id} value={p.id}>{p.name_es}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" value={item.doseAmount} onChange={e => updateItem(idx, "doseAmount", e.target.value)}
                                        className="input-field text-sm" placeholder="Dosis" />
                                    <select value={item.doseUnit} onChange={e => updateItem(idx, "doseUnit", e.target.value)} className="input-field text-sm">
                                        {["mcg", "mg", "IU"].map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <select value={item.route} onChange={e => updateItem(idx, "route", e.target.value)} className="input-field text-sm">
                                    {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <select value={item.frequencyType} onChange={e => updateItem(idx, "frequencyType", e.target.value)} className="input-field text-sm">
                                    {FREQUENCY_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                                {item.frequencyType === "custom" && (
                                    <div className="flex gap-1.5 flex-wrap">
                                        {DAYS_ES.map((d, dayIdx) => (
                                            <button key={dayIdx} type="button"
                                                onClick={() => updateItem(idx, "frequencyDays", item.frequencyDays.includes(dayIdx)
                                                    ? item.frequencyDays.filter(x => x !== dayIdx)
                                                    : [...item.frequencyDays, dayIdx])}
                                                className={`w-9 h-9 rounded-lg text-xs font-medium border transition-all
                          ${item.frequencyDays.includes(dayIdx) ? "bg-brand-electric/20 border-brand-electric/50 text-white" : "border-surface-border text-white/40"}`}>
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <input type="time" value={item.preferredTime} onChange={e => updateItem(idx, "preferredTime", e.target.value)}
                                    className="input-field text-sm" placeholder="Hora preferida" />
                            </div>
                        ))}
                        <button onClick={addItem} className="btn-ghost w-full flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Agregar péptido
                        </button>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(0)} className="btn-ghost">← Atrás</button>
                            <button onClick={() => setStep(2)} disabled={items.length === 0} className="btn-primary flex-1">Revisar →</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-white/50">Revisión final</p>
                        <div className="glass-elevated p-4 space-y-2">
                            <div className="font-bold text-lg">{name}</div>
                            {cycleOn && <div className="text-sm text-white/50">{cycleOn} semanas activo{cycleOff ? ` / ${cycleOff} semanas descanso` : ""}</div>}
                            <div className="text-sm text-white/40">Inicio: {startDate}</div>
                        </div>
                        {items.filter(i => i.peptideId).map((item, idx) => {
                            const p = peptides.find(p => p.id === item.peptideId);
                            return (
                                <div key={idx} className="glass-elevated p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-electric/10 flex items-center justify-center">
                                        <FlaskConical className="w-4 h-4 text-brand-electric" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{p?.name_es}</div>
                                        <div className="text-xs text-white/40">{item.doseAmount} {item.doseUnit} · {FREQUENCY_TYPES.find(f => f.value === item.frequencyType)?.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-ghost">← Atrás</button>
                            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Crear Protocolo"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProtocolsPage() {
    const [protocols, setProtocols] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const supabase = createClient();

    const loadProtocols = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from("protocols")
            .select(`*, protocol_items(*, peptides(*))`)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        setProtocols(data || []);
        setLoading(false);
    };

    useEffect(() => { loadProtocols(); }, []);

    const toggleActive = async (protocol: Protocol) => {
        await supabase.from("protocols").update({ is_active: !protocol.is_active }).eq("id", protocol.id);
        toast.success(!protocol.is_active ? "Protocolo activado" : "Protocolo pausado");
        loadProtocols();
    };

    const deleteProtocol = async (id: string) => {
        await supabase.from("protocols").delete().eq("id", id);
        toast.success("Protocolo eliminado");
        loadProtocols();
    };

    return (
        <div className="p-4 space-y-5">
            <div className="pt-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Protocolos</h1>
                    <p className="text-white/40 text-sm mt-0.5">{protocols.filter(p => p.is_active).length} activos</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 py-2 text-sm">
                    <Plus className="w-4 h-4" /> Nuevo
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="glass-card p-4 h-28 animate-pulse bg-surface-elevated/50" />)}
                </div>
            ) : protocols.length === 0 ? (
                <div className="glass-card p-10 text-center space-y-3">
                    <FlaskConical className="w-12 h-12 text-white/20 mx-auto" />
                    <p className="text-white/40">Crea tu primer protocolo</p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Crear protocolo
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {protocols.map(protocol => (
                        <div key={protocol.id} className="glass-card p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold">{protocol.name}</h3>
                                        <span className={`badge-pill text-xs ${protocol.is_active ? "bg-brand-neon/10 text-brand-neon border border-brand-neon/20" : "bg-surface-elevated text-white/30 border border-surface-border"}`}>
                                            {protocol.is_active ? "Activo" : "Pausado"}
                                        </span>
                                    </div>
                                    {protocol.cycle_on_weeks && (
                                        <p className="text-xs text-white/40 mt-0.5">{protocol.cycle_on_weeks}w on{protocol.cycle_off_weeks ? ` / ${protocol.cycle_off_weeks}w off` : ""}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleActive(protocol)} className="text-white/40 hover:text-white transition-colors">
                                        {protocol.is_active ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                    </button>
                                    <button onClick={() => deleteProtocol(protocol.id)} className="text-red-400/40 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {(protocol.protocol_items || []).map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated border border-surface-border text-xs">
                                        <FlaskConical className="w-3 h-3 text-brand-electric" />
                                        <span className="text-white/70">{item.peptides?.name_es}</span>
                                        <span className="text-white/30">{item.dose_amount}{item.dose_unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <CreateProtocolModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadProtocols(); }} />
            )}
        </div>
    );
}
