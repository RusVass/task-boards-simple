import type { Card, ColumnId } from './board.types';

interface ColumnMeta {
  key: ColumnId;
  title: string;
}

export const COLUMNS: ColumnMeta[] = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
];

export const getCardsByColumn = (cards: Card[], column: ColumnId): Card[] =>
  cards
    .filter((card) => card.column === column)
    .slice()
    .sort((a, b) => a.order - b.order);

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

  const nextCards: Card[] = [];
  COLUMNS.forEach((col) => {
    const list = byColumn.get(col.key) ?? [];
    list.forEach((card, index) => {
      nextCards.push({ ...card, order: index });
    });
  });

  return nextCards;
};
