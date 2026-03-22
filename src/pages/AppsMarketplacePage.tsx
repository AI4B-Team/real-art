import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Star, ChevronRight, LayoutGrid, List, Flame, Sparkles,
  Video, Image, Mic, Palette, FileText, Wrench, Eye, FolderOpen,
  Target, Camera, User, PenTool, Edit3, Bot, Layers, ArrowLeft,
  Download, Play, Filter, Check, ChevronDown,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

/* ─── Types ─── */
interface AppItem {
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  badge?: "HOT" | "NEW";
  rating: number;
  href?: string;
}

/* ─── Category icon/color maps ─── */
const catIcon: Record<string, typeof Video> = {
  "Video Tools": Video, "Image Tools": Image, "Audio Tools": Mic,
  "Design Tools": Palette, "Content Tools": FileText, "Tools": Wrench,
  "Content Intelligence": Eye, "Sales Tools": Target, "Automation Tools": Bot,
};
const catColor: Record<string, string> = {
  "Video Tools": "bg-blue-500", "Image Tools": "bg-purple-500", "Audio Tools": "bg-amber-500",
  "Design Tools": "bg-pink-500", "Content Tools": "bg-emerald-500", "Tools": "bg-foreground/60",
  "Content Intelligence": "bg-teal-500", "Sales Tools": "bg-green-500", "Automation Tools": "bg-indigo-500",
};

/* ─── App data ─── */
const trendingApps: AppItem[] = [
  { name: "Creator Vault", category: "Content Tools", description: "Your curated library of premium content collections", thumbnail: "photo-1558618666-fcd25c85cd64", badge: "HOT", rating: 4.9, href: "/create-gallery" },
  { name: "Master Closer", category: "Sales Tools", description: "AI-powered sales closing assistant", thumbnail: "photo-1556745757-8d76bdb6984b", badge: "HOT", rating: 4.8 },
  { name: "Viral Shorts", category: "Video Tools", description: "Create viral short-form video content", thumbnail: "photo-1611162618071-b39a2ec055fb", badge: "HOT", rating: 4.7 },
  { name: "Sessions", category: "Video Tools", description: "Record and manage video sessions effortlessly", thumbnail: "photo-1516321497487-e288fb19713f", badge: "NEW", rating: 4.6 },
  { name: "Digital Influencer", category: "Video Tools", description: "Generate AI-powered influencer content", thumbnail: "photo-1611162616305-c69b3fa7fbe0", badge: "HOT", rating: 4.9 },
  { name: "Resizer", category: "Image Tools", description: "Resize images and videos for any platform", thumbnail: "photo-1618005182384-a83a8bd57fbe", badge: "HOT", rating: 4.7 },
];

const topPicks: AppItem[] = [
  { name: "REAL Creator", category: "Content Tools", description: "Your all-in-one AI content creation studio", thumbnail: "photo-1633356122544-f134324a6cee", badge: "HOT", rating: 4.9, href: "/create" },
  { name: "Agents", category: "Automation Tools", description: "Create and deploy AI agents to automate workflows", thumbnail: "photo-1677442136019-21780ecad995", badge: "NEW", rating: 4.8 },
  { name: "Ghost Ink", category: "Content Tools", description: "AI ghostwriting for articles, blogs, and ebooks", thumbnail: "photo-1455390582262-044cdead277a", badge: "NEW", rating: 4.7 },
  { name: "Editor", category: "Tools", description: "Professional image, video, and audio editor", thumbnail: "photo-1611532736597-de2d4265fba3", badge: "HOT", rating: 4.8 },
  { name: "Digital Spy", category: "Content Intelligence", description: "Competitor social intelligence and content insights", thumbnail: "photo-1551288049-bebda4e38f71", badge: "NEW", rating: 4.6 },
  { name: "Transcribe", category: "Audio Tools", description: "Convert speech to text with high accuracy", thumbnail: "photo-1590602847861-f357a9332bbc", badge: "NEW", rating: 4.8 },
];

const imageApps: AppItem[] = [
  { name: "Art Blocks", category: "Image Tools", description: "Generate unique AI art blocks", thumbnail: "photo-1579783902614-a3fb3927b6a5", badge: "NEW", rating: 4.5 },
  { name: "Background Remover", category: "Image Tools", description: "Remove backgrounds from images instantly", thumbnail: "photo-1618005182384-a83a8bd57fbe", badge: "HOT", rating: 4.9 },
  { name: "Image Upscaler", category: "Image Tools", description: "Upscale images to 4K resolution", thumbnail: "photo-1516035069371-29a1b244cc32", badge: "NEW", rating: 4.7 },
  { name: "Image Enhancer", category: "Image Tools", description: "Enhance image quality with AI", thumbnail: "photo-1552168324-d612d77725e3", rating: 4.6 },
  { name: "Image Colorizer", category: "Image Tools", description: "Add color to black and white photos", thumbnail: "photo-1541701494587-cb58502866ab", badge: "NEW", rating: 4.3 },
  { name: "Image Eraser", category: "Image Tools", description: "Erase unwanted objects from photos", thumbnail: "photo-1561998338-13ad7883b20f", rating: 4.4 },
];

