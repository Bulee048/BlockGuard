import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  };
  role: 'resident' | 'moderator' | 'admin' | 'authority';
  reputation: number;
  badges: string[];
  isVerified: boolean;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      zipCode: { type: String },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    role: { 
      type: String, 
      enum: ['resident', 'moderator', 'admin', 'authority'], 
      default: 'resident' 
    },
    reputation: { type: Number, default: 0 },
    badges: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    lastActive: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
