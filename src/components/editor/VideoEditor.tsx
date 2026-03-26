import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import emptyVideoCards from "@/assets/empty-video-cards.png";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Scissors, Undo2, Redo2, ZoomIn, ZoomOut, Plus, Upload,
  Type, Music, Image, Sparkles, FileText, Layers, Settings,
  ChevronDown, ChevronLeft, ChevronRight,
  Trash2, Video, Eye, EyeOff, Lock, Unlock,
  Maximize, Minimize, Check, Search, Copy, Download, Diamond, Magnet,
  Wand2, GripVertical, Captions, User, SlidersHorizontal,
  LayoutGrid, VolumeX as VolX, Send, Mic,
  Circle, Grid3X3, Palette, Zap, Film, Clapperboard, Rows3,
  AudioLines, VolumeOff, MoreVertical, ArrowLeftRight,
  MessageSquare, BookOpen, RefreshCw, ArrowUp,
  Languages, Ghost, History, Flag, Shuffle, Loader2,
  Link, Hash, Clock, Heart, Box, X as XIcon, Repeat, GripHorizontal,
} from "lucide-react";
import AIToolsPanel from "./AIToolsPanel";
import RecordingModeModal from "./RecordingModeModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Types ─── */
interface TimelineClip {
  id: string; type: "video" | "audio" | "text" | "effect"; name: string;
  startTime: number; duration: number; color?: string; volume?: number;
  mediaUrl?: string; thumbnail?: string; mediaType?: "video" | "image" | "audio";
}
interface TimelineTrack {
  id: string; type: "video" | "audio" | "text" | "effect"; name: string;
  clips: TimelineClip[]; muted?: boolean; locked?: boolean; visible?: boolean;
}

/* ─── Tab Configs ─── */
type LeftTab = "ai-chat" | "storyboard" | "character" | "visuals" | "audio" | "text" | "effects" | "templates" | "settings";

