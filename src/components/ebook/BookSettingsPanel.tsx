import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft, FileText, Image, Sparkles, Briefcase, Coffee, GraduationCap,
  Heart, Shield, Flame, Cpu, Wand2, Loader2, Download, Copy, Undo2,
  ChevronDown, ChevronRight, Zap, Star, BookOpen, Clock, FileCheck, Save, Layers,
  Target, Rocket, Users, Globe, Pencil, TrendingUp, CheckCircle2,
  Hash, Lightbulb, Trophy, ArrowUpRight,
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
  { id: "lead-magnet", label: "Lead Magnet", icon: Target, desc: "Short, punchy, high-conversion", defaults: { wordsPerChapter: 500, tone: "conversational", chapters: 5 }, titleTemplate: "The Ultimate [Topic] Lead Magnet" },
  { id: "authority-book", label: "Authority Book", icon: Shield, desc: "In-depth, expert positioning", defaults: { wordsPerChapter: 2000, tone: "authoritative", chapters: 10 }, titleTemplate: "The Authority Guide to [Topic]" },
  { id: "course-content", label: "Course Content", icon: GraduationCap, desc: "Structured learning material", defaults: { wordsPerChapter: 1500, tone: "academic", chapters: 8 }, titleTemplate: "Mastering [Topic]: A Complete Course" },
  { id: "personal-brand", label: "Personal Brand", icon: Users, desc: "Storytelling & personal voice", defaults: { wordsPerChapter: 1500, tone: "friendly", chapters: 8 }, titleTemplate: "The [Topic] Playbook" },
];

const SAMPLE_CHAPTER_TITLES = [
  { title: "Introduction & Overview", icon: BookOpen, key: true },
  { title: "The Foundation", icon: Layers, key: false },
  { title: "Core Concepts", icon: Lightbulb, key: true },
  { title: "Building Blocks", icon: Hash, key: false },
  { title: "Advanced Strategies", icon: Target, key: true },
  { title: "Real-World Applications", icon: Rocket, key: false },
  { title: "Case Studies & Examples", icon: Trophy, key: false },
  { title: "Implementation Guide", icon: FileCheck, key: false },
  { title: "Measuring Success", icon: TrendingUp, key: false },
  { title: "Future Outlook", icon: Star, key: false },
  { title: "Best Practices", icon: Shield, key: false },
  { title: "Common Pitfalls", icon: Flame, key: false },
  { title: "Expert Interviews", icon: Users, key: false },
  { title: "Action Plan", icon: Zap, key: true },
  { title: "Resources & References", icon: FileText, key: false },
  { title: "Appendix", icon: Layers, key: false },
  { title: "Glossary", icon: BookOpen, key: false },
  { title: "Summary & Next Steps", icon: ArrowUpRight, key: false },
  { title: "Deep Dive: Strategy", icon: Target, key: false },
  { title: "The Complete Framework", icon: Layers, key: false },
];

