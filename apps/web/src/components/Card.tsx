import { useState, type ChangeEvent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FaTrash, FaEdit } from 'react-icons/fa';
import styles from './Card.module.scss';

type Props = {
  id: string;
  title: string;
  description?: string;
  onEdit: (data: { title: string; description?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function Card({ id, title, description, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [nextTitle, setNextTitle] = useState(title);
  const [nextDescription, setNextDescription] = useState(description ?? '');

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: isEditing,
  });

  async function handleSave() {
    await onEdit({ title: nextTitle, description: nextDescription });
    setIsEditing(false);
  }

  function handleToggleEdit() {
    setIsEditing((value) => !value);
  }

  function handleCancelEdit() {
    setIsEditing(false);
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setNextTitle(event.target.value);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setNextDescription(event.target.value);
  }

  function handleActionPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  async function handleDelete() {
    const ok = window.confirm('Delete this card');
    if (!ok) return;
    await onDelete();
  }

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className={styles.card}
      style={dragStyle}
      {...listeners}
      {...attributes}
    >
      <div className={styles.header}>
        {!isEditing && (
          <div
            className={`${styles.title} ${styles.dragHandle}`}
          >
            {title}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleToggleEdit}
            onPointerDown={handleActionPointerDown}
            aria-label="Edit"
          >
            <FaEdit />
          </button>

          <button
            type="button"
            className={styles.iconBtnDanger}
            onClick={handleDelete}
            onPointerDown={handleActionPointerDown}
            aria-label="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {!isEditing && <div className={styles.description}>{description}</div>}

      {isEditing && (
        <div className={styles.editForm}>
          <input
            value={nextTitle}
            onChange={handleTitleChange}
            placeholder="Title"
          />
          <textarea
            value={nextDescription}
            onChange={handleDescriptionChange}
            placeholder="Description"
          />
          <div className={styles.editActions}>
            <button type="button" onClick={handleSave}>
              Save
            </button>
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
