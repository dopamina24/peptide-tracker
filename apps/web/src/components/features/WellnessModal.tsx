"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Save } from "lucide-react";

export function WellnessModal({ onClose, onSuccess, initialData }: { onClose: () => void; onSuccess: () => void; initialData?: any }) {
    const [weight, setWeight] = useState(initialData?.weight_kg || "");
    const [calories, setCalories] = useState(initialData?.calories || "");
    const [protein, setProtein] = useState(initialData?.water_ml || ""); // Using water_ml as temp field or add protein col? assuming using notes or generic
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [sideEffects, setSideEffects] = useState<string[]>([]);
    const [newSideEffect, setNewSideEffect] = useState("");
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

    return (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm px-4 items-center">
            <div className="w-full max-w-sm bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <span className="text-white font-semibold text-[17px]">Registro Diario</span>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto">
                    {/* Weight */}
                    <div>
                        <label className="block text-[13px] text-white/50 uppercase tracking-wider font-semibold mb-2">Peso (kg)</label>
                        <input
                            type="number"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            placeholder="Ej. 75.5"
                            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:bg-white/10 transition-colors text-lg font-medium"
                        />
                    </div>

                    {/* Calories */}
                    <div>
                        <label className="block text-[13px] text-white/50 uppercase tracking-wider font-semibold mb-2">Calorías (kcal)</label>
                        <input
                            type="number"
                            value={calories}
                            onChange={e => setCalories(e.target.value)}
                            placeholder="Ej. 2500"
                            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:bg-white/10 transition-colors text-lg font-medium"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-[13px] text-white/50 uppercase tracking-wider font-semibold mb-2">Notas / Efectos</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="¿Cómo te sientes hoy?"
                            rows={3}
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
