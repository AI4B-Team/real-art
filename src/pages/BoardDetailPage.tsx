import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Heart, Share2, Lock, Globe, Bookmark,
  Eye, Sparkles, Copy, Check, Users, X, Link2, Plus, UserPlus,
  Camera, Edit3, Trash2, MoreHorizontal, Archive, GitMerge,
  Download, Flag, EyeOff, FolderOpen
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import { getBoards, updateBoard, removeFromBoard, addToBoard, deleteBoard, type Board } from "@/lib/boardStore";

/* ── Hardcoded public boards (for /boards/1, /boards/2 etc) ── */
const publicBoardData: Record<string, {
  title: string; creator: string; creatorId: string; creatorColor: string; creatorInit: string;
  followers: string; visibility: "public" | "private"; cover: string; banner: string;
  description: string; items: { imageId: string; photo: string; title: string; savedAt: string }[];
}> = {
  "1": {
    title: "Cyberpunk Cities", creator: "VoidArt", creatorId: "6", creatorColor: "#023e8a", creatorInit: "VA",
    followers: "1,248", visibility: "public",
    cover: "photo-1557682250-33bd709cbe85", banner: "photo-1557682250-33bd709cbe85",
    description: "A curated collection of neon-soaked cityscapes, rain-drenched streets, and holographic skylines. Inspired by Blade Runner, Ghost in the Shell, and the sprawl.",
    items: [
      { imageId: "4", photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", savedAt: new Date().toISOString() },
      { imageId: "8", photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City", savedAt: new Date().toISOString() },
      { imageId: "1", photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", savedAt: new Date().toISOString() },
      { imageId: "20", photo: "photo-1462275646964-a0e3386b89fa", title: "Geometric City", savedAt: new Date().toISOString() },
      { imageId: "21", photo: "photo-1506905925346-21bda4d32df4", title: "Night Sky", savedAt: new Date().toISOString() },
      { imageId: "9", photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar", savedAt: new Date().toISOString() },
    ],
  },
  "2": {
    title: "Surreal Dreamscapes", creator: "DreamForge", creatorId: "3", creatorColor: "#2a9d8f", creatorInit: "DF",
    followers: "892", visibility: "public",
    cover: "photo-1579546929518-9e396f3cc809", banner: "photo-1579546929518-9e396f3cc809",
    description: "Otherworldly landscapes blending reality and imagination. Floating islands, impossible geometries, and dreamlike atmospheres.",
    items: [
      { imageId: "0", photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Vision", savedAt: new Date().toISOString() },
      { imageId: "11", photo: "photo-1576091160550-2173dba999ef", title: "Dreamscape", savedAt: new Date().toISOString() },
    ],
  },
  "3": {
    title: "Dark Fantasy", creator: "NeoPixel", creatorId: "2", creatorColor: "#c9184a", creatorInit: "NP",
    followers: "1,034", visibility: "public",
    cover: "photo-1541701494587-cb58502866ab", banner: "photo-1541701494587-cb58502866ab",
    description: "Gothic castles, mythical creatures, and enchanted forests. A dark and moody take on fantasy worlds.",
    items: [
      { imageId: "1", photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", savedAt: new Date().toISOString() },
      { imageId: "4", photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", savedAt: new Date().toISOString() },
    ],
  },
};

const recommendedPhotos = [
  "photo-1506905925346-21bda4d32df4", "photo-1549880338-65ddcdfd017b",
  "photo-1618005182384-a83a8bd57fbe", "photo-1576091160550-2173dba999ef",
  "photo-1500462918059-b1a0cb512f1d", "photo-1543722530-d2c3201371e7",
  "photo-1533158628620-7e4d0a003147", "photo-1505765050516-f72dcac9c60e",
];

const bannerPickerPhotos = [
  "photo-1557682250-33bd709cbe85", "photo-1579546929518-9e396f3cc809",
  "photo-1541701494587-cb58502866ab", "photo-1518020382113-a7e8fc38eac9",
  "photo-1506905925346-21bda4d32df4", "photo-1549880338-65ddcdfd017b",
  "photo-1618005182384-a83a8bd57fbe", "photo-1576091160550-2173dba999ef",
  "photo-1500462918059-b1a0cb512f1d", "photo-1543722530-d2c3201371e7",
  "photo-1533158628620-7e4d0a003147", "photo-1505765050516-f72dcac9c60e",
];

const heights = [220, 280, 190, 250, 210, 260, 175, 235];

const fakeUsers = [
  { name: "Alice", handle: "alice", init: "A", color: "#e76f51" },
  { name: "Bob", handle: "bob", init: "B", color: "#264653" },
  { name: "Clara", handle: "clara", init: "C", color: "#2a9d8f" },
  { name: "David", handle: "david", init: "D", color: "#e9c46a" },
];

const socialLinks = [
  { label: "Twitter", prefix: "X", color: "#000" },
  { label: "Facebook", prefix: "f", color: "#1877F2" },
  { label: "WhatsApp", prefix: "W", color: "#25D366" },
  { label: "Email", prefix: "@", color: "#6b7280" },
];

const BoardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  /* ── Resolve board: user board from store or public fallback ── */
  const [userBoard, setUserBoard] = useState<Board | null>(null);
  const publicBoard = publicBoardData[id || ""];
  const isUserBoard = !!userBoard;

  useEffect(() => {
    const boards = getBoards();
    const found = boards.find(b => b.id === id);
    setUserBoard(found || null);
  }, [id]);

  // Listen for store changes
  useEffect(() => {
    const handler = () => {
      const boards = getBoards();
      setUserBoard(boards.find(b => b.id === id) || null);
    };
    window.addEventListener("ra_boards_changed", handler);
    return () => window.removeEventListener("ra_boards_changed", handler);
  }, [id]);

  /* ── Derive display data ── */
  const ownerName = (localStorage.getItem("ra_display") || localStorage.getItem("ra_display_name") || "You").toLowerCase();
  const ownerHandle = localStorage.getItem("ra_handle") || "you";
  const isOwner = isUserBoard; // user boards = owned

  const title = userBoard?.title || publicBoard?.title || "Board";
  const description = userBoard?.description || publicBoard?.description || "";
  const isPrivate = (userBoard?.visibility ?? publicBoard?.visibility ?? "private") === "private";
  const boardItems = userBoard?.items || publicBoard?.items || [];
  const collabs = userBoard?.collaborators || [];

  const creator = isOwner ? ownerName : (publicBoard?.creator || "Unknown");
  const creatorInit = isOwner ? ownerName.charAt(0).toUpperCase() : (publicBoard?.creatorInit || "?");
  const creatorColor = isOwner ? "hsl(var(--accent))" : (publicBoard?.creatorColor || "#888");
  const creatorId = publicBoard?.creatorId || "";

  const defaultBanner = boardItems[0]?.photo || "photo-1557682250-33bd709cbe85";
  const bannerPhoto = userBoard?.bannerPhoto || publicBoard?.banner || defaultBanner;

  /* ── State ── */
  const [following, setFollowing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [invitedHandles, setInvitedHandles] = useState<string[]>([]);
  const bannerPickerRef = useRef<HTMLDivElement>(null);

  // 3-dot menu state
  const [showMenu, setShowMenu] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Not found ── */
  if (!userBoard && !publicBoard) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <Bookmark className="w-12 h-12 text-muted mb-4 opacity-30" />
          <h1 className="font-display text-2xl font-bold mb-2">Board not found</h1>
          <Link to="/boards" className="text-accent text-[0.88rem] font-semibold hover:underline mt-2 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to boards
          </Link>
        </div>
        <Footer />
      </PageShell>
    );
  }

  /* ── Handlers ── */
  const setBanner = (photo: string) => {
    if (!isOwner || !userBoard) return;
    updateBoard(userBoard.id, { bannerPhoto: photo });
    setUserBoard({ ...userBoard, bannerPhoto: photo });
    setShowBannerPicker(false);
  };

  const handleRemoveItem = (imageId: string) => {
    if (!isOwner || !userBoard) return;
    removeFromBoard(userBoard.id, imageId);
  };




  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleInvite = (handle: string) => {
    if (invitedHandles.includes(handle)) return;
    setInvitedHandles(prev => [...prev, handle]);
    if (isOwner && userBoard) {
      const updated = [...collabs, handle];
      updateBoard(userBoard.id, { collaborators: updated });
    }
  };

  const handleRemoveCollab = (handle: string) => {
    setInvitedHandles(prev => prev.filter(h => h !== handle));
    if (isOwner && userBoard) {
      const updated = collabs.filter(c => c !== handle);
      updateBoard(userBoard.id, { collaborators: updated });
    }
  };

  const filteredInviteUsers = fakeUsers.filter(u =>
    u.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
    u.handle.toLowerCase().includes(inviteSearch.toLowerCase())
  );

  const boardPrompts = [
    { text: "Cyberpunk skyline at night with neon billboards and flying cars, rain-soaked streets", uses: "2.4K" },
    { text: "Neon Tokyo street scene, holographic signs, puddles reflecting lights, cinematic", uses: "1.8K" },
    { text: "Futuristic cityscape with massive towers, fog, volumetric lighting, 8k detailed", uses: "1.2K" },
    { text: "Dark alley in a cyberpunk megacity, steam vents, flickering lights, moody atmosphere", uses: "968" },
  ];

  // Merge handler
  const handleMerge = (targetBoardId: string) => {
    if (!isOwner || !userBoard) return;
    boardItems.forEach(item => {
      addToBoard(targetBoardId, { imageId: item.imageId, photo: item.photo, title: item.title });
    });
    deleteBoard(userBoard.id);
    setShowMerge(false);
    navigate("/boards");
  };

  // Other boards for merge picker
  const otherBoards = getBoards().filter(b => b.id !== id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* ── Board Header (no banner) ── */}
        <div className="px-6 md:px-12 max-w-[1440px] mx-auto pt-6 pb-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.78rem] text-muted mb-4">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <Link to="/boards" className="hover:text-foreground transition-colors">Boards</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">{title}</span>
          </div>

          {/* Title + privacy + actions on same row */}
          <div className="flex items-center gap-3 mb-3">
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] leading-none">
              {title}
            </h1>
            {isPrivate && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-foreground/[0.06] text-muted text-[0.7rem] font-medium">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
            {!isPrivate && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-foreground/[0.06] text-muted text-[0.7rem] font-medium">
                <Globe className="w-3 h-3" /> Public
              </span>
            )}

            {/* Actions — pushed to far right */}
            <div className="flex items-center gap-3 ml-auto">
              {!isOwner && (
                <button
                  onClick={() => setFollowing(!following)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold transition-colors ${
                    following
                      ? "bg-foreground/[0.06] border border-foreground/[0.08]"
                      : "bg-foreground text-primary-foreground hover:bg-accent"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${following ? "fill-accent text-accent" : ""}`} />
                  {following ? "Following" : "Follow Board"}
                </button>
              )}
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium bg-foreground/[0.06] border border-foreground/[0.08] hover:bg-foreground/[0.1] transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              {isOwner && (
                <button
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium bg-foreground/[0.06] border border-foreground/[0.08] hover:bg-foreground/[0.1] transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> Invite
                </button>
              )}

              {/* 3-dot menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-foreground/[0.06] border border-foreground/[0.08] hover:bg-foreground/[0.1] transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute top-12 right-0 bg-background border border-foreground/[0.08] rounded-xl shadow-2xl w-[260px] py-2 z-20">
                    {isOwner ? (
                      <>
                        <p className="px-4 py-1.5 text-[0.68rem] font-semibold text-muted uppercase tracking-wider">Manage</p>
                        <button onClick={() => { setShowMenu(false); setShowMerge(true); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors text-left group mx-1" style={{ width: "calc(100% - 8px)" }}>
                          <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0"><GitMerge className="w-4 h-4 text-muted" /></div>
                          <div><div className="text-[0.82rem] font-medium capitalize">Merge Into Another Board</div><div className="text-[0.68rem] text-muted capitalize">Move All Images to a Different Board</div></div>
                        </button>
                        <button onClick={() => { setShowMenu(false); setShowArchiveConfirm(true); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors text-left group mx-1" style={{ width: "calc(100% - 8px)" }}>
                          <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0"><Archive className="w-4 h-4 text-muted" /></div>
                          <div><div className="text-[0.82rem] font-medium capitalize">Archive Board</div><div className="text-[0.68rem] text-muted capitalize">Hide Without Deleting</div></div>
                        </button>
                        <button onClick={() => { setShowMenu(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors text-left group mx-1" style={{ width: "calc(100% - 8px)" }}>
                          <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0"><Download className="w-4 h-4 text-muted" /></div>
                          <div><div className="text-[0.82rem] font-medium capitalize">Download All Images</div><div className="text-[0.68rem] text-muted capitalize">Save a ZIP of This Board</div></div>
                        </button>
                        <button onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-destructive/10 transition-colors text-left group mx-1" style={{ width: "calc(100% - 8px)" }}>
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4 text-destructive" /></div>
                          <div><div className="text-[0.82rem] font-medium text-destructive capitalize">Delete Board</div><div className="text-[0.68rem] text-destructive/60 capitalize">Cannot Be Undone</div></div>
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="px-4 py-1.5 text-[0.68rem] font-semibold text-muted uppercase tracking-wider">Actions</p>
                        <button onClick={() => { setShowMenu(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors text-left group mx-1" style={{ width: "calc(100% - 8px)" }}>
                          <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0"><FolderOpen className="w-4 h-4 text-muted" /></div>
                          <div className="text-[0.82rem] font-medium">Save board to my profile</div>
                        </button>
                        <button onClick={() => { setShowMenu(false); handleCopyLink(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors text-left group mx-1" style={{ width: "calc(100% - 8px)" }}>
                          <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0"><Link2 className="w-4 h-4 text-muted" /></div>
                          <div className="text-[0.82rem] font-medium">Copy link</div>
                        </button>
                        <button onClick={() => { setShowMenu(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors text-left group mx-1" style={{ width: "calc(100% - 8px)" }}>
                          <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0"><Flag className="w-4 h-4 text-muted" /></div>
                          <div className="text-[0.82rem] font-medium">Report</div>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Owner + stats */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link to={isOwner ? "/dashboard" : `/creator/${creatorId}`} className="flex items-center gap-2 no-underline">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-primary-foreground border border-foreground/10"
                style={{ background: creatorColor }}
              >
                {creatorInit}
              </div>
              <span className="text-[0.85rem] text-muted">by {creator}</span>
            </Link>
            <span className="text-muted/30">·</span>
            <span className="flex items-center gap-1 text-[0.8rem] text-muted">
              <Bookmark className="w-3.5 h-3.5" /> {boardItems.length} saved
            </span>
            {collabs.length > 0 && (
              <>
                <span className="text-muted/30">·</span>
                <span className="flex items-center gap-1 text-[0.8rem] text-muted">
                  <Users className="w-3.5 h-3.5" /> {collabs.length} collaborator{collabs.length !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>


        <div className="px-6 md:px-12 max-w-[1440px] mx-auto py-8">
          {/* Description */}
          {description && (
            <p className="text-[0.9rem] text-muted leading-[1.7] max-w-[640px] mb-10">{description}</p>
          )}

          {/* ── Saved Images ── */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Bookmark className="w-4 h-4 text-accent" />
              <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em]">Saved Images</h2>
              <span className="text-[0.75rem] text-muted ml-2">{boardItems.length}</span>
            </div>

            {boardItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bookmark className="w-8 h-8 text-muted mb-3 opacity-30" />
                <p className="text-[0.88rem] text-muted mb-2">No images saved yet</p>
                <Link to="/explore" className="flex items-center gap-1.5 text-accent text-[0.82rem] font-semibold hover:underline">
                  <Plus className="w-3.5 h-3.5" /> Browse images to save
                </Link>
              </div>
            ) : (
              <div className="masonry-grid">
                {boardItems.map((item, i) => (
                  <Link key={item.imageId + i} to={`/image/${item.imageId}`} className="masonry-item rounded-xl overflow-hidden relative group block">
                    <img
                      src={`https://images.unsplash.com/${item.photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                      alt={item.title}
                      loading="lazy"
                      className="w-full block rounded-xl transition-transform duration-300 group-hover:scale-[1.03]"
                      style={{ height: heights[i % heights.length], objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3" style={{ background: "var(--gradient-overlay)" }}>
                      <span className="flex items-center gap-1 text-[0.7rem] text-white/70"><Eye className="w-3 h-3" /> View</span>
                      {isOwner && (
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemoveItem(item.imageId); }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-red-500/20 backdrop-blur-sm text-white hover:bg-red-500/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Recommended For This Board ── */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em]">Recommended For This Board</h2>
            </div>
            <p className="text-[0.8rem] text-muted mb-5">Based on tags and styles in this board</p>
            <div className="masonry-grid">
              {recommendedPhotos.map((photo, i) => (
                <Link key={i} to={`/image/${i + 10}`} className="masonry-item rounded-xl overflow-hidden relative group block">
                  <img
                    src={`https://images.unsplash.com/${photo}?w=400&h=${heights[(i + 3) % heights.length]}&fit=crop&q=78`}
                    alt="Recommended"
                    loading="lazy"
                    className="w-full block rounded-xl transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ height: heights[(i + 3) % heights.length], objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3" style={{ background: "var(--gradient-overlay)" }}>
                    <span className="text-[0.7rem] text-white/70 flex items-center gap-1"><Eye className="w-3 h-3" /> View</span>
                    <button
                      onClick={e => e.preventDefault()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors"
                    >
                      <Bookmark className="w-3 h-3" /> Save
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Prompts From This Board ── */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em]">Prompts From This Board</h2>
            </div>
            <p className="text-[0.8rem] text-muted mb-5">Click to copy or create with any prompt</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {boardPrompts.map((prompt, i) => (
                <div key={i} className="border border-foreground/[0.06] bg-card rounded-xl p-4 hover:border-foreground/[0.14] transition-colors">
                  <p className="text-[0.84rem] text-foreground/80 leading-[1.6] mb-3">{prompt.text}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopyPrompt(prompt.text, i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all ${
                        copiedIdx === i
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted hover:text-foreground"
                      }`}
                    >
                      {copiedIdx === i ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    <Link
                      to="/real-creator"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors no-underline"
                    >
                      <Sparkles className="w-3 h-3" /> Create With This Prompt
                    </Link>
                    <span className="text-[0.7rem] text-muted ml-auto">{prompt.uses} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Share & Invite Modal ── */}
        {showShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setShowShare(false)}>
            <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[440px] overflow-hidden shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.06]">
                <h3 className="font-display text-[1.05rem] font-bold">Share & Invite</h3>
                <button onClick={() => setShowShare(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/[0.07] transition-colors text-muted">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-5">
                <div>
                  <p className="text-[0.78rem] font-semibold mb-2">Share link</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] text-[0.8rem] text-muted overflow-hidden">
                      <Link2 className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span className="truncate">{window.location.href}</span>
                    </div>
                    <button onClick={handleCopyLink} className="px-3 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.8rem] font-semibold hover:bg-accent transition-colors flex items-center gap-1.5 shrink-0">
                      {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[0.78rem] font-semibold mb-2">Share on</p>
                  <div className="flex gap-2">
                    {socialLinks.map(s => (
                      <button key={s.label} className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors flex-1">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[0.75rem] font-bold" style={{ background: s.color }}>
                          {s.prefix}
                        </div>
                        <span className="text-[0.68rem] text-muted">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {isOwner && (
                  <div>
                    <p className="text-[0.78rem] font-semibold mb-1">Invite collaborators</p>
                    <p className="text-[0.68rem] text-muted mb-3">· can add and remove images</p>
                    {collabs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {collabs.map(handle => {
                          const user = fakeUsers.find(u => u.handle === handle);
                          return (
                            <span key={handle} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-foreground/[0.04] text-[0.76rem]">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white" style={{ background: user?.color || "#888" }}>
                                {user?.init || handle.charAt(0).toUpperCase()}
                              </span>
                              {user?.name || handle}
                              <button onClick={() => handleRemoveCollab(handle)} className="text-muted hover:text-foreground ml-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] mb-2">
                      <Users className="w-3.5 h-3.5 text-muted shrink-0" />
                      <input
                        type="text"
                        value={inviteSearch}
                        onChange={e => setInviteSearch(e.target.value)}
                        placeholder="Search users to invite..."
                        className="flex-1 bg-transparent text-[0.82rem] outline-none"
                      />
                    </div>
                    <div className="max-h-[160px] overflow-y-auto space-y-1">
                      {filteredInviteUsers.length === 0 && (
                        <p className="text-[0.78rem] text-muted text-center py-3">No users found</p>
                      )}
                      {filteredInviteUsers.map(u => {
                        const alreadyInvited = collabs.includes(u.handle) || invitedHandles.includes(u.handle);
                        return (
                          <div key={u.handle} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-foreground/[0.03]">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white" style={{ background: u.color }}>
                              {u.init}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[0.82rem] font-medium">{u.name}</div>
                              <div className="text-[0.7rem] text-muted">@{u.handle}</div>
                            </div>
                            <button
                              onClick={() => !alreadyInvited && handleInvite(u.handle)}
                              disabled={alreadyInvited}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[0.72rem] font-medium transition-colors ${
                                alreadyInvited
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-foreground text-primary-foreground hover:bg-accent"
                              }`}
                            >
                              {alreadyInvited ? <><Check className="w-3 h-3" /> Invited</> : <><Plus className="w-3 h-3" /> Invite</>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Merge Modal ── */}
        {showMerge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setShowMerge(false)}>
            <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.06]">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-accent" />
                  <h3 className="font-display text-[1.05rem] font-bold">Merge Board</h3>
                </div>
                <button onClick={() => setShowMerge(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/[0.07] transition-colors text-muted">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="text-[0.82rem] text-muted mb-4">
                  Move all {boardItems.length} image{boardItems.length !== 1 ? "s" : ""} from <strong>{title}</strong> into another board. This board will be deleted.
                </p>
                {otherBoards.length === 0 ? (
                  <p className="text-[0.82rem] text-muted text-center py-6">No other boards to merge into</p>
                ) : (
                  <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                    {otherBoards.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleMerge(b.id)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-foreground/[0.06]">
                          {b.items[0] ? (
                            <img src={`https://images.unsplash.com/${b.items[0].photo}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Bookmark className="w-4 h-4 text-muted" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.84rem] font-semibold truncate">{b.title}</div>
                          <div className="text-[0.72rem] text-muted">{b.items.length} saved</div>
                        </div>
                        <GitMerge className="w-3.5 h-3.5 text-muted" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Archive Confirm Modal ── */}
        {showArchiveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setShowArchiveConfirm(false)}>
            <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[380px] overflow-hidden shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Archive className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-display text-[1.1rem] font-bold mb-2">Archive "{title}"?</h3>
                <p className="text-[0.82rem] text-muted mb-6">This board will be hidden from your profile. You can unarchive it later from settings.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowArchiveConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-foreground/[0.12] text-[0.82rem] font-medium hover:border-foreground/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Archive = just navigate away for now (no archive field in store)
                      setShowArchiveConfirm(false);
                      navigate("/boards");
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-[0.82rem] font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[380px] overflow-hidden shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-display text-[1.1rem] font-bold mb-2">Delete "{title}"?</h3>
                <p className="text-[0.82rem] text-muted mb-6">This will permanently delete the board and all {boardItems.length} saved image{boardItems.length !== 1 ? "s" : ""}. This cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-foreground/[0.12] text-[0.82rem] font-medium hover:border-foreground/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (userBoard) deleteBoard(userBoard.id);
                      setShowDeleteConfirm(false);
                      navigate("/boards");
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-[0.82rem] font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default BoardDetailPage;
