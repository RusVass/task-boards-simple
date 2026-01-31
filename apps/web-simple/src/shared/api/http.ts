import axios from 'axios';

const resolveBaseUrl = (): string => {
  const raw = import.meta.env.VITE_API_URL;
  const normalized = typeof raw === 'string' ? raw.trim() : '';
  if (!normalized) {
    throw new Error('VITE_API_URL is required');
  }
  return normalized;
};

export const http = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
});
