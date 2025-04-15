import { Schema, model } from "mongoose";

const routeSchema = new Schema(
  {
    state: {
      type: String,
      required: true,
      enum: ["pending", "inProgress", "completed"],
      default: "pending",
    },
    adress: {
      type: String,
      required: true,
    },
    initDateTime: {
      type: Date,
      default: Date.now,
    },
    endDateTime: {
      type: Date,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    packages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Package",
        required: true,
      },
    ],
    deliveryMan: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryMan",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Route = model("Route", routeSchema);
