import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import { useQuickView } from "@/context/QuickViewContext";
import { supabase } from "@/integrations/supabase/client";

/* ── Static collection data (mirrors CollectionsPage) ── */
const staticCollections: Record<string, { name: string; curator: string; photo: string; count: number; description?: string }> = {
  e1: { name: "CEO / Boss Babe", curator: "REAL ART", photo: "photo-1573496359142-b8d87734a5a2", count: 152, description: "Powerful portraits for the modern boss — editorial vibes, confidence, leadership." },
  e2: { name: "Luxury Lifestyle", curator: "REAL ART", photo: "photo-1600210492486-724fe5c67fb0", count: 239, description: "High-end interiors, fashion, and aspirational living." },
  e3: { name: "Cosmic Worlds", curator: "AI.Verse", photo: "photo-1618005182384-a83a8bd57fbe", count: 412, description: "Deep space visions, nebulas, and sci-fi dreamscapes." },
  e4: { name: "Digital Avatars", curator: "LuminaAI", photo: "photo-1579546929518-9e396f3cc809", count: 520, description: "AI-generated portraits and character art." },
  e5: { name: "Street Fashion", curator: "REAL ART", photo: "photo-1509631179647-0177331693ae", count: 185 },
  e6: { name: "Runway Inspired", curator: "REAL ART", photo: "photo-1558618666-fcd25c85cd64", count: 130 },
  e7: { name: "Neon Cities", curator: "NeoPixel", photo: "photo-1557682250-33bd709cbe85", count: 267, description: "Cyberpunk cityscapes bathed in neon light." },
  e8: { name: "Ancient Forests", curator: "DreamForge", photo: "photo-1470071459604-3b5ec3a7fe05", count: 198 },
  e9: { name: "Modern Architecture", curator: "ChromaLab", photo: "photo-1506905925346-21bda4d32df4", count: 344 },
  e10: { name: "Abstract Fluid", curator: "SpectraGen", photo: "photo-1541701494587-cb58502866ab", count: 189 },
  e11: { name: "Minimal Spaces", curator: "VoidArt", photo: "photo-1549880338-65ddcdfd017b", count: 143 },
  e12: { name: "Retro Futures", curator: "REAL ART", photo: "photo-1547036967-23d11aacaee0", count: 231 },
  b1: { name: "Cyberpunk Cities", curator: "VoidArt", photo: "photo-1557682250-33bd709cbe85", count: 128 },
  b2: { name: "Surreal Dreamscapes", curator: "DreamForge", photo: "photo-1579546929518-9e396f3cc809", count: 94 },
  b3: { name: "Dark Fantasy", curator: "NeoPixel", photo: "photo-1541701494587-cb58502866ab", count: 156 },
  b4: { name: "Abstract Minimalism", curator: "ChromaLab", photo: "photo-1618005182384-a83a8bd57fbe", count: 82 },
  b5: { name: "Cosmic Visions", curator: "AI.Verse", photo: "photo-1462275646964-a0e3386b89fa", count: 241 },
  b6: { name: "Neon Portraits", curator: "LuminaAI", photo: "photo-1547036967-23d11aacaee0", count: 67 },
  b7: { name: "Nature Reimagined", curator: "SpectraGen", photo: "photo-1470071459604-3b5ec3a7fe05", count: 109 },
  b8: { name: "Retro Futurism", curator: "Synthetix", photo: "photo-1518020382113-a7e8fc38eac9", count: 73 },
  b9: { name: "Liquid Metal", curator: "AI.Verse", photo: "photo-1558618666-fcd25c85cd64", count: 88 },
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
  const { open } = useQuickView();
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [images, setImages] = useState<CollectionImage[]>([]);
  const [creator, setCreator] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check static collections first
    const sc = staticCollections[id];
    if (sc) {
      setCollection({ id, name: sc.name, description: sc.description || null, cover_url: `https://images.unsplash.com/${sc.photo}?w=1200&h=400&fit=crop&q=80`, is_public: true, user_id: "" });
      setCreator({ display_name: sc.curator, username: null });
      // Generate sample images for this collection
      const count = Math.min(sc.count, 16);
      const imgs: CollectionImage[] = Array.from({ length: count }, (_, i) => ({
        id: `static-${i}`,
        image_url: `https://images.unsplash.com/${samplePhotos[i % samplePhotos.length]}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`,
        title: null,
        sort_order: i,
      }));
      setImages(imgs);
      setIsStatic(true);
      setLoading(false);
      return;
    }

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
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
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

  const coverUrl = collection.cover_url || (images.length > 0 ? images[0].image_url : null);
  const curatorName = creator?.display_name || creator?.username || "Unknown";

  return (
    <PageShell>
      {/* Cover */}
      <div className="h-[240px] md:h-[320px] relative overflow-hidden bg-card">
        {coverUrl && (
          <img src={coverUrl} alt={collection.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-[0.8rem] text-white/70 mb-2">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <Link to="/collections" className="hover:text-white transition-colors">Collections</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-white">{collection.name}</span>
          </div>
          <h1 className="font-display text-[2.4rem] md:text-[3rem] font-black text-white tracking-[-0.03em] leading-none">{collection.name}</h1>
          {collection.description && (
            <p className="text-white/70 text-[0.85rem] mt-2 max-w-[520px]">{collection.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6 py-5 border-b border-foreground/[0.06] text-[0.82rem] text-muted">
          <span>Curated by <strong className="text-foreground">{curatorName}</strong></span>
          <span><strong className="text-foreground">{isStatic ? staticCollections[id!]?.count.toLocaleString() : images.length}</strong> image{images.length !== 1 ? "s" : ""}</span>
          {!collection.is_public && (
            <span className="px-2.5 py-1 rounded-md bg-card border border-foreground/[0.1] text-[0.75rem] font-medium">Private</span>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="px-6 md:px-12 py-8 max-w-[1440px] mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-16 text-muted text-[0.88rem]">
            No images in this collection yet.
          </div>
        ) : (
          <div className="masonry-grid">
            {images.map((img, i) => {
              const photo = isStatic ? samplePhotos[i % samplePhotos.length] : "";
              return (
                <div
                  key={img.id}
                  onClick={() => open({ id: String(i), photo: photo || img.image_url, title: img.title || collection.name })}
                  className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative"
                  style={{ background: "#e0e0de" }}
                >
                  <img
                    src={img.image_url}
                    alt={img.title || ""}
                    loading="lazy"
                    className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                    style={{ minHeight: 150, objectFit: "cover" }}
                  />
                  <ImageCardOverlay index={i} />
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
