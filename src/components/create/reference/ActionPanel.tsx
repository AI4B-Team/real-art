import { useRef, useState } from "react";
import { Upload, Link2, Monitor, Camera } from "lucide-react";
import type { ReferenceImage } from "./types";
import { FILE_TYPE_BADGES } from "./data";

interface ActionPanelProps {
  onAdd: (ref: ReferenceImage) => void;
}

/* Real SVG social icons */
const SocialIcon = ({ id }: { id: string }) => {
  switch (id) {
    case "youtube":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "x":
      return (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "vimeo":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.123C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.263-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.482 4.807z" />
        </svg>
      );
    default:
      return null;
  }
};

const SOCIAL_ITEMS = [
  { id: "youtube", color: "hsl(0, 80%, 50%)", label: "YouTube" },
  { id: "tiktok", color: "hsl(0, 0%, 10%)", label: "TikTok" },
  { id: "instagram", color: "hsl(330, 70%, 55%)", label: "Instagram" },
  { id: "facebook", color: "hsl(220, 70%, 50%)", label: "Facebook" },
  { id: "x", color: "hsl(0, 0%, 10%)", label: "X" },
  { id: "vimeo", color: "hsl(195, 80%, 50%)", label: "Vimeo" },
];

export default function ActionPanel({ onAdd }: ActionPanelProps) {
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      onAdd({ id: crypto.randomUUID(), src: URL.createObjectURL(file), name: file.name });
    });
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    onAdd({ id: crypto.randomUUID(), src: urlInput.trim(), name: "URL Reference" });
    setUrlInput("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: Link input + Upload + Import/Record — all on one line */}
      <div className="flex items-stretch gap-3">
        {/* Paste link */}
        <div className="flex-1 min-w-0 rounded-xl border-2 border-dashed border-foreground/[0.10] p-3 flex flex-col justify-between">
          <div className="relative">
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUrlAdd()}
              placeholder="Paste A Supported Public Media Link"
              className="w-full pr-8 bg-transparent text-[0.78rem] outline-none placeholder:text-muted/50"
            />
            <button
              onClick={handleUrlAdd}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            >
              <Link2 size={15} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {SOCIAL_ITEMS.map(s => (
              <div
                key={s.id}
                className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: s.color }}
                title={s.label}
              >
                <SocialIcon id={s.id} />
              </div>
            ))}
            <span className="text-[0.68rem] text-muted/50 ml-1">+43</span>
          </div>
        </div>

        {/* Upload area */}
        <div className="rounded-xl border-2 border-dashed border-foreground/[0.10] p-4 flex flex-col items-center justify-center min-w-[180px]">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-1.5 cursor-pointer w-full"
          >
            <Upload size={20} className="text-accent" />
            <span className="text-[0.8rem] font-bold text-foreground">Click To Upload</span>
            <span className="text-[0.68rem] text-muted/60">or, drag and drop a file here</span>
          </button>
          <div className="flex items-center gap-1.5 mt-2.5">
            {FILE_TYPE_BADGES.map(b => (
              <span
                key={b.label}
                className="px-2 py-0.5 rounded text-[0.6rem] font-bold text-white"
                style={{ backgroundColor: b.color }}
              >
                {b.label}
              </span>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={e => { handleFiles(e.target.files); if (e.target) e.target.value = ""; }}
          />
        </div>

        {/* Import + Record */}
        <div className="flex flex-col gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/5 transition-all flex-1">
            <Monitor size={16} className="text-blue-600 shrink-0" />
            <span className="text-[0.72rem] font-semibold text-foreground whitespace-nowrap">Import From Zoom</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/5 transition-all flex-1">
            <Camera size={16} className="text-accent shrink-0" />
            <span className="text-[0.72rem] font-semibold text-foreground">Record</span>
          </button>
        </div>
      </div>
    </div>
  );
}
