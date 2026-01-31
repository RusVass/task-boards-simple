import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ZodError } from 'zod';
import { createBoardSchema, updateBoardSchema } from './boards.schema';

test('createBoardSchema parses valid name', () => {
  const data = createBoardSchema.parse({ name: 'Board' });
  assert.deepEqual(data, { name: 'Board' });
});

test('createBoardSchema rejects empty name', () => {
  assert.throws(
    () => createBoardSchema.parse({ name: '' }),
    (err: unknown) => err instanceof ZodError,
  );
});

test('createBoardSchema rejects missing name', () => {
  assert.throws(
    () => createBoardSchema.parse({}),
    (err: unknown) => err instanceof ZodError,
  );
});

test('updateBoardSchema rejects non string name', () => {
  assert.throws(
    () => updateBoardSchema.parse({ name: 123 }),
    (err: unknown) => err instanceof ZodError,
  );
});
