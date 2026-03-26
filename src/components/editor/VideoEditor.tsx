import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Link, Hash, Clock, Heart, Box, X as XIcon,
} from "lucide-react";
import AIToolsPanel from "./AIToolsPanel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Types ─── */
interface TimelineClip {
  id: string; type: "video" | "audio" | "text" | "effect"; name: string;
  startTime: number; duration: number; color?: string;
}
interface TimelineTrack {
  id: string; type: "video" | "audio" | "text" | "effect"; name: string;
  clips: TimelineClip[]; muted?: boolean; locked?: boolean; visible?: boolean;
}

/* ─── Tab Configs ─── */
type LeftTab = "ai-chat" | "storyboard" | "character" | "visuals" | "audio" | "text" | "effects" | "templates" | "settings";

const LEFT_TABS: { id: LeftTab; icon: typeof FileText; label: string }[] = [
  { id: "ai-chat", icon: MessageSquare, label: "AI Chat" },
  { id: "storyboard", icon: BookOpen, label: "Storyboard" },
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

const VideoEditor = ({ video }: Props) => {
  const [activeTab, setActiveTab] = useState<LeftTab>("ai-chat");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(596);
  const [zoom, setZoom] = useState(3);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [timelineViewMode, setTimelineViewMode] = useState<"timeline" | "storyboard">("timeline");
  const [isMuted, setIsMuted] = useState(false);
  const [captionSearch, setCaptionSearch] = useState("");
  
  const [audioSubTab, setAudioSubTab] = useState("Voices");
  const [visualsSubTab, setVisualsSubTab] = useState("Videos");
  const [templateSearch, setTemplateSearch] = useState("");
  const [scriptContent, setScriptContent] = useState(
    "I'm going to tell you something shocking."
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  // New feature state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
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
  const [effectsSubTab, setEffectsSubTab] = useState<"effects" | "transitions" | "elements">("effects");
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "brand" | "languages" | "ai-tools">("general");

  // Toolbar state
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [markers, setMarkers] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [undoStack, setUndoStack] = useState<TimelineTrack[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineTrack[][]>([]);

  const [isStreaming, setIsStreaming] = useState(false);

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
      setIsRecording(true);
      toast({ title: "Recording started", description: "Recording your screen..." });
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
    <div className="h-full flex overflow-hidden bg-background">
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
                <div className="flex flex-col h-full min-h-[400px]">
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

              {/* Storyboard Sub-Tab Nav */}
              {activeTab === "storyboard" && (
                <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                  {([{id:"scenes",label:"Scenes"},{id:"script",label:"Script"},{id:"brief",label:"Brief"}] as const).map(sub => (
                    <button key={sub.id} onClick={() => setStoryboardSubTab(sub.id)}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${storyboardSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                  ))}
                </div>
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

              {/* Text Sub-Tab Nav */}
              {activeTab === "text" && (
                <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                  {([{id:"text",label:"Text"},{id:"captions",label:"Captions"}] as const).map(sub => (
                    <button key={sub.id} onClick={() => setTextSubTab(sub.id)}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${textSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                  ))}
                </div>
              )}
              {activeTab === "text" && textSubTab === "text" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold">Text</h3>
                  {["Heading", "Subheading", "Body Text", "Caption", "Lower Third", "Title Card"].map(preset => (
                    <button key={preset} onClick={() => toast({ title: `${preset} added to timeline` })}
                      className="w-full p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 text-left transition-all group">
                      <span className={`text-foreground font-medium ${preset === "Heading" ? "text-xl" : preset === "Subheading" ? "text-base" : "text-sm"}`}>{preset}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Captions */}
              {activeTab === "text" && textSubTab === "captions" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Captions</h3>
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><Copy className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Copy All</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><Download className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Download SRT</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><SlidersHorizontal className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Settings</TooltipContent></Tooltip>
                  </div>
                  <div className="border-t border-foreground/[0.06] pt-4" />
                  <div className="space-y-4">
                    {filteredCaptions.map((cap, i) => (
                      <div key={i} className="flex items-start gap-3 group cursor-pointer hover:bg-foreground/[0.03] rounded-lg p-2 -mx-2 transition-colors">
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/15 text-emerald-600 text-xs font-mono font-medium rounded-md shrink-0 mt-0.5">{cap.time}</span>
                        <span className="text-sm text-foreground leading-relaxed">{cap.text}</span>
                      </div>
                    ))}
                  </div>
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
                  {([{id:"general",label:"General"},{id:"brand",label:"Brand"},{id:"languages",label:"Languages"},{id:"ai-tools",label:"AI Tools"}] as const).map(sub => (
                    <button key={sub.id} onClick={() => setSettingsSubTab(sub.id)}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${settingsSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                  ))}
                </div>
              )}
              {/* AI Tools */}
              {activeTab === "settings" && settingsSubTab === "ai-tools" && (
                <AIToolsPanel onAssetCreated={(url, type) => {
                  toast({ title: "Asset added", description: `New ${type} asset is ready to use in your project.` });
                }} />
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

              {/* Settings Tab */}
              {activeTab === "settings" && (
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
              <div className="rounded-xl border-2 border-accent/30 bg-background overflow-hidden">
                {/* Textarea with content type icon + auto-prompt */}
                <div className="relative">
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <button onClick={() => setIsContentTypeOpen(!isContentTypeOpen)} className="p-1 transition hover:opacity-70">
                      {promptContentType === "video" ? <Video className="w-5 h-5 text-accent" /> : promptContentType === "audio" ? <AudioLines className="w-5 h-5 text-emerald-500" /> : <Image className="w-5 h-5 text-blue-500" />}
                    </button>
                    <Tooltip><TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (!chatInput.trim()) return;
                          setIsEnhancing(true);
                          setTimeout(() => { setChatInput(prev => prev + " — cinematic lighting, dramatic composition"); setIsEnhancing(false); }, 1200);
                        }}
                        disabled={isEnhancing}
                        className="p-1 transition hover:opacity-70 disabled:opacity-50"
                      >
                        {isEnhancing ? <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /> : <Shuffle className="w-5 h-5 text-emerald-500" />}
                      </button>
                    </TooltipTrigger><TooltipContent>Auto Prompt</TooltipContent></Tooltip>
                  </div>

                  {/* Content type dropdown */}
                  {isContentTypeOpen && (
                    <div className="absolute top-12 left-3 bg-foreground text-background rounded-xl shadow-lg p-2 z-50 min-w-[140px]">
                      {([
                        { id: "video" as const, icon: Video, label: "Video" },
                        { id: "audio" as const, icon: AudioLines, label: "Audio" },
                        { id: "image" as const, icon: Image, label: "Image" },
                      ]).map(t => (
                        <button key={t.id} onClick={() => { setPromptContentType(t.id); setIsContentTypeOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${promptContentType === t.id ? "text-background" : "text-background/60 hover:text-background"}`}>
                          <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                    placeholder={promptContentType === "video" ? "Describe the video you want to create..." : promptContentType === "audio" ? "Describe your sound, music, or voiceover..." : "Describe the image you want to generate..."}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted bg-transparent resize-none focus:outline-none"
                  />
                </div>

                {/* Bottom toolbar */}
                <div className="flex flex-wrap items-center gap-y-2 px-3 pb-2.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Content Type Pill */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                      promptContentType === "video" ? "bg-accent/15 text-accent" : promptContentType === "audio" ? "bg-emerald-500/15 text-emerald-600" : "bg-blue-500/15 text-blue-600"
                    }`}>
                      {promptContentType === "video" ? <Video className="w-3.5 h-3.5" /> : promptContentType === "audio" ? <AudioLines className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
                      {promptContentType.charAt(0).toUpperCase() + promptContentType.slice(1)}
                      <button onClick={() => setPromptContentType("video")} className="ml-0.5 hover:opacity-70"><XIcon className="w-3 h-3" /></button>
                    </div>

                    <div className="w-px h-5 bg-foreground/[0.1] mx-1" />

                    {/* Mode-specific toolbar icons */}
                    {promptContentType === "video" ? (
                      <>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Box className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Tools</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><User className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Character</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Link className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Reference</TooltipContent></Tooltip>
                        <Popover>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-1"><Copy className="w-4 h-4" /><span className="text-[10px] font-medium">{promptAspectRatio}</span></button></PopoverTrigger></TooltipTrigger><TooltipContent>Ratio</TooltipContent></Tooltip>
                          <PopoverContent className="w-44 p-1.5" align="start">
                            {["16:9", "9:16", "1:1", "4:3"].map(r => (
                              <button key={r} onClick={() => setPromptAspectRatio(r)} className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${promptAspectRatio === r ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>{r}{promptAspectRatio === r && <Check className="w-3 h-3 inline ml-auto float-right mt-0.5" />}</button>
                            ))}
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-1"><Clock className="w-4 h-4" /><span className="text-[10px] font-medium">{promptDuration}s</span></button></PopoverTrigger></TooltipTrigger><TooltipContent>Duration</TooltipContent></Tooltip>
                          <PopoverContent className="w-40 p-1.5" align="start">
                            {["5", "10", "15", "25", "30"].map(d => (
                              <button key={d} onClick={() => setPromptDuration(d)} className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${promptDuration === d ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>{d}s</button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    ) : promptContentType === "image" ? (
                      <>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-1"><Box className="w-4 h-4" /><span className="text-[10px] font-medium">Auto</span></button></TooltipTrigger><TooltipContent>Tools</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><User className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Character</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Link className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Reference</TooltipContent></Tooltip>
                        <Popover>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-1"><Copy className="w-4 h-4" /><span className="text-[10px] font-medium">{promptAspectRatio}</span></button></PopoverTrigger></TooltipTrigger><TooltipContent>Ratio</TooltipContent></Tooltip>
                          <PopoverContent className="w-44 p-1.5" align="start">
                            {["1:1", "16:9", "9:16", "4:3", "3:4"].map(r => (
                              <button key={r} onClick={() => setPromptAspectRatio(r)} className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${promptAspectRatio === r ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>{r}</button>
                            ))}
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-1"><Hash className="w-4 h-4" /><span className="text-[10px] font-medium">{promptImageCount}</span></button></PopoverTrigger></TooltipTrigger><TooltipContent>Number</TooltipContent></Tooltip>
                          <PopoverContent className="w-40 p-1.5" align="start">
                            {[1, 2, 3, 4].map(n => (
                              <button key={n} onClick={() => setPromptImageCount(n)} className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${promptImageCount === n ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>{n} Image{n > 1 ? "s" : ""}</button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </>
                    ) : (
                      <>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Box className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Tools</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Mic className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Voice</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Heart className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Emotion</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Sparkles className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Effects</TooltipContent></Tooltip>
                      </>
                    )}
                  </div>

                  {/* Right side: Agent dropdown + Send */}
                  <div className="flex items-center gap-2 ml-auto">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground transition-colors hover:bg-foreground/[0.04]">
                          <Sparkles className="w-4 h-4" />
                          Agent
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-52 p-1.5" align="end">
                        <p className="px-3 py-1.5 text-xs font-medium text-muted">Enhance Prompt</p>
                        <button onClick={() => { if (!chatInput.trim()) return; setIsEnhancing(true); setTimeout(() => { setChatInput(prev => prev + " — quick enhancement"); setIsEnhancing(false); }, 800); }}
                          className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Enhance
                        </button>
                        <button onClick={() => { if (!chatInput.trim()) return; setIsEnhancing(true); setTimeout(() => { setChatInput(prev => prev + " — cinematic, detailed, high quality"); setIsEnhancing(false); }, 1500); }}
                          className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Deep Enhance
                        </button>
                        <div className="border-t border-foreground/[0.06] my-1" />
                        <p className="px-3 py-1.5 text-xs font-medium text-muted">Agent Mode</p>
                        {["Auto", "Creative", "Precise", "Balanced"].map(m => (
                          <button key={m} className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04]">{m}</button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    <button onClick={handleSendChat} disabled={isStreaming || !chatInput.trim()}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${chatInput.trim() && !isStreaming ? "bg-accent text-white hover:bg-accent/90" : "bg-accent/20 text-accent/50"}`}>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      {/* Collapse toggle */}
      <div className="flex items-center shrink-0">
        <Tooltip><TooltipTrigger asChild>
          <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            className="flex items-center justify-center w-5 h-12 bg-card hover:bg-foreground/[0.06] rounded-r-md border border-l-0 border-foreground/[0.08] transition-colors">
            {isLeftPanelCollapsed ? <ChevronRight className="w-4 h-4 text-muted" /> : <ChevronLeft className="w-4 h-4 text-muted" />}
          </button>
        </TooltipTrigger><TooltipContent side="right">{isLeftPanelCollapsed ? "Show Panel" : "Hide Panel"}</TooltipContent></Tooltip>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Video Canvas */}
        <div className="flex-1 bg-foreground/[0.03] flex items-center justify-center relative overflow-hidden min-h-0">
          <div className="video-canvas-container relative bg-black rounded-xl overflow-hidden shadow-2xl" style={{ width: "80%", maxWidth: 800, aspectRatio: selectedRatio === "9:16" ? "9/16" : selectedRatio === "1:1" ? "1/1" : "16/9" }}>
            {video ? (
              <video ref={videoRef} src={video} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white/40">
                  <Video className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Drop media or add from panel</p>
                </div>
              </div>
            )}
          </div>

          {/* Canvas overlay controls - centered bottom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg border border-foreground/[0.08]">
            <button onClick={() => { setIsMuted(!isMuted); if (videoRef.current) videoRef.current.muted = !isMuted; }} className="p-2 rounded-full text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 rounded-full text-xs font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />Ratio: {selectedRatio}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1.5" align="center">
                {["16:9", "9:16", "1:1", "4:5", "4:3"].map(r => (
                  <button key={r} onClick={() => setSelectedRatio(r)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedRatio === r ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04]"}`}>
                    {r}{selectedRatio === r && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <button onClick={() => { const el = document.querySelector('.video-canvas-container'); if (el) { if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen(); } }} className="p-2 rounded-full text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className={`bg-card border-t border-foreground/[0.08] flex flex-col ${isTimelineMinimized ? "h-12" : "h-64"} transition-all`}>
          {/* Timeline toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/[0.06] shrink-0">
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

              {/* Record */}
              <button onClick={handleRecord}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${isRecording ? "bg-red-700 animate-pulse" : "bg-red-600 hover:bg-red-700"}`}>
                <Circle className={`w-3 h-3 ${isRecording ? "fill-current" : "fill-current"}`} />{isRecording ? "Stop" : "Record"}
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
            <div className="flex items-center gap-2">
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
                  <div className="flex-1 relative"
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
                      <div className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-3 h-3 bg-accent rounded-b-sm rotate-45 pointer-events-none" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
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
                          <span className="text-[9px] text-muted/50 ml-1 select-none">{formatTimeColon(i * 10)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Track rows */}
                    {tracks.map(track => (
                      <div key={track.id} className="h-14 relative border-b border-foreground/[0.04]">
                        {track.clips.map(clip => (
                          <div key={clip.id}
                            onClick={() => setSelectedClip(clip.id)}
                            className={`absolute top-1.5 h-11 ${clip.color || "bg-blue-500"} rounded-lg cursor-pointer hover:brightness-110 transition-all flex items-center px-2 gap-1.5 overflow-hidden ${track.locked ? "opacity-60" : ""} ${selectedClip === clip.id ? "ring-2 ring-accent ring-offset-1" : ""}`}
                            style={{ left: clip.startTime * pixelsPerSecond, width: clip.duration * pixelsPerSecond }}>
                            <span className="text-[10px] text-white font-medium truncate">{clip.name}</span>
                          </div>
                        ))}
                        {/* Add clip button */}
                        {!track.locked && (
                          <button className="absolute top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity"
                            style={{ left: (track.clips.length > 0 ? track.clips[track.clips.length - 1].startTime + track.clips[track.clips.length - 1].duration : 0) * pixelsPerSecond + 8 }}>
                            <div className="w-7 h-7 border-2 border-dashed border-foreground/[0.15] rounded-full flex items-center justify-center hover:border-foreground/[0.3] transition-colors">
                              <Plus className="w-3 h-3 text-muted" />
                            </div>
                          </button>
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
    </div>
  );
};

export default VideoEditor;
