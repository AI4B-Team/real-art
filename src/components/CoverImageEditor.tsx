import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, ImageIcon, ZoomIn, ZoomOut, Move, Check, X } from "lucide-react";

interface CoverImageEditorProps {
  uploadedImages: { file: File; preview: string }[];
  coverPreview: string | null;
  onCoverChange: (preview: string | null, file: File | null, position: { x: number; y: number; scale: number }) => void;
  position: { x: number; y: number; scale: number };
}

const CoverImageEditor = ({ uploadedImages, coverPreview, onCoverChange, position }: CoverImageEditorProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localPos, setLocalPos] = useState(position);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalPos(position);
  }, [position]);

  const handleUploadCover = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        const newPos = { x: 50, y: 50, scale: 1 };
        setLocalPos(newPos);
        onCoverChange(preview, file, newPos);
        setShowPicker(false);
      }
    };
    input.click();
  };

  const handlePickImage = (img: { file: File; preview: string }) => {
    const newPos = { x: 50, y: 50, scale: 1 };
    setLocalPos(newPos);
    onCoverChange(img.preview, img.file, newPos);
    setShowPicker(false);
  };

  const handleRemoveCover = () => {
    onCoverChange(null, null, { x: 50, y: 50, scale: 1 });
    setLocalPos({ x: 50, y: 50, scale: 1 });
  };

  const handleZoom = (delta: number) => {
    const newScale = Math.min(3, Math.max(1, localPos.scale + delta));
    const newPos = { ...localPos, scale: newScale };
    setLocalPos(newPos);
    onCoverChange(coverPreview, null, newPos);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!coverPreview) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [coverPreview]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.y) / rect.height) * 100;
    const newX = Math.min(100, Math.max(0, localPos.x - dx));
    const newY = Math.min(100, Math.max(0, localPos.y - dy));
    setDragStart({ x: e.clientX, y: e.clientY });
    const newPos = { ...localPos, x: newX, y: newY };
    setLocalPos(newPos);
    onCoverChange(coverPreview, null, newPos);
  }, [isDragging, dragStart, localPos, coverPreview, onCoverChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!coverPreview) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, [coverPreview]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((touch.clientX - dragStart.x) / rect.width) * 100;
    const dy = ((touch.clientY - dragStart.y) / rect.height) * 100;
    const newX = Math.min(100, Math.max(0, localPos.x - dx));
    const newY = Math.min(100, Math.max(0, localPos.y - dy));
    setDragStart({ x: touch.clientX, y: touch.clientY });
    const newPos = { ...localPos, x: newX, y: newY };
    setLocalPos(newPos);
    onCoverChange(coverPreview, null, newPos);
  }, [isDragging, dragStart, localPos, coverPreview, onCoverChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
      return () => {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, handleTouchMove, handleMouseUp]);

  return (
    <div className="mb-6">
      <label className="block text-[0.82rem] font-semibold mb-2">Cover Image</label>

      {!coverPreview ? (
        <div className="relative">
          <div
            className="h-[180px] rounded-2xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-foreground/30 transition-colors"
            onClick={() => setShowPicker(true)}
          >
            <ImageIcon className="w-8 h-8 text-muted" />
            <div className="text-center">
              <p className="text-[0.88rem] font-medium">Add a Cover Image</p>
              <p className="text-[0.75rem] text-muted">Upload or choose from your images</p>
            </div>
          </div>

          {showPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-foreground/[0.1] rounded-xl shadow-lg z-10 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[0.82rem] font-semibold">Choose Cover</span>
                <button onClick={() => setShowPicker(false)} className="text-muted hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleUploadCover}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-foreground/[0.1] hover:bg-muted/20 transition-colors mb-3"
              >
                <Upload className="w-5 h-5 text-muted" />
                <div className="text-left">
                  <div className="text-[0.85rem] font-medium">Upload New Image</div>
                  <div className="text-[0.72rem] text-muted">JPG, PNG, WebP</div>
                </div>
              </button>

              {uploadedImages.length > 0 && (
                <>
                  <div className="text-[0.75rem] text-muted mb-2">Or choose from uploaded images</div>
                  <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                    {uploadedImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => handlePickImage(img)}
                        className="aspect-square rounded-lg overflow-hidden hover:ring-2 ring-accent transition-all"
                      >
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            ref={containerRef}
            className="relative h-[200px] rounded-2xl overflow-hidden select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <img
              src={coverPreview}
              alt="Cover preview"
              className="absolute w-full h-full pointer-events-none"
              draggable={false}
              style={{
                objectFit: "cover",
                objectPosition: `${localPos.x}% ${localPos.y}%`,
                transform: `scale(${localPos.scale})`,
                transformOrigin: `${localPos.x}% ${localPos.y}%`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[0.68rem] px-2.5 py-1 rounded-lg pointer-events-none">
              <Move className="w-3 h-3" /> Drag to reposition
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleZoom(-0.25)}
                disabled={localPos.scale <= 1}
                className="w-8 h-8 rounded-lg border border-foreground/[0.1] flex items-center justify-center hover:bg-muted/20 transition-colors disabled:opacity-30"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="text-[0.72rem] text-muted w-12 text-center">{Math.round(localPos.scale * 100)}%</div>
              <button
                onClick={() => handleZoom(0.25)}
                disabled={localPos.scale >= 3}
                className="w-8 h-8 rounded-lg border border-foreground/[0.1] flex items-center justify-center hover:bg-muted/20 transition-colors disabled:opacity-30"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPicker(true)}
                className="text-[0.75rem] text-muted hover:text-foreground font-medium transition-colors"
              >
                Change
              </button>
              <button
                onClick={handleRemoveCover}
                className="text-[0.75rem] text-accent hover:underline font-medium"
              >
                Remove
              </button>
            </div>
          </div>

          {showPicker && (
            <div className="bg-card border border-foreground/[0.1] rounded-xl shadow-lg z-10 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[0.82rem] font-semibold">Choose Cover</span>
                <button onClick={() => setShowPicker(false)} className="text-muted hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleUploadCover}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-foreground/[0.1] hover:bg-muted/20 transition-colors mb-3"
              >
                <Upload className="w-5 h-5 text-muted" />
                <div className="text-left">
                  <div className="text-[0.85rem] font-medium">Upload New Image</div>
                  <div className="text-[0.72rem] text-muted">JPG, PNG, WebP</div>
                </div>
              </button>

              {uploadedImages.length > 0 && (
                <>
                  <div className="text-[0.75rem] text-muted mb-2">Or choose from uploaded images</div>
                  <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                    {uploadedImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => handlePickImage(img)}
                        className="aspect-square rounded-lg overflow-hidden hover:ring-2 ring-accent transition-all"
                      >
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoverImageEditor;
