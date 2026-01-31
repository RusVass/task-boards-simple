import { normalizeString } from '../features/board/board.schemas';

export function getLoadBoardErrorMessage(error: unknown): string {
  const fallback = 'Load failed, check API server';
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { message?: string } } })
      .response;
    const message = response?.data?.message;
    if (response?.status === 404) return message ?? 'Board not found';
    return message ?? fallback;
  }
  return fallback;
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
