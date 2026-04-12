/**
 * ebookTemplates.ts
 * 12 modern ebook templates — each defines a unique visual theme
 * and generates canvas elements for every page type.
 */

import type { CanvasElement, Page } from "@/components/ebook/EbookCanvasEditor";

// ─── Types ───────────────────────────────────────────────────────────────────
export type TemplateNiche =
  | "Business" | "Health" | "Creative" | "Education" | "Technology"
  | "Lifestyle" | "Finance" | "Marketing" | "Self-Help" | "Fiction"
  | "General";

export const TEMPLATE_NICHES: TemplateNiche[] = [
  "Business", "Health", "Creative", "Education", "Technology",
  "Lifestyle", "Finance", "Marketing", "Self-Help", "Fiction", "General",
];

export interface TemplatePalette {
  bg: string;
  accent: string;
  accent2: string;
  heading: string;
  text: string;
  bodyText: string;
  muted: string;
  surface: string;
}

export interface EbookTemplate {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  orientation: "portrait" | "landscape" | "both";
  niche: TemplateNiche;
  palette: TemplatePalette;
  titleFont: string;
  bodyFont: string;
  coverVariant: 1 | 2 | 3 | 4 | 5;
  contentVariant: 1 | 2 | 3;
  buildPage: (
    page: Page,
    allPages: Page[],
    bookTitle: string,
    bookDescription?: string
  ) => CanvasElement[];
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const txt = (
  elId: string,
  content: string,
  x: number, y: number, w: number, h: number,
  opts: Partial<CanvasElement> = {}
): CanvasElement => ({
  id: elId, type: "text", x, y, width: w, height: h, content,
  fontSize: 13, fontFamily: "Inter", textColor: "#1f2937", lineHeight: 1.5,
  ...opts,
} as CanvasElement);

const rect = (
  elId: string,
  x: number, y: number, w: number, h: number,
  fill: string,
  opts: Partial<CanvasElement> = {}
): CanvasElement => ({
  id: elId, type: "shape", x, y, width: w, height: h,
  fill, stroke: "transparent", shapeType: "rectangle",
  ...opts,
} as CanvasElement);

const circle = (
  elId: string,
  x: number, y: number, size: number,
  fill: string
): CanvasElement => ({
  id: elId, type: "shape", x, y, width: size, height: size,
  fill, stroke: "transparent", shapeType: "circle",
} as CanvasElement);

const img = (
  elId: string,
  x: number, y: number, w: number, h: number,
  src = "",
  opts: Partial<CanvasElement> = {}
): CanvasElement => ({
  id: elId, type: "image", x, y, width: w, height: h, src, isPlaceholder: !src,
  ...opts,
} as CanvasElement);

const tocRows = (
  pages: Page[],
  startY: number,
  spacing: number,
  maxItems: number,
  color: string,
  font: string,
  fontSize: number
): CanvasElement[] =>
  pages
    .filter(p => p.type === "chapter")
    .slice(0, maxItems)
    .map((p, i) => {
      const pageNum = pages.indexOf(p) + 1;
      const dots = "·".repeat(Math.max(2, 30 - p.title.length));
      return txt(
        `toc-row-${i}`,
        `${String(i + 1).padStart(2, "0")} ${p.title} ${dots} ${pageNum}`,
        10, startY + i * spacing, 80, spacing - 0.5,
        { fontSize, fontFamily: font, textColor: color }
      );
    });

const chNum = (page: Page, allPages: Page[]) =>
  allPages.filter(p => p.type === "chapter").indexOf(page) + 1;

// ─── 1. EDITORIAL — Refined dark magazine ───────────────────────────────────
const editorial: EbookTemplate = {
  id: "editorial",
  name: "Editorial",
  description: "High-contrast dark magazine with serif typography",
  previewBg: "#09090b",
  previewAccent: "#fafafa",
  orientation: "portrait",
  niche: "Creative",
  palette: { bg: "#09090b", accent: "#fafafa", accent2: "#a1a1aa", heading: "#fafafa", text: "#d4d4d8", bodyText: "#a1a1aa", muted: "#52525b", surface: "#18181b" },
  titleFont: "Playfair Display", bodyFont: "Inter", coverVariant: 1, contentVariant: 1,
  buildPage(page, allPages, bookTitle) {
    const bg = "#09090b";
    const fg = "#fafafa";
    const dim = "#71717a";
    const rule = "#27272a";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, bg),
        img("hero", 0, 0, 100, 58, ""),
        rect("grad", 0, 38, 100, 22, "linear-gradient(to bottom, transparent, #09090b)"),
        rect("bottom", 0, 58, 100, 42, bg),
        txt("label", "DEFINITIVE GUIDE", 8, 62, 50, 4, { fontSize: 8, fontFamily: "Inter", textColor: dim, fontWeight: "bold" }),
        rect("rule", 8, 67, 84, 0.3, rule),
        txt("title", bookTitle, 8, 70, 84, 18, { fontSize: 32, fontFamily: "Playfair Display", textColor: fg, fontWeight: "bold", lineHeight: 1.08 }),
        txt("sub", "COMPREHENSIVE EDITION", 8, 92, 50, 4, { fontSize: 8, fontFamily: "Inter", textColor: dim, fontWeight: "bold" }),
        rect("accent", 86, 92, 6, 1.2, fg),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, bg),
        txt("header", "CONTENTS", 8, 6, 40, 8, { fontSize: 11, fontFamily: "Inter", textColor: dim, fontWeight: "bold" }),
        rect("rule", 8, 15, 84, 0.2, rule),
        ...tocRows(allPages, 19, 6.8, 11, "#a1a1aa", "Inter", 10),
        rect("foot", 8, 94, 84, 0.2, rule),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 0, 100, 100, "rgba(9,9,11,0.55)"),
        rect("bottom-bar", 0, 68, 100, 32, "rgba(9,9,11,0.85)"),
        txt("num", String(chNum(page, allPages)).padStart(2, "0"), 8, 72, 20, 7, { fontSize: 11, fontFamily: "Inter", textColor: dim, fontWeight: "bold" }),
        rect("rule", 8, 80, 84, 0.2, rule),
        txt("title", page.title, 8, 82, 84, 14, { fontSize: 26, fontFamily: "Playfair Display", textColor: fg, fontWeight: "bold", lineHeight: 1.1 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, bg),
        txt("run-head", bookTitle, 8, 2, 60, 3, { fontSize: 7, fontFamily: "Inter", textColor: "#52525b" }),
        rect("rule-top", 8, 5, 84, 0.15, rule),
        txt("title", page.title, 8, 8, 84, 8, { fontSize: 16, fontFamily: "Playfair Display", textColor: fg, fontWeight: "bold", lineHeight: 1.15 }),
        rect("rule", 8, 17, 20, 0.3, "#52525b"),
        txt("body", "", 8, 20, 84, 72, { fontSize: 11, fontFamily: "Georgia", textColor: "#d4d4d8", lineHeight: 1.72 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: "#52525b", textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, bg),
        rect("accent", 38, 26, 24, 0.6, "#18181b"),
        txt("blurb", "A thoughtfully crafted guide designed to deliver practical insights and actionable strategies.", 14, 30, 72, 18, { fontSize: 11, fontFamily: "Georgia", textColor: dim, lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.3, dim),
        txt("title", bookTitle, 14, 56, 72, 8, { fontSize: 14, fontFamily: "Playfair Display", textColor: fg, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 14, 66, 72, 5, { fontSize: 9, fontFamily: "Inter", textColor: dim, textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 2. NORDIC — Scandi minimal ─────────────────────────────────────────────
const nordic: EbookTemplate = {
  id: "nordic",
  name: "Nordic",
  description: "Scandinavian minimalism — pale stone, forest accents",
  previewBg: "#f5f3ef",
  previewAccent: "#2d5a27",
  orientation: "both",
  niche: "Lifestyle",
  palette: { bg: "#f5f3ef", accent: "#2d5a27", accent2: "#a3b18a", heading: "#1b1b18", text: "#3a3a36", bodyText: "#57574f", muted: "#a8a29e", surface: "#e7e5e0" },
  titleFont: "DM Serif Display", bodyFont: "DM Sans", coverVariant: 3, contentVariant: 2,
  buildPage(page, allPages, bookTitle) {
    const green = "#2d5a27";
    const sage = "#8fad79";
    const stone = "#f5f3ef";
    const ink = "#1a2318";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, stone),
        img("hero", 5, 5, 90, 50, "", { borderRadius: 4 } as any),
        rect("bar", 0, 58, 100, 42, green),
        txt("title", bookTitle, 8, 64, 84, 22, { fontSize: 26, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.12 }),
        rect("rule", 8, 88, 30, 0.6, sage),
        txt("sub", "A Complete Guide", 8, 91, 50, 5, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.7)" }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, stone),
        rect("top-bar", 0, 0, 100, 2, green),
        txt("header", "Contents", 10, 8, 40, 8, { fontSize: 20, fontFamily: "Georgia", textColor: ink, fontWeight: "bold" }),
        rect("rule", 10, 17, 24, 0.6, sage),
        ...tocRows(allPages, 22, 6.5, 11, ink, "Inter", 10),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 60, 100, 40, "rgba(26,35,24,0.88)"),
        txt("num", `0${chNum(page, allPages)}`, 10, 64, 20, 7, { fontSize: 32, fontFamily: "Georgia", textColor: sage, fontWeight: "bold" }),
        rect("rule", 10, 73, 80, 0.4, sage),
        txt("title", page.title, 10, 76, 80, 16, { fontSize: 22, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.18 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, stone),
        rect("accent-top", 0, 0, 4, 100, green),
        txt("title", page.title, 8, 6, 84, 8, { fontSize: 14, fontFamily: "Georgia", textColor: ink, fontWeight: "bold" }),
        rect("rule", 8, 15, 14, 0.5, sage),
        txt("body", "", 8, 18, 84, 74, { fontSize: 11, fontFamily: "Inter", textColor: "#334433", lineHeight: 1.68 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: green, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, green),
        rect("accent", 38, 26, 24, 0.5, sage),
        txt("blurb", "Written with intention and care — may these pages guide you toward clarity and purpose.", 14, 30, 72, 18, { fontSize: 11, fontFamily: "Georgia", textColor: "rgba(255,255,255,0.7)", lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, sage),
        txt("title", bookTitle, 14, 56, 72, 8, { fontSize: 14, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 14, 66, 72, 5, { fontSize: 9, fontFamily: "Inter", textColor: "rgba(255,255,255,0.5)", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 3. LUXE — Premium dark ─────────────────────────────────────────────────
const luxe: EbookTemplate = {
  id: "luxe",
  name: "Luxe",
  description: "Premium navy & champagne — elegant serif, luxury feel",
  previewBg: "#0c1425",
  previewAccent: "#d4a745",
  orientation: "portrait",
  niche: "Business",
  palette: { bg: "#0c1425", accent: "#d4a745", accent2: "#f5d98c", heading: "#f5f0e1", text: "#c9bfa6", bodyText: "#a09882", muted: "#3d3a35", surface: "#1a2236" },
  titleFont: "Cormorant Garamond", bodyFont: "Lato", coverVariant: 4, contentVariant: 1,
  buildPage(page, allPages, bookTitle) {
    const navy = "#0c1425";
    const gold = "#d4a745";
    const cream = "#faf6ec";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, navy),
        rect("frame-t", 8, 8, 84, 0.4, gold),
        rect("frame-b", 8, 92, 84, 0.4, gold),
        rect("frame-l", 8, 8, 0.4, 84, gold),
        rect("frame-r", 91.6, 8, 0.4, 84, gold),
        txt("label", "✦  PREMIUM EDITION  ✦", 20, 14, 60, 4, { fontSize: 8, fontFamily: "Inter", textColor: gold, fontWeight: "bold", textAlign: "center" }),
        txt("title", bookTitle, 14, 32, 72, 28, { fontSize: 30, fontFamily: "Playfair Display", textColor: cream, fontWeight: "bold", lineHeight: 1.1, textAlign: "center" }),
        rect("rule", 38, 64, 24, 0.5, gold),
        txt("sub", "A CURATED GUIDE", 14, 68, 72, 5, { fontSize: 9, fontFamily: "Inter", textColor: gold, textAlign: "center" }),
        circle("gem", 47.5, 80, 5, "rgba(212,167,69,0.15)"),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("head", 0, 0, 100, 18, navy),
        txt("header", "Table of Contents", 10, 5, 80, 10, { fontSize: 20, fontFamily: "Playfair Display", textColor: cream, fontWeight: "bold", textAlign: "center" }),
        rect("gold-rule", 30, 17.6, 40, 0.4, gold),
        ...tocRows(allPages, 22, 6.5, 11, navy, "Georgia", 11),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 0, 100, 100, "rgba(12,20,37,0.65)"),
        txt("num", `Chapter ${chNum(page, allPages)}`, 14, 58, 72, 5, { fontSize: 10, fontFamily: "Inter", textColor: gold, fontWeight: "bold", textAlign: "center" }),
        rect("rule-t", 30, 65, 40, 0.4, gold),
        txt("title", page.title, 12, 68, 76, 18, { fontSize: 26, fontFamily: "Playfair Display", textColor: cream, fontWeight: "bold", lineHeight: 1.1, textAlign: "center" }),
        rect("rule-b", 30, 88, 40, 0.4, gold),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("nav", 0, 0, 100, 6, navy),
        txt("nav-txt", bookTitle, 8, 1, 60, 4, { fontSize: 7, fontFamily: "Inter", textColor: gold }),
        txt("title", page.title, 8, 9, 84, 8, { fontSize: 17, fontFamily: "Playfair Display", textColor: navy, fontWeight: "bold" }),
        rect("rule", 8, 18, 10, 0.5, gold),
        txt("body", "", 8, 21, 84, 70, { fontSize: 11.5, fontFamily: "Georgia", textColor: "#2a2a40", lineHeight: 1.65 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: gold, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, navy),
        rect("ft", 8, 8, 84, 0.4, gold),
        rect("fb", 8, 92, 84, 0.4, gold),
        rect("fl", 8, 8, 0.4, 84, gold),
        rect("fr", 91.6, 8, 0.4, 84, gold),
        rect("accent", 38, 26, 24, 0.4, gold),
        txt("blurb", "An exclusive collection of premium insights — crafted for those who demand excellence in every detail.", 16, 30, 68, 18, { fontSize: 11, fontFamily: "Playfair Display", textColor: "rgba(245,240,225,0.7)", lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, gold),
        txt("title", bookTitle, 16, 56, 68, 8, { fontSize: 14, fontFamily: "Playfair Display", textColor: cream, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 16, 66, 68, 5, { fontSize: 8, fontFamily: "Inter", textColor: gold, textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 4. SLATE — Tech blue ───────────────────────────────────────────────────
const slate: EbookTemplate = {
  id: "slate",
  name: "Slate",
  description: "Tech-forward — cool grays, electric blue accents",
  previewBg: "#0f172a",
  previewAccent: "#3b82f6",
  orientation: "both",
  niche: "Technology",
  palette: { bg: "#0f172a", accent: "#3b82f6", accent2: "#60a5fa", heading: "#f1f5f9", text: "#cbd5e1", bodyText: "#94a3b8", muted: "#475569", surface: "#1e293b" },
  titleFont: "Space Grotesk", bodyFont: "Inter", coverVariant: 2, contentVariant: 3,
  buildPage(page, allPages, bookTitle) {
    const dark = "#0f172a";
    const blue = "#3b82f6";
    const light = "#f8fafc";
    const muted = "#64748b";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, dark),
        rect("glow", 0, 0, 100, 40, "#1e293b"),
        rect("blue-bar", 0, 0, 5, 100, blue),
        txt("tag", "TECHNICAL GUIDE", 10, 10, 84, 4, { fontSize: 8, fontFamily: "Inter", textColor: blue, fontWeight: "bold" }),
        txt("title", bookTitle, 10, 18, 82, 30, { fontSize: 28, fontFamily: "Inter", textColor: light, fontWeight: "bold", lineHeight: 1.1 }),
        rect("rule", 10, 52, 30, 0.4, blue),
        img("img", 10, 58, 80, 32, "", { borderRadius: 6 } as any),
        txt("foot", "v1.0", 10, 94, 20, 4, { fontSize: 8, fontFamily: "Inter", textColor: muted }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, light),
        rect("top-bar", 0, 0, 100, 1.5, blue),
        txt("header", "Contents", 8, 6, 40, 8, { fontSize: 20, fontFamily: "Inter", textColor: dark, fontWeight: "bold" }),
        rect("rule", 8, 15, 10, 0.4, blue),
        ...tocRows(allPages, 19, 6.5, 11, "#334155", "Inter", 10),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 58, 100, 42, "rgba(15,23,42,0.9)"),
        txt("num", `${String(chNum(page, allPages)).padStart(2, "0")}`, 8, 62, 20, 7, { fontSize: 28, fontFamily: "Inter", textColor: blue, fontWeight: "bold" }),
        rect("rule", 8, 71, 84, 0.3, "#334155"),
        txt("title", page.title, 8, 74, 84, 14, { fontSize: 22, fontFamily: "Inter", textColor: light, fontWeight: "bold", lineHeight: 1.12 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, light),
        rect("bar", 0, 0, 100, 1.2, blue),
        txt("title", page.title, 8, 4, 84, 8, { fontSize: 15, fontFamily: "Inter", textColor: dark, fontWeight: "bold" }),
        rect("rule", 8, 13, 8, 0.4, blue),
        txt("body", "", 8, 16, 84, 76, { fontSize: 11, fontFamily: "Inter", textColor: "#334155", lineHeight: 1.68 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: blue, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, dark),
        rect("accent", 38, 26, 24, 0.6, blue),
        txt("blurb", "Built for builders. The ideas in these pages are designed to help you ship faster and think clearer.", 12, 30, 76, 18, { fontSize: 11, fontFamily: "Inter", textColor: muted, lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, blue),
        txt("title", bookTitle, 12, 56, 76, 8, { fontSize: 14, fontFamily: "Inter", textColor: light, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 12, 66, 76, 5, { fontSize: 9, fontFamily: "Inter", textColor: muted, textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 5. TERRA — Warm earthy ─────────────────────────────────────────────────
const terra: EbookTemplate = {
  id: "terra",
  name: "Terra",
  description: "Warm earthy tones — terracotta, cream, organic feel",
  previewBg: "#fdf6ee",
  previewAccent: "#c0522a",
  orientation: "portrait",
  niche: "Health",
  palette: { bg: "#fdf6ee", accent: "#c0522a", accent2: "#e8976b", heading: "#3b1f0b", text: "#5c3d1e", bodyText: "#7a5c3e", muted: "#c4b5a3", surface: "#f0e6d8" },
  titleFont: "Libre Baskerville", bodyFont: "Source Sans Pro", coverVariant: 1, contentVariant: 2,
  buildPage(page, allPages, bookTitle) {
    const rust = "#c0522a";
    const cream = "#fdf6ee";
    const sand = "#e8d5c4";
    const ink = "#3d2010";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, cream),
        img("hero", 0, 0, 100, 56, ""),
        rect("band", 0, 56, 100, 44, cream),
        rect("accent", 0, 56, 100, 2, rust),
        txt("title", bookTitle, 8, 62, 84, 20, { fontSize: 24, fontFamily: "Georgia", textColor: ink, fontWeight: "bold", lineHeight: 1.15 }),
        rect("rule", 8, 84, 20, 0.7, rust),
        txt("sub", "A Complete Guide", 8, 87, 50, 5, { fontSize: 10, fontFamily: "Inter", textColor: rust }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("top", 0, 0, 100, 18, rust),
        txt("header", "Contents", 10, 5, 50, 10, { fontSize: 20, fontFamily: "Georgia", textColor: cream, fontWeight: "bold" }),
        ...tocRows(allPages, 22, 6.5, 11, ink, "Georgia", 11),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 58, 100, 42, "rgba(60,30,10,0.82)"),
        rect("side", 0, 0, 6, 100, rust),
        txt("num", `0${chNum(page, allPages)}`, 10, 62, 20, 8, { fontSize: 36, fontFamily: "Georgia", textColor: sand, fontWeight: "bold" }),
        rect("rule", 10, 73, 80, 0.5, sand),
        txt("title", page.title, 10, 76, 80, 16, { fontSize: 22, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.18 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("side", 0, 0, 3, 100, sand),
        txt("title", page.title, 8, 6, 84, 8, { fontSize: 15, fontFamily: "Georgia", textColor: ink, fontWeight: "bold" }),
        rect("rule", 8, 15, 16, 0.5, rust),
        txt("body", "", 8, 18, 84, 74, { fontSize: 11.5, fontFamily: "Georgia", textColor: "#4a2e1a", lineHeight: 1.68 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: rust, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("accent", 38, 26, 24, 0.6, rust),
        txt("blurb", "Grounded in real-world experience and written with warmth — we hope this book brings you both knowledge and inspiration.", 14, 30, 72, 18, { fontSize: 11, fontFamily: "Georgia", textColor: "#78716c", lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, rust),
        txt("title", bookTitle, 14, 56, 72, 8, { fontSize: 14, fontFamily: "Georgia", textColor: rust, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 14, 66, 72, 5, { fontSize: 9, fontFamily: "Inter", textColor: "rgba(120,113,108,0.7)", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 6. SPLIT — Two-column report ───────────────────────────────────────────
const split: EbookTemplate = {
  id: "split",
  name: "Split",
  description: "Two-column layout — ideal for reports and whitepapers",
  previewBg: "#faf5ff",
  previewAccent: "#7c3aed",
  orientation: "landscape",
  niche: "Marketing",
  palette: { bg: "#faf5ff", accent: "#7c3aed", accent2: "#a78bfa", heading: "#1e1b4b", text: "#3b3473", bodyText: "#6d63a8", muted: "#c4b5d9", surface: "#ede9fe" },
  titleFont: "Poppins", bodyFont: "Inter", coverVariant: 5, contentVariant: 1,
  buildPage(page, allPages, bookTitle) {
    const violet = "#7c3aed";
    const lt = "#faf5ff";
    const dark = "#1e1040";
    switch (page.type) {
      case "cover": return [
        rect("left", 0, 0, 46, 100, violet),
        rect("right", 46, 0, 54, 100, lt),
        txt("title", bookTitle, 5, 22, 38, 44, { fontSize: 24, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.12 }),
        rect("rule", 5, 70, 20, 0.6, "rgba(255,255,255,0.4)"),
        txt("sub", "A Complete Guide", 5, 74, 36, 5, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.7)" }),
        img("img", 49, 5, 47, 90, "", { borderRadius: 6 } as any),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, lt),
        rect("left", 0, 0, 36, 100, violet),
        txt("header", "Contents", 5, 12, 28, 10, { fontSize: 18, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold" }),
        txt("book", bookTitle, 5, 26, 28, 20, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.55)", lineHeight: 1.4 }),
        ...tocRows(allPages, 8, 7, 12, dark, "Inter", 10).map(e => ({ ...e, x: 40, width: 56 })),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 60, 100, 40, "rgba(30,16,64,0.85)"),
        txt("num", `CH ${chNum(page, allPages)}`, 8, 64, 20, 5, { fontSize: 9, fontFamily: "Inter", textColor: "rgba(255,255,255,0.5)", fontWeight: "bold" }),
        txt("title", page.title, 8, 70, 84, 14, { fontSize: 26, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.08 }),
        rect("rule", 8, 86, 30, 0.3, violet),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, lt),
        rect("gutter", 0, 0, 6, 100, "#ede9fe"),
        rect("rule-v", 6, 0, 0.3, 100, violet),
        txt("title", page.title, 10, 5, 82, 8, { fontSize: 15, fontFamily: "Georgia", textColor: dark, fontWeight: "bold" }),
        rect("rule", 10, 14, 82, 0.3, violet),
        txt("body", "", 10, 17, 82, 75, { fontSize: 11, fontFamily: "Inter", textColor: "#2d1f60", lineHeight: 1.65 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: violet, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, dark),
        rect("stripe", 0, 0, 4, 100, violet),
        rect("accent", 38, 26, 24, 0.5, "rgba(255,255,255,0.2)"),
        txt("blurb", "Two perspectives. One mission. This book distills complex ideas into clear, actionable strategies you can use today.", 12, 30, 76, 18, { fontSize: 11, fontFamily: "Georgia", textColor: "rgba(255,255,255,0.6)", lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, violet),
        txt("title", bookTitle, 12, 56, 76, 8, { fontSize: 14, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 12, 66, 76, 5, { fontSize: 9, fontFamily: "Inter", textColor: "rgba(255,255,255,0.4)", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 7. BROADSHEET — Classic newspaper ──────────────────────────────────────
const broadsheet: EbookTemplate = {
  id: "broadsheet",
  name: "Broadsheet",
  description: "Classic newspaper — dense serif, red accents, columnar",
  previewBg: "#fafaf9",
  previewAccent: "#dc2626",
  orientation: "portrait",
  niche: "Education",
  palette: { bg: "#fafaf9", accent: "#dc2626", accent2: "#f87171", heading: "#0c0a09", text: "#292524", bodyText: "#57534e", muted: "#a8a29e", surface: "#f5f5f4" },
  titleFont: "Merriweather", bodyFont: "Source Serif Pro", coverVariant: 2, contentVariant: 3,
  buildPage(page, allPages, bookTitle) {
    const black = "#0c0a09";
    const white = "#fafaf9";
    const red = "#dc2626";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, white),
        rect("masthead", 0, 0, 100, 14, black),
        rect("red-rule", 0, 14, 100, 1, red),
        txt("name", bookTitle.toUpperCase(), 4, 2, 92, 10, { fontSize: 28, fontFamily: "Georgia", textColor: white, fontWeight: "bold", textAlign: "center" }),
        txt("date", "SPECIAL EDITION", 4, 16, 92, 4, { fontSize: 8, fontFamily: "Inter", textColor: black, fontWeight: "bold", textAlign: "center" }),
        rect("rule2", 4, 22, 92, 0.3, black),
        img("main", 4, 24, 92, 38, ""),
        rect("rule3", 4, 64, 92, 0.4, black),
        txt("headline", "Everything You Need To Know", 4, 66, 92, 10, { fontSize: 20, fontFamily: "Georgia", textColor: black, fontWeight: "bold", lineHeight: 1.15 }),
        rect("col-rule", 50, 80, 0.3, 14, black),
        txt("col1", "Read the complete guide inside this exclusive edition.", 4, 80, 44, 14, { fontSize: 10, fontFamily: "Georgia", textColor: black, lineHeight: 1.55 }),
        txt("col2", "Expert analysis and actionable strategies for every reader.", 52, 80, 44, 14, { fontSize: 10, fontFamily: "Georgia", textColor: black, lineHeight: 1.55 }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, white),
        rect("head", 0, 0, 100, 12, black),
        rect("red", 0, 12, 100, 0.8, red),
        txt("header", "INDEX", 4, 2, 92, 8, { fontSize: 20, fontFamily: "Georgia", textColor: white, fontWeight: "bold", textAlign: "center" }),
        ...tocRows(allPages, 16, 6.5, 11, black, "Georgia", 10),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 56, 100, 44, "rgba(250,250,249,0.94)"),
        rect("rule-t", 0, 0, 100, 1.2, red),
        txt("section", `CHAPTER ${chNum(page, allPages)}`, 4, 59, 92, 4, { fontSize: 8, fontFamily: "Inter", textColor: red, fontWeight: "bold" }),
        rect("rule", 4, 64, 92, 0.3, black),
        txt("title", page.title, 4, 67, 92, 16, { fontSize: 28, fontFamily: "Georgia", textColor: black, fontWeight: "bold", lineHeight: 1.08 }),
        rect("rule-b", 4, 86, 92, 0.6, black),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, white),
        rect("rule-t", 4, 0, 92, 0.3, black),
        txt("title", page.title, 4, 2, 88, 6, { fontSize: 13, fontFamily: "Georgia", textColor: black, fontWeight: "bold" }),
        rect("rule2", 4, 9, 92, 0.3, black),
        rect("col-rule", 50, 11, 0.3, 82, black),
        txt("col1", "", 4, 11, 44, 82, { fontSize: 10.5, fontFamily: "Georgia", textColor: black, lineHeight: 1.65 }),
        txt("col2", "", 52, 11, 44, 82, { fontSize: 10.5, fontFamily: "Georgia", textColor: black, lineHeight: 1.65 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Georgia", textColor: black, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, white),
        rect("rt", 0, 0, 100, 1.2, red),
        rect("rb", 0, 98.8, 100, 1.2, red),
        rect("accent", 38, 26, 24, 0.4, black),
        txt("blurb", "Every story matters. This publication was assembled with editorial precision to deliver the facts, insights, and perspectives you need.", 10, 30, 80, 18, { fontSize: 11, fontFamily: "Georgia", textColor: "#57534e", lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, black),
        txt("title", bookTitle.toUpperCase(), 10, 56, 80, 8, { fontSize: 12, fontFamily: "Georgia", textColor: black, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "A DEFINITIVE GUIDE", 10, 66, 80, 4, { fontSize: 8, fontFamily: "Inter", textColor: "#78716c", fontWeight: "bold", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 8. PASTEL — Soft & playful ─────────────────────────────────────────────
const pastel: EbookTemplate = {
  id: "pastel",
  name: "Pastel",
  description: "Soft lavender & mint — friendly, rounded, modern",
  previewBg: "#f5f3ff",
  previewAccent: "#8b5cf6",
  orientation: "both",
  niche: "Self-Help",
  palette: { bg: "#f5f3ff", accent: "#8b5cf6", accent2: "#a78bfa", heading: "#1e1b4b", text: "#4c1d95", bodyText: "#6d28d9", muted: "#c4b5d9", surface: "#ede9fe" },
  titleFont: "Nunito", bodyFont: "Nunito Sans", coverVariant: 3, contentVariant: 2,
  buildPage(page, allPages, bookTitle) {
    const lav = "#f5f3ff";
    const mint = "#d1fae5";
    const violet = "#8b5cf6";
    const dark = "#1e1b4b";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, lav),
        circle("b1", -8, -8, 44, "#ede9fe"),
        circle("b2", 68, 56, 50, mint),
        rect("card", 10, 22, 80, 56, "#ffffff", { borderRadius: 14 } as any),
        txt("title", bookTitle, 16, 28, 68, 30, { fontSize: 24, fontFamily: "Georgia", textColor: dark, fontWeight: "bold", lineHeight: 1.15 }),
        rect("pill", 30, 62, 40, 6, violet, { borderRadius: 14 } as any),
        txt("pill-txt", "A Complete Guide", 30, 62, 40, 6, { fontSize: 9, fontFamily: "Inter", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, lav),
        rect("card", 6, 4, 88, 14, violet, { borderRadius: 10 } as any),
        txt("header", "Table of Contents", 10, 7, 80, 8, { fontSize: 18, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        ...tocRows(allPages, 22, 6.5, 11, dark, "Inter", 10),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 58, 100, 42, "rgba(30,27,75,0.78)"),
        rect("pill", 8, 62, 20, 6, violet, { borderRadius: 10 } as any),
        txt("num", `Chapter ${chNum(page, allPages)}`, 8, 62, 20, 6, { fontSize: 9, fontFamily: "Inter", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        txt("title", page.title, 8, 72, 84, 16, { fontSize: 24, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.12 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, "#fbfaff"),
        rect("top", 0, 0, 100, 1.5, violet),
        rect("side", 0, 1.5, 2, 98.5, mint),
        txt("title", page.title, 7, 5, 86, 8, { fontSize: 15, fontFamily: "Georgia", textColor: dark, fontWeight: "bold" }),
        rect("rule", 7, 14, 12, 0.5, violet),
        txt("body", "", 7, 17, 86, 75, { fontSize: 11, fontFamily: "Inter", textColor: "#312e81", lineHeight: 1.68 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: violet, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, violet),
        circle("b1", -16, -16, 60, "#7c3aed"),
        circle("b2", 74, 74, 50, "#0d9488"),
        rect("card", 12, 26, 76, 48, "#ffffff", { borderRadius: 14 } as any),
        txt("blurb", "Made with love and a sprinkle of AI magic. We hope you enjoyed every page as much as we enjoyed creating it for you.", 18, 30, 64, 16, { fontSize: 11, fontFamily: "Georgia", textColor: "#52525b", lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 50, 20, 0.3, violet),
        txt("title", bookTitle, 18, 54, 64, 8, { fontSize: 14, fontFamily: "Georgia", textColor: dark, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading ✦", 18, 64, 64, 6, { fontSize: 10, fontFamily: "Inter", textColor: violet, textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 9. MONO — Swiss typographic ────────────────────────────────────────────
const mono: EbookTemplate = {
  id: "mono",
  name: "Mono",
  description: "Swiss typographic — monospaced, grid-precise, stark",
  previewBg: "#ffffff",
  previewAccent: "#000000",
  orientation: "portrait",
  niche: "General",
  palette: { bg: "#ffffff", accent: "#000000", accent2: "#737373", heading: "#000000", text: "#171717", bodyText: "#404040", muted: "#a3a3a3", surface: "#f5f5f5" },
  titleFont: "JetBrains Mono", bodyFont: "IBM Plex Mono", coverVariant: 4, contentVariant: 3,
  buildPage(page, allPages, bookTitle) {
    const bk = "#000000";
    const wh = "#ffffff";
    const gy = "#737373";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, wh),
        rect("block", 0, 0, 100, 50, bk),
        txt("title", bookTitle.toUpperCase(), 8, 10, 84, 30, { fontSize: 30, fontFamily: "Inter", textColor: wh, fontWeight: "bold", lineHeight: 1.05 }),
        rect("rule", 8, 55, 84, 0.3, bk),
        txt("meta", `${allPages.filter(p => p.type === "chapter").length} CHAPTERS`, 8, 58, 40, 4, { fontSize: 8, fontFamily: "Inter", textColor: gy, fontWeight: "bold" }),
        txt("year", new Date().getFullYear().toString(), 70, 58, 22, 4, { fontSize: 8, fontFamily: "Inter", textColor: gy, fontWeight: "bold", textAlign: "right" }),
        txt("sub", "A systematic guide", 8, 80, 50, 5, { fontSize: 11, fontFamily: "Inter", textColor: bk }),
        rect("foot", 8, 92, 84, 0.3, bk),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, wh),
        txt("header", "CONTENTS", 8, 6, 40, 6, { fontSize: 10, fontFamily: "Inter", textColor: bk, fontWeight: "bold" }),
        rect("rule", 8, 13, 84, 0.3, bk),
        ...tocRows(allPages, 17, 6.5, 11, bk, "Inter", 10),
        rect("foot", 8, 94, 84, 0.2, "#e5e5e5"),
      ];
      case "chapter": return [
        rect("bg", 0, 0, 100, 100, wh),
        rect("block", 0, 0, 100, 44, bk),
        img("chapter-img", 0, 44, 100, 56, ""),
        txt("num", String(chNum(page, allPages)).padStart(2, "0"), 8, 8, 84, 10, { fontSize: 48, fontFamily: "Inter", textColor: wh, fontWeight: "bold" }),
        rect("overlay", 0, 70, 100, 30, "rgba(0,0,0,0.7)"),
        txt("title", page.title.toUpperCase(), 8, 76, 84, 16, { fontSize: 22, fontFamily: "Inter", textColor: wh, fontWeight: "bold", lineHeight: 1.1 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, wh),
        txt("title", page.title.toUpperCase(), 8, 4, 84, 6, { fontSize: 10, fontFamily: "Inter", textColor: bk, fontWeight: "bold" }),
        rect("rule", 8, 11, 84, 0.3, bk),
        txt("body", "", 8, 14, 84, 78, { fontSize: 11, fontFamily: "Inter", textColor: "#262626", lineHeight: 1.7 }),
        rect("foot", 8, 95, 84, 0.15, "#d4d4d4"),
        txt("pnum", "", 86, 96, 8, 3, { fontSize: 8, fontFamily: "Inter", textColor: gy, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, bk),
        rect("accent", 38, 26, 24, 0.3, gy),
        txt("blurb", "Stripped to the essentials. No filler. No fluff. Just the signal.", 14, 30, 72, 18, { fontSize: 11, fontFamily: "Inter", textColor: gy, lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.3, gy),
        txt("title", bookTitle.toUpperCase(), 14, 56, 72, 8, { fontSize: 12, fontFamily: "Inter", textColor: wh, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "END", 14, 66, 72, 4, { fontSize: 9, fontFamily: "Inter", textColor: gy, textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 10. AURORA — Gradient modern ───────────────────────────────────────────
const aurora: EbookTemplate = {
  id: "aurora",
  name: "Aurora",
  description: "Vibrant gradients — teal to indigo, glassmorphism accents",
  previewBg: "#0f172a",
  previewAccent: "#06b6d4",
  orientation: "portrait",
  niche: "Technology",
  palette: { bg: "#0f172a", accent: "#06b6d4", accent2: "#6366f1", heading: "#f0fdfa", text: "#ccfbf1", bodyText: "#99f6e4", muted: "#475569", surface: "#1e293b" },
  titleFont: "Outfit", bodyFont: "Inter", coverVariant: 1, contentVariant: 1,
  buildPage(page, allPages, bookTitle) {
    const deep = "#0f172a";
    const teal = "#06b6d4";
    const indigo = "#6366f1";
    const fg = "#f0fdfa";
    const dim = "#67e8f9";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, deep),
        circle("glow1", -10, -10, 60, "rgba(6,182,212,0.18)"),
        circle("glow2", 55, 50, 70, "rgba(99,102,241,0.14)"),
        circle("glow3", 30, 75, 40, "rgba(6,182,212,0.12)"),
        rect("glass", 8, 28, 84, 44, "rgba(255,255,255,0.06)", { borderRadius: 12 } as any),
        txt("label", "✦ MODERN GUIDE", 14, 34, 72, 4, { fontSize: 8, fontFamily: "Inter", textColor: dim, fontWeight: "bold" }),
        txt("title", bookTitle, 14, 40, 72, 22, { fontSize: 28, fontFamily: "Inter", textColor: fg, fontWeight: "bold", lineHeight: 1.1 }),
        rect("rule", 14, 64, 26, 0.5, teal),
        txt("sub", "Comprehensive Edition", 14, 67, 50, 4, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(240,253,250,0.55)" }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, deep),
        circle("glow", 70, -10, 50, "rgba(6,182,212,0.12)"),
        txt("header", "Contents", 8, 6, 40, 8, { fontSize: 20, fontFamily: "Inter", textColor: fg, fontWeight: "bold" }),
        rect("rule", 8, 15, 16, 0.4, teal),
        ...tocRows(allPages, 19, 6.5, 11, "rgba(240,253,250,0.7)", "Inter", 10),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 0, 100, 100, "rgba(15,23,42,0.5)"),
        rect("bottom", 0, 64, 100, 36, "rgba(15,23,42,0.88)"),
        circle("glow", -5, 60, 40, "rgba(6,182,212,0.15)"),
        txt("num", String(chNum(page, allPages)).padStart(2, "0"), 8, 68, 20, 6, { fontSize: 10, fontFamily: "Inter", textColor: dim, fontWeight: "bold" }),
        rect("rule", 8, 76, 84, 0.25, "rgba(6,182,212,0.4)"),
        txt("title", page.title, 8, 79, 84, 14, { fontSize: 24, fontFamily: "Inter", textColor: fg, fontWeight: "bold", lineHeight: 1.1 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, deep),
        rect("glow-top", 0, 0, 100, 3, "rgba(6,182,212,0.25)"),
        txt("title", page.title, 8, 5, 84, 8, { fontSize: 15, fontFamily: "Inter", textColor: fg, fontWeight: "bold" }),
        rect("rule", 8, 14, 10, 0.4, teal),
        txt("body", "", 8, 17, 84, 75, { fontSize: 11, fontFamily: "Inter", textColor: "rgba(240,253,250,0.82)", lineHeight: 1.7 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: dim, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, deep),
        circle("g1", -10, 30, 60, "rgba(6,182,212,0.14)"),
        circle("g2", 60, 60, 50, "rgba(99,102,241,0.12)"),
        rect("accent", 38, 26, 24, 0.4, teal),
        txt("blurb", "Ideas that glow in the dark. We built this book to light the way forward — may it spark something brilliant in you.", 14, 30, 72, 18, { fontSize: 11, fontFamily: "Inter", textColor: "rgba(240,253,250,0.55)", lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, teal),
        txt("title", bookTitle, 14, 56, 72, 8, { fontSize: 14, fontFamily: "Inter", textColor: fg, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 14, 66, 72, 4, { fontSize: 9, fontFamily: "Inter", textColor: "rgba(240,253,250,0.35)", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 11. ROSÉ — Warm blush ──────────────────────────────────────────────────
const rose: EbookTemplate = {
  id: "rose",
  name: "Rosé",
  description: "Warm blush & charcoal — elegant serif, lifestyle feel",
  previewBg: "#fff1f2",
  previewAccent: "#e11d48",
  orientation: "portrait",
  niche: "Lifestyle",
  palette: { bg: "#fff1f2", accent: "#e11d48", accent2: "#fda4af", heading: "#1c1917", text: "#44403c", bodyText: "#78716c", muted: "#d6d3d1", surface: "#fce7f3" },
  titleFont: "Cormorant Garamond", bodyFont: "Lora", coverVariant: 5, contentVariant: 2,
  buildPage(page, allPages, bookTitle) {
    const blush = "#fff1f2";
    const pink = "#e11d48";
    const pinkSoft = "#fda4af";
    const charcoal = "#1c1917";
    const warm = "#44403c";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, blush),
        img("hero", 8, 6, 84, 48, "", { borderRadius: 8 } as any),
        rect("band", 0, 58, 100, 42, charcoal),
        txt("title", bookTitle, 8, 64, 84, 20, { fontSize: 26, fontFamily: "Playfair Display", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.1 }),
        rect("rule", 8, 86, 24, 0.5, pinkSoft),
        txt("sub", "A Curated Guide", 8, 89, 50, 4, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.6)" }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, blush),
        txt("header", "Contents", 10, 6, 40, 8, { fontSize: 20, fontFamily: "Playfair Display", textColor: charcoal, fontWeight: "bold" }),
        rect("rule", 10, 15, 20, 0.5, pink),
        ...tocRows(allPages, 19, 6.5, 11, warm, "Inter", 10),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 62, 100, 38, "rgba(28,25,23,0.88)"),
        txt("num", `0${chNum(page, allPages)}`, 8, 66, 16, 6, { fontSize: 10, fontFamily: "Inter", textColor: pinkSoft, fontWeight: "bold" }),
        rect("rule", 8, 74, 84, 0.3, pinkSoft),
        txt("title", page.title, 8, 77, 84, 14, { fontSize: 24, fontFamily: "Playfair Display", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.1 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, blush),
        rect("top", 0, 0, 100, 1.2, pink),
        txt("title", page.title, 8, 5, 84, 8, { fontSize: 15, fontFamily: "Playfair Display", textColor: charcoal, fontWeight: "bold" }),
        rect("rule", 8, 14, 14, 0.5, pinkSoft),
        txt("body", "", 8, 17, 84, 75, { fontSize: 11, fontFamily: "Georgia", textColor: warm, lineHeight: 1.68 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: pink, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, charcoal),
        circle("glow", 50, 40, 50, "rgba(225,29,72,0.1)"),
        rect("accent", 38, 26, 24, 0.4, pinkSoft),
        txt("blurb", "Beauty lives in the details. This book was designed to inspire, empower, and leave you feeling a little more confident in your craft.", 14, 30, 72, 18, { fontSize: 11, fontFamily: "Playfair Display", textColor: "rgba(255,255,255,0.55)", lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, pinkSoft),
        txt("title", bookTitle, 14, 56, 72, 8, { fontSize: 14, fontFamily: "Playfair Display", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 14, 66, 72, 5, { fontSize: 9, fontFamily: "Inter", textColor: "rgba(255,255,255,0.4)", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── 12. SAGE — Natural botanical ───────────────────────────────────────────
const sage: EbookTemplate = {
  id: "sage",
  name: "Sage",
  description: "Botanical calm — sage green, linen, organic typography",
  previewBg: "#f5f5f0",
  previewAccent: "#65a30d",
  orientation: "portrait",
  niche: "Health",
  palette: { bg: "#f5f5f0", accent: "#65a30d", accent2: "#a3e635", heading: "#1a2e05", text: "#365314", bodyText: "#4d7c0f", muted: "#a8a29e", surface: "#ecfccb" },
  titleFont: "Fraunces", bodyFont: "Work Sans", coverVariant: 3, contentVariant: 1,
  buildPage(page, allPages, bookTitle) {
    const sageGreen = "#65a30d";
    const sageMuted = "#a3e635";
    const linen = "#f5f5f0";
    const dark = "#1a2e05";
    const text = "#365314";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, linen),
        rect("top-band", 0, 0, 100, 6, sageGreen),
        img("hero", 0, 6, 100, 52, ""),
        rect("bottom", 0, 58, 100, 42, linen),
        txt("label", "✦ BOTANICAL SERIES", 8, 62, 50, 4, { fontSize: 8, fontFamily: "Inter", textColor: sageGreen, fontWeight: "bold" }),
        txt("title", bookTitle, 8, 68, 84, 18, { fontSize: 26, fontFamily: "Georgia", textColor: dark, fontWeight: "bold", lineHeight: 1.12 }),
        rect("rule", 8, 88, 22, 0.6, sageGreen),
        txt("sub", "A Natural Guide", 8, 91, 50, 4, { fontSize: 10, fontFamily: "Inter", textColor: text }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, linen),
        rect("side", 0, 0, 5, 100, sageGreen),
        txt("header", "Contents", 10, 6, 40, 8, { fontSize: 20, fontFamily: "Georgia", textColor: dark, fontWeight: "bold" }),
        rect("rule", 10, 15, 18, 0.5, sageGreen),
        ...tocRows(allPages, 19, 6.5, 11, dark, "Inter", 10),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 62, 100, 38, "rgba(26,46,5,0.85)"),
        rect("top-accent", 0, 0, 100, 3, sageGreen),
        txt("num", `0${chNum(page, allPages)}`, 8, 66, 16, 6, { fontSize: 32, fontFamily: "Georgia", textColor: sageMuted, fontWeight: "bold" }),
        rect("rule", 8, 74, 84, 0.4, "rgba(163,230,53,0.4)"),
        txt("title", page.title, 8, 77, 84, 14, { fontSize: 22, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.15 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, linen),
        rect("side", 0, 0, 3, 100, "#ecfccb"),
        txt("title", page.title, 7, 5, 86, 8, { fontSize: 15, fontFamily: "Georgia", textColor: dark, fontWeight: "bold" }),
        rect("rule", 7, 14, 14, 0.5, sageGreen),
        txt("body", "", 7, 17, 86, 75, { fontSize: 11, fontFamily: "Georgia", textColor: text, lineHeight: 1.68 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 8, fontFamily: "Inter", textColor: sageGreen, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, linen),
        rect("accent", 38, 26, 24, 0.5, sageGreen),
        txt("blurb", "Rooted in nature, written with care. We hope this book helps you grow — one page at a time.", 14, 30, 72, 18, { fontSize: 11, fontFamily: "Georgia", textColor: text, lineHeight: 1.7, textAlign: "center" }),
        rect("rule", 40, 52, 20, 0.4, sageMuted),
        txt("title", bookTitle, 14, 56, 72, 8, { fontSize: 14, fontFamily: "Georgia", textColor: sageGreen, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 14, 66, 72, 5, { fontSize: 9, fontFamily: "Inter", textColor: "rgba(54,83,20,0.5)", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── Factory for generating additional templates ─────────────────────────────

interface PaletteSpec {
  bg: string; accent: string; accent2: string; heading: string;
  text: string; bodyText: string; muted: string; surface: string;
}

const makeTemplate = (
  id: string, name: string, description: string, niche: TemplateNiche,
  palette: PaletteSpec, titleFont: string, bodyFont: string,
  coverVariant: 1|2|3|4|5, contentVariant: 1|2|3
): EbookTemplate => ({
  id, name, description, niche, palette, titleFont, bodyFont, coverVariant, contentVariant,
  previewBg: palette.bg, previewAccent: palette.accent,
  orientation: 'portrait' as const,
  buildPage(page, allPages, bookTitle) {
    const p = palette;
    switch (page.type) {
      case 'cover': return [
        rect('bg', 0, 0, 100, 100, p.bg),
        ...(coverVariant === 1 ? [
          img('hero', 0, 0, 100, 55, ''),
          rect('bottom', 0, 55, 100, 45, p.bg),
          rect('accent-line', 0, 55, 100, 1.5, p.accent),
          txt('title', bookTitle, 6, 60, 88, 16, { fontSize: 28, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold', lineHeight: 1.1 }),
          txt('sub', 'A Comprehensive Guide', 6, 78, 60, 4, { fontSize: 10, fontFamily: bodyFont, textColor: p.muted }),
          rect('rule', 6, 84, 20, 0.6, p.accent),
        ] : coverVariant === 2 ? [
          rect('top-bar', 0, 0, 100, 40, p.surface),
          txt('label', name.toUpperCase(), 8, 14, 50, 5, { fontSize: 8, fontFamily: bodyFont, textColor: p.accent, fontWeight: 'bold' }),
          txt('title', bookTitle, 8, 22, 84, 14, { fontSize: 26, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold', lineHeight: 1.12 }),
          rect('accent-line', 8, 38, 30, 0.5, p.accent),
          img('hero', 0, 42, 100, 58, ''),
        ] : coverVariant === 3 ? [
          rect('gradient', 0, 0, 100, 100, p.accent, { opacity: 0.15 }),
          rect('side-bar', 0, 0, 5, 100, p.accent),
          txt('title', bookTitle, 10, 28, 80, 18, { fontSize: 30, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold', lineHeight: 1.1 }),
          txt('sub', description || 'Your Guide', 10, 50, 60, 5, { fontSize: 11, fontFamily: bodyFont, textColor: p.muted }),
          rect('rule', 10, 74, 22, 0.5, p.accent2),
          txt('author', 'Author Name', 10, 78, 40, 4, { fontSize: 9, fontFamily: bodyFont, textColor: p.bodyText }),
        ] : coverVariant === 4 ? [
          rect('border', 4, 4, 92, 92, 'transparent', { borderStyle: 'solid', borderWidth: 1, borderColor: p.accent }),
          rect('corner-tl', 4, 4, 4, 4, p.accent), rect('corner-tr', 92, 4, 4, 4, p.accent),
          rect('corner-bl', 4, 92, 4, 4, p.accent), rect('corner-br', 92, 92, 4, 4, p.accent),
          txt('title', bookTitle, 12, 32, 76, 16, { fontSize: 26, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.12 }),
          rect('divider', 28, 52, 44, 0.5, p.accent),
          txt('sub', 'A Definitive Guide', 12, 56, 76, 5, { fontSize: 10, fontFamily: bodyFont, textColor: p.muted, textAlign: 'center' }),
        ] : [
          rect('left', 0, 0, 45, 100, p.bg),
          rect('right', 45, 0, 55, 100, p.surface, { opacity: 0.2 }),
          img('hero', 45, 0, 55, 100, ''),
          txt('title', bookTitle, 5, 25, 38, 16, { fontSize: 22, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold', lineHeight: 1.15 }),
          txt('sub', 'Essential Guide', 5, 45, 35, 4, { fontSize: 9, fontFamily: bodyFont, textColor: p.muted }),
          rect('rule', 5, 65, 15, 0.5, p.accent),
        ]),
      ];
      case 'toc': return [
        rect('bg', 0, 0, 100, 100, p.bg),
        rect('accent', 0, 0, 100, 2, p.accent),
        txt('header', 'Contents', 8, 8, 50, 8, { fontSize: 22, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold' }),
        rect('rule', 8, 17, 20, 0.5, p.accent),
        ...tocRows(allPages, 22, 6.5, 10, p.bodyText, bodyFont, 10),
      ];
      case 'chapter': return [
        img('chapter-img', 0, 0, 100, 100, ''),
        rect('overlay', 0, 60, 100, 40, p.bg, { opacity: 0.9 }),
        rect('top-accent', 0, 0, 100, 2.5, p.accent),
        txt('num', `Chapter ${chNum(page, allPages)}`, 8, 64, 40, 5, { fontSize: 10, fontFamily: bodyFont, textColor: p.accent, fontWeight: 'bold' }),
        rect('rule', 8, 72, 84, 0.4, p.accent, { opacity: 0.4 }),
        txt('title', page.title, 8, 75, 84, 16, { fontSize: 24, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold', lineHeight: 1.15 }),
      ];
      case 'chapter-page': return [
        rect('bg', 0, 0, 100, 100, p.bg),
        ...(contentVariant === 1 ? [
          rect('top-bar', 0, 0, 100, 1.5, p.accent),
          txt('title', page.title, 8, 6, 84, 8, { fontSize: 16, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold' }),
          rect('rule', 8, 15, 84, 0.3, p.muted, { opacity: 0.3 }),
          txt('body', '', 8, 18, 84, 72, { fontSize: 11, fontFamily: bodyFont, textColor: p.bodyText, lineHeight: 1.7 }),
          txt('page-number', `${allPages.indexOf(page) + 1}`, 85, 93, 10, 4, { fontSize: 9, fontFamily: bodyFont, textColor: p.muted, textAlign: 'right' }),
        ] : contentVariant === 2 ? [
          rect('side-accent', 0, 0, 3, 100, p.accent, { opacity: 0.2 }),
          txt('title', page.title, 7, 6, 86, 8, { fontSize: 16, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold' }),
          txt('body', '', 7, 17, 86, 73, { fontSize: 11, fontFamily: bodyFont, textColor: p.bodyText, lineHeight: 1.7 }),
          txt('page-number', `${allPages.indexOf(page) + 1}`, 85, 93, 10, 4, { fontSize: 9, fontFamily: bodyFont, textColor: p.muted, textAlign: 'right' }),
        ] : [
          txt('title', page.title, 8, 8, 84, 8, { fontSize: 16, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold' }),
          rect('rule', 8, 17, 30, 0.5, p.accent),
          txt('body', '', 8, 20, 84, 70, { fontSize: 11, fontFamily: bodyFont, textColor: p.bodyText, lineHeight: 1.7 }),
          txt('page-number', `${allPages.indexOf(page) + 1}`, 45, 93, 10, 4, { fontSize: 9, fontFamily: bodyFont, textColor: p.muted, textAlign: 'center' }),
        ]),
      ];
      case 'back': return [
        rect('bg', 0, 0, 100, 100, p.bg),
        rect('accent', 0, 0, 100, 3, p.accent),
        txt('title', bookTitle, 10, 40, 80, 10, { fontSize: 18, fontFamily: titleFont, textColor: p.heading, fontWeight: 'bold', textAlign: 'center' }),
        rect('divider', 35, 54, 30, 0.4, p.accent),
        txt('tagline', 'Thank you for reading', 10, 58, 80, 5, { fontSize: 10, fontFamily: bodyFont, textColor: p.muted, textAlign: 'center' }),
      ];
      default: return [];
    }
  },
});

// ─── Palette Library ─────────────────────────────────────────────────────────
const PL: Record<string, PaletteSpec> = {
  midnight:    { bg: '#0a0e1a', accent: '#6366f1', accent2: '#818cf8', heading: '#f1f5f9', text: '#cbd5e1', bodyText: '#94a3b8', muted: '#475569', surface: '#1e293b' },
  ocean:       { bg: '#0c1e3a', accent: '#0ea5e9', accent2: '#38bdf8', heading: '#f0f9ff', text: '#bae6fd', bodyText: '#7dd3fc', muted: '#475569', surface: '#1e3a5f' },
  forest:      { bg: '#0a1f0a', accent: '#22c55e', accent2: '#4ade80', heading: '#f0fdf4', text: '#bbf7d0', bodyText: '#86efac', muted: '#475569', surface: '#14532d' },
  sunset:      { bg: '#1a0a0a', accent: '#f97316', accent2: '#fb923c', heading: '#fff7ed', text: '#fed7aa', bodyText: '#fdba74', muted: '#57534e', surface: '#431407' },
  wine:        { bg: '#1a0a14', accent: '#e11d48', accent2: '#fb7185', heading: '#fff1f2', text: '#fecdd3', bodyText: '#fda4af', muted: '#6b7280', surface: '#4c0519' },
  lavender:    { bg: '#f5f3ff', accent: '#7c3aed', accent2: '#a78bfa', heading: '#1e1b4b', text: '#4c1d95', bodyText: '#6d28d9', muted: '#a78bfa', surface: '#ede9fe' },
  cream:       { bg: '#fffbeb', accent: '#d97706', accent2: '#f59e0b', heading: '#451a03', text: '#78350f', bodyText: '#92400e', muted: '#d6d3d1', surface: '#fef3c7' },
  arctic:      { bg: '#f0f9ff', accent: '#0284c7', accent2: '#38bdf8', heading: '#0c4a6e', text: '#075985', bodyText: '#0369a1', muted: '#94a3b8', surface: '#e0f2fe' },
  charcoal:    { bg: '#18181b', accent: '#a1a1aa', accent2: '#d4d4d8', heading: '#fafafa', text: '#e4e4e7', bodyText: '#a1a1aa', muted: '#52525b', surface: '#27272a' },
  copper:      { bg: '#faf5f0', accent: '#b45309', accent2: '#d97706', heading: '#431a00', text: '#6b3a0a', bodyText: '#92400e', muted: '#a8a29e', surface: '#f5eed8' },
  emerald:     { bg: '#022c22', accent: '#10b981', accent2: '#34d399', heading: '#ecfdf5', text: '#a7f3d0', bodyText: '#6ee7b7', muted: '#475569', surface: '#064e3b' },
  ruby:        { bg: '#fff1f2', accent: '#dc2626', accent2: '#f87171', heading: '#450a0a', text: '#7f1d1d', bodyText: '#991b1b', muted: '#d6d3d1', surface: '#fecaca' },
  pearl:       { bg: '#fafaf9', accent: '#78716c', accent2: '#a8a29e', heading: '#1c1917', text: '#44403c', bodyText: '#57534e', muted: '#a8a29e', surface: '#f5f5f4' },
  sapphire:    { bg: '#0f172a', accent: '#2563eb', accent2: '#60a5fa', heading: '#eff6ff', text: '#bfdbfe', bodyText: '#93c5fd', muted: '#475569', surface: '#1e3a8a' },
  coral:       { bg: '#fff7ed', accent: '#ea580c', accent2: '#f97316', heading: '#431407', text: '#7c2d12', bodyText: '#9a3412', muted: '#d6d3d1', surface: '#ffedd5' },
  plum:        { bg: '#fdf4ff', accent: '#a21caf', accent2: '#d946ef', heading: '#4a044e', text: '#701a75', bodyText: '#86198f', muted: '#d8b4fe', surface: '#fae8ff' },
  mint:        { bg: '#f0fdfa', accent: '#0d9488', accent2: '#14b8a6', heading: '#134e4a', text: '#115e59', bodyText: '#0f766e', muted: '#94a3b8', surface: '#ccfbf1' },
  steel:       { bg: '#f1f5f9', accent: '#475569', accent2: '#64748b', heading: '#0f172a', text: '#1e293b', bodyText: '#334155', muted: '#94a3b8', surface: '#e2e8f0' },
  amber:       { bg: '#0a0800', accent: '#f59e0b', accent2: '#fbbf24', heading: '#fef3c7', text: '#fde68a', bodyText: '#fcd34d', muted: '#57534e', surface: '#451a03' },
  sky:         { bg: '#f0f9ff', accent: '#0369a1', accent2: '#0284c7', heading: '#0c4a6e', text: '#075985', bodyText: '#0369a1', muted: '#94a3b8', surface: '#bae6fd' },
  rose:        { bg: '#fff1f2', accent: '#e11d48', accent2: '#fb7185', heading: '#1c1917', text: '#44403c', bodyText: '#78716c', muted: '#d6d3d1', surface: '#fce7f3' },
  olive:       { bg: '#fafdf7', accent: '#65a30d', accent2: '#84cc16', heading: '#1a2e05', text: '#365314', bodyText: '#4d7c0f', muted: '#a8a29e', surface: '#ecfccb' },
  titanium:    { bg: '#f8fafc', accent: '#1e293b', accent2: '#334155', heading: '#0f172a', text: '#1e293b', bodyText: '#475569', muted: '#94a3b8', surface: '#e2e8f0' },
  gold:        { bg: '#1a1500', accent: '#eab308', accent2: '#facc15', heading: '#fef9c3', text: '#fef08a', bodyText: '#fde047', muted: '#57534e', surface: '#422006' },
  flamingo:    { bg: '#fdf2f8', accent: '#ec4899', accent2: '#f472b6', heading: '#500724', text: '#831843', bodyText: '#9d174d', muted: '#d6d3d1', surface: '#fce7f3' },
  glacier:     { bg: '#ecfeff', accent: '#06b6d4', accent2: '#22d3ee', heading: '#164e63', text: '#155e75', bodyText: '#0e7490', muted: '#94a3b8', surface: '#cffafe' },
  bronze:      { bg: '#faf6f1', accent: '#a16207', accent2: '#ca8a04', heading: '#422006', text: '#713f12', bodyText: '#854d0e', muted: '#a8a29e', surface: '#fef3c7' },
  slate2:      { bg: '#f8fafc', accent: '#334155', accent2: '#475569', heading: '#020617', text: '#0f172a', bodyText: '#334155', muted: '#94a3b8', surface: '#e2e8f0' },
};

// ─── 88 Factory Templates ────────────────────────────────────────────────────
const FACTORY_TEMPLATES: EbookTemplate[] = [
  // Business (9)
  makeTemplate('biz-exec',       'Executive',       'Corporate boardroom sophistication',   'Business', PL.midnight,  'Playfair Display', 'Inter', 1, 1),
  makeTemplate('biz-venture',    'Venture',         'Startup-ready bold pitch deck style',  'Business', PL.sapphire,  'Space Grotesk', 'Inter', 2, 3),
  makeTemplate('biz-consult',    'Consultant',      'Clean advisory presentation',          'Business', PL.titanium,  'DM Serif Display', 'DM Sans', 4, 1),
  makeTemplate('biz-growth',     'Growth',          'Scale-up metrics and strategy',        'Business', PL.emerald,   'Outfit', 'Inter', 3, 2),
  makeTemplate('biz-report',     'Annual Report',   'Formal corporate report layout',       'Business', PL.charcoal,  'Cormorant Garamond', 'Lato', 4, 3),
  makeTemplate('biz-pitch',      'Pitch Deck',      'Investor-ready presentation',          'Business', PL.ocean,     'Poppins', 'Inter', 2, 1),
  makeTemplate('biz-blueprint',  'Blueprint',       'Technical business documentation',     'Business', PL.steel,     'JetBrains Mono', 'IBM Plex Mono', 5, 3),
  makeTemplate('biz-boardroom',  'Boardroom',       'Elegant dark executive style',         'Business', PL.wine,      'Libre Baskerville', 'Source Sans Pro', 1, 2),
  makeTemplate('biz-modern',     'Modern Biz',      'Contemporary business communication',  'Business', PL.arctic,    'Nunito', 'Nunito Sans', 3, 1),
  // Health (9)
  makeTemplate('health-zen',     'Zen',             'Calm mindfulness and meditation',      'Health', PL.mint,        'Cormorant Garamond', 'Lato', 3, 2),
  makeTemplate('health-vitality','Vitality',        'Active energy and fitness focus',      'Health', PL.emerald,     'Outfit', 'Inter', 1, 1),
  makeTemplate('health-clinic',  'Clinical',        'Professional healthcare style',        'Health', PL.arctic,      'Space Grotesk', 'Inter', 2, 3),
  makeTemplate('health-holistic','Holistic',        'Natural and integrative wellness',     'Health', PL.olive,       'Fraunces', 'Work Sans', 5, 2),
  makeTemplate('health-calm',    'Calm',            'Soothing therapy-inspired layout',     'Health', PL.lavender,    'DM Serif Display', 'DM Sans', 3, 1),
  makeTemplate('health-pure',    'Pure',            'Clean minimal health guide',           'Health', PL.pearl,       'Nunito', 'Nunito Sans', 4, 3),
  makeTemplate('health-active',  'Active Life',     'Sports and movement focused',          'Health', PL.coral,       'Poppins', 'Inter', 1, 2),
  makeTemplate('health-nourish', 'Nourish',         'Nutrition and wholesome living',       'Health', PL.cream,       'Libre Baskerville', 'Source Sans Pro', 5, 1),
  makeTemplate('health-restore', 'Restore',         'Recovery and healing journey',         'Health', PL.glacier,     'Merriweather', 'Source Serif Pro', 2, 2),
  // Creative (9)
  makeTemplate('create-canvas',  'Canvas',          'Artistic freeform expression',         'Creative', PL.flamingo,  'Playfair Display', 'Inter', 1, 1),
  makeTemplate('create-neon',    'Neon',            'Vibrant glowing dark theme',           'Creative', PL.midnight,  'Space Grotesk', 'Inter', 2, 3),
  makeTemplate('create-studio',  'Studio',          'Professional creative workspace',      'Creative', PL.charcoal,  'DM Serif Display', 'DM Sans', 3, 2),
  makeTemplate('create-pastel2', 'Soft Touch',      'Gentle pastels and rounded forms',     'Creative', PL.lavender,  'Nunito', 'Nunito Sans', 5, 1),
  makeTemplate('create-bold',    'Bold',            'High-impact maximalist design',        'Creative', PL.sunset,    'Outfit', 'Inter', 1, 3),
  makeTemplate('create-gallery', 'Gallery',         'Museum-quality art presentation',      'Creative', PL.pearl,     'Cormorant Garamond', 'Lato', 4, 2),
  makeTemplate('create-ink',     'Ink',             'Hand-crafted editorial feel',          'Creative', PL.charcoal,  'Merriweather', 'Source Serif Pro', 3, 1),
  makeTemplate('create-pop',     'Pop Art',         'Colorful retro-inspired style',        'Creative', PL.coral,     'Poppins', 'Inter', 2, 2),
  makeTemplate('create-zen2',    'Minimal Art',     'Zen-inspired artistic simplicity',     'Creative', PL.mint,      'Fraunces', 'Work Sans', 4, 3),
  // Education (9)
  makeTemplate('edu-textbook',   'Textbook',        'Academic structured learning',         'Education', PL.sapphire, 'Merriweather', 'Source Serif Pro', 2, 3),
  makeTemplate('edu-course',     'Course Pack',     'Online course companion guide',        'Education', PL.emerald,  'Poppins', 'Inter', 1, 1),
  makeTemplate('edu-workshop',   'Workshop',        'Hands-on training material',           'Education', PL.cream,    'DM Serif Display', 'DM Sans', 3, 2),
  makeTemplate('edu-science',    'Lab Notes',       'Scientific documentation style',       'Education', PL.steel,    'JetBrains Mono', 'IBM Plex Mono', 4, 3),
  makeTemplate('edu-playful',    'Playful Learn',   'Fun engaging educational content',     'Education', PL.flamingo, 'Nunito', 'Nunito Sans', 5, 1),
  makeTemplate('edu-lecture',    'Lecture Notes',   'University lecture companion',          'Education', PL.pearl,    'Libre Baskerville', 'Source Sans Pro', 2, 2),
  makeTemplate('edu-research',   'Research',        'Academic research paper style',        'Education', PL.titanium, 'Cormorant Garamond', 'Lato', 4, 1),
  makeTemplate('edu-digital',    'Digital Learn',   'Modern e-learning platform style',     'Education', PL.ocean,    'Space Grotesk', 'Inter', 1, 3),
  makeTemplate('edu-handbook',   'Handbook',        'Comprehensive reference manual',       'Education', PL.olive,    'Outfit', 'Inter', 3, 2),
  // Technology (9)
  makeTemplate('tech-devops',    'DevOps',          'Infrastructure documentation',         'Technology', PL.midnight, 'JetBrains Mono', 'IBM Plex Mono', 2, 3),
  makeTemplate('tech-saas',      'SaaS',            'Product documentation style',          'Technology', PL.sapphire, 'Space Grotesk', 'Inter', 1, 1),
  makeTemplate('tech-cyber',     'Cyber',           'Security-focused dark theme',          'Technology', PL.emerald,  'Outfit', 'Inter', 3, 2),
  makeTemplate('tech-ai',        'AI Lab',          'Machine learning documentation',       'Technology', PL.glacier,  'Poppins', 'Inter', 2, 1),
  makeTemplate('tech-api',       'API Docs',        'Technical reference guide',            'Technology', PL.charcoal, 'JetBrains Mono', 'IBM Plex Mono', 4, 3),
  makeTemplate('tech-cloud',     'Cloud',           'Cloud computing documentation',        'Technology', PL.ocean,    'DM Serif Display', 'DM Sans', 5, 2),
  makeTemplate('tech-mobile',    'Mobile First',    'App development guide',                'Technology', PL.flamingo, 'Nunito', 'Nunito Sans', 1, 3),
  makeTemplate('tech-data',      'Data',            'Data science and analytics',           'Technology', PL.amber,    'Space Grotesk', 'Inter', 3, 1),
  makeTemplate('tech-startup',   'Tech Startup',    'Innovation-focused tech docs',         'Technology', PL.wine,     'Outfit', 'Inter', 2, 2),
  // Lifestyle (9)
  makeTemplate('life-journal',   'Journal',         'Personal diary and reflection',        'Lifestyle', PL.cream,    'Cormorant Garamond', 'Lora', 5, 2),
  makeTemplate('life-travel',    'Wanderlust',      'Travel and adventure stories',         'Lifestyle', PL.ocean,    'Playfair Display', 'Inter', 1, 1),
  makeTemplate('life-food',      'Recipe Book',     'Culinary arts and cooking',            'Lifestyle', PL.coral,    'DM Serif Display', 'DM Sans', 3, 2),
  makeTemplate('life-garden',    'Garden',          'Botanical and gardening guide',        'Lifestyle', PL.olive,    'Fraunces', 'Work Sans', 5, 1),
  makeTemplate('life-home',      'Home & Living',   'Interior design inspiration',          'Lifestyle', PL.copper,   'Libre Baskerville', 'Source Sans Pro', 4, 3),
  makeTemplate('life-fashion',   'Style Guide',     'Fashion and beauty editorial',         'Lifestyle', PL.flamingo, 'Poppins', 'Inter', 2, 1),
  makeTemplate('life-photo',     'Photo Essay',     'Visual storytelling layout',           'Lifestyle', PL.charcoal, 'Playfair Display', 'Inter', 1, 3),
  makeTemplate('life-mindful',   'Mindful',         'Intentional living guide',             'Lifestyle', PL.mint,     'Nunito', 'Nunito Sans', 3, 2),
  makeTemplate('life-seasonal',  'Seasons',         'Seasonal lifestyle companion',         'Lifestyle', PL.cream,    'Merriweather', 'Source Serif Pro', 4, 1),
  // Finance (9)
  makeTemplate('fin-invest',     'Investor',        'Investment portfolio guide',           'Finance', PL.midnight,   'Space Grotesk', 'Inter', 2, 3),
  makeTemplate('fin-budget',     'Budget Pro',      'Personal finance management',          'Finance', PL.emerald,    'Poppins', 'Inter', 1, 1),
  makeTemplate('fin-crypto',     'Crypto',          'Digital currency and blockchain',      'Finance', PL.amber,      'JetBrains Mono', 'IBM Plex Mono', 3, 2),
  makeTemplate('fin-wealth',     'Wealth',          'Premium wealth management',            'Finance', PL.gold,       'Cormorant Garamond', 'Lato', 4, 1),
  makeTemplate('fin-trading',    'Trading',         'Market analysis and trading',          'Finance', PL.sapphire,   'Outfit', 'Inter', 2, 3),
  makeTemplate('fin-tax',        'Tax Guide',       'Tax planning and compliance',          'Finance', PL.steel,      'Merriweather', 'Source Serif Pro', 4, 2),
  makeTemplate('fin-retire',     'Retirement',      'Retirement planning guide',            'Finance', PL.arctic,     'DM Serif Display', 'DM Sans', 5, 1),
  makeTemplate('fin-real-estate','Real Estate',     'Property investment guide',            'Finance', PL.copper,     'Libre Baskerville', 'Source Sans Pro', 1, 3),
  makeTemplate('fin-startup-f',  'Fundraising',     'Startup financing guide',              'Finance', PL.ocean,      'Nunito', 'Nunito Sans', 3, 2),
  // Marketing (9)
  makeTemplate('mkt-brand',      'Brand Book',      'Brand identity guidelines',            'Marketing', PL.flamingo, 'Playfair Display', 'Inter', 1, 1),
  makeTemplate('mkt-social',     'Social',          'Social media strategy guide',          'Marketing', PL.glacier,  'Poppins', 'Inter', 2, 2),
  makeTemplate('mkt-content',    'Content Plan',    'Content marketing playbook',           'Marketing', PL.lavender, 'DM Serif Display', 'DM Sans', 3, 1),
  makeTemplate('mkt-seo',        'SEO Pro',         'Search optimization guide',            'Marketing', PL.emerald,  'Space Grotesk', 'Inter', 4, 3),
  makeTemplate('mkt-email',      'Email Pro',       'Email marketing guide',                'Marketing', PL.coral,    'Outfit', 'Inter', 5, 2),
  makeTemplate('mkt-analytics',  'Analytics',       'Data-driven marketing insights',       'Marketing', PL.midnight, 'JetBrains Mono', 'IBM Plex Mono', 2, 3),
  makeTemplate('mkt-funnel',     'Funnel',          'Sales funnel optimization',            'Marketing', PL.amber,    'Nunito', 'Nunito Sans', 1, 1),
  makeTemplate('mkt-launch',     'Launch',          'Product launch playbook',              'Marketing', PL.wine,     'Libre Baskerville', 'Source Sans Pro', 3, 2),
  makeTemplate('mkt-influence',  'Influencer',      'Creator economy guide',                'Marketing', PL.rose,     'Cormorant Garamond', 'Lato', 5, 1),
  // Self-Help (8)
  makeTemplate('self-mindset',   'Mindset',         'Growth mindset transformation',        'Self-Help', PL.lavender, 'Playfair Display', 'Inter', 3, 2),
  makeTemplate('self-habits',    'Habits',          'Daily habit building system',          'Self-Help', PL.emerald,  'Poppins', 'Inter', 1, 1),
  makeTemplate('self-journal2',  'Inner Work',      'Journaling and self-reflection',       'Self-Help', PL.cream,    'Cormorant Garamond', 'Lato', 5, 1),
  makeTemplate('self-purpose',   'Purpose',         'Finding your life direction',          'Self-Help', PL.ocean,    'DM Serif Display', 'DM Sans', 2, 3),
  makeTemplate('self-confidence','Confidence',      'Building unshakable confidence',       'Self-Help', PL.sunset,   'Outfit', 'Inter', 1, 2),
  makeTemplate('self-resilience','Resilience',      'Bouncing back stronger',               'Self-Help', PL.steel,    'Merriweather', 'Source Serif Pro', 4, 3),
  makeTemplate('self-focus',     'Deep Focus',      'Mastering concentration',              'Self-Help', PL.charcoal, 'Space Grotesk', 'Inter', 3, 1),
  makeTemplate('self-gratitude', 'Gratitude',       'Cultivating daily appreciation',       'Self-Help', PL.mint,     'Fraunces', 'Work Sans', 5, 2),
  // Fiction (8)
  makeTemplate('fic-thriller',   'Thriller',        'Suspenseful dark page-turner',         'Fiction', PL.midnight,   'Playfair Display', 'Inter', 1, 1),
  makeTemplate('fic-romance',    'Romance',         'Warm romantic novel styling',          'Fiction', PL.rose,       'Cormorant Garamond', 'Lora', 5, 2),
  makeTemplate('fic-fantasy',    'Fantasy',         'Epic world-building narrative',        'Fiction', PL.sapphire,   'DM Serif Display', 'DM Sans', 3, 1),
  makeTemplate('fic-scifi',      'Sci-Fi',          'Futuristic science fiction',           'Fiction', PL.emerald,    'Space Grotesk', 'Inter', 2, 3),
  makeTemplate('fic-mystery',    'Mystery',         'Atmospheric whodunit styling',         'Fiction', PL.wine,       'Libre Baskerville', 'Source Sans Pro', 4, 2),
  makeTemplate('fic-literary',   'Literary',        'Classic literary fiction',              'Fiction', PL.pearl,      'Merriweather', 'Source Serif Pro', 3, 1),
  makeTemplate('fic-adventure',  'Adventure',       'Action-packed storytelling',           'Fiction', PL.sunset,     'Outfit', 'Inter', 1, 3),
  makeTemplate('fic-horror',     'Horror',          'Dark atmospheric chiller',             'Fiction', PL.charcoal,   'Playfair Display', 'Inter', 2, 2),
  // General (8)
  makeTemplate('gen-clean',      'Clean',           'Universal minimal design',             'General', PL.pearl,      'Inter', 'Inter', 4, 1),
  makeTemplate('gen-dark',       'Dark Mode',       'Universal dark theme',                 'General', PL.charcoal,   'Space Grotesk', 'Inter', 2, 3),
  makeTemplate('gen-warm',       'Warm',            'Inviting warm-toned layout',           'General', PL.cream,      'DM Serif Display', 'DM Sans', 1, 2),
  makeTemplate('gen-cool',       'Cool',            'Cool-toned professional',              'General', PL.arctic,     'Poppins', 'Inter', 3, 1),
  makeTemplate('gen-classic',    'Classic',         'Timeless traditional layout',          'General', PL.titanium,   'Cormorant Garamond', 'Lato', 4, 2),
  makeTemplate('gen-bold2',      'Statement',       'Bold high-impact design',              'General', PL.wine,       'Outfit', 'Inter', 1, 3),
  makeTemplate('gen-nature',     'Natural',         'Organic earthy aesthetic',             'General', PL.olive,      'Fraunces', 'Work Sans', 5, 1),
  makeTemplate('gen-mono2',      'Monochrome',      'Stark black and white',                'General', PL.charcoal,   'JetBrains Mono', 'IBM Plex Mono', 3, 3),
];

// ─── Exports ─────────────────────────────────────────────────────────────────
export const EBOOK_TEMPLATES: EbookTemplate[] = [
  editorial, nordic, luxe, slate, terra, split, broadsheet, pastel,
  mono, aurora, rose, sage,
  ...FACTORY_TEMPLATES,
];

export const getTemplate = (id: string) =>
  EBOOK_TEMPLATES.find(t => t.id === id) ?? null;
