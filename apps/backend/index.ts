import 'dotenv/config'; 

import { log } from 'console';
import express from 'express';
import cors from 'cors';
import middleware from './middleware.js';
import {prisma} from "db"
import { CreateOrderSchema, type OrderBook } from './types.js';
import 'dotenv/config'
import {uuid} from "uuidv4"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.post('/buy',middleware,async(req, res) => {
    const {success,data} = CreateOrderSchema.safeParse(req.body);
    if(!success){
        return res.status(403).json({msg:"Invalid request!"})
    }
    
    const userId:string = req.userId;

    await prisma.$transaction(async(tx)=>{
        //locking
        const response = await tx.$queryRaw<{yesOrderBook:string,noOrderBook:string,mid:string,totalQty:number}[]>`SELECT * FROM "Markets" WHERE mid=${data.marketId} FOR UPDATE;`
        const userResponse = await tx.$queryRaw<{id:string,address:string,usdBalance:number}[]>`SELECT * FROM "Users" WHERE id=${userId} FOR UPDATE;`
        // const postionsResponse = await tx.$queryRaw<{}[]>`SELECT * FROM "Postions" WHERE mid=${data.marketId} AND id=${userId} FOR UPDATE;`
        
        const market = response[0];
        if(!market) return res.send("Market ilwa anna")
        console.log(market)

        const user = userResponse[0]
        if(!user) return res.send('Invalid user!')
        console.log(user)

        const yesOrderBook:OrderBook = JSON.parse(market.yesOrderBook);
        const noOrderBook:OrderBook = JSON.parse(market.noOrderBook);

        let leftQty = data.qty

        if(data.side=='yes' && data.type=='buy'){
            const total = data.qty * data.price
            if((userResponse[0]?.usdBalance!)<total){
                res.status(403).send("Insufficient balance")
            }

            //Sorting prices view
            const prices = Object.keys(yesOrderBook).sort((a:string,b:string)=>Number(a)-Number(b))
            await Promise.all(prices.map(async price=>{
                if(Number(price)>data.price) return;
                const {availableQty,orders} = yesOrderBook[price]!
                
                //Order matching
                await Promise.all(orders.map(async order=>{
                        const matchedQty = Math.min(availableQty,leftQty);
                        const reverseOrder=order.reverseOrder
                        
                        if(!reverseOrder){
                            await prisma.positions.update({
                                where:
                                {
                                    userId_marketId_type:{
                                        userId:order.userId,
                                        marketId:data.marketId,
                                        type:'Yes'
                                    }
                                },
                                data:{
                                    qty:{
                                        decrement:matchedQty
                                    }
                                }
                            })

                            await prisma.users.update({
                                where:{
                                    id:order.userId
                                },
                                data:{
                                    usdBalance:{
                                        increment: Number(price)*matchedQty
                                    }
                                }
                            })
                        }else{
                            await prisma.positions.update({
                                where:
                                {
                                    userId_marketId_type:{
                                        userId:order.userId,
                                        marketId:data.marketId,
                                        type:'No'
                                    }
                                },
                                data:{
                                    qty:{
                                        increment:matchedQty
                                    }
                                }
                            })

                            await prisma.users.update({
                                where:{
                                    id:order.userId
                                },
                                data:{
                                    usdBalance:{
                                        decrement: (100-Number(price))*matchedQty
                                    }
                                }
                            })
                        }

                        await prisma.positions.update({
                            where:
                            {
                                userId_marketId_type:{
                                    userId,
                                    marketId:data.marketId,
                                    type:'Yes'
                                }
                            },
                            data:{
                                qty:{
                                    increment:matchedQty
                                }
                            }
                        })

                        await prisma.users.update({
                            where:{
                                id:userId
                            },
                            data:{
                                usdBalance:{
                                    decrement:Number(price)*matchedQty
                                }
                            }
                        })
                        leftQty-=matchedQty;
                        order.filledQty+=matchedQty
                        yesOrderBook[price]!.availableQty-=matchedQty
                }))
            }))
            if(leftQty){
                const oppositePrice = 100-data.price
                if(!noOrderBook[oppositePrice]){
                    noOrderBook[oppositePrice] = {
                        availableQty:0,
                        orders:[]
                    }
                    noOrderBook[oppositePrice]!.availableQty += leftQty;
                    // noOrderBook[oppositePrice]!.orders.push({qty:leftQty,userId,filledQty:0,originalOrderId:uuid(),reverseOrder:true}) //trying to buy a yes stock but as not available , ends hypothetically selling no stocks (which they don't own)
                    noOrderBook[oppositePrice]!.orders.push({qty:leftQty,userId,filledQty:0,originalOrderId:uuid(),reverseOrder})
                }
            }

        }

        if(data.side=='yes' && data.type=='sell'){
            const buyPrice = 100-data.price

            //Ensuring if user has enough yes positions
            const userPositions = await prisma.positions.findFirst({
                where:{
                    userId,
                    marketId:data.marketId,
                    type:'Yes'
                }
            })

            if(!userPositions || userPositions?.qty<data.qty)
                    return;
            
            let leftQty = data.qty;

            const prices = Object.keys(noOrderBook).sort((a:string,b:string)=>Number(a)-Number(b))
            await Promise.all(prices.map(async price=>{
                if(Number(price)>buyPrice) return;
                const {availableQty,orders} = noOrderBook[price]!
                
                //Order matching
                await Promise.all(orders.map(async order=>{
                        const matchedQty = Math.min(availableQty,leftQty);
                        const reverseOrder=order.reverseOrder
                        
                        if(!reverseOrder){
                            await prisma.positions.update({
                                where:
                                {
                                    userId_marketId_type:{
                                        userId:order.userId,
                                        marketId:data.marketId,
                                        type:'No'
                                    }
                                },
                                data:{
                                    qty:{
                                        decrement:matchedQty
                                    }
                                }
                            })

                            await prisma.users.update({
                                where:{
                                    id:order.userId
                                },
                                data:{
                                    usdBalance:{
                                        increment: Number(price)*matchedQty
                                    }
                                }
                            })
                        }else{
                            await prisma.positions.update({
                                where:
                                {
                                    userId_marketId_type:{
                                        userId:order.userId,
                                        marketId:data.marketId,
                                        type:'Yes'
                                    }
                                },
                                data:{
                                    qty:{
                                        increment:matchedQty
                                    }
                                }
                            })

                            await prisma.users.update({
                                where:{
                                    id:order.userId
                                },
                                data:{
                                    usdBalance:{
                                        decrement: (100-Number(price))*matchedQty
                                    }
                                }
                            })
                        }

                        await prisma.positions.update({
                            where:
                            {
                                userId_marketId_type:{
                                    userId,
                                    marketId:data.marketId,
                                    type:'Yes'
                                }
                            },
                            data:{
                                qty:{
                                    decrement:matchedQty
                                }
                            }
                        })

                        await prisma.users.update({
                            where:{
                                id:userId
                            },
                            data:{
                                usdBalance:{
                                    increment:Number(price)*matchedQty
                                }
                            }
                        })
                        leftQty-=matchedQty;
                        order.filledQty+=matchedQty
                        noOrderBook[price]!.availableQty-=matchedQty
                }))
            }))
            if(leftQty){
                const oppositePrice = 100-data.price
                if(!yesOrderBook[oppositePrice]){
                    yesOrderBook[oppositePrice] = {
                        availableQty:0,
                        orders:[]
                    }
                    yesOrderBook[oppositePrice]!.availableQty += leftQty;
                    // yesOrderBook[oppositePrice]!.orders.push({qty:leftQty,userId,filledQty:0,originalOrderId:uuid(),reverseOrder:true}) //trying to buy a yes stock but as not available , ends hypothetically selling no stocks (which they don't own)
                    yesOrderBook[oppositePrice]!.orders.push({qty:leftQty,userId,filledQty:0,originalOrderId:uuid(),reverseOrder})
                }
            }
        }

        await tx.markets.update({
            data:{
                yesOrderBook:JSON.stringify(yesOrderBook),
                noOrderBook:JSON.stringify(noOrderBook)
            },
            where:{
                mid:data.marketId
            }
        })
    })

    return res.send("Hello")
});

app.post('/split', middleware, (req, res) => { 
    
});

app.post('/merge', middleware, (req, res) => { 
    
});

app.get('/balance', middleware, (req, res) => { 
    res.json({msg:"Hi"})
 });

app.get('/history', middleware, (req, res) => { 
    
});

app.get('/positions', middleware, (req, res) => { 
    
 });

app.listen(PORT, () => {
    log(`Server running at port ${PORT}`);
});