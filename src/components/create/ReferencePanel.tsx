import { useState, useRef } from "react";
import {
  X, Upload, Search, Link2, Camera, Video as VideoIcon,
  Image as ImageIcon, LayoutGrid, Filter, Check, Globe,
  Instagram, Youtube, Twitter, Film, Monitor, Mic,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────── */

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

type SourceTab = "creations" | "stock" | "community" | "upload" | "link" | "record";
type MediaFilter = "all" | "image" | "video" | "audio" | "design";

/* ─── Dummy data ────────────────────────────────── */

const DUMMY_CREATIONS = [
  { id: "cr1", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop", title: "Cosmic Dreamscape", type: "image" as MediaFilter },
  { id: "cr2", src: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=200&fit=crop", title: "Neon Boulevard", type: "image" as MediaFilter },
  { id: "cr3", src: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=200&h=200&fit=crop", title: "Brand Identity", type: "design" as MediaFilter },
  { id: "cr4", src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop", title: "Cyberpunk Portrait", type: "image" as MediaFilter },
  { id: "cr5", src: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=200&h=200&fit=crop", title: "Promo Video", type: "video" as MediaFilter },
  { id: "cr6", src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&h=200&fit=crop", title: "Ethereal Forest", type: "image" as MediaFilter },
];

const DUMMY_STOCK = [
  { id: "st1", src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&fit=crop", title: "Mountain Lake", type: "image" as MediaFilter },
  { id: "st2", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop", title: "Rolling Hills", type: "image" as MediaFilter },
  { id: "st3", src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop", title: "Starry Night", type: "image" as MediaFilter },
  { id: "st4", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&h=200&fit=crop", title: "Abstract Art", type: "design" as MediaFilter },
  { id: "st5", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop", title: "Studio Portrait", type: "image" as MediaFilter },
  { id: "st6", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", title: "Clean Headshot", type: "image" as MediaFilter },
];

const DUMMY_COMMUNITY = [
  { id: "cm1", src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop", title: "Elegant Portrait", creator: "leila_art", type: "image" as MediaFilter },
  { id: "cm2", src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop", title: "Expressive Face", creator: "suki_vis", type: "image" as MediaFilter },
  { id: "cm3", src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop", title: "Outdoor Pose", creator: "marcus_fx", type: "image" as MediaFilter },
  { id: "cm4", src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop", title: "Modern Look", creator: "jordan_c", type: "image" as MediaFilter },
  { id: "cm5", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop", title: "Dream Canvas", creator: "xavierml", type: "design" as MediaFilter },
  { id: "cm6", src: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=200&h=200&fit=crop", title: "Dark Fantasy", creator: "arcanist", type: "image" as MediaFilter },
];

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/p/..." },
  { id: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/watch?v=..." },
  { id: "x", label: "X / Twitter", icon: Twitter, placeholder: "https://x.com/.../status/..." },
  { id: "tiktok", label: "TikTok", icon: Film, placeholder: "https://tiktok.com/@.../video/..." },
  { id: "other", label: "Any URL", icon: Globe, placeholder: "https://..." },
];

const MEDIA_FILTERS: { id: MediaFilter; label: string; icon: typeof LayoutGrid }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "image", label: "Images", icon: ImageIcon },
  { id: "video", label: "Videos", icon: VideoIcon },
  { id: "design", label: "Designs", icon: Filter },
];

const SOURCE_TABS: { id: SourceTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "creations", label: "Creations", icon: LayoutGrid },
  { id: "stock", label: "Stock", icon: ImageIcon },
  { id: "community", label: "Community", icon: Globe },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "link", label: "Link", icon: Link2 },
  { id: "record", label: "Record", icon: Camera },
];

/* ─── Component ─────────────────────────────────── */

export default function ReferencePanel({ onClose, references, onAdd, onRemove }: ReferencePanelProps) {
  const [tab, setTab] = useState<SourceTab>("creations");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [search, setSearch] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [selectedSocial, setSelectedSocial] = useState("other");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refIds = new Set(references.map(r => r.id));

  /* helpers */
  const filterItems = (items: { id: string; title: string; type: MediaFilter }[]) => {
    let out = items;
    if (mediaFilter !== "all") out = out.filter(i => i.type === mediaFilter);
    if (search) out = out.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    return out;
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSelected = (pool: { id: string; src: string; title: string }[]) => {
    pool.filter(i => selected.has(i.id)).forEach(i => {
      if (!refIds.has(i.id)) onAdd({ id: i.id, src: i.src, name: i.title });
    });
    setSelected(new Set());
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const id = crypto.randomUUID();
      onAdd({ id, src: URL.createObjectURL(file), name: file.name });
    });
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    onAdd({ id: crypto.randomUUID(), src: urlInput.trim(), name: selectedSocial === "other" ? "URL Reference" : `${selectedSocial} Reference` });
    setUrlInput("");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      setIsRecording(true);
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }, 100);
    } catch { /* denied */ }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    c.toBlob(blob => {
      if (!blob) return;
      onAdd({ id: crypto.randomUUID(), src: URL.createObjectURL(blob), name: "Camera capture" });
    }, "image/jpeg", 0.9);
    stopCamera();
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setIsRecording(false);
  };

  /* grid renderer */
  const renderGrid = (items: { id: string; src: string; title: string; creator?: string }[]) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[260px] overflow-y-auto pr-1">
      {items.map(item => {
        const isAdded = refIds.has(item.id);
        const isSel = selected.has(item.id);
        return (
          <button
            key={item.id}
            onClick={() => !isAdded && toggleSelect(item.id)}
            disabled={isAdded}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              isAdded ? "border-accent/40 opacity-60 cursor-default"
              : isSel ? "border-accent ring-2 ring-accent/20"
              : "border-transparent hover:border-foreground/20"
            }`}
          >
            <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
            {(isSel || isAdded) && (
              <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center ${isAdded ? "bg-accent/60" : "bg-accent"}`}>
                <Check size={12} className="text-white" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-4">
              <span className="text-[0.6rem] text-white font-medium leading-tight line-clamp-1">{item.title}</span>
              {item.creator && <span className="text-[0.55rem] text-white/60">@{item.creator}</span>}
            </div>
          </button>
        );
      })}
      {items.length === 0 && (
        <p className="col-span-full text-center text-[0.78rem] text-muted py-6">No results found</p>
      )}
    </div>
  );

  const showMediaFilters = tab === "creations" || tab === "stock" || tab === "community";
  const showSearch = tab === "creations" || tab === "stock" || tab === "community";

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background p-4 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[0.85rem] font-bold">Reference Images</h3>
        <div className="flex items-center gap-2">
          {references.length > 0 && (
            <span className="text-[0.7rem] text-muted font-medium">{references.length}/6 added</span>
          )}
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
        </div>
      </div>

      {/* Current references strip */}
      {references.length > 0 && (
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
          {references.map(ref => (
            <div key={ref.id} className="relative group shrink-0">
              <img src={ref.src} alt={ref.name} className="w-10 h-10 rounded-lg object-cover border border-foreground/[0.08]" />
              <button
                onClick={() => onRemove(ref.id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={8} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Source tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto">
        {SOURCE_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch(""); setSelected(new Set()); if (t.id !== "record") stopCamera(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold whitespace-nowrap transition-colors shrink-0 ${
              tab === t.id
                ? "bg-foreground/[0.08] text-foreground"
                : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + media filters */}
      {showSearch && (
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] text-[0.78rem] outline-none focus:border-accent transition-colors"
            />
          </div>
          {showMediaFilters && (
            <div className="flex items-center gap-0.5">
              {MEDIA_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setMediaFilter(f.id)}
                  className={`px-2 py-1.5 rounded-md text-[0.7rem] font-semibold transition-colors ${
                    mediaFilter === f.id
                      ? "bg-foreground/[0.08] text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab content ── */}

      {/* Creations */}
      {tab === "creations" && (
        <>
          {renderGrid(filterItems(DUMMY_CREATIONS))}
          {selected.size > 0 && (
            <button
              onClick={() => addSelected(DUMMY_CREATIONS)}
              className="mt-3 w-full py-2 rounded-lg bg-accent text-white text-[0.8rem] font-bold hover:bg-accent/85 transition-colors"
            >
              Add {selected.size} Selected
            </button>
          )}
        </>
      )}

      {/* Stock */}
      {tab === "stock" && (
        <>
          {renderGrid(filterItems(DUMMY_STOCK))}
          {selected.size > 0 && (
            <button
              onClick={() => addSelected(DUMMY_STOCK)}
              className="mt-3 w-full py-2 rounded-lg bg-accent text-white text-[0.8rem] font-bold hover:bg-accent/85 transition-colors"
            >
              Add {selected.size} Selected
            </button>
          )}
        </>
      )}

      {/* Community */}
      {tab === "community" && (
        <>
          {renderGrid(filterItems(DUMMY_COMMUNITY).map(c => ({ ...c, creator: (c as any).creator })))}
          {selected.size > 0 && (
            <button
              onClick={() => addSelected(DUMMY_COMMUNITY)}
              className="mt-3 w-full py-2 rounded-lg bg-accent text-white text-[0.8rem] font-bold hover:bg-accent/85 transition-colors"
            >
              Add {selected.size} Selected
            </button>
          )}
        </>
      )}

      {/* Upload */}
      {tab === "upload" && (
        <div className="space-y-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-8 rounded-xl border-2 border-dashed border-foreground/[0.12] hover:border-accent/40 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload size={24} className="text-muted" />
            <span className="text-[0.82rem] font-semibold text-foreground/70">Click to upload files</span>
            <span className="text-[0.7rem] text-muted/60">Images, videos, or design files (up to 6)</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={e => { handleFiles(e.target.files); if (e.target) e.target.value = ""; }}
          />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-foreground/[0.06]" />
            <span className="text-[0.68rem] text-muted/50">or drag & drop</span>
            <div className="flex-1 h-px bg-foreground/[0.06]" />
          </div>
        </div>
      )}

      {/* Link / Social */}
      {tab === "link" && (
        <div className="space-y-3">
          {/* Platform pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SOCIAL_PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedSocial(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold transition-colors ${
                  selectedSocial === p.id
                    ? "bg-foreground/[0.08] text-foreground"
                    : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
                }`}
              >
                <p.icon size={13} />
                {p.label}
              </button>
            ))}
          </div>

          {/* URL input */}
          <div className="flex items-center gap-2">
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUrlAdd()}
              placeholder={SOCIAL_PLATFORMS.find(p => p.id === selectedSocial)?.placeholder || "Paste URL..."}
              className="flex-1 bg-foreground/[0.04] border border-foreground/[0.1] rounded-lg px-3 py-2.5 text-[0.82rem] outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleUrlAdd}
              disabled={!urlInput.trim()}
              className="px-4 py-2.5 rounded-lg bg-accent text-white text-[0.78rem] font-bold hover:bg-accent/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          <p className="text-[0.7rem] text-muted/60">Paste a public link from Instagram, YouTube, X, TikTok, or any URL with an image or video.</p>

          {/* Import from Zoom */}
          <div className="border-t border-foreground/[0.06] pt-3">
            <button className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/5 transition-all text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Monitor size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[0.82rem] font-semibold block">Import From Zoom</span>
                <span className="text-[0.7rem] text-muted/60">Import recordings or screenshots from Zoom meetings</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Record / Camera */}
      {tab === "record" && (
        <div className="space-y-3">
          {isRecording ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video rounded-xl bg-black object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex items-center justify-center gap-3">
                <button onClick={stopCamera} className="px-4 py-2 rounded-lg bg-foreground/[0.06] text-[0.82rem] font-medium hover:bg-foreground/[0.1] transition-colors">
                  Cancel
                </button>
                <button onClick={capturePhoto} className="px-6 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-colors">
                  Capture Photo
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-2.5 p-6 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] flex items-center justify-center">
                  <Camera size={20} className="text-muted" />
                </div>
                <span className="text-[0.82rem] font-semibold">Take Photo</span>
                <span className="text-[0.68rem] text-muted/60">Use your camera</span>
              </button>
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-2.5 p-6 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] flex items-center justify-center">
                  <Mic size={20} className="text-muted" />
                </div>
                <span className="text-[0.82rem] font-semibold">Record Video</span>
                <span className="text-[0.68rem] text-muted/60">Record a short clip</span>
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-[0.68rem] text-muted/50 mt-3">Add up to 6 reference images to guide the AI generation style.</p>
    </div>
  );
}
