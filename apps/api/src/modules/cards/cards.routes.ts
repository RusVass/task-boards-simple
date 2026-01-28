import { Router } from 'express';
import {
  createCardHandler,
  reorderCardsHandler,
  updateCardHandler,
  deleteCardHandler,
} from './cards.controller';

export const cardsRouter = Router({ mergeParams: true });

cardsRouter.post('/', createCardHandler);
cardsRouter.put('/reorder', reorderCardsHandler);
cardsRouter.patch('/:cardId', updateCardHandler);
cardsRouter.delete('/:cardId', deleteCardHandler);
