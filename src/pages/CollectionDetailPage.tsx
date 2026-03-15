import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Heart, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allCollections: Record<string, { name: string; curator: string; count: number; category: string; photo: string; desc: string }> = {
  "1": { name: "CEO / Boss Babe", curator: "REAL ART", count: 152, category: "People & Portraits", photo: "photo-1573496359142-b8d87734a5a2", desc: "Power portraits curated by creators — bold, confident, and editorial." },
  "2": { name: "Luxury Lifestyle", curator: "REAL ART", count: 239, category: "Luxury", photo: "photo-1600210492486-724fe5c67fb0", desc: "The finest in luxury living, fashion, and design." },
  "3": { name: "Cosmic Worlds", curator: "AI.Verse", count: 412, category: "Sci-Fi & Fantasy", photo: "photo-1618005182384-a83a8bd57fbe", desc: "Explore otherworldly landscapes and cosmic visions from top creators." },
  "4": { name: "Digital Avatars", curator: "LuminaAI", count: 520, category: "Avatars", photo: "photo-1579546929518-9e396f3cc809", desc: "Next-gen digital portraits and avatar art." },
  "5": { name: "Street Fashion", curator: "REAL ART", count: 185, category: "Fashion & Style", photo: "photo-1509631179647-0177331693ae", desc: "Urban fashion photography and AI-generated streetwear visuals." },
  "6": { name: "Runway Inspired", curator: "REAL ART", count: 130, category: "Fashion & Style", photo: "photo-1558618666-fcd25c85cd64", desc: "Editorial looks inspired by the world's top runways." },
  "7": { name: "Neon Cities", curator: "NeoPixel", count: 267, category: "Cyberpunk", photo: "photo-1557682250-33bd709cbe85", desc: "Cyberpunk cityscapes drenched in neon light." },
  "8": { name: "Ancient Forests", curator: "DreamForge", count: 198, category: "Nature & Earth", photo: "photo-1470071459604-3b5ec3a7fe05", desc: "Deep woods, ancient trees, and organic beauty." },
  "9": { name: "Modern Architecture", curator: "ChromaLab", count: 344, category: "Architecture", photo: "photo-1506905925346-21bda4d32df4", desc: "Clean lines and bold structures from AI architectural visionaries." },
  "10": { name: "Abstract Fluid", curator: "SpectraGen", count: 189, category: "Abstract", photo: "photo-1541701494587-cb58502866ab", desc: "Fluid gradients, bold colour, generative flow." },
  "11": { name: "Minimal Spaces", curator: "VoidArt", count: 143, category: "Architecture", photo: "photo-1549880338-65ddcdfd017b", desc: "Quiet, minimal interiors and architectural moments." },
  "12": { name: "Retro Futures", curator: "REAL ART", count: 231, category: "Sci-Fi & Fantasy", photo: "photo-1547036967-23d11aacaee0", desc: "Vintage sci-fi meets modern AI generation." },
};

const galleryPhotos = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab", "photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85", "photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9", "photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809", "photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b", "photo-1576091160550-2173dba999ef",
  "photo-1573496359142-b8d87734a5a2", "photo-1600210492486-724fe5c67fb0",
  "photo-1509631179647-0177331693ae", "photo-1470071459604-3b5ec3a7fe05",
];

const heights = [210, 260, 175, 235, 185, 255, 165, 215, 150, 240, 195, 170, 220, 245, 190, 200];

const CollectionDetailPage = () => {
  const { id } = useParams();
  const col = allCollections[id || "1"] || allCollections["1"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Cover */}
        <div className="h-[240px] md:h-[320px] relative overflow-hidden">
          <img
            src={`https://images.unsplash.com/${col.photo}?w=1400&h=340&fit=crop&q=85`}
            alt={col.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6 max-w-[1440px] mx-auto">
            <div className="flex items-center gap-2 text-[0.8rem] text-white/70 mb-2">
              <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <Link to="/collections" className="hover:text-white transition-colors">Collections</Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="text-white">{col.name}</span>
            </div>
            <h1 className="font-display text-[2.4rem] md:text-[3rem] font-black text-white tracking-[-0.03em] leading-none">{col.name}</h1>
            <p className="text-white/70 text-[0.85rem] mt-2 max-w-[520px]">{col.desc}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-6 py-5 border-b border-foreground/[0.06] text-[0.82rem] text-muted">
            <span>Curated by <strong className="text-foreground">{col.curator}</strong></span>
            <span><strong className="text-foreground">{col.count}</strong> images</span>
            <span className="px-2.5 py-1 rounded-md bg-card border border-foreground/[0.1] text-[0.75rem] font-medium">{col.category}</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="px-6 md:px-12 py-8 max-w-[1440px] mx-auto">
          <div className="masonry-grid">
            {galleryPhotos.map((photo, i) => (
              <Link key={i} to={`/image/${i}`} className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative">
                <img
                  src={`https://images.unsplash.com/${photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                  alt="" loading="lazy"
                  className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                  style={{ height: heights[i % heights.length], objectFit: "cover" }}
                />
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3" style={{ background: "var(--gradient-overlay)" }}>
                  <div className="flex gap-1.5 ml-auto">
                    <button onClick={e => e.preventDefault()} className="w-7 h-7 rounded-full border-none bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors">
                      <Heart className="w-3 h-3" />
                    </button>
                    <button onClick={e => e.preventDefault()} className="w-7 h-7 rounded-full border-none bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default CollectionDetailPage;
