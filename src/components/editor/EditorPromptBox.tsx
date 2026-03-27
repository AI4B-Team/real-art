import { useState, useRef, useCallback } from "react";
import {
  Video, Image, AudioLines, Hash,
  Sparkles, Send, ChevronDown, Shuffle,
  Loader2, Zap, Check, Plus, Upload,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAtMention } from "@/hooks/useAtMention";
import MentionDropdown from "@/components/MentionDropdown";
import { PROMPT_SAMPLE_ASSETS, PROMPT_CHIP_ICONS, createChipElement, makeUploadedImageChip, type AssetChip } from "@/lib/promptChips";

type ContentType = "video" | "image" | "audio";

interface EditorPromptBoxProps {
  editorType: ContentType;
  chatInput: string;
  onChatInputChange: (val: string) => void;
  onSend: (richHtml?: string) => void;
  isStreaming?: boolean;
}

export type { AssetChip };

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
  const [chipIds, setChipIds] = useState<Set<string>>(new Set());
  const [uploadedImgCount, setUploadedImgCount] = useState(0);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const editableRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const pendingFocusRangeRef = useRef<Range | null>(null);
  const imgUploadRef = useRef<HTMLInputElement>(null);
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
    if (mention.active && e.key === "Escape") { e.preventDefault(); dismissMention(); return; }
    if (e.key === "Enter" && !e.shiftKey && !mention.active) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend, mention.active, dismissMention]);

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

  const addChipFromMention = useCallback((type: AssetChip["type"], item: { id: string; label: string; thumbnail?: string }) => {
    if (chipIds.has(item.id)) return;
    const chip: AssetChip = { id: item.id, type, label: item.label, thumbnail: item.thumbnail };
    const rangeAtMention = consumeMention();
    setChipIds(prev => new Set(prev).add(item.id));

    requestAnimationFrame(() => {
      const el = editableRef.current;
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      if (!sel) return;

      let range = rangeAtMention;
      if (!range || !el.contains(range.startContainer)) {
        range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
      }
      sel.removeAllRanges();
      sel.addRange(range);

      const chipEl = createChipElement(chip, removeChip);
      range.deleteContents();
      range.insertNode(chipEl);

      const space = document.createTextNode("\u00A0");
      chipEl.after(space);
      const newRange = document.createRange();
      newRange.setStart(space, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      savedRangeRef.current = newRange.cloneRange();
      pendingFocusRangeRef.current = newRange.cloneRange();
      syncText();
      restoreEditableCaret(newRange.cloneRange());
    });
  }, [chipIds, consumeMention, removeChip, restoreEditableCaret, syncText]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const hasContent = chatInput.trim() || chipIds.size > 0;

  const filteredAssets = PROMPT_SAMPLE_ASSETS.map(cat => ({
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

        <div className="pl-12 pr-4 pt-3 pb-2 relative">
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
          {mention.active && mention.anchorRect && (
            <MentionDropdown
              assets={PROMPT_SAMPLE_ASSETS}
              query={mention.query}
              position={mention.anchorRect}
              chipIds={chipIds}
              onSelect={addChipFromMention}
            />
          )}
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
