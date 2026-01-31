import { useState, type DragEvent, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { ColumnId } from '../board.types';
import { createCard, reorderCards as persistReorderCards } from '../board.actions';
import { useBoardContext } from '../board.context';
import { getCardsByColumn, reorderCards as reorderCardsLocal } from '../board.utils';
import { cardSchema, normalizeString } from '../board.schemas';
import { CardItem } from './CardItem';
import s from './Column.module.scss';

interface ColumnProps {
  column: ColumnId;
  title: string;
}

export const Column = ({ column, title }: ColumnProps): JSX.Element => {
  const { boardId: routeBoardId = '' } = useParams();
  const { state, dispatch } = useBoardContext();
  const boardId = state.boardId ?? routeBoardId;

  const cards = getCardsByColumn(state.cards, column);

  const [isAdding, setIsAdding] = useState(false);

  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    mode: 'onSubmit',
    defaultValues: { title: '', description: '' },
  });

  const titleField = cardForm.register('title');
  const descriptionField = cardForm.register('description');

  const handleStartAdd = () => {
    cardForm.reset({ title: '', description: '' });
    cardForm.clearErrors();
    setIsAdding(true);
  };

  const handleAddSubmit: SubmitHandler<CardFormValues> = async (values) => {
    if (!boardId) return;

    const normalizedTitle = normalizeString(values.title);
    const normalizedDescription = normalizeString(values.description ?? '');

    await createCard(dispatch, boardId, {
      title: normalizedTitle,
      description: normalizedDescription,
      column: 'todo',
    });
    cardForm.reset({ title: '', description: '' });
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    cardForm.reset({ title: '', description: '' });
    cardForm.clearErrors();
    setIsAdding(false);
  };

  const handleAddFormSubmit = cardForm.handleSubmit(handleAddSubmit);
  const titleError = cardForm.formState.errors.title?.message;
  const descriptionError = cardForm.formState.errors.description?.message;

  const isTodoColumn = column === 'todo';
  const shouldShowAddTop = isTodoColumn && cards.length === 0;
  const shouldShowAddBottom = isTodoColumn && cards.length > 0;

  const renderAddBlock = () => (
    <div className={s.addWrap}>
      {isAdding ? (
        <form className={s.form} onSubmit={handleAddFormSubmit}>
          <input {...titleField} className={s.input} placeholder="Title" />
          {titleError ? <div className={s.error}>{titleError}</div> : null}
          <textarea {...descriptionField} className={s.textarea} placeholder="Description" />
          {descriptionError ? <div className={s.error}>{descriptionError}</div> : null}
          <div className={s.actions}>
            <button className={s.button} type="submit">
              Save
            </button>
            <button className={`${s.button} ${s.buttonSecondary}`} type="button" onClick={handleCancelAdd}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className={s.form}>
          <button className={`${s.button} ${s.addButton}`} type="button" onClick={handleStartAdd} aria-label="Add card">
            +
          </button>
        </div>
      )}
    </div>
  );

  const handleDragStart = (cardId: string, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', cardId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (draggedId: string, toIndex: number, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!draggedId || !boardId) return;

    const nextCards = reorderCardsLocal(state.cards, draggedId, column, toIndex);
    dispatch({ type: 'CARDS_REORDERED', payload: { cards: nextCards } });
    void persistReorderCards(dispatch, boardId, nextCards);
  };

  const handleDropOnCard = (targetCardId: string, event: DragEvent<HTMLDivElement>) => {
    const draggedId = event.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetCardId) return;
    const targetIndex = cards.findIndex((card) => card.id === targetCardId);
    if (targetIndex < 0) return;
    handleDrop(draggedId, targetIndex, event);
  };

  const handleDropOnList = (event: DragEvent<HTMLDivElement>) => {
    const draggedId = event.dataTransfer.getData('text/plain');
    handleDrop(draggedId, cards.length, event);
  };

  return (
    <section className={s.col} onDrop={handleDropOnList} onDragOver={handleDragOver}>
      <h2 className={s.title}>{title}</h2>

      {shouldShowAddTop ? renderAddBlock() : null}

      <div className={s.list} onDrop={handleDropOnList} onDragOver={handleDragOver}>
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onDragStart={handleDragStart}
            onDropOnCard={handleDropOnCard}
            onDragOverCard={handleDragOver}
          />
        ))}
      </div>

      {shouldShowAddBottom ? renderAddBlock() : null}
    </section>
  );
};

interface CardFormValues {
  title: string;
  description?: string;
}
