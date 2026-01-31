import type { BoardAction, BoardState, Card } from './board.types';

export const initialBoardState: BoardState = {
  boardId: null,
  board: null,
  cards: [],
  isLoading: false,
  isNotFound: false,
  error: null,
};

const sortCards = (cards: Card[]) => [...cards].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
        cards: sortCards(action.payload.cards),
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

    case 'CARD_CREATED':
      return { ...state, cards: sortCards([...state.cards, action.payload.card]) };

    case 'CARD_UPDATED':
      return {
        ...state,
        cards: sortCards(
          state.cards.map((c) => (c.id === action.payload.card.id ? action.payload.card : c)),
        ),
      };

    case 'CARD_DELETED':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.payload.cardId) };

    case 'CARDS_REORDERED':
      return { ...state, cards: sortCards(action.payload.cards) };

    case 'MOVE_CARD_OPTIMISTIC': {
      const { cardId, toColumn, toOrder } = action.payload;
      const cards = state.cards.map((c) =>
        c.id === cardId ? { ...c, column: toColumn, order: toOrder } : c,
      );
      return { ...state, cards: sortCards(cards) };
    }

    default:
      return state;
  }
};
