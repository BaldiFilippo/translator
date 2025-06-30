import { supabase } from "../supabaseClient"
import { AuthError } from "../types"

export class AuthService {
    /**
     * Sign in with GitHub OAuth
     * @param redirectTo - URL to redirect to after successful authentication
     */
    static async signInWithGithub(
        redirectTo: string
    ): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: { redirectTo },
            })

            if (error) throw error

            return { error: null }
        } catch (error) {
            console.error("Auth error:", error)
            return {
                error: {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Authentication failed",
                    code: "auth/github-signin-failed",
                },
            }
        }
    }

    /**
     * Sign out the current user
     */
    static async signOut(): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            return { error: null }
        } catch (error) {
            console.error("Sign out error:", error)
            return {
                error: {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Sign out failed",
                    code: "auth/signout-failed",
                },
            }
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
            console.error("Get session error:", error)
            return {
                session: null,
                error: {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to get session",
                    code: "auth/get-session-failed",
                },
            }
        }
    }

    /**
     * Exchange the OAuth code for a session
     */
    static async exchangeCodeForSession(code: string) {
        try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(
                code
            )
            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error("Code exchange error:", error)
            return {
                data: null,
                error: {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to exchange code",
                    code: "auth/code-exchange-failed",
                },
            }
        }
    }
}
