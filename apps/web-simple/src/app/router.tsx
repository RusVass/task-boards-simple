import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { BoardPage } from '../pages/BoardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/boards/:boardId', element: <BoardPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
