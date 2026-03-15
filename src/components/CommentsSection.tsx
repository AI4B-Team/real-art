import { useState, useEffect, useRef } from "react";
import { Heart, Trash2, SmilePlus, ChevronDown, ChevronUp, Send, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getCommentsForImage, addComment, deleteComment,
  toggleLikeComment, seedDemoComments, formatRelativeTime,
  type Comment,
} from "@/lib/commentStore";

const EMOJI_QUICK = ["😊", "😂", "❤️", "🔥", "✨", "👏", "💯", "🎨"];

interface CommentsSectionProps {
  imageId: string;
}

export default function CommentsSection({ imageId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoggedIn = (() => { try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; } })();
  const userDisplay = (() => { try { return localStorage.getItem("ra_display") || "You"; } catch { return "You"; } })();
  const userHandle = (() => { try { return (localStorage.getItem("ra_username") || "you").toLowerCase(); } catch { return "you"; } })();
  const userInit = userDisplay.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const refresh = () => setComments(getCommentsForImage(imageId));

  useEffect(() => {
    seedDemoComments(imageId);
    refresh();
    const handler = () => refresh();
    window.addEventListener("ra_comments_changed", handler);
    return () => window.removeEventListener("ra_comments_changed", handler);
  }, [imageId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  const handlePost = () => {
    if (!text.trim() || !isLoggedIn || submitting) return;
    setSubmitting(true);
    addComment({
      imageId,
      authorName: userDisplay,
      authorHandle: `@${userHandle}`,
      authorColor: "hsl(var(--accent))",
      authorInit: userInit,
      text: text.trim(),
      isOwner: true,
    });
    setText("");
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  const handleLike = (id: string) => {
    toggleLikeComment(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteComment(id);
    refresh();
  };

  return (
    <div className="mt-10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted" />
          <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em]">Comments</h2>
          <span className="text-[0.75rem] text-muted ml-1">{comments.length}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
        )}
      </button>

      {expanded && (
        <div className="space-y-4">
          {/* Comment list */}
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3 group">
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white shrink-0 mt-0.5"
                    style={{ background: c.authorColor }}
                  >
                    {c.authorInit}
                  </div>

                  {/* Bubble */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-card border border-foreground/[0.06] rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.8rem] font-semibold">{c.authorName}</span>
                        <span className="text-[0.68rem] text-muted lowercase">{c.authorHandle}</span>
                      </div>
                      <p className="text-[0.82rem] text-foreground/80 leading-[1.55]">{c.text}</p>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-3 mt-1.5 px-1">
                      <span className="text-[0.68rem] text-muted">{formatRelativeTime(c.createdAt)}</span>
                      <button
                        onClick={() => handleLike(c.id)}
                        className={`flex items-center gap-1 text-[0.74rem] font-medium transition-colors ${c.likedByMe ? "text-accent" : "text-muted hover:text-foreground"}`}
                      >
                        <Heart className={`w-3 h-3 ${c.likedByMe ? "fill-accent" : ""}`} />
                        {c.likes > 0 && <span>{c.likes}</span>}
                      </button>
                      {c.isOwner && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="flex items-center gap-1 text-[0.72rem] text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[0.82rem] text-muted text-center py-6">No comments yet — be the first!</p>
          )}

          {/* Compose area */}
          {isLoggedIn ? (
            <div className="flex gap-3 items-start">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white shrink-0 mt-0.5 bg-accent/80"
              >
                {userInit || "?"}
              </div>
              <div className="flex-1 relative">
                <div className="border border-foreground/[0.08] rounded-xl bg-card overflow-hidden focus-within:border-accent/30 transition-colors">
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a comment..."
                    rows={1}
                    className="w-full px-3.5 pt-3 pb-2 text-[0.82rem] bg-transparent outline-none resize-none leading-[1.55] min-h-[40px] max-h-[120px]"
                  />
                  <div className="flex items-center justify-between px-3 pb-2.5">
                    <div className="relative">
                      <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="text-muted hover:text-foreground transition-colors p-1"
                      >
                        <SmilePlus className="w-4 h-4" />
                      </button>
                      {showEmoji && (
                        <div className="absolute bottom-full left-0 mb-2 bg-card border border-foreground/[0.08] rounded-xl shadow-lg p-2 flex gap-1 z-10">
                          {EMOJI_QUICK.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => { setText(prev => prev + emoji); setShowEmoji(false); textareaRef.current?.focus(); }}
                              className="text-[1.1rem] hover:scale-125 transition-transform p-1"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.65rem] text-muted">↵ to send</span>
                      <button
                        onClick={handlePost}
                        disabled={!text.trim() || submitting}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-foreground text-primary-foreground text-[0.78rem] font-semibold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" /> Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-[0.82rem] text-muted">
              <Link to="/login" className="text-accent font-semibold hover:underline">Log in</Link>
              {" "}or{" "}
              <Link to="/signup" className="text-accent font-semibold hover:underline">create an account</Link>
              {" "}to leave a comment.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
