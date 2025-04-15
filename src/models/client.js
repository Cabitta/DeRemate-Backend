import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String
});

export default mongoose.model('Client', clientSchema);
