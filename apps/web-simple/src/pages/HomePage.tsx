import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { boardIdSchema, boardNameSchema } from '../features/board/board.schemas';
import { createBoard, getBoard } from '../shared/api/endpoints';
import { getLoadBoardErrorMessage, validateBoardId, validateBoardName } from './home-page.utils';
import s from './HomePage.module.scss';

interface CreateBoardFormValues {
  name: string;
}

interface LoadBoardFormValues {
  boardId: string;
}

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
    const { trimmed, error } = validateBoardName(values.name);
    if (error) {
      setCreateError(error);
      return;
    }

    try {
      const board = await createBoard(trimmed);
      createForm.reset({ name: '' });
      navigate(`/boards/${board.publicId}`);
    } catch {
      setCreateError('Create failed, check API server');
    }
  };

  const handleCreateInvalid: SubmitErrorHandler<CreateBoardFormValues> = (errors) => {
    const message = errors.name?.message;
    if (message) setCreateError(message);
  };

  const handleLoadSubmit: SubmitHandler<LoadBoardFormValues> = async (values) => {
    setLoadError(null);
    const { trimmed, error } = validateBoardId(values.boardId);
    if (error) {
      setLoadError(error);
      return;
    }

    try {
      await getBoard(trimmed);
      navigate(`/boards/${trimmed}`);
    } catch (error: unknown) {
      setLoadError(getLoadBoardErrorMessage(error));
    }
  };

  const handleLoadInvalid: SubmitErrorHandler<LoadBoardFormValues> = (errors) => {
    const message = errors.boardId?.message;
    if (message) setLoadError(message);
  };

  const handleCreateButtonClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const isValid = await createForm.trigger('name');
    if (!isValid) {
      event.preventDefault();
      setCreateError('Field is required');
    }
  };

  const handleLoadButtonClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const isValid = await loadForm.trigger('boardId');
    if (!isValid) {
      event.preventDefault();
      setLoadError('Field is required');
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

  const handleCreateFormSubmit = createForm.handleSubmit(handleCreateSubmit, handleCreateInvalid);
  const handleLoadFormSubmit = loadForm.handleSubmit(handleLoadSubmit, handleLoadInvalid);

  const createValidationError = createForm.formState.errors.name?.message;
  const loadValidationError = loadForm.formState.errors.boardId?.message;
  const createErrorMessage = createValidationError ?? createError;
  const loadErrorMessage = loadValidationError ?? loadError;

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
            <button className={s.button} type="submit" onClick={handleCreateButtonClick}>
              Create
            </button>
          </form>
          {createErrorMessage ? <div className={s.error}>{createErrorMessage}</div> : null}
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
            <button className={s.button} type="submit" onClick={handleLoadButtonClick}>
              Load
            </button>
          </form>
          {loadErrorMessage ? <div className={s.error}>{loadErrorMessage}</div> : null}
        </section>
      </div>
    </div>
  );
};
