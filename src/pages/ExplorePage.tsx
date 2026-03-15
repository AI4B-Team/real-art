import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronDown, Download, Heart, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SponsoredCard from "@/components/SponsoredCard";

const sponsoredAds = [
  { imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=260&fit=crop&q=80", brandName: "Poshmark", destinationUrl: "#" },
  { imageUrl: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=400&h=230&fit=crop&q=80", brandName: "SHEIN", destinationUrl: "#" },
  { imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop&q=80", brandName: "Target", destinationUrl: "#" },
];

const photos = [
  "photo-1618005182384-a83a8bd57fbe","photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab","photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85","photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9","photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809","photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b","photo-1576091160550-2173dba999ef",
  "photo-1518770660439-4636190af475","photo-1462275646964-a0e3386b89fa",
  "photo-1500462918059-b1a0cb512f1d","photo-1543722530-d2c3201371e7",
  "photo-1533158628620-7e4d0a003147","photo-1505765050516-f72dcac9c60e",
  "photo-1470071459604-3b5ec3a7fe05","photo-1465146344425-f00d5f5c8f07",
  "photo-1500462918059-b1a0cb512f1d","photo-1543722530-d2c3201371e7",
  "photo-1518770660439-4636190af475","photo-1462275646964-a0e3386b89fa",
  "photo-1607799279861-4dd421887fb3","photo-1533158628620-7e4d0a003147",
  "photo-1567360425618-1594206637d2","photo-1505765050516-f72dcac9c60e",
];

const heights = [200, 260, 170, 230, 185, 255, 162, 215, 148, 238, 196, 172, 248, 182, 157, 226, 178, 262, 152, 212];

const creators = [
  { n: "AI.Verse", i: "AV", c: "#4361ee" }, { n: "NeoPixel", i: "NP", c: "#c9184a" },
  { n: "DreamForge", i: "DF", c: "#2a9d8f" }, { n: "LuminaAI", i: "LA", c: "#e76f51" },
  { n: "SpectraGen", i: "SG", c: "#7b2d8b" }, { n: "VoidArt", i: "VA", c: "#023e8a" },
  { n: "ChromaLab", i: "CL", c: "#f4a261" }, { n: "Synthetix", i: "SX", c: "#06d6a0" },
];

const filters = [
  "All", "Trending", "New", "Popular", "Abstract", "Portraits", "People",
  "Nature", "Architecture", "Fantasy", "3D Art", "Fashion", "Sci-Fi",
  "Avatars", "Backgrounds", "Luxury", "Cyberpunk", "Minimal",
];

const sortOptions = ["Most Relevant", "Newest First", "Most Downloaded", "Most Liked"];

const types = ["Photos", "Videos", "Music"];

const ExplorePage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeType, setActiveType] = useState("Photos");
  const [sort, setSort] = useState("Most Relevant");
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">

        {/* Search header */}
        <div className="border-b border-foreground/[0.06] bg-card px-6 md:px-12 py-5">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Type toggle */}
              <div className="flex items-center gap-1 bg-background border border-foreground/[0.1] rounded-lg p-1">
                {types.map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
                    className={`px-4 py-1.5 rounded-md text-[0.8rem] font-medium transition-colors ${activeType === t ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[260px] flex items-center gap-3 bg-background border border-foreground/[0.12] rounded-xl px-4 h-11 focus-within:border-foreground transition-colors">
                <Search className="w-4 h-4 text-muted shrink-0" />
                <input
                  className="flex-1 border-none outline-none font-body text-[0.9rem] bg-transparent"
                  placeholder="Search millions of free visuals…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted hover:text-foreground text-lg leading-none">×</button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 h-11 rounded-xl border border-foreground/[0.12] text-[0.82rem] font-medium hover:border-foreground/30 transition-colors bg-background"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {sort}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 bg-card border border-foreground/[0.08] rounded-xl min-w-[200px] shadow-[var(--shadow-card)] p-2 z-50 animate-drop-in">
                    {sortOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSort(opt); setSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[0.83rem] transition-colors ${sort === opt ? "text-accent font-medium" : "hover:bg-background text-foreground"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 md:px-12 pt-5 pb-1">
          <div className="max-w-[1440px] mx-auto flex items-center overflow-x-auto no-scrollbar">
            <div className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-muted mr-2.5 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3 h-3" /> Filter
            </div>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`border px-4 py-1.5 rounded-md font-body text-[0.79rem] font-medium cursor-pointer whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "bg-transparent border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="px-6 md:px-12 py-4">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <div className="text-[0.82rem] text-muted">
              {query ? (
                <>Showing results for <strong className="text-foreground">"{query}"</strong> · 2,418 images</>
              ) : (
                <><strong className="text-foreground">{activeFilter}</strong> · 2,418,000 images</>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="px-6 md:px-12 pb-16">
          <div className="max-w-[1440px] mx-auto">
            <div className="masonry-grid">
              {photos.slice(0, visibleCount).map((photo, i) => {
                const cr = creators[i % creators.length];
                const h = heights[i % heights.length];
                return (
                  <Link
                    key={i}
                    to={`/image/${i}`}
                    className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative"
                    style={{ background: "#e0e0de" }}
                  >
                    <img
                      src={`https://images.unsplash.com/${photo}?w=400&h=${h}&fit=crop&q=78`}
                      alt=""
                      loading="lazy"
                      className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-[350ms] ease-out"
                      style={{ height: h, objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 rounded-xl flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "var(--gradient-overlay)" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.58rem] font-bold text-primary-foreground border border-primary-foreground/30"
                            style={{ background: cr.c }}
                          >
                            {cr.i}
                          </div>
                          <span className="text-[0.72rem] text-primary-foreground/90">{cr.n}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={e => e.preventDefault()} className="w-7 h-7 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/[0.38] transition-colors">
                            <Heart className="w-3 h-3" />
                          </button>
                          <button onClick={e => e.preventDefault()} className="w-7 h-7 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/[0.38] transition-colors">
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount(c => c + 20)}
                className="font-body text-[0.82rem] font-semibold bg-transparent border border-foreground/[0.14] px-8 py-2.5 rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors"
              >
                Load More
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ExplorePage;
