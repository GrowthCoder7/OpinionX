import { useState } from "react"
// import useSupabase from "./hooks/useSupabase"
import useUser from "./hooks/useUser"
import {createClient, type SupabaseClient} from '@supabase/supabase-js'
import axios from "axios"

const App = () => {
  const[supabase,_setSupabase]=useState(createClient("https://jijdjcucfoeyfmuvusbm.supabase.co","sb_publishable_s2yyzFTpeslSAkg_yAspLw_ZFbmXj6k"))
  return <AppWrapper supabase={supabase}/>
}

function AppWrapper({supabase}:{supabase:SupabaseClient}){
  const {claims} = useUser(supabase)
  return (
  <div>
    {/* Sign in via Web3 using Supabase support */}
    {!claims && <button onClick={async()=>{
      await supabase.auth.signInWithWeb3({
        chain:'solana',
        statement:'I accept the Terms of Service at Prediction Market',
        // wallet:window.solflare
      })
    }}>
      Sign In
    </button>}
    {claims && <button onClick={async ()=>{
      await supabase.auth.signOut()
    }}>
        Log Out
      </button>}

      {JSON.stringify(claims)}

      <button onClick={async()=>{
        await supabase.auth.getSession().then(r=>{
          console.log(r.data.session?.access_token)
          axios.post('http://localhost:3000/buy',{},{
            headers:{
              Authorization:r.data.session?.access_token
            }
          })
        })
      }}>Buy stocks</button>
  </div>
  )
}

export default App