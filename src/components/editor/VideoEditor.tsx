import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Scissors, Undo2, Redo2, ZoomIn, ZoomOut, Plus, Upload,
  Type, Music, Image, Sparkles, FileText, Layers, Settings,
  ChevronDown, ChevronLeft, ChevronRight,
  Trash2, Video, Eye, EyeOff, Lock, Unlock,
  Maximize, Minimize, Check,
  Wand2, GripVertical, Captions,
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
  clips: TimelineClip[]; muted?: boolean; locked?: boolean;
}

/* ─── Tab Configs ─── */
type LeftTab = "script" | "visuals" | "audio" | "text" | "captions" | "elements" | "effects" | "templates" | "ai" | "settings";

const LEFT_TABS: { id: LeftTab; icon: typeof FileText; label: string }[] = [
  { id: "script", icon: FileText, label: "Script" },
  { id: "visuals", icon: Video, label: "Visuals" },
  { id: "audio", icon: Music, label: "Audio" },
  { id: "text", icon: Type, label: "Text" },
  { id: "captions", icon: Captions, label: "Captions" },
  { id: "elements", icon: Layers, label: "Elements" },
  { id: "effects", icon: Sparkles, label: "Effects" },
  { id: "templates", icon: Image, label: "Templates" },
  { id: "ai", icon: Wand2, label: "AI Tools" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const SAMPLE_MEDIA = [
  { id: "v1", name: "Product Demo", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200" },
  { id: "v2", name: "Brand Intro", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200" },
  { id: "v3", name: "Promo Clip", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200" },
  { id: "v4", name: "B-Roll", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=200" },
  { id: "v5", name: "Social Ad", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200" },
  { id: "v6", name: "Lifestyle", type: "video" as const, thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=200" },
];

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

interface Props { video?: string }

const VideoEditor = ({ video }: Props) => {
  const [activeTab, setActiveTab] = useState<LeftTab>("script");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(30);
  const [zoom, setZoom] = useState(3);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [scriptContent, setScriptContent] = useState(
    "Welcome to today's session. We have a lot to cover, so let's get started right away.\n\nIn this video, we'll explore the latest features and improvements that have been made to our platform. From enhanced AI capabilities to streamlined workflows, there's plenty to be excited about."
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  const [tracks] = useState<TimelineTrack[]>([
    { id: "video-1", type: "video", name: "Video", clips: [
      { id: "clip-1", type: "video", name: "Intro", startTime: 0, duration: 8, color: "bg-blue-500" },
      { id: "clip-2", type: "video", name: "Main Content", startTime: 8, duration: 15, color: "bg-purple-500" },
      { id: "clip-3", type: "video", name: "Outro", startTime: 23, duration: 7, color: "bg-emerald-500" },
    ]},
    { id: "text-1", type: "text", name: "Text", clips: [
      { id: "text-clip-1", type: "text", name: "Title Card", startTime: 0, duration: 5, color: "bg-amber-500" },
      { id: "text-clip-2", type: "text", name: "Lower Third", startTime: 10, duration: 8, color: "bg-amber-400" },
    ]},
    { id: "audio-1", type: "audio", name: "Audio", clips: [
      { id: "audio-clip-1", type: "audio", name: "Background Music", startTime: 0, duration: 30, color: "bg-rose-500" },
    ]},
    { id: "audio-2", type: "audio", name: "Voiceover", clips: [
      { id: "vo-clip-1", type: "audio", name: "Narration", startTime: 2, duration: 20, color: "bg-teal-500" },
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
  const pixelsPerSecond = zoom * 40;
  const playheadPosition = currentTime * pixelsPerSecond;

  return (
    <div className="h-full flex overflow-hidden bg-background">
      {!isLeftPanelCollapsed && (
        <div className="w-[380px] bg-card border-r border-foreground/[0.08] flex overflow-hidden shrink-0">
          <div className="w-14 bg-foreground/[0.03] border-r border-foreground/[0.06] flex flex-col items-center py-3 gap-1 shrink-0">
            {LEFT_TABS.map(tab => (
              <Tooltip key={tab.id}><TooltipTrigger asChild>
                <button onClick={() => setActiveTab(tab.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${activeTab === tab.id ? "bg-accent text-white" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  <tab.icon className="w-4.5 h-4.5" />
                </button>
              </TooltipTrigger><TooltipContent side="right">{tab.label}</TooltipContent></Tooltip>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-bold text-foreground mb-4">{LEFT_TABS.find(t => t.id === activeTab)?.label}</h3>
              {activeTab === "script" && (
                <div className="space-y-4">
                  <textarea value={scriptContent} onChange={e => setScriptContent(e.target.value)}
                    className="w-full h-64 bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => toast({ title: "AI enhancing script..." })}
                      className="flex-1 py-2.5 bg-accent text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors">
                      <Sparkles className="w-4 h-4" />Enhance
                    </button>
                    <button onClick={() => toast({ title: "Generating from script..." })}
                      className="flex-1 py-2.5 bg-foreground/[0.06] text-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-foreground/[0.1] transition-colors">
                      <Wand2 className="w-4 h-4" />Generate
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "visuals" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-foreground/[0.06] rounded-lg text-xs font-medium text-foreground flex items-center justify-center gap-1.5 hover:bg-foreground/[0.1] transition-colors">
                      <Upload className="w-3.5 h-3.5" />Upload
                    </button>
                    <button className="flex-1 py-2 bg-foreground/[0.06] rounded-lg text-xs font-medium text-foreground flex items-center justify-center gap-1.5 hover:bg-foreground/[0.1] transition-colors">
                      <Wand2 className="w-3.5 h-3.5" />Generate
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_MEDIA.map(m => (
                      <div key={m.id} className="group relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                        <img src={m.thumbnail} alt={m.name} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-xs text-white font-medium">{m.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "audio" && (
                <div className="space-y-4">
                  <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1">
                    {["Voices", "Music", "Effects"].map(sub => (
                      <button key={sub} className="flex-1 py-1.5 rounded-md text-xs font-medium text-muted hover:text-foreground hover:bg-background transition-colors">{sub}</button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {["Background Music", "Voiceover", "Sound Effect", "Ambient"].map(name => (
                      <div key={name} className="flex items-center gap-3 p-3 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><Music className="w-5 h-5 text-accent" /></div>
                        <div className="flex-1"><p className="text-sm font-medium text-foreground">{name}</p><p className="text-xs text-muted">0:30</p></div>
                        <button className="p-2 text-muted hover:text-foreground"><Plus className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              {activeTab === "ai" && (
                <div className="space-y-3">
                  {[
                    { name: "Auto Captions", desc: "Generate captions from audio" },
                    { name: "Smart Cut", desc: "Remove silences automatically" },
                    { name: "AI B-Roll", desc: "Generate contextual B-roll" },
                    { name: "Scene Detection", desc: "Auto-detect scene changes" },
                    { name: "Color Match", desc: "Match colors across clips" },
                    { name: "AI Voiceover", desc: "Generate narration from script" },
                  ].map(tool => (
                    <button key={tool.name} onClick={() => toast({ title: `${tool.name} processing...` })}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 transition-all text-left">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Wand2 className="w-5 h-5 text-accent" /></div>
                      <div><p className="text-sm font-medium text-foreground">{tool.name}</p><p className="text-xs text-muted">{tool.desc}</p></div>
                    </button>
                  ))}
                </div>
              )}
              {["captions", "elements", "effects", "templates", "settings"].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-12 text-muted text-center">
                  <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm font-medium">{LEFT_TABS.find(t => t.id === activeTab)?.label}</p>
                  <p className="text-xs mt-1">Coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Tooltip><TooltipTrigger asChild>
        <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-12 bg-card hover:bg-foreground/[0.06] rounded-r-md border border-l-0 border-foreground/[0.08] transition-colors"
          style={{ left: isLeftPanelCollapsed ? 0 : 380 }}>
          {isLeftPanelCollapsed ? <ChevronRight className="w-4 h-4 text-muted" /> : <ChevronLeft className="w-4 h-4 text-muted" />}
        </button>
      </TooltipTrigger><TooltipContent side="right">{isLeftPanelCollapsed ? "Show Panel" : "Hide Panel"}</TooltipContent></Tooltip>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 bg-foreground/[0.03] flex items-center justify-center relative overflow-hidden min-h-0">
          <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl" style={{ width: "80%", maxWidth: 800, aspectRatio: selectedRatio === "9:16" ? "9/16" : selectedRatio === "1:1" ? "1/1" : "16/9" }}>
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
          <div className="absolute top-4 right-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 bg-card/80 backdrop-blur border border-foreground/[0.08] rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
                  {selectedRatio} <ChevronDown className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1.5" align="end">
                {["16:9", "9:16", "1:1", "4:5", "4:3"].map(r => (
                  <button key={r} onClick={() => setSelectedRatio(r)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedRatio === r ? "bg-accent/10 text-accent" : "hover:bg-foreground/[0.04]"}`}>
                    {r}{selectedRatio === r && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className={`bg-card border-t border-foreground/[0.08] flex flex-col ${isTimelineMinimized ? "h-12" : "h-64"} transition-all`}>
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
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><SkipBack className="w-5 h-5" /></button>
              <button onClick={togglePlay} className="w-12 h-12 flex items-center justify-center bg-accent rounded-full hover:bg-accent/90 transition-colors text-white shadow-lg">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted hover:text-foreground transition-colors"><SkipForward className="w-5 h-5" /></button>
              <span className="text-sm font-mono text-muted min-w-[100px]">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted"><ZoomOut className="w-5 h-5" /></button>
              <input type="range" min={0.5} max={6} step={0.25} value={zoom} onChange={e => setZoom(Number(e.target.value))}
                className="w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-foreground/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent" />
              <button onClick={() => setZoom(Math.min(6, zoom + 0.5))} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted"><ZoomIn className="w-5 h-5" /></button>
              <div className="w-px h-6 bg-foreground/[0.08] mx-2" />
              <button onClick={() => setIsTimelineMinimized(!isTimelineMinimized)} className="p-2 hover:bg-foreground/[0.04] rounded-lg text-muted">
                {isTimelineMinimized ? <Maximize className="w-5 h-5" /> : <Minimize className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {!isTimelineMinimized && (
            <div className="flex-1 overflow-auto">
              <div className="flex min-h-full">
                <div className="w-32 shrink-0 border-r border-foreground/[0.06]">
                  {tracks.map(track => (
                    <div key={track.id} className="h-14 flex items-center gap-2 px-3 border-b border-foreground/[0.04]">
                      <GripVertical className="w-3 h-3 text-muted/30" />
                      <span className="text-xs font-medium text-muted truncate">{track.name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 relative">
                  <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: playheadPosition }}>
                    <div className="w-0.5 h-full bg-accent" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-b-sm rotate-45" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
                  </div>
                  <div className="h-6 border-b border-foreground/[0.06] flex items-end">
                    {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                      <div key={i} className="relative" style={{ left: i * pixelsPerSecond, position: "absolute" }}>
                        <div className="w-px h-2 bg-foreground/[0.1]" />
                        <span className="text-[9px] text-muted/50 ml-1">{formatTime(i)}</span>
                      </div>
                    ))}
                  </div>
                  {tracks.map(track => (
                    <div key={track.id} className="h-14 relative border-b border-foreground/[0.04]">
                      {track.clips.map(clip => (
                        <div key={clip.id}
                          className={`absolute top-1.5 h-11 ${clip.color || "bg-blue-500"} rounded-lg cursor-pointer hover:brightness-110 transition-all flex items-center px-2 gap-1.5 overflow-hidden`}
                          style={{ left: clip.startTime * pixelsPerSecond, width: clip.duration * pixelsPerSecond }}>
                          <span className="text-[10px] text-white font-medium truncate">{clip.name}</span>
                        </div>
                      ))}
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
