import type { Request,Response,NextFunction } from "express";
import {createClient} from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient('https://jijdjcucfoeyfmuvusbm.supabase.co',process.env.SUPABASE_SECRET_KEY!)


export default async function middleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers.authorization;
    try {
        const {data:{user},error} = await supabase.auth.getUser(token)
        const address = user?.user_metadata.custom_claims.address

        if(address){
            req.userId = address
            next()
        }else{
            res.status(403).json({
                msg:"Incorrect Credentials"
            })
        }
    } catch (error) {
        res.status(403).json({
                msg:"Incorrect Credentials"
            })
    }
}