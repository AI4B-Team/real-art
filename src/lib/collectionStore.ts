// Unified Collection Store — merges Boards + Collections into one model.

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
  type: CollectionType;
  visibility: "public" | "private";
  coverPhoto?: string;
  bannerPhoto?: string;
  accessCode?: string;
  price?: number; // cents
  communityId?: string;
  communityName?: string;
  collaborators: string[];
  archived?: boolean;
  mergedFrom?: string[];
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
    window.dispatchEvent(new Event("ra_boards_changed"));
  } catch {}
};

export const addCollection = (col: Omit<UnifiedCollection, "id">): UnifiedCollection => {
  const c: UnifiedCollection = { ...col, id: `uc_${Date.now()}` };
  saveCollections([c, ...getCollections()]);
  return c;
};

export const createSavedCollection = (title: string, visibility: "public" | "private" = "private"): UnifiedCollection =>
  addCollection({
    title, description: "", type: "saved", visibility, collaborators: [],
    members: 0, slug: title.toLowerCase().replace(/\s+/g, "-"),
    imageCount: 0, videoCount: 0, musicCount: 0, thumbs: [], items: [],
    createdAt: new Date().toISOString(),
  });

export const createPublishedCollection = (title: string, visibility: "public" | "private" = "public"): UnifiedCollection =>
  addCollection({
    title, description: "", type: "published", visibility, collaborators: [],
    members: 0, slug: title.toLowerCase().replace(/\s+/g, "-"),
    imageCount: 0, videoCount: 0, musicCount: 0, thumbs: [], items: [],
    createdAt: new Date().toISOString(),
  });

export const updateCollection = (id: string, patch: Partial<UnifiedCollection>) =>
  saveCollections(getCollections().map(c => c.id === id ? { ...c, ...patch } : c));

export const deleteCollection = (id: string) =>
  saveCollections(getCollections().filter(c => c.id !== id));

export const archiveCollection = (id: string) => updateCollection(id, { archived: true });
export const unarchiveCollection = (id: string) => updateCollection(id, { archived: false });

export const addItemToCollection = (id: string, item: Omit<CollectionItem, "savedAt">) => {
  saveCollections(getCollections().map(c => {
    if (c.id !== id) return c;
    if (c.items?.some(i => i.imageId === item.imageId)) return c;
    const newItems = [{ ...item, savedAt: new Date().toISOString() }, ...c.items];
    return { ...c, items: newItems, thumbs: newItems.slice(0, 4).map(i => i.photo), imageCount: newItems.length, coverPhoto: c.coverPhoto || item.photo };
  }));
};

// Backward compat alias
export const addToCollection = addItemToCollection;

export const removeItemFromCollection = (id: string, imageId: string) =>
  saveCollections(getCollections().map(c =>
    c.id === id ? { ...c, items: (c.items || []).filter(i => i.imageId !== imageId) } : c
  ));

// Backward compat alias
export const removeFromCollection = removeItemFromCollection;

export const mergeCollections = (targetId: string, sourceIds: string[]): void => {
  const all = getCollections();
  const target = all.find(c => c.id === targetId);
  if (!target) return;
  const sources = all.filter(c => sourceIds.includes(c.id));
  const allItems = [...target.items];
  const seenIds = new Set(allItems.map(i => i.imageId));
  for (const src of sources)
    for (const item of src.items)
      if (!seenIds.has(item.imageId)) { allItems.push(item); seenIds.add(item.imageId); }
  const newThumbs = allItems.slice(0, 4).map(i => i.photo);
  saveCollections(all.filter(c => !sourceIds.includes(c.id)).map(c =>
    c.id === targetId ? { ...c, items: allItems, thumbs: newThumbs, imageCount: allItems.length, mergedFrom: [...(c.mergedFrom || []), ...sourceIds] } : c
  ));
};

// ── Access Control ──

export const grantAccess = (id: string) => {
  try {
    const g = JSON.parse(sessionStorage.getItem("ra_access_granted") || "[]");
    if (!g.includes(id)) sessionStorage.setItem("ra_access_granted", JSON.stringify([...g, id]));
  } catch {}
};

export const hasAccess = (col: UnifiedCollection): boolean => {
  if (col.visibility === "public") return true;
  try {
    return (JSON.parse(sessionStorage.getItem("ra_access_granted") || "[]") as string[]).includes(col.id);
  } catch { return false; }
};

// ── Smart Suggest ──

const TOPIC_GROUPS: Record<string, string[]> = {
  cosmic: ["cosmic", "space", "nebula", "galaxy", "celestial", "stars", "universe", "astral"],
  cyber: ["cyberpunk", "neon", "futuristic", "holographic", "tech", "digital", "glitch", "synth"],
  abstract: ["abstract", "fluid", "gradient", "generative", "fractal", "geometric", "surreal"],
  nature: ["nature", "mountain", "landscape", "ocean", "forest", "water", "sunset", "sky"],
  portrait: ["portrait", "face", "figure", "human", "model", "character", "person"],
  fashion: ["fashion", "style", "outfit", "couture", "textile", "fabric", "wear"],
  fantasy: ["fantasy", "magic", "mythical", "dragon", "fairy", "enchanted", "medieval"],
  architecture: ["architecture", "building", "interior", "urban", "city", "structure"],
  art3d: ["3d", "render", "blender", "sculpt", "cgi", "voxel", "lowpoly"],
  music: ["music", "audio", "sound", "beat", "synth", "vinyl", "instrument"],
};

