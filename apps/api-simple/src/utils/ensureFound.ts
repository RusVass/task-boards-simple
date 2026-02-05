import { HttpError } from './httpError';

export const ensureFound = <T>(value: T | null, message: string): T => {
  if (!value) throw new HttpError(404, message);
  return value;
};
