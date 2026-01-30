import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { boardsValidation, deleteBoard, getBoard } from './boards.controller';
import { Board } from '../models/Board';
import { Card } from '../models/Card';
import { HttpError } from '../utils/httpError';

type MockResponse = {
  statusCode: number;
  body: unknown;
  status: (code: number) => MockResponse;
  json: (payload: unknown) => void;
  send: () => void;
};

const createMockResponse = (): MockResponse => {
  return {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
    },
    send() {
      this.body = null;
    },
  };
};

type BoardLean = { _id: string; name: string };
type CardLean = {
  _id: string;
  boardId: string;
  column: 'todo' | 'in_progress' | 'done';
  order: number;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

const validBoardId = '507f1f77bcf86cd799439011';
const createdAt = new Date('2024-01-01T00:00:00.000Z');
const updatedAt = new Date('2024-01-01T00:00:00.000Z');

let originalFindById: typeof Board.findById;
let originalFindByIdAndDelete: typeof Board.findByIdAndDelete;
let originalCardFind: typeof Card.find;
let originalCardDeleteMany: typeof Card.deleteMany;

beforeEach(() => {
  originalFindById = Board.findById.bind(Board);
  originalFindByIdAndDelete = Board.findByIdAndDelete.bind(Board);
  originalCardFind = Card.find.bind(Card);
  originalCardDeleteMany = Card.deleteMany.bind(Card);
});

afterEach(() => {
  Board.findById = originalFindById;
  Board.findByIdAndDelete = originalFindByIdAndDelete;
  Card.find = originalCardFind;
  Card.deleteMany = originalCardDeleteMany;
});

const mockFindById = (result: BoardLean | null) => {
  const fn = () => ({
    lean: async () => result,
  });
  Board.findById = fn as unknown as typeof Board.findById;
};

const mockFindByIdAndDelete = (result: BoardLean | null) => {
  const fn = () => ({
    lean: async () => result,
  });
  Board.findByIdAndDelete = fn as unknown as typeof Board.findByIdAndDelete;
};

const mockCardFind = (
  result: CardLean[],
  onSort?: (value: unknown) => void,
) => {
  const fn = () => ({
    sort: (value: unknown) => {
      onSort?.(value);
      return {
        lean: async () => result,
      };
    },
  });
  Card.find = fn as unknown as typeof Card.find;
};

const mockCardDeleteMany = (onDelete: (filter: unknown) => void) => {
  const fn = async (filter: unknown) => {
    onDelete(filter);
    return { deletedCount: 1 };
  };
  Card.deleteMany = fn as unknown as typeof Card.deleteMany;
};

test('requireString trims and returns value', () => {
  const value = boardsValidation.requireString('  Board  ', 'name');
  assert.equal(value, 'Board');
});

test('requireString throws on non string', () => {
  assert.throws(
    () => boardsValidation.requireString(123, 'name'),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal((err as HttpError).status, 400);
      assert.equal((err as HttpError).message, 'name must be a string');
      return true;
    },
  );
});

test('requireString throws on empty string', () => {
  assert.throws(
    () => boardsValidation.requireString('   ', 'name'),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal((err as HttpError).status, 400);
      assert.equal((err as HttpError).message, 'name is required');
      return true;
    },
  );
});

test('requireObjectId throws on invalid id', () => {
  assert.throws(
    () => boardsValidation.requireObjectId('nope', 'boardId'),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal((err as HttpError).status, 400);
      assert.equal((err as HttpError).message, 'boardId is invalid');
      return true;
    },
  );
});

test('requireObjectId accepts valid id', () => {
  const value = boardsValidation.requireObjectId('507f1f77bcf86cd799439011', 'boardId');
  assert.equal(value, '507f1f77bcf86cd799439011');
});

test('getBoard throws on invalid boardId', async () => {
  const req = { params: { boardId: 'bad' } };
  const res = createMockResponse();

  await assert.rejects(
    () => getBoard(req as never, res as never),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      assert.equal(err.message, 'boardId is invalid');
      return true;
    },
  );
});

test('getBoard throws when board not found', async () => {
  mockFindById(null);

  const req = { params: { boardId: validBoardId } };
  const res = createMockResponse();

  await assert.rejects(
    () => getBoard(req as never, res as never),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 404);
      assert.equal(err.message, 'Board not found');
      return true;
    },
  );
});

test('getBoard returns board and cards and uses stable sort', async () => {
  mockFindById({ _id: validBoardId, name: 'Board' });

  const cards: CardLean[] = [
    {
      _id: '507f1f77bcf86cd799439012',
      boardId: validBoardId,
      column: 'todo',
      order: 1,
      title: 'Card 1',
      description: '',
      createdAt,
      updatedAt,
    },
  ];

  let sortValue: unknown;
  mockCardFind(cards, (value) => {
    sortValue = value;
  });

  const req = { params: { boardId: validBoardId } };
  const res = createMockResponse();

  await getBoard(req as never, res as never);

  assert.deepEqual(sortValue, { column: 1, order: 1, _id: 1 });
  assert.deepEqual(res.body, {
    board: { publicId: validBoardId, name: 'Board' },
    cards: [
      {
        _id: cards[0]._id,
        boardId: cards[0].boardId,
        column: cards[0].column,
        order: cards[0].order,
        title: cards[0].title,
        description: cards[0].description,
        createdAt,
        updatedAt,
      },
    ],
  });
});

test('deleteBoard deletes board and cascades cards', async () => {
  mockFindByIdAndDelete({ _id: validBoardId, name: 'Board' });

  let deleteFilter: unknown;
  mockCardDeleteMany((filter) => {
    deleteFilter = filter;
  });

  const req = { params: { boardId: validBoardId } };
  const res = createMockResponse();

  await deleteBoard(req as never, res as never);

  assert.equal(res.statusCode, 204);
  assert.deepEqual(deleteFilter, { boardId: validBoardId });
});
