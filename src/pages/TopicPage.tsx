import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Download, Sparkles, ArrowLeft, ChevronRight, Eye, Copy, Check,
  Users, Bookmark, RefreshCw, Layout, TrendingUp
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import ImageCardOverlay from "@/components/ImageCardOverlay";

/* ── Topic data (would come from API in production) ── */
const topicData: Record<string, {
  title: string; description: string; longTitle: string;
  seoArticle: { heading: string; paragraphs: string[] }[];
  stats: { images: string; downloads: string; creators: string };
}> = {
  cyberpunk: {
    title: "Cyberpunk",
    longTitle: "Cyberpunk Images",
    description: "Free AI-generated cyberpunk visuals you can download or recreate. Neon cities, rain-soaked streets, and holographic futures.",
    stats: { images: "12,400+", downloads: "3.2M", creators: "840" },
    seoArticle: [
      { heading: "What is Cyberpunk Art?", paragraphs: ["Cyberpunk art draws from a dystopian future aesthetic — neon-lit megacities, augmented humans, and rain-drenched streets. Originating from the literary genre popularized by William Gibson and Philip K. Dick, cyberpunk visuals have become one of the most requested styles in AI-generated art.", "On REAL ART, cyberpunk images are free to download and use commercially. Every image includes a prompt you can remix in REAL CREATOR to build your own version."] },
      { heading: "How to Create Cyberpunk AI Images", paragraphs: ["Start with a strong base prompt like \"cyberpunk city at night, neon signs, rain-soaked pavement.\" Add modifiers for lighting (\"volumetric fog\", \"neon glow\"), camera angle (\"wide shot\", \"street level\"), and detail level (\"8K\", \"ultra-detailed\").", "Use the \"Steal This Style\" feature on any cyberpunk image to preload the exact settings into REAL CREATOR. This is the fastest way to start generating professional cyberpunk art."] },
      { heading: "Popular Cyberpunk Styles", paragraphs: ["The most popular sub-styles include Neon Noir (dark alleys with single-color neon), Cyber Tokyo (Japanese-inspired megacity), Blade Runner (industrial haze with amber lighting), and Synthwave Retro (80s-inspired gradients with chrome elements).", "Each style has its own dedicated topic page and prompt library on REAL ART."] },
    ],
  },
  "luxury-homes": {
    title: "Luxury Homes",
    longTitle: "Luxury Home Images",
    description: "Free AI-generated luxury interior and exterior visuals. Modern mansions, penthouses, and designer spaces.",
    stats: { images: "8,200+", downloads: "1.8M", creators: "420" },
    seoArticle: [
      { heading: "What is Luxury Home Art?", paragraphs: ["AI-generated luxury home imagery brings architectural dreams to life — from minimalist Japanese villas to ultra-modern glass penthouses. These images are used by interior designers, real estate marketers, and content creators worldwide.", "Every image on REAL ART is free for commercial use, making it the perfect resource for presentations, mood boards, and social content."] },
      { heading: "How to Create Luxury Home AI Images", paragraphs: ["Focus on key elements: natural lighting, high-end materials (marble, wood, glass), and composition. Prompts like \"luxury modern living room, floor-to-ceiling windows, ocean view, warm lighting\" produce stunning results.", "Use REAL CREATOR's style transfer to apply a specific architectural aesthetic to any base image."] },
    ],
  },
  dreamscapes: {
    title: "Dreamscapes",
    longTitle: "Dreamscape Images",
    description: "Free surreal and ethereal AI-generated landscapes. Floating islands, impossible geometry, and otherworldly atmospheres.",
    stats: { images: "15,800+", downloads: "4.1M", creators: "1,200" },
    seoArticle: [
      { heading: "What is Dreamscape Art?", paragraphs: ["Dreamscape art blurs the line between reality and imagination. Think floating islands above cloud oceans, staircases that lead to nowhere, and landscapes that shift between seasons in a single frame.", "AI has unlocked a new era of dreamscape creation, allowing artists to manifest scenes that would be impossible to photograph or paint traditionally."] },
      { heading: "How to Create Dreamscape AI Images", paragraphs: ["Combine contradictory elements: \"underwater forest with sunlight filtering through\", \"desert landscape with aurora borealis\". Add atmosphere modifiers like \"ethereal fog\", \"golden hour\", \"bioluminescent\" to push the surreal quality.", "The best dreamscapes layer 2-3 unexpected elements together with a cohesive lighting scheme."] },
    ],
  },
};

