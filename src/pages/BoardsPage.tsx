import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Search, TrendingUp, Users, Bookmark, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const trendingBoards = [
  { id: "1", title: "Cyberpunk Cities", creator: "VoidArt", creatorColor: "#023e8a", creatorInit: "VA", followers: "1,248", images: 128, cover: "photo-1557682250-33bd709cbe85" },
  { id: "2", title: "Surreal Dreamscapes", creator: "DreamForge", creatorColor: "#2a9d8f", creatorInit: "DF", followers: "892", images: 94, cover: "photo-1579546929518-9e396f3cc809" },
  { id: "3", title: "Dark Fantasy", creator: "NeoPixel", creatorColor: "#c9184a", creatorInit: "NP", followers: "1,034", images: 156, cover: "photo-1541701494587-cb58502866ab" },
  { id: "4", title: "Abstract Minimalism", creator: "ChromaLab", creatorColor: "#f4a261", creatorInit: "CL", followers: "674", images: 82, cover: "photo-1618005182384-a83a8bd57fbe" },
  { id: "5", title: "Cosmic Visions", creator: "AI.Verse", creatorColor: "#4361ee", creatorInit: "AV", followers: "2,118", images: 241, cover: "photo-1462275646964-a0e3386b89fa" },
  { id: "6", title: "Neon Portraits", creator: "LuminaAI", creatorColor: "#e76f51", creatorInit: "LA", followers: "561", images: 67, cover: "photo-1547036967-23d11aacaee0" },
  { id: "7", title: "Nature Reimagined", creator: "SpectraGen", creatorColor: "#7b2d8b", creatorInit: "SG", followers: "723", images: 109, cover: "photo-1470071459604-3b5ec3a7fe05" },
  { id: "8", title: "Retro Futurism", creator: "Synthetix", creatorColor: "#06d6a0", creatorInit: "SX", followers: "498", images: 73, cover: "photo-1518020382113-a7e8fc38eac9" },
  { id: "9", title: "Liquid Metal", creator: "AI.Verse", creatorColor: "#4361ee", creatorInit: "AV", followers: "1,390", images: 88, cover: "photo-1558618666-fcd25c85cd64" },
];

const categories = ["All", "Trending", "Most Followed", "Newest", "AI Art", "Photography", "3D"];

const BoardsPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = trendingBoards.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.creator.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="px-6 md:px-12 py-10 max-w-[1440px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-6">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">Boards</span>
          </div>

          {/* Header */}
          <div className="flex items-start md:items-center justify-between gap-4 flex-wrap mb-8">
            <div>
              <h1 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] font-black tracking-[-0.03em] leading-none mb-2">
                Explore Boards
              </h1>
              <p className="text-[0.92rem] text-muted max-w-[480px]">
                Curated collections by creators. Discover, follow, and get inspired by themed boards.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search boards..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-card border border-foreground/[0.08] text-[0.88rem] font-body outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline shrink-0 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Create Board
              </Link>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`border px-4 py-1.5 rounded-lg text-[0.79rem] font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Trending banner */}
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-muted">Trending Boards</span>
          </div>

          {/* Board grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {filtered.map(board => (
              <Link
                key={board.id}
                to={`/boards/${board.id}`}
                className="group block no-underline"
              >
                <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all hover:-translate-y-1">
                  {/* Cover image */}
                  <div className="relative h-[200px] overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/${board.cover}?w=600&h=200&fit=crop&q=80`}
                      alt={board.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-display text-[1.3rem] font-black text-primary-foreground leading-tight">{board.title}</h3>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-primary-foreground"
                          style={{ background: board.creatorColor }}
                        >
                          {board.creatorInit}
                        </div>
                        <span className="text-[0.8rem] text-muted">by {board.creator}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[0.75rem] text-muted">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {board.followers} followers</span>
                      <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" /> {board.images} images</span>
                    </div>
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

export default BoardsPage;
