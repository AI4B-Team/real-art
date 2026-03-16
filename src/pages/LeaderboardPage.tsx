import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Trophy, TrendingUp, Download, Heart, Eye } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const periods = ["This Month", "This Week", "All Time"];
const categories = ["Overall", "Downloads", "Likes", "Views", "Challenges Won"];

const allCreators = [
  { rank: 1, name: "AI.Verse", handle: "@aiverse", init: "AV", color: "#4361ee", pts: "48,200", dl: "12.4K", likes: "34.2K", views: "892K", wins: 5, change: "up" },
  { rank: 2, name: "NeoPixel", handle: "@neopixel", init: "NP", color: "#c9184a", pts: "41,800", dl: "10.9K", likes: "28.7K", views: "641K", wins: 3, change: "up" },
  { rank: 3, name: "DreamForge", handle: "@dreamforge", init: "DF", color: "#2a9d8f", pts: "37,100", dl: "9.8K", likes: "25.3K", views: "1.1M", wins: 7, change: "same" },
  { rank: 4, name: "LuminaAI", handle: "@luminaai", init: "LA", color: "#e76f51", pts: "29,400", dl: "7.3K", likes: "19.8K", views: "524K", wins: 2, change: "up" },
  { rank: 5, name: "SpectraGen", handle: "@spectragen", init: "SG", color: "#7b2d8b", pts: "24,600", dl: "5.9K", likes: "16.1K", views: "389K", wins: 1, change: "down" },
  { rank: 6, name: "VoidArt", handle: "@voidart", init: "VA", color: "#023e8a", pts: "19,800", dl: "4.7K", likes: "12.4K", views: "298K", wins: 0, change: "up" },
  { rank: 7, name: "ChromaLab", handle: "@chromalab", init: "CL", color: "#f4a261", pts: "17,200", dl: "4.1K", likes: "10.8K", views: "241K", wins: 1, change: "same" },
  { rank: 8, name: "Synthetix", handle: "@synthetix", init: "SX", color: "#06d6a0", pts: "15,600", dl: "3.8K", likes: "9.4K", views: "218K", wins: 0, change: "down" },
  { rank: 9, name: "PixelDrift", handle: "@pixeldrift", init: "PD", color: "#7209b7", pts: "12,900", dl: "3.2K", likes: "7.9K", views: "181K", wins: 0, change: "up" },
  { rank: 10, name: "NovaMind", handle: "@novamind", init: "NM", color: "#48cae4", pts: "11,400", dl: "2.8K", likes: "6.7K", views: "159K", wins: 0, change: "same" },
  { rank: 11, name: "AuraFX", handle: "@aurafxart", init: "AF", color: "#e63946", pts: "9,800", dl: "2.4K", likes: "5.9K", views: "134K", wins: 0, change: "up" },
  { rank: 12, name: "GridGhost", handle: "@gridghost", init: "GG", color: "#457b9d", pts: "8,600", dl: "2.1K", likes: "5.1K", views: "114K", wins: 0, change: "down" },
  { rank: 13, name: "MirrorAI", handle: "@mirrorai", init: "MA", color: "#6d6875", pts: "7,700", dl: "1.9K", likes: "4.6K", views: "98K", wins: 0, change: "up" },
  { rank: 14, name: "Halcyon", handle: "@halcyonart", init: "HA", color: "#2b9348", pts: "6,900", dl: "1.7K", likes: "4.1K", views: "87K", wins: 0, change: "same" },
  { rank: 15, name: "FractaLab", handle: "@fractalab", init: "FL", color: "#ba4a00", pts: "6,100", dl: "1.5K", likes: "3.6K", views: "76K", wins: 0, change: "up" },
];

const podium = allCreators.slice(0, 3);

const rankBadge = (rank: number) => {
  if (rank === 1) return "bg-[#FFD700] text-[#5a3c00]";
  if (rank === 2) return "bg-[#D8D8D8] text-[#333]";
  if (rank === 3) return "bg-[#CD7F32] text-[#3a1800]";
  return "";
};

const changeIcon = (change: string) => {
  if (change === "up") return <span className="text-green-500 text-[0.75rem] font-semibold">↑</span>;
  if (change === "down") return <span className="text-red-400 text-[0.75rem] font-semibold">↓</span>;
  return <span className="text-muted text-[0.75rem]">—</span>;
};

