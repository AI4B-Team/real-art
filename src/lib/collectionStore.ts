// Collection Store — localStorage-backed, unified system (Boards merged into Collections)

export interface CollectionItem {
  imageId: string;
  photo: string;
  title: string;
  savedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  visibility: "public" | "private";
  accessCode?: string;
  members: number;
  images: number;
  videos: number;
  music: number;
  thumbs: string[];
  items: CollectionItem[];
}

const KEY = "ra_collections";

export const getCollections = (): Collection[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : seedDefaults();
  } catch {
    return seedDefaults();
  }
};

export const saveCollections = (cols: Collection[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(cols));
    window.dispatchEvent(new Event("ra_collections_changed"));
  } catch {}
};

export const addCollection = (col: Omit<Collection, "id">): Collection => {
  const newCol = { ...col, id: `c_${Date.now()}` };
  saveCollections([newCol, ...getCollections()]);
  return newCol;
};

export const updateCollection = (id: string, patch: Partial<Collection>) => {
  saveCollections(getCollections().map(c => c.id === id ? { ...c, ...patch } : c));
};

export const deleteCollection = (id: string) => {
  saveCollections(getCollections().filter(c => c.id !== id));
};

export const addToCollection = (collectionId: string, item: Omit<CollectionItem, "savedAt">) => {
  const cols = getCollections();
  const updated = cols.map(c => {
    if (c.id !== collectionId) return c;
    if (c.items.some(i => i.imageId === item.imageId)) return c;
    return { ...c, items: [{ ...item, savedAt: new Date().toISOString() }, ...c.items] };
  });
  saveCollections(updated);
};

export const removeFromCollection = (collectionId: string, imageId: string) => {
  const cols = getCollections();
  saveCollections(cols.map(c =>
    c.id === collectionId ? { ...c, items: c.items.filter(i => i.imageId !== imageId) } : c
  ));
};

export const mergeCollections = (sourceId: string, targetId: string) => {
  const cols = getCollections();
  const source = cols.find(c => c.id === sourceId);
  const target = cols.find(c => c.id === targetId);
  if (!source || !target) return;
  source.items.forEach(item => {
    if (!target.items.some(i => i.imageId === item.imageId)) {
      target.items.push(item);
    }
  });
  saveCollections(cols.filter(c => c.id !== sourceId));
};

function seedDefaults(): Collection[] {
  const defaults: Collection[] = [
    {
      id: "g1", name: "Main Collection", visibility: "public", members: 0,
      images: 84, videos: 3, music: 2,
      thumbs: ["photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85", "photo-1604881991720-f91add269bed", "photo-1579546929518-9e396f3cc809"],
      items: [
        { imageId: "0", photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", savedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
        { imageId: "4", photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", savedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
        { imageId: "8", photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City", savedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      ],
    },
    {
      id: "g2", name: "Premium Prompts", visibility: "private", accessCode: "XK9F2M", members: 127,
      images: 42, videos: 0, music: 0,
      thumbs: ["photo-1541701494587-cb58502866ab", "photo-1558618666-fcd25c85cd64", "photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85"],
      items: [
        { imageId: "1", photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", savedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
        { imageId: "11", photo: "photo-1576091160550-2173dba999ef", title: "Abstract Fluid", savedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
      ],
    },
    {
      id: "g3", name: "Avatar Collection", visibility: "private", accessCode: "RT7P4Q", members: 64,
      images: 31, videos: 2, music: 1,
      thumbs: ["photo-1604881991720-f91add269bed", "photo-1579546929518-9e396f3cc809", "photo-1541701494587-cb58502866ab", "photo-1558618666-fcd25c85cd64"],
      items: [
        { imageId: "9", photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar 01", savedAt: new Date(Date.now() - 15 * 86400000).toISOString() },
      ],
    },
  ];
  saveCollections(defaults);
  return defaults;
}
