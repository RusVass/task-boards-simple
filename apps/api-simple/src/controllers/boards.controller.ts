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

export const createBoard = async (req: Request, res: Response) => {
  const name = requireString(req.body?.name, 'name');

  const board = await Board.create({ name });

  res.status(201).json({
    publicId: board._id,
    name: board.name,
  });
};

export const getBoard = async (req: Request, res: Response) => {
  const boardId = requireObjectId(req.params.boardId, 'boardId');

  const board = await Board.findById(boardId).lean();
  if (!board) throw new HttpError(404, 'Board not found');

  const cards = await Card.find({ boardId })
    .sort({ column: 1, order: 1, _id: 1 })
    .lean();

  res.json({
    board: { publicId: board._id, name: board.name },
    cards: cards.map((c) => ({
      _id: c._id,
      boardId: c.boardId,
      column: c.column,
      order: c.order,
      title: c.title,
      description: c.description ?? '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  });
};

export const updateBoard = async (req: Request, res: Response) => {
  const boardId = requireObjectId(req.params.boardId, 'boardId');
  const name = requireString(req.body?.name, 'name');

  const board = await Board.findByIdAndUpdate(boardId, { name }, { new: true }).lean();
  if (!board) throw new HttpError(404, 'Board not found');

  res.json({ publicId: board._id, name: board.name });
};

export const deleteBoard = async (req: Request, res: Response) => {
  const boardId = requireObjectId(req.params.boardId, 'boardId');

  const deleted = await Board.findByIdAndDelete(boardId).lean();
  if (!deleted) throw new HttpError(404, 'Board not found');

  await Card.deleteMany({ boardId });

  res.status(204).send();
};

export const boardsValidation = {
  requireObjectId,
  requireString,
};
