// Board Store — shim that delegates to the unified collectionStore.
// Keeps backward-compat API so existing pages (BoardDetailPage, CreatorPage) keep working.

import {
  getCollections, saveCollections, createSavedCollection,
  addItemToCollection, removeItemFromCollection, updateCollection, deleteCollection,
  type UnifiedCollection, type CollectionItem,
} from "@/lib/collectionStore";

// Re-export old types as aliases
export type BoardItem = CollectionItem;
export type Board = UnifiedCollection;

export const getBoards = (): Board[] =>
  getCollections().filter(c => c.type === "saved");

export const saveBoards = (boards: Board[]) => {
  // Replace only saved-type collections, keep published ones
  const published = getCollections().filter(c => c.type === "published");
  saveCollections([...boards, ...published]);
};

export const createBoard = (title: string, visibility: "public" | "private" = "private"): Board => {
  return createSavedCollection(title, visibility);
};

export const addToBoard = (boardId: string, item: Omit<BoardItem, "savedAt">) => {
  addItemToCollection(boardId, item);
};

export const removeFromBoard = (boardId: string, imageId: string) => {
  removeItemFromCollection(boardId, imageId);
};

export const deleteBoard = (boardId: string) => {
  deleteCollection(boardId);
};

export const updateBoard = (boardId: string, patch: Partial<Pick<Board, "title" | "description" | "visibility" | "coverPhoto" | "bannerPhoto" | "collaborators">>) => {
  updateCollection(boardId, patch);
};
