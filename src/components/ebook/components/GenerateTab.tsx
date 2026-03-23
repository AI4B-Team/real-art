import React, { useState } from "react";
import {
  RefreshCw, Check, X, Plus, GripVertical, Trash2,
  ChevronDown, ChevronUp, Image, FileText, Loader2
} from "lucide-react";
import { useEbook } from "../context/EbookContext";
import type { Chapter } from "../context/EbookContext";

export default function GenerateTab() {
  const {
    currentBook, updateCurrentBook, isGenerating,
    generationProgress, generationStatus, startGeneration, settings,
  } = useEbook();

  const [editingTitleIdx, setEditingTitleIdx] = useState<number | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-10 min-h-[400px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
          <div
            className="absolute inset-0 border-4 border-accent rounded-full"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((generationProgress / 100) * 2 * Math.PI)}% ${50 - 50 * Math.cos((generationProgress / 100) * 2 * Math.PI)}%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-accent">{generationProgress}%</span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center text-foreground font-medium mb-1">
            <Loader2 size={16} className="animate-spin text-accent" />
            {generationStatus}
          </div>
          <p className="text-sm text-muted-foreground">Building your {settings.chapterCount}-chapter eBook...</p>
        </div>
        <div className="w-full max-w-xs bg-muted rounded-full h-2">
          <div className="bg-accent h-2 rounded-full transition-all duration-500" style={{ width: `${generationProgress}%` }} />
        </div>
        <div className="flex flex-wrap gap-2 justify-center max-w-xs">
          {["Chapters", "Cover", "Design", "Images", "TOC", "Export"].map((step, i) => (
            <span key={step}
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                generationProgress > (i / 6) * 100 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              }`}>
              {step}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 min-h-[400px]">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <FileText size={28} className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">No eBook Generated Yet</p>
          <p className="text-sm text-muted-foreground mt-1">Go to Idea tab and fill in your prompt to start</p>
        </div>
      </div>
    );
  }

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateChapter = (id: string, partial: Partial<Chapter>) => {
    updateCurrentBook({
      chapters: currentBook.chapters.map((ch) => ch.id === id ? { ...ch, ...partial } : ch),
    });
  };

  const removeChapter = (id: string) => {
    updateCurrentBook({ chapters: currentBook.chapters.filter((ch) => ch.id !== id) });
  };

  const addChapter = () => {
    const newCh: Chapter = {
      id: `ch-${Date.now()}`,
      title: `Chapter ${currentBook.chapters.length + 1}: New Chapter`,
      description: "Add chapter description here.",
      topics: ["Topic 1"],
      includeImage: true,
      pageCount: 2,
      order: currentBook.chapters.length,
    };
    updateCurrentBook({ chapters: [...currentBook.chapters, newCh] });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Title Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title Suggestions</label>
          <button className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium">
            <RefreshCw size={12} /> Regenerate
          </button>
        </div>
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {currentBook.titleSuggestions.map((title, i) => (
            <div key={i}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                currentBook.selectedTitle === title ? "border-accent bg-accent/5" : "border-border hover:border-foreground/20"
              }`}
              onClick={() => { if (editingTitleIdx !== i) updateCurrentBook({ selectedTitle: title, title }); }}>
              {editingTitleIdx === i ? (
                <div className="flex items-center gap-2 flex-1">
                  <input autoFocus value={editingTitleValue}
                    onChange={(e) => setEditingTitleValue(e.target.value)}
                    className="flex-1 text-sm bg-transparent outline-none text-foreground"
                    onClick={(e) => e.stopPropagation()} />
                  <button className="text-green-500" onClick={(e) => {
                    e.stopPropagation();
                    const updated = [...currentBook.titleSuggestions];
                    updated[i] = editingTitleValue;
                    updateCurrentBook({ titleSuggestions: updated, selectedTitle: editingTitleValue, title: editingTitleValue });
                    setEditingTitleIdx(null);
                  }}><Check size={14} /></button>
                  <button className="text-muted-foreground" onClick={(e) => { e.stopPropagation(); setEditingTitleIdx(null); }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    currentBook.selectedTitle === title ? "border-accent bg-accent" : "border-muted-foreground/30"
                  }`}>
                    {currentBook.selectedTitle === title && <Check size={10} className="text-white m-auto" />}
                  </div>
                  <span className="text-sm text-foreground flex-1">{title}</span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); setEditingTitleIdx(i); setEditingTitleValue(title); }}>
                    ✏️
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <button className="mt-2 flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium"
          onClick={() => {
            const custom = `Custom Title ${currentBook.titleSuggestions.length + 1}`;
            updateCurrentBook({ titleSuggestions: [...currentBook.titleSuggestions, custom] });
          }}>
          <Plus size={14} /> Add custom title
        </button>
      </div>

      {/* Book Description */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Book Description</label>
        <textarea value={currentBook.description}
          onChange={(e) => updateCurrentBook({ description: e.target.value })}
          placeholder="Add a description for your eBook..."
          rows={3}
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:border-accent resize-none" />
      </div>

      {/* Chapter Sequence */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Chapter Sequence ({currentBook.chapters.length})
          </label>
          <button onClick={addChapter} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium">
            <Plus size={12} /> Add Chapter
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {currentBook.chapters.map((ch, idx) => (
            <div key={ch.id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50" onClick={() => toggleChapter(ch.id)}>
                <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0 cursor-grab" />
                <div className="w-6 h-6 bg-accent/10 text-accent rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</div>
                <span className="text-sm font-medium text-foreground flex-1 truncate">{ch.title}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{ch.pageCount}p</span>
                  {ch.includeImage && <Image size={12} className="text-blue-400" />}
                  <button onClick={(e) => { e.stopPropagation(); removeChapter(ch.id); }}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors"><Trash2 size={13} /></button>
                  {expandedChapters.has(ch.id) ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                </div>
              </div>
              {expandedChapters.has(ch.id) && (
                <div className="px-3 pb-3 border-t border-border/50 bg-muted/30 flex flex-col gap-2 pt-2">
                  <input value={ch.title} onChange={(e) => updateChapter(ch.id, { title: e.target.value })}
                    className="w-full px-2 py-1.5 border border-border rounded text-sm bg-card text-foreground focus:outline-none focus:border-accent" placeholder="Chapter title..." />
                  <textarea value={ch.description} onChange={(e) => updateChapter(ch.id, { description: e.target.value })}
                    rows={2} className="w-full px-2 py-1.5 border border-border rounded text-sm bg-card text-foreground focus:outline-none focus:border-accent resize-none" placeholder="Chapter description..." />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" checked={ch.includeImage} onChange={(e) => updateChapter(ch.id, { includeImage: e.target.checked })} className="accent-accent" />
                      Include image
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Pages:
                      <input type="number" min={1} max={20} value={ch.pageCount}
                        onChange={(e) => updateChapter(ch.id, { pageCount: +e.target.value })}
                        className="w-12 px-1 py-0.5 border border-border rounded text-xs bg-card text-foreground focus:outline-none" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {currentBook.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">
              {tag}
              <button onClick={() => updateCurrentBook({ tags: currentBook.tags.filter((t) => t !== tag) })}><X size={10} /></button>
            </span>
          ))}
          <input placeholder="Add tag..."
            className="px-2 py-1 text-xs border border-dashed border-border rounded-full outline-none bg-card text-foreground focus:border-accent w-24"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                updateCurrentBook({ tags: [...currentBook.tags, e.currentTarget.value.trim()] });
                e.currentTarget.value = "";
              }
            }} />
        </div>
      </div>
    </div>
  );
}
