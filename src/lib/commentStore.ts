//    Comment Store — localStorage-backed per-image comments
export interface Comment {
  id: string;
  imageId: string;
  authorName: string;
  authorHandle: string;
  authorColor: string;
  authorInit: string;
  text: string;
  likes: number;
  likedByMe: boolean;
  createdAt: string;
  isOwner: boolean; // true = the logged-in user wrote this
}

const KEY = "ra_comments";

export const getAllComments = (): Comment[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const getCommentsForImage = (imageId: string): Comment[] =>
  getAllComments().filter(c => c.imageId === imageId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

export const addComment = (comment: Omit<Comment, "id" | "likes" | "likedByMe" | "createdAt">): Comment => {
  const all = getAllComments();
  const newComment: Comment = {
    ...comment,
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    likes: 0,
    likedByMe: false,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newComment);
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("ra_comments_changed"));
  return newComment;
};

export const deleteComment = (commentId: string) => {
  localStorage.setItem(KEY, JSON.stringify(getAllComments().filter(c => c.id !== commentId)));
  window.dispatchEvent(new Event("ra_comments_changed"));
};

export const toggleLikeComment = (commentId: string) => {
  const all = getAllComments().map(c => {
    if (c.id !== commentId) return c;
    return { ...c, likedByMe: !c.likedByMe, likes: c.likedByMe ? c.likes - 1 : c.likes + 1 };
  });
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("ra_comments_changed"));
};

// Seed some demo comments on first load
export const seedDemoComments = (imageId: string) => {
  const existing = getCommentsForImage(imageId);
  if (existing.length > 0) return;
  const demos: Omit<Comment, "id" | "likes" | "likedByMe" | "isOwner">[] = [
    { imageId, authorName: "NeoPixel", authorHandle: "@neopixel", authorColor: "#c9184a", authorInit: "NP", text: "This is stunning! The color palette is incredible 🔥✨", createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { imageId, authorName: "DreamForge", authorHandle: "@dreamforge", authorColor: "#2a9d8f", authorInit: "DF", text: "What prompt did you use for this? The lighting is perfect", createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    { imageId, authorName: "LuminaAI", authorHandle: "@lumina", authorColor: "#e76f51", authorInit: "LA", text: "Saved to my Inspiration board. Absolute fire 🔥💯", createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  ];
  const all = getAllComments();
  const seeded = demos.map(d => ({ ...d, id: `c_seed_${Math.random().toString(36).slice(2)}`, likes: Math.floor(Math.random() * 20) + 1, likedByMe: false, isOwner: false }));
  localStorage.setItem(KEY, JSON.stringify([...seeded, ...all]));
};

export const formatRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
