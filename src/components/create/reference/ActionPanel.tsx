import { useRef, useState } from "react";
import { Upload, Link2, Monitor, Camera, Mic } from "lucide-react";
import type { ReferenceImage } from "./types";
import { FILE_TYPE_BADGES, SOCIAL_ICONS } from "./data";

interface ActionPanelProps {
  onAdd: (ref: ReferenceImage) => void;
}

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
    <div className="w-[280px] shrink-0 flex flex-col gap-3">
      {/* Paste link input */}
      <div className="rounded-xl border-2 border-dashed border-foreground/[0.10] p-3">
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

        {/* Social icons row */}
        <div className="flex items-center gap-1.5 mt-3">
          {SOCIAL_ICONS.map(s => (
            <div
              key={s.id}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: s.color }}
              title={s.label}
            >
              {s.label.charAt(0)}
            </div>
          ))}
          <span className="text-[0.68rem] text-muted/50 ml-1">+43</span>
        </div>
      </div>

      {/* Upload area */}
      <div className="rounded-xl border-2 border-dashed border-foreground/[0.10] p-4 flex flex-col items-center">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-2 cursor-pointer w-full"
        >
          <Upload size={22} className="text-accent" />
          <span className="text-[0.82rem] font-bold text-foreground">Click To Upload</span>
          <span className="text-[0.7rem] text-muted/60">or, drag and drop a file here</span>
        </button>

        {/* File type badges */}
        <div className="flex items-center gap-1.5 mt-3">
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

      {/* Import from Zoom + Record */}
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center gap-2 px-3 py-3 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/5 transition-all">
          <Monitor size={16} className="text-blue-600 shrink-0" />
          <span className="text-[0.72rem] font-semibold text-foreground">Import From Zoom</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-3 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/5 transition-all">
          <Camera size={16} className="text-accent shrink-0" />
          <span className="text-[0.72rem] font-semibold text-foreground">Record</span>
        </button>
      </div>
    </div>
  );
}
