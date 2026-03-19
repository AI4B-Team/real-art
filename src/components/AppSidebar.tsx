import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Image, FolderOpen,
  Users, Award, Eye, Bookmark, ChevronDown,
  Search, X, Star, Home, Compass, Plus, PanelLeftClose,
  DollarSign, Megaphone, Zap, Clock, Upload, Sparkles, Check,
  Pencil, Trash2, Palette,
} from "lucide-react";
import { useLayoutContext } from "@/components/LayoutContext";

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  type: "route" | "dashboard-section" | "divider" | "communities-dropdown";
  href?: string;
}

type Workspace = { id: string; name: string; };
type Brand = { id: string; name: string; };

const loadWorkspaces = (): { workspaces: Workspace[]; activeId: string } => {
  try { const s = localStorage.getItem("ra_workspaces"); if (s) return JSON.parse(s); } catch {}
  const d = { id: "default", name: "My Workspace" };
  return { workspaces: [d], activeId: "default" };
};
const saveWorkspaces = (data: { workspaces: Workspace[]; activeId: string }) => {
  try { localStorage.setItem("ra_workspaces", JSON.stringify(data)); } catch {}
};

const loadBrands = (): { brands: Brand[]; activeId: string } => {
  try { const s = localStorage.getItem("ra_brands"); if (s) return JSON.parse(s); } catch {}
  const d = { id: "default", name: "My Brand" };
  return { brands: [d], activeId: "default" };
};
const saveBrands = (data: { brands: Brand[]; activeId: string }) => {
  try { localStorage.setItem("ra_brands", JSON.stringify(data)); } catch {}
};

type Community = {
  id: string;
  name: string;
  to: string;
  newPosts?: number;
  pinned: boolean;
};

const navItems: NavItem[] = [
  { id: "workspace", label: "Workspace", icon: LayoutDashboard, type: "route", href: "/dashboard" },
  { id: "home", label: "Home", icon: Home, type: "route", href: "/home" },
  { id: "explore", label: "Explore", icon: Eye, type: "route", href: "/explore" },
  { id: "media", label: "Media", icon: Image, type: "dashboard-section" },
  { id: "collections-browse", label: "Collections", icon: FolderOpen, type: "route", href: "/collections" },
  { id: "communities-browse", label: "Communities", icon: Users, type: "communities-dropdown" },
  { id: "challenges-browse", label: "Challenges", icon: Award, type: "route", href: "/challenges" },
  { id: "divider1", label: "", icon: LayoutDashboard, type: "divider" },
  { id: "brand", label: "Brand", icon: Sparkles, type: "route", href: "/brand" },
  { id: "divider1", label: "", icon: LayoutDashboard, type: "divider" },
  { id: "overview", label: "Insights", icon: Sparkles, type: "dashboard-section" },
  { id: "ads", label: "Ads", icon: Megaphone, type: "dashboard-section" },
  { id: "earnings", label: "Earnings", icon: DollarSign, type: "dashboard-section" },
];

