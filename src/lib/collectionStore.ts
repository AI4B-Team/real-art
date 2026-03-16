// Unified Collection Store — merges Boards + Collections into one model.
// Old data migrated on first load.

export type CollectionType = "published" | "saved";

export interface CollectionItem {
  imageId: string;
  photo: string;
  title: string;
  savedAt: string;
}

export interface UnifiedCollection {
  id: string;
  title: string;
  description: string;
  type: CollectionType; // "published" = creator gallery, "saved" = personal board
  visibility: "public" | "private";
  coverPhoto?: string;
  bannerPhoto?: string;
  collaborators?: string[];
  accessCode?: string;
  members: number;
  slug: string;
  imageCount: number;
  videoCount: number;
  musicCount: number;
  thumbs: string[];
  items: CollectionItem[];
  createdAt: string;
}

// Backward compat alias
export type Collection = UnifiedCollection;

const KEY = "ra_unified_collections";
const MIGRATED_KEY = "ra_collections_migrated_v2";

// ── CRUD ──

export const getCollections = (): UnifiedCollection[] => {
  try {
    migrateIfNeeded();
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : seedDefaults();
  } catch {
    return seedDefaults();
  }
};

export const saveCollections = (cols: UnifiedCollection[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(cols));
    window.dispatchEvent(new Event("ra_collections_changed"));
    window.dispatchEvent(new Event("ra_boards_changed")); // backward compat
  } catch {}
};

export const addCollection = (col: Omit<UnifiedCollection, "id">): UnifiedCollection => {
  const newCol: UnifiedCollection = { ...col, id: `uc_${Date.now()}` };
  saveCollections([newCol, ...getCollections()]);
  return newCol;
};

export const createSavedCollection = (title: string, visibility: "public" | "private" = "private"): UnifiedCollection => {
  return addCollection({
    title, description: "", type: "saved", visibility,
    members: 0, slug: title.toLowerCase().replace(/\s+/g, "-"),
    imageCount: 0, videoCount: 0, musicCount: 0, thumbs: [], items: [],
    createdAt: new Date().toISOString(),
  });
};

export const createPublishedCollection = (title: string, visibility: "public" | "private" = "public"): UnifiedCollection => {
  return addCollection({
    title, description: "", type: "published", visibility,
    members: 0, slug: title.toLowerCase().replace(/\s+/g, "-"),
    imageCount: 0, videoCount: 0, musicCount: 0, thumbs: [], items: [],
    createdAt: new Date().toISOString(),
  });
};

export const updateCollection = (id: string, patch: Partial<UnifiedCollection>) => {
  saveCollections(getCollections().map(c => c.id === id ? { ...c, ...patch } : c));
};

export const deleteCollection = (id: string) => {
  saveCollections(getCollections().filter(c => c.id !== id));
};

export const addItemToCollection = (id: string, item: Omit<CollectionItem, "savedAt">) => {
  const cols = getCollections().map(c => {
    if (c.id !== id) return c;
    if (c.items?.some(i => i.imageId === item.imageId)) return c;
    const newItem: CollectionItem = { ...item, savedAt: new Date().toISOString() };
    const newItems = [newItem, ...(c.items || [])];
    const newThumbs = newItems.slice(0, 4).map(i => i.photo);
    return { ...c, items: newItems, thumbs: newThumbs, coverPhoto: c.coverPhoto || item.photo };
  });
  saveCollections(cols);
};

// Backward compat alias
export const addToCollection = addItemToCollection;

export const removeItemFromCollection = (id: string, imageId: string) => {
  saveCollections(getCollections().map(c =>
    c.id === id ? { ...c, items: (c.items || []).filter(i => i.imageId !== imageId) } : c
  ));
};

// Backward compat alias
export const removeFromCollection = removeItemFromCollection;

export const mergeCollections = (sourceId: string, targetId: string) => {
  const cols = getCollections();
  const source = cols.find(c => c.id === sourceId);
  const target = cols.find(c => c.id === targetId);
  if (!source || !target) return;
  (source.items || []).forEach(item => {
    if (!(target.items || []).some(i => i.imageId === item.imageId)) {
      target.items = [...(target.items || []), item];
    }
  });
  saveCollections(cols.filter(c => c.id !== sourceId));
};

// ── Migration ──

