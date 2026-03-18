import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  List, LayoutGrid, Columns, Grid3X3, Rss,
  Trash2, Settings, Sparkles, Plus, ChevronDown, Search, Filter as FilterIcon, Download, MoreHorizontal,
} from "lucide-react";

/* ─── Platform config ────────────────────────── */
const PLATFORMS = [
  { id: "facebook",  label: "Facebook",  color: "#1877F2", initial: "f" },
  { id: "instagram", label: "Instagram", color: "#E4405F", initial: "I" },
  { id: "threads",   label: "Threads",   color: "#000000", initial: "@" },
  { id: "x",         label: "X",         color: "#000000", initial: "X" },
  { id: "tiktok",    label: "TikTok",    color: "#000000", initial: "T" },
  { id: "linkedin",  label: "LinkedIn",  color: "#0A66C2", initial: "in" },
  { id: "bluesky",   label: "Bluesky",   color: "#0085FF", initial: "B" },
  { id: "youtube",   label: "YouTube",   color: "#FF0000", initial: "Y" },
  { id: "pinterest", label: "Pinterest", color: "#BD081C", initial: "P" },
  { id: "reddit",    label: "Reddit",    color: "#FF4500", initial: "R" },
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const VIEW_TABS = [
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "plan",     label: "Plan",     icon: List },
  { id: "kanban",   label: "Kanban",   icon: Columns },
  { id: "grid",     label: "Grid",     icon: Grid3X3 },
  { id: "feed",     label: "Feed",     icon: Rss },
];

