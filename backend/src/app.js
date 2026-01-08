import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import cpInfoRoutes from './routes/cpInfo.routes.js';
import profileRoutes from './routes/profile.route.js';
import runRoutes from "./routes/run.routes.js";
import differentialTestRoutes from "./routes/differentialTest.routes.js";



const app= express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "10mb" })); // Increased limit for large code submissions
app.use("/api", runRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/cpinfo",cpInfoRoutes);
app.use("/api/profile",profileRoutes);
app.use("/api/differential", differentialTestRoutes);


// for test 
app.get('/',(req,res)=>
{
    // res.send('Hello World!');
    res.json({ status: "OK", message: "Backend is running" });
});


export default app;