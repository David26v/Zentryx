import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'user';


export interface IUser extends Document {
  username: string; 
  email: string;
  password: string;
  role: UserRole;
  resetToken?: string;
  resetTokenExpiry?: number;
  first_name:string;
  last_name:string;
  avatar?: string;
  active?:boolean;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  resetToken: { type: String },
  resetTokenExpiry: { type: Number },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  avatar: { type: String, default: '' }, 
  active:{type:Boolean , default:false}
});

export default mongoose.model<IUser>('User', userSchema);
