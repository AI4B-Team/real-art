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
  Film, Package, BarChart2, ShoppingBag, Brush, Link2,
  Eye, Target, Languages, Repeat, PenTool, FolderOpen, Flag,
  Github, Smile, Rss, LinkIcon, ShoppingCart,
  Minus, Settings, Upload, ArrowLeftRight,
  Link as LinkChain,
} from "lucide-react";
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
  ],
};

const APP_BUILD_MODES: { id: string; label: string; icon: typeof Image }[] = [
  { id: "landing",     label: "Landing Page",    icon: FileText },
  { id: "multi-page",  label: "Multi-Page Site", icon: LayoutGrid },
  { id: "link-in-bio", label: "Link In Bio",     icon: LinkIcon },
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

function PromptBox({ onGenerate }: { onGenerate: () => void }) {
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
  const [contentGoal, setContentGoal] = useState("Engagement");
  const [contentTone, setContentTone] = useState("Professional");
  const [contentLanguage, setContentLanguage] = useState("English");
  const [contentFrequency, setContentFrequency] = useState("Daily");
  const [contentTime, setContentTime] = useState("9:00 AM");
  const [contentStyle, setContentStyle] = useState("Informative");

  // Document-specific states
  const [docLanguage, setDocLanguage] = useState("English");
  const [docTone, setDocTone] = useState("Professional");
  const [docModel, setDocModel] = useState("Auto");
  const [docModelOpen, setDocModelOpen] = useState(false);
  
  const [docLangOpen, setDocLangOpen] = useState(false);
  const [docLangSearch, setDocLangSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // App-specific states
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
      // Auto-resize textarea after setting prompt
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "36px";
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
        }
      }, 0);
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
    if (result) setPrompt(prev => prev ? prev + "\n\n" + result : result);
  };

  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const hasType = !!selectedType;
  const placeholder = selectedType === "video" && selectedSubMode === "story"
    ? "Upload References. Describe your vision. We'll create the scenes (e.g., Product reveal with smooth motion, premium feel, confident tone)"
    : selectedType ? PLACEHOLDERS[selectedType] : "Create anything...";
  const borderCls = typeCfg ? typeCfg.promptBorder : "border-foreground/20";

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
              <div className="shrink-0 pt-[6px]">
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
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                onFocus={() => setPromptFocused(true)}
                onBlur={() => setPromptFocused(false)}
                placeholder={placeholder}
                rows={1}
                className={`w-full bg-transparent border-none outline-none text-[0.92rem] text-foreground placeholder:text-muted/50 leading-[1.6] font-body min-h-[36px] overflow-y-auto py-[6px] mt-[2px] caret-accent pr-[180px] ${prompt.trim() ? "resize-y" : "resize-none"}`}
                style={{ height: "36px" }}
                onInput={e => { const el = e.currentTarget; el.style.height = "36px"; el.style.height = Math.min(el.scrollHeight, 140) + "px"; }}
              />
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
                    <button type="button" onClick={startListening} className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors text-foreground hover:bg-foreground/[0.06]"><Mic size={17} /></button>
                  </TooltipTrigger><TooltipContent side="bottom">Voice input</TooltipContent></Tooltip>
                )}
                {!hasType && (
                  <Tooltip><TooltipTrigger asChild>
                    <button type="button" onClick={handleGenerate} disabled={!prompt.trim() || isEnhancing}
                      className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${prompt.trim() ? "text-foreground hover:bg-foreground/[0.06]" : "text-muted/30"}`}>
                      {isEnhancing ? <Loader2 size={17} className="animate-spin text-purple-500" /> : <Send size={17} />}
                    </button>
                  </TooltipTrigger><TooltipContent side="bottom">Generate</TooltipContent></Tooltip>
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
          {selectedType === "document" && selectedSubMode && addedLinks.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap px-4 pb-2">
              <button type="button" onClick={() => togglePanel("source")} className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-accent/20 bg-accent/8 text-accent text-[0.78rem] font-semibold transition-all hover:border-accent/40">
                <LinkChain size={12} />
                {addedLinks.length} source{addedLinks.length !== 1 ? "s" : ""}
                <X size={11} className="opacity-60 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setAddedLinks([]); }} />
              </button>
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

                {/* Type badge — always visible, clickable to switch type */}
                {typeCfg && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${typeCfg.bg} ${typeCfg.border} ${typeCfg.color}`}>
                        <typeCfg.icon size={13} />{typeCfg.label}
                        <X size={11} className="opacity-60 hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); setSelectedType(null); setSelectedSubMode(null); setActivePanel(null); }} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-1.5" align="start" sideOffset={6}>
                      {CONTENT_TYPES.map(t => (
                        <button key={t.id} type="button" onClick={() => handleTypeSelect(t.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.82rem] font-medium transition-colors ${selectedType === t.id ? `${t.bg} ${t.color}` : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          <t.icon size={14} className={t.color} />{t.label}{selectedType === t.id && <Check size={12} className="ml-auto" />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}

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

                {/* Ratio — image, design & video */}
                {selectedSubMode && (selectedType === "image" || selectedType === "design" || selectedType === "video") && (
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
                    <Popover>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors shrink-0 ${contentTone !== "Professional" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <MessageCircle size={14} />
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Tone</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Tone</p>
                        {["Professional", "Casual", "Humorous", "Inspirational", "Educational", "Bold"].map(o => (
                          <button key={o} onClick={() => setContentTone(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentTone === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`p-1.5 rounded-lg transition-colors shrink-0 ${contentLanguage !== "English" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Languages size={14} />
                        </button>
                      </PopoverTrigger></TooltipTrigger><TooltipContent>Language</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-1.5" side="top" align="start">
                        <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Language</p>
                        {["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Chinese", "Japanese", "Korean", "Hindi"].map(o => (
                          <button key={o} onClick={() => setContentLanguage(o)} className={`w-full text-left px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${contentLanguage === o ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"}`}>{o}</button>
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
                    </TooltipTrigger><TooltipContent>Apply brand voice & style</TooltipContent></Tooltip>
                  </div>
                )}

                {/* Document-specific toolbar */}
                {selectedType === "document" && selectedSubMode && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-px h-5 bg-foreground/[0.08] mx-0.5 shrink-0" />

                    {/* Model (Auto) */}
                    <Popover open={docModelOpen} onOpenChange={setDocModelOpen}>
                      <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors whitespace-nowrap shrink-0 ${docModel !== "Auto" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
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
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${activePanel === "source" || addedLinks.length > 0 ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                        <LinkChain size={14} />
                      </button>
                    </TooltipTrigger><TooltipContent>Source{addedLinks.length > 0 ? ` (${addedLinks.length})` : ""}</TooltipContent></Tooltip>

                    {/* Language (icon only) */}
                    <Popover open={docLangOpen} onOpenChange={(o) => { setDocLangOpen(o); if (!o) setDocLangSearch(""); }}>
                       <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors shrink-0 ${docLanguage !== "English" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Languages size={14} />
                          {docLanguage !== "English" && <span className="text-[0.75rem] font-medium pr-0.5">{docLanguage}</span>}
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
                        <button type="button" className={`p-1.5 rounded-lg transition-colors shrink-0 ${docTone !== "Professional" ? "bg-accent/10 text-accent" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <MessageCircle size={14} />
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
                        ].map(o => (
                          <button key={o.label} onClick={() => setDocTone(o.label)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.82rem] transition-colors ${docTone === o.label ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                            <o.icon size={14} className={docTone === o.label ? "text-accent" : "text-muted"} />
                            {o.label}
                            {docTone === o.label && <Check size={12} className="ml-auto text-accent" />}
                          </button>
                        ))}
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
                        <Link2 size={14} />
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
                            <Plus size={13} /><span>Create new</span>
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
                    <button type="button" onClick={isListening ? cancelSpeech : startListening} className={`p-1.5 rounded-lg transition-colors mr-2 ${isListening ? "bg-accent/10 text-accent animate-pulse" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}><Mic size={15} /></button>
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
                <h3 className="text-[0.85rem] font-bold">{selectedType === "video" ? "Video Style" : "Art Style"}</h3>
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
                      <img src={s.img} alt={s.label} className="w-full aspect-square rounded-lg object-cover" />
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
                      <img src={s.img} alt={s.label} className="w-full aspect-square rounded-lg object-cover" />
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
                  { id: "url", label: "Insert Link", icon: LinkIcon },
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
                  <div className="rounded-xl border-2 border-dashed border-foreground/[0.10] bg-foreground/[0.02] p-8 flex flex-col items-center justify-center min-h-[180px]">
                    <Upload size={28} className="text-accent mb-3" />
                    <p className="text-[0.92rem] font-bold text-foreground mb-1">Drag & Drop Files Here</p>
                    <p className="text-[0.75rem] text-muted/60 mb-4">PDF, DOCX, TXT, MD — up to 50MB each</p>
                    <button type="button" className="px-6 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-bold hover:bg-accent transition-colors">
                      Browse Files
                    </button>
                  </div>
                  <p className="text-[0.72rem] text-muted/50 mt-3">Add up to 10 source files to guide the AI generation.</p>
                </>
              )}

              {/* Insert Link tab */}
              {activeSourceTab === "url" && (
                <>
                  <p className="text-[0.78rem] text-muted mb-3">Quick import from a platform</p>
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {[
                      { name: "RSS Feed", icon: Rss, color: "text-orange-500", placeholder: "https://example.com/feed.xml" },
                      { name: "YouTube", icon: Play, color: "text-red-500", placeholder: "https://youtube.com/watch?v=..." },
                      { name: "TikTok", icon: Music, color: "text-foreground", placeholder: "https://tiktok.com/@user/video/..." },
                      { name: "Instagram", icon: Camera, color: "text-pink-500", placeholder: "https://instagram.com/p/..." },
                      { name: "Facebook", icon: Users, color: "text-blue-600", placeholder: "https://facebook.com/..." },
                    ].map(platform => (
                      <Tooltip key={platform.name}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSourceUrl(platform.placeholder)}
                            className="p-2.5 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.07] border border-foreground/[0.06] transition-colors"
                          >
                            <platform.icon size={20} className={platform.color} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{platform.name}</TooltipContent>
                      </Tooltip>
                    ))}
                    {addedLinks.length > 0 && (
                      <span className="text-[0.72rem] text-muted font-medium ml-1">+{addedLinks.length}</span>
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
                          <LinkIcon size={12} className="text-muted shrink-0" />
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
                    placeholder="Paste your source text here..."
                    className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-foreground/[0.10] bg-foreground/[0.02] text-[0.85rem] text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/40 resize-y"
                  />
                  <p className="text-[0.72rem] text-muted/50 mt-2">Paste articles, notes, or any text to use as source material.</p>
                </>
              )}

              {/* Record Audio tab */}
              {activeSourceTab === "audio" && (
                <div className="rounded-xl border-2 border-dashed border-foreground/[0.10] bg-foreground/[0.02] p-8 flex flex-col items-center justify-center min-h-[180px]">
                  <Mic size={28} className="text-accent mb-3" />
                  <p className="text-[0.92rem] font-bold text-foreground mb-1">Record Audio</p>
                  <p className="text-[0.75rem] text-muted/60 mb-4">Dictate your ideas and we'll transcribe them</p>
                  <button type="button" className="px-6 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-bold hover:bg-accent transition-colors">
                    Start Recording
                  </button>
                </div>
              )}

              {/* Collections tab */}
              {activeSourceTab === "collections" && (
                <div className="rounded-xl border-2 border-dashed border-foreground/[0.10] bg-foreground/[0.02] p-8 flex flex-col items-center justify-center min-h-[180px]">
                  <FolderOpen size={28} className="text-accent mb-3" />
                  <p className="text-[0.92rem] font-bold text-foreground mb-1">Browse Collections</p>
                  <p className="text-[0.75rem] text-muted/60 mb-4">Select from your saved collections</p>
                  <button type="button" className="px-6 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-bold hover:bg-accent transition-colors">
                    Browse
                  </button>
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
                    <Link2 size={14} className="text-muted shrink-0" />
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
