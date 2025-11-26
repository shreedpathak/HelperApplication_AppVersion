// models/JobTiming.js
import mongoose from 'mongoose';

const jobTimingSchema = new mongoose.Schema({
  daysAvailable: [String], // e.g. ['Monday', 'Wednesday']
  timeSlots: [String]      // e.g. ['9:00AM-12:00PM', '2:00PM-6:00PM']
});

export default mongoose.model('JobTiming', jobTimingSchema);
