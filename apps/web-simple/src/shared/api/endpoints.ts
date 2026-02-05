import { http } from './http';
import type {
  BoardApiResponse,
  BoardDetailsApiResponse,
  CardApiResponse,
  CreateCardInput,
  ReorderCardsInput,
  UpdateCardInput,
} from './api.types';

export const createBoard = async (name: string): Promise<BoardApiResponse> => {
  const res = await http.post<BoardApiResponse>('/api/boards', { name });
  return res.data;
};

export const getBoard = async (boardId: string): Promise<BoardDetailsApiResponse> => {
  const res = await http.get<BoardDetailsApiResponse>(`/api/boards/${boardId}`);
  return res.data;
};

export const renameBoard = async (boardId: string, name: string): Promise<BoardApiResponse> => {
  const res = await http.patch<BoardApiResponse>(`/api/boards/${boardId}`, { name });
  return res.data;
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  await http.delete(`/api/boards/${boardId}`);
};

export const createCard = async (boardId: string, data: CreateCardInput): Promise<CardApiResponse> => {
  const res = await http.post<CardApiResponse>(`/api/boards/${boardId}/cards`, data);
  return res.data;
};

export const updateCard = async (
  boardId: string,
  cardId: string,
  data: UpdateCardInput,
): Promise<CardApiResponse> => {
  const res = await http.patch<CardApiResponse>(`/api/boards/${boardId}/cards/${cardId}`, data);
  return res.data;
};

export const deleteCard = async (boardId: string, cardId: string): Promise<void> => {
  await http.delete(`/api/boards/${boardId}/cards/${cardId}`);
};

export const reorderCards = async (
  boardId: string,
  data: ReorderCardsInput,
): Promise<void> => {
  await http.put(`/api/boards/${boardId}/cards/reorder`, data);
};
