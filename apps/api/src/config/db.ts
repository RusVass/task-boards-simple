import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI);

  mongoose.connection.on('connected', () => {
    console.log('Mongo connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongo connection error', err);
  });
}
