// Board Store — localStorage-backed, shared across the app
export interface BoardItem {
  imageId: string;
  photo: string;
  title: string;
  savedAt: string;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  visibility: "public" | "private";
  coverPhoto?: string;
  bannerPhoto?: string;
  collaborators?: string[];
  createdAt: string;
  items: BoardItem[];
}

const KEY = "ra_boards";

export const getBoards = (): Board[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : getDefaultBoards();
  } catch {
    return getDefaultBoards();
  }
};

export const saveBoards = (boards: Board[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(boards));
    window.dispatchEvent(new Event("ra_boards_changed"));
  } catch {}
};

export const createBoard = (title: string, visibility: "public" | "private" = "private"): Board => {
  const board: Board = {
    id: `b_${Date.now()}`,
    title,
    description: "",
    visibility,
    createdAt: new Date().toISOString(),
    items: [],
  };
  const boards = getBoards();
  saveBoards([board, ...boards]);
  return board;
};

export const addToBoard = (boardId: string, item: Omit<BoardItem, "savedAt">) => {
  const boards = getBoards();
  const updated = boards.map(b => {
    if (b.id !== boardId) return b;
    if (b.items.some(i => i.imageId === item.imageId)) return b;
    return { ...b, items: [{ ...item, savedAt: new Date().toISOString() }, ...b.items] };
  });
  saveBoards(updated);
};

export const removeFromBoard = (boardId: string, imageId: string) => {
  const boards = getBoards();
  saveBoards(boards.map(b =>
    b.id === boardId ? { ...b, items: b.items.filter(i => i.imageId !== imageId) } : b
  ));
};

export const deleteBoard = (boardId: string) => {
  saveBoards(getBoards().filter(b => b.id !== boardId));
};

export const updateBoard = (boardId: string, patch: Partial<Pick<Board, "title" | "description" | "visibility" | "coverPhoto" | "bannerPhoto" | "collaborators">>) => {
  saveBoards(getBoards().map(b => b.id === boardId ? { ...b, ...patch } : b));
};

function getDefaultBoards(): Board[] {
  const defaults: Board[] = [
    {
      id: "b_default_1",
      title: "Inspiration",
      description: "Images that inspire my work",
      visibility: "private",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      items: [
        { imageId: "0", photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", savedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
        { imageId: "4", photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", savedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
        { imageId: "8", photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City", savedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      ],
    },
    {
      id: "b_default_2",
      title: "Color Studies",
      description: "Palettes and gradients I love",
      visibility: "public",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      items: [
        { imageId: "1", photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", savedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
        { imageId: "11", photo: "photo-1576091160550-2173dba999ef", title: "Abstract Fluid", savedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
      ],
    },
    {
      id: "b_default_3",
      title: "Portraits",
      description: "AI portrait styles I want to recreate",
      visibility: "private",
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
      items: [
        { imageId: "9", photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar 01", savedAt: new Date(Date.now() - 15 * 86400000).toISOString() },
      ],
    },
  ];
  saveBoards(defaults);
  return defaults;
}
