import { X } from "lucide-react";
import type { ReferencePanelProps } from "./reference/types";
import BrowsePanel from "./reference/BrowsePanel";

export type { ReferenceImage } from "./reference/types";

export default function ReferencePanel({ onClose, references, onAdd, onRemove }: ReferencePanelProps) {
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
              <img src={ref.src} alt={ref.name} className="w-10 h-10 rounded-lg object-cover border border-foreground/[0.08]" />
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
    </div>
  );
}
