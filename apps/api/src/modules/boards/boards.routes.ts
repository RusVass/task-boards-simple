import { Router } from 'express';
import {
  createBoardHandler,
  getBoardHandler,
  updateBoardHandler,
  deleteBoardHandler,
} from './boards.controller';
import { cardsRouter } from '../cards/cards.routes';

export const boardsRouter = Router();

boardsRouter.post('/', createBoardHandler);
boardsRouter.get('/:publicId', getBoardHandler);
boardsRouter.patch('/:publicId', updateBoardHandler);
boardsRouter.delete('/:publicId', deleteBoardHandler);
boardsRouter.use('/:publicId/cards', cardsRouter);