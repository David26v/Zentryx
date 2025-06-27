import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string; 
  description?: string;
}

const RoleSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  status :{
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  }
});

export default mongoose.model<IRole>("Role", RoleSchema);
