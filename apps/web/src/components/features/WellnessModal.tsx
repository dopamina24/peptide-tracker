"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Save } from "lucide-react";

export function WellnessModal({ onClose, onSuccess, initialData }: { onClose: () => void; onSuccess: () => void; initialData?: any }) {
    const [weight, setWeight] = useState(initialData?.weight_kg || "");
    const [calories, setCalories] = useState(initialData?.calories || "");
    const [mood, setMood] = useState<number | null>(initialData?.mood_rating || null);
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    const handleSubmit = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split("T")[0];

        const payload: any = {
            user_id: user.id,
            logged_date: today,
            weight_kg: weight ? parseFloat(weight) : null,
            calories: calories ? parseInt(calories) : null,
            mood_rating: mood,
            notes: notes || null,
        };

        // Upsert wellness log
        const { error } = await supabase.from("wellness_logs").upsert(payload, { onConflict: "user_id,logged_date" });

        if (weight) {
            // Also update profile weight
            await supabase.from("profiles").update({ weight_kg: parseFloat(weight) }).eq("id", user.id);
        }

        setLoading(false);
        onSuccess();
    };

    const MOODS = [
        { val: 1, label: "Pésimo", emoji: "😫" },
        { val: 2, label: "Mal", emoji: "🙁" },
        { val: 3, label: "Normal", emoji: "😐" },
        { val: 4, label: "Bien", emoji: "🙂" },
        { val: 5, label: "Excelente", emoji: "🤩" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm px-4 items-center">
            <div className="w-full max-w-sm bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <span className="text-white font-semibold text-[17px]">Registro Diario</span>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto">
                    {/* Mood Selector */}
                    <div>
                        <label className="block text-[13px] text-white/50 uppercase tracking-wider font-semibold mb-3">¿Cómo te sientes hoy?</label>
                        <div className="flex justify-between gap-1">
                            {MOODS.map((m) => (
                                <button
                                    key={m.val}
                                    onClick={() => setMood(m.val)}
                                    className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl transition-all
                                        ${mood === m.val ? "bg-white/10 scale-110" : "hover:bg-white/5 opacity-50 hover:opacity-100"}`}
                                >
                                    <span className="text-2xl">{m.emoji}</span>
                                </button>
                            ))}
                        </div>
                        <div className="text-center text-xs text-white/40 mt-2 h-4 font-medium">
                            {mood ? MOODS.find(m => m.val === mood)?.label : "Selecciona una opción"}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Weight */}
                        <div>
                            <label className="block text-[13px] text-white/50 uppercase tracking-wider font-semibold mb-2">Peso (kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                placeholder="Ej. 75.5"
                                className="w-full bg-white/5 rounded-xl px-3 py-3 text-white placeholder:text-white/20 outline-none focus:bg-white/10 transition-colors text-lg font-medium"
                            />
                        </div>

                        {/* Calories */}
                        <div>
                            <label className="block text-[13px] text-white/50 uppercase tracking-wider font-semibold mb-2">Calorías</label>
                            <input
                                type="number"
                                value={calories}
                                onChange={e => setCalories(e.target.value)}
                                placeholder="Ej. 2500"
                                className="w-full bg-white/5 rounded-xl px-3 py-3 text-white placeholder:text-white/20 outline-none focus:bg-white/10 transition-colors text-lg font-medium"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-[13px] text-white/50 uppercase tracking-wider font-semibold mb-2">Notas / Síntomas</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Detalles opcionales..."
                            rows={2}
                            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:bg-white/10 transition-colors resize-none text-[15px]"
                        />
                    </div>
                </div>

                <div className="p-5 pt-2 border-t border-white/5">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#0A84FF] hover:bg-[#0070e0] active:scale-[0.98] transition-all rounded-xl py-3.5 text-white font-semibold text-[17px] flex items-center justify-center gap-2"
                    >
                        {loading ? "Guardando..." : "Guardar Registro"}
                    </button>
                </div>
            </div>
        </div>
    );
}