const readOnboardState = () => ({
  done: (() => {
    try { return JSON.parse(localStorage.getItem("ra_onboard_done") || "[]") as string[]; } catch { return [] as string[]; }
  })(),
  skipped: (() => {
    try { return localStorage.getItem("ra_onboard_skipped") === "1"; } catch { return false; }
  })(),
  isNew: (() => {
    try { return localStorage.getItem("ra_new_user") === "1"; } catch { return false; }
  })(),
});

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed } = useLayoutContext();
  const [communitiesOpen, setCommunitiesOpen] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const communitiesRef = useRef<HTMLDivElement>(null);
  const communityBtnRef = useRef<HTMLButtonElement>(null);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });

  // Workspace state
  const [wsData, setWsData] = useState(loadWorkspaces);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [wsEditing, setWsEditing] = useState<string | null>(null);
  const [wsEditName, setWsEditName] = useState("");
  const [wsNewName, setWsNewName] = useState("");
  const [wsAdding, setWsAdding] = useState(false);
  const wsBtnRef = useRef<HTMLButtonElement>(null);
  const [wsFlyoutPos, setWsFlyoutPos] = useState({ top: 0, left: 0 });

  const activeWorkspace = wsData.workspaces.find(w => w.id === wsData.activeId) || wsData.workspaces[0];

  const switchWorkspace = (id: string) => {
    const updated = { ...wsData, activeId: id };
    setWsData(updated);
    saveWorkspaces(updated);
    setWsDropdownOpen(false);
    navigate("/dashboard");
  };

  const addWorkspace = () => {
    if (!wsNewName.trim()) return;
    const newWs: Workspace = { id: crypto.randomUUID(), name: wsNewName.trim() };
    const updated = { workspaces: [...wsData.workspaces, newWs], activeId: newWs.id };
    setWsData(updated);
    saveWorkspaces(updated);
    setWsNewName("");
    setWsAdding(false);
    setWsDropdownOpen(false);
    navigate("/dashboard");
  };

  const renameWorkspace = (id: string) => {
    if (!wsEditName.trim()) { setWsEditing(null); return; }
    const updated = { ...wsData, workspaces: wsData.workspaces.map(w => w.id === id ? { ...w, name: wsEditName.trim() } : w) };
    setWsData(updated);
    saveWorkspaces(updated);
    setWsEditing(null);
  };

  const deleteWorkspace = (id: string) => {
    if (wsData.workspaces.length <= 1) return;
    const remaining = wsData.workspaces.filter(w => w.id !== id);
    const newActive = wsData.activeId === id ? remaining[0].id : wsData.activeId;
    const updated = { workspaces: remaining, activeId: newActive };
    setWsData(updated);
    saveWorkspaces(updated);
  };

  const [communities, setCommunities] = useState<Community[]>([
    { id: "1", name: "Avatar Architects", to: "/communities/1", newPosts: 3, pinned: true },
    { id: "2", name: "PromptVault Pro", to: "/communities/2", newPosts: 0, pinned: true },
    { id: "3", name: "Abstract Minds", to: "/communities/3", newPosts: 1, pinned: false },
  ]);

  // Onboarding state
  const [onboardState, setOnboardState] = useState(readOnboardState);
  const onboardDone = onboardState.done;
  const onboardSkipped = onboardState.skipped;
  const isNewUser = onboardState.isNew;

  const [timeLeft, setTimeLeft] = useState<string>("");
  useEffect(() => {
    const startKey = "ra_onboard_start";
    let start: number;
    try {
      const stored = localStorage.getItem(startKey);
      start = stored ? parseInt(stored, 10) : Date.now();
      if (!stored) localStorage.setItem(startKey, String(start));
    } catch {
      start = Date.now();
    }
    const LIMIT = 18 * 60 * 60 * 1000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, LIMIT - elapsed);
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const totalSteps = 3;
  const pct = Math.round((onboardDone.length / totalSteps) * 100);
  const showWidget = !onboardSkipped && onboardDone.length < totalSteps;

  useEffect(() => {
    const syncOnboard = () => setOnboardState(readOnboardState());
    syncOnboard();
    window.addEventListener("ra_onboard_updated", syncOnboard);
    window.addEventListener("storage", syncOnboard);
    return () => {
      window.removeEventListener("ra_onboard_updated", syncOnboard);
      window.removeEventListener("storage", syncOnboard);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (communitiesRef.current && !communitiesRef.current.contains(target)) {
        const flyout = document.querySelector('[data-community-flyout]');
        if (flyout && flyout.contains(target)) return;
        setCommunitiesOpen(false);
      }
      // Workspace flyout
      if (wsDropdownOpen) {
        const wsFlyout = document.querySelector('[data-ws-flyout]');
        const wsBtn = wsBtnRef.current;
        if (wsFlyout && wsFlyout.contains(target)) return;
        if (wsBtn && wsBtn.contains(target)) return;
        setWsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [wsDropdownOpen]);

  const isDashboard = location.pathname === "/dashboard";
  const currentSection = isDashboard
    ? new URLSearchParams(location.search).get("section")
    : null;

  const isActive = (item: NavItem) => {
    if (item.type === "route") {
      if (item.href === "/") return location.pathname === "/";
      if (item.href === "/dashboard") return isDashboard && !currentSection;
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

  const dismissWidget = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem("ra_onboard_skipped", "1");
      window.dispatchEvent(new CustomEvent("ra_onboard_updated", { detail: { skipped: true } }));
    } catch {}
  };

  return (
    <aside className={`bg-card border-r border-foreground/[0.06] px-4 py-0 hidden lg:flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-200 z-[70] ${sidebarCollapsed ? "w-[68px]" : "w-[260px]"}`}>
      {/* Logo header */}
      <div className={`flex items-center h-16 shrink-0 ${sidebarCollapsed ? "justify-center" : "px-3 gap-3"}`}>
        {sidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="font-display text-xl font-black tracking-[0.06em] uppercase text-foreground hover:text-accent transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            R<span className="text-accent">.</span>
          </button>
        ) : (
          <>
            <Link to="/dashboard" className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer no-underline shrink-0">
              Real<span className="text-accent">.</span>Art
            </Link>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="ml-auto flex items-center justify-center w-7 h-7 rounded-lg hover:bg-foreground/[0.05] text-muted hover:text-foreground transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="h-px bg-foreground/[0.06] mx-1 mb-4" />

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => {
          if (item.type === "divider") {
            return <div key={item.id} className="h-px bg-foreground/[0.06] my-2 mx-3" />;
          }

          // Workspace item with dropdown
          if (item.id === "workspace") {
            const active = isActive(item);
            if (sidebarCollapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() => navigate("/dashboard")}
                  className={`flex items-center justify-center py-2.5 rounded-xl text-[0.84rem] font-medium w-full transition-colors ${active ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
                  title={activeWorkspace?.name || "Workspace"}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                </button>
              );
            }
            return (
              <div key={item.id} className="relative">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] font-medium flex-1 text-left transition-colors ${active ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{activeWorkspace?.name || "Workspace"}</span>
                  </button>
                  <button
                    ref={wsBtnRef}
                    onClick={() => {
                      if (!wsDropdownOpen && wsBtnRef.current) {
                        const rect = wsBtnRef.current.getBoundingClientRect();
                        setWsFlyoutPos({ top: rect.top, left: rect.right + 8 });
                      }
                      setWsDropdownOpen(!wsDropdownOpen);
                      setWsAdding(false);
                      setWsEditing(null);
                    }}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors shrink-0 ${wsDropdownOpen ? "bg-foreground/[0.1] text-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.05]"}`}
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${wsDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {wsDropdownOpen && createPortal(
                  <div
                    data-ws-flyout
                    className="fixed bg-card border border-foreground/[0.07] rounded-2xl min-w-[260px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]"
                    style={{ top: wsFlyoutPos.top, left: wsFlyoutPos.left }}
                  >
                    <div className="px-3 pt-1 pb-2 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Workspaces</div>
                    {wsData.workspaces.map(ws => (
                      <div
                        key={ws.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-[10px] text-[0.85rem] transition-colors group cursor-pointer ${
                          ws.id === wsData.activeId ? "bg-foreground/[0.06] text-foreground font-semibold" : "text-foreground hover:bg-background"
                        }`}
                      >
                        {wsEditing === ws.id ? (
                          <form
                            onSubmit={e => { e.preventDefault(); renameWorkspace(ws.id); }}
                            className="flex items-center gap-2 flex-1"
                          >
                            <input
                              autoFocus
                              value={wsEditName}
                              onChange={e => setWsEditName(e.target.value)}
                              onBlur={() => renameWorkspace(ws.id)}
                              className="flex-1 bg-background border border-foreground/[0.1] rounded-lg px-2 py-1 text-[0.82rem] outline-none focus:border-accent"
                            />
                          </form>
                        ) : (
                          <>
                            <button
                              onClick={() => switchWorkspace(ws.id)}
                              className="flex items-center gap-2 flex-1 text-left"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 shrink-0 opacity-50" />
                              <span className="truncate">{ws.name}</span>
                              {ws.id === wsData.activeId && <Check className="w-3 h-3 text-accent shrink-0" />}
                            </button>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={e => { e.stopPropagation(); setWsEditing(ws.id); setWsEditName(ws.name); }}
                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-foreground/[0.08] transition-colors"
                                title="Rename"
                              >
                                <Pencil className="w-3 h-3 text-muted" />
                              </button>
                              {wsData.workspaces.length > 1 && (
                                <button
                                  onClick={e => { e.stopPropagation(); deleteWorkspace(ws.id); }}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="h-px bg-foreground/[0.06] my-1.5" />
                    {wsAdding ? (
                      <form
                        onSubmit={e => { e.preventDefault(); addWorkspace(); }}
                        className="flex items-center gap-2 px-2"
                      >
                        <input
                          autoFocus
                          value={wsNewName}
                          onChange={e => setWsNewName(e.target.value)}
                          onBlur={() => { if (!wsNewName.trim()) setWsAdding(false); }}
                          placeholder="Workspace name…"
                          className="flex-1 bg-background border border-foreground/[0.1] rounded-lg px-2.5 py-1.5 text-[0.82rem] outline-none focus:border-accent"
                        />
                        <button type="submit" disabled={!wsNewName.trim()} className="px-2.5 py-1.5 rounded-lg bg-accent text-white text-[0.78rem] font-semibold disabled:opacity-40">Add</button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setWsAdding(true)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors w-full text-left"
                      >
                        <Plus className="w-3.5 h-3.5 opacity-40 shrink-0" /> New Workspace
                      </button>
                    )}
                  </div>,
                  document.body
                )}
              </div>
            );
          }

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
                    <ChevronDown className="w-3 h-3 opacity-50 transition-transform -rotate-90" />
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
          if (sidebarCollapsed) {
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`flex items-center justify-center py-2.5 rounded-xl text-[0.84rem] font-medium w-full transition-colors ${active ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
                title={item.label}
              >
                <item.icon className="w-4 h-4 shrink-0" />
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] font-medium w-full text-left transition-colors ${active ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Onboarding Widget */}
      {showWidget && !sidebarCollapsed && (
        <div className="mt-4 mx-1 mb-4 rounded-2xl border border-accent/20 bg-accent/[0.04] px-3.5 py-3">
          {/* Header: title + dismiss */}
          <div className="flex items-start gap-1.5 mb-2">
            <div className="flex-1 min-w-0">
              <span className="text-[0.88rem] font-black text-foreground leading-snug flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-accent" /> Start Creating
              </span>
              <span className="text-[0.72rem] font-semibold text-accent">
                Get 1,000 Free Credits
              </span>
            </div>
            <button
              onClick={dismissWidget}
              className="w-5 h-5 rounded-full flex items-center justify-center text-muted/40 hover:text-muted hover:bg-foreground/[0.07] transition-colors shrink-0 ml-auto mt-0.5"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-1 mb-2.5">
            {[
              { id: "upload", label: "Upload or Generate" },
              { id: "collection", label: "Create a Collection" },
              { id: "explore", label: "Explore & Save" },
            ].map(step => {
              const done = onboardDone.includes(step.id);
              return (
                <div key={step.id} className={`flex items-center gap-2 text-[0.72rem] ${done ? "text-muted line-through" : "text-foreground"}`}>
                  {done ? <Check className="w-3 h-3 text-green-500 shrink-0" /> : <div className="w-3 h-3 rounded-full border border-foreground/20 shrink-0" />}
                  {step.label}
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div className="h-[3px] bg-foreground/[0.06] rounded-full overflow-hidden mb-2.5">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>

          <Link
            to="/welcome"
            className="flex items-center justify-center gap-1.5 w-full bg-accent text-white py-1.5 rounded-lg text-[0.76rem] font-semibold hover:bg-accent/90 transition-colors no-underline"
          >
            Unlock Credits
          </Link>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
