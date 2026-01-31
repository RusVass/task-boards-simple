import { createHash, randomBytes } from 'node:crypto';

const BOARD_PUBLIC_ID_LENGTH = 24;
const BOARD_PUBLIC_ID_REGEX = new RegExp(`^[a-f0-9]{${BOARD_PUBLIC_ID_LENGTH}}$`, 'i');

export const isValidBoardPublicId = (value: string): boolean => {
  const normalized = value.trim();
  return BOARD_PUBLIC_ID_REGEX.test(normalized);
};

export const createBoardPublicId = (): string => {
  const seed = randomBytes(16);
  const hash = createHash('sha256').update(seed).digest('hex');
  return hash.slice(0, BOARD_PUBLIC_ID_LENGTH);
};
