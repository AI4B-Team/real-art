import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users, Lock, ArrowLeft, ChevronRight, Plus } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const comPhotos = [
  "photo-1618005182384-a83a8bd57fbe","photo-1557682250-33bd709cbe85",
  "photo-1604881991720-f91add269bed","photo-1501854140801-50d01698950b",
  "photo-1579546929518-9e396f3cc809","photo-1500462918059-b1a0cb512f1d",
  "photo-1518770660439-4636190af475","photo-1549880338-65ddcdfd017b",
  "photo-1558618666-fcd25c85cd64","photo-1543722530-d2c3201371e7",
  "photo-1547036967-23d11aacaee0","photo-1576091160550-2173dba999ef",
];

const communities = [
  { id: "1", name: "Avatar Architects", desc: "Master avatar and digital portrait creation. Premium prompt library inside.", members: 2840, free: false, category: "Portraits", owner: "LuminaAI", ownerColor: "#e76f51", ownerInit: "LA" },
  { id: "2", name: "Abstract Minds", desc: "Pushing the boundaries of abstract visuals. Open community, weekly drops and challenges.", members: 5120, free: true, category: "Abstract", owner: "SpectraGen", ownerColor: "#7b2d8b", ownerInit: "SG" },
  { id: "3", name: "Neon Futures", desc: "Cyberpunk visions of tomorrow. Join the movement and create the future of urban art.", members: 3670, free: true, category: "Cyberpunk", owner: "NeoPixel", ownerColor: "#c9184a", ownerInit: "NP" },
  { id: "4", name: "Forest & Earth", desc: "Nature and organic imagery. A peaceful, beautiful corner of the platform.", members: 1980, free: true, category: "Nature", owner: "DreamForge", ownerColor: "#2a9d8f", ownerInit: "DF" },
  { id: "5", name: "PromptVault Pro", desc: "Exclusive prompt library for serious creators. Thousands of tested, production-ready prompts.", members: 890, free: false, category: "Prompts", owner: "AI.Verse", ownerColor: "#4361ee", ownerInit: "AV" },
  { id: "6", name: "Dreamweavers", desc: "Surrealist and dream-world imagery. The stranger the better — no limits here.", members: 4210, free: true, category: "Surreal", owner: "VoidArt", ownerColor: "#023e8a", ownerInit: "VA" },
  { id: "7", name: "Fashion Forward", desc: "AI fashion photography, editorial looks, and runway concepts. Style has no limits.", members: 2100, free: true, category: "Fashion", owner: "ChromaLab", ownerColor: "#f4a261", ownerInit: "CL" },
  { id: "8", name: "Sci-Fi Worlds", desc: "Deep space, alien civilizations, and futures we can only imagine. Come build them.", members: 3340, free: true, category: "Sci-Fi", owner: "Synthetix", ownerColor: "#06d6a0", ownerInit: "SX" },
  { id: "9", name: "Luxury & Lifestyle", desc: "Premium aesthetics, opulent environments and aspirational visuals. Members only.", members: 1560, free: false, category: "Luxury", owner: "LuminaAI", ownerColor: "#e76f51", ownerInit: "LA" },
  { id: "10", name: "Minimal Masters", desc: "Less is more. Clean lines, negative space, and the power of simplicity.", members: 2780, free: true, category: "Minimal", owner: "VoidArt", ownerColor: "#023e8a", ownerInit: "VA" },
  { id: "11", name: "Portrait Studio", desc: "Human faces, expressions, and the art of the digital portrait. Join 2K+ portrait artists.", members: 2020, free: true, category: "Portraits", owner: "NeoPixel", ownerColor: "#c9184a", ownerInit: "NP" },
  { id: "12", name: "Architecture Lab", desc: "Built environments, impossible structures, and the cities of tomorrow.", members: 1740, free: false, category: "Architecture", owner: "AI.Verse", ownerColor: "#4361ee", ownerInit: "AV" },
];

