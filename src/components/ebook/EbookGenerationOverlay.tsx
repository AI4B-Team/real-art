import { useState, useEffect, useRef } from "react";
import {
  BookOpen, FileText, Image as ImageIcon, Palette, CheckCircle2,
  Loader2, Sparkles, PenLine, List, LayoutGrid, Clock,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Page, type CanvasElement, getElementsForPage } from "@/components/ebook/EbookCanvasEditor";

// ─── Types ──────────────────────────────────────────────────────────
interface GenerationStep {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  microcopy: string[];
}

export interface LiveGenerationState {
  pages: Page[];
  elements: Record<string, CanvasElement[]>;
  completedChapterCount: number;
  totalChapterCount: number;
  currentChapterTitle: string;
}

interface EbookGenerationOverlayProps {
  isGenerating: boolean;
  bookTitle: string;
  liveState?: LiveGenerationState | null;
}

// ─── Constants ──────────────────────────────────────────────────────
const STEPS: GenerationStep[] = [
  { id: "outline",  title: "Creating Outline",             icon: List,       duration: 2500, microcopy: ["Structuring your chapters…", "Mapping content flow…"] },
  { id: "toc",      title: "Generating Table of Contents", icon: FileText,   duration: 2000, microcopy: ["Organizing your sections…", "Building navigation…"] },
  { id: "content",  title: "Writing Content",              icon: PenLine,    duration: 4000, microcopy: ["Crafting your narrative…", "Developing key points…"] },
  { id: "images",   title: "Generating Images",            icon: ImageIcon,  duration: 3000, microcopy: ["Designing illustrations…", "Creating visuals…"] },
  { id: "layout",   title: "Designing Layout",             icon: LayoutGrid, duration: 2000, microcopy: ["Setting typography…", "Arranging elements…"] },
  { id: "styling",  title: "Applying Styles",              icon: Palette,    duration: 1500, microcopy: ["Adding finishing touches…", "Polishing design…"] },
];

const AI_HINTS = [
  "Choosing a high-converting layout…",
  "Optimizing visual hierarchy…",
  "Balancing text and imagery…",
  "Enhancing readability…",
  "Fine-tuning page flow…",
  "Analyzing content structure…",
];

const toTitleCase = (s: string) => s.replace(/\b([a-z])/g, m => m.toUpperCase());

const getProgressLabel = (p: number) => {
  if (p >= 95) return "Almost Ready…";
  if (p >= 85) return "Finalizing Design…";
  if (p >= 70) return "Polishing Details…";
  return `${Math.round(p)}% Complete`;
};

// ─── Tiny rotating text ─────────────────────────────────────────────
const Rotating = ({ texts }: { texts: string[] }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(p => (p + 1) % texts.length), 2200);
    return () => clearInterval(t);
  }, [texts.length]);
  return (
    <AnimatePresence mode="wait">
      <motion.span key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.28 }}
        className="text-[11px] text-slate-400 italic">
        {toTitleCase(texts[i])}
      </motion.span>
    </AnimatePresence>
  );
};

