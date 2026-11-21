import mongoose from 'mongoose';

const personalReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    personName: {
      type: String,
      trim: true,
      default: ''
    },
    eventDate: {
      type: String, // Format YYYY-MM-DD or MM-DD for recurring without year
      required: true,
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PersonalCategory',
      default: null, // Null indicates "Uncategorized"
      index: true
    },
    categoryName: {
      type: String,
      default: 'Uncategorized'
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'],
      default: 'yearly'
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal',
      index: true
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    reminderSchedules: {
      type: [Number], // e.g. [0, 1, 3, 7] days before
      default: [3]
    },
    notificationChannels: {
      type: [String], // ['email', 'push', 'whatsapp']
      default: ['email']
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

personalReminderSchema.index({ userId: 1, eventDate: 1 });
personalReminderSchema.index({ userId: 1, isArchived: 1, isCompleted: 1 });

export const PersonalReminder = mongoose.model('PersonalReminder', personalReminderSchema);
