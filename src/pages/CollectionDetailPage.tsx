import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ChevronRight, Loader2, Heart, Share2, Lock, Key, Check, CreditCard, X, MoreHorizontal, Merge, Archive, LayoutGrid, List, SlidersHorizontal, Image, Video, Music, FileText, Globe, ChevronDown } from "lucide-react";
import { getCollections, grantAccess, type UnifiedCollection } from "@/lib/collectionStore";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import { useQuickView } from "@/context/QuickViewContext";
import { supabase } from "@/integrations/supabase/client";

/* ── Static collection data ── */
const staticCollections: Record<string, { name: string; curator: string; photo: string; count: number; description?: string; visibility?: string; price?: number; accessCode?: string }> = {
  e1: { name: "CEO / Boss Babe", curator: "REAL ART", photo: "photo-1573496359142-b8d87734a5a2", count: 152, description: "Powerful portraits for the modern boss — editorial vibes, confidence, leadership." },
  e2: { name: "Luxury Lifestyle", curator: "REAL ART", photo: "photo-1600210492486-724fe5c67fb0", count: 239, description: "High-end interiors, fashion, and aspirational living." },
  e3: { name: "Cosmic Worlds", curator: "AI.Verse", photo: "photo-1618005182384-a83a8bd57fbe", count: 412, description: "Deep space visions, nebulas, and sci-fi dreamscapes." },
  e4: { name: "Digital Avatars", curator: "LuminaAI", photo: "photo-1579546929518-9e396f3cc809", count: 520, description: "AI-generated portraits and character art." },
  e5: { name: "Street Fashion", curator: "REAL ART", photo: "photo-1509631179647-0177331693ae", count: 185 },
  e6: { name: "Runway Inspired", curator: "REAL ART", photo: "photo-1558618666-fcd25c85cd64", count: 130 },
  e7: { name: "Neon Cities", curator: "NeoPixel", photo: "photo-1557682250-33bd709cbe85", count: 267, description: "Cyberpunk cityscapes bathed in neon light.", visibility: "private", price: 499 },
  e8: { name: "Ancient Forests", curator: "DreamForge", photo: "photo-1470071459604-3b5ec3a7fe05", count: 198 },
  e9: { name: "Modern Architecture", curator: "ChromaLab", photo: "photo-1506905925346-21bda4d32df4", count: 344 },
  e10: { name: "Abstract Fluid", curator: "SpectraGen", photo: "photo-1541701494587-cb58502866ab", count: 189, visibility: "private", price: 299 },
  e11: { name: "Minimal Spaces", curator: "VoidArt", photo: "photo-1549880338-65ddcdfd017b", count: 143 },
  e12: { name: "Retro Futures", curator: "REAL ART", photo: "photo-1547036967-23d11aacaee0", count: 231 },
  b1: { name: "Cyberpunk Cities", curator: "VoidArt", photo: "photo-1557682250-33bd709cbe85", count: 128 },
  b2: { name: "Surreal Dreamscapes", curator: "DreamForge", photo: "photo-1579546929518-9e396f3cc809", count: 94 },
  b3: { name: "Dark Fantasy", curator: "NeoPixel", photo: "photo-1541701494587-cb58502866ab", count: 156, visibility: "private", price: 599 },
  b4: { name: "Abstract Minimalism", curator: "ChromaLab", photo: "photo-1618005182384-a83a8bd57fbe", count: 82 },
  b5: { name: "Cosmic Visions", curator: "AI.Verse", photo: "photo-1462275646964-a0e3386b89fa", count: 241 },
  b6: { name: "Neon Portraits", curator: "LuminaAI", photo: "photo-1547036967-23d11aacaee0", count: 67, visibility: "private" },
  b7: { name: "Nature Reimagined", curator: "SpectraGen", photo: "photo-1470071459604-3b5ec3a7fe05", count: 109 },
  b8: { name: "Retro Futurism", curator: "Synthetix", photo: "photo-1518020382113-a7e8fc38eac9", count: 73 },
  b9: { name: "Liquid Metal", curator: "AI.Verse", photo: "photo-1558618666-fcd25c85cd64", count: 88, visibility: "private", price: 799 },
};

const samplePhotos = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab", "photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85", "photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9", "photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809", "photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b", "photo-1576091160550-2173dba999ef",
  "photo-1518770660439-4636190af475", "photo-1462275646964-a0e3386b89fa",
  "photo-1500462918059-b1a0cb512f1d", "photo-1543722530-d2c3201371e7",
];

const heights = [230, 190, 260, 200, 240, 175, 215, 250, 185, 225, 195, 245, 210, 235, 180, 220];

