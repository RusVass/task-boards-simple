import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { boardIdSchema, boardNameSchema, normalizeString } from '../features/board/board.schemas';
import { createBoard, getBoard } from '../shared/api/endpoints';
import s from './HomePage.module.scss';

export const HomePage = (): JSX.Element => {
  const navigate = useNavigate();

  const [createError, setCreateError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const createBoardFormSchema = z.object({ name: boardNameSchema });
  const loadBoardFormSchema = z.object({ boardId: boardIdSchema });

  const createForm = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardFormSchema),
    mode: 'onSubmit',
    defaultValues: { name: '' },
  });

  const loadForm = useForm<LoadBoardFormValues>({
    resolver: zodResolver(loadBoardFormSchema),
    mode: 'onSubmit',
    defaultValues: { boardId: '' },
  });

  const createNameField = createForm.register('name');
  const loadIdField = loadForm.register('boardId');

  const handleCreateSubmit: SubmitHandler<CreateBoardFormValues> = async (values) => {
    setCreateError(null);
    const normalizedName = normalizeString(values.name);

    try {
      const board = await createBoard(normalizedName);
      createForm.reset({ name: '' });
      navigate(`/boards/${board.publicId}`);
    } catch {
      setCreateError('Create failed, check API server');
    }
  };

  const handleLoadSubmit: SubmitHandler<LoadBoardFormValues> = async (values) => {
    setLoadError(null);
    const normalizedId = normalizeString(values.boardId);
    try {
      await getBoard(normalizedId);
      navigate(`/boards/${normalizedId}`);
    } catch (error: unknown) {
      setLoadError(getLoadBoardErrorMessage(error));
    }
  };

  const handleCreateFocus = () => {
    createForm.clearErrors('name');
    setCreateError(null);
  };

  const handleLoadFocus = () => {
    loadForm.clearErrors('boardId');
    setLoadError(null);
  };

  const handleCreateFormSubmit = createForm.handleSubmit(handleCreateSubmit);
  const handleLoadFormSubmit = loadForm.handleSubmit(handleLoadSubmit);

  const createValidationError = createForm.formState.errors.name?.message;
  const loadValidationError = loadForm.formState.errors.boardId?.message;

  return (
    <div className="container">
      <h1 className={s.title}>Task Boards</h1>

      <div className={s.grid}>
        <section className={s.card}>
          <h2 className={s.cardTitle}>Create board</h2>
          <form className={s.row} onSubmit={handleCreateFormSubmit}>
            <input
              {...createNameField}
              className={s.input}
              onFocus={handleCreateFocus}
              placeholder="Board name"
            />
            <button className={s.button} type="submit">
              Create
            </button>
          </form>
          {createValidationError ? <div className={s.error}>{createValidationError}</div> : null}
          {createError ? <div className={s.error}>{createError}</div> : null}
        </section>

        <section className={s.card}>
          <h2 className={s.cardTitle}>Load board</h2>
          <form className={s.row} onSubmit={handleLoadFormSubmit}>
            <input
              {...loadIdField}
              className={s.input}
              onFocus={handleLoadFocus}
              placeholder="Paste board id"
            />
            <button className={s.button} type="submit">
              Load
            </button>
          </form>
          {loadValidationError ? <div className={s.error}>{loadValidationError}</div> : null}
          {loadError ? <div className={s.error}>{loadError}</div> : null}
        </section>
      </div>
    </div>
  );
};

export function getLoadBoardErrorMessage(error: unknown): string {
  const fallback = 'Load failed, check API server';
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { message?: string } } })
      .response;
    const message = response?.data?.message;
    if (response?.status === 404) return message ?? 'Board not found';
    return message ?? fallback;
  }
  return fallback;
}

export function validateBoardName(input: string): { trimmed: string; error: string | null } {
  const trimmed = normalizeString(input);
  if (!trimmed) return { trimmed, error: 'Board name is required' };
  return { trimmed, error: null };
}

export function validateBoardId(input: string): { trimmed: string; error: string | null } {
  const trimmed = normalizeString(input);
  if (!trimmed) return { trimmed, error: 'Board id is required' };
  return { trimmed, error: null };
}

interface CreateBoardFormValues {
  name: string;
}

interface LoadBoardFormValues {
  boardId: string;
}
