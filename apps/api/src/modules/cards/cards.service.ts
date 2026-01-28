import { CardModel } from './card.model';

export async function createCard(params: {
  boardId: string;
  column: string;
  title: string;
  description?: string;
}) {
  const lastCard = await CardModel.find({ boardId: params.boardId, column: params.column })
    .sort({ order: -1 })
    .limit(1)
    .lean();

  const nextOrder = lastCard[0]?.order ?? -1;

  return CardModel.create({
    boardId: params.boardId,
    column: params.column,
    order: nextOrder + 1,
    title: params.title,
    description: params.description,
  });
}

export async function updateCard(cardId: string, data: { title: string; description?: string }) {
  return CardModel.findByIdAndUpdate(cardId, data, { new: true }).lean();
}

export async function deleteCard(cardId: string) {
  return CardModel.findByIdAndDelete(cardId);
}

export async function reorderCards(
  boardId: string,
  items: { cardId: string; column: string }[],
) {
  const operations = items.map((item, index) => ({
    updateOne: {
      filter: { _id: item.cardId, boardId },
      update: { column: item.column, order: index },
    },
  }));

  if (operations.length === 0) return;

  await CardModel.bulkWrite(operations);
}
