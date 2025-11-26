// models/Audit.js
import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changeDate: { type: Date, default: Date.now },
  fieldChanged: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed
});

export default mongoose.model('Audit', auditSchema);
