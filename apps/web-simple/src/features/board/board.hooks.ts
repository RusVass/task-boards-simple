import { useContext } from 'react';
import { BoardContext, type BoardContextValue } from './board.context';

export const useBoardContext = (): BoardContextValue => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoardContext must be used inside BoardProvider');
  return ctx;
};
