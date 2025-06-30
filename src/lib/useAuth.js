import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient.js"

export function useAuth() {
    const [authState, setAuthState] = useState({
        user: null,
        loading: true,
        error: null,
    })

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const user = session?.user ?? null
                setAuthState({ user, loading: false, error: null })
            }
        )

        return () => {
            authListener?.subscription.unsubscribe()
        }
    }, [])

    return authState
}
