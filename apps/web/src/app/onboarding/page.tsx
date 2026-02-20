"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Target, Zap, Shield, TrendingDown, Brain, Dumbbell, ChevronRight, ChevronLeft, Check } from "lucide-react";

const GOALS = [
    { id: "fitness", label: "Fitness & Rendimiento", icon: Dumbbell },
    { id: "longevity", label: "Longevidad", icon: Shield },
    { id: "fat_loss", label: "Pérdida de Grasa", icon: TrendingDown },
    { id: "recovery", label: "Recuperación", icon: Zap },
    { id: "cognitive", label: "Función Cognitiva", icon: Brain },
    { id: "general", label: "Bienestar General", icon: Target },
];

const EXPERIENCE = [
    {
        id: "beginner",
        label: "Principiante",
        desc: "Primera vez. Necesito ayuda con cálculos, reconstitución y dosis básicas."
    },
    {
        id: "intermediate",
        label: "Intermedio",
        desc: "Entiendo cómo reconstituir y medir unidades, pero busco seguimiento."
    },
    {
        id: "advanced",
        label: "Avanzado",
        desc: "Conozco protocolos complejos, stacks y ajustes precisos de dosis."
    },
];

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [experience, setExperience] = useState("");
    const [weight, setWeight] = useState("");
    const [age, setAge] = useState("");
    const [sex, setSex] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const toggleGoal = (id: string) => {
        setSelectedGoals(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const handleFinish = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Pick up display name from social OAuth metadata or existing profile
            const metaName =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.user_metadata?.display_name ||
                null;

            const { error } = await supabase.from("profiles").upsert({
                id: user.id,
                username: metaName,
                goals: selectedGoals,
                experience_level: experience,
                weight_kg: weight ? parseFloat(weight) : null,
                starting_weight_kg: weight ? parseFloat(weight) : null, // Set starting weight too!
                age: age ? parseInt(age) : null,
                sex: sex || null,
                preferred_locale: "es",
                updated_at: new Date().toISOString(),
            }, { onConflict: "id", ignoreDuplicates: false });

            if (error) {
                console.error("Error saving profile:", error);
                toast.error("Hubo un error al guardar tu perfil.");
                setLoading(false);
                return;
            }
        }
        toast.success("¡Perfil configurado! Bienvenido a PeptideTracker 🧬");
        router.push("/dashboard");
        setLoading(false);
    };


    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-glow/10 rounded-full blur-3xl" />
            </div>
            <div className="w-full max-w-lg animate-fade-in">
                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-brand-electric" : "bg-surface-elevated"}`} />
                    ))}
                </div>

                {step === 0 && (
                    <div className="space-y-6 animate-slide-up">
                        <div>
                            <h2 className="text-2xl font-bold">¿Cuáles son tus objetivos?</h2>
                            <p className="text-white/50 mt-1">Esto nos ayuda a sugerirte protocolos relevantes.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {GOALS.map(({ id, label, icon: Icon }) => (
                                <button key={id} onClick={() => toggleGoal(id)}
                                    className={`glass-card p-4 flex flex-col items-start gap-2 transition-all duration-200 active:scale-95
                    ${selectedGoals.includes(id) ? "border-brand-electric/50 bg-brand-electric/10" : "hover:border-white/20"}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${selectedGoals.includes(id) ? "bg-brand-electric/20" : "bg-surface-elevated"}`}>
                                        <Icon className={`w-4 h-4 ${selectedGoals.includes(id) ? "text-brand-electric" : "text-white/40"}`} />
                                    </div>
                                    <span className={`text-sm font-medium leading-tight ${selectedGoals.includes(id) ? "text-white" : "text-white/70"}`}>{label}</span>
                                    {selectedGoals.includes(id) && <Check className="w-3 h-3 text-brand-electric absolute top-3 right-3" />}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} disabled={selectedGoals.length === 0}
                            className="btn-primary w-full flex items-center justify-center gap-2">
                            Continuar <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6 animate-slide-up">
                        <div>
                            <h2 className="text-2xl font-bold">Tu experiencia</h2>
                            <p className="text-white/50 mt-1">Para adaptar el lenguaje y las recomendaciones.</p>
                        </div>
                        <div className="space-y-3">
                            {EXPERIENCE.map(({ id, label, desc }) => (
                                <button key={id} onClick={() => setExperience(id)}
                                    className={`glass-card p-4 w-full flex items-center gap-4 transition-all duration-200 active:scale-[0.98]
                    ${experience === id ? "border-brand-electric/50 bg-brand-electric/10" : "hover:border-white/20"}`}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${experience === id ? "border-brand-electric" : "border-surface-border"}`}>
                                        {experience === id && <div className="w-2.5 h-2.5 rounded-full bg-brand-electric" />}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-white">{label}</div>
                                        <div className="text-sm text-white/50 leading-snug">{desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(0)} className="btn-ghost flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4" /> Atrás
                            </button>
                            <button onClick={() => setStep(2)} disabled={!experience} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                Continuar <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-slide-up">
                        <div>
                            <h2 className="text-2xl font-bold">Datos opcionales</h2>
                            <p className="text-white/50 mt-1">Para personalizar tus recomendaciones de dosis</p>
                        </div>
                        <div className="glass-card p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white/70 block mb-1.5">Peso (kg)</label>
                                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                                        className="input-field" placeholder="Ej. 75" min="30" max="300" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/70 block mb-1.5">Edad</label>
                                    <input type="number" value={age} onChange={e => setAge(e.target.value)}
                                        className="input-field" placeholder="Ei. 35" min="18" max="100" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white/70 block mb-1.5">Sexo biológico</label>
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
                        <p className="text-xs text-white/30 text-center">Estos datos son opcionales y se almacenan de forma privada</p>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4" /> Atrás
                            </button>
                            <button onClick={handleFinish} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                    <><span>Finalizar</span> <Zap className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
