import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Delivery',
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  body: { 
    type: String, 
    required: true 
  },
  data: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'delivered'],
    default: 'pending'
  }
}, {
  timestamps: true 
});

export default mongoose.model('Notification', notificationSchema);
