import { useState, useRef } from "react";
import {
  Search, LayoutGrid, Image as ImageIcon, Check,
  Upload, FolderOpen, TrendingUp, Users, Globe, Sparkles
} from "lucide-react";
import type { BrowseItem, MediaFilter, ReferenceImage, SourceTab } from "./types";
import { DUMMY_CREATIONS, DUMMY_STOCK, DUMMY_COMMUNITY, DUMMY_COLLECTIONS, DUMMY_TRENDING, FILE_TYPE_BADGES } from "./data";

interface BrowsePanelProps {
  references: ReferenceImage[];
  onAdd: (ref: ReferenceImage) => void;
}

const SOURCE_TABS: { id: SourceTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "creations", label: "Creations", icon: Sparkles },
  { id: "collections", label: "Collections", icon: FolderOpen },
  { id: "stock", label: "Stock", icon: Globe },
  { id: "community", label: "Community", icon: Users },
  { id: "trending", label: "Trending", icon: TrendingUp },
];

const MEDIA_FILTERS: { id: MediaFilter; label: string; icon: typeof LayoutGrid }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "image", label: "Images", icon: ImageIcon },
];

const POOLS: Record<Exclude<SourceTab, "upload">, BrowseItem[]> = {
  creations: DUMMY_CREATIONS,
  stock: DUMMY_STOCK,
  community: DUMMY_COMMUNITY,
  collections: DUMMY_COLLECTIONS,
  trending: DUMMY_TRENDING,
};

export default function BrowsePanel({ references, onAdd }: BrowsePanelProps) {
  const [tab, setTab] = useState<SourceTab>("upload");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refIds = new Set(references.map(r => r.id));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      onAdd({ id: crypto.randomUUID(), src: URL.createObjectURL(file), name: file.name });
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  // Browse tabs
  const isUpload = tab === "upload";
  const pool = !isUpload ? POOLS[tab as Exclude<SourceTab, "upload">] : [];
  const filtered = pool
    .filter(i => mediaFilter === "all" || i.type === mediaFilter)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSelected = () => {
    pool.filter(i => selected.has(i.id)).forEach(i => {
      if (!refIds.has(i.id)) onAdd({ id: i.id, src: i.src, name: i.title });
    });
    setSelected(new Set());
  };

  const isEmpty = filtered.length === 0;

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-[1rem] font-bold text-foreground">References</h3>
        <p className="text-[0.75rem] text-muted mt-0.5">Upload or select files to guide AI generation</p>
      </div>

      {/* Source tabs row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {SOURCE_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(""); setSelected(new Set()); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold whitespace-nowrap transition-colors ${
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

        {!isUpload && (
          <div className="flex items-center gap-1 shrink-0">
            {MEDIA_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setMediaFilter(f.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.72rem] font-semibold transition-colors ${
                  mediaFilter === f.id
                    ? "bg-foreground/[0.08] text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <f.icon size={12} />
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upload tab content */}
      {isUpload && (
        <div
          className={`rounded-xl border-2 border-dashed transition-colors p-8 flex flex-col items-center justify-center min-h-[220px] ${
            dragActive ? "border-accent bg-accent/5" : "border-foreground/[0.10] bg-foreground/[0.02]"
          }`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Upload size={28} className="text-accent mb-3" />
          <p className="text-[0.92rem] font-bold text-foreground mb-1">Drag & Drop Files Here</p>
          <p className="text-[0.75rem] text-muted/60 mb-4">Images — up to 50MB each</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-6 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-bold hover:bg-accent transition-colors"
          >
            Browse Files
          </button>
          <div className="flex items-center gap-1.5 mt-4">
            {FILE_TYPE_BADGES.map(b => (
              <span
                key={b.label}
                className="px-2 py-0.5 rounded text-[0.6rem] font-bold text-white"
                style={{ backgroundColor: b.color }}
              >
                {b.label}
              </span>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { handleFiles(e.target.files); if (e.target) e.target.value = ""; }}
          />
        </div>
      )}

      {/* Browse content for non-upload tabs */}
      {!isUpload && (
        <>
          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${SOURCE_TABS.find(t => t.id === tab)?.label ?? ""}...`}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/[0.08] text-[0.8rem] outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Grid or empty state */}
          <div className="flex-1 min-h-0">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-xl bg-foreground/[0.04] flex items-center justify-center mb-4">
                  <Search size={24} className="text-muted/40" />
                </div>
                <p className="text-[0.88rem] font-semibold text-foreground/70 mb-1">Nothing Found</p>
                <p className="text-[0.75rem] text-muted/60">Try a different search or switch tabs</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[240px] overflow-y-auto pr-1">
                {filtered.map(item => {
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
              </div>
            )}
          </div>

          {/* Add selected button */}
          {selected.size > 0 && (
            <button
              onClick={addSelected}
              className="mt-3 w-full py-2 rounded-lg bg-accent text-accent-foreground text-[0.8rem] font-bold hover:bg-accent/85 transition-colors"
            >
              Add {selected.size} Selected
            </button>
          )}
        </>
      )}
    </div>
  );
}
