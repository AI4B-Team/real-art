import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import emptyAudioCards from "@/assets/empty-audio-cards.png";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Scissors, Undo2, Redo2, ZoomIn, ZoomOut, Plus, Upload,
  Music, Sparkles, Settings, ChevronDown, ChevronLeft,
  Trash2, Check, Search, Copy, Download, Mic, MicOff,
  Wand2, SlidersHorizontal, Layers, LayoutGrid,
  AudioLines, Send, MessageSquare, RefreshCw,
  Palette, Heart, Zap, FileText, Clock, Hash,
  Film, Loader2, Shuffle, Type, BookOpen,
  X as XIcon, Languages, GripVertical, GripHorizontal,
  Image, Video, ArrowRight, FolderOpen,
  Repeat, BarChart3, Headphones, Magnet, Diamond, Circle,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import RecordingModeModal from "./RecordingModeModal";

/* ─── Types ─── */
type LeftTab = "ai-chat" | "tracks" | "voice" | "music" | "effects" | "text" | "templates" | "settings";

const LEFT_TABS: { id: LeftTab; icon: typeof Music; label: string }[] = [
  { id: "ai-chat", icon: MessageSquare, label: "AI Chat" },
  { id: "tracks", icon: Layers, label: "Tracks" },
  { id: "voice", icon: Mic, label: "Voice" },
  { id: "music", icon: Music, label: "Music" },
  { id: "effects", icon: Sparkles, label: "Effects" },
  { id: "text", icon: Type, label: "Text To Speech" },
  { id: "templates", icon: LayoutGrid, label: "Templates" },
  { id: "settings", icon: Settings, label: "Settings" },
];

interface AudioTrack {
  id: string;
  name: string;
  type: "voice" | "music" | "sfx" | "recorded" | "imported";
  duration: number;
  startTime: number;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  locked: boolean;
}

interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

interface ChatMessage { role: "user" | "assistant"; content: string; }

interface SharedAsset {
  id: string;
  name: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnail?: string;
}

const VOICE_PRESETS = [
  { name: "Maya", desc: "Feminine, warm, conversational", color: "bg-emerald-500", lang: "English" },
  { name: "Arjun", desc: "Masculine, deep, authoritative", color: "bg-blue-500", lang: "English" },
  { name: "Sophia", desc: "Feminine, mature, soothing", color: "bg-purple-500", lang: "English" },
  { name: "Kai", desc: "Non-binary, energetic, youthful", color: "bg-amber-500", lang: "English" },
  { name: "Liam", desc: "Masculine, friendly, narrator", color: "bg-rose-500", lang: "English" },
  { name: "Yuki", desc: "Feminine, soft, calm", color: "bg-cyan-500", lang: "Japanese" },
  { name: "Carlos", desc: "Masculine, passionate, expressive", color: "bg-orange-500", lang: "Spanish" },
  { name: "Amélie", desc: "Feminine, elegant, clear", color: "bg-pink-500", lang: "French" },
];

const MUSIC_LIBRARY = [
  { name: "Upbeat Corporate", genre: "Corporate", duration: "2:30", bpm: 120, key: "C Major" },
  { name: "Cinematic Tension", genre: "Film", duration: "3:15", bpm: 90, key: "D Minor" },
  { name: "Lo-fi Chill", genre: "Lo-fi", duration: "4:00", bpm: 85, key: "G Major" },
  { name: "Epic Orchestral", genre: "Orchestral", duration: "2:45", bpm: 140, key: "E Minor" },
  { name: "Ambient Nature", genre: "Ambient", duration: "5:00", bpm: 70, key: "A Minor" },
  { name: "Pop Energy", genre: "Pop", duration: "3:30", bpm: 128, key: "F Major" },
  { name: "Dark Trap Beat", genre: "Hip-Hop", duration: "2:50", bpm: 145, key: "B Minor" },
  { name: "Acoustic Guitar", genre: "Folk", duration: "3:20", bpm: 100, key: "D Major" },
  { name: "Jazz Lounge", genre: "Jazz", duration: "4:30", bpm: 110, key: "Bb Major" },
  { name: "EDM Drop", genre: "Electronic", duration: "3:00", bpm: 150, key: "A Minor" },
];

const SFX_LIBRARY = [
  { name: "Whoosh", category: "Transition", duration: "0:02" },
  { name: "Click", category: "UI", duration: "0:01" },
  { name: "Pop", category: "UI", duration: "0:01" },
  { name: "Swoosh", category: "Transition", duration: "0:02" },
  { name: "Notification", category: "Alert", duration: "0:02" },
  { name: "Rain", category: "Ambient", duration: "Loop" },
  { name: "Thunder", category: "Ambient", duration: "0:04" },
  { name: "Applause", category: "Crowd", duration: "0:08" },
  { name: "Typing", category: "Foley", duration: "Loop" },
  { name: "Door Close", category: "Foley", duration: "0:02" },
  { name: "Footsteps", category: "Foley", duration: "0:05" },
  { name: "Glass Break", category: "Impact", duration: "0:03" },
];

