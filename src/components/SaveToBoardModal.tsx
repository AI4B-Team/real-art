import { useState } from "react";
import { X, Plus, Bookmark, Check, Search } from "lucide-react";

const existingBoards = [
  { id: "1", title: "Cyberpunk Cities", images: 128, cover: "photo-1557682250-33bd709cbe85" },
  { id: "2", title: "Surreal Dreamscapes", images: 94, cover: "photo-1579546929518-9e396f3cc809" },
  { id: "3", title: "Dark Fantasy", images: 156, cover: "photo-1541701494587-cb58502866ab" },
  { id: "4", title: "Abstract Minimalism", images: 82, cover: "photo-1618005182384-a83a8bd57fbe" },
];

interface SaveToBoardModalProps {
  open: boolean;
  onClose: () => void;
}

const SaveToBoardModal = ({ open, onClose }: SaveToBoardModalProps) => {
  const [search, setSearch] = useState("");
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  if (!open) return null;

  const filtered = existingBoards.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (boardId: string) => {
    setSavedTo(boardId);
    setTimeout(() => {
      onClose();
      setSavedTo(null);
      setSearch("");
    }, 800);
  };

  const handleCreate = () => {
    if (newBoardName.trim()) {
      setSavedTo("new");
      setTimeout(() => {
        onClose();
        setSavedTo(null);
        setNewBoardName("");
        setShowCreate(false);
      }, 800);
    }
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
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
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
          {filtered.map(board => (
            <button
              key={board.id}
              onClick={() => handleSave(board.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors text-left"
            >
              <img
                src={`https://images.unsplash.com/${board.cover}?w=80&h=56&fit=crop&q=70`}
                alt={board.title}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[0.84rem] font-semibold truncate">{board.title}</div>
                <div className="text-[0.72rem] text-muted">{board.images} images</div>
              </div>
              {savedTo === board.id ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <Bookmark className="w-4 h-4 text-muted shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Create new board */}
        <div className="px-5 pb-4 pt-2 border-t border-foreground/[0.06]">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-2 justify-center py-2.5 rounded-lg border border-dashed border-foreground/[0.15] text-[0.82rem] font-medium text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create New Board
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newBoardName}
                onChange={e => setNewBoardName(e.target.value)}
                placeholder="Board name..."
                autoFocus
                className="flex-1 px-3 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.84rem] font-body outline-none focus:border-accent/40 transition-colors"
                onKeyDown={e => e.key === "Enter" && handleCreate()}
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-semibold hover:bg-accent transition-colors shrink-0"
              >
                Create
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveToBoardModal;
