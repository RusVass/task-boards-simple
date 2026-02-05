import type { ColumnId } from '../../features/board/board.types';

export type ApiStatus = number;

export interface ApiErrorResponse {
  status?: ApiStatus;
  data?: { message?: string };
}

export interface ApiErrorShape {
  response?: ApiErrorResponse;
}

export interface BoardApiResponse {
  publicId: string;
  name: string;
}

export interface CardApiResponse {
  _id: string;
  boardId: string;
  column: ColumnId;
  order: number;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardDetailsApiResponse {
  board: BoardApiResponse;
  cards: CardApiResponse[];
}

export interface CreateCardInput {
  title: string;
  description: string;
  column: ColumnId;
}

export interface UpdateCardInput {
  title: string;
  description: string;
}

export interface ReorderCardsInput {
  items: Array<{ cardId: string; column: ColumnId }>;
}
