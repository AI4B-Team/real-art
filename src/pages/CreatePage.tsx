import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "react-router-dom";
import {
  Image, Video, Music, Palette, Calendar, FileText, Code,
  ChevronDown, ChevronUp, Send, Mic, MicOff, Sparkles, Shuffle,
  X, Check, Loader2, Zap, ImageIcon,
  Layers, Pencil, RefreshCw, Camera,
  Play, MessageCircle, Move, User, BookOpen, Presentation, Clapperboard,
  Headphones, AudioLines, Captions,
  Copy, Hash, Clock, SlidersHorizontal,
  LayoutGrid, Filter, Star, Download, Bookmark, Plus,
  Bot, Globe, Heart, Users, Wand2, Lock,
  ArrowRight, ArrowUp, Search, Cpu,
  Film, Package, BarChart2, ShoppingBag, Brush,
  Eye, Target, Languages, Repeat, PenTool, FolderOpen, Flag,
  Github, Smile, Rss, ShoppingCart,
  Minus, Settings, Upload, ArrowLeftRight, Briefcase, GraduationCap,
  Link as LinkChain,
} from "lucide-react";

const ChainLinkIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
import stylePhotorealistic from "@/assets/styles/photorealistic.jpg";
import styleAnime from "@/assets/styles/anime.jpg";
import styleDigitalArt from "@/assets/styles/digital-art.jpg";
import styleOilPainting from "@/assets/styles/oil-painting.jpg";
import styleWatercolor from "@/assets/styles/watercolor.jpg";
import style3dRender from "@/assets/styles/3d-render.jpg";
import stylePixelArt from "@/assets/styles/pixel-art.jpg";
import styleComicBook from "@/assets/styles/comic-book.jpg";
import styleCinematic from "@/assets/styles/cinematic.jpg";
import styleFlatIllustration from "@/assets/styles/flat-illustration.jpg";
import styleArtNouveau from "@/assets/styles/art-nouveau.jpg";
import styleCyberpunk from "@/assets/styles/cyberpunk.jpg";
import stylePopArt from "@/assets/styles/pop-art.jpg";
import styleImpressionist from "@/assets/styles/impressionist.jpg";
import styleUkiyoE from "@/assets/styles/ukiyo-e.jpg";
import styleSteampunk from "@/assets/styles/steampunk.jpg";
import styleVaporwave from "@/assets/styles/vaporwave.jpg";
import styleSketch from "@/assets/styles/sketch.jpg";
import styleSurreal from "@/assets/styles/surreal.jpg";
import styleIsometric from "@/assets/styles/isometric.jpg";
import styleGothic from "@/assets/styles/gothic.jpg";
import stylePastel from "@/assets/styles/pastel.jpg";
import styleStainedGlass from "@/assets/styles/stained-glass.jpg";
import stylePointillism from "@/assets/styles/pointillism.jpg";
import styleRetro from "@/assets/styles/retro.jpg";
import styleVideoCinematic from "@/assets/styles/video-cinematic.jpg";
import styleVideoDocumentary from "@/assets/styles/video-documentary.jpg";
import styleVideoAnimation from "@/assets/styles/video-animation.jpg";
import styleVideoRealistic from "@/assets/styles/video-realistic.jpg";
import styleMoodBold from "@/assets/styles/mood-bold.jpg";
import styleMoodMinimal from "@/assets/styles/mood-minimal.jpg";
import styleMoodNeon from "@/assets/styles/mood-neon.jpg";
import styleMoodEarthy from "@/assets/styles/mood-earthy.jpg";
import styleMoodMonochrome from "@/assets/styles/mood-monochrome.jpg";
import styleMoodGradient from "@/assets/styles/mood-gradient.jpg";
import presMinimalist from "@/assets/styles/pres-minimalist.jpg";
import presPlayful from "@/assets/styles/pres-playful.jpg";
import presOrganic from "@/assets/styles/pres-organic.jpg";
import presGeometric from "@/assets/styles/pres-geometric.jpg";
import presModular from "@/assets/styles/pres-modular.jpg";
import presElegant from "@/assets/styles/pres-elegant.jpg";
import presDigital from "@/assets/styles/pres-digital.jpg";
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
import FrameSourcePicker from "@/components/create/FrameSourcePicker";
import type { FrameSelectionMeta } from "@/components/create/FrameSourcePicker";
import FramePickerModal from "@/components/create/FramePickerModal";
import MusicSamples from "@/components/create/MusicSamples";
import PhotoshootThemes from "@/components/create/PhotoshootThemes";
import SocialContentPanel from "@/components/create/SocialContentPanel";
import CharacterPanel from "@/components/create/CharacterPanel";
import StoryScenesPanel, { makeScene, type StoryScene } from "@/components/create/StoryScenesPanel";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import { PROMPT_SAMPLE_ASSETS, PROMPT_CHIP_ICONS, createChipElement, makeUploadedImageChip, type AssetChip } from "@/lib/promptChips";
import { useAtMention } from "@/hooks/useAtMention";
import MentionDropdown from "@/components/MentionDropdown";

/* ─── Types ─────────────────────────────────────────────────── */

type ContentType = "image" | "video" | "audio" | "design" | "content" | "document" | "app";
type GalleryTab = "creations" | "collections" | "apps" | "templates" | "community";
type MediaFilter = "all" | "image" | "video" | "audio" | "design";
type PanelType = "reference" | "character" | "style" | "frames" | "music" | "photoshoot" | "social" | "github" | "advanced" | "source" | null;

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
  { id: "document", label: "Document", icon: FileText, color: "text-blue-500",   bg: "bg-blue-50",    border: "border-blue-200",   promptBorder: "border-blue-400" },
  { id: "app",      label: "App",      icon: Code,     color: "text-rose-500",   bg: "bg-rose-50",    border: "border-rose-200",   promptBorder: "border-rose-400" },
];

/* ─── Sub-modes per type ─────────────────────────────────────── */

const SUB_MODES: Record<ContentType, { id: string; label: string; icon: typeof Image }[]> = {
  image: [
    { id: "generate",   label: "Create",   icon: Sparkles },
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
    { id: "presentation", label: "Presentation", icon: Presentation },
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
    { id: "business-plan", label: "Business Plan",icon: Package },
    { id: "handbook",      label: "Handbook",     icon: Layers },
    { id: "proposal",      label: "Proposal",     icon: PenTool },
    { id: "case-study",    label: "Case Study",   icon: Target },
    { id: "cover-letter",  label: "Cover Letter", icon: Pencil },
  ],
  app: [
    { id: "web-app",   label: "Web App",   icon: Code },
    { id: "ai-agent",  label: "AI Agent",  icon: Bot },
    { id: "saas",      label: "SaaS",      icon: Package },
    { id: "website",   label: "Website",   icon: LayoutGrid },
    { id: "plan",      label: "Plan",      icon: FileText },
  ],
};

const APP_BUILD_MODES: { id: string; label: string; icon: typeof Image }[] = [
  { id: "landing",     label: "Landing Page",    icon: FileText },
  { id: "multi-page",  label: "Multi-Page Site", icon: LayoutGrid },
  { id: "link-in-bio", label: "Link In Bio",     icon: ChainLinkIcon as any },
  { id: "blog",        label: "Blog",            icon: Rss },
  { id: "membership",  label: "Membership",      icon: Lock },
  { id: "ecommerce",   label: "Ecommerce",       icon: ShoppingCart },
];

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

