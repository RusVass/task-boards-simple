import { COLUMNS } from '../board.utils';
import { Column } from './Column';
import s from './BoardColumns.module.scss';

export const BoardColumns = (): JSX.Element => {
  return (
    <div className={s.grid}>
      {COLUMNS.map((column) => (
        <Column key={column.key} column={column.key} title={column.title} />
      ))}
    </div>
  );
};
