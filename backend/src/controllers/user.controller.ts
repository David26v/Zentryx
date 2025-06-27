import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/sendEmail'; 
import mongoose from 'mongoose';


import { GridFSBucket } from "mongodb";

interface GridFsFile extends Express.Multer.File {
  id: string;
}

export const getUserRole = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    // Check if the input is an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

    let user;

    if (isEmail) {
      user = await User.findOne({ email: username }).select('role');
    } 
    else {
      user = await User.findOne({ username }).select('role');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ role: user.role });
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const changeUserInfo = async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, first_name, last_name, role, avatar } = req.body;

    if (!usernameOrEmail) {
      return res.status(400).json({ message: "usernameOrEmail is required" });
    }

    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role && ['admin', 'user', 'viewer'].includes(role)) {
      user.role = role;
    }
    user.avatar = avatar || user.avatar;

    await user.save();

    res.status(200).json({ message: "User info updated successfully", user });
  } 
  catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const getUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    const user = isEmail
      ? await User.findOne({ email: username }).select('-password')
      : await User.findOne({ username }).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: user_id });

    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Server error' });
  }
}


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password -resetToken -resetTokenExpiry');

    const transformedUsers = users.map(user => ({
      user_id : user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      plan: "Enterprise", 
      billing: "Auto Debit", 
      status: user.role === 'admin' ? 'Active' : user.role === 'viewer' ? 'Pending' : 'Inactive'
    }));

    
    res.status(200).json({ users: transformedUsers });
  } 
  catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export const UserCreate = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      first_name,
      last_name,
      role = 'user',
      avatar = ''
    } = req.body;

    if (!username || !email || !first_name || !last_name) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    // Step 1: Create user with a dummy password to get _id
    const dummyPassword = 'init';
    const newUser = new User({
      username,
      email,
      password: dummyPassword,
      first_name,
      last_name,
      role,
      avatar
    });

    await newUser.save();

    // Step 2: Generate real password (username + last 6 chars of ObjectId)
    const defaultPassword = `${username}${newUser.id.toString().slice(-6)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Step 3: Update password with the hashed one
    newUser.password = hashedPassword;
    await newUser.save();

    // Step 4: Send password via email
    const subject = 'Welcome to the platform - Your login credentials';
    const html = `
      <p>Hello ${first_name},</p>
      <p>Your account has been created successfully. Here are your credentials:</p>
      <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Password:</strong> ${defaultPassword}</li>
      </ul>
      <p>Please change your password after logging in.</p>
    `;

    await sendEmail(email, subject, html);

    return res.status(201).json({
      message: 'User account created successfully. Password has been sent to the email.',
      user: {
        id: newUser.id,
        username,
        email,
        role,
        first_name,
        last_name,
        avatar
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const UserDetail = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid MongoDB ObjectId" });
    }

    const user = await User.findById(user_id).select(
      "-password -resetToken -resetTokenExpiry"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar:
        user.avatar ||
        `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}`,
      active: user.active,
    };

    return res.status(200).json({ user: profile });
  } catch (error) {
    console.error("Error retrieving user detail:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const changeUserDetailInfo = async (req: Request, res: Response) => {
  try {
    const { user_id, first_name, last_name, role, active, avatar, username } = req.body

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required." })
    }

    const user = await User.findById(user_id)

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    if (first_name !== undefined) user.first_name = first_name
    if (last_name !== undefined) user.last_name = last_name
    if (role !== undefined) user.role = role
    if (active !== undefined) user.active = active
    if (avatar !== undefined) user.avatar = avatar
    if (username !== undefined) user.username = username

    await user.save()

    return res.status(200).json({ message: "User info updated successfully.", user })
  } catch (error) {
    console.error("Error updating user:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}


export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!req.file || !username) {
      return res.status(400).json({ message: "Missing avatar or username." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const file = req.file as any;

    if (!file.id) {
      return res.status(500).json({ message: "Upload failed: Missing file ID." });
    }

    try {
      if (!mongoose.connection.db) {
        throw new Error('MongoDB connection not established');
      }

      await mongoose.connection.db.collection('avatars.files').updateOne(
        { _id: file.id },
        { 
          $set: { 
            'metadata.username': username,
            'metadata.updatedAt': new Date()
          } 
        }
      );
    } catch (metadataError) {
      // Continue even if metadata update fails
    }

    const avatarUrl = `${req.protocol}://${req.get("host")}/api/users/avatar/${file.id}`;

    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      avatarUrl,
      fileId: file.id,
      filename: file.filename,
      message: "Avatar uploaded successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAvatar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'avatars'
    });

    const objectId = new mongoose.Types.ObjectId(id);

    const files = await bucket.find({ _id: objectId }).toArray();
    
    if (files.length === 0) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    const file = files[0];

    res.set('Content-Type', file.metadata?.mimetype || 'image/png');
    res.set('Content-Length', file.length.toString());

    const downloadStream = bucket.openDownloadStream(objectId);
    
    downloadStream.on('error', () => {
      res.status(500).json({ message: 'Error retrieving avatar' });
    });

    downloadStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  }
};




