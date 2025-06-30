import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
    try {
        // Create a response object that we'll update with new headers
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: any) {
                        request.cookies.set({
                            name,
                            value: "",
                            ...options,
                        })
                        response.cookies.set({
                            name,
                            value: "",
                            ...options,
                        })
                    },
                },
            }
        )

        // Refresh session if expired - required for Server Components
        const {
            data: { session },
        } = await supabase.auth.getSession()

        // Define protected and public paths
        const isAuthPath = request.nextUrl.pathname.startsWith("/auth")
        const isPublicPath = request.nextUrl.pathname === "/"
        const isCallbackPath =
            request.nextUrl.pathname.includes("/auth/callback")
        const isOAuthPath = request.nextUrl.pathname.includes("/auth/oauth")

        // Allow all auth-related paths to proceed without redirect
        if (isAuthPath || isCallbackPath || isOAuthPath) {
            return response
        }

        // If no session and trying to access protected route, redirect to login
        if (!session && !isPublicPath) {
            const redirectUrl = new URL("/auth/login", request.url)
            redirectUrl.searchParams.set("next", request.nextUrl.pathname)
            return NextResponse.redirect(redirectUrl)
        }

        // If we have a session but we're on the login page, redirect to home
        if (session && request.nextUrl.pathname === "/auth/login") {
            return NextResponse.redirect(new URL("/", request.url))
        }

        return response
    } catch (error) {
        console.error("Middleware error:", error)
        // On error, proceed with the request rather than breaking the flow
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}
