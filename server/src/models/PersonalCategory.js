import mongoose from 'mongoose';

const personalCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      default: 'Tag'
    },
    color: {
      type: String,
      default: '#e11d48'
    },
    isDefaultSuggestion: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

personalCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const PersonalCategory = mongoose.model('PersonalCategory', personalCategorySchema);