/* ─── Dummy posts ────────────────────────────── */
function generateDummyPosts(month: number, year: number) {
  const titles = [
    "Content Strategy Secrets!", "Visual Identity Vibe Check!", "Your Creative Superpower?",
    "Nail Your Niche! 🤩", "Unleash Your Creative Brand!", "Engagement Tactics REEL!",
    "What's Your Superpower Story?", "Brainstorming Blitz!", "Content Strategy Poll! 📊",
  ];
  const posts: { day: number; time: string; title: string; platform: string; score: number }[] = [];
  for (let d = 4; d <= 28; d += 1) {
    if (Math.random() > 0.45) {
      posts.push({
        day: d,
        time: `${Math.floor(Math.random() * 12 + 1)}:${Math.random() > 0.5 ? "30" : "00"} ${Math.random() > 0.5 ? "AM" : "PM"}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        platform: PLATFORMS[Math.floor(Math.random() * 4)].id,
        score: Math.floor(Math.random() * 30 + 65),
      });
    }
  }
  return posts;
}

/* ─── Component ──────────────────────────────── */

interface SocialContentPanelProps {
  onClose: () => void;
}

export default function SocialContentPanel({ onClose }: SocialContentPanelProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(["facebook", "instagram"]));
  const [activeView, setActiveView] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showDrafts, setShowDrafts] = useState(true);
  const [posts] = useState(() => generateDummyPosts(currentMonth, currentYear));
  const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPlatforms.size === PLATFORMS.length) {
      setSelectedPlatforms(new Set());
    } else {
      setSelectedPlatforms(new Set(PLATFORMS.map(p => p.id)));
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background mt-3 overflow-hidden">
      {/* Platform selection */}
      <div className="p-4 border-b border-foreground/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[0.88rem] font-bold text-center flex-1">Choose Your Platforms To Generate 7 Days Of Content For Each One</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors shrink-0 ml-2"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-2 justify-center flex-wrap">
          <button
            onClick={selectAll}
            className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium border transition-colors ${
              selectedPlatforms.size === PLATFORMS.length
                ? "bg-accent/10 border-accent text-accent"
                : "border-foreground/[0.1] text-muted hover:text-foreground"
            }`}
          >
            Select All
          </button>
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[0.72rem] font-bold transition-all ${
                selectedPlatforms.has(p.id)
                  ? "ring-2 ring-offset-2 ring-accent scale-110"
                  : "opacity-50 hover:opacity-100"
              }`}
              style={{ backgroundColor: p.color + "20", color: p.color }}
              title={p.label}
            >
              {p.initial}
            </button>
          ))}
        </div>
      </div>

      {/* View tabs toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/[0.06]">
        <div className="flex items-center gap-1">
          {VIEW_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all ${
                activeView === tab.id
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-[0.78rem] font-medium hover:bg-red-50 transition-colors">
            <Trash2 size={13} /> Delete All
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foreground/[0.1] text-[0.78rem] font-medium hover:bg-foreground/[0.04] transition-colors">
            <Settings size={13} /> Connect Accounts
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foreground/[0.1] text-[0.78rem] font-medium hover:bg-foreground/[0.04] transition-colors">
            <Sparkles size={13} /> Best Time To Post
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[0.78rem] font-bold hover:bg-accent/85 transition-colors">
            <Plus size={13} /> New Post <ChevronDown size={11} />
          </button>
        </div>
      </div>

      {/* Calendar sub-header */}
      {activeView === "calendar" && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-foreground/[0.04] text-[0.75rem] font-medium">
              <Grid3X3 size={12} /> Month <ChevronDown size={10} />
            </button>
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center" title="Today">
              <CalendarIcon size={12} />
            </button>
            <button onClick={prevMonth} className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center hover:bg-foreground/[0.08]">
              <ChevronLeft size={14} />
            </button>
            <button onClick={nextMonth} className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center hover:bg-foreground/[0.08]">
              <ChevronRight size={14} />
            </button>
            <span className="text-[0.88rem] font-bold ml-1">{monthName} {currentYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[0.75rem] text-muted cursor-pointer">
              <div
                onClick={() => setShowDrafts(v => !v)}
                className={`w-8 h-[18px] rounded-full transition-colors cursor-pointer relative ${showDrafts ? "bg-accent" : "bg-foreground/[0.15]"}`}
              >
                <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${showDrafts ? "left-[16px]" : "left-[2px]"}`} />
              </div>
              Drafts
            </label>
            <span className="text-[0.72rem] text-muted">{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center"><Search size={12} /></button>
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center"><FilterIcon size={12} /></button>
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center"><Download size={12} /></button>
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center"><MoreHorizontal size={12} /></button>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      {activeView === "calendar" && (
        <div className="p-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-[0.72rem] font-semibold text-muted text-center py-1">{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7 border-t border-l border-foreground/[0.06]">
            {cells.map((day, i) => {
              const dayPosts = day ? posts.filter(p => p.day === day) : [];
              return (
                <div
                  key={i}
                  className="min-h-[90px] border-r border-b border-foreground/[0.06] p-1"
                >
                  {day && (
                    <>
                      <span className="text-[0.72rem] font-medium text-muted">{day}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayPosts.slice(0, 2).map((post, pi) => {
                          const platform = PLATFORMS.find(p => p.id === post.platform);
                          return (
                            <button
                              key={pi}
                              onClick={() => setSelectedPost(post)}
                              className="w-full text-left p-1 rounded bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-colors"
                            >
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: platform?.color }} />
                                <span className="text-[0.6rem] font-medium" style={{ color: platform?.color }}>{post.time}</span>
                              </div>
                              <p className="text-[0.62rem] text-foreground truncate leading-tight">{post.title}</p>
                              <span className="text-[0.58rem] font-bold" style={{ color: post.score >= 80 ? "#22c55e" : post.score >= 60 ? "#f59e0b" : "#ef4444" }}>
                                {post.score}
                              </span>
                            </button>
                          );
                        })}
                        {dayPosts.length > 2 && (
                          <span className="text-[0.58rem] text-muted">+{dayPosts.length - 2} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Non-calendar views placeholder */}
      {activeView !== "calendar" && (
        <div className="flex items-center justify-center py-16 text-muted">
          <div className="text-center">
            <Grid3X3 size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-[0.85rem] font-medium">{VIEW_TABS.find(t => t.id === activeView)?.label} View</p>
            <p className="text-[0.75rem] text-muted/60">Coming soon</p>
          </div>
        </div>
      )}

      {/* Post detail modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
          <div className="bg-background rounded-2xl shadow-2xl w-[90vw] max-w-[700px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-foreground/[0.06]">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[0.7rem] font-bold"
                  style={{ backgroundColor: PLATFORMS.find(p => p.id === selectedPost.platform)?.color }}
                >
                  {PLATFORMS.find(p => p.id === selectedPost.platform)?.initial}
                </div>
                <div>
                  <h3 className="text-[0.88rem] font-bold">{PLATFORMS.find(p => p.id === selectedPost.platform)?.label}</h3>
                  <p className="text-[0.7rem] text-muted">carousel</p>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="p-5">
              {/* Content Score */}
              <h4 className="text-[0.82rem] font-semibold text-muted mb-2">Content Score</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[1.1rem] font-black text-white ${
                  selectedPost.score >= 80 ? "bg-green-500" : selectedPost.score >= 60 ? "bg-amber-500" : "bg-red-500"
                }`}>
                  {selectedPost.score}
                </div>
                <span className={`text-[0.88rem] font-bold ${
                  selectedPost.score >= 80 ? "text-green-500" : selectedPost.score >= 60 ? "text-amber-500" : "text-red-500"
                }`}>
                  {selectedPost.score >= 80 ? "Great" : selectedPost.score >= 60 ? "Good" : "Needs Work"}
                </span>
              </div>

              {/* Scores breakdown */}
              <div className="space-y-3 mb-4">
                {[
                  { label: "Caption Quality", score: Math.min(100, selectedPost.score - 10), status: "Fixable" },
                  { label: "Hashtags", score: 100, status: "Good" },
                  { label: "Content Type", score: 100, status: "Good" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.82rem] font-medium">{item.label}</span>
                      <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded ${
                        item.status === "Good" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>{item.status}</span>
                    </div>
                    <span className="text-[0.82rem] font-bold">{item.score}/100</span>
                  </div>
                ))}
              </div>

              <p className="text-[0.82rem] font-semibold mb-2">{selectedPost.title}</p>
              <p className="text-[0.78rem] text-muted/70 leading-relaxed">
                Hey creatives! 🚀 We're diving into what makes you uniquely YOU. What's one 'superpower' or unique skill you bring to your personal brand?
              </p>

              <div className="flex items-center gap-2 mt-5">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-foreground/[0.1] text-[0.82rem] font-semibold hover:bg-foreground/[0.04] transition-colors">
                  ✏️ Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-colors">
                  🔄 Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
