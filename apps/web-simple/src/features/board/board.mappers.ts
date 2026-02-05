import type { Board, Card } from './board.types';
import type { BoardDetailsApiResponse, CardApiResponse } from '../../shared/api/api.types';

export const toUiCard = (card: CardApiResponse): Card => ({
  id: String(card._id),
  boardId: String(card.boardId),
  column: card.column,
  order: card.order ?? 0,
  title: card.title,
  description: card.description,
});

export const toUiBoardPayload = (data: BoardDetailsApiResponse) => ({
  boardId: String(data.board.publicId),
  board: { id: String(data.board.publicId), name: data.board.name } as Board,
  cards: (data.cards ?? []).map(toUiCard),
});
