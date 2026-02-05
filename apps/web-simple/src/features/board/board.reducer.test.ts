import { describe, expect, it } from 'vitest';
import { boardReducer, initialBoardState } from './board.reducer';
import type { BoardState, Card } from './board.types';

const board = { id: 'b1', name: 'Test' };
const cards: Card[] = [
  { id: 'c2', boardId: 'b1', column: 'todo', order: 2, title: 'B', description: '' },
  { id: 'c1', boardId: 'b1', column: 'todo', order: 1, title: 'A', description: '' },
];
const updatedCard: Card = {
  id: 'c1',
  boardId: 'b1',
  column: 'todo',
  order: 3,
  title: 'A2',
  description: 'Next',
};

describe('boardReducer', () => {
  it('sets loading and clears error on LOAD_BOARD_REQUEST', () => {
    const state: BoardState = { ...initialBoardState, error: 'Boom' };
    const next = boardReducer(state, { type: 'LOAD_BOARD_REQUEST' });

    expect(next.isLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('sets board and sorted cards on LOAD_BOARD_SUCCESS', () => {
    const next = boardReducer(initialBoardState, {
      type: 'LOAD_BOARD_SUCCESS',
      payload: { boardId: 'b1', board, cards },
    });

    expect(next.board).toEqual(board);
    expect(next.cards.map((card) => card.id)).toEqual(['c1', 'c2']);
    expect(next.isLoading).toBe(false);
    expect(next.error).toBeNull();
  });

  it('keeps data on LOAD_BOARD_ERROR and stops loading', () => {
    const state: BoardState = {
      boardId: 'b1',
      board,
      cards,
      isLoading: true,
      isNotFound: false,
      error: null,
    };
    const next = boardReducer(state, { type: 'LOAD_BOARD_ERROR', payload: { message: 'Fail' } });

    expect(next.board).toBe(board);
    expect(next.cards).toBe(cards);
    expect(next.isLoading).toBe(false);
    expect(next.isNotFound).toBe(false);
    expect(next.error).toBe('Fail');
  });

  it('clears board data on LOAD_BOARD_ERROR when not found', () => {
    const state: BoardState = {
      boardId: 'b1',
      board,
      cards,
      isLoading: true,
      isNotFound: false,
      error: null,
    };
    const next = boardReducer(state, {
      type: 'LOAD_BOARD_ERROR',
      payload: { message: 'Board not found', isNotFound: true },
    });

    expect(next.boardId).toBeNull();
    expect(next.board).toBeNull();
    expect(next.cards).toEqual([]);
    expect(next.isNotFound).toBe(true);
    expect(next.isLoading).toBe(false);
  });

  it('resets not found flag on LOAD_BOARD_SUCCESS', () => {
    const state: BoardState = { ...initialBoardState, isNotFound: true };
    const next = boardReducer(state, {
      type: 'LOAD_BOARD_SUCCESS',
      payload: { boardId: 'b1', board, cards },
    });

    expect(next.isNotFound).toBe(false);
  });

  it('adds card and reorders by order', () => {
    const next = boardReducer(initialBoardState, {
      type: 'CARD_CREATED',
      payload: {
        card: { id: 'c3', boardId: 'b1', column: 'todo', order: 0, title: 'C', description: '' },
      },
    });

    expect(next.cards.map((card) => card.id)).toEqual(['c3']);
  });

  it('updates board name on BOARD_RENAMED', () => {
    const state: BoardState = { ...initialBoardState, boardId: 'b1', board, cards };
    const next = boardReducer(state, {
      type: 'BOARD_RENAMED',
      payload: { boardId: 'b1', name: 'Updated' },
    });

    expect(next.board?.name).toBe('Updated');
    expect(next.error).toBeNull();
  });

  it('updates card on CARD_UPDATED', () => {
    const state: BoardState = { ...initialBoardState, cards };
    const next = boardReducer(state, { type: 'CARD_UPDATED', payload: { card: updatedCard } });

    expect(next.cards[1]?.id).toBe('c1');
    expect(next.cards[1]).toEqual(updatedCard);
  });

  it('removes card on CARD_DELETED', () => {
    const state: BoardState = { ...initialBoardState, cards };
    const next = boardReducer(state, { type: 'CARD_DELETED', payload: { cardId: 'c1' } });

    expect(next.cards).toHaveLength(1);
    expect(next.cards[0]?.id).toBe('c2');
  });

  it('reorders cards on CARDS_REORDERED', () => {
    const state: BoardState = { ...initialBoardState, cards };
    const next = boardReducer(state, {
      type: 'CARDS_REORDERED',
      payload: { cards: [...cards].reverse() },
    });

    expect(next.cards.map((card) => card.id)).toEqual(['c1', 'c2']);
  });

  it('handles MOVE_CARD_OPTIMISTIC and sorts by order', () => {
    const state: BoardState = { ...initialBoardState, cards };
    const next = boardReducer(state, {
      type: 'MOVE_CARD_OPTIMISTIC',
      payload: { cardId: 'c2', toColumn: 'done', toOrder: -1 },
    });

    expect(next.cards[0]?.id).toBe('c2');
    expect(next.cards[0]?.column).toBe('done');
  });

  it('keeps cards when deleting missing id', () => {
    const state: BoardState = { ...initialBoardState, cards };
    const next = boardReducer(state, { type: 'CARD_DELETED', payload: { cardId: 'missing' } });

    expect(next.cards).toHaveLength(2);
  });

});
