import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  "All", "People & Portraits", "Fashion & Style", "Nature & Earth",
  "Architecture", "Abstract", "Sci-Fi & Fantasy", "Luxury",
  "Cyberpunk", "Avatars", "Backgrounds", "3D Art",
];

const allCollections = [
  { id: "1", name: "CEO / Boss Babe", count: 152, category: "People & Portraits", curator: "REAL ART", photo: "photo-1573496359142-b8d87734a5a2", featured: true },
  { id: "2", name: "Luxury Lifestyle", count: 239, category: "Luxury", curator: "REAL ART", photo: "photo-1600210492486-724fe5c67fb0", featured: true },
  { id: "3", name: "Cosmic Worlds", count: 412, category: "Sci-Fi & Fantasy", curator: "AI.Verse", photo: "photo-1618005182384-a83a8bd57fbe", featured: true },
  { id: "4", name: "Digital Avatars", count: 520, category: "Avatars", curator: "LuminaAI", photo: "photo-1579546929518-9e396f3cc809", featured: true },
  { id: "5", name: "Street Fashion", count: 185, category: "Fashion & Style", curator: "REAL ART", photo: "photo-1509631179647-0177331693ae", featured: false },
  { id: "6", name: "Runway Inspired", count: 130, category: "Fashion & Style", curator: "REAL ART", photo: "photo-1558618666-fcd25c85cd64", featured: false },
  { id: "7", name: "Neon Cities", count: 267, category: "Cyberpunk", curator: "NeoPixel", photo: "photo-1557682250-33bd709cbe85", featured: false },
  { id: "8", name: "Ancient Forests", count: 198, category: "Nature & Earth", curator: "DreamForge", photo: "photo-1470071459604-3b5ec3a7fe05", featured: false },
  { id: "9", name: "Modern Architecture", count: 344, category: "Architecture", curator: "ChromaLab", photo: "photo-1506905925346-21bda4d32df4", featured: false },
  { id: "10", name: "Abstract Fluid", count: 189, category: "Abstract", curator: "SpectraGen", photo: "photo-1541701494587-cb58502866ab", featured: false },
  { id: "11", name: "Minimal Spaces", count: 143, category: "Architecture", curator: "VoidArt", photo: "photo-1549880338-65ddcdfd017b", featured: false },
  { id: "12", name: "Retro Futures", count: 231, category: "Sci-Fi & Fantasy", curator: "REAL ART", photo: "photo-1547036967-23d11aacaee0", featured: false },
];

const CollectionsPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = allCollections.filter(col => {
    const matchCat = activeCategory === "All" || col.category === activeCategory;
    const matchQ = !query || col.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const featured = filtered.filter(c => c.featured);
  const rest = filtered.filter(c => !c.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
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
              <p className="text-[0.88rem] text-muted">Curated galleries of the finest visuals — by our team and top creators</p>
            </div>
            <div className="flex items-center gap-3 bg-card border border-foreground/[0.12] rounded-xl px-4 h-11 w-full md:w-72 focus-within:border-foreground transition-colors">
              <Search className="w-4 h-4 text-muted shrink-0" />
              <input
                className="flex-1 border-none outline-none font-body text-[0.88rem] bg-transparent"
                placeholder="Search collections…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="px-6 md:px-12 py-5 border-b border-foreground/[0.06]">
          <div className="max-w-[1440px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`border px-4 py-1.5 rounded-md text-[0.79rem] font-medium whitespace-nowrap transition-all ${
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

        <div className="px-6 md:px-12 py-8 max-w-[1440px] mx-auto">
          {/* Featured */}
          {featured.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent">Featured</div>
                <div className="flex-1 h-px bg-foreground/[0.06]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {featured.map(col => (
                  <Link key={col.id} to={`/collections/${col.id}`} className="cursor-pointer group block">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 relative">
                      <img
                        src={`https://images.unsplash.com/${col.photo}?w=400&h=530&fit=crop&q=78`}
                        alt={col.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-accent text-primary-foreground text-[0.62rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.06em]">
                        Featured
                      </div>
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)" }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[0.92rem]">{col.name}</p>
                        <p className="text-[0.76rem] text-muted mt-0.5">by {col.curator} · {col.count} images</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Collections */}
          {rest.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-muted">
                  All Collections · {filtered.length} total
                </div>
                <div className="flex-1 h-px bg-foreground/[0.06]" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {rest.map(col => (
                  <Link key={col.id} to={`/collections/${col.id}`} className="cursor-pointer group block">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2.5">
                      <img
                        src={`https://images.unsplash.com/${col.photo}?w=400&h=530&fit=crop&q=78`}
                        alt={col.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-semibold text-[0.9rem]">{col.name}</p>
                    <p className="text-[0.75rem] text-muted mt-0.5">{col.curator} · {col.count} images</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="font-display text-[2rem] font-black tracking-[-0.03em] mb-3">No collections found</div>
              <p className="text-muted text-[0.88rem]">Try a different category or search term.</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default CollectionsPage;
