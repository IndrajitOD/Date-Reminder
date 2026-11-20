import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    eventName: {
      type: String,
      required: true
    },
    source: {
      type: String,
      enum: ['personal', 'global'],
      required: true
    },
    channel: {
      type: String,
      enum: ['email', 'push', 'whatsapp'],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered', 'failed', 'suppressed'],
      default: 'pending',
      index: true
    },
    failureReason: {
      type: String,
      default: ''
    },
    deliveredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);
