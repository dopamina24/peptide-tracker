import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // next can be passed via query param from OAuth redirect, else default to dashboard
    const requestedNext = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if user has completed onboarding (has a profile with goals set)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("experience_level, goals")
                    .eq("id", user.id)
                    .single();

                // New user: no profile, no goals set → send to onboarding
                const isNewUser = !profile || (!profile.experience_level && (!profile.goals || profile.goals.length === 0));
                const next = isNewUser ? "/onboarding" : requestedNext;

                return NextResponse.redirect(`${origin}${next}`);
            }
            return NextResponse.redirect(`${origin}${requestedNext}`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth`);
}
