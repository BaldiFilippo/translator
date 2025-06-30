"use client"

import { supabase } from "@/lib/supabaseClient.js"
import { Button } from "@/components/ui/button.jsx"
import { useRouter } from "next/navigation"

export function LogoutButton() {
    const router = useRouter()

    const logout = async () => {
        await supabase.auth.signOut()
        router.push("/auth/login")
    }

    return <Button onClick={logout}>Logout</Button>
}