const fallbackTopic = {
  title: "AI Art",
  longTitle: "AI Art Images",
  description: "Free AI-generated visuals you can download or recreate. Browse thousands of styles and prompts.",
  stats: { images: "84,000+", downloads: "12M", creators: "4,200" },
  seoArticle: [
    { heading: "What is AI Art?", paragraphs: ["AI art uses machine learning models to generate images from text prompts. On REAL ART, every image is free to download and use commercially."] },
  ],
};

const topicPhotos: Record<string, string[]> = {
  cyberpunk: ["photo-1557682250-33bd709cbe85", "photo-1579546929518-9e396f3cc809", "photo-1541701494587-cb58502866ab", "photo-1518020382113-a7e8fc38eac9", "photo-1547036967-23d11aacaee0", "photo-1604881991720-f91add269bed", "photo-1558618666-fcd25c85cd64", "photo-1576091160550-2173dba999ef", "photo-1462275646964-a0e3386b89fa", "photo-1543722530-d2c3201371e7", "photo-1505765050516-f72dcac9c60e", "photo-1533158628620-7e4d0a003147"],
  "luxury-homes": ["photo-1618005182384-a83a8bd57fbe", "photo-1549880338-65ddcdfd017b", "photo-1506905925346-21bda4d32df4", "photo-1501854140801-50d01698950b", "photo-1470071459604-3b5ec3a7fe05", "photo-1465146344425-f00d5f5c8f07", "photo-1500462918059-b1a0cb512f1d", "photo-1543722530-d2c3201371e7"],
  dreamscapes: ["photo-1579546929518-9e396f3cc809", "photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64", "photo-1549880338-65ddcdfd017b", "photo-1541701494587-cb58502866ab", "photo-1506905925346-21bda4d32df4", "photo-1501854140801-50d01698950b", "photo-1576091160550-2173dba999ef", "photo-1462275646964-a0e3386b89fa", "photo-1470071459604-3b5ec3a7fe05"],
};

const defaultPhotos = ["photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64", "photo-1541701494587-cb58502866ab", "photo-1549880338-65ddcdfd017b", "photo-1557682250-33bd709cbe85", "photo-1506905925346-21bda4d32df4", "photo-1518020382113-a7e8fc38eac9", "photo-1547036967-23d11aacaee0"];

const topicPrompts: Record<string, { text: string; uses: string }[]> = {
  cyberpunk: [
    { text: "Cyberpunk neon city at night, rain-soaked streets, holographic billboards, cinematic lighting", uses: "4.2K" },
    { text: "Futuristic Tokyo skyline, flying cars, massive skyscrapers, volumetric fog, 8k", uses: "3.1K" },
    { text: "Dark cyberpunk alley, single neon sign, puddles reflecting light, moody atmosphere", uses: "2.8K" },
    { text: "Neon cyberpunk portrait, augmented reality visor, glowing circuit patterns on skin", uses: "2.4K" },
    { text: "Cyberpunk marketplace, crowded street vendors, holographic signs, steam rising", uses: "1.9K" },
    { text: "Abandoned cyberpunk subway station, overgrown with neon plants, bioluminescent", uses: "1.6K" },
  ],
  "luxury-homes": [
    { text: "Modern luxury living room, floor-to-ceiling windows, ocean view, warm natural lighting", uses: "3.8K" },
    { text: "Minimalist Japanese luxury villa, zen garden, clean lines, morning light", uses: "2.6K" },
    { text: "Ultra-modern penthouse bedroom, city skyline view, ambient lighting, marble accents", uses: "2.1K" },
    { text: "Luxury infinity pool overlooking mountains, sunset, contemporary architecture", uses: "1.9K" },
  ],
  dreamscapes: [
    { text: "Floating islands above cloud oceans, waterfalls cascading into void, golden hour", uses: "5.1K" },
    { text: "Underwater forest with sunlight filtering through crystalline water, bioluminescent", uses: "3.4K" },
    { text: "Desert landscape with aurora borealis, impossible geometry, ethereal fog", uses: "2.9K" },
    { text: "Staircase spiraling into infinite sky, surreal clouds, dream-like atmosphere", uses: "2.2K" },
  ],
};

const defaultPrompts = [
  { text: "Abstract digital landscape with flowing colors, cinematic lighting, 8k ultra-detailed", uses: "3.2K" },
  { text: "Surreal cosmic scene with nebula clouds, floating structures, photorealistic render", uses: "2.8K" },
];

const topicBoards = [
  { id: "1", title: "Cityscapes", suffix: "" },
  { id: "2", title: "Architecture", suffix: "" },
  { id: "3", title: "Moody Atmospheres", suffix: "" },
];

