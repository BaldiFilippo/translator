import { createClient } from "@/lib/supabase/server.js"
import { NextResponse } from "next/server"

export async function GET(request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(new URL("/", requestUrl.origin))
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
}
