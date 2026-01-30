import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createCard, deleteCard, reorderCards, updateCard } from '../controllers/cards.controller';

export const cardsRouter = Router({ mergeParams: true });

cardsRouter.post('/', asyncHandler(createCard));
cardsRouter.patch('/:cardId', asyncHandler(updateCard));
cardsRouter.delete('/:cardId', asyncHandler(deleteCard));
cardsRouter.put('/reorder', asyncHandler(reorderCards));