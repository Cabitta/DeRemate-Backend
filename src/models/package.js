import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    qr: String,
    sector: String,
    estante: Number,
    columna_estante: Number
});

export default mongoose.model('Package', packageSchema);
