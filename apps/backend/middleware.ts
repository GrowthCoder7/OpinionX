import type { Request,Response,NextFunction } from "express";
import {createClient} from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { prisma } from "db";
dotenv.config()

const supabase = createClient('https://jijdjcucfoeyfmuvusbm.supabase.co',process.env.SUPABASE_SECRET_KEY!)


export default async function middleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers.authorization;
    try {
        const {data:{user},error} = await supabase.auth.getUser(token)
        const address = user?.user_metadata.custom_claims.address
        const userDb = await prisma.users.upsert({
            where:{
                address
            },
            update:{
                address
            },
            create:{
                address,
                usdBalance:0
            }
        })

        if(address){
            req.userId = userDb.id
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