// ─── Mini canvas page renderer — mirrors real canvas element rendering ──
const MiniPage = ({
  page, elements, bookTitle, allPages, dimmed,
}: {
  page: Page; elements: CanvasElement[]; bookTitle: string; allPages: Page[]; dimmed?: boolean;
}) => {
  const elems = elements.length > 0 ? elements : getElementsForPage(page, allPages, bookTitle);
  const W = 240; const H = 320;
  return (
    <div
      className={`relative bg-white rounded-md overflow-hidden border border-white/10 shadow-xl transition-opacity duration-500 ${dimmed ? "opacity-40" : "opacity-100"}`}
      style={{ width: W, height: H, flexShrink: 0 }}
    >
      {elems.map(el => {
        const style: React.CSSProperties = {
          position: "absolute",
          left:   `${el.x}%`,
          top:    `${el.y}%`,
          width:  `${el.width}%`,
          height: `${el.height}%`,
          opacity: el.opacity ?? 1,
          borderRadius: el.borderRadius,
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          overflow: "hidden",
        };
        if (el.type === "image") {
          return (
            <div key={el.id} style={style}>
              {el.src && !el.isPlaceholder ? (
                <img src={el.src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200/60 animate-pulse" />
              )}
            </div>
          );
        }
        if (el.type === "shape") {
          return (
            <div key={el.id} style={{
              ...style,
              backgroundColor: el.fill || "#e2e8f0",
              border: el.stroke && el.stroke !== "transparent" ? `${el.strokeWidth || 1}px solid ${el.stroke}` : undefined,
              borderRadius: el.shapeType === "circle" ? "50%" : (el.borderRadius ?? 0),
            }} />
          );
        }
        if (el.type === "text") {
          const fs = Math.max(4, (el.fontSize || 13) * (W / 480));
          return (
            <div key={el.id} style={{
              ...style,
              fontSize: fs,
              fontFamily: el.fontFamily || "Georgia",
              color: el.textColor || "#1f2937",
              fontWeight: el.fontWeight || "normal",
              fontStyle: el.fontStyle || "normal",
              lineHeight: el.lineHeight ?? 1.5,
              textAlign: (el.textAlign as React.CSSProperties["textAlign"]) || "left",
              padding: "2px 4px",
              overflow: "hidden",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}>
              {el.content || ""}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

// ─── Live preview carousel ──────────────────────────────────────────
const LivePreview = ({
  pages, elements, bookTitle,
}: {
  pages: Page[]; elements: Record<string, CanvasElement[]>; bookTitle: string;
}) => {
  const [focusIdx, setFocusIdx] = useState(0);
  const prevLen = useRef(0);

  useEffect(() => {
    if (pages.length > prevLen.current) {
      setFocusIdx(pages.length - 1);
      prevLen.current = pages.length;
    }
  }, [pages.length]);

  if (pages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
          className="w-[240px] h-[320px] rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-xs">Pages will appear here</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const focused = pages[focusIdx] ?? pages[pages.length - 1];
  const focusedElems = elements[focused.id] || [];
  const prevPage = focusIdx > 0 ? pages[focusIdx - 1] : null;
  const nextPage = focusIdx < pages.length - 1 ? pages[focusIdx + 1] : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4">
      {/* Page counter */}
      <div className="flex items-center gap-3">
        <div className="h-px w-8 bg-white/20" />
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
          Page {focusIdx + 1} of {pages.length}
        </span>
        <div className="h-px w-8 bg-white/20" />
      </div>

      {/* Page title */}
      <motion.p key={focused.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        className="text-xs font-medium text-white/60 text-center max-w-[220px] truncate">
        {focused.title || "Untitled Page"}
      </motion.p>

      {/* Three-page carousel */}
      <div className="flex items-center gap-4">
        {/* Prev ghost */}
        <div className="flex flex-col items-center gap-1.5" style={{ opacity: prevPage ? 1 : 0 }}>
          {prevPage && (
            <button onClick={() => setFocusIdx(f => f - 1)} className="hover:scale-105 transition-transform">
              <div style={{ transform: "scale(0.62)", transformOrigin: "top center" }}>
                <MiniPage page={prevPage} elements={elements[prevPage.id] || []} bookTitle={bookTitle} allPages={pages} dimmed />
              </div>
            </button>
          )}
        </div>

        {/* Focus page */}
        <AnimatePresence mode="wait">
          <motion.div key={focused.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3 }}>
            <MiniPage page={focused} elements={focusedElems} bookTitle={bookTitle} allPages={pages} />
          </motion.div>
        </AnimatePresence>

        {/* Next ghost */}
        <div className="flex flex-col items-center gap-1.5" style={{ opacity: nextPage ? 1 : 0 }}>
          {nextPage && (
            <button onClick={() => setFocusIdx(f => f + 1)} className="hover:scale-105 transition-transform">
              <div style={{ transform: "scale(0.62)", transformOrigin: "top center" }}>
                <MiniPage page={nextPage} elements={elements[nextPage.id] || []} bookTitle={bookTitle} allPages={pages} dimmed />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Nav buttons + dot strip */}
      <div className="flex items-center gap-3">
        <button onClick={() => setFocusIdx(f => Math.max(0, f - 1))} disabled={focusIdx === 0}
          className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-white/30 hover:text-white/80 disabled:opacity-30 transition-all">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex gap-1">
          {pages.slice(0, 12).map((_, i) => (
            <button key={i} onClick={() => setFocusIdx(i)}
              className={`rounded-full transition-all ${i === focusIdx ? "w-3 h-1.5 bg-emerald-400" : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"}`} />
          ))}
          {pages.length > 12 && <span className="text-[9px] text-white/30 ml-1">+{pages.length - 12}</span>}
        </div>
        <button onClick={() => setFocusIdx(f => Math.min(pages.length - 1, f + 1))} disabled={focusIdx >= pages.length - 1}
          className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-white/30 hover:text-white/80 disabled:opacity-30 transition-all">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[10px] text-white/30 text-center">
        Same layout &amp; elements as the editor
      </p>
    </div>
  );
};

// ─── Main overlay ───────────────────────────────────────────────────
const EbookGenerationOverlay = ({ isGenerating, bookTitle, liveState }: EbookGenerationOverlayProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps]     = useState<Set<string>>(new Set());
  const [overallProgress, setOverallProgress]   = useState(0);
  const [hintIndex, setHintIndex]               = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      setOverallProgress(0);
      return;
    }
    const totalDuration = STEPS.reduce((a, s) => a + s.duration, 0);
    let stepIndex = 0;
    let elapsed = 0;
    const runStep = () => {
      if (stepIndex >= STEPS.length) { setOverallProgress(96); return; }
      setCurrentStepIndex(stepIndex);
      const step = STEPS[stepIndex];
      const pEnd = ((elapsed + step.duration) / totalDuration) * 100;
      const pStart = (elapsed / totalDuration) * 100;
      const inc = (pEnd - pStart) / (step.duration / 80);
      const piv = setInterval(() => setOverallProgress(p => Math.min(p + inc, pEnd)), 80);
      setTimeout(() => {
        clearInterval(piv);
        setCompletedSteps(prev => new Set([...prev, step.id]));
        elapsed += step.duration;
        stepIndex++;
        runStep();
      }, step.duration);
    };
    runStep();
    const hintTimer = setInterval(() => setHintIndex(i => (i + 1) % AI_HINTS.length), 2800);
    return () => clearInterval(hintTimer);
  }, [isGenerating]);

  useEffect(() => {
    if (!liveState || !isGenerating) return;
    const { completedChapterCount, totalChapterCount } = liveState;
    if (totalChapterCount > 0) {
      const realPct = 20 + (completedChapterCount / totalChapterCount) * 75;
      setOverallProgress(p => Math.max(p, realPct));
    }
  }, [liveState, isGenerating]);

  if (!isGenerating) return null;

  const pages    = liveState?.pages ?? [];
  const elements = liveState?.elements ?? {};

  return (
    <div className="absolute inset-0 z-50 overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1020 100%)" }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative h-full flex">
        {/* LEFT PANEL */}
        <div className="flex flex-col justify-center px-10 py-10 gap-6"
          style={{ width: "46%", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </motion.div>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-emerald-400/80">AI eBook Studio</span>
            </div>
            <h2 className="text-[22px] font-bold text-white leading-tight mb-1">Building Your eBook</h2>
            <p className="text-sm text-white/40 mb-1 line-clamp-1">&quot;{bookTitle}&quot;</p>
            <div className="flex items-center gap-1.5 text-[11px] text-white/25">
              <Clock className="w-3 h-3" />
              <span>Usually 2–4 minutes</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {STEPS.map((step, index) => {
              const done    = completedSteps.has(step.id);
              const current = index === currentStepIndex;
              const future  = !done && !current;
              const Icon    = step.icon;
              return (
                <motion.div key={step.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: future ? 0.35 : 1, x: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    current ? "bg-emerald-500/[0.08] border border-emerald-500/15" : done ? "bg-white/[0.03]" : ""
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    done    ? "bg-emerald-500/20 text-emerald-400" :
                    current ? "bg-emerald-500/15 text-emerald-300" :
                              "bg-white/5 text-white/25"
                  }`}>
                    {done ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 350, damping: 15 }}>
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                    ) : current ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${current ? "text-white" : done ? "text-white/50" : "text-white/25"}`}>
                        {step.title}
                      </span>
                      {current && (
                        <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.8, repeat: Infinity }}
                          className="text-[9px] font-bold uppercase tracking-wider bg-amber-400/85 text-gray-900 px-1.5 py-0.5 rounded">
                          In Progress
                        </motion.span>
                      )}
                    </div>
                    {current && (
                      <div className="mt-0.5">
                        <Rotating texts={step.microcopy} />
                      </div>
                    )}
                  </div>
                  {done && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}
                      className="flex items-center gap-1 text-emerald-400/80 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-medium">Done</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 h-4">
              <Sparkles className="w-3 h-3 text-white/30 shrink-0" />
              <AnimatePresence mode="wait">
                <motion.span key={hintIndex}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }}
                  className="text-[10px] text-white/30 italic">
                  {toTitleCase(AI_HINTS[hintIndex])}
                </motion.span>
              </AnimatePresence>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-white/30">Overall Progress</span>
                <span className="text-white/60 font-medium">{getProgressLabel(overallProgress)}</span>
              </div>
              <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden relative">
                <motion.div className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #10b981, #34d399)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.4 }} />
                <motion.div className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", width: "40%" }}
                  animate={{ x: ["-40%", "150%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} />
              </div>
            </div>
            {liveState && liveState.totalChapterCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: liveState.totalChapterCount }).map((_, i) => (
                    <motion.div key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i < liveState.completedChapterCount ? "bg-emerald-400 w-4" :
                        i === liveState.completedChapterCount ? "bg-amber-400/80 w-4 animate-pulse" :
                        "bg-white/15 w-2"
                      }`} />
                  ))}
                </div>
                <span className="text-[10px] text-white/30">
                  {liveState.completedChapterCount}/{liveState.totalChapterCount} chapters
                  {liveState.currentChapterTitle && ` · ${liveState.currentChapterTitle}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col" style={{ width: "54%" }}>
          <div className="px-8 pt-8 pb-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40">Live Preview</span>
            <span className="text-[10px] text-white/20">— matches the canvas editor</span>
            {pages.length > 0 && (
              <span className="ml-auto text-[10px] font-mono text-emerald-400/60">
                {pages.length} page{pages.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <LivePreview pages={pages} elements={elements} bookTitle={bookTitle} />
        </div>
      </div>
    </div>
  );
};

export default EbookGenerationOverlay;
