import { useState, useEffect } from "react";
import { X, Plus, Bookmark, Check, Search, Lock, Globe } from "lucide-react";
import { getBoards, createBoard, addToBoard, type Board } from "@/lib/boardStore";

interface SaveToBoardModalProps {
  open: boolean;
  onClose: () => void;
  imageId?: string;
  imagePhoto?: string;
  imageTitle?: string;
}

const SaveToBoardModal = ({
  open, onClose,
  imageId = "0",
  imagePhoto = "photo-1618005182384-a83a8bd57fbe",
  imageTitle = "Untitled",
}: SaveToBoardModalProps) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [search, setSearch] = useState("");
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newVisibility, setNewVisibility] = useState<"public" | "private">("private");

  useEffect(() => {
    if (open) setBoards(getBoards());
  }, [open]);

  if (!open) return null;

  const filtered = boards.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const alreadySaved = (boardId: string) =>
    boards.find(b => b.id === boardId)?.items.some(i => i.imageId === imageId) ?? false;

  const handleSave = (boardId: string) => {
    addToBoard(boardId, { imageId, photo: imagePhoto, title: imageTitle });
    setSavedTo(boardId);
    setTimeout(() => { onClose(); setSavedTo(null); setSearch(""); }, 900);
  };

  const handleCreate = () => {
    if (!newBoardName.trim()) return;
    const board = createBoard(newBoardName.trim(), newVisibility);
    addToBoard(board.id, { imageId, photo: imagePhoto, title: imageTitle });
    setBoards(getBoards());
    setSavedTo(board.id);
    setTimeout(() => { onClose(); setSavedTo(null); setSearch(""); setNewBoardName(""); setShowCreate(false); }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl animate-drop-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent" />
            <h3 className="font-display text-[1.05rem] font-bold">Save to Board</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search boards..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] text-[0.84rem] font-body outline-none focus:border-accent/30 transition-colors"
            />
          </div>
        </div>

        {/* Board list */}
        <div className="px-5 py-2 max-h-[240px] overflow-y-auto">
          {filtered.length === 0 && !showCreate && (
            <p className="text-[0.82rem] text-muted text-center py-4">No boards found</p>
          )}
          {filtered.map(board => {
            const done = savedTo === board.id;
            const already = alreadySaved(board.id);
            return (
              <button
                key={board.id}
                onClick={() => !already && !done && handleSave(board.id)}
                disabled={already || !!done}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-left group ${done ? "bg-green-50" : already ? "opacity-50 cursor-default" : "hover:bg-foreground/[0.04] cursor-pointer"}`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-foreground/[0.06]">
                  {board.items[0] ? (
                    <img src={`https://images.unsplash.com/${board.items[0].photo}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bookmark className="w-4 h-4 text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.84rem] font-semibold truncate">{board.title}</div>
                  <div className="text-[0.72rem] text-muted flex items-center gap-1">
                    {board.visibility === "private" ?
                      <Lock className="w-2.5 h-2.5" /> :
                      <Globe className="w-2.5 h-2.5" />
                    }
                    {board.items.length} saved
                  </div>
                </div>
                <Check className={`w-3.5 h-3.5 ${done || already ? "text-white" : "text-muted opacity-0 group-hover:opacity-100"}`} />
              </button>
            );
          })}
        </div>

        {/* Create new board */}
        <div className="px-5 pb-4 pt-2 border-t border-foreground/[0.06]">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 w-full text-[0.84rem] font-semibold text-accent hover:text-accent/80 transition-colors py-1"
            >
              <Plus className="w-4 h-4" /> Create New Board
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={newBoardName}
                onChange={e => setNewBoardName(e.target.value)}
                placeholder="Board name..."
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.84rem] font-body outline-none focus:border-accent/40 transition-colors"
                onKeyDown={e => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-2">
                {(["private", "public"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setNewVisibility(v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.76rem] font-medium border transition-colors capitalize ${
                      newVisibility === v
                        ? "bg-foreground text-primary-foreground border-foreground"
                        : "border-foreground/[0.12] text-muted hover:border-foreground/30"
                    }`}
                  >
                    {v === "private" ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 rounded-xl bg-foreground text-primary-foreground text-[0.82rem] font-semibold hover:bg-accent transition-colors"
                >
                  Create & Save
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewBoardName(""); }}
                  className="px-4 py-2 rounded-xl border border-foreground/[0.12] text-[0.82rem] hover:border-foreground/30 transition-colors"
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
};

export default SaveToBoardModal;
