// models/Contact.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  phone: string; // Changed to string to handle international numbers
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String, // Changed to String
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.Contact || mongoose.model<IContact>("Contact", ContactSchema);