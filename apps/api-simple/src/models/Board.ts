import { Schema, model } from 'mongoose';

type BoardDoc = {
  name: string;
};

const boardSchema = new Schema<BoardDoc>(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Board = model('Board', boardSchema);
