import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createCardSchema,
  reorderCardsSchema,
  updateCardSchema,
} from './cards.schema';

test('createCardSchema parses valid payload', () => {
  const data = createCardSchema.parse({
    title: 'Title',
    description: 'Description',
    column: 'todo',
  });
  assert.deepEqual(data, {
    title: 'Title',
    description: 'Description',
    column: 'todo',
  });
});

test('createCardSchema defaults invalid column to todo', () => {
  const data = createCardSchema.parse({ title: 'Title', column: 'bad' });
  assert.deepEqual(data, {
    title: 'Title',
    column: 'todo',
  });
});

test('updateCardSchema accepts partial updates', () => {
  const data = updateCardSchema.parse({ description: 'Desc' });
  assert.deepEqual(data, { description: 'Desc' });
});

test('reorderCardsSchema rejects empty cardId', () => {
  assert.throws(
    () =>
      reorderCardsSchema.parse({
        items: [{ cardId: '', column: 'done' }],
      }),
  );
});
