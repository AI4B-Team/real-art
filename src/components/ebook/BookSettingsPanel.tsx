import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, FileText, Image, Sparkles, Briefcase, Coffee, GraduationCap,
  Heart, Shield, Flame, Cpu, Wand2, Loader2, Download, Copy, Undo2,
  ChevronDown, ChevronRight, Zap, Star, BookOpen, Clock, FileCheck, Save, Layers,
  Target, Rocket, Users, Globe,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast as sonnerToast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────
export type ChapterContentType = "text-only" | "text-images" | "text-images-interactive";

export interface BookSettingsData {
  chapterContentType: ChapterContentType;
  wordsPerChapter: number;
  tone: string;
  language: string;
  model: string;
  includeImages: boolean;
  selectedTitle: string;
  prompt: string;
  chapters: number;
}

// ─── Constants ──────────────────────────────────────────────────────
const CHAPTER_CONTENT_TYPES = [
  { id: "text-only" as const, label: "Text Only", desc: "Clean text content only", icon: FileText, preview: "Aa" },
  { id: "text-images" as const, label: "Text + Images", desc: "AI-generated images per chapter", icon: Image, preview: "📸" },
  { id: "text-images-interactive" as const, label: "Text + Images + Interactive", desc: "Includes quizzes & flashcards", icon: Sparkles, preview: "🧩" },
];

const TONES = [
  { id: "professional", name: "Professional", icon: Briefcase, desc: "Clear, structured, business-ready" },
  { id: "conversational", name: "Conversational", icon: Coffee, desc: "Casual, easy-to-read tone" },
  { id: "academic", name: "Academic", icon: GraduationCap, desc: "Formal, research-backed style" },
  { id: "friendly", name: "Friendly", icon: Heart, desc: "Warm, approachable, relatable" },
  { id: "authoritative", name: "Authoritative", icon: Shield, desc: "Confident, expert-driven voice" },
  { id: "inspirational", name: "Inspirational", icon: Flame, desc: "Motivating, uplifting energy" },
];

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
];

const AI_MODELS = [
  { id: "auto", name: "Auto", description: "Best model for your content", badge: "Recommended", speed: 3, quality: 4 },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", description: "Fast & balanced", badge: "Fast", speed: 5, quality: 3 },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Top-tier reasoning", badge: "Premium", speed: 2, quality: 5 },
  { id: "gpt-5", name: "GPT-5", description: "Powerful all-rounder", badge: "Premium", speed: 2, quality: 5 },
  { id: "gpt-5-mini", name: "GPT-5 Mini", description: "Fast & efficient", badge: "Balanced", speed: 4, quality: 3 },
];

const USE_CASES = [
  { id: "lead-magnet", label: "Lead Magnet", icon: Target, desc: "Short, punchy, high-conversion", defaults: { wordsPerChapter: 500, tone: "conversational", chapters: 5 } },
  { id: "authority-book", label: "Authority Book", icon: Shield, desc: "In-depth, expert positioning", defaults: { wordsPerChapter: 2000, tone: "authoritative", chapters: 10 } },
  { id: "course-content", label: "Course Content", icon: GraduationCap, desc: "Structured learning material", defaults: { wordsPerChapter: 1500, tone: "academic", chapters: 8 } },
  { id: "personal-brand", label: "Personal Brand", icon: Users, desc: "Storytelling & personal voice", defaults: { wordsPerChapter: 1500, tone: "friendly", chapters: 8 } },
];

const PRESETS_KEY = "ebook_presets";

interface SavedPreset {
  id: string;
  name: string;
  settings: Partial<BookSettingsData>;
}

// ─── Helpers ────────────────────────────────────────────────────────
function getWordsLabel(w: number) {
  if (w <= 500) return "Quick read · ~2 min/chapter";
  if (w <= 1000) return "Standard · ~4 min/chapter";
  if (w <= 1500) return "Detailed · ~6 min/chapter";
  if (w <= 2000) return "In-depth · ~8 min/chapter";
  return "Comprehensive · ~12 min/chapter";
}

function estimatePages(chapters: number, words: number) {
  return Math.ceil((chapters * words) / 250);
}
function estimateGenTime(chapters: number, words: number) {
  const totalWords = chapters * words;
  if (totalWords < 5000) return "1–2 min";
  if (totalWords < 15000) return "2–4 min";
  if (totalWords < 30000) return "4–8 min";
  return "8–15 min";
}

