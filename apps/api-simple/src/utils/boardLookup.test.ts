import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { Board } from '../models/Board';
import { HttpError } from './httpError';
import { findBoardByPublicId, parseBoardPublicId } from './boardLookup';

type BoardLean = { _id: string; publicId?: string; name: string };

let originalFindOne: typeof Board.findOne;
let originalFindById: typeof Board.findById;
let originalExists: typeof Board.exists;
let originalUpdateOne: typeof Board.updateOne;

beforeEach(() => {
  originalFindOne = Board.findOne.bind(Board);
  originalFindById = Board.findById.bind(Board);
  originalExists = Board.exists.bind(Board);
  originalUpdateOne = Board.updateOne.bind(Board);
});

afterEach(() => {
  Board.findOne = originalFindOne;
  Board.findById = originalFindById;
  Board.exists = originalExists;
  Board.updateOne = originalUpdateOne;
});

const mockFindOne = (result: BoardLean | null) => {
  const fn = () => ({
    lean: async () => result,
  });
  Board.findOne = fn as unknown as typeof Board.findOne;
};

const mockFindById = (result: BoardLean | null) => {
  const fn = () => ({
    lean: async () => result,
  });
  Board.findById = fn as unknown as typeof Board.findById;
};

const mockExists = (value: unknown) => {
  const fn = async () => value;
  Board.exists = fn as unknown as typeof Board.exists;
};

const mockUpdateOne = (onUpdate: (update: unknown) => void) => {
  const fn = async (_filter: unknown, update: unknown) => {
    onUpdate(update);
    return { modifiedCount: 1 };
  };
  Board.updateOne = fn as unknown as typeof Board.updateOne;
};

test('parseBoardPublicId rejects invalid ids', () => {
  assert.throws(() => parseBoardPublicId('bad'), (err: unknown) => {
    assert.ok(err instanceof HttpError);
    assert.equal(err.status, 400);
    return true;
  });
});

test('findBoardByPublicId returns board by publicId', async () => {
  const board = { _id: '507f1f77bcf86cd799439011', publicId: 'a1b2c3d4e5f6a7b8c9d0e1f2', name: 'Board' };
  mockFindOne(board);
  mockFindById(null);

  const result = await findBoardByPublicId(board.publicId);
  assert.deepEqual(result, board);
});

test('findBoardByPublicId falls back to _id and assigns publicId', async () => {
  const board = { _id: '507f1f77bcf86cd799439011', name: 'Board' };
  mockFindOne(null);
  mockFindById(board);
  mockExists(null);

  let updated: unknown = null;
  mockUpdateOne((update) => {
    updated = update;
  });

  const result = await findBoardByPublicId(board._id);
  const updateValue = updated as { publicId?: string };

  assert.ok(updateValue.publicId);
  assert.equal(result._id, board._id);
  assert.equal(result.name, board.name);
  assert.equal(result.publicId, updateValue.publicId);
});

test('findBoardByPublicId throws when board not found', async () => {
  mockFindOne(null);
  mockFindById(null);

  await assert.rejects(
    () => findBoardByPublicId('a1b2c3d4e5f6a7b8c9d0e1f2'),
    (err: unknown) => err instanceof HttpError && err.status === 404,
  );
});
