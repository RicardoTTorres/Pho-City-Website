import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import cookieParser from 'cookie-parser';
import contactRoutes from './routes/contactRoutes.js';
import adminContactRoutes from './routes/adminContactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,   
  credentials: true          
}));

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/admin/contact', adminContactRoutes);
app.use('/api/admin', authRoutes);  

// Root test route
app.get('/', (req, res) => {
  res.send('Hi from server!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});