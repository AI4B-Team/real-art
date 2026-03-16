import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Download, Heart, Bookmark, Share2, RefreshCw,
  Copy, Check, ArrowLeft, Eye, ChevronRight, Shield, Globe, Sparkles, Code, X, Layout, ShoppingBag, Video, Image,
  Briefcase, Youtube, Instagram, Globe2, Package, Monitor, Megaphone, MessageCircleOff, MessageCircle
} from "lucide-react";
import SponsoredCard from "@/components/SponsoredCard";
import ShopSection, { type ShopLink, type ShopSimilarItem } from "@/components/ShopSection";
import PageShell from "@/components/PageShell";
import { resolveLink, trackClick, seedDemoLinks, type ImageLink } from "@/lib/linkStore";
import Footer from "@/components/Footer";
import SaveToBoardModal from "@/components/SaveToBoardModal";
import ShareModal from "@/components/ShareModal";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import CommentsSection from "@/components/CommentsSection";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const photos = [
  "photo-1618005182384-a83a8bd57fbe","photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab","photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85","photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9","photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809","photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b","photo-1576091160550-2173dba999ef",
];

const creators = [
  { id: "1", name: "AI.Verse", handle: "@aiverse", avatar: "AV", color: "#4361ee", bio: "Generative art explorer specializing in cosmic and abstract digital landscapes. I push the boundaries of what AI can visualize — from deep space visions to microscopic worlds.", followers: "12.4K", images: 284, downloads: "4.2M" },
  { id: "2", name: "NeoPixel", handle: "@neopixel", avatar: "NP", color: "#c9184a", bio: "Cyberpunk visuals and neon-drenched futures. Building worlds one prompt at a time.", followers: "9.8K", images: 196, downloads: "2.8M" },
  { id: "3", name: "DreamForge", handle: "@dreamforge", avatar: "DF", color: "#2a9d8f", bio: "Fantasy landscapes, mythical worlds, and surreal dreamscapes.", followers: "7.3K", images: 421, downloads: "1.9M" },
];

const samplePrompt = "A cosmic dreamscape with swirling nebula clouds and floating crystalline structures, cinematic lighting, dramatic shadows, 8k ultra-detailed, photorealistic render, deep space background with stars and aurora borealis, editorial photography style";

const sampleVideoPrompt = "Slow dolly-in through swirling nebula clouds as crystalline structures rotate and refract light. Camera drifts weightlessly through deep space, aurora borealis ribbons dancing across the frame. Cinematic orchestral score swells. Cut to macro shot of crystal facets catching starlight, then pull back to reveal the full cosmic dreamscape. 4K, 24fps, anamorphic lens flares, volumetric fog.";

const tags = ["Abstract", "Cosmic", "Fantasy", "8K", "Cinematic", "Space"];

// Shop similar items (static for now)
const shopSimilarItems: ShopSimilarItem[] = [
  { photo: "photo-1558618666-fcd25c85cd64", title: "Abstract Silk Scarf", price: "$65.00", site: "Etsy", url: "#" },
  { photo: "photo-1549880338-65ddcdfd017b", title: "Horizon Canvas Print", price: "$42.00", site: "Society6", url: "#" },
  { photo: "photo-1576091160550-2173dba999ef", title: "Neon Art Tee", price: "$38.00", site: "Redbubble", url: "#" },
  { photo: "photo-1518020382113-a7e8fc38eac9", title: "Cosmic Wall Art", price: "$55.00", site: "ArtPrints.co", url: "#" },
  { photo: "photo-1547036967-23d11aacaee0", title: "Dream Poster", price: "$29.00", site: "Etsy", url: "#" },
];


const ImagePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const idx = parseInt(id || "0") % photos.length;
  const photo = searchParams.get("photo") || photos[idx];
  const creator = creators[idx % creators.length];

  // Seed demo links on first load, then resolve for this image
  useEffect(() => { seedDemoLinks(); }, []);
  const imageLink = resolveLink(String(idx));
  const hasShop = !!imageLink;
  const shopLink: ShopLink | undefined = imageLink ? {
    url: imageLink.url, site: imageLink.site || "Shop",
    price: imageLink.price, isAffiliate: imageLink.isAffiliate,
    label: imageLink.label,
  } : undefined;

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [creditCopied, setCreditCopied] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [showRecreateModal, setShowRecreateModal] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activePromptTab, setActivePromptTab] = useState<"image" | "video">("image");
  const [videoCopied, setVideoCopied] = useState(false);

  // Comments toggle
  const commentsKey = `ra_comments_off_${id || "0"}`;
  const [commentsOff, setCommentsOff] = useState(() => {
    try { return localStorage.getItem(commentsKey) === "1"; } catch { return false; }
  });
  const toggleComments = () => {
    const next = !commentsOff;
    setCommentsOff(next);
    try { next ? localStorage.setItem(commentsKey, "1") : localStorage.removeItem(commentsKey); } catch {}
  };
  const creditText = `AI artwork by ${creator.name} on REAL ART\nRecreate it at https://realart.com/image/${id}`;

  const handleCopyCredit = () => {
    navigator.clipboard.writeText(creditText).catch(() => {});
    setCreditCopied(true);
    setTimeout(() => setCreditCopied(false), 2500);
  };

  const embedCode = `<iframe src="https://realart.com/embed/${id}" width="600" height="600" frameborder="0" style="border-radius:12px;overflow:hidden" allowfullscreen></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode).catch(() => {});
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(samplePrompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyVideo = () => {
    navigator.clipboard.writeText(sampleVideoPrompt).catch(() => {});
    setVideoCopied(true);
    setTimeout(() => setVideoCopied(false), 2000);
  };


  return (
    <PageShell>
        {/* Breadcrumb */}
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">Cosmic Dreamscape</span>
        </div>

        <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start pb-16">

            {/* LEFT — Image */}
            <div className="lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
              <div className="rounded-2xl overflow-hidden bg-card border border-foreground/[0.06] relative">
                <img
                  src={`https://images.unsplash.com/${photo}?w=1200&fit=crop&q=90`}
                  alt="Cosmic Dreamscape"
                  className="w-full block"
                  style={{ maxHeight: "75vh", objectFit: "cover" }}
                />
                {hasShop && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-accent text-primary-foreground text-[0.68rem] font-bold tracking-[0.08em] uppercase px-3 py-1.5 rounded-lg shadow-md">
                    <ShoppingBag className="w-3.5 h-3.5" /> Shop the Look
                  </div>
                )}
              </div>

              {/* Action bar — Recreate dominates, Download smaller */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowRecreateModal(true)}
                        className="flex items-center gap-2 bg-accent text-primary-foreground rounded-lg text-[0.88rem] font-bold px-6 py-3 hover:bg-accent/85 transition-colors shadow-md"
                      >
                        <Sparkles className="w-4.5 h-4.5" /> Recreate
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-foreground text-primary-foreground border-none max-w-[240px] p-3">
                      <p className="text-[0.75rem] font-semibold mb-1">One-click recreate</p>
                      <p className="text-[0.7rem] opacity-70 leading-[1.5]">Opens REAL CREATOR with prompt, style & settings preloaded. Just hit generate.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <button className="flex items-center gap-2 bg-foreground/[0.08] text-foreground rounded-lg text-[0.8rem] font-medium px-4 py-2.5 hover:bg-foreground/[0.14] transition-colors border border-foreground/[0.1]">
                  <Download className="w-3.5 h-3.5" /> Download Free
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[0.8rem] font-medium border transition-colors ${liked ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-card border-foreground/[0.12] hover:border-foreground/30"}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? "fill-destructive text-destructive" : ""}`} />
                  {liked ? "Liked" : "Like"}
                </button>
                <button
                  onClick={() => setBoardModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[0.8rem] font-medium border bg-card border-foreground/[0.12] hover:border-foreground/30 transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Save to Board
                </button>
                <button onClick={() => setShareModalOpen(true)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[0.8rem] font-medium border bg-card border-foreground/[0.12] hover:border-foreground/30 transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button onClick={() => setShowEmbed(true)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[0.8rem] font-medium border bg-card border-foreground/[0.12] hover:border-accent/40 hover:text-accent transition-colors">
                  <Code className="w-3.5 h-3.5" /> Embed
                </button>
              </div>

              {/* Follow Creator inline */}
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-card border border-foreground/[0.06]">
                <Link to={`/creator/${creator.id}`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.7rem] font-bold text-primary-foreground shrink-0" style={{ background: creator.color }}>
                    {creator.avatar}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/creator/${creator.id}`} className="font-semibold text-[0.84rem] hover:text-accent transition-colors">{creator.name}</Link>
                  <div className="text-[0.72rem] text-muted">{creator.followers} followers · {creator.images} images</div>
                </div>
                <button
                  onClick={() => setFollowed(!followed)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8rem] font-semibold transition-colors ${
                    followed ? "bg-foreground/[0.06] border border-foreground/20 text-foreground" : "bg-foreground text-primary-foreground hover:bg-accent"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${followed ? "fill-accent text-accent" : ""}`} />
                  {followed ? "Following" : "Follow"}
                </button>
              </div>

              {/* Credit Block — Copy + Embed together */}
              <div className="mt-5 p-4 rounded-xl border border-foreground/[0.08] bg-card">
                <div className="flex items-center gap-2 text-[0.78rem] text-muted mb-3">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Free to use · No attribution required · <strong className="text-foreground">AI-generated art</strong></span>
                </div>
                <p className="text-[0.75rem] text-muted mb-3">Credit the creator (optional)</p>
                <div className="bg-background border border-foreground/[0.06] rounded-lg p-3 mb-3">
                  <p className="text-[0.8rem] text-foreground/80 leading-[1.6] whitespace-pre-line font-mono">{creditText}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopyCredit}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.82rem] font-semibold transition-all ${creditCopied ? "bg-green-500/10 border border-green-500/30 text-green-600" : "bg-foreground text-primary-foreground hover:bg-accent"}`}
                  >
                    {creditCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Credit</>}
                  </button>
                  <button
                    onClick={() => setShowEmbed(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.82rem] font-medium border border-foreground/[0.12] hover:border-accent/30 hover:text-accent transition-colors"
                  >
                    <Code className="w-3.5 h-3.5" /> Embed Image
                  </button>
                </div>
                <p className="text-[0.7rem] text-muted mt-3 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Credited 3,482 times
                </p>
              </div>

              {showEmbed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setShowEmbed(false)}>
                  <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[560px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06]">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-accent" />
                        <h3 className="font-display text-[1.1rem] font-black">Embed This Image</h3>
                      </div>
                      <button onClick={() => setShowEmbed(false)} className="text-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="px-6 pt-5 pb-4">
                      <p className="text-[0.78rem] text-muted mb-4">Add this image to any website, blog, or Notion page. The embed links back to REAL ART and the creator.</p>
                      <div className="bg-card border border-foreground/[0.06] rounded-xl p-4 mb-5">
                        <div className="rounded-lg overflow-hidden mb-3">
                          <img src={`https://images.unsplash.com/${photo}?w=500&h=300&fit=crop&q=80`} alt="" className="w-full block" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-primary-foreground" style={{ background: creator.color }}>{creator.avatar}</div>
                            <span className="text-[0.78rem] text-muted">By <strong className="text-foreground">{creator.name}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[0.68rem] text-accent font-semibold">Create your own version →</span>
                            <span className="text-[0.65rem] font-bold text-muted tracking-[0.06em]">REAL ART</span>
                          </div>
                        </div>
                      </div>
                      <label className="text-[0.78rem] font-semibold mb-2 block">Embed code</label>
                      <div className="relative">
                        <pre className="bg-foreground text-primary-foreground/70 rounded-lg p-4 text-[0.72rem] leading-[1.6] overflow-x-auto font-mono whitespace-pre-wrap break-all">
                          {embedCode}
                        </pre>
                        <button
                          onClick={handleCopyEmbed}
                          className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-foreground/[0.1] text-primary-foreground text-[0.7rem] font-medium hover:bg-primary-foreground/[0.2] transition-colors"
                        >
                          {embedCopied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                    </div>
                    <div className="px-6 py-4 border-t border-foreground/[0.06] bg-card/50 flex items-center justify-between">
                      <p className="text-[0.72rem] text-muted">Embeds include creator attribution and a link to REAL ART</p>
                      <button onClick={() => setShowEmbed(false)} className="bg-foreground text-primary-foreground px-5 py-2 rounded-lg text-[0.82rem] font-semibold hover:bg-accent transition-colors">
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recreate Modal */}
              {showRecreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setShowRecreateModal(false)}>
                  <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[480px] overflow-hidden shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <h3 className="font-display text-[1.1rem] font-black">Create This Image In REAL CREATOR?</h3>
                      </div>
                      <button onClick={() => setShowRecreateModal(false)} className="text-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="px-6 py-5">
                      <div className="flex gap-4 mb-5">
                        <img src={`https://images.unsplash.com/${photo}?w=120&h=120&fit=crop&q=80`} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                        <div>
                          <div className="font-semibold text-[0.9rem] mb-1">Cosmic Dreamscape</div>
                          <div className="text-[0.75rem] text-muted">by {creator.name}</div>
                        </div>
                      </div>
                      <div className="bg-card border border-foreground/[0.06] rounded-xl p-4 mb-5">
                        <div className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-muted mb-3">Preloaded Settings</div>
                        <div className="flex flex-col gap-2.5">
                          {[
                            ["Prompt", "Cosmic dreamscape with nebula clouds…"],
                            ["Style", "Cyberpunk Neon City"],
                            ["Lighting", "Neon + Fog + Cinematic"],
                            ["Camera", "Wide Angle"],
                            ["Detail", "Ultra / 8K"],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-[0.8rem]">
                              <span className="text-muted">{k}</span>
                              <span className="font-medium text-foreground">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button className="w-full bg-accent text-primary-foreground text-[0.88rem] font-bold py-3 rounded-lg hover:bg-accent/85 transition-colors flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> Open in REAL CREATOR
                      </button>
                      <p className="text-[0.7rem] text-muted text-center mt-2">All settings preloaded — just hit generate</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prompts section — Image & Video tabs */}
              <div className="mt-8 bg-card border border-foreground/[0.08] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4 pb-0">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none">Prompts</h2>
                    <span className="text-[0.72rem] text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-md">Used 1,247 times</span>
                  </div>
                  <button
                    onClick={() => setPromptVisible(!promptVisible)}
                    className="text-[0.78rem] font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {promptVisible ? "Hide" : "Reveal Prompts"}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 px-5 mt-3 border-b border-foreground/[0.06]">
                  {([
                    { key: "image" as const, label: "Image Prompt", icon: Image },
                    { key: "video" as const, label: "Video Prompt", icon: Video },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActivePromptTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-[0.8rem] font-medium border-b-2 transition-colors -mb-px ${
                        activePromptTab === tab.key
                          ? "border-accent text-accent"
                          : "border-transparent text-muted hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                  ))}
                </div>

                <div className="px-5 py-4">
                  {promptVisible ? (
                    <>
                      {activePromptTab === "image" ? (
                        <>
                          <p className="text-[0.82rem] text-muted leading-[1.65] mb-3">{samplePrompt}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCopy}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.06] text-[0.75rem] font-medium hover:bg-foreground/[0.12] transition-colors"
                            >
                              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                              {copied ? "Copied!" : "Copy"}
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-primary-foreground text-[0.75rem] font-medium hover:bg-accent/80 transition-colors">
                              <RefreshCw className="w-3 h-3" /> Remix in REAL CREATOR
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-[0.82rem] text-muted leading-[1.65] mb-3">{sampleVideoPrompt}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCopyVideo}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.06] text-[0.75rem] font-medium hover:bg-foreground/[0.12] transition-colors"
                            >
                              {videoCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                              {videoCopied ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-[0.82rem] text-muted">
                      Join REAL ART free to unlock prompts for every image on the platform.
                    </div>
                  )}
                </div>
              </div>

              {/* Steal This Style */}
              <div className="mt-8 bg-foreground rounded-2xl p-7 md:p-8 relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-[0.08]"
                  style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full opacity-[0.05]"
                  style={{ background: "radial-gradient(circle, hsl(200 80% 60%), transparent)" }} />
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-accent">Signature Feature</span>
                </div>
                <h3 className="font-display text-[1.5rem] font-black text-primary-foreground mb-4 tracking-[-0.02em]">Steal This Style</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Cyberpunk", "Neon Lighting", "Ultra Detailed", "Futuristic City", "Moody Fog"].map(style => (
                    <span key={style} className="text-[0.75rem] font-semibold px-3.5 py-2 rounded-lg bg-primary-foreground/[0.08] text-primary-foreground/80 border border-primary-foreground/[0.08]">
                      {style}
                    </span>
                  ))}
                </div>
                <div className="bg-primary-foreground/[0.06] rounded-xl p-4 mb-6 border border-primary-foreground/[0.06]">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    {[
                      ["Style", "Cyberpunk Neon City"],
                      ["Lighting", "Neon + Fog"],
                      ["Camera", "Wide Angle"],
                      ["Detail", "Ultra / 8K"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[0.78rem]">
                        <span className="text-primary-foreground/40">{k}</span>
                        <span className="text-primary-foreground/80 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-accent text-primary-foreground text-[0.92rem] font-bold py-3.5 rounded-lg hover:bg-accent/85 transition-colors shadow-lg">
                  <Sparkles className="w-4.5 h-4.5" /> Steal This Style
                </button>
                <p className="text-[0.72rem] text-primary-foreground/35 text-center mt-3">Opens REAL CREATOR with prompt, model & style preloaded</p>
              </div>

              {/* Recreated From This Image */}
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4.5 h-4.5 text-accent" />
                  <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Visual Evolution</span>
                </div>
                <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-1.5">Recreated From This Image</h2>
                <p className="text-[0.8rem] text-muted mb-5">
                  <span className="text-accent font-semibold">Recreated 1,247 times</span> · 50 variations by the community
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { photo: "photo-1557682250-33bd709cbe85", creator: "@NeoPixel", style: "Watercolor" },
                    { photo: "photo-1541701494587-cb58502866ab", creator: "@DreamForge", style: "Cyberpunk" },
                    { photo: "photo-1579546929518-9e396f3cc809", creator: "@LuminaAI", style: "Minimal" },
                    { photo: "photo-1604881991720-f91add269bed", creator: "@SpectraGen", style: "3D Render" },
                    { photo: "photo-1549880338-65ddcdfd017b", creator: "@VoidArt", style: "Oil Paint" },
                    { photo: "photo-1558618666-fcd25c85cd64", creator: "@PixelMind", style: "Neon" },
                    { photo: "photo-1506905925346-21bda4d32df4", creator: "@AuraGen", style: "Landscape" },
                    { photo: "photo-1518020382113-a7e8fc38eac9", creator: "@DeepVis", style: "Surreal" },
                  ].map((r, i) => (
                    <Link key={i} to={`/image/${i + 20}`} className="relative rounded-xl overflow-hidden aspect-square group cursor-pointer">
                      <img
                        src={`https://images.unsplash.com/${r.photo}?w=300&h=300&fit=crop&q=78`}
                        alt={`Recreation by ${r.creator}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[0.6rem] font-semibold px-2 py-0.5 rounded-lg">
                        {r.style}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                        <div className="text-[0.72rem] text-primary-foreground/80">{r.creator}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-5">
                  <button className="inline-flex items-center gap-2 font-body text-[0.82rem] font-semibold bg-card border border-foreground/[0.12] px-6 py-2.5 rounded-lg cursor-pointer hover:border-foreground/30 transition-colors">
                    View All 50 Recreations
                  </button>
                </div>
              </div>

              {/* Built With This Image */}
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4.5 h-4.5 text-accent" />
                  <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Real World Uses</span>
                </div>
                <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-1.5">Built With This Image</h2>
                <p className="text-[0.8rem] text-muted mb-5">
                  Used in <span className="text-accent font-semibold">34 projects</span> across the web
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { photo: "photo-1460925895917-afdab827c52f", type: "Website Hero", creator: "@NeoPixel", icon: Monitor, views: "12K visits" },
                    { photo: "photo-1611162617474-5b21e879e113", type: "YouTube Thumbnail", creator: "@DreamForge", icon: Youtube, views: "1.2M views" },
                    { photo: "photo-1611262588024-d12430b98920", type: "Instagram Ad", creator: "@LuminaAI", icon: Instagram, views: "84K reach" },
                    { photo: "photo-1523474253046-8cd2748b5fd2", type: "Shopify Store Banner", creator: "@SpectraGen", icon: Globe2, views: "5.8K visits" },
                    { photo: "photo-1586717791821-3f44a563fa4c", type: "Product Packaging", creator: "@VoidArt", icon: Package, views: "2K units" },
                    { photo: "photo-1551288049-bebda4e38f71", type: "Dashboard UI", creator: "@ChromaLab", icon: Monitor, views: "18K users" },
                  ].map((project, i) => (
                    <div key={i} className="group relative rounded-xl overflow-hidden border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all cursor-pointer">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/${project.photo}?w=400&h=250&fit=crop&q=78`}
                          alt={project.type}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <project.icon className="w-3.5 h-3.5 text-accent" />
                          <span className="text-[0.82rem] font-semibold group-hover:text-accent transition-colors">{project.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[0.72rem] text-muted">{project.creator}</span>
                          <span className="text-[0.68rem] text-accent font-medium">{project.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-5">
                  <button className="inline-flex items-center gap-2 font-body text-[0.82rem] font-semibold bg-card border border-foreground/[0.12] px-6 py-2.5 rounded-lg cursor-pointer hover:border-foreground/30 transition-colors">
                    View All 34 Projects
                  </button>
                </div>
              </div>

              {/* Boards Using This Image */}
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-1">
                  <Layout className="w-4 h-4 text-accent" />
                  <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Featured In</span>
                </div>
                <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-5">Boards Using This Image</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "1", title: "Cyberpunk Inspiration", creator: "VoidArt", images: 128 },
                    { id: "5", title: "Cosmic Visions", creator: "AI.Verse", images: 241 },
                    { id: "2", title: "AI Moodboards", creator: "DreamForge", images: 94 },
                  ].map(board => (
                    <Link key={board.id} to={`/boards/${board.id}`} className="block no-underline group">
                      <div className="border border-foreground/[0.06] bg-card rounded-xl p-4 hover:border-foreground/[0.14] transition-all">
                        <div className="font-semibold text-[0.88rem] mb-1 group-hover:text-accent transition-colors">{board.title}</div>
                        <div className="text-[0.75rem] text-muted">by {board.creator} · {board.images} images</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Shop This Image + Shop Similar (conditional) */}
              {hasShop && shopLink && (
                <ShopSection
                  shopLink={shopLink}
                  shopSimilar={shopSimilarItems}
                  imageUrl={`https://images.unsplash.com/${photo}?w=80&h=80&fit=crop&q=80`}
                  onClickTrack={() => trackClick(String(idx))}
                />
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {tags.map(tag => (
                  <Link key={tag} to={`/explore?q=${tag.toLowerCase()}`}
                    className="text-[0.78rem] font-medium px-3 py-1.5 rounded-lg bg-card border border-foreground/[0.1] hover:border-foreground/30 transition-colors text-muted hover:text-foreground no-underline">
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Comments */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {commentsOff ? <MessageCircleOff className="w-4 h-4 text-muted" /> : <MessageCircle className="w-4 h-4 text-muted" />}
                    <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none">Comments</h2>
                  </div>
                  <button
                    onClick={toggleComments}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[0.76rem] font-medium transition-colors ${commentsOff ? "border-accent/30 text-accent bg-accent/[0.06]" : "border-foreground/[0.1] text-muted hover:text-foreground hover:border-foreground/25"}`}
                  >
                    {commentsOff ? <MessageCircleOff className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                    {commentsOff ? "Comments Off" : "Turn Off"}
                  </button>
                </div>
                {commentsOff ? (
                  <div className="text-center py-8 text-[0.84rem] text-muted border border-foreground/[0.06] rounded-xl bg-card">
                    <MessageCircleOff className="w-6 h-6 mx-auto mb-2 text-muted/50" />
                    Comments are turned off for this image.
                    <button onClick={toggleComments} className="block mx-auto mt-2 text-accent text-[0.78rem] font-semibold hover:underline">Turn on</button>
                  </div>
                ) : (
                  <CommentsSection imageId={id || "0"} />
                )}
              </div>

              {/* More Art Using This Style */}
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4.5 h-4.5 text-accent" />
                  <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Style Evolution</span>
                </div>
                <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-1.5">More Art Using This Style</h2>
                <p className="text-[0.8rem] text-muted mb-5">See what others created using the same style fingerprint</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { photo: "photo-1462275646964-a0e3386b89fa", creator: "@CosmicRay", title: "Cyberpunk Miami" },
                    { photo: "photo-1567360425618-1594206637d2", creator: "@NightOwl", title: "Neon Shanghai" },
                    { photo: "photo-1505765050516-f72dcac9c60e", creator: "@UrbanDream", title: "Blade Runner LA" },
                    { photo: "photo-1547036967-23d11aacaee0", creator: "@VoidCity", title: "Neo Seoul" },
                    { photo: "photo-1576091160550-2173dba999ef", creator: "@GlitchArt", title: "Cyber London" },
                    { photo: "photo-1501854140801-50d01698950b", creator: "@SynthWave", title: "Neon Paris" },
                  ].map((r, i) => (
                    <Link key={i} to={`/image/${i + 30}`} className="relative rounded-xl overflow-hidden aspect-[4/5] group cursor-pointer">
                      <img
                        src={`https://images.unsplash.com/${r.photo}?w=300&h=375&fit=crop&q=78`}
                        alt={r.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                      />
                      <ImageCardOverlay index={i + 30} />
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-5">
                  <button className="inline-flex items-center gap-2 font-body text-[0.82rem] font-semibold bg-accent text-primary-foreground px-6 py-2.5 rounded-lg cursor-pointer hover:bg-accent/85 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" /> Steal This Style & Create Yours
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT — Sidebar */}
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pl-2 scrollbar-thin flex flex-col gap-5">

              {/* Title + meta */}
              <div>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-2">
                  Cosmic Dreamscape
                </h1>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { icon: Eye, label: "Views", value: "24,800", suffix: "" },
                    { icon: Download, label: "Downloads", value: "3,412", suffix: "" },
                    { icon: RefreshCw, label: "Recreated", value: "1,247", suffix: "×" },
                    { icon: Code, label: "Embeds", value: "1,032", suffix: "" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-card border border-foreground/[0.08] rounded-xl p-4 flex flex-col items-center justify-center">
                      <stat.icon className="w-4 h-4 mb-2 text-accent" />
                      <div className="font-display font-black text-[1.15rem] tracking-[-0.02em] leading-tight text-center">
                        {stat.value}{stat.suffix && <sup className="text-[0.7rem] ml-0.5">{stat.suffix}</sup>}
                      </div>
                      <div className="text-[0.68rem] text-muted uppercase tracking-[0.08em] mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Creator card — with social proof stats */}
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
                <div className="grid grid-cols-3 gap-3 mb-4 bg-background rounded-lg p-3">
                  <div className="text-center">
                    <div className="font-display font-black text-[1.1rem] tracking-[-0.02em]">{creator.followers}</div>
                    <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em]">followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display font-black text-[1.1rem] tracking-[-0.02em]">{creator.images}</div>
                    <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em]">images</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display font-black text-[1.1rem] tracking-[-0.02em]">{creator.downloads}</div>
                    <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em]">downloads</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFollowed(!followed)}
                    className={`flex-1 text-[0.8rem] font-semibold py-2 rounded-lg transition-colors ${
                      followed ? "bg-foreground/[0.06] border border-foreground/20 text-foreground" : "bg-foreground text-primary-foreground hover:bg-accent"
                    }`}
                  >
                    {followed ? "Following" : "Follow"}
                  </button>
                  <button className="flex-1 bg-card border border-foreground/[0.12] text-[0.8rem] font-medium py-2 rounded-lg hover:border-foreground/30 transition-colors text-destructive flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 fill-destructive text-destructive" /> Donate
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

              {/* REAL CREATOR CTA — stronger headline */}
              <div className="bg-foreground rounded-xl p-5 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
                <div className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/40 mb-2">Powered by REAL CREATOR</div>
                <div className="font-display text-[1.15rem] font-black text-primary-foreground mb-2 leading-tight">Turn This Image Into Your Own Creation</div>
                <p className="text-[0.78rem] text-primary-foreground/50 leading-[1.6] mb-4">
                  Edit, animate, or recreate with our full AI creation suite. Prompt, style & settings preloaded.
                </p>
                <button
                  onClick={() => setShowRecreateModal(true)}
                  className="w-full bg-accent text-primary-foreground text-[0.82rem] font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Open In REAL CREATOR
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

              {/* Sponsored Sidebar Ads */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone className="w-4 h-4 text-accent" />
                  <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Sponsored</span>
                </div>
                <div className="space-y-3">
                  {[
                    { imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&q=80", brandName: "Poshmark", destinationUrl: "#" },
                    { imageUrl: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=400&h=500&fit=crop&q=80", brandName: "SHEIN", destinationUrl: "#" },
                  ].map((ad, i) => (
                    <SponsoredCard key={i} imageUrl={ad.imageUrl} brandName={ad.brandName} destinationUrl={ad.destinationUrl} variant="sidebar" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      <SaveToBoardModal open={boardModalOpen} onClose={() => setBoardModalOpen(false)} imageId={String(idx)} imagePhoto={photo} imageTitle="Cosmic Dreamscape" />
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        imageUrl={`https://images.unsplash.com/${photo}?w=1200&fit=crop&q=90`}
        title="Cosmic Dreamscape"
        creator={creator}
        prompt={samplePrompt}
        recreations="1,247"
        imageId={id || "0"}
      />
    </PageShell>
  );
};

export default ImagePage;
