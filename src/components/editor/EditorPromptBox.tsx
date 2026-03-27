import { useState, useRef, useCallback, KeyboardEvent } from "react";
import {
  Video, Image, AudioLines, Mic, User, Link, Copy, Clock, Hash,
  Heart, Sparkles, Music, Upload, Box, Send, ChevronDown, Shuffle,
  Loader2, Zap, Check, X as XIcon, Plus, FileText,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAtMention } from "@/hooks/useAtMention";
import MentionDropdown from "@/components/MentionDropdown";

type ContentType = "video" | "image" | "audio";

export interface AssetChip {
  id: string;
  type: "character" | "video" | "image" | "script" | "music" | "audio";
  label: string;
  thumbnail?: string;
}

const CHIP_ICON: Record<AssetChip["type"], string> = {
  character: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`,
  image: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  script: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
  music: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  audio: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>`,
};

const LUCIDE_ICONS: Record<AssetChip["type"], typeof User> = {
  character: User, video: Video, image: Image, script: FileText, music: Music, audio: AudioLines,
};

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

const X_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

interface EditorPromptBoxProps {
  editorType: ContentType;
  chatInput: string;
  onChatInputChange: (val: string) => void;
  onSend: (richHtml?: string) => void;
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

function createChipElement(chip: AssetChip, onRemoveCallback: (id: string) => void): HTMLSpanElement {
  const chipSpan = document.createElement("span");
  chipSpan.contentEditable = "false";
  chipSpan.dataset.chipId = chip.id;
  chipSpan.dataset.chipType = chip.type;
  chipSpan.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:2px 8px;margin:0 2px;border-radius:8px;font-size:0.82rem;font-weight:500;white-space:nowrap;user-select:none;vertical-align:middle;background:hsl(var(--foreground)/0.06);color:hsl(var(--foreground));";

  if (chip.thumbnail) {
    const img = document.createElement("img");
    img.src = chip.thumbnail;
    img.alt = "";
    img.style.cssText = "width:20px;height:20px;border-radius:4px;object-fit:cover;";
    chipSpan.appendChild(img);
  } else {
    const iconWrap = document.createElement("span");
    iconWrap.style.cssText = "width:20px;height:20px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;background:hsl(var(--foreground)/0.08);color:hsl(var(--muted-foreground));";
    iconWrap.innerHTML = CHIP_ICON[chip.type];
    chipSpan.appendChild(iconWrap);
  }

  const labelNode = document.createTextNode(chip.label);
  chipSpan.appendChild(labelNode);

  const removeBtn = document.createElement("button");
  removeBtn.style.cssText = "margin-left:2px;padding:2px;border-radius:4px;border:none;background:transparent;cursor:pointer;display:inline-flex;align-items:center;";
  removeBtn.innerHTML = X_SVG;
  removeBtn.onmousedown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    chipSpan.remove();
    onRemoveCallback(chip.id);
  };
  chipSpan.appendChild(removeBtn);

  return chipSpan;
}

