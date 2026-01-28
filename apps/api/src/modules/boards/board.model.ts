import { Schema, model, type InferSchemaType } from 'mongoose';

const boardSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  },
);

export type Board = InferSchemaType<typeof boardSchema>;
export const BoardModel = model<Board>('Board', boardSchema);
