import { httpClient } from './httpClient';

export type ColumnType = 'todo' | 'in_progress' | 'done';

export type Board = {
  publicId: string;
  name: string;
};

export type Card = {
  _id: string;
  boardId: string;
  column: ColumnType;
  order: number;
  title: string;
  description?: string;
};

export type GetBoardResponse = {
  board: Board;
  cards: Card[];
};

export function getBoard(publicId: string) {
  return httpClient.get<GetBoardResponse>(`/boards/${publicId}`);
}

export function createBoard(name: string) {
  return httpClient.post<Board>('/boards', { name });
}

export function createCard(
  publicId: string,
  data: { title: string; description?: string; column: ColumnType },
) {
  return httpClient.post<Card>(`/boards/${publicId}/cards`, data);
}

export function reorderCards(publicId: string, items: { cardId: string; column: ColumnType }[]) {
  return httpClient.put(`/boards/${publicId}/cards/reorder`, { items });
}

export function updateCard(
  publicId: string,
  cardId: string,
  data: { title: string; description?: string },
) {
  return httpClient.patch<Card>(`/boards/${publicId}/cards/${cardId}`, data);
}

export function deleteCard(publicId: string, cardId: string) {
  return httpClient.delete(`/boards/${publicId}/cards/${cardId}`);
}