const AUDIO_EFFECTS = [
  { name: "Reverb", desc: "Add space and depth", params: ["Room Size", "Decay", "Mix"] },
  { name: "Echo", desc: "Repeating delay effect", params: ["Delay", "Feedback", "Mix"] },
  { name: "Noise Reduction", desc: "Clean up background noise", params: ["Strength", "Sensitivity"] },
  { name: "Compression", desc: "Even out volume levels", params: ["Threshold", "Ratio", "Attack"] },
  { name: "EQ", desc: "Adjust frequency balance", params: ["Bass", "Mid", "Treble"] },
  { name: "Pitch Shift", desc: "Change pitch without speed", params: ["Semitones", "Fine Tune"] },
  { name: "Fade In/Out", desc: "Gradual volume transitions", params: ["Duration", "Curve"] },
  { name: "Normalize", desc: "Maximize overall volume", params: ["Target dB"] },
  { name: "Bass Boost", desc: "Enhance low frequencies", params: ["Amount", "Frequency"] },
  { name: "Vocal Isolate", desc: "Extract or remove vocals", params: ["Mode"] },
  { name: "Chorus", desc: "Thicken and widen sound", params: ["Rate", "Depth", "Mix"] },
  { name: "Distortion", desc: "Add grit and edge", params: ["Drive", "Tone"] },
];

const ALL_AI_SUGGESTIONS = [
  "🎵 Generate background music for a podcast",
  "🎙️ Create a voiceover for a product demo",
  "🔊 Mix audio tracks for a video",
  "🎶 Compose a jingle for my brand",
  "🗣️ Clone my voice for narration",
  "🎧 Remove background noise from recording",
  "🎼 Create a soundtrack for my short film",
  "🔉 Master this audio for streaming platforms",
  "🎹 Generate ambient music for meditation",
];

const TRACK_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500"];

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 100);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
};

const formatTimeShort = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

interface Props {
  audio?: string;
  onSendToEditor?: (asset: SharedAsset, target: "image" | "video") => void;
}

