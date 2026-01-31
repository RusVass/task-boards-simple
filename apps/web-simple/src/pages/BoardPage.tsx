import { useEffect, type JSX } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBoardContext } from '../features/board/board.hooks';
import { BoardProvider } from '../features/board/board.provider';
import { loadBoard } from '../features/board/board.actions';
import { BoardHeader } from '../features/board/components/BoardHeader';
import { BoardColumns } from '../features/board/components/BoardColumns';

const BoardPageInner = (): JSX.Element => {
  const { boardId = '' } = useParams();
  const { state, dispatch } = useBoardContext();

  useEffect(() => {
    if (!boardId) return;
    loadBoard(dispatch, boardId);
  }, [boardId, dispatch]);

  if (state.isLoading) {
    return (
      <div className="container">
        <BoardHeader />
        <p>Loading...</p>
      </div>
    );
  }

  if (state.isNotFound) {
    return (
      <div className="container">
        <h1>Board not found</h1>
        <p>Board with ID {boardId} does not exist.</p>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <BoardHeader />
      <BoardColumns />
    </div>
  );
};

export const BoardPage = (): JSX.Element => {
  return (
    <BoardProvider>
      <BoardPageInner />
    </BoardProvider>
  );
};
