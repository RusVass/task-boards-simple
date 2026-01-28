import { Schema, model, type InferSchemaType } from 'mongoose';

export const CARD_COLUMNS = ['todo', 'in_progress', 'done'] as const;
export type CardColumn = (typeof CARD_COLUMNS)[number];

const cardSchema = new Schema(
  {
    boardId: {
      type: String,
      required: true,
      index: true,
    },
    column: {
      type: String,
      required: true,
      enum: CARD_COLUMNS,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

export type Card = InferSchemaType<typeof cardSchema>;
export const CardModel = model<Card>('Card', cardSchema);