const SAMPLE_PARAGRAPHS = [
  "This comprehensive guide will walk you through everything you need to know, from foundational concepts to advanced strategies that industry leaders use daily.",
  "Each chapter has been carefully crafted to build upon the previous one, creating a natural learning progression that makes complex topics accessible and actionable.",
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

function generateSmartTitle(useCase: string | null): string {
  const titles: Record<string, string[]> = {
    "lead-magnet": ["The Conversion Blueprint", "The Growth Accelerator", "The Quick-Start Authority Guide"],
    "authority-book": ["The Definitive Expert Guide", "Strategic Mastery Blueprint", "The Complete Authority Playbook"],
    "course-content": ["The Structured Learning Path", "Mastering the Fundamentals", "The Complete Training Manual"],
    "personal-brand": ["Your Story, Your Impact", "The Personal Brand Blueprint", "Building Your Legacy"],
  };
  const pool = titles[useCase || "authority-book"] || titles["authority-book"];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Sections for sidebar nav ───────────────────────────────────────
const SECTIONS = [
  { id: "use-case", label: "Use Case", icon: Target, num: "01" },
  { id: "content-type", label: "Content Type", icon: Layers, num: "02" },
  { id: "length", label: "Length", icon: FileText, num: "03" },
  { id: "tone", label: "Tone", icon: Briefcase, num: "04" },
  { id: "language", label: "Language", icon: Globe, num: "05" },
  { id: "ai-model", label: "AI Model", icon: Cpu, num: "06" },
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [initialData] = useState(bookData);

  // Auto-generate a title if empty on mount
  useEffect(() => {
    if (!bookData.selectedTitle || bookData.selectedTitle === "Untitled Book") {
      const title = generateSmartTitle(selectedUseCase);
      onBookDataChange(prev => ({ ...prev, selectedTitle: title }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger preview animation on changes
  useEffect(() => {
    setPreviewKey(k => k + 1);
  }, [bookData.wordsPerChapter, bookData.chapterContentType, bookData.tone, bookData.chapters]);

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
    const newTitle = generateSmartTitle(id);
    onBookDataChange(prev => ({
      ...prev,
      wordsPerChapter: uc.defaults.wordsPerChapter,
      tone: uc.defaults.tone,
      chapters: uc.defaults.chapters,
      selectedTitle: newTitle,
    }));
    sonnerToast.success(`Applied "${uc.label}" — title updated`);
  };

  const totalWords = chapterCount * bookData.wordsPerChapter;
  const estPages = estimatePages(chapterCount, bookData.wordsPerChapter);
  const estTime = estimateGenTime(chapterCount, bookData.wordsPerChapter);
  const currentLang = LANGUAGES.find(l => l.code === bookData.language);
  const currentTone = TONES.find(t => t.id === bookData.tone);

  const hasChanges = bookData.wordsPerChapter !== initialData.wordsPerChapter
    || bookData.chapterContentType !== initialData.chapterContentType
    || bookData.tone !== initialData.tone
    || bookData.model !== initialData.model
    || bookData.language !== initialData.language;

  const wordsDiff = (bookData.wordsPerChapter - initialData.wordsPerChapter) * chapterCount;
  const pagesDiff = estPages - estimatePages(chapterCount, initialData.wordsPerChapter);
  const initialImageCount = initialData.chapterContentType !== "text-only" ? chapterCount * 2 : 0;
  const currentImageCount = bookData.chapterContentType !== "text-only" ? chapterCount * 2 : 0;
  const imagesDiff = currentImageCount - initialImageCount;

  // Collapsible section helper with numbered system feel
  const SectionHeader = ({ id, label, icon: Icon, num }: { id: string; label: string; icon: React.ElementType; num: string }) => {
    const isOpen = expandedSections.has(id);
    return (
      <button onClick={() => toggleSection(id)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-2 group ${isOpen ? "bg-foreground/[0.12] border-l-accent" : "hover:bg-foreground/[0.03] border-l-transparent"}`}>
        <span className={`text-[9px] font-mono font-bold w-5 text-right shrink-0 ${isOpen ? "text-accent" : "text-foreground/25"}`}>{num}</span>
        <Icon size={15} className={`shrink-0 transition-colors ${isOpen ? "text-accent" : "text-foreground/40 group-hover:text-foreground/60"}`} />
        <span className={`text-sm font-semibold flex-1 transition-colors ${isOpen ? "text-foreground" : "text-foreground/70"}`}>{label}</span>
        <ChevronRight size={14} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* ─── MAIN CONTENT: Three-panel layout ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT: Collapsible Config Sections ─── */}
        <div ref={scrollRef} className="w-[360px] shrink-0 border-r border-foreground/[0.06] overflow-y-auto">
          {/* Header */}
          <div className="px-4 pt-5 pb-3 border-b border-foreground/[0.06]">
            <h1 className="text-base font-bold text-foreground">Book Settings</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Design how your book gets created</p>
          </div>

          {/* Impact Preview Banner */}
          {hasChanges && (
            <div className="mx-3 mt-3 p-3 rounded-lg border border-accent/20 bg-accent/[0.03] animate-[fadeSlideIn_0.3s_ease-out]">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap size={12} className="text-accent" />
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">Impact Preview</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pagesDiff !== 0 && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-[fadeSlideIn_0.25s_ease-out] ${pagesDiff > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"}`}>
                    <FileCheck size={9} />{pagesDiff > 0 ? "+" : ""}{pagesDiff} pages
                  </span>
                )}
                {wordsDiff !== 0 && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-[fadeSlideIn_0.25s_ease-out] ${wordsDiff > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"}`}>
                    <FileText size={9} />{wordsDiff > 0 ? "+" : ""}{wordsDiff.toLocaleString()} words
                  </span>
                )}
                {imagesDiff !== 0 && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-[fadeSlideIn_0.25s_ease-out] ${imagesDiff > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"}`}>
                    <Image size={9} />{imagesDiff > 0 ? "+" : ""}{imagesDiff} images
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="divide-y divide-foreground/[0.06]">
            {/* ── Use Case ── */}
            <div>
              <SectionHeader id="use-case" label="Use Case" icon={Target} num="01" />
              {expandedSections.has("use-case") && (
                <div className="px-4 pb-4 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    {USE_CASES.map(uc => (
                      <button key={uc.id} onClick={() => applyUseCase(uc.id)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                          selectedUseCase === uc.id ? "border-accent bg-accent/[0.04] shadow-sm" : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                        }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedUseCase === uc.id ? "bg-accent/10" : "bg-foreground/[0.04]"}`}>
                          <uc.icon size={14} className={selectedUseCase === uc.id ? "text-accent" : "text-muted-foreground"} />
                        </div>
                        <div>
                          <span className={`text-xs font-semibold block ${selectedUseCase === uc.id ? "text-foreground" : "text-foreground/80"}`}>{uc.label}</span>
                          <span className="text-[9px] text-muted-foreground leading-tight">{uc.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Content Type ── */}
            <div>
              <SectionHeader id="content-type" label="Content Type" icon={Layers} num="02" />
              {expandedSections.has("content-type") && (
                <div className="px-4 pb-4 pt-1 space-y-2">
                  {CHAPTER_CONTENT_TYPES.map(ct => {
                    const isActive = bookData.chapterContentType === ct.id;
                    return (
                      <button key={ct.id} onClick={() => onBookDataChange(prev => ({ ...prev, chapterContentType: ct.id, includeImages: ct.id !== "text-only" }))}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg border-2 text-left transition-all ${isActive ? "border-accent bg-accent/[0.04] shadow-sm" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-accent/10" : "bg-foreground/[0.04]"}`}>
                          <ct.icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <span className={`text-xs font-semibold block ${isActive ? "text-foreground" : "text-foreground/80"}`}>{ct.label}</span>
                          <span className="text-[9px] text-muted-foreground">{ct.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Length ── */}
            <div>
              <SectionHeader id="length" label="Length" icon={FileText} num="03" />
              {expandedSections.has("length") && (
                <div className="px-4 pb-4 pt-1">
                  <p className="text-[10px] text-muted-foreground mb-3">{getWordsLabel(bookData.wordsPerChapter)}</p>
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
                </div>
              )}
            </div>

            {/* ── Tone ── */}
            <div>
              <SectionHeader id="tone" label="Tone" icon={Briefcase} num="04" />
              {expandedSections.has("tone") && (
                <div className="px-4 pb-4 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map(t => {
                      const isActive = bookData.tone === t.id;
                      return (
                        <button key={t.id} onClick={() => onBookDataChange(prev => ({ ...prev, tone: t.id }))}
                          className={`flex items-start gap-2.5 px-3 py-3 rounded-xl border-2 text-left transition-all ${isActive ? "border-accent bg-accent/[0.04]" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                          <t.icon size={14} className={`mt-0.5 shrink-0 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                          <div>
                            <span className={`text-xs font-semibold block ${isActive ? "text-foreground" : "text-foreground/80"}`}>{t.name}</span>
                            <span className="text-[9px] text-muted-foreground leading-tight">{t.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Language ── */}
            <div>
              <SectionHeader id="language" label="Language" icon={Globe} num="05" />
              {expandedSections.has("language") && (
                <div className="px-4 pb-4 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-foreground/[0.1] bg-background">
                      <span className="text-base">{currentLang?.flag}</span>
                      <span className="text-sm font-semibold">{currentLang?.name || "English"}</span>
                    </div>
                    <button onClick={() => setShowAllLanguages(!showAllLanguages)}
                      className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium">
                      Change <ChevronDown size={12} className={showAllLanguages ? "rotate-180 transition-transform" : "transition-transform"} />
                    </button>
                  </div>
                  {showAllLanguages && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {LANGUAGES.map(l => (
                        <button key={l.code} onClick={() => { onBookDataChange(prev => ({ ...prev, language: l.code })); setShowAllLanguages(false); }}
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs transition-all ${bookData.language === l.code ? "border-accent bg-accent/[0.04] font-semibold" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                          <span>{l.flag}</span>{l.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── AI Model ── */}
            <div>
              <SectionHeader id="ai-model" label="AI Model" icon={Cpu} num="06" />
              {expandedSections.has("ai-model") && (
                <div className="px-4 pb-4 pt-1 space-y-2">
                  {AI_MODELS.map(m => {
                    const isActive = bookData.model === m.id;
                    return (
                      <button key={m.id} onClick={() => onBookDataChange(prev => ({ ...prev, model: m.id }))}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left transition-all ${isActive ? "border-accent bg-accent/[0.04]" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${isActive ? "text-foreground" : "text-foreground/80"}`}>{m.name}</span>
                            {m.badge === "Recommended" && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">⭐</span>}
                            {m.badge === "Premium" && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-foreground/[0.06] text-foreground/60">Pro</span>}
                            {m.badge === "Fast" && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-foreground/[0.06] text-foreground/60">⚡</span>}
                          </div>
                          <span className="text-[9px] text-muted-foreground">{m.description}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center">
                            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Zap key={i} size={7} className={i < m.speed ? "text-amber-500 fill-amber-500" : "text-foreground/10"} />)}</div>
                          </div>
                          <div className="text-center">
                            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={7} className={i < m.quality ? "text-accent fill-accent" : "text-foreground/10"} />)}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Presets ── */}
            <div>
              <SectionHeader id="presets" label="Presets" icon={Save} num="07" />
              {expandedSections.has("presets") && (
                <div className="px-4 pb-4 pt-1">
                  <div className="flex items-center gap-2 mb-3">
                    <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name..."
                      className="text-xs px-2.5 py-1.5 rounded-md border border-foreground/[0.1] bg-background outline-none focus:border-accent/40 flex-1" />
                    <button onClick={savePreset} className="px-2.5 py-1.5 rounded-md bg-accent text-accent-foreground text-xs font-semibold shrink-0">Save</button>
                  </div>
                  {presets.length > 0 ? (
                    <div className="space-y-1">
                      {presets.map(p => (
                        <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground/[0.03] hover:bg-foreground/[0.06] group">
                          <button onClick={() => loadPreset(p)} className="text-xs text-foreground/80 hover:text-foreground flex-1 text-left">{p.name}</button>
                          <button onClick={() => deletePreset(p.id)} className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">×</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No saved presets</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="p-4 border-t border-foreground/[0.06]">
            <div className="flex flex-col gap-2">
              <button onClick={onApply} disabled={isApplying}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-bold hover:bg-accent/90 transition-all disabled:opacity-50">
                {isApplying ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {isApplying ? "Rebuilding..." : "Rebuild My Book"}
              </button>
              <button onClick={onClose} className="w-full py-2.5 rounded-lg border border-foreground/[0.1] text-sm font-medium hover:bg-foreground/[0.04] transition-colors">Cancel</button>
            </div>
          </div>
        </div>

        {/* ─── CENTER: Living Book Preview (HERO) ─── */}
        <div className="flex-1 min-w-0 overflow-y-auto flex flex-col items-center justify-start py-8 px-6"
          style={{ background: "radial-gradient(ellipse 600px 400px at 50% 30%, hsl(var(--accent) / 0.06), transparent 70%)" }}>
          <div className="w-full max-w-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-5 text-center flex items-center justify-center gap-2">
              <BookOpen size={12} className="text-accent" /> Live Preview
            </h3>

            {/* Book card with elevation */}
            <div key={previewKey}
              className="rounded-2xl border border-foreground/[0.1] bg-card overflow-hidden animate-[fadeSlideIn_0.35s_ease-out] transition-shadow duration-300"
              style={{ boxShadow: "0 20px 60px -15px hsl(var(--foreground) / 0.12), 0 8px 24px -8px hsl(var(--foreground) / 0.08)" }}>

              {/* ── Book Cover ── */}
              <div className="aspect-[3/4] max-h-[420px] flex flex-col items-center justify-center p-10 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, hsl(var(--foreground) / 0.03) 0%, hsl(var(--foreground) / 0.07) 50%, hsl(var(--accent) / 0.05) 100%)" }}>
                {/* Decorative gradient orb */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-40 blur-3xl"
                  style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.15), transparent 70%)" }} />

                <div className="relative z-10 text-center space-y-5">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm border border-accent/10">
                    <BookOpen size={32} className="text-accent" />
                  </div>
                  <div>
                    {isEditingTitle ? (
                      <input
                        value={bookData.selectedTitle}
                        onChange={e => onBookDataChange(prev => ({ ...prev, selectedTitle: e.target.value }))}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={e => e.key === "Enter" && setIsEditingTitle(false)}
                        autoFocus
                        className="text-xl font-bold text-foreground text-center bg-transparent border-b-2 border-accent/40 outline-none w-full px-2 py-1"
                        placeholder="Enter your book title..."
                      />
                    ) : (
                      <div className="group relative">
                        <h4 className="text-xl font-bold text-foreground leading-tight cursor-pointer hover:text-accent/80 transition-colors"
                          onClick={() => setIsEditingTitle(true)}>
                          {bookData.selectedTitle || "Click to add title"}
                          <Pencil size={13} className="inline ml-2 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </h4>
                        <button onClick={() => {
                          const title = generateSmartTitle(selectedUseCase);
                          onBookDataChange(prev => ({ ...prev, selectedTitle: title }));
                          sonnerToast.success("Title generated!");
                        }} className="mt-2.5 flex items-center gap-1.5 mx-auto text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors">
                          <Sparkles size={11} /> Generate New Title
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-2 capitalize">{currentTone?.name || "Professional"} · {currentLang?.name || "English"}</p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-foreground/[0.06] text-foreground/60 font-medium">{chapterCount} chapters</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-foreground/[0.06] text-foreground/60 font-medium">~{estPages} pages</span>
                  </div>
                </div>
              </div>

              {/* ── Table of Contents with icons ── */}
              <div className="p-6 border-t border-foreground/[0.06]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-3">Table of Contents</p>
                <div className="space-y-0.5">
                  {Array.from({ length: Math.min(chapterCount, 8) }).map((_, i) => {
                    const chapter = SAMPLE_CHAPTER_TITLES[i % SAMPLE_CHAPTER_TITLES.length];
                    const ChIcon = chapter.icon;
                    return (
                      <div key={i} className={`flex items-center gap-3 py-2 group hover:bg-foreground/[0.03] rounded-lg px-2.5 -mx-2 transition-all ${chapter.key ? "bg-accent/[0.02]" : ""}`}>
                        <span className="text-[10px] font-mono text-accent/60 w-5 text-right shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <ChIcon size={12} className={`shrink-0 ${chapter.key ? "text-accent" : "text-foreground/25"}`} />
                        <span className={`text-xs flex-1 truncate ${chapter.key ? "text-foreground font-semibold" : "text-foreground/70"}`}>
                          {chapter.title}
                        </span>
                        {chapter.key && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-bold uppercase shrink-0">Key</span>}
                        <span className="text-[9px] text-muted-foreground shrink-0 tabular-nums">{bookData.wordsPerChapter.toLocaleString()}w</span>
                      </div>
                    );
                  })}
                  {chapterCount > 8 && (
                    <p className="text-[10px] text-muted-foreground text-center pt-2">+ {chapterCount - 8} more chapters</p>
                  )}
                </div>
              </div>

              {/* ── Sample Paragraph Preview ── */}
              <div className="px-6 pb-5 border-t border-foreground/[0.06] pt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">Sample Preview</p>
                <p className="text-[11px] text-foreground/55 leading-relaxed italic">
                  "{SAMPLE_PARAGRAPHS[0]}"
                </p>
              </div>

              {/* ── Content type badges ── */}
              <div className="px-6 pb-5 flex items-center gap-2 flex-wrap border-t border-foreground/[0.06] pt-3">
                {bookData.chapterContentType !== "text-only" && (
                  <span className="text-[9px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold flex items-center gap-1">
                    <Image size={9} /> Images
                  </span>
                )}
                {bookData.chapterContentType === "text-images-interactive" && (
                  <span className="text-[9px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold flex items-center gap-1">
                    <Sparkles size={9} /> Interactive
                  </span>
                )}
                <span className="text-[9px] px-2.5 py-1 rounded-full bg-foreground/[0.04] text-foreground/50 font-medium">{totalWords.toLocaleString()} words</span>
                <span className="ml-auto text-[9px] text-muted-foreground flex items-center gap-1"><Clock size={9} /> {estTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Live Summary + Value Prop (sticky) ─── */}
        <div className="w-72 shrink-0 hidden lg:block border-l border-foreground/[0.06] overflow-y-auto p-5">
          <div className="sticky top-0 space-y-4">

            {/* Live Summary */}
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

              {/* ── Change Impact Deltas ── */}
              {hasChanges && (
                <div className="mt-4 pt-3 border-t border-foreground/[0.06] animate-[fadeSlideIn_0.3s_ease-out]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2 flex items-center gap-1.5">
                    <TrendingUp size={10} className="text-accent" /> Change Impact
                  </h4>
                  <div className="space-y-1.5">
                    {pagesDiff !== 0 && (
                      <div className={`flex items-center gap-2 text-xs font-semibold ${pagesDiff > 0 ? "text-emerald-600" : "text-orange-600"}`}>
                        <FileCheck size={11} />{pagesDiff > 0 ? "+" : ""}{pagesDiff} pages
                      </div>
                    )}
                    {wordsDiff !== 0 && (
                      <div className={`flex items-center gap-2 text-xs font-semibold ${wordsDiff > 0 ? "text-emerald-600" : "text-orange-600"}`}>
                        <FileText size={11} />{wordsDiff > 0 ? "+" : ""}{wordsDiff.toLocaleString()} words
                      </div>
                    )}
                    {imagesDiff !== 0 && (
                      <div className={`flex items-center gap-2 text-xs font-semibold ${imagesDiff > 0 ? "text-emerald-600" : "text-orange-600"}`}>
                        <Image size={11} />{imagesDiff > 0 ? "+" : ""}{imagesDiff} images
                      </div>
                    )}
                    {bookData.tone !== initialData.tone && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                        <Briefcase size={11} />Tone → {currentTone?.name}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estimated Output */}
              <div className="mt-4 pt-3 border-t border-foreground/[0.06]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">Estimated Output</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-foreground/70"><Layers size={12} className="text-accent" /><span>~{chapterCount} chapters</span></div>
                  <div className="flex items-center gap-2 text-xs text-foreground/70"><FileText size={12} className="text-accent" /><span>~{estPages} pages</span></div>
                  <div className="flex items-center gap-2 text-xs text-foreground/70"><Clock size={12} className="text-accent" /><span>{estTime} generation</span></div>
                </div>
              </div>
            </div>

            {/* 🔥 What You're About to Create */}
            <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 mb-3">
                <Flame size={14} className="text-accent" /> What You're About To Create
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground/70">A complete, structured ebook</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground/70">~{estPages} pages of {currentTone?.name?.toLowerCase() || "professional"} content</span>
                </div>
                {bookData.chapterContentType !== "text-only" && (
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-xs text-foreground/70">AI-generated images per chapter</span>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground/70">Ready for publishing or lead generation</span>
                </div>
              </div>
              {/* Emotional trigger */}
              <div className="mt-4 pt-3 border-t border-accent/10">
                <p className="text-[11px] text-foreground/50 italic leading-relaxed">
                  "Your book will be ready to publish, share, or sell — perfect for lead generation, authority building, or content repurposing."
                </p>
              </div>
            </div>

            {/* Project Actions */}
            <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.01] p-4">
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