const LeaderboardPage = () => {
  const [activePeriod, setActivePeriod] = useState("This Month");
  const [activeCategory, setActiveCategory] = useState("Overall");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="px-6 md:px-12 py-10 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-6">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">Leaderboard</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-[3.2rem] font-black tracking-[-0.03em] leading-none mb-2">Leaderboard</h1>
              <p className="text-[0.88rem] text-muted">The top creators on REAL ART ranked by downloads, likes, and engagement.</p>
            </div>
            <div className="flex items-center gap-1 bg-card border border-foreground/[0.1] rounded-xl p-1">
              {periods.map(p => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-4 py-2 rounded-lg text-[0.8rem] font-medium transition-colors ${activePeriod === p ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Podium */}
        <div className="px-6 md:px-12 mb-10">
          <div className="bg-foreground rounded-2xl p-8 relative overflow-hidden max-w-[1440px] mx-auto">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
            <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/30 mb-6 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-accent" /> Top 3 — {activePeriod}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {podium.map((creator, i) => (
                <Link key={creator.rank} to={`/creator/${creator.rank}`} className="block no-underline">
                  <div className={`rounded-xl p-5 text-center transition-transform cursor-pointer hover:-translate-y-1 ${i === 0 ? "bg-primary-foreground/10 border border-accent/30" : "bg-primary-foreground/[0.05]"}`}>
                    <div className="relative inline-block mb-3">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-[1rem] font-bold text-white mx-auto" style={{ background: creator.color }}>
                        {creator.init}
                      </div>
                      {i === 0 && <div className="absolute -top-2 -right-2 text-lg">👑</div>}
                    </div>
                    <div className={`font-bold text-[0.75rem] px-2.5 py-0.5 rounded-full inline-block mb-2 ${rankBadge(creator.rank)}`}>
                      #{creator.rank}
                    </div>
                    <div className="font-semibold text-primary-foreground text-[0.88rem]">{creator.name}</div>
                    <div className="text-[0.72rem] text-primary-foreground/40 mb-3">{creator.handle}</div>
                    <div className="font-display font-black text-[1.5rem] tracking-[-0.02em] text-primary-foreground leading-none">{creator.pts}</div>
                    <div className="text-[0.65rem] text-primary-foreground/30 uppercase tracking-[0.1em]">Points</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 md:px-12 max-w-[1440px] mx-auto pb-16">
          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-5">
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

          {/* Full table */}
          <div className="bg-card border border-foreground/[0.08] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[44px_1fr_100px_100px_100px_100px_80px] gap-3 px-5 py-3.5 border-b border-foreground/[0.06] text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">
              <div>#</div>
              <div>Creator</div>
              <div className="text-right flex items-center justify-end gap-1"><Download className="w-3 h-3" /> Downloads</div>
              <div className="text-right flex items-center justify-end gap-1"><Heart className="w-3 h-3" /> Likes</div>
              <div className="text-right flex items-center justify-end gap-1"><Eye className="w-3 h-3" /> Views</div>
              <div className="text-right flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" /> Points</div>
              <div></div>
            </div>
            {/* Rows */}
            {allCreators.map((creator, i) => (
              <Link key={creator.rank} to={`/creator/${creator.rank}`} className="block no-underline">
                <div className={`grid grid-cols-[44px_1fr_100px_100px_100px_100px_80px] gap-3 px-5 py-4 border-b border-foreground/[0.04] last:border-none hover:bg-foreground/[0.02] transition-colors ${i < 3 ? "bg-accent/[0.02]" : ""}`}>
                  <div className="flex items-center">
                    {rankBadge(creator.rank) ? (
                      <span className={`text-[0.7rem] font-bold w-7 h-7 rounded-full flex items-center justify-center ${rankBadge(creator.rank)}`}>
                        {creator.rank}
                      </span>
                    ) : (
                      <span className="font-display text-[1rem] font-black text-muted/40 w-7 text-center">{creator.rank}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.72rem] font-bold text-white shrink-0" style={{ background: creator.color }}>
                      {creator.init}
                    </div>
                    <div>
                      <div className="font-semibold text-[0.88rem]">{creator.name}</div>
                      <div className="text-[0.73rem] text-muted">{creator.handle}</div>
                    </div>
                    <div className="ml-1">{changeIcon(creator.change)}</div>
                  </div>
                  <div className="text-right text-[0.82rem] font-medium self-center">{creator.dl}</div>
                  <div className="text-right text-[0.82rem] font-medium self-center">{creator.likes}</div>
                  <div className="text-right text-[0.82rem] font-medium self-center">{creator.views}</div>
                  <div className="text-right font-display font-black text-[1rem] text-accent self-center">{creator.pts.split(",")[0]}K</div>
                  <div></div>
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

export default LeaderboardPage;
