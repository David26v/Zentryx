import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendEmail } from '../utils/sendEmail'; 

export const register = async (req: Request, res: Response) => {
  const { username, email, password, role,first_name ,last_name} = req.body;

  try {

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Username, email, password, and role are required' });
    }
  

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role, 
    });

    await newUser.save();

    // Generate token on register (optional)
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      token
    });

  } 
  catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;

  // Check if the input is an email or username
  const isEmail = usernameOrEmail.includes("@");
  
  const query = isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail };
  
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Username/Email and Password are required' });
  }

  // Find user by email or username
  const user = await User.findOne(query);

  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  res.json({ token, role: user.role ,username:user.username});
};


export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; 
  await user.save();

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await sendEmail(email, 'Reset Your Password', `Click <a href="${resetLink}">here</a> to reset your password.`);

  res.json({ message: 'Password reset link sent' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Password has been reset' });
};


export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, usernameOrEmail } = req.body;

  if (!currentPassword || !newPassword || !usernameOrEmail) {
    return res.status(400).json({ message: 'Current password, new password, and username/email are required' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!); 

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } 
  catch (error: any) {
    console.error('Error changing password:', error);
  
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }
  
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
  
};

