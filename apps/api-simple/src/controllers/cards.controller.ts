import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Card } from '../models/Card';
import {
  createCardSchema,
  reorderCardsSchema,
  updateCardSchema,
} from '../validation/cards.schema';
import { HttpError } from '../utils/httpError';
import { findBoardByPublicId, parseBoardPublicId } from '../utils/boardLookup';

const requireObjectId = (value: string, field: string) => {
  if (!mongoose.isValidObjectId(value)) throw new HttpError(400, `${field} is invalid`);
  return value;
};

export const createCard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const board = await findBoardByPublicId(boardId);

  const data = createCardSchema.parse(req.body);
  const description = data.description ?? '';

  const last = await Card.findOne({ boardId: board._id, column: data.column })
    .sort({ order: -1 })
    .lean();
  const order = last ? last.order + 1 : 0;

  const card = await Card.create({
    boardId: board._id,
    column: data.column,
    order,
    title: data.title,
    description,
  });

  res.status(201).json({
    _id: card._id,
    boardId: board.publicId,
    column: card.column,
    order: card.order,
    title: card.title,
    description: card.description ?? '',
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  });
};

export const updateCard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const cardId = requireObjectId(req.params.cardId, 'cardId');
  const board = await findBoardByPublicId(boardId);

  const data = updateCardSchema.parse(req.body);
  const updateData: { title?: string; description?: string } = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;

  const card = await Card.findOneAndUpdate(
    { _id: cardId, boardId: board._id },
    updateData,
    { new: true },
  ).lean();

  if (!card) throw new HttpError(404, 'Card not found');

  res.json({
    _id: card._id,
    boardId: board.publicId,
    column: card.column,
    order: card.order,
    title: card.title,
    description: card.description ?? '',
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  });
};

export const deleteCard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const cardId = requireObjectId(req.params.cardId, 'cardId');
  const board = await findBoardByPublicId(boardId);

  const deleted = await Card.findOneAndDelete({ _id: cardId, boardId: board._id }).lean();
  if (!deleted) throw new HttpError(404, 'Card not found');

  res.status(204).send();
};

export const reorderCards = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const board = await findBoardByPublicId(boardId);

  const data = reorderCardsSchema.parse(req.body);

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const cardId = requireObjectId(item.cardId, 'cardId');

    await Card.updateOne(
      { _id: cardId, boardId: board._id },
      { column: item.column, order: i },
    );
  }

  res.json({ status: 'ok' });
};
