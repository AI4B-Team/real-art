import { useState, useEffect } from "react";
import { X, Plus, Bookmark, Check, Search, Lock, Globe } from "lucide-react";
import {
  getCollections,
  addItemToCollection,
  createSavedCollection,
  type UnifiedCollection,
} from "@/lib/collectionStore";

interface Props {
  open: boolean;
  onClose: () => void;
  imageId?: string;
  imagePhoto?: string;
  imageTitle?: string;
  imageTags?: string[];
  suggestedCollectionId?: string;
  onSaved?: () => void;
}

export default function SaveToBoardModal({
  open,
  onClose,
  imageId = "0",
  imagePhoto = "photo-1618005182384-a83a8bd57fbe",
  imageTitle = "Untitled",
  imageTags,
  suggestedCollectionId,
  onSaved,
}: Props) {
  const [collections, setCollections] = useState<UnifiedCollection[]>([]);
  const [search, setSearch] = useState("");
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVisibility, setNewVisibility] = useState<"public" | "private">("private");

  const suggestedId = suggestedCollectionId;

  useEffect(() => {
    if (open) {
      setCollections(getCollections());
      setSearch("");
      setSavedTo(null);
      setShowCreate(false);
      setNewName("");
    }
  }, [open]);

  if (!open) return null;

  const filtered = collections.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const alreadySaved = (colId: string) =>
    collections.find(c => c.id === colId)?.items?.some(i => i.imageId === imageId) ?? false;

  const handleSave = (colId: string) => {
    addItemToCollection(colId, { imageId, photo: imagePhoto, title: imageTitle });
    setSavedTo(colId);
    onSaved?.();
    setTimeout(() => { onClose(); setSavedTo(null); setSearch(""); }, 900);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const col = createSavedCollection(newName.trim(), newVisibility);
    addItemToCollection(col.id, { imageId, photo: imagePhoto, title: imageTitle });
    setCollections(getCollections());
    setSavedTo(col.id);
    onSaved?.();
    setTimeout(() => { onClose(); setSavedTo(null); setSearch(""); setNewName(""); setShowCreate(false); }, 900);
  };

  // Sort: suggested first
  const sorted = [...filtered].sort((a, b) => {
    if (a.id === suggestedId) return -1;
    if (b.id === suggestedId) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl animate-drop-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent" />
            <h3 className="font-display text-[1.05rem] font-bold">Save to Collection</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Image preview strip */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-foreground/[0.06] bg-foreground/[0.02]">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-foreground/[0.06]">
            <img src={`https://images.unsplash.com/${imagePhoto}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-[0.84rem] font-semibold truncate">{imageTitle}</div>
            <div className="text-[0.72rem] text-muted">Save to one of your collections</div>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search collections…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] text-[0.84rem] font-body outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        </div>

        {/* Collection list */}
        <div className="px-5 py-2 max-h-[240px] overflow-y-auto">
          {filtered.length === 0 && !showCreate && (
            <p className="text-[0.82rem] text-muted text-center py-4">
              {search ? "No matching collections" : "No collections yet — create one below"}
            </p>
          )}
          {sorted.map(col => {
            const done = savedTo === col.id;
            const already = alreadySaved(col.id);
            const isSuggested = col.id === suggestedId;
            const thumb = col.items?.[0]?.photo || col.thumbs?.[0];
            return (
              <button
                key={col.id}
                onClick={() => !already && !done && handleSave(col.id)}
                disabled={already || !!done}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-left group mb-0.5 ${
                  done ? "bg-green-50 dark:bg-green-950/30" :
                  isSuggested ? "border border-accent/25 bg-accent/[0.03] hover:bg-accent/[0.06] cursor-pointer" :
                  already ? "opacity-45 cursor-default" :
                  "hover:bg-foreground/[0.04] cursor-pointer"
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-foreground/[0.06]">
                  {thumb ? (
                    <img src={`https://images.unsplash.com/${thumb}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bookmark className="w-4 h-4 text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.84rem] font-semibold truncate flex items-center gap-1.5">
                    {col.title}
                    {isSuggested && !done && !already && (
                      <span className="text-[0.62rem] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">Suggested</span>
                    )}
                  </div>
                  <div className="text-[0.72rem] text-muted flex items-center gap-1">
                    {col.visibility === "private" ?
                      <Lock className="w-2.5 h-2.5" /> :
                      <Globe className="w-2.5 h-2.5" />
                    }
                    {col.items?.length ?? 0} saved
                    {col.accessCode && <span className="ml-1 opacity-60">· {col.accessCode}</span>}
                  </div>
                </div>
                <Check className={`w-4 h-4 shrink-0 transition-all ${
                  done ? "text-green-500 opacity-100" :
                  already ? "text-accent opacity-100" :
                  "text-muted opacity-0 group-hover:opacity-60"
                }`} />
              </button>
            );
          })}
        </div>

        {/* Create new collection */}
        <div className="px-5 pb-4 pt-2 border-t border-foreground/[0.06]">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 w-full text-[0.84rem] font-semibold text-accent hover:text-accent/80 transition-colors py-1"
            >
              <Plus className="w-4 h-4" /> New Collection
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="Collection name…"
                autoFocus
                maxLength={60}
                className="w-full px-4 py-2.5 rounded-xl border border-foreground/[0.1] text-[0.84rem] font-body outline-none focus:border-accent/40 transition-colors bg-background"
              />
              <div className="grid grid-cols-2 gap-2">
                {(["private", "public"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setNewVisibility(v)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[0.78rem] font-medium border transition-all ${
                      newVisibility === v
                        ? "bg-foreground text-primary-foreground border-foreground"
                        : "border-foreground/[0.12] text-muted hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {v === "private" ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {v === "private" ? "Private" : "Public"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2.5 rounded-xl bg-foreground text-primary-foreground text-[0.82rem] font-semibold hover:bg-accent transition-colors"
                >
                  Create & Save
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewName(""); }}
                  className="px-4 py-2.5 rounded-xl border border-foreground/[0.12] text-[0.84rem] hover:border-foreground/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
