import { Link } from "react-router-dom";
import { TrendingUp, Download, Eye, RefreshCw, Star, ChevronRight } from "lucide-react";

const trendingCreators = [
  { id: "1", name: "AI.Verse", init: "AV", color: "#4361ee", followers: "12.4K", downloads: "4.2M", change: "+2.4K this week", badges: ["🏆", "🔥"] },
  { id: "2", name: "NeoPixel", init: "NP", color: "#c9184a", followers: "9.8K", downloads: "2.8M", change: "+1.8K this week", badges: ["🔥"] },
  { id: "3", name: "DreamForge", init: "DF", color: "#2a9d8f", followers: "7.3K", downloads: "1.9M", change: "+1.2K this week", badges: ["🎨"] },
  { id: "4", name: "LuminaAI", init: "LA", color: "#e76f51", followers: "5.9K", downloads: "1.1M", change: "+980 this week", badges: [] },
  { id: "5", name: "SpectraGen", init: "SG", color: "#7b2d8b", followers: "4.7K", downloads: "890K", change: "+740 this week", badges: [] },
];

const imageOfWeek = {
  photo: "photo-1618005182384-a83a8bd57fbe",
  title: "Cosmic Dreamscape",
  creator: { id: "1", name: "AI.Verse", init: "AV", color: "#4361ee" },
  downloads: "24,000",
  recreations: "1,800",
  views: "148,000",
};

const TrendingCreatorsSection = () => {
  return (
    <section className="px-6 md:px-12 py-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Trending Creators */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Rising Fast</span>
          </div>
          <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-5">Trending Creators</h2>
          <div className="flex flex-col gap-3">
            {trendingCreators.map((cr, i) => (
              <Link key={cr.id} to={`/creator/${cr.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all no-underline group">
                <span className="font-display text-[1rem] font-black text-muted/30 w-6 text-center">{i + 1}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[0.75rem] font-bold text-primary-foreground shrink-0" style={{ background: cr.color }}>
                  {cr.init}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[0.88rem] group-hover:text-accent transition-colors">{cr.name}</span>
                    {cr.badges.map(b => <span key={b} className="text-xs">{b}</span>)}
                  </div>
                  <div className="text-[0.72rem] text-muted">{cr.followers} followers · {cr.downloads} downloads</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[0.72rem] text-green-500 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {cr.change}
                  </div>
                </div>
              </Link>
            ))}
            <Link to="/leaderboard" className="text-[0.82rem] text-accent font-semibold hover:underline flex items-center gap-1 mt-1">
              View Full Leaderboard <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Image of the Week */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Weekly Spotlight</span>
          </div>
          <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-5">Image of the Week</h2>
          <Link to="/image/0" className="block no-underline group">
            <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all">
              <div className="relative h-[280px] overflow-hidden">
                <img
                  src={`https://images.unsplash.com/${imageOfWeek.photo}?w=600&h=280&fit=crop&q=80`}
                  alt={imageOfWeek.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-accent text-primary-foreground text-[0.65rem] font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary-foreground" /> Image of the Week
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-[1.3rem] font-black mb-2">{imageOfWeek.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-primary-foreground" style={{ background: imageOfWeek.creator.color }}>
                    {imageOfWeek.creator.init}
                  </div>
                  <span className="text-[0.8rem] text-muted">by {imageOfWeek.creator.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-display font-black text-[1.2rem] tracking-[-0.02em]">{imageOfWeek.downloads}</div>
                    <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em] flex items-center gap-1"><Download className="w-3 h-3" /> downloads</div>
                  </div>
                  <div>
                    <div className="font-display font-black text-[1.2rem] tracking-[-0.02em]">{imageOfWeek.recreations}</div>
                    <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em] flex items-center gap-1"><RefreshCw className="w-3 h-3" /> recreations</div>
                  </div>
                  <div>
                    <div className="font-display font-black text-[1.2rem] tracking-[-0.02em]">{imageOfWeek.views}</div>
                    <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em] flex items-center gap-1"><Eye className="w-3 h-3" /> views</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingCreatorsSection;
