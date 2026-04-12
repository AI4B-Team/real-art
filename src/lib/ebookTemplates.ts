/**
 * ebookTemplates.ts
 * 8 fully-realized ebook templates — each defines a unique visual theme
 * and generates canvas elements for every page type (cover, toc, chapter, chapter-page, back).
 * Templates are seeded by bookTitle so they're deterministic per book.
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
  fontSize: 13, fontFamily: "Georgia", textColor: "#1f2937", lineHeight: 1.5,
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

/** Build TOC rows as text elements */
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

// ─── TEMPLATE 1: EDITORIAL ──────────────────────────────────────────────────
const editorial: EbookTemplate = {
  id: "editorial",
  name: "Editorial",
  description: "Bold magazine style — black backgrounds, stark contrast",
  previewBg: "#0a0a0a",
  previewAccent: "#f5f5f5",
  orientation: "portrait",
  buildPage(page, allPages, bookTitle) {
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, "#0a0a0a"),
        rect("rule-h", 8, 28, 84, 0.5, "#ffffff"),
        rect("rule-h2", 8, 82, 84, 0.5, "#ffffff"),
        txt("label", "DEFINITIVE GUIDE", 8, 22, 50, 5, { fontSize: 9, fontFamily: "Inter", textColor: "#888888", fontWeight: "bold" }),
        txt("title", bookTitle, 8, 30, 84, 40, { fontSize: 36, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.05 }),
        txt("sub", "COMPREHENSIVE EDITION", 8, 84, 70, 5, { fontSize: 9, fontFamily: "Inter", textColor: "#666666", fontWeight: "bold" }),
        rect("accent-dot", 8, 94, 6, 1.5, "#ffffff"),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, "#0a0a0a"),
        rect("rule", 8, 20, 84, 0.4, "#333333"),
        txt("header", "CONTENTS", 8, 10, 60, 8, { fontSize: 20, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold" }),
        ...tocRows(allPages, 24, 7, 11, "#aaaaaa", "Inter", 10),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 55, 100, 45, "rgba(10,10,10,0.75)"),
        txt("num", String(allPages.filter(p => p.type === "chapter").indexOf(page) + 1).padStart(2, "0"),
          8, 60, 20, 8, { fontSize: 28, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold" }),
        rect("rule", 8, 70, 30, 0.4, "#ffffff"),
        txt("title", page.title, 8, 72, 84, 14, { fontSize: 24, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.1 }),
        txt("desc", "", 8, 88, 84, 8, { fontSize: 11, fontFamily: "Inter", textColor: "rgba(255,255,255,0.6)" }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, "#0a0a0a"),
        rect("rule-l", 8, 0, 0.5, 100, "#222222"),
        txt("title", page.title, 14, 6, 78, 10, { fontSize: 15, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold" }),
        rect("rule", 14, 18, 78, 0.3, "#333333"),
        txt("body", "", 14, 21, 78, 70, { fontSize: 11, fontFamily: "Georgia", textColor: "#cccccc", lineHeight: 1.7 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 9, fontFamily: "Inter", textColor: "#555555", textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, "#0a0a0a"),
        rect("band", 0, 40, 100, 20, "#ffffff"),
        txt("title", bookTitle, 8, 44, 84, 12, { fontSize: 22, fontFamily: "Georgia", textColor: "#000000", fontWeight: "bold" }),
        txt("tag", "THE END", 8, 85, 40, 6, { fontSize: 9, fontFamily: "Inter", textColor: "#555555", fontWeight: "bold" }),
      ];
      default: return [];
    }
  },
};

// ─── TEMPLATE 2: NORDIC ─────────────────────────────────────────────────────
const nordic: EbookTemplate = {
  id: "nordic",
  name: "Nordic",
  description: "Scandinavian minimal — slate, forest green, clean geometry",
  previewBg: "#f0f4f0",
  previewAccent: "#2d5a27",
  orientation: "both",
  buildPage(page, allPages, bookTitle) {
    const green = "#2d5a27";
    const pale = "#f0f4f0";
    const ink = "#1a2318";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, pale),
        rect("side", 0, 0, 18, 100, green),
        rect("corner", 18, 0, 82, 22, green),
        txt("ch", "✦", 4, 4, 12, 12, { fontSize: 20, fontFamily: "Inter", textColor: "#ffffff" }),
        txt("title", bookTitle, 22, 24, 72, 40, { fontSize: 26, fontFamily: "Georgia", textColor: ink, fontWeight: "bold", lineHeight: 1.15 }),
        rect("rule", 22, 68, 40, 0.8, "#7fad79"),
        txt("sub", "A Complete Guide", 22, 71, 60, 6, { fontSize: 11, fontFamily: "Inter", textColor: ink }),
        circle("dot1", 84, 85, 5, green),
        circle("dot2", 78, 90, 3, "#7fad79"),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, pale),
        rect("header-bg", 0, 0, 100, 22, green),
        txt("header", "Table of Contents", 10, 7, 80, 10, { fontSize: 18, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold" }),
        ...tocRows(allPages, 26, 6.5, 11, ink, "Inter", 10),
        rect("foot", 0, 96, 100, 4, green),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 55, 100, 45, "rgba(26,35,24,0.8)"),
        rect("left", 0, 0, 8, 100, green),
        txt("num", `0${allPages.filter(p => p.type === "chapter").indexOf(page) + 1}`, 12, 60, 30, 10, { fontSize: 36, fontFamily: "Georgia", textColor: "#7fad79", fontWeight: "bold" }),
        rect("rule", 12, 72, 80, 0.6, "#7fad79"),
        txt("title", page.title, 12, 75, 80, 16, { fontSize: 22, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.2 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, pale),
        rect("top", 0, 0, 100, 3, green),
        txt("title", page.title, 10, 6, 80, 9, { fontSize: 14, fontFamily: "Georgia", textColor: ink, fontWeight: "bold" }),
        rect("rule", 10, 16, 14, 0.6, green),
        txt("body", "", 10, 19, 80, 73, { fontSize: 11, fontFamily: "Inter", textColor: "#334433", lineHeight: 1.68 }),
        txt("pnum", "", 84, 95, 8, 4, { fontSize: 9, fontFamily: "Inter", textColor: green, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, green),
        rect("card", 10, 30, 80, 40, pale, { borderRadius: 6 } as any),
        txt("title", bookTitle, 15, 38, 70, 14, { fontSize: 18, fontFamily: "Georgia", textColor: ink, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 15, 56, 70, 6, { fontSize: 10, fontFamily: "Inter", textColor: "#667766", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── TEMPLATE 3: LUXE ───────────────────────────────────────────────────────
const luxe: EbookTemplate = {
  id: "luxe",
  name: "Luxe",
  description: "Premium navy & gold — elegant typography, luxury feel",
  previewBg: "#0f1b35",
  previewAccent: "#c9a84c",
  orientation: "portrait",
  buildPage(page, allPages, bookTitle) {
    const navy = "#0f1b35";
    const gold = "#c9a84c";
    const cream = "#f9f5ec";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, navy),
        rect("border-t", 6, 6, 88, 0.5, gold),
        rect("border-b", 6, 94, 88, 0.5, gold),
        rect("border-l", 6, 6, 0.5, 88, gold),
        rect("border-r", 93.5, 6, 0.5, 88, gold),
        circle("gem1", 5, 5, 2, gold),
        circle("gem2", 93, 5, 2, gold),
        circle("gem3", 5, 93, 2, gold),
        circle("gem4", 93, 93, 2, gold),
        txt("title", bookTitle, 12, 30, 76, 32, { fontSize: 28, fontFamily: "Georgia", textColor: cream, fontWeight: "bold", lineHeight: 1.12, textAlign: "center" }),
        rect("rule-c", 35, 66, 30, 0.6, gold),
        txt("sub", "A PREMIUM GUIDE", 12, 69, 76, 6, { fontSize: 9, fontFamily: "Inter", textColor: gold, fontWeight: "bold", textAlign: "center" }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("head-bg", 0, 0, 100, 24, navy),
        rect("head-rule", 8, 22, 84, 0.5, gold),
        txt("header", "Table of Contents", 10, 8, 80, 12, { fontSize: 22, fontFamily: "Georgia", textColor: cream, fontWeight: "bold", textAlign: "center" }),
        ...tocRows(allPages, 28, 6.5, 11, navy, "Georgia", 11),
        rect("foot-rule", 8, 92, 84, 0.5, gold),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 0, 100, 100, "rgba(15,27,53,0.7)"),
        rect("gold-l", 8, 8, 0.8, 84, gold),
        rect("gold-t", 8, 8, 84, 0.8, gold),
        txt("num", `Chapter ${allPages.filter(p => p.type === "chapter").indexOf(page) + 1}`, 14, 60, 72, 7, { fontSize: 11, fontFamily: "Inter", textColor: gold, fontWeight: "bold", textAlign: "center" }),
        rect("rule-c", 30, 69, 40, 0.5, gold),
        txt("title", page.title, 12, 72, 76, 18, { fontSize: 24, fontFamily: "Georgia", textColor: cream, fontWeight: "bold", lineHeight: 1.12, textAlign: "center" }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("nav-top", 0, 0, 100, 8, navy),
        txt("nav-title", bookTitle, 8, 1, 60, 6, { fontSize: 8, fontFamily: "Inter", textColor: gold }),
        txt("title", page.title, 8, 11, 84, 10, { fontSize: 17, fontFamily: "Georgia", textColor: navy, fontWeight: "bold" }),
        rect("rule", 8, 22, 10, 0.6, gold),
        txt("body", "", 8, 25, 84, 66, { fontSize: 11.5, fontFamily: "Georgia", textColor: "#2a2a40", lineHeight: 1.65 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 9, fontFamily: "Inter", textColor: gold, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, navy),
        rect("bt", 6, 6, 88, 0.5, gold),
        rect("bb", 6, 94, 88, 0.5, gold),
        rect("bl", 6, 6, 0.5, 88, gold),
        rect("br", 93.5, 6, 0.5, 88, gold),
        txt("title", bookTitle, 12, 38, 76, 16, { fontSize: 22, fontFamily: "Georgia", textColor: cream, fontWeight: "bold", textAlign: "center" }),
        rect("rule-c", 35, 56, 30, 0.6, gold),
        txt("tag", "THANK YOU FOR READING", 12, 59, 76, 5, { fontSize: 8, fontFamily: "Inter", textColor: gold, fontWeight: "bold", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── TEMPLATE 4: SLATE ──────────────────────────────────────────────────────
const slate: EbookTemplate = {
  id: "slate",
  name: "Slate",
  description: "Tech & business — cool grays, electric blue accents",
  previewBg: "#1e2530",
  previewAccent: "#3b82f6",
  orientation: "both",
  buildPage(page, allPages, bookTitle) {
    const dark = "#1e2530";
    const blue = "#3b82f6";
    const light = "#f8fafc";
    const muted = "#64748b";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, dark),
        rect("blue-bar", 0, 0, 6, 100, blue),
        rect("blue-top", 6, 0, 94, 30, "#253045"),
        txt("tag", "PROFESSIONAL GUIDE", 10, 8, 84, 5, { fontSize: 8, fontFamily: "Inter", textColor: blue, fontWeight: "bold" }),
        rect("rule", 10, 16, 80, 0.4, blue),
        txt("title", bookTitle, 10, 19, 82, 36, { fontSize: 26, fontFamily: "Inter", textColor: light, fontWeight: "bold", lineHeight: 1.1 }),
        img("img", 10, 58, 80, 28, "", { borderRadius: 4 } as any),
        txt("pnum-foot", "", 10, 90, 40, 5, { fontSize: 9, fontFamily: "Inter", textColor: muted }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, light),
        rect("head", 0, 0, 100, 20, dark),
        txt("header", "Contents", 8, 6, 60, 10, { fontSize: 22, fontFamily: "Inter", textColor: light, fontWeight: "bold" }),
        rect("blue-rule", 8, 20, 100, 2, blue),
        ...tocRows(allPages, 25, 6.5, 11, dark, "Inter", 10),
        rect("foot", 0, 96, 100, 4, blue),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 55, 100, 45, "rgba(30,37,48,0.85)"),
        txt("num", `${String(allPages.filter(p => p.type === "chapter").indexOf(page) + 1).padStart(2, "0")}`, 8, 60, 25, 10, { fontSize: 28, fontFamily: "Inter", textColor: blue, fontWeight: "bold" }),
        rect("rule", 8, 72, 84, 0.4, blue),
        txt("title", page.title, 8, 75, 84, 14, { fontSize: 22, fontFamily: "Inter", textColor: light, fontWeight: "bold", lineHeight: 1.15 }),
        txt("sub", "", 8, 90, 70, 6, { fontSize: 10, fontFamily: "Inter", textColor: muted }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, light),
        rect("top-bar", 0, 0, 100, 1.5, blue),
        txt("title", page.title, 8, 4, 80, 9, { fontSize: 15, fontFamily: "Inter", textColor: dark, fontWeight: "bold" }),
        rect("rule", 8, 14, 8, 0.5, blue),
        txt("body", "", 8, 17, 84, 74, { fontSize: 11, fontFamily: "Inter", textColor: "#334155", lineHeight: 1.65 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 9, fontFamily: "Inter", textColor: blue, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, dark),
        rect("accent-bar", 0, 45, 100, 10, blue),
        txt("title", bookTitle, 8, 48, 84, 6, { fontSize: 18, fontFamily: "Inter", textColor: light, fontWeight: "bold" }),
        txt("tag", "Thank you for reading", 8, 72, 60, 6, { fontSize: 10, fontFamily: "Inter", textColor: muted }),
      ];
      default: return [];
    }
  },
};

// ─── TEMPLATE 5: TERRA ──────────────────────────────────────────────────────
const terra: EbookTemplate = {
  id: "terra",
  name: "Terra",
  description: "Warm & earthy — terracotta, cream, organic shapes",
  previewBg: "#e8d5c4",
  previewAccent: "#c0522a",
  orientation: "portrait",
  buildPage(page, allPages, bookTitle) {
    const terracotta = "#c0522a";
    const cream = "#fdf6ee";
    const sand = "#e8d5c4";
    const ink = "#3d2010";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("terra-top", 0, 0, 100, 55, sand),
        circle("orb1", -10, -10, 60, "#e8c4a8"),
        circle("orb2", 60, -5, 40, "#f0ddd0"),
        img("img", 10, 5, 80, 44, "", { borderRadius: 8 } as any),
        rect("card", 8, 52, 84, 40, cream, { borderRadius: 6 } as any),
        txt("title", bookTitle, 13, 55, 74, 24, { fontSize: 22, fontFamily: "Georgia", textColor: ink, fontWeight: "bold", lineHeight: 1.2 }),
        rect("rule", 13, 81, 18, 0.8, terracotta),
        txt("sub", "A Complete Guide", 13, 84, 60, 5, { fontSize: 10, fontFamily: "Inter", textColor: terracotta }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("head-bg", 0, 0, 100, 22, terracotta),
        circle("dec", 80, -10, 30, "#b04820"),
        txt("header", "Contents", 10, 7, 60, 11, { fontSize: 22, fontFamily: "Georgia", textColor: cream, fontWeight: "bold" }),
        ...tocRows(allPages, 26, 6.5, 10, ink, "Georgia", 11),
        rect("foot-rule", 8, 92, 84, 0.6, terracotta),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 55, 100, 45, "rgba(60,30,10,0.75)"),
        rect("terra-left", 0, 0, 10, 100, terracotta),
        txt("num", `0${allPages.filter(p => p.type === "chapter").indexOf(page) + 1}`, 14, 60, 30, 12, { fontSize: 40, fontFamily: "Georgia", textColor: sand, fontWeight: "bold" }),
        rect("rule", 14, 74, 78, 0.6, sand),
        txt("title", page.title, 14, 77, 78, 16, { fontSize: 22, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.2 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, cream),
        rect("top-accent", 0, 0, 100, 4, sand),
        rect("side-rule", 6, 8, 0.6, 84, terracotta),
        txt("title", page.title, 12, 6, 80, 10, { fontSize: 15, fontFamily: "Georgia", textColor: ink, fontWeight: "bold" }),
        txt("body", "", 12, 19, 80, 72, { fontSize: 11.5, fontFamily: "Georgia", textColor: "#4a2e1a", lineHeight: 1.68 }),
        txt("pnum", "", 84, 95, 8, 4, { fontSize: 9, fontFamily: "Inter", textColor: terracotta, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, terracotta),
        circle("orb1", 60, 60, 80, "#b04820"),
        circle("orb2", -10, -10, 50, "#d06030"),
        rect("card", 10, 28, 80, 44, cream, { borderRadius: 8 } as any),
        txt("title", bookTitle, 15, 34, 70, 18, { fontSize: 18, fontFamily: "Georgia", textColor: ink, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading", 15, 56, 70, 6, { fontSize: 10, fontFamily: "Inter", textColor: terracotta, textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── TEMPLATE 6: SPLIT ──────────────────────────────────────────────────────
const split: EbookTemplate = {
  id: "split",
  name: "Split",
  description: "Landscape split — two-column layout, perfect for reports",
  previewBg: "#f8f4ff",
  previewAccent: "#7c3aed",
  orientation: "landscape",
  buildPage(page, allPages, bookTitle) {
    const violet = "#7c3aed";
    const lt = "#f8f4ff";
    const dark = "#1e1040";
    const mid = "#ede9fe";
    switch (page.type) {
      case "cover": return [
        rect("left-panel", 0, 0, 48, 100, violet),
        rect("right-panel", 48, 0, 52, 100, lt),
        txt("title", bookTitle, 4, 20, 40, 50, { fontSize: 24, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.15 }),
        rect("rule", 4, 74, 22, 0.8, "rgba(255,255,255,0.5)"),
        txt("sub", "A Complete Guide", 4, 78, 38, 6, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.7)" }),
        img("img", 50, 5, 46, 90, "", { borderRadius: 6 } as any),
      ];
      case "toc": return [
        rect("left", 0, 0, 40, 100, violet),
        rect("right", 40, 0, 60, 100, lt),
        txt("header", "Contents", 4, 10, 32, 14, { fontSize: 20, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold" }),
        rect("rule", 4, 26, 28, 0.5, "rgba(255,255,255,0.4)"),
        txt("book-title", bookTitle, 4, 30, 32, 18, { fontSize: 11, fontFamily: "Inter", textColor: "rgba(255,255,255,0.6)", lineHeight: 1.4 }),
        ...tocRows(allPages, 8, 7, 12, dark, "Inter", 10).map(e => ({ ...e, x: 44, width: 52 })),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 55, 100, 45, "rgba(30,10,60,0.8)"),
        txt("num", `CH ${allPages.filter(p => p.type === "chapter").indexOf(page) + 1}`, 8, 60, 20, 6, { fontSize: 10, fontFamily: "Inter", textColor: "rgba(255,255,255,0.5)", fontWeight: "bold" }),
        txt("title", page.title, 8, 67, 84, 16, { fontSize: 26, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.1 }),
        rect("rule", 8, 85, 30, 0.4, violet),
        txt("desc", "", 8, 88, 84, 8, { fontSize: 11, fontFamily: "Inter", textColor: "rgba(255,255,255,0.6)", lineHeight: 1.6 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, lt),
        rect("left-gutter", 0, 0, 8, 100, mid),
        rect("rule-v", 8, 0, 0.4, 100, violet),
        txt("title", page.title, 12, 5, 80, 9, { fontSize: 15, fontFamily: "Georgia", textColor: dark, fontWeight: "bold" }),
        rect("rule-h", 12, 15, 80, 0.4, violet),
        txt("body", "", 12, 18, 80, 74, { fontSize: 11, fontFamily: "Inter", textColor: "#2d1f60", lineHeight: 1.65 }),
        txt("pnum", "", 85, 95, 8, 4, { fontSize: 9, fontFamily: "Inter", textColor: violet, textAlign: "right" }),
      ];
      case "back": return [
        rect("right", 50, 0, 50, 100, violet),
        rect("left", 0, 0, 50, 100, dark),
        txt("title", bookTitle, 4, 35, 42, 20, { fontSize: 20, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold" }),
        txt("tag", "Thank you", 4, 60, 42, 8, { fontSize: 12, fontFamily: "Inter", textColor: "rgba(255,255,255,0.5)" }),
        circle("dec1", 60, 60, 40, "#6d28d9"),
        circle("dec2", 80, 20, 25, "#8b5cf6"),
      ];
      default: return [];
    }
  },
};

// ─── TEMPLATE 7: NEWSPAPER ──────────────────────────────────────────────────
const newspaper: EbookTemplate = {
  id: "newspaper",
  name: "Newspaper",
  description: "Classic broadsheet — dense grid, authoritative editorial",
  previewBg: "#fafafa",
  previewAccent: "#111111",
  orientation: "portrait",
  buildPage(page, allPages, bookTitle) {
    const black = "#111111";
    const white = "#fafafa";
    const red = "#cc1a1a";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, white),
        rect("masthead-bg", 0, 0, 100, 16, black),
        rect("red-rule", 0, 16, 100, 1.2, red),
        txt("masthead", bookTitle.toUpperCase(), 4, 2, 92, 12, { fontSize: 28, fontFamily: "Georgia", textColor: white, fontWeight: "bold", textAlign: "center" }),
        txt("dateline", "COMPREHENSIVE SPECIAL EDITION", 4, 17, 92, 5, { fontSize: 8, fontFamily: "Inter", textColor: black, fontWeight: "bold", textAlign: "center" }),
        rect("rule2", 4, 24, 92, 0.3, black),
        img("main-img", 4, 26, 92, 38, ""),
        rect("rule3", 4, 66, 92, 0.4, black),
        txt("headline", "Everything You Need To Know", 4, 68, 92, 12, { fontSize: 18, fontFamily: "Georgia", textColor: black, fontWeight: "bold", lineHeight: 1.2 }),
        rect("col-rule", 50, 82, 0.3, 12, black),
        txt("col1", "Read the complete guide inside this exclusive edition.", 4, 82, 44, 12, { fontSize: 10, fontFamily: "Georgia", textColor: black, lineHeight: 1.5 }),
        txt("col2", "Expert analysis and actionable strategies for every reader.", 52, 82, 44, 12, { fontSize: 10, fontFamily: "Georgia", textColor: black, lineHeight: 1.5 }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, white),
        rect("head-bg", 0, 0, 100, 14, black),
        rect("red-rule", 0, 14, 100, 1, red),
        txt("header", "INDEX", 4, 3, 92, 10, { fontSize: 22, fontFamily: "Georgia", textColor: white, fontWeight: "bold", textAlign: "center" }),
        ...tocRows(allPages, 18, 6.5, 11, black, "Georgia", 10),
        rect("foot-rule", 4, 92, 92, 0.4, black),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 55, 100, 45, "rgba(255,255,255,0.92)"),
        rect("rule-t", 0, 0, 100, 1.5, red),
        txt("section", `CHAPTER ${allPages.filter(p => p.type === "chapter").indexOf(page) + 1}`, 4, 58, 92, 5, { fontSize: 8, fontFamily: "Inter", textColor: red, fontWeight: "bold" }),
        rect("rule2", 4, 64, 92, 0.4, black),
        txt("title", page.title, 4, 67, 92, 18, { fontSize: 28, fontFamily: "Georgia", textColor: black, fontWeight: "bold", lineHeight: 1.08 }),
        rect("rule3", 4, 87, 92, 0.8, black),
        txt("summary", "", 4, 89, 92, 8, { fontSize: 10, fontFamily: "Georgia", textColor: black, lineHeight: 1.6 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, white),
        rect("rule-t", 4, 0, 92, 0.3, black),
        txt("title", page.title, 4, 2, 88, 7, { fontSize: 13, fontFamily: "Georgia", textColor: black, fontWeight: "bold" }),
        rect("rule2", 4, 10, 92, 0.3, black),
        rect("col-rule", 50, 12, 0.3, 80, black),
        txt("col1", "", 4, 12, 44, 80, { fontSize: 10.5, fontFamily: "Georgia", textColor: black, lineHeight: 1.65 }),
        txt("col2", "", 52, 12, 44, 80, { fontSize: 10.5, fontFamily: "Georgia", textColor: black, lineHeight: 1.65 }),
        txt("pnum", "", 86, 95, 8, 4, { fontSize: 9, fontFamily: "Georgia", textColor: black, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, white),
        rect("rule-t", 0, 0, 100, 1.5, red),
        rect("rule-b", 0, 98.5, 100, 1.5, red),
        txt("title", bookTitle.toUpperCase(), 4, 40, 92, 16, { fontSize: 24, fontFamily: "Georgia", textColor: black, fontWeight: "bold", textAlign: "center" }),
        rect("rule-c", 30, 58, 40, 0.5, black),
        txt("tag", "A DEFINITIVE GUIDE", 4, 61, 92, 5, { fontSize: 9, fontFamily: "Inter", textColor: black, fontWeight: "bold", textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── TEMPLATE 8: PASTEL ─────────────────────────────────────────────────────
const pastel: EbookTemplate = {
  id: "pastel",
  name: "Pastel",
  description: "Friendly & modern — soft lavender, mint, rounded shapes",
  previewBg: "#ede9fe",
  previewAccent: "#8b5cf6",
  orientation: "both",
  buildPage(page, allPages, bookTitle) {
    const lav = "#ede9fe";
    const mint = "#d1fae5";
    const violet = "#7c3aed";
    const teal = "#0d9488";
    const dark = "#1e1b4b";
    switch (page.type) {
      case "cover": return [
        rect("bg", 0, 0, 100, 100, lav),
        circle("blob1", -10, -10, 50, "#ddd6fe"),
        circle("blob2", 70, 60, 60, mint),
        circle("blob3", 50, -20, 40, "#c7d2fe"),
        rect("card", 8, 20, 84, 60, "#ffffff", { borderRadius: 12 } as any),
        txt("title", bookTitle, 13, 26, 74, 32, { fontSize: 22, fontFamily: "Georgia", textColor: dark, fontWeight: "bold", lineHeight: 1.2 }),
        rect("pill", 28, 60, 44, 6, violet, { borderRadius: 12 } as any),
        txt("pill-txt", "A Complete Guide", 28, 60, 44, 6, { fontSize: 9, fontFamily: "Inter", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
      ];
      case "toc": return [
        rect("bg", 0, 0, 100, 100, lav),
        circle("dec1", 80, -10, 40, "#ddd6fe"),
        rect("header-card", 6, 5, 88, 18, violet, { borderRadius: 8 } as any),
        txt("header", "Table of Contents", 10, 8, 80, 11, { fontSize: 18, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        ...tocRows(allPages, 27, 6.5, 11, dark, "Inter", 10),
        circle("dec-foot", -5, 90, 20, mint),
      ];
      case "chapter": return [
        img("chapter-img", 0, 0, 100, 100, ""),
        rect("overlay", 0, 55, 100, 45, "rgba(30,0,60,0.7)"),
        rect("num-pill", 8, 60, 18, 8, violet, { borderRadius: 8 } as any),
        txt("num", `Chapter ${allPages.filter(p => p.type === "chapter").indexOf(page) + 1}`, 8, 60, 18, 8, { fontSize: 9, fontFamily: "Inter", textColor: "#ffffff", fontWeight: "bold", textAlign: "center" }),
        txt("title", page.title, 8, 72, 84, 18, { fontSize: 24, fontFamily: "Georgia", textColor: "#ffffff", fontWeight: "bold", lineHeight: 1.15 }),
      ];
      case "chapter-page": return [
        rect("bg", 0, 0, 100, 100, "#faf9ff"),
        rect("top-strip", 0, 0, 100, 2, violet),
        rect("left-strip", 0, 2, 2, 98, mint),
        txt("title", page.title, 7, 5, 85, 9, { fontSize: 15, fontFamily: "Georgia", textColor: dark, fontWeight: "bold" }),
        rect("rule", 7, 15, 12, 0.6, violet),
        txt("body", "", 7, 18, 86, 73, { fontSize: 11, fontFamily: "Inter", textColor: "#312e81", lineHeight: 1.68 }),
        circle("foot-dec", 88, 92, 8, "#ddd6fe"),
        txt("pnum", "", 84, 94, 10, 5, { fontSize: 9, fontFamily: "Inter", textColor: violet, textAlign: "right" }),
      ];
      case "back": return [
        rect("bg", 0, 0, 100, 100, violet),
        circle("blob1", -20, -20, 70, "#6d28d9"),
        circle("blob2", 80, 80, 60, teal),
        rect("card", 10, 30, 80, 40, "#ffffff", { borderRadius: 12 } as any),
        txt("title", bookTitle, 14, 36, 72, 18, { fontSize: 18, fontFamily: "Georgia", textColor: dark, fontWeight: "bold", textAlign: "center" }),
        txt("tag", "Thank you for reading ✦", 14, 57, 72, 7, { fontSize: 10, fontFamily: "Inter", textColor: violet, textAlign: "center" }),
      ];
      default: return [];
    }
  },
};

// ─── Exports ─────────────────────────────────────────────────────────────────
export const EBOOK_TEMPLATES: EbookTemplate[] = [
  editorial, nordic, luxe, slate, terra, split, newspaper, pastel,
];

export const getTemplate = (id: string) =>
  EBOOK_TEMPLATES.find(t => t.id === id) ?? null;
