export const CARD_STATUSES = ['todo', 'in_progress', 'done'] as const;

export type CardStatus = (typeof CARD_STATUSES)[number];

export const DEFAULT_CARD_STATUS: CardStatus = 'todo';

export const STATUS_ORDER: Record<CardStatus, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
};

export const isCardStatus = (value: unknown): value is CardStatus =>
  typeof value === 'string' && CARD_STATUSES.includes(value as CardStatus);
