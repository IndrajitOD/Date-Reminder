import mongoose from 'mongoose';

const eventSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Either subscribed to an individual event or an entire global category
    subscriptionType: {
      type: String,
      enum: ['event', 'category'],
      required: true
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GlobalEvent',
      default: null,
      index: true
    },
    categoryName: {
      type: String,
      default: '',
      index: true
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

eventSubscriptionSchema.index({ userId: 1, subscriptionType: 1, eventId: 1, categoryName: 1 }, { unique: true });

export const EventSubscription = mongoose.model('EventSubscription', eventSubscriptionSchema);
