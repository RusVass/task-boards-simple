import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBoardPublicId, isValidBoardPublicId } from './boardPublicId';

test('createBoardPublicId returns 24 hex chars', () => {
  const id = createBoardPublicId();
  assert.equal(id.length, 24);
  assert.ok(/^[a-f0-9]{24}$/i.test(id));
});

test('isValidBoardPublicId rejects invalid values', () => {
  assert.equal(isValidBoardPublicId(''), false);
  assert.equal(isValidBoardPublicId('not-hex'), false);
  assert.equal(isValidBoardPublicId('a1b2'), false);
});

test('isValidBoardPublicId accepts valid hex', () => {
  assert.equal(isValidBoardPublicId('a1b2c3d4e5f6a7b8c9d0e1f2'), true);
});
