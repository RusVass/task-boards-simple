import type { Card, ColumnId } from './board.types';
import { COLUMNS, STATUS_ORDER } from './board.constants';

const statusOrder = new Map<ColumnId, number>(STATUS_ORDER.map((key, index) => [key, index]));

export const getCardsByColumn = (cards: Card[], column: ColumnId): Card[] =>
  cards
    .filter((card) => card.column === column)
    .slice()
    .sort((a, b) => a.order - b.order);

export const sortCardsByOrder = (cards: Card[]): Card[] =>
  cards.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const sortCardsByColumnThenOrder = (cards: Card[]): Card[] =>
  cards.slice().sort((a, b) => {
    const columnDiff = (statusOrder.get(a.column) ?? 0) - (statusOrder.get(b.column) ?? 0);
    if (columnDiff !== 0) return columnDiff;
    return a.order - b.order;
  });

export const reorderCards = (
  cards: Card[],
  cardId: string,
  toColumn: ColumnId,
  toIndex: number,
): Card[] => {
  const movingCard = cards.find((card) => card.id === cardId);
  if (!movingCard) return cards;

  const byColumn = new Map<ColumnId, Card[]>();
  COLUMNS.forEach((col) => {
    byColumn.set(
      col.key,
      getCardsByColumn(cards, col.key).filter((card) => card.id !== cardId),
    );
  });

  const targetList = byColumn.get(toColumn);
  if (!targetList) return cards;

  const insertIndex = Math.max(0, Math.min(toIndex, targetList.length));
  targetList.splice(insertIndex, 0, { ...movingCard, column: toColumn });

  // Rebuild per-column ordering so the UI stays stable after a drop.
  const nextCards: Card[] = [];
  COLUMNS.forEach((col) => {
    const list = byColumn.get(col.key) ?? [];
    list.forEach((card, index) => {
      nextCards.push({ ...card, order: index });
    });
  });

  return nextCards;
};