function migrateIfNeeded() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  try {
    const existing: UnifiedCollection[] = [];

    // Migrate old collections (ra_collections)
    const oldCols = localStorage.getItem("ra_collections");
    if (oldCols) {
      const parsed: any[] = JSON.parse(oldCols);
      parsed.forEach(c => {
        existing.push({
          id: c.id,
          title: c.name || c.title || "Untitled",
          description: c.description || "",
          type: "published" as CollectionType,
          visibility: c.visibility || "public",
          accessCode: c.accessCode,
          members: c.members || 0,
          slug: (c.name || c.title || "untitled").toLowerCase().replace(/\s+/g, "-"),
          imageCount: c.images || 0,
          videoCount: c.videos || 0,
          musicCount: c.music || 0,
          thumbs: c.thumbs || [],
          items: (c.items || []).map((i: any) => ({
            imageId: i.imageId, photo: i.photo, title: i.title, savedAt: i.savedAt || new Date().toISOString(),
          })),
          createdAt: c.createdAt || new Date().toISOString(),
        });
      });
    }

    // Migrate old boards (ra_boards)
    const oldBoards = localStorage.getItem("ra_boards");
    if (oldBoards) {
      const parsed: any[] = JSON.parse(oldBoards);
      parsed.forEach(b => {
        // Skip if already migrated by ID
        if (existing.some(e => e.id === b.id)) return;
        existing.push({
          id: b.id,
          title: b.title || "Untitled Board",
          description: b.description || "",
          type: "saved" as CollectionType,
          visibility: b.visibility || "private",
          coverPhoto: b.coverPhoto,
          bannerPhoto: b.bannerPhoto,
          collaborators: b.collaborators,
          members: 0,
          slug: (b.title || "untitled").toLowerCase().replace(/\s+/g, "-"),
          imageCount: 0, videoCount: 0, musicCount: 0,
          thumbs: (b.items || []).slice(0, 4).map((i: any) => i.photo),
          items: (b.items || []).map((i: any) => ({
            imageId: i.imageId, photo: i.photo, title: i.title, savedAt: i.savedAt || new Date().toISOString(),
          })),
          createdAt: b.createdAt || new Date().toISOString(),
        });
      });
    }

    if (existing.length > 0) {
      localStorage.setItem(KEY, JSON.stringify(existing));
    }
    localStorage.setItem(MIGRATED_KEY, "1");
  } catch {
    localStorage.setItem(MIGRATED_KEY, "1");
  }
}

// ── Seed defaults ──

function seedDefaults(): UnifiedCollection[] {
  const defaults: UnifiedCollection[] = [
    {
      id: "uc_pub_1", title: "Main Collection", description: "My primary published gallery",
      type: "published", visibility: "public", members: 0, slug: "main-collection",
      imageCount: 84, videoCount: 3, musicCount: 2,
      thumbs: ["photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85", "photo-1604881991720-f91add269bed", "photo-1579546929518-9e396f3cc809"],
      items: [
        { imageId: "0", photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", savedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
        { imageId: "4", photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", savedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
        { imageId: "8", photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City", savedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: "uc_pub_2", title: "Premium Prompts", description: "Exclusive prompt packs",
      type: "published", visibility: "private", accessCode: "XK9F2M", members: 127, slug: "premium-prompts",
      imageCount: 42, videoCount: 0, musicCount: 0,
      thumbs: ["photo-1541701494587-cb58502866ab", "photo-1558618666-fcd25c85cd64", "photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85"],
      items: [
        { imageId: "1", photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", savedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
        { imageId: "11", photo: "photo-1576091160550-2173dba999ef", title: "Abstract Fluid", savedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: "uc_saved_1", title: "Inspiration", description: "Images that inspire my work",
      type: "saved", visibility: "private", members: 0, slug: "inspiration",
      imageCount: 0, videoCount: 0, musicCount: 0,
      thumbs: ["photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85", "photo-1579546929518-9e396f3cc809"],
      items: [
        { imageId: "0", photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", savedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
        { imageId: "4", photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", savedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
        { imageId: "8", photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City", savedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "uc_saved_2", title: "Color Studies", description: "Palettes and gradients I love",
      type: "saved", visibility: "public", members: 0, slug: "color-studies",
      imageCount: 0, videoCount: 0, musicCount: 0,
      thumbs: ["photo-1541701494587-cb58502866ab", "photo-1576091160550-2173dba999ef"],
      items: [
        { imageId: "1", photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", savedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
        { imageId: "11", photo: "photo-1576091160550-2173dba999ef", title: "Abstract Fluid", savedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "uc_saved_3", title: "Portraits", description: "AI portrait styles I want to recreate",
      type: "saved", visibility: "private", members: 0, slug: "portraits",
      imageCount: 0, videoCount: 0, musicCount: 0,
      thumbs: ["photo-1604881991720-f91add269bed"],
      items: [
        { imageId: "9", photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar 01", savedAt: new Date(Date.now() - 15 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
  ];
  saveCollections(defaults);
  return defaults;
}
