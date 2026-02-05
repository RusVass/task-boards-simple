import { normalizeString } from '../features/board/board.schemas';
import { parseApiError } from '../shared/api/api.utils';

export function getLoadBoardErrorMessage(error: unknown): string {
  const fallback = 'Load failed, check API server';
  const { status, message } = parseApiError(error);

  if (status === 404) return message ?? 'Board not found';
  return message ?? fallback;
}

export function validateBoardName(input: string): { trimmed: string; error: string | null } {
  const trimmed = normalizeString(input);
  if (!trimmed) return { trimmed, error: 'Field is required' };
  return { trimmed, error: null };
}

export function validateBoardId(input: string): { trimmed: string; error: string | null } {
  const trimmed = normalizeString(input);
  if (!trimmed) return { trimmed, error: 'Field is required' };
  return { trimmed, error: null };
}
