import { useState, useRef, useEffect } from "react";
import {
  Search, Menu, Grid3X3, Star, Users, Trophy, BarChart3,
  Upload, Sparkles, FileText, X, Layout, ChevronDown, Plus,
  Compass, Image, Video, Music, LayoutDashboard, DollarSign,
  LogOut, Settings, Bookmark, TrendingUp, FolderOpen, Bell,
  Megaphone, LayoutGrid, User, Heart, Download, MessageCircle,
  RefreshCw, Award, Eye, Check, ArrowRight, UserPlus
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

type NotifEntry = {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link: string;
};

const initialNotifs: NotifEntry[] = [
  { id: "n1", icon: "download", iconColor: "text-blue-500", iconBg: "bg-blue-50", title: "Cosmic Dreamscape Downloaded", body: "A visitor downloaded your image in 4K", time: "2 min ago", read: false, link: "/image/0" },
  { id: "n2", icon: "dollar", iconColor: "text-green-600", iconBg: "bg-green-50", title: "You Earned $12.00", body: "Platform referral — Stream 2", time: "1 hr ago", read: false, link: "/dashboard?section=earnings" },
  { id: "n3", icon: "heart", iconColor: "text-accent", iconBg: "bg-accent/10", title: "Cosmic Dreamscape Trending", body: "Your pinned image is trending", time: "3 hr ago", read: false, link: "/image/0" },
  { id: "n4", icon: "userplus", iconColor: "text-purple-500", iconBg: "bg-purple-50", title: "New Follower: @neopixel", body: "NeoPixel is now following you", time: "5 hr ago", read: true, link: "/creator/2" },
  { id: "n5", icon: "comment", iconColor: "text-teal-500", iconBg: "bg-teal-50", title: 'New Comment on "Neon Boulevard"', body: '"What prompt did you use? The lighting is perfect"', time: "8 hr ago", read: true, link: "/image/4" },
  { id: "n6", icon: "dollar", iconColor: "text-green-600", iconBg: "bg-green-50", title: "You Earned $24.00", body: "Etsy link click converted — Stream 1", time: "10 hr ago", read: true, link: "/dashboard?section=earnings" },
  { id: "n7", icon: "refresh", iconColor: "text-orange-500", iconBg: "bg-orange-50", title: "Digital Avatar 01 recreated 156×", body: "Your image is being remixed by the community", time: "1 day ago", read: true, link: "/image/9" },
  { id: "n8", icon: "award", iconColor: "text-amber-500", iconBg: "bg-amber-50", title: "Challenge entry shortlisted", body: "Your Cyberpunk City entry made the top 10", time: "2 days ago", read: true, link: "/challenges/1" },
  { id: "n9", icon: "eye", iconColor: "text-blue-500", iconBg: "bg-blue-50", title: "12K views this week", body: "Your portfolio reached a new weekly high", time: "3 days ago", read: true, link: "/dashboard" },
  { id: "n10", icon: "bookmark", iconColor: "text-pink-500", iconBg: "bg-pink-50", title: "Saved to 47 collections", body: "Abstract Fire is gaining traction in community saves", time: "4 days ago", read: true, link: "/image/2" },
];

const notifIconMap: Record<string, React.FC<{ className?: string }>> = {
  download: Download,
  dollar: DollarSign,
  heart: Heart,
  userplus: UserPlus,
  comment: MessageCircle,
  refresh: RefreshCw,
  award: Award,
  eye: Eye,
  bookmark: Bookmark,
};

type Community = {
  id: string;
  name: string;
  to: string;
  newPosts?: number;
  pinned: boolean;
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [communitiesOpen, setCommunitiesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [navSearchType, setNavSearchType] = useState("Images");
  const [navSearchDropOpen, setNavSearchDropOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifs);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadNotifs = notifications.filter(n => !n.read);

  const markAllNotifRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { localStorage.setItem("ra_unread_notifs", "0"); } catch {}
  };

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Simulated auth state — persists across pages via localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; }
  });
  const [userDisplay, setUserDisplay] = useState(() => {
    try { return (localStorage.getItem("ra_display") || "AI.Verse").toLowerCase(); } catch { return "aiverse"; }
  });
  const [userHandle, setUserHandle] = useState(() => {
    try { return (localStorage.getItem("ra_username") || "aiverse").toLowerCase(); } catch { return "aiverse"; }
  });
  const userInitials = userDisplay.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const navSearchDropRef = useRef<HTMLDivElement>(null);
  const [communities, setCommunities] = useState<Community[]>([
    { id: "1", name: "Avatar Architects", to: "/communities/1", newPosts: 3, pinned: true },
    { id: "2", name: "PromptVault Pro", to: "/communities/2", newPosts: 0, pinned: true },
    { id: "3", name: "Abstract Minds", to: "/communities/3", newPosts: 1, pinned: false },
  ]);
  const menuRef = useRef<HTMLDivElement>(null);
  const communitiesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Re-read auth on every route change (so login/signup pages can update it)
  const syncAuth = () => {
    try {
      setIsLoggedIn(localStorage.getItem("ra_auth") === "1");
      setUserDisplay((localStorage.getItem("ra_display") || "AI.Verse").toLowerCase());
      setUserHandle((localStorage.getItem("ra_username") || "aiverse").toLowerCase());
    } catch {}
  };
  // Re-read on every route change
  useEffect(() => { syncAuth(); }, [location.pathname]);
  // Also re-read when any tab writes to localStorage or custom event fires
  useEffect(() => {
    window.addEventListener("storage", syncAuth);
    window.addEventListener("ra_auth_changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("ra_auth_changed", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!isHomePage) return;
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (communitiesRef.current && !communitiesRef.current.contains(e.target as Node)) setCommunitiesOpen(false);
      if (navSearchDropRef.current && !navSearchDropRef.current.contains(e.target as Node)) setNavSearchDropOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("ra_auth");
      localStorage.removeItem("ra_display");
      localStorage.removeItem("ra_username");
    } catch {}
    setIsLoggedIn(false);
    setUserDisplay("AI.Verse");
    setUserHandle("aiverse");
    setUserMenuOpen(false);
    navigate("/");
  };

  const togglePin = (id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const sortedCommunities = [...communities].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return 0;
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const navLinks = [
    { icon: Eye, label: "Explore", to: "/explore" },
    { icon: FolderOpen, label: "Collections", to: "/collections" },
    { icon: Users, label: "Communities", to: "/communities" },
    { icon: Award, label: "Challenges", to: "/challenges" },
    { icon: BarChart3, label: "Leaderboard", to: "/leaderboard" },
  ];

  const createLinks = [
    { icon: Sparkles, label: "REAL CREATOR", to: "/real-creator" },
    { icon: Upload, label: "Upload Art", to: "/upload" },
  ];

  const infoLinks = [
    { icon: FileText, label: "License Info", to: "/license" },
  ];

  const userMenuLinks = [
    { icon: Settings, label: "Account", to: "/account" },
    { icon: User, label: "Profile", to: `/creator/${userHandle}` },
    { icon: Image, label: "Collections", to: "/collections" },
    { icon: DollarSign, label: "Earnings", to: "/dashboard?section=earnings" },
  ];

  const userMenuSecondary: typeof userMenuLinks = [];

  const menuContent = (
    <>
      <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Discover</div>
      {navLinks.map(({ icon: Icon, label, to }) => (
        <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline">
          <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" /> {label}
        </Link>
      ))}
      <div className="h-px bg-foreground/[0.06] my-1.5" />
      <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Create</div>
      {createLinks.map(({ icon: Icon, label, to }) => (
        <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline">
          <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" /> {label}
        </Link>
      ))}
      <div className="h-px bg-foreground/[0.06] my-1.5" />
      <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Info</div>
      {infoLinks.map(({ icon: Icon, label, to }) => (
        <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline">
          <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" /> {label}
        </Link>
      ))}
      {!isLoggedIn && (
        <>
          <div className="h-px bg-foreground/[0.06] my-1.5" />
          <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline">
            Log In
          </Link>
          <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] font-semibold text-accent hover:bg-background transition-colors no-underline">
            Join Free
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-[600] h-16 px-4 md:px-12 flex items-center justify-between bg-background/96 backdrop-blur-xl border-b border-foreground/[0.08]">
      {/* Mobile: ☰ left */}
      <div className="md:hidden relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors"
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        {menuOpen && (
          <div className="absolute top-[calc(100%+10px)] left-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[260px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]">
            {menuContent}
          </div>
        )}
      </div>

      {/* Logo + Communities group — always left-aligned */}
      <div className="hidden md:flex items-center gap-0 shrink-0">
        <Link to="/" className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer no-underline shrink-0">
          Real<span className="text-accent">.</span>Art
        </Link>

        {/* Desktop Communities Dropdown */}
        <div className="relative ml-4" ref={communitiesRef}>
          <button
            onClick={() => setCommunitiesOpen(!communitiesOpen)}
            className="relative flex items-center gap-1 px-3 py-2 rounded-lg text-[0.82rem] font-medium text-foreground hover:bg-foreground/[0.06] transition-colors"
          >
            <Users className="w-3.5 h-3.5 opacity-60" />
            Communities
            <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${communitiesOpen ? 'rotate-180' : ''}`} />
            <span className="absolute top-1.5 right-1 w-2 h-2 rounded-full bg-accent" />
          </button>
          {communitiesOpen && (
            <div className="absolute top-[calc(100%+10px)] left-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[270px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]">
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
            </div>
          )}
        </div>
      </div>

      {/* Mobile logo — centered */}
      <Link to="/" className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer no-underline shrink-0 absolute left-1/2 -translate-x-1/2 md:hidden">
        Real<span className="text-accent">.</span>Art
      </Link>

      {/* Mobile: 🔍 right */}
      <button
        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
        className="md:hidden w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Desktop Center Search */}
      {(!isHomePage || scrolled) && (
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full flex items-center bg-foreground/[0.06] rounded-lg h-[42px] focus-within:ring-2 focus-within:ring-accent/20">
            <div ref={navSearchDropRef} className="relative flex items-center gap-1.5 px-3 h-full cursor-pointer border-r border-foreground/[0.09] shrink-0 select-none" onClick={() => setNavSearchDropOpen(!navSearchDropOpen)}>
              {(() => { const Icon = navSearchType === "Images" ? Image : navSearchType === "Videos" ? Video : Music; return <Icon className="w-3.5 h-3.5 opacity-60" />; })()}
              <span className="text-[0.82rem] font-medium whitespace-nowrap">{navSearchType}</span>
              <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${navSearchDropOpen ? "rotate-180" : ""}`} />
              {navSearchDropOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 bg-card border border-foreground/[0.08] rounded-xl min-w-[150px] shadow-[var(--shadow-card)] p-1.5 z-[500] animate-drop-in">
                  {[{ label: "Images", icon: Image }, { label: "Videos", icon: Video }, { label: "Music", icon: Music }].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      onClick={(e) => { e.stopPropagation(); setNavSearchType(label); setNavSearchDropOpen(false); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-[0.82rem] font-medium transition-colors ${navSearchType === label ? "bg-accent text-primary-foreground" : "hover:bg-background"}`}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Search free ${navSearchType.toLowerCase()}...`}
              className="flex-1 border-none outline-none bg-transparent font-body text-[0.88rem] text-foreground placeholder:text-muted px-3"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-foreground/10 mr-2 shrink-0"
              >
                <X className="w-3 h-3 text-muted" />
              </button>
            )}
            <button onClick={handleSearch} className="shrink-0 mr-2">
              <Search className="w-4 h-4 text-muted hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Right Actions */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <Link to="/upload" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.82rem] font-semibold bg-accent text-primary-foreground hover:bg-accent/85 transition-colors no-underline">
          <Upload className="w-3.5 h-3.5" /> Upload Art
        </Link>

        {isLoggedIn && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors shrink-0"
            >
              <Bell className="w-[17px] h-[17px] opacity-60" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] rounded-full bg-accent text-primary-foreground text-[0.6rem] font-bold flex items-center justify-center px-1">
                  {unreadNotifs.length > 9 ? "9+" : unreadNotifs.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl w-[380px] max-h-[480px] shadow-[var(--shadow-card)] animate-drop-in z-[500] flex flex-col overflow-hidden">
                <div className="px-5 pt-4 pb-3 border-b border-foreground/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-[1rem] font-black">Notifications</h3>
                      {unreadNotifs.length > 0 && (
                        <span className="text-[0.65rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-md">{unreadNotifs.length} unread</span>
                      )}
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button onClick={markAllNotifRead} className="flex items-center gap-1 text-[0.72rem] font-medium text-muted hover:text-foreground transition-colors">
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {(["all", "unread"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setNotifFilter(f)}
                        className={`px-3.5 py-1.5 rounded-lg text-[0.76rem] font-medium capitalize transition-colors ${
                          notifFilter === f
                            ? "bg-foreground text-primary-foreground"
                            : "text-muted hover:text-foreground hover:bg-foreground/[0.05]"
                        }`}
                      >
                        {f}
                        {f === "unread" && unreadNotifs.length > 0 && (
                          <span className="ml-1 text-[0.6rem] bg-accent text-primary-foreground px-1 py-0.5 rounded-full">{unreadNotifs.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {(() => {
                    const visibleNotifs = notifFilter === "unread" ? unreadNotifs : notifications;
                    if (visibleNotifs.length === 0) {
                      return (
                        <div className="py-10 text-center">
                          <Bell className="w-8 h-8 text-muted opacity-20 mx-auto mb-3" />
                          <div className="text-[0.85rem] font-medium text-muted">All caught up</div>
                          <p className="text-[0.75rem] text-muted/60 mt-1">No unread notifications</p>
                        </div>
                      );
                    }
                    return visibleNotifs.map((n) => {
                      const Icon = notifIconMap[n.icon] || Bell;
                      return (
                        <Link
                          key={n.id}
                          to={n.link}
                          onClick={() => { markNotifRead(n.id); setNotifOpen(false); }}
                          className={`flex items-start gap-3 px-5 py-3.5 transition-colors no-underline border-b border-foreground/[0.04] last:border-none ${!n.read ? "bg-accent/[0.025] hover:bg-accent/[0.04]" : "hover:bg-foreground/[0.02]"}`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${n.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className={`w-4 h-4 ${n.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[0.82rem] font-semibold truncate">{n.title}</span>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                            </div>
                            <p className="text-[0.75rem] text-muted mt-0.5 truncate">{n.body}</p>
                          </div>
                          <span className="text-[0.68rem] text-muted shrink-0 mt-1">{n.time}</span>
                        </Link>
                      );
                    });
                  })()}
                </div>
                <Link
                  to="/dashboard?section=notifications"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-foreground/[0.06] text-[0.78rem] font-semibold text-accent hover:bg-foreground/[0.02] transition-colors no-underline"
                >
                  View All Notifications <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
        {isLoggedIn ? (
          /* Logged-in: Avatar + name dropdown */
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-foreground/[0.06] transition-colors ml-1"
            >
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-[0.7rem] font-bold text-accent">
                {userInitials}
              </div>
              <span className="text-[0.82rem] font-medium lowercase">{userDisplay}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {userMenuOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[232px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]">
                {/* User header */}
                <div className="flex items-center gap-3 px-3.5 py-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-[0.8rem] font-bold text-accent">
                    {userInitials}
                  </div>
                  <div>
                    <div className="text-[0.88rem] font-semibold">{userDisplay}</div>
                    <div className="text-[0.75rem] text-muted lowercase">@{userHandle}</div>
                  </div>
                </div>
                <div className="h-px bg-foreground/[0.06] my-1" />
                {userMenuLinks.map(({ icon: Icon, label, to }) => (
                  <Link key={label} to={to} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.84rem] text-foreground hover:bg-background transition-colors no-underline">
                    <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    {label}
                  </Link>
                ))}
                <div className="h-px bg-foreground/[0.06] my-1" />
                {userMenuSecondary.map(({ icon: Icon, label, to }) => (
                  <Link key={label} to={to} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.84rem] text-foreground hover:bg-background transition-colors no-underline">
                    <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    {label}
                  </Link>
                ))}
                <div className="h-px bg-foreground/[0.06] my-1" />
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent/85 transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Logged-out: Log In + Join Free */
          <>
            <Link to="/login">
              <button className="text-[0.8rem] font-medium bg-transparent border border-foreground/[0.18] px-[18px] py-[7px] rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="text-[0.8rem] font-semibold bg-accent text-primary-foreground border-none px-6 py-2.5 rounded-lg cursor-pointer hover:bg-accent/85 transition-colors">
                Join Free
              </button>
            </Link>
          </>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors ml-0.5"
          >
            <Menu className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[232px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]">
              {menuContent}
            </div>
          )}
        </div>
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-foreground/[0.08] px-4 py-3 z-[300]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { handleKeyDown(e); if (e.key === "Enter") setMobileSearchOpen(false); }}
              placeholder="Search visuals..."
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-foreground/[0.06] border-none outline-none font-body text-[0.88rem] text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent/20"
            />
            <button
              onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-foreground/10"
            >
              <X className="w-3 h-3 text-muted" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
