import type { Dispatch } from 'react';
import {
  createCard as createCardApi,
  deleteBoard as deleteBoardApi,
  deleteCard as deleteCardApi,
  getBoard as getBoardApi,
  renameBoard as renameBoardApi,
  reorderCards as reorderCardsApi,
  updateCard as updateCardApi,
} from '../../shared/api/endpoints';
import { parseApiError } from '../../shared/api/api.utils';
import type { BoardAction, Card, ColumnId } from './board.types';
import { toUiBoardPayload, toUiCard } from './board.mappers';
import { sortCardsByColumnThenOrder } from './board.utils';

const getErrorPayload = (
  error: unknown,
  fallbackMessage: string,
): { message: string; isNotFound: boolean } => {
  const { status, message } = parseApiError(error);
  return { message: message ?? fallbackMessage, isNotFound: status === 404 };
};

export const loadBoard = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
): Promise<void> => {
  dispatch({ type: 'LOAD_BOARD_REQUEST' });

  try {
    const data = await getBoardApi(boardId);
    dispatch({ type: 'LOAD_BOARD_SUCCESS', payload: toUiBoardPayload(data) });
  } catch (error: unknown) {
    dispatch({
      type: 'LOAD_BOARD_ERROR',
      payload: getErrorPayload(error, 'Failed to load board'),
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
    const updated = await renameBoardApi(boardId, nextName);
    dispatch({ type: 'BOARD_RENAMED', payload: { boardId: updated.publicId, name: updated.name } });
  } catch (error: unknown) {
    dispatch({ type: 'LOAD_BOARD_ERROR', payload: getErrorPayload(error, 'Rename failed') });
  }
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  await deleteBoardApi(boardId);
};

export const createCard = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
  input: { title: string; description: string; column: ColumnId },
): Promise<void> => {
  try {
    const card = await createCardApi(boardId, input);

    dispatch({
      type: 'CARD_CREATED',
      payload: { card: toUiCard(card) },
    });
  } catch (error: unknown) {
    dispatch({
      type: 'LOAD_BOARD_ERROR',
      payload: getErrorPayload(error, 'Create card failed'),
    });
  }
};

export const updateCard = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
  cardId: string,
  data: { title: string; description: string },
): Promise<void> => {
  const card = await updateCardApi(boardId, cardId, data);

  dispatch({
    type: 'CARD_UPDATED',
    payload: { card: toUiCard(card) },
  });
};

export const deleteCard = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
  cardId: string,
): Promise<void> => {
  await deleteCardApi(boardId, cardId);

  dispatch({
    type: 'CARD_DELETED',
    payload: { cardId },
  });
};

export const reorderCards = async (
  dispatch: Dispatch<BoardAction>,
  boardId: string,
  cards: Card[],
): Promise<void> => {
  // Normalize order before persisting so the API receives a stable sequence.
  const items = sortCardsByColumnThenOrder(cards).map((card) => ({
    cardId: card.id,
    column: card.column,
  }));

  try {
    await reorderCardsApi(boardId, { items });
  } catch (error: unknown) {
    dispatch({ type: 'LOAD_BOARD_ERROR', payload: getErrorPayload(error, 'Reorder failed') });
  }
};
