import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X, Download, Heart, Bookmark, Share2, RefreshCw, Video, Pencil,
  Expand, Eye, Copy, Check, ChevronDown, ChevronUp, ExternalLink,
  MessageCircle, ShoppingBag, Maximize2, ZoomIn, Image, Code
} from "lucide-react";
import { useQuickView } from "@/context/QuickViewContext";
import SaveToBoardModal from "@/components/SaveToBoardModal";
import { getCommentsForImage, seedDemoComments, formatRelativeTime, toggleLikeComment, type Comment } from "@/lib/commentStore";
import { resolveLink } from "@/lib/linkStore";
import { addComment } from "@/lib/commentStore";
import ImageCardOverlay from "@/components/ImageCardOverlay";

const creators = [
  { n: "AI.Verse", i: "AV", c: "#4361ee", id: "1", handle: "@aiverse" },
  { n: "NeoPixel", i: "NP", c: "#c9184a", id: "2", handle: "@neopixel" },
  { n: "DreamForge", i: "DF", c: "#2a9d8f", id: "3", handle: "@dreamforge" },
  { n: "LuminaAI", i: "LA", c: "#e76f51", id: "4", handle: "@lumina" },
  { n: "SpectraGen", i: "SG", c: "#7b2d8b", id: "5", handle: "@spectra" },
  { n: "VoidArt", i: "VA", c: "#023e8a", id: "6", handle: "@voidart" },
];

const titles = [
  "Cosmic Dreamscape", "Neon Boulevard", "Abstract Fire", "Digital Horizon",
  "Neon Boulevard II", "Mountain Serenity", "Geometric City", "Night Starscape",
  "Cyberpunk City", "Digital Avatar 01", "Misty Highlands", "Fluid Motion",
];

const tags = [
  ["cosmic", "abstract", "generative", "space"],
  ["cyberpunk", "neon", "urban", "night"],
  ["abstract", "fire", "color", "fluid"],
  ["landscape", "horizon", "nature", "cinematic"],
];

const prompts = [
  "A cosmic dreamscape with swirling nebula clouds, cinematic lighting, 8k ultra-detailed, volumetric fog",
  "Neon-drenched cyberpunk street scene with holographic billboards, rain-soaked pavement, moody atmosphere",
  "Abstract liquid metal flowing through crystalline structures, iridescent reflections, macro photography",
  "Misty mountain landscape at golden hour, ethereal fog, photorealistic render, Unreal Engine 5",
];

const videoPrompts = [
  "Slow dolly-in through swirling nebula clouds as crystalline structures rotate. Camera drifts weightlessly, aurora borealis ribbons dancing. 4K, 24fps, anamorphic lens flares.",
  "Tracking shot down rain-soaked cyberpunk alley, neon signs flickering, holographic ads glitching. Moody atmosphere, volumetric fog. Cinematic 24fps.",
  "Macro camera orbiting liquid metal surface, iridescent reflections shifting. Pull back to reveal full abstract sculpture. Slow motion, 60fps.",
  "Aerial drone sweeping over misty mountains at golden hour. Fog rolls through valleys, sun rays pierce clouds. Cinematic orchestral score. 4K.",
];

const stats = [
  { views: "24.8K", downloads: "3,412", likes: "847" },
  { views: "31.4K", downloads: "2,180", likes: "612" },
  { views: "18.6K", downloads: "1,940", likes: "534" },
  { views: "22.1K", downloads: "1,620", likes: "441" },
];

