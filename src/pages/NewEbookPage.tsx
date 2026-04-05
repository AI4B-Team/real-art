import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useEbooks } from "@/contexts/EbookContext";
import {
  Upload, Mic, Sparkles, ArrowLeft, BookOpen, Headphones, Presentation,
  Lightbulb, Palette, Send, Globe, MessageSquare,
  Bot, Link2, FileText, X, Plus, Layers,
  Briefcase, Coffee, GraduationCap, Heart, Shield, Flame, Search, ChevronDown,
  Check, Pencil, Eye, Loader2, Wand2, RefreshCw,
  ArrowRight, Target, Zap, Undo2, Redo2, ZoomIn, ZoomOut, Minus,
  Share2, Lock, Cloud, Copy, Cpu, ArrowRightLeft, UserPlus, Download, Settings, MoreVertical, Shuffle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import PageShell from "@/components/PageShell";
import EbookGenerationOverlay from "@/components/ebook/EbookGenerationOverlay";
import EbookCanvasEditor, { type EbookCanvasEditorHandle } from "@/components/ebook/EbookCanvasEditor";
import EbookDesignSidebar from "@/components/ebook/EbookDesignSidebar";
import EbookShareModal from "@/components/ebook/EbookShareModal";
import EbookInviteModal from "@/components/ebook/EbookInviteModal";
import PageSettingsPanel from "@/components/ebook/PageSettingsPanel";

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

  // Persist current ebook editor URL so we can return to it
  useEffect(() => {
    sessionStorage.setItem("ebook-last-url", location.pathname + location.search);
  }, [location.pathname, location.search, activeTab]);

  // Also update when tab changes (since tab is local state, not always in URL)
  useEffect(() => {
    const url = `${location.pathname}?tab=${activeTab}`;
    sessionStorage.setItem("ebook-last-url", url);
  }, [activeTab, location.pathname]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [isGeneratingBook, setIsGeneratingBook] = useState(false);
  const [chapterSequence, setChapterSequence] = useState<ChapterData[]>([]);
  const [bookDescription, setBookDescription] = useState("");
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSourceCards, setShowSourceCards] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [attachedSources, setAttachedSources] = useState<{ id: string; type: "file" | "link" | "audio"; label: string }[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [accessMode, setAccessMode] = useState<'editing' | 'viewing' | 'commenting' | 'admin'>('editing');

  const addSource = useCallback((type: "file" | "link" | "audio", label: string) => {
    setAttachedSources(prev => [...prev, { id: `src-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, type, label }]);
  }, []);

  const removeSource = useCallback((id: string) => {
    setAttachedSources(prev => prev.filter(s => s.id !== id));
  }, []);

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
  type PageType = "cover" | "toc" | "chapter" | "chapter-page" | "back" | "blank";
  interface UnifiedPage { id: string; title: string; type: PageType; locked?: boolean; }

  const getDefaultPages = (): UnifiedPage[] => [
    { id: "1", title: "Cover", type: "cover" },
    { id: "2", title: "Table of Contents", type: "toc" },
    { id: "3", title: "Introduction", type: "chapter" },
    { id: "4", title: "Content Page", type: "chapter-page" },
    { id: "5", title: "Executive Summary", type: "chapter" },
    { id: "6", title: "Content Page", type: "chapter-page" },
    { id: "7", title: "Market Analysis", type: "chapter" },
    { id: "8", title: "Content Page", type: "chapter-page" },
    { id: "9", title: "Back Cover", type: "back" },
  ];

  const STORAGE_KEY_PAGES = "ebook_pages_data";
  const STORAGE_KEY_ELEMENTS = "ebook_elements_data";

  const [ebookPages, setEbookPages] = useState<UnifiedPage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultPages();
  });

  const [savedPageElements, setSavedPageElements] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ELEMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Persist pages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(ebookPages));
  }, [ebookPages]);

  // Callback when canvas elements change
  const handlePageElementsChange = useCallback((elements: Record<string, any[]>) => {
    setSavedPageElements(elements);
    localStorage.setItem(STORAGE_KEY_ELEMENTS, JSON.stringify(elements));
    setLastSaved(new Date());
  }, []);

  const [selectedPageId, setSelectedPageId] = useState<string | null>("1");
  const [zoom, setZoom] = useState(100);
  const [isGridView, setIsGridView] = useState(false);
  const [findReplaceMode, setFindReplaceMode] = useState<'find' | 'find-replace' | null>(null);
  const [showPageSettings, setShowPageSettings] = useState(true);
  const [manualPageSettings, setManualPageSettings] = useState(false);
  const [sidebarOpenSection, setSidebarOpenSection] = useState<string | null>(null);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [pageWidth, setPageWidth] = useState(480);
  const [pageHeight, setPageHeight] = useState(640);
  const canvasRef = useRef<EbookCanvasEditorHandle>(null);
  const [isReplacingImage, setIsReplacingImage] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // Sections that should keep the Page Settings panel visible
  const PAGE_SETTINGS_SECTIONS = new Set(['content', 'templates']);

  const handleSidebarSectionChange = useCallback((sections: Set<string>) => {
    const shouldShow = Array.from(sections).some(s => PAGE_SETTINGS_SECTIONS.has(s));
    if (shouldShow) {
      setManualPageSettings(false);
    }
    if (!manualPageSettings) {
      setShowPageSettings(shouldShow);
    }
  }, [manualPageSettings]);

  // ⌘H / Ctrl+H shortcut for Find & Replace
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setFindReplaceMode(prev => prev === 'find-replace' ? null : 'find-replace');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && activeTab === 'design') {
        e.preventDefault();
        setFindReplaceMode(prev => prev === 'find' ? null : 'find');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab]);

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

  const handleGenerate = async () => {
    if (!bookData.prompt.trim()) { toast({ title: "Please describe your topic", variant: "destructive" }); return; }
    setIsGenerating(true);
    setGenerationProgress(0);

    // Animate progress bar while waiting
    const interval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 8, 90));
    }, 600);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ebook', {
        body: {
          action: 'generate-outline',
          prompt: bookData.prompt.trim(),
          model: bookData.model,
          language: bookData.language,
          tone: bookData.tone,
          chapters: bookData.chapters,
          wordsPerChapter: bookData.wordsPerChapter,
        },
      });

      clearInterval(interval);

      if (error) throw new Error(error.message || 'Generation failed');
      if (data?.error) throw new Error(data.error);

      const result = data.result;
      setTitleSuggestions(result.titles || []);
      setBookDescription(result.description || '');
      setChapterSequence(
        (result.chapters || []).map((ch: any, i: number) => ({
          id: `ch-${i + 1}`,
          title: ch.title,
          description: ch.description,
          topics: ch.topics || [],
          includeImages: true,
          pageCount: ch.pageCount || 8,
        }))
      );
      setGenerationProgress(100);
      setActiveTab("generate");
      toast({ title: "AI-powered outline generated!" });
    } catch (e: any) {
      clearInterval(interval);
      console.error('Generate outline error:', e);
      toast({ title: e.message || "Generation failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBook = async () => {
    if (!bookData.selectedTitle) { toast({ title: "Please select a title first", variant: "destructive" }); return; }
    setActiveTab("design");
    setIsGeneratingBook(true);

    // Generate full book content with AI
    try {
      const { data, error } = await supabase.functions.invoke('generate-ebook', {
        body: {
          action: 'generate-full-book',
          prompt: bookData.prompt.trim(),
          title: bookData.selectedTitle,
          model: bookData.model,
          language: bookData.language,
          tone: bookData.tone,
          chapters: bookData.chapters,
          wordsPerChapter: bookData.wordsPerChapter,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const result = data.result;
      if (result?.chapters) {
        // Build pages from AI-generated content
        const newPages: { id: string; title: string; type: PageType }[] = [
          { id: "1", title: bookData.selectedTitle, type: "cover" },
          { id: "2", title: "Table of Contents", type: "toc" },
        ];
        // Track which page IDs map to which AI content
        const contentMap: { pageId: string; content: string }[] = [];
        let pageId = 3;
        for (const chapter of result.chapters) {
          newPages.push({ id: String(pageId++), title: chapter.title, type: "chapter" });
          for (const page of chapter.pages || []) {
            const pid = String(pageId++);
            newPages.push({ id: pid, title: page.title || "Content Page", type: "chapter-page" });
            if (page.content) {
              contentMap.push({ pageId: pid, content: page.content });
            }
          }
        }
        newPages.push({ id: String(pageId), title: "Back Cover", type: "back" });
        setEbookPages(newPages);

        // Populate each page with AI-generated text after canvas renders
        setTimeout(() => {
          if (canvasRef.current) {
            for (const { pageId: pid, content } of contentMap) {
              canvasRef.current.setPageContent(pid, content);
            }
          }
        }, 800);
      }
      toast({ title: "Your AI-written book is ready!" });
    } catch (e: any) {
      console.error('Generate book error:', e);
      toast({ title: e.message || "Book generation failed. The outline is still available.", variant: "destructive" });
    } finally {
      setIsGeneratingBook(false);
    }
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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      recorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); };
    } catch { toast({ title: "Microphone access denied", variant: "destructive" }); }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setShowRecordModal(false);
    addSource("audio", "Voice Recording");
    toast({ title: "Recording saved! You can now generate your eBook." });
  };

  // For the design tab, we need a full-bleed layout that fills the viewport
  const isDesign = activeTab === "design";

  return (
    <PageShell>
      <div className={isDesign ? "flex flex-col h-[calc(100vh-64px)] -mt-0 overflow-hidden" : "max-w-7xl mx-auto px-6 py-6"}>

        {/* === DESIGN TAB TOP BAR === */}
        {activeTab === "design" && (
          <div className="relative h-14 bg-foreground/[0.95] flex items-center px-4 gap-3 shrink-0">
            {/* Left: Title + Editing badge + Auto-Saved */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-base font-display font-bold text-background tracking-tight">eBOOK <span className="font-black">STUDIO</span></span>

              <Popover>
                <PopoverTrigger asChild>
                  <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors ${
                    accessMode === 'editing' ? 'bg-violet-500' :
                    accessMode === 'viewing' ? 'bg-blue-500' :
                    accessMode === 'commenting' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}>
                    {accessMode === 'editing' && <Pencil className="w-3.5 h-3.5" />}
                    {accessMode === 'viewing' && <Eye className="w-3.5 h-3.5" />}
                    {accessMode === 'commenting' && <MessageSquare className="w-3.5 h-3.5" />}
                    {accessMode === 'admin' && <Shield className="w-3.5 h-3.5" />}
                    <span className="capitalize">{accessMode}</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start" side="bottom">
                  <p className="text-xs text-muted-foreground font-medium px-2 pb-2">Your Access Level</p>
                  {([
                    { mode: "editing" as const, label: "Editing", desc: "Full Edit Access", icon: Pencil, color: "text-violet-500", dotColor: "bg-violet-500" },
                    { mode: "viewing" as const, label: "Viewing", desc: "Read Only", icon: Eye, color: "text-blue-500", dotColor: "bg-blue-500" },
                    { mode: "commenting" as const, label: "Commenting", desc: "Comments Only", icon: MessageSquare, color: "text-amber-500", dotColor: "bg-amber-500" },
                    { mode: "admin" as const, label: "Admin", desc: "Full Admin Access", icon: Shield, color: "text-emerald-500", dotColor: "bg-emerald-500" },
                  ]).map(item => (
                    <button key={item.mode} onClick={() => setAccessMode(item.mode)}
                      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left transition-colors ${accessMode === item.mode ? 'bg-foreground/[0.03]' : 'hover:bg-foreground/[0.04]'}`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotColor}`} />
                      <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      {accessMode === item.mode && <Check className={`w-4 h-4 shrink-0 ${item.color}`} />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <div className="relative group">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => { setLastSaved(new Date()); toast({ title: "Project saved!" }); }}
                      className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-lg hover:bg-emerald-500/30 transition-colors">
                      <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Auto-Saved</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs z-[9999]">
                    Save Project
                  </TooltipContent>
                </Tooltip>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-md bg-popover text-popover-foreground text-xs shadow-md border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[9999]">
                  Click To Save (Last Saved: {lastSaved.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} // {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                </div>
              </div>
            </div>

            {/* Center: Step Tabs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-6 pointer-events-auto">
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
              {(() => {
                const avatars = ["photo-1494790108377-be9c29b29330", "photo-1507003211169-0a1dd7228f2d", "photo-1534528741775-53994a69daeb", "photo-1438761681033-6461ffad8d80", "photo-1472099645785-5658abf4ff4e"];
                const maxShow = 2;
                const extra = avatars.length - maxShow;
                return (
                  <div className="flex items-center -space-x-2">
                    {avatars.slice(0, maxShow).map((id, i) => (
                      <img key={i} src={`https://images.unsplash.com/${id}?w=32&h=32&fit=crop`} alt="" className="w-7 h-7 rounded-full border-2 border-foreground object-cover" />
                    ))}
                    {extra > 0 && (
                      <div className="w-7 h-7 rounded-full border-2 border-foreground bg-accent flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">+{extra}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
              <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-background/10 hover:bg-background/15 rounded-lg text-xs text-background font-medium transition-colors">
                <UserPlus className="w-3.5 h-3.5" />Invite
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 rounded-lg text-xs text-white font-semibold transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />Create<ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1.5" align="end" sideOffset={6}>
                  {[
                    { id: 'audiobook' as const, label: 'AudioBook', icon: Headphones },
                    { id: 'presentation' as const, label: 'Video Presentation', icon: Presentation },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => {
                        setBookData(prev => ({ ...prev, contentType: opt.id }));
                        setContentTypeSelected(true);
                        if (activeTab === 'design') {
                          toast({ title: `Switched to ${opt.label} mode` });
                        } else {
                          setActiveTab('idea');
                          toast({ title: `Creating ${opt.label}`, description: 'Enter your prompt to get started' });
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        bookData.contentType === opt.id ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'
                      }`}>
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                      {bookData.contentType === opt.id && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <button onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-background/10 hover:bg-background/15 rounded-lg text-xs text-background font-medium transition-colors">
                <Share2 className="w-3.5 h-3.5" />Share
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-background/15 text-background/70 hover:text-background transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-1.5 z-[10050]" align="end" side="bottom">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Book Settings</p>
                  <button onClick={() => { setManualPageSettings(true); setShowPageSettings(prev => !prev); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] transition-colors">
                    <Settings className="w-4 h-4 text-muted-foreground" />Page Settings
                  </button>
                  <button onClick={() => {
                    const el = document.createElement('a');
                    el.download = `${bookData.selectedTitle || 'Untitled Book'}.json`;
                    el.href = URL.createObjectURL(new Blob([JSON.stringify(bookData, null, 2)], { type: 'application/json' }));
                    el.click();
                    sonnerToast.success('Book data exported');
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] transition-colors">
                    <Download className="w-4 h-4 text-muted-foreground" />Export Book Data
                  </button>
                  <button onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    sonnerToast.success('Link copied to clipboard');
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground" />Copy Project Link
                  </button>
                  <button onClick={() => sonnerToast.success('Version history coming soon')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] transition-colors">
                    <Undo2 className="w-4 h-4 text-muted-foreground" />Version History
                  </button>
                  <div className="my-1 border-t border-foreground/[0.06]" />
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">View</p>
                  <button onClick={() => { setManualPageSettings(true); setShowPageSettings(prev => !prev); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] transition-colors">
                    <Eye className="w-4 h-4 text-muted-foreground" />Toggle Page Settings
                  </button>
                  <button onClick={() => sonnerToast.success('Grid view toggled')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] transition-colors">
                    <Layers className="w-4 h-4 text-muted-foreground" />Grid View
                  </button>
                  <div className="my-1 border-t border-foreground/[0.06]" />
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Danger Zone</p>
                  <button onClick={() => {
                    if (confirm('Are you sure you want to reset all pages? This cannot be undone.')) {
                      sonnerToast.success('Book reset');
                      navigate('/ebook-creator/new');
                    }
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    <X className="w-4 h-4" />Reset Book
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* === DESIGN SUB-BAR: Back + Project Name + Canvas Tools === */}
        {activeTab === "design" && (
          <div className="relative flex items-center px-4 py-2 border-b border-foreground/[0.04] bg-background">
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => navigate("/ghost-ink")} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
                <ArrowLeft size={16} />Back To Projects
              </button>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="text-sm text-muted-foreground">Project Name:</span>
                <input
                  value={bookData.selectedTitle || "Untitled Book"}
                  onChange={e => setBookData(prev => ({ ...prev, selectedTitle: e.target.value }))}
                  className="text-sm font-medium text-foreground bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><Undo2 size={15} /></button></TooltipTrigger><TooltipContent>Undo</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><Redo2 size={15} /></button></TooltipTrigger><TooltipContent>Redo</TooltipContent></Tooltip>
              <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />
              <Tooltip><TooltipTrigger asChild><button onClick={() => setFindReplaceMode(prev => prev === 'find' ? null : 'find')} className={`p-1.5 rounded-lg hover:bg-foreground/[0.05] ${findReplaceMode === 'find' ? 'text-accent bg-accent/10' : 'text-muted'}`}><Search size={15} /></button></TooltipTrigger><TooltipContent>Find</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button onClick={() => setFindReplaceMode(prev => prev === 'find-replace' ? null : 'find-replace')} className={`p-1.5 rounded-lg hover:bg-foreground/[0.05] ${findReplaceMode === 'find-replace' ? 'text-accent bg-accent/10' : 'text-muted'}`}><ArrowRightLeft size={15} /></button></TooltipTrigger><TooltipContent>Find &amp; Replace (⌘H)</TooltipContent></Tooltip>
              <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />
               <Tooltip><TooltipTrigger asChild><button onClick={() => setZoom(z => Math.max(z - 10, 25))} className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><Minus size={15} /></button></TooltipTrigger><TooltipContent>Zoom Out</TooltipContent></Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-muted font-medium hover:bg-foreground/[0.05] rounded px-2 py-1 transition-colors">
                    {zoom}%<ChevronDown size={11} className="opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-28 p-1" align="center" side="bottom">
                  {[25, 50, 75, 100, 125, 150, 175, 200].map(v => (
                    <button key={v} onClick={() => setZoom(v)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${zoom === v ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                      {v}%
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <Tooltip><TooltipTrigger asChild><button onClick={() => setZoom(z => Math.min(z + 10, 200))} className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted"><Plus size={15} /></button></TooltipTrigger><TooltipContent>Zoom In</TooltipContent></Tooltip>
            </div>
          </div>
        )}

        {/* Non-design top bar */}
        {activeTab !== "design" && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/ghost-ink")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={16} />Back To Projects</button>
            </div>
          </div>
        )}

        {/* Generation progress bar */}
        {isGenerating && activeTab === "idea" && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl border border-foreground/[0.08] bg-background">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Generating Title Ideas...</p>
                <p className="text-xs text-muted-foreground">{Math.round(generationProgress)}% complete</p>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${generationProgress}%` }} />
            </div>
          </div>
        )}

        {/* === IDEA TAB === */}
        {activeTab === "idea" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">What Would You Like To Create?</h2>

            {/* Prompt box */}
            <div className="rounded-2xl border-2 border-accent/30 bg-background p-1 mb-6">
              <div className="flex items-start gap-2 px-3 py-3">
                <button onClick={handleAutoPrompt} className="mt-1 text-emerald-500 hover:text-emerald-400 shrink-0"><Shuffle size={18} /></button>
                <div className="flex-1 min-w-0">
                  {/* Attached source pills */}
                  {attachedSources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {attachedSources.map(src => (
                        <span key={src.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          src.type === "file" ? "bg-accent/10 text-accent" :
                          src.type === "link" ? "bg-accent/10 text-accent" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {src.type === "file" && <Upload size={11} />}
                          {src.type === "link" && <Link2 size={11} />}
                          {src.type === "audio" && <Mic size={11} />}
                          {src.label}
                          <button onClick={() => removeSource(src.id)} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={bookData.prompt}
                    onChange={e => setBookData(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="What is your topic or niche? (e.g., digital marketing for small business)"
                    className="w-full min-h-[60px] bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none text-sm"
                  />
                </div>
              </div>

              {/* Toolbar chips */}
              <div className="flex items-center gap-2 px-3 pb-3 flex-wrap">
                {/* Source */}
                <button onClick={() => setShowSourceCards(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showSourceCards ? "bg-accent text-white" : "bg-accent/10 text-accent hover:bg-accent/15"}`}>
                  <Mic size={13} />Source: {SOURCE_OPTIONS.find(s => s.id === bookData.sourceType)?.label}
                  <ChevronDown size={11} className={`transition-transform ${showSourceCards ? "rotate-180" : ""}`} />
                </button>

                {/* Type */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.05] text-foreground text-xs font-medium hover:bg-foreground/[0.08] transition-colors">
                      <Cpu size={13} />Type
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1.5" align="start">
                    {CONTENT_TYPES.map(ct => (
                      <button key={ct.id} onClick={() => setBookData(prev => ({ ...prev, contentType: ct.id as any }))}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${bookData.contentType === ct.id ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04]"}`}>
                        <ct.icon size={14} />{ct.label}{bookData.contentType === ct.id && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Model */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.05] text-foreground text-xs font-medium hover:bg-foreground/[0.08] transition-colors">
                      <Cpu size={13} />{AI_MODELS.find(m => m.id === bookData.model)?.name}
                      <ChevronDown size={11} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1.5" align="start">
                    {AI_MODELS.map(m => (
                      <button key={m.id} onClick={() => setBookData(prev => ({ ...prev, model: m.id }))}
                        className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${bookData.model === m.id ? "bg-accent/10" : "hover:bg-foreground/[0.04]"}`}>
                        <div><p className={`text-sm font-semibold ${bookData.model === m.id ? "text-accent" : "text-foreground"}`}>{m.name}</p><p className="text-xs text-muted-foreground">{m.description}</p></div>
                        {bookData.model === m.id && <Check size={14} className="text-accent shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Language */}
                <Popover open={languageOpen} onOpenChange={o => { setLanguageOpen(o); if (!o) setLanguageSearch(""); }}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.05] text-foreground text-xs font-medium hover:bg-foreground/[0.08] transition-colors">
                      <span>{currentLanguage?.flag}</span>{currentLanguage?.name}
                      <ChevronDown size={11} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="relative mb-2">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" value={languageSearch} onChange={e => setLanguageSearch(e.target.value)} placeholder="Search Languages" className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.1] bg-background text-xs focus:outline-none" />
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
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.05] text-foreground text-xs font-medium hover:bg-foreground/[0.08] transition-colors">
                      <MessageSquare size={13} />Tone: {currentTone?.name}
                      <ChevronDown size={11} />
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

                <div className="flex-1" />
                {/* Send button */}
                <button id="ghost-ink-generate-btn" onClick={handleGenerate} disabled={isGenerating || !bookData.prompt.trim()}
                  className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Source cards — shown when Source button is toggled */}
            {showSourceCards && (
            <div className="grid grid-cols-3 gap-4">
              {/* Upload File */}
              <button onClick={() => { fileInputRef.current?.click(); setShowSourceCards(false); }} className="group flex flex-col items-center p-6 rounded-2xl border border-foreground/[0.1] hover:border-foreground/[0.2] bg-background transition-all">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/15 transition-colors">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm font-semibold text-foreground mb-2">Upload File</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/[0.04]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="2" width="18" height="20" rx="2" fill="#E53E3E" /><text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">PDF</text></svg>
                    <span className="text-[10px] font-semibold text-muted-foreground">PDF</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/[0.04]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="2" width="18" height="20" rx="2" fill="#2B6CB0" /><text x="12" y="15" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">DOC</text></svg>
                    <span className="text-[10px] font-semibold text-muted-foreground">DOCX</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/[0.04]">
                    <span className="text-[10px] font-semibold text-muted-foreground">+</span>
                  </div>
                </div>
              </button>

              {/* Insert Link */}
              <button onClick={() => { setShowLinkInput(true); setShowSourceCards(false); }} className="group flex flex-col items-center p-6 rounded-2xl border border-foreground/[0.1] hover:border-foreground/[0.2] bg-background transition-all">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/15 transition-colors">
                  <Link2 className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm font-semibold text-foreground mb-2">Insert Link</span>
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8z" fill="#FF0000"/><path d="M9.75 15.02l6.27-3.02-6.27-3.02v6.04z" fill="#FFF"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24"><path d="M19.3 6.7A4.5 4.5 0 0116 5.1V2h-3v14a3 3 0 11-2-2.8V10a6 6 0 105 5.9V10a7.5 7.5 0 003.3.8V8a4.5 4.5 0 01-1-.3z" fill="currentColor"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)" /><circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="none" /><circle cx="17.5" cy="6.5" r="1.2" fill="white" /><defs><linearGradient id="ig" x1="0" y1="24" x2="24" y2="0"><stop stopColor="#FD5" /><stop offset=".5" stopColor="#FF543E" /><stop offset="1" stopColor="#C837AB" /></linearGradient></defs></svg>
                  <span className="text-[10px] font-semibold text-muted-foreground">+45</span>
                </div>
              </button>

              {/* Audio */}
              <button onClick={() => { setShowRecordModal(true); setShowSourceCards(false); }} className="group flex flex-col items-center p-6 rounded-2xl border border-foreground/[0.1] hover:border-foreground/[0.2] bg-background transition-all">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/15 transition-colors">
                  <Mic className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm font-semibold text-foreground mb-2">Audio</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/[0.04]">
                    <Upload className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground">Upload</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/[0.04]">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-destructive"><span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />Record</span>
                  </div>
                </div>
              </button>
            </div>
            )}
          </div>
        )}

        {/* Audio Dialog — Upload or Record */}
        <Dialog open={showRecordModal} onOpenChange={o => { setShowRecordModal(o); if (!o && isRecording) handleStopRecording(); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Audio</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Upload Audio */}
              <div className="flex flex-col items-center p-6 rounded-2xl border border-foreground/[0.1] bg-background">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7 text-accent" />
                </div>
                <span className="text-sm font-semibold text-foreground mb-3">Upload Audio</span>
                <p className="text-xs text-muted-foreground text-center mb-4">MP3, WAV, M4A up to 25MB</p>
                <label className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload size={14} />Choose File
                  <input type="file" accept="audio/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      addSource("audio", file.name);
                      setShowRecordModal(false);
                      toast({ title: "Audio uploaded", description: file.name });
                    }
                    if (e.target) e.target.value = "";
                  }} />
                </label>
              </div>
              {/* Record Audio */}
              <div className="flex flex-col items-center p-6 rounded-2xl border border-foreground/[0.1] bg-background">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all ${isRecording ? "bg-destructive/15 animate-pulse" : "bg-destructive/10"}`}>
                  <Mic className="w-7 h-7 text-destructive" />
                </div>
                <span className="text-sm font-semibold text-foreground mb-3">Record Audio</span>
                {isRecording && (
                  <>
                    <div className="flex items-center gap-[3px] mb-2 h-6">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="w-[3px] rounded-full bg-destructive/60" style={{
                          height: `${6 + Math.random() * 16}px`,
                          animation: `audio-wave 0.4s ease-in-out ${i * 0.02}s infinite alternate`
                        }} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Recording...</p>
                  </>
                )}
                {!isRecording && <p className="text-xs text-muted-foreground text-center mb-4">Record directly from your microphone</p>}
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isRecording ? "bg-emerald-500 hover:bg-emerald-500/90 text-white" : "bg-destructive hover:bg-destructive/90 text-white"
                  }`}
                >
                  {isRecording ? <><Check size={14} />Stop &amp; Use</> : <><Mic size={14} />Start Recording</>}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <style>{`@keyframes audio-wave { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1.3); } }`}</style>

        {/* Hidden file input for Upload File card */}
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.rtf,.epub,.md" multiple className="hidden" onChange={e => {
          const files = e.target.files;
          if (files) {
            Array.from(files).forEach(f => addSource("file", f.name));
            toast({ title: `${files.length} file${files.length > 1 ? "s" : ""} attached` });
          }
          if (e.target) e.target.value = "";
        }} />

        {/* Link input dialog */}
        <Dialog open={showLinkInput} onOpenChange={setShowLinkInput}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <p className="text-xs text-muted-foreground">Paste a URL to use as a source (YouTube, article, website, etc.)</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={linkInputValue} onChange={e => setLinkInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && linkInputValue.trim()) { addSource("link", linkInputValue.trim()); setLinkInputValue(""); setShowLinkInput(false); toast({ title: "Link attached" }); } }}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-background text-sm outline-none focus:border-accent transition-colors" />
                </div>
                <button onClick={() => { if (linkInputValue.trim()) { addSource("link", linkInputValue.trim()); setLinkInputValue(""); setShowLinkInput(false); toast({ title: "Link attached" }); } }}
                  disabled={!linkInputValue.trim()}
                  className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
                  Add
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
              {/* LEFT: Design Sidebar (hidden in grid view) */}
              {!isGridView && !isLeftPanelCollapsed && (
              <EbookDesignSidebar
                bookTitle={bookData.selectedTitle}
                chapters={ebookPages.map(p => ({ id: p.id, title: p.title, type: p.type as any }))}
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
                onSectionChange={handleSidebarSectionChange}
                openSection={sidebarOpenSection as any}
                onAddElement={(type, data) => canvasRef.current?.addElement(type, data)}
                onReplaceImage={isReplacingImage ? (src) => canvasRef.current?.replaceImage(src) : null}
                onTranslate={async (scope, language) => {
                  // Check for locked pages when applying to entire book
                  if (scope === 'book') {
                    const lockedPages = ebookPages.filter(p => p.locked);
                    if (lockedPages.length > 0) {
                      const lockedNumbers = lockedPages.map(p => ebookPages.indexOf(p) + 1).join(', ');
                      sonnerToast(`${lockedPages.length} locked page${lockedPages.length > 1 ? 's' : ''} will be skipped (Page ${lockedNumbers})`, {
                        description: 'Unlock to include all pages in translation.',
                        action: {
                          label: 'Unlock All',
                          onClick: () => {
                            setEbookPages(prev => prev.map(p => ({ ...p, locked: false })));
                            sonnerToast.success('All pages unlocked. Please run the translation again.');
                          },
                        },
                      });
                    }
                  }
                  // Check if current page is locked for page-level scope
                  if (scope === 'page' || scope === 'selected') {
                    const currentPage = ebookPages.find(p => p.id === selectedPageId);
                    if (currentPage?.locked) {
                      sonnerToast.error('This page is locked. Unlock it to make changes.');
                      return;
                    }
                  }
                  const textScope = scope === 'selected' ? 'page' : scope;
                  const elements = canvasRef.current?.getTextElements(textScope)?.filter(el => {
                    const page = ebookPages.find(p => p.id === el.pageId);
                    return !page?.locked;
                  });
                  if (!elements || elements.length === 0) {
                    toast({ title: 'No text elements found', variant: 'destructive' });
                    return;
                  }

                  // Detect language mode
                  if (language === '__detect__') {
                    toast({ title: 'Detecting current language...' });
                    try {
                      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-text-edit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
                        body: JSON.stringify({
                          action: 'custom',
                          texts: [elements[0].content],
                          customInstruction: 'Detect the language of this text. Return ONLY a JSON array with one string: the language name in English (e.g. ["English"]). No explanations.',
                        }),
                      });
                      const result = await response.json();
                      if (result.result) {
                        try {
                          const detected = JSON.parse(result.result);
                          toast({ title: `Detected language: ${Array.isArray(detected) ? detected[0] : detected}` });
                        } catch { toast({ title: `Detected: ${result.result}` }); }
                      } else {
                        toast({ title: result.error || 'Detection failed', variant: 'destructive' });
                      }
                    } catch { toast({ title: 'Detection request failed', variant: 'destructive' }); }
                    return;
                  }

                  toast({ title: `Translating ${elements.length} text element${elements.length > 1 ? 's' : ''} to ${language}...` });
                  try {
                    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-text-edit`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
                      body: JSON.stringify({
                        action: 'custom',
                        texts: elements.map(e => e.content),
                        customInstruction: `Translate each text to ${language}. Return ONLY the translated texts as a JSON array of strings, in the same order. Keep formatting, line breaks, and special characters. Do not add explanations.`,
                      }),
                    });
                    const result = await response.json();
                    if (result.result) {
                      try {
                        const translated: string[] = JSON.parse(result.result);
                        if (Array.isArray(translated) && translated.length === elements.length) {
                          const updates = elements.map((el, i) => ({ ...el, content: translated[i] }));
                          canvasRef.current?.updateTextContent(updates);
                          toast({ title: `Translated ${elements.length} element${elements.length > 1 ? 's' : ''} to ${language}` });
                        } else {
                          toast({ title: 'Translation returned unexpected format', variant: 'destructive' });
                        }
                      } catch { toast({ title: 'Failed to parse translation result', variant: 'destructive' }); }
                    } else {
                      toast({ title: result.error || 'Translation failed', variant: 'destructive' });
                    }
                  } catch {
                    toast({ title: 'Translation request failed', variant: 'destructive' });
                  }
                }}
              />
              )}

              {/* Left panel collapse toggle */}
              {!isGridView && (
                <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                  className="absolute top-1/2 -translate-y-1/2 z-10 w-5 h-10 bg-accent rounded-r-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
                  style={{ left: isLeftPanelCollapsed ? 0 : 320 }}>
                  <ChevronLeft className={`w-3 h-3 text-white transition-transform ${isLeftPanelCollapsed ? "rotate-180" : ""}`} />
                </button>
              )}

              {/* CENTER: Canvas Editor */}
              <EbookCanvasEditor
                ref={canvasRef}
                pages={ebookPages}
                selectedPageId={selectedPageId}
                onPageSelect={setSelectedPageId}
                onPagesChange={setEbookPages}
                bookTitle={bookData.selectedTitle}
                showPagesPanel={false}
                zoom={zoom}
                onZoomChange={setZoom}
                isGridView={isGridView}
                onGridViewToggle={() => setIsGridView(false)}
                findReplaceMode={findReplaceMode}
                onFindReplaceModeChange={setFindReplaceMode}
                onPageSettingsToggle={() => { setManualPageSettings(true); setShowPageSettings(prev => !prev); }}
                onOpenImageSection={() => { setSidebarOpenSection('image'); setTimeout(() => setSidebarOpenSection(null), 100); }}
                onReplaceStateChange={setIsReplacingImage}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                accessMode={accessMode}
                initialPageElements={savedPageElements}
                onPageElementsChange={handlePageElementsChange}
              />

              {/* Right panel collapse toggle */}
              {!isGridView && showPageSettings && (
                <button onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                  className="absolute top-1/2 -translate-y-1/2 z-10 w-5 h-10 bg-accent rounded-l-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
                  style={{ right: isRightPanelCollapsed ? 0 : 256 }}>
                  <ChevronRight className={`w-3 h-3 text-white transition-transform ${isRightPanelCollapsed ? "rotate-180" : ""}`} />
                </button>
              )}

              {/* RIGHT: Page Settings Panel */}
              {!isGridView && showPageSettings && !isRightPanelCollapsed && (
              <PageSettingsPanel
                pages={ebookPages}
                selectedPageId={selectedPageId}
                onPageSelect={setSelectedPageId}
                onPagesChange={setEbookPages}
                onGridViewToggle={() => setIsGridView(true)}
                bookTitle={bookData.selectedTitle}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                onDimensionsChange={(w, h) => { setPageWidth(w); setPageHeight(h); }}
              />
              )}
            </div>
            <EbookGenerationOverlay isGenerating={isGeneratingBook} bookTitle={bookData.selectedTitle} onComplete={handleGenerationComplete} />
          </div>
        )}
      </div>
      <EbookShareModal open={showShareModal} onOpenChange={setShowShareModal} projectName={bookData.selectedTitle || "Untitled Book"} />
      <EbookInviteModal open={showInviteModal} onOpenChange={setShowInviteModal} />
    </PageShell>
  );
};

export default NewEbookPage;