const categories = ["All", "Abstract", "Portraits", "Cyberpunk", "Nature", "Fashion", "Sci-Fi", "Luxury", "Minimal", "Architecture", "Surreal", "Prompts"];
const sortOptions = ["Most Members", "Newest", "Most Active"];

const CommunitiesPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [sort, setSort] = useState("Most Members");

  const filtered = communities
    .filter(c => activeCategory === "All" || c.category === activeCategory)
    .filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.desc.toLowerCase().includes(query.toLowerCase()))
    .filter(c => !showFreeOnly || c.free)
    .sort((a, b) => sort === "Most Members" ? b.members - a.members : 0);

  return (
    <PageShell>
        {/* Header */}
        <div className="px-6 md:px-12 py-10 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-6">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">Communities</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
            <div>
              <h1 className="font-display text-[3.2rem] font-black tracking-[-0.03em] leading-none mb-2">Communities</h1>
              <p className="text-[0.88rem] text-muted">Public collections and private vaults. Find your people.</p>
            </div>
            <Link to="/create-gallery">
              <button className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
                <Plus className="w-4 h-4" /> Create Collection
              </button>
            </Link>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-card border border-foreground/[0.12] rounded-xl px-4 h-10 flex-1 min-w-[220px] focus-within:border-foreground transition-colors">
              <Search className="w-3.5 h-3.5 text-muted shrink-0" />
              <input
                className="flex-1 border-none outline-none font-body text-[0.88rem] bg-transparent"
                placeholder="Search communities…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className={`flex items-center gap-2 px-4 h-10 rounded-xl border text-[0.82rem] font-medium transition-colors ${showFreeOnly ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.12] hover:border-foreground/30"}`}
            >
              Free Only
            </button>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 h-10 rounded-xl border border-foreground/[0.12] text-[0.82rem] font-medium bg-card hover:border-foreground/30 transition-colors outline-none cursor-pointer"
            >
              {sortOptions.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`border px-4 py-1.5 rounded-md text-[0.79rem] font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="px-6 md:px-12 pb-16 max-w-[1440px] mx-auto">
          <div className="text-[0.8rem] text-muted mb-5">{filtered.length} communities</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((com, i) => (
              <Link key={com.id} to={`/communities/${com.id}`} className="block no-underline">
                <div className="bg-card border border-foreground/[0.08] rounded-[18px] overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(0,0,0,0.1)] transition-all h-full">
                  <div className="h-[130px] relative">
                    <img
                      src={`https://images.unsplash.com/${comPhotos[i % comPhotos.length]}?w=500&h=260&fit=crop&q=78`}
                      alt={com.name}
                      loading="lazy"
                      className="w-full h-full object-cover block"
                    />
                    <span className={`absolute bottom-2.5 left-3 text-[0.65rem] font-bold px-2.5 py-[3px] rounded-md tracking-[0.06em] uppercase ${com.free ? "bg-[rgba(15,180,90,0.9)] text-white" : "bg-black/70 text-white/80"}`}>
                      {com.free ? "Free" : "Private"}
                    </span>
                    <span className="absolute top-2.5 right-3 text-[0.68rem] font-semibold text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {com.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-bold text-[0.92rem] leading-tight">{com.name}</div>
                      {!com.free && <Lock className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />}
                    </div>
                    <div className="text-[0.78rem] text-muted leading-[1.55] mb-3 line-clamp-2">{com.desc}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white" style={{ background: com.ownerColor }}>
                          {com.ownerInit}
                        </div>
                        <span className="text-[0.74rem] text-muted">{com.owner}</span>
                        <span className="text-[0.74rem] text-muted">·</span>
                        <span className="text-[0.74rem] text-muted flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {com.members.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={e => e.preventDefault()}
                        className="text-[0.76rem] font-bold px-3.5 py-[6px] rounded-lg border-none cursor-pointer bg-foreground text-primary-foreground hover:bg-accent transition-colors"
                      >
                        Join Now
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="font-display text-[2rem] font-black tracking-[-0.03em] mb-3">No communities found</div>
              <p className="text-muted text-[0.88rem]">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
        <Footer />
    </PageShell>
  );
};

export default CommunitiesPage;
