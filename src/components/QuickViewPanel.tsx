import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X, Download, Heart, Bookmark, Share2, RefreshCw, Video, Pencil,
  Expand, Eye, Copy, Check, ChevronDown, ChevronUp, ExternalLink,
  MessageCircle, ShoppingBag, Maximize2, ZoomIn
} from "lucide-react";
import { useQuickView } from "@/context/QuickViewContext";
import SaveToBoardModal from "@/components/SaveToBoardModal";
import { getCommentsForImage, seedDemoComments, formatRelativeTime, toggleLikeComment, type Comment } from "@/lib/commentStore";
import { resolveLink } from "@/lib/linkStore";
import { addComment } from "@/lib/commentStore";

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

const stats = [
  { views: "24.8K", downloads: "3,412", likes: "847" },
  { views: "31.4K", downloads: "2,180", likes: "612" },
  { views: "18.6K", downloads: "1,940", likes: "534" },
  { views: "22.1K", downloads: "1,620", likes: "441" },
];

export default function QuickViewPanel() {
  const { image, close, isOpen } = useQuickView();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [boardOpen, setBoardOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const idx = image ? (parseInt(image.id) || 0) : 0;
  const creator = creators[idx % creators.length];
  const title = image?.title || titles[idx % titles.length];
  const prompt = prompts[idx % prompts.length];
  const tagList = tags[idx % tags.length];
  const stat = stats[idx % stats.length];
  const shopLink = image ? resolveLink(image.id) : null;
  const isLoggedIn = (() => { try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; } })();

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

  const handleExpandToFullPage = () => {
    close();
    navigate(`/image/${image.id}`);
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

  const actionBtnClass = "flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl border border-foreground/[0.12] hover:border-foreground/25 text-[0.84rem] font-semibold text-muted hover:text-foreground transition-colors";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[500] transition-opacity"
        onClick={close}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-card border-l border-foreground/[0.08] z-[501] overflow-y-auto shadow-2xl"
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
            <Maximize2 className="w-3.5 h-3.5" /> Open full page
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
          {/* Title */}
          <h2 className="font-display text-[1.4rem] font-black tracking-[-0.03em] leading-tight mb-3">{title}</h2>

          {/* Creator */}
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
          <div className="flex items-center gap-5 mb-5 pb-5 border-b border-foreground/[0.06]">
            <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
              <Eye className="w-3.5 h-3.5" /> {stat.views} <span className="text-[0.68rem]">views</span>
            </div>
            <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
              <Download className="w-3.5 h-3.5" /> {stat.downloads} <span className="text-[0.68rem]">downloads</span>
            </div>
            <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
              <Heart className="w-3.5 h-3.5" /> {stat.likes} <span className="text-[0.68rem]">likes</span>
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
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button className={actionBtnClass}>
              <Download className="w-4 h-4" /> Download
            </button>
            <button className={actionBtnClass}>
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-5">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-foreground/[0.1] text-[0.78rem] text-muted hover:text-foreground hover:border-foreground/25 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Recreate
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-foreground/[0.1] text-[0.78rem] text-muted hover:text-foreground hover:border-foreground/25 transition-colors">
              <Video className="w-3.5 h-3.5" /> Animate
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-foreground/[0.1] text-[0.78rem] text-muted hover:text-foreground hover:border-foreground/25 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* Prompt accordion */}
          <div className="border border-foreground/[0.08] rounded-xl mb-5 overflow-hidden">
            <button onClick={() => setPromptOpen(!promptOpen)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-foreground/[0.02] transition-colors">
              <span className="text-[0.84rem] font-semibold">AI Prompt</span>
              {promptOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>
            {promptOpen && (
              <div className="px-4 pb-4">
                <p className="text-[0.82rem] text-muted leading-[1.6] mb-3">{prompt}</p>
                <button onClick={handleCopyPrompt} className="flex items-center gap-1.5 text-[0.78rem] font-medium text-accent hover:text-accent/80 transition-colors">
                  {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy prompt</>}
                </button>
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
            Open full image page
          </button>
        </div>
      </div>

      <SaveToBoardModal open={boardOpen} onClose={() => setBoardOpen(false)} />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
