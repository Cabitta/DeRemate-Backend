import { Schema, model } from "mongoose";

const deliverySchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    passwordId: {
      // ? que es
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Delivery = model("Delivery", deliverySchema);
