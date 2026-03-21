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
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-3">
        <div className="flex-1 min-w-0 rounded-xl border-2 border-dashed border-foreground/[0.10] p-3 flex flex-col justify-center">
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
        </div>

        <div className="rounded-xl border-2 border-dashed border-foreground/[0.10] p-4 flex flex-col items-center justify-center min-w-[180px]">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-1.5 cursor-pointer w-full"
          >
            <Upload size={20} className="text-accent" />
            <span className="text-[0.8rem] font-bold text-foreground">Click To Upload</span>
            <span className="text-[0.68rem] text-muted/60">or, drag and drop an image here</span>
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
      </div>
    </div>
  );
}
