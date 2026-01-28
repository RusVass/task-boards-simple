import { describe, expect, it } from "vitest";
import { buildReorderPayload, normalizeOrders } from "./reorder";

type Card = {
  _id: string;
  column: "todo" | "in_progress" | "done";
  order: number;
};

describe("normalizeOrders", () => {
  it("returns empty array for empty input", () => {
    const result = normalizeOrders([]);
    expect(result).toEqual([]);
  });

  it("recalculates orders within each column", () => {
    const cards: Card[] = [
      { _id: "c1", column: "todo", order: 3 },
      { _id: "c2", column: "todo", order: 1 },
      { _id: "c3", column: "done", order: 10 },
      { _id: "c4", column: "done", order: 5 },
    ];

    const result = normalizeOrders(cards);

    expect(result).toEqual([
      { _id: "c2", column: "todo", order: 0 },
      { _id: "c1", column: "todo", order: 1 },
      { _id: "c4", column: "done", order: 0 },
      { _id: "c3", column: "done", order: 1 },
    ]);
  });

  it("keeps columns in fixed order", () => {
    const cards: Card[] = [
      { _id: "c1", column: "done", order: 0 },
      { _id: "c2", column: "todo", order: 0 },
      { _id: "c3", column: "in_progress", order: 0 },
    ];

    const result = normalizeOrders(cards);

    expect(result.map((c) => c._id)).toEqual(["c2", "c3", "c1"]);
  });
});

describe("buildReorderPayload", () => {
  it("returns empty payload for empty input", () => {
    const result = buildReorderPayload([]);
    expect(result).toEqual([]);
  });

  it("sorts by column then order", () => {
    const cards: Card[] = [
      { _id: "c1", column: "done", order: 1 },
      { _id: "c2", column: "todo", order: 2 },
      { _id: "c3", column: "todo", order: 0 },
      { _id: "c4", column: "in_progress", order: 3 },
    ];

    const result = buildReorderPayload(cards);

    expect(result).toEqual([
      { cardId: "c3", column: "todo" },
      { cardId: "c2", column: "todo" },
      { cardId: "c4", column: "in_progress" },
      { cardId: "c1", column: "done" },
    ]);
  });

  it("preserves column value in payload", () => {
    const cards: Card[] = [
      { _id: "c1", column: "todo", order: 0 },
      { _id: "c2", column: "done", order: 0 },
    ];

    const result = buildReorderPayload(cards);

    expect(result).toEqual([
      { cardId: "c1", column: "todo" },
      { cardId: "c2", column: "done" },
    ]);
  });
});
