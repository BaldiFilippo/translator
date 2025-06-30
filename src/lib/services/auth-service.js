import { supabase } from "../supabaseClient"

function handleAuthError(error, defaultMessage, code) {
    console.error("Auth error:", error)
    return {
        error: {
            message: error instanceof Error ? error.message : defaultMessage,
            code: code,
        },
    }
}

export class AuthService {
    /**
     * Sign in with GitHub OAuth
     * @param redirectTo - URL to redirect to after successful authentication
     */
    static async signInWithGithub(
        redirectTo
    ) {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: { redirectTo },
            })

            if (error) throw error

            return { error: null }
        } catch (error) {
            return handleAuthError(error, "Authentication failed", "auth/github-signin-failed")
        }
    }

    /**
     * Sign out the current user
     */
    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            return { error: null }
        } catch (error) {
            return handleAuthError(error, "Sign out failed", "auth/signout-failed")
        }
    }

    /**
     * Get the current session
     */
    static async getSession() {
        try {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession()
            if (error) throw error

            return { session, error: null }
        } catch (error) {
            return handleAuthError(error, "Failed to get session", "auth/get-session-failed")
        }
    }

    /**
     * Exchange the OAuth code for a session
     */
    static async exchangeCodeForSession(code) {
        try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(
                code
            )
            if (error) throw error

            return { data, error: null }
        } catch (error) {
            return handleAuthError(error, "Failed to exchange code", "auth/code-exchange-failed")
        }
    }
}
