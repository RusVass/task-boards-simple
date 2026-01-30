import { useEffect, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { BoardProvider, useBoardContext } from '../features/board/board.context';
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
