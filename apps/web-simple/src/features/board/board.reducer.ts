import type { BoardAction, BoardState } from './board.types';
import { sortCardsByOrder } from './board.utils';

export const initialBoardState: BoardState = {
  boardId: null,
  board: null,
  cards: [],
  isLoading: false,
  isNotFound: false,
  error: null,
};

export const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'LOAD_BOARD_REQUEST':
      return { ...state, isLoading: true, isNotFound: false, error: null };

    case 'LOAD_BOARD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isNotFound: false,
        error: null,
        boardId: action.payload.boardId,
        board: action.payload.board,
        cards: sortCardsByOrder(action.payload.cards),
      };

    case 'LOAD_BOARD_ERROR': {
      const isNotFound = Boolean(action.payload.isNotFound);
      if (isNotFound) {
        return {
          ...state,
          isLoading: false,
          isNotFound,
          error: action.payload.message,
          boardId: null,
          board: null,
          cards: [],
        };
      }
      return { ...state, isLoading: false, isNotFound: false, error: action.payload.message };
    }

    case 'BOARD_RENAMED':
      return {
        ...state,
        isNotFound: false,
        error: null,
        boardId: action.payload.boardId,
        board: state.board ? { ...state.board, name: action.payload.name } : state.board,
      };

    case 'CARD_CREATED':
      return { ...state, cards: sortCardsByOrder([...state.cards, action.payload.card]) };

    case 'CARD_UPDATED':
      return {
        ...state,
        cards: sortCardsByOrder(
          state.cards.map((c) => (c.id === action.payload.card.id ? action.payload.card : c)),
        ),
      };

    case 'CARD_DELETED':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.payload.cardId) };

    case 'CARDS_REORDERED':
      return { ...state, cards: sortCardsByOrder(action.payload.cards) };

    case 'MOVE_CARD_OPTIMISTIC': {
      const { cardId, toColumn, toOrder } = action.payload;
      const cards = state.cards.map((c) =>
        c.id === cardId ? { ...c, column: toColumn, order: toOrder } : c,
      );
      return { ...state, cards: sortCardsByOrder(cards) };
    }

    default:
      return state;
  }
};
