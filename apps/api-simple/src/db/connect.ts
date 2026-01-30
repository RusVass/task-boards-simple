import mongoose from 'mongoose';

export const connectDb = async (uri: string) => {
  const normalizedUri = uri.trim();
  if (!normalizedUri) {
    throw new Error('MONGO_URI is missing');
  }

  await mongoose.connect(normalizedUri);
  console.log('MongoDB connected');
};
