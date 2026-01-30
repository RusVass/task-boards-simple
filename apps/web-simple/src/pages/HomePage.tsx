import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBoard } from '../shared/api/endpoints';
import s from './HomePage.module.scss';

export const HomePage = (): JSX.Element => {
  const navigate = useNavigate();

  const [createName, setCreateName] = useState('');
  const [loadId, setLoadId] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleCreateNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCreateName(event.target.value);
  };

  const handleLoadIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLoadId(event.target.value);
  };

  const handleCreate = async () => {
    setCreateError(null);

    const validation = validateBoardName(createName);
    if (validation.error) {
      setCreateError(validation.error);
      return;
    }

    try {
      const board = await createBoard(validation.trimmed);
      navigate(`/boards/${board.publicId}`);
    } catch {
      setCreateError('Create failed, check API server');
    }
  };

  const handleLoad = () => {
    setLoadError(null);

    const validation = validateBoardId(loadId);
    if (validation.error) {
      setLoadError(validation.error);
      return;
    }

    navigate(`/boards/${validation.trimmed}`);
  };

  return (
    <div className="container">
      <h1 className={s.title}>Task Boards</h1>

      <div className={s.grid}>
        <section className={s.card}>
          <h2 className={s.cardTitle}>Create board</h2>
          <div className={s.row}>
            <input
              className={s.input}
              value={createName}
              onChange={handleCreateNameChange}
              onFocus={() => setCreateError(null)}
              placeholder="Board name"
            />
            <button className={s.button} type="button" onClick={handleCreate}>
              Create
            </button>
          </div>
          {createError ? <div className={s.error}>{createError}</div> : null}
        </section>

        <section className={s.card}>
          <h2 className={s.cardTitle}>Load board</h2>
          <div className={s.row}>
            <input
              className={s.input}
              value={loadId}
              onChange={handleLoadIdChange}
              onFocus={() => setLoadError(null)}
              placeholder="Paste board id"
            />
            <button className={s.button} type="button" onClick={handleLoad}>
              Load
            </button>
          </div>
          {loadError ? <div className={s.error}>{loadError}</div> : null}
        </section>
      </div>
    </div>
  );
};

export const validateBoardName = (value: string): ValidationResult => {
  return validateRequired(value, 'Board name is required');
};

export const validateBoardId = (value: string): ValidationResult => {
  return validateRequired(value, 'Board id is required');
};

const validateRequired = (value: string, errorMessage: string): ValidationResult => {
  const trimmed = value.trim();
  return {
    trimmed,
    error: trimmed ? null : errorMessage,
  };
};

interface ValidationResult {
  trimmed: string;
  error: string | null;
}
