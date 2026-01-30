import { describe, expect, it } from 'vitest';
import { getCardsByColumn, reorderCards } from './board.utils';
import type { Card } from './board.types';

const cards: Card[] = [
  { id: '1', boardId: 'b1', column: 'todo', order: 2, title: 'B', description: '' },
  { id: '2', boardId: 'b1', column: 'done', order: 1, title: 'C', description: '' },
  { id: '3', boardId: 'b1', column: 'todo', order: 1, title: 'A', description: '' },
];

describe('getCardsByColumn', () => {
  it('returns empty array for empty input', () => {
    const result = getCardsByColumn([], 'todo');
    expect(result).toEqual([]);
  });

  it('filters cards by column', () => {
    const result = getCardsByColumn(cards, 'done');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('2');
  });

  it('sorts cards by order ascending', () => {
    const result = getCardsByColumn(cards, 'todo');
    expect(result.map((card) => card.id)).toEqual(['3', '1']);
  });
});

describe('reorderCards', () => {
  it('moves card within the same column', () => {
    const result = reorderCards(cards, '1', 'todo', 0);
    const todo = result.filter((card) => card.column === 'todo');
    expect(todo.map((card) => card.id)).toEqual(['1', '3']);
    expect(todo.map((card) => card.order)).toEqual([0, 1]);
  });

  it('moves card to a different column', () => {
    const result = reorderCards(cards, '3', 'done', 1);
    const done = result.filter((card) => card.column === 'done');
    expect(done.map((card) => card.id)).toEqual(['2', '3']);
    expect(done.map((card) => card.order)).toEqual([0, 1]);
  });

  it('returns original cards when id not found', () => {
    const result = reorderCards(cards, 'missing', 'todo', 0);
    expect(result).toBe(cards);
  });
});
