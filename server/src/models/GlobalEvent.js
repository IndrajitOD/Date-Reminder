import mongoose from 'mongoose';

const globalEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD or MM-DD
      required: true,
      index: true
    },
    primaryCategory: {
      type: String,
      required: true,
      enum: [
        'Celebrations & Festivals',
        'Love & Relationships',
        'National & Public Holidays',
        'International & Awareness Days',
        'Historical & Memorial Days',
        'Famous Personalities',
        'Education & Career',
        'Sports & Entertainment',
        'Fun & Unusual Days'
      ],
      index: true
    },
    subCategory: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: 'Global',
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    historicalContext: {
      type: String,
      default: ''
    },
    isVariableDate: {
      type: Boolean,
      default: false
    },
    recurrenceInfo: {
      type: String,
      default: 'Annual'
    }
  },
  {
    timestamps: true
  }
);

globalEventSchema.index({ primaryCategory: 1, country: 1 });

export const GlobalEvent = mongoose.model('GlobalEvent', globalEventSchema);
