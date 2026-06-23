import {z} from "zod"

export const CreateOrderSchema = z.object({
    marketId : z.string(),
    side:z.enum(["yes",'no']),
    type:z.enum(['buy','sell']),
    qty:z.number(),
    price:z.number(),
    // userId:z.string()
})

export type OrderBook = {[key:string]:{
    availableQty:number,
    orders:{
        userId:string,
        qty:number,
        filledQty:number,
        originalOrderId:string,
        reverseOrder:boolean
    }[]
}}
//reverseOrder indicates whether the person was actually for eg. trying to buy a yes or just didn't find enough no so have to get yes.