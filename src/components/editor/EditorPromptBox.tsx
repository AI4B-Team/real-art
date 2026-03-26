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

const CHIP_ICON: Record<AssetChip["type"], typeof User> = {
  character: User, video: Video, image: Image, script: FileText, music: Music, audio: AudioLines,
};

/* ─── Sample assets ─── */
const SAMPLE_ASSETS: { category: string; type: AssetChip["type"]; items: { id: string; label: string; thumbnail?: string }[] }[] = [
  {
    category: "Characters", type: "character",
    items: [
      { id: "char-clara", label: "Clara", thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" },
      { id: "char-alex", label: "Alex", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" },
      { id: "char-maya", label: "Maya", thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop" },
    ],
  },
  {
    category: "Videos", type: "video",
    items: [
      { id: "vid-1", label: "Video 1", thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=40&h=40&fit=crop" },
      { id: "vid-2", label: "Video 2", thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=40&h=40&fit=crop" },
    ],
  },
  {
    category: "Scripts", type: "script",
    items: [{ id: "script-v1", label: "Script V1" }, { id: "script-v2", label: "Script V2" }],
  },
  {
    category: "Music", type: "music",
    items: [{ id: "bgm-1", label: "BGM for Clara" }, { id: "bgm-2", label: "Upbeat Track" }, { id: "bgm-3", label: "Ambient Mood" }],
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

/* ─── Chip component (inline) ─── */
function InlineChip({ chip, onRemove }: { chip: AssetChip; onRemove: () => void }) {
  const Icon = CHIP_ICON[chip.type];
  return (
    <span contentEditable={false} className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-lg bg-foreground/[0.06] text-[0.82rem] font-medium text-foreground align-middle whitespace-nowrap select-none">
      {chip.thumbnail ? (
        <img src={chip.thumbnail} alt="" className="w-5 h-5 rounded object-cover" />
      ) : (
        <span className="w-5 h-5 rounded bg-foreground/[0.08] flex items-center justify-center">
          <Icon className="w-3 h-3 text-muted" />
        </span>
      )}
      {chip.label}
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="ml-0.5 p-0.5 rounded hover:bg-foreground/[0.1] transition-colors">
        <XIcon className="w-2.5 h-2.5 text-muted" />
      </button>
    </span>
  );
}

export default function EditorPromptBox({ editorType, chatInput, onChatInputChange, onSend, isStreaming = false }: EditorPromptBoxProps) {
  const [contentType, setContentType] = useState<ContentType>(editorType);
  const [isContentTypeOpen, setIsContentTypeOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [chips, setChips] = useState<AssetChip[]>([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const editableRef = useRef<HTMLDivElement>(null);

  const currentType = CONTENT_TYPES.find(t => t.id === contentType)!;
  const ContentIcon = currentType.icon;

  // Sync plain text out of contenteditable (ignoring chip nodes)
  const extractText = useCallback(() => {
    if (!editableRef.current) return "";
    let text = "";
    editableRef.current.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || "";
      } else if ((node as HTMLElement).dataset?.chipId) {
        // skip chip nodes for text extraction
      } else if (node.nodeName === "BR") {
        text += "\n";
      } else {
        text += (node as HTMLElement).innerText || "";
      }
    });
    return text;
  }, []);

  const handleInput = useCallback(() => {
    const text = extractText();
    onChatInputChange(text);
  }, [extractText, onChatInputChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const handleEnhance = () => {
    if (!chatInput.trim()) return;
    setIsEnhancing(true);
    setTimeout(() => {
      onChatInputChange(chatInput + " — cinematic lighting, dramatic composition");
      // Also update the editable div
      if (editableRef.current) {
        editableRef.current.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            node.textContent = node.textContent + " — cinematic lighting, dramatic composition";
          }
        });
      }
      setIsEnhancing(false);
    }, 1200);
  };

  // Insert a chip at cursor position in contenteditable
  const insertChipAtCursor = useCallback((chip: AssetChip) => {
    const el = editableRef.current;
    if (!el) return;
    el.focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      // If no selection, place at end
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    const range = sel!.getRangeAt(0);

    // Create chip span
    const chipSpan = document.createElement("span");
    chipSpan.contentEditable = "false";
    chipSpan.dataset.chipId = chip.id;
    chipSpan.className = "inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-lg bg-foreground/[0.06] text-[0.82rem] font-medium text-foreground align-middle whitespace-nowrap select-none";

    if (chip.thumbnail) {
      const img = document.createElement("img");
      img.src = chip.thumbnail;
      img.alt = "";
      img.className = "w-5 h-5 rounded object-cover";
      chipSpan.appendChild(img);
    } else {
      const iconWrap = document.createElement("span");
      iconWrap.className = "w-5 h-5 rounded bg-foreground/[0.08] flex items-center justify-center";
      iconWrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`;
      chipSpan.appendChild(iconWrap);
    }

    const labelSpan = document.createElement("span");
    labelSpan.textContent = chip.label;
    chipSpan.appendChild(labelSpan);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "ml-0.5 p-0.5 rounded hover:bg-foreground/[0.1] transition-colors";
    removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
    removeBtn.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      chipSpan.remove();
      setChips(prev => prev.filter(c => c.id !== chip.id));
      handleInput();
    };
    chipSpan.appendChild(removeBtn);

    range.deleteContents();
    range.insertNode(chipSpan);

    // Add a space after chip for typing
    const space = document.createTextNode("\u00A0");
    chipSpan.after(space);

    // Move cursor after the space
    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel!.removeAllRanges();
    sel!.addRange(newRange);

    handleInput();
  }, [handleInput]);

  const addChip = (type: AssetChip["type"], item: { id: string; label: string; thumbnail?: string }) => {
    if (chips.find(c => c.id === item.id)) return;
    const chip: AssetChip = { id: item.id, type, label: item.label, thumbnail: item.thumbnail };
    setChips(prev => [...prev, chip]);
    setAssetPickerOpen(false);
    setAssetSearch("");
    // Insert chip inline at cursor
    setTimeout(() => insertChipAtCursor(chip), 50);
  };

  const hasContent = chatInput.trim() || chips.length > 0;

  const filteredAssets = SAMPLE_ASSETS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      assetSearch ? item.label.toLowerCase().includes(assetSearch.toLowerCase()) : true
    ),
  })).filter(cat => cat.items.length > 0);

  // Handle paste — strip formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  return (
    <div className="rounded-xl border-2 border-accent/30 bg-background overflow-hidden">
      {/* Rich contenteditable input area */}
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

        {/* Contenteditable div — chips inline with text */}
        <div className="pl-12 pr-4 pt-3 pb-2 relative">
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            data-placeholder={PLACEHOLDERS[contentType]}
            className="min-h-[48px] text-sm text-foreground leading-relaxed outline-none break-words [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted [&:empty]:before:pointer-events-none"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center px-3 pb-2.5 gap-1 min-w-0">
        {/* + Button */}
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
                    const isAdded = chips.find(c => c.id === item.id);
                    const Icon = CHIP_ICON[cat.type];
                    return (
                      <button key={item.id} onClick={() => addChip(cat.type, item)} disabled={!!isAdded}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${isAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-foreground/[0.04]"}`}>
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="w-7 h-7 rounded object-cover" />
                        ) : (
                          <span className="w-7 h-7 rounded bg-foreground/[0.06] flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-muted" />
                          </span>
                        )}
                        <span className="font-medium">{item.label}</span>
                        {isAdded && <Check className="w-3.5 h-3.5 text-accent ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filteredAssets.length === 0 && <p className="text-center text-sm text-muted py-4">No assets found</p>}
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

        <div className="flex-1 min-w-0" />

        {/* Send */}
        <button onClick={onSend} disabled={isStreaming || !hasContent}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${hasContent && !isStreaming ? "bg-foreground text-background hover:bg-foreground/90" : "bg-foreground/10 text-muted"}`}>
          <Send className="w-4 h-4 -rotate-45" />
        </button>
      </div>
    </div>
  );
}
