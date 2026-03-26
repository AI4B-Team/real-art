import { useState, useRef, useCallback, useEffect, KeyboardEvent } from "react";
import {
  Video, Image, AudioLines, Mic, User, Link, Copy, Clock, Hash,
  Heart, Sparkles, Music, Upload, Box, Send, ChevronDown, Shuffle,
  Loader2, Zap, Check, X as XIcon, Plus, FileText,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ContentType = "video" | "image" | "audio";

/* ─── Asset Chip Types ─── */
export interface AssetChip {
  id: string;
  type: "character" | "video" | "image" | "script" | "music" | "audio";
  label: string;
  thumbnail?: string;
}

const CHIP_STYLES: Record<AssetChip["type"], { icon: typeof User; bg: string; text: string }> = {
  character: { icon: User, bg: "bg-foreground/[0.06]", text: "text-foreground" },
  video: { icon: Video, bg: "bg-foreground/[0.06]", text: "text-foreground" },
  image: { icon: Image, bg: "bg-foreground/[0.06]", text: "text-foreground" },
  script: { icon: FileText, bg: "bg-foreground/[0.06]", text: "text-foreground" },
  music: { icon: Music, bg: "bg-foreground/[0.06]", text: "text-foreground" },
  audio: { icon: AudioLines, bg: "bg-foreground/[0.06]", text: "text-foreground" },
};

/* ─── Sample assets to pick from ─── */
const SAMPLE_ASSETS: { category: string; type: AssetChip["type"]; items: { id: string; label: string; thumbnail?: string }[] }[] = [
  {
    category: "Characters",
    type: "character",
    items: [
      { id: "char-clara", label: "Clara", thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" },
      { id: "char-alex", label: "Alex", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" },
      { id: "char-maya", label: "Maya", thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop" },
    ],
  },
  {
    category: "Videos",
    type: "video",
    items: [
      { id: "vid-1", label: "Video 1", thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=40&h=40&fit=crop" },
      { id: "vid-2", label: "Video 2", thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=40&h=40&fit=crop" },
    ],
  },
  {
    category: "Scripts",
    type: "script",
    items: [
      { id: "script-v1", label: "Script V1" },
      { id: "script-v2", label: "Script V2" },
    ],
  },
  {
    category: "Music",
    type: "music",
    items: [
      { id: "bgm-1", label: "BGM for Clara" },
      { id: "bgm-2", label: "Upbeat Track" },
      { id: "bgm-3", label: "Ambient Mood" },
    ],
  },
];

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
  const [chips, setChips] = useState<AssetChip[]>([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const addChip = (type: AssetChip["type"], item: { id: string; label: string; thumbnail?: string }) => {
    if (chips.find(c => c.id === item.id)) return;
    setChips(prev => [...prev, { id: item.id, type, label: item.label, thumbnail: item.thumbnail }]);
    setAssetPickerOpen(false);
    setAssetSearch("");
    // Focus textarea after adding
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const removeChip = (chipId: string) => {
    setChips(prev => prev.filter(c => c.id !== chipId));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const hasContent = chatInput.trim() || chips.length > 0;

  const filteredAssets = SAMPLE_ASSETS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      assetSearch ? item.label.toLowerCase().includes(assetSearch.toLowerCase()) : true
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="rounded-xl border-2 border-accent/30 bg-background overflow-hidden">
      {/* Rich input area with inline chips */}
      <div className="relative min-h-[80px]">
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
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

        {/* Chip + text area */}
        <div className="pl-12 pr-4 pt-3 pb-1 cursor-text" onClick={() => textareaRef.current?.focus()}>
          {/* Inline chips rendered above textarea */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {chips.map(chip => {
                const style = CHIP_STYLES[chip.type];
                const ChipIcon = style.icon;
                return (
                  <span key={chip.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.8rem] font-medium ${style.bg} ${style.text}`}>
                    {chip.thumbnail ? (
                      <img src={chip.thumbnail} alt="" className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <span className="w-5 h-5 rounded bg-foreground/[0.08] flex items-center justify-center">
                        <ChipIcon className="w-3 h-3 text-muted" />
                      </span>
                    )}
                    {chip.label}
                    <button onClick={(e) => { e.stopPropagation(); removeChip(chip.id); }}
                      className="ml-0.5 p-0.5 rounded hover:bg-foreground/[0.08] transition-colors">
                      <XIcon className="w-3 h-3 text-muted" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={e => onChatInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chips.length > 0 ? "Add more details..." : PLACEHOLDERS[contentType]}
            rows={2}
            className="w-full text-sm text-foreground placeholder:text-muted bg-transparent resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center px-3 pb-2.5 gap-1 min-w-0">
        {/* + Button to add asset references */}
        <Popover open={assetPickerOpen} onOpenChange={setAssetPickerOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button className="p-1.5 rounded-lg text-foreground hover:bg-foreground/[0.06] transition-colors shrink-0">
                  <Plus className="w-5 h-5" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Add Reference</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-64 p-0" align="start" sideOffset={8}>
            {/* Search */}
            <div className="p-2 border-b border-foreground/[0.06]">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-foreground/[0.04]">
                <Hash className="w-3.5 h-3.5 text-muted" />
                <input
                  value={assetSearch}
                  onChange={e => setAssetSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5">
              {filteredAssets.map(cat => (
                <div key={cat.category}>
                  <p className="px-2.5 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">{cat.category}</p>
                  {cat.items.map(item => {
                    const isAdded = chips.find(c => c.id === item.id);
                    const style = CHIP_STYLES[cat.type];
                    const ItemIcon = style.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addChip(cat.type, item)}
                        disabled={!!isAdded}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${isAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-foreground/[0.04]"}`}
                      >
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="w-7 h-7 rounded object-cover" />
                        ) : (
                          <span className="w-7 h-7 rounded bg-foreground/[0.06] flex items-center justify-center">
                            <ItemIcon className="w-3.5 h-3.5 text-muted" />
                          </span>
                        )}
                        <span className="font-medium">{item.label}</span>
                        {isAdded && <Check className="w-3.5 h-3.5 text-accent ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filteredAssets.length === 0 && (
                <p className="text-center text-sm text-muted py-4">No assets found</p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-foreground/[0.1] mx-0.5 shrink-0" />

        {/* AI Agent dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-muted hover:text-foreground transition-colors hover:bg-foreground/[0.04] shrink-0">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium">AI agent</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5" align="start">
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

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Send button */}
        <button onClick={onSend} disabled={isStreaming || !hasContent}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${hasContent && !isStreaming ? "bg-foreground text-background hover:bg-foreground/90" : "bg-foreground/10 text-muted"}`}>
          <Send className="w-4 h-4 -rotate-45" />
        </button>
      </div>
    </div>
  );
}