// ─── Sections for sidebar nav ───────────────────────────────────────
const SECTIONS = [
  { id: "use-case", label: "Use Case" },
  { id: "content-type", label: "Content Type" },
  { id: "length", label: "Length" },
  { id: "tone", label: "Tone" },
  { id: "language", label: "Language" },
  { id: "ai-model", label: "AI Model" },
];

// ─── Component ──────────────────────────────────────────────────────
interface Props {
  bookData: BookSettingsData;
  onBookDataChange: (updater: (prev: BookSettingsData) => BookSettingsData) => void;
  chapterCount: number;
  pageCount: number;
  onApply: () => Promise<void>;
  isApplying: boolean;
  onClose: () => void;
  storageKeyPages: string;
  storageKeyElements: string;
}

export default function BookSettingsPanel({
  bookData, onBookDataChange, chapterCount, pageCount,
  onApply, isApplying, onClose, storageKeyPages, storageKeyElements,
}: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["use-case"]));
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [presets, setPresets] = useState<SavedPreset[]>(() => {
    try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || "[]"); } catch { return []; }
  });
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [initialData] = useState(bookData);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    const p: SavedPreset = {
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      settings: {
        chapterContentType: bookData.chapterContentType,
        wordsPerChapter: bookData.wordsPerChapter,
        tone: bookData.tone,
        language: bookData.language,
        model: bookData.model,
      },
    };
    const updated = [p, ...presets].slice(0, 10);
    setPresets(updated);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
    setPresetName("");
    setShowPresetInput(false);
    sonnerToast.success("Preset saved!");
  };

  const loadPreset = (p: SavedPreset) => {
    onBookDataChange(prev => ({ ...prev, ...p.settings }));
    sonnerToast.success(`"${p.name}" loaded`);
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
  };

  const applyUseCase = (id: string) => {
    const uc = USE_CASES.find(u => u.id === id);
    if (!uc) return;
    setSelectedUseCase(id);
    onBookDataChange(prev => ({
      ...prev,
      wordsPerChapter: uc.defaults.wordsPerChapter,
      tone: uc.defaults.tone,
      chapters: uc.defaults.chapters,
    }));
    sonnerToast.success(`Applied "${uc.label}" settings`);
  };

  const totalWords = chapterCount * bookData.wordsPerChapter;
  const estPages = estimatePages(chapterCount, bookData.wordsPerChapter);
  const estTime = estimateGenTime(chapterCount, bookData.wordsPerChapter);
  const currentLang = LANGUAGES.find(l => l.code === bookData.language);
  const currentTone = TONES.find(t => t.id === bookData.tone);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* ─── TOP HORIZONTAL NAV ─── */}
      <div className="shrink-0 border-b border-foreground/[0.06] bg-background px-6 lg:px-10">
        <div className="max-w-xl mx-auto flex items-center gap-1 overflow-x-auto pt-6 pb-0">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className={`px-3 py-2 rounded-t-lg text-sm whitespace-nowrap transition-all border-b-2 ${
                activeSection === s.id
                  ? "border-accent text-accent font-semibold bg-accent/[0.04]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
              }`}>
              {s.label}
            </button>
          ))}
          {/* Presets toggle */}
          <button onClick={() => setShowPresetInput(!showPresetInput)}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            <Save size={12} /> Presets
          </button>
        </div>
        {/* Inline preset bar */}
        {showPresetInput && (
          <div className="max-w-xl mx-auto pb-3 flex items-center gap-2 flex-wrap">
            <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name..."
              className="text-xs px-2.5 py-1.5 rounded-md border border-foreground/[0.1] bg-background outline-none focus:border-accent/40 w-36" />
            <button onClick={savePreset} className="px-2.5 py-1.5 rounded-md bg-accent text-white text-xs font-semibold">Save</button>
            {presets.map(p => (
              <div key={p.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-foreground/[0.03] hover:bg-foreground/[0.06] group">
                <button onClick={() => loadPreset(p)} className="text-xs text-foreground/80 hover:text-foreground">{p.name}</button>
                <button onClick={() => deletePreset(p.id)} className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">×</button>
              </div>
            ))}
            {presets.length === 0 && <span className="text-[10px] text-muted-foreground">No saved presets</span>}
          </div>
        )}
      </div>

      {/* ─── MAIN CONTENT: Two-column layout ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-8 px-6 lg:px-8">
        <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-foreground">Book Settings</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Design how your book gets created</p>
          </div>

          {/* Impact Preview Banner */}
          {hasChanges && (
            <div className="mb-6 p-4 rounded-xl border border-accent/20 bg-accent/[0.03] flex items-center gap-3">
              <Zap size={16} className="text-accent shrink-0" />
              <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/80">
                {wordsDiff !== 0 && (
                  <span className={wordsDiff > 0 ? "text-emerald-600" : "text-orange-600"}>
                    {wordsDiff > 0 ? "+" : ""}{wordsDiff.toLocaleString()} words
                  </span>
                )}
                {bookData.chapterContentType !== initialData.chapterContentType && <span>Content type changed</span>}
                {bookData.tone !== initialData.tone && <span>Tone updated</span>}
                {bookData.model !== initialData.model && <span>Model changed</span>}
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">Est. {estTime}</span>
            </div>
          )}

          <div className="flex gap-6">
            {/* ─── LEFT: Config Sections ─── */}
            <div className="w-[360px] shrink-0 space-y-10 overflow-y-auto">
              {/* ── Use Case ── */}
              <section id="settings-use-case">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 block">What Are You Creating?</label>
                <div className="grid grid-cols-2 gap-3">
                  {USE_CASES.map(uc => (
                    <button key={uc.id} onClick={() => applyUseCase(uc.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        selectedUseCase === uc.id ? "border-accent bg-accent/[0.04] shadow-sm" : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                      }`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selectedUseCase === uc.id ? "bg-accent/10" : "bg-foreground/[0.04]"}`}>
                        <uc.icon size={16} className={selectedUseCase === uc.id ? "text-accent" : "text-muted-foreground"} />
                      </div>
                      <div>
                        <span className={`text-sm font-semibold block ${selectedUseCase === uc.id ? "text-foreground" : "text-foreground/80"}`}>{uc.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">{uc.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Content Type ── */}
              <section id="settings-content-type">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 block">Content Type</label>
                <div className="space-y-2">
                  {CHAPTER_CONTENT_TYPES.map(ct => {
                    const isActive = bookData.chapterContentType === ct.id;
                    return (
                      <button key={ct.id} onClick={() => onBookDataChange(prev => ({ ...prev, chapterContentType: ct.id, includeImages: ct.id !== "text-only" }))}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg border-2 text-left transition-all ${isActive ? "border-accent bg-accent/[0.04] shadow-sm" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-accent/10" : "bg-foreground/[0.04]"}`}>
                          <ct.icon className={`w-5 h-5 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <span className={`text-sm font-semibold block ${isActive ? "text-foreground" : "text-foreground/80"}`}>{ct.label}</span>
                          <span className="text-[10px] text-muted-foreground">{ct.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── Words Per Chapter ── */}
              <section id="settings-length">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1 block">Words Per Chapter</label>
                <p className="text-xs text-muted-foreground mb-4">{getWordsLabel(bookData.wordsPerChapter)}</p>
                <div className="px-1">
                  <Slider value={[bookData.wordsPerChapter]} onValueChange={([v]) => onBookDataChange(prev => ({ ...prev, wordsPerChapter: v }))} min={200} max={5000} step={100} className="mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">200</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={bookData.wordsPerChapter}
                        onChange={e => onBookDataChange(prev => ({ ...prev, wordsPerChapter: Math.max(100, Math.min(20000, parseInt(e.target.value) || 1500)) }))}
                        className="w-20 text-center px-2 py-1.5 rounded-lg border border-foreground/[0.1] bg-background text-sm font-semibold outline-none focus:border-accent/40" />
                      <span className="text-[10px] text-muted-foreground">words</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">5,000</span>
                  </div>
                </div>
              </section>

              {/* ── Tone ── */}
              <section id="settings-tone">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 block">Writing Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map(t => {
                    const isActive = bookData.tone === t.id;
                    return (
                      <button key={t.id} onClick={() => onBookDataChange(prev => ({ ...prev, tone: t.id }))}
                        className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${isActive ? "border-accent bg-accent/[0.04]" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                        <t.icon size={16} className={`mt-0.5 shrink-0 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                        <div>
                          <span className={`text-sm font-semibold block ${isActive ? "text-foreground" : "text-foreground/80"}`}>{t.name}</span>
                          <span className="text-[10px] text-muted-foreground leading-tight">{t.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── Language ── */}
              <section id="settings-language">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 block">Language</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-foreground/[0.1] bg-background">
                    <span className="text-base">{currentLang?.flag}</span>
                    <span className="text-sm font-semibold">{currentLang?.name || "English"}</span>
                  </div>
                  <button onClick={() => setShowAllLanguages(!showAllLanguages)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium">
                    Change Language <ChevronDown size={12} className={showAllLanguages ? "rotate-180 transition-transform" : "transition-transform"} />
                  </button>
                </div>
                {showAllLanguages && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { onBookDataChange(prev => ({ ...prev, language: l.code })); setShowAllLanguages(false); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${bookData.language === l.code ? "border-accent bg-accent/[0.04] font-semibold" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                        <span>{l.flag}</span>{l.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* ── AI Model ── */}
              <section id="settings-ai-model">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 block">AI Model</label>
                <div className="space-y-2">
                  {AI_MODELS.map(m => {
                    const isActive = bookData.model === m.id;
                    return (
                      <button key={m.id} onClick={() => onBookDataChange(prev => ({ ...prev, model: m.id }))}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${isActive ? "border-accent bg-accent/[0.04]" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-foreground/80"}`}>{m.name}</span>
                            {m.badge === "Recommended" && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">⭐ Recommended</span>}
                            {m.badge === "Premium" && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-foreground/[0.06] text-foreground/60">Premium</span>}
                            {m.badge === "Fast" && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-foreground/[0.06] text-foreground/60">⚡ Fast</span>}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{m.description}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-center">
                            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Zap key={i} size={8} className={i < m.speed ? "text-amber-500 fill-amber-500" : "text-foreground/10"} />)}</div>
                            <span className="text-[8px] text-muted-foreground">Speed</span>
                          </div>
                          <div className="text-center">
                            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={8} className={i < m.quality ? "text-accent fill-accent" : "text-foreground/10"} />)}</div>
                            <span className="text-[8px] text-muted-foreground">Quality</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── CTA ── */}
              <div className="pt-4 pb-8">
                <div className="p-5 rounded-xl bg-accent/[0.03] border border-accent/20 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">Rebuild My Book</p>
                    <p className="text-[10px] text-muted-foreground">This will update your book structure and regenerate affected content</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={onApply} disabled={isApplying}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-all disabled:opacity-50">
                      {isApplying ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      {isApplying ? "Rebuilding..." : "Rebuild My Book"}
                    </button>
                    <button onClick={onClose} className="w-full py-2.5 rounded-lg border border-foreground/[0.1] text-sm font-medium hover:bg-foreground/[0.04] transition-colors">Cancel</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── CENTER: Live Book Preview ─── */}
            <div className="flex-1 min-w-0 hidden md:flex flex-col items-center justify-start pt-4">
              <div className="sticky top-0 w-full max-w-md">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-4 text-center">Live Preview</h3>
                <div className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] shadow-sm overflow-hidden">
                  {/* Book Cover */}
                  <div className="aspect-[3/4] max-h-[420px] bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.06] flex flex-col items-center justify-center p-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
                    <div className="relative z-10 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
                        <BookOpen size={28} className="text-accent" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground leading-tight">{bookData.selectedTitle || "Untitled Book"}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1.5 capitalize">{currentTone?.name || "Professional"} · {currentLang?.name || "English"}</p>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-foreground/[0.06] text-foreground/60">{chapterCount} chapters</span>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-foreground/[0.06] text-foreground/60">~{estPages} pages</span>
                      </div>
                    </div>
                  </div>
                  {/* Table of Contents */}
                  <div className="p-5 border-t border-foreground/[0.06]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-3">Table of Contents</p>
                    <div className="space-y-2">
                      {Array.from({ length: Math.min(chapterCount, 6) }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-accent/60 w-5 text-right">{String(i + 1).padStart(2, "0")}</span>
                          <div className="flex-1 h-2 rounded-full bg-foreground/[0.05]" />
                          <span className="text-[9px] text-muted-foreground">{bookData.wordsPerChapter.toLocaleString()}w</span>
                        </div>
                      ))}
                      {chapterCount > 6 && (
                        <p className="text-[10px] text-muted-foreground text-center pt-1">+ {chapterCount - 6} more chapters</p>
                      )}
                    </div>
                  </div>
                  {/* Content type badges */}
                  <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
                    {bookData.chapterContentType !== "text-only" && (
                      <span className="text-[9px] px-2 py-1 rounded-full bg-accent/10 text-accent font-medium flex items-center gap-1">
                        <Image size={9} /> Images
                      </span>
                    )}
                    {bookData.chapterContentType === "text-images-interactive" && (
                      <span className="text-[9px] px-2 py-1 rounded-full bg-accent/10 text-accent font-medium flex items-center gap-1">
                        <Sparkles size={9} /> Interactive
                      </span>
                    )}
                    <span className="text-[9px] px-2 py-1 rounded-full bg-foreground/[0.04] text-foreground/50 font-medium">{totalWords.toLocaleString()} words</span>
                    <span className="ml-auto text-[9px] text-muted-foreground">{estTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: Live Summary (sticky) ─── */}
            <div className="w-56 shrink-0 hidden lg:block">
              <div className="sticky top-0 pt-2">
                <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.01] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-4">Live Summary</h3>
                  <div className="space-y-3">
                    <SummaryRow icon={<Layers size={14} />} label="Content" value={CHAPTER_CONTENT_TYPES.find(c => c.id === bookData.chapterContentType)?.label || "—"} />
                    <SummaryRow icon={<FileText size={14} />} label="Words/Ch" value={bookData.wordsPerChapter.toLocaleString()} />
                    <SummaryRow icon={<BookOpen size={14} />} label="Total Words" value={`~${totalWords.toLocaleString()}`} />
                    <SummaryRow icon={<FileCheck size={14} />} label="Est. Pages" value={`~${estPages}`} />
                    <SummaryRow icon={<Briefcase size={14} />} label="Tone" value={currentTone?.name || "—"} />
                    <SummaryRow icon={<Globe size={14} />} label="Language" value={currentLang?.name || "English"} />
                    <SummaryRow icon={<Cpu size={14} />} label="Model" value={AI_MODELS.find(m => m.id === bookData.model)?.name || "Auto"} />
                  </div>
                  <div className="mt-5 pt-4 border-t border-foreground/[0.06]">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">Estimated Output</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-foreground/70"><Layers size={12} className="text-accent" /><span>~{chapterCount} chapters</span></div>
                      <div className="flex items-center gap-2 text-xs text-foreground/70"><FileText size={12} className="text-accent" /><span>~{estPages} pages</span></div>
                      <div className="flex items-center gap-2 text-xs text-foreground/70"><Clock size={12} className="text-accent" /><span>{estTime} generation</span></div>
                    </div>
                  </div>
                </div>
                {/* Project Actions */}
                <div className="mt-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.01] p-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">Project</h4>
                  <div className="space-y-0.5">
                    <button onClick={() => {
                      const el = document.createElement("a");
                      el.download = `${bookData.selectedTitle || "Untitled Book"}.json`;
                      el.href = URL.createObjectURL(new Blob([JSON.stringify(bookData, null, 2)], { type: "application/json" }));
                      el.click();
                      sonnerToast.success("Book data exported");
                    }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground/70 hover:bg-foreground/[0.04] transition-colors">
                      <Download size={12} /> Export Data
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); sonnerToast.success("Link copied"); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground/70 hover:bg-foreground/[0.04] transition-colors">
                      <Copy size={12} /> Copy Link
                    </button>
                    <button onClick={() => {
                      const pages = localStorage.getItem(storageKeyPages);
                      const elements = localStorage.getItem(storageKeyElements);
                      if (pages || elements) {
                        const snapshot = { timestamp: new Date().toISOString(), title: bookData.selectedTitle || "Untitled", pageCount };
                        const history = JSON.parse(localStorage.getItem("ebook_version_history") || "[]");
                        history.unshift(snapshot);
                        if (history.length > 20) history.pop();
                        localStorage.setItem("ebook_version_history", JSON.stringify(history));
                        sonnerToast.success(`Version saved! ${history.length} version(s) in history.`);
                      } else {
                        sonnerToast.info("No saved versions yet.");
                      }
                    }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground/70 hover:bg-foreground/[0.04] transition-colors">
                      <Undo2 size={12} /> Version History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}
