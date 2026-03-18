import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  // Category icons
  Image, Video, Music, Palette, Calendar, FileText, Code,
  // Prompt box icons
  ChevronDown, ChevronUp, Send, Mic, MicOff, Sparkles, Shuffle,
  X, Check, Loader2, Zap, ImageIcon,
  // Sub-mode icons
  Layers, Pencil, RefreshCw, Camera,
  Play, MessageCircle, Move, User, BookOpen, Presentation,
  Headphones, AudioLines, Captions,
  // Control icons
  Copy, Hash, Clock, SlidersHorizontal,
  // Tab / gallery icons
  LayoutGrid, Filter, Star, Download, Bookmark, Plus,
  // App/Template/Community icons
  Bot, Globe, Heart, Users, Wand2, Lock,
  ArrowRight, ArrowUp, Search, Cpu,
  Film, Package, BarChart2, ShoppingBag, Brush,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import PageShell from "@/components/PageShell";

/* ─── Types ─────────────────────────────────────────────────── */

type ContentType = "image" | "video" | "audio" | "design" | "content" | "document" | "app";
type GalleryTab = "creations" | "apps" | "templates" | "community";
type MediaFilter = "all" | "image" | "video" | "audio" | "design";

/* ─── Content type config ────────────────────────────────────── */

