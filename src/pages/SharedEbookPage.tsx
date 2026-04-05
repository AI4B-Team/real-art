import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MessageSquare, Send, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  ThumbsUp, Share2, Download, BookOpen, User, Clock, Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Page, CanvasElement } from "@/components/ebook/EbookCanvasEditor";
import { getElementsForPage } from "@/components/ebook/EbookCanvasEditor";

/* ── Sample data (would come from DB in production) ── */
const SAMPLE_PAGES: Page[] = [
  { id: "cover", title: "Cover Page", type: "cover" },
  { id: "toc", title: "Table of Contents", type: "toc" },
  { id: "ch1", title: "Chapter 1: Introduction to AI Marketing", type: "chapter" },
  { id: "ch1-p1", title: "Chapter 1 – Page 1", type: "chapter-page" },
  { id: "ch2", title: "Chapter 2: Understanding Your Audience", type: "chapter" },
  { id: "ch2-p1", title: "Chapter 2 – Page 1", type: "chapter-page" },
  { id: "ch3", title: "Chapter 3: AI Tools & Platforms", type: "chapter" },
  { id: "back", title: "Back Cover", type: "back" },
];

const BOOK_TITLE = "The Ultimate Guide to AI Marketing";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  pageRef?: number;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: "1", author: "Sarah Chen", avatar: "SC", text: "Really insightful chapter on AI-driven content strategies! The examples are practical and easy to follow.", timestamp: "2 hours ago", likes: 5, liked: false, pageRef: 3 },
  { id: "2", author: "Marcus Johnson", avatar: "MJ", text: "The data visualization section could use more real-world case studies. Otherwise, great work!", timestamp: "5 hours ago", likes: 2, liked: false, pageRef: 5 },
  { id: "3", author: "Priya Patel", avatar: "PP", text: "Love how clearly the ROI frameworks are explained. Bookmarking this for my team.", timestamp: "1 day ago", likes: 8, liked: false },
];

