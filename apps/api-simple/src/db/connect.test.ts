import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import mongoose, { type Mongoose } from 'mongoose';
import { connectDb } from './connect';

type ConnectCalls = string[];

let connectCalls: ConnectCalls = [];
let logCalls: string[] = [];

const originalConnect = mongoose.connect;
const originalLog = console.log;

beforeEach(() => {
  connectCalls = [];
  logCalls = [];

  mongoose.connect = (async (uri: string) => {
    connectCalls.push(uri);
    return mongoose as Mongoose;
  }) as typeof mongoose.connect;

  console.log = (...args: unknown[]) => {
    logCalls.push(args.map(String).join(' '));
  };
});

afterEach(() => {
  mongoose.connect = originalConnect;
  console.log = originalLog;
});

test('connectDb throws when uri is empty', async () => {
  await assert.rejects(
    () => connectDb(''),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'MONGO_URI is missing');
      return true;
    },
  );
});

test('connectDb throws when uri is whitespace', async () => {
  await assert.rejects(
    () => connectDb('   '),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'MONGO_URI is missing');
      return true;
    },
  );
});

test('connectDb connects and logs on valid uri', async () => {
  const uri = 'mongodb://localhost:27017/test';

  await connectDb(uri);

  assert.deepEqual(connectCalls, [uri]);
  assert.deepEqual(logCalls, ['MongoDB connected']);
});
