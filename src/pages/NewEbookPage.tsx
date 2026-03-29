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
  Share2, Lock, Cloud, Copy, Cpu, Shuffle, UserPlus, Download,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import PageShell from "@/components/PageShell";
import EbookGenerationOverlay from "@/components/ebook/EbookGenerationOverlay";
import EbookCanvasEditor from "@/components/ebook/EbookCanvasEditor";
import EbookDesignSidebar from "@/components/ebook/EbookDesignSidebar";
import EbookPagesPanel from "@/components/ebook/EbookPagesPanel";

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
  const [isGridView, setIsGridView] = useState(false);

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

  // For the design tab, we need a full-bleed layout that fills the viewport
  const isDesign = activeTab === "design";

  return (
    <PageShell>
      <div className={isDesign ? "flex flex-col h-[calc(100vh-64px)] -mt-0 overflow-hidden" : "max-w-7xl mx-auto px-6 py-6"}>

        {/* === DESIGN TAB TOP BAR === */}
        {activeTab === "design" && (
          <div className="h-14 bg-foreground/[0.95] flex items-center px-4 gap-3 shrink-0">
            {/* Left: Title + Editing badge + Auto-Saved */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-base font-display font-bold text-background tracking-tight">eBOOK <span className="font-black">STUDIO</span></span>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 bg-accent px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-accent/90 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editing</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start" side="bottom">
                  <p className="text-xs text-muted-foreground font-medium px-2 pb-2">Your Access Level</p>
                  {[
                    { mode: "Editing", desc: "Full Edit Access", icon: Pencil, color: "text-violet-500", dotColor: "bg-violet-500", active: true },
                    { mode: "Viewing", desc: "Read Only", icon: Eye, color: "text-blue-500", dotColor: "bg-blue-500", active: false },
                    { mode: "Commenting", desc: "Comments Only", icon: MessageSquare, color: "text-amber-500", dotColor: "bg-amber-500", active: false },
                    { mode: "Admin", desc: "Full Admin Access", icon: Shield, color: "text-emerald-500", dotColor: "bg-emerald-500", active: false },
                  ].map(item => (
                    <button key={item.mode}
                      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left transition-colors ${item.active ? 'bg-foreground/[0.03]' : 'hover:bg-foreground/[0.04]'}`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotColor}`} />
                      <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.mode}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      {item.active && <Check className={`w-4 h-4 shrink-0 ${item.color}`} />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Auto-Saved</span>
              </div>
            </div>

            {/* Center: Step Tabs */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-6">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const tabIndex = TABS.findIndex(t => t.id === activeTab);
                  const isCompleted = (tab.id === "idea" && tabIndex > 0) || (tab.id === "generate" && tabIndex > 1);
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive ? "text-background" : isCompleted ? "text-accent" : "text-background/40 hover:text-background/70"}`}>
                      {isCompleted ? <Check size={14} className="text-accent" /> : <tab.icon className="w-4 h-4" />}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Collaborators + Actions */}
            <div className="flex items-center gap-2.5 ml-auto shrink-0">
              <div className="flex items-center -space-x-2">
                {["photo-1494790108377-be9c29b29330", "photo-1507003211169-0a1dd7228f2d", "photo-1534528741775-53994a69daeb"].map((id, i) => (
                  <img key={i} src={`https://images.unsplash.com/${id}?w=32&h=32&fit=crop`} alt="" className="w-7 h-7 rounded-full border-2 border-foreground object-cover" />
                ))}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background/10 hover:bg-background/15 rounded-lg text-xs text-background font-medium transition-colors">
                <UserPlus className="w-3.5 h-3.5" />Invite
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 rounded-lg text-xs text-white font-semibold transition-colors">
                <Sparkles className="w-3.5 h-3.5" />Create
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background/10 hover:bg-background/15 rounded-lg text-xs text-background font-medium transition-colors">
                <Share2 className="w-3.5 h-3.5" />Share
              </button>
            </div>
          </div>
        )}

        {/* === DESIGN SUB-BAR: Back + Project Name + Canvas Tools === */}
        {activeTab === "design" && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/[0.04] bg-background">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/ghost-ink")} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
                <ArrowLeft size={16} />Back To Projects
              </button>
              <div className="w-px h-5 bg-foreground/[0.08]" />
              <span className="text-sm text-muted-foreground">Project Name:</span>
              <input
                value={bookData.selectedTitle || "Untitled Book"}
                onChange={e => setBookData(prev => ({ ...prev, selectedTitle: e.target.value }))}
                className="text-sm font-medium text-foreground bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><Undo2 size={15} /></button></TooltipTrigger><TooltipContent>Undo</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><Redo2 size={15} /></button></TooltipTrigger><TooltipContent>Redo</TooltipContent></Tooltip>
              <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><Search size={15} /></button></TooltipTrigger><TooltipContent>Find</TooltipContent></Tooltip>
              <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />
              <Tooltip><TooltipTrigger asChild><button onClick={() => setZoom(z => Math.max(z - 10, 25))} className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><ZoomOut size={15} /></button></TooltipTrigger><TooltipContent>Zoom Out</TooltipContent></Tooltip>
              <span className="text-xs text-muted font-medium w-10 text-center">{zoom}%</span>
              <Tooltip><TooltipTrigger asChild><button onClick={() => setZoom(z => Math.min(z + 10, 200))} className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><ZoomIn size={15} /></button></TooltipTrigger><TooltipContent>Zoom In</TooltipContent></Tooltip>
            </div>
          </div>
        )}

        {/* Non-design top bar */}
        {activeTab !== "design" && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/ghost-ink")} className="p-2 rounded-lg hover:bg-foreground/[0.05] transition-colors"><ArrowLeft size={20} className="text-foreground" /></button>
              <h1 className="text-xl font-display font-bold text-foreground">New eBook</h1>
            </div>
          </div>
        )}

        {/* Tab navigation (non-design) */}
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
          <div className="relative flex-1 min-h-0">
            <div className="flex h-full">
              {/* LEFT: Design Sidebar (Templates, Content outline) */}
              <EbookDesignSidebar
                bookTitle={bookData.selectedTitle}
                chapters={ebookPages.map(p => ({ id: p.id, title: p.title }))}
                selectedChapterId={selectedPageId}
                onChapterSelect={setSelectedPageId}
                onChapterAdd={() => {
                  const newPage = { id: crypto.randomUUID(), title: "New Page", type: "chapter" as const };
                  setEbookPages(prev => [...prev, newPage]);
                  setSelectedPageId(newPage.id);
                }}
                onChapterTitleEdit={(id, title) => setEbookPages(prev => prev.map(p => p.id === id ? { ...p, title } : p))}
                onChapterDelete={id => {
                  if (ebookPages.length <= 1) return;
                  setEbookPages(prev => prev.filter(p => p.id !== id));
                  if (selectedPageId === id) setSelectedPageId(ebookPages[0]?.id || null);
                }}
                onChapterReorder={(from, to) => {
                  setEbookPages(prev => {
                    const arr = [...prev];
                    const [moved] = arr.splice(from, 1);
                    arr.splice(to, 0, moved);
                    return arr;
                  });
                }}
              />
              {/* CENTER: Canvas Editor (no pages panel - it's on the right) */}
              <EbookCanvasEditor
                pages={ebookPages}
                selectedPageId={selectedPageId}
                onPageSelect={setSelectedPageId}
                onPagesChange={setEbookPages}
                bookTitle={bookData.selectedTitle}
                showPagesPanel={false}
                zoom={zoom}
                onZoomChange={setZoom}
              />
              {/* RIGHT: Pages Panel */}
              <EbookPagesPanel
                pages={ebookPages}
                selectedPageId={selectedPageId}
                onPageSelect={setSelectedPageId}
                onPagesChange={setEbookPages}
              />
            </div>
            <EbookGenerationOverlay isGenerating={isGeneratingBook} bookTitle={bookData.selectedTitle} onComplete={handleGenerationComplete} />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default NewEbookPage;