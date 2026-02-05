import type { CardStatus } from '../constants/cards';

export const CARD_SORT = { column: 1, order: 1, _id: 1 } as const;

type BoardLean = { publicId: string; name: string };

type CardLean = {
  _id: string;
  boardId: string;
  column: CardStatus;
  order: number;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const serializeBoard = (board: BoardLean) => ({
  publicId: board.publicId,
  name: board.name,
});

export const serializeCard = (card: CardLean, boardPublicId: string) => ({
  _id: card._id,
  boardId: boardPublicId,
  column: card.column,
  order: card.order,
  title: card.title,
  description: card.description ?? '',
  createdAt: card.createdAt,
  updatedAt: card.updatedAt,
});

export const serializeBoardDetails = (board: BoardLean, cards: CardLean[]) => ({
  board: serializeBoard(board),
  cards: cards.map((card) => serializeCard(card, board.publicId)),
});
