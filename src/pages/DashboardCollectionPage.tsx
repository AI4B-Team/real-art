import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Upload, Plus, Trash2, GripVertical, Download,
  Heart, Eye, Globe, Lock, Key, Edit3, Check, X,
  Grid3X3, Rows3, SlidersHorizontal, Search, Image,
  Video, Music, Play, ChevronDown, AlertTriangle, Users, ExternalLink
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import { getCollectionLink, setCollectionLink, removeCollectionLink, type CollectionLink } from "@/lib/linkStore";

// Types
type MediaType = "image" | "video" | "music";

interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  photo: string;
  downloads: string;
  likes: string;
  views: string;
  pinned?: boolean;
}

// Collection data
const collectionsData: Record<string, {
  id: string; name: string; desc: string; free: boolean;
  code: string; members: number; slug: string; items: MediaItem[];
}> = {
  "g1": {
    id: "g1", name: "Main Collection",
    desc: "My primary public portfolio — best work across all categories.",
    free: true, code: "", members: 0, slug: "main-collection",
    items: [
      { id: "i1", type: "image", title: "Cosmic Dreamscape", photo: "photo-1618005182384-a83a8bd57fbe", downloads: "3,412", likes: "847", views: "48,201", pinned: true },
      { id: "i2", type: "image", title: "Neon Boulevard", photo: "photo-1557682250-33bd709cbe85", downloads: "2,180", likes: "612", views: "31,400" },
      { id: "i3", type: "image", title: "Digital Avatar 01", photo: "photo-1604881991720-f91add269bed", downloads: "1,940", likes: "534", views: "26,800" },
      { id: "i4", type: "image", title: "Cyberpunk City Night", photo: "photo-1579546929518-9e396f3cc809", downloads: "1,620", likes: "441", views: "22,100" },
      { id: "i5", type: "image", title: "Abstract Fire", photo: "photo-1541701494587-cb58502866ab", downloads: "1,410", likes: "388", views: "18,600" },
      { id: "i6", type: "image", title: "Forest Spirit", photo: "photo-1501854140801-50d01698950b", downloads: "1,120", likes: "302", views: "14,200" },
      { id: "i7", type: "image", title: "Liquid Chrome", photo: "photo-1576091160550-2173dba999ef", downloads: "940", likes: "278", views: "11,800" },
      { id: "i8", type: "image", title: "Night Sky Portal", photo: "photo-1547036967-23d11aacaee0", downloads: "820", likes: "241", views: "9,400" },
      { id: "v1", type: "video", title: "Liquid Chrome Loop", photo: "photo-1576091160550-2173dba999ef", downloads: "842", likes: "291", views: "12,800" },
      { id: "v2", type: "video", title: "Neon Rain Cinemagraph", photo: "photo-1547036967-23d11aacaee0", downloads: "619", likes: "178", views: "8,400" },
      { id: "v3", type: "video", title: "Fractal Expansion", photo: "photo-1558618666-fcd25c85cd64", downloads: "390", likes: "94", views: "4,100" },
      { id: "m1", type: "music", title: "Midnight Synthwave", photo: "photo-1543722530-d2c3201371e7", downloads: "1,240", likes: "512", views: "9,300" },
      { id: "m2", type: "music", title: "Cosmic Ambience", photo: "photo-1462275646964-a0e3386b89fa", downloads: "870", likes: "334", views: "6,100" },
    ],
  },
  "g2": {
    id: "g2", name: "Premium Prompts",
    desc: "Curated prompt library — exclusive access.",
    free: false, code: "XK9F2M", members: 127, slug: "premium-prompts",
    items: [
      { id: "i1", type: "image", title: "Avatar Series 01", photo: "photo-1604881991720-f91add269bed", downloads: "980", likes: "420", views: "14,200" },
      { id: "i2", type: "image", title: "Neon Portrait", photo: "photo-1557682250-33bd709cbe85", downloads: "740", likes: "318", views: "9,800" },
      { id: "i3", type: "image", title: "Cosmic Face", photo: "photo-1618005182384-a83a8bd57fbe", downloads: "610", likes: "267", views: "7,400" },
      { id: "i4", type: "image", title: "Abstract Soul", photo: "photo-1576091160550-2173dba999ef", downloads: "480", likes: "198", views: "5,900" },
    ],
  },
  "g3": {
    id: "g3", name: "Avatar Collection",
    desc: "AI avatar styles and portrait prompts.",
    free: false, code: "RT7P4Q", members: 64, slug: "avatar-collection",
    items: [
      { id: "i1", type: "image", title: "Cyberpunk Avatar", photo: "photo-1579546929518-9e396f3cc809", downloads: "720", likes: "298", views: "10,200" },
      { id: "i2", type: "image", title: "Ethereal Portrait", photo: "photo-1604881991720-f91add269bed", downloads: "580", likes: "241", views: "7,800" },
      { id: "i3", type: "video", title: "Avatar Loop", photo: "photo-1541701494587-cb58502866ab", downloads: "310", likes: "143", views: "4,200" },
    ],
  },
};

