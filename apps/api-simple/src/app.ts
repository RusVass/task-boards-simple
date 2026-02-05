import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { boardsRouter } from './routes/boards.routes';
import { cardsRouter } from './routes/cards.routes';
import { HttpError } from './utils/httpError';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use('/api/boards', boardsRouter);
  app.use('/api/boards/:boardId/cards', cardsRouter);

  app.use((_req, _res, next) => {
    next(new HttpError(404, 'Route not found'));
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof HttpError ? err.message : 'Server error';
    res.status(status).json({ message });
  });

  return app;
};

export const app = createApp();
