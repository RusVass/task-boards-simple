import type { Request, Response } from 'express';
import { Board } from '../models/Board';
import { Card } from '../models/Card';
import { createBoardSchema, updateBoardSchema } from '../validation/boards.schema';
import { HttpError } from '../utils/httpError';
import { createUniqueBoardPublicId, findBoardByPublicId, parseBoardPublicId } from '../utils/boardLookup';

export const createBoard = async (req: Request, res: Response) => {
  const data = createBoardSchema.parse(req.body);

  const publicId = await createUniqueBoardPublicId();
  const board = await Board.create({ publicId, name: data.name });

  res.status(201).json({
    publicId: board.publicId,
    name: board.name,
  });
};

export const getBoard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const board = await findBoardByPublicId(boardId);

  const cards = await Card.find({ boardId: board._id })
    .sort({ column: 1, order: 1, _id: 1 })
    .lean();

  res.json({
    board: { publicId: board.publicId, name: board.name },
    cards: cards.map((c) => ({
      _id: c._id,
      boardId: board.publicId,
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
  const boardId = parseBoardPublicId(req.params.boardId);
  const data = updateBoardSchema.parse(req.body);

  const board = await Board.findOneAndUpdate(
    { publicId: boardId },
    { name: data.name },
    { new: true },
  ).lean();
  if (!board) throw new HttpError(404, 'Board not found');

  res.json({ publicId: board.publicId, name: board.name });
};

export const deleteBoard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);

  const deleted = await Board.findOneAndDelete({ publicId: boardId }).lean();
  if (!deleted) throw new HttpError(404, 'Board not found');

  await Card.deleteMany({ boardId: deleted._id });

  res.status(204).send();
};

