import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IComment {
  userId: mongoose.Types.ObjectId | IUser;
  text: string;
  createdAt: Date;
}

export interface IReport extends Document {
  title: string;
  description?: string;
  category: 'Crime' | 'Suspicious Activity' | 'Pothole' | 'Streetlight Out' | 'Garbage' | 'Stray Animal' | 'Water Leak' | 'Noise Complaint' | 'Emergency';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Verified' | 'In Progress' | 'Resolved' | 'Dismissed';
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
  address?: string;
  mediaUrls: string[];
  reportedBy: mongoose.Types.ObjectId | IUser;
  verifiedBy?: mongoose.Types.ObjectId | IUser;
  assignedTo?: mongoose.Types.ObjectId | IUser;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  comments: IComment[];
  views: number;
  resolvedAt?: Date;
  resolutionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['Crime', 'Suspicious Activity', 'Pothole', 'Streetlight Out', 'Garbage', 'Stray Animal', 'Water Leak', 'Noise Complaint', 'Emergency'],
      required: true
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'In Progress', 'Resolved', 'Dismissed'],
      default: 'Pending'
    },
    location: {
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
    address: { type: String },
    mediaUrls: [{ type: String }],
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    views: { type: Number, default: 0 },
    resolvedAt: { type: Date },
    resolutionNote: { type: String }
  },
  { timestamps: true }
);

// Indexes
ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({ status: 1 });
ReportSchema.index({ category: 1 });
ReportSchema.index({ severity: 1 });

export default mongoose.model<IReport>('Report', ReportSchema);
