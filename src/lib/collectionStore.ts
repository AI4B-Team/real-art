// Collection Store — localStorage-backed, shared between Dashboard + Upload
export interface Collection {
  id: string;
  name: string;
  free: boolean; // true = public
  code: string;
  members: number;
  slug: string;
  images: number;
  videos: number;
  music: number;
  thumbs: string[];
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
  const newCol = { ...col, id: `g_${Date.now()}` };
  saveCollections([newCol, ...getCollections()]);
  return newCol;
};

export const updateCollection = (id: string, patch: Partial<Collection>) => {
  saveCollections(getCollections().map(c => c.id === id ? { ...c, ...patch } : c));
};

export const deleteCollection = (id: string) => {
  saveCollections(getCollections().filter(c => c.id !== id));
};

function seedDefaults(): Collection[] {
  const defaults: Collection[] = [
    {
      id: "g1", name: "Main Collection", free: true, code: "", members: 0,
      slug: "main-collection", images: 84, videos: 3, music: 2,
      thumbs: ["photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85", "photo-1604881991720-f91add269bed", "photo-1579546929518-9e396f3cc809"],
    },
    {
      id: "g2", name: "Premium Prompts", free: false, code: "XK9F2M", members: 127,
      slug: "premium-prompts", images: 42, videos: 0, music: 0,
      thumbs: ["photo-1541701494587-cb58502866ab", "photo-1558618666-fcd25c85cd64", "photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85"],
    },
    {
      id: "g3", name: "Avatar Collection", free: false, code: "RT7P4Q", members: 64,
      slug: "avatar-collection", images: 31, videos: 2, music: 1,
      thumbs: ["photo-1604881991720-f91add269bed", "photo-1579546929518-9e396f3cc809", "photo-1541701494587-cb58502866ab", "photo-1558618666-fcd25c85cd64"],
    },
  ];
  saveCollections(defaults);
  return defaults;
}
