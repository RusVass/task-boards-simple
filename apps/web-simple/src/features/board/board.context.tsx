import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { boardReducer, initialBoardState } from './board.reducer';
import type { BoardAction, BoardState } from './board.types';

type BoardContextValue = {
  state: BoardState;
  dispatch: Dispatch<BoardAction>;
};

const BoardContext = createContext<BoardContextValue | null>(null);

export const BoardProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [state, dispatch] = useReducer(boardReducer, initialBoardState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export const useBoardContext = (): BoardContextValue => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoardContext must be used inside BoardProvider');
  return ctx;
};