export default function SharedEbookPage() {
  const { shareId } = useParams();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoom, setZoom] = useState(85);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"comments" | "pages">("comments");
  const [viewCount] = useState(142);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const pages = SAMPLE_PAGES;
  const currentPage = pages[currentPageIndex];
  const elements = currentPage ? getElementsForPage(currentPage, pages, BOOK_TITLE) : [];

  const goTo = (dir: "prev" | "next") => {
    setCurrentPageIndex(i => dir === "prev" ? Math.max(0, i - 1) : Math.min(pages.length - 1, i + 1));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo("prev");
      if (e.key === "ArrowRight") goTo("next");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const name = guestName.trim() || "Anonymous";
    setComments(prev => [{
      id: `c-${Date.now()}`,
      author: name,
      avatar: name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase(),
      text: newComment.trim(),
      timestamp: "Just now",
      likes: 0,
      liked: false,
      pageRef: currentPageIndex + 1,
    }, ...prev]);
    setNewComment("");
    toast({ title: "Comment added!" });
  };

  const toggleLike = (id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  const renderElement = (el: CanvasElement) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: el.x, top: el.y, width: el.width, height: el.height,
      opacity: el.opacity ?? 1,
      borderRadius: el.borderRadius ?? 0,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      zIndex: el.zIndex ?? 0,
    };

    if (el.type === "image") {
      return <img key={el.id} src={el.src} alt="" style={style} className="object-cover" draggable={false} />;
    }
    if (el.type === "shape") {
      return (
        <div key={el.id} style={{
          ...style,
          backgroundColor: el.fill || "transparent",
          border: el.stroke ? `${el.strokeWidth || 1}px solid ${el.stroke}` : undefined,
          borderRadius: el.shapeType === "circle" ? "50%" : style.borderRadius,
        }} />
      );
    }
    if (el.type === "text") {
      return (
        <div key={el.id} style={{
          ...style,
          fontSize: el.fontSize || 16,
          fontFamily: el.fontFamily || "Inter",
          color: el.textColor || "hsl(var(--foreground))",
          textAlign: el.textAlign || "left",
          fontWeight: el.fontWeight || "normal",
          fontStyle: el.fontStyle || "normal",
          textDecoration: el.textDecoration || "none",
          lineHeight: 1.5,
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }} dangerouslySetInnerHTML={{ __html: el.content || "" }} />
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-foreground/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-accent" />
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">{BOOK_TITLE}</h1>
            <p className="text-[11px] text-muted-foreground">Shared eBook · {pages.length} pages</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <Eye className="w-3.5 h-3.5" /> {viewCount} views
          </div>
          <button onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foreground/[0.08] hover:bg-foreground/[0.04] text-xs font-medium text-foreground transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={() => toast({ title: "Download coming soon!" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content: Page Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page navigation bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-background/50 border-b border-foreground/[0.04]">
            <div className="flex items-center gap-2">
              <button onClick={() => goTo("prev")} disabled={currentPageIndex === 0}
                className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted-foreground disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-foreground min-w-[80px] text-center">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              <button onClick={() => goTo("next")} disabled={currentPageIndex === pages.length - 1}
                className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted-foreground disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{currentPage?.title}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted-foreground">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted-foreground">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Page canvas */}
          <div ref={pageContainerRef} className="flex-1 overflow-auto flex items-start justify-center p-8 bg-muted/30">
            <div
              className="bg-background shadow-lg rounded-sm relative"
              style={{
                width: 480 * (zoom / 100),
                height: 640 * (zoom / 100),
                transform: `scale(1)`,
                transformOrigin: "top center",
              }}
            >
              <div style={{
                width: 480, height: 640,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top left",
                position: "relative",
                backgroundColor: currentPage?.bgColor || undefined,
              }}>
                {elements.map(renderElement)}
              </div>
            </div>
          </div>

          {/* Bottom page dots */}
          <div className="flex items-center justify-center gap-1.5 py-3 bg-background/50 border-t border-foreground/[0.04]">
            {pages.map((_, i) => (
              <button key={i} onClick={() => setCurrentPageIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentPageIndex ? "bg-accent w-6" : "bg-foreground/[0.15] hover:bg-foreground/[0.25]"}`} />
            ))}
          </div>
        </div>

        {/* Right Sidebar: Comments & Pages */}
        <div className="w-80 border-l border-foreground/[0.08] bg-background flex flex-col shrink-0">
          {/* Tab switcher */}
          <div className="flex border-b border-foreground/[0.08]">
            {(["comments", "pages"] as const).map(tab => (
              <button key={tab} onClick={() => setSidebarTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold text-center transition-colors capitalize ${
                  sidebarTab === tab ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab === "comments" ? `Comments (${comments.length})` : `Pages (${pages.length})`}
              </button>
            ))}
          </div>

          {sidebarTab === "comments" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Guest name prompt */}
              {showNamePrompt && (
                <div className="p-3 border-b border-foreground/[0.06] bg-accent/5">
                  <p className="text-xs text-muted-foreground mb-2">Enter your name to comment</p>
                  <div className="flex gap-2">
                    <input
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Your name..."
                      className="flex-1 px-3 py-2 rounded-lg border border-foreground/[0.08] bg-background text-sm outline-none focus:border-accent/40"
                    />
                    <button onClick={() => { if (guestName.trim()) setShowNamePrompt(false); }}
                      className="px-3 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90">
                      Set
                    </button>
                  </div>
                </div>
              )}

              {/* Comment input */}
              <div className="p-3 border-b border-foreground/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[9px] font-bold text-accent">
                    {(guestName || "A").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-foreground">{guestName || "Anonymous"}</span>
                  <span className="text-[10px] text-muted-foreground">· Page {currentPageIndex + 1}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-sm outline-none focus:border-accent/40"
                  />
                  <button onClick={handleAddComment}
                    className="p-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-40"
                    disabled={!newComment.trim()}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comment list */}
              <div className="flex-1 overflow-y-auto">
                {comments.map(c => (
                  <div key={c.id} className="p-3 border-b border-foreground/[0.04] hover:bg-foreground/[0.02] transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-0.5">
                        {c.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-foreground">{c.author}</span>
                          <span className="text-[10px] text-muted-foreground">{c.timestamp}</span>
                        </div>
                        {c.pageRef && (
                          <button onClick={() => setCurrentPageIndex(c.pageRef! - 1)}
                            className="text-[10px] text-accent hover:underline mb-1 inline-block">
                            Page {c.pageRef}
                          </button>
                        )}
                        <p className="text-sm text-foreground/80 leading-relaxed">{c.text}</p>
                        <button onClick={() => toggleLike(c.id)}
                          className={`flex items-center gap-1 mt-1.5 text-[11px] transition-colors ${c.liked ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                          <ThumbsUp className="w-3 h-3" /> {c.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Pages tab */
            <div className="flex-1 overflow-y-auto p-2">
              {pages.map((page, i) => (
                <button key={page.id} onClick={() => setCurrentPageIndex(i)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg mb-1 transition-all text-left ${
                    i === currentPageIndex ? "bg-accent/10 border border-accent/20" : "hover:bg-foreground/[0.03]"
                  }`}>
                  <div className={`w-10 h-14 rounded border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                    i === currentPageIndex ? "border-accent bg-accent/5 text-accent" : "border-foreground/[0.1] text-muted-foreground bg-foreground/[0.02]"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{page.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{page.type.replace("-", " ")}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
