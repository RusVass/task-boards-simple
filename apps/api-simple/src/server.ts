import 'dotenv/config';
import { app } from './app';
import { connectDb } from './db/connect';

const PORT = Number(process.env.PORT) || 4000;

const start = async () => {
  await connectDb(process.env.MONGO_URI as string);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
