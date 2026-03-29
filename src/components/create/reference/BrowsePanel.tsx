import { useState, useRef } from "react";
import {
  Search, LayoutGrid, Image as ImageIcon, Check,
  Upload, FolderOpen, TrendingUp, Users, Globe, Sparkles,
  Link, ChevronRight, ArrowLeft, X
} from "lucide-react";
import { toast } from "sonner";
import type { BrowseItem, MediaFilter, ReferenceImage, SourceTab } from "./types";
import { DUMMY_CREATIONS, DUMMY_STOCK, DUMMY_COMMUNITY, DUMMY_COLLECTIONS, DUMMY_TRENDING } from "./data";

interface BrowsePanelProps {
  references: ReferenceImage[];
  onAdd: (ref: ReferenceImage) => void;
}

const SOURCE_TABS: { id: SourceTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "import", label: "Import", icon: FolderOpen },
  { id: "creations", label: "Creations", icon: Sparkles },
  { id: "stock", label: "Stock", icon: Globe },
  { id: "community", label: "Community", icon: Users },
  { id: "trending", label: "Trending", icon: TrendingUp },
];

const MEDIA_FILTERS: { id: MediaFilter; label: string; icon: typeof LayoutGrid }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "image", label: "Images", icon: ImageIcon },
];

const POOLS: Record<Exclude<SourceTab, "upload" | "import">, BrowseItem[]> = {
  creations: DUMMY_CREATIONS,
  stock: DUMMY_STOCK,
  community: DUMMY_COMMUNITY,
  trending: DUMMY_TRENDING,
};

const CLOUD_SOURCES = [
  {
    id: "google-drive",
    label: "Google Drive",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
  },
  {
    id: "dropbox",
    label: "Dropbox",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg",
  },
  {
    id: "onedrive",
    label: "OneDrive",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg",
  },
];

export default function BrowsePanel({ references, onAdd }: BrowsePanelProps) {
  const [tab, setTab] = useState<SourceTab>("upload");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [importView, setImportView] = useState<"none" | "menu" | "link">("none");
  const [linkUrl, setLinkUrl] = useState("");
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

  const handlePasteLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    try {
      new URL(url);
      const name = url.split("/").pop() || "Linked image";
      onAdd({ id: crypto.randomUUID(), src: url, name });
      setLinkUrl("");
      setImportView("none");
      toast.success("Image added from link");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const handleCloudSource = (label: string) => {
    toast.info(`${label} integration coming soon`);
  };

  // Browse tabs
  const isUpload = tab === "upload";
  const isImport = tab === "import";
  const isBrowse = !isUpload && !isImport;
  const pool = isBrowse ? POOLS[tab as Exclude<SourceTab, "upload" | "import">] : [];
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
      {/* Subtitle */}
      <p className="text-[0.75rem] text-muted mb-4">Upload or select files to guide AI generation</p>

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
        <div className="space-y-3">
          {/* Drag & drop zone */}
          <div
            className={`rounded-xl border-2 border-dashed transition-colors p-6 flex flex-col items-center justify-center min-h-[180px] ${
              dragActive ? "border-accent bg-accent/5" : "border-foreground/[0.10] bg-foreground/[0.02]"
            }`}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <div className="relative w-[140px] h-[90px] mb-4">
              {[
                { img: "photo-1506744038136-46273834b3fb", rotate: -20, x: -55, z: 1 },
                { img: "photo-1470071459604-3b5ec3a7fe05", rotate: -10, x: -25, z: 2 },
                { img: "photo-1506794778202-cad84cf45f1d", rotate: 0, x: 8, z: 3 },
                { img: "photo-1531746020798-e6953c6e8e04", rotate: 10, x: 40, z: 4 },
                { img: "photo-1534528741775-53994a69daeb", rotate: 20, x: 70, z: 5 },
              ].map((card, i) => (
                <div
                  key={i}
                  className="absolute top-0 w-[60px] h-[82px] rounded-lg overflow-hidden shadow-lg border-2 border-background"
                  style={{
                    transform: `translateX(${card.x}px) rotate(${card.rotate}deg)`,
                    zIndex: card.z,
                    left: "calc(50% - 30px)",
                  }}
                >
                  <img
                    src={`https://images.unsplash.com/${card.img}?w=200&h=280&fit=crop&q=75`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-[0.85rem] font-bold text-foreground mb-0.5">Drag & Drop Files Here</p>
            <p className="text-[0.72rem] text-muted/60 mb-3">Images — up to 50MB each</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-5 py-2 rounded-lg bg-foreground text-primary-foreground text-[0.8rem] font-bold hover:bg-accent transition-colors"
            >
              Browse Files
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { handleFiles(e.target.files); if (e.target) e.target.value = ""; }}
            />
          </div>

          {/* Import section */}
          {importView === "none" && (
            <button
              onClick={() => setImportView("menu")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/15 hover:bg-foreground/[0.02] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center">
                  <FolderOpen size={15} className="text-muted" />
                </div>
                <span className="text-[0.82rem] font-semibold">Import</span>
                <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">New</span>
              </div>
              <ChevronRight size={14} className="text-muted" />
            </button>
          )}

          {importView === "menu" && (
            <div className="rounded-xl border border-foreground/[0.08] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/[0.06]">
                <button onClick={() => setImportView("none")} className="p-1 rounded-md hover:bg-foreground/[0.06] transition-colors">
                  <ArrowLeft size={14} className="text-muted" />
                </button>
                <span className="text-[0.82rem] font-bold">Import</span>
              </div>
              {CLOUD_SOURCES.map(cs => (
                <button
                  key={cs.id}
                  onClick={() => handleCloudSource(cs.label)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/[0.03] transition-colors border-b border-foreground/[0.04] last:border-b-0"
                >
                  <img src={cs.logo} alt={cs.label} className="w-5 h-5 object-contain" />
                  <span className="text-[0.82rem] font-medium">{cs.label}</span>
                </button>
              ))}
              <button
                onClick={() => setImportView("link")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/[0.03] transition-colors"
              >
                <Link size={16} className="text-muted" />
                <span className="text-[0.82rem] font-medium text-muted">Paste an image link</span>
              </button>
            </div>
          )}

          {importView === "link" && (
            <div className="rounded-xl border border-foreground/[0.08] p-4">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setImportView("menu")} className="p-1 rounded-md hover:bg-foreground/[0.06] transition-colors">
                  <ArrowLeft size={14} className="text-muted" />
                </button>
                <span className="text-[0.82rem] font-bold">Paste Image Link</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handlePasteLink()}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 rounded-lg border border-foreground/[0.1] bg-background text-[0.8rem] outline-none focus:border-accent transition-colors"
                  autoFocus
                />
                <button
                  onClick={handlePasteLink}
                  disabled={!linkUrl.trim()}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-[0.8rem] font-bold hover:bg-accent/85 transition-colors disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          )}
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
