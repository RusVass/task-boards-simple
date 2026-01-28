import { useState, type ChangeEvent } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  createCard,
  deleteCard,
  getBoard,
  reorderCards,
  updateCard,
} from "../api/boardsApi";
import { Column } from "../components/Column";
import { Card } from "../components/Card";
import { CreateCardForm } from "../components/CreateCardForm";
import { useBoard } from "../state/BoardContext";
import { buildReorderPayload, normalizeOrders } from "../state/reorder";
import styles from "./BoardPage.module.scss";

const columns = ["todo", "in_progress", "done"] as const;

type ColumnType = (typeof columns)[number];

type CardInput = {
  title: string;
  description?: string;
};

function isColumnType(value: string): value is ColumnType {
  return columns.includes(value as ColumnType);
}

export function BoardPage() {
  const [boardId, setBoardId] = useState("");
  const { state, dispatch } = useBoard();

  async function loadBoard() {
    dispatch({ type: "LOAD_START" });
    const response = await getBoard(boardId);
    dispatch({ type: "LOAD_SUCCESS", payload: response.data });
  }

  const todo = state.cards.filter((card) => card.column === "todo");
  const inProgress = state.cards.filter(
    (card) => card.column === "in_progress",
  );
  const done = state.cards.filter((card) => card.column === "done");

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const column = over.id as ColumnType;

    dispatch({ type: "MOVE_CARD", payload: { cardId, column } });

    const normalized = normalizeOrders(
      state.cards.map((c) => (c._id === cardId ? { ...c, column } : c)),
    );

    dispatch({ type: "SET_CARDS", payload: { cards: normalized } });

    if (!state.board) return;

    await reorderCards(state.board.publicId, buildReorderPayload(normalized));
  }

  async function handleCreateCard(
    column: "todo" | "in_progress" | "done",
    data: CardInput,
  ) {
    if (!state.board) return;

    const res = await createCard(state.board.publicId, { ...data, column });
    dispatch({ type: "ADD_CARD", payload: { card: res.data } });
  }

  async function handleDeleteCard(cardId: string) {
    if (!state.board) return;
    await deleteCard(state.board.publicId, cardId);
    dispatch({ type: "DELETE_CARD", payload: { cardId } });
  }

  async function handleUpdateCard(cardId: string, data: CardInput) {
    if (!state.board) return;
    const res = await updateCard(state.board.publicId, cardId, data);
    dispatch({ type: "UPDATE_CARD", payload: { card: res.data } });
  }

  function handleBoardIdChange(event: ChangeEvent<HTMLInputElement>) {
    setBoardId(event.target.value);
  }

  function handleCreateTodo(data: CardInput) {
    return handleCreateCard("todo", data);
  }

  function handleCreateInProgress(data: CardInput) {
    return handleCreateCard("in_progress", data);
  }

  function handleCreateDone(data: CardInput) {
    return handleCreateCard("done", data);
  }

  function createEditHandler(cardId: string) {
    return (data: CardInput) => handleUpdateCard(cardId, data);
  }

  function createDeleteHandler(cardId: string) {
    return () => handleDeleteCard(cardId);
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <input
          value={boardId}
          onChange={handleBoardIdChange}
          placeholder="Enter board ID"
        />
        <button type="button" onClick={loadBoard}>
          Load
        </button>
      </div>

      {state.board && (
        <>
          <div className={styles.header}>
            <h2 className={styles.boardTitle}>{state.board.name}</h2>
          </div>

          <DndContext onDragEnd={onDragEnd}>
            <div className={styles.columns}>
              <Column id="todo" title="To Do">
                {todo.map((card) => (
                  <Card
                    key={card._id}
                    id={card._id}
                    title={card.title}
                    description={card.description}
                    onEdit={createEditHandler(card._id)}
                    onDelete={createDeleteHandler(card._id)}
                  />
                ))}
                <CreateCardForm onSubmit={handleCreateTodo} />
              </Column>

              <Column id="in_progress" title="In Progress">
                {inProgress.map((card) => (
                  <Card
                    key={card._id}
                    id={card._id}
                    title={card.title}
                    description={card.description}
                    onEdit={createEditHandler(card._id)}
                    onDelete={createDeleteHandler(card._id)}
                  />
                ))}
              </Column>

              <Column id="done" title="Done">
                {done.map((card) => (
                  <Card
                    key={card._id}
                    id={card._id}
                    title={card.title}
                    description={card.description}
                    onEdit={createEditHandler(card._id)}
                    onDelete={createDeleteHandler(card._id)}
                  />
                ))}
              </Column>
            </div>
          </DndContext>
        </>
      )}
    </div>
  );
}

