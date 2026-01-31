import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { deleteBoard, getBoard } from './boards.controller';
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

type BoardLean = { _id: string; publicId: string; name: string };
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

const validBoardId = 'a1b2c3d4e5f6a7b8c9d0e1f2';
const boardObjectId = '507f1f77bcf86cd799439011';
const createdAt = new Date('2024-01-01T00:00:00.000Z');
const updatedAt = new Date('2024-01-01T00:00:00.000Z');

let originalFindOne: typeof Board.findOne;
let originalFindOneAndDelete: typeof Board.findOneAndDelete;
let originalCardFind: typeof Card.find;
let originalCardDeleteMany: typeof Card.deleteMany;

beforeEach(() => {
  originalFindOne = Board.findOne.bind(Board);
  originalFindOneAndDelete = Board.findOneAndDelete.bind(Board);
  originalCardFind = Card.find.bind(Card);
  originalCardDeleteMany = Card.deleteMany.bind(Card);
});

afterEach(() => {
  Board.findOne = originalFindOne;
  Board.findOneAndDelete = originalFindOneAndDelete;
  Card.find = originalCardFind;
  Card.deleteMany = originalCardDeleteMany;
});

const mockFindOne = (result: BoardLean | null) => {
  const fn = () => ({
    lean: async () => result,
  });
  Board.findOne = fn as unknown as typeof Board.findOne;
};

const mockFindOneAndDelete = (result: BoardLean | null) => {
  const fn = () => ({
    lean: async () => result,
  });
  Board.findOneAndDelete = fn as unknown as typeof Board.findOneAndDelete;
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
  mockFindOne(null);

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
  mockFindOne({ _id: boardObjectId, publicId: validBoardId, name: 'Board' });

  const cards: CardLean[] = [
    {
      _id: '507f1f77bcf86cd799439012',
      boardId: boardObjectId,
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
        boardId: validBoardId,
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
  mockFindOneAndDelete({ _id: boardObjectId, publicId: validBoardId, name: 'Board' });

  let deleteFilter: unknown;
  mockCardDeleteMany((filter) => {
    deleteFilter = filter;
  });

  const req = { params: { boardId: validBoardId } };
  const res = createMockResponse();

  await deleteBoard(req as never, res as never);

  assert.equal(res.statusCode, 204);
  assert.deepEqual(deleteFilter, { boardId: boardObjectId });
});
