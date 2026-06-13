import { useEffect, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"

export default function useUser(supabase: SupabaseClient) {  // accept it
    const [claims, setClaims] = useState(null)
    // remove useSupabase() — use the passed-in client
    useEffect(() => {
        supabase.auth.getClaims().then(({ data }) => {
    setClaims(data?.claims ?? null)
})
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            supabase.auth.getClaims().then(({ data }) => {
    setClaims(data?.claims ?? null)
})
        })
        return () => subscription.unsubscribe()
    }, [supabase])

    return { claims }
}