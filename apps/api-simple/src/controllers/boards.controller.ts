import type { Request, Response } from 'express';
import { Board } from '../models/Board';
import { Card } from '../models/Card';
import { createBoardSchema, updateBoardSchema } from '../validation/boards.schema';
import { createUniqueBoardPublicId, findBoardByPublicId, parseBoardPublicId } from '../utils/boardLookup';
import { ensureFound } from '../utils/ensureFound';
import { CARD_SORT, serializeBoard, serializeBoardDetails } from '../utils/boardSerializer';

export const createBoard = async (req: Request, res: Response) => {
  const data = createBoardSchema.parse(req.body);

  const publicId = await createUniqueBoardPublicId();
  const board = await Board.create({ publicId, name: data.name });

  res.status(201).json(serializeBoard({ publicId: board.publicId, name: board.name }));
};

export const getBoard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const boardPromise = findBoardByPublicId(boardId);
  const cardsPromise = boardPromise.then((board) =>
    Card.find({ boardId: board._id }).sort(CARD_SORT).lean(),
  );
  const [board, cards] = await Promise.all([boardPromise, cardsPromise]);

  res.json(serializeBoardDetails(board, cards));
};

export const updateBoard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);
  const data = updateBoardSchema.parse(req.body);

  const board = await Board.findOneAndUpdate(
    { publicId: boardId },
    { name: data.name },
    { new: true },
  ).lean();

  const updated = ensureFound(board, 'Board not found');
  res.json(serializeBoard(updated));
};

export const deleteBoard = async (req: Request, res: Response) => {
  const boardId = parseBoardPublicId(req.params.boardId);

  const deleted = await Board.findOneAndDelete({ publicId: boardId }).lean();
  const removed = ensureFound(deleted, 'Board not found');

  await Card.deleteMany({ boardId: removed._id });

  res.status(204).send();
};
