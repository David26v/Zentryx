import mongoose, { Schema, Document } from "mongoose";

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  category?: "personal" | "business" | "family" | "holiday" | "etc";
  userId: string;
  isAllDay?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema(
  {
    title: { 
        type: String, 
        required: true 
    },
    description: {
        type: String 
    },
    start_date: { 
        type: Date, 
        required: true 
    },
    end_date: { 
        type: Date, 
        required: true 
    },
    category: {
      type: String,
      enum: ["personal", "business", "family", "holiday", "etc"],
      default: "personal",
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: "User" 
    },
    isAllDay: { 
        type: Boolean, 
        default: false 
    },
  },
  { timestamps: 
    true 
  }
);

export default mongoose.model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);
