import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Move, RotateCcw } from "lucide-react";

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

interface ImagePositionEditorProps {
  src: string;
  position: ImagePosition;
  onSave: (position: ImagePosition) => void;
  onClose: () => void;
}

const ImagePositionEditor = ({ src, position, onSave, onClose }: ImagePositionEditorProps) => {
  const [pos, setPos] = useState<ImagePosition>(position);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
  }, [pos.x, pos.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos(p => ({
      ...p,
      x: Math.max(-50, Math.min(50, dragStart.current.posX + dx * 0.3)),
      y: Math.max(-50, Math.min(50, dragStart.current.posY + dy * 0.3)),
    }));
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    dragStart.current = { x: touch.clientX, y: touch.clientY, posX: pos.x, posY: pos.y };
  }, [pos.x, pos.y]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.x;
    const dy = touch.clientY - dragStart.current.y;
    setPos(p => ({
      ...p,
      x: Math.max(-50, Math.min(50, dragStart.current.posX + dx * 0.3)),
      y: Math.max(-50, Math.min(50, dragStart.current.posY + dy * 0.3)),
    }));
  }, [dragging]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove]);

  const zoom = (delta: number) => {
    setPos(p => ({ ...p, scale: Math.max(1, Math.min(3, p.scale + delta)) }));
  };

  const reset = () => setPos({ x: 0, y: 0, scale: 1 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl w-[90vw] max-w-[520px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.08]">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-muted" />
            <span className="font-semibold text-[0.9rem]">Adjust Position</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative aspect-square overflow-hidden cursor-grab active:cursor-grabbing bg-foreground/[0.04] select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-75"
            style={{
              transform: `translate(${pos.x}%, ${pos.y}%) scale(${pos.scale})`,
            }}
          />
          {/* Crosshair overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[0.72rem] px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            Drag To Reposition
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-foreground/[0.08]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => zoom(-0.2)}
              disabled={pos.scale <= 1}
              className="w-8 h-8 rounded-lg border border-foreground/[0.1] flex items-center justify-center hover:bg-foreground/[0.04] transition-colors disabled:opacity-30"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[0.78rem] text-muted w-12 text-center">{Math.round(pos.scale * 100)}%</span>
            <button
              onClick={() => zoom(0.2)}
              disabled={pos.scale >= 3}
              className="w-8 h-8 rounded-lg border border-foreground/[0.1] flex items-center justify-center hover:bg-foreground/[0.04] transition-colors disabled:opacity-30"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={reset}
              className="w-8 h-8 rounded-lg border border-foreground/[0.1] flex items-center justify-center hover:bg-foreground/[0.04] transition-colors ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.82rem] font-medium hover:bg-foreground/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(pos)}
              className="px-4 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-semibold hover:bg-accent/90 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePositionEditor;
