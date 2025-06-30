import { createServerClient } from "@supabase/ssr"
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { cookies } from "next/headers"

export async function createClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                async get(name: string) {
                    return (await cookies()).get(name)?.value
                },
                async set(name: string, value: string, options: unknown) {
                    ;(await cookies()).set(
                        name,
                        value,
                        options as Partial<ResponseCookie>
                    )
                },
                async remove(name: string, options: unknown) {
                    ;(await cookies()).set(name, "", {
                        ...(options || {}),
                        maxAge: 0,
                    })
                },
            },
        }
    )
}
