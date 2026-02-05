import type { ColumnId } from './board.types';

export const STATUS_LABELS: Record<ColumnId, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const STATUS_ORDER: ColumnId[] = ['todo', 'in_progress', 'done'];

export const COLUMNS = STATUS_ORDER.map((key) => ({ key, title: STATUS_LABELS[key] }));
