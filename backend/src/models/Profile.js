import mongoose from 'mongoose';
import { skillSchema } from './Skill.js'; // ✅ import schema, not model

const profileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true 
  },
  designation: String,
  experience: Number,
  skills: [
    {
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true,
      },
      skillName: {
        type: String,
        required: true,
      },
    }
  ],
  area: {
    city: String,
    address: String,
    landark: String,
    region: String,
    state: String,
    country: String,
    pincode: String
  },
  rating: {
    rating: Number,
    feedback: String,
    comments: String,
  },
  jobTiming: {
    daysAvailable: [String],
    timeSlots: [String],
  },
  isProfileCompleted: {
    type: Boolean,
    default: false,
  },
  hourlyRate: Number,
}, { timestamps: true }); // ✅ adds createdAt and updatedAt

export default mongoose.model('Profile', profileSchema);
