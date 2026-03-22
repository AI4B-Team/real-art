import { useState } from "react";
import { X } from "lucide-react";
import type { ReferencePanelProps } from "./reference/types";
import BrowsePanel from "./reference/BrowsePanel";

export type { ReferenceImage } from "./reference/types";

export default function ReferencePanel({ onClose, references, onAdd, onRemove }: ReferencePanelProps) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background p-5 mt-3">
      {/* Close + reference count */}
      <div className="flex items-center justify-end gap-2 mb-1">
        {references.length > 0 && (
          <span className="text-[0.7rem] text-muted font-medium">{references.length}/6 added</span>
        )}
        <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Current references strip */}
      {references.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto overflow-y-visible pb-1 pt-2 pr-2">
          {references.map(ref => (
            <div key={ref.id} className="relative group shrink-0">
              <img
                src={ref.src}
                alt={ref.name}
                className="w-10 h-10 rounded-lg object-cover border border-foreground/[0.08] cursor-pointer hover:ring-2 hover:ring-accent/40 transition-all"
                onClick={() => setPreviewSrc(ref.src)}
              />
              <button
                onClick={() => onRemove(ref.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={8} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Browse panel */}
      <BrowsePanel references={references} onAdd={onAdd} />

      <p className="text-[0.68rem] text-muted/50 mt-4">Add up to 6 reference images to guide the AI generation style.</p>

      {/* Lightbox modal */}
      {previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setPreviewSrc(null)}
        >
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <img src={previewSrc} alt="Preview" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <button
              onClick={() => setPreviewSrc(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:bg-accent/85 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
