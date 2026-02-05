import type { ApiErrorShape } from './api.types';

export const parseApiError = (error: unknown): { status?: number; message?: string } => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as ApiErrorShape).response;
    return { status: response?.status, message: response?.data?.message };
  }

  return {};
};
