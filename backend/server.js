import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menuRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url, "Origin:", req.get("Origin"));
  next();
});

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(cors({
  origin: FRONTEND_ORIGIN,   
  credentials: true          
}));

app.use(express.json());
app.use(cookieParser());




// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/about', aboutRoutes);

// Root test route
app.get('/', (req, res) => {
  res.send('Hi from server!');
});

app.use('/api/admin', authRoutes);  

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});