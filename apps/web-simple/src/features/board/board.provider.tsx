import { useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { BoardContext } from './board.context';
import { boardReducer, initialBoardState } from './board.reducer';

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider = ({ children }: BoardProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(boardReducer, initialBoardState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};
