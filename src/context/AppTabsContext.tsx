import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Wand2, Zap, Edit3, Video, Users, BookOpen, Mic, Image,
  Bot, BarChart2, Volume2, FileText, ArrowUpCircle, Eraser,
  Mail, Megaphone, Calendar, Package, Download, Globe,
  Music, Palette, Camera, PenTool, Layers, Eye, Target,
  Wrench, Star as StarIcon, Play,
} from "lucide-react";

/* ─── App definition ─── */
export interface AppDef {
  id: string;
  label: string;
  icon: React.ElementType;
  bgColor: string;
  path: string;
}

/* ─── Complete app registry ─── */
export const ALL_APPS: AppDef[] = [
  // Core
  { id: "create",              label: "Create",              icon: Wand2,         bgColor: "bg-accent",      path: "/create" },
  { id: "master-closer",       label: "Master Closer",       icon: Zap,           bgColor: "bg-emerald-600", path: "/apps/master-closer" },
  { id: "editor",              label: "Editor",              icon: Edit3,         bgColor: "bg-purple-500",  path: "/editor" },
  { id: "sessions",            label: "Sessions",            icon: Video,         bgColor: "bg-blue-500",    path: "/apps/sessions" },
  { id: "ai-influencer",       label: "AI Influencer",       icon: Users,         bgColor: "bg-violet-500",  path: "/apps/ai-influencer" },
  { id: "ai-story",            label: "AI Story",            icon: BookOpen,      bgColor: "bg-amber-500",   path: "/apps/ai-story" },
  { id: "viral-shorts",        label: "Viral Shorts",        icon: Zap,           bgColor: "bg-red-500",     path: "/apps/viral-shorts" },
  { id: "voiceovers",          label: "Voiceovers",          icon: Mic,           bgColor: "bg-cyan-500",    path: "/apps/voiceovers" },
  { id: "voice-cloner",        label: "Voice Cloner",        icon: Volume2,       bgColor: "bg-purple-500",  path: "/apps/voice-cloner" },
  { id: "transcribe",          label: "Transcribe",          icon: FileText,      bgColor: "bg-indigo-500",  path: "/transcribe" },
  { id: "ghost-ink",           label: "Ebook Creator",       icon: BookOpen,      bgColor: "bg-amber-600",   path: "/ghost-ink" },
  { id: "background-remover",  label: "Background Remover",  icon: Image,         bgColor: "bg-rose-500",    path: "/apps/background-remover" },
  { id: "image-enhancer",      label: "Image Enhancer",      icon: ArrowUpCircle, bgColor: "bg-orange-500",  path: "/apps/image-enhancer" },
  { id: "noise-remover",       label: "Noise Remover",       icon: Eraser,        bgColor: "bg-slate-500",   path: "/apps/noise-remover" },
  { id: "blog-writer",         label: "Blog Writer",         icon: Edit3,         bgColor: "bg-green-500",   path: "/apps/blog-writer" },
  { id: "social-posts",        label: "Social Posts",        icon: Calendar,      bgColor: "bg-blue-600",    path: "/apps/social-posts" },
  { id: "newsletter",          label: "Newsletter",          icon: Mail,          bgColor: "bg-red-600",     path: "/apps/newsletter" },
  { id: "ad-copy-writer",      label: "Ad Copy Writer",      icon: Megaphone,     bgColor: "bg-yellow-500",  path: "/apps/ad-copy-writer" },
  { id: "ai-agents",           label: "AI Agents",           icon: Bot,           bgColor: "bg-purple-600",  path: "/apps/ai-agents" },
  { id: "digital-spy",         label: "Digital Spy",         icon: BarChart2,     bgColor: "bg-emerald-500", path: "/apps/digital-spy" },
  // Marketplace apps
  { id: "creator-vault",       label: "Creator Vault",       icon: Package,       bgColor: "bg-teal-500",    path: "/create-gallery" },
  { id: "digital-influencer",  label: "Digital Influencer",  icon: Users,         bgColor: "bg-violet-600",  path: "/apps/digital-influencer" },
  { id: "resizer",             label: "Resizer",             icon: Image,         bgColor: "bg-pink-500",    path: "/apps/resizer" },
  { id: "art-blocks",          label: "Art Blocks",          icon: Palette,       bgColor: "bg-indigo-500",  path: "/apps/art-blocks" },
  { id: "image-upscaler",      label: "Image Upscaler",      icon: ArrowUpCircle, bgColor: "bg-sky-500",     path: "/apps/image-upscaler" },
  { id: "image-colorizer",     label: "Image Colorizer",     icon: Palette,       bgColor: "bg-fuchsia-500", path: "/apps/image-colorizer" },
  { id: "image-eraser",        label: "Image Eraser",        icon: Eraser,        bgColor: "bg-gray-500",    path: "/apps/image-eraser" },
  { id: "video-downloader",    label: "Video Downloader",    icon: Download,      bgColor: "bg-blue-700",    path: "/apps/video-downloader" },
  { id: "motion-sync",         label: "Motion-Sync",         icon: Play,          bgColor: "bg-cyan-600",    path: "/apps/motion-sync" },
  { id: "explainer-video",     label: "Explainer Video",     icon: Video,         bgColor: "bg-amber-600",   path: "/apps/explainer-video" },
  { id: "ai-voice-changer",    label: "AI Voice Changer",    icon: Mic,           bgColor: "bg-teal-600",    path: "/apps/ai-voice-changer" },
  { id: "ai-noise-remover",    label: "AI Noise Remover",    icon: Eraser,        bgColor: "bg-slate-600",   path: "/apps/ai-noise-remover" },
  { id: "logo-designer",       label: "Logo Designer",       icon: PenTool,       bgColor: "bg-pink-600",    path: "/apps/logo-designer" },
  { id: "banner-creator",      label: "Banner Creator",      icon: Layers,        bgColor: "bg-orange-600",  path: "/apps/banner-creator" },
  { id: "flyer-maker",         label: "Flyer Maker",         icon: Palette,       bgColor: "bg-rose-600",    path: "/apps/flyer-maker" },
  { id: "poster-designer",     label: "Poster Designer",     icon: Palette,       bgColor: "bg-violet-500",  path: "/apps/poster-designer" },
  { id: "infographic-builder", label: "Infographic Builder", icon: BarChart2,     bgColor: "bg-teal-500",    path: "/apps/infographic-builder" },
  { id: "presentation-maker",  label: "Presentation Maker",  icon: Layers,        bgColor: "bg-blue-500",    path: "/apps/presentation-maker" },
  { id: "article-writer",      label: "Article Writer",      icon: FileText,      bgColor: "bg-emerald-600", path: "/apps/article-writer" },
  { id: "email-generator",     label: "Email Generator",     icon: Mail,          bgColor: "bg-red-500",     path: "/apps/email-generator" },
  { id: "script-writer",       label: "Script Writer",       icon: Edit3,         bgColor: "bg-amber-500",   path: "/apps/script-writer" },
  { id: "seo-optimizer",       label: "SEO Optimizer",       icon: Globe,         bgColor: "bg-green-600",   path: "/apps/seo-optimizer" },
  { id: "ai-responder",        label: "AI Responder",        icon: Bot,           bgColor: "bg-indigo-600",  path: "/apps/ai-responder" },
  { id: "versus",              label: "Versus",              icon: Eye,           bgColor: "bg-gray-600",    path: "/apps/versus" },
  { id: "lead-generation",     label: "Lead Generation",     icon: Target,        bgColor: "bg-green-500",   path: "/apps/lead-generation" },
];

