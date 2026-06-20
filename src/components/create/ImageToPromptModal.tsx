import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Sparkles, Users, FolderOpen, Image as ImageIcon, Loader2, X } from "lucide-react";

type TabId = "upload" | "creations" | "collections" | "community" | "stock";

const TABS: { id: TabId; label: string; icon: typeof Upload }[] = [
  { id: "upload",      label: "Upload",      icon: Upload },
  { id: "creations",   label: "Creations",   icon: Sparkles },
  { id: "collections", label: "Collections", icon: FolderOpen },
  { id: "community",   label: "Community",   icon: Users },
  { id: "stock",       label: "Stock",       icon: ImageIcon },
];

const STOCK_PHOTOS = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85",
  "photo-1604881991720-f91add269bed", "photo-1579546929518-9e396f3cc809",
  "photo-1541701494587-cb58502866ab", "photo-1470071459604-3b5ec3a7fe05",
  "photo-1462275646964-a0e3386b89fa", "photo-1501854140801-50d01698950b",
  "photo-1506744038136-46273834b3fb", "photo-1493246507139-91e8fad9978e",
  "photo-1518837695005-2083093ee35b", "photo-1500530855697-b586d89ba3ee",
];

const COMMUNITY_PHOTOS = [
  { id: "m1", photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic dreamscape" },
  { id: "m2", photo: "photo-1557682250-33bd709cbe85", title: "Neon city boulevard" },
  { id: "m3", photo: "photo-1604881991720-f91add269bed", title: "Dark fantasy landscape" },
  { id: "m4", photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk portrait" },
  { id: "m5", photo: "photo-1541701494587-cb58502866ab", title: "Ethereal crystal forest" },
  { id: "m6", photo: "photo-1470071459604-3b5ec3a7fe05", title: "Mountain panorama" },
  { id: "m7", photo: "photo-1462275646964-a0e3386b89fa", title: "Zen garden" },
  { id: "m8", photo: "photo-1501854140801-50d01698950b", title: "Autumn forest path" },
];

type SourceItem = { id: string; url: string; title?: string | null };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accept: "image" | "image/video";
  onPickFile: (file: File) => void;
  onPickUrl: (url: string) => void;
}

export default function ImageToPromptModal({ open, onOpenChange, accept, onPickFile, onPickUrl }: Props) {
  const [tab, setTab] = useState<TabId>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [creations, setCreations] = useState<SourceItem[]>([]);
  const [collections, setCollections] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const acceptStr = accept === "image/video" ? "image/*,video/*" : "image/*";

  useEffect(() => {
    if (!open) return;
    setTab("upload");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (tab !== "creations" && tab !== "collections") return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (!cancelled) { setCreations([]); setCollections([]); } return; }
        if (tab === "creations") {
          const { data } = await supabase
            .from("creations" as any)
            .select("id, image_url, title")
            .eq("user_id", user.id)
            .eq("type", "image")
            .order("created_at", { ascending: false })
            .limit(60);
          if (!cancelled) setCreations(((data as any[]) || []).map(r => ({ id: r.id, url: r.image_url, title: r.title })));
        } else {
          const { data } = await supabase
            .from("collection_items" as any)
            .select("id, image_url, title")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(60);
          if (!cancelled) setCollections(((data as any[]) || []).map(r => ({ id: r.id, url: r.image_url, title: r.title })));
        }
      } catch {
        // silent — table may not exist; render empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, tab]);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    onPickFile(file);
    onOpenChange(false);
  };

  const handleUrlPick = (url: string) => {
    onPickUrl(url);
    onOpenChange(false);
  };

  const stockUrl = (p: string) => `https://images.unsplash.com/${p}?w=600&q=70&auto=format&fit=crop`;

  const renderGrid = (items: SourceItem[], emptyMsg: string) => (
    loading ? (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 size={20} className="animate-spin" />
      </div>
    ) : items.length === 0 ? (
      <div className="text-center py-16 text-muted text-sm">{emptyMsg}</div>
    ) : (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleUrlPick(item.url)}
            className="group relative aspect-square rounded-lg overflow-hidden border border-foreground/10 hover:border-accent transition-all"
          >
            <img src={item.url} alt={item.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors" />
          </button>
        ))}
      </div>
    )
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Pick an image</DialogTitle>
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">Image To Prompt</h2>
            <p className="text-[0.78rem] text-muted mt-0.5">Pick a source. We'll generate the prompt for you.</p>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-muted hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 px-6 border-b border-foreground/10 overflow-x-auto">
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[0.82rem] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  active ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {tab === "upload" && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-16 px-6 transition-colors ${
                  dragOver ? "border-accent bg-accent/5" : "border-foreground/15 hover:border-foreground/30 bg-foreground/[0.02]"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
                  <Upload size={20} />
                </div>
                <div className="font-semibold text-foreground text-sm">Drop a file here or click to browse</div>
                <div className="text-[0.78rem] text-muted mt-1">{accept === "image/video" ? "Images or videos up to 25MB" : "PNG, JPG, WebP up to 25MB"}</div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={acceptStr}
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
            </div>
          )}

          {tab === "creations" && renderGrid(creations, "No creations yet. Generate something first to use it here.")}
          {tab === "collections" && renderGrid(collections, "No saved items in your collections yet.")}
          {tab === "community" && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {COMMUNITY_PHOTOS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleUrlPick(stockUrl(p.photo))}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-foreground/10 hover:border-accent transition-all"
                >
                  <img src={stockUrl(p.photo)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          {tab === "stock" && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {STOCK_PHOTOS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleUrlPick(stockUrl(p))}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-foreground/10 hover:border-accent transition-all"
                >
                  <img src={stockUrl(p)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
