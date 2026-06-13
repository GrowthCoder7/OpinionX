import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function useSupabase(){
    const [supabase, setSupabase] = useState(createClient("https://hytmxwtnjcflubdchlg.supabase.com","sb_publishable_gXjBN33DrRZLEWQBUbLZKA_GtjJ2pE_"))
    return supabase
}