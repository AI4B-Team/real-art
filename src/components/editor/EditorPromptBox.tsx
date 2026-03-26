import { useState } from "react";
import {
  Video, Image, AudioLines, Mic, User, Link, Copy, Clock, Hash,
  Heart, Sparkles, Music, Upload, Box, Send, ChevronDown, Shuffle,
  Loader2, Zap, Check, X as XIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ContentType = "video" | "image" | "audio";

interface EditorPromptBoxProps {
  editorType: ContentType;
  chatInput: string;
  onChatInputChange: (val: string) => void;
  onSend: () => void;
  isStreaming?: boolean;
}

const CONTENT_TYPES: { id: ContentType; icon: typeof Video; label: string; color: string; bgColor: string }[] = [
  { id: "video", icon: Video, label: "Video", color: "text-accent", bgColor: "bg-accent/15" },
  { id: "image", icon: Image, label: "Image", color: "text-blue-600", bgColor: "bg-blue-500/15" },
  { id: "audio", icon: AudioLines, label: "Audio", color: "text-emerald-600", bgColor: "bg-emerald-500/15" },
];

const PLACEHOLDERS: Record<ContentType, string> = {
  video: "Describe the video you want to create...",
  image: "Describe the image you want to create...",
  audio: "Describe the audio you want to create...",
};

export default function EditorPromptBox({ editorType, chatInput, onChatInputChange, onSend, isStreaming = false }: EditorPromptBoxProps) {
  const [contentType, setContentType] = useState<ContentType>(editorType);
  const [isContentTypeOpen, setIsContentTypeOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(editorType === "video" ? "16:9" : "1:1");
  const [duration, setDuration] = useState("10");
  const [imageCount, setImageCount] = useState(1);

  const currentType = CONTENT_TYPES.find(t => t.id === contentType)!;
  const ContentIcon = currentType.icon;

  const handleEnhance = () => {
    if (!chatInput.trim()) return;
    setIsEnhancing(true);
    setTimeout(() => {
      onChatInputChange(chatInput + " — cinematic lighting, dramatic composition");
      setIsEnhancing(false);
    }, 1200);
  };

  return (
    <div className="rounded-xl border-2 border-accent/30 bg-background overflow-hidden">
      {/* Textarea with content type icon + auto-prompt */}
      <div className="relative">
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setIsContentTypeOpen(!isContentTypeOpen)} className="p-1 transition hover:opacity-70">
                <ContentIcon className={`w-5 h-5 ${currentType.color}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Tools</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleEnhance} disabled={isEnhancing} className="p-1 transition hover:opacity-70 disabled:opacity-50">
                {isEnhancing ? <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /> : <Shuffle className="w-5 h-5 text-emerald-500" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>Auto Prompt</TooltipContent>
          </Tooltip>
        </div>

        {/* Content type dropdown */}
        {isContentTypeOpen && (
          <div className="absolute top-12 left-3 bg-foreground text-background rounded-xl shadow-lg p-2 z-50 min-w-[140px]">
            {CONTENT_TYPES.map(t => (
              <button key={t.id} onClick={() => { setContentType(t.id); setIsContentTypeOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${contentType === t.id ? "text-background" : "text-background/60 hover:text-background"}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={chatInput}
          onChange={e => onChatInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={PLACEHOLDERS[contentType]}
          rows={3}
          className="w-full pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted bg-transparent resize-none focus:outline-none"
        />
      </div>

      {/* Bottom toolbar — uses flex-nowrap + overflow-hidden to never wrap/scroll */}
      <div className="flex items-center px-3 pb-2.5 gap-1 min-w-0">
        {/* Content Type Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${currentType.bgColor} ${currentType.color}`}>
          <ContentIcon className="w-3.5 h-3.5" />
          {currentType.label}
          <button onClick={() => setContentType(editorType)} className="ml-0.5 hover:opacity-70"><XIcon className="w-3 h-3" /></button>
        </div>

        <div className="w-px h-5 bg-foreground/[0.1] mx-1 shrink-0" />

        {/* Mode-specific toolbar icons — shrink-0 each to prevent wrapping */}
        <div className="flex items-center gap-0.5 shrink-0">
          {contentType === "video" && (
            <>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Box className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Tools</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><User className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Character</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Link className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Reference</TooltipContent></Tooltip>
              <Popover>
                <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-0.5"><Copy className="w-4 h-4" /><span className="text-[10px] font-medium">{aspectRatio}</span></button></PopoverTrigger></TooltipTrigger><TooltipContent>Ratio</TooltipContent></Tooltip>
                <PopoverContent className="w-44 p-1.5" align="start">
                  {["16:9", "9:16", "1:1", "4:3"].map(r => (
                    <button key={r} onClick={() => setAspectRatio(r)} className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${aspectRatio === r ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>{r}{aspectRatio === r && <Check className="w-3 h-3 inline ml-auto float-right mt-0.5" />}</button>
                  ))}
                </PopoverContent>
              </Popover>
              <Popover>
                <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-0.5"><Clock className="w-4 h-4" /><span className="text-[10px] font-medium">{duration}s</span></button></PopoverTrigger></TooltipTrigger><TooltipContent>Duration</TooltipContent></Tooltip>
                <PopoverContent className="w-40 p-1.5" align="start">
                  {["5", "10", "15", "25", "30"].map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${duration === d ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>{d}s</button>
                  ))}
                </PopoverContent>
              </Popover>
            </>
          )}
          {contentType === "image" && (
            <>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-0.5"><Box className="w-4 h-4" /><span className="text-[10px] font-medium">Auto</span></button></TooltipTrigger><TooltipContent>Tools</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><User className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Character</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Link className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Reference</TooltipContent></Tooltip>
              <Popover>
                <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-0.5"><Copy className="w-4 h-4" /><span className="text-[10px] font-medium">{aspectRatio}</span></button></PopoverTrigger></TooltipTrigger><TooltipContent>Ratio</TooltipContent></Tooltip>
                <PopoverContent className="w-44 p-1.5" align="start">
                  {["1:1", "16:9", "9:16", "4:3", "3:4"].map(r => (
                    <button key={r} onClick={() => setAspectRatio(r)} className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${aspectRatio === r ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>{r}</button>
                  ))}
                </PopoverContent>
              </Popover>
              <Popover>
                <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors flex items-center gap-0.5"><Hash className="w-4 h-4" /><span className="text-[10px] font-medium">{imageCount}</span></button></PopoverTrigger></TooltipTrigger><TooltipContent>Number</TooltipContent></Tooltip>
                <PopoverContent className="w-40 p-1.5" align="start">
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => setImageCount(n)} className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${imageCount === n ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>{n} Image{n > 1 ? "s" : ""}</button>
                  ))}
                </PopoverContent>
              </Popover>
            </>
          )}
          {contentType === "audio" && (
            <>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Box className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Tools</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Mic className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Voice</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Heart className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Emotion</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Sparkles className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Effects</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><button className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"><Music className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Music Style</TooltipContent></Tooltip>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Right side: Agent dropdown + Send */}
        <div className="flex items-center gap-2 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-muted hover:text-foreground transition-colors hover:bg-foreground/[0.04]">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Agent</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1.5" align="end">
              <p className="px-3 py-1.5 text-xs font-medium text-muted">Enhance Prompt</p>
              <button onClick={() => { if (!chatInput.trim()) return; setIsEnhancing(true); setTimeout(() => { onChatInputChange(chatInput + " — quick enhancement"); setIsEnhancing(false); }, 800); }}
                className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Enhance
              </button>
              <button onClick={() => { if (!chatInput.trim()) return; setIsEnhancing(true); setTimeout(() => { onChatInputChange(chatInput + " — cinematic, detailed, high quality"); setIsEnhancing(false); }, 1500); }}
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

          <button onClick={onSend} disabled={isStreaming || !chatInput.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${chatInput.trim() && !isStreaming ? "bg-accent text-white hover:bg-accent/90" : "bg-accent/20 text-accent/50"}`}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
