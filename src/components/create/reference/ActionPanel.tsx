import { useRef, useState } from "react";
import { Upload, Link2 } from "lucide-react";
import type { ReferenceImage } from "./types";

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
    <div className="flex items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleUrlAdd()}
          placeholder="Paste a link or URL"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-foreground/[0.03] border border-foreground/[0.08] text-[0.8rem] outline-none focus:border-accent transition-colors"
        />
      </div>
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground/[0.05] hover:bg-foreground/[0.08] text-[0.8rem] font-semibold text-foreground transition-colors shrink-0"
      >
        <Upload size={14} className="text-accent" />
        Upload
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { handleFiles(e.target.files); if (e.target) e.target.value = ""; }}
      />
    </div>
  );
}
