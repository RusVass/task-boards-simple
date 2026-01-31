import { Schema, model } from 'mongoose';

type BoardDoc = {
  publicId: string;
  name: string;
};

const boardSchema = new Schema<BoardDoc>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Board = model('Board', boardSchema);
