import { Schema, model, Types } from 'mongoose';

type CardDoc = {
  boardId: Types.ObjectId;
  column: 'todo' | 'in_progress' | 'done';
  order: number;
  title: string;
  description?: string;
};

const cardSchema = new Schema<CardDoc>(
  {
    boardId: { type: Schema.Types.ObjectId, required: true, index: true },
    column: { type: String, required: true, enum: ['todo', 'in_progress', 'done'], index: true },
    order: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Card = model('Card', cardSchema);
