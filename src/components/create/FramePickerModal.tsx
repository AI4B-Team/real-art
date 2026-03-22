import { useState } from "react";
import { X } from "lucide-react";
import FrameSourcePicker from "./FrameSourcePicker";
import type { FrameSelectionMeta } from "./FrameSourcePicker";

interface FramePickerModalProps {
  label: string;
  onSelect: (src: string, meta?: FrameSelectionMeta) => void;
  onClose: () => void;
}

export default function FramePickerModal({ label, onSelect, onClose }: FramePickerModalProps) {
  const [isBrowsing, setIsBrowsing] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-background border border-foreground/[0.1] rounded-2xl p-5 max-w-[92vw] shadow-2xl transition-all duration-300 ${
          isBrowsing ? "w-[820px]" : "w-[520px]"
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[0.92rem] font-bold">Choose {label} Frame</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
        </div>
        <FrameSourcePicker
          onSelect={onSelect}
          onClose={onClose}
          onBrowseModeChange={setIsBrowsing}
        />
      </div>
    </div>
  );
}
