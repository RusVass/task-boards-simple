import { useMemo, useRef, useState, useEffect, type ChangeEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBoardContext } from '../board.context';
import { deleteBoard, renameBoard } from '../board.actions';
import s from './BoardHeader.module.scss';

export const BoardHeader = (): JSX.Element => {
  const { boardId: routeBoardId = '' } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useBoardContext();
  const boardId = state.boardId ?? routeBoardId;

  const [name, setName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const boardName = useMemo(() => state.board?.name ?? '', [state.board?.name]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleStartRename = () => {
    if (!boardId) return;
    setName(boardName);
    setIsRenaming(true);
  };

  const handleSaveRename = async () => {
    if (!boardId) return;
    await renameBoard(boardId, name || boardName, dispatch);
    setName('');
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setName('');
    setIsRenaming(false);
  };

  useEffect(() => {
    if (!isRenaming) return;
    inputRef.current?.focus();
  }, [isRenaming]);

  const handleDelete = async () => {
    if (!boardId) return;
    const ok = window.confirm('Delete board and all cards?');
    if (!ok) return;

    try {
      await deleteBoard(boardId);
      navigate('/');
    } catch {
      dispatch({ type: 'LOAD_BOARD_ERROR', payload: { message: 'Delete failed' } });
    }
  };

  return (
    <>
      <div className={s.header}>
        <div className={s.left}>
          <Link className={s.backButton} to="/" aria-label="Back">
            ←
          </Link>
          <h1 className={s.title}>{boardName || 'Board'}</h1>
          <span className={s.idLabel}>ID</span>
          <input
            className={s.idInput}
            value={boardId}
            readOnly
            placeholder="Board id"
            aria-label="Board id"
          />
        </div>

        <div className={s.right}>
          {isRenaming ? (
            <div className={s.renameBlock}>
              <input
                ref={inputRef}
                className={s.renameInput}
                value={name}
                onChange={handleNameChange}
                placeholder="New board name"
              />
              <button className={s.renameButton} type="button" onClick={handleSaveRename}>
                Save
              </button>
              <button className={s.renameButton} type="button" onClick={handleCancelRename}>
                Cancel
              </button>
            </div>
          ) : (
            <button className={s.iconButton} type="button" onClick={handleStartRename} aria-label="Rename">
              ✎
            </button>
          )}
          <button
            className={`${s.iconButton} ${s.danger}`}
            type="button"
            onClick={handleDelete}
            aria-label="Delete"
          >
            🗑
          </button>
        </div>
      </div>

      {state.error ? <div className={s.error}>{state.error}</div> : null}
    </>
  );
};
