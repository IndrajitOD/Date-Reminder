import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    profilePicture: {
      type: String,
      default: ''
    },
    authProvider: {
      type: String,
      default: 'password' // 'password', 'google.com', etc.
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'MMM DD, YYYY'
    },
    timeFormat: {
      type: String,
      default: '12h'
    },
    defaultCalendarView: {
      type: String,
      enum: ['month', 'week', 'day', 'year'],
      default: 'month'
    },
    country: {
      type: String,
      default: 'Global'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for backward compatibility
userSchema.virtual('firebaseUid').get(function () {
  return this.firebaseUID;
});

export const User = mongoose.model('User', userSchema);
