import { nanoid } from 'nanoid';
import { BoardModel } from './board.model';
import { CardModel } from '../cards/card.model';

export async function createBoard(name: string) {
  const board = await BoardModel.create({
    publicId: nanoid(10),
    name,
  });

  return board;
}

export async function getBoardWithCards(publicId: string) {
  const board = await BoardModel.findOne({ publicId }).lean();

  if (!board) return null;

  const cards = await CardModel.find({ boardId: board.publicId })
    .sort({ column: 1, order: 1 })
    .lean();

  return { board, cards };
}

export async function updateBoard(publicId: string, name: string) {
  return BoardModel.findOneAndUpdate({ publicId }, { name }, { new: true }).lean();
}

export async function deleteBoardCascade(publicId: string) {
  const board = await BoardModel.findOneAndDelete({ publicId }).lean();

  if (!board) return null;

  await CardModel.deleteMany({ boardId: board.publicId });

  return board;
}
