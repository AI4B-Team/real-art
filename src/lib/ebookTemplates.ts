/**
 * ebookTemplates.ts
 * 12 modern ebook templates — each defines a unique visual theme
 * and generates canvas elements for every page type.
 */

import type { CanvasElement, Page } from "@/components/ebook/EbookCanvasEditor";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface EbookTemplate {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  orientation: "portrait" | "landscape" | "both";
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
        rect("strip", 0, 44, 100, 12, "#18181b"),
        txt("title", bookTitle, 8, 46, 84, 8, { fontSize: 20, fontFamily: "Playfair Display", textColor: fg, fontWeight: "bold" }),
        txt("tag", "FIN", 8, 88, 20, 4, { fontSize: 9, fontFamily: "Inter", textColor: dim }),
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
        txt("title", bookTitle, 10, 40, 80, 12, { fontSize: 22, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        rect("rule", 35, 55, 30, 0.5, sage),
        txt("tag", "Thank you for reading", 10, 59, 80, 5, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.65)", textAlign: "center" }),
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
        txt("title", bookTitle, 14, 40, 72, 12, { fontSize: 22, fontFamily: "Playfair Display", textColor: cream, fontWeight: "bold", textAlign: "center" }),
        rect("rule", 38, 54, 24, 0.4, gold),
        txt("tag", "THANK YOU", 14, 58, 72, 5, { fontSize: 8, fontFamily: "Inter", textColor: gold, fontWeight: "bold", textAlign: "center" }),
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
        rect("accent", 0, 46, 100, 8, blue),
        txt("title", bookTitle, 8, 48, 84, 5, { fontSize: 16, fontFamily: "Inter", textColor: light, fontWeight: "bold" }),
        txt("tag", "Thank you for reading", 8, 68, 50, 4, { fontSize: 9, fontFamily: "Inter", textColor: muted }),
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
        rect("bg", 0, 0, 100, 100, rust),
        txt("title", bookTitle, 10, 40, 80, 12, { fontSize: 20, fontFamily: "Georgia", textColor: cream, fontWeight: "bold", textAlign: "center" }),
        rect("rule", 35, 55, 30, 0.5, sand),
        txt("tag", "Thank you for reading", 10, 59, 80, 5, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.65)", textAlign: "center" }),
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
        rect("left", 0, 0, 50, 100, dark),
        rect("right", 50, 0, 50, 100, violet),
        txt("title", bookTitle, 5, 38, 42, 16, { fontSize: 20, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold" }),
        txt("tag", "Thank you", 5, 58, 40, 6, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.5)" }),
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
        txt("title", bookTitle.toUpperCase(), 4, 42, 92, 12, { fontSize: 24, fontFamily: "Georgia", textColor: black, fontWeight: "bold", textAlign: "center" }),
        rect("rule", 30, 56, 40, 0.4, black),
        txt("tag", "A DEFINITIVE GUIDE", 4, 60, 92, 4, { fontSize: 8, fontFamily: "Inter", textColor: black, fontWeight: "bold", textAlign: "center" }),
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
        rect("card", 12, 32, 76, 36, "#ffffff", { borderRadius: 14 } as any),
        txt("title", bookTitle, 16, 38, 68, 14, { fontSize: 18, fontFamily: "Georgia", textColor: dark, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading ✦", 16, 56, 68, 6, { fontSize: 10, fontFamily: "Inter", textColor: violet, textAlign: "center" }),
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
        txt("title", bookTitle.toUpperCase(), 8, 42, 84, 10, { fontSize: 22, fontFamily: "Inter", textColor: wh, fontWeight: "bold", textAlign: "center" }),
        rect("rule", 35, 54, 30, 0.3, gy),
        txt("tag", "END", 8, 58, 84, 4, { fontSize: 9, fontFamily: "Inter", textColor: gy, textAlign: "center" }),
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
        txt("title", bookTitle, 10, 40, 80, 12, { fontSize: 20, fontFamily: "Inter", textColor: fg, fontWeight: "bold", textAlign: "center" }),
        rect("rule", 38, 55, 24, 0.4, teal),
        txt("tag", "Thank you", 10, 59, 80, 4, { fontSize: 9, fontFamily: "Inter", textColor: "rgba(240,253,250,0.45)", textAlign: "center" }),
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
        txt("title", bookTitle, 10, 40, 80, 12, { fontSize: 22, fontFamily: "Playfair Display", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        rect("rule", 38, 55, 24, 0.4, pinkSoft),
        txt("tag", "Thank you for reading", 10, 59, 80, 5, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.5)", textAlign: "center" }),
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
        rect("bg", 0, 0, 100, 100, sageGreen),
        txt("title", bookTitle, 10, 40, 80, 12, { fontSize: 22, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        rect("rule", 38, 55, 24, 0.4, "rgba(255,255,255,0.4)"),
        txt("tag", "Thank you for reading", 10, 59, 80, 5, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.65)", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── Exports ─────────────────────────────────────────────────────────────────
export const EBOOK_TEMPLATES: EbookTemplate[] = [
  editorial, nordic, luxe, slate, terra, split, broadsheet, pastel,
  mono, aurora, rose, sage,
];

export const getTemplate = (id: string) =>
  EBOOK_TEMPLATES.find(t => t.id === id) ?? null;
