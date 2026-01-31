import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { boardIdSchema, boardNameSchema, normalizeString } from '../features/board/board.schemas';
import { createBoard } from '../shared/api/endpoints';
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

  const handleLoadSubmit: SubmitHandler<LoadBoardFormValues> = (values) => {
    setLoadError(null);
    const normalizedId = normalizeString(values.boardId);
    navigate(`/boards/${normalizedId}`);
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

interface CreateBoardFormValues {
  name: string;
}

interface LoadBoardFormValues {
  boardId: string;
}
