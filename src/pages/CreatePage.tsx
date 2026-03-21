import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Image, Video, Music, Palette, Calendar, FileText, Code,
  ChevronDown, ChevronUp, Send, Mic, MicOff, Sparkles, Shuffle,
  X, Check, Loader2, Zap, ImageIcon,
  Layers, Pencil, RefreshCw, Camera,
  Play, MessageCircle, Move, User, BookOpen, Presentation,
  Headphones, AudioLines, Captions,
  Copy, Hash, Clock, SlidersHorizontal,
  LayoutGrid, Filter, Star, Download, Bookmark, Plus,
  Bot, Globe, Heart, Users, Wand2, Lock,
  ArrowRight, ArrowUp, Search, Cpu,
  Film, Package, BarChart2, ShoppingBag, Brush, Link2,
  Eye, Target, Languages, Repeat, PenTool, FolderOpen,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import PageShell from "@/components/PageShell";
import ReferencePanel from "@/components/create/ReferencePanel";
import FramePanel from "@/components/create/FramePanel";
import MusicSamples from "@/components/create/MusicSamples";
import PhotoshootThemes from "@/components/create/PhotoshootThemes";
import SocialContentPanel from "@/components/create/SocialContentPanel";
import CharacterPanel from "@/components/create/CharacterPanel";
import ImageCardOverlay from "@/components/ImageCardOverlay";

/* ─── Types ─────────────────────────────────────────────────── */

type ContentType = "image" | "video" | "audio" | "design" | "content" | "document" | "app";
type GalleryTab = "creations" | "collections" | "apps" | "templates" | "community";
type MediaFilter = "all" | "image" | "video" | "audio" | "design";
type PanelType = "reference" | "character" | "frames" | "music" | "photoshoot" | "social" | null;

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
  image:    "Describe the image you want to generate...",
  video:    "Describe the video you want to create...",
  audio:    "Describe your sound, music, or voiceover...",
  design:   "Describe your design vision...",
  content:  "Describe the theme or topic for your content plan...",
  document: "Describe the document you want to create...",
  app:      "Describe the app you want to build...",
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

/* ─── Types for user creations ───────────────────────────────── */

type UserCreation = {
  id: string;
  image_url: string;
  title: string | null;
  type: MediaFilter;
  created_at: string;
  liked: boolean;
};

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

function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [isSupported] = useState(() => typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window));
  const recogRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setFinalText(final);
      setInterimText(interim);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => {};
    recogRef.current = r;
    r.start();
    setIsListening(true);
    setInterimText("");
    setFinalText("");
  }, []);

  const stopListening = useCallback(() => { recogRef.current?.stop(); }, []);
  const cancel = useCallback(() => { recogRef.current?.stop(); setIsListening(false); setInterimText(""); setFinalText(""); }, []);
  const accept = useCallback(() => {
    recogRef.current?.stop();
    const result = (finalText + " " + interimText).trim();
    setIsListening(false); setInterimText(""); setFinalText("");
    return result;
  }, [finalText, interimText]);

  const currentTranscript = (finalText + " " + interimText).trim();
  return { isListening, isSupported, startListening, stopListening, cancel, accept, currentTranscript };
}

/* ─── Audio Wave Animation ──────────────────────────────────── */

function AudioWaveAnimation({ small }: { small?: boolean } = {}) {
  const h = small ? 14 : 20;
  const barW = small ? "w-[2px]" : "w-[3px]";
  const gap = small ? "gap-[2px]" : "gap-[3px]";
  const containerH = small ? "h-4" : "h-6";
  return (
    <div className={`flex items-center ${gap} ${containerH}`}>
      {[...Array(12)].map((_, i) => (
        <div key={i} className={`${barW} rounded-full bg-accent`} style={{ animation: `audioWave 1.2s ease-in-out ${i * 0.08}s infinite`, height: "4px" }} />
      ))}
      <style>{`@keyframes audioWave { 0%, 100% { height: 4px; opacity: 0.4; } 50% { height: ${h}px; opacity: 1; } }`}</style>
    </div>
  );
}

/* ─── PromptBox ──────────────────────────────────────────────── */

