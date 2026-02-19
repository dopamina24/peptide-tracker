import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createServerClient<any>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setAll(cookiesToSet: any[]) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: any }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );
}
