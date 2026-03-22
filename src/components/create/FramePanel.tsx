import { useState } from "react";
import { ArrowLeftRight, X, Upload } from "lucide-react";
import FramePickerModal from "./FramePickerModal";

interface FramePanelProps {
  onClose: () => void;
  startFrame: string | null;
  endFrame: string | null;
  onStartFrameChange: (src: string | null) => void;
  onEndFrameChange: (src: string | null) => void;
}

function FrameSlot({
  label,
  src,
  onChange,
  onClear,
}: {
  label: string;
  src: string | null;
  onChange: (src: string) => void;
  onClear: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      {src ? (
        <div className="relative w-[160px] h-[160px] rounded-xl overflow-hidden group">
          <img src={src} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
          <button
            onClick={() => setShowPicker(true)}
            className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all"
          >
            <span className="text-white text-[0.75rem] font-semibold">Replace</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="w-[160px] h-[160px] rounded-xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-2 hover:border-foreground/30 transition-colors cursor-pointer bg-foreground/[0.02]"
        >
          <Upload size={22} className="text-muted" />
          <span className="text-[0.78rem] text-muted">Choose image</span>
        </button>
      )}
      <span className="text-[0.78rem] font-medium text-muted">{label}</span>

      {showPicker && (
        <FramePickerModal
          label={label}
          onSelect={(imgSrc) => { onChange(imgSrc); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export default function FramePanel({ onClose, startFrame, endFrame, onStartFrameChange, onEndFrameChange }: FramePanelProps) {
  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background p-5 mt-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[0.85rem] font-bold">Animation Frames</h3>
        <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <FrameSlot
          label="Start Frame"
          src={startFrame}
          onChange={onStartFrameChange}
          onClear={() => onStartFrameChange(null)}
        />
        <button
          type="button"
          onClick={() => {
            if (startFrame || endFrame) {
              onStartFrameChange(endFrame);
              onEndFrameChange(startFrame);
            }
          }}
          disabled={!startFrame && !endFrame}
          className="p-2 rounded-lg hover:bg-foreground/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          title="Swap frames"
        >
          <ArrowLeftRight size={20} className="text-muted" />
        </button>
        <FrameSlot
          label="End Frame (Optional)"
          src={endFrame}
          onChange={onEndFrameChange}
          onClear={() => onEndFrameChange(null)}
        />
      </div>

      <p className="text-[0.7rem] text-muted/60 mt-3 text-center">Choose a start frame from your computer, past creations, community, or stock photos.</p>
    </div>
  );
}
