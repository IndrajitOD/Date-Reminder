import mongoose from 'mongoose';

const globalCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'Sparkles'
    },
    eventCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const GlobalCategory = mongoose.model('GlobalCategory', globalCategorySchema);
