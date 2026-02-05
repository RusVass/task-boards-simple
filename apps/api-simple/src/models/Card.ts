import { Schema, model, Types } from 'mongoose';
import { CARD_STATUSES, type CardStatus } from '../constants/cards';

type CardDoc = {
  boardId: Types.ObjectId;
  column: CardStatus;
  order: number;
  title: string;
  description?: string;
};

const cardSchema = new Schema<CardDoc>(
  {
    boardId: { type: Schema.Types.ObjectId, required: true, index: true },
    column: { type: String, required: true, enum: CARD_STATUSES, index: true },
    order: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Card = model('Card', cardSchema);