/* ─── Name → ID lookup (for marketplace) ─── */
const nameToIdMap = new Map<string, string>();
ALL_APPS.forEach(a => nameToIdMap.set(a.label.toLowerCase(), a.id));
// Add alternate names used in marketplace
const ALIASES: Record<string, string> = {
  "real creator": "create",
  "agents": "ai-agents",
  "ai voiceovers": "voiceovers",
  "ai voice cloner": "voice-cloner",
};
Object.entries(ALIASES).forEach(([name, id]) => nameToIdMap.set(name.toLowerCase(), id));

export function findAppByName(name: string): AppDef | undefined {
  const id = nameToIdMap.get(name.toLowerCase());
  return id ? ALL_APPS.find(a => a.id === id) : undefined;
}

/* ─── Context ─── */
const TABS_KEY = "ra_app_tabs";
const RECENT_KEY = "ra_app_recent";
const MAX_TABS = 4;

interface AppTabsContextValue {
  openTabs: string[];
  activeId: string | null;
  recentIds: string[];
  openApp: (app: AppDef) => void;
  openAppByName: (name: string) => void;
  closeTab: (appId: string) => void;
  clickTab: (app: AppDef) => void;
}

const AppTabsContext = createContext<AppTabsContextValue | null>(null);

export function useAppTabs() {
  const ctx = useContext(AppTabsContext);
  if (!ctx) throw new Error("useAppTabs must be used within AppTabsProvider");
  return ctx;
}

export function AppTabsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openTabs, setOpenTabs] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TABS_KEY) || "[]");
      return saved.includes("create") ? saved : ["create", ...saved];
    } catch { return ["create"]; }
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    const app = ALL_APPS.find(a => location.pathname === a.path || (a.path !== "/apps" && a.path.length > 1 && location.pathname.startsWith(a.path)));
    return app?.id || null;
  });

  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
  });

  // Sync active tab with route
  useEffect(() => {
    const app = ALL_APPS.find(a => a.path.length > 1 && location.pathname === a.path);
    if (app) {
      setActiveId(app.id);
      setOpenTabs(prev => {
        if (prev.includes(app.id)) return prev;
        if (prev.length >= MAX_TABS) return prev;
        return [...prev, app.id];
      });
    }
  }, [location.pathname]);

  useEffect(() => { localStorage.setItem(TABS_KEY, JSON.stringify(openTabs)); }, [openTabs]);
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds)); }, [recentIds]);

  const openApp = useCallback((app: AppDef) => {
    setActiveId(app.id);
    setOpenTabs(prev => {
      if (prev.includes(app.id)) return prev;
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
    setRecentIds(prev => [app.id, ...prev.filter(id => id !== app.id)].slice(0, 6));
  }, [navigate]);

  const openAppByName = useCallback((name: string) => {
    const app = findAppByName(name);
    if (app) openApp(app);
  }, [openApp]);

  const closeTab = useCallback((appId: string) => {
    if (appId === "create") return;
    setOpenTabs(prev => {
      const remaining = prev.filter(id => id !== appId);
      if (appId === activeId) {
        const last = remaining[remaining.length - 1];
        const app = ALL_APPS.find(a => a.id === last);
        if (app) { setActiveId(app.id); navigate(app.path); }
      }
      return remaining;
    });
  }, [activeId, navigate]);

  const clickTab = useCallback((app: AppDef) => {
    setActiveId(app.id);
    navigate(app.path);
  }, [navigate]);

  return (
    <AppTabsContext.Provider value={{ openTabs, activeId, recentIds, openApp, openAppByName, closeTab, clickTab }}>
      {children}
    </AppTabsContext.Provider>
  );
}
