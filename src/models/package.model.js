import { Schema, model } from "mongoose";

const packageSchema = new Schema(
  {
    qr: {
      // tambien se puede almacenar la url de la imagen del qr. Elijan lo que prefieran
      data: Buffer,
      contentType: String,
    },
    sector: {
      type: String,
    },
    estante: {
      type: String,
    },
    columnaEstante: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Package = model("Package", packageSchema);
