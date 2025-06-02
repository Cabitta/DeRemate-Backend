import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  active: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  verificationCodeExpires: { type: Date, default: null },
  refreshToken: { type: String, default: null },
  refreshTokenExpires: { type: Date, default: null },
});

export default mongoose.model("Delivery", deliverySchema);