const relatedPhotos = [
  { photo: "photo-1558618666-fcd25c85cd64", title: "Neon Gradient" },
  { photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire" },
  { photo: "photo-1549880338-65ddcdfd017b", title: "Mountain Vista" },
  { photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard" },
  { photo: "photo-1506905925346-21bda4d32df4", title: "Alpine Glow" },
  { photo: "photo-1518020382113-a7e8fc38eac9", title: "Geometric Architecture" },
  { photo: "photo-1547036967-23d11aacaee0", title: "Night Sky" },
  { photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City Night" },
  { photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar 01" },
  { photo: "photo-1501854140801-50d01698950b", title: "Forest Spirit" },
  { photo: "photo-1576091160550-2173dba999ef", title: "Abstract Fluid" },
  { photo: "photo-1518770660439-4636190af475", title: "Tech Circuit Board" },
  { photo: "photo-1462275646964-a0e3386b89fa", title: "Studio Setup" },
  { photo: "photo-1500462918059-b1a0cb512f1d", title: "Sunset Haze" },
  { photo: "photo-1543722530-d2c3201371e7", title: "Luxury Interior" },
  { photo: "photo-1533158628620-7e4d0a003147", title: "Portrait Study" },
  { photo: "photo-1505765050516-f72dcac9c60e", title: "Tropical Shore" },
  { photo: "photo-1470071459604-3b5ec3a7fe05", title: "Golden Valley" },
];

const relatedHeights = [220, 280, 180, 240, 195, 260, 170, 230, 205, 250, 185, 265, 200, 245, 175, 235, 210, 255];

export default function QuickViewPanel() {
  const { image, open, close, isOpen } = useQuickView();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [boardOpen, setBoardOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePromptTab, setActivePromptTab] = useState<"image" | "video">("image");
  const [videoCopied, setVideoCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const idx = image ? (parseInt(image.id) || 0) : 0;
  const creator = creators[idx % creators.length];
  const title = image?.title || titles[idx % titles.length];
  const prompt = prompts[idx % prompts.length];
  const videoPrompt = videoPrompts[idx % videoPrompts.length];
  const tagList = tags[idx % tags.length];
  const stat = stats[idx % stats.length];
  const shopLink = image ? resolveLink(image.id) : null;
  const isLoggedIn = (() => { try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; } })();

  // Shuffle related photos based on current image to avoid showing same image
  const shuffledRelated = relatedPhotos.filter(p => p.photo !== image?.photo);

  useEffect(() => {
    if (!image) return;
    seedDemoComments(image.id);
    setComments(getCommentsForImage(image.id));
    setLiked(false);
    setLikeCount(parseInt(stat.likes.replace(",", "")));
    const sync = () => setComments(getCommentsForImage(image.id));
    window.addEventListener("ra_comments_changed", sync);
    return () => window.removeEventListener("ra_comments_changed", sync);
  }, [image?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!image) return null;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyVideoPrompt = () => {
    navigator.clipboard.writeText(videoPrompt).catch(() => {});
    setVideoCopied(true);
    setTimeout(() => setVideoCopied(false), 2000);
  };

  const handleExpandToFullPage = () => {
    close();
    navigate(`/image/${image.id}?photo=${encodeURIComponent(image.photo)}`);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    const display = localStorage.getItem("ra_display") || "You";
    const handle = localStorage.getItem("ra_username") || "you";
    addComment({
      imageId: image.id, authorName: display, authorHandle: `@${handle}`,
      authorColor: "#E8472A",
      authorInit: display.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      text: commentText.trim(), isOwner: true,
    });
    setCommentText("");
  };

  const handleRelatedClick = (photo: string, relIdx: number) => {
    const globalIdx = relatedPhotos.findIndex(p => p.photo === photo);
    open({
      id: String(globalIdx >= 0 ? globalIdx : relIdx),
      photo,
      title: relatedPhotos.find(p => p.photo === photo)?.title,
    });
  };

  const actionBtnClass = "flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl border border-foreground/[0.12] hover:border-foreground/25 text-[0.84rem] font-semibold text-muted hover:text-foreground transition-colors";

  return (
    <>
      {/* Full-screen two-panel overlay — no dim */}
      <div
        className="fixed inset-0 z-[500] flex"
        style={{ animation: "fadeInQuick 0.2s ease both" }}
      >
        {/* Left panel — image detail (scrollable) */}
        <div
          ref={panelRef}
          className="w-full max-w-[580px] bg-card border-r border-foreground/[0.08] overflow-y-auto shadow-2xl flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "slideInRight 0.28s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-foreground/[0.06] px-5 py-3 flex items-center justify-between z-10">
            <button onClick={close} className="flex items-center gap-2 text-[0.82rem] text-muted hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
              <span className="text-[0.72rem]">Press Esc To Close</span>
            </button>
            <button onClick={handleExpandToFullPage} className="flex items-center gap-1.5 text-[0.82rem] text-muted hover:text-foreground transition-colors">
              <Maximize2 className="w-3.5 h-3.5" /> Open Full Page
            </button>
          </div>

          {/* Image */}
          <div className="relative group cursor-pointer" onClick={handleExpandToFullPage}>
            <img
              src={`https://images.unsplash.com/${image.photo}?w=600&h=500&fit=crop&q=85`}
              alt={title}
              className="w-full object-cover"
              style={{ maxHeight: 420 }}
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="w-6 h-6 text-primary-foreground drop-shadow-lg" />
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5">
            <h2 className="font-display text-[1.4rem] font-black tracking-[-0.03em] leading-tight mb-3">{title}</h2>

            <Link to={`/creator/${creator.id}`} onClick={close} className="flex items-center gap-3 mb-5 no-underline">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.7rem] font-bold text-primary-foreground" style={{ background: creator.c }}>
                {creator.i}
              </div>
              <div>
                <div className="text-[0.88rem] font-semibold text-foreground">{creator.n}</div>
                <div className="text-[0.72rem] text-muted">{creator.handle}</div>
              </div>
              <button className="ml-auto text-[0.78rem] font-semibold text-accent border border-accent/30 px-4 py-1.5 rounded-lg hover:bg-accent/10 transition-colors" onClick={(e) => e.preventDefault()}>
                Follow
              </button>
            </Link>

            {/* Stats */}
            <div className="flex items-center justify-center gap-5 mb-5 pb-5 border-b border-foreground/[0.06] flex-wrap">
              <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
                <Eye className="w-3.5 h-3.5" /> {stat.views} <span className="text-[0.68rem]">views</span>
              </div>
              <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
                <Download className="w-3.5 h-3.5" /> {stat.downloads} <span className="text-[0.68rem]">downloads</span>
              </div>
              <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
                <Heart className="w-3.5 h-3.5" /> {stat.likes} <span className="text-[0.68rem]">likes</span>
              </div>
              <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
                <Bookmark className="w-3.5 h-3.5" /> 234 <span className="text-[0.68rem]">saves</span>
              </div>
              <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
                <Share2 className="w-3.5 h-3.5" /> 128 <span className="text-[0.68rem]">shares</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={handleLike} className={`flex items-center gap-1.5 justify-center py-2.5 rounded-xl border text-[0.84rem] font-semibold transition-colors ${liked ? "border-accent bg-accent/10 text-accent" : "border-foreground/[0.12] hover:border-foreground/25 text-muted hover:text-foreground"}`}>
                <Heart className={`w-4 h-4 ${liked ? "fill-accent" : ""}`} />
                {likeCount.toLocaleString()}
              </button>
              <button onClick={() => setBoardOpen(true)} className={actionBtnClass}>
                <Bookmark className="w-4 h-4" /> Save
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button className="flex items-center gap-1.5 justify-center py-2.5 rounded-xl border border-foreground/[0.12] hover:border-foreground/25 text-[0.78rem] font-semibold text-muted hover:text-foreground transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button onClick={() => setShowEmbed(true)} className="flex items-center gap-1.5 justify-center py-2.5 rounded-xl border border-foreground/[0.12] hover:border-foreground/25 text-[0.78rem] font-semibold text-muted hover:text-foreground transition-colors">
                <Code className="w-3.5 h-3.5" /> Embed
              </button>
              <button className="flex items-center gap-1.5 justify-center py-2.5 rounded-xl border border-foreground/[0.12] hover:border-foreground/25 text-[0.78rem] font-semibold text-muted hover:text-foreground transition-colors">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button onClick={() => { close(); navigate(`/image/${image.id}?recreate=1&photo=${encodeURIComponent(image.photo)}`); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-foreground/[0.1] text-[0.78rem] text-muted hover:text-foreground hover:border-foreground/25 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Recreate
              </button>
              <button onClick={() => { close(); navigate(`/image/${image.id}#prompts&photo=${encodeURIComponent(image.photo)}`); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-foreground/[0.1] text-[0.78rem] text-muted hover:text-foreground hover:border-foreground/25 transition-colors">
                <Video className="w-3.5 h-3.5" /> Animate
              </button>
              <button onClick={() => { close(); navigate(`/image/${image.id}?photo=${encodeURIComponent(image.photo)}`); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-foreground/[0.1] text-[0.78rem] text-muted hover:text-foreground hover:border-foreground/25 transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <div className="border border-foreground/[0.08] rounded-xl mb-5 overflow-hidden">
              <button onClick={() => setPromptOpen(!promptOpen)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-foreground/[0.02] transition-colors">
                <span className="text-[0.84rem] font-semibold">AI Prompt</span>
                {promptOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
              </button>
              {promptOpen && (
                <div className="px-4 pb-4">
                  <div className="flex gap-0 mb-3 border-b border-foreground/[0.06]">
                    {([
                      { key: "image" as const, label: "Image Prompt", icon: Image },
                      { key: "video" as const, label: "Video Prompt", icon: Video },
                    ]).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActivePromptTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-[0.75rem] font-medium border-b-2 transition-colors -mb-px ${
                          activePromptTab === tab.key
                            ? "border-accent text-accent"
                            : "border-transparent text-muted hover:text-foreground"
                        }`}
                      >
                        <tab.icon className="w-3 h-3" /> {tab.label}
                      </button>
                    ))}
                  </div>

                  {activePromptTab === "image" ? (
                    <>
                      <p className="text-[0.82rem] text-muted leading-[1.6] mb-3">{prompt}</p>
                      <button onClick={handleCopyPrompt} className="flex items-center gap-1.5 text-[0.78rem] font-medium text-accent hover:text-accent/80 transition-colors">
                        {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Prompt</>}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[0.82rem] text-muted leading-[1.6] mb-3">{videoPrompt}</p>
                      <button onClick={handleCopyVideoPrompt} className="flex items-center gap-1.5 text-[0.78rem] font-medium text-accent hover:text-accent/80 transition-colors">
                        {videoCopied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Prompt</>}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {tagList.map(tag => (
                <Link key={tag} to={`/explore?q=${tag}`} onClick={close} className="text-[0.75rem] font-medium text-muted bg-foreground/[0.04] border border-foreground/[0.08] px-3 py-1.5 rounded-lg hover:border-foreground/20 hover:text-foreground transition-colors no-underline">
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Shop link */}
            {shopLink && (
              <a href={shopLink.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border border-foreground/[0.08] rounded-xl mb-5 no-underline hover:border-accent/30 transition-colors group/shop">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.84rem] font-semibold text-foreground">{shopLink.label}</div>
                  {shopLink.site && <div className="text-[0.72rem] text-muted">via {shopLink.site}</div>}
                </div>
                <ExternalLink className="w-4 h-4 text-accent shrink-0" />
              </a>
            )}

            {/* Comments */}
            <div className="border-t border-foreground/[0.06] pt-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[0.84rem] font-semibold">
                  <MessageCircle className="w-4 h-4 text-muted" />
                  {comments.length} Comments
                </div>
                <Link to={`/image/${image.id}`} onClick={close} className="text-[0.75rem] text-accent hover:underline no-underline">
                  View all →
                </Link>
              </div>

              {comments.slice(0, 2).map(c => (
                <div key={c.id} className="flex items-start gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-primary-foreground shrink-0" style={{ background: c.authorColor }}>
                    {c.authorInit}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.78rem] font-semibold">{c.authorName}</span>
                    <p className="text-[0.78rem] text-muted leading-[1.5] mb-1">{c.text}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[0.68rem] text-muted/60">{formatRelativeTime(c.createdAt)}</span>
                      <button
                        onClick={() => { toggleLikeComment(c.id); }}
                        className={`flex items-center gap-0.5 text-[0.68rem] transition-colors ${c.likedByMe ? "text-accent" : "text-muted hover:text-foreground"}`}
                      >
                        <Heart className={`w-3 h-3 ${c.likedByMe ? "fill-accent" : ""}`} />
                        {c.likes > 0 && c.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {isLoggedIn ? (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[0.55rem] font-bold text-primary-foreground shrink-0">
                    {(localStorage.getItem("ra_display") || "Y").charAt(0).toUpperCase()}
                  </div>
                  <input
                    className="flex-1 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg px-3 py-2 text-[0.82rem] focus:outline-none focus:border-accent transition-colors"
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  />
                  {commentText.trim() && (
                    <button onClick={handleSubmitComment} className="text-[0.82rem] font-semibold text-accent hover:text-accent/80 transition-colors">
                      Post
                    </button>
                  )}
                </div>
              ) : (
                <Link to="/login" onClick={close} className="text-[0.82rem] text-accent hover:underline no-underline">
                  Log in to comment
                </Link>
              )}
            </div>

            {/* Expand CTA */}
            <button
              onClick={handleExpandToFullPage}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-foreground text-primary-foreground text-[0.88rem] font-semibold hover:bg-accent transition-colors group"
            >
              <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Open Full Image Page
            </button>
          </div>
        </div>

        {/* Right panel — related images masonry (scrollable) */}
        <div
          className="flex-1 overflow-y-auto bg-background p-4"
          onClick={close}
        >
          <div className="columns-2 lg:columns-3 gap-3" onClick={(e) => e.stopPropagation()}>
            {shuffledRelated.map((item, i) => {
              const globalIdx = relatedPhotos.findIndex(p => p.photo === item.photo);
              const overlayIdx = globalIdx >= 0 ? globalIdx : i;
              return (
                <div
                  key={`${item.photo}-${i}`}
                  className="break-inside-avoid mb-3 relative group rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => handleRelatedClick(item.photo, i)}
                >
                  <img
                    src={`https://images.unsplash.com/${item.photo}?w=400&h=${relatedHeights[i % relatedHeights.length]}&fit=crop&q=75`}
                    alt={item.title}
                    className="w-full object-cover rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                    style={{ height: relatedHeights[i % relatedHeights.length] }}
                    loading="lazy"
                  />
                  <ImageCardOverlay index={overlayIdx} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SaveToBoardModal open={boardOpen} onClose={() => setBoardOpen(false)} imageId={String(idx)} imagePhoto={image?.photo || ""} imageTitle={title} />

      {showEmbed && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setShowEmbed(false)}>
          <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
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
                  <img src={`https://images.unsplash.com/${image.photo}?w=500&h=300&fit=crop&q=80`} alt="" className="w-full block" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-primary-foreground" style={{ background: creator.c }}>{creator.i}</div>
                    <span className="text-[0.78rem] text-muted">By <strong className="text-foreground">{creator.n}</strong></span>
                  </div>
                  <span className="text-[0.65rem] font-bold text-muted tracking-[0.06em]">REAL ART</span>
                </div>
              </div>
              <label className="text-[0.78rem] font-semibold mb-2 block">Embed code</label>
              <div className="relative">
                <pre className="bg-foreground text-primary-foreground/70 rounded-lg p-4 text-[0.72rem] leading-[1.6] overflow-x-auto font-mono whitespace-pre-wrap break-all">
                  {`<iframe src="https://realart.ai/embed/${image.id}" width="600" height="600" frameborder="0" style="border-radius:12px;overflow:hidden" allowfullscreen></iframe>`}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe src="https://realart.ai/embed/${image.id}" width="600" height="600" frameborder="0" style="border-radius:12px;overflow:hidden" allowfullscreen></iframe>`).catch(() => {});
                    setEmbedCopied(true);
                    setTimeout(() => setEmbedCopied(false), 2000);
                  }}
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

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(-100%); opacity: 0.6; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInQuick {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