function PromptBox({ onGenerate }: { onGenerate: (info: { type: ContentType | null; prompt: string; subMode: string | null }) => void }) {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<ContentType | null>(() => {
    const t = searchParams.get("type");
    return t && ["image","video","audio","design","content","document","app"].includes(t) ? t as ContentType : null;
  });
  const [selectedSubMode, setSelectedSubMode] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(() => searchParams.get("prompt") || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExtractingPrompt, setIsExtractingPrompt] = useState(false);
  const promptFileRef = useRef<HTMLInputElement>(null);
  const startFrameRef = useRef<HTMLInputElement>(null);
  const endFrameRef = useRef<HTMLInputElement>(null);
  const [promptFocused, setPromptFocused] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [subModeOpen, setSubModeOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [ratioOpen, setRatioOpen] = useState(false);
  const [numberOpen, setNumberOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Auto");
  const [selectedStyle, setSelectedStyle] = useState("None");
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState("10s");
  const [selectedResolution, setSelectedResolution] = useState("1080p");
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [brandToggle, setBrandToggle] = useState(() => !!localStorage.getItem("ra_brand_complete"));
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");

  // Load brands from localStorage (synced with sidebar)
  const loadBrandsData = () => {
    try {
      const s = localStorage.getItem("ra_brands");
      if (s) return JSON.parse(s) as { brands: { id: string; name: string }[]; activeId: string };
    } catch {}
    return { brands: [{ id: "default", name: "My Brand" }], activeId: "default" };
  };
  const [brandsData, setBrandsData] = useState(loadBrandsData);
  const activeBrandProfile = brandsData.brands.find(b => b.id === brandsData.activeId) || brandsData.brands[0];

  const switchBrandProfile = (id: string) => {
    const updated = { ...brandsData, activeId: id };
    setBrandsData(updated);
    try { localStorage.setItem("ra_brands", JSON.stringify(updated)); } catch {}
    // Dispatch storage event so sidebar picks up the change
    window.dispatchEvent(new StorageEvent("storage", { key: "ra_brands", newValue: JSON.stringify(updated) }));
    setBrandPickerOpen(false);
    setBrandSearch("");
  };

  // Listen for sidebar brand changes
  useEffect(() => {
    const handler = () => setBrandsData(loadBrandsData());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  const [contentGoal, setContentGoal] = useState("Engagement");
  const [contentTone, setContentTone] = useState<string | null>(null);
  const [contentLanguage, setContentLanguage] = useState<string | null>(null);
  const [contentToneOpen, setContentToneOpen] = useState(false);
  const [contentLangOpen, setContentLangOpen] = useState(false);
  const [contentFrequency, setContentFrequency] = useState("Daily");
  const [contentTime, setContentTime] = useState("9:00 AM");
  const [contentStyle, setContentStyle] = useState("Informative");

  // Document-specific states
  const [docLanguage, setDocLanguage] = useState<string | null>(null);
  const [docTone, setDocTone] = useState<string | null>(null);
  const [docModel, setDocModel] = useState("Auto");
  const [docModelOpen, setDocModelOpen] = useState(false);
  
  const [docLangOpen, setDocLangOpen] = useState(false);
  const [docLangSearch, setDocLangSearch] = useState("");
  const textareaRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Design sub-mode specific states
  const [designColorScheme, setDesignColorScheme] = useState("Auto");
  const [designColorOpen, setDesignColorOpen] = useState(false);
  const [designIconStyle, setDesignIconStyle] = useState("Modern");
  const [designIconStyleOpen, setDesignIconStyleOpen] = useState(false);
  const [designIndustry, setDesignIndustry] = useState<string | null>(null);
  const [designIndustryOpen, setDesignIndustryOpen] = useState(false);
  const [designOrientation, setDesignOrientation] = useState("Portrait");
  const [designOrientationOpen, setDesignOrientationOpen] = useState(false);
  const [designPlatform, setDesignPlatform] = useState("YouTube");
  const [designPlatformOpen, setDesignPlatformOpen] = useState(false);
  const [designFinish, setDesignFinish] = useState("Matte");
  const [designFinishOpen, setDesignFinishOpen] = useState(false);
  const [designFoldType, setDesignFoldType] = useState("Tri-Fold");
  const [designFoldOpen, setDesignFoldOpen] = useState(false);
  const [designPages, setDesignPages] = useState(6);
  const [designPagesOpen, setDesignPagesOpen] = useState(false);
  const [designChartType, setDesignChartType] = useState("Mixed");
  const [designChartOpen, setDesignChartOpen] = useState(false);
  const [designLayout, setDesignLayout] = useState("Vertical");
  const [designLayoutOpen, setDesignLayoutOpen] = useState(false);
  const [designSize, setDesignSize] = useState("A4");
  const [designSizeOpen, setDesignSizeOpen] = useState(false);
  const [designTextStyle, setDesignTextStyle] = useState("Bold");
  const [designTextStyleOpen, setDesignTextStyleOpen] = useState(false);

  // Presentation-specific states
  const [presDeckStyle, setPresDeckStyle] = useState("Minimalist");
  const [presDeckStyleOpen, setPresDeckStyleOpen] = useState(false);
  const [presAudience, setPresAudience] = useState("Casual");
  const [presAudienceOpen, setPresAudienceOpen] = useState(false);
  const [presLength, setPresLength] = useState("Balanced");
  const [presLengthOpen, setPresLengthOpen] = useState(false);
  const [appModel, setAppModel] = useState("Auto");
  const [appModelOpen, setAppModelOpen] = useState(false);
  const [appTheme, setAppTheme] = useState("Default");
  const [appThemeOpen, setAppThemeOpen] = useState(false);
  const [appThemeSearch, setAppThemeSearch] = useState("");
  const [appBudget, setAppBudget] = useState(25);
  const [appTemplate, setAppTemplate] = useState("");
  const [appGithubUrl, setAppGithubUrl] = useState("");
  const [appGithubTab, setAppGithubTab] = useState<"private" | "public">("private");
  const [appBuildMode, setAppBuildMode] = useState<string | null>(null);
  const [appBuildOpen, setAppBuildOpen] = useState(false);
  const [storyScenes, setStoryScenes] = useState<StoryScene[]>([makeScene()]);
  const [storyMode, setStoryMode] = useState<"auto" | "manual">("auto");
  const [storyModeOpen, setStoryModeOpen] = useState(false);

  // Voiceover-specific states
  const [voiceoverVoice, setVoiceoverVoice] = useState("Auto");
  const [voiceoverVoiceOpen, setVoiceoverVoiceOpen] = useState(false);
  const [voiceoverLanguage, setVoiceoverLanguage] = useState("English");
  const [voiceoverLanguageOpen, setVoiceoverLanguageOpen] = useState(false);
  const [voiceoverAccent, setVoiceoverAccent] = useState("Neutral");
  const [voiceoverAccentOpen, setVoiceoverAccentOpen] = useState(false);
  const [voiceoverSpeed, setVoiceoverSpeed] = useState("Normal");
  const [voiceoverSpeedOpen, setVoiceoverSpeedOpen] = useState(false);
  const [voiceoverTone, setVoiceoverTone] = useState("Auto");
  const [voiceoverToneOpen, setVoiceoverToneOpen] = useState(false);
  const [voiceoverLangSearch, setVoiceoverLangSearch] = useState("");

  // Panel states
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [references, setReferences] = useState<{ id: string; src: string; name: string }[]>([]);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  // Track what source each frame came from for cleanup
  const [startFrameMeta, setStartFrameMeta] = useState<{ sourceType: string; characterId?: string; refId?: string } | null>(null);
  const [endFrameMeta, setEndFrameMeta] = useState<{ sourceType: string; characterId?: string; refId?: string } | null>(null);
  const [startFrameLocked, setStartFrameLocked] = useState(false);
  const [endFrameLocked, setEndFrameLocked] = useState(false);
  const [framePickerTarget, setFramePickerTarget] = useState<"start" | "end" | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [characterInfoMap, setCharacterInfoMap] = useState<Record<string, { name: string; avatar: string | null }>>({});

  // Source panel tab & link state
  const [activeSourceTab, setActiveSourceTab] = useState("upload");
  const [sourceUrl, setSourceUrl] = useState("");
  const [addedLinks, setAddedLinks] = useState<string[]>([]);
  const [sourceFiles, setSourceFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState("");
  const sourceFileRef = useRef<HTMLInputElement>(null);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const audioRecogRef = useRef<any>(null);

  // Chip/asset picker state
  const [chipIds, setChipIds] = useState<Set<string>>(new Set());
  const [uploadedImgCount, setUploadedImgCount] = useState(0);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const savedRangeRef = useRef<Range | null>(null);
  const pendingFocusRangeRef = useRef<Range | null>(null);
  const imgUploadRef = useRef<HTMLInputElement>(null);
  const isInternalEditRef = useRef(false);
  const { mention, checkForMention, consumeMention, dismissMention } = useAtMention(textareaRef);

  // Helper to clear a frame and remove associated character/reference
  const clearFrame = (which: "start" | "end") => {
    const meta = which === "start" ? startFrameMeta : endFrameMeta;
    const isClearingLastFrame =
      (which === "start" && !endFrame) ||
      (which === "end" && !startFrame);

    if (meta) {
      if (meta.sourceType === "character" && meta.characterId) {
        setSelectedCharacters(prev => prev.filter(c => c !== meta.characterId));
      }
      if (meta.refId) {
        setReferences(prev => prev.filter(r => r.id !== meta.refId));
      }
    }

    if (which === "start") {
      setStartFrame(null);
      setStartFrameMeta(null);
      setStartFrameLocked(false);
    } else {
      setEndFrame(null);
      setEndFrameMeta(null);
      setEndFrameLocked(false);
    }

    if (isClearingLastFrame) {
      setSelectedCharacters([]);
      setReferences([]);
      setCharacterInfoMap({});
    }
  };


  const FEATURED_CHARS_LOOKUP = [
    { id: "f1", name: "Alex", avatar: "photo-1507003211169-0a1dd7228f2d" },
    { id: "f2", name: "Mia", avatar: "photo-1534528741775-53994a69daeb" },
    { id: "f3", name: "Jordan", avatar: "photo-1519085360753-af0119f7cbe7" },
    { id: "f4", name: "Suki", avatar: "photo-1438761681033-6461ffad8d80" },
    { id: "f5", name: "Marcus", avatar: "photo-1506794778202-cad84cf45f1d" },
    { id: "f6", name: "Leila", avatar: "photo-1487412720507-e7ab37603c6f" },
    { id: "f7", name: "Kai", avatar: "photo-1492562080023-ab3db95bfbce" },
    { id: "f8", name: "Nadia", avatar: "photo-1494790108377-be9c29b29330" },
    { id: "f9", name: "Ravi", avatar: "photo-1500648767791-00dcc994a43e" },
    { id: "f10", name: "Zara", avatar: "photo-1531746020798-e6953c6e8e04" },
    { id: "f11", name: "Ethan", avatar: "photo-1472099645785-5658abf4ff4e" },
    { id: "f12", name: "Luna", avatar: "photo-1529626455594-4ff0802cfb7e" },
    { id: "f13", name: "Derek", avatar: "photo-1504257432389-52343af06ae3" },
    { id: "f14", name: "Aria", avatar: "photo-1544005313-94ddf0286df2" },
    { id: "f15", name: "Theo", avatar: "photo-1506277886164-e25aa3f4ef7f" },
    { id: "f16", name: "Ivy", avatar: "photo-1524504388940-b1c1722653e1" },
    { id: "f17", name: "Omar", avatar: "photo-1522075469751-3a6694fb2f61" },
    { id: "f18", name: "Cleo", avatar: "photo-1517841905240-472988babdf9" },
    { id: "f19", name: "Felix", avatar: "photo-1521119989659-a83eee488004" },
    { id: "f20", name: "Sage", avatar: "photo-1488426862026-3ee34a7d66df" },
    { id: "f21", name: "Dante", avatar: "photo-1539571696357-5a69c17a67c6" },
    { id: "f22", name: "Yuki", avatar: "photo-1502823403499-6ccfcf4fb453" },
    { id: "f23", name: "Blake", avatar: "photo-1507591064344-4c6ce005b128" },
    { id: "f24", name: "Rosa", avatar: "photo-1524638431109-93d95c968f03" },
  ];

  // Fetch character info for all selected characters
  useEffect(() => {
    if (selectedCharacters.length === 0) { setCharacterInfoMap({}); return; }

    const newMap: Record<string, { name: string; avatar: string | null }> = {};
    const dbIds: string[] = [];

    for (const id of selectedCharacters) {
      if (id.startsWith("f")) {
        const found = FEATURED_CHARS_LOOKUP.find(c => c.id === id);
        if (found) newMap[id] = { name: found.name, avatar: `https://images.unsplash.com/${found.avatar}?w=120&h=120&fit=crop&q=80` };
      } else {
        dbIds.push(id);
      }
    }

    if (dbIds.length === 0) {
      setCharacterInfoMap(newMap);
      return;
    }

    const fetchDbChars = async () => {
      const { data } = await supabase.from("characters").select("id, name, avatar_url").in("id", dbIds);
      if (data) data.forEach(d => { newMap[d.id] = { name: d.name, avatar: d.avatar_url }; });
      setCharacterInfoMap(newMap);
    };
    fetchDbChars();
  }, [selectedCharacters]);

  const toggleCharacter = (id: string) => {
    if (selectedCharacters.includes(id)) {
      setSelectedCharacters(prev => prev.filter(c => c !== id));
      // If removing a character in video mode, clear its frame
      if (selectedType === "video") {
        const info = characterInfoMap[id];
        if (info?.avatar) {
          if (startFrame === info.avatar) { setStartFrame(null); setStartFrameMeta(null); }
          if (endFrame === info.avatar) { setEndFrame(null); setEndFrameMeta(null); }
        }
      }
    } else {
      if (selectedType === "video") {
        // In video mode, max 2 characters (start + end frame)
        setSelectedCharacters(prev => {
          if (prev.length >= 2) return prev;
          return [...prev, id];
        });
        // Unlock whichever frame is empty so auto-fill can populate it
        if (!startFrame) setStartFrameLocked(false);
        else if (!endFrame) setEndFrameLocked(false);
      } else {
        setSelectedCharacters(prev => [...prev, id]);
      }
    }
  };

  // Auto-populate video frames from character selections — fill whichever slot is empty
  useEffect(() => {
    if (selectedType !== "video") return;
    
    // Build ordered list of new character avatars that aren't already placed
    const newChars: { id: string; avatar: string }[] = [];
    for (const id of selectedCharacters) {
      const info = characterInfoMap[id];
      if (!info?.avatar) continue;
      const alreadyPlaced =
        (startFrameMeta?.sourceType === "character" && startFrameMeta?.characterId === id) ||
        (endFrameMeta?.sourceType === "character" && endFrameMeta?.characterId === id);
      if (!alreadyPlaced) newChars.push({ id, avatar: info.avatar });
    }
    
    for (const char of newChars) {
      // Fill whichever frame is empty (start first, then end)
      if (!startFrame && !startFrameLocked) {
        setStartFrame(char.avatar);
        setStartFrameMeta({ sourceType: "character", characterId: char.id });
      } else if (!endFrame && !endFrameLocked) {
        setEndFrame(char.avatar);
        setEndFrameMeta({ sourceType: "character", characterId: char.id });
      }
    }
  }, [selectedType, selectedCharacters, characterInfoMap, startFrameLocked, endFrameLocked, startFrame, endFrame, startFrameMeta, endFrameMeta]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync URL params into state (handles recreate navigations while already on /create)
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    const urlType = searchParams.get("type");
    if (urlPrompt) {
      setPrompt(urlPrompt);
      setTimeout(() => { textareaRef.current?.focus(); }, 0);
    }
    if (urlType && ["image","video","audio","design","content","document","app"].includes(urlType)) {
      setSelectedType(urlType as ContentType);
    }
    if (urlPrompt || urlType) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps


  const typeCfg = selectedType ? CONTENT_TYPES.find(t => t.id === selectedType)! : null;
  const subModes = selectedType ? SUB_MODES[selectedType] : [];
  const selectedSubObj = subModes.find(s => s.id === selectedSubMode);

  const handleTypeSelect = (id: ContentType) => {
    setSelectedType(id);
    setSelectedSubMode(null);
    setSelectedModel("Auto");
    setSelectedStyle("None");
    setPrompt("");
    setSelectedCharacters([]);
    setReferences([]);
    setStartFrame(null);
    setEndFrame(null);
    setStartFrameMeta(null);
    setEndFrameMeta(null);
    setStartFrameLocked(false);
    setEndFrameLocked(false);
    setStoryScenes([makeScene()]);
    setStoryMode("auto");
    setTypeDropdownOpen(false);
    setActivePanel(null);
    // Reset design-specific states
    setDesignColorScheme("Auto");
    setDesignIconStyle("Modern");
    setDesignIndustry(null);
    setDesignOrientation("Portrait");
    setDesignPlatform("YouTube");
    setDesignFinish("Matte");
    setDesignFoldType("Tri-Fold");
    setDesignPages(6);
    setDesignChartType("Mixed");
    setDesignLayout("Vertical");
    setDesignSize("A4");
    setDesignTextStyle("Bold");
    textareaRef.current?.focus();
  };

  // Auto-open panels based on sub-mode selection
  const handleSubModeSelect = (modeId: string) => {
    setSelectedSubMode(modeId);
    setSubModeOpen(false);
    // Auto-show relevant panel
    if (selectedType === "audio" && modeId === "music") setActivePanel("music");
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
    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: { prompt: prompt.trim(), type: selectedType || "image" },
      });
      if (error) throw error;
      if (data?.enhanced) {
        setPrompt(data.enhanced);
      } else {
        setPrompt(p => p.trimEnd() + " — ultra detailed, professional quality, award-winning.");
      }
      toast({ title: "Prompt enhanced!" });
    } catch (e: any) {
      console.error("Enhance error:", e);
      setPrompt(p => p.trimEnd() + " — ultra detailed, professional quality, award-winning.");
      toast({ title: "Prompt enhanced!" });
    } finally {
      setIsEnhancing(false);
    }
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
    const currentPrompt = prompt;
    const currentType = selectedType;
    const currentSubMode = selectedSubMode;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    onGenerate({ type: currentType, prompt: currentPrompt, subMode: currentSubMode });
    if (currentType !== "app") {
      toast({ title: "Generation complete!", description: "Your creation is ready below." });
    }
  };

  const { isListening, isSupported, startListening, cancel: cancelSpeech, accept: acceptSpeech, currentTranscript } = useSpeech();

  const handleAcceptSpeech = () => {
    const result = acceptSpeech();
    if (result) setPrompt(prev => prev ? prev + "\n\n" + result : result);
  };

  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  // ── Chip/contentEditable helpers ──
  const extractText = useCallback(() => {
    if (!textareaRef.current) return "";
    let text = "";
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent || "";
      else if (node.nodeName === "BR") text += "\n";
      else if (!(node as HTMLElement).dataset?.chipId) node.childNodes.forEach(walk);
    };
    textareaRef.current.childNodes.forEach(walk);
    return text;
  }, []);

  const syncPromptFromEditable = useCallback(() => {
    isInternalEditRef.current = true;
    setPrompt(extractText());
  }, [extractText]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && textareaRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreEditableCaret = useCallback((range?: Range | null) => {
    const el = textareaRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      const selection = window.getSelection();
      if (!selection) return;
      selection.removeAllRanges();
      if (range) selection.addRange(range);
    });
  }, []);

  const handleAssetPopoverCloseAutoFocus = useCallback((event: Event) => {
    if (!pendingFocusRangeRef.current) return;
    event.preventDefault();
    const range = pendingFocusRangeRef.current.cloneRange();
    pendingFocusRangeRef.current = null;
    restoreEditableCaret(range);
  }, [restoreEditableCaret]);

  const removeChip = useCallback((id: string) => {
    setChipIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    syncPromptFromEditable();
  }, [syncPromptFromEditable]);

  const addChip = useCallback((type: AssetChip["type"], item: { id: string; label: string; thumbnail?: string }) => {
    if (chipIds.has(item.id)) return;
    const chip: AssetChip = { id: item.id, type, label: item.label, thumbnail: item.thumbnail };
    setChipIds(prev => new Set(prev).add(item.id));
    setAssetPickerOpen(false);
    setAssetSearch("");

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      if (!sel) return;

      let range: Range;
      if (savedRangeRef.current && el.contains(savedRangeRef.current.startContainer)) {
        range = savedRangeRef.current;
      } else {
        range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
      }

      sel.removeAllRanges();
      sel.addRange(range);

      const chipEl = createChipElement(chip, removeChip);
      range.deleteContents();
      range.insertNode(chipEl);

      const space = document.createTextNode("\u00A0");
      chipEl.after(space);

      const newRange = document.createRange();
      newRange.setStart(space, space.textContent?.length ?? 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      const caretRange = newRange.cloneRange();
      savedRangeRef.current = caretRange;
      pendingFocusRangeRef.current = caretRange;
      syncPromptFromEditable();

      requestAnimationFrame(() => {
        el.focus({ preventScroll: true });
        const visibleSelection = window.getSelection();
        if (!visibleSelection) return;
        visibleSelection.removeAllRanges();
        visibleSelection.addRange(newRange);
      });
    });
  }, [chipIds, removeChip, syncPromptFromEditable]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      const chip = makeUploadedImageChip(uploadedImgCount, url);
      setUploadedImgCount(prev => prev + 1);
      addChip(chip.type, { id: chip.id, label: chip.label, thumbnail: chip.thumbnail });
    });
    e.target.value = "";
  }, [uploadedImgCount, addChip]);

  const addChipFromMention = useCallback((type: AssetChip["type"], item: { id: string; label: string; thumbnail?: string }) => {
    if (chipIds.has(item.id)) return;
    const chip: AssetChip = { id: item.id, type, label: item.label, thumbnail: item.thumbnail };
    const rangeAtMention = consumeMention();
    setChipIds(prev => new Set(prev).add(item.id));

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      if (!sel) return;

      let range = rangeAtMention;
      if (!range || !el.contains(range.startContainer)) {
        range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
      }
      sel.removeAllRanges();
      sel.addRange(range);

      const chipEl = createChipElement(chip, removeChip);
      range.deleteContents();
      range.insertNode(chipEl);

      const space = document.createTextNode("\u00A0");
      chipEl.after(space);
      const newRange = document.createRange();
      newRange.setStart(space, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      savedRangeRef.current = newRange.cloneRange();
      pendingFocusRangeRef.current = newRange.cloneRange();
      syncPromptFromEditable();
      restoreEditableCaret(newRange.cloneRange());
    });
  }, [chipIds, consumeMention, removeChip, restoreEditableCaret, syncPromptFromEditable]);


  const filteredAssets = PROMPT_SAMPLE_ASSETS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      assetSearch ? item.label.toLowerCase().includes(assetSearch.toLowerCase()) : true
    ),
  })).filter(cat => cat.items.length > 0);

  // Sync external prompt changes (shuffle, enhance, speech) to contentEditable
  useEffect(() => {
    if (isInternalEditRef.current) {
      isInternalEditRef.current = false;
      return;
    }
    const el = textareaRef.current;
    if (!el) return;

    // Save chip elements before clearing
    const chipEls = Array.from(el.querySelectorAll('[data-chip-id]'));
    el.textContent = '';

    // Re-add chips
    chipEls.forEach(chipEl => {
      el.appendChild(chipEl);
      el.appendChild(document.createTextNode('\u00A0'));
    });

    // Add new text
    if (prompt) {
      el.appendChild(document.createTextNode(prompt));
    }
  }, [prompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasType = !!selectedType;
  const placeholder = selectedType === "video" && selectedSubMode === "story"
    ? "Upload References. Describe your vision. We'll create the scenes (e.g., Product reveal with smooth motion, premium feel, confident tone)"
    : selectedType ? PLACEHOLDERS[selectedType] : "Create anything...";
  const isEmpty = !prompt.trim();
  const borderCls = typeCfg ? typeCfg.promptBorder : isEmpty ? "border-destructive/60" : "border-foreground/20";

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
  const showFrames = selectedType === "video" && (selectedCharacters.length > 0 || references.length > 0);
  const showMusic = selectedType === "audio" && selectedSubMode === "music";
  const showPhotoshoot = selectedType === "image" && selectedSubMode === "photoshoot";
  const showSocial = selectedType === "content" && selectedSubMode === "social";

  return (
    <TooltipProvider>
      <div>
        {/* ── Hero headline + type pills ── */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-[2rem] md:text-[2.6rem] tracking-[-0.03em] text-foreground mb-5 leading-[1.1]">
            What Would You Like To Create Today?
          </h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {CONTENT_TYPES.map(t => {
              const isActive = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeSelect(t.id)}
                  className={`create-pill flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold border ${
                    isActive
                      ? `${t.bg} ${t.border} shadow-sm text-foreground`
                      : "bg-background border-foreground/15 hover:border-foreground/30 text-foreground"
                  }`}
                >
                  <t.icon size={16} className={t.color} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`w-full max-w-[960px] mx-auto rounded-2xl border-[1.5px] bg-background overflow-visible transition-all duration-300 ${borderCls} ${promptFocused ? "prompt-box-focus shadow-lg" : "shadow-md"}`}>

          {/* Textarea row */}
          <div className="flex items-start gap-3 px-4 pt-3 pb-2 min-h-[56px]">
            {hasType && typeCfg && selectedType !== "document" ? (
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
            ) : hasType && typeCfg && selectedType === "document" ? (
              <div className="flex flex-col gap-1 shrink-0 pt-[2px]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-500">
                      <FileText size={17} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Document</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" onClick={handleShuffle} className="p-1.5 rounded-lg bg-foreground/[0.06] text-emerald-500 hover:bg-emerald-50 transition-colors">
                      <Shuffle size={17} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Inspire Me</TooltipContent>
                </Tooltip>
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

            {/* Textarea + optional Recording overlay */}
            <div className="relative flex-1 min-h-[36px]">
              <div
                ref={textareaRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => { isInternalEditRef.current = true; setPrompt(extractText()); checkForMention(); }}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate(); } }}
                onFocus={() => setPromptFocused(true)}
                onBlur={() => setPromptFocused(false)}
                onPaste={e => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }}
                data-placeholder={placeholder}
                className="w-full bg-transparent border-none outline-none text-[0.92rem] text-foreground leading-[1.6] font-body min-h-[36px] max-h-[140px] overflow-y-auto py-[6px] mt-[2px] caret-accent pr-[180px] break-words [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted/50 [&:empty]:before:pointer-events-none"
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              />
              {mention.active && mention.anchorRect && (
                <MentionDropdown
                  assets={PROMPT_SAMPLE_ASSETS}
                  query={mention.query}
                  position={mention.anchorRect}
                  chipIds={chipIds}
                  onSelect={addChipFromMention}
                />
              )}
              <input ref={imgUploadRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <div className="absolute top-0 right-0 flex items-center gap-0 pt-[2px]">
                {isListening && (
                  <>
                    <button type="button" onClick={cancelSpeech} className="shrink-0 flex items-center justify-center w-8 h-9 rounded-xl bg-foreground/[0.06] text-muted hover:text-foreground hover:bg-foreground/[0.1] transition-colors" title="Cancel"><X size={14} /></button>
                    <div className="flex items-center gap-1.5 px-1.5">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                      <AudioWaveAnimation small />
                      <span className="text-[0.7rem] text-muted font-medium whitespace-nowrap">Listening…</span>
                    </div>
                    <button type="button" onClick={handleAcceptSpeech} className="shrink-0 flex items-center justify-center w-8 h-9 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="Accept"><Check size={14} /></button>
                  </>
                )}
                {!isListening && !hasType && isSupported && (
                  <Tooltip><TooltipTrigger asChild>
                    <button type="button" onClick={startListening} className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-foreground/[0.06]"><Mic size={17} className="!text-black dark:!text-white" /></button>
                  </TooltipTrigger><TooltipContent side="bottom">Speak</TooltipContent></Tooltip>
                )}
                {!hasType && (
                  <Tooltip><TooltipTrigger asChild>
                    <button type="button" onClick={handleGenerate} disabled={!prompt.trim() || isEnhancing}
                      className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${prompt.trim() ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-destructive/20 text-destructive/40"}`}>
                      {isEnhancing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </TooltipTrigger><TooltipContent side="bottom">Create</TooltipContent></Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Char count */}
          {prompt.length > 0 && (
            <div className="px-16 pb-1">
              <span className="text-[0.68rem] text-muted/40">{prompt.length}/1000 · ⌘↵ to generate</span>
            </div>
          )}

          {/* Document source pills */}
          {selectedType === "document" && selectedSubMode && (addedLinks.length > 0 || sourceFiles.length > 0 || pastedText.length > 0 || audioTranscript.length > 0) && (
            <div className="flex items-center gap-1.5 flex-wrap px-4 pb-2">
              {sourceFiles.length > 0 && (
                <button type="button" onClick={() => { togglePanel("source"); setActiveSourceTab("upload"); }} className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-accent/20 bg-accent/8 text-accent text-[0.78rem] font-semibold transition-all hover:border-accent/40">
                  <Upload size={12} />
                  {sourceFiles.length} file{sourceFiles.length !== 1 ? "s" : ""}
                  <X size={11} className="opacity-60 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setSourceFiles([]); }} />
                </button>
              )}
              {addedLinks.length > 0 && (
                <button type="button" onClick={() => { togglePanel("source"); setActiveSourceTab("url"); }} className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-accent/20 bg-accent/8 text-accent text-[0.78rem] font-semibold transition-all hover:border-accent/40">
                  <LinkChain size={12} />
                  {addedLinks.length} link{addedLinks.length !== 1 ? "s" : ""}
                  <X size={11} className="opacity-60 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setAddedLinks([]); }} />
                </button>
              )}
              {pastedText.length > 0 && (
                <button type="button" onClick={() => { togglePanel("source"); setActiveSourceTab("text"); }} className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-accent/20 bg-accent/8 text-accent text-[0.78rem] font-semibold transition-all hover:border-accent/40">
                  <FileText size={12} />
                  Pasted text
                  <X size={11} className="opacity-60 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setPastedText(""); }} />
                </button>
              )}
              {audioTranscript.length > 0 && (
                <button type="button" onClick={() => { togglePanel("source"); setActiveSourceTab("audio"); }} className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-accent/20 bg-accent/8 text-accent text-[0.78rem] font-semibold transition-all hover:border-accent/40">
                  <Mic size={12} />
                  Audio transcript
                  <X size={11} className="opacity-60 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setAudioTranscript(""); }} />
                </button>
              )}
            </div>
          )}


          {/* Inline frame uploads for video animate mode */}
          {showFrames && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-start gap-3">
                {/* Start Frame */}
                <div className="flex flex-col items-center gap-2">
                  {startFrame ? (
                    <div className="relative w-[140px] h-[140px] rounded-2xl overflow-hidden group border border-foreground/[0.08] shadow-sm">
                      <img src={startFrame} alt="Start Frame" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); clearFrame("start"); }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      >
                        <X size={11} />
                      </button>
                      <button
                        onClick={() => setFramePickerTarget("start")}
                        className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all"
                      >
                        <span className="text-white text-[0.75rem] font-semibold">Replace</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFramePickerTarget("start")}
                      className="w-[140px] h-[140px] rounded-2xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-2 hover:border-foreground/30 hover:bg-foreground/[0.02] transition-colors cursor-pointer"
                    >
                      <Upload size={20} className="text-muted" />
                      <span className="text-[0.75rem] text-muted font-medium">Choose image</span>
                    </button>
                  )}
                  <span className="text-[0.78rem] font-medium text-muted">Start Frame</span>
                </div>

                {/* Swap button */}
                <Tooltip><TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      const tmp = startFrame;
                      const tmpMeta = startFrameMeta;
                      setStartFrame(endFrame);
                      setStartFrameMeta(endFrameMeta);
                      setEndFrame(tmp);
                      setEndFrameMeta(tmpMeta);
                      setStartFrameLocked(true);
                      setEndFrameLocked(true);
                    }}
                    disabled={!startFrame && !endFrame}
                    className="p-2.5 rounded-xl hover:bg-foreground/[0.06] transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                  >
                    <ArrowLeftRight size={18} className="text-muted" />
                  </button>
                </TooltipTrigger><TooltipContent>Swap</TooltipContent></Tooltip>

                {/* End Frame */}
                <div className="flex flex-col items-center gap-2">
                  {endFrame ? (
                    <div className="relative w-[140px] h-[140px] rounded-2xl overflow-hidden group border border-foreground/[0.08] shadow-sm">
                      <img src={endFrame} alt="End Frame" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); clearFrame("end"); }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      >
                        <X size={11} />
                      </button>
                      <button
                        onClick={() => setFramePickerTarget("end")}
                        className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all"
                      >
                        <span className="text-white text-[0.75rem] font-semibold">Replace</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFramePickerTarget("end")}
                      className="w-[140px] h-[140px] rounded-2xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-2 hover:border-foreground/30 hover:bg-foreground/[0.02] transition-colors cursor-pointer"
                    >
                      <Upload size={20} className="text-muted" />
                      <span className="text-[0.75rem] text-muted font-medium">Choose image</span>
                    </button>
                  )}
                  <span className="text-[0.78rem] font-medium text-muted">End Frame (Optional)</span>
                </div>
              </div>

              {/* Frame Source Picker Modal */}
              {framePickerTarget && (
                <FramePickerModal
                  label={framePickerTarget === "start" ? "Start" : "End"}
                  onSelect={(src, meta) => {
                    // Clean up old frame's character/reference before replacing
                    const oldMeta = framePickerTarget === "start" ? startFrameMeta : endFrameMeta;
                    if (oldMeta) {
                      if (oldMeta.sourceType === "character" && oldMeta.characterId) {
                        setSelectedCharacters(prev => prev.filter(c => c !== oldMeta.characterId));
                      }
                      if (oldMeta.refId) {
                        setReferences(prev => prev.filter(r => r.id !== oldMeta.refId));
                      }
                    }

                    const frameMeta: { sourceType: string; characterId?: string; refId?: string } = {
                      sourceType: meta?.sourceType || "upload",
                      characterId: meta?.characterId,
                    };
                    if (framePickerTarget === "start") {
                      setStartFrame(src);
                      setStartFrameMeta(frameMeta);
                      setStartFrameLocked(false);
                    } else {
                      setEndFrame(src);
                      setEndFrameMeta(frameMeta);
                      setEndFrameLocked(false);
                    }
                    // Update character/reference state based on source type
                    if (selectedType === "video" && meta) {
                      if (meta.sourceType === "character" && meta.characterId) {
                        setSelectedCharacters(prev => {
                          if (prev.includes(meta.characterId!)) return prev;
                          return [...prev, meta.characterId!];
                        });
                      } else if (meta.sourceType !== "upload") {
                        const refId = `frame-ref-${Date.now()}`;
                        frameMeta.refId = refId;
                        // Update meta with refId
                        if (framePickerTarget === "start") setStartFrameMeta({ ...frameMeta });
                        else setEndFrameMeta({ ...frameMeta });
                        setReferences(prev => [...prev, { id: refId, src, name: meta.sourceType }]);
                      }
                    }
                    setFramePickerTarget(null);
                  }}
                  onClose={() => setFramePickerTarget(null)}
                />
              )}
            </div>
          )}

          {(selectedCharacters.length > 0 || references.length > 0) && (
            <div className="flex items-center gap-1.5 flex-wrap px-4 pb-2">
              {selectedCharacters.length > 0 && (
                <button type="button" onClick={() => togglePanel("character")}
                  className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${activePanel === "character" ? "border-accent bg-accent/10" : "border-foreground/[0.1] bg-foreground/[0.03] hover:border-accent/30"}`}>
                  <div className="flex items-center -space-x-1.5">
                    {selectedCharacters.slice(0, 3).map((id, i) => {
                      const info = characterInfoMap[id];
                      return info?.avatar ? (
                        <img key={id} src={info.avatar} alt={info.name} className="w-7 h-7 rounded-lg object-cover border-2 border-background" style={{ zIndex: selectedCharacters.length - i }} />
                      ) : (
                        <div key={id} className="w-7 h-7 rounded-lg bg-accent/10 border-2 border-background flex items-center justify-center" style={{ zIndex: selectedCharacters.length - i }}><User size={12} className="text-accent" /></div>
                      );
                    })}
                    {selectedCharacters.length > 3 && (
                      <div className="w-7 h-7 rounded-lg bg-foreground/[0.08] border-2 border-background flex items-center justify-center text-[0.6rem] font-bold text-muted" style={{ zIndex: 0 }}>+{selectedCharacters.length - 3}</div>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-[0.68rem] text-muted/60 font-medium block leading-none">{selectedCharacters.length === 1 ? "Character" : "Characters"}</span>
                    <span className="text-[0.78rem] font-semibold text-foreground leading-tight">
                      {selectedCharacters.length === 1 && characterInfoMap[selectedCharacters[0]]
                        ? characterInfoMap[selectedCharacters[0]].name
                        : `${selectedCharacters.length} selected`}
                    </span>
                  </div>
                  <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); setSelectedCharacters([]); }} />
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
          )}

          {/* ── Bottom toolbar ── */}
          {hasType && (
            <div className="border-t border-foreground/[0.06] px-4 py-2.5 flex items-center gap-0 flex-nowrap">
              {/* Child 1 — Scrollable pills (never wraps) */}
              <div className="relative flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto overflow-y-hidden no-scrollbar">

                {/* Asset Picker + */}
                <Popover open={assetPickerOpen} onOpenChange={(open) => {
                  if (open) saveSelection();
                  setAssetPickerOpen(open);
                }}>
                  <PopoverTrigger asChild>
                    <button type="button" className="p-1.5 rounded-lg text-foreground hover:bg-foreground/[0.06] transition-colors shrink-0">
                      <Plus className="w-5 h-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start" sideOffset={8} onCloseAutoFocus={handleAssetPopoverCloseAutoFocus}>
                    <div className="p-2 border-b border-foreground/[0.06]">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-foreground/[0.04]">
                        <Hash className="w-3.5 h-3.5 text-muted" />
                        <input value={assetSearch} onChange={e => setAssetSearch(e.target.value)}
                          placeholder="Search assets..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted" autoFocus />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1.5">
                      {filteredAssets.map(cat => (
                        <div key={cat.category}>
                          <p className="px-2.5 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">{cat.category}</p>
                          {cat.items.map(item => {
                            const isAdded = chipIds.has(item.id);
                            const ChipIcon = PROMPT_CHIP_ICONS[cat.type];
                            return (
                              <button key={item.id} onMouseDown={e => e.preventDefault()} onClick={() => addChip(cat.type, item)} disabled={isAdded}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${isAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-foreground/[0.04]"}`}>
                                {item.thumbnail ? (
                                  <img src={item.thumbnail} alt="" className="w-7 h-7 rounded object-cover" />
                                ) : (
                                  <span className="w-7 h-7 rounded bg-foreground/[0.06] flex items-center justify-center">
                                    <ChipIcon className="w-3.5 h-3.5 text-muted" />
                                  </span>
                                )}
                                <span className="font-medium">@{item.label}</span>
                                {isAdded && <Check className="w-3.5 h-3.5 text-accent ml-auto" />}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                      {filteredAssets.length === 0 && <p className="text-center text-sm text-muted py-4">No assets found</p>}
                      <div className="border-t border-foreground/[0.06] mt-1 pt-1">
                        <button
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { setAssetPickerOpen(false); imgUploadRef.current?.click(); }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] transition-colors"
                        >
                          <span className="w-7 h-7 rounded bg-foreground/[0.06] flex items-center justify-center">
                            <Upload className="w-3.5 h-3.5 text-muted" />
                          </span>
                          <span className="font-medium">Upload Image</span>
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="w-px h-5 bg-foreground/[0.08] mx-0.5 shrink-0" />

                {/* Type badge — always visible, clickable to switch type */}
                <Popover>
                  <PopoverTrigger asChild>
                    {typeCfg ? (
                      <button type="button" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${typeCfg.bg} ${typeCfg.border} ${typeCfg.color}`}>
                        <typeCfg.icon size={13} />{typeCfg.label}
                        <X size={11} className="opacity-60 hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); setSelectedType(null); setSelectedSubMode(null); setActivePanel(null); }} />
                      </button>
                    ) : (
                      <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border whitespace-nowrap shrink-0 cursor-pointer bg-accent/10 border-accent/30 text-accent">
                        <Sparkles size={13} />Auto
                      </button>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-1.5" align="start" sideOffset={6}>
                    <button type="button" onClick={() => { setSelectedType(null); setSelectedSubMode(null); setActivePanel(null); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-medium transition-colors ${!selectedType ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                      <Sparkles size={14} className="text-accent" />Auto{!selectedType && <Check size={12} className="ml-auto" />}
                    </button>
                    {CONTENT_TYPES.map(t => (
                      <button key={t.id} type="button" onClick={() => handleTypeSelect(t.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-medium transition-colors ${selectedType === t.id ? `${t.bg} ${t.color}` : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        <t.icon size={14} className={t.color} />{t.label}{selectedType === t.id && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <div className="w-px h-5 bg-foreground/[0.08] mx-0.5 shrink-0" />

                {/* Sub-mode selector */}
                <Popover open={subModeOpen} onOpenChange={setSubModeOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border transition-all whitespace-nowrap shrink-0 ${
                      selectedSubObj ? `${typeCfg!.bg} ${typeCfg!.border} ${typeCfg!.color}` : "bg-foreground/[0.04] border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"
                    }`}>
                      {selectedSubObj ? (
                        <><selectedSubObj.icon size={13} />{selectedSubObj.label}<X size={11} className="opacity-60" onClick={e => { e.stopPropagation(); setSelectedSubMode(null); setSubModeOpen(false); setActivePanel(null); }} /></>
                      ) : (
                        <><SlidersHorizontal size={13} />Type<ChevronDown size={11} className="text-muted" /></>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-1.5 max-h-[50vh] overflow-y-auto" align="start" side="bottom" avoidCollisions={false} sideOffset={6}>
                    {subModes.map(m => (
                      <button key={m.id} type="button" onClick={() => handleSubModeSelect(m.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-medium transition-colors ${selectedSubMode === m.id ? `${typeCfg!.bg} ${typeCfg!.color}` : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        <m.icon size={14} />{m.label}{selectedSubMode === m.id && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Build dropdown — only when App > Website */}
                {selectedType === "app" && selectedSubMode === "website" && (
                  <>
                  <div className="w-px h-5 bg-foreground/[0.08] mx-0.5 shrink-0" />
                  <Popover open={appBuildOpen} onOpenChange={setAppBuildOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border transition-all whitespace-nowrap shrink-0 ${
                        appBuildMode ? `${typeCfg!.bg} ${typeCfg!.border} ${typeCfg!.color}` : "bg-foreground/[0.04] border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"
                      }`}>
                        {appBuildMode ? (
                          <>{(() => { const found = APP_BUILD_MODES.find(b => b.id === appBuildMode); return found ? <><found.icon size={13} />{found.label}</> : "Build"; })()}<X size={11} className="opacity-60" onClick={e => { e.stopPropagation(); setAppBuildMode(null); setAppBuildOpen(false); }} /></>
                        ) : (
                          <><Layers size={13} />Build<ChevronDown size={11} className="text-muted" /></>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-1.5" align="start" sideOffset={6}>
                      {APP_BUILD_MODES.map(b => (
                        <button key={b.id} type="button" onClick={() => { setAppBuildMode(b.id); setAppBuildOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[0.82rem] font-medium transition-colors ${appBuildMode === b.id ? `${typeCfg!.bg} ${typeCfg!.color}` : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          <b.icon size={15} className={appBuildMode === b.id ? typeCfg!.color : "text-muted"} />{b.label}{appBuildMode === b.id && <Check size={12} className="ml-auto" />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  </>
                )}

                {/* Non-app generic controls */}
                {selectedType !== "app" && selectedType !== "document" && selectedSubMode && (
                  <>
                <div className="w-px h-5 bg-foreground/[0.08] mx-0.5 shrink-0" />

                {/* Model */}
                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                  <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                    <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                      <Cpu size={12} />{selectedModel}
                    </button>
                  </PopoverTrigger></TooltipTrigger><TooltipContent>Model</TooltipContent></Tooltip>
                  <PopoverContent className="w-56 p-1.5" align="start" side="bottom" avoidCollisions={false} sideOffset={6}>
                    {(selectedType === "audio" && selectedSubMode === "voiceover"
                      ? ["Auto", "Eleven Turbo v2.5", "Eleven Multilingual v2"]
                      : ["Auto", "Sora Storyboard"]
                    ).map(m => (
                      <button key={m} type="button" onClick={() => { setSelectedModel(m); setModelOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedModel === m ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {m}{selectedModel === m && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Scenes — story mode */}
                {selectedType === "video" && selectedSubMode === "story" && (
                  <Popover>
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                        <Clapperboard size={12} />Scenes
                      </button>
                    </PopoverTrigger></TooltipTrigger><TooltipContent>Scenes</TooltipContent></Tooltip>
                    <PopoverContent className="w-40 p-1.5" align="start" sideOffset={6}>
                      {(["auto", "manual"] as const).map(m => (
                        <button key={m} type="button" onClick={() => setStoryMode(m)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] font-medium transition-colors capitalize ${storyMode === m ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          {m}{storyMode === m && <Check size={12} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}

                {/* Voiceover-specific controls */}
                {selectedType === "audio" && selectedSubMode === "voiceover" && (
                  <>
                {/* Voice */}
                <Popover open={voiceoverVoiceOpen} onOpenChange={setVoiceoverVoiceOpen}>
                  <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                    <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${voiceoverVoice !== "Auto" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      <Mic size={12} />{voiceoverVoice !== "Auto" ? voiceoverVoice : "Voice"}<ChevronDown size={10} className="opacity-60" />
                    </button>
                  </PopoverTrigger></TooltipTrigger><TooltipContent>Voice</TooltipContent></Tooltip>
                  <PopoverContent className="w-64 p-0" align="start" side="bottom" avoidCollisions={false} sideOffset={6}>
                    <p className="text-[0.78rem] text-muted px-4 pt-3 pb-2">Select a voice for your voiceover</p>
                    <div className="max-h-[280px] overflow-y-auto px-2 pb-2">
                      {[
                        { name: "Rachel", gender: "Female" },
                        { name: "Aria", gender: "Female" },
                        { name: "Roger", gender: "Male" },
                        { name: "Sarah", gender: "Female" },
                        { name: "Laura", gender: "Female" },
                        { name: "Charlie", gender: "Male" },
                        { name: "George", gender: "Male" },
                        { name: "Liam", gender: "Male" },
                      ].map(v => (
                        <button key={v.name} type="button" onClick={() => { setVoiceoverVoice(v.name); setVoiceoverVoiceOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.84rem] transition-colors ${voiceoverVoice === v.name ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          <div className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center shrink-0"><User size={14} className="text-muted" /></div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-[0.84rem]">{v.name}</p>
                            <p className="text-[0.72rem] text-muted">{v.gender}</p>
                          </div>
                          <Play size={14} className="text-green-500 opacity-60 hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Language */}
                <Popover open={voiceoverLanguageOpen} onOpenChange={(o) => { setVoiceoverLanguageOpen(o); if (!o) setVoiceoverLangSearch(""); }}>
                  <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                    <button type="button" className={`toolbar-btn p-1.5 rounded-lg shrink-0 ${voiceoverLanguage !== "English" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      <Languages size={14} />
                    </button>
                  </PopoverTrigger></TooltipTrigger><TooltipContent>Language</TooltipContent></Tooltip>
                  <PopoverContent className="w-56 p-2" align="start" side="bottom" avoidCollisions={false} sideOffset={6}>
                    <div className="relative mb-2">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={voiceoverLangSearch}
                        onChange={e => setVoiceoverLangSearch(e.target.value)}
                        placeholder="Search Languages..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.1] bg-background text-[0.82rem] focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {[
                        { label: "English", flag: "🇺🇸" },
                        { label: "Spanish", flag: "🇪🇸" },
                        { label: "French", flag: "🇫🇷" },
                        { label: "German", flag: "🇩🇪" },
                        { label: "Portuguese", flag: "🇵🇹" },
                        { label: "Italian", flag: "🇮🇹" },
                        { label: "Dutch", flag: "🇳🇱" },
                        { label: "Japanese", flag: "🇯🇵" },
                        { label: "Korean", flag: "🇰🇷" },
                        { label: "Chinese", flag: "🇨🇳" },
                        { label: "Arabic", flag: "🇸🇦" },
                        { label: "Hindi", flag: "🇮🇳" },
                      ].filter(l => l.label.toLowerCase().includes(voiceoverLangSearch.toLowerCase())).map(l => (
                        <button key={l.label} type="button" onClick={() => { setVoiceoverLanguage(l.label); setVoiceoverLanguageOpen(false); setVoiceoverLangSearch(""); }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.84rem] transition-colors ${voiceoverLanguage === l.label ? "bg-accent/8 text-foreground" : "hover:bg-foreground/[0.04] text-foreground/80"}`}>
                          <span className="text-base">{l.flag}</span>
                          <span className="flex-1 text-left">{l.label}</span>
                          {voiceoverLanguage === l.label && <Check size={14} className="text-accent" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Accent */}
                <Popover open={voiceoverAccentOpen} onOpenChange={setVoiceoverAccentOpen}>
                  <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                    <button type="button" className={`toolbar-btn p-1.5 rounded-lg shrink-0 ${voiceoverAccent !== "Neutral" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      <AudioLines size={14} />
                    </button>
                  </PopoverTrigger></TooltipTrigger><TooltipContent>Accent</TooltipContent></Tooltip>
                  <PopoverContent className="w-44 p-1.5" align="start" side="bottom" avoidCollisions={false} sideOffset={6}>
                    {["American", "British", "Australian", "Irish", "Scottish", "Indian", "South African", "Neutral"].map(a => (
                      <button key={a} type="button" onClick={() => { setVoiceoverAccent(a); setVoiceoverAccentOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${voiceoverAccent === a ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {a}{voiceoverAccent === a && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Speed */}
                <Popover open={voiceoverSpeedOpen} onOpenChange={setVoiceoverSpeedOpen}>
                  <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                    <button type="button" className={`toolbar-btn p-1.5 rounded-lg shrink-0 ${voiceoverSpeed !== "Normal" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      <Clock size={14} />
                    </button>
                  </PopoverTrigger></TooltipTrigger><TooltipContent>Speed</TooltipContent></Tooltip>
                  <PopoverContent className="w-40 p-1.5" align="start" side="bottom" avoidCollisions={false} sideOffset={6}>
                    {["Very Slow", "Slow", "Normal", "Fast", "Very Fast"].map(s => (
                      <button key={s} type="button" onClick={() => { setVoiceoverSpeed(s); setVoiceoverSpeedOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${voiceoverSpeed === s ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {s}{voiceoverSpeed === s && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Tone */}
                <Popover open={voiceoverToneOpen} onOpenChange={setVoiceoverToneOpen}>
                  <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                    <button type="button" className={`toolbar-btn p-1.5 rounded-lg shrink-0 ${voiceoverTone !== "Auto" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      <SlidersHorizontal size={14} />
                    </button>
                  </PopoverTrigger></TooltipTrigger><TooltipContent>Tone</TooltipContent></Tooltip>
                  <PopoverContent className="w-44 p-1.5" align="start" side="bottom" avoidCollisions={false} sideOffset={6}>
                    {["Auto", "Professional", "Casual", "Energetic", "Calm", "Dramatic", "Warm", "Authoritative"].map(t => (
                      <button key={t} type="button" onClick={() => { setVoiceoverTone(t); setVoiceoverToneOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${voiceoverTone === t ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                        {t}{voiceoverTone === t && <Check size={12} />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
                  </>
                )}

                {/* Style, Character, Reference — hidden for ebook & voiceover mode */}
                {!(selectedType === "audio" && selectedSubMode === "voiceover") && (
                  <>
                {/* Style */}
                <Tooltip><TooltipTrigger asChild>
                  <button type="button" onClick={() => togglePanel("style")}
                    className={`toolbar-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium whitespace-nowrap shrink-0 ${activePanel === "style" || selectedStyle !== "None" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                    {selectedType === "video" ? <Film size={12} /> : <Brush size={12} />}{selectedStyle !== "None" ? selectedStyle : "Style"}
                  </button>
                </TooltipTrigger><TooltipContent>Style</TooltipContent></Tooltip>

                {/* Character */}
                <Tooltip><TooltipTrigger asChild>
                  <button type="button" onClick={() => togglePanel("character")}
                    className={`toolbar-btn relative p-1.5 rounded-lg shrink-0 ${activePanel === "character" || selectedCharacters.length > 0 ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                    <User size={14} />
                    {selectedCharacters.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-accent text-white text-[0.55rem] font-bold flex items-center justify-center">{selectedCharacters.length}</span>}
                  </button>
                </TooltipTrigger><TooltipContent>Character{selectedCharacters.length > 0 ? ` (${selectedCharacters.length})` : ""}</TooltipContent></Tooltip>

                {/* Reference */}
                <Tooltip><TooltipTrigger asChild>
                  <button type="button" onClick={() => togglePanel("reference")}
                    className={`toolbar-btn relative p-1.5 rounded-lg shrink-0 ${activePanel === "reference" || references.length > 0 ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                    <Layers size={14} />
                    {references.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-accent text-white text-[0.55rem] font-bold flex items-center justify-center">{references.length}</span>}
                  </button>
                </TooltipTrigger><TooltipContent>Reference{references.length > 0 ? ` (${references.length})` : ""}</TooltipContent></Tooltip>
                  </>
                )}
                  </>
                )}

                {/* Ratio — image & video (NOT design) */}
                {selectedSubMode && (selectedType === "image" || selectedType === "video") && (
                  <Popover open={ratioOpen} onOpenChange={setRatioOpen}>
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                        <Copy size={12} />{selectedRatio}
                      </button>
                    </PopoverTrigger></TooltipTrigger><TooltipContent>Ratio</TooltipContent></Tooltip>
                    <PopoverContent className="w-44 p-1.5" align="start" sideOffset={6}>
                      {(selectedType === "video"
                        ? [
                            { r: "9:16", w: 9, h: 16 },
                            { r: "1:1", w: 14, h: 14 },
                            { r: "16:9", w: 16, h: 9 },
                          ]
                        : [
                            { r: "1:1", w: 14, h: 14 },
                            { r: "16:9", w: 16, h: 9 },
                            { r: "9:16", w: 9, h: 16 },
                            { r: "4:3", w: 14, h: 10.5 },
                            { r: "3:4", w: 10.5, h: 14 },
                            { r: "3:2", w: 15, h: 10 },
                            { r: "2:3", w: 10, h: 15 },
                          ]
                      ).map(({ r, w, h }) => (
                        <button key={r} type="button" onClick={() => { setSelectedRatio(r); setRatioOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedRatio === r ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          <span className="flex items-center justify-center w-5 h-5 shrink-0">
                            <span className={`block rounded-[2px] border ${selectedRatio === r ? "border-primary-foreground/50" : "border-foreground/30"}`} style={{ width: w, height: h }} />
                          </span>
                          {r}
                          {selectedRatio === r && <Check size={12} className="ml-auto" />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}

                {/* Orientation — design only (replaces ratio) */}
                {selectedSubMode && selectedType === "design" && (
                  <Popover open={designOrientationOpen} onOpenChange={setDesignOrientationOpen}>
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${designOrientation !== "Portrait" ? "bg-accent/10 text-accent" : "bg-accent/10 text-accent"}`}>
                        <ArrowLeftRight size={12} />{designOrientation}
                      </button>
                    </PopoverTrigger></TooltipTrigger><TooltipContent>Orientation</TooltipContent></Tooltip>
                    <PopoverContent className="w-36 p-1.5" align="start" sideOffset={6}>
                      {["Portrait", "Landscape"].map(o => (
                        <button key={o} type="button" onClick={() => { setDesignOrientation(o); setDesignOrientationOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designOrientation === o ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          {o}{designOrientation === o && <Check size={12} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}

                {/* Duration — video */}
                {selectedSubMode && selectedType === "video" && (
                  <Popover open={durationOpen} onOpenChange={setDurationOpen}>
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium bg-accent/10 text-accent hover:bg-accent/15 transition-colors whitespace-nowrap shrink-0">
                        <Clock size={12} />{selectedDuration}
                      </button>
                    </PopoverTrigger></TooltipTrigger><TooltipContent>Duration</TooltipContent></Tooltip>
                    <PopoverContent className="w-32 p-1.5" align="start" sideOffset={6}>
                      {["5s","10s","15s","25s"].map(d => (
                        <button key={d} type="button" onClick={() => { setSelectedDuration(d); setDurationOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedDuration === d ? "bg-accent text-white" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          {d}{selectedDuration === d && <Check size={12} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}

                {/* Resolution — video */}
                {selectedSubMode && selectedType === "video" && (
                  <Popover open={resolutionOpen} onOpenChange={setResolutionOpen}>
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium bg-accent/10 text-accent hover:bg-accent/15 transition-colors whitespace-nowrap shrink-0">
                        <SlidersHorizontal size={12} />{selectedResolution}
                      </button>
                    </PopoverTrigger></TooltipTrigger><TooltipContent>Resolution</TooltipContent></Tooltip>
                    <PopoverContent className="w-32 p-1.5" align="start" sideOffset={6}>
                      {["720p","1080p","4K"].map(r => (
                        <button key={r} type="button" onClick={() => { setSelectedResolution(r); setResolutionOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${selectedResolution === r ? "bg-accent text-white" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          {r}{selectedResolution === r && <Check size={12} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}


                {/* Count — image, design */}
                {selectedSubMode && (selectedType === "image" || selectedType === "design") && (
                  <Popover open={numberOpen} onOpenChange={setNumberOpen}>
                    <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                      <button type="button" className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${selectedNumber > 1 ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
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

                {/* Design sub-mode specific toolbar controls */}
                {selectedType === "design" && selectedSubMode && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <div className="w-px h-5 bg-foreground/[0.08] mx-1 shrink-0" />

                    {/* ── Logo controls ── */}
                    {selectedSubMode === "logo" && (
                      <>
                        <Popover open={designIconStyleOpen} onOpenChange={setDesignIconStyleOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${designIconStyle !== "Modern" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                              <PenTool size={12} />{designIconStyle}<ChevronDown size={10} className="opacity-60" />
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Icon Style</TooltipContent></Tooltip>
                          <PopoverContent className="w-44 p-1.5" align="start" sideOffset={6}>
                            {["Minimal", "Modern", "Bold", "Vintage", "Playful", "Geometric", "Hand-drawn"].map(s => (
                              <button key={s} type="button" onClick={() => { setDesignIconStyle(s); setDesignIconStyleOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designIconStyle === s ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {s}{designIconStyle === s && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                        <Popover open={designIndustryOpen} onOpenChange={setDesignIndustryOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${designIndustry ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                              <Target size={12} />{designIndustry || "Industry"}<ChevronDown size={10} className="opacity-60" />
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Industry</TooltipContent></Tooltip>
                          <PopoverContent className="w-48 p-1.5 max-h-[50vh] overflow-y-auto" align="start" sideOffset={6}>
                            {["Tech", "Food & Drink", "Fashion", "Health", "Finance", "Education", "Real Estate", "Sports", "Music", "Photography", "Gaming", "Travel"].map(ind => (
                              <button key={ind} type="button" onClick={() => { setDesignIndustry(ind); setDesignIndustryOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designIndustry === ind ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {ind}{designIndustry === ind && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* ── Poster controls ── */}
                    {selectedSubMode === "poster" && (
                      <>
                        <Popover open={designSizeOpen} onOpenChange={setDesignSizeOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                              <Copy size={12} />{designSize}
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Size</TooltipContent></Tooltip>
                          <PopoverContent className="w-44 p-1.5" align="start" sideOffset={6}>
                            {["A4", "A3", "A2", "Letter", "11x17", "24x36"].map(s => (
                              <button key={s} type="button" onClick={() => { setDesignSize(s); setDesignSizeOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designSize === s ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {s}{designSize === s && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* ── Thumbnail controls ── */}
                    {selectedSubMode === "thumbnail" && (
                      <>
                        {(() => {
                          const platformLogos: Record<string, React.ReactNode> = {
                            YouTube: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#FF0000] shrink-0"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
                            Twitch: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#9146FF] shrink-0"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>,
                            Instagram: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#E4405F] shrink-0"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z"/></svg>,
                            TikTok: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-foreground shrink-0"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
                            "X (Twitter)": <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-foreground shrink-0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                            LinkedIn: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0A66C2] shrink-0"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
                            Facebook: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#1877F2] shrink-0"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
                          };
                          const activeLogo = platformLogos[designPlatform] || <Globe size={12} />;
                          return (
                            <Popover open={designPlatformOpen} onOpenChange={setDesignPlatformOpen}>
                              <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                                <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                                  {activeLogo}{designPlatform}
                                </button>
                              </PopoverTrigger></TooltipTrigger><TooltipContent>Platform</TooltipContent></Tooltip>
                              <PopoverContent className="w-48 p-1.5" align="start" sideOffset={6}>
                                {["YouTube", "Twitch", "Instagram", "TikTok", "X (Twitter)", "LinkedIn", "Facebook"].map(p => (
                                  <button key={p} type="button" onClick={() => { setDesignPlatform(p); setDesignPlatformOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designPlatform === p ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                    {platformLogos[p]}{p}{designPlatform === p && <Check size={12} className="ml-auto" />}
                                  </button>
                                ))}
                              </PopoverContent>
                            </Popover>
                          );
                        })()}
                        <Popover open={designTextStyleOpen} onOpenChange={setDesignTextStyleOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${designTextStyle !== "Bold" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                              <Pencil size={12} />{designTextStyle}
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Text Style</TooltipContent></Tooltip>
                          <PopoverContent className="w-40 p-1.5" align="start" sideOffset={6}>
                            {["Bold", "Clean", "Outlined", "3D", "Gradient", "Neon", "None"].map(t => (
                              <button key={t} type="button" onClick={() => { setDesignTextStyle(t); setDesignTextStyleOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designTextStyle === t ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {t}{designTextStyle === t && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* ── Flyer controls ── */}
                    {selectedSubMode === "flyer" && (
                      <>
                        <Popover open={designSizeOpen} onOpenChange={setDesignSizeOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                              <Copy size={12} />{designSize}
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Size</TooltipContent></Tooltip>
                          <PopoverContent className="w-36 p-1.5" align="start" sideOffset={6}>
                            {["A4", "A5", "Letter", "Half Letter", "DL"].map(s => (
                              <button key={s} type="button" onClick={() => { setDesignSize(s); setDesignSizeOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designSize === s ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {s}{designSize === s && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* ── Business Card controls ── */}
                    {selectedSubMode === "business-card" && (
                      <>
                        <Popover open={designFinishOpen} onOpenChange={setDesignFinishOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${designFinish !== "Matte" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                              <Eye size={12} />{designFinish}
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Finish</TooltipContent></Tooltip>
                          <PopoverContent className="w-36 p-1.5" align="start" sideOffset={6}>
                            {["Matte", "Glossy", "Textured", "Spot UV"].map(f => (
                              <button key={f} type="button" onClick={() => { setDesignFinish(f); setDesignFinishOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designFinish === f ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {f}{designFinish === f && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* ── Brochure controls ── */}
                    {selectedSubMode === "brochure" && (
                      <>
                        <Popover open={designFoldOpen} onOpenChange={setDesignFoldOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                              <BookOpen size={12} />{designFoldType}
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Fold Type</TooltipContent></Tooltip>
                          <PopoverContent className="w-40 p-1.5" align="start" sideOffset={6}>
                            {["Bi-Fold", "Tri-Fold", "Z-Fold", "Gate-Fold"].map(f => (
                              <button key={f} type="button" onClick={() => { setDesignFoldType(f); setDesignFoldOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designFoldType === f ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {f}{designFoldType === f && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                        <Popover open={designPagesOpen} onOpenChange={setDesignPagesOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-foreground/[0.04] text-muted hover:text-foreground">
                              <Layers size={12} />{designPages}pg
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Pages</TooltipContent></Tooltip>
                          <PopoverContent className="w-32 p-1.5" align="start" sideOffset={6}>
                            {[4, 6, 8, 12, 16].map(p => (
                              <button key={p} type="button" onClick={() => { setDesignPages(p); setDesignPagesOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designPages === p ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {p} pages{designPages === p && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                        <Popover open={designSizeOpen} onOpenChange={setDesignSizeOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${designSize !== "A4" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                              <Copy size={12} />{designSize}
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Size</TooltipContent></Tooltip>
                          <PopoverContent className="w-36 p-1.5" align="start" sideOffset={6}>
                            {["A4", "Letter", "A5", "Legal"].map(s => (
                              <button key={s} type="button" onClick={() => { setDesignSize(s); setDesignSizeOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designSize === s ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {s}{designSize === s && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* ── Infographic controls ── */}
                    {selectedSubMode === "infographic" && (
                      <>
                        <Popover open={designLayoutOpen} onOpenChange={setDesignLayoutOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                              <LayoutGrid size={12} />{designLayout}
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Layout</TooltipContent></Tooltip>
                          <PopoverContent className="w-40 p-1.5" align="start" sideOffset={6}>
                            {["Vertical", "Horizontal", "Timeline", "Comparison", "Process"].map(l => (
                              <button key={l} type="button" onClick={() => { setDesignLayout(l); setDesignLayoutOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designLayout === l ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {l}{designLayout === l && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                        <Popover open={designChartOpen} onOpenChange={setDesignChartOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${designChartType !== "Mixed" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                              <BarChart2 size={12} />{designChartType}
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Chart Style</TooltipContent></Tooltip>
                          <PopoverContent className="w-40 p-1.5" align="start" sideOffset={6}>
                            {["Mixed", "Bar Charts", "Pie Charts", "Line Graphs", "Icons Only", "Numbers Only"].map(c => (
                              <button key={c} type="button" onClick={() => { setDesignChartType(c); setDesignChartOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${designChartType === c ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                {c}{designChartType === c && <Check size={12} />}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* ── Presentation controls ── */}
                    {selectedSubMode === "presentation" && (
                      <>
                        <Popover open={presAudienceOpen} onOpenChange={setPresAudienceOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${presAudience !== "Casual" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                              <Users size={12} />{presAudience}<ChevronDown size={10} className="opacity-60" />
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Audience</TooltipContent></Tooltip>
                          <PopoverContent className="w-64 p-1.5" align="start" sideOffset={6}>
                            {[
                              { id: "Casual", desc: "Informal and relaxed presentation style", Icon: MessageCircle },
                              { id: "Professional", desc: "Business and corporate settings", Icon: Briefcase },
                              { id: "Educational", desc: "Learning and academic environments", Icon: GraduationCap },
                            ].map(a => (
                              <button key={a.id} type="button" onClick={() => { setPresAudience(a.id); setPresAudienceOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${presAudience === a.id ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                <a.Icon size={18} className="shrink-0 opacity-70" />
                                <div><div className="text-[0.82rem] font-medium">{a.id}</div><div className={`text-[0.7rem] ${presAudience === a.id ? "text-primary-foreground/70" : "text-muted"}`}>{a.desc}</div></div>
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                        <Popover open={presLengthOpen} onOpenChange={setPresLengthOpen}>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                            <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${presLength !== "Balanced" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                              <Layers size={12} />{presLength}<ChevronDown size={10} className="opacity-60" />
                            </button>
                          </PopoverTrigger></TooltipTrigger><TooltipContent>Length</TooltipContent></Tooltip>
                          <PopoverContent className="w-56 p-1.5" align="start" sideOffset={6}>
                            {[
                              { id: "Short and sharp", desc: "1 to 5 pages" },
                              { id: "Balanced", desc: "5 to 15 pages" },
                              { id: "Comprehensive", desc: "15+ pages" },
                              { id: "Decide for me", desc: "We'll choose the best length" },
                            ].map(l => (
                              <button key={l.id} type="button" onClick={() => { setPresLength(l.id); setPresLengthOpen(false); }}
                                className={`w-full flex flex-col px-3 py-2.5 rounded-lg text-left transition-colors ${presLength === l.id ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                                <span className="text-[0.82rem] font-medium">{l.id}</span>
                                <span className={`text-[0.7rem] ${presLength === l.id ? "text-primary-foreground/70" : "text-muted"}`}>{l.desc}</span>
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                  </div>
                )}

                {/* Content/Social toolbar icons */}
                {selectedType === "content" && selectedSubMode && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <div className="w-px h-5 bg-foreground/[0.08] mx-1 shrink-0" />
                    <Popover>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors shrink-0 ${contentGoal !== "Engagement" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Flag size={14} />
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Goal</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Goal</p>
                        {["Engagement", "Awareness", "Traffic", "Sales", "Education", "Community"].map(o => (
                          <button key={o} onClick={() => setContentGoal(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentGoal === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Popover open={contentToneOpen} onOpenChange={setContentToneOpen}>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors shrink-0 ${contentTone ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <MessageCircle size={14} />
                          {contentTone && <span className="text-[0.75rem] font-medium pr-0.5">{contentTone}</span>}
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Tone</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Tone</p>
                        {["Professional", "Casual", "Humorous", "Inspirational", "Educational", "Bold"].map(o => (
                          <button key={o} onClick={() => { setContentTone(o); setContentToneOpen(false); }} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentTone === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Popover open={contentLangOpen} onOpenChange={setContentLangOpen}>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors shrink-0 ${contentLanguage ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Languages size={14} />
                          {contentLanguage && <span className="text-[0.75rem] font-medium pr-0.5">{contentLanguage}</span>}
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Language</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Language</p>
                        {["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Chinese", "Japanese", "Korean", "Hindi"].map(o => (
                          <button key={o} onClick={() => { setContentLanguage(o); setContentLangOpen(false); }} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentLanguage === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors shrink-0 ${contentFrequency !== "Daily" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Calendar size={14} />
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Frequency</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Frequency</p>
                        {["Daily", "Twice Daily", "3x/Week", "Weekly", "Bi-Weekly", "Monthly"].map(o => (
                          <button key={o} onClick={() => setContentFrequency(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentFrequency === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors shrink-0 ${contentTime !== "9:00 AM" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Clock size={14} />
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Time</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Time</p>
                        {["6:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"].map(o => (
                          <button key={o} onClick={() => setContentTime(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentTime === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors shrink-0 ${contentStyle !== "Informative" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <PenTool size={14} />
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Style</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Style</p>
                        {["Informative", "Storytelling", "List/Tips", "Behind-The-Scenes", "Tutorial", "Promotional"].map(o => (
                          <button key={o} onClick={() => setContentStyle(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentStyle === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <div className="w-px h-5 bg-foreground/[0.08] mx-1 shrink-0" />
                    <Tooltip><TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => {
                        const hasBrand = !!localStorage.getItem("ra_brand_complete");
                        if (!hasBrand && !brandToggle) {
                          toast({ title: "No Brand Profile", description: "Set up your brand profile first to use this feature.", action: <a href="/brand" className="text-accent font-semibold text-[0.78rem] whitespace-nowrap hover:underline">Set Up Brand →</a> });
                        } else {
                          setBrandToggle(v => !v);
                        }
                      }}>
                        <Palette size={13} className="text-muted" />
                        <span className="text-[0.72rem] text-muted font-medium whitespace-nowrap">Brand</span>
                        <div className={`w-8 h-[18px] rounded-full transition-colors relative ${brandToggle ? "bg-accent" : "bg-foreground/[0.15]"}`}>
                          <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm ${brandToggle ? "left-[16px]" : "left-[2px]"}`} />
                        </div>
                      </div>
                    </TooltipTrigger><TooltipContent>Apply Brand</TooltipContent></Tooltip>

                    {/* Brand profile picker - shown when toggle is ON */}
                    {brandToggle && (
                      <Popover open={brandPickerOpen} onOpenChange={setBrandPickerOpen}>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent/15 transition-colors text-[0.72rem] font-semibold text-accent whitespace-nowrap">
                            <div className="w-4 h-4 rounded bg-accent/20 flex items-center justify-center">
                              <Palette size={10} className="text-accent" />
                            </div>
                            <span className="max-w-[100px] truncate">{activeBrandProfile.name}</span>
                            <ChevronDown size={11} className="text-accent/60" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0" side="top" align="start">
                          <div className="p-2 border-b border-foreground/[0.06]">
                            <div className="relative">
                              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                              <input
                                value={brandSearch}
                                onChange={e => setBrandSearch(e.target.value)}
                                placeholder="Search Brand Kits"
                                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-foreground/[0.08] bg-background text-[0.78rem] outline-none focus:border-accent transition-colors"
                              />
                            </div>
                          </div>
                          <div className="p-1.5 max-h-[200px] overflow-y-auto">
                            <p className="text-[0.68rem] font-semibold text-muted px-2 py-1">Select a Brand Kit</p>
                            {brandsData.brands
                              .filter(b => !brandSearch.trim() || b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                              .map(b => (
                                <button
                                  key={b.id}
                                  onClick={() => switchBrandProfile(b.id)}
                                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
                                    b.id === brandsData.activeId ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04]"
                                  }`}
                                >
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    b.id === brandsData.activeId ? "bg-accent/20" : "bg-foreground/[0.06]"
                                  }`}>
                                    <Palette size={13} className={b.id === brandsData.activeId ? "text-accent" : "text-muted"} />
                                  </div>
                                  <span className="text-[0.78rem] font-medium truncate">{b.name}</span>
                                  {b.id === brandsData.activeId && <Check size={14} className="ml-auto text-accent shrink-0" />}
                                </button>
                              ))}
                            {brandsData.brands.filter(b => !brandSearch.trim() || b.name.toLowerCase().includes(brandSearch.toLowerCase())).length === 0 && (
                              <p className="text-[0.75rem] text-muted text-center py-3">No brand kits found</p>
                            )}
                          </div>
                          <div className="p-1.5 border-t border-foreground/[0.06]">
                            <a href="/brand" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-foreground/[0.04] transition-colors text-[0.75rem] font-medium text-accent">
                              <Plus size={13} /> New Brand Kit
                            </a>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )}

                {/* Document-specific toolbar */}
                {selectedType === "document" && selectedSubMode && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-px h-5 bg-foreground/[0.08] mx-0.5 shrink-0" />

                    {/* Model (Auto) */}
                    <Popover open={docModelOpen} onOpenChange={setDocModelOpen}>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${docModel === "Auto" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Cpu size={12} />{docModel}<ChevronDown size={10} className="opacity-60" />
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Model</TooltipContent></Tooltip>
                      <PopoverContent className="w-64 p-1.5" side="bottom" align="start" sideOffset={6}>
                        {[
                          { id: "Auto", desc: "Automatically selects the best model" },
                          { id: "Gemini 3 Flash", desc: "Fast & balanced" },
                          { id: "Gemini 2.5 Pro", desc: "Top-tier reasoning" },
                          { id: "GPT-5", desc: "Powerful all-rounder" },
                          { id: "GPT-5 Mini", desc: "Fast & efficient" },
                          { id: "Claude Sonnet 4", desc: "Excellent writing" },
                        ].map(m => (
                          <button key={m.id} type="button" onClick={() => { setDocModel(m.id); setDocModelOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${docModel === m.id ? "bg-accent/10" : "hover:bg-foreground/[0.04]"}`}>
                            <div>
                              <p className={`text-[0.84rem] font-semibold ${docModel === m.id ? "text-accent" : "text-foreground"}`}>{m.id}</p>
                              <p className="text-[0.72rem] text-muted">{m.desc}</p>
                            </div>
                            {docModel === m.id && <Check size={14} className="text-accent shrink-0" />}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    {/* Source */}
                    <Tooltip><TooltipTrigger asChild>
                      <button type="button" onClick={() => togglePanel("source")}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${activePanel === "source" || addedLinks.length > 0 || sourceFiles.length > 0 || pastedText.length > 0 || audioTranscript.length > 0 ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                        <LinkChain size={14} />
                      </button>
                    </TooltipTrigger><TooltipContent>Source{(addedLinks.length + sourceFiles.length) > 0 ? ` (${addedLinks.length + sourceFiles.length})` : ""}</TooltipContent></Tooltip>

                    {/* Language (icon only) */}
                    <Popover open={docLangOpen} onOpenChange={(o) => { setDocLangOpen(o); if (!o) setDocLangSearch(""); }}>
                       <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors shrink-0 ${docLanguage ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Languages size={14} />
                          {docLanguage && <span className="text-[0.75rem] font-medium pr-0.5">{docLanguage}</span>}
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Language</TooltipContent></Tooltip>
                      <PopoverContent className="w-56 p-2" side="bottom" align="start" sideOffset={6}>
                        <div className="relative mb-2">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                          <input
                            type="text"
                            value={docLangSearch}
                            onChange={e => setDocLangSearch(e.target.value)}
                            placeholder="Search Languages..."
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.1] bg-background text-[0.82rem] focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          {[
                            { lang: "English", flag: "🇺🇸" },
                            { lang: "Spanish", flag: "🇪🇸" },
                            { lang: "French", flag: "🇫🇷" },
                            { lang: "German", flag: "🇩🇪" },
                            { lang: "Italian", flag: "🇮🇹" },
                            { lang: "Portuguese", flag: "🇵🇹" },
                            { lang: "Dutch", flag: "🇳🇱" },
                            { lang: "Russian", flag: "🇷🇺" },
                            { lang: "Chinese", flag: "🇨🇳" },
                            { lang: "Japanese", flag: "🇯🇵" },
                            { lang: "Korean", flag: "🇰🇷" },
                            { lang: "Arabic", flag: "🇸🇦" },
                            { lang: "Hindi", flag: "🇮🇳" },
                          ].filter(o => o.lang.toLowerCase().includes(docLangSearch.toLowerCase())).map(o => (
                            <button key={o.lang} onClick={() => { setDocLanguage(o.lang); setDocLangOpen(false); setDocLangSearch(""); }} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.84rem] transition-colors ${docLanguage === o.lang ? "bg-accent/8 text-foreground" : "hover:bg-foreground/[0.04] text-foreground/80"}`}>
                              <span className="text-base">{o.flag}</span>
                              <span className="flex-1 text-left">{o.lang}</span>
                              {docLanguage === o.lang && <Check size={14} className="text-accent" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Tone */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors shrink-0 ${docTone ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <MessageCircle size={14} />
                          {docTone && <span className="text-[0.75rem] font-medium pr-0.5">{docTone}</span>}
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Tone</TooltipContent></Tooltip>
                      <PopoverContent className="w-48 p-1.5" side="bottom" align="start" sideOffset={6}>
                        {[
                          { label: "Professional", icon: Package },
                          { label: "Conversational", icon: MessageCircle },
                          { label: "Academic", icon: BookOpen },
                          { label: "Friendly", icon: Heart },
                          { label: "Authoritative", icon: Target },
                          { label: "Inspirational", icon: Sparkles },
                          { label: "Casual", icon: Smile },
                          { label: "Technical", icon: Code },
                          { label: "Persuasive", icon: Zap },
                          { label: "Creative", icon: Brush },
                        ].map(o => {
                          const isSelected = docTone === o.label;
                          return (
                            <button key={o.label} onClick={() => setDocTone(o.label)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.82rem] transition-colors ${isSelected ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                              <o.icon size={14} className={isSelected ? "text-accent" : "text-muted"} />
                              {o.label}
                              {isSelected && <Check size={12} className="ml-auto text-accent" />}
                            </button>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* App-specific toolbar icons */}
                {selectedType === "app" && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <div className="w-px h-5 bg-foreground/[0.08] mx-1 shrink-0" />

                    {/* App Model selector */}
                    <Popover open={appModelOpen} onOpenChange={setAppModelOpen}>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${appModel !== "Auto" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Cpu size={12} />{appModel}
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Model</TooltipContent></Tooltip>
                      <PopoverContent className="w-64 p-1.5" align="start" sideOffset={6}>
                        {[
                          { id: "Auto", desc: "AI picks what's best", badge: "SUGGESTED" },
                          { id: "Claude 4.5 Sonnet", desc: "200k Context", badge: null },
                          { id: "Claude 4.5 Opus", desc: "Anthropic's Most Advanced Model", badge: null },
                          { id: "Claude 4.5 Sonnet - 1M", desc: "1 Million Context", badge: "PRO" },
                          { id: "GPT-5.2 (Beta)", desc: "OpenAI's Latest Model", badge: null },
                          { id: "Gemini 3 Pro", desc: "Google's Latest Model", badge: null },
                          { id: "GPT-5.1", desc: "OpenAI's Older Model", badge: null },
                        ].map(m => (
                          <button key={m.id} type="button" onClick={() => { setAppModel(m.id); setAppModelOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${appModel === m.id ? "bg-accent/10" : "hover:bg-foreground/[0.04]"}`}>
                            <Cpu size={14} className={`shrink-0 ${appModel === m.id ? "text-accent" : "text-muted"}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[0.82rem] font-medium ${appModel === m.id ? "text-accent" : "text-foreground"}`}>{m.id}</span>
                                {m.badge && <span className={`text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full ${m.badge === "SUGGESTED" ? "bg-accent/15 text-accent" : "bg-foreground/10 text-foreground/60"}`}>{m.badge}</span>}
                                {appModel === m.id && <Check size={12} className="text-accent ml-auto shrink-0" />}
                              </div>
                              <span className="text-[0.7rem] text-muted">{m.desc}</span>
                            </div>
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    {/* Link */}
                    <Tooltip><TooltipTrigger asChild>
                      <button type="button" className="p-1.5 rounded-lg transition-colors shrink-0 bg-foreground/[0.04] text-muted hover:text-foreground">
                        <ChainLinkIcon size={14} />
                      </button>
                    </TooltipTrigger><TooltipContent>Add Link</TooltipContent></Tooltip>

                    {/* GitHub */}
                    <Tooltip><TooltipTrigger asChild>
                      <button type="button" onClick={() => togglePanel("github")}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${activePanel === "github" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                        <Github size={14} />
                      </button>
                    </TooltipTrigger><TooltipContent>Add from GitHub</TooltipContent></Tooltip>

                    {/* Theme */}
                    <Popover open={appThemeOpen} onOpenChange={setAppThemeOpen}>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors shrink-0 ${appTheme !== "Default" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Palette size={14} />
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Theme</TooltipContent></Tooltip>
                      <PopoverContent className="w-60 p-0" align="end" sideOffset={6}>
                        <div className="p-2 border-b border-foreground/[0.06]">
                          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-foreground/[0.04]">
                            <Search size={13} className="text-muted shrink-0" />
                            <input value={appThemeSearch} onChange={e => setAppThemeSearch(e.target.value)} placeholder="Search themes..." className="bg-transparent border-none outline-none text-[0.8rem] text-foreground placeholder:text-muted/50 w-full" />
                          </div>
                        </div>
                        <div className="p-1.5 max-h-[280px] overflow-y-auto">
                          <p className="text-[0.68rem] font-semibold text-muted px-2.5 py-1.5">Default themes</p>
                          {[
                            { id: "Default",   colors: ["#1a1a1a","#333","#666","#ccc"] },
                            { id: "Glacier",   colors: ["#1e3a5f","#2563eb","#3b82f6","#93c5fd"] },
                            { id: "Harvest",   colors: ["#7c2d12","#c2410c","#ea580c","#fdba74"] },
                            { id: "Lavender",  colors: ["#4c1d95","#6d28d9","#8b5cf6","#c4b5fd"] },
                            { id: "Brutalist", colors: ["#1a1a1a","#333","#555","#f472b6"] },
                            { id: "Obsidian",  colors: ["#1a2e1a","#2d4a2d","#4ade80","#86efac"] },
                            { id: "Orchid",    colors: ["#831843","#be185d","#ec4899","#f9a8d4"] },
                          ].filter(t => t.id.toLowerCase().includes(appThemeSearch.toLowerCase())).map(t => (
                            <button key={t.id} type="button" onClick={() => { setAppTheme(t.id); setAppThemeOpen(false); setAppThemeSearch(""); }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[0.82rem] transition-colors ${appTheme === t.id ? "text-accent font-semibold" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                              <span>{t.id}</span>
                              <div className="flex items-center gap-0.5">
                                {t.colors.map((c, i) => (
                                  <div key={i} className="w-4 h-4 rounded-full border border-foreground/10" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            </button>
                          ))}
                          <button type="button" className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[0.82rem] hover:bg-foreground/[0.04] text-muted transition-colors mt-1">
                            <Plus size={13} /><span>Create New</span>
                            <SlidersHorizontal size={12} className="ml-auto" />
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Advanced Controls */}
                    <Tooltip><TooltipTrigger asChild>
                      <button type="button" onClick={() => togglePanel("advanced")}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${activePanel === "advanced" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                        <SlidersHorizontal size={14} />
                      </button>
                    </TooltipTrigger><TooltipContent>Advanced Controls</TooltipContent></Tooltip>
                  </div>
                )}
                </div>
              </div>

              {/* Child 2 — Pinned action group: AI enhancer | divider | mic | send */}
              <div className="flex items-center shrink-0 ml-auto pl-4 border-l border-foreground/[0.1]">
                {prompt.trim() && (
                  <Tooltip><TooltipTrigger asChild>
                    <button type="button" onClick={handleEnhance} disabled={isEnhancing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted-foreground rounded-lg text-[0.78rem] font-medium transition-colors disabled:opacity-50 whitespace-nowrap mr-2">
                      {isEnhancing ? <Loader2 size={14} className="animate-spin text-purple-500" /> : <Sparkles size={14} className="text-purple-500" />}
                      <span>AI</span><ChevronDown size={12} className="text-muted" />
                    </button>
                  </TooltipTrigger><TooltipContent>Enhance Prompt</TooltipContent></Tooltip>
                )}
                {isSupported && (
                  <Tooltip><TooltipTrigger asChild>
                    <button type="button" onClick={isListening ? cancelSpeech : startListening} className={`p-1.5 rounded-lg transition-colors mr-2 ${isListening ? "bg-accent/10 text-accent animate-pulse" : "bg-foreground/[0.04] hover:bg-foreground/[0.08]"}`}><Mic size={15} className={isListening ? "" : "!text-black dark:!text-white"} /></button>
                  </TooltipTrigger><TooltipContent>{isListening ? "Stop" : "Speak"}</TooltipContent></Tooltip>
                )}
                <button type="button" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-white hover:bg-accent/85 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.03] active:scale-95">
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Active selections summary ── */}
        {(startFrame || endFrame || selectedGenre || selectedTheme) && (
          <div className="max-w-[960px] mx-auto mt-2 px-1">
            <div className="flex items-center gap-2 flex-wrap">

              {/* Frames selection */}
              {(startFrame || endFrame) && selectedType !== "video" && (
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
                  <X size={12} className="text-muted/40 group-hover:text-foreground ml-1" onClick={e => { e.stopPropagation(); clearFrame("start"); clearFrame("end"); }} />
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
          {activePanel === "style" && (
            <div className="rounded-xl border border-foreground/[0.08] bg-background p-5 mt-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[0.85rem] font-bold">{selectedType === "video" ? "Video Style" : selectedType === "design" ? "Design Style" : "Art Style"}</h3>
                <button onClick={() => setActivePanel(null)} className="text-muted hover:text-foreground transition-colors">
                  <X size={16} />
                </button>
              </div>
              {selectedType === "video" ? (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Cinematic", label: "Cinematic", img: styleVideoCinematic },
                    { id: "Documentary", label: "Documentary", img: styleVideoDocumentary },
                    { id: "Animation", label: "Animation", img: styleVideoAnimation },
                    { id: "Realistic", label: "Realistic", img: styleVideoRealistic },
                  ].map(s => (
                    <button key={s.id} type="button" onClick={() => { setSelectedStyle(prev => prev === s.id ? "None" : s.id); setActivePanel(null); }}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${selectedStyle === s.id ? "ring-2 ring-accent bg-accent/10" : "hover:bg-foreground/[0.04]"}`}>
                      <img src={s.img} alt={s.label} className="w-full aspect-square rounded-lg object-cover" loading="lazy" />
                      <span className={`text-[0.68rem] font-medium leading-none ${selectedStyle === s.id ? "text-accent" : "text-foreground/70"}`}>{s.label}</span>
                      {selectedStyle === s.id && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                    </button>
                  ))}
                </div>
              ) : selectedType === "design" && selectedSubMode === "presentation" ? (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[
                    { id: "Minimalist", label: "Minimalist", img: presMinimalist },
                    { id: "Playful", label: "Playful", img: presPlayful },
                    { id: "Organic", label: "Organic", img: presOrganic },
                    { id: "Geometric", label: "Geometric", img: presGeometric },
                    { id: "Modular", label: "Modular", img: presModular },
                    { id: "Elegant", label: "Elegant", img: presElegant },
                    { id: "Digital", label: "Digital", img: presDigital },
                  ].map(s => (
                    <button key={s.id} type="button" onClick={() => { setPresDeckStyle(s.id); setSelectedStyle(s.id); setActivePanel(null); }}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${presDeckStyle === s.id ? "ring-2 ring-accent bg-accent/10" : "hover:bg-foreground/[0.04]"}`}>
                      <img src={s.img} alt={s.label} className="w-full aspect-square rounded-lg object-cover" loading="lazy" />
                      <span className={`text-[0.68rem] font-medium leading-none ${presDeckStyle === s.id ? "text-accent" : "text-foreground/70"}`}>{s.label}</span>
                      {presDeckStyle === s.id && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                    </button>
                  ))}
                </div>
              ) : selectedType === "design" ? (
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                  {[
                    { id: "Bold", label: "Bold", img: styleMoodBold },
                    { id: "Minimal", label: "Minimal", img: styleMoodMinimal },
                    { id: "Neon", label: "Neon", img: styleMoodNeon },
                    { id: "Earthy", label: "Earthy", img: styleMoodEarthy },
                    { id: "Monochrome", label: "Monochrome", img: styleMoodMonochrome },
                    { id: "Gradient", label: "Gradient", img: styleMoodGradient },
                    { id: "Flat Illustration", label: "Flat", img: styleFlatIllustration },
                    { id: "Pop Art", label: "Pop Art", img: stylePopArt },
                    { id: "Retro", label: "Retro", img: styleRetro },
                    { id: "Cyberpunk", label: "Cyberpunk", img: styleCyberpunk },
                    { id: "Vaporwave", label: "Vaporwave", img: styleVaporwave },
                    { id: "Pastel", label: "Pastel", img: stylePastel },
                    { id: "Gothic", label: "Gothic", img: styleGothic },
                    { id: "Art Nouveau", label: "Art Nouveau", img: styleArtNouveau },
                  ].map(s => (
                    <button key={s.id} type="button" onClick={() => { setSelectedStyle(prev => prev === s.id ? "None" : s.id); setDesignColorScheme(prev => prev === s.id ? "Auto" : s.id); setActivePanel(null); }}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${selectedStyle === s.id ? "ring-2 ring-accent bg-accent/10" : "hover:bg-foreground/[0.04]"}`}>
                      <img src={s.img} alt={s.label} className="w-full aspect-square rounded-lg object-cover" loading="lazy" />
                      <span className={`text-[0.68rem] font-medium leading-none ${selectedStyle === s.id ? "text-accent" : "text-foreground/70"}`}>{s.label}</span>
                      {selectedStyle === s.id && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                    </button>
                  ))}
                </div>
              ) : (
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                {[
                  { id: "Photorealistic", label: "Photo", img: stylePhotorealistic },
                  { id: "Anime", label: "Anime", img: styleAnime },
                  { id: "Digital Art", label: "Digital", img: styleDigitalArt },
                  { id: "Oil Painting", label: "Oil", img: styleOilPainting },
                  { id: "Watercolor", label: "Watercolor", img: styleWatercolor },
                  { id: "3D Render", label: "3D", img: style3dRender },
                  { id: "Pixel Art", label: "Pixel", img: stylePixelArt },
                  { id: "Comic Book", label: "Comic", img: styleComicBook },
                  { id: "Cinematic", label: "Cinematic", img: styleCinematic },
                  { id: "Flat Illustration", label: "Flat", img: styleFlatIllustration },
                  { id: "Impressionist", label: "Impressionist", img: styleImpressionist },
                  { id: "Sketch", label: "Sketch", img: styleSketch },
                  { id: "Pop Art", label: "Pop Art", img: stylePopArt },
                  { id: "Cyberpunk", label: "Cyberpunk", img: styleCyberpunk },
                  { id: "Vaporwave", label: "Vaporwave", img: styleVaporwave },
                  { id: "Ukiyo-e", label: "Ukiyo-e", img: styleUkiyoE },
                  { id: "Surreal", label: "Surreal", img: styleSurreal },
                  { id: "Art Nouveau", label: "Art Nouveau", img: styleArtNouveau },
                  { id: "Steampunk", label: "Steampunk", img: styleSteampunk },
                  { id: "Gothic", label: "Gothic", img: styleGothic },
                  { id: "Isometric", label: "Isometric", img: styleIsometric },
                  { id: "Pastel", label: "Pastel", img: stylePastel },
                  { id: "Retro", label: "Retro", img: styleRetro },
                  { id: "Stained Glass", label: "Glass", img: styleStainedGlass },
                  { id: "Pointillism", label: "Pointillism", img: stylePointillism },
                ].map(s => (
                  <button key={s.id} type="button" onClick={() => { setSelectedStyle(prev => prev === s.id ? "None" : s.id); setActivePanel(null); }}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${selectedStyle === s.id ? "ring-2 ring-accent bg-accent/10" : "hover:bg-foreground/[0.04]"}`}>
                    {s.img ? (
                      <img src={s.img} alt={s.label} className="w-full aspect-square rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-foreground/[0.06] flex items-center justify-center text-muted">
                        <X size={16} />
                      </div>
                    )}
                    <span className={`text-[0.68rem] font-medium leading-none ${selectedStyle === s.id ? "text-accent" : "text-foreground/70"}`}>{s.label}</span>
                    {selectedStyle === s.id && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                  </button>
                ))}
              </div>
              )}
            </div>
          )}
          {activePanel === "reference" && (
            <ReferencePanel
              onClose={() => setActivePanel(null)}
              references={references}
              onAdd={ref => {
                setReferences(prev => [...prev, ref]);
                // In video mode, auto-fill empty frame slots with the new reference
                if (selectedType === "video") {
                  // Fill whichever frame slot is empty (start first, then end)
                  if (!startFrame) {
                    setStartFrame(ref.src);
                    setStartFrameMeta({ sourceType: "reference", refId: ref.id });
                    setStartFrameLocked(true);
                  } else if (!endFrame) {
                    setEndFrame(ref.src);
                    setEndFrameMeta({ sourceType: "reference", refId: ref.id });
                    setEndFrameLocked(true);
                  }
                }
              }}
              onRemove={id => {
                setReferences(prev => prev.filter(r => r.id !== id));
                // Also clear any frame that was linked to this reference
                if (startFrameMeta?.refId === id) {
                  setStartFrame(null);
                  setStartFrameMeta(null);
                }
                if (endFrameMeta?.refId === id) {
                  setEndFrame(null);
                  setEndFrameMeta(null);
                }
              }}
            />
          )}
          {activePanel === "source" && (
            <div className="border border-foreground/[0.08] rounded-2xl p-5 mb-4 mt-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[0.95rem] font-bold text-foreground">Sources</h3>
                <button type="button" onClick={() => setActivePanel(null)} className="p-1 rounded-lg hover:bg-foreground/[0.06] text-muted hover:text-foreground transition-colors"><X size={16} /></button>
              </div>
              <p className="text-[0.75rem] text-muted mb-4">Upload or link source material to guide the AI</p>

              {/* Source type tabs */}
              <div className="flex items-center gap-1 mb-4 overflow-x-auto">
                {[
                  { id: "upload", label: "Upload File", icon: Upload },
                  { id: "url", label: "Insert Link", icon: ChainLinkIcon as any },
                  { id: "text", label: "Paste Text", icon: FileText },
                  { id: "audio", label: "Record Audio", icon: Mic },
                  { id: "collections", label: "Collections", icon: FolderOpen },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setActiveSourceTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold whitespace-nowrap transition-colors ${activeSourceTab === t.id ? "bg-foreground text-primary-foreground" : "bg-foreground/[0.04] text-muted hover:text-foreground hover:bg-foreground/[0.08]"}`}>
                    <t.icon size={13} />{t.label}
                  </button>
                ))}
              </div>

              {/* Upload tab */}
              {activeSourceTab === "upload" && (
                <>
                  <input
                    ref={sourceFileRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.txt,.md,.csv,.json"
                    className="hidden"
                    onChange={e => {
                      const files = e.target.files;
                      if (!files) return;
                      const newFiles = Array.from(files).map(f => ({
                        name: f.name,
                        size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(1)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                        type: f.name.split(".").pop()?.toUpperCase() || "FILE",
                      }));
                      setSourceFiles(prev => [...prev, ...newFiles].slice(0, 10));
                      e.target.value = "";
                    }}
                  />
                  <div
                    className="rounded-xl border-2 border-dashed border-foreground/[0.10] bg-foreground/[0.02] p-8 flex flex-col items-center justify-center min-h-[180px] cursor-pointer hover:border-accent/40 hover:bg-accent/[0.02] transition-colors"
                    onClick={() => sourceFileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-accent/40", "bg-accent/[0.04]"); }}
                    onDragLeave={e => { e.currentTarget.classList.remove("border-accent/40", "bg-accent/[0.04]"); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-accent/40", "bg-accent/[0.04]");
                      const files = e.dataTransfer.files;
                      if (!files) return;
                      const newFiles = Array.from(files).map(f => ({
                        name: f.name,
                        size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(1)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                        type: f.name.split(".").pop()?.toUpperCase() || "FILE",
                      }));
                      setSourceFiles(prev => [...prev, ...newFiles].slice(0, 10));
                    }}
                  >
                    <Upload size={28} className="text-accent mb-3" />
                    <p className="text-[0.92rem] font-bold text-foreground mb-1">Drag & Drop Files Here</p>
                    <p className="text-[0.75rem] text-muted/60 mb-4">PDF, DOCX, TXT, MD — up to 50MB each</p>
                    <button type="button" onClick={e => { e.stopPropagation(); sourceFileRef.current?.click(); }} className="px-6 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-bold hover:bg-accent transition-colors">
                      Browse Files
                    </button>
                  </div>
                  {sourceFiles.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {sourceFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06]">
                          <FileText size={14} className="text-accent shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.78rem] font-medium text-foreground truncate">{f.name}</p>
                            <p className="text-[0.65rem] text-muted">{f.type} · {f.size}</p>
                          </div>
                          <button type="button" onClick={() => setSourceFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-muted hover:text-foreground transition-colors shrink-0"><X size={13} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[0.72rem] text-muted/50 mt-3">Add up to 10 source files to guide the AI generation.</p>
                </>
              )}

              {/* Insert Link tab */}
              {activeSourceTab === "url" && (
                <>
                  <p className="text-[0.78rem] text-muted mb-3">Quick import from a public link</p>
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {[
                      { name: "YouTube", placeholder: "https://youtube.com/watch?v=", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                      { name: "X", placeholder: "https://x.com/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                      { name: "Instagram", placeholder: "https://instagram.com/p/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5"><defs><radialGradient id="ig" r="150%" cx="30%" cy="107%"><stop offset="0" stopColor="#fdf497"/><stop offset=".05" stopColor="#fdf497"/><stop offset=".45" stopColor="#fd5949"/><stop offset=".6" stopColor="#d6249f"/><stop offset=".9" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
                      { name: "TikTok", placeholder: "https://tiktok.com/@", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
                      { name: "LinkedIn", placeholder: "https://linkedin.com/in/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                      { name: "Reddit", placeholder: "https://reddit.com/r/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg> },
                      { name: "Pinterest", placeholder: "https://pinterest.com/pin/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E60023"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg> },
                      { name: "Facebook", placeholder: "https://facebook.com/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                      { name: "Medium", placeholder: "https://medium.com/@", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg> },
                      { name: "Substack", placeholder: "https://substack.com/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF6719"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg> },
                      { name: "GitHub", placeholder: "https://github.com/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
                      { name: "Spotify", placeholder: "https://open.spotify.com/", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> },
                      { name: "RSS Feed", placeholder: "https://example.com/feed.xml", svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#F26522"><path d="M19.199 24C19.199 13.467 10.533 4.8 0 4.8V0c13.165 0 24 10.835 24 24h-4.801zM3.291 17.415a3.3 3.3 0 0 1 3.293 3.295A3.303 3.303 0 0 1 3.283 24C1.47 24 0 22.526 0 20.71s1.475-3.295 3.291-3.295zM15.909 24h-4.665c0-6.169-5.075-11.245-11.244-11.245V8.09c8.727 0 15.909 7.184 15.909 15.91z"/></svg> },
                    ].slice(0, showAllPlatforms ? undefined : 5).map(platform => (
                      <Tooltip key={platform.name}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSourceUrl(platform.placeholder)}
                            className="p-2.5 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.07] border border-foreground/[0.06] transition-colors"
                          >
                            {platform.svg}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{platform.name}</TooltipContent>
                      </Tooltip>
                    ))}
                    {!showAllPlatforms && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" onClick={() => setShowAllPlatforms(true)} className="p-2.5 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.07] border border-foreground/[0.06] transition-colors text-[0.72rem] font-bold text-muted">
                            +8
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Show more platforms</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={e => setSourceUrl(e.target.value)}
                      placeholder="Paste any URL..."
                      className="flex-1 px-3 py-2.5 rounded-lg border border-foreground/[0.10] bg-foreground/[0.02] text-[0.82rem] text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (sourceUrl.trim()) {
                          setAddedLinks(prev => [...prev, sourceUrl.trim()]);
                          setSourceUrl("");
                        }
                      }}
                      className="px-4 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-bold hover:bg-accent transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  {addedLinks.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {addedLinks.map((link, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06]">
                          <ChainLinkIcon size={12} className="text-muted shrink-0" />
                          <span className="text-[0.75rem] text-foreground truncate flex-1">{link}</span>
                          <button type="button" onClick={() => setAddedLinks(prev => prev.filter((_, idx) => idx !== i))} className="text-muted hover:text-foreground transition-colors shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Paste Text tab */}
              {activeSourceTab === "text" && (
                <>
                  <textarea
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Paste your source text here..."
                    className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-foreground/[0.10] bg-foreground/[0.02] text-[0.85rem] text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/40 resize-y"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[0.72rem] text-muted/50">
                      {pastedText.length > 0 ? `${pastedText.length.toLocaleString()} characters · ${pastedText.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words` : "Paste articles, notes, or any text to use as source material."}
                    </p>
                    <div className="flex items-center gap-2">
                      {pastedText.length > 0 && (
                        <button type="button" onClick={() => setPastedText("")} className="text-[0.72rem] text-muted hover:text-foreground transition-colors">Clear</button>
                      )}
                      {pastedText.trim().length > 0 && (
                        <button type="button" onClick={() => {
                          setPrompt(prev => prev ? prev + " " + pastedText.trim() : pastedText.trim());
                          setPastedText("");
                          toast({ title: "Added to prompt", description: "Your text has been added to the prompt box." });
                        }} className="px-4 py-1.5 rounded-lg bg-accent text-white text-[0.75rem] font-bold hover:bg-accent/90 transition-colors">
                          Add to Prompt
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Record Audio tab */}
              {activeSourceTab === "audio" && (
                <div className="rounded-xl border border-foreground/[0.08] bg-accent/[0.03] p-6 flex flex-col items-center justify-center min-h-[220px]">
                  {!isRecordingAudio && !audioTranscript && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                        <Mic size={28} className="text-accent" />
                      </div>
                      <p className="text-[0.95rem] font-bold text-foreground mb-1">Record & Transcribe</p>
                      <p className="text-[0.78rem] text-muted/60 mb-5">Speak your ideas — live transcription appears as you talk</p>
                      <button type="button" onClick={() => {
                        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                        if (!SR) { toast({ title: "Not Supported", description: "Speech recognition is not supported in this browser." }); return; }
                        const r = new SR();
                        r.continuous = true;
                        r.interimResults = true;
                        r.onresult = (e: any) => {
                          let t = "";
                          for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
                          setAudioTranscript(t);
                        };
                        r.onerror = () => setIsRecordingAudio(false);
                        r.onend = () => setIsRecordingAudio(false);
                        audioRecogRef.current = r;
                        r.start();
                        setIsRecordingAudio(true);
                      }} className="px-8 py-3 rounded-lg bg-accent text-white text-[0.85rem] font-bold hover:bg-accent/90 transition-colors shadow-md shadow-accent/20">
                        <span className="flex items-center gap-2"><Mic size={16} /> Start Recording</span>
                      </button>
                    </>
                  )}
                  {isRecordingAudio && (
                    <div className="w-full flex flex-col items-center">
                      {/* LIVE badge */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                        <span className="px-3 py-1 rounded-lg bg-accent/90 text-white text-[0.72rem] font-extrabold tracking-widest uppercase">LIVE</span>
                        <span className="text-[0.88rem] font-medium text-muted-foreground">Real-Time Transcription</span>
                      </div>

                      {/* Animated audio waveform */}
                      <div className="flex items-center justify-center gap-[2px] h-10 mb-5">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-[3px] rounded-full bg-accent"
                            style={{
                              animation: `audioBar 0.8s ease-in-out ${i * 0.04}s infinite alternate`,
                              height: `${6 + Math.sin(i * 0.5) * 14 + Math.random() * 8}px`,
                            }}
                          />
                        ))}
                      </div>

                      {/* Live transcript */}
                      <div className="w-full max-w-lg min-h-[60px] px-4 py-3 rounded-xl bg-background border border-foreground/[0.08] mb-5">
                        {audioTranscript ? (
                          <p className="text-[0.85rem] text-foreground leading-relaxed">{audioTranscript}<span className="inline-block w-[2px] h-4 bg-accent ml-0.5 animate-pulse align-middle" /></p>
                        ) : (
                          <p className="text-[0.82rem] text-muted/40 italic">Listening... start speaking</p>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => {
                          audioRecogRef.current?.stop();
                          setIsRecordingAudio(false);
                          setAudioTranscript("");
                        }} className="px-5 py-2.5 rounded-lg bg-foreground/[0.06] text-foreground text-[0.82rem] font-medium hover:bg-foreground/[0.1] transition-colors">
                          Cancel
                        </button>
                        <button type="button" onClick={() => {
                          audioRecogRef.current?.stop();
                          setIsRecordingAudio(false);
                          if (audioTranscript.trim()) {
                            setPrompt(prev => prev ? prev + " " + audioTranscript.trim() : audioTranscript.trim());
                            setAudioTranscript("");
                            toast({ title: "Transcription added", description: "Your speech has been added to the prompt." });
                          }
                        }} className="px-5 py-2.5 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/90 transition-colors shadow-sm">
                          <span className="flex items-center gap-1.5"><Check size={14} /> Done</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {!isRecordingAudio && audioTranscript && (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                        <Check size={22} className="text-accent" />
                      </div>
                      <p className="text-[0.92rem] font-bold text-foreground mb-2">Transcription Complete</p>
                      <div className="w-full max-w-lg px-4 py-3 rounded-xl bg-background border border-foreground/[0.08] mb-4">
                        <p className="text-[0.85rem] text-foreground leading-relaxed">{audioTranscript}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setAudioTranscript("")} className="px-4 py-2 rounded-lg bg-foreground/[0.06] text-foreground text-[0.82rem] font-medium hover:bg-foreground/[0.1] transition-colors">Discard</button>
                        <button type="button" onClick={() => {
                          const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                          if (!SR) return;
                          const r = new SR();
                          r.continuous = true;
                          r.interimResults = true;
                          r.onresult = (e: any) => {
                            let t = "";
                            for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
                            setAudioTranscript(t);
                          };
                          r.onerror = () => setIsRecordingAudio(false);
                          r.onend = () => setIsRecordingAudio(false);
                          audioRecogRef.current = r;
                          r.start();
                          setIsRecordingAudio(true);
                        }} className="px-4 py-2 rounded-lg bg-foreground/[0.06] text-foreground text-[0.82rem] font-medium hover:bg-foreground/[0.1] transition-colors">Re-record</button>
                        <button type="button" onClick={() => {
                          setPrompt(prev => prev ? prev + " " + audioTranscript.trim() : audioTranscript.trim());
                          setAudioTranscript("");
                          toast({ title: "Added to prompt", description: "Transcription has been added to the prompt box." });
                        }} className="px-4 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/90 transition-colors">
                          <span className="flex items-center gap-1.5"><ArrowUp size={13} /> Add to Prompt</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Collections tab */}
              {activeSourceTab === "collections" && (
                <div className="space-y-3">
                  <p className="text-[0.78rem] text-muted">Select from your saved collections to use as source material.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "c1", name: "Brand Assets", count: 12, icon: Palette },
                      { id: "c2", name: "Research Notes", count: 8, icon: BookOpen },
                      { id: "c3", name: "Product Photos", count: 24, icon: Camera },
                      { id: "c4", name: "Templates", count: 6, icon: Layers },
                    ].map(col => (
                      <button key={col.id} type="button" className="flex items-center gap-2.5 p-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] hover:border-accent/30 hover:bg-accent/[0.03] transition-colors text-left">
                        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <col.icon size={16} className="text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.78rem] font-semibold text-foreground truncate">{col.name}</p>
                          <p className="text-[0.65rem] text-muted">{col.count} items</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Link to="/collections" className="inline-flex items-center gap-1.5 text-[0.75rem] text-accent font-medium hover:underline mt-1">
                    View All Collections <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}
          {activePanel === "character" && (
            <CharacterPanel
              onClose={() => setActivePanel(null)}
              selectedCharacters={selectedCharacters}
              onToggle={toggleCharacter}
              onClear={() => setSelectedCharacters([])}
            />
          )}
          {activePanel === "frames" && showFrames && selectedType !== "video" && (
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

          {/* GitHub panel */}
          {activePanel === "github" && selectedType === "app" && (
            <div className="rounded-xl border border-foreground/[0.08] bg-background p-5 mt-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Github size={18} className="text-foreground" />
                  <span className="text-[0.9rem] font-semibold text-foreground">Add from GitHub</span>
                </div>
                <button onClick={() => setActivePanel(null)} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
              </div>
              <div className="flex rounded-lg border border-foreground/[0.1] overflow-hidden mb-4">
                <button onClick={() => setAppGithubTab("private")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[0.82rem] font-semibold transition-colors ${appGithubTab === "private" ? "bg-foreground text-primary-foreground" : "bg-foreground/[0.03] text-foreground hover:bg-foreground/[0.06]"}`}>
                  <Lock size={14} />Private Repository
                </button>
                <button onClick={() => setAppGithubTab("public")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[0.82rem] font-semibold transition-colors ${appGithubTab === "public" ? "bg-foreground text-primary-foreground" : "bg-foreground/[0.03] text-foreground hover:bg-foreground/[0.06]"}`}>
                  <Globe size={14} />Public Repository
                </button>
              </div>
              {appGithubTab === "private" ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.85rem] font-semibold text-foreground">GitHub Authentication Required</p>
                    <p className="text-[0.78rem] text-muted">Connect your GitHub account to access all your private and public repositories.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-primary-foreground text-[0.82rem] font-semibold hover:bg-accent/90 transition-colors shrink-0">
                    <Github size={15} />Connect to GitHub
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.1]">
                    <ChainLinkIcon size={14} className="text-muted shrink-0" />
                    <input value={appGithubUrl} onChange={e => setAppGithubUrl(e.target.value)} placeholder="Paste public GitHub repository URL..." className="bg-transparent border-none outline-none text-[0.82rem] text-foreground placeholder:text-muted/50 w-full" />
                  </div>
                  {appGithubUrl.trim() && (
                    <button className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-primary-foreground text-[0.82rem] font-semibold hover:bg-accent/90 transition-colors">
                      <Download size={14} />Import Repository
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Advanced Controls panel */}
          {activePanel === "advanced" && selectedType === "app" && (
            <div className="rounded-xl border border-foreground/[0.08] bg-background p-5 mt-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-accent" />
                  <span className="text-[0.9rem] font-semibold text-accent">Advanced Controls</span>
                </div>
                <button onClick={() => setActivePanel(null)} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                {/* MCP Tools */}
                <div>
                  <p className="text-[0.78rem] font-semibold text-foreground mb-1.5 flex items-center gap-1.5">Select MCPs to use <span className="text-[0.6rem] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-bold">New</span></p>
                  <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-foreground/[0.03] border border-foreground/[0.1] text-[0.82rem] text-muted hover:border-foreground/20 transition-colors">
                    <div className="flex items-center gap-2"><Settings size={14} />Select MCP Tools</div>
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Template + Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[0.78rem] font-semibold text-foreground mb-1.5">Select Template</p>
                    <input value={appTemplate} onChange={e => setAppTemplate(e.target.value)} placeholder="Template URL or name..." className="w-full px-3 py-2.5 rounded-lg bg-foreground/[0.03] border border-foreground/[0.1] text-[0.82rem] text-foreground placeholder:text-muted/50 outline-none focus:border-accent/40 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[0.78rem] font-semibold text-foreground mb-1.5">Budget (Credits)</p>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/[0.1]">
                      <button onClick={() => setAppBudget(v => Math.max(1, v - 5))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] text-foreground transition-colors"><Minus size={14} /></button>
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-500">●</span>
                        <span className="text-[0.9rem] font-bold text-foreground">{appBudget}</span>
                      </div>
                      <button onClick={() => setAppBudget(v => v + 5)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] text-foreground transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>

                {/* Model */}
                <div>
                  <p className="text-[0.78rem] font-semibold text-foreground mb-1.5">Model</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-foreground/[0.03] border border-foreground/[0.1] text-[0.82rem] text-foreground hover:border-foreground/20 transition-colors">
                        <div className="flex items-center gap-2"><Layers size={14} className="text-muted" />{appModel}</div>
                        <ChevronDown size={14} className="text-muted" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-1.5" align="start">
                      {["Auto", "Claude 4.5 Sonnet", "Claude 4.5 Opus", "GPT-5.2 (Beta)", "Gemini 3 Pro", "GPT-5.1"].map(m => (
                        <button key={m} type="button" onClick={() => setAppModel(m)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] transition-colors ${appModel === m ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          {m}{appModel === m && <Check size={12} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Story scenes panel */}
        {selectedType === "video" && selectedSubMode === "story" && storyMode === "manual" && (
          <div className="max-w-[960px] mx-auto">
            <StoryScenesPanel scenes={storyScenes} onScenesChange={setStoryScenes} />
          </div>
        )}

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

  // App builder mode
  const [appBuilderMode, setAppBuilderMode] = useState(false);
  const [appConversation, setAppConversation] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [appBuilderInput, setAppBuilderInput] = useState("");
  const [appBuildingVersion, setAppBuildingVersion] = useState(0);
  const [appIsThinking, setAppIsThinking] = useState(false);
  const [appShowCode, setAppShowCode] = useState(false);
  const [appPreviewContent, setAppPreviewContent] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [appConversation, appIsThinking]);

  const handleGenerate = ({ type, prompt, subMode }: { type: ContentType | null; prompt: string; subMode: string | null }) => {
    if (type === "app") {
      setAppBuilderMode(true);
      setAppConversation([{ role: "user", text: prompt }]);
      setAppIsThinking(true);
      setAppBuildingVersion(1);
      // Simulate AI response
      setTimeout(() => {
        const buildType = subMode === "website" ? "website" : subMode === "saas" ? "SaaS application" : subMode === "ai-agent" ? "AI agent" : "web application";
        setAppConversation(prev => [...prev, {
          role: "ai",
          text: `I'll create a modern, professional ${buildType} with a strong visual identity and clear call-to-action flow.\n\nHere's your ${buildType} — a sleek, professional design with dark theme and accent colors. It includes a hero section, feature grid, and a fully working contact form.\n\nTry scrolling through and interacting with the preview! You can also customize the text, colors, and fonts through the chat.`
        }]);
        setAppIsThinking(false);
        setAppPreviewContent(prompt);
      }, 3000);
    } else {
      setGenerated(true);
    }
  };

  const handleAppFollowUp = () => {
    if (!appBuilderInput.trim()) return;
    const msg = appBuilderInput.trim();
    setAppBuilderInput("");
    setAppConversation(prev => [...prev, { role: "user", text: msg }]);
    setAppIsThinking(true);
    setTimeout(() => {
      setAppBuildingVersion(v => v + 1);
      setAppConversation(prev => [...prev, {
        role: "ai",
        text: `Done! I've updated the design based on your feedback. The changes are now reflected in the preview.`
      }]);
      setAppIsThinking(false);
    }, 2500);
  };

  const exitAppBuilder = () => {
    setAppBuilderMode(false);
    setAppConversation([]);
    setAppPreviewContent("");
    setAppBuildingVersion(0);
  };

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

  // ── App Builder Mode ──
  if (appBuilderMode) {
    return (
      <PageShell>
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          {/* Left Chat Panel */}
          <div className="w-[440px] min-w-[360px] max-w-[500px] flex flex-col border-r border-foreground/[0.08] bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-foreground/[0.08]">
              <button onClick={exitAppBuilder} className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors text-[0.82rem]">
                <ArrowRight size={14} className="rotate-180" />
              </button>
              <h2 className="text-[0.88rem] font-bold truncate flex-1">
                {appConversation[0]?.text.slice(0, 50)}{(appConversation[0]?.text.length || 0) > 50 ? "…" : ""}
              </h2>
              {appBuildingVersion > 0 && (
                <span className="text-[0.72rem] font-medium text-muted bg-foreground/[0.05] px-2 py-0.5 rounded-md">
                  Version {appBuildingVersion}
                </span>
              )}
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {appConversation.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[0.84rem] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-foreground/[0.08] text-foreground rounded-br-md"
                      : "text-foreground"
                  }`}>
                    {msg.text}
                    {msg.role === "ai" && i === appConversation.length - 1 && appBuildingVersion > 0 && (
                      <button className="mt-3 flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-foreground transition-colors">
                        Version {appBuildingVersion} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {appIsThinking && (
                <div className="flex justify-start">
                  <div className="text-foreground text-[0.84rem]">
                    <div className="flex items-center gap-2 text-muted">
                      <Loader2 size={14} className="animate-spin" />
                      <span>We're working on your code. Hang tight — it'll be ready soon.</span>
                    </div>
                    <div className="text-[0.78rem] text-muted/60 mt-1">Coding for you…</div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="px-4 pb-4 pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={appBuilderInput}
                  onChange={e => setAppBuilderInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAppFollowUp(); } }}
                  placeholder="Ask me anything"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-foreground/[0.12] bg-background text-[0.84rem] outline-none focus:border-foreground/25 transition-colors placeholder:text-muted/50"
                />
                <button
                  onClick={handleAppFollowUp}
                  disabled={!appBuilderInput.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted hover:text-foreground transition-colors disabled:opacity-30"
                >
                  <Mic size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="flex-1 flex flex-col bg-muted/20 min-w-0">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-foreground/[0.08] bg-background">
              <div className="flex items-center gap-3">
                {appBuildingVersion > 0 && (
                  <span className="text-[0.82rem] font-semibold text-foreground">Version {appBuildingVersion}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAppShowCode(!appShowCode)}
                  className={`flex items-center gap-2 text-[0.78rem] font-medium px-3 py-1.5 rounded-lg transition-colors ${appShowCode ? "bg-foreground/[0.08] text-foreground" : "text-muted hover:text-foreground"}`}
                >
                  Show code
                  <div className={`w-8 h-4.5 rounded-full transition-colors relative ${appShowCode ? "bg-foreground" : "bg-foreground/20"}`}>
                    <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-background shadow transition-transform ${appShowCode ? "left-[calc(100%-0.95rem)]" : "left-0.5"}`} />
                  </div>
                </button>
                <button className="flex items-center gap-1.5 text-[0.78rem] font-medium px-3 py-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/[0.04] transition-colors">
                  <Eye size={14} /> Use in a design
                </button>
                <button className="flex items-center gap-1.5 text-[0.84rem] font-bold px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors">
                  Publish
                </button>
              </div>
            </div>

            {/* Preview content */}
            <div className="flex-1 overflow-auto p-6">
              {appIsThinking && !appPreviewContent ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-muted mx-auto mb-4" />
                    <p className="text-[0.88rem] font-medium text-muted">Building your app…</p>
                  </div>
                </div>
              ) : appPreviewContent ? (
                <div className="bg-background rounded-2xl border border-foreground/[0.08] shadow-lg overflow-hidden h-full">
                  {/* Mock browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/[0.06] bg-foreground/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-8">
                      <div className="bg-foreground/[0.05] rounded-lg px-3 py-1 text-[0.72rem] text-muted text-center">
                        preview.lovable.app
                      </div>
                    </div>
                    <X size={14} className="text-muted" />
                  </div>
                  {/* Mock website preview */}
                  <div className="p-8 space-y-8 overflow-y-auto h-[calc(100%-42px)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Code size={16} className="text-accent" />
                        </div>
                        <span className="text-[0.92rem] font-bold">AppPreview</span>
                      </div>
                      <div className="flex items-center gap-6 text-[0.78rem] text-muted">
                        <span>How It Works</span>
                        <span>Features</span>
                        <span>Pricing</span>
                        <span>Contact</span>
                        <button className="px-3 py-1.5 rounded-lg bg-accent text-white text-[0.75rem] font-semibold">Get Started</button>
                      </div>
                    </div>
                    <div className="pt-12 pb-8">
                      <div className="bg-accent/10 text-accent text-[0.72rem] font-bold px-3 py-1 rounded-full inline-block mb-4 uppercase tracking-wider">
                        Built with AI
                      </div>
                      <h1 className="text-[2.2rem] font-black tracking-tight leading-tight mb-4 max-w-lg">
                        Your App, Built in Seconds
                      </h1>
                      <p className="text-[0.92rem] text-muted max-w-md leading-relaxed mb-6">
                        {appPreviewContent.slice(0, 120)}{appPreviewContent.length > 120 ? "..." : ""}
                      </p>
                      <div className="flex items-center gap-3">
                        <button className="px-6 py-3 rounded-xl bg-accent text-white font-bold text-[0.88rem] flex items-center gap-2">
                          Get Started <ArrowRight size={16} />
                        </button>
                        <button className="px-6 py-3 rounded-xl border border-foreground/[0.15] font-semibold text-[0.88rem]">
                          See How It Works
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-foreground/[0.06]">
                      {["Lightning Fast", "AI-Powered", "Fully Custom"].map((f, i) => (
                        <div key={f} className="text-center p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.06]">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                            {[Zap, Sparkles, Wand2][i] && (() => { const Icon = [Zap, Sparkles, Wand2][i]; return <Icon size={18} className="text-accent" />; })()}
                          </div>
                          <h3 className="text-[0.88rem] font-bold mb-1">{f}</h3>
                          <p className="text-[0.75rem] text-muted">Optimized for the best experience possible.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-0 overflow-visible">
        <div className="mb-10">
          <PromptBox onGenerate={handleGenerate} />
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
          {(activeTab === "creations" || activeTab === "community" || activeTab === "collections" || activeTab === "templates" || activeTab === "apps") && (
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button type="button" className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[0.82rem] font-medium transition-colors ${hasActiveFilters ? "border-accent bg-accent/5 text-accent" : "border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"}`}>
                  <Filter size={14} />Filter{hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="end" side="bottom" sideOffset={10} avoidCollisions={false}>
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
