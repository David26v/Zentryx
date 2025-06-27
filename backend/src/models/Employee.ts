// models/Employee.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  first_name:string;
  last_name: string;
  role: mongoose.Types.ObjectId; 
  position: string;
  department: string;
  status: "active" | "resigned" | "terminated" | "on-leave";
  salary: number;
  leave_balance: number;
  date_hired: Date;
  time_in_logs: Date[];
  time_out_logs: Date[];
  created: Date;
  update_at: Date;
  password: string;
}

const EmployeeSchema: Schema = new Schema(
  {   
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
     first_name:{
      type: String,
      required: true,
     },
    last_name: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "resigned", "terminated", "on-leave"],
      default: "active",
    },
    salary: {
      type: Number,
      default: 0,
    },
    leave_balance: {
      type: Number,
      default: 0,
    },
    date_hired: {
      type: Date,
      default: Date.now,
    },
    time_in_logs: {
      type: [Date],
      default: [],
    },
    time_out_logs: {
      type: [Date],
      default: [],
    },
    date_created :{
      type: Date,
      default: Date.now,
    },
    created_by:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    update_at: {
      type: Date,
      default: Date.now,
    },
    update_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sent_email:{
      type: Boolean,
      default: false,
    },
    password:{
      type: String,
      required: true,
      select: false, 
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEmployee>("Employee", EmployeeSchema);
