import React, { useState } from "react";
import {
  ZoomIn, ZoomOut, Download, Share2,
  Eye, Edit3, ChevronLeft, ChevronRight,
  Loader2
} from "lucide-react";
import { useEbook } from "../context/EbookContext";

const TEMPLATE_THEMES: Record<
  string,
  { bg: string; surface: string; text: string; accent: string; muted: string }
> = {
  minimal: { bg: "#f8f8f8", surface: "#ffffff", text: "#1a1a1a", accent: "#1a1a1a", muted: "#888" },
  modern: { bg: "#0a0a1a", surface: "#0f0f23", text: "#ffffff", accent: "#6366f1", muted: "#888" },
  classic: { bg: "#fef9f0", surface: "#fffdf7", text: "#3d2b1f", accent: "#92400e", muted: "#a0856c" },
  bold: { bg: "#dc2626", surface: "#b91c1c", text: "#ffffff", accent: "#fbbf24", muted: "#fca5a5" },
  elegant: { bg: "#111111", surface: "#1c1c1e", text: "#f5f5f5", accent: "#d4af37", muted: "#888" },
  nature: { bg: "#052e16", surface: "#14532d", text: "#d1fae5", accent: "#86efac", muted: "#6ee7b7" },
};

function CoverPage({ book, theme }: { book: any; theme: any }) {
  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden rounded-sm"
      style={{ backgroundColor: book.coverColor || theme.surface }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
        style={{ backgroundColor: theme.accent, transform: "translate(30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
        style={{ backgroundColor: theme.accent, transform: "translate(-30%, 30%)" }}
      />
      <div className="h-1.5 w-full" style={{ backgroundColor: theme.accent }} />
      <div className="flex-1 flex flex-col justify-between p-8 relative z-10">
        <div
          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full self-start"
          style={{ backgroundColor: theme.accent + "33", color: theme.accent }}
        >
          eBook
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-xl font-black leading-tight" style={{ color: "#ffffff" }}>
            {book.selectedTitle || book.title || "Your eBook Title"}
          </div>
          <div className="text-xs leading-relaxed opacity-70" style={{ color: "#ffffff" }}>
            {book.description || "A comprehensive guide to mastering your topic."}
          </div>
        </div>
        <div
          className="flex items-center justify-between text-[9px] opacity-60"
          style={{ color: "#ffffff" }}
        >
          <span>{book.chapters?.length || 0} Chapters</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>
      <div className="h-1" style={{ backgroundColor: theme.accent, opacity: 0.4 }} />
    </div>
  );
}

function TableOfContents({ book, theme }: { book: any; theme: any }) {
  return (
    <div className="w-full h-full flex flex-col p-6 rounded-sm" style={{ backgroundColor: theme.surface }}>
      <div
        className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b"
        style={{ color: theme.accent, borderColor: theme.accent + "33" }}
      >
        Table of Contents
      </div>
      <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
        {(book.chapters || []).slice(0, 8).map((ch: any, i: number) => (
          <div key={ch.id} className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: theme.accent + "22", color: theme.accent }}
            >
              {i + 1}
            </span>
            <span className="text-[10px] leading-tight flex-1 truncate" style={{ color: theme.text }}>
              {ch.title.replace(/Chapter \d+: /, "")}
            </span>
            <span className="text-[9px] opacity-40" style={{ color: theme.text }}>
              {(i + 1) * ch.pageCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChapterPage({ chapter, theme, index }: { chapter: any; theme: any; index: number }) {
  return (
    <div className="w-full h-full flex flex-col rounded-sm overflow-hidden" style={{ backgroundColor: theme.surface }}>
      <div className="px-5 py-4 flex items-end gap-3" style={{ backgroundColor: theme.accent + "18" }}>
        <div className="text-3xl font-black opacity-20 leading-none" style={{ color: theme.accent }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="flex-1">
          <div className="text-[9px] font-semibold uppercase tracking-widest opacity-60 mb-0.5" style={{ color: theme.accent }}>
            Chapter {index + 1}
          </div>
          <div className="text-sm font-bold leading-tight" style={{ color: theme.text }}>
            {chapter.title.replace(/Chapter \d+: /, "")}
          </div>
        </div>
      </div>
      <div className="flex-1 p-5 flex flex-col gap-3">
        {chapter.includeImage && (
          <div className="w-full h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent + "15" }}>
            <span className="text-[10px] opacity-40" style={{ color: theme.accent }}>AI Generated Image</span>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full"
              style={{ backgroundColor: theme.text + "20", width: i === 5 ? "65%" : "100%" }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mt-auto">
          {(chapter.topics || []).map((topic: string) => (
            <span key={topic} className="text-[8px] px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.accent + "22", color: theme.accent }}>
              {topic}
            </span>
          ))}
        </div>
      </div>
      <div
        className="flex items-center justify-between px-5 py-2 text-[8px] opacity-30"
        style={{ borderTop: `1px solid ${theme.text}20`, color: theme.text }}
      >
        <span>{chapter.title.replace(/Chapter \d+: /, "")}</span>
        <span>{index + 3}</span>
      </div>
    </div>
  );
}

function GeneratingState({ progress, status }: { progress: number; status: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full">
      <div className="relative">
        <div className="w-32 h-40 bg-gradient-to-br from-accent to-accent/70 rounded-r-lg shadow-2xl flex items-center justify-center">
          <div className="w-1 h-full absolute left-0 bg-black/20 rounded-l-lg" />
          <div className="flex flex-col gap-2 px-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 bg-white/30 rounded-full animate-pulse"
                style={{ width: `${60 + Math.random() * 40}%`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-xs">✨</span>
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
          <Loader2 size={14} className="animate-spin" />
          {status || "Building your eBook..."}
        </div>
        <div className="w-48 bg-white/20 rounded-full h-1.5">
          <div className="bg-white h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs text-white/50 mt-1">{progress}% complete</div>
      </div>
    </div>
  );
}

export default function EbookPreview() {
  const { currentBook, isGenerating, generationProgress, generationStatus, activeTab } = useEbook();

  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"editing" | "preview">("editing");

  const theme = TEMPLATE_THEMES[currentBook?.template || "modern"] || TEMPLATE_THEMES.modern;

  const pages = currentBook
    ? [
        { type: "cover" },
        { type: "toc" },
        ...currentBook.chapters.map((ch, i) => ({ type: "chapter", chapter: ch, index: i })),
        { type: "back" },
      ]
    : [];

  const totalPages = pages.length;
  const page = pages[currentPage];

  const zoomIn = () => setZoom((z) => Math.min(z + 20, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 20, 40));

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.bg }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex bg-white/10 rounded-lg p-0.5">
            {(["editing", "preview"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                  viewMode === mode ? "bg-white text-foreground shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                {mode === "editing" ? <Edit3 size={11} /> : <Eye size={11} />}
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs min-w-[60px] text-center">
            {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : "—"}
          </span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-white/60">
            <button onClick={zoomOut} className="w-6 h-6 flex items-center justify-center hover:text-white"><ZoomOut size={13} /></button>
            <span className="text-xs w-10 text-center">{zoom}%</span>
            <button onClick={zoomIn} className="w-6 h-6 flex items-center justify-center hover:text-white"><ZoomIn size={13} /></button>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-medium rounded-lg transition-colors">
            <Download size={12} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors">
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "design" && totalPages > 0 && (
          <div className="w-16 flex-shrink-0 border-r border-white/10 overflow-y-auto py-3 flex flex-col gap-2 items-center">
            {pages.map((_p, i) => (
              <button key={i} onClick={() => setCurrentPage(i)}
                className={`w-10 rounded border-2 transition-all overflow-hidden ${
                  currentPage === i ? "border-accent shadow-lg shadow-accent/30" : "border-white/10 hover:border-white/30"
                }`}
                style={{ aspectRatio: "0.7" }}>
                <div className="w-full h-full" style={{ backgroundColor: theme.surface }}>
                  <div className="h-1 w-full" style={{ backgroundColor: theme.accent }} />
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          {isGenerating && !currentBook?.chapters?.length ? (
            <GeneratingState progress={generationProgress} status={generationStatus} />
          ) : !currentBook ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-40 h-52 rounded-xl shadow-2xl flex items-center justify-center"
                style={{ backgroundColor: theme.surface, border: `2px dashed ${theme.text}30` }}>
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <div className="text-3xl">📖</div>
                  <div className="text-xs" style={{ color: theme.text }}>Your eBook will appear here</div>
                </div>
              </div>
              <div className="text-sm opacity-50" style={{ color: theme.text }}>Fill in the prompt and click Generate</div>
            </div>
          ) : (
            <div
              className="shadow-2xl rounded-sm overflow-hidden transition-transform duration-300 flex-shrink-0"
              style={{
                width: `${Math.round(280 * (zoom / 100))}px`,
                height: `${Math.round(396 * (zoom / 100))}px`,
              }}
            >
              {page?.type === "cover" && <CoverPage book={currentBook} theme={theme} />}
              {page?.type === "toc" && <TableOfContents book={currentBook} theme={theme} />}
              {page?.type === "chapter" && (
                <ChapterPage chapter={(page as any).chapter} theme={theme} index={(page as any).index} />
              )}
              {page?.type === "back" && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-sm relative"
                  style={{ backgroundColor: currentBook.coverColor || theme.surface }}>
                  <div className="h-1 w-full absolute top-0" style={{ backgroundColor: theme.accent }} />
                  <div className="text-lg font-black text-center px-6" style={{ color: "#ffffff" }}>
                    {currentBook.selectedTitle || currentBook.title}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "#ffffff" }}>The End</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {currentBook && totalPages > 0 && (
        <div className="flex-shrink-0 py-2 text-center">
          <span className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ backgroundColor: theme.accent + "22", color: theme.accent }}>
            {page?.type === "cover" ? "Cover"
              : page?.type === "toc" ? "Table of Contents"
              : page?.type === "back" ? "Back Cover"
              : `Chapter ${(page as any).index + 1}`}
          </span>
        </div>
      )}
    </div>
  );
}
