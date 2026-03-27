import { User, Video, Image, FileText, Music, AudioLines } from "lucide-react";

export interface AssetChip {
  id: string;
  type: "character" | "video" | "image" | "script" | "music" | "audio";
  label: string;
  thumbnail?: string;
}

const CHIP_ICON_SVG: Record<AssetChip["type"], string> = {
  character: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`,
  image: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  script: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
  music: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  audio: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>`,
};

export const PROMPT_CHIP_ICONS: Record<AssetChip["type"], typeof User> = {
  character: User, video: Video, image: Image, script: FileText, music: Music, audio: AudioLines,
};

export const PROMPT_SAMPLE_ASSETS: { category: string; type: AssetChip["type"]; items: { id: string; label: string; thumbnail?: string }[] }[] = [
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

export function createChipElement(chip: AssetChip, onRemoveCallback: (id: string) => void): HTMLSpanElement {
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
    iconWrap.innerHTML = CHIP_ICON_SVG[chip.type];
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
