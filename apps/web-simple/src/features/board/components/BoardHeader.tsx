import { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useBoardContext } from '../board.hooks';
import { deleteBoard, renameBoard } from '../board.actions';
import { boardNameSchema, normalizeString } from '../board.schemas';
import s from './BoardHeader.module.scss';

export const BoardHeader = (): JSX.Element => {
  const { boardId: routeBoardId = '' } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useBoardContext();
  const boardId = state.boardId ?? routeBoardId;

  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const renameFormSchema = z.object({ name: boardNameSchema });
  const renameForm = useForm<BoardNameFormValues>({
    resolver: zodResolver(renameFormSchema),
    mode: 'onSubmit',
    defaultValues: { name: '' },
  });

  const nameField = renameForm.register('name');

  const boardName = useMemo(() => state.board?.name ?? '', [state.board?.name]);

  const handleStartRename = () => {
    if (!boardId) return;
    renameForm.reset({ name: boardName });
    renameForm.clearErrors('name');
    setIsRenaming(true);
  };

  const handleRenameSubmit: SubmitHandler<BoardNameFormValues> = async (values) => {
    if (!boardId) return;
    await renameBoard(boardId, normalizeString(values.name), dispatch);
    renameForm.reset({ name: '' });
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    renameForm.reset({ name: '' });
    setIsRenaming(false);
  };

  const handleNameFocus = () => {
    renameForm.clearErrors('name');
  };

  const handleNameInputRef = (node: HTMLInputElement | null) => {
    nameField.ref(node);
    inputRef.current = node;
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

  const handleRenameFormSubmit = renameForm.handleSubmit(handleRenameSubmit);
  const renameValidationError = renameForm.formState.errors.name?.message;
  const isSubmitting = renameForm.formState.isSubmitting;

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
            <div>
              <form className={s.renameBlock} onSubmit={handleRenameFormSubmit}>
                <input
                  {...nameField}
                  ref={handleNameInputRef}
                  className={s.renameInput}
                  onFocus={handleNameFocus}
                  placeholder="New board name"
                />
                <button className={s.renameButton} type="submit" disabled={isSubmitting}>
                  Save
                </button>
                <button className={s.renameButton} type="button" onClick={handleCancelRename}>
                  Cancel
                </button>
              </form>
              {renameValidationError ? <div className={s.error}>{renameValidationError}</div> : null}
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

interface BoardNameFormValues {
  name: string;
}
