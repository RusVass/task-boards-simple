import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Board } from '../models/Board';
import { Card } from '../models/Card';
import { HttpError } from '../utils/httpError';

const requireString = (value: unknown, field: string) => {
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string`);
  const v = value.trim();
  if (!v) throw new HttpError(400, `${field} is required`);
  return v;
};

const requireObjectId = (value: string, field: string) => {
  if (!mongoose.isValidObjectId(value)) throw new HttpError(400, `${field} is invalid`);
  return value;
};

export const createCard = async (req: Request, res: Response) => {
  const boardId = requireObjectId(req.params.boardId, 'boardId');

  const board = await Board.findById(boardId).lean();
  if (!board) throw new HttpError(404, 'Board not found');

  const title = requireString(req.body?.title, 'title');
  const description = typeof req.body?.description === 'string' ? req.body.description : '';
  const column = req.body?.column;

  if (column !== 'todo' && column !== 'in_progress' && column !== 'done') {
    throw new HttpError(400, 'column must be todo, in_progress, or done');
  }

  const last = await Card.findOne({ boardId, column }).sort({ order: -1 }).lean();
  const order = last ? last.order + 1 : 0;

  const card = await Card.create({ boardId, column, order, title, description });

  res.status(201).json({
    _id: card._id,
    boardId: card.boardId,
    column: card.column,
    order: card.order,
    title: card.title,
    description: card.description ?? '',
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  });
};

export const updateCard = async (req: Request, res: Response) => {
  const boardId = requireObjectId(req.params.boardId, 'boardId');
  const cardId = requireObjectId(req.params.cardId, 'cardId');

  const title = requireString(req.body?.title, 'title');
  const description = typeof req.body?.description === 'string' ? req.body.description : '';

  const card = await Card.findOneAndUpdate(
    { _id: cardId, boardId },
    { title, description },
    { new: true },
  ).lean();

  if (!card) throw new HttpError(404, 'Card not found');

  res.json({
    _id: card._id,
    boardId: card.boardId,
    column: card.column,
    order: card.order,
    title: card.title,
    description: card.description ?? '',
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  });
};

export const deleteCard = async (req: Request, res: Response) => {
  const boardId = requireObjectId(req.params.boardId, 'boardId');
  const cardId = requireObjectId(req.params.cardId, 'cardId');

  const deleted = await Card.findOneAndDelete({ _id: cardId, boardId }).lean();
  if (!deleted) throw new HttpError(404, 'Card not found');

  res.status(204).send();
};

export const reorderCards = async (req: Request, res: Response) => {
  const boardId = requireObjectId(req.params.boardId, 'boardId');

  const items = req.body?.items;
  if (!Array.isArray(items)) throw new HttpError(400, 'items must be an array');

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const cardId = requireObjectId(item?.cardId, 'cardId');
    const column = item?.column;

    if (column !== 'todo' && column !== 'in_progress' && column !== 'done') {
      throw new HttpError(400, 'column must be todo, in_progress, or done');
    }

    await Card.updateOne(
      { _id: cardId, boardId },
      { column, order: i },
    );
  }

  res.json({ status: 'ok' });
};
