import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

const app= express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);

// for test 
app.get('/',(req,res)=>
{
    // res.send('Hello World!');
    res.json({ status: "OK", message: "Backend is running" });
});


export default app;