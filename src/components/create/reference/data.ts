import type { BrowseItem } from "./types";

export const DUMMY_CREATIONS: BrowseItem[] = [
  { id: "cr1", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop", title: "Cosmic Dreamscape", type: "image" },
  { id: "cr2", src: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=200&fit=crop", title: "Neon Boulevard", type: "image" },
  { id: "cr3", src: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=200&h=200&fit=crop", title: "Brand Identity", type: "image" },
  { id: "cr4", src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop", title: "Cyberpunk Portrait", type: "image" },
  { id: "cr5", src: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=200&h=200&fit=crop", title: "Promo Video", type: "video" },
  { id: "cr6", src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&h=200&fit=crop", title: "Ethereal Forest", type: "image" },
];

export const DUMMY_STOCK: BrowseItem[] = [
  { id: "st1", src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop", title: "Mountain Lake", type: "image" },
  { id: "st2", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop", title: "Rolling Hills", type: "image" },
  { id: "st3", src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop", title: "Starry Night", type: "image" },
  { id: "st4", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&h=200&fit=crop", title: "Abstract Art", type: "image" },
  { id: "st5", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop", title: "Studio Portrait", type: "image" },
  { id: "st6", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", title: "Clean Headshot", type: "image" },
];

export const DUMMY_COMMUNITY: BrowseItem[] = [
  { id: "cm1", src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop", title: "Elegant Portrait", type: "image", creator: "leila_art" },
  { id: "cm2", src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop", title: "Expressive Face", type: "image", creator: "suki_vis" },
  { id: "cm3", src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop", title: "Outdoor Pose", type: "image", creator: "marcus_fx" },
  { id: "cm4", src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop", title: "Modern Look", type: "image", creator: "jordan_c" },
  { id: "cm5", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop", title: "Dream Canvas", type: "image", creator: "xavierml" },
  { id: "cm6", src: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=200&h=200&fit=crop", title: "Dark Fantasy", type: "image", creator: "arcanist" },
];

export const FILE_TYPE_BADGES = [
  { label: "JPG", color: "hsl(200, 80%, 55%)" },
  { label: "PNG", color: "hsl(160, 70%, 45%)" },
  { label: "GIF", color: "hsl(30, 90%, 55%)" },
  { label: "BMP", color: "hsl(280, 60%, 55%)" },
  { label: "MP4", color: "hsl(140, 70%, 45%)" },
  { label: "MOV", color: "hsl(350, 75%, 55%)" },
];

export const SOCIAL_ICONS = [
  { id: "youtube", label: "YouTube", color: "hsl(0, 80%, 50%)" },
  { id: "tiktok", label: "TikTok", color: "hsl(0, 0%, 10%)" },
  { id: "instagram", label: "Instagram", color: "hsl(330, 70%, 55%)" },
  { id: "facebook", label: "Facebook", color: "hsl(220, 70%, 50%)" },
  { id: "x", label: "X", color: "hsl(0, 0%, 10%)" },
  { id: "vimeo", label: "Vimeo", color: "hsl(195, 80%, 50%)" },
];
