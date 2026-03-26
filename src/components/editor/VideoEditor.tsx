import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Scissors, Undo2, Redo2, ZoomIn, ZoomOut, Plus, Upload,
  Type, Music, Image, Sparkles, FileText, Layers, Settings,
  ChevronDown, ChevronLeft, ChevronRight,
  Trash2, Video, Eye, EyeOff, Lock, Unlock,
  Maximize, Minimize, Check, Search, Copy, Download,
  Wand2, GripVertical, Captions, User, SlidersHorizontal,
  LayoutGrid, VolumeX as VolX, Send, Mic, Eraser,
  Circle, Grid3X3, Palette, Zap, Film, Clapperboard,
  AudioLines, VolumeOff, MoreVertical,
  MessageSquare, BookOpen, RefreshCw, ArrowUp,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

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
type LeftTab = "script" | "character" | "visuals" | "audio" | "text" | "captions" | "effects" | "elements" | "transitions" | "templates" | "tools" | "settings";

const LEFT_TABS: { id: LeftTab; icon: typeof FileText; label: string }[] = [
  { id: "script", icon: FileText, label: "Script" },
  { id: "character", icon: User, label: "Character" },
  { id: "visuals", icon: Video, label: "Visuals" },
  { id: "audio", icon: AudioLines, label: "Audio" },
  { id: "text", icon: Type, label: "Text" },
  { id: "captions", icon: Captions, label: "Captions" },
  { id: "effects", icon: Sparkles, label: "Effects" },
  { id: "elements", icon: Layers, label: "Elements" },
  { id: "transitions", icon: SlidersHorizontal, label: "Transitions" },
  { id: "templates", icon: LayoutGrid, label: "Templates" },
  { id: "tools", icon: Wand2, label: "Tools" },
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
  const [activeTab, setActiveTab] = useState<LeftTab>("script");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(596); // 9:56
  const [zoom, setZoom] = useState(3);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(true);
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [isMuted, setIsMuted] = useState(false);
  const [captionSearch, setCaptionSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [audioSubTab, setAudioSubTab] = useState("Voices");
  const [visualsSubTab, setVisualsSubTab] = useState("Videos");
  const [templateSearch, setTemplateSearch] = useState("");
  const [scriptContent, setScriptContent] = useState(
    "I'm going to tell you something shocking."
  );
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const filteredCaptions = captionSearch
    ? CAPTION_DATA.filter(c => c.text.toLowerCase().includes(captionSearch.toLowerCase()))
    : CAPTION_DATA;

  return (
    <div className="h-full flex overflow-hidden bg-background">
      {/* Left Sidebar */}
      {!isLeftPanelCollapsed && (
        <div className="w-[420px] bg-card border-r border-foreground/[0.08] flex flex-col overflow-hidden shrink-0">
          {/* Icon strip - horizontal at top */}
          <div className="bg-foreground/[0.03] border-b border-foreground/[0.06] flex items-center px-3 py-2 gap-1 shrink-0 overflow-x-auto">
            {LEFT_TABS.map(tab => (
              <Tooltip key={tab.id}><TooltipTrigger asChild>
                <button onClick={() => setActiveTab(tab.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 ${activeTab === tab.id ? "bg-foreground/[0.08] text-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  <tab.icon className="w-5 h-5" />
                </button>
              </TooltipTrigger><TooltipContent>{tab.label}</TooltipContent></Tooltip>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Active tab label */}
            <div className="px-4 pt-3 pb-2 shrink-0">
              {activeTab !== "script" && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.06] rounded-lg w-fit">
                  {(() => { const TabIcon = LEFT_TABS.find(t => t.id === activeTab)?.icon || FileText; return <TabIcon className="w-4 h-4" />; })()}
                  <span className="text-sm font-medium">{LEFT_TABS.find(t => t.id === activeTab)?.label}</span>
                </div>
              )}
            </div>

            {/* Search bar for applicable tabs */}
            {["script", "captions", "audio", "effects", "templates", "tools", "elements"].includes(activeTab) && (
              <div className="px-4 pb-3 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="text" placeholder="Search" className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
                </div>
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {/* Script Tab */}
              {activeTab === "script" && (
                <div className="space-y-4">
                  {/* Action buttons row */}
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><Copy className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Copy</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><Download className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Download</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button className="p-2 hover:bg-foreground/[0.06] rounded-lg text-muted hover:text-foreground transition-colors"><SlidersHorizontal className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Settings</TooltipContent></Tooltip>
                  </div>

                  <div className="border-t border-foreground/[0.06] pt-4" />

                  {/* Script with captions */}
                  <p className="text-sm font-medium text-foreground leading-relaxed">{scriptContent}</p>

                  <div className="space-y-4 mt-4">
                    {CAPTION_DATA.map((cap, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/15 text-emerald-600 text-xs font-mono font-medium rounded-md shrink-0 mt-0.5">{cap.time}</span>
                        <span className="text-sm text-foreground leading-relaxed">{cap.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Character Tab */}
              {activeTab === "character" && (
                <div className="space-y-4">
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
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1">
                    {["Videos", "Images", "Elements"].map(sub => (
                      <button key={sub} onClick={() => setVisualsSubTab(sub)}
                        className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${visualsSubTab === sub ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-foreground/[0.06] rounded-lg text-xs font-medium text-foreground flex items-center justify-center gap-1.5 hover:bg-foreground/[0.1] transition-colors">
                      <Upload className="w-3.5 h-3.5" />Upload
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" placeholder="Search Assets" className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
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

              {/* Text Tab */}
              {activeTab === "text" && (
                <div className="space-y-3">
                  {["Heading", "Subheading", "Body Text", "Caption", "Lower Third", "Title Card"].map(preset => (
                    <button key={preset} onClick={() => toast({ title: `${preset} added to timeline` })}
                      className="w-full p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 text-left transition-all group">
                      <span className={`text-foreground font-medium ${preset === "Heading" ? "text-xl" : preset === "Subheading" ? "text-base" : "text-sm"}`}>{preset}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Captions Tab */}
              {activeTab === "captions" && (
                <div className="space-y-4">
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

              {/* Effects Tab */}
              {activeTab === "effects" && (
                <div className="space-y-4">
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

              {/* Elements Tab */}
              {activeTab === "elements" && (
                <div className="space-y-4">
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

              {/* Transitions Tab */}
              {activeTab === "transitions" && (
                <div className="space-y-3">
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
                    <h3 className="text-lg font-bold text-foreground">Templates</h3>
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

              {/* Tools / AI Tab */}
              {activeTab === "tools" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">AI Tools</h3>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Audio Suite</h4>
                    {AI_TOOLS.filter((_, i) => i < 4).map(tool => (
                      <button key={tool.name} onClick={() => toast({ title: `${tool.name} processing...` })}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-all text-left">
                        <tool.icon className="w-5 h-5 text-muted shrink-0" />
                        <div><p className="text-sm font-medium text-foreground">{tool.name}</p><p className="text-xs text-muted">{tool.desc}</p></div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Video Suite</h4>
                    {AI_TOOLS.filter((_, i) => i >= 4).map(tool => (
                      <button key={tool.name} onClick={() => toast({ title: `${tool.name} processing...` })}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-all text-left">
                        <tool.icon className="w-5 h-5 text-muted shrink-0" />
                        <div><p className="text-sm font-medium text-foreground">{tool.name}</p><p className="text-xs text-muted">{tool.desc}</p></div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: "Resolution", value: "1920 × 1080" },
                      { label: "Frame Rate", value: "30 fps" },
                      { label: "Aspect Ratio", value: selectedRatio },
                      { label: "Background Color", value: "#000000" },
                    ].map(setting => (
                      <div key={setting.label} className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
                        <span className="text-sm text-foreground">{setting.label}</span>
                        <span className="text-sm font-medium text-muted">{setting.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom AI Prompt - always visible */}
            <div className="p-3 border-t border-foreground/[0.06] shrink-0">
              <div className="rounded-xl border-2 border-accent/30 bg-background overflow-hidden">
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to create..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm text-foreground placeholder:text-muted bg-transparent resize-none focus:outline-none"
                />
                <div className="flex items-center justify-between px-3 pb-2">
                  <button className="p-1.5 text-muted hover:text-foreground transition-colors">
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 text-muted hover:text-foreground transition-colors">
                          <Sparkles className="w-4 h-4" />
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-1.5" align="end">
                        {["Auto", "Creative", "Precise", "Balanced"].map(m => (
                          <button key={m} className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04]">{m}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <button onClick={() => { if (aiPrompt.trim()) { toast({ title: "Generating..." }); setAiPrompt(""); } }}
                      className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent hover:bg-accent/30 transition-colors">
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
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-muted text-sm font-medium hover:bg-foreground/[0.08] transition-colors">
                  <Undo2 className="w-4 h-4" />Undo
                </button>
              </TooltipTrigger><TooltipContent>Undo (Ctrl+Z)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-muted text-sm font-medium hover:bg-foreground/[0.08] transition-colors">
                  <Redo2 className="w-4 h-4" />Redo
                </button>
              </TooltipTrigger><TooltipContent>Redo (Ctrl+Y)</TooltipContent></Tooltip>
              <div className="w-px h-6 bg-foreground/[0.08] mx-2" />
              <Tooltip><TooltipTrigger asChild>
                <button className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><Scissors className="w-5 h-5" /></button>
              </TooltipTrigger><TooltipContent>Split (S)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><Eraser className="w-5 h-5" /></button>
              </TooltipTrigger><TooltipContent>Erase</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><Layers className="w-5 h-5" /></button>
              </TooltipTrigger><TooltipContent>Layers</TooltipContent></Tooltip>
            </div>

            {/* Center playback */}
            <div className="flex items-center gap-3">
              {/* Record */}
              <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors">
                <Circle className="w-3 h-3 fill-current" />Record
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
            <div className="flex-1 overflow-auto">
              <div className="flex min-h-full">
                {/* Track labels */}
                <div className="w-40 shrink-0 border-r border-foreground/[0.06]">
                  {/* Add scene / view buttons */}
                  <div className="h-6 flex items-center gap-1 px-2 border-b border-foreground/[0.06]">
                    <Tooltip><TooltipTrigger asChild>
                      <button className="p-0.5 text-muted hover:text-foreground"><Plus className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Add Scene</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button className="p-0.5 text-muted hover:text-foreground"><FileText className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>List View</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button className="p-0.5 text-muted hover:text-foreground"><Grid3X3 className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Grid View</TooltipContent></Tooltip>
                  </div>
                  {tracks.map(track => (
                    <div key={track.id} className="h-14 flex items-center gap-1.5 px-2 border-b border-foreground/[0.04] group">
                      <GripVertical className="w-3 h-3 text-muted/30 cursor-grab" />
                      <span className="text-xs font-medium text-muted w-4 text-center">{track.name}</span>
                      <Tooltip><TooltipTrigger asChild>
                        <button className={`p-1 rounded transition-colors ${track.type === "audio" ? "text-purple-500" : "text-muted"}`}>
                          {track.type === "video" ? <Video className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </TooltipTrigger><TooltipContent>{track.type === "video" ? "Video Track" : "Audio Track"}</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <button onClick={() => toggleTrackMute(track.id)} className={`p-1 rounded transition-colors ${track.muted ? "text-accent" : "text-muted/50 hover:text-muted"}`}>
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger><TooltipContent>{track.muted ? "Unmute" : "Mute"}</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <button onClick={() => toggleTrackLock(track.id)} className={`p-1 rounded transition-colors ${track.locked ? "text-amber-500" : "text-muted/50 hover:text-muted"}`}>
                          {track.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </TooltipTrigger><TooltipContent>{track.locked ? "Unlock" : "Lock"}</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <button onClick={() => toggleTrackVisibility(track.id)} className={`p-1 rounded transition-colors ${!track.visible ? "text-muted/30" : "text-muted/50 hover:text-muted"}`}>
                          {track.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </TooltipTrigger><TooltipContent>{track.visible ? "Hide" : "Show"}</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <button className="p-1 rounded text-muted/50 hover:text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger><TooltipContent>More Options</TooltipContent></Tooltip>
                    </div>
                  ))}
                </div>

                {/* Timeline clips */}
                <div className="flex-1 relative">
                  {/* Playhead */}
                  <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: playheadPosition }}>
                    <div className="w-0.5 h-full bg-accent" />
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-b-sm rotate-45" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
                  </div>

                  {/* Time ruler */}
                  <div className="h-6 border-b border-foreground/[0.06] flex items-end relative">
                    {Array.from({ length: Math.ceil(duration / 10) + 1 }, (_, i) => (
                      <div key={i} className="absolute" style={{ left: i * 10 * pixelsPerSecond }}>
                        <div className="w-px h-2 bg-foreground/[0.1]" />
                        <span className="text-[9px] text-muted/50 ml-1">{formatTimeColon(i * 10)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Track rows */}
                  {tracks.map(track => (
                    <div key={track.id} className="h-14 relative border-b border-foreground/[0.04]">
                      {track.clips.map(clip => (
                        <div key={clip.id}
                          className={`absolute top-1.5 h-11 ${clip.color || "bg-blue-500"} rounded-lg cursor-pointer hover:brightness-110 transition-all flex items-center px-2 gap-1.5 overflow-hidden ${track.locked ? "opacity-60" : ""}`}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
