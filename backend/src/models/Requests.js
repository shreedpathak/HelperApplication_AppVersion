import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
helperUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    },
neederUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    },
reqTitle: {
    type: String,
    required: true
},
reqDescription: {
    type: String,
    required: true
  },
status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending',
    required: true
},
reqStartTiming: {
    type: Date, 
    required: true
},
reqEndTiming: {
    type: Date,
    required: true
},
priceType: {
    type: String,
    enum: ['fixed', 'hourly', 'negotiable'],
    default: 'negotiable'
}
}, { timestamps: true }); // ✅ adds createdAt and updatedAt

export default mongoose.model('Requests', requestSchema);
