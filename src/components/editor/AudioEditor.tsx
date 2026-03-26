import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Scissors, Undo2, Redo2, ZoomIn, ZoomOut, Plus, Upload,
  Music, Sparkles, Settings, ChevronDown, ChevronLeft,
  Trash2, Check, Search, Copy, Download, Mic,
  Wand2, SlidersHorizontal, Layers, LayoutGrid,
  AudioLines, Send, MessageSquare, RefreshCw,
  Palette, Heart, Zap, FileText, Clock, Hash,
  Film, Loader2, Shuffle, Type, BookOpen,
  X as XIcon, Languages, Captions,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

/* ─── Tab Config ─── */
type LeftTab = "ai-chat" | "tracks" | "voice" | "music" | "sfx" | "effects" | "text" | "templates" | "tools" | "export" | "settings";

const LEFT_TABS: { id: LeftTab; icon: typeof Music; label: string }[] = [
  { id: "ai-chat", icon: MessageSquare, label: "AI Chat" },
  { id: "tracks", icon: Layers, label: "Tracks" },
  { id: "voice", icon: Mic, label: "Voice" },
  { id: "music", icon: Music, label: "Music" },
  { id: "sfx", icon: Zap, label: "Sound FX" },
  { id: "effects", icon: Sparkles, label: "Effects" },
  { id: "text", icon: Type, label: "Text to Speech" },
  { id: "templates", icon: LayoutGrid, label: "Templates" },
  { id: "tools", icon: Wand2, label: "AI Tools" },
  { id: "export", icon: Download, label: "Export" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const VOICE_PRESETS = [
  { name: "Maya", desc: "Feminine, warm, conversational", color: "bg-emerald-500" },
  { name: "Arjun", desc: "Masculine, deep, authoritative", color: "bg-blue-500" },
  { name: "Sophia", desc: "Feminine, mature, soothing", color: "bg-purple-500" },
  { name: "Kai", desc: "Non-binary, energetic, youthful", color: "bg-amber-500" },
  { name: "Liam", desc: "Masculine, friendly, narrator", color: "bg-rose-500" },
];

const MUSIC_LIBRARY = [
  { name: "Upbeat Corporate", genre: "Corporate", duration: "2:30", bpm: 120 },
  { name: "Cinematic Tension", genre: "Film", duration: "3:15", bpm: 90 },
  { name: "Lo-fi Chill", genre: "Lo-fi", duration: "4:00", bpm: 85 },
  { name: "Epic Orchestral", genre: "Orchestral", duration: "2:45", bpm: 140 },
  { name: "Ambient Nature", genre: "Ambient", duration: "5:00", bpm: 70 },
  { name: "Pop Energy", genre: "Pop", duration: "3:30", bpm: 128 },
];

const SFX_LIBRARY = [
  { name: "Whoosh", category: "Transition" },
  { name: "Click", category: "UI" },
  { name: "Pop", category: "UI" },
  { name: "Swoosh", category: "Transition" },
  { name: "Notification", category: "Alert" },
  { name: "Rain", category: "Ambient" },
  { name: "Thunder", category: "Ambient" },
  { name: "Applause", category: "Crowd" },
];

const AUDIO_EFFECTS = [
  { name: "Reverb", desc: "Add space and depth" },
  { name: "Echo", desc: "Repeating delay effect" },
  { name: "Noise Reduction", desc: "Clean up background noise" },
  { name: "Compression", desc: "Even out volume levels" },
  { name: "EQ", desc: "Adjust frequency balance" },
  { name: "Pitch Shift", desc: "Change pitch without speed" },
  { name: "Fade In/Out", desc: "Gradual volume transitions" },
  { name: "Normalize", desc: "Maximize overall volume" },
  { name: "Bass Boost", desc: "Enhance low frequencies" },
  { name: "Vocal Isolate", desc: "Extract or remove vocals" },
];

interface AudioTrack {
  id: string;
  name: string;
  type: "voice" | "music" | "sfx";
  duration: number;
  startTime: number;
  color: string;
  muted: boolean;
  volume: number;
}

const ALL_AI_SUGGESTIONS = [
  "🎵 Generate background music for a podcast",
  "🎙️ Create a voiceover for a product demo",
  "🔊 Mix audio tracks for a video",
  "🎶 Compose a jingle for my brand",
  "🗣️ Clone my voice for narration",
  "🎧 Remove background noise from recording",
];

interface ChatMessage { role: "user" | "assistant"; content: string; }

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

interface Props { audio?: string }

const AudioEditor = ({ audio }: Props) => {
  const [activeTab, setActiveTab] = useState<LeftTab>("ai-chat");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [zoom, setZoom] = useState(3);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestionOffset, setSuggestionOffset] = useState(0);
  const visibleSuggestions = ALL_AI_SUGGESTIONS.slice(suggestionOffset, suggestionOffset + 3);

  // Tracks
  const [tracks, setTracks] = useState<AudioTrack[]>([
    { id: "t1", name: "Voiceover", type: "voice", duration: 120, startTime: 0, color: "bg-blue-500", muted: false, volume: 100 },
    { id: "t2", name: "Background Music", type: "music", duration: 180, startTime: 0, color: "bg-emerald-500", muted: false, volume: 60 },
    { id: "t3", name: "Sound Effects", type: "sfx", duration: 5, startTime: 30, color: "bg-amber-500", muted: false, volume: 80 },
  ]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  // Playback
  const playbackRef = useRef<number | null>(null);
  useEffect(() => {
    if (isPlaying) {
      const step = () => {
        setCurrentTime(prev => { if (prev >= duration) { setIsPlaying(false); return 0; } return prev + 0.05; });
        playbackRef.current = requestAnimationFrame(step);
      };
      playbackRef.current = requestAnimationFrame(step);
    } else if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
    return () => { if (playbackRef.current) cancelAnimationFrame(playbackRef.current); };
  }, [isPlaying, duration]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim() || isStreaming) return;
    setChatMessages(prev => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    setIsStreaming(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I'll help you with that audio task. Let me process your request..." }]);
      setIsStreaming(false);
    }, 1500);
  }, [chatInput, isStreaming]);

  const pixelsPerSecond = zoom * 15;

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Left Panel */}
      {!isLeftPanelCollapsed ? (
        <div className="w-[340px] shrink-0 border-r border-foreground/[0.06] flex flex-col bg-background">
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

          {/* Search for applicable tabs */}
          {["sfx", "music", "effects", "templates", "tools"].includes(activeTab) && (
            <div className="px-4 pt-3 pb-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" placeholder="Search" className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
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
                <h3 className="text-sm font-bold">Tracks</h3>
                <div className="space-y-2">
                  {tracks.map(track => (
                    <div key={track.id} onClick={() => setSelectedTrack(track.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer group ${
                        selectedTrack === track.id ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                      }`}>
                      <div className={`w-8 h-8 ${track.color} rounded-lg flex items-center justify-center`}>
                        {track.type === "voice" ? <Mic className="w-4 h-4 text-white" /> : track.type === "music" ? <Music className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.name}</p>
                        <p className="text-[10px] text-muted">{formatTime(track.duration)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); setTracks(prev => prev.map(t => t.id === track.id ? { ...t, muted: !t.muted } : t)); }}
                          className="p-1 text-muted hover:text-foreground">{track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}</button>
                        <button onClick={e => { e.stopPropagation(); setTracks(prev => prev.filter(t => t.id !== track.id)); }}
                          className="p-1 text-muted hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setTracks(prev => [...prev, { id: `t-${Date.now()}`, name: `Track ${prev.length + 1}`, type: "voice", duration: 30, startTime: 0, color: "bg-purple-500", muted: false, volume: 100 }])}
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
                  <button className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-medium flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />Upload
                  </button>
                  <button className="px-4 py-2 bg-foreground/[0.06] rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-foreground/[0.1] transition-colors">
                    <Mic className="w-3.5 h-3.5" />Record
                  </button>
                  <button className="px-4 py-2 bg-foreground/[0.06] rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-foreground/[0.1] transition-colors">
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
                        <p className="text-xs text-muted">{voice.desc}</p>
                      </div>
                      <button onClick={() => toast({ title: `${voice.name} added to track` })} className="p-1.5 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Music */}
            {activeTab === "music" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Music Library</h3>
                <div className="flex gap-2 flex-wrap">
                  {["All", "Corporate", "Film", "Lo-fi", "Pop", "Ambient"].map(g => (
                    <button key={g} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-colors">{g}</button>
                  ))}
                </div>
                <button onClick={() => toast({ title: "AI generating music..." })}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-accent/[0.08] border border-accent/[0.15] hover:bg-accent/[0.12] transition-colors text-left">
                  <Sparkles className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Generate With AI</p>
                    <p className="text-xs text-muted">Describe the mood and get custom music</p>
                  </div>
                </button>
                <div className="space-y-2">
                  {MUSIC_LIBRARY.map(track => (
                    <div key={track.name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.name}</p>
                        <p className="text-[10px] text-muted">{track.genre} · {track.duration} · {track.bpm} BPM</p>
                      </div>
                      <button onClick={() => toast({ title: `${track.name} added` })} className="p-1.5 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sound FX */}
            {activeTab === "sfx" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Sound Effects</h3>
                <div className="flex gap-2 flex-wrap">
                  {["All", "Transition", "UI", "Ambient", "Crowd"].map(c => (
                    <button key={c} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-colors">{c}</button>
                  ))}
                </div>
                <div className="space-y-2">
                  {SFX_LIBRARY.map(sfx => (
                    <div key={sfx.name} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{sfx.name}</p>
                        <p className="text-[10px] text-muted">{sfx.category}</p>
                      </div>
                      <button onClick={() => toast({ title: `${sfx.name} added` })} className="p-1.5 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
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
                    <button key={fx.name} onClick={() => toast({ title: `${fx.name} applied` })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 transition-all text-left">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{fx.name}</p>
                        <p className="text-xs text-muted">{fx.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text to Speech */}
            {activeTab === "text" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Text To Speech</h3>
                <textarea placeholder="Type or paste text to convert to speech..."
                  rows={5} className="w-full px-4 py-3 text-sm bg-foreground/[0.04] border border-foreground/[0.08] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/20" />
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Voice</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {VOICE_PRESETS.slice(0, 4).map(v => (
                      <button key={v.name} className="p-2.5 rounded-xl border border-foreground/[0.08] hover:border-accent/40 text-center text-sm font-medium transition-colors">{v.name}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Speed</h4>
                  <div className="flex gap-2">
                    {["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"].map(s => (
                      <button key={s} className="flex-1 py-2 rounded-lg border border-foreground/[0.08] hover:border-accent/40 text-xs font-medium transition-colors">{s}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => toast({ title: "Generating speech..." })}
                  className="w-full py-3 bg-accent text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors">
                  <AudioLines className="w-4 h-4" /> Generate Speech
                </button>
              </div>
            )}

            {/* Templates */}
            {activeTab === "templates" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Templates</h3>
                {[
                  { name: "Podcast Intro", desc: "Professional intro with music bed" },
                  { name: "Ad Spot (30s)", desc: "Radio-style ad with voiceover" },
                  { name: "Meditation", desc: "Calm narration with ambient background" },
                  { name: "Audiobook Chapter", desc: "Clean narration with chapter markers" },
                  { name: "Sound Design", desc: "Layered effects and foley" },
                ].map(t => (
                  <button key={t.name} onClick={() => toast({ title: `${t.name} template loaded` })}
                    className="w-full p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 text-left transition-all">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* AI Tools */}
            {activeTab === "tools" && (
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
                ].map(tool => (
                  <button key={tool.name} onClick={() => toast({ title: `${tool.name} started...` })}
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

            {/* Export */}
            {activeTab === "export" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Export</h3>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Format</h4>
                  {[
                    { name: "MP3", desc: "Compressed, universal", recommended: true },
                    { name: "WAV", desc: "Lossless, high quality" },
                    { name: "FLAC", desc: "Lossless, compressed" },
                    { name: "AAC", desc: "High quality, smaller size" },
                    { name: "OGG", desc: "Open format, good quality" },
                  ].map(fmt => (
                    <button key={fmt.name} className="w-full flex items-center gap-3 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] transition-colors text-left">
                      <AudioLines className="w-4 h-4 text-muted shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{fmt.name}</span>
                          {fmt.recommended && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium">Recommended</span>}
                        </div>
                        <span className="text-xs text-muted">{fmt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Quality</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {["128kbps", "256kbps", "320kbps"].map(q => (
                      <button key={q} className="p-2.5 rounded-xl border border-foreground/[0.08] hover:border-accent/40 text-center text-sm font-medium transition-colors">{q}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Sample Rate</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {["44.1kHz", "48kHz", "96kHz"].map(r => (
                      <button key={r} className="p-2.5 rounded-xl border border-foreground/[0.08] hover:border-accent/40 text-center text-sm font-medium transition-colors">{r}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => toast({ title: "Exporting audio..." })}
                  className="w-full py-3 bg-accent text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors">
                  <Download className="w-4 h-4" /> Export Audio
                </button>
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Settings</h3>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Project</h4>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Sample Rate</span>
                    <span className="text-sm text-muted">48 kHz</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Bit Depth</span>
                    <span className="text-sm text-muted">24-bit</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Channels</span>
                    <span className="text-sm text-muted">Stereo</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Metronome</h4>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">BPM</span>
                    <span className="text-sm text-muted">120</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm font-medium">Click Track</span>
                    <button className="w-9 h-5 rounded-full bg-foreground/[0.1] relative transition-colors">
                      <div className="w-4 h-4 rounded-full bg-foreground/[0.3] absolute top-0.5 left-0.5 transition-transform" />
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
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-600">
                    <AudioLines className="w-3.5 h-3.5" />Audio
                    <button className="ml-0.5 hover:opacity-70"><XIcon className="w-3 h-3" /></button>
                  </div>
                  <div className="w-px h-5 bg-foreground/[0.1] mx-1" />
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Mic className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Voice</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Heart className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Emotion</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Sparkles className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Effects</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Music className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Music Style</TooltipContent></Tooltip>
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
      ) : (
        <button onClick={() => setIsLeftPanelCollapsed(false)}
          className="w-10 shrink-0 border-r border-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.03] transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted rotate-180" />
        </button>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Waveform / Canvas */}
        <div className="flex-1 flex items-center justify-center bg-foreground/[0.02] relative overflow-hidden">
          {/* Collapse button */}
          {!isLeftPanelCollapsed && (
            <button onClick={() => setIsLeftPanelCollapsed(true)}
              className="absolute left-3 top-3 z-10 w-8 h-8 rounded-lg bg-background border border-foreground/[0.08] flex items-center justify-center text-muted hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Waveform visualization */}
          <div className="w-full max-w-4xl px-8">
            <div className="relative h-48 bg-foreground/[0.03] rounded-2xl border border-foreground/[0.06] overflow-hidden">
              {/* Fake waveform bars */}
              <div className="absolute inset-0 flex items-center gap-[2px] px-4">
                {Array.from({ length: 120 }, (_, i) => {
                  const h = 20 + Math.sin(i * 0.3) * 30 + Math.random() * 40;
                  const progress = currentTime / duration;
                  const isPlayed = i / 120 < progress;
                  return <div key={i} className="flex-1 rounded-full transition-colors" style={{ height: `${h}%`, backgroundColor: isPlayed ? "hsl(var(--accent))" : "hsl(var(--foreground) / 0.1)" }} />;
                })}
              </div>
              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-accent z-10 transition-all" style={{ left: `${(currentTime / duration) * 100}%` }}>
                <div className="w-3 h-3 rounded-full bg-accent -translate-x-[5px] -translate-y-0.5" />
              </div>
              {/* Time display */}
              <div className="absolute bottom-3 left-4 text-xs font-mono text-muted">{formatTime(currentTime)}</div>
              <div className="absolute bottom-3 right-4 text-xs font-mono text-muted">{formatTime(duration)}</div>
            </div>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="h-16 border-t border-foreground/[0.06] flex items-center justify-center gap-4 px-4 shrink-0 bg-background">
          <button onClick={() => setCurrentTime(0)} className="p-2 text-muted hover:text-foreground transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))} className="p-2 text-muted hover:text-foreground transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-foreground/[0.1] mx-2" />

          <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-muted hover:text-foreground transition-colors">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <div className="w-px h-8 bg-foreground/[0.1] mx-2" />

          <span className="text-sm font-mono text-muted">{formatTime(currentTime)} / {formatTime(duration)}</span>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(1, zoom - 1))} className="p-2 text-muted hover:text-foreground transition-colors"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs text-muted w-8 text-center">{zoom}x</span>
            <button onClick={() => setZoom(Math.min(10, zoom + 1))} className="p-2 text-muted hover:text-foreground transition-colors"><ZoomIn className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Multi-track timeline */}
        <div className="h-48 border-t border-foreground/[0.06] bg-foreground/[0.02] flex flex-col shrink-0">
          {/* Track headers + clips */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map(track => (
              <div key={track.id} className="flex h-12 border-b border-foreground/[0.04]">
                {/* Track header */}
                <div className="w-32 shrink-0 border-r border-foreground/[0.06] flex items-center gap-2 px-2 bg-background">
                  <div className={`w-3 h-3 rounded-full ${track.color}`} />
                  <span className="text-[10px] font-medium truncate flex-1">{track.name}</span>
                  <button onClick={() => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, muted: !t.muted } : t))}
                    className="text-muted hover:text-foreground">
                    {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                </div>
                {/* Track clips area */}
                <div className="flex-1 relative">
                  <div
                    className={`absolute top-1 bottom-1 rounded-lg ${track.color} opacity-30 hover:opacity-50 cursor-pointer transition-opacity`}
                    style={{ left: `${(track.startTime / duration) * 100}%`, width: `${(track.duration / duration) * 100}%` }}
                  >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-foreground">{track.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioEditor;
