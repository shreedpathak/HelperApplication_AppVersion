import mongoose from 'mongoose';

export const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // This references the 'Category' model
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

export default mongoose.model('Skill', skillSchema);
