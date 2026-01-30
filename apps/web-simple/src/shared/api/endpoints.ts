import { http } from './http';
import type { BoardResponse, Card, ColumnId } from '../../features/board/board.types';

interface CreateBoardResponse {
  publicId: string;
  name: string;
}

interface CreateCardInput {
  title: string;
  description: string;
  column: ColumnId;
}

interface UpdateCardInput {
  title: string;
  description: string;
}

export const createBoard = async (name: string): Promise<CreateBoardResponse> => {
  const res = await http.post<CreateBoardResponse>('/api/boards', { name });
  return res.data;
};

export const getBoard = async (boardId: string): Promise<BoardResponse> => {
  const res = await http.get<BoardResponse>(`/api/boards/${boardId}`);
  return res.data;
};

export const createCard = async (boardId: string, data: CreateCardInput): Promise<Card> => {
  const res = await http.post<Card>(`/api/boards/${boardId}/cards`, data);
  return res.data;
};

export const updateCard = async (
  boardId: string,
  cardId: string,
  data: UpdateCardInput,
): Promise<Card> => {
  const res = await http.patch<Card>(`/api/boards/${boardId}/cards/${cardId}`, data);
  return res.data;
};

export const deleteCard = async (boardId: string, cardId: string): Promise<void> => {
  await http.delete(`/api/boards/${boardId}/cards/${cardId}`);
};
