import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Card } from '../models/Card';
import { createCardSchema, reorderCardsSchema, updateCardSchema } from '../validation/cards.schema';
import { HttpError } from '../utils/httpError';
import { findBoardByPublicId, parseBoardPublicId } from '../utils/boardLookup';
import { ensureFound } from '../utils/ensureFound';
import { stripUndefined } from '../utils/updates';

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
  const updateData = stripUndefined(data);

  const card = await Card.findOneAndUpdate(
    { _id: cardId, boardId: board._id },
    updateData,
    { new: true },
  ).lean();

  const updated = ensureFound(card, 'Card not found');

  res.json({
    _id: updated._id,
    boardId: board.publicId,
    column: updated.column,
    order: updated.order,
    title: updated.title,
    description: updated.description ?? '',
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
};

export const deleteCard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const cardId = requireObjectId(req.params.cardId, 'cardId');
  const board = await findBoardByPublicId(boardId);

  const deleted = await Card.findOneAndDelete({ _id: cardId, boardId: board._id }).lean();
  ensureFound(deleted, 'Card not found');

  res.status(204).send();
};

export const reorderCards = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const board = await findBoardByPublicId(boardId);

  const data = reorderCardsSchema.parse(req.body);
  const seenCardIds = new Set<string>();
  const columnOrder = new Map<typeof data.items[number]['column'], number>();
  const ops = data.items.map((item) => {
    const cardId = requireObjectId(item.cardId, 'cardId');
    if (seenCardIds.has(cardId)) {
      throw new HttpError(400, 'cardId must be unique');
    }
    seenCardIds.add(cardId);

    const nextOrder = columnOrder.get(item.column) ?? 0;
    columnOrder.set(item.column, nextOrder + 1);

    return {
      updateOne: {
        filter: { _id: cardId, boardId: board._id },
        update: { column: item.column, order: nextOrder },
      },
    };
  });

  if (ops.length > 0) {
    await Card.bulkWrite(ops, { ordered: false });
  }

  res.json({ status: 'ok' });
};
