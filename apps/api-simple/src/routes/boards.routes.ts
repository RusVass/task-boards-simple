import { Router } from 'express';
import { createBoard, deleteBoard, getBoard, updateBoard } from '../controllers/boards.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const boardsRouter = Router();

boardsRouter.post('/', asyncHandler(createBoard));
boardsRouter.get('/:boardId', asyncHandler(getBoard));
boardsRouter.patch('/:boardId', asyncHandler(updateBoard));
boardsRouter.delete('/:boardId', asyncHandler(deleteBoard));