const videoApps: AppItem[] = [
  { name: "Sessions", category: "Video Tools", description: "Record and manage video sessions effortlessly", thumbnail: "photo-1516321497487-e288fb19713f", badge: "NEW", rating: 4.6 },
  { name: "Video Downloader", category: "Video Tools", description: "Download videos from any platform instantly", thumbnail: "photo-1611162617474-5b21e879e113", badge: "HOT", rating: 4.8 },
  { name: "Motion-Sync", category: "Video Tools", description: "Sync motion across video clips seamlessly", thumbnail: "photo-1492619375914-88005aa9e8fb", badge: "NEW", rating: 4.5 },
  { name: "Explainer Video", category: "Video Tools", description: "Create engaging explainer videos with AI", thumbnail: "photo-1485846234645-a62644f84728", rating: 4.7 },
  { name: "Viral Shorts", category: "Video Tools", description: "Create viral short-form video content", thumbnail: "photo-1611162618071-b39a2ec055fb", badge: "HOT", rating: 4.7 },
  { name: "Digital Influencer", category: "Video Tools", description: "Generate AI-powered influencer content", thumbnail: "photo-1611162616305-c69b3fa7fbe0", badge: "HOT", rating: 4.9 },
];

const audioApps: AppItem[] = [
  { name: "AI Voice Cloner", category: "Audio Tools", description: "Clone any voice with advanced AI technology", thumbnail: "photo-1478737270239-2f02b77fc618", badge: "HOT", rating: 4.8 },
  { name: "Transcribe", category: "Audio Tools", description: "Convert speech to text with high accuracy", thumbnail: "photo-1590602847861-f357a9332bbc", badge: "NEW", rating: 4.7 },
  { name: "AI Voice Changer", category: "Audio Tools", description: "Transform your voice in real-time", thumbnail: "photo-1598488035139-bdbb2231ce04", rating: 4.5 },
  { name: "AI Voiceovers", category: "Audio Tools", description: "Generate professional voiceovers instantly", thumbnail: "photo-1589903308904-1010c2294adc", badge: "NEW", rating: 4.6 },
  { name: "AI Noise Remover", category: "Audio Tools", description: "Remove background noise from audio", thumbnail: "photo-1558618666-fcd25c85cd64", badge: "HOT", rating: 4.7 },
];

const designApps: AppItem[] = [
  { name: "Logo Designer", category: "Design Tools", description: "Design professional logos with AI", thumbnail: "photo-1626785774625-ddcddc3445e9", badge: "HOT", rating: 4.6 },
  { name: "Banner Creator", category: "Design Tools", description: "Create stunning banners for any platform", thumbnail: "photo-1561070791-2526d30994b5", badge: "NEW", rating: 4.5 },
  { name: "Flyer Maker", category: "Design Tools", description: "Design eye-catching flyers quickly", thumbnail: "photo-1558655146-d09347e92766", rating: 4.4 },
  { name: "Poster Designer", category: "Design Tools", description: "Create professional posters easily", thumbnail: "photo-1561998338-13ad7883b20f", rating: 4.3 },
  { name: "Infographic Builder", category: "Design Tools", description: "Build informative infographics", thumbnail: "photo-1551288049-bebda4e38f71", badge: "NEW", rating: 4.7 },
  { name: "Presentation Maker", category: "Design Tools", description: "Create stunning presentations", thumbnail: "photo-1454165804606-c3d57bc86b40", rating: 4.5 },
];

const contentApps: AppItem[] = [
  { name: "Article Writer", category: "Content Tools", description: "Generate SEO-optimized articles", thumbnail: "photo-1504711434969-e33886168f5c", badge: "HOT", rating: 4.8 },
  { name: "Blog Writer", category: "Content Tools", description: "Write engaging blog posts with AI", thumbnail: "photo-1455390582262-044cdead277a", badge: "HOT", rating: 4.7 },
  { name: "Social Posts", category: "Content Tools", description: "Generate social media content", thumbnail: "photo-1611162616305-c69b3fa7fbe0", rating: 4.5 },
  { name: "Email Generator", category: "Content Tools", description: "Create compelling email campaigns", thumbnail: "photo-1596526131083-e8c633c948d2", badge: "NEW", rating: 4.6 },
  { name: "Ad Copy Writer", category: "Content Tools", description: "Write high-converting ad copy", thumbnail: "photo-1460925895917-afdab827c52f", rating: 4.4 },
  { name: "Script Writer", category: "Content Tools", description: "Generate scripts for any medium", thumbnail: "photo-1542435503-956c469947f6", rating: 4.5 },
  { name: "SEO Optimizer", category: "Content Tools", description: "Optimize content for search engines", thumbnail: "photo-1432888498266-38ffec3eaf0a", badge: "NEW", rating: 4.7 },
];

