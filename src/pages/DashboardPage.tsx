import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Image, FolderOpen, DollarSign, Bell, Settings,
  Download, Eye, Users, Upload, Plus, ChevronRight, Key, TrendingUp,
  Heart, ArrowRight, RefreshCw, Code, Globe, Award, Star, Sparkles, Pin,
  Play, Music, SlidersHorizontal, Bookmark, MoreHorizontal, LayoutGrid,
  Megaphone, MousePointerClick, Pause, Trash2, Search, Layout as LayoutIcon,
  Edit3, ExternalLink, Video, X, Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getBoards, deleteBoard, updateBoard, createBoard, type Board } from "@/lib/boardStore";
import { getCollections, updateCollection as updateCol, type Collection } from "@/lib/collectionStore";
import { useNavigate } from "react-router-dom";

const navItems: { id: string; label: string; icon: typeof LayoutDashboard; internal: boolean; href?: string }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, internal: true },
  { id: "media", label: "Media", icon: Image, internal: true },
  { id: "galleries", label: "Collections", icon: FolderOpen, internal: true },
  { id: "boards", label: "Boards", icon: Bookmark, internal: true },
  { id: "earnings", label: "Earnings", icon: DollarSign, internal: true },
  { id: "ads", label: "Ads", icon: Megaphone, internal: true },
  { id: "notifications", label: "Notifications", icon: Bell, internal: true },
  { id: "settings", label: "Settings", icon: Settings, internal: true },
];

const recentActivity = [
  { text: "Your image Cosmic Dreamscape was downloaded", time: "2 min ago", icon: Download },
  { text: "NeoPixel started following you", time: "18 min ago", icon: Users },
  { text: "You earned $12.00 from an affiliate referral", time: "1 hr ago", icon: DollarSign },
  { text: "34 people liked Neon Boulevard today", time: "2 hr ago", icon: Heart },
  { text: "Your image Abstract Mind was downloaded", time: "3 hr ago", icon: Download },
  { text: "You earned $24.00 from an affiliate referral", time: "5 hr ago", icon: DollarSign },
];

