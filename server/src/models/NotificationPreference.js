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
      type: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false }
      },
      default: () => ({ email: true, push: true, whatsapp: false })
    },
    // Granular personal categories: Map of categoryId string -> { email: boolean, push: boolean, whatsapp: boolean }
    personalCategoryPreferences: {
      type: Map,
      of: new mongoose.Schema({
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false }
      }, { _id: false }),
      default: new Map()
    },
    // Granular global categories: Map of globalCategorySlug or ID -> { email: boolean, push: boolean, whatsapp: boolean }
    globalCategoryPreferences: {
      type: Map,
      of: new mongoose.Schema({
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false }
      }, { _id: false }),
      default: new Map()
    },
    // Keep backward-compatible array of disabled IDs
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
        verified: { type: Boolean, default: false },
        optInConsent: { type: Boolean, default: false },
        consentTimestamp: { type: Date, default: null },
        status: {
          type: String,
          enum: ['Not Connected', 'Verification Required', 'Connected', 'Connection Error', 'Coming Soon'],
          default: 'Coming Soon'
        }
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