const toolsApps: AppItem[] = [
  { name: "Digital Spy", category: "Content Intelligence", description: "Competitor social intelligence and content insights", thumbnail: "photo-1551288049-bebda4e38f71", badge: "NEW", rating: 4.6 },
  { name: "AI Responder", category: "Tools", description: "Automate responses with AI", thumbnail: "photo-1531746790731-6c087fecd65a", badge: "HOT", rating: 4.8 },
  { name: "Master Closer", category: "Sales Tools", description: "AI-powered sales closing assistant", thumbnail: "photo-1556745757-8d76bdb6984b", badge: "HOT", rating: 4.8 },
  { name: "Versus", category: "Tools", description: "Compare AI models side by side", thumbnail: "photo-1518020382113-a7e8fc38eac9", rating: 4.5 },
  { name: "Lead Generation", category: "Sales Tools", description: "Generate quality leads automatically", thumbnail: "photo-1460925895917-afdab827c52f", badge: "NEW", rating: 4.6 },
];

const categories = ["Select All", "Image", "Video", "Audio", "Design", "Content", "Tools"];

/* ─── Helpers ─── */
const imgUrl = (id: string) => `https://images.unsplash.com/${id}?w=600&h=400&fit=crop&q=80`;

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={11} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-foreground/10"} />
    ))}
    <span className="text-[0.7rem] text-muted-foreground ml-1">({rating.toFixed(1)})</span>
  </div>
);

