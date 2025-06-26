"use client"

import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SignInPage() {
    const supabase = createClientComponentClient()

    const getURL = () => {
        let url =
            process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
            process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
            "http://localhost:3000/"
        // Make sure to include `https://` when not localhost.
        url = url.includes("http") ? url : `https://${url}`
        // Make sure to include a trailing `/`.
        url = url.charAt(url.length - 1) === "/" ? url : `${url}/`
        return url
    }

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div>
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={["github", "google"]}
                    redirectTo={getURL()}
                    socialLayout="horizontal"
                />
            </div>
        </div>
    )
}
