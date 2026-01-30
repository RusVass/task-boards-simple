import { useState, type ChangeEvent, type DragEvent, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import type { ColumnId } from '../board.types';
import { createCard, reorderCards as persistReorderCards } from '../board.actions';
import { useBoardContext } from '../board.context';
import { getCardsByColumn, reorderCards as reorderCardsLocal } from '../board.utils';
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
  const [cardTitle, setCardTitle] = useState('');
  const [cardDesc, setCardDesc] = useState('');

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCardTitle(event.target.value);
  };

  const handleDescChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCardDesc(event.target.value);
  };

  const handleStartAdd = () => {
    setCardTitle('');
    setCardDesc('');
    setIsAdding(true);
  };

  const handleAdd = async () => {
    const trimmedTitle = cardTitle.trim();
    if (!trimmedTitle) return;
    if (!boardId) return;

    await createCard(dispatch, boardId, { title: trimmedTitle, description: cardDesc.trim() });
    setCardTitle('');
    setCardDesc('');
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setCardTitle('');
    setCardDesc('');
    setIsAdding(false);
  };

  const isTodoColumn = column === 'todo';
  const shouldShowAddTop = isTodoColumn && cards.length === 0;
  const shouldShowAddBottom = isTodoColumn && cards.length > 0;

  const renderAddBlock = () => (
    <div className={s.addWrap}>
      {isAdding ? (
        <div className={s.form}>
          <input className={s.input} value={cardTitle} onChange={handleTitleChange} placeholder="Title" />
          <textarea
            className={s.textarea}
            value={cardDesc}
            onChange={handleDescChange}
            placeholder="Description"
          />
          <div className={s.actions}>
            <button className={s.button} type="button" onClick={handleAdd}>
              Save
            </button>
            <button className={`${s.button} ${s.buttonSecondary}`} type="button" onClick={handleCancelAdd}>
              Cancel
            </button>
          </div>
        </div>
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
