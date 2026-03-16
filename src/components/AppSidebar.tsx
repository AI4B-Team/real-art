import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Image, FolderOpen, Settings,
  Users, Award, Eye, Bookmark, ChevronDown,
  Search, X, Star, Compass, Plus, PanelLeftClose, PanelLeftOpen,
  DollarSign, Megaphone, Bell
} from "lucide-react";
import { useLayoutContext } from "@/components/LayoutContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  type: "route" | "dashboard-section" | "divider" | "communities-dropdown";
  href?: string;
}

type Community = {
  id: string;
  name: string;
  to: string;
  newPosts?: number;
  pinned: boolean;
};

const navItems: NavItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, type: "route", href: "/dashboard" },
  { id: "explore", label: "Explore", icon: Eye, type: "route", href: "/explore" },
  { id: "collections-browse", label: "Collections", icon: FolderOpen, type: "route", href: "/collections" },
  { id: "communities-browse", label: "Communities", icon: Users, type: "communities-dropdown" },
  { id: "challenges-browse", label: "Challenges", icon: Award, type: "route", href: "/challenges" },
  { id: "divider1", label: "", icon: LayoutDashboard, type: "divider" },
  { id: "media", label: "Media", icon: Image, type: "dashboard-section" },
  { id: "galleries", label: "My Collections", icon: FolderOpen, type: "dashboard-section" },
  { id: "ads", label: "Ads", icon: Megaphone, type: "dashboard-section" },
  { id: "earnings", label: "Earnings", icon: DollarSign, type: "dashboard-section" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed } = useLayoutContext();
  const [display, setDisplay] = useState("aiverse");
  const [handle, setHandle] = useState("aiverse");
  const [communitiesOpen, setCommunitiesOpen] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const communitiesRef = useRef<HTMLDivElement>(null);
  const communityBtnRef = useRef<HTMLButtonElement>(null);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });

  const [communities, setCommunities] = useState<Community[]>([
    { id: "1", name: "Avatar Architects", to: "/communities/1", newPosts: 3, pinned: true },
    { id: "2", name: "PromptVault Pro", to: "/communities/2", newPosts: 0, pinned: true },
    { id: "3", name: "Abstract Minds", to: "/communities/3", newPosts: 1, pinned: false },
  ]);

  useEffect(() => {
    const sync = () => {
      try {
        setDisplay((localStorage.getItem("ra_display") || "AI.Verse").toLowerCase());
        setHandle((localStorage.getItem("ra_username") || "aiverse").toLowerCase());
      } catch {}
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ra_auth_changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ra_auth_changed", sync);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (communitiesRef.current && !communitiesRef.current.contains(target)) {
        // Check if click is inside the portalled flyout
        const flyout = document.querySelector('[data-community-flyout]');
        if (flyout && flyout.contains(target)) return;
        setCommunitiesOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const initials = display.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const isDashboard = location.pathname === "/dashboard";
  const currentSection = isDashboard
    ? new URLSearchParams(location.search).get("section") || "overview"
    : null;

  const isActive = (item: NavItem) => {
    if (item.type === "route") {
      if (item.href === "/dashboard") return isDashboard && (currentSection === "overview" || currentSection === null);
      return location.pathname.startsWith(item.href!);
    }
    if (item.type === "communities-dropdown") {
      return location.pathname.startsWith("/communities");
    }
    if (item.type === "dashboard-section") {
      return isDashboard && currentSection === item.id;
    }
    return false;
  };

  const handleClick = (item: NavItem) => {
    if (item.type === "route") {
      navigate(item.href!);
    } else if (item.type === "dashboard-section") {
      navigate(`/dashboard?section=${item.id}`);
    }
  };

  const togglePin = (id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const sortedCommunities = [...communities].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return 0;
  });

  const hasNewPosts = communities.some(c => c.newPosts && c.newPosts > 0);

  return (
    <aside className={`bg-card border-r border-foreground/[0.06] px-4 py-6 hidden lg:flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-all duration-200 ${sidebarCollapsed ? "w-[68px]" : "w-[260px]"}`}>
      {!sidebarCollapsed ? (
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-[0.8rem] font-bold text-accent shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[0.88rem] lowercase truncate">{display}</div>
            <div className="text-[0.72rem] text-muted lowercase truncate">@{handle}</div>
          </div>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-foreground/[0.05] text-muted hover:text-foreground transition-colors shrink-0"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-[0.72rem] font-bold text-accent hover:bg-accent/25 transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            {initials}
          </button>
        </div>
      )}

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => {
          if (item.type === "divider") {
            return <div key={item.id} className="h-px bg-foreground/[0.06] my-2 mx-3" />;
          }

          // Communities dropdown - show icon-only when collapsed
          if (item.type === "communities-dropdown") {
            const active = isActive(item);
            if (sidebarCollapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() => navigate("/communities")}
                  className={`flex items-center justify-center py-2.5 rounded-xl text-[0.84rem] font-medium w-full transition-colors relative ${active ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
                  title="Communities"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {hasNewPosts && !active && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-accent" />
                  )}
                </button>
              );
            }
            return (
              <div key={item.id} className="relative" ref={communitiesRef}>
                <button
                  ref={communityBtnRef}
                  onClick={() => {
                    if (!communitiesOpen && communityBtnRef.current) {
                      const rect = communityBtnRef.current.getBoundingClientRect();
                      setFlyoutPos({ top: rect.top, left: rect.right + 8 });
                    }
                    setCommunitiesOpen(!communitiesOpen);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] font-medium w-full text-left transition-colors ${active ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  Communities
                  <div className="ml-auto flex items-center gap-1.5">
                    {hasNewPosts && !active && (
                      <span className="w-2 h-2 rounded-full bg-accent" />
                    )}
                    <ChevronDown className={`w-3 h-3 opacity-50 transition-transform -rotate-90`} />
                  </div>
                </button>
                {communitiesOpen && createPortal(
                  <div data-community-flyout className="fixed bg-card border border-foreground/[0.07] rounded-2xl min-w-[270px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]" style={{ top: flyoutPos.top, left: flyoutPos.left }}>
                    <div className="px-1 pb-2">
                      <div className="flex items-center gap-2 bg-background border border-foreground/[0.1] rounded-lg px-3 h-9">
                        <Search className="w-3.5 h-3.5 text-muted shrink-0" />
                        <input
                          autoFocus
                          value={communitySearch}
                          onChange={e => setCommunitySearch(e.target.value)}
                          placeholder="Search communities…"
                          className="flex-1 border-none outline-none bg-transparent text-[0.82rem] font-body"
                        />
                        {communitySearch && (
                          <button onClick={() => setCommunitySearch("")} className="shrink-0">
                            <X className="w-3 h-3 text-muted hover:text-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                    {(() => {
                      const q = communitySearch.toLowerCase();
                      const filtered = sortedCommunities.filter(c => !q || c.name.toLowerCase().includes(q));
                      const pinnedFiltered = filtered.filter(c => c.pinned);
                      const otherFiltered = filtered.filter(c => !c.pinned);
                      return (
                        <>
                          {pinnedFiltered.length > 0 && (
                            <>
                              <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Pinned</div>
                              {pinnedFiltered.map(c => (
                                <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors group">
                                  <Link to={c.to} onClick={() => setCommunitiesOpen(false)} className="flex items-center gap-2 flex-1 no-underline text-foreground">
                                    <Star className="w-3 h-3 text-accent fill-accent shrink-0" />
                                    {c.name}
                                  </Link>
                                  <div className="flex items-center gap-2">
                                    {c.newPosts ? <span className="text-[0.7rem] text-accent font-medium">{c.newPosts} new</span> : null}
                                    <button onClick={() => togglePin(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Unpin">
                                      <X className="w-3 h-3 text-muted hover:text-foreground" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                          {otherFiltered.length > 0 && (
                            <>
                              <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Other Communities</div>
                              {otherFiltered.map(c => (
                                <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors group">
                                  <Link to={c.to} onClick={() => setCommunitiesOpen(false)} className="flex items-center gap-2 flex-1 no-underline text-foreground">
                                    {c.name}
                                  </Link>
                                  <div className="flex items-center gap-2">
                                    {c.newPosts ? <span className="text-[0.7rem] text-accent font-medium">{c.newPosts} new</span> : null}
                                    <button onClick={() => togglePin(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Pin">
                                      <Star className="w-3 h-3 text-muted hover:text-accent" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                          {filtered.length === 0 && (
                            <div className="px-3.5 py-3 text-[0.82rem] text-muted">No communities found</div>
                          )}
                          <div className="h-px bg-foreground/[0.06] my-1.5" />
                          <Link to="/communities" onClick={() => setCommunitiesOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline">
                            <Compass className="w-3.5 h-3.5 opacity-40 shrink-0" /> Browse Communities
                          </Link>
                          <Link to="/communities/create" onClick={() => setCommunitiesOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline">
                            <Plus className="w-3.5 h-3.5 opacity-40 shrink-0" /> Create Community
                          </Link>
                        </>
                      );
                    })()}
                  </div>,
                  document.body
                )}
              </div>
            );
          }

          const active = isActive(item);
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3 px-3"} py-2.5 rounded-xl text-[0.84rem] font-medium w-full text-left transition-colors ${active ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