const typeIcon = { image: Image, video: Video, music: Music };
const typeBadge = { image: "bg-blue-50 text-blue-700", video: "bg-purple-50 text-purple-700", music: "bg-orange-50 text-orange-700" };

export default function DashboardCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const collectionKey = id || "g1";
  const initialCol = collectionsData[collectionKey] || collectionsData["g1"];

  const [col, setCol] = useState(initialCol);
  const [items, setItems] = useState(initialCol.items);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaType>("all");
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState("Custom Order");
  const [selected, setSelected] = useState<string[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(col.name);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(col.desc);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [changingCode, setChangingCode] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  // Affiliate link state
  const [colLink, setColLink] = useState<CollectionLink | null>(() => getCollectionLink(collectionKey) || null);
  const [editingLink, setEditingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkSite, setLinkSite] = useState("");
  const [linkIsAffiliate, setLinkIsAffiliate] = useState(false);

  const saveColLink = () => {
    if (!linkUrl.trim()) {
      removeCollectionLink(collectionKey);
      setColLink(null);
      showToast("Link removed");
    } else {
      const l: CollectionLink = { collectionId: collectionKey, defaultUrl: linkUrl.trim(), defaultLabel: linkLabel.trim() || "Shop this look", defaultSite: linkSite.trim() || "Shop", isAffiliate: linkIsAffiliate };
      setCollectionLink(l); setColLink(l); showToast("Collection link saved");
    }
    setEditingLink(false);
  };
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Filtering & sorting
  const filtered = items
    .filter(i => typeFilter === "all" || i.type === typeFilter)
    .filter(i => !searchQ || i.title.toLowerCase().includes(searchQ.toLowerCase()));

  const imageCount = items.filter(i => i.type === "image").length;
  const videoCount = items.filter(i => i.type === "video").length;
  const musicCount = items.filter(i => i.type === "music").length;

  // Selection
  const toggleSelect = (itemId: string) =>
    setSelected(p => p.includes(itemId) ? p.filter(x => x !== itemId) : [...p, itemId]);
  const allSelected = filtered.length > 0 && filtered.every(i => selected.includes(i.id));
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map(i => i.id));

  // Delete
  const deleteSelected = () => {
    setItems(p => p.filter(i => !selected.includes(i.id)));
    showToast(`${selected.length} item${selected.length > 1 ? "s" : ""} removed`);
    setSelected([]);
  };

  // Drag to reorder
  const handleDragStart = (itemId: string) => setDragId(itemId);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault(); setDragOver(targetId);
  };
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOver(null); return; }
    const newItems = [...items];
    const fromIdx = newItems.findIndex(i => i.id === dragId);
    const toIdx = newItems.findIndex(i => i.id === targetId);
    const [moved] = newItems.splice(fromIdx, 1);
    newItems.splice(toIdx, 0, moved);
    setItems(newItems);
    setDragId(null); setDragOver(null);
    showToast("Order saved");
  };

  // Inline name edit
  const saveName = () => {
    if (nameInput.trim().length > 1) { setCol(c => ({ ...c, name: nameInput.trim() })); showToast("Name updated"); }
    setEditingName(false);
  };
  const saveDesc = () => {
    setCol(c => ({ ...c, desc: descInput })); showToast("Description updated");
    setEditingDesc(false);
  };

  // Add media (mock)
  const addImages = [
    { id: "n1", photo: "photo-1549880338-65ddcdfd017b", title: "Mountain Vista" },
    { id: "n2", photo: "photo-1506905925346-21bda4d32df4", title: "Alpine Glow" },
    { id: "n3", photo: "photo-1518020382113-a7e8fc38eac9", title: "Desert Bloom" },
    { id: "n4", photo: "photo-1518770660439-4636190af475", title: "Tech Abstract" },
    { id: "n5", photo: "photo-1605106702734-205df224ecce", title: "Ocean Drift" },
    { id: "n6", photo: "photo-1533158628620-7e4d0a003147", title: "Purple Haze" },
  ].filter(a => !items.some(i => i.photo === a.photo));

  const addItemToCollection = (a: typeof addImages[0]) => {
    const newItem: MediaItem = { id: `added-${Date.now()}`, type: "image", title: a.title, photo: a.photo, downloads: "0", likes: "0", views: "0" };
    setItems(p => [...p, newItem]);
    showToast(`"${a.title}" added`);
  };

  const heights = [200, 240, 190, 260, 175, 220, 250, 185, 210, 235, 170, 245, 195];

  return (
    <PageShell>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-[600] bg-foreground text-primary-foreground text-[0.82rem] font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <Check className="w-3.5 h-3.5 text-green-400" /> {toast}
        </div>
      )}

      
        {/* Header */}
        <div className="px-6 md:px-10 pt-6 pb-0 max-w-[1440px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-5">
            <button onClick={() => navigate("/dashboard")} className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
            <span className="opacity-30">/</span>
            <span className="text-foreground">{col.name}</span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    className="font-display text-[2rem] font-black tracking-[-0.03em] outline-none min-w-[200px] bg-transparent border-b-2 border-accent"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                  />
                  <button onClick={saveName} className="text-accent hover:text-foreground transition-colors"><Check className="w-5 h-5" /></button>
                  <button onClick={() => setEditingName(false)} className="text-muted hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h1 className="font-display text-[2.2rem] font-black tracking-[-0.03em] leading-none">{col.name}</h1>
                  <button onClick={() => { setEditingName(true); setNameInput(col.name); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-foreground/[0.06]">
                    <Edit3 className="w-4 h-4 text-muted" />
                  </button>
                </div>
              )}

              {/* Description */}
              {editingDesc ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    autoFocus
                    className="flex-1 text-[0.86rem] bg-transparent border-b border-foreground/20 outline-none focus:border-accent text-muted"
                    value={descInput}
                    onChange={e => setDescInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveDesc(); if (e.key === "Escape") setEditingDesc(false); }}
                  />
                  <button onClick={saveDesc} className="text-accent"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingDesc(false)} className="text-muted"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <p className="text-[0.85rem] text-muted items-center gap-2 group mt-1.5 flex">
                  {col.desc || "Add a description…"}
                  <button onClick={() => { setEditingDesc(true); setDescInput(col.desc); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-3.5 h-3.5 text-muted hover:text-foreground transition-colors" />
                  </button>
                </p>
              )}

              {/* Collection link display */}
              {!editingLink && colLink ? (
                <div className="flex items-center gap-2 mt-2.5 text-[0.78rem]">
                  <ExternalLink className="w-3.5 h-3.5 text-accent" />
                  <a href={colLink.defaultUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate max-w-[300px]">
                    {colLink.defaultSite} {colLink.defaultUrl}
                  </a>
                  {colLink.isAffiliate && <span className="text-[0.65rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-md">Affiliate</span>}
                  <button onClick={() => { setEditingLink(true); setLinkUrl(colLink.defaultUrl); setLinkLabel(colLink.defaultLabel); setLinkSite(colLink.defaultSite); setLinkIsAffiliate(colLink.isAffiliate); }} className="text-muted hover:text-foreground transition-colors ml-1">
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              ) : !editingLink ? (
                <button onClick={() => setEditingLink(true)} className="flex items-center gap-1.5 text-[0.77rem] text-muted hover:text-accent transition-colors mt-2.5">
                  <Plus className="w-3.5 h-3.5" /> Add shop / affiliate link to this collection
                </button>
              ) : null}

              {/* Inline link editor */}
              {editingLink && (
                <div className="mt-3 bg-card border border-foreground/[0.08] rounded-xl p-4 flex flex-col gap-3">
                  <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="Destination URL" className="w-full h-9 border border-foreground/[0.13] rounded-lg px-3 font-body text-[0.82rem] bg-background outline-none focus:border-foreground transition-colors" autoFocus />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="Button label" className="h-9 border border-foreground/[0.13] rounded-lg px-3 font-body text-[0.82rem] bg-background outline-none focus:border-foreground transition-colors" />
                    <input value={linkSite} onChange={e => setLinkSite(e.target.value)} placeholder="Site / brand" className="h-9 border border-foreground/[0.13] rounded-lg px-3 font-body text-[0.82rem] bg-background outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setLinkIsAffiliate(!linkIsAffiliate)} className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors ${linkIsAffiliate ? "bg-foreground border-foreground" : "border-foreground/20"}`}>
                      {linkIsAffiliate && <Check className="w-3 h-3 text-primary-foreground" />}
                    </button>
                    <span className="text-[0.78rem]">Affiliate link (FTC disclosure)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={saveColLink} className="px-4 py-1.5 bg-foreground text-primary-foreground rounded-lg text-[0.8rem] font-semibold hover:bg-accent transition-colors">Save</button>
                    <button onClick={() => setEditingLink(false)} className="px-4 py-1.5 border border-foreground/[0.12] rounded-lg text-[0.8rem] hover:border-foreground/30 transition-colors">Cancel</button>
                    {colLink && <button onClick={() => { setLinkUrl(""); saveColLink(); }} className="ml-auto text-[0.78rem] text-muted hover:text-red-500 transition-colors">Remove link</button>}
                  </div>
                </div>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap text-[0.78rem] text-muted">
                <span className={`flex items-center gap-1 font-bold text-[0.68rem] px-2.5 py-1 rounded-full ${col.visibility === "public" ? "bg-green-100 text-green-700" : "bg-accent/10 text-accent"}`}>
                  {col.visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {col.visibility === "public" ? "Public" : "Private"}
                </span>
                <span className="flex items-center gap-1"><Image className="w-3 h-3" />{imageCount} images</span>
                {videoCount > 0 && <span className="flex items-center gap-1"><Video className="w-3 h-3" />{videoCount} videos</span>}
                {musicCount > 0 && <span className="flex items-center gap-1"><Music className="w-3 h-3" />{musicCount} tracks</span>}
                {col.visibility === "private" && col.members > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{col.members} members</span>}
                {col.visibility === "private" && col.accessCode && (
                  <span className="flex items-center gap-1 font-mono font-bold text-foreground">
                    <Key className="w-3 h-3 text-muted" />{col.accessCode}
                  </span>
                )}
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setCol(c => ({ ...c, visibility: c.visibility === "public" ? "private" : "public" })); showToast(col.visibility === "public" ? "Set to Private" : "Set to Public"); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.82rem] font-medium hover:border-foreground/30 transition-colors"
              >
                {col.visibility === "public" ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {col.visibility === "public" ? "Make Private" : "Make Public"}
              </button>
              {col.visibility === "private" && (
                <button onClick={() => setChangingCode(!changingCode)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.82rem] font-medium hover:border-foreground/30 transition-colors">
                  <Key className="w-3.5 h-3.5" /> Change Code
                </button>
              )}
              <Link to={`/collections/1`} target="_blank" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.82rem] font-medium hover:border-foreground/30 transition-colors no-underline">
                <Eye className="w-3.5 h-3.5" /> View Page
              </Link>
              <button onClick={() => setShowAddPanel(!showAddPanel)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent transition-colors">
                <Plus className="w-4 h-4" /> Add Media
              </button>
            </div>
          </div>

          {/* Change Code panel */}
          {changingCode && (
            <div className="flex items-center gap-3 mt-4 bg-card border border-foreground/[0.08] rounded-xl p-4">
              <Key className="w-4 h-4 text-muted shrink-0" />
              <input
                autoFocus
                className="flex-1 h-9 px-4 rounded-lg bg-background border border-foreground/[0.1] text-[0.85rem] font-mono tracking-[0.12em] uppercase focus:outline-none focus:border-accent transition-colors"
                placeholder="NEW CODE"
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && newCode.length >= 4 && (setCol(c => ({ ...c, code: newCode })), setChangingCode(false), setNewCode(""), showToast(`Code updated to ${newCode}`))}
                maxLength={10}
              />
              <button
                onClick={() => { if (newCode.length >= 4) { setCol(c => ({ ...c, code: newCode })); setChangingCode(false); setNewCode(""); showToast(`Code updated to ${newCode}`); } }}
                className="px-3 py-1.5 bg-foreground text-primary-foreground rounded-lg text-[0.78rem] font-semibold hover:bg-accent transition-colors"
              >Save</button>
              <button onClick={() => setChangingCode(false)} className="text-muted hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Add Media panel */}
          {showAddPanel && (
            <div className="mt-4 bg-card border border-foreground/[0.08] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[0.82rem] font-semibold">Add from your Media library</span>
                <button onClick={() => setShowAddPanel(false)} className="text-muted hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {addImages.map(a => (
                  <button key={a.id} onClick={() => addItemToCollection(a)} className="group relative rounded-xl overflow-hidden aspect-square">
                    <img src={`https://images.unsplash.com/${a.photo}?w=200&h=200&fit=crop&q=75`} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
              <Link to="/upload" className="flex items-center gap-1.5 text-[0.78rem] text-accent font-medium mt-3 hover:underline no-underline">
                <Upload className="w-3.5 h-3.5" /> Upload new media instead
              </Link>
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="px-6 md:px-10 max-w-[1440px] mx-auto mt-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Type filter pills */}
            <div className="flex gap-1.5">
              {(["all", "image", "video", "music"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors capitalize ${typeFilter === f ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}
                >
                  {f === "all" ? `All (${items.length})` : f === "image" ? `Images (${imageCount})` : f === "video" ? `Videos (${videoCount})` : `Music (${musicCount})`}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 px-3 h-9 rounded-xl border border-foreground/[0.1] flex-1 min-w-[180px] max-w-[320px]">
              <Search className="w-3.5 h-3.5 text-muted shrink-0" />
              <input
                placeholder="Search items…"
                className="flex-1 bg-transparent outline-none text-[0.82rem]"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
            </div>

            <div className="flex-1" />

            {/* Sort dropdown */}
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-foreground/[0.1] text-[0.8rem] font-medium hover:border-foreground/25 transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5" /> {sortBy}
                <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-11 w-[180px] bg-card border border-foreground/[0.1] rounded-xl shadow-xl py-1.5 z-30">
                  {["Custom Order", "Newest First", "Most Downloads", "Most Likes", "Most Views"].map(o => (
                    <button key={o} onClick={() => { setSortBy(o); setSortOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-[0.8rem] transition-colors ${sortBy === o ? "font-semibold text-accent" : "hover:bg-background"}`}>{o}</button>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle */}
            <div className="flex gap-1">
              <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}><Grid3X3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}><Rows3 className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.length > 0 && (
            <div className="bg-foreground rounded-xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
              <span className="text-[0.8rem] text-primary-foreground font-semibold">{selected.length} selected</span>
              <button onClick={deleteSelected} className="flex items-center gap-1.5 text-[0.75rem] text-primary-foreground/70 hover:text-primary-foreground transition-colors px-2.5 py-1.5 rounded-lg bg-primary-foreground/[0.08]">
                <Trash2 className="w-3.5 h-3.5" /> Remove from collection
              </button>
              <button onClick={() => setSelected([])} className="text-[0.72rem] text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">Clear</button>
            </div>
          )}

          {/* Select all & count */}
          <div className="flex items-center gap-3 mb-4 text-[0.78rem] text-muted">
            <button onClick={toggleAll} className={`w-4.5 h-4.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${allSelected ? "bg-accent border-accent" : "border-foreground/20 hover:border-foreground/40"}`}>
              {allSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
            </button>
            <span>Select all</span>
            {sortBy === "Custom Order" && (
              <span className="flex items-center gap-1 text-muted/60"><GripVertical className="w-3 h-3" />Drag to reorder</span>
            )}
            <span className="ml-auto text-muted/60">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* ═══ GRID VIEW ═══ */}
          {view === "grid" && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {filtered.map((item, i) => {
                const isSelected = selected.includes(item.id);
                const isDragging = dragId === item.id;
                const isOver = dragOver === item.id;
                return (
                  <div
                    key={item.id}
                    draggable={sortBy === "Custom Order"}
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={e => handleDragOver(e, item.id)}
                    onDrop={() => handleDrop(item.id)}
                    onDragEnd={() => { setDragId(null); setDragOver(null); }}
                    className={`break-inside-avoid mb-4 rounded-xl overflow-hidden relative group cursor-pointer transition-all ${isDragging ? "opacity-40" : ""} ${isOver ? "ring-2 ring-accent" : ""} ${isSelected ? "ring-2 ring-accent/60" : ""}`}
                    onClick={() => toggleSelect(item.id)}
                  >
                    <img
                      src={`https://images.unsplash.com/${item.photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                      alt={item.title}
                      className="w-full block rounded-xl"
                      style={{ height: heights[i % heights.length], objectFit: "cover" }}
                    />

                    {/* Type badge */}
                    {item.type !== "image" && (
                      <div className="absolute top-2 left-2 bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.6rem] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase">
                        {item.type === "video" && <Play className="w-3 h-3" />}
                        {item.type === "music" && <Music className="w-3 h-3" />}
                        {item.type}
                      </div>
                    )}

                    {/* Drag handle */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3.5 h-3.5 text-primary-foreground drop-shadow-md" />
                    </div>

                    {/* Selection check */}
                    <div className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-accent border-accent opacity-100" : "border-primary-foreground/50 opacity-0 group-hover:opacity-100"}`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>

                    {/* Bottom info bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }} onClick={e => e.stopPropagation()}>
                      <div className="text-primary-foreground text-[0.78rem] font-semibold mb-1">{item.title}</div>
                      <div className="flex items-center gap-3 text-[0.68rem] text-primary-foreground/70">
                        <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5" />{item.downloads}</span>
                        <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" />{item.likes}</span>
                        <button
                          onClick={() => { setItems(p => p.filter(x => x.id !== item.id)); showToast("Removed"); }}
                          className="ml-auto bg-red-500/80 rounded-md px-2 py-0.5 text-primary-foreground text-[0.62rem] font-semibold hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add media tile */}
              <button onClick={() => setShowAddPanel(true)} className="w-full rounded-xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center hover:border-foreground/30 hover:bg-foreground/[0.02] transition-colors" style={{ height: 160 }}>
                <Plus className="w-6 h-6 text-muted mb-1" />
                <span className="text-[0.78rem] text-muted font-medium">Add media</span>
              </button>
            </div>
          )}

          {/* ═══ LIST VIEW ═══ */}
          {view === "list" && (
            <div className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[24px_32px_44px_1fr_80px_80px_80px_80px] gap-3 px-5 py-3 border-b border-foreground/[0.06] text-[0.72rem] text-muted font-medium">
                <span />
                <span />
                <span />
                <span>Title</span>
                <span className="text-right">Downloads</span>
                <span className="text-right">Likes</span>
                <span className="text-right">Views</span>
                <span />
              </div>

              {filtered.map(item => {
                const isSelected = selected.includes(item.id);
                return (
                  <div
                    key={item.id}
                    draggable={sortBy === "Custom Order"}
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={e => handleDragOver(e, item.id)}
                    onDrop={() => handleDrop(item.id)}
                    onDragEnd={() => { setDragId(null); setDragOver(null); }}
                    className={`grid grid-cols-[24px_32px_44px_1fr_80px_80px_80px_80px] gap-3 px-5 py-3.5 border-b border-foreground/[0.04] last:border-none items-center hover:bg-foreground/[0.02] transition-colors ${isSelected ? "bg-accent/[0.04]" : ""} ${dragOver === item.id ? "bg-accent/[0.06]" : ""}`}
                  >
                    {/* Drag */}
                    {sortBy === "Custom Order"
                      ? <GripVertical className="w-4 h-4 text-muted cursor-grab" />
                      : <span />
                    }

                    {/* Checkbox */}
                    <button onClick={() => toggleSelect(item.id)} className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? "bg-accent border-accent" : "border-foreground/20 hover:border-foreground/40"}`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </button>

                    {/* Thumb */}
                    <div className="w-10 h-7 rounded-lg overflow-hidden bg-foreground/[0.06] relative">
                      <img src={`https://images.unsplash.com/${item.photo}?w=60&h=42&fit=crop&q=75`} alt="" className="w-full h-full object-cover" />
                      {item.type !== "image" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                          {item.type === "video" ? <Play className="w-3 h-3 text-primary-foreground" /> : <Music className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.82rem] font-medium truncate">{item.title}</span>
                        <span className="text-[0.65rem] text-muted capitalize">{item.type}</span>
                        {item.pinned && <span className="text-[0.6rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-md">Featured</span>}
                      </div>
                    </div>

                    <span className="text-[0.8rem] text-muted text-right">{item.downloads}</span>
                    <span className="text-[0.8rem] text-muted text-right">{item.likes}</span>
                    <span className="text-[0.8rem] text-muted text-right">{item.views}</span>

                    {/* Actions */}
                    <button
                      onClick={() => { setItems(p => p.filter(x => x.id !== item.id)); showToast("Removed"); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-muted ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete collection section */}
        <div className="px-6 md:px-10 max-w-[1440px] mx-auto mt-12 mb-12">
          <div className="border border-red-200 rounded-xl p-6">
            <h3 className="font-semibold text-[0.92rem] mb-1">Delete this collection</h3>
            <p className="text-[0.78rem] text-muted mb-4">The media inside will not be deleted — only the collection itself. This cannot be undone.</p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-[0.82rem] font-semibold hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete Collection
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-red-600 text-[0.82rem] font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Are you sure?
                </div>
                <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-lg bg-red-600 text-primary-foreground text-[0.82rem] font-semibold hover:bg-red-700 transition-colors">Yes, delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.82rem] font-medium hover:border-foreground/30 transition-colors">Cancel</button>
              </div>
            )}
          </div>
        </div>

        <Footer />
    </PageShell>
  );
}
