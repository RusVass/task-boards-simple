export type ColumnId = 'todo' | 'in_progress' | 'done';

export interface Board {
  id: string;
  name: string;
}

export interface Card {
  id: string;
  boardId: string;
  column: ColumnId;
  order: number;
  title: string;
  description: string;
}

export interface BoardState {
  boardId: string | null;
  board: Board | null;
  cards: Card[];
  isLoading: boolean;
  error: string | null;
}

export type BoardAction =
  | { type: 'LOAD_BOARD_REQUEST' }
  | {
      type: 'LOAD_BOARD_SUCCESS';
      payload: { boardId: string; board: Board; cards: Card[] };
    }
  | { type: 'LOAD_BOARD_ERROR'; payload: { message: string } }
  | { type: 'CARD_CREATED'; payload: { card: Card } }
  | { type: 'CARD_UPDATED'; payload: { card: Card } }
  | { type: 'CARD_DELETED'; payload: { cardId: string } }
  | { type: 'CARDS_REORDERED'; payload: { cards: Card[] } }
  | {
      type: 'MOVE_CARD_OPTIMISTIC';
      payload: { cardId: string; toColumn: ColumnId; toOrder: number };
    };

export interface BoardResponse {
  board: { publicId: string; name: string };
  cards: Array<{
    _id: string;
    boardId: string;
    column: ColumnId;
    order: number;
    title: string;
    description: string;
  }>;
}
