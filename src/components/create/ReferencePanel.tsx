import { useState, useRef } from "react";
import { X, Upload, ImageIcon, Link2 } from "lucide-react";

interface ReferenceImage {
  id: string;
  src: string;
  name: string;
}

interface ReferencePanelProps {
  onClose: () => void;
  references: ReferenceImage[];
  onAdd: (ref: ReferenceImage) => void;
  onRemove: (id: string) => void;
}

export default function ReferencePanel({ onClose, references, onAdd, onRemove }: ReferencePanelProps) {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const id = crypto.randomUUID();
      const src = URL.createObjectURL(file);
      onAdd({ id, src, name: file.name });
    });
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    onAdd({ id: crypto.randomUUID(), src: urlInput.trim(), name: "URL Reference" });
    setUrlInput("");
    setShowUrlInput(false);
  };

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[0.85rem] font-bold">Reference Images</h3>
        <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
        {references.map(ref => (
          <div key={ref.id} className="relative group aspect-square rounded-lg overflow-hidden bg-foreground/[0.04]">
            <img src={ref.src} alt={ref.name} className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(ref.id)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Upload slot */}
        <button
          onClick={() => fileRef.current?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-1 hover:border-foreground/30 transition-colors cursor-pointer"
        >
          <Upload size={16} className="text-muted" />
          <span className="text-[0.65rem] text-muted">Upload</span>
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* URL input */}
      {showUrlInput ? (
        <div className="flex items-center gap-2">
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUrlAdd()}
            placeholder="Paste image URL..."
            className="flex-1 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg px-3 py-2 text-[0.82rem] outline-none focus:border-accent"
          />
          <button onClick={handleUrlAdd} className="px-3 py-2 rounded-lg bg-accent text-white text-[0.78rem] font-semibold">Add</button>
          <button onClick={() => setShowUrlInput(false)} className="text-muted hover:text-foreground"><X size={14} /></button>
        </div>
      ) : (
        <button
          onClick={() => setShowUrlInput(true)}
          className="flex items-center gap-1.5 text-[0.78rem] text-muted hover:text-foreground font-medium transition-colors"
        >
          <Link2 size={13} /> Add from URL
        </button>
      )}

      <p className="text-[0.7rem] text-muted/60 mt-2">Add up to 6 reference images to guide the AI generation style.</p>
    </div>
  );
}
