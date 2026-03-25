import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Wand2, Plus, X, Search, Star, Clock, Zap,
  Video, FileText, Users, BookOpen, Mic, Image,
  Bot, BarChart2, Palette, Edit3, Globe, Music,
  Download, ArrowUpCircle, Eraser, Mail, Megaphone,
  Calendar, Package, Volume2,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── App definition ─── */
interface AppDef {
  id: string;
  label: string;
  icon: React.ElementType;
  bgColor: string;
  path: string;
}

export const ALL_APPS: AppDef[] = [
  { id: "create",            label: "Create",            icon: Wand2,         bgColor: "bg-emerald-500", path: "/create" },
  { id: "master-closer",     label: "Master Closer",     icon: Zap,           bgColor: "bg-emerald-600", path: "/apps" },
  { id: "editor",            label: "Editor",            icon: Edit3,         bgColor: "bg-purple-500",  path: "/editor" },
  { id: "sessions",          label: "Sessions",          icon: Video,         bgColor: "bg-blue-500",    path: "/apps" },
  { id: "ai-influencer",     label: "AI Influencer",     icon: Users,         bgColor: "bg-violet-500",  path: "/apps" },
  { id: "ai-story",          label: "AI Story",          icon: BookOpen,      bgColor: "bg-amber-500",   path: "/apps" },
  { id: "viral-shorts",      label: "Viral Shorts",      icon: Zap,           bgColor: "bg-red-500",     path: "/apps" },
  { id: "voiceovers",        label: "Voiceovers",        icon: Mic,           bgColor: "bg-cyan-500",    path: "/apps" },
  { id: "voice-cloner",      label: "Voice Cloner",      icon: Volume2,       bgColor: "bg-purple-500",  path: "/apps" },
  { id: "transcribe",        label: "Transcribe",        icon: FileText,      bgColor: "bg-indigo-500",  path: "/transcribe" },
  { id: "ghost-ink",         label: "Ghost Ink",         icon: BookOpen,      bgColor: "bg-amber-600",   path: "/ghost-ink" },
  { id: "background-remover",label: "Background Remover",icon: Image,         bgColor: "bg-rose-500",    path: "/apps" },
  { id: "image-enhancer",    label: "Image Enhancer",    icon: ArrowUpCircle, bgColor: "bg-orange-500",  path: "/apps" },
  { id: "noise-remover",     label: "Noise Remover",     icon: Eraser,        bgColor: "bg-slate-500",   path: "/apps" },
  { id: "blog-writer",       label: "Blog Writer",       icon: Edit3,         bgColor: "bg-green-500",   path: "/apps" },
  { id: "social-posts",      label: "Social Posts",      icon: Calendar,      bgColor: "bg-blue-600",    path: "/apps" },
  { id: "newsletter",        label: "Newsletter",        icon: Mail,          bgColor: "bg-red-600",     path: "/apps" },
  { id: "ad-copy-writer",    label: "Ad Copy Writer",    icon: Megaphone,     bgColor: "bg-yellow-500",  path: "/apps" },
  { id: "ai-agents",         label: "AI Agents",         icon: Bot,           bgColor: "bg-purple-600",  path: "/apps" },
  { id: "digital-spy",       label: "Digital Spy",       icon: BarChart2,     bgColor: "bg-emerald-500", path: "/apps" },
];

const TABS_KEY = "ra_app_tabs";
const RECENT_KEY = "ra_app_recent";
const MAX_TABS = 4;

const FAVORITE_IDS = ["create"];
const TRENDING_IDS = ["master-closer", "editor", "sessions", "ai-influencer", "ai-story", "viral-shorts"];

