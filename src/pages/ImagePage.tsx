import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Download, Heart, Bookmark, Share2, Video, Pencil, RefreshCw,
  Copy, Check, ArrowLeft, Eye, ChevronRight, Shield, Globe
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const photos = [
  "photo-1618005182384-a83a8bd57fbe","photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab","photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85","photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9","photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809","photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b","photo-1576091160550-2173dba999ef",
];

const creators = [
  { id: "1", name: "AI.Verse", handle: "@aiverse", avatar: "AV", color: "#4361ee", bio: "Generative art explorer specializing in cosmic and abstract digital landscapes. I push the boundaries of what AI can visualize — from deep space visions to microscopic worlds.", followers: "12.4K", images: 284 },
  { id: "2", name: "NeoPixel", handle: "@neopixel", avatar: "NP", color: "#c9184a", bio: "Cyberpunk visuals and neon-drenched futures. Building worlds one prompt at a time.", followers: "9.8K", images: 196 },
  { id: "3", name: "DreamForge", handle: "@dreamforge", avatar: "DF", color: "#2a9d8f", bio: "Fantasy landscapes, mythical worlds, and surreal dreamscapes.", followers: "7.3K", images: 421 },
];

const samplePrompt = "A cosmic dreamscape with swirling nebula clouds and floating crystalline structures, cinematic lighting, dramatic shadows, 8k ultra-detailed, photorealistic render, deep space background with stars and aurora borealis, editorial photography style";

const tags = ["Abstract", "Cosmic", "Fantasy", "8K", "Cinematic", "Space"];

