import { NextResponse } from "next/server"
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server.js"

export async function GET(request) {
    try {
        const requestUrl = new URL(request.url)
        const code = requestUrl.searchParams.get("code")

        if (!code) {
            throw new Error("No code provided")
        }

        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error("Auth error:", error)
            throw error
        }

        if (!data.session) {
            throw new Error("No session returned")
        }

        // Get the host and construct the base URL
        const host =
            request.headers.get("x-forwarded-host") ||
            request.headers.get("host")
        if (!host) {
            throw new Error("No host header found")
        }

        const protocol =
            process.env.NODE_ENV === "development" ? "http" : "https"
        const baseUrl = `${protocol}://${host}`

        // Create response with redirect to home
        const response = NextResponse.redirect(`${baseUrl}/`)

        return response
    } catch (error) {
        console.error("OAuth error:", error)

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
