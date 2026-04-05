import { useState, useEffect, useRef } from "react";
import {
  Plus, X, Search, Star, Clock, Zap,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppTabs, ALL_APPS, type AppDef } from "@/context/AppTabsContext";
import { useNavigate } from "react-router-dom";

const DEFAULT_FAVORITE_IDS = ["create"];
const TRENDING_IDS = ["master-closer", "editor", "sessions", "ai-influencer", "ai-story", "viral-shorts"];

export default function AppTabs() {
  const { openTabs, activeId, recentIds, openApp, closeTab, clickTab } = useAppTabs();
  const navigate = useNavigate();
  const plusRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [dropOpen, setDropOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("app-favorites");
    return stored ? JSON.parse(stored) : DEFAULT_FAVORITE_IDS;
  });

  const toggleFavorite = (appId: string) => {
    setFavoriteIds(prev => {
      const next = prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId];
      localStorage.setItem("app-favorites", JSON.stringify(next));
      return next;
    });
  };

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

  const handleOpenApp = (app: AppDef) => {
    openApp(app);
    setDropOpen(false);
    setSearch("");
  };

  const handleCloseTab = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    closeTab(appId);
  };

  // Dropdown data
  const favoriteApps = ALL_APPS.filter(a => favoriteIds.includes(a.id));
  const trendingApps = ALL_APPS.filter(a => TRENDING_IDS.includes(a.id));
  const recentApps = ALL_APPS.filter(a => recentIds.includes(a.id) && !favoriteIds.includes(a.id));
  const filtered = search ? ALL_APPS.filter(a => a.label.toLowerCase().includes(search.toLowerCase())) : null;

  const tabApps = openTabs.map(id => ALL_APPS.find(a => a.id === id)).filter(Boolean) as AppDef[];

  const renderGridApp = (app: AppDef, showFavStar = false) => {
    const Icon = app.icon;
    const isFav = favoriteIds.includes(app.id);
    return (
      <div key={app.id} className="relative group/app">
        <button onClick={() => handleOpenApp(app)}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors w-full">
          <div className={`w-11 h-11 ${app.bgColor} rounded-xl flex items-center justify-center`}>
            <Icon size={20} className="text-white" />
          </div>
          <span className="text-[0.72rem] font-medium text-foreground/70 text-center leading-tight">{app.label}</span>
        </button>
        {showFavStar && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(app.id); }}
            className="absolute top-1 right-1 p-0.5 rounded-md transition-opacity opacity-0 group-hover/app:opacity-100 data-[fav=true]:opacity-100"
            data-fav={isFav}
          >
            <Star size={13} className={isFav ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40 hover:text-amber-400"} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {/* Tabs */}
      {tabApps.map(app => {
        const isActive = app.id === activeId;
        const isCreate = app.id === "create";
        const Icon = app.icon;

        // Create tab is ALWAYS expanded with accent color
        if (isCreate) {
          return (
            <button key={app.id} onClick={() => clickTab(app)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all ${app.bgColor} text-white shrink-0`}>
              <Icon size={14} />
              <span>{app.label}</span>
            </button>
          );
        }

        if (isActive) {
          return (
            <button key={app.id} onClick={() => clickTab(app)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all ${app.bgColor} text-white shrink-0`}>
              <Icon size={14} />
              <span>{app.label}</span>
              <X size={12} className="ml-0.5 hover:bg-white/20 rounded p-0.5 cursor-pointer" onClick={e => handleCloseTab(e, app.id)} />
            </button>
          );
        }

        return (
          <Tooltip key={app.id}>
            <TooltipTrigger asChild>
              <div onClick={() => clickTab(app)}
                className="relative p-2 rounded-lg border border-foreground/[0.08] bg-card hover:bg-foreground/[0.04] transition-colors text-muted-foreground group cursor-pointer shrink-0">
                <Icon size={16} />
                <span onClick={e => handleCloseTab(e, app.id)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-foreground/10 hover:bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  <X size={10} />
                </span>
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
          <TooltipContent side="bottom">Explore Apps</TooltipContent>
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
