import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  title: string;
  body: string;
  type: 'report_update' | 'alert' | 'badge_earned' | 'comment';
  relatedId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['report_update', 'alert', 'badge_earned', 'comment'],
      required: true
    },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