export default function AppTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const plusRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [openTabs, setOpenTabs] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TABS_KEY) || "[]");
      return saved.includes("create") ? saved : ["create", ...saved];
    } catch { return ["create"]; }
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    const app = ALL_APPS.find(a => location.pathname === a.path || (a.path !== "/apps" && location.pathname.startsWith(a.path)));
    return app?.id || null;
  });

  const [dropOpen, setDropOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
  });

  // Sync active tab with route
  useEffect(() => {
    const app = ALL_APPS.find(a => a.path !== "/apps" && location.pathname === a.path);
    if (app) {
      setActiveId(app.id);
      setOpenTabs(prev => {
        if (prev.includes(app.id)) return prev;
        if (prev.length >= MAX_TABS) return prev; // don't auto-add if at cap
        return [...prev, app.id];
      });
    }
  }, [location.pathname]);

  // Persist
  useEffect(() => { localStorage.setItem(TABS_KEY, JSON.stringify(openTabs)); }, [openTabs]);
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds)); }, [recentIds]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setDropOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  const openApp = (app: AppDef) => {
    setActiveId(app.id);
    setOpenTabs(prev => {
      if (prev.includes(app.id)) return prev;
      // Cap at MAX_TABS — replace last non-create tab if full
      if (prev.length >= MAX_TABS) {
        const replaceIdx = prev.length - 1;
        if (prev[replaceIdx] === "create") return prev;
        const next = [...prev];
        next[replaceIdx] = app.id;
        return next;
      }
      return [...prev, app.id];
    });
    navigate(app.path);
    setDropOpen(false);
    setSearch("");
    setRecentIds(prev => [app.id, ...prev.filter(id => id !== app.id)].slice(0, 6));
  };

  const closeTab = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (appId === "create") return; // can't close Create
    const remaining = openTabs.filter(id => id !== appId);
    setOpenTabs(remaining);
    if (appId === activeId) {
      const last = remaining[remaining.length - 1];
      const app = ALL_APPS.find(a => a.id === last);
      if (app) { setActiveId(app.id); navigate(app.path); }
    }
  };

  const clickTab = (app: AppDef) => {
    setActiveId(app.id);
    navigate(app.path);
  };

  // Dropdown data
  const favoriteApps = ALL_APPS.filter(a => FAVORITE_IDS.includes(a.id));
  const trendingApps = ALL_APPS.filter(a => TRENDING_IDS.includes(a.id));
  const recentApps = ALL_APPS.filter(a => recentIds.includes(a.id) && !FAVORITE_IDS.includes(a.id));
  const filtered = search ? ALL_APPS.filter(a => a.label.toLowerCase().includes(search.toLowerCase())) : null;

  const tabApps = openTabs.map(id => ALL_APPS.find(a => a.id === id)).filter(Boolean) as AppDef[];

  const renderGridApp = (app: AppDef) => {
    const Icon = app.icon;
    return (
      <button key={app.id} onClick={() => openApp(app)}
        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors group">
        <div className={`w-11 h-11 ${app.bgColor} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <span className="text-[0.72rem] font-medium text-foreground/70 text-center leading-tight">{app.label}</span>
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {/* Tabs */}
      {tabApps.map(app => {
        const isActive = app.id === activeId;
        const Icon = app.icon;

        if (isActive) {
          return (
            <button key={app.id} onClick={() => clickTab(app)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all ${app.bgColor} text-white shrink-0`}>
              <Icon size={14} />
              <span>{app.label}</span>
              {app.id !== "create" && (
                <X size={12} className="ml-0.5 hover:bg-white/20 rounded p-0.5 cursor-pointer" onClick={e => closeTab(e, app.id)} />
              )}
            </button>
          );
        }

        return (
          <Tooltip key={app.id}>
            <TooltipTrigger asChild>
              <div onClick={() => clickTab(app)}
                className="relative p-2 rounded-lg border border-foreground/[0.08] bg-card hover:bg-foreground/[0.04] transition-colors text-muted-foreground group cursor-pointer shrink-0">
                <Icon size={16} />
                {app.id !== "create" && (
                  <span onClick={e => closeTab(e, app.id)}
                    className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-foreground/10 hover:bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                    <X size={10} />
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>{app.label}</TooltipContent>
          </Tooltip>
        );
      })}

      {/* + Button */}
      <div className="relative shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button ref={plusRef} onClick={() => setDropOpen(!dropOpen)}
              className="p-2 rounded-lg border border-foreground/[0.1] bg-card hover:bg-foreground/[0.04] transition-colors text-muted-foreground shrink-0">
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Explore Apps</TooltipContent>
        </Tooltip>

        {dropOpen && (
          <div ref={dropRef}
            className="absolute top-[calc(100%+8px)] left-0 bg-card border border-foreground/[0.08] rounded-2xl shadow-[var(--shadow-card)] z-[500] overflow-hidden"
            style={{ width: 340 }}>
            {/* Search */}
            <div className="p-3 border-b border-foreground/[0.06]">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input type="text" placeholder="Search Apps" value={search} onChange={e => setSearch(e.target.value)} autoFocus
                  className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-[0.84rem] focus:outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-3.5 space-y-4">
              {filtered ? (
                <div>
                  <span className="text-[0.7rem] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    Results ({filtered.length})
                  </span>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {filtered.map(a => renderGridApp(a))}
                  </div>
                  {filtered.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No apps found</p>}
                </div>
              ) : (
                <>
                  {/* Favorites */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Star size={13} className="text-amber-500" />
                      <span className="text-[0.7rem] font-semibold text-muted-foreground/60 uppercase tracking-wider">Favorites</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {favoriteApps.map(a => renderGridApp(a))}
                    </div>
                  </div>

                  {/* Recent */}
                  {recentApps.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock size={13} className="text-muted-foreground/50" />
                        <span className="text-[0.7rem] font-semibold text-muted-foreground/60 uppercase tracking-wider">Recently Used</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {recentApps.slice(0, 3).map(a => renderGridApp(a))}
                      </div>
                    </div>
                  )}

                  {/* Trending */}
                  <div>
                    <span className="text-[0.7rem] font-semibold text-muted-foreground/60 uppercase tracking-wider">Trending</span>
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      {trendingApps.map(a => renderGridApp(a))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Browse All */}
            <div className="p-3 border-t border-foreground/[0.06]">
              <button onClick={() => { navigate("/apps"); setDropOpen(false); }}
                className="flex items-center justify-center gap-1.5 w-full text-[0.82rem] font-semibold text-accent hover:text-accent/80 transition-colors">
                <Plus size={14} /> Browse All Apps
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
