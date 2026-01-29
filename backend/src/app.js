import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import cpInfoRoutes from './routes/cpInfo.routes.js';
import profileRoutes from './routes/profile.route.js';
import runRoutes from "./routes/run.routes.js";
import differentialTestRoutes from "./routes/differentialTest.routes.js";
import ragRoutes from "./routes/rag.routes.js";

const app = express();

// CORS setup for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For now, allow all origins (tighten later)
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: "OK", 
    message: "CP Helper Backend is running! 🚀",
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

// Routes
app.use("/api", runRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cpinfo", cpInfoRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/differential", differentialTestRoutes);
app.use("/api/rag", ragRoutes);

export default app;