interface CollectionData { id: string; name: string; description: string | null; cover_url: string | null; is_public: boolean; user_id: string; }
interface CollectionImage { id: string; image_url: string; title: string | null; sort_order: number | null; }
interface ProfileData { display_name: string | null; username: string | null; }

const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { open } = useQuickView();
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [images, setImages] = useState<CollectionImage[]>([]);
  const [creator, setCreator] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStatic, setIsStatic] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Newest");
  const moreRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Access gate state
  const [accessTab, setAccessTab] = useState<"code" | "pay">("code");
  const [codeInput, setCodeInput] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [paying, setPaying] = useState(false);

  // Close more/filter menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Determine if this is a locked collection
  const sc = id ? staticCollections[id] : undefined;
  const price = sc?.price;
  const isPrivate = sc?.visibility === "private";

  useEffect(() => {
    if (!id) return;

    // Check session access
    const granted = (() => { try { return (JSON.parse(sessionStorage.getItem("ra_access_granted") || "[]") as string[]).includes(id); } catch { return false; } })();

    // Priority 1: User's own collections from localStorage
    const userCols = getCollections();
    const userCol = userCols.find(c => c.id === id);
    if (userCol) {
      setCollection({ id: userCol.id, name: userCol.title, description: userCol.description || null, cover_url:
        userCol.coverPhoto ? `https://images.unsplash.com/${userCol.coverPhoto}?w=1200&h=400&fit=crop&q=80` : userCol.thumbs[0]
        ? `https://images.unsplash.com/${userCol.thumbs[0]}?w=1200&h=400&fit=crop&q=80` : null, is_public: userCol.visibility === "public", user_id: "me" });
      const userDisplay = (() => { try { return localStorage.getItem("ra_display") || "You"; } catch { return "You"; } })();
      setCreator({ display_name: userDisplay, username: localStorage.getItem("ra_username") });
      const imgs: CollectionImage[] = userCol.items.map((item, i) => ({
        id: item.imageId, image_url: `https://images.unsplash.com/${item.photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`, title: item.title, sort_order: i,
      }));
      setImages(imgs);
      setIsStatic(false);
      setAccessGranted(true);
      setLoading(false);
      return;
    }

    // Priority 2: Static collections
    if (sc) {
      setCollection({ id, name: sc.name, description: sc.description || null, cover_url: `https://images.unsplash.com/${sc.photo}?w=1200&h=400&fit=crop&q=80`, is_public: sc.visibility !== "private", user_id: "" });
      setCreator({ display_name: sc.curator, username: null });
      const count = Math.min(sc.count, 16);
      const imgs: CollectionImage[] = Array.from({ length: count }, (_, i) => ({
        id: `static-${i}`,
        image_url: `https://images.unsplash.com/${samplePhotos[i % samplePhotos.length]}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`,
        title: null, sort_order: i,
      }));
      setImages(imgs);
      setIsStatic(true);
      setAccessGranted(sc.visibility !== "private" || granted);
      if (sc.price && sc.price > 0) setAccessTab("pay");
      setLoading(false);
      return;
    }

    // Priority 3: Supabase
    const fetchData = async () => {
      setLoading(true);
      const { data: col } = await supabase.from("collections").select("*").eq("id", id).single();
      if (col) {
        setCollection(col);
        const [{ data: imgs }, { data: profile }] = await Promise.all([
          supabase.from("collection_images").select("id, image_url, title, sort_order").eq("collection_id", id).order("sort_order", { ascending: true }),
          supabase.from("profiles").select("display_name, username").eq("user_id", col.user_id).single(),
        ]);
        if (imgs) setImages(imgs);
        if (profile) setCreator(profile);
        setAccessGranted(col.is_public || granted);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const tryCode = () => {
    if (codeInput.length >= 4) {
      grantAccess(id!);
      setAccessGranted(true);
    } else {
      setCodeErr("Invalid code — check with the collection owner");
    }
  };

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => { grantAccess(id!); setAccessGranted(true); }, 1500);
  };

  if (loading) {
    return (
      <PageShell>
        <div className="px-6 md:px-12 pt-8 pb-16 max-w-[1440px] mx-auto">
          <div className="w-full h-[220px] rounded-2xl bg-foreground/[0.06] animate-pulse mb-6" />
          <div className="flex items-center gap-4 mb-6">
            <div className="h-8 w-[280px] rounded-lg bg-foreground/[0.06] animate-pulse" />
            <div className="h-6 w-[120px] rounded-lg bg-foreground/[0.06] animate-pulse" />
          </div>
          <div className="masonry-grid">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="masonry-item rounded-xl bg-foreground/[0.06] animate-pulse" style={{ height: heights[i % heights.length] }} />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (!collection) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="font-display text-[2rem] font-black mb-2">Collection Not Found</h1>
            <Link to="/collections" className="text-accent text-[0.88rem] hover:underline">Browse Collections</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  // Access gate for private collections
  if (!accessGranted && !collection.is_public) {
    const curatorName = creator?.display_name || creator?.username || "Unknown";
    return (
      <PageShell>
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">{collection.name}</span>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-[440px] mx-4">
            <div className="text-center mb-6">
              <Lock className="w-7 h-7 text-muted mx-auto mb-3" />
              <h1 className="font-display text-[2rem] font-black mb-2">{collection.name}</h1>
              <p className="text-[0.88rem] text-muted mb-1">This is a private collection</p>
              {creator && <p className="text-[0.82rem] text-muted">by <strong className="text-foreground">{curatorName}</strong></p>}
            </div>

            <div className="bg-card border border-foreground/[0.08] rounded-2xl overflow-hidden">
              {price && price > 0 && (
                <div className="flex border-b border-foreground/[0.06]">
                  {([{ id: "pay" as const, label: `Buy — $${(price / 100).toFixed(2)}` }, { id: "code" as const, label: "Enter Code" }]).map(t => (
                    <button key={t.id} onClick={() => setAccessTab(t.id)}
                      className={`flex-1 py-3 text-[0.82rem] font-medium border-b-2 transition-colors ${accessTab === t.id ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6">
                {accessTab === "code" ? (
                  <>
                    <p className="text-[0.82rem] text-muted mb-4">Enter the access code provided by the collection owner.</p>
                    <div className="flex items-center gap-2 h-12 border border-foreground/[0.12] rounded-xl px-4 bg-background focus-within:border-accent transition-colors mb-3">
                      <Key className="w-4 h-4 text-muted mr-2 shrink-0" />
                      <input value={codeInput} onChange={e => { setCodeInput(e.target.value.toUpperCase()); setCodeErr(""); }}
                        onKeyDown={e => e.key === "Enter" && tryCode()} placeholder="ENTER CODE" autoFocus
                        className="flex-1 border-none outline-none bg-transparent text-[0.9rem] font-mono tracking-[0.14em] uppercase" />
                    </div>
                    {codeErr && <p className="text-[0.78rem] text-destructive mb-3">{codeErr}</p>}
                    <button onClick={tryCode} className="w-full py-3 rounded-xl bg-foreground text-primary-foreground text-[0.88rem] font-semibold hover:bg-accent transition-colors">
                      Unlock with Code
                    </button>
                    {price && price > 0 && (
                      <button onClick={() => setAccessTab("pay")} className="w-full mt-3 text-[0.78rem] text-muted hover:text-foreground transition-colors">
                        Buy access for ${(price / 100).toFixed(2)} →
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center mb-5">
                      <div className="text-[0.78rem] text-muted mb-1">Lifetime access</div>
                      <div className="font-display text-[2rem] font-black">${(price! / 100).toFixed(2)}</div>
                    </div>
                    <div className="space-y-2 mb-5">
                      {["Full access forever", "Download all images", "Access on any device"].map(f => (
                        <div key={f} className="flex items-center gap-2.5 text-[0.82rem]">
                          <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />{f}
                        </div>
                      ))}
                    </div>
                    <button onClick={handlePay} disabled={paying}
                      className="w-full py-3 rounded-xl bg-foreground text-primary-foreground text-[0.88rem] font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                      {paying ? <>Processing…</> : <>Pay ${(price! / 100).toFixed(2)} — Unlock</>}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </PageShell>
    );
  }

  const coverUrl = collection.cover_url || (images.length > 0 ? images[0].image_url : null);
  const curatorName = creator?.display_name || creator?.username || "Unknown";

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
        <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3 h-3 opacity-30" />
        <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
        <ChevronRight className="w-3 h-3 opacity-30" />
        <span className="text-foreground">{collection.name}</span>
      </div>

      {/* Header */}
      <div className="px-6 md:px-12 pb-5 max-w-[1440px] mx-auto">
        <h1 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none mb-2">{collection.name}</h1>
        {collection.description && (
          <p className="text-[0.88rem] text-muted max-w-[520px]">{collection.description}</p>
        )}
      </div>

      {/* Stats & Controls */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6 py-5 border-b border-foreground/[0.06] text-[0.82rem] text-muted flex-wrap">
          <span>Curated by <strong className="text-foreground">{curatorName.toLowerCase()}</strong></span>
          <span><strong className="text-foreground">{isStatic ? staticCollections[id!]?.count.toLocaleString() : images.length}</strong> media files</span>

          {/* Media type breakdown */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Image className="w-3.5 h-3.5" /> <strong className="text-foreground">{isStatic ? Math.floor((staticCollections[id!]?.count || 0) * 0.7) : Math.floor(images.length * 0.7)}</strong> Photos</span>
            <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> <strong className="text-foreground">{isStatic ? Math.floor((staticCollections[id!]?.count || 0) * 0.2) : Math.floor(images.length * 0.2)}</strong> Videos</span>
            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> <strong className="text-foreground">{isStatic ? Math.floor((staticCollections[id!]?.count || 0) * 0.1) : Math.ceil(images.length * 0.1)}</strong> Other</span>
          </div>

          {/* Public / Private label */}
          {collection.is_public ? (
            <span className="px-2.5 py-1 rounded-md bg-card border border-foreground/[0.1] text-[0.75rem] font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" /> Public
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-card border border-foreground/[0.1] text-[0.75rem] font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private
            </span>
          )}

          <div className="ml-auto flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors">
              <Heart className="w-4 h-4" /> Follow
            </button>
            <button onClick={() => navigator.clipboard.writeText(window.location.href).catch(() => {})}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <div className="relative" ref={moreRef}>
              <button onClick={() => setMoreOpen(o => !o)}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-foreground/[0.12] hover:border-foreground/30 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-[180px] bg-card border border-foreground/[0.1] rounded-xl shadow-lg py-1.5 z-50">
                  <button onClick={() => { setMoreOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.84rem] text-foreground hover:bg-background transition-colors text-left">
                    <Merge className="w-4 h-4" /> Merge Collection
                  </button>
                  <button onClick={() => { setMoreOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.84rem] text-foreground hover:bg-background transition-colors text-left">
                    <Archive className="w-4 h-4" /> Archive Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: View toggle + Filter */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            {/* View toggles */}
            <button onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${viewMode === "grid" ? "bg-foreground text-background border-foreground" : "border-foreground/[0.12] hover:border-foreground/30 text-muted"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${viewMode === "list" ? "bg-foreground text-background border-foreground" : "border-foreground/[0.12] hover:border-foreground/30 text-muted"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filter <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-[200px] bg-card border border-foreground/[0.1] rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-3 py-1.5 text-[0.72rem] font-semibold text-muted uppercase tracking-wider">Sort By</div>
                {["Newest", "Most Downloads", "Most Likes", "Most Views"].map(f => (
                  <button key={f} onClick={() => { setActiveFilter(f); setFilterOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.84rem] hover:bg-background transition-colors text-left ${activeFilter === f ? "text-accent font-medium" : "text-foreground"}`}>
                    {f}
                  </button>
                ))}
                <div className="border-t border-foreground/[0.06] my-1" />
                <div className="px-3 py-1.5 text-[0.72rem] font-semibold text-muted uppercase tracking-wider">Media Type</div>
                {[{ label: "Photos", icon: Image }, { label: "Videos", icon: Video }, { label: "Audio", icon: Music }, { label: "Other", icon: FileText }].map(({ label, icon: Icon }) => (
                  <button key={label} onClick={() => setFilterOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.84rem] text-foreground hover:bg-background transition-colors text-left">
                    <Icon className="w-3.5 h-3.5 text-muted" /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="px-6 md:px-12 pb-8 max-w-[1440px] mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-16 text-muted text-[0.88rem]">
            No images in this collection yet.
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, i) => {
              const photo = isStatic ? samplePhotos[i % samplePhotos.length] : "";
              return (
                <div key={img.id}
                  onClick={() => open({ id: String(i), photo: photo || img.image_url, title: img.title || collection.name })}
                  className="rounded-xl overflow-hidden block cursor-pointer group relative aspect-square"
                  style={{ background: "hsl(var(--muted))" }}>
                  <img src={img.image_url} alt={img.title || ""} loading="lazy"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-[1.03] transition-transform duration-300" />
                  <ImageCardOverlay index={i} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {images.map((img, i) => {
              const photo = isStatic ? samplePhotos[i % samplePhotos.length] : "";
              return (
                <div key={img.id}
                  onClick={() => open({ id: String(i), photo: photo || img.image_url, title: img.title || collection.name })}
                  className="flex items-center gap-4 p-2 rounded-xl cursor-pointer group hover:bg-card transition-colors border border-transparent hover:border-foreground/[0.06]">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0" style={{ background: "hsl(var(--muted))" }}>
                    <img src={img.image_url} alt={img.title || ""} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.88rem] font-medium truncate">{img.title || `Image ${i + 1}`}</p>
                    <p className="text-[0.78rem] text-muted flex items-center gap-1"><Image className="w-3 h-3" /> Photo</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </PageShell>
  );
};

export default CollectionDetailPage;
