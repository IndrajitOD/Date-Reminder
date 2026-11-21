import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PersonalReminder',
      default: null
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
      required: true,
      index: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered', 'failed', 'cancelled', 'suppressed'],
      default: 'pending',
      index: true
    },
    failureReason: {
      type: String,
      default: ''
    },
    retryCount: {
      type: Number,
      default: 0
    },
    maxRetries: {
      type: Number,
      default: 3
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

notificationLogSchema.index({ userId: 1, deliveryStatus: 1, createdAt: -1 });

export const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);
