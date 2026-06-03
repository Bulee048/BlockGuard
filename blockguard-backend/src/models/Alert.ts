import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IAlert extends Document {
  title: string;
  message: string;
  type: 'Emergency' | 'Warning' | 'Info';
  radius: number;
  center: {
    type: 'Point';
    coordinates: number[];
  };
  targetRoles: ('resident' | 'moderator' | 'admin' | 'authority')[];
  sentBy: mongoose.Types.ObjectId | IUser;
  expiresAt: Date;
  createdAt: Date;
}

const AlertSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['Emergency', 'Warning', 'Info'],
      required: true
    },
    radius: { type: Number, required: true }, // in meters
    center: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    targetRoles: [{
      type: String,
      enum: ['resident', 'moderator', 'admin', 'authority']
    }],
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AlertSchema.index({ center: '2dsphere' });
// Optionally, automatically remove alerts when they expire using a TTL index
AlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IAlert>('Alert', AlertSchema);
