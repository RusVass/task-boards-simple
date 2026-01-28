interface MoveCardPayload {
  cardId: string;
  column: string;
}

interface DragEndData {
  activeId: string | number;
  overId: string | number | null;
}

function normalizeId(value: string | number | null): string | null {
  if (value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function getMoveCardPayload(
  data: DragEndData,
): MoveCardPayload | null {
  const cardId = normalizeId(data.activeId);
  const column = normalizeId(data.overId);

  if (!cardId || !column) return null;

  return { cardId, column };
}