const AudioEditor = ({ audio, onSendToEditor }: Props) => {
  const [activeTab, setActiveTab] = useState<LeftTab>("ai-chat");
  const [musicSubTab, setMusicSubTab] = useState<"music" | "sfx">("music");
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "ai-tools">("general");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [zoom, setZoom] = useState(3);
  const [isLooping, setIsLooping] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(208);
  const timelineResizeRef = useRef<{ startY: number; startH: number } | null>(null);
  const [showSpectral, setShowSpectral] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestionOffset, setSuggestionOffset] = useState(0);
  const visibleSuggestions = ALL_AI_SUGGESTIONS.slice(suggestionOffset, suggestionOffset + 3);

  // Tracks
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [draggingTrack, setDraggingTrack] = useState<string | null>(null);

  // Markers
  const [markers, setMarkers] = useState<Marker[]>([
    { id: "m1", time: 0, label: "Intro", color: "bg-blue-400" },
    { id: "m2", time: 60, label: "Verse", color: "bg-emerald-400" },
    { id: "m3", time: 120, label: "Outro", color: "bg-rose-400" },
  ]);

  // Undo/Redo
  const [history, setHistory] = useState<AudioTrack[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Export settings
  const [exportFormat, setExportFormat] = useState("MP3");
  const [exportQuality, setExportQuality] = useState("320kbps");
  const [exportSampleRate, setExportSampleRate] = useState("48kHz");

  // TTS settings
  const [ttsText, setTtsText] = useState("");
  const [ttsVoice, setTtsVoice] = useState("Maya");
  const [ttsSpeed, setTtsSpeed] = useState("1x");

  // Settings
  const [sampleRate, setSampleRate] = useState("48 kHz");
  const [bitDepth, setBitDepth] = useState("24-bit");
  const [channels, setChannels] = useState("Stereo");
  const [bpm, setBpm] = useState(120);
  const [clickTrack, setClickTrack] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  // Music filters
  const [musicGenre, setMusicGenre] = useState("All");
  const [sfxCategory, setSfxCategory] = useState("All");

  // Waveform bars (memoized to prevent re-randomize on every render)
  const waveformBars = useMemo(() =>
    Array.from({ length: 200 }, (_, i) => 20 + Math.sin(i * 0.3) * 30 + Math.random() * 40),
  []);

  // Spectral bars
  const spectralBars = useMemo(() =>
    Array.from({ length: 64 }, () => Array.from({ length: 32 }, () => Math.random())),
  []);

  // Playback
  const playbackRef = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);
  useEffect(() => {
    if (isPlaying) {
      const step = (timestamp: number) => {
        if (lastTimestamp.current === null) lastTimestamp.current = timestamp;
        const delta = (timestamp - lastTimestamp.current) / 1000;
        lastTimestamp.current = timestamp;
        setCurrentTime(prev => {
          const next = prev + delta;
          if (next >= duration) {
            if (isLooping) return 0;
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
        playbackRef.current = requestAnimationFrame(step);
      };
      playbackRef.current = requestAnimationFrame(step);
    } else {
      lastTimestamp.current = null;
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
    }
    return () => { if (playbackRef.current) cancelAnimationFrame(playbackRef.current); };
  }, [isPlaying, duration, isLooping]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 0.1), 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), tracks]);
    setHistoryIndex(prev => prev + 1);
  }, [tracks, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTracks(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTracks(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim() || isStreaming) return;
    setChatMessages(prev => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    setIsStreaming(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I'll help you with that audio task. Let me process your request and apply the changes to your timeline..." }]);
      setIsStreaming(false);
    }, 1500);
  }, [chatInput, isStreaming]);

  const addTrack = useCallback((name: string, type: AudioTrack["type"], dur: number, start = 0) => {
    pushHistory();
    const newTrack: AudioTrack = {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      type,
      duration: dur,
      startTime: start,
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      muted: false,
      solo: false,
      volume: 100,
      pan: 0,
      locked: false,
    };
    setTracks(prev => [...prev, newTrack]);
    toast({ title: `${name} added to timeline` });
  }, [tracks.length, pushHistory]);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingTime(0);
    toast({ title: "Recording started..." });
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    addTrack(`Recording ${tracks.filter(t => t.type === "recorded").length + 1}`, "recorded", Math.max(5, recordingTime), currentTime);
  }, [addTrack, tracks, recordingTime, currentTime]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith("audio/")) {
        addTrack(file.name, "imported", 60, 0);
      } else if (file.type.startsWith("image/")) {
        toast({ title: `Image "${file.name}" — switch to Image editor to use` });
      } else if (file.type.startsWith("video/")) {
        toast({ title: `Video "${file.name}" — switch to Video editor to use` });
      }
    });
  }, [addTrack]);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) Array.from(files).forEach(file => addTrack(file.name, "imported", 60, 0));
    };
    input.click();
  }, [addTrack]);

  const handleSendToEditor = useCallback((target: "image" | "video") => {
    if (onSendToEditor) {
      onSendToEditor({
        id: `audio-${Date.now()}`,
        name: "Audio Export",
        type: "audio",
        url: "",
      }, target);
    }
    toast({ title: `Audio sent to ${target === "image" ? "Image" : "Video"} editor` });
  }, [onSendToEditor]);

  const handleWaveformClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setCurrentTime(x * duration);
  }, [duration]);

  const addMarker = useCallback(() => {
    const newMarker: Marker = {
      id: `m-${Date.now()}`,
      time: currentTime,
      label: `Marker ${markers.length + 1}`,
      color: TRACK_COLORS[markers.length % TRACK_COLORS.length].replace("bg-", "bg-"),
    };
    setMarkers(prev => [...prev, newMarker]);
    toast({ title: `Marker added at ${formatTimeShort(currentTime)}` });
  }, [currentTime, markers.length]);

  const hasSolo = tracks.some(t => t.solo);

  const filteredMusic = musicGenre === "All" ? MUSIC_LIBRARY : MUSIC_LIBRARY.filter(m => m.genre === musicGenre);
  const filteredSfx = sfxCategory === "All" ? SFX_LIBRARY : SFX_LIBRARY.filter(s => s.category === sfxCategory);

  return (
    <div className="flex h-full overflow-hidden bg-background relative"
      onDragOver={e => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleFileDrop}
    >
      {/* Drag overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-accent/10 border-2 border-dashed border-accent rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Upload className="w-12 h-12 text-accent mx-auto mb-3" />
            <p className="text-lg font-bold text-accent">Drop Audio Files Here</p>
            <p className="text-sm text-muted mt-1">MP3, WAV, FLAC, AAC, OGG</p>
          </div>
        </div>
      )}

      {/* Left Panel */}
      {!isLeftPanelCollapsed && (
        <div className="w-[420px] shrink-0 border-r border-foreground/[0.06] flex flex-col bg-background">
          {/* Tab icons */}
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

          {/* Search */}
          {["music", "effects", "templates"].includes(activeTab) && (
            <div className="px-4 pt-4 pb-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" placeholder={`Search ${activeTab}...`} className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">

            {/* AI Chat */}
            {activeTab === "ai-chat" && (
              <div className="flex flex-col h-full min-h-[400px]">
                {chatMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Audio Studio</h3>
                    <p className="text-2xl font-black tracking-tight mb-6">What Audio Are<br />We Creating?</p>
                    <div className="space-y-2 w-full">
                      {visibleSuggestions.map(s => (
                        <button key={s} onClick={() => setChatInput(s)}
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
                          msg.role === "user" ? "bg-foreground/[0.06] text-foreground rounded-br-md" : "bg-transparent text-foreground"
                        }`}>{msg.content}</div>
                      </div>
                    ))}
                    {isStreaming && (
                      <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl text-sm"><span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" /></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tracks */}
            {activeTab === "tracks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Tracks</h3>
                  <span className="text-[10px] text-muted font-medium">{tracks.length} tracks</span>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <button onClick={handleFileUpload}
                    className="flex-1 py-2.5 bg-foreground text-background rounded-lg text-xs font-medium flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />Import
                  </button>
                  <button onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      isRecording ? "bg-red-500 text-white animate-pulse" : "bg-foreground/[0.06] hover:bg-foreground/[0.1]"
                    }`}>
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isRecording ? `Stop (${formatTimeShort(recordingTime)})` : "Record"}
                  </button>
                </div>

                {/* Send to other editors */}
                <div className="flex gap-2">
                  <button onClick={() => handleSendToEditor("video")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] hover:border-accent/40 text-xs font-medium transition-colors">
                    <Video className="w-3.5 h-3.5 text-accent" /><ArrowRight className="w-3 h-3 text-muted" />Send To Video
                  </button>
                  <button onClick={() => handleSendToEditor("image")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] hover:border-accent/40 text-xs font-medium transition-colors">
                    <Image className="w-3.5 h-3.5 text-accent" /><ArrowRight className="w-3 h-3 text-muted" />Send To Image
                  </button>
                </div>

                {/* Track list */}
                <div className="space-y-2">
                  {tracks.map((track, idx) => (
                    <div key={track.id}
                      draggable
                      onDragStart={() => setDraggingTrack(track.id)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => {
                        if (draggingTrack && draggingTrack !== track.id) {
                          setTracks(prev => {
                            const arr = [...prev];
                            const fromIdx = arr.findIndex(t => t.id === draggingTrack);
                            const toIdx = arr.findIndex(t => t.id === track.id);
                            const [moved] = arr.splice(fromIdx, 1);
                            arr.splice(toIdx, 0, moved);
                            return arr;
                          });
                        }
                        setDraggingTrack(null);
                      }}
                      onClick={() => setSelectedTrack(track.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                        selectedTrack === track.id ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                      } ${draggingTrack === track.id ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2.5">
                        <GripVertical className="w-3.5 h-3.5 text-muted/40 cursor-grab shrink-0" />
                        <div className={`w-7 h-7 ${track.color} rounded-lg flex items-center justify-center shrink-0`}>
                          {track.type === "voice" || track.type === "recorded" ? <Mic className="w-3.5 h-3.5 text-white" /> :
                           track.type === "music" ? <Music className="w-3.5 h-3.5 text-white" /> :
                           track.type === "imported" ? <FolderOpen className="w-3.5 h-3.5 text-white" /> :
                           <Zap className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.name}</p>
                          <p className="text-[10px] text-muted">{formatTimeShort(track.duration)} · {track.type}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button onClick={e => { e.stopPropagation(); pushHistory(); setTracks(prev => prev.map(t => t.id === track.id ? { ...t, solo: !t.solo } : t)); }}
                            className={`w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${track.solo ? "bg-amber-500 text-white" : "text-muted hover:text-foreground"}`}>S</button>
                          <button onClick={e => { e.stopPropagation(); pushHistory(); setTracks(prev => prev.map(t => t.id === track.id ? { ...t, muted: !t.muted } : t)); }}
                            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${track.muted ? "text-red-400" : "text-muted hover:text-foreground"}`}>
                            {track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={e => { e.stopPropagation(); pushHistory(); setTracks(prev => prev.filter(t => t.id !== track.id)); }}
                            className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {/* Volume slider */}
                      {selectedTrack === track.id && (
                        <div className="mt-3 pt-3 border-t border-foreground/[0.06] space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted w-8">Vol</span>
                            <input type="range" min={0} max={100} value={track.volume}
                              onChange={e => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, volume: Number(e.target.value) } : t))}
                              className="flex-1 h-1.5 accent-accent" />
                            <span className="text-[10px] text-muted w-8 text-right">{track.volume}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted w-8">Pan</span>
                            <input type="range" min={-100} max={100} value={track.pan}
                              onChange={e => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, pan: Number(e.target.value) } : t))}
                              className="flex-1 h-1.5 accent-accent" />
                            <span className="text-[10px] text-muted w-8 text-right">{track.pan > 0 ? `R${track.pan}` : track.pan < 0 ? `L${Math.abs(track.pan)}` : "C"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={() => { pushHistory(); addTrack(`Track ${tracks.length + 1}`, "voice", 30, 0); }}
                  className="w-full py-3 border-2 border-dashed border-foreground/[0.1] rounded-xl text-sm text-muted hover:text-foreground hover:border-foreground/[0.2] transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Track
                </button>
              </div>
            )}

            {/* Voice */}
            {activeTab === "voice" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Voice</h3>
                <div className="flex gap-2">
                  <button onClick={handleFileUpload} className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-medium flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />Upload
                  </button>
                  <button onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isRecording ? "bg-red-500 text-white" : "bg-foreground/[0.06] hover:bg-foreground/[0.1]"
                    }`}>
                    <Mic className="w-3.5 h-3.5" />{isRecording ? "Stop" : "Record"}
                  </button>
                  <button onClick={() => toast({ title: "Voice cloning — upload a sample to start" })}
                    className="px-4 py-2 bg-foreground/[0.06] rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-foreground/[0.1] transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />Clone
                  </button>
                </div>
                <div className="space-y-2">
                  {VOICE_PRESETS.map(voice => (
                    <div key={voice.name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer group">
                      <button className={`w-10 h-10 ${voice.color} rounded-full flex items-center justify-center shrink-0`}>
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{voice.name}</p>
                        <p className="text-xs text-muted">{voice.desc} · {voice.lang}</p>
                      </div>
                      <button onClick={() => { addTrack(`${voice.name} Voice`, "voice", 30, currentTime); }}
                        className="p-1.5 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Music Sub-Tab Nav */}
            {activeTab === "music" && (
              <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                {([{id:"music",label:"Music"},{id:"sfx",label:"Sound FX"}] as const).map(sub => (
                  <button key={sub.id} onClick={() => setMusicSubTab(sub.id)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${musicSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                ))}
              </div>
            )}
            {activeTab === "music" && musicSubTab === "music" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Music Library</h3>
                <div className="flex gap-2 flex-wrap">
                  {["All", "Corporate", "Film", "Lo-fi", "Pop", "Ambient", "Hip-Hop", "Folk", "Jazz", "Electronic"].map(g => (
                    <button key={g} onClick={() => setMusicGenre(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${musicGenre === g ? "bg-foreground text-background" : "bg-foreground/[0.04] hover:bg-foreground/[0.08]"}`}>{g}</button>
                  ))}
                </div>
                <button onClick={() => toast({ title: "AI generating custom music..." })}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-accent/[0.08] border border-accent/[0.15] hover:bg-accent/[0.12] transition-colors text-left">
                  <Sparkles className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Generate With AI</p>
                    <p className="text-xs text-muted">Describe the mood and get custom music</p>
                  </div>
                </button>
                <div className="space-y-2">
                  {filteredMusic.map(track => (
                    <div key={track.name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Play className="w-4 h-4 text-emerald-500 ml-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.name}</p>
                        <p className="text-[10px] text-muted">{track.genre} · {track.duration} · {track.bpm} BPM · {track.key}</p>
                      </div>
                      <button onClick={() => addTrack(track.name, "music", parseInt(track.duration) * 60, 0)}
                        className="p-1.5 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sound FX */}
            {activeTab === "music" && musicSubTab === "sfx" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Sound Effects</h3>
                <div className="flex gap-2 flex-wrap">
                  {["All", "Transition", "UI", "Ambient", "Crowd", "Foley", "Impact"].map(c => (
                    <button key={c} onClick={() => setSfxCategory(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sfxCategory === c ? "bg-foreground text-background" : "bg-foreground/[0.04] hover:bg-foreground/[0.08]"}`}>{c}</button>
                  ))}
                </div>
                <div className="space-y-2">
                  {filteredSfx.map(sfx => (
                    <div key={sfx.name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Play className="w-4 h-4 text-amber-500 ml-0.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{sfx.name}</p>
                        <p className="text-[10px] text-muted">{sfx.category} · {sfx.duration}</p>
                      </div>
                      <button onClick={() => addTrack(sfx.name, "sfx", 3, currentTime)}
                        className="p-1.5 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Effects */}
            {activeTab === "effects" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Audio Effects</h3>
                <div className="space-y-2">
                  {AUDIO_EFFECTS.map(fx => (
                    <div key={fx.name}>
                      <button onClick={() => setSelectedEffect(selectedEffect === fx.name ? null : fx.name)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border transition-all text-left ${
                          selectedEffect === fx.name ? "border-accent bg-accent/5" : "border-foreground/[0.06] hover:border-accent/40"
                        }`}>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{fx.name}</p>
                          <p className="text-xs text-muted">{fx.desc}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${selectedEffect === fx.name ? "rotate-180" : ""}`} />
                      </button>
                      {selectedEffect === fx.name && (
                        <div className="mt-2 ml-2 p-3 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06] space-y-3">
                          {fx.params.map(param => (
                            <div key={param} className="flex items-center gap-2">
                              <span className="text-[10px] text-muted w-16 shrink-0">{param}</span>
                              <input type="range" min={0} max={100} defaultValue={50} className="flex-1 h-1.5 accent-accent" />
                              <span className="text-[10px] text-muted w-8 text-right">50%</span>
                            </div>
                          ))}
                          <button onClick={() => toast({ title: `${fx.name} applied to selected track` })}
                            className="w-full py-2 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors">
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text to Speech */}
            {activeTab === "text" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Text To Speech</h3>
                <textarea value={ttsText} onChange={e => setTtsText(e.target.value)}
                  placeholder="Type or paste text to convert to speech..."
                  rows={5} className="w-full px-4 py-3 text-sm bg-foreground/[0.04] border border-foreground/[0.08] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/20" />
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Voice</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {VOICE_PRESETS.slice(0, 6).map(v => (
                      <button key={v.name} onClick={() => setTtsVoice(v.name)}
                        className={`p-2.5 rounded-xl border text-center text-sm font-medium transition-colors ${
                          ttsVoice === v.name ? "border-accent bg-accent/10 text-accent" : "border-foreground/[0.08] hover:border-accent/40"
                        }`}>{v.name}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Speed</h4>
                  <div className="flex gap-2">
                    {["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"].map(s => (
                      <button key={s} onClick={() => setTtsSpeed(s)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                          ttsSpeed === s ? "border-accent bg-accent/10 text-accent" : "border-foreground/[0.08] hover:border-accent/40"
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Emotion</h4>
                  <div className="flex gap-2 flex-wrap">
                    {["Neutral", "Happy", "Sad", "Excited", "Calm", "Serious"].map(e => (
                      <button key={e} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-colors">{e}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { toast({ title: "Generating speech..." }); if (ttsText.trim()) addTrack(`TTS — ${ttsVoice}`, "voice", 30, currentTime); }}
                  disabled={!ttsText.trim()}
                  className="w-full py-3 bg-accent text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <AudioLines className="w-4 h-4" /> Generate Speech
                </button>
              </div>
            )}

            {/* Templates */}
            {activeTab === "templates" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Templates</h3>
                {[
                  { name: "Podcast Intro", desc: "Professional intro with music bed", tracks: 3 },
                  { name: "Ad Spot (30s)", desc: "Radio-style ad with voiceover", tracks: 2 },
                  { name: "Meditation", desc: "Calm narration with ambient background", tracks: 3 },
                  { name: "Audiobook Chapter", desc: "Clean narration with chapter markers", tracks: 1 },
                  { name: "Sound Design", desc: "Layered effects and foley", tracks: 5 },
                  { name: "Music Mix", desc: "Multi-track music arrangement", tracks: 8 },
                  { name: "Interview", desc: "Two speakers with intro/outro", tracks: 4 },
                  { name: "Jingle (15s)", desc: "Short brand audio logo", tracks: 3 },
                ].map(t => (
                  <button key={t.name} onClick={() => toast({ title: `${t.name} template loaded` })}
                    className="w-full p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 text-left transition-all">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted mt-0.5">{t.desc} · {t.tracks} tracks</p>
                  </button>
                ))}
              </div>
            )}

            {/* Settings Sub-Tab Nav */}
            {activeTab === "settings" && (
              <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                {([{id:"general",label:"General"},{id:"ai-tools",label:"AI Tools"}] as const).map(sub => (
                  <button key={sub.id} onClick={() => setSettingsSubTab(sub.id)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${settingsSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                ))}
              </div>
            )}
            {activeTab === "settings" && settingsSubTab === "ai-tools" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">AI Tools</h3>
                {[
                  { name: "Noise Reduction", desc: "AI-powered background noise removal", icon: Sparkles },
                  { name: "Vocal Isolator", desc: "Separate vocals from instruments", icon: Mic },
                  { name: "Stem Splitter", desc: "Split into drums, bass, vocals, other", icon: Layers },
                  { name: "Auto Master", desc: "AI mastering for broadcast-ready audio", icon: Wand2 },
                  { name: "Silence Remover", desc: "Trim dead air and long pauses", icon: Scissors },
                  { name: "Audio Enhance", desc: "Improve clarity and quality", icon: Zap },
                  { name: "Transcribe", desc: "Convert speech to text", icon: FileText },
                  { name: "Language Translate", desc: "Translate and re-dub in another language", icon: Languages },
                  { name: "Beat Match", desc: "Align tracks to tempo grid", icon: Hash },
                  { name: "Auto EQ", desc: "AI-optimized frequency balance", icon: SlidersHorizontal },
                  { name: "Clone Voice", desc: "Clone a voice from a sample", icon: Copy },
                  { name: "Audio Repair", desc: "Fix clipping, distortion, and artifacts", icon: Wand2 },
                ].map(tool => (
                  <button key={tool.name} onClick={() => toast({ title: `${tool.name} processing...` })}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 text-left transition-all">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center shrink-0">
                      <tool.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-muted">{tool.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Settings General */}
            {activeTab === "settings" && settingsSubTab === "general" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Settings</h3>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Project</h4>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Sample Rate</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-sm text-muted flex items-center gap-1 hover:text-foreground transition-colors">{sampleRate}<ChevronDown className="w-3 h-3" /></button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1.5" align="end">
                        {["22.05 kHz", "44.1 kHz", "48 kHz", "96 kHz"].map(r => (
                          <button key={r} onClick={() => setSampleRate(r)} className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04]">{r}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Bit Depth</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-sm text-muted flex items-center gap-1 hover:text-foreground transition-colors">{bitDepth}<ChevronDown className="w-3 h-3" /></button>
                      </PopoverTrigger>
                      <PopoverContent className="w-32 p-1.5" align="end">
                        {["16-bit", "24-bit", "32-bit float"].map(b => (
                          <button key={b} onClick={() => setBitDepth(b)} className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04]">{b}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Channels</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-sm text-muted flex items-center gap-1 hover:text-foreground transition-colors">{channels}<ChevronDown className="w-3 h-3" /></button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1.5" align="end">
                        {["Mono", "Stereo", "5.1 Surround"].map(c => (
                          <button key={c} onClick={() => setChannels(c)} className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04]">{c}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Metronome</h4>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">BPM</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setBpm(prev => Math.max(40, prev - 1))} className="w-6 h-6 rounded bg-foreground/[0.06] flex items-center justify-center text-muted hover:text-foreground">-</button>
                      <span className="text-sm font-medium w-8 text-center">{bpm}</span>
                      <button onClick={() => setBpm(prev => Math.min(240, prev + 1))} className="w-6 h-6 rounded bg-foreground/[0.06] flex items-center justify-center text-muted hover:text-foreground">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Click Track</span>
                    <button onClick={() => setClickTrack(!clickTrack)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${clickTrack ? "bg-accent" : "bg-foreground/[0.1]"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${clickTrack ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Timeline</h4>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Snap To Grid</span>
                    <button onClick={() => setSnapToGrid(!snapToGrid)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${snapToGrid ? "bg-accent" : "bg-foreground/[0.1]"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${snapToGrid ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Auto-Scroll</span>
                    <button onClick={() => setAutoScroll(!autoScroll)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${autoScroll ? "bg-accent" : "bg-foreground/[0.1]"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${autoScroll ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom prompt */}
          <div className="p-3 border-t border-foreground/[0.06] shrink-0">
            <div className="rounded-xl border-2 border-accent/30 bg-background overflow-hidden">
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                placeholder="Describe what you want to create..."
                rows={2}
                className="w-full px-4 py-3 text-sm text-foreground placeholder:text-muted bg-transparent resize-none focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-y-2 px-3 pb-2.5">
                <div className="flex items-center gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-600">
                    <AudioLines className="w-3.5 h-3.5" />Audio
                    <button className="ml-0.5 hover:opacity-70"><XIcon className="w-3 h-3" /></button>
                  </div>
                  <div className="w-px h-5 bg-foreground/[0.1] mx-1" />
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Mic className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Voice</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Heart className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Emotion</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Sparkles className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Effects</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Music className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Music Style</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Upload className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Upload</TooltipContent></Tooltip>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground transition-colors hover:bg-foreground/[0.04]">
                        <Sparkles className="w-4 h-4" />Agent<ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-1.5" align="end">
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
      )}

      {/* Collapse toggle — pinned to right edge of left panel */}
      <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
        className="absolute top-1/3 -translate-y-1/2 z-10 w-5 h-10 bg-accent rounded-r-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
        style={{ left: isLeftPanelCollapsed ? 0 : 420 }}>
        <ChevronLeft className={`w-3 h-3 text-white transition-transform ${isLeftPanelCollapsed ? "rotate-180" : ""}`} />
      </button>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Waveform / Canvas area */}
        <div className="flex-1 flex items-center justify-center bg-foreground/[0.02] relative overflow-hidden">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center gap-1 text-center px-6">
              <img src={emptyAudioCards} alt="" className="w-[26rem] h-[26rem] object-contain -mb-4" />
              <p className="text-base font-semibold text-foreground">No Audio Loaded</p>
              <p className="text-sm text-muted mb-3">Record, import, or generate audio to get started</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowRecordingModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors text-sm">
                  <Mic className="w-4 h-4" />Record
                </button>
                <button onClick={() => { pushHistory(); addTrack(`Track ${tracks.length + 1}`, "voice", 30, 0); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-foreground/[0.06] text-foreground rounded-lg font-medium hover:bg-foreground/[0.1] transition-colors text-sm">
                  <Plus className="w-4 h-4" />Add Track
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* View toggle */}
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 bg-background border border-foreground/[0.08] rounded-lg p-1">
            <Tooltip><TooltipTrigger asChild>
              <button onClick={() => setShowSpectral(false)}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${!showSpectral ? "bg-foreground/[0.08] text-foreground" : "text-muted hover:text-foreground"}`}>
                <AudioLines className="w-4 h-4" />
              </button>
            </TooltipTrigger><TooltipContent>Waveform</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <button onClick={() => setShowSpectral(true)}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${showSpectral ? "bg-foreground/[0.08] text-foreground" : "text-muted hover:text-foreground"}`}>
                <BarChart3 className="w-4 h-4" />
              </button>
            </TooltipTrigger><TooltipContent>Spectral</TooltipContent></Tooltip>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-sm font-medium">Recording {formatTimeShort(recordingTime)}</span>
            </div>
          )}

          {/* Waveform / Spectral visualization */}
           <div className="w-full max-w-5xl px-8 pt-4">
            <div className="relative h-56 bg-foreground/[0.03] rounded-2xl border border-foreground/[0.06] cursor-crosshair"
              onClick={handleWaveformClick}>
              {/* Waveform inner with overflow hidden */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
              {!showSpectral ? (
                /* Waveform view */
                <div className="absolute inset-0 flex items-center gap-[1px] px-4">
                  {waveformBars.map((h, i) => {
                    const progress = currentTime / duration;
                    const isPlayed = i / waveformBars.length < progress;
                    return <div key={i} className="flex-1 rounded-full transition-colors" style={{ height: `${h}%`, backgroundColor: isPlayed ? "hsl(var(--accent))" : "hsl(var(--foreground) / 0.1)" }} />;
                  })}
                </div>
              ) : (
                /* Spectral view */
                <div className="absolute inset-0 flex gap-px p-2">
                  {spectralBars.map((col, x) => (
                    <div key={x} className="flex-1 flex flex-col-reverse gap-px">
                      {col.map((val, y) => {
                        const progress = currentTime / duration;
                        const isPlayed = x / spectralBars.length < progress;
                        const intensity = val * (isPlayed ? 1 : 0.3);
                        return <div key={y} className="flex-1 rounded-[1px]" style={{
                          backgroundColor: isPlayed
                            ? `hsl(var(--accent) / ${intensity * 0.8 + 0.1})`
                            : `hsl(var(--foreground) / ${intensity * 0.15})`,
                        }} />;
                      })}
                    </div>
                  ))}
                </div>
              )}
              </div>

              {/* Markers — outside overflow-hidden so badges aren't clipped */}
              {markers.map(marker => (
                <div key={marker.id} className="absolute top-0 bottom-0 z-20" style={{ left: `${(marker.time / duration) * 100}%` }}>
                  <div className={`w-0.5 h-full ${marker.color} opacity-50`} />
                  <div className={`absolute top-1 -translate-x-1/2 px-1.5 py-0.5 ${marker.color} rounded text-[8px] font-medium text-white whitespace-nowrap`}>
                    {marker.label}
                  </div>
                </div>
              ))}

              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-accent z-10" style={{ left: `${(currentTime / duration) * 100}%` }}>
                <div className="absolute left-1/2 -translate-x-1/2 -top-1" style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid hsl(var(--accent))" }} />
              </div>

              {/* Time display */}
              <div className="absolute bottom-3 left-4 text-xs font-mono text-muted">{formatTime(currentTime)}</div>
              <div className="absolute bottom-3 right-4 text-xs font-mono text-muted">{formatTime(duration)}</div>
            </div>
          </div>
          </>
          )}
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

        {/* Transport Controls — matches video timeline style */}
        <div className="bg-card flex flex-col">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2 border-b border-foreground/[0.06] shrink-0">
            {/* Left tools */}
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild>
                <button onClick={undo}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-sm font-medium text-muted hover:bg-foreground/[0.08] transition-colors">
                  <Undo2 className="w-4 h-4" />Undo
                </button>
              </TooltipTrigger><TooltipContent>Undo (Ctrl+Z)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={redo}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-sm font-medium text-muted hover:bg-foreground/[0.08] transition-colors">
                  <Redo2 className="w-4 h-4" />Redo
                </button>
              </TooltipTrigger><TooltipContent>Redo (Ctrl+Y)</TooltipContent></Tooltip>
              <div className="w-px h-6 bg-foreground/[0.08] mx-2" />
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => toast({ title: "Split at playhead" })} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><Scissors className="w-5 h-5" /></button>
              </TooltipTrigger><TooltipContent>Split (S)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => { setSnapEnabled(!snapEnabled); toast({ title: snapEnabled ? "Snap disabled" : "Snap enabled" }); }}
                  className={`p-2 rounded-lg transition-colors ${snapEnabled ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  <Magnet className="w-5 h-5" />
                </button>
              </TooltipTrigger><TooltipContent>{snapEnabled ? "Disable Snap" : "Enable Snap"}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={addMarker} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><Diamond className="w-5 h-5" /></button>
              </TooltipTrigger><TooltipContent>Add Marker (M)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => setIsLooping(!isLooping)}
                  className={`p-2 rounded-lg transition-colors ${isLooping ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  <Repeat className="w-5 h-5" />
                </button>
              </TooltipTrigger><TooltipContent>{isLooping ? "Disable Loop" : "Enable Loop"}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </TooltipTrigger><TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent></Tooltip>
            </div>

            {/* Center transport */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => isRecording ? handleStopRecording() : setShowRecordingModal(true)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${isRecording ? "bg-red-700 animate-pulse" : "bg-red-600 hover:bg-red-700"}`}>
                <Circle className={`w-3 h-3 fill-current`} />{isRecording ? "Stop" : "Record"}
              </button>
              <button onClick={() => setCurrentTime(0)} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 flex items-center justify-center bg-emerald-500 rounded-full hover:bg-emerald-600 transition-colors text-white shadow-lg">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <span className="text-sm font-mono text-muted min-w-[120px]">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            {/* Right: zoom + hide timeline */}
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setZoom(Math.max(1, zoom - 1))} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted"><ZoomOut className="w-5 h-5" /></button>
              <input type="range" min={1} max={10} step={1} value={zoom} onChange={e => setZoom(Number(e.target.value))}
                className="w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-foreground/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent" />
              <button onClick={() => setZoom(Math.min(10, zoom + 1))} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted"><ZoomIn className="w-5 h-5" /></button>
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

        {/* Multi-track timeline */}
        {!isTimelineMinimized && (
        <div className="border-t border-foreground/[0.06] bg-foreground/[0.02] flex flex-col shrink-0" style={{ height: timelineHeight }}>
          {/* Timeline ruler */}
          <div className="h-6 border-b border-foreground/[0.06] flex shrink-0">
            <div className="w-36 shrink-0 border-r border-foreground/[0.06] bg-background flex items-center px-3">
              <span className="text-[9px] font-semibold text-muted uppercase tracking-wider">Tracks</span>
            </div>
            <div className="flex-1 relative">
              {Array.from({ length: Math.ceil(duration / 10) }, (_, i) => (
                <div key={i} className="absolute top-0 bottom-0 border-l border-foreground/[0.06]" style={{ left: `${(i * 10 / duration) * 100}%` }}>
                  <span className="text-[8px] text-muted/50 font-mono ml-1">{formatTimeShort(i * 10)}</span>
                </div>
              ))}
              {/* Playhead on ruler */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-accent z-10" style={{ left: `${(currentTime / duration) * 100}%` }} />
              {/* Markers on ruler */}
              {markers.map(m => (
                <div key={m.id} className="absolute top-0 bottom-0 w-0.5 opacity-40" style={{ left: `${(m.time / duration) * 100}%`, backgroundColor: m.color.includes("blue") ? "#60a5fa" : m.color.includes("emerald") ? "#34d399" : "#fb7185" }} />
              ))}
            </div>
          </div>

          {/* Track rows */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map(track => {
              const isActive = hasSolo ? track.solo : !track.muted;
              return (
                <div key={track.id} className={`flex h-12 border-b border-foreground/[0.04] ${!isActive ? "opacity-30" : ""}`}>
                  {/* Track header */}
                  <div className="w-36 shrink-0 border-r border-foreground/[0.06] flex items-center gap-1.5 px-2 bg-background">
                    <div className={`w-2.5 h-2.5 rounded-full ${track.color} shrink-0`} />
                    <span className="text-[10px] font-medium truncate flex-1">{track.name}</span>
                    <button onClick={() => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, solo: !t.solo } : t))}
                      className={`w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center shrink-0 ${track.solo ? "bg-amber-500 text-white" : "text-muted/50 hover:text-foreground"}`}>S</button>
                    <button onClick={() => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, muted: !t.muted } : t))}
                      className={`shrink-0 ${track.muted ? "text-red-400" : "text-muted/50 hover:text-foreground"}`}>
                      {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                  </div>
                  {/* Track clips */}
                  <div className="flex-1 relative">
                    <div
                      className={`absolute top-1 bottom-1 rounded-lg ${track.color} opacity-30 hover:opacity-50 cursor-pointer transition-opacity`}
                      style={{ left: `${(track.startTime / duration) * 100}%`, width: `${Math.min(100 - (track.startTime / duration) * 100, (track.duration / duration) * 100)}%` }}
                    >
                      {/* Mini waveform inside clip */}
                      <div className="absolute inset-0 flex items-center gap-[1px] px-1 overflow-hidden">
                        {Array.from({ length: 40 }, (_, i) => (
                          <div key={i} className="flex-1 rounded-full bg-foreground/20" style={{ height: `${30 + Math.random() * 50}%` }} />
                        ))}
                      </div>
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-foreground z-10">{track.name}</span>
                    </div>
                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-accent z-10" style={{ left: `${(currentTime / duration) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {/* Add track row */}
            <div className="flex h-10 border-b border-foreground/[0.04]">
              <div className="w-36 shrink-0 border-r border-foreground/[0.06] bg-background flex items-center justify-center">
                <span className="text-[9px] text-muted/40">No tracks</span>
              </div>
              <button onClick={() => { pushHistory(); addTrack(`Track ${tracks.length + 1}`, "voice", 30, 0); }}
                className="flex-1 flex items-center justify-center gap-2 text-muted/40 hover:text-muted transition-colors">
                <Plus className="w-3.5 h-3.5" /><span className="text-[10px]">Add Track</span>
              </button>
            </div>
          </div>
        </div>
        )}
        </div>
      </div>
      <RecordingModeModal
        open={showRecordingModal}
        onClose={() => setShowRecordingModal(false)}
        editorType="audio"
        onRecordingComplete={(mode, duration) => {
          addTrack(`Recording ${tracks.filter(t => t.type === "recorded").length + 1}`, "recorded", duration, currentTime);
        }}
      />
    </div>
  );
};

export default AudioEditor;
