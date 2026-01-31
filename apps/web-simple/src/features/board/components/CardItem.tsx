import { useState, type DragEvent } from 'react';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { Card } from '../board.types';
import { useBoardContext } from '../board.hooks';
import { deleteCard, updateCard } from '../board.actions';
import { cardSchema, normalizeString } from '../board.schemas';
import s from './CardItem.module.scss';

interface CardItemProps {
  card: Card;
  onDragStart: (cardId: string, event: DragEvent<HTMLDivElement>) => void;
  onDropOnCard: (cardId: string, event: DragEvent<HTMLDivElement>) => void;
  onDragOverCard: (event: DragEvent<HTMLDivElement>) => void;
}

export const CardItem = ({
  card,
  onDragStart,
  onDropOnCard,
  onDragOverCard,
}: CardItemProps): JSX.Element => {
  const { boardId: routeBoardId = '' } = useParams();
  const { state, dispatch } = useBoardContext();
  const boardId = state.boardId ?? routeBoardId;

  const [isEdit, setIsEdit] = useState(false);

  const editForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    mode: 'onSubmit',
    defaultValues: { title: card.title, description: card.description ?? '' },
  });

  const titleField = editForm.register('title');
  const descriptionField = editForm.register('description');

  const handleEdit = () => {
    editForm.reset({ title: card.title, description: card.description ?? '' });
    editForm.clearErrors();
    setIsEdit(true);
  };

  const handleCancel = () => {
    editForm.reset({ title: card.title, description: card.description ?? '' });
    editForm.clearErrors();
    setIsEdit(false);
  };

  const handleSaveSubmit: SubmitHandler<CardFormValues> = async (values) => {
    if (!boardId) return;

    await updateCard(dispatch, boardId, card.id, {
      title: normalizeString(values.title),
      description: normalizeString(values.description ?? ''),
    });
    setIsEdit(false);
  };

  const handleDelete = async () => {
    if (!boardId) return;
    const ok = window.confirm('Delete card?');
    if (!ok) return;
    await deleteCard(dispatch, boardId, card.id);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    onDragStart(card.id, event);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    onDropOnCard(card.id, event);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    onDragOverCard(event);
  };

  const handleEditFormSubmit = editForm.handleSubmit(handleSaveSubmit);
  const titleError = editForm.formState.errors.title?.message;
  const descriptionError = editForm.formState.errors.description?.message;
  const isSubmitting = editForm.formState.isSubmitting;

  if (isEdit) {
    return (
      <form className={s.card} onSubmit={handleEditFormSubmit}>
        <div className={s.top}>
          <div className={s.content}>
            <input {...titleField} className={s.editInput} />
            {titleError ? <div className={s.error}>{titleError}</div> : null}
            <textarea {...descriptionField} className={s.editTextarea} />
            {descriptionError ? <div className={s.error}>{descriptionError}</div> : null}
          </div>
          <div className={s.actions}>
            <button className={s.iconBtn} type="submit" disabled={isSubmitting} title="Save">
              ✓
            </button>
            <button className={s.iconBtn} type="button" onClick={handleCancel} title="Cancel">
              ×
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div
      className={s.card}
      draggable={!isEdit}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className={s.top}>
        <div className={s.content}>
          <h3 className={s.title}>{card.title}</h3>
          {card.description ? <p className={s.desc}>{card.description}</p> : null}
        </div>

        <div className={s.actions}>
          <button className={s.iconBtn} type="button" onClick={handleEdit} title="Edit">
            ✎
          </button>
          <button className={`${s.iconBtn} ${s.danger}`} type="button" onClick={handleDelete} title="Delete">
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};

interface CardFormValues {
  title: string;
  description?: string;
}
