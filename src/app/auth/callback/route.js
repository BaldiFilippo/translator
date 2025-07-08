import { createClient } from "@/lib/supabase/server.js"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        const requestUrl = new URL(request.url)
        const code = requestUrl.searchParams.get("code")

        if (!code) {
            throw new Error("No code provided")
        }

        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            throw error
        }

        return NextResponse.redirect(new URL("/", requestUrl.origin))
    } catch (error) {
        // Get the origin for the error redirect
        const origin = new URL(request.url).origin
        const errorUrl = new URL("/auth/error", origin)

        // Add error message to URL if available
        if (error instanceof Error) {
            errorUrl.searchParams.set("error", error.message)
        }

        return NextResponse.redirect(errorUrl)
    }
}