const topicCreators = [
  { id: "6", name: "VoidArt", init: "VA", color: "#023e8a", images: "1,240", followers: "4.7K" },
  { id: "2", name: "NeoPixel", init: "NP", color: "#c9184a", images: "890", followers: "9.8K" },
  { id: "8", name: "Synthetix", init: "SX", color: "#06d6a0", images: "620", followers: "3.8K" },
  { id: "1", name: "AI.Verse", init: "AV", color: "#4361ee", images: "1,480", followers: "12.4K" },
];

const heights = [220, 280, 190, 250, 210, 260, 175, 240, 200, 230, 185, 255];

const TopicPage = () => {
  const { slug } = useParams();
  const topic = topicData[slug || ""] || fallbackTopic;
  const photos = topicPhotos[slug || ""] || defaultPhotos;
  const prompts = topicPrompts[slug || ""] || defaultPrompts;
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.longTitle,
    description: topic.description,
    url: `https://realart.ai/topic/${slug}`,
    provider: { "@type": "Organization", name: "REAL ART", url: "https://realart.ai" },
  };

  return (
    <PageShell>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* ── Hero ── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ background: "radial-gradient(ellipse 800px 400px at 50% 60%, hsl(var(--accent)), transparent 70%)" }} />
          <div className="px-6 md:px-12 py-14 md:py-20 max-w-[1440px] mx-auto relative">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-6">
              <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3 h-3 opacity-30" />
              <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
              <ChevronRight className="w-3 h-3 opacity-30" />
              <span className="text-foreground">{topic.title}</span>
            </div>

            <h1 className="font-display text-[clamp(2.6rem,6vw,4.5rem)] font-black tracking-[-0.03em] leading-[0.95] mb-4">
              {topic.longTitle}
            </h1>
            <p className="text-[1rem] text-muted leading-[1.65] max-w-[600px] mb-8">{topic.description}</p>

            {/* Hero CTAs */}
            <div className="flex items-center gap-3 flex-wrap mb-8">
              <Link
                to="/real-creator"
                className="flex items-center gap-2 bg-accent text-primary-foreground rounded-lg text-[0.88rem] font-bold px-6 py-3 hover:bg-accent/85 transition-colors shadow-md no-underline"
              >
                <Sparkles className="w-4 h-4" /> Create {topic.title} Art
              </Link>
              <a
                href="#images"
                className="flex items-center gap-2 bg-foreground text-primary-foreground rounded-lg text-[0.84rem] font-semibold px-5 py-2.5 hover:bg-foreground/85 transition-colors no-underline"
              >
                <Download className="w-4 h-4" /> Download Images
              </a>
              <a
                href="#prompts"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.84rem] font-medium border border-foreground/[0.12] hover:border-foreground/30 transition-colors no-underline text-foreground"
              >
                <Eye className="w-4 h-4" /> Explore Prompts
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-[0.82rem] text-muted">
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> <strong className="text-foreground font-semibold">{topic.stats.images}</strong> images</span>
              <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> <strong className="text-foreground font-semibold">{topic.stats.downloads}</strong> downloads</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> <strong className="text-foreground font-semibold">{topic.stats.creators}</strong> creators</span>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-12 max-w-[1440px] mx-auto">

          {/* ── Image Grid ── */}
          <div id="images" className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em]">{topic.title} Images</h2>
              <span className="text-[0.78rem] text-muted">{topic.stats.images} free images</span>
            </div>
            <div className="masonry-grid">
              {photos.map((photo, i) => (
                <Link key={i} to={`/image/${i}`} className="masonry-item rounded-xl overflow-hidden relative group block" style={{ background: "#e0e0de" }}>
                  <img
                    src={`https://images.unsplash.com/${photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                    alt={`${topic.title} AI art`}
                    loading="lazy"
                    className="w-full block rounded-xl transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ height: heights[i % heights.length], objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3" style={{ background: "var(--gradient-overlay)" }}>
                    <span className="text-[0.72rem] text-primary-foreground/80 flex items-center gap-1"><Eye className="w-3 h-3" /> View</span>
                    <div className="flex gap-1.5">
                      <button onClick={e => e.preventDefault()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground hover:bg-primary-foreground/40 transition-colors">
                        <Download className="w-3 h-3" />
                      </button>
                      <button onClick={e => e.preventDefault()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground hover:bg-primary-foreground/40 transition-colors">
                        <Bookmark className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <button className="font-body text-[0.82rem] font-semibold bg-transparent border border-foreground/[0.14] px-8 py-2.5 rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors">
                Load More {topic.title} Images
              </button>
            </div>
          </div>

          {/* ── Popular Prompts ── */}
          <div id="prompts" className="mb-14">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Trending</span>
            </div>
            <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] mb-1.5">Popular {topic.title} Prompts</h2>
            <p className="text-[0.82rem] text-muted mb-6">Copy any prompt or create your own version in REAL CREATOR</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prompts.map((prompt, i) => (
                <div key={i} className="border border-foreground/[0.06] bg-card rounded-xl p-4 hover:border-foreground/[0.14] transition-colors">
                  <p className="text-[0.84rem] text-foreground/80 leading-[1.6] mb-3">{prompt.text}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopyPrompt(prompt.text, i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all ${
                        copiedIdx === i
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted hover:text-foreground"
                      }`}
                    >
                      {copiedIdx === i ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    <Link
                      to="/real-creator"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors no-underline"
                    >
                      <Sparkles className="w-3 h-3" /> Create With This Prompt
                    </Link>
                    <span className="text-[0.7rem] text-muted ml-auto">{prompt.uses} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Boards ── */}
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-1">
              <Layout className="w-4 h-4 text-accent" />
              <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Curated</span>
            </div>
            <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] mb-5">{topic.title} Art Boards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topicBoards.map((board, i) => (
                <Link key={board.id} to={`/boards/${board.id}`} className="block no-underline group">
                  <div className="relative rounded-2xl overflow-hidden h-[180px]">
                    <img
                      src={`https://images.unsplash.com/${photos[i * 2] || photos[0]}?w=500&h=180&fit=crop&q=78`}
                      alt={`${topic.title} ${board.title}`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-display text-[1.15rem] font-black text-primary-foreground">{topic.title} {board.title}</h3>
                      <span className="text-[0.72rem] text-primary-foreground/60">Browse board →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Top Creators ── */}
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Featured</span>
            </div>
            <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] mb-5">Top {topic.title} Creators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topicCreators.map(cr => (
                <Link key={cr.id} to={`/creator/${cr.id}`} className="block no-underline group">
                  <div className="border border-foreground/[0.06] bg-card rounded-xl p-5 text-center hover:border-foreground/[0.14] transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-[1rem] font-bold text-primary-foreground mx-auto mb-3" style={{ background: cr.color }}>
                      {cr.init}
                    </div>
                    <div className="font-semibold text-[0.9rem] mb-0.5 group-hover:text-accent transition-colors">{cr.name}</div>
                    <div className="text-[0.72rem] text-muted mb-2">{cr.images} {topic.title.toLowerCase()} images</div>
                    <div className="text-[0.72rem] text-muted">{cr.followers} followers</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── CTA Banner ── */}
          <div className="mb-14 bg-foreground rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none opacity-[0.08]"
              style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
            <div className="relative max-w-[560px]">
              <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/30 mb-3">Create Your Own</div>
              <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-black text-primary-foreground tracking-[-0.03em] leading-[1.05] mb-3">
                Create {topic.title} Art <span className="text-accent">in seconds</span>
              </h2>
              <p className="text-[0.88rem] text-primary-foreground/45 leading-[1.65] mb-6">
                Open REAL CREATOR with {topic.title.toLowerCase()} style preloaded. Pick a prompt, hit generate, and download your creation.
              </p>
              <Link
                to="/real-creator"
                className="inline-flex items-center gap-2 bg-accent text-primary-foreground text-[0.88rem] font-bold px-7 py-3 rounded-lg hover:bg-accent/85 transition-colors no-underline"
              >
                <Sparkles className="w-4 h-4" /> Create {topic.title} Art
              </Link>
            </div>
          </div>

          {/* ── SEO Article ── */}
          <div className="mb-16 max-w-[740px]">
            {topic.seoArticle.map((section, i) => (
              <div key={i} className="mb-8">
                <h2 className="font-display text-[1.5rem] font-black tracking-[-0.02em] mb-3">{section.heading}</h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-[0.88rem] text-muted leading-[1.75] mb-3">{p}</p>
                ))}
              </div>
            ))}
          </div>

          {/* ── Related Topics ── */}
          <div className="mb-16">
            <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em] mb-4">Related Topics</h2>
            <div className="flex flex-wrap gap-2">
              {["cyberpunk", "luxury-homes", "dreamscapes", "ai-avatars", "sci-fi-landscapes", "minimal-backgrounds", "modern-offices", "fitness", "podcast-studio", "travel"].map(t => (
                <Link
                  key={t}
                  to={`/topic/${t}`}
                  className={`px-4 py-2 rounded-lg text-[0.82rem] font-medium border transition-colors no-underline ${
                    t === slug
                      ? "bg-foreground text-primary-foreground border-foreground"
                      : "border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {t.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Footer />
    </PageShell>
  );
};

export default TopicPage;
