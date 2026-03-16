import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Search, Plus, TrendingUp, Users, Bookmark, X, Globe, Lock, Key, Check,
  Compass, Star, Edit3, Trash2, Image, Video, Music
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import { getCollections, addCollection, updateCollection, deleteCollection, type Collection } from "@/lib/collectionStore";

const categories = [
  "All", "People & Portraits", "Fashion & Style", "Nature & Earth",
  "Architecture", "Abstract", "Sci-Fi & Fantasy", "Luxury",
  "Cyberpunk", "Avatars", "Backgrounds", "3D Art",
];

const curatedCollections = [
  { id: "e1", name: "CEO / Boss Babe", count: 152, category: "People & Portraits", curator: "REAL ART", photo: "photo-1573496359142-b8d87734a5a2", featured: true },
  { id: "e2", name: "Luxury Lifestyle", count: 239, category: "Luxury", curator: "REAL ART", photo: "photo-1600210492486-724fe5c67fb0", featured: true },
  { id: "e3", name: "Cosmic Worlds", count: 412, category: "Sci-Fi & Fantasy", curator: "AI.Verse", photo: "photo-1618005182384-a83a8bd57fbe", featured: true },
  { id: "e4", name: "Digital Avatars", count: 520, category: "Avatars", curator: "LuminaAI", photo: "photo-1579546929518-9e396f3cc809", featured: true },
  { id: "e5", name: "Street Fashion", count: 185, category: "Fashion & Style", curator: "REAL ART", photo: "photo-1509631179647-0177331693ae", featured: false },
  { id: "e6", name: "Runway Inspired", count: 130, category: "Fashion & Style", curator: "REAL ART", photo: "photo-1558618666-fcd25c85cd64", featured: false },
  { id: "e7", name: "Neon Cities", count: 267, category: "Cyberpunk", curator: "NeoPixel", photo: "photo-1557682250-33bd709cbe85", featured: false },
  { id: "e8", name: "Ancient Forests", count: 198, category: "Nature & Earth", curator: "DreamForge", photo: "photo-1470071459604-3b5ec3a7fe05", featured: false },
  { id: "e9", name: "Modern Architecture", count: 344, category: "Architecture", curator: "ChromaLab", photo: "photo-1506905925346-21bda4d32df4", featured: false },
  { id: "e10", name: "Abstract Fluid", count: 189, category: "Abstract", curator: "SpectraGen", photo: "photo-1541701494587-cb58502866ab", featured: false },
  { id: "e11", name: "Minimal Spaces", count: 143, category: "Architecture", curator: "VoidArt", photo: "photo-1549880338-65ddcdfd017b", featured: false },
  { id: "e12", name: "Retro Futures", count: 231, category: "Sci-Fi & Fantasy", curator: "REAL ART", photo: "photo-1547036967-23d11aacaee0", featured: false },
];

const communityCollections = [
  { id: "b1", title: "Cyberpunk Cities", creator: "VoidArt", creatorColor: "#023e8a", creatorInit: "VA", followers: "1,248", images: 128, cover: "photo-1557682250-33bd709cbe85", category: "Cyberpunk", type: "public" },
  { id: "b2", title: "Surreal Dreamscapes", creator: "DreamForge", creatorColor: "#2a9d8f", creatorInit: "DF", followers: "892", images: 94, cover: "photo-1579546929518-9e396f3cc809", category: "Sci-Fi & Fantasy", type: "public" },
  { id: "b3", title: "Dark Fantasy", creator: "NeoPixel", creatorColor: "#c9184a", creatorInit: "NP", followers: "1,034", images: 156, cover: "photo-1541701494587-cb58502866ab", category: "Sci-Fi & Fantasy", type: "public" },
  { id: "b4", title: "Abstract Minimalism", creator: "ChromaLab", creatorColor: "#f4a261", creatorInit: "CL", followers: "674", images: 82, cover: "photo-1618005182384-a83a8bd57fbe", category: "Abstract", type: "public" },
  { id: "b5", title: "Cosmic Visions", creator: "AI.Verse", creatorColor: "#4361ee", creatorInit: "AV", followers: "2,118", images: 241, cover: "photo-1462275646964-a0e3386b89fa", category: "Sci-Fi & Fantasy", type: "public" },
  { id: "b6", title: "Neon Portraits", creator: "LuminaAI", creatorColor: "#e76f51", creatorInit: "LA", followers: "561", images: 67, cover: "photo-1547036967-23d11aacaee0", category: "People & Portraits", type: "public" },
  { id: "b7", title: "Nature Reimagined", creator: "SpectraGen", creatorColor: "#7b2d8b", creatorInit: "SG", followers: "723", images: 109, cover: "photo-1470071459604-3b5ec3a7fe05", category: "Nature & Earth", type: "public" },
  { id: "b8", title: "Retro Futurism", creator: "Synthetix", creatorColor: "#06d6a0", creatorInit: "SX", followers: "498", images: 73, cover: "photo-1518020382113-a7e8fc38eac9", category: "Sci-Fi & Fantasy", type: "public" },
  { id: "b9", title: "Liquid Metal", creator: "AI.Verse", creatorColor: "#4361ee", creatorInit: "AV", followers: "1,390", images: 88, cover: "photo-1558618666-fcd25c85cd64", category: "Abstract", type: "public" },
];