function PromptBox({ onGenerate }: { onGenerate: () => void }) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [selectedSubMode, setSelectedSubMode] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExtractingPrompt, setIsExtractingPrompt] = useState(false);
  const promptFileRef = useRef<HTMLInputElement>(null);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [subModeOpen, setSubModeOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [ratioOpen, setRatioOpen] = useState(false);
  const [numberOpen, setNumberOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Auto");
  const [selectedStyle, setSelectedStyle] = useState("None");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState("10s");
  const [brandToggle, setBrandToggle] = useState(false);
  const [contentGoal, setContentGoal] = useState("Engagement");
  const [contentTone, setContentTone] = useState("Professional");
  const [contentLanguage, setContentLanguage] = useState("English");
  const [contentFrequency, setContentFrequency] = useState("Daily");
  const [contentTime, setContentTime] = useState("9:00 AM");
  const [contentStyle, setContentStyle] = useState("Informative");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Panel states
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [references, setReferences] = useState<{ id: string; src: string; name: string }[]>([]);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [characterInfo, setCharacterInfo] = useState<{ name: string; avatar: string | null } | null>(null);

  // Fetch character info when selected
  useEffect(() => {
    if (!selectedCharacter) { setCharacterInfo(null); return; }
    const fetchChar = async () => {
      const { data } = await supabase.from("characters").select("name, avatar_url").eq("id", selectedCharacter).single();
      if (data) setCharacterInfo({ name: data.name, avatar: data.avatar_url });
    };
    fetchChar();
  }, [selectedCharacter]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeDropdownOpen(false);
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
    setActivePanel(null);
    textareaRef.current?.focus();
  };

  // Auto-open panels based on sub-mode selection
  const handleSubModeSelect = (modeId: string) => {
    setSelectedSubMode(modeId);
    setSubModeOpen(false);
    // Auto-show relevant panel
    if (selectedType === "video" && modeId === "animate") setActivePanel("frames");
    else if (selectedType === "audio" && modeId === "music") setActivePanel("music");
    else if (selectedType === "image" && modeId === "photoshoot") setActivePanel("photoshoot");
    else if (selectedType === "content" && modeId === "social") setActivePanel("social");
    else setActivePanel(null);
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

  const handleExtractPrompt = async (file: File) => {
    setIsExtractingPrompt(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("generate-prompts", {
        body: { imageUrl: base64 },
      });

      if (error) throw error;

      if (selectedType === "video") {
        setPrompt(data.video_prompt || "");
      } else {
        setPrompt(data.image_prompt || "");
      }
      toast({ title: "Prompt extracted!", description: "AI analyzed your file and generated a prompt." });
    } catch (e: any) {
      console.error("Extract prompt error:", e);
      toast({ title: "Failed to extract prompt", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsExtractingPrompt(false);
      if (promptFileRef.current) promptFileRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { textareaRef.current?.focus(); return; }
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    onGenerate();
    toast({ title: "Generation complete!", description: "Your creation is ready below." });
  };

  const { isListening, isSupported, startListening, cancel: cancelSpeech, accept: acceptSpeech, currentTranscript } = useSpeech();

  const handleAcceptSpeech = () => {
    const result = acceptSpeech();
    if (result) setPrompt(prev => prev ? prev + " " + result : result);
  };

  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const hasType = !!selectedType;
  const placeholder = selectedType ? PLACEHOLDERS[selectedType] : "What would you like to create?";
  const borderCls = typeCfg ? typeCfg.promptBorder : "border-foreground/[0.12]";

  const topLeftLabel = (type: ContentType): string => {
    switch (type) {
      case "image": return "Image-To-Prompt";
      case "video": return "Video-To-Prompt";
      case "audio": return "Audio";
      case "design": return "Design";
      case "content": return "Content";
      case "document": return "Document";
      case "app": return "App";
    }
  };

  // Determine which extra toolbar icons to show based on content type
  const showFrames = selectedType === "video" && selectedSubMode === "animate";
  const showMusic = selectedType === "audio" && selectedSubMode === "music";
  const showPhotoshoot = selectedType === "image" && selectedSubMode === "photoshoot";
  const showSocial = selectedType === "content" && selectedSubMode === "social";

  return (
    <TooltipProvider>
      <div>
        <div className={`w-full max-w-[820px] mx-auto rounded-2xl border bg-background shadow-sm overflow-visible transition-all duration-200 ${borderCls}`}>

          {/* Textarea row */}
          <div className="flex items-start gap-3 px-4 pt-3 pb-2 min-h-[56px]">
            {hasType && typeCfg ? (
              <div className="flex flex-col gap-1 shrink-0 pt-[2px]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => (selectedType === "image" || selectedType === "video") ? promptFileRef.current?.click() : undefined}
                      disabled={isExtractingPrompt}
                      className={`p-1.5 rounded-lg bg-foreground/[0.06] ${typeCfg.color} hover:bg-foreground/[0.1] transition-colors ${(selectedType === "image" || selectedType === "video") ? "cursor-pointer" : ""}`}
                    >
                      {isExtractingPrompt ? <Loader2 size={17} className="animate-spin" /> : <typeCfg.icon size={17} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{topLeftLabel(selectedType!)}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" onClick={handleShuffle} className="p-1.5 rounded-lg bg-foreground/[0.06] text-emerald-500 hover:bg-emerald-50 transition-colors">
                      <Shuffle size={17} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Inspire Me</TooltipContent>
                </Tooltip>
                <input
                  ref={promptFileRef}
                  type="file"
                  accept={selectedType === "video" ? "image/*,video/*" : "image/*"}
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleExtractPrompt(file);
                  }}
                />
              </div>
            ) : (
              <div className="relative shrink-0 pt-[2px]" ref={typeRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" onClick={() => setTypeDropdownOpen(v => !v)} className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-foreground/[0.06] transition-colors" aria-label="Select content type">
                      <SlidersHorizontal size={17} className="text-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Create</TooltipContent>
                </Tooltip>
                {typeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-background border border-foreground/[0.1] rounded-2xl shadow-xl z-[200] py-2 overflow-hidden">
                    {CONTENT_TYPES.map(t => (
                      <button key={t.id} type="button" onClick={() => handleTypeSelect(t.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[0.88rem] font-medium text-foreground hover:bg-foreground/[0.04] transition-colors ${selectedType === t.id ? "bg-foreground/[0.06]" : ""}`}>
                        <t.icon size={16} className={t.color} />{t.label}
                        {selectedType === t.id && <Check size={13} className="ml-auto text-accent" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attachment chips for character & references */}
            {!isListening && (selectedCharacter || references.length > 0) && (
              <div className="flex-1 flex flex-col gap-1.5 pt-[2px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedCharacter && characterInfo && (
                    <button type="button" onClick={() => togglePanel("character")}
                      className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${activePanel === "character" ? "border-accent bg-accent/10" : "border-foreground/[0.1] bg-foreground/[0.03] hover:border-accent/30"}`}>
                      {characterInfo.avatar ? (
                        <img src={characterInfo.avatar} alt={characterInfo.name} className="w-7 h-7 rounded-lg object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center"><User size={14} className="text-accent" /></div>
                      )}
                      <div className="text-left">
                        <span className="text-[0.68rem] text-muted/60 font-medium block leading-none">Character</span>
                        <span className="text-[0.78rem] font-semibold text-foreground leading-tight">{characterInfo.name}</span>
                      </div>
                      <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); setSelectedCharacter(null); }} />
                    </button>
                  )}
                  {references.length > 0 && (
                    <button type="button" onClick={() => togglePanel("reference")}
                      className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${activePanel === "reference" ? "border-accent bg-accent/10" : "border-foreground/[0.1] bg-foreground/[0.03] hover:border-accent/30"}`}>
                      <div className="flex items-center -space-x-1.5">
                        {references.slice(0, 4).map((ref, i) => (
                          <img key={ref.id} src={ref.src} alt={ref.name} className="w-7 h-7 rounded-lg object-cover border-2 border-background" style={{ zIndex: references.length - i }} />
                        ))}
                        {references.length > 4 && (
                          <div className="w-7 h-7 rounded-lg bg-foreground/[0.08] border-2 border-background flex items-center justify-center text-[0.6rem] font-bold text-muted" style={{ zIndex: 0 }}>+{references.length - 4}</div>
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-[0.68rem] text-muted/60 font-medium block leading-none">References</span>
                        <span className="text-[0.78rem] font-semibold text-foreground leading-tight">{references.length} image{references.length !== 1 ? "s" : ""}</span>
                      </div>
                      <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); setReferences([]); }} />
                    </button>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                  placeholder={placeholder}
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-[0.92rem] text-foreground placeholder:text-muted/50 leading-[1.6] font-body min-h-[36px] max-h-[140px] overflow-y-auto"
                  style={{ height: "36px" }}
                  onInput={e => { const el = e.currentTarget; el.style.height = "36px"; el.style.height = Math.min(el.scrollHeight, 140) + "px"; }}
                />
              </div>
            )}

            {/* Textarea OR Recording UI (no attachments) */}
            {isListening ? (
              <div className="flex-1 flex flex-col gap-1 py-[6px] mt-[2px] min-h-[36px]">
                {currentTranscript && <p className="text-[0.85rem] text-foreground/70 italic leading-snug">{currentTranscript}</p>}
                <div className="flex items-center gap-1.5 shrink-0 self-end">
                  <button type="button" onClick={cancelSpeech} className="w-7 h-7 rounded-lg flex items-center justify-center bg-foreground/[0.06] text-muted hover:text-foreground hover:bg-foreground/[0.1] transition-colors" title="Cancel"><X size={14} /></button>
                  <div className="flex items-center gap-1.5 px-1">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                    <AudioWaveAnimation small />
                    <span className="text-[0.7rem] text-muted font-medium whitespace-nowrap">Listening…</span>
                  </div>
                  <button type="button" onClick={handleAcceptSpeech} className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="Accept"><Check size={14} /></button>
                </div>
              </div>
            ) : !selectedCharacter && references.length === 0 ? (
              <>
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                  placeholder={placeholder}
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-[0.92rem] text-foreground placeholder:text-muted/50 leading-[1.6] font-body min-h-[36px] max-h-[140px] overflow-y-auto py-[6px] mt-[2px]"
                  style={{ height: "36px" }}
                  onInput={e => { const el = e.currentTarget; el.style.height = "36px"; el.style.height = Math.min(el.scrollHeight, 140) + "px"; }}
                />
                {!hasType && (
                  <div className="flex items-center gap-0 shrink-0 pt-[2px]">
                    {isSupported && (
                      <Tooltip><TooltipTrigger asChild>
                        <button type="button" onClick={startListening} className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors text-foreground hover:bg-foreground/[0.06]"><Mic size={17} /></button>
                      </TooltipTrigger><TooltipContent side="bottom">Voice input</TooltipContent></Tooltip>
                    )}
                    <Tooltip><TooltipTrigger asChild>
                      <button type="button" onClick={handleGenerate} disabled={!prompt.trim() || isEnhancing}
                        className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${prompt.trim() ? "text-foreground hover:bg-foreground/[0.06]" : "text-muted/30"}`}>
                        {isEnhancing ? <Loader2 size={17} className="animate-spin text-purple-500" /> : <Send size={17} />}
                      </button>
                    </TooltipTrigger><TooltipContent side="bottom">Generate</TooltipContent></Tooltip>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Char count */}
          {prompt.length > 0 && (
            <div className="px-16 pb-1">
              <span className="text-[0.68rem] text-muted/40">{prompt.length}/1000 · ⌘↵ to generate</span>
            </div>
          )}

          {/* ── Bottom toolbar ── */}
          {hasType && (
            <div className="border-t border-foreground/[0.06] px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Type chip */}
                {typeCfg && (
                  <div className="relative" ref={typeRef}>
                    <button type="button" onClick={() => setTypeDropdownOpen(v => !v)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border transition-all ${typeCfg.bg} ${typeCfg.border} ${typeCfg.color}`}>
                      <typeCfg.icon size={13} />{typeCfg.label}<X size={11} className="opacity-60" onClick={e => { e.stopPropagation(); setSelectedType(null); setSelectedSubMode(null); setActivePanel(null); }} />
                    </button>
                    {typeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-background border border-foreground/[0.1] rounded-2xl shadow-xl z-[200] py-2 overflow-hidden">
                        {CONTENT_TYPES.map(t => (
                          <button key={t.id} type="button" onClick={() => handleTypeSelect(t.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-[0.88rem] font-medium text-foreground hover:bg-foreground/[0.04] transition-colors ${selectedType === t.id ? "bg-foreground/[0.06]" : ""}`}>
                            <t.icon size={16} className={t.color} />{t.label}
                            {selectedType === t.id && <Check size={13} className="ml-auto text-accent" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

                {/* Sub-mode selector */}
                <Popover open={subModeOpen} onOpenChange={setSubModeOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border transition-all ${
                      selectedSubObj ? `${typeCfg!.bg} ${typeCfg!.border} ${typeCfg!.color}` : "bg-foreground/[0.04] border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"
                    }`}>
                      {selectedSubObj ? (
                        <><selectedSubObj.icon size={13} />{selectedSubObj.label}<X size={11} className="opacity-60" onClick={e => { e.stopPropagation(); setSelectedSubMode(null); setSubModeOpen(false); setActivePanel(null); }} /></>
                      ) : (
                        <><SlidersHorizontal size={13} />Type<ChevronDown size={11} className="text-muted" /></>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-1.5" align="start" sideOffset={6}>
                    {subModes.map(m => (
                      <button key={m.id} type="button" onClick={() => handleSubModeSelect(m.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-medium transition-colors ${selectedSubMode === m.id ? `${typeCfg!.bg} ${typeCfg!.color}` : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        <m.icon size={14} />{m.label}{selectedSubMode === m.id && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

                {/* Model */}
                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                  <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                    <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${selectedModel !== "Auto" ? "bg-purple-50 text-purple-700" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      <Cpu size={12} />{selectedModel}
                    </button>
                  </PopoverTrigger></TooltipTrigger><TooltipContent>Model</TooltipContent></Tooltip>
                  <PopoverContent className="w-48 p-1.5" align="start" sideOffset={6}>
                    {["Auto", "Flux Pro", "GPT-4o Image", "Imagen 4 Ultra", "Seedream 4.0"].map(m => (
                      <button key={m} type="button" onClick={() => { setSelectedModel(m); setModelOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedModel === m ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {m}{selectedModel === m && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Style */}
                <Popover open={styleOpen} onOpenChange={setStyleOpen}>
                  <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                    <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${selectedStyle !== "None" ? "bg-pink-50 text-pink-700" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      <Brush size={12} />{selectedStyle !== "None" ? selectedStyle : "Style"}
                    </button>
                  </PopoverTrigger></TooltipTrigger><TooltipContent>Style</TooltipContent></Tooltip>
                  <PopoverContent className="w-48 p-1.5" align="start" sideOffset={6}>
                    {["None", "Photorealistic", "Anime", "Digital Art", "Oil Painting", "Watercolor", "3D Render", "Pixel Art", "Comic Book", "Cinematic"].map(s => (
                      <button key={s} type="button" onClick={() => { setSelectedStyle(s); setStyleOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedStyle === s ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {s}{selectedStyle === s && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
                {/* Character */}
                <Tooltip><TooltipTrigger asChild>
                  <button type="button" onClick={() => togglePanel("character")}
                    className={`relative p-1.5 rounded-lg transition-colors ${activePanel === "character" || selectedCharacter ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                    <User size={14} />
                    {selectedCharacter && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" />}
                  </button>
                </TooltipTrigger><TooltipContent>Character{selectedCharacter && characterInfo ? `: ${characterInfo.name}` : ""}</TooltipContent></Tooltip>

                {/* Reference */}
                <Tooltip><TooltipTrigger asChild>
                  <button type="button" onClick={() => togglePanel("reference")}
                    className={`relative p-1.5 rounded-lg transition-colors ${activePanel === "reference" || references.length > 0 ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                    <Layers size={14} />
                    {references.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-accent text-white text-[0.55rem] font-bold flex items-center justify-center">{references.length}</span>}
                  </button>
                </TooltipTrigger><TooltipContent>Reference{references.length > 0 ? ` (${references.length})` : ""}</TooltipContent></Tooltip>

                {/* Ratio — image & design */}
                {(selectedType === "image" || selectedType === "design") && (
                  <Popover open={ratioOpen} onOpenChange={setRatioOpen}>
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${selectedRatio !== "1:1" ? "bg-amber-50 text-amber-700" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                        <Copy size={12} />{selectedRatio}
                      </button>
                    </PopoverTrigger></TooltipTrigger><TooltipContent>Ratio</TooltipContent></Tooltip>
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
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                        <Clock size={12} />{selectedDuration}
                      </button>
                    </PopoverTrigger></TooltipTrigger><TooltipContent>Duration</TooltipContent></Tooltip>
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

                {/* Resolution — video */}
                {selectedType === "video" && (
                  <Tooltip><TooltipTrigger asChild>
                    <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                      <SlidersHorizontal size={12} />1080p
                    </button>
                  </TooltipTrigger><TooltipContent>Resolution</TooltipContent></Tooltip>
                )}

                {/* Count — image, design */}
                {(selectedType === "image" || selectedType === "design") && (
                  <Popover open={numberOpen} onOpenChange={setNumberOpen}>
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${selectedNumber > 1 ? "bg-red-50 text-red-600" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                        <Hash size={12} />{selectedNumber > 1 ? selectedNumber : ""}
                      </button>
                    </PopoverTrigger></TooltipTrigger><TooltipContent>Count</TooltipContent></Tooltip>
                    <PopoverContent className="w-36 p-1.5" align="start" sideOffset={6}>
                      {[1,2,3,4,5,6].map(n => (
                        <button key={n} type="button" onClick={() => { setSelectedNumber(n); setNumberOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedNumber === n ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          {n} {n === 1 ? "image" : "images"}{selectedNumber === n && <Check size={12} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}

                {/* Content/Social toolbar icons */}
                {selectedType === "content" && (
                  <div className="flex items-center gap-0.5">
                    <div className="w-px h-5 bg-foreground/[0.08] mx-1" />
                    {/* Goal */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors ${contentGoal !== "Engagement" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Target size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Goal</p>
                        {["Engagement", "Awareness", "Traffic", "Sales", "Education", "Community"].map(o => (
                          <button key={o} onClick={() => setContentGoal(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentGoal === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    {/* Tone */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors ${contentTone !== "Professional" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <MessageCircle size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Tone</p>
                        {["Professional", "Casual", "Humorous", "Inspirational", "Educational", "Bold"].map(o => (
                          <button key={o} onClick={() => setContentTone(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentTone === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    {/* Language */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors ${contentLanguage !== "English" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Languages size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Language</p>
                        {["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Chinese", "Japanese", "Korean", "Hindi"].map(o => (
                          <button key={o} onClick={() => setContentLanguage(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentLanguage === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    {/* Frequency */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors ${contentFrequency !== "Daily" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Calendar size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Frequency</p>
                        {["Daily", "Twice Daily", "3x/Week", "Weekly", "Bi-Weekly", "Monthly"].map(o => (
                          <button key={o} onClick={() => setContentFrequency(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentFrequency === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    {/* Time */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors ${contentTime !== "9:00 AM" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Clock size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Posting Time</p>
                        {["6:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"].map(o => (
                          <button key={o} onClick={() => setContentTime(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentTime === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    {/* Style */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors ${contentStyle !== "Informative" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <PenTool size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Style</p>
                        {["Informative", "Storytelling", "List/Tips", "Behind-The-Scenes", "Tutorial", "Promotional"].map(o => (
                          <button key={o} onClick={() => setContentStyle(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentStyle === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    <div className="w-px h-5 bg-foreground/[0.08] mx-1" />

                    <div className="flex items-center gap-1.5">
                      <Eye size={13} className="text-muted" />
                      <span className="text-[0.72rem] text-muted font-medium">Brand</span>
                      <div
                        onClick={() => setBrandToggle(v => !v)}
                        className={`w-8 h-[18px] rounded-full transition-colors cursor-pointer relative ${brandToggle ? "bg-accent" : "bg-foreground/[0.15]"}`}
                      >
                        <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm ${brandToggle ? "left-[16px]" : "left-[2px]"}`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: enhance + mic + generate */}
              <div className="flex items-center gap-2">
                {prompt.trim() && (
                  <Tooltip><TooltipTrigger asChild>
                    <button type="button" onClick={handleEnhance} disabled={isEnhancing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted-foreground rounded-lg text-[0.78rem] font-medium transition-colors disabled:opacity-50">
                      {isEnhancing ? <Loader2 size={14} className="animate-spin text-purple-500" /> : <Sparkles size={14} className="text-purple-500" />}
                      <span>AI</span><ChevronDown size={12} className="text-muted" />
                    </button>
                  </TooltipTrigger><TooltipContent>Enhance Prompt</TooltipContent></Tooltip>
                )}
                {isSupported && !isListening && (
                  <Tooltip><TooltipTrigger asChild>
                    <button type="button" onClick={startListening} className="p-1.5 rounded-lg transition-colors bg-foreground/[0.04] text-muted hover:text-foreground"><Mic size={15} /></button>
                  </TooltipTrigger><TooltipContent>Speak</TooltipContent></Tooltip>
                )}
                <button type="button" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-white hover:bg-accent/85 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Active selections summary ── */}
        {(selectedCharacter || references.length > 0 || startFrame || endFrame || selectedGenre || selectedTheme) && (
          <div className="max-w-[820px] mx-auto mt-2 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Character selection */}
              {selectedCharacter && characterInfo && (
                <button
                  type="button"
                  onClick={() => togglePanel("character")}
                  className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${activePanel === "character" ? "border-accent bg-accent/10" : "border-foreground/[0.1] bg-foreground/[0.03] hover:border-accent/30"}`}
                >
                  {characterInfo.avatar ? (
                    <img src={characterInfo.avatar} alt={characterInfo.name} className="w-7 h-7 rounded-lg object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center"><User size={14} className="text-accent" /></div>
                  )}
                  <div className="text-left">
                    <span className="text-[0.68rem] text-muted/60 font-medium block leading-none">Character</span>
                    <span className="text-[0.78rem] font-semibold text-foreground leading-tight">{characterInfo.name}</span>
                  </div>
                  <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); setSelectedCharacter(null); }} />
                </button>
              )}

              {/* Reference images as thumbnails */}
              {references.length > 0 && (
                <button
                  type="button"
                  onClick={() => togglePanel("reference")}
                  className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${activePanel === "reference" ? "border-accent bg-accent/10" : "border-foreground/[0.1] bg-foreground/[0.03] hover:border-accent/30"}`}
                >
                  <div className="flex items-center -space-x-1.5">
                    {references.slice(0, 4).map((ref, i) => (
                      <img
                        key={ref.id}
                        src={ref.src}
                        alt={ref.name}
                        className="w-7 h-7 rounded-lg object-cover border-2 border-background"
                        style={{ zIndex: references.length - i }}
                      />
                    ))}
                    {references.length > 4 && (
                      <div className="w-7 h-7 rounded-lg bg-foreground/[0.08] border-2 border-background flex items-center justify-center text-[0.6rem] font-bold text-muted" style={{ zIndex: 0 }}>
                        +{references.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-[0.68rem] text-muted/60 font-medium block leading-none">References</span>
                    <span className="text-[0.78rem] font-semibold text-foreground leading-tight">{references.length} image{references.length !== 1 ? "s" : ""}</span>
                  </div>
                  <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); setReferences([]); }} />
                </button>
              )}

              {/* Frames selection */}
              {(startFrame || endFrame) && (
                <button
                  type="button"
                  onClick={() => togglePanel("frames")}
                  className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${activePanel === "frames" ? "border-accent bg-accent/10" : "border-foreground/[0.1] bg-foreground/[0.03] hover:border-accent/30"}`}
                >
                  <div className="flex items-center gap-1">
                    {startFrame && <img src={startFrame} alt="Start" className="w-7 h-7 rounded-lg object-cover" />}
                    {endFrame && <img src={endFrame} alt="End" className="w-7 h-7 rounded-lg object-cover" />}
                  </div>
                  <div className="text-left">
                    <span className="text-[0.68rem] text-muted/60 font-medium block leading-none">Frames</span>
                    <span className="text-[0.78rem] font-semibold text-foreground leading-tight">{startFrame && endFrame ? "Start + End" : startFrame ? "Start" : "End"}</span>
                  </div>
                  <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); setStartFrame(null); setEndFrame(null); }} />
                </button>
              )}

              {/* Music genre */}
              {selectedGenre && (
                <button
                  type="button"
                  onClick={() => togglePanel("music")}
                  className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${activePanel === "music" ? "border-accent bg-accent/10" : "border-foreground/[0.1] bg-foreground/[0.03] hover:border-accent/30"}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center"><Music size={14} className="text-green-600" /></div>
                  <div className="text-left">
                    <span className="text-[0.68rem] text-muted/60 font-medium block leading-none">Music</span>
                    <span className="text-[0.78rem] font-semibold text-foreground leading-tight capitalize">{selectedGenre}</span>
                  </div>
                  <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); setSelectedGenre(null); }} />
                </button>
              )}

              {/* Photoshoot theme */}
              {selectedTheme && (
                <button
                  type="button"
                  onClick={() => togglePanel("photoshoot")}
                  className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${activePanel === "photoshoot" ? "border-accent bg-accent/10" : "border-foreground/[0.1] bg-foreground/[0.03] hover:border-accent/30"}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center"><Camera size={14} className="text-orange-600" /></div>
                  <div className="text-left">
                    <span className="text-[0.68rem] text-muted/60 font-medium block leading-none">Theme</span>
                    <span className="text-[0.78rem] font-semibold text-foreground leading-tight capitalize">{selectedTheme}</span>
                  </div>
                  <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); setSelectedTheme(null); }} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Panels below prompt box ── */}
        <div className="max-w-[1100px] mx-auto">
          {activePanel === "reference" && (
            <ReferencePanel
              onClose={() => setActivePanel(null)}
              references={references}
              onAdd={ref => setReferences(prev => [...prev, ref])}
              onRemove={id => setReferences(prev => prev.filter(r => r.id !== id))}
            />
          )}
          {activePanel === "character" && (
            <CharacterPanel
              onClose={() => setActivePanel(null)}
              selectedCharacter={selectedCharacter}
              onSelect={setSelectedCharacter}
            />
          )}
          {activePanel === "frames" && showFrames && (
            <FramePanel
              onClose={() => setActivePanel(null)}
              startFrame={startFrame}
              endFrame={endFrame}
              onStartFrameChange={setStartFrame}
              onEndFrameChange={setEndFrame}
            />
          )}
          {activePanel === "music" && showMusic && (
            <MusicSamples
              onClose={() => setActivePanel(null)}
              selectedGenre={selectedGenre}
              onGenreSelect={setSelectedGenre}
              onUseStyle={genre => {
                setPrompt(prev => prev ? `${prev} — ${genre} style` : `Generate ${genre} music`);
              }}
            />
          )}
          {activePanel === "photoshoot" && showPhotoshoot && (
            <PhotoshootThemes
              onClose={() => setActivePanel(null)}
              selectedTheme={selectedTheme}
              onThemeSelect={id => {
                setSelectedTheme(id);
                if (id) {
                  const theme = ["EDITORIAL SHOTS","OLD MONEY","WINTER SPECIAL","CHRISTMAS MAGIC","HAIR GOALS","MAKEUP GLAM","FALL AESTHETIC","SPRING BLOOM"];
                  const idx = ["editorial","oldmoney","winter","christmas","hair","makeup","fall","spring"].indexOf(id);
                  if (idx >= 0) setPrompt(`Photoshoot in ${theme[idx]} theme`);
                }
              }}
            />
          )}
        </div>

        {/* Social content panel — stretch to parent edges */}
        {activePanel === "social" && showSocial && (
          <div className="mt-3 -mx-5 md:-mx-10">
            <SocialContentPanel onClose={() => setActivePanel(null)} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/* ─── Gallery card ───────────────────────────────────────────── */

function CreationCard({ item }: { item: UserCreation }) {
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
      <img src={item.image_url} alt={item.title || "Creation"} className="w-full aspect-square object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className={`absolute top-2 left-2 text-white text-[0.62rem] font-bold px-2 py-0.5 rounded-md ${typeColors[item.type] || "bg-black/50"} backdrop-blur-sm`}>{item.type.toUpperCase()}</div>
      <button onClick={() => setLiked(v => !v)} className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${liked ? "bg-accent text-white scale-110" : "bg-black/30 text-white opacity-0 group-hover:opacity-100"}`}>
        <Star size={12} className={liked ? "fill-current" : ""} />
      </button>
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex-1 min-w-0">
          <p className="text-[0.7rem] text-white font-medium truncate">{item.title || "Untitled"}</p>
        </div>
        <button onClick={() => { setSaved(v => !v); toast({ title: saved ? "Removed from collection" : "Saved to collection!" }); }}
          className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/35 text-white transition-colors">
          <Bookmark size={11} className={saved ? "fill-current" : ""} />
        </button>
        <a href={item.image_url} download className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/35 text-white transition-colors">
          <Download size={11} />
        </a>
      </div>
    </div>
  );
}

/* ─── Tabs ───────────────────────────────────────────────────── */

const TABS: { id: GalleryTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "creations",   label: "Creations",   icon: Sparkles },
  { id: "community",   label: "Community",   icon: Users },
  { id: "collections", label: "Collections", icon: FolderOpen },
  { id: "templates",   label: "Templates",   icon: LayoutGrid },
  { id: "apps",        label: "Apps",        icon: Package },
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
  const [creations, setCreations] = useState<UserCreation[]>([]);
  const [loadingCreations, setLoadingCreations] = useState(true);

  // Fetch real user creations from DB
  useEffect(() => {
    let cancelled = false;
    const fetchCreations = async () => {
      setLoadingCreations(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCreations([]); setLoadingCreations(false); return; }
      const { data } = await supabase
        .from("collection_images")
        .select("id, image_url, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!cancelled && data) {
        setCreations(data.map(r => ({ ...r, type: "image" as MediaFilter, liked: false })));
      }
      if (!cancelled) setLoadingCreations(false);
    };
    fetchCreations();
    return () => { cancelled = true; };
  }, [generated]);

  // Advanced filter state
  const [filterLikes, setFilterLikes] = useState(false);
  const [filterEdits, setFilterEdits] = useState(false);
  const [filterUpscales, setFilterUpscales] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const hasActiveFilters = filterLikes || filterEdits || filterUpscales || filterDateFrom || filterDateTo || mediaFilter !== "all";

  const clearFilters = () => {
    setMediaFilter("all");
    setFilterLikes(false);
    setFilterEdits(false);
    setFilterUpscales(false);
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const filteredCreations = mediaFilter === "all"
    ? creations
    : creations.filter(c => c.type === mediaFilter);

  return (
    <PageShell>
      <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-0 overflow-visible">
        <div className="mb-10">
          <PromptBox onGenerate={() => setGenerated(true)} />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-5 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.82rem] font-semibold transition-all ${activeTab === tab.id ? "bg-foreground/[0.06] text-foreground border border-foreground/[0.08]" : "text-muted hover:text-foreground"}`}>
                <tab.icon size={13} />{tab.label}
              </button>
            ))}
          </div>
          {activeTab === "creations" && (
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button type="button" className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[0.82rem] font-medium transition-colors ${hasActiveFilters ? "border-accent bg-accent/5 text-accent" : "border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"}`}>
                  <Filter size={14} />Filter{hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="end" sideOffset={6}>
                <div className="p-4">
                  <h3 className="text-[0.92rem] font-bold mb-4">Filter By</h3>

                  {/* Media type pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {MEDIA_FILTERS.map(f => (
                      <button key={f.id} type="button" onClick={() => setMediaFilter(f.id)}
                        className={`px-3 py-1 rounded-lg text-[0.75rem] font-medium border transition-colors ${mediaFilter === f.id ? "bg-accent/10 border-accent text-accent" : "border-foreground/[0.1] text-muted hover:text-foreground"}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2.5 mb-5">
                    {[
                      { label: "Likes", checked: filterLikes, set: setFilterLikes },
                      { label: "Edits", checked: filterEdits, set: setFilterEdits },
                      { label: "Upscales", checked: filterUpscales, set: setFilterUpscales },
                    ].map(item => (
                      <label key={item.label} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => item.set(!item.checked)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${item.checked ? "bg-accent border-accent" : "border-foreground/20 group-hover:border-foreground/40"}`}
                        >
                          {item.checked && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-[0.85rem] font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Date range */}
                  <div className="mb-1">
                    <h4 className="text-[0.85rem] font-bold mb-2">Date</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[0.7rem] text-muted font-medium mb-1 block">From</label>
                        <input
                          type="date"
                          value={filterDateFrom}
                          onChange={e => setFilterDateFrom(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-foreground/[0.12] bg-background text-[0.78rem] outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[0.7rem] text-muted font-medium mb-1 block">To</label>
                        <input
                          type="date"
                          value={filterDateTo}
                          onChange={e => setFilterDateTo(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-foreground/[0.12] bg-background text-[0.78rem] outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-foreground/[0.06]">
                  <button type="button" onClick={clearFilters}
                    className="flex-1 px-3 py-2 rounded-lg text-[0.82rem] font-medium text-muted hover:text-foreground transition-colors">
                    Clear
                  </button>
                  <button type="button" onClick={() => setFilterOpen(false)}
                    className="flex-1 px-3 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-colors">
                    Apply
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {activeTab === "creations" && (
          <div>
            {loadingCreations ? (
              <div className="text-center py-20">
                <Loader2 className="w-7 h-7 text-muted animate-spin mx-auto mb-3" />
                <p className="text-[0.84rem] text-muted">Loading your creations…</p>
              </div>
            ) : filteredCreations.length === 0 && creations.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-accent" />
                </div>
                <h3 className="font-display font-black text-[1.6rem] tracking-[-0.02em] mb-3">Your canvas is empty</h3>
                <p className="text-[0.92rem] text-muted max-w-md mx-auto mb-6 leading-relaxed">
                  Use the prompt box above to generate your first image, video, or design — or explore community creations for inspiration.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-primary-foreground text-[0.84rem] font-bold hover:bg-accent/85 transition-colors"
                  >
                    <Sparkles size={15} /> Start Creating
                  </button>
                  <button
                    onClick={() => setActiveTab("community")}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-foreground/[0.12] text-foreground text-[0.84rem] font-semibold hover:border-foreground/30 transition-colors"
                  >
                    <Users size={15} /> Explore Community
                  </button>
                </div>
              </div>
            ) : filteredCreations.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4"><Sparkles className="w-7 h-7 text-accent" /></div>
                <h3 className="font-display font-black text-[1.1rem] mb-2">No {mediaFilter} creations yet</h3>
                <p className="text-[0.84rem] text-muted">Use the prompt box above to generate your first {mediaFilter}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredCreations.map(item => <CreationCard key={item.id} item={item} />)}
              </div>
            )}
          </div>
        )}

        {/* COMMUNITY */}
        {activeTab === "community" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-[1.1rem] tracking-[-0.02em]">Trending Now</h2>
              <Link to="/explore" className="flex items-center gap-1 text-[0.78rem] font-medium text-muted hover:text-foreground transition-colors no-underline">Explore All <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {DUMMY_COMMUNITY.map((item, i) => (
                <Link key={item.id} to={`/image/${i}`} className="group relative rounded-2xl overflow-hidden block no-underline">
                  <img src={`https://images.unsplash.com/${item.photo}?w=400&h=400&fit=crop&q=80`} alt={item.prompt} className="w-full aspect-square object-cover" />
                  <ImageCardOverlay index={i} photo={item.photo} title={item.prompt.slice(0, 30)} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TEMPLATES */}
        {activeTab === "templates" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-[1.1rem] tracking-[-0.02em]">Start with a Template</h2>
              <div className="flex items-center gap-1 p-0.5 bg-foreground/[0.04] rounded-lg border border-foreground/[0.06]">
                {["All","Design","Video","Image","Audio","Content"].map(cat => (
                  <button key={cat} className="px-2.5 py-1 rounded-md text-[0.74rem] font-medium text-muted hover:text-foreground hover:bg-background transition-colors first:text-foreground first:bg-background first:shadow-sm">{cat}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {DUMMY_TEMPLATES.map(t => (
                <div key={t.id} className="group cursor-pointer">
                  <div className="relative rounded-2xl overflow-hidden mb-2.5">
                    <img src={`https://images.unsplash.com/${t.photo}?w=400&h=300&fit=crop&q=80`} alt={t.name} className="w-full aspect-[4/3] object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button onClick={() => toast({ title: `"${t.name}" template loaded!` })} className="flex items-center gap-1.5 bg-white text-foreground text-[0.78rem] font-bold px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"><Zap size={13} /> Use Template</button>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[0.62rem] font-semibold px-2 py-0.5 rounded-md">{t.category}</div>
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

        {/* APPS */}
        {activeTab === "apps" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-[1.1rem] tracking-[-0.02em]">AI-Powered Apps</h2>
              <Link to="/apps" className="flex items-center gap-1 text-[0.78rem] font-medium text-muted hover:text-foreground transition-colors no-underline">Browse all <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {DUMMY_APPS.map(app => (
                <button key={app.id} type="button" onClick={() => toast({ title: `Opening ${app.name}…` })}
                  className="group text-left p-5 rounded-2xl border border-foreground/[0.08] bg-background hover:border-foreground/20 hover:shadow-md transition-all">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${app.color} transition-transform group-hover:scale-110`}><app.icon size={20} /></div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-[0.88rem] font-bold leading-tight">{app.name}</h3>
                    {app.badge && <span className={`shrink-0 text-[0.6rem] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide ${app.badge === "Popular" ? "bg-accent/10 text-accent" : "bg-emerald-100 text-emerald-700"}`}>{app.badge}</span>}
                  </div>
                  <p className="text-[0.76rem] text-muted leading-snug mb-3">{app.desc}</p>
                  <div className="flex items-center gap-1 text-[0.7rem] text-muted"><Users size={11} /> {app.users} users</div>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-foreground/[0.08] bg-gradient-to-r from-accent/5 to-purple-50 p-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[0.72rem] font-bold text-accent uppercase tracking-widest mb-1">Featured</div>
                <h3 className="font-display font-black text-[1.2rem] tracking-[-0.02em] mb-1">REVVEN App Store</h3>
                <p className="text-[0.84rem] text-muted">Discover 200+ AI-powered apps built for creators, marketers, and builders.</p>
              </div>
              <button className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-primary-foreground text-[0.84rem] font-bold hover:bg-accent transition-colors"><ArrowRight size={15} /> Browse Store</button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