export default function EditorPromptBox({ editorType, chatInput, onChatInputChange, onSend, isStreaming = false }: EditorPromptBoxProps) {
  const [contentType, setContentType] = useState<ContentType>(editorType);
  const [isContentTypeOpen, setIsContentTypeOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [chipIds, setChipIds] = useState<Set<string>>(new Set());
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const editableRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const pendingFocusRangeRef = useRef<Range | null>(null);
  const { mention, checkForMention, consumeMention, dismissMention } = useAtMention(editableRef);

  const currentType = CONTENT_TYPES.find(t => t.id === contentType)!;
  const ContentIcon = currentType.icon;

  const extractText = useCallback(() => {
    if (!editableRef.current) return "";
    let text = "";
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || "";
      } else if (node.nodeName === "BR") {
        text += "\n";
      } else if ((node as HTMLElement).dataset?.chipId) {
        // chip — skip for text extraction
      } else {
        node.childNodes.forEach(walk);
      }
    };
    editableRef.current.childNodes.forEach(walk);
    return text;
  }, []);

  const syncText = useCallback(() => {
    onChatInputChange(extractText());
  }, [extractText, onChatInputChange]);

  const handleInput = useCallback(() => { syncText(); checkForMention(); }, [syncText, checkForMention]);

  const handleSend = useCallback(() => {
    const el = editableRef.current;
    if (!el) return;
    // Clone and strip remove buttons for clean chat display
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('button').forEach(btn => btn.remove());
    const html = clone.innerHTML;
    onSend(html || undefined);
    // Clear contentEditable and chips
    el.innerHTML = "";
    setChipIds(new Set());
    onChatInputChange("");
  }, [onSend, onChatInputChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleEnhance = () => {
    if (!chatInput.trim()) return;
    setIsEnhancing(true);
    setTimeout(() => {
      if (editableRef.current) {
        editableRef.current.appendChild(document.createTextNode(" — cinematic lighting, dramatic composition"));
        syncText();
      }
      setIsEnhancing(false);
    }, 1200);
  };

  // Save cursor position before popover opens
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editableRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreEditableCaret = useCallback((range?: Range | null) => {
    const el = editableRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });

      const selection = window.getSelection();
      if (!selection) return;

      selection.removeAllRanges();

      if (range) {
        selection.addRange(range);
      }
    });
  }, []);

  const handleAssetPopoverCloseAutoFocus = useCallback((event: Event) => {
    if (!pendingFocusRangeRef.current) return;

    event.preventDefault();
    const range = pendingFocusRangeRef.current.cloneRange();
    pendingFocusRangeRef.current = null;
    restoreEditableCaret(range);
  }, [restoreEditableCaret]);

  const removeChip = useCallback((id: string) => {
    setChipIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    syncText();
  }, [syncText]);

  const addChip = useCallback((type: AssetChip["type"], item: { id: string; label: string; thumbnail?: string }) => {
    if (chipIds.has(item.id)) return;
    const chip: AssetChip = { id: item.id, type, label: item.label, thumbnail: item.thumbnail };

    setChipIds(prev => new Set(prev).add(item.id));
    setAssetPickerOpen(false);
    setAssetSearch("");

    // Restore saved selection or place at end
    requestAnimationFrame(() => {
      const el = editableRef.current;
      if (!el) return;
      el.focus();

      const sel = window.getSelection();
      if (!sel) return;

      let range: Range;
      if (savedRangeRef.current && el.contains(savedRangeRef.current.startContainer)) {
        range = savedRangeRef.current;
      } else {
        range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
      }

      sel.removeAllRanges();
      sel.addRange(range);

      const chipEl = createChipElement(chip, removeChip);
      range.deleteContents();
      range.insertNode(chipEl);

      // Add a space after chip
      const space = document.createTextNode("\u00A0");
      chipEl.after(space);

      // Move cursor after space
      const newRange = document.createRange();
      newRange.setStart(space, space.textContent?.length ?? 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      const caretRange = newRange.cloneRange();
      savedRangeRef.current = caretRange;
      pendingFocusRangeRef.current = caretRange;
      syncText();

      restoreEditableCaret(caretRange);
    });
  }, [chipIds, removeChip, restoreEditableCaret, syncText]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const hasContent = chatInput.trim() || chipIds.size > 0;

  const filteredAssets = SAMPLE_ASSETS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      assetSearch ? item.label.toLowerCase().includes(assetSearch.toLowerCase()) : true
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="rounded-xl border-2 border-accent/30 bg-background overflow-hidden">
      {/* Rich contenteditable input */}
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

        <div className="pl-12 pr-4 pt-3 pb-2">
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            data-placeholder={PLACEHOLDERS[contentType]}
            className="min-h-[48px] text-sm text-foreground leading-[1.8] outline-none break-words [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted [&:empty]:before:pointer-events-none"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center px-3 pb-2.5 gap-1 min-w-0">
        <Popover open={assetPickerOpen} onOpenChange={(open) => {
          if (open) saveSelection();
          setAssetPickerOpen(open);
        }}>
          <PopoverTrigger asChild>
            <button className="p-1.5 rounded-lg text-foreground hover:bg-foreground/[0.06] transition-colors shrink-0">
              <Plus className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start" sideOffset={8} onCloseAutoFocus={handleAssetPopoverCloseAutoFocus}>
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
                    const isAdded = chipIds.has(item.id);
                    const Icon = LUCIDE_ICONS[cat.type];
                    return (
                      <button key={item.id} onMouseDown={(e) => e.preventDefault()} onClick={() => addChip(cat.type, item)} disabled={isAdded}
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
            <button onClick={() => { if (!chatInput.trim()) return; setIsEnhancing(true); setTimeout(() => { if (editableRef.current) { editableRef.current.appendChild(document.createTextNode(" — quick enhancement")); syncText(); } setIsEnhancing(false); }, 800); }}
              className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Enhance
            </button>
            <button onClick={() => { if (!chatInput.trim()) return; setIsEnhancing(true); setTimeout(() => { if (editableRef.current) { editableRef.current.appendChild(document.createTextNode(" — cinematic, detailed, high quality")); syncText(); } setIsEnhancing(false); }, 1500); }}
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

        <button onClick={handleSend} disabled={isStreaming || !hasContent}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${hasContent && !isStreaming ? "bg-foreground text-background hover:bg-foreground/90" : "bg-foreground/10 text-muted"}`}>
          <Send className="w-4 h-4 -rotate-45" />
        </button>
      </div>
    </div>
  );
}