/* ─── App Card ─── */
const AppCard = ({ app, view }: { app: AppItem; view: "grid" | "list" }) => {
  const Icon = catIcon[app.category] || Wrench;
  const color = catColor[app.category] || "bg-foreground/60";
  const [fav, setFav] = useState(false);

  if (view === "list") {
    return (
      <div className="flex items-center gap-4 p-3 rounded-xl border border-foreground/[0.06] bg-card hover:border-foreground/[0.12] hover:shadow-sm transition-all group cursor-pointer">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
          <img src={imgUrl(app.thumbnail)} alt={app.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {app.badge === "HOT" && <div className="absolute top-1 right-1 bg-red-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Flame size={7} /></div>}
          {app.badge === "NEW" && <div className="absolute top-1 right-1 bg-amber-400 text-foreground text-[7px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Sparkles size={7} /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Icon size={15} className="text-muted-foreground shrink-0" />
            <h3 className="text-[0.88rem] font-semibold truncate">{app.name}</h3>
            <span className="text-[0.65rem] text-muted-foreground bg-foreground/[0.04] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"><Icon size={8} />{app.category}</span>
          </div>
          <p className="text-[0.78rem] text-muted-foreground line-clamp-1">{app.description}</p>
          <RatingStars rating={app.rating} />
        </div>
        <button onClick={e => { e.stopPropagation(); setFav(v => !v); }} className={`p-1.5 rounded-full transition-all shrink-0 ${fav ? "bg-amber-500 text-white" : "bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
          <Star size={13} className={fav ? "fill-current" : ""} />
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-[0.78rem] font-bold hover:bg-emerald-600 transition-colors">
            <Download size={12} /> Install
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-foreground/[0.06] hover:border-foreground/[0.14] hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={imgUrl(app.thumbnail)} alt={app.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[0.6rem] font-medium px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
          <Icon size={9} />{app.category}
        </div>
        {app.badge === "HOT" && <div className="absolute top-3 right-3 bg-red-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Flame size={9} />HOT</div>}
        {app.badge === "NEW" && <div className="absolute top-3 right-3 bg-amber-400 text-foreground text-[0.6rem] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={9} />NEW</div>}
        <button onClick={e => { e.stopPropagation(); setFav(v => !v); }} className={`absolute bottom-3 right-3 p-1.5 rounded-full transition-all ${fav ? "bg-amber-500 text-white" : "bg-black/50 text-white opacity-0 group-hover:opacity-100"} hover:scale-110`}>
          <Star size={13} className={fav ? "fill-current" : ""} />
        </button>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={16} className="text-muted-foreground shrink-0" />
          <h3 className="text-[0.88rem] font-semibold">{app.name}</h3>
        </div>
        <p className="text-[0.75rem] text-muted-foreground mb-2 line-clamp-2 flex-grow">{app.description}</p>
        <RatingStars rating={app.rating} />
      </div>
    </div>
  );
};

/* ─── Section ─── */
const Section = ({ title, apps, view }: { title: string; apps: AppItem[]; view: "grid" | "list" }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? apps : apps.slice(0, 6);
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[1.2rem] font-black tracking-tight uppercase">{title}</h2>
        <button onClick={() => setExpanded(v => !v)} className="text-accent hover:text-accent/80 text-[0.82rem] font-semibold flex items-center gap-1 transition-colors">
          {expanded ? "Show Less" : "See All"} <ChevronRight size={16} />
        </button>
      </div>
      <div className={view === "list" ? "flex flex-col gap-3" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"}>
        {shown.map((app, i) => <AppCard key={i} app={app} view={view} />)}
      </div>
    </section>
  );
};

/* ─── Page ─── */
const AppsMarketplacePage = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"marketplace" | "my-apps">("marketplace");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCat, setSelectedCat] = useState("Select All");

  const filterApps = (apps: AppItem[]) => {
    let result = apps;
    if (selectedCat !== "Select All") result = result.filter(a => a.category.toLowerCase().includes(selectedCat.toLowerCase()));
    if (search) result = result.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
    return result;
  };

  return (
    <PageShell>
      <div className="px-6 md:px-12 py-10 max-w-[1440px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-6">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">Apps</span>
        </div>

        {/* Header */}
        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-2">Apps</h1>
            <p className="text-[0.92rem] text-muted max-w-none whitespace-nowrap">Discover, install, and manage powerful AI-powered tools for your creative workflow.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search apps..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-card border border-foreground/[0.08] text-[0.88rem] font-body outline-none focus:border-accent/40 transition-colors"
              />
            </div>
            <div className="flex items-center bg-foreground/[0.04] rounded-lg p-0.5 shrink-0">
              <button onClick={() => setViewMode("grid")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}><LayoutGrid size={14} /></button>
              <button onClick={() => setViewMode("list")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}><List size={14} /></button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab("marketplace")} className={`px-5 py-2 rounded-lg text-[0.82rem] font-semibold border transition-all ${activeTab === "marketplace" ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"}`}>
                Marketplace
              </button>
              <button onClick={() => setActiveTab("my-apps")} className={`px-5 py-2 rounded-lg text-[0.82rem] font-semibold border transition-all ${activeTab === "my-apps" ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"}`}>
                My Apps
              </button>
          </div>
          {/* Filter dropdown — far right */}
          <Popover>
            <PopoverTrigger asChild>
              <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[0.82rem] font-medium border transition-all ${selectedCat !== "Select All" ? "bg-accent/10 text-accent border-accent/20" : "border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"}`}>
                <Filter size={14} />
                {selectedCat !== "Select All" ? selectedCat : "Filter"}
                <ChevronDown size={12} className="opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1.5" align="end" side="bottom" avoidCollisions={false} sideOffset={6}>
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => setSelectedCat(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[0.82rem] font-medium transition-colors ${selectedCat === cat ? "bg-foreground text-primary-foreground" : "hover:bg-foreground/[0.04] text-foreground"}`}>
                  {cat}{selectedCat === cat && <Check size={12} />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {activeTab === "marketplace" ? (
          <>
            {/* Trending */}
            <Section title="🔥 Trending Apps" apps={filterApps(trendingApps)} view={viewMode} />

            {/* Top Picks */}
            <Section title="⭐ Top Picks" apps={filterApps(topPicks)} view={viewMode} />

            {/* Categorized */}
            <Section title="Image Apps" apps={filterApps(imageApps)} view={viewMode} />
            <Section title="Video Apps" apps={filterApps(videoApps)} view={viewMode} />
            <Section title="Audio Apps" apps={filterApps(audioApps)} view={viewMode} />
            <Section title="Design Apps" apps={filterApps(designApps)} view={viewMode} />
            <Section title="Content Apps" apps={filterApps(contentApps)} view={viewMode} />
            <Section title="Tools" apps={filterApps(toolsApps)} view={viewMode} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">No Apps Installed Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Browse the marketplace to discover and install apps for your workflow.</p>
            <button onClick={() => setActiveTab("marketplace")} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-primary-foreground text-[0.88rem] font-bold hover:bg-accent transition-colors">
              <FolderOpen size={16} /> Browse Marketplace
            </button>
          </div>
        )}
      </div>
      <Footer />
    </PageShell>
  );
};

export default AppsMarketplacePage;
