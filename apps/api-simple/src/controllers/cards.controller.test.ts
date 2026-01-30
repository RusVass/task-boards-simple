import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { createCard, reorderCards } from './cards.controller';
import { Board } from '../models/Board';
import { Card } from '../models/Card';
import { HttpError } from '../utils/httpError';

type MockResponse = {
  statusCode: number;
  body: unknown;
  status: (code: number) => MockResponse;
  json: (payload: unknown) => void;
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
  };
};

type BoardLean = { _id: string; name: string };
type CardLean = { order: number };
type CreatedCard = {
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
let originalFindOne: typeof Card.findOne;
let originalCreate: typeof Card.create;
let originalUpdateOne: typeof Card.updateOne;

beforeEach(() => {
  originalFindById = Board.findById.bind(Board);
  originalFindOne = Card.findOne.bind(Card);
  originalCreate = Card.create.bind(Card);
  originalUpdateOne = Card.updateOne.bind(Card);
});

afterEach(() => {
  Board.findById = originalFindById;
  Card.findOne = originalFindOne;
  Card.create = originalCreate;
  Card.updateOne = originalUpdateOne;
});

const mockFindById = (result: BoardLean | null) => {
  const fn = () => ({
    lean: async () => result,
  });
  Board.findById = fn as unknown as typeof Board.findById;
};

const mockFindOne = (result: CardLean | null) => {
  const fn = () => ({
    sort: () => ({
      lean: async () => result,
    }),
  });
  Card.findOne = fn as unknown as typeof Card.findOne;
};

const mockCreate = (result: CreatedCard) => {
  const fn = async () => result;
  Card.create = fn as unknown as typeof Card.create;
};

type UpdateOneCall = {
  filter: { _id: string; boardId: string };
  update: { column: 'todo' | 'in_progress' | 'done'; order: number };
};

const mockUpdateOne = (calls: UpdateOneCall[]) => {
  const fn = async (filter: UpdateOneCall['filter'], update: UpdateOneCall['update']) => {
    calls.push({ filter, update });
    return {};
  };
  Card.updateOne = fn as unknown as typeof Card.updateOne;
};

test('createCard throws on invalid boardId', async () => {
  const req = { params: { boardId: 'bad' }, body: { title: 'Card', column: 'todo' } };
  const res = createMockResponse();

  await assert.rejects(
    () => createCard(req as never, res as never),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      assert.equal(err.message, 'boardId is invalid');
      return true;
    },
  );
});

test('createCard throws when board not found', async () => {
  mockFindById(null);

  const req = { params: { boardId: validBoardId }, body: { title: 'Card', column: 'todo' } };
  const res = createMockResponse();

  await assert.rejects(
    () => createCard(req as never, res as never),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 404);
      assert.equal(err.message, 'Board not found');
      return true;
    },
  );
});

test('createCard throws on invalid column', async () => {
  mockFindById({ _id: validBoardId, name: 'Board' });

  const req = { params: { boardId: validBoardId }, body: { title: 'Card', column: 'nope' } };
  const res = createMockResponse();

  await assert.rejects(
    () => createCard(req as never, res as never),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      assert.equal(err.message, 'column must be todo, in_progress, or done');
      return true;
    },
  );
});

test('createCard returns created card payload', async () => {
  mockFindById({ _id: validBoardId, name: 'Board' });
  mockFindOne({ order: 2 });

  const createdCard: CreatedCard = {
    _id: '507f1f77bcf86cd799439012',
    boardId: validBoardId,
    column: 'todo',
    order: 3,
    title: 'Card',
    description: '',
    createdAt,
    updatedAt,
  };

  mockCreate(createdCard);

  const req = { params: { boardId: validBoardId }, body: { title: 'Card', column: 'todo' } };
  const res = createMockResponse();

  await createCard(req as never, res as never);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    _id: createdCard._id,
    boardId: createdCard.boardId,
    column: createdCard.column,
    order: createdCard.order,
    title: createdCard.title,
    description: '',
    createdAt,
    updatedAt,
  });
});

test('reorderCards throws when items is not an array', async () => {
  const req = { params: { boardId: validBoardId }, body: { items: 'nope' } };
  const res = createMockResponse();

  await assert.rejects(
    () => reorderCards(req as never, res as never),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      assert.equal(err.message, 'items must be an array');
      return true;
    },
  );
});

test('reorderCards throws on invalid column', async () => {
  const req = {
    params: { boardId: validBoardId },
    body: { items: [{ cardId: '507f1f77bcf86cd799439012', column: 'nope' }] },
  };
  const res = createMockResponse();

  await assert.rejects(
    () => reorderCards(req as never, res as never),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      assert.equal(err.message, 'column must be todo, in_progress, or done');
      return true;
    },
  );
});

test('reorderCards throws on invalid cardId', async () => {
  const req = {
    params: { boardId: validBoardId },
    body: { items: [{ cardId: 'bad', column: 'todo' }] },
  };
  const res = createMockResponse();

  await assert.rejects(
    () => reorderCards(req as never, res as never),
    (err: unknown) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.status, 400);
      assert.equal(err.message, 'cardId is invalid');
      return true;
    },
  );
});

test('reorderCards updates cards in order', async () => {
  const calls: UpdateOneCall[] = [];
  mockUpdateOne(calls);

  const req = {
    params: { boardId: validBoardId },
    body: {
      items: [
        { cardId: '507f1f77bcf86cd799439012', column: 'todo' },
        { cardId: '507f1f77bcf86cd799439013', column: 'done' },
      ],
    },
  };
  const res = createMockResponse();

  await reorderCards(req as never, res as never);

  assert.deepEqual(calls, [
    {
      filter: { _id: '507f1f77bcf86cd799439012', boardId: validBoardId },
      update: { column: 'todo', order: 0 },
    },
    {
      filter: { _id: '507f1f77bcf86cd799439013', boardId: validBoardId },
      update: { column: 'done', order: 1 },
    },
  ]);
  assert.deepEqual(res.body, { status: 'ok' });
});