const ImagePage = () => {
  const { id } = useParams();
  const idx = parseInt(id || "0") % photos.length;
  const photo = photos[idx];
  const creator = creators[idx % creators.length];

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const similar = photos.filter((_, i) => i !== idx).slice(0, 6);
  const heights = [220, 180, 260, 200, 240, 190];

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
          <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">Cosmic Dreamscape #{id}</span>
        </div>

        <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start pb-16">

            {/* LEFT — Image */}
            <div>
              <div className="rounded-2xl overflow-hidden bg-card border border-foreground/[0.06]">
                <img
                  src={`https://images.unsplash.com/${photo}?w=1200&fit=crop&q=90`}
                  alt="Cosmic Dreamscape"
                  className="w-full block"
                  style={{ maxHeight: "75vh", objectFit: "cover" }}
                />
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <button className="flex items-center gap-2 bg-foreground text-primary-foreground rounded-lg text-[0.84rem] font-semibold px-5 py-2.5 hover:bg-accent transition-colors">
                  <Download className="w-4 h-4" /> Download Free
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium border transition-colors ${liked ? "bg-red-50 border-red-200 text-red-600" : "bg-card border-foreground/[0.12] hover:border-foreground/30"}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  {liked ? "Liked" : "Like"}
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium border transition-colors ${saved ? "bg-accent/10 border-accent/30 text-accent" : "bg-card border-foreground/[0.12] hover:border-foreground/30"}`}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? "fill-accent text-accent" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium border bg-card border-foreground/[0.12] hover:border-foreground/30 transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium border bg-card border-foreground/[0.12] hover:border-foreground/30 transition-colors">
                  <Video className="w-4 h-4" /> Animate
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium border bg-card border-foreground/[0.12] hover:border-foreground/30 transition-colors">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
              </div>

              {/* Prompt section */}
              <div className="mt-6 bg-card border border-foreground/[0.08] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-[0.9rem]">AI Prompt</div>
                  <button
                    onClick={() => setPromptVisible(!promptVisible)}
                    className="text-[0.78rem] font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {promptVisible ? "Hide" : "Reveal Prompt"}
                  </button>
                </div>
                {promptVisible ? (
                  <>
                    <p className="text-[0.82rem] text-muted leading-[1.65] mb-3">{samplePrompt}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground/[0.06] text-[0.75rem] font-medium hover:bg-foreground/[0.12] transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-primary-foreground text-[0.75rem] font-medium hover:bg-accent/80 transition-colors">
                        <RefreshCw className="w-3 h-3" /> Remix in REAL CREATOR
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-[0.82rem] text-muted">
                    Join REAL ART free to unlock prompts for every image on the platform.
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map(tag => (
                  <Link key={tag} to={`/explore?q=${tag.toLowerCase()}`}
                    className="text-[0.78rem] font-medium px-3 py-1.5 rounded-md bg-card border border-foreground/[0.1] hover:border-foreground/30 transition-colors text-muted hover:text-foreground">
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Similar images */}
              <div className="mt-10">
                <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-5">Similar Images</h2>
                <div className="masonry-grid">
                  {similar.map((p, i) => (
                    <Link key={i} to={`/image/${i + 10}`} className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative">
                      <img
                        src={`https://images.unsplash.com/${p}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                        alt=""
                        loading="lazy"
                        className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                        style={{ height: heights[i % heights.length], objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "var(--gradient-overlay)" }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Sidebar */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-5">

              {/* Title + meta */}
              <div>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-2">
                  Cosmic Dreamscape #{id}
                </h1>
                <div className="flex items-center gap-4 text-[0.8rem] text-muted">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 24,800 views</span>
                  <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> 3,412 downloads</span>
                </div>
              </div>

              {/* Creator card */}
              <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Link to={`/creator/${creator.id}`}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-[0.85rem] font-bold text-primary-foreground shrink-0 shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ background: creator.color }}>
                      {creator.avatar}
                    </div>
                  </Link>
                  <div>
                    <Link to={`/creator/${creator.id}`} className="font-semibold text-[0.9rem] hover:text-accent transition-colors block">{creator.name}</Link>
                    <div className="text-[0.75rem] text-muted">{creator.handle}</div>
                  </div>
                </div>
                <p className="text-[0.8rem] text-muted leading-[1.6] mb-4">{creator.bio}</p>
                <div className="flex gap-4 text-[0.78rem] text-muted mb-4">
                  <span><strong className="text-foreground font-semibold">{creator.followers}</strong> followers</span>
                  <span><strong className="text-foreground font-semibold">{creator.images}</strong> images</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-foreground text-primary-foreground text-[0.8rem] font-semibold py-2 rounded-lg hover:bg-accent transition-colors">
                    Follow
                  </button>
                  <button className="flex-1 bg-card border border-foreground/[0.12] text-[0.8rem] font-medium py-2 rounded-lg hover:border-foreground/30 transition-colors">
                    💛 Donate
                  </button>
                </div>
              </div>

              {/* License */}
              <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-accent" />
                  <div className="font-semibold text-[0.88rem]">Free License</div>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    "✓ Free for personal and commercial use",
                    "✓ No attribution required",
                    "✓ Modify and adapt freely",
                    "✓ Use in any project, product or medium",
                  ].map(item => (
                    <div key={item} className="text-[0.78rem] text-muted">{item}</div>
                  ))}
                </div>
                <Link to="/license" className="inline-block mt-3 text-[0.75rem] font-medium text-accent hover:underline">
                  Read full license →
                </Link>
              </div>

              {/* REAL CREATOR CTA */}
              <div className="bg-foreground rounded-xl p-5 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
                <div className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/40 mb-2">Powered by</div>
                <div className="font-display text-[1.2rem] font-black text-primary-foreground mb-2">REAL CREATOR</div>
                <p className="text-[0.78rem] text-primary-foreground/50 leading-[1.6] mb-4">
                  Edit, animate, or recreate this image in our full AI creation suite.
                </p>
                <button className="w-full bg-accent text-primary-foreground text-[0.82rem] font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Open In REAL CREATOR
                </button>
              </div>

              {/* Stats */}
              <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                <div className="font-semibold text-[0.88rem] mb-3">Image Details</div>
                <div className="flex flex-col gap-2">
                  {[
                    ["Style", "Abstract / Cosmic"],
                    ["Resolution", "4096 × 4096"],
                    ["Format", "JPG / PNG"],
                    ["Published", "March 2026"],
                    ["License", "Free — Commercial OK"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[0.79rem]">
                      <span className="text-muted">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ImagePage;
