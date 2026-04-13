import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CheckCircle2, Sparkles, Layers } from "lucide-react";
import {
  EBOOK_TEMPLATES, TEMPLATE_NICHES, getTemplate,
  type EbookTemplate, type TemplateNiche,
} from "@/lib/ebookTemplates";
import type { Page } from "@/components/ebook/EbookCanvasEditor";

// ■■■ Types ■■■
interface TemplateGalleryProps {
  bookTitle: string;
  pages: Page[];
  onApply: (templateId: string) => Promise<void>;
}

// ■■■ Mini SVG page renderer ■■■
const TemplateThumbnail = ({ tpl, size = "sm" }: { tpl: EbookTemplate; size?: "sm" | "lg" }) => {
  const { palette: p, coverVariant: variant } = tpl;
  const W = size === "lg" ? 120 : 64;
  const H = size === "lg" ? 160 : 85;

  return (
    <svg viewBox="0 0 64 85" width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="85" fill={p.bg} />

      {variant === 1 && <>
        <rect width="64" height="50" fill={p.accent} opacity="0.35" />
        <defs><linearGradient id={`img${tpl.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={p.accent} stopOpacity="0.4" /><stop offset="1" stopColor={p.accent2} stopOpacity="0.3" />
        </linearGradient></defs>
        <rect y="0" width="64" height="50" fill={`url(#img${tpl.id})`} opacity="0.6" />
        <rect y="48" width="64" height="37" fill={p.bg} />
        <rect y="48" width="64" height="1.5" fill={p.accent} />
        <rect x="5" y="54" width="54" height="4" rx="1.5" fill={p.heading} opacity="0.9" />
        <rect x="5" y="61" width="38" height="3" rx="1.5" fill={p.heading} opacity="0.55" />
        <rect x="5" y="72" width="16" height="1" rx="0.5" fill={p.accent} opacity="0.9" />
        <rect x="5" y="76" width="40" height="1.5" rx="0.5" fill={p.muted} opacity="0.5" />
      </>}

      {variant === 2 && <>
        <rect width="64" height="85" fill={p.bg} />
        <rect x="4" y="8" width="56" height="32" rx="3" fill={p.surface} opacity="0.12" />
        <rect x="8" y="12" width="48" height="5" rx="1.5" fill={p.heading} opacity="0.85" />
        <rect x="8" y="20" width="34" height="4" rx="1.5" fill={p.heading} opacity="0.5" />
        <rect x="8" y="27" width="20" height="1" rx="0.5" fill={p.accent} opacity="0.9" />
        <rect y="45" width="64" height="40" fill={p.accent} opacity="0.18" />
        <defs><linearGradient id={`g2${tpl.id}`} x1="0" y1="0" x2="0.5" y2="1">
          <stop stopColor={p.accent} stopOpacity="0.5" /><stop offset="1" stopColor={p.accent2} stopOpacity="0.2" />
        </linearGradient></defs>
        <rect y="45" width="64" height="40" fill={`url(#g2${tpl.id})`} />
      </>}

      {variant === 3 && <>
        <defs><linearGradient id={`g3${tpl.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={p.accent} stopOpacity="0.7" /><stop offset="1" stopColor={p.bg} stopOpacity="0.9" />
        </linearGradient></defs>
        <rect width="64" height="85" fill={`url(#g3${tpl.id})`} />
        <rect width="64" height="85" fill={p.bg} opacity="0.45" />
        <rect width="4" height="85" fill={p.accent} />
        <rect x="8" y="22" width="50" height="6" rx="2" fill={p.heading} opacity="0.9" />
        <rect x="8" y="31" width="36" height="4" rx="1.5" fill={p.heading} opacity="0.6" />
        <rect x="8" y="68" width="20" height="1" rx="0.5" fill={p.accent2} opacity="0.8" />
        <rect x="8" y="72" width="42" height="2" rx="0.5" fill={p.surface} opacity="0.35" />
      </>}

      {variant === 4 && <>
        <rect width="64" height="85" fill={p.bg} />
        <rect x="3" y="3" width="58" height="79" fill="none" stroke={p.accent} strokeWidth="0.8" rx="0" />
        <rect x="3" y="3" width="3" height="3" fill={p.accent} />
        <rect x="58" y="3" width="3" height="3" fill={p.accent} />
        <rect x="3" y="79" width="3" height="3" fill={p.accent} />
        <rect x="58" y="79" width="3" height="3" fill={p.accent} />
        <rect x="10" y="26" width="44" height="5" rx="1.5" fill={p.heading} opacity="0.85" />
        <rect x="10" y="34" width="30" height="4" rx="1.5" fill={p.heading} opacity="0.5" />
        <rect x="22" y="48" width="20" height="0.8" fill={p.accent} />
        <rect x="10" y="53" width="44" height="2" rx="0.5" fill={p.muted} opacity="0.45" />
      </>}

      {variant === 5 && <>
        <rect width="32" height="85" fill={p.bg} />
        <rect x="32" width="32" height="85" fill={p.surface} opacity="0.15" />
        <defs><linearGradient id={`g5${tpl.id}`} x1="0" y1="0" x2="0.5" y2="1">
          <stop stopColor={p.accent} stopOpacity="0.5" /><stop offset="1" stopColor={p.accent2} stopOpacity="0.2" />
        </linearGradient></defs>
        <rect x="32" width="32" height="85" fill={`url(#g5${tpl.id})`} />
        <rect x="4" y="20" width="24" height="4" rx="1.5" fill={p.heading} opacity="0.9" />
        <rect x="4" y="27" width="18" height="3" rx="1.5" fill={p.heading} opacity="0.55" />
        <rect x="4" y="58" width="12" height="1" rx="0.5" fill={p.accent} />
        <rect x="4" y="62" width="22" height="2" rx="0.5" fill={p.muted} opacity="0.5" />
        <rect x="34" y="8" width="26" height="69" rx="2" fill={p.accent} opacity="0.18" />
      </>}

      <rect x="0" y="0" width="64" height="2" fill={p.accent} opacity="0.9" />
    </svg>
  );
};

// ■■■ Preview Modal ■■■
const PreviewModal = ({
  template, bookTitle, pages, onApply, onClose, applying,
}: {
  template: EbookTemplate; bookTitle: string; pages: Page[];
  onApply: () => void; onClose: () => void; applying: boolean;
}) => {
  const [pageIdx, setPageIdx] = useState(0);

  const previewTypes: Page["type"][] = ["cover", "toc", "chapter", "chapter-page"];
  const previewLabels = ["Cover", "Table of Contents", "Chapter Cover", "Content Page"];
  const fakePage = (type: Page["type"]): Page => ({
    id: `preview-${type}`,
    title: type === "chapter" ? "Introduction to the Topic" : type === "chapter-page" ? "Key Insights & Strategies" : bookTitle,
    type,
    locked: false,
  });

  const fakePages: Page[] = [
    fakePage("cover"), fakePage("toc"), fakePage("chapter"), fakePage("chapter-page"),
    { id: "preview-back", title: "Back Cover", type: "back", locked: false },
  ];

  const currentPreview = fakePage(previewTypes[pageIdx]);
  const elements = template.buildPage(currentPreview, fakePages, bookTitle);
  const p = template.palette;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl bg-background rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: p.accent + "30", color: p.accent }}>
                {template.niche}
              </span>
              <h2 className="text-white font-bold text-base">{template.name}</h2>
            </div>
            <p className="text-white/40 text-xs mt-0.5">{template.description}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Preview area */}
        <div className="flex gap-6 p-6">
          {/* Page tabs */}
          <div className="flex flex-col gap-2 shrink-0">
            {previewTypes.map((type, i) => (
              <button key={type} onClick={() => setPageIdx(i)}
                className={`w-14 h-[75px] rounded-lg overflow-hidden border-2 transition-all ${
                  i === pageIdx ? "border-white/60 scale-105" : "border-transparent opacity-50 hover:opacity-80"
                }`}>
                <TemplateThumbnail tpl={template} size="sm" />
                <div className="text-[7px] text-center text-white/50 mt-0.5">{previewLabels[i]}</div>
              </button>
            ))}
          </div>

          {/* Main preview */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div key={pageIdx}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="rounded-lg overflow-hidden shadow-2xl"
                style={{ width: 220, height: 293 }}>
                <div className="relative w-full h-full" style={{ background: p.bg }}>
                  {elements.map(el => {
                    const style: React.CSSProperties = {
                      position: "absolute",
                      left: `${el.x}%`, top: `${el.y}%`,
                      width: `${el.width}%`, height: `${el.height}%`,
                      overflow: "hidden",
                    };
                    if (el.type === "shape") return (
                      <div key={el.id} style={{
                        ...style,
                        background: el.fill || p.accent,
                        borderRadius: el.shapeType === "circle" ? "50%" : (el.borderRadius || 0),
                        opacity: el.opacity ?? 1,
                      }} />
                    );
                    if (el.type === "image") return (
                      <div key={el.id} style={{
                        ...style,
                        background: `linear-gradient(135deg, ${p.accent}44, ${p.accent2}33)`,
                        opacity: el.opacity ?? 0.8,
                        borderRadius: el.borderRadius || 0,
                      }} />
                    );
                    if (el.type === "text") return (
                      <div key={el.id} style={{
                        ...style,
                        color: el.textColor || p.text,
                        fontSize: Math.max(4, (el.fontSize || 12) * (220 / 480)),
                        fontFamily: el.fontFamily || template.bodyFont,
                        fontWeight: el.fontWeight || "normal",
                        lineHeight: el.lineHeight ?? 1.5,
                        textAlign: (el.textAlign as React.CSSProperties["textAlign"]) || "left",
                        padding: "2px 3px",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        opacity: el.opacity ?? 1,
                      }}>
                        {el.content || (el.id.includes("body") ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit..." : "")}
                      </div>
                    );
                    return null;
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
            <p className="text-white/40 text-[10px]">{previewLabels[pageIdx]}</p>
          </div>

          {/* Details panel */}
          <div className="w-40 flex flex-col gap-4 shrink-0">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-2">Palette</p>
              <div className="grid grid-cols-4 gap-1">
                {[p.bg, p.accent, p.heading, p.surface, p.accent2, p.muted, p.bodyText, p.text].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded" style={{ background: c, border: "1px solid rgba(255,255,255,0.1)" }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Typography</p>
              <p className="text-[10px] text-white/60">Heading: <span className="text-white/80">{template.titleFont}</span></p>
              <p className="text-[10px] text-white/60">Body: <span className="text-white/80">{template.bodyFont}</span></p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Layout</p>
              <p className="text-[10px] text-white/60">Cover: <span className="text-white/80">Style {template.coverVariant}</span></p>
              <p className="text-[10px] text-white/60">Pages: <span className="text-white/80">Style {template.contentVariant}</span></p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <p className="text-white/30 text-xs">Applies to all pages instantly</p>
          <motion.button
            onClick={onApply}
            disabled={applying}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70"
            style={{ background: applying ? p.muted : p.accent, color: p.bg }}
            whileHover={{ scale: applying ? 1 : 1.03 }}
            whileTap={{ scale: 0.97 }}>
            {applying ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />Applying…</>
            ) : (
              <><Sparkles className="w-4 h-4" />Apply Template</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ■■■ Progress Overlay ■■■
const ApplyProgress = ({ template, progress }: { template: EbookTemplate; progress: number }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[10001] flex items-center justify-center"
    style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }}>
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
      className="text-center max-w-xs px-8">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
        style={{ background: template.palette.accent + "22", border: `2px solid ${template.palette.accent}44` }}>
        <motion.div animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <Layers className="w-8 h-8" style={{ color: template.palette.accent }} />
        </motion.div>
      </div>
      <p className="text-white font-bold text-lg mb-1">Applying {template.name}</p>
      <p className="text-white/40 text-sm mb-6">Redesigning all pages…</p>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
        <motion.div className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${template.palette.accent}, ${template.palette.accent2})` }}
          initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>
      <p className="text-white/50 text-xs font-mono">{Math.round(progress)}%</p>
    </motion.div>
  </motion.div>
);

// ■■■ Main Gallery Component ■■■
export const TemplateGallery = ({ bookTitle, pages, onApply }: TemplateGalleryProps) => {
  const [search, setSearch] = useState("");
  const [activeNiche, setActiveNiche] = useState<TemplateNiche | "All">("All");
  const [preview, setPreview] = useState<EbookTemplate | null>(null);
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [applied, setApplied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = EBOOK_TEMPLATES;
    if (activeNiche !== "All") list = list.filter(t => t.niche === activeNiche);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.niche.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, activeNiche]);

  const handleApply = async (tpl: EbookTemplate) => {
    setApplying(true);
    setProgress(0);
    setPreview(null);

    const steps = [10, 25, 40, 60, 75, 88, 95];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 80));
      setProgress(step);
    }

    try {
      await onApply(tpl.id);
      setProgress(100);
      await new Promise(r => setTimeout(r, 400));
      setApplied(tpl.id);
    } finally {
      await new Promise(r => setTimeout(r, 600));
      setApplying(false);
      setProgress(0);
    }
  };

  const niches: (TemplateNiche | "All")[] = ["All", ...TEMPLATE_NICHES];

  return (
    <div className="flex flex-col h-full">
      {/* Progress overlay */}
      <AnimatePresence>
        {applying && preview === null && (
          <ApplyProgress template={EBOOK_TEMPLATES.find(t => t.id === applied || applying) ?? EBOOK_TEMPLATES[0]} progress={progress} />
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <PreviewModal
            template={preview}
            bookTitle={bookTitle}
            pages={pages}
            onApply={() => handleApply(preview)}
            onClose={() => setPreview(null)}
            applying={applying}
          />
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-2.5">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search 100 templates…"
          className="w-full pl-8 pr-3 py-2 text-[11px] rounded-lg border border-foreground/[0.08] bg-background focus:outline-none focus:border-accent/40 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Niche filter chips */}
      <div className="flex gap-1 flex-wrap mb-3">
        {niches.map(n => (
          <button key={n} onClick={() => setActiveNiche(n)}
            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all ${
              activeNiche === n
                ? "bg-accent text-white"
                : "bg-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.09]"
            }`}>
            {n}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-muted-foreground/60">{filtered.length} templates</span>
        {applied && <span className="text-[9px] text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Applied</span>}
      </div>

      {/* Grid */}
      <div className="overflow-y-auto no-scrollbar flex-1">
        <div className="grid grid-cols-2 gap-2 pb-4">
          {filtered.map(tpl => (
            <motion.button
              key={tpl.id}
              onClick={() => setPreview(tpl)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group rounded-xl overflow-hidden border-2 transition-all text-left ${
                applied === tpl.id
                  ? "border-emerald-500 shadow-emerald-500/20 shadow-md"
                  : "border-transparent hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10"
              }`}
            >
              <div className="w-full overflow-hidden">
                <TemplateThumbnail tpl={tpl} size="sm" />
              </div>
              <div className="px-2 pt-1 pb-1.5 bg-background border-t border-foreground/[0.06]">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] font-semibold text-foreground truncate">{tpl.name}</p>
                  {applied === tpl.id && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                </div>
                <p className="text-[8px] text-muted-foreground/50 truncate">{tpl.description}</p>
              </div>
            </motion.button>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-8 text-muted-foreground/40 text-xs">
              No templates match "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
