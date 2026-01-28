export type ColumnType = "todo" | "in_progress" | "done";

export type Card = {
  _id: string;
  title: string;
  description?: string;
  column: ColumnType;
  order: number;
};
