import { useState, useRef } from "react";
import { Upload, ArrowLeftRight, X } from "lucide-react";

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
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    onChange(URL.createObjectURL(file));
  };

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
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-[160px] h-[160px] rounded-xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-2 hover:border-foreground/30 transition-colors cursor-pointer bg-foreground/[0.02]"
        >
          <Upload size={22} className="text-muted" />
          <span className="text-[0.78rem] text-muted">Upload</span>
        </button>
      )}
      <span className="text-[0.78rem] font-medium text-muted">{label}</span>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
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
        <ArrowLeftRight size={20} className="text-muted shrink-0" />
        <FrameSlot
          label="End Frame (Optional)"
          src={endFrame}
          onChange={onEndFrameChange}
          onClear={() => onEndFrameChange(null)}
        />
      </div>

      <p className="text-[0.7rem] text-muted/60 mt-3 text-center">Upload a start frame to animate from. Optionally add an end frame for interpolation.</p>
    </div>
  );
}
