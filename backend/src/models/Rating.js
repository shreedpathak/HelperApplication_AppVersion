// models/Rating.js
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5 },
  feedback: String,
  comments: String,
  givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Rating', ratingSchema);
