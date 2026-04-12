import type { CanvasElement, Page } from "@/components/ebook/EbookCanvasEditor";

export interface GeneratedChapterPage {
  title: string;
  content: string;
  imagePrompt?: string;
}

export interface GeneratedChapterInput {
  title: string;
  summary: string;
  coverImagePrompt?: string;
  pages: GeneratedChapterPage[];
}

interface ThemePalette {
  accent: string;
  accentSoft: string;
  accentMuted: string;
  text: string;
  body: string;
  surface: string;
  surfaceAlt: string;
  backBackground: string;
}

interface BookTheme {
  palette: ThemePalette;
  titleFont: string;
  bodyFont: string;
  coverLayout: "lower-left" | "lower-right" | "upper-left";
  chapterImageHeight: number;
  contentImageHeight: number;
  dividerWidth: number;
}

export interface GeneratedImageTask {
  pageId: string;
  imagePrompt: string;
}

export interface GeneratedBookLayout {
  pages: Page[];
  elementsByPage: Record<string, CanvasElement[]>;
  imageTasks: GeneratedImageTask[];
}

const PALETTES: ThemePalette[] = [
  {
    accent: "hsl(189 88% 41%)",
    accentSoft: "hsl(189 92% 95%)",
    accentMuted: "hsl(189 52% 82%)",
    text: "hsl(232 29% 18%)",
    body: "hsl(220 16% 31%)",
    surface: "hsl(0 0% 100%)",
    surfaceAlt: "hsl(210 40% 98%)",
    backBackground: "hsl(180 63% 22%)",
  },
  {
    accent: "hsl(12 86% 55%)",
    accentSoft: "hsl(12 100% 96%)",
    accentMuted: "hsl(12 68% 82%)",
    text: "hsl(228 24% 16%)",
    body: "hsl(225 14% 32%)",
    surface: "hsl(34 33% 98%)",
    surfaceAlt: "hsl(24 50% 97%)",
    backBackground: "hsl(18 62% 24%)",
  },
  {
    accent: "hsl(157 73% 36%)",
    accentSoft: "hsl(154 55% 95%)",
    accentMuted: "hsl(154 45% 84%)",
    text: "hsl(224 25% 15%)",
    body: "hsl(214 14% 34%)",
    surface: "hsl(0 0% 100%)",
    surfaceAlt: "hsl(150 29% 97%)",
    backBackground: "hsl(165 60% 22%)",
  },
  {
    accent: "hsl(225 72% 58%)",
    accentSoft: "hsl(222 100% 97%)",
    accentMuted: "hsl(225 60% 84%)",
    text: "hsl(228 27% 16%)",
    body: "hsl(222 13% 34%)",
    surface: "hsl(0 0% 100%)",
    surfaceAlt: "hsl(224 28% 97%)",
    backBackground: "hsl(229 46% 24%)",
  },
];

