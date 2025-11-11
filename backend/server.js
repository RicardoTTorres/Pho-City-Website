<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import contactRoutes from './routes/contactRoutes.js';
import adminContactRoutes from './routes/adminContactRoutes.js';

import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menuRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Logs all requests for debugging purposes
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url, "Origin:", req.get("Origin"));
  next();
});

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
app.use('/api/menu', menuRoutes);
app.use('/api/about', aboutRoutes);

// Root test route
app.get('/', (req, res) => {
  res.send('Hi from server!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
=======
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import contactRoutes from './routes/contactRoutes.js';
import adminContactRoutes from './routes/adminContactRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js' // -> add import statement

import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menuRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Logs all requests for debugging purposes
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url, "Origin:", req.get("Origin"));
  next();
});

app.use(express.json());
app.use(cookieParser());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,   
  credentials: true          
}));

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes); // -> new route
app.use('/api/admin/contact', adminContactRoutes);
app.use('/api/admin', authRoutes);  
app.use('/api/menu', menuRoutes);
app.use('/api/about', aboutRoutes);

// Root test route
app.get('/', (req, res) => {
  res.send('Hi from server!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
>>>>>>> 23d6ac4144cfb95b457a2a6381ff61a8d4836915
});