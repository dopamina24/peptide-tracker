"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    LogOut, User, Scale, Globe, Shield, FileText,
    ChevronRight, Download, Edit2, Check, X,
    Target, Zap, TrendingDown, Brain, Dumbbell, Activity,
} from "lucide-react";

const GOAL_LABELS: Record<string, { label: string; emoji: string }> = {
    fitness: { label: "Fitness & Rendimiento", emoji: "💪" },
    longevity: { label: "Longevidad", emoji: "🌿" },
    fat_loss: { label: "Pérdida de Grasa", emoji: "🔥" },
    recovery: { label: "Recuperación", emoji: "⚡" },
    cognitive: { label: "Función Cognitiva", emoji: "🧠" },
    general: { label: "Bienestar General", emoji: "🎯" },
};

const EXP_LABELS: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Editable fields
    const [username, setUsername] = useState("");
    const [weightKg, setWeightKg] = useState("");
    const [age, setAge] = useState("");
    const [sex, setSex] = useState("");
    const [saving, setSaving] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setEmail(user.email || "");
            const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (data) {
                setProfile(data);
                setUsername(data.username || "");
                setWeightKg(data.weight_kg ? String(data.weight_kg) : "");
                setAge(data.age ? String(data.age) : "");
                setSex(data.sex || "");
            }
            setLoading(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            username: username || null,
            weight_kg: weightKg ? parseFloat(weightKg) : null,
            age: age ? parseInt(age) : null,
            sex: sex || null,
            updated_at: new Date().toISOString(),
        });
        if (error) {
            toast.error("Error al guardar: " + error.message);
        } else {
            // Refresh profile
            const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            setProfile(data);
            toast.success("Perfil actualizado ✓");
            setEditing(false);
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const exportCSV = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: logs } = await supabase
            .from("dose_logs")
            .select(`*, peptides(name_es)`)
            .eq("user_id", user.id)
            .order("logged_at");
        if (!logs) return;

        const rows = [
            ["Fecha", "Hora", "Péptido", "Dosis", "Unidad", "Vía", "Sitio", "Notas"],
            ...logs.map(l => [
                new Date(l.logged_at).toLocaleDateString("es"),
                new Date(l.logged_at).toLocaleTimeString("es"),
                (l as any).peptides?.name_es || "",
                l.dose_amount, l.dose_unit, l.route,
                l.injection_site || "",
                l.notes || "",
            ])
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "peptidetracker-historial.csv"; a.click();
        toast.success("Historial exportado como CSV");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-brand-electric/30 border-t-brand-electric rounded-full animate-spin" />
            </div>
        );
    }

    const displayName = profile?.username || email.split("@")[0] || "Usuario";

    return (
        <div className="p-4 space-y-4 pb-28">
            <div className="pt-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Perfil</h1>
                    <p className="text-white/40 text-sm mt-0.5">Configuración y datos</p>
                </div>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated border border-surface-border text-white/60 hover:text-white text-sm transition-all"
                    >
                        <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(false)} className="p-1.5 rounded-xl border border-surface-border text-white/40 hover:text-white transition-all">
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-electric text-white text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Guardar</>}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile card */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-electric to-brand-glow flex items-center justify-center flex-shrink-0">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <input
                                suppressHydrationWarning
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Tu nombre"
                                className="input-field text-base font-bold mb-1 w-full"
                            />
                        ) : (
                            <div className="font-bold text-lg truncate">{displayName}</div>
                        )}
                        <div className="text-sm text-white/40 truncate">{email}</div>
                    </div>
                </div>

                {/* Goals */}
                {profile?.goals && profile.goals.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {profile.goals.map((g: string) => {
                            const info = GOAL_LABELS[g];
                            return (
                                <span key={g} className="flex items-center gap-1 px-2.5 py-1 bg-brand-electric/10 border border-brand-electric/20 rounded-full text-brand-electric text-[11px] font-medium">
                                    <span>{info?.emoji}</span>
                                    <span>{info?.label || g}</span>
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Body stats — editable */}
            <div className="glass-card p-5">
                <p className="text-[11px] text-white/35 uppercase tracking-wider mb-3">Datos físicos</p>
                {editing ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-white/50 block mb-1">Peso (kg)</label>
                                <input
                                    suppressHydrationWarning
                                    type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)}
                                    className="input-field" placeholder="75" min="30" max="300"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/50 block mb-1">Edad</label>
                                <input
                                    suppressHydrationWarning
                                    type="number" value={age} onChange={e => setAge(e.target.value)}
                                    className="input-field" placeholder="35" min="18" max="100"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-white/50 block mb-1.5">Sexo biológico</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[["male", "Masculino"], ["female", "Femenino"], ["other", "Otro"]].map(([v, l]) => (
                                    <button key={v} onClick={() => setSex(v)}
                                        className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all
                                        ${sex === v ? "bg-brand-electric/20 border-brand-electric/50 text-white" : "border-surface-border text-white/50 hover:border-white/20"}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Scale, label: "Peso", value: profile?.weight_kg ? `${profile.weight_kg} kg` : "—" },
                            { icon: User, label: "Edad", value: profile?.age ? `${profile.age} años` : "—" },
                            { icon: Activity, label: "Nivel", value: EXP_LABELS[profile?.experience_level] || "—" },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="bg-surface-elevated rounded-2xl p-3 text-center">
                                <Icon className="w-4 h-4 text-white/30 mx-auto mb-1" />
                                <div className="text-sm font-semibold">{value}</div>
                                <div className="text-xs text-white/30">{label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Re-do onboarding */}
            <button
                onClick={() => router.push("/onboarding")}
                className="glass-card p-4 w-full flex items-center gap-3 hover:border-brand-electric/30 transition-all"
            >
                <div className="w-9 h-9 rounded-xl bg-brand-electric/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-brand-electric" />
                </div>
                <div className="flex-1 text-left">
                    <div className="text-sm font-medium">Actualizar objetivos</div>
                    <div className="text-xs text-white/40">Cambiar experiencia y metas</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30" />
            </button>

            {/* Calculator shortcut */}
            <button onClick={() => router.push("/calculator")} className="glass-card p-4 w-full flex items-center gap-3 hover:border-brand-electric/30 transition-all">
                <div className="w-9 h-9 rounded-xl bg-brand-neon/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-brand-neon" />
                </div>
                <div className="flex-1 text-left">
                    <div className="text-sm font-medium">Calculadora de Reconstitución</div>
                    <div className="text-xs text-white/40">Calcular concentración de viales</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30" />
            </button>

            {/* Data & legal */}
            <div className="glass-card divide-y divide-surface-border overflow-hidden">
                <button onClick={exportCSV} className="px-4 py-3 w-full flex items-center gap-3 hover:bg-surface-elevated/50 transition-colors">
                    <Download className="w-4 h-4 text-brand-neon" />
                    <span className="text-sm font-medium flex-1 text-left">Exportar historial (CSV)</span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                </button>
                <div className="px-4 py-3 flex items-center gap-3">
                    <Globe className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-medium flex-1">Idioma</span>
                    <span className="text-sm text-white/40">Español</span>
                </div>
                <a href="/legal/terms" className="px-4 py-3 flex items-center gap-3 hover:bg-surface-elevated/50 transition-colors">
                    <FileText className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-medium flex-1">Términos de Uso</span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                </a>
                <a href="/legal/privacy" className="px-4 py-3 flex items-center gap-3 hover:bg-surface-elevated/50 transition-colors">
                    <Shield className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-medium flex-1">Política de Privacidad</span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                </a>
            </div>

            {/* Medical disclaimer */}
            <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400/70 leading-relaxed">
                ⚠️ <strong className="text-yellow-400">Aviso Legal:</strong> PeptideTracker es una herramienta de registro personal. No constituye consejo médico. Consulta siempre a un profesional de salud calificado antes de iniciar cualquier protocolo.
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/5 border border-red-400/10 hover:border-red-400/30 transition-all text-sm font-medium">
                <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
        </div>
    );
}
