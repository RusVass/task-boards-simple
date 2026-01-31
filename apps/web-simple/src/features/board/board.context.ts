import { createContext } from 'react';
import type { Dispatch } from 'react';
import type { BoardAction, BoardState } from './board.types';

export interface BoardContextValue {
  state: BoardState;
  dispatch: Dispatch<BoardAction>;
}

export const BoardContext = createContext<BoardContextValue | null>(null);
