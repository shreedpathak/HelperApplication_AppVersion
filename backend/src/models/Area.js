// models/Area.js
import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  country: String,
  state: String,
  city: String,
  region: String,
  pincode: String
});

export default mongoose.model('Area', areaSchema);
