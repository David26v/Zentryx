import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await User.deleteMany({});

  const users = [
    { email: 'admin@test.com', password: 'admin123', role: 'admin' },
    { email: 'tech@test.com', password: 'tech123', role: 'user' },
    { email: 'client@test.com', password: 'client123', role: 'viewer' },
  ];

  for (const user of users) {
    user.password = await bcrypt.hash(user.password, 10);
    await new User(user).save();
  }

  console.log('✅ Seed completed');
  process.exit();
};

seed();