const CONTENT_TYPES: {
  id: ContentType;
  label: string;
  icon: typeof Image;
  color: string;
  bg: string;
  border: string;
  promptBorder: string;
}[] = [
  { id: "image",    label: "Image",    icon: Image,    color: "text-blue-500",   bg: "bg-blue-50",    border: "border-blue-200",   promptBorder: "border-blue-400" },
  { id: "video",    label: "Video",    icon: Video,    color: "text-red-500",    bg: "bg-red-50",     border: "border-red-200",    promptBorder: "border-red-400" },
  { id: "audio",    label: "Audio",    icon: Music,    color: "text-green-500",  bg: "bg-green-50",   border: "border-green-200",  promptBorder: "border-green-400" },
  { id: "design",   label: "Design",   icon: Palette,  color: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-200", promptBorder: "border-orange-400" },
  { id: "content",  label: "Content",  icon: Calendar, color: "text-purple-500", bg: "bg-purple-50",  border: "border-purple-200", promptBorder: "border-purple-400" },
  { id: "document", label: "Document", icon: FileText, color: "text-cyan-500",   bg: "bg-cyan-50",    border: "border-cyan-200",   promptBorder: "border-cyan-400" },
  { id: "app",      label: "App",      icon: Code,     color: "text-rose-500",   bg: "bg-rose-50",    border: "border-rose-200",   promptBorder: "border-rose-400" },
];

/* ─── Sub-modes per type ─────────────────────────────────────── */

const SUB_MODES: Record<ContentType, { id: string; label: string; icon: typeof Image }[]> = {
  image: [
    { id: "generate",   label: "Generate",   icon: Sparkles },
    { id: "batch",      label: "Batch",      icon: Layers },
    { id: "draw",       label: "Draw",       icon: Pencil },
    { id: "swap",       label: "Swap",       icon: RefreshCw },
    { id: "photoshoot", label: "Photoshoot", icon: Camera },
  ],
  video: [
    { id: "animate",      label: "Animate",      icon: Play },
    { id: "draw",         label: "Draw",         icon: Pencil },
    { id: "lip-sync",     label: "Lip-Sync",     icon: MessageCircle },
    { id: "motion-sync",  label: "Motion-Sync",  icon: Move },
    { id: "avatar",       label: "Avatar Video", icon: User },
    { id: "ugc",          label: "UGC",          icon: Video },
    { id: "recast",       label: "Recast",       icon: RefreshCw },
    { id: "story",        label: "Story",        icon: BookOpen },
    { id: "presentation", label: "Presentation", icon: Presentation },
    { id: "podcast",      label: "Podcast",      icon: Mic },
  ],
  audio: [
    { id: "voiceover",     label: "Voiceover",     icon: Mic },
    { id: "clone",         label: "Clone",         icon: User },
    { id: "revoice",       label: "Revoice",       icon: RefreshCw },
    { id: "transcribe",    label: "Transcribe",    icon: Captions },
    { id: "sound-effects", label: "Sound Effects", icon: AudioLines },
    { id: "music",         label: "Music",         icon: Music },
    { id: "audiobook",     label: "AudioBook",     icon: Headphones },
  ],
  design: [
    { id: "logo",          label: "Logo",         icon: Sparkles },
    { id: "poster",        label: "Poster",       icon: Presentation },
    { id: "thumbnail",     label: "Thumbnail",    icon: Film },
    { id: "flyer",         label: "Flyer",        icon: FileText },
    { id: "business-card", label: "Business Card",icon: User },
    { id: "brochure",      label: "Brochure",     icon: BookOpen },
    { id: "infographic",   label: "Infographic",  icon: BarChart2 },
  ],
  content: [
    { id: "social",      label: "Social",      icon: Globe },
    { id: "newsletter",  label: "Newsletter",  icon: FileText },
    { id: "article",     label: "Article",     icon: BookOpen },
    { id: "blog",        label: "Blog",        icon: Pencil },
    { id: "email",       label: "Email",       icon: FileText },
    { id: "ad-copy",     label: "Ad Copy",     icon: Zap },
  ],
  document: [
    { id: "ebook",         label: "Ebook",        icon: BookOpen },
    { id: "whitepaper",    label: "Whitepaper",   icon: FileText },
    { id: "report",        label: "Report",       icon: BarChart2 },
    { id: "proposal",      label: "Proposal",     icon: FileText },
    { id: "business-plan", label: "Business Plan",icon: Package },
    { id: "cover-letter",  label: "Cover Letter", icon: FileText },
  ],
  app: [
    { id: "web-app",   label: "Web App",   icon: Globe },
    { id: "ai-agent",  label: "AI Agent",  icon: Bot },
    { id: "saas",      label: "SaaS",      icon: Package },
    { id: "website",   label: "Website",   icon: LayoutGrid },
    { id: "extension", label: "Extension", icon: Code },
  ],
};

/* ─── Placeholders ───────────────────────────────────────────── */

const PLACEHOLDERS: Record<ContentType, string> = {
  image:    "A lone astronaut standing on a neon-lit alien world, photorealistic, golden hour…",
  video:    "Camera slowly pushes into a cyberpunk cityscape at night, neon reflections…",
  audio:    "Chill lo-fi beats with soft piano, gentle vinyl crackle, and distant city ambience…",
  design:   "Minimalist luxury brand logo for a high-end fashion house, gold on black…",
  content:  "30-day social media content plan for a wellness brand, motivational tone…",
  document: "Comprehensive business plan for an AI-powered SaaS startup in the creator economy…",
  app:      "A beautiful web app for tracking daily habits with streaks and analytics…",
};

const EXAMPLES: Record<ContentType, string[]> = {
  image:    ["Hyperrealistic portrait with bioluminescent tattoos, studio lighting", "Cyberpunk street market at midnight, rain-soaked cobblestones", "Ancient temple ruins overgrown with glowing crystal formations"],
  video:    ["Underwater bioluminescent jellyfish drifting, seamless loop", "Time-lapse of storm clouds rolling over mountain peaks at sunset", "Camera orbiting slowly around a futuristic city skyline"],
  audio:    ["Cinematic orchestral swell building to epic climax, 60 BPM, full strings", "Dark ambient soundscape with distant thunder, metallic drones", "Upbeat corporate podcast intro, 30 seconds, professional tone"],
  design:   ["Bold modernist poster for an art exhibition, geometric shapes, red accent", "Clean tech startup business card, midnight blue and electric teal", "Viral YouTube thumbnail with bold text and dramatic lighting"],
  content:  ["Instagram content plan for a luxury fashion brand, 4 posts per week", "Weekly newsletter for a crypto news outlet, analytical tone", "TikTok hook scripts for a fitness coach, energetic and direct"],
  document: ["Investor pitch deck for a Series A fintech startup", "SEO whitepaper on AI-generated content strategy for 2026", "Employee handbook for a remote-first creative agency"],
  app:      ["Pomodoro timer app with analytics and Spotify integration", "AI recipe generator that learns your taste preferences", "SaaS dashboard for managing influencer marketing campaigns"],
};

/* ─── Dummy gallery data ─────────────────────────────────────── */

const DUMMY_CREATIONS = [
  { id: "c1", photo: "photo-1618005182384-a83a8bd57fbe", type: "image" as MediaFilter, title: "Cosmic Dreamscape",        model: "Flux Pro",       liked: false },
  { id: "c2", photo: "photo-1557682250-33bd709cbe85", type: "image" as MediaFilter, title: "Neon City Boulevard",       model: "DALL-E 3",       liked: true },
  { id: "c3", photo: "photo-1604881991720-f91add269bed", type: "design" as MediaFilter, title: "Midnight Brand Identity",  model: "Seedream 4.0",   liked: false },
  { id: "c4", photo: "photo-1579546929518-9e396f3cc809", type: "image" as MediaFilter, title: "Cyberpunk Portrait",        model: "Midjourney v6",  liked: true },
  { id: "c5", photo: "photo-1541701494587-cb58502866ab", type: "design" as MediaFilter, title: "Dark Fantasy Ruins",        model: "Flux Max",       liked: false },
  { id: "c6", photo: "photo-1470071459604-3b5ec3a7fe05", type: "image" as MediaFilter, title: "Mountain Storm Timelapse",  model: "Imagen 4 Ultra", liked: false },
  { id: "c7", photo: "photo-1462275646964-a0e3386b89fa", type: "video" as MediaFilter, title: "Avatar Promo Video",        model: "Kling 2.6",      liked: true },
  { id: "c8", photo: "photo-1501854140801-50d01698950b", type: "image" as MediaFilter, title: "Ethereal Forest",           model: "Flux Pro",       liked: false },
];

const DUMMY_APPS = [
  { id: "a1", icon: Bot,          name: "Prompt Enhancer",    desc: "Supercharge any prompt with AI",       users: "12.4k", color: "bg-emerald-50 text-emerald-600",  badge: "Popular" },
  { id: "a2", icon: Wand2,        name: "Style Transfer",     desc: "Apply any visual style to your images", users: "8.1k",  color: "bg-purple-50 text-purple-600",   badge: "New" },
  { id: "a3", icon: BarChart2,    name: "Analytics Board",    desc: "Track your creation performance",       users: "5.6k",  color: "bg-blue-50 text-blue-600",       badge: null },
  { id: "a4", icon: Music,        name: "Beat Composer",      desc: "Generate royalty-free music tracks",    users: "9.2k",  color: "bg-pink-50 text-pink-600",       badge: "Popular" },
  { id: "a5", icon: Globe,        name: "Social Scheduler",   desc: "Schedule AI content across platforms",  users: "14.8k", color: "bg-orange-50 text-orange-600",   badge: "Popular" },
  { id: "a6", icon: Cpu,          name: "Model Tester",       desc: "Side-by-side AI model comparison",      users: "3.3k",  color: "bg-slate-50 text-slate-600",     badge: null },
  { id: "a7", icon: Brush,        name: "Style Studio",       desc: "Build and save custom visual styles",   users: "6.7k",  color: "bg-violet-50 text-violet-600",   badge: "New" },
  { id: "a8", icon: ShoppingBag,  name: "Product Photobooth", desc: "Professional product shots instantly",  users: "11.2k", color: "bg-amber-50 text-amber-600",     badge: null },
];

const DUMMY_TEMPLATES = [
  { id: "t1", photo: "photo-1618005182384-a83a8bd57fbe", name: "Hero Banner",          category: "Design",   uses: "3.2k" },
  { id: "t2", photo: "photo-1557682250-33bd709cbe85",    name: "Social Story",          category: "Content",  uses: "8.9k" },
  { id: "t3", photo: "photo-1604881991720-f91add269bed", name: "Brand Promo",           category: "Video",    uses: "4.1k" },
  { id: "t4", photo: "photo-1579546929518-9e396f3cc809", name: "Cinematic Portrait",    category: "Image",    uses: "6.5k" },
  { id: "t5", photo: "photo-1541701494587-cb58502866ab", name: "Product Showcase",      category: "Design",   uses: "2.8k" },
  { id: "t6", photo: "photo-1470071459604-3b5ec3a7fe05", name: "Tutorial Video",        category: "Video",    uses: "5.3k" },
  { id: "t7", photo: "photo-1462275646964-a0e3386b89fa", name: "Podcast Intro",         category: "Audio",    uses: "1.9k" },
  { id: "t8", photo: "photo-1501854140801-50d01698950b", name: "Newsletter Header",     category: "Content",  uses: "7.1k" },
];

const DUMMY_COMMUNITY = [
  { id: "m1", photo: "photo-1618005182384-a83a8bd57fbe", prompt: "Cosmic dreamscape, swirling nebula, deep purple and gold", creator: "xavierml",   likes: 2847, model: "Flux Pro" },
  { id: "m2", photo: "photo-1557682250-33bd709cbe85",    prompt: "Neon city boulevard at midnight, rain-soaked streets",    creator: "neonvision", likes: 1923, model: "Midjourney v6" },
  { id: "m3", photo: "photo-1604881991720-f91add269bed", prompt: "Dark fantasy landscape, ancient ruins glowing amber",     creator: "arcanist",   likes: 3104, model: "DALL-E 3" },
  { id: "m4", photo: "photo-1579546929518-9e396f3cc809", prompt: "AI avatar portrait, cyberpunk style, neon face paint",    creator: "cyberself",  likes: 891,  model: "Seedream 4.0" },
  { id: "m5", photo: "photo-1541701494587-cb58502866ab", prompt: "Ethereal crystal forest, bioluminescent glow",            creator: "luminos",    likes: 4210, model: "Imagen 4 Ultra" },
  { id: "m6", photo: "photo-1470071459604-3b5ec3a7fe05", prompt: "Ultra-wide mountain panorama at blue hour",               creator: "dawnrise",   likes: 1672, model: "Flux Max" },
  { id: "m7", photo: "photo-1462275646964-a0e3386b89fa", prompt: "Minimalist zen garden, raked sand, morning light",        creator: "wabi_sabi",  likes: 2233, model: "Grok Imagine" },
  { id: "m8", photo: "photo-1501854140801-50d01698950b", prompt: "Autumn forest path, golden leaves, foggy morning",        creator: "forestmind", likes: 1544, model: "Flux Pro" },
];

/* ─── Speech hook ────────────────────────────────────────────── */

function useSpeech(onResult: (t: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window));
  const recogRef = useRef<any>(null);
  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false; r.interimResults = false;
    r.onresult = (e: any) => { onResult(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false);
    r.onend   = () => setIsListening(false);
    recogRef.current = r; r.start(); setIsListening(true);
  }, [onResult]);
  const stopListening = useCallback(() => { recogRef.current?.stop(); setIsListening(false); }, []);
  return { isListening, isSupported, startListening, stopListening };
}