const LEFT_TABS: { id: LeftTab; icon: typeof FileText; label: string }[] = [
  { id: "ai-chat", icon: MessageSquare, label: "AI Chat" },
  { id: "storyboard", icon: Clapperboard, label: "Storyboard" },
  { id: "character", icon: User, label: "Character" },
  { id: "visuals", icon: Video, label: "Visuals" },
  { id: "audio", icon: AudioLines, label: "Audio" },
  { id: "text", icon: Type, label: "Text" },
  { id: "effects", icon: Sparkles, label: "Effects" },
  { id: "templates", icon: LayoutGrid, label: "Templates" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const SAMPLE_MEDIA = [
  { id: "v1", name: "Product Demo", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200" },
  { id: "v2", name: "Brand Intro", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200" },
  { id: "v3", name: "Marketing Clip", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200" },
  { id: "v4", name: "Social Ad", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=200" },
  { id: "v5", name: "Promo Video", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200" },
  { id: "v6", name: "Lifestyle B-Roll", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=200" },
];

const CAPTION_DATA = [
  { time: "2.30s", text: "I'm not real." },
  { time: "3.50s", text: "I wasn't born." },
  { time: "4.70s", text: "I don't have a past." },
  { time: "6.40s", text: "I don't even exist, and yet I show up online." },
  { time: "9.60s", text: "I create content." },
  { time: "11.20s", text: "I engage with people." },
  { time: "13.80s", text: "I have followers who believe in me." },
  { time: "16.50s", text: "And I'm changing the game." },
];

const FILLER_WORDS = ["um", "uh", "like", "you know", "right", "so", "actually", "basically", "literally"];

interface WordToken {
  id: string; word: string; start: number; end: number; isFiller?: boolean;
}

const SAMPLE_TRANSCRIPT: WordToken[] = [
  { id: "w0", word: "So", start: 0.0, end: 0.3, isFiller: true },
  { id: "w1", word: "today", start: 0.3, end: 0.7 },
  { id: "w2", word: "we're", start: 0.7, end: 0.9 },
  { id: "w3", word: "going", start: 0.9, end: 1.2 },
  { id: "w4", word: "to", start: 1.2, end: 1.3 },
  { id: "w5", word: "um", start: 1.3, end: 1.6, isFiller: true },
  { id: "w6", word: "talk", start: 1.6, end: 1.9 },
  { id: "w7", word: "about", start: 1.9, end: 2.2 },
  { id: "w8", word: "something", start: 2.2, end: 2.7 },
  { id: "w9", word: "really", start: 2.7, end: 3.1 },
  { id: "w10", word: "like", start: 3.1, end: 3.4, isFiller: true },
  { id: "w11", word: "important", start: 3.4, end: 4.0 },
  { id: "w12", word: "about", start: 4.0, end: 4.3 },
  { id: "w13", word: "AI", start: 4.3, end: 4.6 },
  { id: "w14", word: "content", start: 4.6, end: 5.1 },
  { id: "w15", word: "creation.", start: 5.1, end: 5.6 },
  { id: "w16", word: "You know", start: 5.6, end: 6.0, isFiller: true },
  { id: "w17", word: "the", start: 6.0, end: 6.1 },
  { id: "w18", word: "tools", start: 6.1, end: 6.4 },
  { id: "w19", word: "we", start: 6.4, end: 6.5 },
  { id: "w20", word: "have", start: 6.5, end: 6.8 },
  { id: "w21", word: "uh", start: 6.8, end: 7.0, isFiller: true },
  { id: "w22", word: "available", start: 7.0, end: 7.5 },
  { id: "w23", word: "right", start: 7.5, end: 7.7, isFiller: true },
  { id: "w24", word: "now", start: 7.7, end: 7.9 },
  { id: "w25", word: "are", start: 7.9, end: 8.1 },
  { id: "w26", word: "actually", start: 8.1, end: 8.6, isFiller: true },
  { id: "w27", word: "incredible.", start: 8.6, end: 9.2 },
  { id: "w28", word: "Basically", start: 9.2, end: 9.7, isFiller: true },
  { id: "w29", word: "you", start: 9.7, end: 9.9 },
  { id: "w30", word: "can", start: 9.9, end: 10.1 },
  { id: "w31", word: "edit", start: 10.1, end: 10.4 },
  { id: "w32", word: "video", start: 10.4, end: 10.8 },
  { id: "w33", word: "by", start: 10.8, end: 10.9 },
  { id: "w34", word: "editing", start: 10.9, end: 11.3 },
  { id: "w35", word: "text.", start: 11.3, end: 11.7 },
];

const CLIP_SUGGESTIONS = [
  { label: "Strong Hook — Opening Statement", start: 0.0, end: 5.6, rationale: "Punchy opening that grabs attention with a direct statement about the topic.", platform: "tiktok" },
  { label: "Key Insight — AI Tools Overview", start: 5.6, end: 9.2, rationale: "Compelling section about available tools that stands alone as a shareable moment.", platform: "reels" },
  { label: "Actionable Takeaway — Edit by Text", start: 9.2, end: 11.7, rationale: "Clear, actionable tip that provides immediate value to viewers.", platform: "shorts" },
];

const SOCIAL_EXPORT_PRESETS = [
  { platform: "TikTok", ratio: "9:16", maxDur: "60s", res: "1080×1920", icon: "♪" },
  { platform: "Instagram Reels", ratio: "9:16", maxDur: "90s", res: "1080×1920", icon: "📷" },
  { platform: "YouTube Shorts", ratio: "9:16", maxDur: "60s", res: "1080×1920", icon: "▶" },
  { platform: "LinkedIn", ratio: "16:9", maxDur: "10min", res: "1920×1080", icon: "in" },
  { platform: "Twitter/X", ratio: "16:9", maxDur: "2m20s", res: "1280×720", icon: "𝕏" },
  { platform: "YouTube", ratio: "16:9", maxDur: "No limit", res: "1920×1080", icon: "▶" },
  { platform: "Podcast", ratio: "1:1", maxDur: "No limit", res: "Audiogram", icon: "🎙" },
];

const EFFECTS_DATA = [
  "Audio Dust", "Audio Glitch", "Audio Glow", "Audio Meltdown",
  "Audio Mosh", "Audio RGB", "Audio Shake", "Black & White",
  "Chroma Key", "Color Grading", "Color Strobe", "Night Vision",
];

const TEMPLATE_CATEGORIES = [
  { name: "All", count: 26 },
  { name: "E-Learning", count: 11 },
  { name: "Marketing", count: 8 },
  { name: "Social Media", count: 7 },
];

const AI_TOOLS = [
  { name: "Studio Sound", desc: "Remove Noise And Enhance Voice Clarity", icon: AudioLines },
  { name: "Clean Up Speech", desc: "Remove Filler Words And Hesitations", icon: VolumeOff },
  { name: "Tighten Pacing", desc: "Reduce Pauses And Dead Air", icon: SlidersHorizontal },
  { name: "Voice Isolation", desc: "Separate Voice From Background Audio", icon: Mic },
  { name: "Auto Captions", desc: "Generate Captions From Audio", icon: Captions },
  { name: "Smart Cut", desc: "Remove Silences Automatically", icon: Scissors },
  { name: "AI B-Roll", desc: "Generate Contextual B-roll", icon: Film },
  { name: "Scene Detection", desc: "Auto-detect Scene Changes", icon: Clapperboard },
  { name: "Color Match", desc: "Match Colors Across Clips", icon: Palette },
  { name: "AI Voiceover", desc: "Generate Narration From Script", icon: Mic },
  { name: "Create Clips", desc: "Find Best Moments For Social Media", icon: Film },
  { name: "AI Show Notes", desc: "Generate Descriptions And Metadata", icon: BookOpen },
  { name: "Remove Retakes", desc: "Detect And Remove Repeated Sentences", icon: RefreshCw },
  { name: "Fix Word", desc: "AI Voice Clone To Fix Mispronunciations", icon: Wand2 },
  { name: "Transcribe", desc: "Convert Audio To Editable Text", icon: FileText },
];

const VOICE_DATA = [
  { name: "Maya", desc: "feminine, young, chill", color: "bg-emerald-500" },
  { name: "Arjun", desc: "masculine, middle aged, intense", color: "bg-blue-500" },
  { name: "Sophia", desc: "feminine, mature, warm", color: "bg-purple-500" },
  { name: "Kai", desc: "non-binary, youthful, energetic", color: "bg-amber-500" },
];

const STORYBOARD_SCENES = [
  { time: "00:03", narrator: "Jurin", desc: "Clara stands at a desolate, snow-covered border crossing.", thumb: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=120" },
  { time: "00:05", narrator: "Jurin", desc: "As a sudden blizzard intensifies, she uses the snow as cover to slip past the checkpoint.", thumb: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=120" },
  { time: "00:05", narrator: "Jurin", desc: "Her expression shifts from confusion to horror, realizing she has been betrayed.", thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120" },
  { time: "00:05", narrator: "Jurin", desc: "The screen reflects in her eyes, showing a coded transmission.", thumb: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120" },
  { time: "00:05", narrator: "Jurin", desc: "Huddled behind cover, she pulls out a small device.", thumb: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=120" },
];

interface ChatMessage { role: "user" | "assistant"; content: string; }

const ALL_AI_SUGGESTIONS = [
  "❤️ Create a love story",
  "🐒 Top 5 fun facts about animals 🌎",
  "📺 Create a video about current world news",
  "🎬 Write a short film script about time travel",
  "🏔️ Create a cinematic travel montage",
  "🎮 Make a gaming highlights compilation",
  "🍳 Script a cooking tutorial video",
  "🎵 Create a music video concept",
  "📖 Turn a bedtime story into an animated short",
  "🚀 Explain a science concept visually",
  "💼 Create a professional brand intro",
  "🌅 Make a relaxing ambient nature video",
];

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const formatTimeColon = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

interface Props { video?: string }

const SAFE_ZONE_PLATFORMS = [
  { id: "hide", label: "Hide Safe Zone", icon: "🚫" },
  { id: "reels", label: "Reels", icon: "📷", color: "bg-gradient-to-br from-pink-500 to-purple-600" },
  { id: "facebook", label: "Facebook", icon: "f", color: "bg-[#1877F2]" },
  { id: "tiktok", label: "TikTok", icon: "♪", color: "bg-foreground" },
  { id: "shorts", label: "Shorts", icon: "▶", color: "bg-red-600" },
  { id: "linkedin", label: "LinkedIn", icon: "in", color: "bg-[#0A66C2]" },
  { id: "snapchat", label: "Snapchat", icon: "👻", color: "bg-[#FFFC00]" },
] as const;

type SafeZonePlatform = typeof SAFE_ZONE_PLATFORMS[number]["id"];



const VideoEditor = ({ video }: Props) => {
  const [activeTab, setActiveTab] = useState<LeftTab>("ai-chat");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(596);
  const [zoom, setZoom] = useState(3);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(256);
  const timelineResizeRef = useRef<{ startY: number; startH: number } | null>(null);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [timelineViewMode, setTimelineViewMode] = useState<"timeline" | "storyboard">("timeline");
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [captionSearch, setCaptionSearch] = useState("");
  
  const [audioSubTab, setAudioSubTab] = useState("Voices");
  const [visualsSubTab, setVisualsSubTab] = useState("Videos");
  const [templateSearch, setTemplateSearch] = useState("");
  const [scriptContent, setScriptContent] = useState(
    "I'm going to tell you something shocking."
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // New feature state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [aiChatSubTab, setAiChatSubTab] = useState<"chat" | "tools">("chat");
  const [briefStyle, setBriefStyle] = useState("Realistic film");
  const [briefNarrator, setBriefNarrator] = useState("Jurin");
  const [briefPlatform, setBriefPlatform] = useState("TikTok");
  const [briefDuration, setBriefDuration] = useState("30s");
  const [briefMediaType, setBriefMediaType] = useState("Video clip");

  // Settings state
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color");
  const [backgroundColor, setBackgroundColor] = useState("#FF4F4A");
  const [durationType, setDurationType] = useState<"automatic" | "fixed">("automatic");
  const [fixedDuration, setFixedDuration] = useState("00:05.0");
  const [showComments, setShowComments] = useState(false);
  const [showSoundwaves, setShowSoundwaves] = useState(true);
  const [suggestionOffset, setSuggestionOffset] = useState(0);
  const visibleSuggestions = ALL_AI_SUGGESTIONS.slice(suggestionOffset, suggestionOffset + 3);
  const [showGhostPlayhead, setShowGhostPlayhead] = useState(true);
  const [framesPerSecond, setFramesPerSecond] = useState("30");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [languageSearch, setLanguageSearch] = useState("");
  const [storyboardSubTab, setStoryboardSubTab] = useState<"scenes" | "script" | "brief">("scenes");
  const [textSubTab, setTextSubTab] = useState<"text" | "captions">("text");
  const [captionSubTab, setCaptionSubTab] = useState<"edit" | "style" | "transcript" | "clips" | "notes">("edit");
  const [captionStyle, setCaptionStyle] = useState("classic");
  const [captionDisplayMode, setCaptionDisplayMode] = useState("sentence");
  const [hasCaptions, setHasCaptions] = useState(false);
  const [effectsSubTab, setEffectsSubTab] = useState<"effects" | "transitions" | "elements">("effects");
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "brand" | "languages">("general");

  // Transcript state
  const [transcriptTokens, setTranscriptTokens] = useState<WordToken[]>(SAMPLE_TRANSCRIPT);
  const [fillerMode, setFillerMode] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [hasTranscript, setHasTranscript] = useState(false);

  // Create Clips state
  const [clipCount, setClipCount] = useState(3);
  const [clipDuration, setClipDuration] = useState("30s");
  const [clipsGenerated, setClipsGenerated] = useState(false);
  const [acceptedClips, setAcceptedClips] = useState<Set<number>>(new Set());

  // AI Metadata state
  const [metadataGenerated, setMetadataGenerated] = useState(false);
  const [metaTitles] = useState(["How AI Is Revolutionizing Content Creation", "The Future of Video Editing with AI", "Why Every Creator Needs AI Tools in 2026"]);
  const [metaDescription] = useState("Discover how AI-powered tools are transforming the way creators edit video, generate content, and grow their audience. In this video, we explore the cutting-edge features that make editing as simple as editing text.");
  const [metaTags] = useState(["AI", "content creation", "video editing", "creator tools", "automation"]);
  const [metaChapters] = useState([{ time: "0:00", label: "Intro" }, { time: "0:06", label: "AI Tools Overview" }, { time: "0:09", label: "Text-Based Editing" }]);
  const [metaShowNotes] = useState("In this episode, we dive deep into the world of AI-powered content creation. We discuss the revolutionary text-based editing approach, explore available AI tools, and demonstrate how creators can edit video simply by editing text. Key takeaways include understanding the current landscape of AI tools and practical tips for integrating them into your workflow.");

  // Studio Sound / Remove Silences state
  const [studioSoundStatus, setStudioSoundStatus] = useState<"idle" | "loading" | "done">("idle");
  const [silenceThreshold, setSilenceThreshold] = useState(400);
  const [silencesFound, setSilencesFound] = useState(0);
  const [showSilencePanel, setShowSilencePanel] = useState(false);

  // Toolbar state
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [markers, setMarkers] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [undoStack, setUndoStack] = useState<TimelineTrack[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineTrack[][]>([]);

  const [isStreaming, setIsStreaming] = useState(false);

  // Canvas overlay state
  const [safeZone, setSafeZone] = useState<SafeZonePlatform>("hide");
  const [showCanvasControls, setShowCanvasControls] = useState(false);
  const [canvasBgColor, setCanvasBgColor] = useState("#000000");
  const [selectedLayout, setSelectedLayout] = useState(0);
  const [bgTab, setBgTab] = useState<"color" | "image" | "upload">("color");
  const [applyBgToAll, setApplyBgToAll] = useState(true);
  const [applyLayoutToAll, setApplyLayoutToAll] = useState(false);
  const [bgRgb, setBgRgb] = useState({ r: 0, g: 0, b: 0 });
  const [bgOpacity, setBgOpacity] = useState(100);

  // Prompt box state
  const [promptContentType, setPromptContentType] = useState<"video" | "audio" | "image">("video");
  const [isContentTypeOpen, setIsContentTypeOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [promptAspectRatio, setPromptAspectRatio] = useState("16:9");
  const [promptDuration, setPromptDuration] = useState("10");
  const [promptImageCount, setPromptImageCount] = useState(1);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setIsStreaming(true);
    
    // Switch to AI Chat tab to show response
    setActiveTab("ai-chat");

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/video-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast({ title: "Rate limited", description: "Please try again in a moment.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "Usage limit reached", description: "Please add credits to continue.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: "Failed to get AI response.", variant: "destructive" });
        }
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const currentContent = assistantSoFar;
              setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: currentContent } : m));
                }
                return [...prev, { role: "assistant", content: currentContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      toast({ title: "Connection error", description: "Could not reach AI service.", variant: "destructive" });
    }
    setIsStreaming(false);
  };

  const [tracks, setTracks] = useState<TimelineTrack[]>([
    { id: "video-1", type: "video", name: "1", visible: true, clips: [
      { id: "clip-1", type: "video", name: "Intro", startTime: 0, duration: 120, color: "bg-blue-500" },
      { id: "clip-2", type: "video", name: "Main", startTime: 120, duration: 300, color: "bg-purple-500" },
      { id: "clip-3", type: "video", name: "Outro", startTime: 420, duration: 176, color: "bg-emerald-500" },
    ]},
    { id: "video-2", type: "video", name: "2", visible: true, clips: [
      { id: "clip-4", type: "video", name: "B-Roll", startTime: 60, duration: 200, color: "bg-indigo-500" },
    ]},
    { id: "audio-1", type: "audio", name: "3", muted: false, visible: true, clips: [
      { id: "audio-clip-1", type: "audio", name: "Music", startTime: 0, duration: 596, color: "bg-rose-500" },
    ]},
    { id: "audio-2", type: "audio", name: "4", muted: false, visible: true, clips: [
      { id: "vo-clip-1", type: "audio", name: "Voiceover", startTime: 10, duration: 400, color: "bg-teal-500" },
    ]},
  ]);

  // Find the clip at the current playhead position
  const activeClipAtPlayhead = useMemo(() => {
    const videoClips = tracks
      .filter(t => (t.type === "video" || t.id.includes("video")) && t.visible !== false)
      .flatMap(t => t.clips)
      .filter(c => c.mediaUrl && currentTime >= c.startTime && currentTime < c.startTime + c.duration);
    return videoClips[0] || null;
  }, [tracks, currentTime]);

  // Sync canvas video with playhead
  useEffect(() => {
    if (canvasVideoRef.current && activeClipAtPlayhead?.mediaUrl) {
      const clipLocalTime = currentTime - activeClipAtPlayhead.startTime;
      if (Math.abs(canvasVideoRef.current.currentTime - clipLocalTime) > 0.3) {
        canvasVideoRef.current.currentTime = clipLocalTime;
      }
      if (isPlaying && canvasVideoRef.current.paused) canvasVideoRef.current.play().catch(() => {});
      if (!isPlaying && !canvasVideoRef.current.paused) canvasVideoRef.current.pause();
    }
  }, [activeClipAtPlayhead, currentTime, isPlaying]);

  // Sync audio clips with playhead
  useEffect(() => {
    const audioClips = tracks
      .filter(t => (t.type === "audio" || t.id.includes("audio")) && t.visible !== false)
      .flatMap(t => t.clips)
      .filter(c => c.mediaUrl && c.mediaType === "audio");
    
    audioClips.forEach(clip => {
      let el = audioElementsRef.current.get(clip.id);
      if (!el) {
        el = new Audio(clip.mediaUrl);
        audioElementsRef.current.set(clip.id, el);
      }
      const inRange = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
      if (inRange && isPlaying) {
        const localTime = currentTime - clip.startTime;
        if (Math.abs(el.currentTime - localTime) > 0.3) el.currentTime = localTime;
        if (el.paused) el.play().catch(() => {});
      } else {
        if (!el.paused) el.pause();
      }
    });
  }, [tracks, currentTime, isPlaying]);

  const handleMediaFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");
    if (!isVideo && !isImage && !isAudio) {
      toast({ title: "Invalid file", description: "Please select a video, image, or audio file.", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(file);

    if (isAudio) {
      const audioTrack = tracks.find(t => t.type === "audio" || t.id.includes("audio"));
      if (!audioTrack) return;
      const lastClip = audioTrack.clips[audioTrack.clips.length - 1];
      const audioStart = lastClip ? lastClip.startTime + lastClip.duration : 0;
      const tempAudio = document.createElement("audio");
      tempAudio.preload = "metadata";
      tempAudio.onloadedmetadata = () => {
        const dur = Math.min(tempAudio.duration, 600);
        const newClip: TimelineClip = {
          id: `clip-${Date.now()}`, type: "audio", name: file.name.replace(/\.[^.]+$/, ""),
          startTime: audioStart, duration: dur, color: "bg-purple-500", mediaUrl: url, mediaType: "audio",
        };
        setTracks(prev => prev.map(t =>
          t.id === audioTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
        ));
        toast({ title: "Audio added", description: `${file.name} (${formatTime(dur)})` });
      };
      tempAudio.src = url;
      return;
    }

    const videoTrack = tracks.find(t => t.type === "video" || t.id.includes("video"));
    if (!videoTrack) return;
    const lastClip = videoTrack.clips[videoTrack.clips.length - 1];
    const startTime = lastClip ? lastClip.startTime + lastClip.duration : 0;

    if (isImage) {
      const img = document.createElement("img");
      img.onload = () => {
        const newClip: TimelineClip = {
          id: `clip-${Date.now()}`, type: "video", name: file.name.replace(/\.[^.]+$/, ""),
          startTime, duration: 5, color: "bg-emerald-500", mediaUrl: url, mediaType: "image", thumbnail: url,
        };
        setTracks(prev => prev.map(t =>
          t.id === videoTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
        ));
        toast({ title: "Image added", description: `${file.name} (5s duration)` });
      };
      img.src = url;
    } else {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.onloadedmetadata = () => {
        const dur = Math.min(tempVideo.duration, 600);
        const newClip: TimelineClip = {
          id: `clip-${Date.now()}`, type: "video", name: file.name.replace(/\.[^.]+$/, ""),
          startTime, duration: dur, color: "bg-blue-500", mediaUrl: url, mediaType: "video",
        };
        tempVideo.currentTime = Math.min(1, dur / 2);
        tempVideo.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 160; canvas.height = 90;
          canvas.getContext("2d")?.drawImage(tempVideo, 0, 0, 160, 90);
          newClip.thumbnail = canvas.toDataURL("image/jpeg", 0.7);
          setTracks(prev => prev.map(t =>
            t.id === videoTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
          ));
          toast({ title: "Video added", description: `${file.name} (${formatTime(dur)})` });
        };
      };
      tempVideo.src = url;
    }
  }, [tracks]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleMediaFileUpload(e.dataTransfer.files);
  }, [handleMediaFileUpload]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => { if (prev >= duration) { setIsPlaying(false); return 0; } return prev + 0.1; });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const pixelsPerSecond = zoom * 12;
  const playheadPosition = currentTime * pixelsPerSecond;

  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };
  const toggleTrackLock = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t));
  };
  const toggleTrackVisibility = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, visible: !t.visible } : t));
  };

  // Scene management
  const [hoveredSceneGap, setHoveredSceneGap] = useState<number | null>(null);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [clipContextMenu, setClipContextMenu] = useState<{ clipId: string; trackId: string; x: number; y: number } | null>(null);

  // Drag state for clips — uses RAF for smooth dragging
  const dragRef = useRef<{
    mode: "move" | "resize-left" | "resize-right";
    clipId: string;
    trackId: string;
    startX: number;
    origStart: number;
    origDuration: number;
    el: HTMLElement | null;
    rafId: number | null;
    latestX: number;
    committed: boolean;
  } | null>(null);

  const handleClipMouseDown = useCallback((e: React.MouseEvent, clipId: string, trackId: string, mode: "move" | "resize-left" | "resize-right") => {
    e.stopPropagation();
    e.preventDefault();
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.clips.find(c => c.id === clipId);
    if (!clip || track?.locked) return;
    setUndoStack(prev => [...prev.slice(-20), tracks.map(t => ({ ...t, clips: [...t.clips] }))]);
    setRedoStack([]);
    const el = e.currentTarget as HTMLElement;
    dragRef.current = { mode, clipId, trackId, startX: e.clientX, origStart: clip.startTime, origDuration: clip.duration, el, rafId: null, latestX: e.clientX, committed: false };
    setSelectedClip(clipId);

    const pps = pixelsPerSecond;
    const snap = snapEnabled;

    const tick = () => {
      const d = dragRef.current;
      if (!d || !d.el) return;
      const dx = (d.latestX - d.startX) / pps;
      if (d.mode === "move") {
        let newStart = Math.max(0, d.origStart + dx);
        if (snap) newStart = Math.round(newStart * 2) / 2;
        d.el.style.left = `${newStart * pps}px`;
      } else if (d.mode === "resize-left") {
        const delta = Math.min(dx, d.origDuration - 0.5);
        const newStart = Math.max(0, d.origStart + delta);
        const newDur = d.origDuration - (newStart - d.origStart);
        if (newDur >= 0.5) {
          d.el.style.left = `${newStart * pps}px`;
          d.el.style.width = `${newDur * pps}px`;
        }
      } else if (d.mode === "resize-right") {
        const newDur = Math.max(0.5, d.origDuration + dx);
        d.el.style.width = `${newDur * pps}px`;
      }
    };

    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      d.latestX = ev.clientX;
      if (d.rafId === null) {
        d.rafId = requestAnimationFrame(() => {
          tick();
          if (d) d.rafId = null;
        });
      }
    };

    const onUp = () => {
      const d = dragRef.current;
      if (d) {
        if (d.rafId !== null) cancelAnimationFrame(d.rafId);
        // Commit final position to state
        const dx = (d.latestX - d.startX) / pps;
        setTracks(prev => prev.map(t => {
          if (t.id !== d.trackId) return t;
          return { ...t, clips: t.clips.map(c => {
            if (c.id !== d.clipId) return c;
            if (d.mode === "move") {
              let newStart = Math.max(0, d.origStart + dx);
              if (snap) newStart = Math.round(newStart * 2) / 2;
              return { ...c, startTime: newStart };
            } else if (d.mode === "resize-left") {
              const delta = Math.min(dx, d.origDuration - 0.5);
              const newStart = Math.max(0, d.origStart + delta);
              const newDur = d.origDuration - (newStart - d.origStart);
              return newDur >= 0.5 ? { ...c, startTime: newStart, duration: newDur } : c;
            } else {
              return { ...c, duration: Math.max(0.5, d.origDuration + dx) };
            }
          })};
        }));
      }
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [tracks, pixelsPerSecond, snapEnabled]);

  const handleClipVolumeChange = useCallback((clipId: string, volume: number) => {
    setTracks(prev => prev.map(t => ({
      ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, volume } : c)
    })));
  }, []);

  // Undo/Redo helpers
  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-20), tracks.map(t => ({ ...t, clips: [...t.clips] }))]);
    setRedoStack([]);
  }, [tracks]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, tracks.map(t => ({ ...t, clips: [...t.clips] }))]);
    setUndoStack(s => s.slice(0, -1));
    setTracks(prev);
  }, [undoStack, tracks]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(s => [...s, tracks.map(t => ({ ...t, clips: [...t.clips] }))]);
    setRedoStack(r => r.slice(0, -1));
    setTracks(next);
  }, [redoStack, tracks]);

  const handleSplit = useCallback(() => {
    pushUndo();
    setTracks(prev => prev.map(track => {
      const clipAtPlayhead = track.clips.find(c => currentTime > c.startTime && currentTime < c.startTime + c.duration);
      if (!clipAtPlayhead) return track;
      const splitPoint = currentTime - clipAtPlayhead.startTime;
      const leftClip: TimelineClip = { ...clipAtPlayhead, duration: splitPoint };
      const rightClip: TimelineClip = {
        ...clipAtPlayhead,
        id: `clip-${Date.now()}-${Math.random()}`,
        name: `${clipAtPlayhead.name} (2)`,
        startTime: currentTime,
        duration: clipAtPlayhead.duration - splitPoint,
      };
      return { ...track, clips: track.clips.map(c => c.id === clipAtPlayhead.id ? leftClip : c).concat(rightClip) };
    }));
    toast({ title: "Split", description: `Clip split at ${formatTime(currentTime)}` });
  }, [currentTime, pushUndo]);

  const handleAddMarker = useCallback(() => {
    if (markers.includes(currentTime)) {
      toast({ title: "Marker exists", description: "A marker already exists at this position." });
      return;
    }
    setMarkers(prev => [...prev, currentTime].sort((a, b) => a - b));
    toast({ title: "Marker added", description: `Marker at ${formatTime(currentTime)}` });
  }, [currentTime, markers]);

  const handleRecord = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      toast({ title: "Recording stopped" });
    } else {
      setShowRecordingModal(true);
    }
  }, [isRecording]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); }
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); handleSplit(); }
      if (e.key === 'm' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); handleAddMarker(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClip) {
        e.preventDefault();
        pushUndo();
        setTracks(prev => prev.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== selectedClip) })));
        setSelectedClip(null);
        toast({ title: "Clip deleted" });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo, handleSplit, handleAddMarker, selectedClip, pushUndo]);

  const scenes = useMemo(() => {
    return tracks
      .filter(t => t.type === "video" || t.id.includes("video"))
      .flatMap(t => t.clips)
      .sort((a, b) => a.startTime - b.startTime);
  }, [tracks]);

  const handleAddTrack = useCallback(() => {
    setTracks(prev => [...prev, {
      id: `track-${Date.now()}`,
      type: "video",
      name: String(prev.length + 1),
      clips: [],
      muted: false,
      locked: false,
      visible: true,
    }]);
  }, []);

  const insertSceneAtIndex = useCallback((index: number) => {
    const videoTrack = tracks.find(t => t.type === "video" || t.id.includes("video"));
    if (!videoTrack) return;
    let insertTime = 0;
    if (index > 0 && scenes[index - 1]) {
      insertTime = scenes[index - 1].startTime + scenes[index - 1].duration;
    }
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`, type: "video", name: `Scene ${scenes.length + 1}`,
      startTime: insertTime, duration: 5,
    };
    setTracks(prev => prev.map(track => ({
      ...track,
      clips: track.clips.map(clip => {
        const si = scenes.findIndex(s => s.id === clip.id);
        if (si >= index) return { ...clip, startTime: clip.startTime + 5 };
        return clip;
      }).concat(track.id === videoTrack.id ? [newClip] : [])
    })));
  }, [scenes, tracks]);

  const addSceneAtEnd = useCallback(() => {
    const videoTrack = tracks.find(t => t.type === "video" || t.id.includes("video"));
    if (!videoTrack) return;
    const lastScene = scenes[scenes.length - 1];
    const newStartTime = lastScene ? lastScene.startTime + lastScene.duration : 0;
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`, type: "video", name: `Scene ${scenes.length + 1}`,
      startTime: newStartTime, duration: 5,
    };
    setTracks(prev => prev.map(t =>
      t.id === videoTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
    ));
  }, [scenes, tracks]);

  const deleteScene = useCallback((clipId: string) => {
    pushUndo();
    const clip = scenes.find(s => s.id === clipId);
    if (!clip) return;
    setTracks(prev => prev.map(track => ({
      ...track,
      clips: track.clips.filter(c => c.id !== clipId).map(c =>
        c.startTime > clip.startTime ? { ...c, startTime: c.startTime - clip.duration } : c
      )
    })));
    if (selectedClip === clipId) setSelectedClip(null);
    toast({ title: "Scene deleted", description: `"${clip.name}" removed` });
  }, [scenes, pushUndo, selectedClip]);

  const duplicateScene = useCallback((clipId: string) => {
    pushUndo();
    const clip = scenes.find(s => s.id === clipId);
    if (!clip) return;
    const sceneIndex = scenes.findIndex(s => s.id === clipId);
    const newClip: TimelineClip = {
      ...clip, id: `clip-${Date.now()}`, name: `${clip.name} (copy)`,
      startTime: clip.startTime + clip.duration,
    };
    setTracks(prev => prev.map(track => ({
      ...track,
      clips: track.clips.map(c =>
        scenes.findIndex(s => s.id === c.id) > sceneIndex ? { ...c, startTime: c.startTime + clip.duration } : c
      ).concat(track.clips.some(c => c.id === clipId) ? [newClip] : [])
    })));
    toast({ title: "Scene duplicated" });
  }, [scenes, pushUndo]);

  const filteredCaptions = captionSearch
    ? CAPTION_DATA.filter(c => c.text.toLowerCase().includes(captionSearch.toLowerCase()))
    : CAPTION_DATA;

  return (
    <div className="h-full flex overflow-hidden bg-background relative">
      {/* Left Sidebar */}
      {!isLeftPanelCollapsed && (
        <div className="w-[420px] bg-card border-r border-foreground/[0.08] flex flex-col overflow-hidden shrink-0">
          {/* Icon strip - horizontal at top, wrapping */}
          <div className="bg-foreground/[0.03] border-b border-foreground/[0.06] flex flex-wrap items-center justify-center px-3 py-2 gap-1 shrink-0">
            {LEFT_TABS.map(tab => (
              <Tooltip key={tab.id}><TooltipTrigger asChild>
                <button onClick={() => setActiveTab(tab.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0 ${activeTab === tab.id ? "bg-foreground/[0.08] text-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  <tab.icon className="w-4.5 h-4.5" />
                </button>
              </TooltipTrigger><TooltipContent>{tab.label}</TooltipContent></Tooltip>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Active tab content */}

            {/* Search bar for applicable tabs */}
            {["audio", "effects", "templates"].includes(activeTab) && (
              <div className="px-4 pt-3 pb-3 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="text" placeholder="Search" className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
                </div>
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">

              {/* AI Chat Tab */}
              {activeTab === "ai-chat" && (
                <div className="flex flex-col h-full">
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-3">
                    {([{id:"chat",label:"Chat"},{id:"tools",label:"Tools"}] as const).map(sub => (
                      <button key={sub.id} onClick={() => setAiChatSubTab(sub.id)}
                        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${aiChatSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                    ))}
                  </div>

                  {aiChatSubTab === "chat" && (
                    <div className="flex flex-col flex-1 min-h-[400px]">
                      {chatMessages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                          <div className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-accent" />
                          </div>
                          <h3 className="text-lg font-bold mb-1">Hi There!</h3>
                          <p className="text-2xl font-black tracking-tight mb-6">What Are We<br />Creating Today?</p>
                          <div className="space-y-2 w-full">
                            {visibleSuggestions.map((s, i) => (
                              <button key={s} onClick={() => { setChatInput(s); }}
                                className="w-full text-left px-4 py-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-colors text-sm">
                                {s}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => setSuggestionOffset(prev => (prev + 3) % ALL_AI_SUGGESTIONS.length)}
                            className="mt-4 p-2 text-muted hover:text-foreground transition-colors">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 space-y-4 py-2">
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-foreground/[0.06] text-foreground rounded-br-md"
                                  : "bg-transparent text-foreground"
                              }`}>
                                {msg.role === "assistant" ? (
                                  <div className="space-y-2">
                                    {msg.content.split("\n").map((line, j) => (
                                      <p key={j} className={line.startsWith("**") ? "font-bold" : ""}>{line.replace(/\*\*/g, "")}</p>
                                    ))}
                                  </div>
                                ) : msg.content}
                              </div>
                            </div>
                          ))}
                          {isStreaming && (
                            <div className="flex justify-start">
                              <div className="px-4 py-3 rounded-2xl text-sm">
                                <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {aiChatSubTab === "tools" && (
                    <AIToolsPanel onAssetCreated={(url, type) => {
                      toast({ title: "Asset added", description: `New ${type} asset is ready to use in your project.` });
                    }} />
                  )}
                </div>
              )}

              {/* Storyboard Sub-Tab Nav */}
              {activeTab === "storyboard" && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">Storyboard</h3>
                    <span className="text-xs text-muted font-medium">{scenes.length} scenes</span>
                  </div>
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                    {([{id:"scenes",label:"Scenes"},{id:"script",label:"Script"},{id:"brief",label:"Brief"}] as const).map(sub => (
                      <button key={sub.id} onClick={() => setStoryboardSubTab(sub.id)}
                        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${storyboardSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                    ))}
                  </div>
                </>
              )}
              {activeTab === "storyboard" && storyboardSubTab === "scenes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Storyboard</h3>
                    <span className="text-xs text-muted">{scenes.length} scene{scenes.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-3">
                    {scenes.map((clip, i) => {
                      const isCurrent = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
                      const isSelected = selectedClip === clip.id;
                      return (
                        <div
                          key={clip.id}
                          onClick={() => { setSelectedClip(clip.id); setCurrentTime(clip.startTime); }}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer group ${
                            isSelected ? "border-accent bg-accent/5" : isCurrent ? "border-accent/40 bg-accent/[0.02]" : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                          }`}
                        >
                          <div className="shrink-0 space-y-1">
                            <span className="text-[10px] font-mono text-muted">{formatTime(clip.startTime)}</span>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <User className="w-2.5 h-2.5 text-white" />
                              </div>
                              <span className="text-[10px] text-muted">{briefNarrator}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium">{clip.name}</p>
                            <p className="text-xs text-muted mt-0.5">{clip.duration.toFixed(1)}s</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1">
                            {scenes.length > 1 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteScene(clip.id); }}
                                className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); duplicateScene(clip.id); }}
                              className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-foreground"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => insertSceneAtIndex(scenes.length)}
                    className="w-full py-3 border-2 border-dashed border-foreground/[0.1] rounded-xl text-sm text-muted hover:text-foreground hover:border-foreground/[0.2] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Scene
                  </button>
                </div>
              )}

              {/* Video Brief */}
              {activeTab === "storyboard" && storyboardSubTab === "brief" && (
                <div className="space-y-5">
                   <h3 className="text-sm font-bold">Video Brief</h3>


                  {/* Character preview */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="Character" className="w-16 h-20 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Character</p>
                      <p className="text-sm font-medium">Clara</p>
                    </div>
                  </div>

                  {/* Key Elements */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Key Elements</h4>


                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm text-muted">Visual Style</span>
                      <button className="flex items-center gap-1.5 text-sm font-medium">
                        <Image className="w-4 h-4 text-accent" /> {briefStyle} <ChevronDown className="w-3 h-3 text-muted" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm text-muted">Narrator</span>
                      <button className="flex items-center gap-1.5 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><User className="w-3 h-3 text-white" /></div>
                        {briefNarrator} <ChevronDown className="w-3 h-3 text-muted" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm text-muted">Music</span>
                      <span className="text-sm text-foreground/70">Suspenseful with an accelerating tempo</span>
                    </div>

                    <div className="p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm text-muted">Scene Media</span>
                      <div className="flex gap-2 mt-2">
                        {["Video clip", "Still image"].map(m => (
                          <button key={m} onClick={() => setBriefMediaType(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${briefMediaType === m ? "bg-foreground text-background" : "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]"}`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm text-muted">Aspect Ratio</span>
                      <button className="flex items-center gap-1.5 text-sm font-medium">
                        <Video className="w-4 h-4" /> {selectedRatio} <ChevronDown className="w-3 h-3 text-muted" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm text-muted">Duration</span>
                      <span className="text-sm font-medium">{briefDuration}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm text-muted">Platform</span>
                      <button className="flex items-center gap-1.5 text-sm font-medium">
                        <Music className="w-4 h-4" /> {briefPlatform} <ChevronDown className="w-3 h-3 text-muted" />
                      </button>
                    </div>
                  </div>

                  {/* Video Content */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Video Content</h4>

                    <div className="space-y-2 text-sm text-foreground/80">
                      <p>• <strong>Opening:</strong> A resistance courier waits at a desolate, snow-covered border crossing.</p>
                      <p>• <strong>Rising action:</strong> She intercepts a transmission and realizes she has been betrayed.</p>
                      <p>• <strong>Climax:</strong> She must choose between destroying the evidence or bargaining for her life.</p>
                      <p>• <strong>Falling action:</strong> She slips past the guards under the cover of a sudden blizzard.</p>
                      <p>• <strong>Ending:</strong> She burns her identity to become a ghost in the shadows.</p>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Generate Video
                  </button>
                </div>
              )}

              {/* Script */}
              {activeTab === "storyboard" && storyboardSubTab === "script" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Script</h3>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-foreground/[0.04] border border-dashed border-foreground/[0.15] rounded-lg text-sm text-muted hover:border-foreground/[0.25] hover:text-foreground cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 shrink-0" />
                      <span>Upload Script</span>
                      <input type="file" accept=".txt,.srt,.vtt,.md" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const text = reader.result as string;
                          const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
                          if (lines.length > 0) {
                            setScriptContent(text);
                            // Parse lines into scenes on the first video track
                            const videoTrack = tracks.find(t => t.type === "video" || t.id.includes("video"));
                            if (!videoTrack) return;
                            const sceneDur = 5;
                            const newClips: TimelineClip[] = lines.map((line, i) => ({
                              id: `uploaded-scene-${Date.now()}-${i}`,
                              type: "video" as const,
                              name: line.length > 60 ? line.slice(0, 60) + "..." : line,
                              startTime: i * sceneDur,
                              duration: sceneDur,
                            }));
                            setTracks(prev => prev.map(t =>
                              t.id === videoTrack.id ? { ...t, clips: newClips } : t
                            ));
                            toast({ title: "Script imported", description: `${lines.length} scenes created from script.` });
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = "";
                      }} />
                    </label>
                    <Tooltip><TooltipTrigger asChild><button onClick={() => { navigator.clipboard.writeText(scenes.map((s, i) => `${formatTime(s.startTime)} — ${s.name}`).join("\n")); toast({ title: "Copied to clipboard" }); }} className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><Copy className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Copy</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button onClick={() => { const blob = new Blob([scenes.map((s, i) => `${formatTime(s.startTime)} — ${s.name}`).join("\n")], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "script.txt"; a.click(); }} className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><Download className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Download</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><SlidersHorizontal className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Settings</TooltipContent></Tooltip>
                  </div>

                  <div className="border-t border-foreground/[0.06]" />

                  {/* Synced script lines from storyboard scenes */}
                  <div className="space-y-3">
                    {scenes.map((scene, i) => (
                      <div key={scene.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer group ${
                        selectedClip === scene.id ? "border-accent bg-accent/5" : "border-foreground/[0.06] hover:border-foreground/[0.12]"
                      }`} onClick={() => { setSelectedClip(scene.id); setCurrentTime(scene.startTime); }}>
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/15 text-emerald-600 text-xs font-mono font-medium rounded-md shrink-0 mt-0.5">{formatTime(scene.startTime)}</span>
                        <div className="flex-1 min-w-0">
                          <input
                            value={scene.name}
                            onClick={e => e.stopPropagation()}
                          onChange={e => {
                              const newName = e.target.value;
                              const videoTrack = tracks.find(t => t.type === "video" || t.id.includes("video"));
                              if (!videoTrack) return;
                              setTracks(prev => prev.map(t =>
                                t.id === videoTrack.id
                                  ? { ...t, clips: t.clips.map(c => c.id === scene.id ? { ...c, name: newName } : c) }
                                  : t
                              ));
                            }}
                            className="w-full text-sm text-foreground bg-transparent border-none outline-none focus:bg-foreground/[0.03] rounded px-1 -mx-1"
                          />
                          <span className="text-[10px] text-muted">{scene.duration.toFixed(1)}s</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add new script line / scene */}
                  <button onClick={() => insertSceneAtIndex(scenes.length)}
                    className="w-full py-2.5 border-2 border-dashed border-foreground/[0.1] rounded-xl text-sm text-muted hover:text-foreground hover:border-foreground/[0.2] transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Line
                  </button>
                </div>
              )}

              {/* Character Tab */}
              {activeTab === "character" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Character</h3>
                  <p className="text-sm text-muted">Create and manage AI characters for your videos.</p>
                  <button className="w-full py-3 bg-accent text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors">
                    <Plus className="w-4 h-4" />Create Character
                  </button>
                  <div className="space-y-2">
                    {[
                      { name: "Alex", role: "Narrator", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" },
                      { name: "Sarah", role: "Presenter", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" },
                    ].map(char => (
                      <div key={char.name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer">
                        <img src={char.avatar} alt={char.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{char.name}</p>
                          <p className="text-xs text-muted">{char.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visuals Tab */}
              {activeTab === "visuals" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Visuals</h3>
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1">
                    {["Videos", "Images", "Elements"].map(sub => (
                      <button key={sub} onClick={() => setVisualsSubTab(sub)}
                        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${visualsSubTab === sub ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 h-9 bg-foreground/[0.06] rounded-lg text-xs font-medium text-foreground flex items-center gap-1.5 hover:bg-foreground/[0.1] transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" />Upload
                    </button>
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input type="text" placeholder="Search Assets" className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
                    </div>
                    <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-foreground/[0.06] text-muted hover:text-foreground hover:bg-foreground/[0.1] transition-colors shrink-0">
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_MEDIA.map(m => (
                      <div key={m.id} className="group relative rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                        <img src={m.thumbnail} alt={m.name} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <span className="text-[10px] text-white font-medium">{m.name}</span>
                          <button className="absolute bottom-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Tab */}
              {activeTab === "audio" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Audio</h3>
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1">
                    {["Voices", "Music", "Sound Effects"].map(sub => (
                      <button key={sub} onClick={() => setAudioSubTab(sub)}
                        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${audioSubTab === sub ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub}</button>
                    ))}
                  </div>

                  {audioSubTab === "Voices" && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />Upload
                        </button>
                        <button className="px-4 py-2 bg-foreground/[0.06] rounded-lg text-xs font-medium text-foreground flex items-center gap-1.5 hover:bg-foreground/[0.1] transition-colors">
                          <Mic className="w-3.5 h-3.5" />Clone
                        </button>
                        <button className="px-4 py-2 bg-foreground/[0.06] rounded-lg text-xs font-medium text-foreground flex items-center gap-1.5 hover:bg-foreground/[0.1] transition-colors">
                          <Sparkles className="w-3.5 h-3.5" />Voiceover
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input type="text" placeholder="Choose a voice from below or search" className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
                      </div>
                      <div className="space-y-2">
                        {VOICE_DATA.map(voice => (
                          <div key={voice.name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer group">
                            <button className={`w-10 h-10 ${voice.color} rounded-full flex items-center justify-center shrink-0`}>
                              <Play className="w-4 h-4 text-white ml-0.5" />
                            </button>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{voice.name}</p>
                              <p className="text-xs text-muted">{voice.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {audioSubTab === "Music" && (
                    <div className="space-y-2">
                      {["Upbeat Corporate", "Cinematic Tension", "Lo-fi Chill", "Epic Orchestral"].map(name => (
                        <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><Music className="w-5 h-5 text-accent" /></div>
                          <div className="flex-1"><p className="text-sm font-medium text-foreground">{name}</p><p className="text-xs text-muted">0:30</p></div>
                          <button className="p-2 text-muted hover:text-foreground"><Plus className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {audioSubTab === "Sound Effects" && (
                    <div className="space-y-2">
                      {["Whoosh", "Click", "Pop", "Transition Swoosh", "Notification"].map(name => (
                        <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><Zap className="w-5 h-5 text-purple-500" /></div>
                          <div className="flex-1"><p className="text-sm font-medium text-foreground">{name}</p><p className="text-xs text-muted">0:02</p></div>
                          <button className="p-2 text-muted hover:text-foreground"><Plus className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Text Tab - with Text/Captions sub-tabs */}
              {activeTab === "text" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold">Text & Captions</h3>
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                    {([{id:"text",label:"Text"},{id:"captions",label:"Captions"}] as const).map(sub => (
                      <button key={sub.id} onClick={() => setTextSubTab(sub.id)}
                        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${textSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                    ))}
                  </div>
                  {textSubTab === "text" && (
                    <div className="space-y-3">
                      {["Heading", "Subheading", "Body Text", "Caption", "Lower Third", "Title Card"].map(preset => (
                        <button key={preset} onClick={() => toast({ title: `${preset} added to timeline` })}
                          className="w-full p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 text-left transition-all group">
                          <span className={`text-foreground font-medium ${preset === "Heading" ? "text-xl" : preset === "Subheading" ? "text-base" : "text-sm"}`}>{preset}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {textSubTab === "captions" && (
                <div className="space-y-4">
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1">
                    {([{id:"edit",label:"Edit"},{id:"style",label:"Style"},{id:"transcript",label:"Transcript"},{id:"clips",label:"Clips"},{id:"notes",label:"AI Notes"}] as {id:string;label:string}[]).map(sub => (
                      <button key={sub.id} onClick={() => setCaptionSubTab(sub.id as any)}
                        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${captionSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                    ))}
                  </div>
                  {captionSubTab === "edit" && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-foreground/[0.04] rounded-lg px-3 py-2"><Search className="w-4 h-4 text-muted shrink-0" /><input value={captionSearch} onChange={e => setCaptionSearch(e.target.value)} placeholder="Search" className="bg-transparent text-sm w-full outline-none placeholder:text-muted" /></div>
                        <Popover><PopoverTrigger asChild><button className="flex items-center gap-2 bg-foreground/[0.04] rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground transition-colors shrink-0"><Captions className="w-4 h-4" /><span className="capitalize">{captionDisplayMode}</span><ChevronDown className="w-3 h-3" /></button></PopoverTrigger>
                          <PopoverContent className="w-36 p-1.5" align="end">{["word","sentence","paragraph"].map(mode=>(<button key={mode} onClick={()=>setCaptionDisplayMode(mode)} className={`w-full px-3 py-2 text-left text-sm rounded-lg capitalize transition-colors ${captionDisplayMode===mode?"bg-accent/10 text-accent font-medium":"hover:bg-foreground/[0.04]"}`}>{mode}{captionDisplayMode===mode&&<Check className="w-3.5 h-3.5 float-right mt-0.5"/>}</button>))}</PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><SlidersHorizontal className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Adjust Timing</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><Languages className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Translate</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><Settings className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Settings</TooltipContent></Tooltip>
                      </div>
                      <button onClick={()=>{setHasCaptions(true);toast({title:"Captions generated"});}} className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl font-medium text-sm hover:bg-foreground/90 transition-colors"><Sparkles className="w-4 h-4"/>Auto Generate Captions</button>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={()=>setHasCaptions(true)} className="flex items-center justify-center gap-2 py-3 bg-foreground/[0.04] border border-foreground/[0.06] rounded-xl text-sm font-medium text-foreground hover:bg-foreground/[0.08] transition-colors"><Type className="w-4 h-4"/>Add Manual</button>
                        <button onClick={()=>toast({title:"Import SRT"})} className="flex items-center justify-center gap-2 py-3 bg-foreground/[0.04] border border-foreground/[0.06] rounded-xl text-sm font-medium text-foreground hover:bg-foreground/[0.08] transition-colors"><Upload className="w-4 h-4"/>Import SRT</button>
                      </div>
                      {hasCaptions ? (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-end gap-2 mb-2">
                            <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground"><Copy className="w-4 h-4"/></button></TooltipTrigger><TooltipContent>Copy All</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground"><Download className="w-4 h-4"/></button></TooltipTrigger><TooltipContent>Download SRT</TooltipContent></Tooltip>
                          </div>
                          <div className="border-t border-foreground/[0.06] pt-3"/>
                          {filteredCaptions.map((cap,i)=>(<div key={i} className="flex items-start gap-3 group cursor-pointer hover:bg-foreground/[0.03] rounded-lg p-2 -mx-2 transition-colors"><span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/15 text-emerald-600 text-xs font-mono font-medium rounded-md shrink-0 mt-0.5">{cap.time}</span><span className="text-sm text-foreground leading-relaxed">{cap.text}</span></div>))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center"><div className="w-14 h-14 bg-foreground/[0.04] rounded-2xl flex items-center justify-center mb-4"><Captions className="w-7 h-7 text-muted/50"/></div><h4 className="text-sm font-bold mb-1">No Captions Yet</h4><p className="text-xs text-muted max-w-[200px]">Generate captions automatically or add them manually</p></div>
                      )}
                    </div>
                  )}
                  {captionSubTab === "style" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold">Caption Style</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {([{id:"classic",label:"Classic",preview:"Classic",bg:"bg-foreground",text:"text-background"},{id:"slam",label:"Yellow Slam",preview:"SLAM",bg:"bg-yellow-400",text:"text-foreground"},{id:"neon",label:"Neon Glow",preview:"Neon",bg:"bg-transparent",text:"text-pink-500",border:true},{id:"brat",label:"Brat",preview:"BRAT",bg:"bg-lime-400",text:"text-foreground"},{id:"chaotic",label:"Chaotic",preview:"Chaos",bg:"bg-purple-500",text:"text-white"},{id:"elegant",label:"Elegant",preview:"Elegant",bg:"bg-transparent",text:"text-foreground italic underline"},{id:"outline",label:"Outline",preview:"Outline",bg:"bg-transparent",text:"text-foreground font-black"},{id:"gradient",label:"Gradient",preview:"Gradient",bg:"bg-gradient-to-r from-blue-500 to-purple-500",text:"text-white"}]).map(style=>(<button key={style.id} onClick={()=>{setCaptionStyle(style.id);toast({title:`${style.label} style applied`});}} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${captionStyle===style.id?"border-foreground shadow-sm":"border-foreground/[0.06] hover:border-foreground/[0.15]"}`}><span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-bold ${style.bg} ${style.text} ${style.border?"border border-current":""}`}>{style.preview}</span><span className="text-xs font-medium text-muted">{style.label}</span></button>))}
                      </div>
                    </div>
                  )}
                  {captionSubTab === "transcript" && (
                    <div className="space-y-4">
                      {!hasTranscript ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center"><div className="w-14 h-14 bg-foreground/[0.04] rounded-2xl flex items-center justify-center mb-4"><FileText className="w-7 h-7 text-muted/50"/></div><h4 className="text-sm font-bold mb-1">No Transcript Yet</h4><p className="text-xs text-muted max-w-[220px] mb-6">Transcribe your video's audio to enable text-based editing and filler word removal.</p>
                          <button onClick={()=>{setTranscriptLoading(true);setTimeout(()=>{setHasTranscript(true);setTranscriptLoading(false);toast({title:"Transcript generated"});},2000);}} disabled={transcriptLoading} className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">{transcriptLoading?<Loader2 className="w-4 h-4 animate-spin"/>:<Mic className="w-4 h-4"/>}{transcriptLoading?"Transcribing...":"Transcribe Audio"}</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <button onClick={()=>{setFillerMode(!fillerMode);if(!fillerMode)toast({title:`Found ${transcriptTokens.filter(t=>t.isFiller).length} filler words`});}} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${fillerMode?"bg-accent text-white":"bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]"}`}><Wand2 className="w-3.5 h-3.5"/>AI Clean</button>
                            {fillerMode&&(<button onClick={()=>{setTranscriptTokens(p=>p.filter(t=>!t.isFiller));setFillerMode(false);toast({title:"Filler words removed"});}} className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5"/>Remove {transcriptTokens.filter(t=>t.isFiller).length}</button>)}
                            <div className="flex-1"/>
                            <Tooltip><TooltipTrigger asChild><button onClick={()=>{navigator.clipboard.writeText(transcriptTokens.map(t=>t.word).join(" "));toast({title:"Copied"});}} className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground"><Copy className="w-4 h-4"/></button></TooltipTrigger><TooltipContent>Copy</TooltipContent></Tooltip>
                          </div>
                          {fillerMode&&(<div className="flex items-center gap-2 p-3 rounded-xl bg-accent/[0.06] border border-accent/[0.15]"><Wand2 className="w-4 h-4 text-accent shrink-0"/><p className="text-xs text-foreground/80"><span className="font-semibold text-accent">{transcriptTokens.filter(t=>t.isFiller).length}</span> filler words detected.</p></div>)}
                          <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06] leading-relaxed">{transcriptTokens.map(token=>(<span key={token.id} onClick={()=>setCurrentTime(token.start)} className={`cursor-pointer rounded px-0.5 py-0.5 transition-colors text-sm ${currentTime>=token.start&&currentTime<token.end?"bg-yellow-200 text-foreground":""} ${token.isFiller&&fillerMode?"bg-destructive/20 text-destructive line-through":""} hover:bg-accent/10`}>{token.word}{" "}</span>))}</div>
                          <div className="border-t border-foreground/[0.06] pt-4 space-y-3">
                            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">AI Clean Tools</h4>
                            <button onClick={()=>toast({title:"Scanning for retakes..."})} className="w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors text-left"><RefreshCw className="w-5 h-5 text-muted shrink-0"/><div><p className="text-sm font-medium">Remove Retakes</p><p className="text-xs text-muted">Find repeated sentences</p></div></button>
                            <button onClick={()=>{setShowSilencePanel(true);setSilencesFound(8);}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors text-left"><Scissors className="w-5 h-5 text-muted shrink-0"/><div><p className="text-sm font-medium">Remove Silences</p><p className="text-xs text-muted">Cut segments below -45dB</p></div></button>
                            {showSilencePanel&&silencesFound>0&&(<div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] space-y-3"><div className="flex items-center justify-between"><span className="text-xs font-medium">Found {silencesFound} segments</span><button onClick={()=>setShowSilencePanel(false)} className="p-1 text-muted hover:text-foreground"><XIcon className="w-3 h-3"/></button></div><div className="space-y-2"><label className="text-xs text-muted">Threshold: {silenceThreshold}ms</label><input type="range" min={100} max={1000} step={50} value={silenceThreshold} onChange={e=>setSilenceThreshold(Number(e.target.value))} className="w-full accent-accent"/></div><button onClick={()=>{setShowSilencePanel(false);toast({title:"Silences removed"});}} className="w-full py-2.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90">Remove All</button></div>)}
                            <button onClick={()=>toast({title:"Fix Word mode"})} className="w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors text-left"><Mic className="w-5 h-5 text-muted shrink-0"/><div><p className="text-sm font-medium">Fix Word</p><p className="text-xs text-muted">AI voice clone to fix mispronunciations</p></div></button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {captionSubTab === "clips" && (
                    <div className="space-y-4">
                      <p className="text-xs text-muted">AI finds your best moments for social clips.</p>
                      {!clipsGenerated ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]"><span className="text-sm text-muted">Clips</span><div className="flex gap-2">{[1,3,5].map(n=>(<button key={n} onClick={()=>setClipCount(n)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${clipCount===n?"bg-foreground text-background":"bg-foreground/[0.06] hover:bg-foreground/[0.1]"}`}>{n}</button>))}</div></div>
                          <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]"><span className="text-sm text-muted">Duration</span><div className="flex gap-2">{["15s","30s","60s"].map(d=>(<button key={d} onClick={()=>setClipDuration(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${clipDuration===d?"bg-foreground text-background":"bg-foreground/[0.06] hover:bg-foreground/[0.1]"}`}>{d}</button>))}</div></div>
                          <button onClick={()=>{setClipsGenerated(true);toast({title:"Clips generated"});}} className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent/90"><Sparkles className="w-4 h-4"/>Find Best Moments</button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between"><span className="text-xs text-muted">{CLIP_SUGGESTIONS.length} clips</span><button onClick={()=>{setClipsGenerated(false);setAcceptedClips(new Set());}} className="text-xs text-accent hover:underline">Regenerate</button></div>
                          {CLIP_SUGGESTIONS.map((clip,i)=>(<div key={i} className={`p-4 rounded-xl border ${acceptedClips.has(i)?"border-emerald-500/40 bg-emerald-500/[0.04]":"border-foreground/[0.08] hover:border-foreground/[0.15]"}`}><div className="flex items-start justify-between mb-2"><h4 className="text-sm font-semibold">{clip.label}</h4><span className="text-[10px] px-2 py-0.5 rounded-md bg-foreground/[0.06] text-muted capitalize">{clip.platform}</span></div><p className="text-xs text-muted mb-3">{clip.rationale}</p><div className="flex items-center justify-between"><span className="text-xs font-mono text-muted">{clip.start.toFixed(1)}s—{clip.end.toFixed(1)}s</span><div className="flex gap-2"><button onClick={()=>setCurrentTime(clip.start)} className="px-3 py-1.5 bg-foreground/[0.06] rounded-lg text-xs font-medium hover:bg-foreground/[0.1]">Preview</button><button onClick={()=>{setAcceptedClips(p=>{const n=new Set(p);if(n.has(i))n.delete(i);else n.add(i);return n;});}} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${acceptedClips.has(i)?"bg-emerald-500 text-white":"bg-foreground text-background hover:bg-foreground/90"}`}>{acceptedClips.has(i)?<><Check className="w-3 h-3 inline mr-1"/>Accepted</>:"Accept"}</button></div></div></div>))}
                          {acceptedClips.size>0&&(<button onClick={()=>toast({title:`Exporting ${acceptedClips.size} clips...`})} className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl font-medium text-sm"><Download className="w-4 h-4"/>Export {acceptedClips.size} Clip{acceptedClips.size!==1?"s":""}</button>)}
                        </div>
                      )}
                      <div className="border-t border-foreground/[0.06] pt-4 space-y-3"><h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Social Export Presets</h4>{SOCIAL_EXPORT_PRESETS.map(p=>(<button key={p.platform} onClick={()=>{setSelectedRatio(p.ratio);toast({title:`${p.platform} preset`});}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors text-left"><span className="w-8 h-8 rounded-lg bg-foreground/[0.06] flex items-center justify-center text-sm">{p.icon}</span><div className="flex-1"><p className="text-sm font-medium">{p.platform}</p><p className="text-[10px] text-muted">{p.ratio} · {p.res}</p></div></button>))}</div>
                    </div>
                  )}
                  {captionSubTab === "notes" && (
                    <div className="space-y-4">
                      <p className="text-xs text-muted">Generate descriptions, show notes, chapters, and social posts.</p>
                      {!metadataGenerated ? (
                        <button onClick={()=>{setMetadataGenerated(true);toast({title:"Metadata generated"});}} className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl font-medium text-sm hover:bg-foreground/90"><Sparkles className="w-4 h-4"/>Generate All</button>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2"><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Titles</h4><button onClick={()=>{navigator.clipboard.writeText(metaTitles[0]);toast({title:"Copied"});}} className="p-1 text-muted hover:text-foreground"><Copy className="w-3.5 h-3.5"/></button></div>{metaTitles.map((t,i)=>(<div key={i} className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-sm cursor-pointer hover:border-foreground/[0.12]">{t}</div>))}</div>
                          <div className="space-y-2"><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Description</h4><button onClick={()=>{navigator.clipboard.writeText(metaDescription);toast({title:"Copied"});}} className="p-1 text-muted hover:text-foreground"><Copy className="w-3.5 h-3.5"/></button></div><div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-xs text-foreground/80 leading-relaxed">{metaDescription}</div></div>
                          <div className="space-y-2"><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Tags</h4><button onClick={()=>{navigator.clipboard.writeText(metaTags.join(", "));toast({title:"Copied"});}} className="p-1 text-muted hover:text-foreground"><Copy className="w-3.5 h-3.5"/></button></div><div className="flex flex-wrap gap-2">{metaTags.map(tag=>(<span key={tag} className="px-3 py-1.5 rounded-lg bg-foreground/[0.06] text-xs font-medium">#{tag}</span>))}</div></div>
                          <div className="space-y-2"><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Chapters</h4><button onClick={()=>{navigator.clipboard.writeText(metaChapters.map(c=>`${c.time} ${c.label}`).join("\n"));toast({title:"Copied"});}} className="p-1 text-muted hover:text-foreground"><Copy className="w-3.5 h-3.5"/></button></div>{metaChapters.map((ch,i)=>(<div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/[0.03]"><span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 text-xs font-mono rounded-md">{ch.time}</span><span className="text-sm">{ch.label}</span></div>))}</div>
                          <div className="space-y-2"><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Show Notes</h4><button onClick={()=>{navigator.clipboard.writeText(metaShowNotes);toast({title:"Copied"});}} className="p-1 text-muted hover:text-foreground"><Copy className="w-3.5 h-3.5"/></button></div><div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-xs text-foreground/80 leading-relaxed">{metaShowNotes}</div></div>
                          <button onClick={()=>setMetadataGenerated(false)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground/[0.06] rounded-xl text-xs font-medium hover:bg-foreground/[0.1]"><RefreshCw className="w-3.5 h-3.5"/>Regenerate</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
                </div>
              )}

              {/* Effects Sub-Tab Nav */}
              {activeTab === "effects" && (
                <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                  {([{id:"effects",label:"Effects"},{id:"transitions",label:"Transitions"},{id:"elements",label:"Elements"}] as const).map(sub => (
                    <button key={sub.id} onClick={() => setEffectsSubTab(sub.id)}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${effectsSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                  ))}
                </div>
              )}
              {activeTab === "effects" && effectsSubTab === "effects" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Effects</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {EFFECTS_DATA.map(effect => (
                      <button key={effect} onClick={() => toast({ title: `${effect} applied` })}
                        className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:scale-105 transition-transform">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-foreground/70 text-center leading-tight">{effect}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Elements */}
              {activeTab === "effects" && effectsSubTab === "elements" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Elements</h3>
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1">
                    {["Shapes", "Stickers", "Overlays"].map(sub => (
                      <button key={sub} className="flex-1 py-2 rounded-md text-xs font-medium text-muted hover:text-foreground hover:bg-background transition-colors">{sub}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {["Circle", "Rectangle", "Triangle", "Star", "Arrow", "Line", "Heart", "Diamond"].map(shape => (
                      <button key={shape} onClick={() => toast({ title: `${shape} added` })}
                        className="aspect-square rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] hover:border-accent/40 flex items-center justify-center transition-all">
                        <div className="w-8 h-8 bg-foreground/[0.1] rounded-md" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Transitions */}
              {activeTab === "effects" && effectsSubTab === "transitions" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold">Transitions</h3>
                  {["Fade", "Dissolve", "Wipe Left", "Wipe Right", "Zoom In", "Zoom Out", "Slide Up", "Slide Down", "Spin", "Glitch"].map(tr => (
                    <button key={tr} onClick={() => toast({ title: `${tr} transition applied` })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 transition-all text-left">
                      <div className="w-12 h-8 bg-gradient-to-r from-foreground/[0.08] to-foreground/[0.02] rounded-lg" />
                      <span className="text-sm font-medium text-foreground">{tr}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === "templates" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Templates</h3>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
                      <Plus className="w-4 h-4" />Create template
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" placeholder="Search templates..." value={templateSearch} onChange={e => setTemplateSearch(e.target.value)}
                      className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
                  </div>
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{cat.name} ({cat.count})</span>
                        <button className="text-xs text-muted hover:text-foreground">See All &gt;</button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }, (_, i) => (
                          <div key={i} className="aspect-video rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] hover:border-accent/40 cursor-pointer transition-all overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-foreground/[0.06]" />
                            <div className="absolute bottom-1.5 left-1.5 right-1.5">
                              <span className="text-[9px] text-foreground/60 leading-tight line-clamp-2">Template {i + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings Sub-Tab Nav */}
              {activeTab === "settings" && (
                <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                  {([{id:"general",label:"General"},{id:"brand",label:"Brand"},{id:"languages",label:"Languages"}] as const).map(sub => (
                    <button key={sub.id} onClick={() => setSettingsSubTab(sub.id)}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${settingsSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                  ))}
                </div>
              )}

              {/* Languages */}
              {activeTab === "settings" && settingsSubTab === "languages" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Languages</h3>
                  <p className="text-sm text-muted">Translate and dub your video into different languages.</p>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" placeholder="Search languages..." value={languageSearch} onChange={e => setLanguageSearch(e.target.value)}
                      className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
                  </div>

                  <div className="space-y-1">
                    {[
                      { code: "en", label: "English", flag: "🇺🇸" },
                      { code: "es", label: "Spanish", flag: "🇪🇸" },
                      { code: "fr", label: "French", flag: "🇫🇷" },
                      { code: "de", label: "German", flag: "🇩🇪" },
                      { code: "it", label: "Italian", flag: "🇮🇹" },
                      { code: "pt", label: "Portuguese", flag: "🇧🇷" },
                      { code: "ja", label: "Japanese", flag: "🇯🇵" },
                      { code: "ko", label: "Korean", flag: "🇰🇷" },
                      { code: "zh", label: "Chinese", flag: "🇨🇳" },
                      { code: "ar", label: "Arabic", flag: "🇸🇦" },
                      { code: "hi", label: "Hindi", flag: "🇮🇳" },
                      { code: "ru", label: "Russian", flag: "🇷🇺" },
                    ].filter(l => l.label.toLowerCase().includes(languageSearch.toLowerCase())).map(lang => (
                      <button key={lang.code} onClick={() => { setSelectedLanguage(lang.code); toast({ title: `Language set to ${lang.label}` }); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${selectedLanguage === lang.code ? "bg-accent/10 border border-accent/30" : "bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12]"}`}>
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-medium text-foreground flex-1">{lang.label}</span>
                        {selectedLanguage === lang.code && <Check className="w-4 h-4 text-accent" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-foreground/[0.06] pt-4 space-y-3">
                    <h4 className="text-sm font-semibold">AI Dubbing</h4>
                    <button onClick={() => toast({ title: "AI Dubbing started..." })}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-accent/[0.08] border border-accent/[0.15] hover:bg-accent/[0.12] transition-colors text-left">
                      <Languages className="w-5 h-5 text-accent shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Translate & Dub</p>
                        <p className="text-xs text-muted">Auto-translate dialogue and generate voiceover</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                    </button>
                    <button onClick={() => toast({ title: "Generating subtitles..." })}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors text-left">
                      <Captions className="w-5 h-5 text-muted shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Auto Subtitles</p>
                        <p className="text-xs text-muted">Generate translated subtitles</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Brand Kit */}
              {activeTab === "settings" && settingsSubTab === "brand" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Brand Kit</h3>
                  <p className="text-sm text-muted">Define your brand identity for consistent content.</p>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Logo</h4>
                    <button className="w-full h-24 border-2 border-dashed border-foreground/[0.1] rounded-xl flex flex-col items-center justify-center gap-2 text-muted hover:text-foreground hover:border-foreground/[0.2] transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-xs">Upload Logo</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Brand Colors</h4>
                    <div className="flex gap-2">
                      {["#E8472A", "#1a1a2e", "#f5f5f0", "#3b82f6", "#10b981"].map((color, i) => (
                        <button key={i} className="w-10 h-10 rounded-lg border border-foreground/[0.08] hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                      ))}
                      <button className="w-10 h-10 rounded-lg border-2 border-dashed border-foreground/[0.1] flex items-center justify-center text-muted hover:text-foreground transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Fonts</h4>
                    {["Heading — Playfair Display", "Body — DM Sans"].map(font => (
                      <div key={font} className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                        <span className="text-sm font-medium">{font}</span>
                        <ChevronDown className="w-4 h-4 text-muted" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Watermark</h4>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm font-medium">Add Watermark</span>
                      <button className="w-9 h-5 rounded-full bg-foreground/[0.1] relative transition-colors">
                        <div className="w-4 h-4 rounded-full bg-foreground/[0.3] absolute top-0.5 left-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Intro / Outro</h4>
                    <button className="w-full p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] transition-colors text-left">
                      <p className="text-sm font-medium">Set Intro Clip</p>
                      <p className="text-xs text-muted">Auto-add branded intro to all videos</p>
                    </button>
                    <button className="w-full p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] transition-colors text-left">
                      <p className="text-sm font-medium">Set Outro Clip</p>
                      <p className="text-xs text-muted">Auto-add branded outro to all videos</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Settings General */}
              {activeTab === "settings" && settingsSubTab === "general" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Settings</h3>

                  {/* Size */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Size</h4>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center gap-2 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] transition-colors text-left">
                          <Video className="w-4 h-4 text-muted" />
                          <span className="text-sm font-medium flex-1">
                            {selectedRatio === "16:9" ? "Landscape (16:9)" : selectedRatio === "9:16" ? "Portrait (9:16)" : selectedRatio === "1:1" ? "Square (1:1)" : selectedRatio === "4:5" ? "Vertical (4:5)" : `Custom (${selectedRatio})`}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-1.5" align="start">
                        {[
                          { value: "16:9", label: "Landscape (16:9)" },
                          { value: "9:16", label: "Portrait (9:16)" },
                          { value: "1:1", label: "Square (1:1)" },
                          { value: "4:5", label: "Vertical (4:5)" },
                          { value: "4:3", label: "Standard (4:3)" },
                          { value: "21:9", label: "Ultrawide (21:9)" },
                        ].map(r => (
                          <button key={r.value} onClick={() => setSelectedRatio(r.value)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedRatio === r.value ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>
                            {r.label}{selectedRatio === r.value && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <button onClick={() => toast({ title: "Opening social media resize..." })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] transition-colors text-left">
                      <FileText className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-sm font-medium">Resize For Social Media</p>
                        <p className="text-xs text-muted">Create New Version For Social Media</p>
                      </div>
                    </button>
                  </div>

                  {/* Background */}
                  <div className="border-t border-foreground/[0.06] pt-3 space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Background</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                        <button onClick={() => setBackgroundType("color")} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${backgroundType === "color" ? "border-accent" : "border-foreground/[0.2]"}`}>
                            {backgroundType === "color" && <div className="w-2 h-2 rounded-full bg-accent" />}
                          </div>
                          <span className="text-sm font-medium">Color</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted font-mono">{backgroundColor.toUpperCase()}</span>
                          <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)}
                            className="w-6 h-6 rounded border-0 cursor-pointer" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08] cursor-pointer hover:border-foreground/[0.15] transition-colors">
                        <button onClick={() => setBackgroundType("image")} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${backgroundType === "image" ? "border-accent" : "border-foreground/[0.2]"}`}>
                            {backgroundType === "image" && <div className="w-2 h-2 rounded-full bg-accent" />}
                          </div>
                          <span className="text-sm font-medium">Image</span>
                        </button>
                        <span className="text-xs text-muted">Upload</span>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="border-t border-foreground/[0.06] pt-3 space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Duration</h4>
                    <div className="space-y-2">
                      <button onClick={() => setDurationType("automatic")} className="w-full flex items-center gap-2 p-3 rounded-xl border border-foreground/[0.08]">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${durationType === "automatic" ? "border-accent" : "border-foreground/[0.2]"}`}>
                          {durationType === "automatic" && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                        <span className="text-sm font-medium">Automatic</span>
                      </button>
                      <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                        <button onClick={() => setDurationType("fixed")} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${durationType === "fixed" ? "border-accent" : "border-foreground/[0.2]"}`}>
                            {durationType === "fixed" && <div className="w-2 h-2 rounded-full bg-accent" />}
                          </div>
                          <span className="text-sm font-medium">Fixed</span>
                        </button>
                        <input value={fixedDuration} onChange={e => setFixedDuration(e.target.value)}
                          disabled={durationType !== "fixed"}
                          className="w-20 text-right text-xs font-mono bg-foreground/[0.04] px-2 py-1 rounded border border-foreground/[0.08] focus:outline-none disabled:opacity-50" />
                      </div>
                    </div>
                  </div>

                  {/* Timeline Settings */}
                  <div className="border-t border-foreground/[0.06] pt-3 space-y-1">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Timeline Settings</h4>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-muted" />
                        <span className="text-sm">Show Comments</span>
                      </div>
                      <Switch checked={showComments} onCheckedChange={setShowComments} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <div className="flex items-center gap-3">
                        <AudioLines className="w-4 h-4 text-muted" />
                        <span className="text-sm">Show Soundwaves</span>
                      </div>
                      <Switch checked={showSoundwaves} onCheckedChange={setShowSoundwaves} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <div className="flex items-center gap-3">
                        <Ghost className="w-4 h-4 text-muted" />
                        <span className="text-sm">Show Ghost Playhead</span>
                      </div>
                      <Switch checked={showGhostPlayhead} onCheckedChange={setShowGhostPlayhead} />
                    </div>
                  </div>

                  {/* Frames Per Second */}
                  <div className="border-t border-foreground/[0.06] pt-3 space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Frames Per Second</h4>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] transition-colors">
                          <span className="text-sm font-medium">{framesPerSecond} fps</span>
                          <ChevronDown className="w-4 h-4 text-muted" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1.5" align="start">
                        {["24", "25", "30", "60"].map(fps => (
                          <button key={fps} onClick={() => setFramesPerSecond(fps)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${framesPerSecond === fps ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>
                            {fps} fps{framesPerSecond === fps && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Version History */}
                  <div className="border-t border-foreground/[0.06] pt-3 space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Version History</h4>
                    <button onClick={() => toast({ title: "Opening version history..." })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] transition-colors text-left">
                      <History className="w-5 h-5 text-muted shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Restore To A Previous Version</p>
                        <p className="text-xs text-muted">Creates A New Project</p>
                      </div>
                    </button>
                  </div>

                  {/* Audio */}
                  <div className="border-t border-foreground/[0.06] pt-3 space-y-3">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Audio</h4>
                    <button onClick={() => toast({ title: "Opening AI Dubbing..." })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/[0.08] border border-accent/[0.15] hover:bg-accent/[0.12] transition-colors text-left">
                      <Languages className="w-5 h-5 text-accent shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">AI Dubbing</p>
                        <p className="text-xs text-muted">Translate Dialogue To Different Languages</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                    </button>
                    <button onClick={() => toast({ title: "Cleaning audio..." })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/[0.08] border border-accent/[0.15] hover:bg-accent/[0.12] transition-colors text-left">
                      <Sparkles className="w-5 h-5 text-accent shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Clean Audio</p>
                        <p className="text-xs text-muted">Remove Background Noise</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom AI Prompt - always visible */}
            <div className="p-3 border-t border-foreground/[0.06] shrink-0">
              <EditorPromptBox
                editorType="video"
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                onSend={handleSendChat}
                isStreaming={isStreaming}
              />
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle — pinned to right edge of left panel */}
      <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
        className="absolute top-1/3 -translate-y-1/2 z-10 w-5 h-10 bg-accent rounded-r-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
        style={{ left: isLeftPanelCollapsed ? 0 : 420 }}>
        <ChevronLeft className={`w-3 h-3 text-white transition-transform ${isLeftPanelCollapsed ? "rotate-180" : ""}`} />
      </button>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Video Canvas */}
        <div className="flex-1 bg-foreground/[0.03] flex flex-col items-center relative overflow-hidden min-h-0">

          {/* Top context toolbar — only when canvas is clicked */}
          <AnimatePresence>
            {showCanvasControls && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="shrink-0 w-full flex items-center justify-center gap-4 px-4 py-2 border-b border-foreground/[0.06] bg-card/80 backdrop-blur-sm z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm font-semibold text-accent">Replace media</span>
                <div className="w-px h-5 bg-foreground/[0.08]" />
                <button className="text-sm text-foreground hover:text-accent transition-colors">Position</button>
                <button className="p-1.5 text-muted hover:text-foreground"><Copy className="w-4 h-4" /></button>
                <button className="p-1.5 text-muted hover:text-foreground"><RefreshCw className="w-4 h-4" /></button>
                <button className="p-1.5 text-muted hover:text-foreground"><Maximize className="w-4 h-4" /></button>
                <span className="text-sm text-muted">100%</span>
                <button className="p-1.5 text-muted hover:text-foreground"><Layers className="w-4 h-4" /></button>
                <div className="w-px h-5 bg-foreground/[0.08]" />
                <button className="text-sm text-foreground hover:text-accent transition-colors">Effects</button>
                <button className="text-sm text-foreground hover:text-accent transition-colors">Animation</button>
                <button className="p-1.5 text-muted hover:text-foreground"><MoreVertical className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas area */}
          <div className="flex-1 flex items-center justify-center w-full min-h-0 px-4 py-2 overflow-hidden"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleCanvasDrop}
          >
            {/* Hidden file input for video upload */}
            <input ref={fileInputRef} type="file" accept="video/*,image/*,audio/*" className="hidden" onChange={(e) => handleMediaFileUpload(e.target.files)} />
            {(video || activeClipAtPlayhead) ? (
            <div
              className="video-canvas-container relative bg-black rounded-xl overflow-hidden shadow-2xl cursor-pointer max-h-full"
              style={{ width: "80%", maxWidth: 800, aspectRatio: selectedRatio === "9:16" ? "9/16" : selectedRatio === "1:1" ? "1/1" : selectedRatio === "4:5" ? "4/5" : selectedRatio === "4:3" ? "4/3" : "16/9" }}
              onClick={() => setShowCanvasControls(!showCanvasControls)}
            >
                {activeClipAtPlayhead?.mediaUrl ? (
                  activeClipAtPlayhead.mediaType === "image" ? (
                    <img src={activeClipAtPlayhead.mediaUrl} alt={activeClipAtPlayhead.name} className="w-full h-full object-contain" />
                  ) : (
                    <video ref={canvasVideoRef} src={activeClipAtPlayhead.mediaUrl} className="w-full h-full object-contain" muted={isMuted} />
                  )
                ) : video ? (
                  <video ref={videoRef} src={video} className="w-full h-full object-contain" />
                ) : null}

              {/* Delete button - top right */}
              <AnimatePresence>
                {showCanvasControls && (video || activeClipAtPlayhead) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); toast({ title: "Media removed" }); }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors shadow-lg z-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Canvas play controls - centered */}
              <AnimatePresence>
                {showCanvasControls && (video || activeClipAtPlayhead) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                    onClick={() => setShowCanvasControls(false)}
                  >
                    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <SkipBack className="w-5 h-5" />
                      </button>
                      <button onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/35 transition-colors">
                        {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                      </button>
                      <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Safe Zone Overlay */}
              {safeZone !== "hide" && (
                <div className="absolute inset-0 pointer-events-none z-[5]">
                  {/* Status bar */}
                  <div className="absolute top-0 left-0 right-0 px-4 pt-2 flex justify-between items-center">
                    <span className="text-white text-xs font-semibold">9:41</span>
                    {safeZone === "reels" && <div className="w-6 h-3.5 rounded-full border border-white/40" />}
                  </div>

                  {/* Platform top elements */}
                  {safeZone === "reels" && <div className="absolute top-8 left-4"><span className="text-white text-lg font-bold">Reels</span></div>}
                  {safeZone === "tiktok" && (
                    <>
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4">
                        <span className="text-white/60 text-sm font-medium">Following</span>
                        <span className="text-white text-sm font-bold">For you</span>
                      </div>
                      <div className="absolute top-16 left-4">
                        <span className="bg-accent/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">LIVE</span>
                      </div>
                    </>
                  )}
                  {safeZone === "facebook" && (
                    <div className="absolute top-8 left-4 flex items-center gap-2">
                      <span className="text-white text-lg">✕</span>
                      <span className="text-white text-sm font-medium">Reels ▾</span>
                    </div>
                  )}

                  {/* Right side social icons */}
                  {(safeZone === "reels" || safeZone === "tiktok" || safeZone === "shorts") && (
                    <div className="absolute right-3 top-1/4 flex flex-col items-center gap-5">
                      {safeZone === "reels" && (
                        <>
                          <div className="flex flex-col items-center gap-1"><Heart className="w-6 h-6 text-white" /><span className="text-white text-[10px]">30.2K</span></div>
                          <div className="flex flex-col items-center gap-1"><MessageSquare className="w-6 h-6 text-white" /><span className="text-white text-[10px]">671</span></div>
                          <div className="flex flex-col items-center gap-1"><Send className="w-6 h-6 text-white" /><span className="text-white text-[10px]">1,054</span></div>
                        </>
                      )}
                      {safeZone === "tiktok" && (
                        <>
                          <div className="flex flex-col items-center gap-1"><MessageSquare className="w-5 h-5 text-white" /><span className="text-white text-[10px]">942</span></div>
                          <div className="flex flex-col items-center gap-1"><Flag className="w-5 h-5 text-white" /><span className="text-white text-[10px]">6180</span></div>
                          <div className="flex flex-col items-center gap-1"><Send className="w-5 h-5 text-white" /><span className="text-white text-[10px]">28.1K</span></div>
                          <div className="w-8 h-8 rounded-lg bg-white/30 mt-2" />
                        </>
                      )}
                      {safeZone === "shorts" && (
                        <>
                          <div className="flex flex-col items-center gap-1"><Heart className="w-6 h-6 text-white" /><span className="text-white text-[10px]">Like</span></div>
                          <div className="flex flex-col items-center gap-1"><MessageSquare className="w-6 h-6 text-white" /><span className="text-white text-[10px]">25</span></div>
                          <div className="flex flex-col items-center gap-1"><Send className="w-6 h-6 text-white" /><span className="text-white text-[10px]">Share</span></div>
                          <div className="flex flex-col items-center gap-1"><Scissors className="w-6 h-6 text-white" /><span className="text-white text-[10px]">Remix</span></div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Bottom elements */}
                  <div className="absolute bottom-4 left-4 right-16">
                    {safeZone === "tiktok" && <div className="mb-1"><span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md">Your friend</span></div>}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-white/30" />
                      <span className="text-white text-sm font-bold">
                        {safeZone === "reels" ? "username" : safeZone === "tiktok" ? "@username" : safeZone === "shorts" ? "@youtube" : safeZone === "facebook" ? "Facebook" : safeZone === "linkedin" ? "Linkedin" : "username"}
                      </span>
                      {safeZone === "tiktok" && <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>}
                      {(safeZone === "reels" || safeZone === "linkedin") && <span className="text-white text-xs border border-white/50 rounded-md px-2 py-0.5">Follow</span>}
                      {safeZone === "shorts" && <span className="text-black text-xs bg-white rounded-md px-2.5 py-1 font-medium">Subscribe</span>}
                    </div>
                    {safeZone === "linkedin" && <p className="text-white/70 text-[10px] mb-1">1,814 followers</p>}
                    {safeZone === "shorts" && <p className="text-white text-xs mb-1">▶ Playlist 1</p>}
                    {safeZone === "reels" && <p className="text-white text-xs mb-0.5">♪ Music</p>}
                    <p className="text-white text-xs leading-relaxed">
                      {safeZone === "reels" ? "Caption goes here..." : safeZone === "tiktok" ? "This is a TikTok video with a long description... #tiktok #viral... more" : safeZone === "shorts" ? "Youtube shorts interface #youtube #shorts #viral" : safeZone === "facebook" ? "This is a Facebook video" : safeZone === "linkedin" ? "This is a Linkedin video" : ""}
                    </p>
                    {safeZone === "reels" && <p className="text-white/50 text-[10px] mt-1">Liked by user and 30,240 others</p>}
                    {safeZone === "tiktok" && <p className="text-white/60 text-[10px] mt-1">See translation</p>}
                    {safeZone === "facebook" && <p className="text-white text-xs mt-1">♪ Soundtrack</p>}
                  </div>

                  {safeZone === "linkedin" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-white w-1/3" />
                    </div>
                  )}

                  {/* Dashed safe zone border */}
                  <div className="absolute inset-3 border-2 border-dashed border-white/30 rounded-xl" />
                </div>
              )}

              {/* Fullscreen button — bottom right of video */}
              <button onClick={(e) => { e.stopPropagation(); const el = document.querySelector('.video-canvas-container'); if (el) { if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen(); } }}
                className="absolute bottom-3 right-3 p-2 rounded-lg bg-card/80 backdrop-blur-sm text-foreground/60 hover:text-foreground hover:bg-card/90 transition-colors shadow-lg border border-foreground/[0.08] z-[6]">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
            ) : (
              <div className="flex flex-col items-center gap-0 text-center">
                <img src={emptyVideoCards} alt="" className="w-[18rem] h-[18rem] object-contain -mb-8" />
                <p className="text-lg font-semibold text-foreground">Add Media To The Timeline To Start Creating</p>
                <p className="text-sm text-muted mt-2 mb-4">Drop a video file here, upload from your device, or add a scene</p>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors text-sm">
                    <Upload className="w-4 h-4" />Upload Media
                  </button>
                  <button onClick={() => insertSceneAtIndex(scenes.length)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-foreground/[0.06] text-foreground rounded-lg font-medium hover:bg-foreground/[0.1] transition-colors text-sm">
                    <Plus className="w-4 h-4" />Add Scene
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom toolbar — only when canvas is clicked */}
          <AnimatePresence>
            {showCanvasControls && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="shrink-0 py-2 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 bg-card border border-foreground/[0.08] rounded-xl px-2 py-1.5 shadow-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-foreground/[0.04] transition-colors">
                        <Settings className="w-4 h-4 text-muted" /> Ratio: {selectedRatio}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-1.5" align="center">
                      {[
                        { r: "16:9", icon: "▬" },
                        { r: "9:16", icon: "▮" },
                        { r: "1:1", icon: "■" },
                        { r: "4:5", icon: "▯" },
                        { r: "4:3", icon: "▭" },
                      ].map(({ r, icon }) => (
                        <button key={r} onClick={() => setSelectedRatio(r)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedRatio === r ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04]"}`}>
                          <div className={`border border-current rounded-sm flex items-center justify-center ${r === "16:9" ? "w-7 h-4" : r === "9:16" ? "w-4 h-7" : r === "1:1" ? "w-5 h-5" : r === "4:5" ? "w-4 h-5" : "w-6 h-[18px]"}`} />
                          <span className="flex-1">{r}</span>
                          {selectedRatio === r && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <div className="w-px h-5 bg-foreground/[0.08]" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-foreground/[0.04] transition-colors">
                        <LayoutGrid className="w-4 h-4 text-muted" /> Layouts
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[340px] p-4" align="center">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold">Layout</h4>
                        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                          <input type="checkbox" checked={applyLayoutToAll} onChange={() => setApplyLayoutToAll(!applyLayoutToAll)} className="rounded border-foreground/20 accent-accent w-4 h-4" />
                          Apply To All
                        </label>
                      </div>
                      <div className="grid grid-cols-4 gap-2.5">
                        {[
                          /* Row 1 */
                          { id: 0, cells: [{ x: 0, y: 0, w: 1, h: 1, person: true }] },
                          { id: 1, cells: [{ x: 0, y: 0, w: 0.5, h: 0.5, person: false }, { x: 0, y: 0.5, w: 1, h: 0.5, person: false }] },
                          { id: 2, cells: [{ x: 0, y: 0, w: 1, h: 0.6, person: true }, { x: 0, y: 0.6, w: 1, h: 0.4, person: false }] },
                          { id: 3, cells: [{ x: 0, y: 0, w: 1, h: 0.5, person: false }, { x: 0.6, y: 0.5, w: 0.4, h: 0.5, person: false }] },
                          /* Row 2 */
                          { id: 4, cells: [{ x: 0, y: 0, w: 1, h: 0.5, person: false }, { x: 0, y: 0.5, w: 1, h: 0.5, person: false }] },
                          { id: 5, cells: [{ x: 0, y: 0, w: 0.5, h: 1, person: true }, { x: 0.5, y: 0, w: 0.5, h: 1, person: true }] },
                          { id: 6, cells: [{ x: 0, y: 0, w: 0.5, h: 0.5, person: true }, { x: 0.5, y: 0, w: 0.5, h: 0.5, person: true }, { x: 0, y: 0.5, w: 1, h: 0.5, person: false }] },
                          { id: 7, cells: [{ x: 0, y: 0, w: 1, h: 0.5, person: false }, { x: 0, y: 0.5, w: 0.5, h: 0.5, person: false }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5, person: false }] },
                          /* Row 3 */
                          { id: 8, cells: [{ x: 0, y: 0, w: 0.5, h: 1, person: true }, { x: 0.5, y: 0, w: 0.5, h: 0.5, person: true }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5, person: true }] },
                          { id: 9, cells: [{ x: 0, y: 0, w: 0.5, h: 0.5, person: true }, { x: 0.5, y: 0, w: 0.5, h: 0.5, person: true }, { x: 0, y: 0.5, w: 0.5, h: 0.5, person: true }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5, person: false, small: true }] },
                        ].map(layout => (
                          <button key={layout.id} onClick={() => setSelectedLayout(layout.id)}
                            className={`relative w-full aspect-[4/3] rounded-lg border-2 transition-all ${selectedLayout === layout.id ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-foreground/20"}`}>
                            <div className="absolute inset-1.5">
                              {layout.cells.map((cell, i) => (
                                <div key={i} className={`absolute rounded-sm flex items-center justify-center ${cell.person ? "bg-blue-400" : "bg-foreground/[0.08]"}`}
                                  style={{ left: `${cell.x * 100}%`, top: `${cell.y * 100}%`, width: `${cell.w * 100 - 4}%`, height: `${cell.h * 100 - 4}%` }}>
                                  {cell.person && <User className="w-3 h-3 text-white" />}
                                </div>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <div className="w-px h-5 bg-foreground/[0.08]" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-foreground/[0.04] transition-colors">
                        <div className="w-4 h-4 rounded-full border border-foreground/20" style={{ background: canvasBgColor }} /> Background
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-4" align="center">
                      {/* Tabs + Apply to all */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-4">
                          {(["color", "image", "upload"] as const).map(t => (
                            <button key={t} onClick={() => setBgTab(t)}
                              className={`text-sm font-medium capitalize transition-colors ${bgTab === t ? "text-accent" : "text-muted hover:text-foreground"}`}>
                              {t === "color" ? "Color" : t === "image" ? "Image" : "Upload"}
                            </button>
                          ))}
                        </div>
                        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                          <input type="checkbox" checked={applyBgToAll} onChange={() => setApplyBgToAll(!applyBgToAll)} className="rounded border-foreground/20 accent-accent w-4 h-4" />
                          Apply To All
                        </label>
                      </div>

                      {bgTab === "color" && (
                        <>
                          {/* Color gradient picker area */}
                          <div className="relative w-full aspect-[5/3] rounded-lg mb-3 overflow-hidden cursor-crosshair"
                            style={{ background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${canvasBgColor})` }}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                              const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                              const r = Math.round(255 * (1 - x) * (1 - y));
                              const g = Math.round(0);
                              const b = Math.round(0);
                              setBgRgb({ r, g, b });
                            }}
                          />
                          {/* Hue slider */}
                          <div className="relative w-full h-3 rounded-full mb-2 cursor-pointer"
                            style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = (e.clientX - rect.left) / rect.width;
                              const hue = Math.round(x * 360);
                              const h = hue / 60;
                              const c = 255;
                              const xv = c * (1 - Math.abs(h % 2 - 1));
                              let r = 0, g = 0, b = 0;
                              if (h < 1) { r = c; g = Math.round(xv); }
                              else if (h < 2) { r = Math.round(xv); g = c; }
                              else if (h < 3) { g = c; b = Math.round(xv); }
                              else if (h < 4) { g = Math.round(xv); b = c; }
                              else if (h < 5) { r = Math.round(xv); b = c; }
                              else { r = c; b = Math.round(xv); }
                              const hex = `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
                              setCanvasBgColor(hex);
                              setBgRgb({ r, g, b });
                            }}
                          />
                          {/* Opacity slider */}
                          <div className="relative w-full h-3 rounded-full mb-3 cursor-pointer"
                            style={{ background: `linear-gradient(to right, transparent, ${canvasBgColor})` }}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setBgOpacity(Math.round((e.clientX - rect.left) / rect.width * 100));
                            }}
                          />
                          {/* RGB inputs */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-medium text-muted w-8">RGB</span>
                            {[{ k: "r", v: bgRgb.r }, { k: "g", v: bgRgb.g }, { k: "b", v: bgRgb.b }].map(({ k, v }) => (
                              <input key={k} type="number" min={0} max={255} value={v}
                                onChange={(e) => {
                                  const val = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                                  const newRgb = { ...bgRgb, [k]: val };
                                  setBgRgb(newRgb);
                                  setCanvasBgColor(`#${newRgb.r.toString(16).padStart(2,"0")}${newRgb.g.toString(16).padStart(2,"0")}${newRgb.b.toString(16).padStart(2,"0")}`);
                                }}
                                className="w-14 px-2 py-1.5 text-xs text-center bg-card border border-foreground/[0.1] rounded-lg" />
                            ))}
                            <input type="number" min={0} max={100} value={bgOpacity}
                              onChange={(e) => setBgOpacity(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-14 px-2 py-1.5 text-xs text-center bg-card border border-foreground/[0.1] rounded-lg" />
                            <span className="text-xs text-muted">%</span>
                          </div>
                          {/* Color swatches */}
                          <div className="space-y-2">
                            {[
                              ["#1a0033", "#000000", "#1a1a2e", "#2b2d42", "#495057", "#8d99ae", "#adb5bd", "#dee2e6"],
                              ["#fff0f0", "#ffcccc", "#ffe8d6", "#fff3cd", "#d4edda", "#d1ecf1", "#cce5ff", "#e8d5f5"],
                              ["#e91e63", "#f44336", "#ff9800", "#ffc107", "#4caf50", "#009688", "#2196f3", "#9c27b0"],
                            ].map((row, ri) => (
                              <div key={ri} className="flex gap-2 justify-between">
                                {row.map(c => (
                                  <button key={c} onClick={() => {
                                    setCanvasBgColor(c);
                                    const r = parseInt(c.slice(1,3), 16), g = parseInt(c.slice(3,5), 16), b = parseInt(c.slice(5,7), 16);
                                    setBgRgb({ r, g, b });
                                  }}
                                    className={`w-7 h-7 rounded-full border-2 transition-all ${canvasBgColor === c ? "border-accent scale-110" : "border-foreground/[0.06] hover:border-foreground/20"}`}
                                    style={{ background: c }} />
                                ))}
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {bgTab === "image" && (
                        <div className="grid grid-cols-3 gap-2">
                          {["https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=120&h=80&fit=crop",
                            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&h=80&fit=crop",
                            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=120&h=80&fit=crop",
                            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=120&h=80&fit=crop",
                            "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=120&h=80&fit=crop",
                            "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=120&h=80&fit=crop",
                          ].map((url, i) => (
                            <button key={i} className="rounded-lg overflow-hidden border-2 border-foreground/[0.06] hover:border-accent transition-colors aspect-video"
                              onClick={() => toast({ title: "Background image applied" })}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      {bgTab === "upload" && (
                        <div className="border-2 border-dashed border-foreground/[0.12] rounded-xl p-8 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted" />
                          <p className="text-sm text-muted">Drop an image or click to upload</p>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <div className="w-px h-5 bg-foreground/[0.08]" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-foreground/[0.04] transition-colors">
                        <Eye className="w-4 h-4 text-muted" /> Safe Zone {safeZone !== "hide" && "▴"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="center">
                      {SAFE_ZONE_PLATFORMS.map(p => (
                        <button key={p.id} onClick={() => setSafeZone(p.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${safeZone === p.id ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                          {p.id === "hide" ? (
                            <EyeOff className="w-5 h-5 text-muted" />
                          ) : (
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${(p as any).color || "bg-foreground"}`}>
                              {p.id === "reels" && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2.982c2.937 0 3.285.011 4.445.064a6.087 6.087 0 0 1 2.042.379 3.408 3.408 0 0 1 1.265.823 3.408 3.408 0 0 1 .823 1.265 6.087 6.087 0 0 1 .379 2.042c.053 1.16.064 1.508.064 4.445s-.011 3.285-.064 4.445a6.087 6.087 0 0 1-.379 2.042 3.643 3.643 0 0 1-2.088 2.088 6.087 6.087 0 0 1-2.042.379c-1.16.053-1.508.064-4.445.064s-3.285-.011-4.445-.064a6.087 6.087 0 0 1-2.042-.379 3.408 3.408 0 0 1-1.265-.823 3.408 3.408 0 0 1-.823-1.265 6.087 6.087 0 0 1-.379-2.042c-.053-1.16-.064-1.508-.064-4.445s.011-3.285.064-4.445a6.087 6.087 0 0 1 .379-2.042 3.408 3.408 0 0 1 .823-1.265 3.408 3.408 0 0 1 1.265-.823 6.087 6.087 0 0 1 2.042-.379c1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066a8.074 8.074 0 0 0-2.67.511 5.392 5.392 0 0 0-1.949 1.27 5.392 5.392 0 0 0-1.269 1.948 8.074 8.074 0 0 0-.51 2.67C1.012 8.638 1 9.013 1 12s.013 3.362.066 4.535a8.074 8.074 0 0 0 .511 2.67 5.392 5.392 0 0 0 1.27 1.949 5.392 5.392 0 0 0 1.948 1.269 8.074 8.074 0 0 0 2.67.51C8.638 22.988 9.013 23 12 23s3.362-.013 4.535-.066a8.074 8.074 0 0 0 2.67-.511 5.625 5.625 0 0 0 3.218-3.218 8.074 8.074 0 0 0 .51-2.67C22.988 15.362 23 14.987 23 12s-.013-3.362-.066-4.535a8.074 8.074 0 0 0-.511-2.67 5.392 5.392 0 0 0-1.27-1.949 5.392 5.392 0 0 0-1.948-1.269 8.074 8.074 0 0 0-2.67-.51C15.362 1.012 14.987 1 12 1zm0 5.351A5.649 5.649 0 1 0 17.649 12 5.649 5.649 0 0 0 12 6.351zm0 9.316A3.667 3.667 0 1 1 15.667 12 3.667 3.667 0 0 1 12 15.667zm5.872-10.859a1.32 1.32 0 1 0 1.32 1.32 1.32 1.32 0 0 0-1.32-1.32z"/></svg>}
                              {p.id === "facebook" && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                              {p.id === "tiktok" && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.49a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.85 1.56V6.86a4.84 4.84 0 0 1-1.09-.17z"/></svg>}
                              {p.id === "shorts" && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>}
                              {p.id === "linkedin" && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>}
                              {p.id === "snapchat" && <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#000]"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.96-.315.18-.12.42-.18.614-.18.195 0 .42.06.614.18.375.24.54.615.54.975 0 .12-.015.24-.045.36-.09.375-.36.63-.69.855-.105.075-.225.135-.345.195-.181.09-.37.165-.57.225l-.118.036c-.072.022-.15.046-.231.073-.27.09-.57.255-.705.6a1.075 1.075 0 0 0-.015.555c.12.63.54 1.185 1.215 1.605.225.135.435.24.615.314a6.2 6.2 0 0 0 .63.195c.09.015.27.075.42.195a.87.87 0 0 1 .315.585c.015.09.015.18.015.27 0 .405-.225.735-.675.975-.555.3-1.29.45-1.635.525-.06.015-.12.03-.195.045-.09.015-.195.045-.3.075-.195.06-.42.175-.465.36-.03.135-.045.27-.075.42-.03.18-.105.375-.27.525-.225.195-.54.24-.885.24-.21 0-.45-.03-.69-.06a7.76 7.76 0 0 0-.57-.06c-.21-.015-.39-.015-.585.015-.375.06-.72.225-1.11.42-.525.27-1.125.57-1.965.57h-.03c-.84 0-1.44-.3-1.965-.57-.39-.195-.735-.36-1.11-.42a3.286 3.286 0 0 0-.585-.015c-.18.015-.39.03-.57.06-.24.03-.48.06-.69.06-.39 0-.72-.06-.9-.255-.135-.135-.21-.315-.255-.48-.03-.135-.045-.255-.075-.39-.045-.195-.27-.315-.465-.375a3.2 3.2 0 0 0-.3-.075c-.075-.015-.15-.03-.195-.045-.345-.075-1.08-.225-1.635-.525-.45-.24-.675-.57-.675-.975 0-.09 0-.18.015-.27a.87.87 0 0 1 .315-.585c.15-.12.33-.18.42-.195a6.2 6.2 0 0 0 .63-.195c.18-.075.39-.18.615-.314.675-.42 1.095-.975 1.215-1.605.03-.135.03-.375-.015-.555-.135-.345-.435-.51-.705-.6a3.775 3.775 0 0 0-.231-.073l-.118-.036c-.2-.06-.39-.135-.57-.225-.12-.06-.24-.12-.345-.195-.33-.225-.6-.48-.69-.855a1.186 1.186 0 0 1-.045-.36c0-.36.165-.735.54-.975.195-.12.42-.18.614-.18.195 0 .435.06.614.18.301.195.66.3.96.315.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.86 1.069 11.216.793 12.206.793z"/></svg>}
                            </span>
                          )}
                          {p.label}
                          {safeZone === p.id && <Check className="w-4 h-4 ml-auto" />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resize handle */}
        {!isTimelineMinimized && (
          <div
            className="h-2 bg-card border-t border-foreground/[0.08] flex items-center justify-center cursor-row-resize hover:bg-foreground/[0.04] transition-colors group shrink-0"
            onMouseDown={(e) => {
              e.preventDefault();
              timelineResizeRef.current = { startY: e.clientY, startH: timelineHeight };
              const onMove = (ev: MouseEvent) => {
                if (!timelineResizeRef.current) return;
                const delta = timelineResizeRef.current.startY - ev.clientY;
                setTimelineHeight(Math.max(120, Math.min(600, timelineResizeRef.current.startH + delta)));
              };
              const onUp = () => {
                timelineResizeRef.current = null;
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          >
            <GripHorizontal className="w-5 h-3.5 text-muted/40 group-hover:text-muted transition-colors" />
          </div>
        )}

        {/* Timeline */}
        <div className="bg-card flex flex-col shrink-0 transition-all" style={{ height: isTimelineMinimized ? 48 : timelineHeight }}>
          {/* Timeline toolbar */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2 border-b border-foreground/[0.06] shrink-0">
            {/* Left tools */}
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild>
                <button onClick={handleUndo} disabled={undoStack.length === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-sm font-medium transition-colors ${undoStack.length === 0 ? "text-muted/40" : "text-muted hover:bg-foreground/[0.08]"}`}>
                  <Undo2 className="w-4 h-4" />Undo
                </button>
              </TooltipTrigger><TooltipContent>Undo (Ctrl+Z)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={handleRedo} disabled={redoStack.length === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-sm font-medium transition-colors ${redoStack.length === 0 ? "text-muted/40" : "text-muted hover:bg-foreground/[0.08]"}`}>
                  <Redo2 className="w-4 h-4" />Redo
                </button>
              </TooltipTrigger><TooltipContent>Redo (Ctrl+Y)</TooltipContent></Tooltip>
              <div className="w-px h-6 bg-foreground/[0.08] mx-2" />
              <Tooltip><TooltipTrigger asChild>
                <button onClick={handleSplit} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><Scissors className="w-5 h-5" /></button>
              </TooltipTrigger><TooltipContent>Split (S)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => { setSnapEnabled(!snapEnabled); toast({ title: snapEnabled ? "Snap disabled" : "Snap enabled" }); }}
                  className={`p-2 rounded-lg transition-colors ${snapEnabled ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  <Magnet className="w-5 h-5" />
                </button>
              </TooltipTrigger><TooltipContent>{snapEnabled ? "Disable Snap" : "Enable Snap"}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={handleAddMarker} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><Diamond className="w-5 h-5" /></button>
              </TooltipTrigger><TooltipContent>Add Marker (M)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => setIsLooping(!isLooping)}
                  className={`p-2 rounded-lg transition-colors ${isLooping ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  <Repeat className="w-5 h-5" />
                </button>
              </TooltipTrigger><TooltipContent>{isLooping ? "Disable Loop" : "Enable Loop"}</TooltipContent></Tooltip>
            </div>

            {/* Center transport */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleRecord}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${isRecording ? "bg-red-700 animate-pulse" : "bg-red-600 hover:bg-red-700"}`}>
                <Circle className={`w-3 h-3 fill-current`} />{isRecording ? "Stop" : "Record"}
              </button>
              <button onClick={() => setCurrentTime(0)} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={togglePlay} className="w-12 h-12 flex items-center justify-center bg-emerald-500 rounded-full hover:bg-emerald-600 transition-colors text-white shadow-lg">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <span className="text-sm font-mono text-muted min-w-[120px]">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            {/* Right: zoom + hide timeline */}
            <div className="flex items-center gap-2 justify-end">
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => { setIsMuted(!isMuted); if (videoRef.current) videoRef.current.muted = !isMuted; }}
                  className={`p-2 rounded-lg transition-colors ${isMuted ? "text-accent" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </TooltipTrigger><TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent></Tooltip>
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted"><ZoomOut className="w-5 h-5" /></button>
              <input type="range" min={0.5} max={6} step={0.25} value={zoom} onChange={e => setZoom(Number(e.target.value))}
                className="w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-foreground/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent" />
              <button onClick={() => setZoom(Math.min(6, zoom + 0.5))} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted"><ZoomIn className="w-5 h-5" /></button>
              <div className="w-px h-6 bg-foreground/[0.08] mx-1" />
              <Tooltip><TooltipTrigger asChild>
                <button className="px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-sm font-medium text-muted hover:bg-foreground/[0.08] transition-colors">Fit</button>
              </TooltipTrigger><TooltipContent>Fit to View</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => setIsTimelineMinimized(!isTimelineMinimized)} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted">
                  <ChevronDown className={`w-5 h-5 transition-transform ${isTimelineMinimized ? "rotate-180" : ""}`} />
                </button>
              </TooltipTrigger><TooltipContent>{isTimelineMinimized ? "Show Timeline" : "Hide Timeline"}</TooltipContent></Tooltip>
            </div>
          </div>

          {/* Timeline tracks */}
          {!isTimelineMinimized && (
            <div className="flex-1 overflow-auto flex flex-col">
              {/* View mode buttons - always visible */}
              <div className="h-7 flex items-center gap-1 px-3 border-b border-foreground/[0.06] shrink-0">
                <Tooltip><TooltipTrigger asChild>
                  <button onClick={handleAddTrack} className="p-0.5 text-muted hover:text-foreground transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                </TooltipTrigger><TooltipContent>Add Track</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild>
                  <button onClick={() => setTimelineViewMode('timeline')} className={`p-0.5 rounded transition-colors ${timelineViewMode === 'timeline' ? 'bg-foreground/[0.1] text-foreground' : 'text-muted hover:text-foreground'}`}><Rows3 className="w-3.5 h-3.5" /></button>
                </TooltipTrigger><TooltipContent>Timeline</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild>
                  <button onClick={() => setTimelineViewMode('storyboard')} className={`p-0.5 rounded transition-colors ${timelineViewMode === 'storyboard' ? 'bg-foreground/[0.1] text-foreground' : 'text-muted hover:text-foreground'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
                </TooltipTrigger><TooltipContent>Scenes</TooltipContent></Tooltip>
              </div>

              {/* Storyboard View */}
              {timelineViewMode === "storyboard" ? (
                <div className="flex-1 overflow-auto p-4">
                  <div className="flex flex-wrap items-center gap-y-4">
                    {scenes.map((clip, index) => {
                      const isSelected = selectedClip === clip.id;
                      const isCurrent = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
                      return (
                        <React.Fragment key={clip.id}>
                          <div className="flex items-center">
                            <div
                              onClick={() => { setSelectedClip(clip.id); setCurrentTime(clip.startTime); }}
                              className={`relative w-32 h-20 rounded-lg overflow-hidden cursor-pointer transition-all group ${
                                isSelected ? "ring-2 ring-accent shadow-lg scale-105"
                                  : isCurrent ? "ring-2 ring-accent/50"
                                  : "hover:ring-2 hover:ring-foreground/20"
                              }`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-foreground/20 to-foreground/30 flex items-center justify-center">
                                <Video className="w-6 h-6 text-muted/50" />
                              </div>
                              {isCurrent && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/20">
                                  <div className="h-full bg-accent transition-all" style={{ width: `${((currentTime - clip.startTime) / clip.duration) * 100}%` }} />
                                </div>
                              )}
                              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-foreground/70 backdrop-blur-sm rounded text-[10px] text-background font-mono">
                                {clip.duration.toFixed(1)}s
                              </div>
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-background truncate">{clip.name}</p>
                              </div>
                              {/* Delete button on hover */}
                              {scenes.length > 1 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteScene(clip.id); }}
                                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive/80 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Scene</TooltipContent>
                                </Tooltip>
                              )}
                              {/* Duplicate button on hover */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); duplicateScene(clip.id); }}
                                    className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-foreground/60 backdrop-blur-sm text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/80"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Duplicate Scene</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>

                          {/* Gap action icons between scenes */}
                          {index < scenes.length - 1 && (
                            <div
                              className="relative flex items-center justify-center mx-1 group/gap"
                              onMouseEnter={() => setHoveredSceneGap(index)}
                              onMouseLeave={() => setHoveredSceneGap(null)}
                            >
                              <div className={`w-4 h-4 rounded-full bg-foreground/[0.08] hover:bg-foreground/[0.15] transition-all cursor-pointer flex items-center justify-center ${hoveredSceneGap === index ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                              </div>
                              <AnimatePresence>
                                {hoveredSceneGap === index && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute flex flex-col items-center gap-1 z-10"
                                  >
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button onClick={(e) => { e.stopPropagation(); insertSceneAtIndex(index + 1); }}
                                          className="w-7 h-7 rounded-full bg-background shadow-lg border border-foreground/[0.1] flex items-center justify-center hover:bg-foreground/[0.04] hover:scale-110 transition-all">
                                          <Plus className="w-4 h-4 text-foreground" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Insert Scene</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button className="w-7 h-7 rounded-full bg-background shadow-lg border border-foreground/[0.1] flex items-center justify-center hover:bg-foreground/[0.04] hover:scale-110 transition-all">
                                          <ArrowLeftRight className="w-4 h-4 text-foreground" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">Add Transition</TooltipContent>
                                    </Tooltip>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* Dot before add scene */}
                    <div className="flex items-center justify-center mx-1">
                      <div className="w-4 h-4 rounded-full bg-foreground/[0.08] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                      </div>
                    </div>

                    {/* Add scene button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div onClick={addSceneAtEnd}
                          className="w-32 h-20 rounded-lg border-2 border-dashed border-foreground/[0.12] flex items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group ml-1">
                          <Plus className="w-6 h-6 text-muted group-hover:text-accent transition-colors" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Add New Scene</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-full">
                  {/* Track labels */}
                  <div className="w-44 shrink-0 border-r border-foreground/[0.06]">
                    {/* Add Scene button — aligned with ruler */}
                    <div className="h-6 border-b border-foreground/[0.06] flex items-center px-2">
                      <button onClick={() => insertSceneAtIndex(scenes.length)}
                        className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors">
                        <div className="w-5 h-5 border border-dashed border-foreground/[0.2] rounded-md flex items-center justify-center hover:border-accent hover:bg-accent/5 transition-all">
                          <Plus className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-medium">Add Scene</span>
                      </button>
                    </div>
                    {tracks.map((track, trackIndex) => (
                      <div key={track.id} className="h-14 flex items-center gap-1 px-2 border-b border-foreground/[0.04] group">
                        <GripVertical className="w-3 h-3 text-muted/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs font-medium text-muted w-4 text-center shrink-0">{track.name}</span>
                        <Tooltip><TooltipTrigger asChild>
                          <div className={`w-7 h-7 rounded-md bg-foreground/[0.04] flex items-center justify-center shrink-0 ${track.locked ? "opacity-50" : ""}`}>
                            {track.type === "video" ? <Video className="w-3.5 h-3.5 text-accent" /> : <Volume2 className="w-3.5 h-3.5 text-purple-500" />}
                          </div>
                        </TooltipTrigger><TooltipContent>{track.name}</TooltipContent></Tooltip>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Tooltip><TooltipTrigger asChild>
                            <button onClick={() => toggleTrackMute(track.id)} className={`p-1 rounded transition-colors ${track.muted ? "text-accent" : "text-muted/50 hover:text-muted"}`}>
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </TooltipTrigger><TooltipContent>{track.muted ? "Unmute" : "Mute"}</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <button onClick={() => toggleTrackLock(track.id)} className={`p-1 rounded transition-colors ${track.locked ? "text-amber-500" : "text-muted/50 hover:text-muted"}`}>
                              {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            </button>
                          </TooltipTrigger><TooltipContent>{track.locked ? "Unlock" : "Lock"}</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <button onClick={() => toggleTrackVisibility(track.id)} className={`p-1 rounded transition-colors ${!track.visible ? "text-muted/30" : "text-muted/50 hover:text-muted"}`}>
                              {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                          </TooltipTrigger><TooltipContent>{track.visible ? "Hide" : "Show"}</TooltipContent></Tooltip>
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded text-muted/50 hover:text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-3 h-3" />
                                  </button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Track Options</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => {
                                const newTrack = { ...track, id: `track-${Date.now()}`, name: `${track.name} Copy`, clips: track.clips.map(c => ({ ...c, id: `clip-${Date.now()}-${Math.random()}` })) };
                                setTracks(prev => [...prev.slice(0, trackIndex + 1), newTrack, ...prev.slice(trackIndex + 1)]);
                              }}>
                                <Copy className="w-3.5 h-3.5 mr-2" />Duplicate Track
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, clips: [] } : t))}>
                                <Scissors className="w-3.5 h-3.5 mr-2" />Clear Clips
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-3.5 h-3.5 mr-2" />Delete Track
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline clips */}
                  <div className="flex-1 relative min-h-full"
                    ref={(el) => { (window as any).__timelineEl = el; }}
                    onMouseDown={(e) => {
                      // Click on ruler area (top 24px) to seek
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      if (y <= 24) {
                        const x = e.clientX - rect.left;
                        const newTime = Math.max(0, Math.min(duration, x / pixelsPerSecond));
                        setCurrentTime(newTime);
                        setIsPlaying(false);
                        // Start dragging
                        const onMove = (ev: MouseEvent) => {
                          const mx = ev.clientX - rect.left;
                          setCurrentTime(Math.max(0, Math.min(duration, mx / pixelsPerSecond)));
                        };
                        const onUp = () => {
                          window.removeEventListener("mousemove", onMove);
                          window.removeEventListener("mouseup", onUp);
                        };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                      }
                    }}
                  >
                    {/* Playhead - draggable */}
                    <div
                      className="absolute top-0 bottom-0 z-10 cursor-col-resize"
                      style={{ left: playheadPosition - 6, width: 12 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsPlaying(false);
                        const container = (window as any).__timelineEl as HTMLDivElement;
                        if (!container) return;
                        const rect = container.getBoundingClientRect();
                        const onMove = (ev: MouseEvent) => {
                          const x = ev.clientX - rect.left;
                          setCurrentTime(Math.max(0, Math.min(duration, x / pixelsPerSecond)));
                        };
                        const onUp = () => {
                          window.removeEventListener("mousemove", onMove);
                          window.removeEventListener("mouseup", onUp);
                        };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                      }}
                    >
                      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-accent pointer-events-none" />
                      <div className="absolute left-1/2 -translate-x-1/2 -top-1" style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid hsl(var(--accent))" }} />
                    </div>

                    {/* Markers */}
                    {markers.map((markerTime, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-[5] cursor-pointer hover:bg-amber-300"
                            style={{ left: markerTime * pixelsPerSecond }}
                            onClick={() => setCurrentTime(markerTime)}
                          >
                            <Flag className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 text-amber-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Marker at {formatTime(markerTime)}</TooltipContent>
                      </Tooltip>
                    ))}

                    {/* Time ruler - clickable */}
                    <div className="h-6 border-b border-foreground/[0.06] flex items-end relative cursor-pointer">
                      {Array.from({ length: Math.ceil(duration / 10) + 1 }, (_, i) => (
                        <div key={i} className="absolute" style={{ left: i * 10 * pixelsPerSecond }}>
                          <div className="w-px h-2 bg-foreground/[0.1]" />
                          <span className="text-[9px] text-foreground ml-1 select-none">{formatTimeColon(i * 10)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Track rows */}
                    {tracks.map(track => (
                      <div key={track.id} className="h-14 relative border-b border-foreground/[0.04]">
                        {track.clips.length === 0 && !track.locked ? (
                          /* Empty track — Add Scene or Upload */
                          <div className="absolute top-1.5 left-4 h-11 flex items-center gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                                  <div className="w-10 h-10 border-2 border-dashed border-foreground/[0.15] rounded-full flex items-center justify-center hover:border-accent hover:bg-accent/5 transition-all">
                                    <Upload className="w-4 h-4 text-muted" />
                                  </div>
                                  <span className="text-xs text-muted font-medium">Upload</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Upload Media</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button onClick={() => {
                                  const newClip: TimelineClip = { id: `clip-${Date.now()}`, type: track.type, name: `Scene 1`, startTime: 0, duration: 5 };
                                  setTracks(prev => prev.map(t => t.id === track.id ? { ...t, clips: [...t.clips, newClip] } : t));
                                  toast({ title: "Scene added" });
                                }} className="flex items-center gap-2">
                                  <div className="w-10 h-10 border-2 border-dashed border-foreground/[0.15] rounded-full flex items-center justify-center hover:border-accent hover:bg-accent/5 transition-all">
                                    <Plus className="w-4 h-4 text-muted" />
                                  </div>
                                  <span className="text-xs text-muted font-medium">Add Scene</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Add Empty Scene</TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <>
                            {track.clips.map(clip => {
                              const clipWidth = clip.duration * pixelsPerSecond;
                              const vol = clip.volume ?? 100;
                              return (
                                <div key={clip.id}
                                  className={`absolute top-1.5 h-11 ${clip.color || "bg-blue-500"} rounded-lg cursor-grab active:cursor-grabbing hover:brightness-110 transition-all overflow-hidden group/clip ${track.locked ? "opacity-60 pointer-events-none" : ""} ${selectedClip === clip.id ? "ring-2 ring-accent ring-offset-1 z-10" : ""}`}
                                  style={{ left: clip.startTime * pixelsPerSecond, width: clipWidth }}
                                  onMouseDown={(e) => { if (e.button === 0) handleClipMouseDown(e, clip.id, track.id, "move"); }}
                                  onClick={(e) => { e.stopPropagation(); setSelectedClip(clip.id); }}
                                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setClipContextMenu({ clipId: clip.id, trackId: track.id, x: e.clientX, y: e.clientY }); }}
                                >
                                  {/* Left resize handle */}
                                  <div className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/20 z-10 group-hover/clip:bg-white/10 transition-colors rounded-l-lg"
                                    onMouseDown={(e) => handleClipMouseDown(e, clip.id, track.id, "resize-left")} />

                                  {/* Clip content */}
                                  <div className="flex items-center h-full px-3 gap-1.5 min-w-0 relative">
                                    {/* Video thumbnail background */}
                                    {clip.thumbnail && (
                                      <img src={clip.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 rounded-lg" />
                                    )}
                                    {/* Mini waveform for audio clips */}
                                    {(clip.type === "audio") && clipWidth > 60 && (
                                      <div className="flex items-center gap-[1px] h-5 opacity-40 shrink-0">
                                        {Array.from({ length: Math.min(20, Math.floor(clipWidth / 4)) }, (_, i) => (
                                          <div key={i} className="w-[2px] rounded-full bg-white" style={{ height: `${30 + Math.sin(i * 0.8) * 40 + Math.random() * 20}%` }} />
                                        ))}
                                      </div>
                                    )}
                                    <span className="text-[10px] text-white font-medium truncate relative z-[1]">{clip.name}</span>
                                    {clipWidth > 80 && (
                                      <span className="text-[8px] text-white/50 font-mono shrink-0 relative z-[1]">{formatTime(clip.duration)}</span>
                                    )}
                                    {clip.mediaUrl && <Film className="w-3 h-3 text-white/60 shrink-0 relative z-[1]" />}
                                  </div>

                                  {/* Volume indicator line */}
                                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20">
                                    <div className="h-full bg-white/40 transition-all" style={{ width: `${vol}%` }} />
                                  </div>

                                  {/* Right resize handle */}
                                  <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/20 z-10 group-hover/clip:bg-white/10 transition-colors rounded-r-lg"
                                    onMouseDown={(e) => handleClipMouseDown(e, clip.id, track.id, "resize-right")} />
                                </div>
                              );
                            })}
                            {/* Add clip button after last clip */}
                            {!track.locked && (
                              <button className="absolute top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity"
                                style={{ left: (track.clips.length > 0 ? track.clips[track.clips.length - 1].startTime + track.clips[track.clips.length - 1].duration : 0) * pixelsPerSecond + 8 }}>
                                <div className="w-7 h-7 border-2 border-dashed border-foreground/[0.15] rounded-full flex items-center justify-center hover:border-foreground/[0.3] transition-colors">
                                  <Plus className="w-3 h-3 text-muted" />
                                </div>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Clip context menu */}
      {clipContextMenu && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setClipContextMenu(null)} />
          <div className="fixed z-[61] bg-card rounded-xl border border-foreground/[0.08] shadow-xl py-1.5 w-48"
            style={{ left: clipContextMenu.x, top: clipContextMenu.y }}>
            {(() => {
              const clip = tracks.flatMap(t => t.clips).find(c => c.id === clipContextMenu.clipId);
              const vol = clip?.volume ?? 100;
              return (
                <>
                  <button onClick={() => { handleSplit(); setClipContextMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-foreground/[0.04] transition-colors">
                    <Scissors className="w-3.5 h-3.5 text-muted" />Split at Playhead
                  </button>
                  <button onClick={() => { if (clip) duplicateScene(clip.id); setClipContextMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-foreground/[0.04] transition-colors">
                    <Copy className="w-3.5 h-3.5 text-muted" />Duplicate
                  </button>
                  <div className="border-t border-foreground/[0.06] my-1" />
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-muted flex items-center gap-1.5">
                        <Volume2 className="w-3 h-3" />Volume
                      </span>
                      <span className="text-[10px] font-mono text-muted">{vol}%</span>
                    </div>
                    <input type="range" min="0" max="200" value={vol}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleClipVolumeChange(clipContextMenu.clipId, Number(e.target.value))}
                      className="w-full h-1.5 accent-accent cursor-pointer" />
                  </div>
                  <div className="border-t border-foreground/[0.06] my-1" />
                  <button onClick={() => { if (clip) { pushUndo(); setTracks(prev => prev.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== clip.id) }))); setSelectedClip(null); toast({ title: "Clip deleted" }); } setClipContextMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/[0.06] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />Delete
                  </button>
                </>
              );
            })()}
          </div>
        </>
      )}
      <RecordingModeModal
        open={showRecordingModal}
        onClose={() => setShowRecordingModal(false)}
        editorType="video"
        onRecordingComplete={(mode, duration) => {
          handleAddTrack();
          toast({ title: `${mode} recording added`, description: `${duration}s clip added to timeline` });
        }}
      />
    </div>
  );
};

export default VideoEditor;