export const suggestCollection = (
  title?: string,
  prompt?: string,
  tags?: string[]
): UnifiedCollection | null => {
  const cols = getCollections().filter(c => !c.archived);
  if (cols.length === 0) return null;

  const words = [
    ...(title || "").toLowerCase().split(/\s+/),
    ...(prompt || "").toLowerCase().split(/\s+/),
    ...(tags || []).map(t => t.toLowerCase()),
  ].filter(Boolean);

  // Level 1: Direct title-word match
  for (const col of cols) {
    const colWords = col.title.toLowerCase().split(/\s+/);
    if (colWords.some(cw => cw.length > 2 && words.includes(cw))) return col;
  }

  // Level 2: Topic group match
  for (const col of cols) {
    const colLower = col.title.toLowerCase();
    for (const [, keywords] of Object.entries(TOPIC_GROUPS)) {
      const colMatchesTopic = keywords.some(k => colLower.includes(k));
      const imageMatchesTopic = keywords.some(k => words.includes(k));
      if (colMatchesTopic && imageMatchesTopic) return col;
    }
  }

  // Level 3: Most recently used (has items, sorted by latest savedAt)
  const withItems = cols
    .filter(c => c.items.length > 0)
    .sort((a, b) => {
      const aLatest = a.items[0]?.savedAt || a.createdAt;
      const bLatest = b.items[0]?.savedAt || b.createdAt;
      return bLatest.localeCompare(aLatest);
    });
  if (withItems.length > 0) return withItems[0];

  // Level 4: First available
  return cols[0];
};

// ── Board compat aliases ──
export type Board = UnifiedCollection;
export type BoardItem = CollectionItem;
export const getBoards = () => getCollections().filter(c => c.type === "saved");
export const createBoard = createSavedCollection;
export const deleteBoard = deleteCollection;
export const updateBoard = updateCollection;
export const addToBoard = addItemToCollection;
export const removeFromBoard = removeItemFromCollection;

// ── Migration ──

function migrateIfNeeded() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  try {
    const existing: UnifiedCollection[] = [];
    const oldCols = localStorage.getItem("ra_collections");
    if (oldCols) {
      const parsed: any[] = JSON.parse(oldCols);
      parsed.forEach(c => existing.push({
        id: c.id,
        title: c.name || c.title || "Untitled",
        description: c.description || "",
        type: "published" as CollectionType,
        visibility: c.free === false ? "private" : "public",
        coverPhoto: c.thumbs?.[0],
        accessCode: c.code || undefined,
        collaborators: [],
        members: c.members || 0,
        slug: c.slug || (c.name || c.id).toLowerCase().replace(/\s+/g, "-"),
        imageCount: c.images || 0,
        videoCount: c.videos || 0,
        musicCount: c.music || 0,
        thumbs: c.thumbs || [],
        items: [],
        createdAt: c.createdAt || new Date().toISOString(),
      }));
    }
    const oldBoards = localStorage.getItem("ra_boards");
    if (oldBoards) {
      const parsed: any[] = JSON.parse(oldBoards);
      parsed.forEach(b => {
        if (!existing.find(e => e.id === b.id)) {
          const items: CollectionItem[] = (b.items || []).map((i: any) => ({
            imageId: i.imageId, photo: i.photo, title: i.title || "", savedAt: i.savedAt || new Date().toISOString(),
          }));
          existing.push({
            id: b.id, title: b.title || "Untitled", description: b.description || "",
            type: "saved" as CollectionType, visibility: b.visibility || "private",
            coverPhoto: b.coverPhoto || items[0]?.photo, bannerPhoto: b.bannerPhoto,
            collaborators: b.collaborators || [], members: 0,
            slug: (b.title || b.id).toLowerCase().replace(/\s+/g, "-"),
            imageCount: items.length, videoCount: 0, musicCount: 0,
            thumbs: items.slice(0, 4).map(i => i.photo), items,
            createdAt: b.createdAt || new Date().toISOString(),
          });
        }
      });
    }
    if (existing.length > 0) localStorage.setItem(KEY, JSON.stringify(existing));
    localStorage.setItem(MIGRATED_KEY, "1");
  } catch {
    localStorage.setItem(MIGRATED_KEY, "1");
  }
}

// ── Seed defaults ──

function seedDefaults(): UnifiedCollection[] {
  const d: UnifiedCollection[] = [
    {
      id: "uc_pub_1", title: "Main Collection", description: "My primary published gallery.",
      type: "published", visibility: "public", collaborators: [], members: 0, slug: "main-collection",
      imageCount: 84, videoCount: 3, musicCount: 2,
      thumbs: ["photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85", "photo-1604881991720-f91add269bed", "photo-1579546929518-9e396f3cc809"],
      items: [], createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: "uc_pub_2", title: "Premium Prompts", description: "Exclusive prompt packs — access by code or purchase.",
      type: "published", visibility: "private", accessCode: "XK9F2M", price: 999,
      collaborators: [], members: 127, slug: "premium-prompts",
      imageCount: 42, videoCount: 0, musicCount: 0,
      thumbs: ["photo-1541701494587-cb58502866ab", "photo-1558618666-fcd25c85cd64", "photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85"],
      items: [], createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: "uc_saved_1", title: "Inspiration", description: "Images that inspire my work.",
      type: "saved", visibility: "private", coverPhoto: "photo-1618005182384-a83a8bd57fbe",
      collaborators: [], members: 0, slug: "inspiration",
      imageCount: 3, videoCount: 0, musicCount: 0,
      thumbs: ["photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85", "photo-1579546929518-9e396f3cc809"],
      items: [
        { imageId: "0", photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", savedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
        { imageId: "4", photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", savedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
        { imageId: "8", photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City", savedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
  ];
  saveCollections(d);
  return d;
}
