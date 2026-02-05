import { Board } from '../models/Board';
import { HttpError } from './httpError';
import { createBoardPublicId, isValidBoardPublicId } from './boardPublicId';

export const parseBoardPublicId = (value: string): string => {
  const normalized = value.trim();
  if (!isValidBoardPublicId(normalized)) {
    throw new HttpError(400, 'boardId is invalid');
  }
  return normalized;
};

export const createUniqueBoardPublicId = async (): Promise<string> => {
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = createBoardPublicId();
    const exists = await Board.exists({ publicId: candidate });
    if (!exists) return candidate;
  }
  throw new HttpError(500, 'Failed to generate board id');
};

const ensureBoardPublicId = async (board: { _id: string; publicId?: string | null }) => {
  if (board.publicId) return board.publicId;
  const publicId = await createUniqueBoardPublicId();
  await Board.updateOne({ _id: board._id }, { publicId });
  return publicId;
};

export const findBoardByPublicId = async (publicId: string) => {
  const [byPublicId, byObjectId] = await Promise.all([
    Board.findOne({ publicId }).lean(),
    Board.findById(publicId).lean(),
  ]);
  if (byPublicId) return byPublicId;

  if (!byObjectId) throw new HttpError(404, 'Board not found');

  const ensuredPublicId = await ensureBoardPublicId(byObjectId);
  return { ...byObjectId, publicId: ensuredPublicId };
};