const topImages = [
  { photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", downloads: "3,412", likes: "847", views: "48,201", remixes: "247", embeds: "1,032", affClicks: "312", earnings: "$124.40", pinned: true },
  { photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", downloads: "2,180", likes: "612", views: "31,400", remixes: "189", embeds: "742", affClicks: "198", earnings: "$79.20", pinned: false },
  { photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar 01", downloads: "1,940", likes: "534", views: "26,800", remixes: "156", embeds: "498", affClicks: "164", earnings: "$70.56", pinned: false },
  { photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City Night", downloads: "1,620", likes: "441", views: "22,100", remixes: "121", embeds: "387", affClicks: "127", earnings: "$58.90", pinned: false },
  { photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", downloads: "1,410", likes: "388", views: "18,600", remixes: "94", embeds: "256", affClicks: "89", earnings: "$51.26", pinned: false },
];

const earningsData = [
  { month: "Oct", amount: 142 },
  { month: "Nov", amount: 218 },
  { month: "Dec", amount: 189 },
  { month: "Jan", amount: 304 },
  { month: "Feb", amount: 276 },
  { month: "Mar", amount: 412 },
];

// galleriesInitial removed — now sourced from collectionStore

const maxEarning = Math.max(...earningsData.map(d => d.amount));

const achievements = [
  // Download milestones (leveled)
  { icon: Download, title: "10K Downloads", desc: "Images downloaded 10,000 times", unlocked: true, level: 1, maxLevel: 4 },
  { icon: Download, title: "50K Downloads", desc: "Images downloaded 50,000 times", unlocked: true, level: 2, maxLevel: 4 },
  { icon: Download, title: "100K Downloads", desc: "Images downloaded 100,000 times", unlocked: false, progress: 82, level: 3, maxLevel: 4 },
  { icon: Download, title: "500K Downloads", desc: "Images downloaded 500,000 times", unlocked: false, progress: 16, level: 4, maxLevel: 4 },
  // Creator milestones
  { icon: Award, title: "Top Creator", desc: "Top 10 on leaderboard", unlocked: true },
  { icon: Users, title: "10K Followers", desc: "Reached 10,000 followers", unlocked: true },
  { icon: TrendingUp, title: "Trending Artist", desc: "Featured on trending page", unlocked: true },
  { icon: Sparkles, title: "Style Pioneer", desc: "Style used by 500+ creators", unlocked: true },
  { icon: Globe, title: "Embedded Everywhere", desc: "Images on 1,000+ websites", unlocked: false, progress: 64 },
  // Creator economy achievements
  { icon: DollarSign, title: "First $100 Earned", desc: "Earned your first $100 from the platform", unlocked: true },
  { icon: DollarSign, title: "First $1,000 Earned", desc: "Earned $1,000 total from all revenue streams", unlocked: false, progress: 71 },
  { icon: Eye, title: "1M Views", desc: "Your images have been viewed 1 million times", unlocked: false, progress: 48 },
  { icon: Code, title: "First 10 Embeds", desc: "Your images are embedded on 10+ websites", unlocked: true },
];

const weeklyExposure = [
  { day: "Mon", views: 34200 },
  { day: "Tue", views: 41800 },
  { day: "Wed", views: 38600 },
  { day: "Thu", views: 52100 },
  { day: "Fri", views: 48900 },
  { day: "Sat", views: 56200 },
  { day: "Sun", views: 44300 },
];
const maxWeekly = Math.max(...weeklyExposure.map(d => d.views));

/* ═══ MEDIA DATA ═══ */
type MediaType = "image" | "video" | "music";

interface MediaItem {
  id: string;
  type: MediaType;
  photo: string;
  title: string;
  downloads: string;
  remixes: string;
  likes: string;
  views: string;
  earnings: string;
  pinned: boolean;
  published: string;
  size: string;
}

const mediaItems: MediaItem[] = [
  // Images
  { id: "i1", type: "image", photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", downloads: "3,412", remixes: "247", likes: "847", views: "48,201", earnings: "$124.40", pinned: true, published: "Mar 10, 2026", size: "4096×4096" },
  { id: "i2", type: "image", photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", downloads: "2,180", remixes: "189", likes: "612", views: "31,400", earnings: "$79.20", pinned: false, published: "Mar 8, 2026", size: "4096×4096" },
  { id: "i3", type: "image", photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar 01", downloads: "1,940", remixes: "156", likes: "534", views: "26,800", earnings: "$70.56", pinned: false, published: "Mar 5, 2026", size: "2048×2048" },
  { id: "i4", type: "image", photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City Night", downloads: "1,620", remixes: "121", likes: "441", views: "22,100", earnings: "$58.90", pinned: false, published: "Feb 28, 2026", size: "4096×4096" },
  { id: "i5", type: "image", photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", downloads: "1,410", remixes: "94", likes: "388", views: "18,600", earnings: "$51.26", pinned: false, published: "Feb 22, 2026", size: "3840×2160" },
  { id: "i6", type: "image", photo: "photo-1558618666-fcd25c85cd64", title: "Forest Spirit", downloads: "1,120", remixes: "78", likes: "302", views: "14,200", earnings: "$40.70", pinned: false, published: "Feb 18, 2026", size: "4096×4096" },
  // Videos
  { id: "v1", type: "video", photo: "photo-1558591710-4b4a1ae0f04d", title: "Liquid Chrome Loop", downloads: "842", remixes: "34", likes: "291", views: "12,800", earnings: "$30.62", pinned: false, published: "Mar 6, 2026", size: "1920×1080 · 0:12" },
  { id: "v2", type: "video", photo: "photo-1550684848-fac1c5b4e853", title: "Neon Rain Cinemagraph", downloads: "619", remixes: "22", likes: "178", views: "8,400", earnings: "$22.50", pinned: false, published: "Feb 24, 2026", size: "1920×1080 · 0:08" },
  { id: "v3", type: "video", photo: "photo-1506259091721-2c27eb6c768f", title: "Fractal Expansion", downloads: "390", remixes: "11", likes: "94", views: "4,100", earnings: "$14.18", pinned: false, published: "Feb 10, 2026", size: "3840×2160 · 0:24" },
  // Music
  { id: "m1", type: "music", photo: "photo-1511379938547-c1f69419868d", title: "Midnight Synthwave", downloads: "1,240", remixes: "0", likes: "512", views: "9,300", earnings: "$45.10", pinned: false, published: "Mar 1, 2026", size: "3:42 · 128 BPM · Am" },
  { id: "m2", type: "music", photo: "photo-1493225457124-a3eb161ffa5f", title: "Cosmic Ambience", downloads: "870", remixes: "0", likes: "334", views: "6,100", earnings: "$31.64", pinned: false, published: "Feb 14, 2026", size: "5:18 · 90 BPM · Dm" },
  { id: "m3", type: "music", photo: "photo-1470225620780-dba8ba36b745", title: "Neural Drift", downloads: "420", remixes: "0", likes: "187", views: "3,200", earnings: "$15.28", pinned: false, published: "Jan 30, 2026", size: "4:07 · 140 BPM · Cm" },
];

const typeIcon: Record<MediaType, typeof Image> = {
  image: Image,
  video: Play,
  music: Music,
};

/* ═══ MEDIA SECTION COMPONENT ═══ */
const MediaSection = () => {
  const [filter, setFilter] = useState<"all" | MediaType>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = filter === "all" ? mediaItems : mediaItems.filter(m => m.type === filter);
  const allSelected = selected.length === filtered.length && filtered.length > 0;

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const counts = {
    all: mediaItems.length,
    image: mediaItems.filter(m => m.type === "image").length,
    video: mediaItems.filter(m => m.type === "video").length,
    music: mediaItems.filter(m => m.type === "music").length,
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">Media</h1>
          <p className="text-[0.82rem] text-muted mt-1">{filtered.length} item{filtered.length !== 1 ? "s" : ""} · Images, Videos, Music</p>
        </div>
        <Link to="/upload" className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline">
          <Upload className="w-4 h-4" /> Upload New
        </Link>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Filter pills */}
        <div className="flex gap-1.5">
          {(["all", "image", "video", "music"] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelected([]); }}
              className={`px-3.5 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors ${filter === f ? "bg-foreground text-primary-foreground" : "bg-card border border-foreground/[0.1] text-muted hover:text-foreground"}`}
            >
              {f === "all" ? "All" : f === "image" ? "Images" : f === "video" ? "Videos" : "Music"} <span className="ml-1 opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="h-10 px-3 rounded-xl border border-foreground/[0.1] text-[0.8rem] font-medium bg-card outline-none cursor-pointer hover:border-foreground/25 transition-colors appearance-none"
        >
          <option value="recent">Most Recent</option>
          <option value="downloads">Most Downloads</option>
        </select>

        {/* View toggle */}
        <div className="flex gap-1">
          <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}>
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="bg-foreground rounded-xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-[0.8rem] text-primary-foreground font-semibold">{selected.length} selected</span>
          <div className="flex gap-2">
            {[
              { label: "Add To Collection", icon: Bookmark },
              { label: "Download", icon: Download },
              { label: "Delete", icon: MoreHorizontal },
            ].map(a => (
              <button key={a.label} className="flex items-center gap-1.5 text-[0.75rem] text-primary-foreground/70 hover:text-primary-foreground transition-colors px-2.5 py-1.5 rounded-lg bg-primary-foreground/[0.08]">
                <a.icon className="w-3 h-3" /> {a.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSelected([])} className="text-[0.75rem] text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors ml-1">
            Clear
          </button>
        </div>
      )}

      {/* Select all */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setSelected(allSelected ? [] : filtered.map(m => m.id))}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${allSelected ? "bg-accent border-accent" : "border-foreground/20 hover:border-foreground/40"}`}
        >
          {allSelected && <Star className="w-2.5 h-2.5 text-primary-foreground" />}
        </button>
        <span className="text-[0.78rem] text-muted">Select all</span>
        <span className="text-[0.72rem] text-muted/60 ml-2">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ═══ GRID VIEW ═══ */}
      {view === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => {
            const isSelected = selected.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`bg-card border rounded-xl overflow-hidden group cursor-pointer transition-colors ${isSelected ? "border-accent ring-1 ring-accent/30" : "border-foreground/[0.08]"}`}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  {item.type === "music" ? (
                    <div className="w-full h-full bg-foreground/[0.06] flex items-center justify-center">
                      <div className="flex items-end gap-[3px] h-12">
                        {[4, 7, 5, 9, 6, 11, 8, 5, 10, 7, 4, 8, 6, 10, 5, 9, 7, 4, 8, 6].map((h, i) => (
                          <div key={i} className="w-[3px] bg-accent/60 rounded-full" style={{ height: `${h * 3}px` }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <img
                      src={`https://images.unsplash.com/${item.photo}?w=400&h=300&fit=crop&q=78`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  )}

                  {/* Type badge */}
                  {item.type !== "image" && (
                    <div className="absolute top-2 left-2 bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.6rem] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase">
                      {item.type === "video" && <Play className="w-3 h-3" />}
                      {item.type === "music" && <Music className="w-3 h-3" />}
                      {item.type}
                    </div>
                  )}

                  {/* Pinned badge */}
                  {item.pinned && (
                    <div className="absolute top-2 right-2 bg-accent text-primary-foreground text-[0.6rem] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Star className="w-2 h-2" /> Featured
                    </div>
                  )}

                  {/* Hover actions */}
                  <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <Link to="/upload" className="bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.65rem] font-semibold px-2 py-1 rounded-lg no-underline hover:bg-accent transition-colors">Edit</Link>
                    <Link to={`/image/${item.id}`} className="bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.65rem] font-semibold px-2 py-1 rounded-lg no-underline hover:bg-accent transition-colors">View</Link>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-md bg-accent flex items-center justify-center">
                      <Star className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[0.82rem] font-semibold mb-0.5">{item.title}</div>
                  <div className="text-[0.68rem] text-muted mb-1.5 capitalize">{item.type} · {item.size}</div>
                  <div className="flex items-center gap-3 text-[0.72rem] text-muted">
                    <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5" />{item.downloads}</span>
                    {item.type !== "music" && <span className="flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" />{item.remixes}</span>}
                    <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" />{item.likes}</span>
                    <span className="ml-auto text-accent font-semibold">{item.earnings}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Upload more tile */}
          <Link
            to="/upload"
            className="bg-card border border-dashed border-foreground/[0.15] rounded-xl flex flex-col items-center justify-center gap-2 aspect-[4/3] hover:border-accent/40 transition-colors no-underline group"
            onClick={e => e.stopPropagation()}
          >
            <Plus className="w-8 h-8 text-muted group-hover:text-accent transition-colors" />
            <span className="text-[0.8rem] text-muted group-hover:text-accent font-medium transition-colors">Upload More</span>
          </Link>
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {view === "list" && (
        <div className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[28px_44px_1fr_80px_80px_80px_90px_80px] gap-3 px-4 py-3 border-b border-foreground/[0.06] text-[0.72rem] text-muted font-medium">
            <span />
            <span />
            <span>Title</span>
            <span className="text-right">Downloads</span>
            <span className="text-right">Remixes</span>
            <span className="text-right">Likes</span>
            <span className="text-right">Earnings</span>
            <span className="text-right">Published</span>
          </div>

          {filtered.map(item => {
            const isSelected = selected.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`grid grid-cols-[28px_44px_1fr_80px_80px_80px_90px_80px] gap-3 px-4 py-3.5 border-b border-foreground/[0.04] last:border-none items-center cursor-pointer transition-colors hover:bg-foreground/[0.02] ${isSelected ? "bg-accent/[0.04]" : ""}`}
              >
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-accent border-accent" : "border-foreground/20"}`}>
                  {isSelected && <Star className="w-2.5 h-2.5 text-primary-foreground" />}
                </div>

                {/* Thumbnail */}
                <div className="w-10 h-7 rounded-lg overflow-hidden bg-foreground/[0.06] relative">
                  {item.type === "music" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-3 h-3 text-muted" />
                    </div>
                  ) : (
                    <>
                      <img src={`https://images.unsplash.com/${item.photo}?w=60&h=40&fit=crop&q=75`} alt="" className="w-full h-full object-cover" />
                      {item.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-3 h-3 text-primary-foreground drop-shadow-md" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.82rem] font-medium truncate">{item.title}</span>
                    {item.pinned && <span className="text-[0.6rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-md shrink-0">Featured</span>}
                    <span className="text-[0.65rem] text-muted capitalize shrink-0">{item.type}</span>
                  </div>
                  <div className="text-[0.68rem] text-muted truncate">{item.size}</div>
                </div>

                <span className="text-[0.8rem] text-muted text-right">{item.downloads}</span>
                <span className="text-[0.8rem] text-muted text-right">{item.type !== "music" ? item.remixes : "—"}</span>
                <span className="text-[0.8rem] text-muted text-right">{item.likes}</span>
                <span className="text-[0.8rem] text-accent font-semibold text-right">{item.earnings}</span>
                <span className="text-[0.72rem] text-muted text-right">{item.published.split(",")[0]}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

/* ═══ GALLERIES SECTION COMPONENT ═══ */
const totalMedia = (g: Collection) => g.images + g.videos + g.music;

const GalleriesSection = () => {
  const [galData, setGalData] = useState<Collection[]>(() => getCollections());
  const [changingCode, setChangingCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setGalData(getCollections());
    window.addEventListener("ra_collections_changed", sync);
    return () => window.removeEventListener("ra_collections_changed", sync);
  }, []);

  const totalItems = galData.reduce((s, g) => s + totalMedia(g), 0);

  const handleChangeCode = (id: string) => {
    if (newCode.length < 4) { setCodeError("Code must be at least 4 characters"); return; }
    if (!/^[A-Z0-9]+$/.test(newCode)) { setCodeError("Only uppercase letters and numbers"); return; }
    updateCol(id, { code: newCode });
    setGalData(getCollections());
    setChangingCode(null);
    setNewCode("");
    setCodeError("");
    setSuccessMsg("Access code updated");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <>
      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-20 right-6 bg-green-600 text-primary-foreground text-[0.82rem] font-semibold px-5 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-right">
          {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">My Collections</h1>
          <p className="text-[0.82rem] text-muted mt-1">{galData.length} collections · {totalItems} total items</p>
        </div>
        <Link to="/create-gallery" className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline">
          <Plus className="w-4 h-4" /> New Collection
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {galData.map(g => (
          <div key={g.id} className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden">
            <div className="p-5">
              {/* Thumbnails row */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {g.thumbs.map((t, n) => (
                  <div key={n} className="aspect-[16/9] rounded-xl overflow-hidden">
                    <img src={`https://images.unsplash.com/${t}?w=600&h=340&fit=crop&q=80`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[0.92rem]">{g.name}</h3>
                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${g.free ? "bg-green-600/10 text-green-600" : "bg-accent/10 text-accent"}`}>
                      {g.free ? "Public" : "Private"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[0.78rem] text-muted flex-wrap">
                    <span className="flex items-center gap-1"><Image className="w-3 h-3" />{g.images} images</span>
                    {g.videos > 0 && <span className="flex items-center gap-1"><Video className="w-3 h-3" />{g.videos} videos</span>}
                    {g.music > 0 && <span className="flex items-center gap-1"><Music className="w-3 h-3" />{g.music} tracks</span>}
                    {!g.free && <><span className="text-foreground/20">·</span><span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.members} members</span></>}
                    {g.code && <><span className="text-foreground/20">·</span><span className="flex items-center gap-1 font-mono text-muted"><Key className="w-3 h-3" />{g.code}</span></>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {g.code && (
                    <button
                      onClick={() => { setChangingCode(changingCode === g.id ? null : g.id); setNewCode(""); setCodeError(""); }}
                      className="text-[0.78rem] font-medium text-muted border border-foreground/[0.12] px-4 py-2 rounded-lg hover:border-foreground/30 hover:text-foreground transition-colors"
                    >
                      Change Code
                    </button>
                  )}
                  <Link
                    to={`/dashboard/collections/${g.id}`}
                    className="text-[0.78rem] font-medium bg-foreground text-primary-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors no-underline"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>

            {/* Change Code inline panel */}
            {changingCode === g.id && (
              <div className="px-5 pb-5 pt-0">
                <div className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl p-4">
                  <p className="text-[0.75rem] text-muted mb-3">Set a new access code. Anyone who previously joined will need this new code to re-enter.</p>
                  <div className="flex gap-2 items-start">
                    <input
                      value={newCode}
                      onChange={e => { setNewCode(e.target.value.toUpperCase()); setCodeError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleChangeCode(g.id)}
                      maxLength={12}
                      placeholder="NEW CODE"
                      className="flex-1 h-10 px-4 rounded-xl bg-background border border-foreground/[0.1] text-[0.85rem] font-mono tracking-[0.15em] uppercase focus:outline-none focus:border-accent transition-colors"
                    />
                    <button onClick={() => handleChangeCode(g.id)} className="px-4 h-10 bg-foreground text-primary-foreground rounded-xl text-[0.82rem] font-semibold hover:bg-accent transition-colors whitespace-nowrap">
                      Save Code
                    </button>
                    <button onClick={() => { setChangingCode(null); setNewCode(""); setCodeError(""); }} className="px-3 h-10 border border-foreground/[0.12] rounded-xl text-[0.82rem] hover:border-foreground/30 transition-colors">
                      Cancel
                    </button>
                  </div>
                  {codeError && <p className="text-[0.72rem] text-destructive mt-2">{codeError}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </>
  );
};

                {/* Weekly Views Chart */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-8">
                  <h3 className="font-semibold text-[0.9rem] mb-5">Views This Week</h3>
                  <div className="flex items-end gap-4 h-[160px]">
                    {weeklyExposure.map(d => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[0.65rem] text-muted">{(d.views / 1000).toFixed(1)}K</span>
                        <div className="w-full bg-accent/15 rounded-t-lg relative" style={{ height: `${(d.views / maxWeekly) * 100}%` }}>
                          <div className="absolute inset-0 bg-accent/80 rounded-t-lg" />
                        </div>
                        <span className="text-[0.72rem] text-muted font-medium">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>


/* ═══ ADS SECTION COMPONENT ═══ */
type CampaignStatus = "active" | "paused" | "draft" | "completed";

interface MockCampaign {
  id: string;
  title: string;
  brandName: string;
  imageUrl: string;
  status: CampaignStatus;
  placements: string[];
  impressions: number;
  clicks: number;
  spent: number;
  budget: number;
  ctr: number;
}

const mockCampaigns: MockCampaign[] = [
  { id: "1", title: "Spring Collection Launch", brandName: "LuminaAI", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop&q=80", status: "active", placements: ["Explore Feed", "Search Results"], impressions: 24800, clicks: 1247, spent: 89.50, budget: 200, ctr: 5.03 },
  { id: "2", title: "AI Art Workshop Promo", brandName: "DreamForge", imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=500&fit=crop&q=80", status: "paused", placements: ["Image Sidebar"], impressions: 8420, clicks: 312, spent: 31.20, budget: 100, ctr: 3.71 },
  { id: "3", title: "Premium Texture Pack", brandName: "SpectraGen", imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=500&fit=crop&q=80", status: "draft", placements: ["Explore Feed", "Search Results", "Image Sidebar"], impressions: 0, clicks: 0, spent: 0, budget: 150, ctr: 0 },
];

const campaignStatusColors: Record<CampaignStatus, string> = {
  active: "bg-green-500/10 text-green-600",
  paused: "bg-yellow-500/10 text-yellow-600",
  draft: "bg-muted/50 text-muted-foreground",
  completed: "bg-accent/10 text-accent",
};

const placementIcons: Record<string, typeof Globe> = {
  "Explore Feed": LayoutIcon,
  "Search Results": Search,
  "Image Sidebar": Globe,
};

const AdsSection = () => {
  const [view, setView] = useState<"campaigns" | "create">("campaigns");
  const [newCampaign, setNewCampaign] = useState({
    title: "", brandName: "", imageUrl: "", destinationUrl: "",
    placements: [] as string[], dailyBudget: "5.00", totalBudget: "50.00", tags: "",
  });

  const togglePlacement = (p: string) => {
    setNewCampaign(prev => ({
      ...prev,
      placements: prev.placements.includes(p) ? prev.placements.filter(x => x !== p) : [...prev.placements, p],
    }));
  };

  const totalImpressions = mockCampaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = mockCampaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSpent = mockCampaigns.reduce((s, c) => s + c.spent, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">Sponsored Ads</h1>
          <p className="text-[0.82rem] text-muted mt-1">Promote your images across REAL ART and reach millions of creators</p>
        </div>
        <button
          onClick={() => setView(view === "campaigns" ? "create" : "campaigns")}
          className="flex items-center gap-2 bg-foreground text-primary-foreground text-[0.82rem] font-semibold px-5 py-2.5 rounded-lg hover:bg-accent transition-colors"
        >
          {view === "campaigns" ? <><Plus className="w-4 h-4" /> New Campaign</> : <><ArrowRight className="w-4 h-4 rotate-180" /> Back</>}
        </button>
      </div>

      {view === "campaigns" ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Eye, label: "Impressions", value: totalImpressions.toLocaleString() },
              { icon: MousePointerClick, label: "Clicks", value: totalClicks.toLocaleString() },
              { icon: TrendingUp, label: "Avg CTR", value: totalClicks > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` : "0%" },
              { icon: DollarSign, label: "Spent", value: `$${totalSpent.toFixed(2)}` },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-foreground/[0.08] rounded-xl p-4 flex flex-col items-center justify-center">
                <stat.icon className="w-4 h-4 mb-2 text-accent" />
                <div className="font-display font-black text-[1.1rem] tracking-[-0.02em]">{stat.value}</div>
                <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Campaigns list */}
          <div className="space-y-3 mb-8">
            {mockCampaigns.map(campaign => (
              <div key={campaign.id} className="bg-card border border-foreground/[0.08] rounded-xl p-4 flex items-center gap-4 hover:border-foreground/[0.16] transition-all">
                <img src={campaign.imageUrl} alt={campaign.title} className="w-16 h-20 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[0.9rem] truncate">{campaign.title}</h3>
                    <span className={`text-[0.62rem] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md ${campaignStatusColors[campaign.status]}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="text-[0.72rem] text-muted mb-2">{campaign.brandName}</div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {campaign.placements.map(p => {
                      const Icon = placementIcons[p] || Globe;
                      return <span key={p} className="flex items-center gap-1 text-[0.65rem] text-muted"><Icon className="w-3 h-3" /> {p}</span>;
                    })}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 shrink-0">
                  {[
                    { v: campaign.impressions.toLocaleString(), l: "Impressions" },
                    { v: campaign.clicks.toLocaleString(), l: "Clicks" },
                    { v: `${campaign.ctr}%`, l: "CTR" },
                    { v: `$${campaign.spent.toFixed(2)}`, l: "Spent" },
                  ].map(s => (
                    <div key={s.l} className="text-center">
                      <div className="font-display font-bold text-[0.9rem]">{s.v}</div>
                      <div className="text-[0.6rem] text-muted uppercase">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {campaign.status === "active" && (
                    <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-foreground/[0.12] transition-colors" title="Pause"><Pause className="w-3.5 h-3.5" /></button>
                  )}
                  {campaign.status === "paused" && (
                    <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-foreground/[0.12] transition-colors" title="Resume"><Play className="w-3.5 h-3.5" /></button>
                  )}
                  {campaign.status === "draft" && (
                    <button className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-[0.72rem] font-semibold px-3">Launch</button>
                  )}
                  <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
            <h3 className="font-display text-[1.2rem] font-black mb-4">How Sponsored Ads Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { step: "1", title: "Create a Campaign", desc: "Upload your image, set your brand name, choose placements, and set your budget." },
                { step: "2", title: "Pay & Go Live", desc: "Your ad enters review and goes live within 24 hours. Pay only for impressions served." },
                { step: "3", title: "Track Performance", desc: "Monitor impressions, clicks, CTR, and spend in real-time from your dashboard." },
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[0.8rem] font-bold shrink-0">{s.step}</div>
                  <div>
                    <div className="font-semibold text-[0.85rem] mb-1">{s.title}</div>
                    <div className="text-[0.75rem] text-muted leading-[1.6]">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing tiers */}
          <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
            <h3 className="font-display text-[1.2rem] font-black mb-4">Placement Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: LayoutIcon, title: "Explore Feed", desc: "Mixed into the main masonry grid. 1 ad per ~25 images.", cpm: "$2.50", priority: "Most Popular" },
                { icon: Search, title: "Search Results", desc: "Top of search results for targeted keywords.", cpm: "$4.00", priority: "Highest Intent" },
                { icon: Globe, title: "Image Sidebar", desc: "Contextual placement on image detail pages.", cpm: "$1.50", priority: "Best Value" },
              ].map(tier => (
                <div key={tier.title} className="border border-foreground/[0.08] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <tier.icon className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-[0.85rem]">{tier.title}</span>
                  </div>
                  <p className="text-[0.72rem] text-muted leading-[1.6] mb-3">{tier.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-[1rem]">{tier.cpm} <span className="text-[0.65rem] text-muted font-normal">CPM</span></span>
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-accent bg-accent/10 px-2 py-0.5 rounded-md">{tier.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Create campaign form */
        <div className="max-w-[640px]">
          <div className="space-y-5">
            {[
              { label: "Campaign Title", key: "title", placeholder: "e.g. Spring Collection Launch" },
              { label: "Brand Name", key: "brandName", placeholder: "Your brand or creator name" },
              { label: "Ad Image URL", key: "imageUrl", placeholder: "https://..." },
              { label: "Destination URL", key: "destinationUrl", placeholder: "Where should clicks go?" },
            ].map(field => (
              <div key={field.key}>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">{field.label}</label>
                <input
                  type="text"
                  value={(newCampaign as any)[field.key]}
                  onChange={e => setNewCampaign({ ...newCampaign, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="text-[0.75rem] font-semibold mb-1.5 block">Placements</label>
              <div className="flex gap-2 flex-wrap">
                {["Explore Feed", "Search Results", "Image Sidebar"].map(p => (
                  <button
                    key={p}
                    onClick={() => togglePlacement(p)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.78rem] font-medium border transition-all ${newCampaign.placements.includes(p) ? "border-accent bg-accent/10 text-accent" : "border-foreground/[0.1] bg-card hover:border-foreground/[0.2]"}`}
                  >
                    {(() => { const Icon = placementIcons[p] || Globe; return <Icon className="w-3.5 h-3.5" />; })()}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Daily Budget ($)</label>
                <input type="text" value={newCampaign.dailyBudget} onChange={e => setNewCampaign({ ...newCampaign, dailyBudget: e.target.value })} className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Total Budget ($)</label>
                <input type="text" value={newCampaign.totalBudget} onChange={e => setNewCampaign({ ...newCampaign, totalBudget: e.target.value })} className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-[0.75rem] font-semibold mb-1.5 block">Targeting Tags (comma separated)</label>
              <input type="text" value={newCampaign.tags} onChange={e => setNewCampaign({ ...newCampaign, tags: e.target.value })} placeholder="e.g. cyberpunk, fashion, landscape" className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
            </div>

            {/* Preview */}
            {newCampaign.imageUrl && (
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Preview</label>
                <div className="w-48">
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={newCampaign.imageUrl} alt="Preview" className="w-full aspect-[3/4] object-cover" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.55rem] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-md">Sponsored</div>
                    <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(transparent, hsl(0 0% 0% / 0.6))" }}>
                      <div className="text-[0.78rem] text-primary-foreground font-semibold">{newCampaign.brandName || "Brand Name"}</div>
                      <div className="text-[0.62rem] text-primary-foreground/60">Sponsored</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button className="bg-foreground text-primary-foreground text-[0.82rem] font-semibold px-6 py-2.5 rounded-lg hover:bg-accent transition-colors">Save as Draft</button>
              <button className="bg-accent text-primary-foreground text-[0.82rem] font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/85 transition-colors">Pay & Launch Campaign</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ═══ MY BOARDS SECTION ═══ */
const coverOptions = [
  "photo-1618005182384-a83a8bd57fbe",
  "photo-1557682250-33bd709cbe85",
  "photo-1604881991720-f91add269bed",
  "photo-1579546929518-9e396f3cc809",
  "photo-1541701494587-cb58502866ab",
  "photo-1501854140801-50d01698950b",
  "photo-1576091160550-2173dba999ef",
  "photo-1547036967-23d11aacaee0",
  "photo-1549880338-65ddcdfd017b",
  "photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9",
  "photo-1543722530-d2c3201371e7",
];

const MyBoardsSection = () => {
  const [boards, setBoards] = useState<Board[]>(() => getBoards());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVisibility, setNewVisibility] = useState<"public" | "private">("private");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editVisibility, setEditVisibility] = useState<"public" | "private">("private");
  const [editCover, setEditCover] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  useEffect(() => {
    const sync = () => setBoards(getBoards());
    window.addEventListener("ra_boards_changed", sync);
    return () => window.removeEventListener("ra_boards_changed", sync);
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createBoard(newName.trim(), newVisibility);
    setBoards(getBoards());
    setNewName("");
    setShowCreate(false);
    showToast(`"${newName.trim()}" created`);
  };

  const openEdit = (board: Board) => {
    setEditingBoard(board);
    setEditName(board.title);
    setEditDesc(board.description || "");
    setEditVisibility(board.visibility);
    setEditCover(board.coverPhoto || (board.items[0]?.photo ?? ""));
  };

  const handleSaveEdit = () => {
    if (!editingBoard || !editName.trim()) return;
    updateBoard(editingBoard.id, {
      title: editName.trim(),
      description: editDesc.trim(),
      visibility: editVisibility,
      coverPhoto: editCover,
    });
    setBoards(getBoards());
    setEditingBoard(null);
    showToast("Board updated");
  };

  const handleDelete = (id: string, title: string) => {
    deleteBoard(id);
    setBoards(getBoards());
    setDeleteConfirm(null);
    showToast(`"${title}" deleted`);
  };

  const totalSaved = boards.reduce((s, b) => s + b.items.length, 0);

  const getCover = (board: Board) => board.coverPhoto || board.items[0]?.photo || "";

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-foreground text-primary-foreground px-4 py-2.5 rounded-xl text-[0.82rem] font-medium flex items-center gap-2 shadow-lg animate-drop-in">
          <Check className="w-3.5 h-3.5 text-green-400" /> {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">My Boards</h1>
          <p className="text-[0.82rem] text-muted mt-1">{boards.length} board{boards.length !== 1 ? "s" : ""} · {totalSaved} saved item{totalSaved !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/explore" className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.82rem] font-medium text-muted hover:text-foreground hover:border-foreground/25 transition-colors no-underline">
            <Search className="w-3.5 h-3.5" /> Find images to save
          </Link>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent transition-colors">
            <Plus className="w-4 h-4" /> New Board
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-6 flex flex-col gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Board name…"
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.84rem] outline-none focus:border-accent/40 transition-colors"
            onKeyDown={e => e.key === "Enter" && handleCreate()}
          />
          <div className="flex items-center gap-2">
            {(["private", "public"] as const).map(v => (
              <button
                key={v}
                onClick={() => setNewVisibility(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.76rem] font-medium transition-colors capitalize ${newVisibility === v ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}
              >
                {v === "private" ? <Key className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-semibold hover:bg-accent transition-colors">Create</button>
            <button onClick={() => { setShowCreate(false); setNewName(""); }} className="text-muted hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {boards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bookmark className="w-7 h-7 text-muted mb-3" />
          <h3 className="font-display text-[1.1rem] font-bold mb-2">No boards yet</h3>
          <p className="text-[0.82rem] text-muted mb-4 max-w-xs">Browse the site and click "Save to Board" on any image to start building your personal collections.</p>
          <Link to="/explore" className="bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline">Browse Images</Link>
        </div>
      )}

      {boards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {boards.map(board => {
            const cover = getCover(board);
            return (
              <div key={board.id} className="bg-card border border-foreground/[0.08] rounded-2xl overflow-hidden group">
                {/* Single full-bleed cover */}
                <Link to={`/boards/${board.id}`} className="block no-underline">
                  <div className="relative aspect-[4/3] bg-foreground/[0.04] overflow-hidden">
                    {cover ? (
                      <img
                        src={`https://images.unsplash.com/${cover}?w=500&h=375&fit=crop&q=80`}
                        alt={board.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bookmark className="w-10 h-10 text-muted opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    {/* Overlaid info */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-display text-[1.2rem] font-black text-primary-foreground leading-tight mb-1">{board.title.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase())}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.72rem] text-primary-foreground/80 flex items-center gap-1">
                          <Bookmark className="w-3 h-3" /> {board.items.length} saved
                        </span>
                        <span className="text-[0.72rem] text-primary-foreground/80 flex items-center gap-1">
                          {board.visibility === "private" ? <Key className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                          {board.visibility}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Footer buttons */}
                <div className="flex items-center gap-2 p-3">
                  <button
                    onClick={() => openEdit(board)}
                    className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2 rounded-lg text-[0.8rem] font-medium border border-foreground/[0.12] hover:border-foreground/25 hover:text-foreground text-muted transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  {deleteConfirm === board.id ? (
                    <div className="flex items-center gap-1.5 flex-1 justify-center">
                      <span className="text-[0.75rem] text-muted">Delete?</span>
                      <button onClick={() => handleDelete(board.id, board.title)} className="text-[0.75rem] font-bold text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-[0.75rem] text-muted hover:text-foreground px-2 py-1.5 rounded-lg transition-colors">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(board.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[0.8rem] font-medium border border-foreground/[0.12] hover:border-red-300 hover:text-red-500 hover:bg-red-50 text-muted transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Create new board card */}
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-2xl border-2 border-dashed border-foreground/[0.1] flex flex-col items-center justify-center hover:border-foreground/25 hover:bg-foreground/[0.02] transition-colors min-h-[240px] group"
          >
            <Plus className="w-6 h-6 text-muted group-hover:text-foreground transition-colors mb-2" />
            <span className="text-[0.82rem] font-medium text-muted group-hover:text-foreground transition-colors">New Board</span>
          </button>
        </div>
      )}

      {/* Edit modal — horizontal two-column layout */}
      {editingBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setEditingBoard(null)}>
          <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[720px] overflow-hidden shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06]">
              <h3 className="font-display text-[1.1rem] font-bold">Edit Board</h3>
              <button onClick={() => setEditingBoard(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Two-column body */}
            <div className="flex max-h-[70vh]">
              {/* LEFT — Cover image */}
              <div className="w-[340px] shrink-0 border-r border-foreground/[0.06] p-6 overflow-y-auto flex flex-col gap-4">
                {/* Cover preview */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-foreground/[0.04]">
                  {editCover ? (
                    <img src={`https://images.unsplash.com/${editCover}?w=500&h=375&fit=crop&q=80`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bookmark className="w-8 h-8 text-muted opacity-30" />
                      <span className="text-[0.8rem] text-muted ml-2">No cover selected</span>
                    </div>
                  )}
                </div>

                {/* From this board */}
                {editingBoard.items.length > 0 && (
                  <div>
                    <p className="text-[0.76rem] text-muted mb-2 font-medium">From this board</p>
                    <div className="flex flex-wrap gap-2">
                      {editingBoard.items.map(item => (
                        <button
                          key={item.imageId}
                          onClick={() => setEditCover(item.photo)}
                          className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all ring-2 ${editCover === item.photo ? "ring-accent" : "ring-transparent hover:ring-foreground/20"}`}
                        >
                          <img src={`https://images.unsplash.com/${item.photo}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* From library */}
                <div>
                  <p className="text-[0.76rem] text-muted mb-2 font-medium">From library</p>
                  <div className="flex flex-wrap gap-2">
                    {coverOptions.map(photo => (
                      <button
                        key={photo}
                        onClick={() => setEditCover(photo)}
                        className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all ring-2 ${editCover === photo ? "ring-accent" : "ring-transparent hover:ring-foreground/20"}`}
                      >
                        <img src={`https://images.unsplash.com/${photo}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — Fields */}
              <div className="flex-1 flex flex-col">
                <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
                  {/* Board name */}
                  <div>
                    <label className="block text-[0.8rem] font-semibold mb-2">Board name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSaveEdit()}
                      maxLength={60}
                      className="w-full px-4 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.85rem] outline-none focus:border-accent/40 transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[0.8rem] font-semibold mb-2">Description (optional)</label>
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      maxLength={200}
                      rows={4}
                      placeholder="What is this board about?"
                      className="w-full px-4 py-3 rounded-xl border border-foreground/[0.1] text-[0.88rem] outline-none focus:border-accent transition-colors resize-none"
                    />
                    <div className="text-[0.7rem] text-muted text-right mt-1">{editDesc.length}/200</div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-[0.8rem] font-semibold mb-2">Visibility</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { val: "private" as const, icon: Key, title: "Private", desc: "Only you can see this" },
                        { val: "public" as const, icon: Globe, title: "Public", desc: "Anyone with the link" },
                      ]).map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => setEditVisibility(opt.val)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${editVisibility === opt.val ? "border-foreground bg-foreground/[0.04]" : "border-foreground/[0.1] hover:border-foreground/25"}`}
                        >
                          <opt.icon className="w-4 h-4 shrink-0 text-muted" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[0.84rem]">{opt.title}</div>
                            <div className="text-[0.7rem] text-muted truncate">{opt.desc}</div>
                          </div>
                          {editVisibility === opt.val && <Check className="w-4 h-4 text-accent shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-foreground/[0.06] flex gap-3 shrink-0">
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editName.trim()}
                    className="flex-1 py-3 rounded-xl bg-foreground text-primary-foreground text-[0.88rem] font-semibold hover:bg-accent transition-colors disabled:opacity-40"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingBoard(null)}
                    className="px-6 py-3 rounded-xl border border-foreground/[0.12] text-[0.88rem] font-medium hover:border-foreground/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [commentsDefault, setCommentsDefault] = useState(() => {
    try { return localStorage.getItem("ra_comments_default") !== "0"; } catch { return true; }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <aside className="bg-card border-r border-foreground/[0.06] px-4 py-6 hidden lg:block">
            <div className="flex items-center gap-3 mb-8 px-3">
              {(() => {
                const display = (() => { try { return (localStorage.getItem("ra_display") || "AI.Verse").toLowerCase(); } catch { return "aiverse"; } })();
                const handle = (() => { try { return (localStorage.getItem("ra_username") || "aiverse").toLowerCase(); } catch { return "aiverse"; } })();
                const initials = display.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-[0.8rem] font-bold text-accent">{initials}</div>
                    <div>
                      <div className="font-semibold text-[0.88rem] lowercase">{display}</div>
                      <div className="text-[0.72rem] text-muted lowercase">@{handle}</div>
                    </div>
                  </>
                );
              })()}
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map(item => (
                item.internal === false ? (
                  <Link
                    key={item.id}
                    to={item.href!}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] font-medium w-full text-left transition-colors text-muted hover:text-foreground hover:bg-foreground/[0.04] no-underline"
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                    <ExternalLink className="w-3 h-3 ml-auto opacity-30" />
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] font-medium w-full text-left transition-colors ${activeSection === item.id ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                    {item.id === "notifications" && (
                      <span className="ml-auto text-[0.65rem] font-bold bg-accent text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center">3</span>
                    )}
                  </button>
                )
              ))}
            </nav>

            <Link to="/upload" className="flex items-center justify-center gap-2 bg-foreground text-primary-foreground py-2.5 rounded-xl text-[0.84rem] font-semibold hover:bg-accent transition-colors mt-6 w-full no-underline">
              <Upload className="w-3.5 h-3.5" /> Upload Art
            </Link>
          </aside>

          {/* Main Content */}
          <main className="px-6 md:px-10 py-8 overflow-y-auto">
            {/* Mobile Nav */}
            <div className="flex items-center gap-2 mb-6 lg:hidden overflow-x-auto pb-2 no-scrollbar">
              {navItems.map(item => (
                item.internal === false ? (
                  <Link
                    key={item.id}
                    to={item.href!}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[0.78rem] font-medium whitespace-nowrap bg-card border border-foreground/[0.1] text-muted no-underline"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                    <ExternalLink className="w-2.5 h-2.5 opacity-30" />
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[0.78rem] font-medium whitespace-nowrap transition-colors ${activeSection === item.id ? "bg-foreground text-primary-foreground" : "bg-card border border-foreground/[0.1] text-muted"}`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                )
              ))}
            </div>

            {/* ═══ OVERVIEW ═══ */}
            {activeSection === "overview" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">Dashboard</h1>
                    <p className="text-[0.82rem] text-muted mt-1">March 2026 · Last 30 Days</p>
                  </div>
                  <Link to="/upload" className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline">
                    Upload <Plus className="w-4 h-4" />
                  </Link>
                </div>

                {/* Stats — 6 cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Views", value: "248,421", change: "+22%", icon: Eye, color: "text-blue-500" },
                    { label: "Downloads", value: "18,204", change: "+18%", icon: Download, color: "text-green-500" },
                    { label: "Remixes", value: "1,347", change: "+34%", icon: RefreshCw, color: "text-purple-500" },
                    { label: "Embeds", value: "93 websites", change: "+12%", icon: Code, color: "text-orange-500" },
                    { label: "Followers", value: "+2,431", change: "+6%", icon: Users, color: "text-pink-500" },
                    { label: "Earnings", value: "$412", change: "+49%", icon: DollarSign, color: "text-emerald-500" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[0.75rem] text-muted">{stat.label}</span>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none">{stat.value}</div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-[0.72rem] text-green-500 font-semibold">{stat.change}</span>
                        <span className="text-[0.72rem] text-muted">this month</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Growth Snapshot */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-8 flex items-center gap-5 flex-wrap">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-muted mb-1">Growth Snapshot</div>
                    <div className="font-display text-[1.6rem] font-black tracking-[-0.03em] leading-none">
                      Your Content Reached <span className="text-accent">+52,000</span> People This Month
                    </div>
                  </div>
                  <div className="bg-green-500/10 text-green-600 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[0.9rem] font-bold">↑ 23%</span>
                    <span className="text-[0.75rem] font-medium opacity-70">from last month</span>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-muted">Media Library</span>
                      <span className="text-[0.72rem] text-muted">300 total items</span>
                    </div>
                    <button onClick={() => setActiveSection("media")} className="text-[0.78rem] font-semibold text-accent hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Images", count: 284, newThis: 6, icon: Image, color: "text-blue-500", bgColor: "bg-blue-500", thumbs: ["photo-1618005182384-a83a8bd57fbe","photo-1557682250-33bd709cbe85","photo-1604881991720-f91add269bed"] },
                      { label: "Videos", count: 12, newThis: 2, icon: Video, color: "text-purple-500", bgColor: "bg-purple-500", thumbs: ["photo-1558591710-4b4a1ae0f04d","photo-1550684848-fac1c5b4e853","photo-1547036967-23d11aacaee0"] },
                      { label: "Music", count: 4, newThis: 1, icon: Music, color: "text-orange-500", bgColor: "bg-orange-500", thumbs: ["photo-1511379938547-c1f69419868d","photo-1493225457124-a3eb161ffa5f","photo-1470225620780-dba8ba36b745"] },
                    ].map(m => (
                      <button
                        key={m.label}
                        onClick={() => setActiveSection("media")}
                        className="group bg-background rounded-xl p-4 border border-foreground/[0.06] hover:border-foreground/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all text-left"
                      >
                        <div className="flex gap-1.5 mb-3">
                          {m.thumbs.map((t, i) => (
                            <div key={i} className="h-16 flex-1 rounded-lg overflow-hidden">
                              <img src={`https://images.unsplash.com/${t}?w=200&h=120&fit=crop&q=75`} alt="" className={`w-full h-full object-cover ${i > 0 ? "opacity-70" : ""}`} />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-lg ${m.bgColor}/10 flex items-center justify-center`}>
                            <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                          </div>
                          <span className="text-[0.82rem] font-semibold">{m.label}</span>
                        </div>
                        <div className="font-display text-[1.6rem] font-black tracking-[-0.03em] leading-none mb-2">{m.count.toLocaleString()}</div>
                        <div className={`h-1.5 rounded-full bg-foreground/[0.06] mb-2`}>
                          <div className={`h-full rounded-full ${m.bgColor}`} style={{ width: `${Math.min((m.count / 300) * 100, 100)}%` }} />
                        </div>
                        <div className="text-[0.72rem] text-green-500 font-medium">+{m.newThis} this month</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-foreground rounded-2xl p-6 mb-8 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-accent" />
                    <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/60">Featured Artwork</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-5">
                    <img
                      src={`https://images.unsplash.com/${topImages[0].photo}?w=300&h=200&fit=crop&q=80`}
                      alt="Featured"
                      className="w-full md:w-[200px] h-[140px] rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-display text-[1.3rem] font-black text-primary-foreground mb-2">{topImages[0].title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {[
                          { l: "Views", v: topImages[0].views },
                          { l: "Downloads", v: topImages[0].downloads },
                          { l: "Remixes", v: topImages[0].remixes },
                          { l: "Embeds", v: topImages[0].embeds + " sites" },
                        ].map(s => (
                          <div key={s.l}>
                            <div className="font-display font-black text-[1.1rem] text-primary-foreground">{s.v}</div>
                            <div className="text-[0.65rem] text-primary-foreground/60 uppercase tracking-[0.08em]">{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[0.75rem] text-primary-foreground/50">Your most viewed image · Pinned to profile</p>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-8">
                  <h3 className="font-semibold text-[0.95rem] mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent" /> Achievements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {achievements.map(a => (
                      <div key={a.title} className={`border rounded-xl p-4 transition-colors ${a.unlocked ? "border-accent/20 bg-accent/[0.03]" : "border-foreground/[0.06] bg-card opacity-60"}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <a.icon className="w-5 h-5 text-accent shrink-0" />
                          <span className="text-[0.82rem] font-semibold">{a.title}</span>
                          {a.unlocked && <span className="ml-auto text-[0.6rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-md">Unlocked</span>}
                        </div>
                        <p className="text-[0.72rem] text-muted">{a.desc}</p>
                        {"level" in a && a.level && a.maxLevel && (
                          <div className="flex items-center gap-1 mt-2">
                            {Array.from({ length: a.maxLevel }).map((_, i) => (
                              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < a.level! ? "bg-accent" : "bg-foreground/[0.08]"}`} />
                            ))}
                            <span className="text-[0.6rem] text-muted ml-1">Lv {a.level}/{a.maxLevel}</span>
                          </div>
                        )}
                        {!a.unlocked && a.progress && !("level" in a && a.level) && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${a.progress}%` }} />
                            </div>
                            <span className="text-[0.65rem] text-muted mt-1 block">{a.progress}% complete</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Your Communities */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[0.9rem] flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" /> Your Communities
                    </h3>
                    <Link to="/communities" className="text-[0.78rem] text-accent hover:underline flex items-center gap-1 no-underline">
                      Browse All <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "Avatar Architects", members: "2.4K", posts: 3, lastPost: "Neural portrait series by @stellarink", color: "#4361ee", to: "/communities/1" },
                      { name: "PromptVault Pro", members: "1.8K", posts: 0, lastPost: "Best negative prompts for realism", color: "#7209b7", to: "/communities/2" },
                      { name: "Abstract Minds", members: "3.1K", posts: 1, lastPost: "Weekly color palette challenge results", color: "#e63946", to: "/communities/3" },
                    ].map(c => (
                      <div key={c.name} className="border border-foreground/[0.06] rounded-xl p-4 hover:border-accent/30 transition-colors group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[0.7rem] font-bold text-primary-foreground" style={{ background: c.color }}>
                            {c.name.split(" ").map(w => w[0]).join("")}
                          </div>
                          <div>
                            <div className="text-[0.84rem] font-semibold group-hover:text-accent transition-colors">{c.name}</div>
                            <div className="text-[0.7rem] text-muted">{c.members} members</div>
                          </div>
                          {c.posts > 0 && (
                            <span className="ml-auto text-[0.65rem] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                              {c.posts} new
                            </span>
                          )}
                        </div>
                        <p className="text-[0.75rem] text-muted leading-relaxed line-clamp-1 mb-3">{c.lastPost}</p>
                        <Link to={c.to} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-foreground text-primary-foreground text-[0.78rem] font-semibold hover:bg-accent transition-colors no-underline">
                          Open Community <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earnings Chart + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                  <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-semibold text-[0.9rem]">Affiliate Earnings</h3>
                        <div className="font-display text-[1.4rem] font-black tracking-[-0.02em] text-accent mt-0.5">${earningsData.reduce((s, d) => s + d.amount, 0).toLocaleString()}</div>
                      </div>
                      <span className="text-[0.72rem] text-muted">Last 6 months</span>
                    </div>
                    <div className="flex items-end gap-3 h-[140px]">
                      {earningsData.map(d => (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[0.65rem] text-muted">${d.amount}</span>
                          <div className="w-full bg-accent/20 rounded-t-lg relative" style={{ height: `${(d.amount / maxEarning) * 100}%` }}>
                            <div className="absolute inset-0 bg-accent rounded-t-lg" />
                          </div>
                          <span className="text-[0.68rem] text-muted">{d.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                    <h3 className="font-semibold text-[0.9rem] mb-4">Recent Activity</h3>
                    <div className="flex flex-col gap-3">
                      {recentActivity.slice(0, 5).map((a, i) => (
                        <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-foreground/[0.04] last:border-0">
                          <div className="w-6 h-6 rounded-lg bg-foreground/[0.05] flex items-center justify-center shrink-0">
                            <a.icon className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-[0.8rem] text-muted flex-1">{a.text}</span>
                          <span className="text-[0.7rem] text-muted/60 shrink-0 ml-3">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Images */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[0.9rem]">Top Performing Images</h3>
                    <button onClick={() => setActiveSection("media")} className="text-[0.78rem] text-accent hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-foreground/[0.06]">
                          <th className="text-left text-[0.72rem] text-muted font-medium py-2 pr-4">Image</th>
                          <th className="text-left text-[0.72rem] text-muted font-medium py-2 pr-4">Title</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2 pr-4">Downloads</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2 pr-4">Remixes</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2 pr-4">Embeds</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2 pr-4">Aff. Clicks</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2">Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topImages.map((img, i) => (
                          <tr key={i} className="border-b border-foreground/[0.04] last:border-0">
                            <td className="py-2.5 pr-4">
                              <img src={`https://images.unsplash.com/${img.photo}?w=60&h=40&fit=crop&q=75`} alt="" className="w-10 h-7 rounded-lg object-cover" />
                            </td>
                            <td className="text-[0.82rem] font-medium py-2.5 pr-4">
                              <div className="flex items-center gap-1.5">
                                {img.pinned && <Star className="w-3 h-3 text-accent fill-accent shrink-0" />}
                                {img.title}
                              </div>
                            </td>
                            <td className="text-[0.82rem] text-muted text-right py-2.5 pr-4">{img.downloads}</td>
                            <td className="text-[0.82rem] text-muted text-right py-2.5 pr-4">{img.remixes}</td>
                            <td className="text-[0.82rem] text-muted text-right py-2.5 pr-4">{img.embeds}</td>
                            <td className="text-[0.82rem] text-muted text-right py-2.5 pr-4">{img.affClicks}</td>
                            <td className="text-[0.82rem] font-semibold text-accent text-right py-2.5">{img.earnings}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}


            {/* ═══ MEDIA ═══ */}
            {activeSection === "media" && <MediaSection />}

            {/* ═══ GALLERIES ═══ */}
            {activeSection === "galleries" && <GalleriesSection />}

            {/* ═══ EARNINGS ═══ */}
            {activeSection === "earnings" && (
              <>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-2">Earnings</h1>
                <p className="text-[0.84rem] text-muted mb-6">Your affiliate commission history and payout details</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "This month", value: "$412.00", sub: "+49% vs last month", color: "text-green-500" },
                    { label: "Pending payout", value: "$127.40", sub: "Pays out March 31", color: "text-orange-500" },
                    { label: "All time earned", value: "$2,840.00", sub: "Since Jan 2024", color: "" },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                      <div className="text-[0.78rem] text-muted mb-2">{s.label}</div>
                      <div className={`font-display text-[2rem] font-black tracking-[-0.03em] leading-none ${s.color}`}>{s.value}</div>
                      <div className="text-[0.72rem] text-muted mt-1">{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-6">
                  <h3 className="font-semibold text-[0.9rem] mb-4">Recent Transactions</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { date: "Mar 14", type: "Affiliate — Pro Plan", amount: "+$24.00", ref: "via Cosmic Dreamscape" },
                      { date: "Mar 13", type: "Affiliate — Annual Plan", amount: "+$48.00", ref: "via Avatar Collection" },
                      { date: "Mar 12", type: "Affiliate — Monthly Plan", amount: "+$12.00", ref: "via Neon Boulevard" },
                      { date: "Mar 10", type: "Affiliate — Monthly Plan", amount: "+$12.00", ref: "via Abstract Fire" },
                      { date: "Mar 8", type: "Affiliate — Pro Plan", amount: "+$24.00", ref: "via Digital Avatar 01" },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-foreground/[0.04] last:border-0">
                        <div>
                          <div className="text-[0.82rem]"><span className="text-muted">{t.date}</span> — {t.type}</div>
                          <div className="text-[0.72rem] text-muted">{t.ref}</div>
                        </div>
                        <span className="text-[0.88rem] font-semibold text-green-500">{t.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
                  <h3 className="font-semibold text-[0.9rem] mb-1">Earn more — upgrade your tier</h3>
                  <p className="text-[0.82rem] text-muted mb-3">You're on Starter (20%). Hit 10 referrals this month to unlock Creator tier (30%).</p>
                  <Link to="/affiliates" className="text-[0.82rem] text-accent font-semibold hover:underline flex items-center gap-1">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}

            {/* ═══ BOARDS ═══ */}
            {activeSection === "boards" && <MyBoardsSection />}

            {/* ═══ ADS ═══ */}
            {activeSection === "ads" && <AdsSection />}

            {/* ═══ NOTIFICATIONS ═══ */}
            {activeSection === "notifications" && (
              <>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-6">Notifications</h1>
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                  <div className="flex flex-col">
                    {recentActivity.map((a, i) => (
                      <div key={i} className={`flex items-center gap-3 py-3.5 ${i < recentActivity.length - 1 ? "border-b border-foreground/[0.04]" : ""}`}>
                        <div className="w-7 h-7 rounded-lg bg-foreground/[0.05] flex items-center justify-center shrink-0">
                          <a.icon className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className={`text-[0.84rem] flex-1 ${i < 3 ? "text-foreground font-medium" : "text-muted"}`}>{a.text}</span>
                        <span className="text-[0.72rem] text-muted/60 shrink-0 ml-4">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ SETTINGS ═══ */}
            {activeSection === "settings" && (
              <>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-6">Settings</h1>
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5">Profile</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#4361ee] flex items-center justify-center text-[1.1rem] font-bold text-primary-foreground">AV</div>
                    <button className="text-[0.82rem] text-accent hover:underline">Change photo</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[0.78rem] font-semibold mb-1.5">Display name</label>
                      <input defaultValue="AI.Verse" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[0.78rem] font-semibold mb-1.5">Username</label>
                      <input defaultValue="aiverse" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Bio</label>
                    <textarea defaultValue="Generative art explorer specializing in cosmic and abstract digital landscapes." className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors resize-none h-20" />
                  </div>
                  <div className="mb-5">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Website</label>
                    <input defaultValue="https://aiverse.art" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <button className="bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
                    Save Changes
                  </button>
                </div>

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5">Payout Settings</h3>
                  <div className="mb-4">
                    <label className="block text-[0.78rem] font-semibold mb-2">Payout method</label>
                    <div className="flex gap-2">
                      {["PayPal", "Stripe", "Bank Transfer"].map((m, i) => (
                        <button key={m} className={`px-4 py-2 rounded-lg text-[0.82rem] font-medium border transition-colors ${i === 0 ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.1] text-muted hover:border-foreground/30"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">PayPal email</label>
                    <input defaultValue="aiverse@email.com" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <button className="bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
                    Update Payout
                  </button>
                </div>

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5">Content Preferences</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[0.86rem] font-semibold">Allow comments by default</div>
                      <div className="text-[0.75rem] text-muted">New uploads will have comments enabled or disabled by default</div>
                    </div>
                    <button
                      onClick={() => {
                        const next = !commentsDefault;
                        setCommentsDefault(next);
                        try { next ? localStorage.removeItem("ra_comments_default") : localStorage.setItem("ra_comments_default", "0"); } catch {}
                      }}
                      className={`w-10 h-[22px] rounded-full relative transition-colors shrink-0 cursor-pointer ${commentsDefault ? "bg-accent" : "bg-foreground/[0.12]"}`}
                    >
                      <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-primary-foreground shadow transition-transform ${commentsDefault ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
                    </button>
                  </div>
                </div>

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
                  <h3 className="font-semibold text-[0.95rem] mb-5">Account</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="text-[0.82rem] font-medium border border-foreground/[0.1] px-4 py-2 rounded-lg hover:border-foreground/30 transition-colors">Change password</button>
                    <button className="text-[0.82rem] font-medium border border-foreground/[0.1] px-4 py-2 rounded-lg hover:border-foreground/30 transition-colors">Download my data</button>
                  </div>
                  <button className="text-[0.82rem] font-medium text-destructive border border-destructive/20 px-4 py-2 rounded-lg hover:bg-destructive/5 transition-colors mt-4">
                    Delete account
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
