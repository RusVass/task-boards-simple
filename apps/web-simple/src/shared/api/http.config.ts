export const API_TIMEOUT_MS = 10000;

export const resolveBaseUrl = (): string => {
  const raw = import.meta.env.VITE_API_URL;
  const normalized = typeof raw === 'string' ? raw.trim() : '';
  if (!normalized) {
    throw new Error('VITE_API_URL is required');
  }
  return normalized;
};

export const httpConfig = {
  baseURL: resolveBaseUrl(),
  timeout: API_TIMEOUT_MS,
};
