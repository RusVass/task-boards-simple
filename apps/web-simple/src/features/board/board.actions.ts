import type { Dispatch } from 'react';
import { http } from '../../shared/api/http';
import type { BoardAction, BoardResponse, Card, ColumnId } from './board.types';
import { COLUMNS } from './board.utils';

type CardApiResponse = BoardResponse['cards'][number];

const mapCard = (card: CardApiResponse): Card => ({
  id: String(card._id),
  boardId: String(card.boardId),
  column: card.column,
  order: card.order ?? 0,
  title: card.title,
  description: card.description,
});

export const loadBoard = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
): Promise<void> => {
  dispatch({ type: 'LOAD_BOARD_REQUEST' });

  try {
    const { data } = await http.get<BoardResponse>(`/api/boards/${boardId}`);
    dispatch({
      type: 'LOAD_BOARD_SUCCESS',
      payload: {
        boardId: String(data.board.publicId),
        board: { id: String(data.board.publicId), name: data.board.name },
        cards: (data.cards ?? []).map(mapCard),
      },
    });
  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    dispatch({
      type: 'LOAD_BOARD_ERROR',
      payload: { message: message ?? 'Failed to load board' },
    });
  }
};

export const renameBoard = async (
  boardId: string,
  name: string,
  dispatch: Dispatch<BoardAction>,
): Promise<void> => {
  const nextName = name.trim();
  if (!nextName) return;

  try {
    await http.patch(`/api/boards/${boardId}`, { name: nextName });
    await loadBoard(dispatch, boardId);
  } catch {
    dispatch({ type: 'LOAD_BOARD_ERROR', payload: { message: 'Rename failed' } });
  }
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  await http.delete(`/api/boards/${boardId}`);
};

interface UpdateCardInput {
  title: string;
  description: string;
}

export const createCard = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
  input: { title: string; description: string },
): Promise<void> => {
  try {
    const { data } = await http.post<CardApiResponse>(`/api/boards/${boardId}/cards`, {
      title: input.title,
      description: input.description,
      column: 'todo',
    });

    dispatch({
      type: 'CARD_CREATED',
      payload: { card: mapCard(data) },
    });
  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    dispatch({
      type: 'LOAD_BOARD_ERROR',
      payload: { message: message ?? 'Create card failed' },
    });
  }
};

export const updateCard = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
  cardId: string,
  data: UpdateCardInput,
): Promise<void> => {
  const { data: card } = await http.patch<CardApiResponse>(
    `/api/boards/${boardId}/cards/${cardId}`,
    data,
  );

  dispatch({
    type: 'CARD_UPDATED',
    payload: { card: mapCard(card) },
  });
};

export const deleteCard = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
  cardId: string,
): Promise<void> => {
  await http.delete(`/api/boards/${boardId}/cards/${cardId}`);

  dispatch({
    type: 'CARD_DELETED',
    payload: { cardId },
  });
};

type ReorderItem = { cardId: string; column: ColumnId };

const columnOrder = COLUMNS.reduce<Record<ColumnId, number>>((acc, col, index) => {
  acc[col.key] = index;
  return acc;
}, {} as Record<ColumnId, number>);

const sortByColumnThenOrder = (a: Card, b: Card) => {
  const columnDiff = columnOrder[a.column] - columnOrder[b.column];
  if (columnDiff !== 0) return columnDiff;
  return a.order - b.order;
};

export const reorderCards = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
  cards: Card[],
): Promise<void> => {
  const items: ReorderItem[] = cards
    .slice()
    .sort(sortByColumnThenOrder)
    .map((card) => ({ cardId: card.id, column: card.column }));

  try {
    await http.put(`/api/boards/${boardId}/cards/reorder`, { items });
  } catch {
    dispatch({ type: 'LOAD_BOARD_ERROR', payload: { message: 'Reorder failed' } });
  }
};