const TITLE_FONTS = ["Georgia", "Playfair Display", "Merriweather"] as const;
const BODY_FONTS = ["Georgia", "Merriweather", "Inter"] as const;

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seedSource: string) => {
  let seed = hashString(seedSource) || 1;
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T,>(items: readonly T[] | T[], rng: () => number) => items[Math.floor(rng() * items.length)];

const createTheme = (seedSource: string): BookTheme => {
  const rng = createRng(seedSource);
  return {
    palette: pick(PALETTES, rng),
    titleFont: pick(TITLE_FONTS, rng),
    bodyFont: pick(BODY_FONTS, rng),
    coverLayout: pick(["lower-left", "lower-right", "upper-left"], rng),
    chapterImageHeight: 34 + Math.round(rng() * 10),
    contentImageHeight: 28 + Math.round(rng() * 8),
    dividerWidth: 16 + Math.round(rng() * 12),
  };
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const createImagePlaceholder = (
  palette: ThemePalette,
  variant: "cover" | "chapter" | "content",
  label: string,
) => {
  const subtitle = variant === "cover" ? "AI visual loading" : variant === "chapter" ? "Chapter visual" : "Context image";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.accentSoft}" />
          <stop offset="45%" stop-color="${palette.accentMuted}" />
          <stop offset="100%" stop-color="${palette.surfaceAlt}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#g)" />
      <circle cx="240" cy="180" r="190" fill="${palette.accent}" opacity="0.16" />
      <circle cx="985" cy="180" r="220" fill="${palette.backBackground}" opacity="0.12" />
      <rect x="120" y="120" width="960" height="660" rx="42" fill="${palette.surface}" opacity="0.22" />
      <path d="M120 655C310 530 468 534 680 610C818 658 944 654 1080 560V780H120Z" fill="${palette.accent}" opacity="0.16" />
      <rect x="150" y="690" width="280" height="12" rx="6" fill="${palette.accent}" opacity="0.55" />
      <text x="150" y="170" font-size="58" font-family="Georgia, serif" fill="${palette.text}" opacity="0.92">${escapeXml(label)}</text>
      <text x="150" y="245" font-size="28" font-family="Arial, sans-serif" fill="${palette.body}" opacity="0.72">${escapeXml(subtitle)}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const splitLongParagraph = (paragraph: string, maxWords: number) => {
  const sentences = paragraph
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    for (let index = 0; index < words.length; index += maxWords) {
      chunks.push(words.slice(index, index + maxWords).join(" "));
    }
    return chunks;
  }

  const chunks: string[] = [];
  let current = "";
  let currentWords = 0;

  sentences.forEach((sentence) => {
    const sentenceWords = sentence.split(/\s+/).filter(Boolean).length;
    if (current && currentWords + sentenceWords > maxWords) {
      chunks.push(current.trim());
      current = sentence;
      currentWords = sentenceWords;
      return;
    }
    current = current ? `${current} ${sentence}` : sentence;
    currentWords += sentenceWords;
  });

  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

export const paginateTextContent = (content: string, maxWordsPerPage: number) => {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .flatMap((paragraph) => {
      const wordCount = paragraph.split(/\s+/).filter(Boolean).length;
      return wordCount > maxWordsPerPage ? splitLongParagraph(paragraph, maxWordsPerPage) : [paragraph];
    });

  const segments: string[] = [];
  let currentParagraphs: string[] = [];
  let currentWords = 0;

  paragraphs.forEach((paragraph) => {
    const paragraphWords = paragraph.split(/\s+/).filter(Boolean).length;
    if (currentParagraphs.length > 0 && currentWords + paragraphWords > maxWordsPerPage) {
      segments.push(currentParagraphs.join("\n\n"));
      currentParagraphs = [paragraph];
      currentWords = paragraphWords;
      return;
    }
    currentParagraphs.push(paragraph);
    currentWords += paragraphWords;
  });

  if (currentParagraphs.length > 0) {
    segments.push(currentParagraphs.join("\n\n"));
  }

  return segments.length > 0 ? segments : [content.trim()];
};

const truncateWords = (content: string, maxWords: number) => {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return content;
  return `${words.slice(0, maxWords).join(" ")}…`;
};

const createCoverElements = (title: string, description: string, theme: BookTheme): CanvasElement[] => {
  const isLeft = theme.coverLayout !== "lower-right";
  const boxY = theme.coverLayout === "upper-left" ? 10 : 55;
  const boxX = isLeft ? 8 : 34;

  return [
    {
      id: "cover-image",
      type: "image",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      src: createImagePlaceholder(theme.palette, "cover", "Cover art in progress"),
    },
    {
      id: "title-box",
      type: "shape",
      x: boxX,
      y: boxY,
      width: 58,
      height: 30,
      fill: "hsla(0 0% 100% / 0.88)",
      stroke: "hsla(0 0% 100% / 0.2)",
      strokeWidth: 1,
      shapeType: "rectangle",
      borderRadius: 4,
    },
    {
      id: "title-text",
      type: "text",
      x: boxX + 5,
      y: boxY + 4,
      width: 48,
      height: 18,
      content: title,
      fontSize: 22,
      fontFamily: theme.titleFont,
      textColor: theme.palette.text,
      fontWeight: "bold",
      lineHeight: 1.18,
    },
    {
      id: "subtitle-text",
      type: "text",
      x: boxX + 5,
      y: boxY + 23,
      width: 46,
      height: 5,
      content: truncateWords(description || "A custom AI-crafted book", 14).toUpperCase(),
      fontSize: 9,
      fontFamily: theme.bodyFont,
      textColor: theme.palette.accent,
      lineHeight: 1.2,
      fontWeight: "bold",
    },
  ];
};

const createTocElements = (pages: Page[], theme: BookTheme): CanvasElement[] => {
  const chapterPages = pages.filter((page) => page.type === "chapter");
  const gap = chapterPages.length > 9 ? 5.2 : 6.2;

  return [
    {
      id: "toc-header",
      type: "text",
      x: 10,
      y: 8,
      width: 80,
      height: 8,
      content: "TABLE OF CONTENTS",
      fontSize: 24,
      fontFamily: theme.titleFont,
      textColor: theme.palette.text,
      fontWeight: "bold",
    },
    {
      id: "toc-line",
      type: "shape",
      x: 10,
      y: 18,
      width: theme.dividerWidth,
      height: 0.8,
      fill: theme.palette.accent,
      stroke: "transparent",
      shapeType: "rectangle",
    },
    ...chapterPages.map((page, index) => {
      const numberablePages = pages.filter((p) => p.type !== "cover" && p.type !== "toc" && p.type !== "back");
      const pageNum = numberablePages.indexOf(page) + 1;
      return {
        id: `toc-item-${page.id}`,
        type: "text" as const,
        x: 10,
        y: 25 + index * gap,
        width: 80,
        height: 5,
        content: `${String(index + 1).padStart(2, "0")}. ${page.title} ${"·".repeat(28)} ${pageNum}`,
        fontSize: 12,
        fontFamily: theme.bodyFont,
        textColor: theme.palette.body,
        lineHeight: 1.35,
      };
    }),
  ];
};

const createChapterCoverElements = (
  chapterIndex: number,
  title: string,
  summary: string,
  theme: BookTheme,
): CanvasElement[] => {
  const imageHeight = Math.min(theme.chapterImageHeight, 36);
  const titleY = imageHeight + 4;
  const titleH = 10;
  const dividerY = titleY + titleH + 2;
  const bodyY = dividerY + 3;
  return [
    {
      id: "chapter-image",
      type: "image",
      x: 0,
      y: 0,
      width: 100,
      height: imageHeight,
      src: createImagePlaceholder(theme.palette, "chapter", `Chapter ${chapterIndex}`),
      borderRadius: 3,
    },
    {
      id: "chapter-number",
      type: "text",
      x: 12,
      y: 12,
      width: 14,
      height: 8,
      content: String(chapterIndex).padStart(2, "0"),
      fontSize: 28,
      fontFamily: theme.titleFont,
      textColor: "hsl(0 0% 100%)",
      fontWeight: "bold",
    },
    {
      id: "chapter-title",
      type: "text",
      x: 12,
      y: titleY,
      width: 76,
      height: titleH,
      content: title,
      fontSize: 22,
      fontFamily: theme.titleFont,
      textColor: theme.palette.text,
      fontWeight: "bold",
      lineHeight: 1.16,
    },
    {
      id: "chapter-divider",
      type: "shape",
      x: 12,
      y: dividerY,
      width: theme.dividerWidth,
      height: 0.6,
      fill: theme.palette.accent,
      stroke: "transparent",
      shapeType: "rectangle",
    },
    {
      id: "body-text",
      type: "text",
      x: 12,
      y: bodyY,
      width: 74,
      height: Math.max(94 - bodyY, 18),
      content: truncateWords(summary, 48),
      fontSize: 11,
      fontFamily: theme.bodyFont,
      textColor: theme.palette.body,
      lineHeight: 1.45,
    },
  ];
};

const createContentPageElements = (
  title: string,
  content: string,
  theme: BookTheme,
  includeImage: boolean,
): CanvasElement[] => {
  // Tighter image for content pages — keep it modest so text has room
  const imageHeight = includeImage ? Math.min(theme.contentImageHeight, 30) : 0;
  const titleY = includeImage ? imageHeight + 8 : 8;
  const titleH = 8;
  const dividerY = titleY + titleH + 2;
  const bodyY = dividerY + 3;
  const bodyHeight = 94 - bodyY;

  return [
    ...(includeImage
      ? [
          {
            id: "page-image",
            type: "image" as const,
            x: 8,
            y: 4,
            width: 84,
            height: imageHeight,
            src: "",
            isPlaceholder: true,
            borderRadius: 3,
          },
        ]
      : []),
    {
      id: "page-title",
      type: "text",
      x: 12,
      y: titleY,
      width: 72,
      height: titleH,
      content: title,
      fontSize: 18,
      fontFamily: theme.titleFont,
      textColor: theme.palette.text,
      fontWeight: "bold",
      lineHeight: 1.18,
    },
    {
      id: "page-divider",
      type: "shape",
      x: 12,
      y: dividerY,
      width: theme.dividerWidth,
      height: 0.6,
      fill: theme.palette.accent,
      stroke: "transparent",
      shapeType: "rectangle",
    },
    {
      id: "body-text",
      type: "text",
      x: 12,
      y: bodyY,
      width: 76,
      height: bodyHeight,
      content,
      fontSize: 11.5,
      fontFamily: theme.bodyFont,
      textColor: theme.palette.body,
      lineHeight: 1.54,
    },
  ];
};

const createBackCoverElements = (title: string, theme: BookTheme): CanvasElement[] => [
  {
    id: "back-bg",
    type: "shape",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: theme.palette.backBackground,
    stroke: "transparent",
    shapeType: "rectangle",
  },
  {
    id: "back-logo",
    type: "text",
    x: 14,
    y: 41,
    width: 72,
    height: 10,
    content: title,
    fontSize: 26,
    fontFamily: theme.titleFont,
    textColor: "hsl(0 0% 100%)",
    textAlign: "center",
    fontWeight: "bold",
  },
  {
    id: "back-tag",
    type: "text",
    x: 26,
    y: 54,
    width: 48,
    height: 5,
    content: "Created with context-aware design",
    fontSize: 10,
    fontFamily: theme.bodyFont,
    textColor: "hsla(0 0% 100% / 0.72)",
    textAlign: "center",
  },
];

export const buildGeneratedBookLayout = ({
  bookTitle,
  bookDescription,
  prompt,
  generatedChapters,
  includeImages,
  themeSeed,
}: {
  bookTitle: string;
  bookDescription: string;
  prompt: string;
  generatedChapters: GeneratedChapterInput[];
  includeImages: boolean;
  themeSeed?: string;
}): GeneratedBookLayout => {
  const theme = createTheme(themeSeed ?? `${bookTitle}-${prompt}-${Date.now()}-${crypto.randomUUID()}`);
  const pages: Page[] = [];
  const elementsByPage: Record<string, CanvasElement[]> = {};
  const imageTasks: GeneratedImageTask[] = [];

  const coverId = crypto.randomUUID();
  pages.push({ id: coverId, title: bookTitle, type: "cover" });
  elementsByPage[coverId] = createCoverElements(bookTitle, bookDescription || prompt, theme);
  if (includeImages) {
    imageTasks.push({
      pageId: coverId,
      imagePrompt: `Professional editorial book cover image for "${bookTitle}". ${bookDescription || prompt}. Fresh composition, unique visual treatment, no text overlay.`,
    });
  }

  const tocId = crypto.randomUUID();
  pages.push({ id: tocId, title: "Table of Contents", type: "toc" });

  generatedChapters.forEach((chapter, chapterIndex) => {
    const chapterPageId = crypto.randomUUID();
    pages.push({ id: chapterPageId, title: chapter.title, type: "chapter" });
    elementsByPage[chapterPageId] = createChapterCoverElements(chapterIndex + 1, chapter.title, chapter.summary, theme);

    if (includeImages && chapter.coverImagePrompt) {
      imageTasks.push({ pageId: chapterPageId, imagePrompt: chapter.coverImagePrompt });
    }

    chapter.pages.forEach((page) => {
      const hasPageImage = includeImages && Boolean(page.imagePrompt);
      const segments = paginateTextContent(page.content, hasPageImage ? 180 : 280);

      segments.forEach((segment, segmentIndex) => {
        const pageId = crypto.randomUUID();
        const segmentTitle = segmentIndex === 0
          ? page.title
          : `${page.title} (Continued ${segmentIndex + 1})`;
        const includePageImage = includeImages && Boolean(page.imagePrompt) && segmentIndex === 0;

        pages.push({ id: pageId, title: segmentTitle, type: "chapter-page" });
        elementsByPage[pageId] = createContentPageElements(segmentTitle, segment, theme, includePageImage);

        if (includePageImage && page.imagePrompt) {
          imageTasks.push({ pageId, imagePrompt: page.imagePrompt });
        }
      });
    });
  });

  const backId = crypto.randomUUID();
  pages.push({ id: backId, title: "Back Cover", type: "back" });
  elementsByPage[backId] = createBackCoverElements(bookTitle, theme);
  elementsByPage[tocId] = createTocElements(pages, theme);

  return { pages, elementsByPage, imageTasks };
};