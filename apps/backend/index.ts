import 'dotenv/config'; 

import { log } from 'console';
import express from 'express';
import cors from 'cors';
import middleware from './middleware.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.post('/buy', middleware, (req, res) => { 
    res.json({msg:"Hi"})
});

app.post('/sell', middleware, (req, res) => { 
    
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