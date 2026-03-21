import { useState } from "react";
import { Search, LayoutGrid, Image as ImageIcon, Video as VideoIcon, Check, Upload } from "lucide-react";
import type { BrowseItem, MediaFilter, ReferenceImage, SourceTab } from "./types";
import { DUMMY_CREATIONS, DUMMY_STOCK, DUMMY_COMMUNITY } from "./data";

interface BrowsePanelProps {
  references: ReferenceImage[];
  onAdd: (ref: ReferenceImage) => void;
}

const SOURCE_TABS: { id: SourceTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "creations", label: "Creations", icon: LayoutGrid },
  { id: "stock", label: "Stock", icon: ImageIcon },
  { id: "community", label: "Community", icon: LayoutGrid },
];

const MEDIA_FILTERS: { id: MediaFilter; label: string; icon: typeof LayoutGrid }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "image", label: "Images", icon: ImageIcon },
  { id: "video", label: "Videos", icon: VideoIcon },
];

const POOLS: Record<SourceTab, BrowseItem[]> = {
  creations: DUMMY_CREATIONS,
  stock: DUMMY_STOCK,
  community: DUMMY_COMMUNITY,
};

export default function BrowsePanel({ references, onAdd }: BrowsePanelProps) {
  const [tab, setTab] = useState<SourceTab>("creations");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const refIds = new Set(references.map(r => r.id));

  const pool = POOLS[tab];
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
        <p className="text-[0.75rem] text-muted mt-0.5">Upload Or Select A File</p>
      </div>

      {/* Source tabs + search row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1">
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

        <div className="flex items-center gap-1">
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
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search References"
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/[0.08] text-[0.8rem] outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Grid or empty state */}
      <div className="flex-1 min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-foreground/[0.04] flex items-center justify-center mb-4">
              <Upload size={24} className="text-muted/40" />
            </div>
            <p className="text-[0.88rem] font-semibold text-foreground/70 mb-1">No Reference Images Yet</p>
            <p className="text-[0.75rem] text-muted/60">Upload your first reference image to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-1">
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
    </div>
  );
}