/* ─── PromptBox ──────────────────────────────────────────────── */

function PromptBox({
  onGenerate,
}: {
  onGenerate: () => void;
}) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [selectedSubMode, setSelectedSubMode] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [subModeOpen, setSubModeOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [ratioOpen, setRatioOpen] = useState(false);
  const [numberOpen, setNumberOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Auto");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState("10s");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Close type dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeCfg = selectedType ? CONTENT_TYPES.find(t => t.id === selectedType)! : null;
  const subModes = selectedType ? SUB_MODES[selectedType] : [];
  const selectedSubObj = subModes.find(s => s.id === selectedSubMode);

  const handleTypeSelect = (id: ContentType) => {
    setSelectedType(id);
    setSelectedSubMode(null);
    setSelectedModel("Auto");
    setTypeDropdownOpen(false);
    textareaRef.current?.focus();
  };

  const handleShuffle = () => {
    if (!selectedType) return;
    const list = EXAMPLES[selectedType];
    setPrompt(list[Math.floor(Math.random() * list.length)]);
    textareaRef.current?.focus();
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    await new Promise(r => setTimeout(r, 1100));
    setPrompt(p => p.trimEnd() + " — ultra detailed, professional quality, award-winning.");
    setIsEnhancing(false);
    toast({ title: "Prompt enhanced!" });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { textareaRef.current?.focus(); return; }
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    onGenerate();
    toast({ title: "Generation complete!", description: "Your creation is ready below." });
  };

  const handleSpeechResult = useCallback((t: string) => setPrompt(t), []);
  const { isListening, isSupported, startListening, stopListening } = useSpeech(handleSpeechResult);

  const hasType = !!selectedType;
  const placeholder = selectedType ? PLACEHOLDERS[selectedType] : "What would you like to create?";
  const borderCls = typeCfg ? typeCfg.promptBorder : "border-foreground/[0.12]";

  return (
    <TooltipProvider>
      <div className={`w-full max-w-[820px] mx-auto rounded-2xl border bg-background shadow-sm overflow-visible transition-all duration-200 ${borderCls}`}>

        {/* Textarea row */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2 min-h-[56px]">
          {/* LEFT: type selector trigger — always visible */}
          <div className="relative shrink-0" ref={typeRef}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setTypeDropdownOpen(v => !v)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-foreground/[0.06] transition-colors"
                  aria-label="Select content type"
                >
                  {typeCfg ? (
                    <typeCfg.icon size={17} className={typeCfg.color} />
                  ) : (
                    <SlidersHorizontal size={17} className="text-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Select what to create</TooltipContent>
            </Tooltip>

            {/* Type dropdown — same style as Image 1 */}
            {typeDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-background border border-foreground/[0.1] rounded-2xl shadow-xl z-[200] py-2 overflow-hidden">
                {CONTENT_TYPES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTypeSelect(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[0.88rem] font-medium text-foreground hover:bg-foreground/[0.04] transition-colors ${selectedType === t.id ? "bg-foreground/[0.06]" : ""}`}
                  >
                    <t.icon size={16} className={t.color} />
                    {t.label}
                    {selectedType === t.id && <Check size={13} className="ml-auto text-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-[0.92rem] text-foreground placeholder:text-muted/50 leading-[1.6] font-body min-h-[36px] max-h-[140px] overflow-y-auto py-[6px]"
            style={{ height: "36px" }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = "36px";
              el.style.height = Math.min(el.scrollHeight, 140) + "px";
            }}
          />

          {/* RIGHT: mic + generate buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={!isSupported}
                className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${isListening ? "text-accent" : "text-foreground hover:bg-foreground/[0.06]"}`}
              >
                {isListening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{isListening ? "Stop listening" : "Voice input"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isEnhancing}
                className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${prompt.trim() ? "text-foreground hover:bg-foreground/[0.06]" : "text-muted/30"}`}
              >
                {isEnhancing
                  ? <Loader2 size={17} className="animate-spin text-purple-500" />
                  : <Send size={17} />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Generate</TooltipContent>
          </Tooltip>
        </div>

        {/* Char count */}
        {prompt.length > 0 && (
          <div className="px-16 pb-1">
            <span className="text-[0.68rem] text-muted/40">{prompt.length}/1000 · ⌘↵ to generate</span>
          </div>
        )}

        {/* ── Bottom toolbar — only when type is selected ── */}
        {hasType && (
          <div className="border-t border-foreground/[0.06] px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">

            {/* Left: sub-mode + controls */}
            <div className="flex items-center gap-1.5 flex-wrap">

              {/* Sub-mode selector */}
              <Popover open={subModeOpen} onOpenChange={setSubModeOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border transition-all ${
                      selectedSubObj
                        ? `${typeCfg!.bg} ${typeCfg!.border} ${typeCfg!.color}`
                        : "bg-foreground/[0.04] border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"
                    }`}
                  >
                    {selectedSubObj ? (
                      <>
                        <selectedSubObj.icon size={13} />
                        {selectedSubObj.label}
                        <X size={11} className="opacity-60"
                          onClick={e => { e.stopPropagation(); setSelectedSubMode(null); setSubModeOpen(false); }}
                        />
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal size={13} />
                        Type
                        <ChevronDown size={11} className="text-muted" />
                      </>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-1.5" align="start" sideOffset={6}>
                  {subModes.map(m => (
                    <button key={m.id} type="button"
                      onClick={() => { setSelectedSubMode(m.id); setSubModeOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-medium transition-colors ${selectedSubMode === m.id ? `${typeCfg!.bg} ${typeCfg!.color}` : "hover:bg-foreground/[0.04] text-foreground"}`}>
                      <m.icon size={14} />
                      {m.label}
                      {selectedSubMode === m.id && <Check size={12} className="ml-auto" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

              {/* Model */}
              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${selectedModel !== "Auto" ? "bg-purple-50 text-purple-700" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                        <Zap size={12} />{selectedModel}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Model</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-48 p-1.5" align="start" sideOffset={6}>
                  {["Auto", "Flux Pro", "GPT-4o Image", "Imagen 4 Ultra", "Seedream 4.0"].map(m => (
                    <button key={m} type="button" onClick={() => { setSelectedModel(m); setModelOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedModel === m ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                      {m}{selectedModel === m && <Check size={12} />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Character */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="p-1.5 rounded-lg bg-foreground/[0.04] text-muted hover:text-foreground transition-colors"
                    onClick={() => toast({ title: "Characters", description: "Select an AI character." })}>
                    <User size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Character</TooltipContent>
              </Tooltip>

              {/* Reference */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="p-1.5 rounded-lg bg-foreground/[0.04] text-muted hover:text-foreground transition-colors"
                    onClick={() => toast({ title: "References", description: "Upload reference images." })}>
                    <Layers size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Reference</TooltipContent>
              </Tooltip>

              {/* Ratio — image & design */}
              {(selectedType === "image" || selectedType === "design") && (
                <Popover open={ratioOpen} onOpenChange={setRatioOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${selectedRatio !== "1:1" ? "bg-amber-50 text-amber-700" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Copy size={12} />{selectedRatio}
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Ratio</TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-40 p-1.5" align="start" sideOffset={6}>
                    {["1:1","16:9","9:16","4:3","3:4","3:2","2:3"].map(r => (
                      <button key={r} type="button" onClick={() => { setSelectedRatio(r); setRatioOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedRatio === r ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {r}{selectedRatio === r && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              )}

              {/* Duration — video */}
              {selectedType === "video" && (
                <Popover open={durationOpen} onOpenChange={setDurationOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                          <Clock size={12} />{selectedDuration}
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Duration</TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-32 p-1.5" align="start" sideOffset={6}>
                    {["5s","10s","15s","25s"].map(d => (
                      <button key={d} type="button" onClick={() => { setSelectedDuration(d); setDurationOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedDuration === d ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {d}{selectedDuration === d && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              )}

              {/* Count — image, design */}
              {(selectedType === "image" || selectedType === "design") && (
                <Popover open={numberOpen} onOpenChange={setNumberOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${selectedNumber > 1 ? "bg-red-50 text-red-600" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Hash size={12} />{selectedNumber > 1 ? selectedNumber : ""}
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Count</TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-36 p-1.5" align="start" sideOffset={6}>
                    {[1,2,3,4].map(n => (
                      <button key={n} type="button" onClick={() => { setSelectedNumber(n); setNumberOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedNumber === n ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {n} {n === 1 ? "output" : "outputs"}{selectedNumber === n && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              )}

              {/* Shuffle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" onClick={handleShuffle} className="p-1.5 rounded-lg bg-foreground/[0.04] text-emerald-500 hover:bg-emerald-50 transition-colors">
                    <Shuffle size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Inspire me</TooltipContent>
              </Tooltip>
            </div>

            {/* Right: mic + generate */}
            <div className="flex items-center gap-2">
              {isSupported && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" onClick={isListening ? stopListening : startListening}
                      className={`p-1.5 rounded-lg transition-colors ${isListening ? "bg-red-50 text-red-500" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isListening ? "Stop" : "Speak"}</TooltipContent>
                </Tooltip>
              )}
              <button type="button" onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {isGenerating ? <><Loader2 size={13} className="animate-spin" />Generating…</> : <><Send size={13} />Generate</>}
              </button>
            </div>
          </div>
        )}

        {/* Prompt actions when no type selected */}
      </div>
    </TooltipProvider>
  );
}

/* ─── Gallery card ───────────────────────────────────────────── */

function CreationCard({ item }: { item: typeof DUMMY_CREATIONS[0] }) {
  const [liked, setLiked] = useState(item.liked);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const typeColors: Record<string, string> = {
    image: "bg-blue-500/80",
    video: "bg-red-500/80",
    audio: "bg-green-500/80",
    design: "bg-orange-500/80",
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-foreground/[0.03]">
      <img
        src={`https://images.unsplash.com/${item.photo}?w=400&h=400&fit=crop&q=80`}
        alt={item.title}
        className="w-full aspect-square object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Type badge */}
      <div className={`absolute top-2 left-2 text-white text-[0.62rem] font-bold px-2 py-0.5 rounded-md ${typeColors[item.type] || "bg-black/50"} backdrop-blur-sm`}>
        {item.type.toUpperCase()}
      </div>

      {/* Top-right: like */}
      <button
        onClick={() => setLiked(v => !v)}
        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${liked ? "bg-accent text-white scale-110" : "bg-black/30 text-white opacity-0 group-hover:opacity-100"}`}
      >
        <Star size={12} className={liked ? "fill-current" : ""} />
      </button>

      {/* Bottom actions */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex-1 min-w-0">
          <p className="text-[0.7rem] text-white font-medium truncate">{item.title}</p>
          <p className="text-[0.62rem] text-white/60">{item.model}</p>
        </div>
        <button
          onClick={() => { setSaved(v => !v); toast({ title: saved ? "Removed from collection" : "Saved to collection!" }); }}
          className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/35 text-white transition-colors"
        >
          <Bookmark size={11} className={saved ? "fill-current" : ""} />
        </button>
        <a
          href={`https://images.unsplash.com/${item.photo}?w=2000&q=90`}
          download
          className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/35 text-white transition-colors"
        >
          <Download size={11} />
        </a>
      </div>
    </div>
  );
}

/* ─── Tabs ───────────────────────────────────────────────────── */

const TABS: { id: GalleryTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "creations",  label: "Creations",  icon: Sparkles },
  { id: "community",  label: "Community",  icon: Users },
  { id: "templates",  label: "Templates",  icon: LayoutGrid },
  { id: "apps",       label: "Apps",       icon: Package },
];

const MEDIA_FILTERS: { id: MediaFilter; label: string }[] = [
  { id: "all",    label: "All" },
  { id: "image",  label: "Images" },
  { id: "video",  label: "Videos" },
  { id: "audio",  label: "Audio" },
  { id: "design", label: "Designs" },
];

/* ─── Main Page ──────────────────────────────────────────────── */

export default function CreatePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<GalleryTab>("creations");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [likedCommunity, setLikedCommunity] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState(false);

  const filteredCreations = mediaFilter === "all"
    ? DUMMY_CREATIONS
    : DUMMY_CREATIONS.filter(c => c.type === mediaFilter);

  return (
    <PageShell>
      <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-8 pb-20">

        {/* Prompt Box */}
        <div className="mb-10">
          <PromptBox onGenerate={() => setGenerated(true)} />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 p-1 bg-foreground/[0.04] rounded-xl border border-foreground/[0.06]">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.82rem] font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm border border-foreground/[0.08]"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter — only on Creations tab */}
          {activeTab === "creations" && (
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button type="button" className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[0.82rem] font-medium transition-colors ${mediaFilter !== "all" ? "border-accent bg-accent/5 text-accent" : "border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"}`}>
                  <Filter size={14} />
                  {mediaFilter === "all" ? "Filter" : MEDIA_FILTERS.find(f => f.id === mediaFilter)?.label}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1.5" align="end" sideOffset={6}>
                {MEDIA_FILTERS.map(f => (
                  <button key={f.id} type="button" onClick={() => { setMediaFilter(f.id); setFilterOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${mediaFilter === f.id ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                    {f.label}{mediaFilter === f.id && <Check size={12} />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* ── CREATIONS TAB ── */}
        {activeTab === "creations" && (
          <div>
            {filteredCreations.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display font-black text-[1.1rem] mb-2">No {mediaFilter} creations yet</h3>
                <p className="text-[0.84rem] text-muted">Use the prompt box above to generate your first {mediaFilter}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredCreations.map(item => (
                  <CreationCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMMUNITY TAB ── */}
        {activeTab === "community" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-[1.1rem] tracking-[-0.02em]">Trending Now</h2>
              <Link to="/explore" className="flex items-center gap-1 text-[0.78rem] font-medium text-muted hover:text-foreground transition-colors no-underline">
                Explore all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {DUMMY_COMMUNITY.map(item => (
                <div key={item.id} className="group relative rounded-2xl overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/${item.photo}?w=400&h=400&fit=crop&q=80`}
                    alt={item.prompt}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Creator avatar */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-[0.6rem] font-black">
                      {item.creator[0].toUpperCase()}
                    </div>
                    <span className="text-[0.65rem] text-white font-semibold drop-shadow">@{item.creator}</span>
                  </div>

                  {/* Like button */}
                  <button
                    onClick={() => setLikedCommunity(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; })}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${likedCommunity.has(item.id) ? "bg-accent text-white" : "bg-black/30 text-white"}`}
                  >
                    <Heart size={11} className={likedCommunity.has(item.id) ? "fill-current" : ""} />
                  </button>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[0.7rem] text-white/85 truncate mb-0.5">{item.prompt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.62rem] text-white/50">{item.model}</span>
                      <span className="flex items-center gap-1 text-[0.62rem] text-white/70">
                        <Heart size={9} className="fill-current text-red-400" /> {item.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Use prompt */}
                  <button
                    onClick={() => toast({ title: "Prompt loaded!", description: item.prompt.slice(0, 60) + "…" })}
                    className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/35 text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Zap size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TEMPLATES TAB ── */}
        {activeTab === "templates" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-[1.1rem] tracking-[-0.02em]">Start with a Template</h2>
              <div className="flex items-center gap-1 p-0.5 bg-foreground/[0.04] rounded-lg border border-foreground/[0.06]">
                {["All","Design","Video","Image","Audio","Content"].map(cat => (
                  <button key={cat} className="px-2.5 py-1 rounded-md text-[0.74rem] font-medium text-muted hover:text-foreground hover:bg-background transition-colors first:text-foreground first:bg-background first:shadow-sm">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {DUMMY_TEMPLATES.map(t => (
                <div key={t.id} className="group cursor-pointer">
                  <div className="relative rounded-2xl overflow-hidden mb-2.5">
                    <img
                      src={`https://images.unsplash.com/${t.photo}?w=400&h=300&fit=crop&q=80`}
                      alt={t.name}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => toast({ title: `"${t.name}" template loaded!` })}
                        className="flex items-center gap-1.5 bg-white text-foreground text-[0.78rem] font-bold px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
                      >
                        <Zap size={13} /> Use Template
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[0.62rem] font-semibold px-2 py-0.5 rounded-md">
                      {t.category}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-0.5">
                    <h3 className="text-[0.84rem] font-semibold">{t.name}</h3>
                    <span className="text-[0.7rem] text-muted">{t.uses} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── APPS TAB ── */}
        {activeTab === "apps" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-[1.1rem] tracking-[-0.02em]">AI-Powered Apps</h2>
              <Link to="/apps" className="flex items-center gap-1 text-[0.78rem] font-medium text-muted hover:text-foreground transition-colors no-underline">
                Browse all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {DUMMY_APPS.map(app => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => toast({ title: `Opening ${app.name}…` })}
                  className="group text-left p-5 rounded-2xl border border-foreground/[0.08] bg-background hover:border-foreground/20 hover:shadow-md transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${app.color} transition-transform group-hover:scale-110`}>
                    <app.icon size={20} />
                  </div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-[0.88rem] font-bold leading-tight">{app.name}</h3>
                    {app.badge && (
                      <span className={`shrink-0 text-[0.6rem] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide ${app.badge === "Popular" ? "bg-accent/10 text-accent" : "bg-emerald-100 text-emerald-700"}`}>
                        {app.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[0.76rem] text-muted leading-snug mb-3">{app.desc}</p>
                  <div className="flex items-center gap-1 text-[0.7rem] text-muted">
                    <Users size={11} /> {app.users} users
                  </div>
                </button>
              ))}
            </div>

            {/* Featured app banner */}
            <div className="mt-6 rounded-2xl border border-foreground/[0.08] bg-gradient-to-r from-accent/5 to-purple-50 p-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[0.72rem] font-bold text-accent uppercase tracking-widest mb-1">Featured</div>
                <h3 className="font-display font-black text-[1.2rem] tracking-[-0.02em] mb-1">REVVEN App Store</h3>
                <p className="text-[0.84rem] text-muted">Discover 200+ AI-powered apps built for creators, marketers, and builders.</p>
              </div>
              <button className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-primary-foreground text-[0.84rem] font-bold hover:bg-accent transition-colors">
                <ArrowRight size={15} /> Browse Store
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
