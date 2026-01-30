import express from 'express';
import { boardsRouter } from './routes/boards.routes';
import { cardsRouter } from './routes/cards.routes';
import { HttpError } from './utils/httpError';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  app.options(/.*/, (_req, res) => {
    res.sendStatus(204);
  });

  app.use('/api/boards', boardsRouter);
  app.use('/api/boards/:boardId/cards', cardsRouter);

  app.use((_req, _res, next) => {
    next(new HttpError(404, 'Route not found'));
  });

  app.use((err: unknown, _req: unknown, res: express.Response, _next: unknown) => {
    const status = Number((err as { status?: number })?.status) || 500;
    const message = String((err as { message?: string })?.message || 'Server error');
    res.status(status).json({ message });
  });

  return app;
};

export const app = createApp();
