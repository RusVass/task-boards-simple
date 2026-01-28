type ColumnType = "todo" | "in_progress" | "done";

type Card = {
  _id: string;
  column: ColumnType;
  order: number;
};

const columns: ColumnType[] = ["todo", "in_progress", "done"];

export function normalizeOrders(cards: Card[]): Card[] {
  const next: Card[] = [];

  for (const col of columns) {
    const group = cards
      .filter((c) => c.column === col)
      .sort((a, b) => a.order - b.order);

    group.forEach((c, index) => {
      next.push({ ...c, order: index });
    });
  }

  return next;
}

export function buildReorderPayload(cards: Card[]) {
  const sorted = [...cards].sort((a, b) => {
    if (a.column === b.column) return a.order - b.order;
    return a.column.localeCompare(b.column);
  });

  return sorted.map((c) => ({ cardId: c._id, column: c.column }));
}
