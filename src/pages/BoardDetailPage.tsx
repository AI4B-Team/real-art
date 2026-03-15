import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Users, Bookmark, Heart, Share2, Sparkles, Copy, Check, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const boardData: Record<string, { title: string; creator: string; creatorId: string; creatorColor: string; creatorInit: string; followers: string; images: number; cover: string; description: string }> = {
  "1": { title: "Cyberpunk Cities", creator: "VoidArt", creatorId: "6", creatorColor: "#023e8a", creatorInit: "VA", followers: "1,248", images: 128, cover: "photo-1557682250-33bd709cbe85", description: "A curated collection of neon-soaked cityscapes, rain-drenched streets, and holographic skylines. Inspired by Blade Runner, Ghost in the Shell, and the sprawl." },
  "2": { title: "Surreal Dreamscapes", creator: "DreamForge", creatorId: "3", creatorColor: "#2a9d8f", creatorInit: "DF", followers: "892", images: 94, cover: "photo-1579546929518-9e396f3cc809", description: "Otherworldly landscapes blending reality and imagination. Floating islands, impossible geometries, and dreamlike atmospheres." },
  "3": { title: "Dark Fantasy", creator: "NeoPixel", creatorId: "2", creatorColor: "#c9184a", creatorInit: "NP", followers: "1,034", images: 156, cover: "photo-1541701494587-cb58502866ab", description: "Gothic castles, mythical creatures, and enchanted forests. A dark and moody take on fantasy worlds." },
};

const savedPhotos = [
  "photo-1557682250-33bd709cbe85", "photo-1579546929518-9e396f3cc809",
  "photo-1541701494587-cb58502866ab", "photo-1518020382113-a7e8fc38eac9",
  "photo-1547036967-23d11aacaee0", "photo-1604881991720-f91add269bed",
  "photo-1462275646964-a0e3386b89fa", "photo-1558618666-fcd25c85cd64",
];

const recommendedPhotos = [
  "photo-1506905925346-21bda4d32df4", "photo-1549880338-65ddcdfd017b",
  "photo-1618005182384-a83a8bd57fbe", "photo-1576091160550-2173dba999ef",
  "photo-1500462918059-b1a0cb512f1d", "photo-1543722530-d2c3201371e7",
  "photo-1533158628620-7e4d0a003147", "photo-1505765050516-f72dcac9c60e",
];

const boardPrompts = [
  { text: "Cyberpunk skyline at night with neon billboards and flying cars, rain-soaked streets", uses: "2.4K" },
  { text: "Neon Tokyo street scene, holographic signs, puddles reflecting lights, cinematic", uses: "1.8K" },
  { text: "Futuristic cityscape with massive towers, fog, volumetric lighting, 8k detailed", uses: "1.2K" },
  { text: "Dark alley in a cyberpunk megacity, steam vents, flickering lights, moody atmosphere", uses: "968" },
];

const heights = [220, 280, 190, 250, 210, 260, 175, 235];

const BoardDetailPage = () => {
  const { id } = useParams();
  const board = boardData[id || "1"] || boardData["1"];
  const [following, setFollowing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero cover */}
        <div className="relative h-[320px] md:h-[400px] overflow-hidden">
          <img
            src={`https://images.unsplash.com/${board.cover}?w=1400&h=400&fit=crop&q=80`}
            alt={board.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8 max-w-[1440px] mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[0.78rem] text-primary-foreground/50 mb-4">
              <Link to="/" className="hover:text-primary-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3 h-3 opacity-30" />
              <Link to="/boards" className="hover:text-primary-foreground transition-colors">Boards</Link>
              <ChevronRight className="w-3 h-3 opacity-30" />
              <span className="text-primary-foreground">{board.title}</span>
            </div>
            <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-black text-primary-foreground tracking-[-0.03em] leading-none mb-3">
              {board.title}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to={`/creator/${board.creatorId}`} className="flex items-center gap-2 no-underline">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-primary-foreground border border-primary-foreground/20"
                  style={{ background: board.creatorColor }}
                >
                  {board.creatorInit}
                </div>
                <span className="text-[0.85rem] text-primary-foreground/80">by {board.creator}</span>
              </Link>
              <span className="flex items-center gap-1 text-[0.8rem] text-primary-foreground/50">
                <Users className="w-3.5 h-3.5" /> {board.followers} followers
              </span>
              <span className="flex items-center gap-1 text-[0.8rem] text-primary-foreground/50">
                <Bookmark className="w-3.5 h-3.5" /> {board.images} images
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-12 max-w-[1440px] mx-auto py-8">
          {/* Actions row */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <button
              onClick={() => setFollowing(!following)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold transition-colors ${
                following
                  ? "bg-foreground/[0.08] border border-foreground/20 text-foreground"
                  : "bg-foreground text-primary-foreground hover:bg-accent"
              }`}
            >
              <Heart className={`w-4 h-4 ${following ? "fill-accent text-accent" : ""}`} />
              {following ? "Following" : "Follow Board"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium border border-foreground/[0.12] hover:border-foreground/30 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Description */}
          <p className="text-[0.9rem] text-muted leading-[1.7] max-w-[640px] mb-10">{board.description}</p>

          {/* ── Saved Images ── */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Bookmark className="w-4 h-4 text-accent" />
              <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em]">Images In This Board</h2>
              <span className="text-[0.75rem] text-muted ml-2">{savedPhotos.length} images</span>
            </div>
            <div className="masonry-grid">
              {savedPhotos.map((photo, i) => (
                <Link key={i} to={`/image/${i}`} className="masonry-item rounded-xl overflow-hidden relative group block">
                  <img
                    src={`https://images.unsplash.com/${photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                    alt="Board image"
                    loading="lazy"
                    className="w-full block rounded-xl transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ height: heights[i % heights.length], objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3" style={{ background: "var(--gradient-overlay)" }}>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-[0.7rem] text-primary-foreground/70"><Eye className="w-3 h-3" /> View</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Recommended For This Board ── */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em]">Recommended For This Board</h2>
            </div>
            <p className="text-[0.8rem] text-muted mb-5">Based on tags, styles, and prompts in this board</p>
            <div className="masonry-grid">
              {recommendedPhotos.map((photo, i) => (
                <Link key={i} to={`/image/${i + 10}`} className="masonry-item rounded-xl overflow-hidden relative group block">
                  <img
                    src={`https://images.unsplash.com/${photo}?w=400&h=${heights[(i + 3) % heights.length]}&fit=crop&q=78`}
                    alt="Recommended"
                    loading="lazy"
                    className="w-full block rounded-xl transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ height: heights[(i + 3) % heights.length], objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3" style={{ background: "var(--gradient-overlay)" }}>
                    <span className="text-[0.7rem] text-primary-foreground/70 flex items-center gap-1"><Eye className="w-3 h-3" /> View</span>
                    <button
                      onClick={e => e.preventDefault()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground hover:bg-primary-foreground/40 transition-colors"
                    >
                      <Bookmark className="w-3 h-3" /> Save
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Prompts From This Board ── */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em]">Prompts From This Board</h2>
            </div>
            <p className="text-[0.8rem] text-muted mb-5">Click to copy or create with any prompt</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {boardPrompts.map((prompt, i) => (
                <div
                  key={i}
                  className="border border-foreground/[0.06] bg-card rounded-xl p-4 hover:border-foreground/[0.14] transition-colors"
                >
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
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default BoardDetailPage;
