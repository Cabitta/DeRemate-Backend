import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String
});

export default mongoose.model('Delivery', deliverySchema);
