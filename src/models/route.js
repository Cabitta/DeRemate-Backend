import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    enum: ["in_transit", "pending", "delivered", "cancelled"],
  },
  address: String,
  init_date_time: { type: Date, default: Date.now },
  end_date_time: { type: Date },
  delivery: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
  confirmationCode: {
    type: String,
    default: null,
    maxlength: 6,
    minlength: 6,
  },
  confirmationCodeExpiry: {
    type: Date,
    default: null,
  },
  confirmationCodeUsed: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Route", routeSchema);
