import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ZodError } from 'zod';
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

test('createCardSchema rejects invalid column', () => {
  assert.throws(
    () => createCardSchema.parse({ title: 'Title', column: 'bad' }),
    (err: unknown) => err instanceof ZodError,
  );
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
    (err: unknown) => err instanceof ZodError,
  );
});