const TABS = [
  { id: "discover" as const, label: "All Collections", icon: Compass },
  { id: "mine" as const, label: "My Collections", icon: Bookmark },
];

/* ── Create Modal ── */
const CreateModal = ({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Collection) => void }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [code, setCode] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    const newCol = addCollection({
      title: name.trim(), description: desc, type: "saved" as const, visibility,
      accessCode: visibility === "private" ? code.trim() : undefined,
      members: 0, slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
      imageCount: 0, videoCount: 0, musicCount: 0,
      thumbs: [], items: [],
      createdAt: new Date().toISOString(),
    });
    onCreate(newCol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[480px] shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/[0.06]">
          <h3 className="font-display text-[1.2rem] font-bold">New Collection</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[0.78rem] font-semibold mb-1.5">Name</label>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              maxLength={60}
              className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-[0.78rem] font-semibold mb-1.5">Description <span className="font-normal text-muted">(optional)</span></label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-[0.78rem] font-semibold mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: "public" as const, icon: Globe, label: "Public", desc: "Anyone can view" },
                { val: "private" as const, icon: Lock, label: "Private", desc: "Access code or invite" },
              ]).map(opt => (
                <button key={opt.val} onClick={() => setVisibility(opt.val)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${visibility === opt.val ? "border-foreground bg-foreground/[0.04]" : "border-foreground/[0.1] hover:border-foreground/25"}`}>
                  <opt.icon className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <div className="font-semibold text-[0.84rem]">{opt.label}</div>
                    <div className="text-[0.7rem] text-muted">{opt.desc}</div>
                  </div>
                  {visibility === opt.val && <Check className="w-4 h-4 text-accent ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>
          {visibility === "private" && (
            <div>
              <label className="block text-[0.78rem] font-semibold mb-1.5">Access code <span className="font-normal text-muted">(optional)</span></label>
              <div className="flex items-center gap-2 h-11 border border-foreground/[0.12] rounded-xl px-4 bg-background focus-within:border-accent transition-colors">
                <Key className="w-3.5 h-3.5 text-muted shrink-0" />
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Leave blank for invite-only access"
                  className="flex-1 border-none outline-none bg-transparent text-[0.85rem] font-mono tracking-[0.1em] uppercase" maxLength={12} />
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-foreground/[0.06] flex justify-end">
          <button onClick={handleCreate} className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
            Create Collection
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Edit Collection Modal ── */
const EditCollectionModal = ({ col, onClose, onSave }: { col: Collection; onClose: () => void; onSave: () => void }) => {
  const [name, setName] = useState(col.title);
  const [desc, setDesc] = useState(col.description || "");
  const [visibility, setVisibility] = useState<"public" | "private">(col.visibility);
  const [code, setCode] = useState(col.accessCode || "");

  const handleSave = () => {
    if (!name.trim()) return;
    updateCollection(col.id, {
      title: name.trim(),
      description: desc || undefined,
      visibility,
      accessCode: visibility === "private" ? code.trim() : undefined,
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[480px] shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/[0.06]">
          <h3 className="font-display text-[1.2rem] font-bold">Edit Collection</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[0.78rem] font-semibold mb-1.5">Name</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()} maxLength={60}
              className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="block text-[0.78rem] font-semibold mb-1.5">Description <span className="font-normal text-muted">(optional)</span></label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="What's this collection about?"
              className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-[0.78rem] font-semibold mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: "public" as const, icon: Globe, label: "Public", desc: "Anyone can view" },
                { val: "private" as const, icon: Lock, label: "Private", desc: "Access code or invite" },
              ]).map(opt => (
                <button key={opt.val} onClick={() => setVisibility(opt.val)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${visibility === opt.val ? "border-foreground bg-foreground/[0.04]" : "border-foreground/[0.1] hover:border-foreground/25"}`}>
                  <opt.icon className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <div className="font-semibold text-[0.84rem]">{opt.label}</div>
                    <div className="text-[0.7rem] text-muted">{opt.desc}</div>
                  </div>
                  {visibility === opt.val && <Check className="w-4 h-4 text-accent ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>
          {visibility === "private" && (
            <div>
              <label className="block text-[0.78rem] font-semibold mb-1.5">Access code <span className="font-normal text-muted">(optional)</span></label>
              <div className="flex items-center gap-2 h-11 border border-foreground/[0.12] rounded-xl px-4 bg-background focus-within:border-accent transition-colors">
                <Key className="w-3.5 h-3.5 text-muted shrink-0" />
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Leave blank for invite-only access"
                  className="flex-1 border-none outline-none bg-transparent text-[0.85rem] font-mono tracking-[0.1em] uppercase" maxLength={12} />
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-foreground/[0.06] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Community Card ── */
const CommunityCard = ({ board }: { board: typeof communityCollections[0] }) => (
  <Link to={`/collections/${board.id}`} className="group block no-underline">
    <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all hover:-translate-y-1">
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={`https://images.unsplash.com/${board.cover}?w=600&h=200&fit=crop&q=80`}
          alt={board.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-[1.3rem] font-black text-white leading-tight">{board.title}</h3>
          <div className="text-[0.72rem] text-white/60">{board.category}</div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white" style={{ background: board.creatorColor }}>
              {board.creatorInit}
            </div>
            <span className="text-[0.8rem] text-muted">by {board.creator}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[0.75rem] text-muted">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {board.followers} followers</span>
          <span>{board.images} images</span>
        </div>
      </div>
    </div>
  </Link>
);

/* ── My Collection Card (with Edit / Delete) ── */
const MyCollectionCard = ({ col, onEdit, onDelete }: { col: Collection; onEdit: () => void; onDelete: () => void }) => {
  const cover = col.items[0]?.photo || col.thumbs[0];
  const itemCount = col.items.length;

  return (
    <Link to={`/dashboard/collections/${col.id}`} className="group block no-underline">
      <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all hover:-translate-y-1">
        <div className="h-[180px] overflow-hidden bg-foreground/[0.04] relative">
          {cover ? (
            <img src={`https://images.unsplash.com/${cover}?w=400&h=180&fit=crop&q=80`} alt={col.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-muted opacity-25" />
            </div>
          )}
          {/* Privacy badge */}
          <div className="absolute top-2.5 left-2.5">
            {col.visibility === "private" ? (
              <span className="flex items-center gap-1 bg-accent/90 backdrop-blur-sm text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-md">
                <Lock className="w-2.5 h-2.5" /> Private
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-green-600/90 backdrop-blur-sm text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-md">
                <Globe className="w-2.5 h-2.5" /> Public
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
             <h3 className="font-semibold text-[0.92rem]">{col.title}</h3>
            <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${col.visibility === "public" ? "bg-green-600/10 text-green-600" : "bg-accent/10 text-accent"}`}>
              {col.visibility === "public" ? "Public" : "Private"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[0.75rem] text-muted flex-wrap">
            {(col.imageCount || 0) > 0 && <span className="flex items-center gap-1"><Image className="w-3 h-3" />{col.imageCount} images</span>}
            {(col.videoCount || 0) > 0 && <span className="flex items-center gap-1"><Video className="w-3 h-3" />{col.videoCount} videos</span>}
            {(col.musicCount || 0) > 0 && <span className="flex items-center gap-1"><Music className="w-3 h-3" />{col.musicCount} tracks</span>}
            {col.visibility === "private" && col.members > 0 && (
              <><span className="text-foreground/20">·</span><span className="flex items-center gap-1"><Users className="w-3 h-3" />{col.members} members</span></>
            )}
            {col.accessCode && (
              <><span className="text-foreground/20">·</span><span className="flex items-center gap-1 font-mono"><Key className="w-2.5 h-2.5" />{col.accessCode}</span></>
            )}
          </div>
          {col.description ? (
            <p className="text-[0.75rem] text-muted line-clamp-1 mt-1">{col.description}</p>
          ) : (
            <p className="text-[0.75rem] text-muted/50 mt-1 italic">No description</p>
          )}
          {/* Edit / Delete */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-foreground/[0.06]">
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
              className="flex items-center gap-1.5 text-[0.76rem] text-muted hover:text-foreground transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              className="flex items-center gap-1.5 text-[0.76rem] text-muted hover:text-red-500 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ── Empty State ── */
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-16">
    <div className="font-display text-[2rem] font-black tracking-[-0.03em] mb-3">Nothing here yet</div>
    <p className="text-muted text-[0.88rem]">{message}</p>
  </div>
);

/* ── Main Page ── */
export default function CollectionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"discover" | "mine">("discover");
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [sortMine, setSortMine] = useState<"newest" | "name" | "size">("newest");
  const [myCollections, setMyCollections] = useState<Collection[]>(() => getCollections());
  const isLoggedIn = (() => {
    try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; }
  })();

  useEffect(() => {
    const sync = () => setMyCollections(getCollections());
    window.addEventListener("ra_collections_changed", sync);
    return () => window.removeEventListener("ra_collections_changed", sync);
  }, []);

  const filteredCurated = curatedCollections.filter(c => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchQ = !query || c.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const filteredCommunity = communityCollections.filter(b => {
    const matchCat = activeCategory === "All" || b.category === activeCategory;
    const matchQ = !query || b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.creator.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const filteredMine = myCollections
    .filter(c => !query || c.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortMine === "name") return a.title.localeCompare(b.title);
      if (sortMine === "size") return b.items.length - a.items.length;
      return 0; // newest = default insertion order
    });

  const discoverFeatured = filteredCurated.filter(c => c.featured);
  const discoverCurated = filteredCurated.filter(c => !c.featured);

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
        <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3 h-3 opacity-30" />
        <span className="text-foreground">Collections</span>
      </div>

      {/* Header */}
      <div className="px-6 md:px-12 pb-5 max-w-[1440px] mx-auto">
        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-[3.2rem] font-black tracking-[-0.03em] leading-none mb-2">Collections</h1>
            <p className="text-[0.88rem] text-muted">Curated galleries, community boards, and your personal collections — all in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-card border border-foreground/[0.12] rounded-xl px-4 h-11 w-full md:w-72 focus-within:border-foreground transition-colors">
              <Search className="w-4 h-4 text-muted shrink-0" />
              <input
                className="flex-1 border-none outline-none font-body text-[0.88rem] bg-transparent"
                placeholder="Search collections…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && <button onClick={() => setQuery("")} className="text-muted hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <button
              onClick={() => isLoggedIn ? setShowCreate(true) : navigate("/signup")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> New Collection
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-foreground/[0.06]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center gap-0">
          {TABS.map(t => {
            const Icon = t.icon;
            const count = t.id === "mine" ? myCollections.length : communityCollections.length + curatedCollections.length;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[0.86rem] font-medium border-b-2 -mb-px transition-colors ${activeTab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                <span className="text-[0.72rem] text-muted ml-0.5">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter (not shown on Mine tab) */}
      {activeTab !== "mine" && (
        <div className="border-b border-foreground/[0.06]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`border px-4 py-1.5 rounded-lg text-[0.79rem] font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "bg-transparent border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 md:px-12 py-8 max-w-[1440px] mx-auto">
        {/* ALL COLLECTIONS TAB */}
        {activeTab === "discover" && (
          <>
            {discoverFeatured.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent">Featured by REAL ART</div>
                  <div className="flex-1 h-px bg-foreground/[0.06]" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {discoverFeatured.map(col => (
                    <Link key={col.id} to={`/collections/${col.id}`} className="group block no-underline">
                      <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all hover:-translate-y-1">
                        <div className="h-[200px] overflow-hidden relative">
                          <img src={`https://images.unsplash.com/${col.photo}?w=400&h=200&fit=crop&q=80`} alt={col.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="text-[0.68rem] text-white/60 mb-0.5">by {col.curator}</div>
                            <div className="font-display text-[1.1rem] font-black text-white leading-tight">{col.name}</div>
                          </div>
                          <div className="absolute top-2.5 right-2.5 bg-accent text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-md">Featured</div>
                        </div>
                        <div className="p-3 text-[0.75rem] text-muted">{col.count.toLocaleString()} images</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredCommunity.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-muted">Trending by Creators</div>
                  <div className="flex-1 h-px bg-foreground/[0.06]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCommunity.slice(0, 6).map(b => (
                    <CommunityCard key={b.id} board={b} />
                  ))}
                </div>
              </div>
            )}

            {discoverCurated.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-muted">More Curated Collections</div>
                  <div className="flex-1 h-px bg-foreground/[0.06]" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {discoverCurated.map(col => (
                    <Link key={col.id} to={`/collections/${col.id}`} className="group block no-underline">
                      <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all hover:-translate-y-1">
                        <div className="h-[160px] overflow-hidden">
                          <img src={`https://images.unsplash.com/${col.photo}?w=400&h=160&fit=crop&q=80`} alt={col.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                        </div>
                        <div className="p-3">
                          <div className="font-semibold text-[0.88rem]">{col.name}</div>
                          <div className="text-[0.75rem] text-muted">{col.curator} · {col.count.toLocaleString()} images</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* (curated tab removed — content merged into All Collections) */}

        {/* MY COLLECTIONS TAB */}
        {activeTab === "mine" && (
          <>
            {filteredMine.length === 0 ? (
              <div className="text-center py-20">
                <Bookmark className="w-10 h-10 text-muted mx-auto mb-4 opacity-30" />
                <h2 className="font-display text-[1.6rem] font-black mb-2">No collections yet</h2>
                <p className="text-muted text-[0.88rem] mb-6">Browse images and save them, or create a new collection.</p>
                <button onClick={() => setShowCreate(true)} className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" /> Create your first collection
                </button>
              </div>
            ) : (
              <>
                {/* Sort bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-[0.82rem] text-muted">
                    {filteredMine.length} collection{filteredMine.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.75rem] text-muted mr-1">Sort:</span>
                    {([["newest", "Newest"], ["name", "Name"], ["size", "Most saved"]] as const).map(([v, l]) => (
                      <button key={v} onClick={() => setSortMine(v)}
                        className={`px-3 py-1 rounded-lg text-[0.76rem] font-medium transition-colors ${sortMine === v ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredMine.map(col => (
                    <MyCollectionCard key={col.id} col={col} onEdit={() => setEditingCol(col)} onDelete={() => setDeleteTarget(col)} />
                  ))}
                  <button onClick={() => setShowCreate(true)} className="rounded-2xl border-2 border-dashed border-foreground/[0.1] flex flex-col items-center justify-center hover:border-foreground/25 hover:bg-foreground/[0.02] transition-colors min-h-[240px] group">
                    <Plus className="w-6 h-6 text-muted group-hover:text-foreground transition-colors mb-2" />
                    <span className="text-[0.82rem] text-muted group-hover:text-foreground font-medium">New Collection</span>
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={() => { setMyCollections(getCollections()); setActiveTab("mine"); }}
        />
      )}

      {editingCol && (
        <EditCollectionModal
          col={editingCol}
          onClose={() => setEditingCol(null)}
          onSave={() => { setMyCollections(getCollections()); setEditingCol(null); }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[400px] shadow-2xl animate-drop-in p-6 text-center" onClick={e => e.stopPropagation()}>
            <Trash2 className="w-5 h-5 text-red-500 mx-auto mb-4" />
            <h3 className="font-display text-[1.2rem] font-bold mb-2">Delete "{deleteTarget.title}"?</h3>
            <p className="text-[0.85rem] text-muted mb-1">All {deleteTarget.items.length} saved images will be permanently removed.</p>
            <p className="text-[0.78rem] text-muted/70 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { deleteCollection(deleteTarget.id); setMyCollections(getCollections()); setDeleteTarget(null); }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-[0.88rem] font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-3 rounded-xl border border-foreground/[0.12] text-[0.88rem] font-medium hover:border-foreground/30 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </PageShell>
  );
}
