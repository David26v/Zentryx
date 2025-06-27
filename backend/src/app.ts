import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import calendarRoutes from './routes/calendar';
import path from 'path';
import cors from 'cors'; 

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'],  
  credentials:true,
}));



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/calendar',calendarRoutes);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

export default app;