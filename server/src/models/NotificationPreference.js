import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    // Master switch suppresses all notifications when false
    masterEnabled: {
      type: Boolean,
      default: true
    },
    globalEventsEnabled: {
      type: Boolean,
      default: true
    },
    personalRemindersEnabled: {
      type: Boolean,
      default: true
    },
    uncategorizedRemindersEnabled: {
      type: Boolean,
      default: true
    },
    disabledPersonalCategoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PersonalCategory'
    }],
    channels: {
      email: {
        enabled: { type: Boolean, default: true },
        address: { type: String, default: '' },
        verified: { type: Boolean, default: true }
      },
      push: {
        enabled: { type: Boolean, default: true },
        endpoint: { type: String, default: '' },
        keys: { type: mongoose.Schema.Types.Mixed, default: {} }
      },
      whatsapp: {
        enabled: { type: Boolean, default: false },
        phoneNumber: { type: String, default: '' },
        verified: { type: Boolean, default: false }
      }
    },
    defaultAdvanceDays: {
      type: [Number],
      default: [3]
    },
    digestTime: {
      type: String,
      default: '09:00'
    }
  },
  {
    timestamps: true
  }
);

export const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);
