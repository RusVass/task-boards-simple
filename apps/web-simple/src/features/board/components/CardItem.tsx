import { useState, type ChangeEvent, type DragEvent } from 'react';
import { useParams } from 'react-router-dom';
import type { Card } from '../board.types';
import { useBoardContext } from '../board.context';
import { deleteCard, updateCard } from '../board.actions';
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
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  const handleEdit = () => {
    setIsEdit(true);
  };

  const handleCancel = () => {
    setIsEdit(false);
    setTitle(card.title);
    setDescription(card.description);
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const handleSave = async () => {
    if (!boardId) return;
    await updateCard(dispatch, boardId, card.id, { title, description });
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

  if (isEdit) {
    return (
      <div className={s.card}>
        <div className={s.top}>
          <div className={s.content}>
            <input className={s.editInput} value={title} onChange={handleTitleChange} />
            <textarea
              className={s.editTextarea}
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className={s.actions}>
            <button className={s.iconBtn} type="button" onClick={handleSave} title="Save">
              ✓
            </button>
            <button className={s.iconBtn} type="button" onClick={handleCancel} title="Cancel">
              ×
            </button>
          </div>
        </div>
      </div>
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
