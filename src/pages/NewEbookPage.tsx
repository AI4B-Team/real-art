import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useEbooks } from "@/contexts/EbookContext";
import {
  Upload, Mic, Sparkles, ArrowLeft, BookOpen, Headphones, Presentation,
  Lightbulb, Palette, Send, Globe, MessageSquare,
  Bot, Link2, FileText, X, Plus, Layers,
  Briefcase, Coffee, GraduationCap, Heart, Shield, Flame, Search, ChevronDown,
  Check, Pencil, Eye, Loader2, Wand2, RefreshCw,
  ArrowRight, Target, Zap, Undo2, Redo2, ZoomIn, ZoomOut,
  Share2, Lock, Cloud, Copy, Cpu, Shuffle,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import PageShell from "@/components/PageShell";
import EbookGenerationOverlay from "@/components/ebook/EbookGenerationOverlay";

interface NewBookData {
  prompt: string;
  sourceType: "ai" | "upload" | "link" | "record";
  contentType: "ebook" | "audiobook" | "presentation";
  language: string;
  tone: string;
  audience: string;
  chapters: number;
  wordsPerChapter: number;
  includeImages: boolean;
  selectedTitle: string;
  model: string;
}

const CONTENT_TYPES = [
  { id: "ebook", label: "eBook", icon: BookOpen },
  { id: "audiobook", label: "AudioBook", icon: Headphones },
  { id: "presentation", label: "Presentation", icon: Presentation },
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

const TONES = [
  { id: "professional", name: "Professional", icon: Briefcase },
  { id: "conversational", name: "Conversational", icon: Coffee },
  { id: "academic", name: "Academic", icon: GraduationCap },
  { id: "friendly", name: "Friendly", icon: Heart },
  { id: "authoritative", name: "Authoritative", icon: Shield },
  { id: "inspirational", name: "Inspirational", icon: Flame },
];

const AI_MODELS = [
  { id: "auto", name: "Auto", description: "Automatically selects the best model" },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", description: "Fast & balanced" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Top-tier reasoning" },
  { id: "gpt-5", name: "GPT-5", description: "Powerful all-rounder" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", description: "Fast & efficient" },
];

const SOURCE_OPTIONS = [
  { id: "ai", label: "GhostInk", icon: Bot },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "link", label: "Link", icon: Link2 },
  { id: "record", label: "Record", icon: Mic },
];

type TabId = "idea" | "generate" | "design";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "design", label: "Design", icon: Palette },
];

export interface ChapterData {
  id: string;
  title: string;
  description: string;
  topics: string[];
  includeImages: boolean;
  pageCount: number;
}

const NewEbookPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { updateEbook } = useEbooks();

  const initialTab = (() => {
    const tab = searchParams.get("tab");
    if (tab && ["idea", "generate", "design"].includes(tab)) return tab as TabId;
    const state = window.history.state?.usr as { book?: any } | null;
    if (state?.book) return "design" as TabId;
    return "idea" as TabId;
  })();

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [isGeneratingBook, setIsGeneratingBook] = useState(false);
  const [chapterSequence, setChapterSequence] = useState<ChapterData[]>([]);
  const [bookDescription, setBookDescription] = useState("");
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

  const [bookData, setBookData] = useState<NewBookData>({
    prompt: "",
    sourceType: "ai",
    contentType: "ebook",
    language: "en",
    tone: "professional",
    audience: "",
    chapters: 8,
    wordsPerChapter: 2000,
    includeImages: true,
    selectedTitle: "",
    model: "auto",
  });

  const [contentTypeSelected, setContentTypeSelected] = useState(initialTab === "design");

  // Canvas design state
  type PageType = "cover" | "toc" | "chapter" | "chapter-page" | "back";
  interface UnifiedPage { id: string; title: string; type: PageType; }

  const getDefaultPages = (): UnifiedPage[] => [
    { id: "1", title: bookData.selectedTitle || "The Ultimate Guide to AI Marketing", type: "cover" },
    { id: "2", title: "Table of Contents", type: "toc" },
    { id: "3", title: "Introduction", type: "chapter" },
    { id: "4", title: "Content Page", type: "chapter-page" },
    { id: "5", title: "Executive Summary", type: "chapter" },
    { id: "6", title: "Content Page", type: "chapter-page" },
    { id: "7", title: "Market Analysis", type: "chapter" },
    { id: "8", title: "Content Page", type: "chapter-page" },
    { id: "9", title: "Back Cover", type: "back" },
  ];

  const [ebookPages, setEbookPages] = useState<UnifiedPage[]>(getDefaultPages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>("1");
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const state = location.state as { book?: any; fromCreate?: boolean; prompt?: string } | null;
    if (state?.book) {
      setActiveTab("design");
      setContentTypeSelected(true);
      setBookData(prev => ({ ...prev, contentType: "ebook", selectedTitle: state.book.title || "", prompt: state.book.description || "" }));
    }
    // Coming from Create page with a prompt — pre-fill and auto-generate
    if (state?.fromCreate && state?.prompt) {
      setBookData(prev => ({ ...prev, prompt: state.prompt!, sourceType: "ai" }));
      setContentTypeSelected(true);
      // Clear state so refresh doesn't re-trigger
      window.history.replaceState({}, document.title);
      // Auto-trigger generation after a short delay
      setTimeout(() => {
        const fakeBtn = document.getElementById("ghost-ink-generate-btn");
        if (fakeBtn) fakeBtn.click();
      }, 500);
    }
  }, [location.state]);

  const currentLanguage = LANGUAGES.find(l => l.code === bookData.language);
  const currentTone = TONES.find(t => t.id === bookData.tone);

  const toTitleCase = (str: string) => str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  const handleGenerate = () => {
    if (!bookData.prompt.trim()) { toast({ title: "Please describe your topic", variant: "destructive" }); return; }
    setIsGenerating(true);
    setGenerationProgress(0);
    const topic = toTitleCase(bookData.prompt.trim());
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setTitleSuggestions([
            `The Complete Guide to ${topic}`,
            `Mastering ${topic}: The Definitive Framework`,
            `${topic} Unleashed: The Bold Playbook`,
            `The ${topic} Blueprint`,
            `${topic} Made Simple: A Beginner's Guide`,
            `Advanced ${topic} Techniques`,
            `The Art of ${topic}: A Creative Strategy`,
            `${topic}: From Zero to Hero`,
            `The Ultimate ${topic} Reference Handbook`,
            `${topic} 101: Getting Started`,
          ]);
          setChapterSequence([
            { id: "ch-1", title: "Introduction", description: `An introduction to ${topic}.`, topics: ["Overview", "Why This Matters"], includeImages: true, pageCount: 5 },
            { id: "ch-2", title: "Understanding the Basics", description: `Foundational concepts of ${topic}.`, topics: ["Key Concepts", "Core Principles"], includeImages: true, pageCount: 8 },
            { id: "ch-3", title: "Getting Started", description: `A practical guide to ${topic}.`, topics: ["Setting Up", "First Steps"], includeImages: true, pageCount: 10 },
            { id: "ch-4", title: "Strategies and Techniques", description: `Proven strategies for ${topic}.`, topics: ["Best Practices", "Expert Tips"], includeImages: true, pageCount: 12 },
            { id: "ch-5", title: "Common Challenges", description: `Overcoming obstacles in ${topic}.`, topics: ["Problem Solving", "Troubleshooting"], includeImages: true, pageCount: 8 },
            { id: "ch-6", title: "Advanced Techniques", description: `Advanced knowledge about ${topic}.`, topics: ["Advanced Strategies", "Optimization"], includeImages: true, pageCount: 10 },
            { id: "ch-7", title: "Case Studies", description: `Real-world examples of ${topic}.`, topics: ["Success Stories", "Lessons Learned"], includeImages: true, pageCount: 8 },
            { id: "ch-8", title: "Conclusion", description: `Summary and next steps for ${topic}.`, topics: ["Key Takeaways", "Action Plan"], includeImages: true, pageCount: 5 },
          ]);
          setBookDescription(`A comprehensive guide to ${topic}.`);
          setActiveTab("generate");
          toast({ title: "Title ideas generated!" });
          return 100;
        }
        return Math.min(prev + Math.random() * 20, 100);
      });
    }, 400);
  };

  const handleGenerateBook = () => {
    if (!bookData.selectedTitle) { toast({ title: "Please select a title first", variant: "destructive" }); return; }
    setActiveTab("design");
    setIsGeneratingBook(true);
  };

  const handleGenerationComplete = useCallback(() => {
    setIsGeneratingBook(false);
    toast({ title: "Your book is ready!" });
  }, []);

  const handleAutoPrompt = () => {
    const ideas = [
      "How to build a profitable online business in 2026",
      "The definitive guide to personal finance and investing",
      "Mastering AI tools for creative professionals",
      "Building a remote-first company culture",
      "Digital marketing strategies for small businesses",
    ];
    setBookData(prev => ({ ...prev, prompt: ideas[Math.floor(Math.random() * ideas.length)] }));
    toast({ title: "Idea generated!" });
  };

  return (
    <PageShell>
      <div className={activeTab === "design" ? "px-0 py-0" : "max-w-7xl mx-auto px-6 py-6"}>
        {/* Top bar */}
        <div className={`flex items-center justify-between ${activeTab === "design" ? "px-4 py-3" : "mb-6"}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/ghost-ink")} className="p-2 rounded-lg hover:bg-foreground/[0.05] transition-colors"><ArrowLeft size={20} className="text-foreground" /></button>
            <h1 className="text-xl font-display font-bold text-foreground">
              {activeTab === "design" ? (bookData.selectedTitle || "Untitled Book") : "New eBook"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "design" && (
              <>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors flex items-center gap-1.5"><Share2 size={14} />Share</button>
                <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-colors">Publish</button>
              </>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        {activeTab !== "design" && (
        <div className="flex items-center gap-1 mb-8 bg-foreground/[0.03] rounded-xl p-1 w-fit">
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.id;
            const tabIndex = TABS.findIndex(t => t.id === activeTab);
            const isCompleted = (tab.id === "idea" && tabIndex > 0) || (tab.id === "generate" && tabIndex > 1);
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-background shadow-sm text-foreground" : isCompleted ? "text-accent" : "text-muted hover:text-foreground"}`}>
                {isCompleted ? <Check size={16} className="text-accent" /> : <tab.icon className="w-4 h-4" />}
                {tab.label}
                {i < TABS.length - 1 && <ChevronDown size={12} className="ml-1 rotate-[-90deg] text-muted/40" />}
              </button>
            );
          })}
        </div>
        )}

        {/* === IDEA TAB === */}
        {activeTab === "idea" && (
          <div className="max-w-3xl mx-auto">
            {/* Content type selector */}
            {!contentTypeSelected && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">What do you want to create?</h2>
                <div className="grid grid-cols-3 gap-4">
                  {CONTENT_TYPES.map(ct => (
                    <button key={ct.id} onClick={() => { setBookData(prev => ({ ...prev, contentType: ct.id as any })); setContentTypeSelected(true); }}
                      className={`p-6 rounded-2xl border-2 transition-all text-center ${bookData.contentType === ct.id ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                      <ct.icon className={`w-8 h-8 mx-auto mb-3 ${bookData.contentType === ct.id ? "text-accent" : "text-muted"}`} />
                      <span className="font-semibold text-foreground">{ct.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {contentTypeSelected && (
              <>
                {/* Source selector */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">Source</label>
                  <div className="flex gap-2">
                    {SOURCE_OPTIONS.map(s => (
                      <button key={s.id} onClick={() => setBookData(prev => ({ ...prev, sourceType: s.id as any }))}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${bookData.sourceType === s.id ? "bg-accent/10 text-accent border border-accent/30" : "bg-foreground/[0.04] text-muted hover:text-foreground border border-transparent"}`}>
                        <s.icon size={16} />{s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">Describe your topic or niche</label>
                    <button onClick={handleAutoPrompt} disabled={isEnhancingPrompt} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium">
                      {isEnhancingPrompt ? <Loader2 size={12} className="animate-spin" /> : <Shuffle size={12} />}Auto Prompt
                    </button>
                  </div>
                  <div className="relative">
                    <textarea value={bookData.prompt} onChange={e => setBookData(prev => ({ ...prev, prompt: e.target.value }))} placeholder="e.g., How to build a profitable online business in 2026..."
                      className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-foreground/[0.1] bg-background text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors resize-none text-sm" />
                  </div>
                </div>

                {/* Settings row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Language */}
                  <Popover open={languageOpen} onOpenChange={o => { setLanguageOpen(o); if (!o) setLanguageSearch(""); }}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center justify-between px-4 py-3 rounded-xl border border-foreground/[0.1] bg-background text-sm hover:border-foreground/[0.2] transition-colors">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-muted" />
                          <span>{currentLanguage?.flag} {currentLanguage?.name}</span>
                        </div>
                        <ChevronDown size={14} className="text-muted" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="start">
                      <div className="relative mb-2">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                        <input type="text" value={languageSearch} onChange={e => setLanguageSearch(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.1] bg-background text-xs focus:outline-none" />
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {LANGUAGES.filter(l => l.name.toLowerCase().includes(languageSearch.toLowerCase())).map(l => (
                          <button key={l.code} onClick={() => { setBookData(prev => ({ ...prev, language: l.code })); setLanguageOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${bookData.language === l.code ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04]"}`}>
                            <span>{l.flag}</span>{l.name}{bookData.language === l.code && <Check size={14} className="ml-auto text-accent" />}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Tone */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center justify-between px-4 py-3 rounded-xl border border-foreground/[0.1] bg-background text-sm hover:border-foreground/[0.2] transition-colors">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} className="text-muted" />
                          <span>{currentTone?.name}</span>
                        </div>
                        <ChevronDown size={14} className="text-muted" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1.5" align="start">
                      {TONES.map(t => (
                        <button key={t.id} onClick={() => setBookData(prev => ({ ...prev, tone: t.id }))}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${bookData.tone === t.id ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04]"}`}>
                          <t.icon size={14} />{t.name}{bookData.tone === t.id && <Check size={12} className="ml-auto" />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  {/* Chapters */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center justify-between px-4 py-3 rounded-xl border border-foreground/[0.1] bg-background text-sm hover:border-foreground/[0.2] transition-colors">
                        <div className="flex items-center gap-2">
                          <Layers size={16} className="text-muted" />
                          <span>{bookData.chapters} Chapters</span>
                        </div>
                        <ChevronDown size={14} className="text-muted" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1.5" align="start">
                      {[4, 6, 8, 10, 12, 15, 20].map(n => (
                        <button key={n} onClick={() => setBookData(prev => ({ ...prev, chapters: n }))}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${bookData.chapters === n ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04]"}`}>
                          {n} chapters{bookData.chapters === n && <Check size={12} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  {/* Model */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center justify-between px-4 py-3 rounded-xl border border-foreground/[0.1] bg-background text-sm hover:border-foreground/[0.2] transition-colors">
                        <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-muted" />
                          <span>{AI_MODELS.find(m => m.id === bookData.model)?.name}</span>
                        </div>
                        <ChevronDown size={14} className="text-muted" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-1.5" align="start">
                      {AI_MODELS.map(m => (
                        <button key={m.id} onClick={() => setBookData(prev => ({ ...prev, model: m.id }))}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${bookData.model === m.id ? "bg-accent/10" : "hover:bg-foreground/[0.04]"}`}>
                          <div><p className={`text-sm font-semibold ${bookData.model === m.id ? "text-accent" : "text-foreground"}`}>{m.name}</p><p className="text-xs text-muted">{m.description}</p></div>
                          {bookData.model === m.id && <Check size={14} className="text-accent shrink-0" />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Generate button */}
                <button id="ghost-ink-generate-btn" onClick={handleGenerate} disabled={isGenerating || !bookData.prompt.trim()}
                  className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isGenerating ? <><Loader2 size={18} className="animate-spin" />Generating Ideas ({Math.round(generationProgress)}%)...</> : <><Sparkles size={18} />Generate Title Ideas</>}
                </button>
              </>
            )}
          </div>
        )}

        {/* === GENERATE TAB === */}
        {activeTab === "generate" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-2">Select a title for your eBook</h2>
            <p className="text-sm text-muted mb-6">Choose from the AI-generated suggestions or write your own.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {titleSuggestions.map((title, i) => (
                <button key={i} onClick={() => setBookData(prev => ({ ...prev, selectedTitle: title }))}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${bookData.selectedTitle === title ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-foreground/[0.15]"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${bookData.selectedTitle === title ? "bg-accent text-white" : "bg-foreground/[0.06] text-muted"}`}>
                      {bookData.selectedTitle === title ? <Check size={14} /> : i + 1}
                    </div>
                    <span className={`text-sm font-medium ${bookData.selectedTitle === title ? "text-accent" : "text-foreground"}`}>{title}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Chapter outline */}
            {chapterSequence.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-3">Chapter Outline ({chapterSequence.length} chapters)</h3>
                <div className="border border-foreground/[0.08] rounded-xl divide-y divide-foreground/[0.06]">
                  {chapterSequence.map((ch, i) => (
                    <div key={ch.id} className="flex items-start gap-3 p-4">
                      <span className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{ch.title}</p>
                        <p className="text-xs text-muted mt-0.5">{ch.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {ch.topics.map(t => <span key={t} className="px-2 py-0.5 bg-foreground/[0.04] text-muted text-xs rounded-full">{t}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setTitleSuggestions([]); setActiveTab("idea"); }} className="flex-1 py-3 rounded-xl border border-foreground/[0.1] text-sm font-medium hover:bg-foreground/[0.04] transition-colors flex items-center justify-center gap-2">
                <RefreshCw size={16} />Regenerate
              </button>
              <button onClick={handleGenerateBook} disabled={!bookData.selectedTitle}
                className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Sparkles size={16} />Generate eBook<ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* === DESIGN TAB === */}
        {activeTab === "design" && (
          <div className="relative">
            {/* Canvas toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/[0.04] bg-background">
              <div className="flex items-center gap-2">
                <Tooltip><TooltipTrigger asChild><button className="p-2 rounded-lg hover:bg-foreground/[0.05] text-muted"><Undo2 size={16} /></button></TooltipTrigger><TooltipContent>Undo</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><button className="p-2 rounded-lg hover:bg-foreground/[0.05] text-muted"><Redo2 size={16} /></button></TooltipTrigger><TooltipContent>Redo</TooltipContent></Tooltip>
                <div className="w-px h-5 bg-foreground/[0.08] mx-1" />
                <Tooltip><TooltipTrigger asChild><button onClick={() => setZoom(z => Math.max(z - 10, 25))} className="p-2 rounded-lg hover:bg-foreground/[0.05] text-muted"><ZoomOut size={16} /></button></TooltipTrigger><TooltipContent>Zoom Out</TooltipContent></Tooltip>
                <span className="text-xs text-muted font-medium w-10 text-center">{zoom}%</span>
                <Tooltip><TooltipTrigger asChild><button onClick={() => setZoom(z => Math.min(z + 10, 200))} className="p-2 rounded-lg hover:bg-foreground/[0.05] text-muted"><ZoomIn size={16} /></button></TooltipTrigger><TooltipContent>Zoom In</TooltipContent></Tooltip>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <Cloud size={14} />
                <span>Auto-saved</span>
              </div>
            </div>

            {/* Canvas area */}
            <div className="flex" style={{ height: "calc(100vh - 160px)" }}>
              {/* Pages sidebar */}
              <div className="w-56 border-r border-foreground/[0.04] bg-background overflow-y-auto p-3">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-2">Pages</h3>
                <div className="space-y-2">
                  {ebookPages.filter(p => p.type !== "chapter-page").map((page, i) => (
                    <button key={page.id} onClick={() => setSelectedPageId(page.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all ${selectedPageId === page.id ? "bg-accent/10 border border-accent/30" : "hover:bg-foreground/[0.04] border border-transparent"}`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${selectedPageId === page.id ? "bg-accent text-white" : "bg-foreground/[0.06] text-muted"}`}>{i + 1}</span>
                        <span className={`text-xs font-medium truncate ${selectedPageId === page.id ? "text-accent" : "text-foreground"}`}>{page.title}</span>
                      </div>
                    </button>
                  ))}
                  <button className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-foreground/[0.1] rounded-xl text-xs text-muted hover:border-accent/40 hover:text-accent transition-colors">
                    <Plus size={14} />Add Page
                  </button>
                </div>
              </div>

              {/* Canvas preview */}
              <div className="flex-1 bg-foreground/[0.03] flex items-center justify-center overflow-auto p-8">
                <div className="bg-white rounded-lg shadow-2xl border border-foreground/[0.06]" style={{ width: `${340 * zoom / 100}px`, height: `${480 * zoom / 100}px`, transform: `scale(1)` }}>
                  {/* Simulated page content */}
                  {(() => {
                    const page = ebookPages.find(p => p.id === selectedPageId) || ebookPages[0];
                    if (page.type === "cover") {
                      return (
                        <div className="w-full h-full relative overflow-hidden rounded-lg">
                          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop" alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-white/95 p-6">
                            <p className="text-[10px] text-accent uppercase tracking-wider font-medium">A Comprehensive Guide</p>
                            <h2 className="text-lg font-bold text-gray-900 mt-1 leading-tight">{bookData.selectedTitle || "Your eBook Title"}</h2>
                          </div>
                        </div>
                      );
                    }
                    if (page.type === "toc") {
                      return (
                        <div className="w-full h-full p-8">
                          <h2 className="text-lg font-bold text-gray-900 mb-1">Table of Contents</h2>
                          <div className="w-16 h-0.5 bg-accent mb-6" />
                          <div className="space-y-3">
                            {chapterSequence.map((ch, i) => (
                              <div key={ch.id} className="flex items-center text-xs text-gray-600">
                                <span className="font-medium">{String(i + 1).padStart(2, "0")}. {ch.title}</span>
                                <span className="flex-1 border-b border-dotted border-gray-300 mx-2" />
                                <span className="text-gray-400">{i * 5 + 3}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (page.type === "back") {
                      return (
                        <div className="w-full h-full bg-[#0d4f4f] flex flex-col items-center justify-center rounded-lg text-center p-8">
                          <h2 className="text-xl font-bold text-white">REAL ART</h2>
                          <p className="text-xs text-gray-300 mt-2">Creative Excellence</p>
                        </div>
                      );
                    }
                    return (
                      <div className="w-full h-full p-8">
                        <div className="w-full h-16 bg-[#0d4f4f] rounded-lg mb-4 flex items-center px-4">
                          <span className="text-2xl font-bold text-white">{String(ebookPages.indexOf(page)).padStart(2, "0")}</span>
                        </div>
                        <h2 className="text-base font-bold text-gray-900 mb-3">{page.title}</h2>
                        <p className="text-xs text-gray-500 leading-relaxed">This section provides a comprehensive overview of our strategic approach, detailing key methodologies and expected outcomes.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Design sidebar */}
              <div className="w-72 border-l border-foreground/[0.04] bg-background overflow-y-auto p-4">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Design</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Templates</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Minimal", "Modern", "Classic", "Bold"].map(t => (
                        <button key={t} className="p-3 rounded-xl border border-foreground/[0.08] hover:border-accent/40 transition-colors text-center">
                          <div className="w-full h-16 bg-foreground/[0.04] rounded-lg mb-2" />
                          <span className="text-xs font-medium text-foreground">{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">Elements</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ label: "Text", icon: FileText }, { label: "Image", icon: Eye }, { label: "Shape", icon: Layers }].map(el => (
                        <button key={el.label} className="p-3 rounded-xl border border-foreground/[0.08] hover:border-accent/40 transition-colors text-center">
                          <el.icon size={20} className="mx-auto mb-1 text-muted" />
                          <span className="text-[10px] font-medium text-muted">{el.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground mb-2 block">AI Tools</label>
                    <button className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors">
                      <Wand2 size={16} className="text-accent" />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-accent">AI Rewrite</p>
                        <p className="text-[10px] text-muted">Improve content with AI</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Generation overlay */}
            <EbookGenerationOverlay isGenerating={isGeneratingBook} bookTitle={bookData.selectedTitle} onComplete={handleGenerationComplete} />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default NewEbookPage;