// Supabase types — auto-generated or hand-maintained
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    public: {
        Tables: {
            peptides: {
                Row: {
                    id: string;
                    slug: string;
                    name_es: string;
                    name_en: string;
                    description_es: string;
                    description_en: string;
                    routes: string[];
                    typical_dose_min: number;
                    typical_dose_max: number;
                    dose_unit: string;
                    half_life_hours: number | null;
                    reconstitution_notes_es: string | null;
                    side_effects_es: string | null;
                    tags: string[];
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['peptides']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['peptides']['Insert']>;
            };
            profiles: {
                Row: {
                    id: string;
                    username: string | null;
                    weight_kg: number | null;
                    age: number | null;
                    sex: string | null;
                    goals: string[];
                    experience_level: string | null;
                    preferred_locale: string;
                    dark_mode: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
            };
            protocols: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    is_active: boolean;
                    start_date: string | null;
                    end_date: string | null;
                    cycle_on_weeks: number | null;
                    cycle_off_weeks: number | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['protocols']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['protocols']['Insert']>;
            };
            protocol_items: {
                Row: {
                    id: string;
                    protocol_id: string;
                    peptide_id: string;
                    custom_name: string | null;
                    dose_amount: number;
                    dose_unit: string;
                    route: string;
                    frequency_type: string;
                    frequency_days: number[];
                    preferred_time: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['protocol_items']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['protocol_items']['Insert']>;
            };
            dose_logs: {
                Row: {
                    id: string;
                    user_id: string;
                    protocol_item_id: string | null;
                    peptide_id: string;
                    logged_at: string;
                    dose_amount: number;
                    dose_unit: string;
                    route: string;
                    injection_site: string | null;
                    lot_number: string | null;
                    provider: string | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['dose_logs']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['dose_logs']['Insert']>;
            };
            vials: {
                Row: {
                    id: string;
                    user_id: string;
                    peptide_id: string;
                    custom_name: string | null;
                    amount_mg: number;
                    provider: string | null;
                    purchased_at: string | null;
                    reconstituted_at: string | null;
                    expires_at: string | null;
                    bac_water_ml: number | null;
                    remaining_mg: number;
                    is_active: boolean;
                    notes: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['vials']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['vials']['Insert']>;
            };
            wellness_logs: {
                Row: {
                    id: string;
                    user_id: string;
                    logged_date: string;
                    sleep_quality: number | null;
                    energy_level: number | null;
                    mood: number | null;
                    weight_kg: number | null;
                    side_effects: string[];
                    notes: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['wellness_logs']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['wellness_logs']['Insert']>;
            };
        };
    };
};

// Convenient row types
export type Peptide = Database['public']['Tables']['peptides']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Protocol = Database['public']['Tables']['protocols']['Row'];
export type ProtocolItem = Database['public']['Tables']['protocol_items']['Row'];
export type DoseLog = Database['public']['Tables']['dose_logs']['Row'];
export type Vial = Database['public']['Tables']['vials']['Row'];
export type WellnessLog = Database['public']['Tables']['wellness_logs']['Row'];

export type ProtocolWithItems = Protocol & {
    protocol_items: (ProtocolItem & { peptides: Peptide })[];
};

export type DoseLogWithPeptide = DoseLog & { peptides: Peptide };
