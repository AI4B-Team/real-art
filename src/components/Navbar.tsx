import { useState, useRef, useEffect } from "react";
import {
  Search, Menu, Grid3X3, Star, Users, Trophy, BarChart3,
  Upload, Sparkles, FileText, X, Layout, ChevronDown, Plus,
  Compass, Image, Video, Music, LayoutDashboard, DollarSign,
  LogOut, Settings, Bookmark, TrendingUp, FolderOpen, Bell,
  Megaphone, LayoutGrid, User, Heart, Download, MessageCircle,
  RefreshCw, Award, Eye, Check, ArrowRight, UserPlus,
  Clock, Flame, ArrowUpRight, Hash, Wand2, Film, Music2
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
  const [searchSuggestOpen, setSearchSuggestOpen] = useState(false);
  const searchSuggestRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ra_recent_searches") || "[]"); } catch { return []; }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
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
      if (searchSuggestRef.current && !searchSuggestRef.current.contains(e.target as Node)) setSearchSuggestOpen(false);
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) setCreateMenuOpen(false);
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

  const handleSearch = (q?: string) => {
    const term = (q || searchQuery).trim();
    if (!term) return;
    const next = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8);
    setRecentSearches(next);
    try { localStorage.setItem("ra_recent_searches", JSON.stringify(next)); } catch {}
    setSearchSuggestOpen(false);
    navigate(`/explore?q=${encodeURIComponent(term)}&type=${encodeURIComponent(navSearchType)}`);
    setSearchQuery("");
  };

  const clearRecent = (term: string) => {
    const next = recentSearches.filter(s => s !== term);
    setRecentSearches(next);
    try { localStorage.setItem("ra_recent_searches", JSON.stringify(next)); } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const suggestions: Record<string, { label: string; category: string }[]> = {
    "Images": [
      { label: "cosmic abstract", category: "Trending" },
      { label: "cyberpunk city at night", category: "Trending" },
      { label: "luxury interior design", category: "Popular" },
      { label: "ai avatar portrait", category: "Trending" },
      { label: "neon botanical", category: "Rising" },
      { label: "dark fantasy landscape", category: "Popular" },
      { label: "minimalist architecture", category: "Popular" },
      { label: "surreal dreamscape", category: "Rising" },
    ],
    "Videos": [
      { label: "looping abstract animation", category: "Trending" },
      { label: "cinematic drone footage", category: "Popular" },
      { label: "particle effect loop", category: "Trending" },
      { label: "neon light trails", category: "Rising" },
      { label: "liquid simulation", category: "Popular" },
      { label: "timelapse sky", category: "Popular" },
    ],
    "Music": [
      { label: "lo-fi chill beats", category: "Trending" },
      { label: "ambient soundscape", category: "Popular" },
      { label: "cinematic orchestral", category: "Popular" },
      { label: "electronic dark synth", category: "Trending" },
      { label: "acoustic background", category: "Rising" },
    ],
  };
  const currentSuggestions = suggestions[navSearchType] || suggestions["Images"];
  const filteredSuggestions = searchQuery.trim()
    ? currentSuggestions.filter(s => s.label.includes(searchQuery.toLowerCase()))
    : currentSuggestions;
  const categoryColors: Record<string, string> = {
    "Trending": "text-accent bg-accent/10",
    "Popular": "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
    "Rising": "text-green-600 bg-green-50 dark:bg-green-950/30",
  };

  const topicPills: Record<string, string[]> = {
    "Images": ["cyberpunk", "portraits", "abstract", "luxury", "nature", "avatars"],
    "Videos": ["animation", "timelapse", "particles", "cinematic"],
    "Music": ["lo-fi", "ambient", "orchestral", "synth"],
  };

  const navLinks = [
    { icon: Eye, label: "Explore", to: "/explore" },
    { icon: FolderOpen, label: "Collections", to: "/collections" },
    { icon: Users, label: "Communities", to: "/communities" },
    { icon: Trophy, label: "Challenges", to: "/challenges" },
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
      <div className="h-px bg-foreground/[0.06] my-1.5" />
      <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Info</div>
      {infoLinks.map(({ icon: Icon, label, to }) => (
        <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline">
          <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" /> {label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-[600] h-16 px-4 md:px-12 flex items-center justify-between bg-background border-b border-foreground/[0.08]">
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

      {/* Logo — always left-aligned */}
      <div className="hidden md:flex items-center gap-0 shrink-0">
        <Link to="/" className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer no-underline shrink-0">
          Real<span className="text-accent">.</span>Art
        </Link>
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
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div ref={searchSuggestRef} className="relative w-full flex items-center bg-foreground/[0.06] rounded-lg h-[42px] focus-within:ring-2 focus-within:ring-accent/20">
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
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setSearchSuggestOpen(true)}
              placeholder={`Search free ${navSearchType.toLowerCase()}...`}
              className="flex-1 border-none outline-none bg-transparent font-body text-[0.88rem] text-foreground placeholder:text-muted px-3"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-foreground/10 shrink-0"
              >
                <X className="w-3 h-3 text-muted" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setSearchSuggestOpen(prev => !prev); }}
              className={`w-8 h-full flex items-center justify-center border-l border-foreground/[0.09] shrink-0 transition-colors ${searchSuggestOpen ? "text-accent" : "text-muted hover:text-foreground"}`}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${searchSuggestOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Search suggestions dropdown */}
            {searchSuggestOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-foreground/[0.08] rounded-2xl shadow-[var(--shadow-card)] p-4 z-[500] animate-drop-in">
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted"><Clock className="w-3 h-3" /> Recent</span>
                      <button onClick={() => { setRecentSearches([]); try { localStorage.removeItem("ra_recent_searches"); } catch {} }} className="text-[0.68rem] text-muted hover:text-accent transition-colors">
                        Clear all
                      </button>
                    </div>
                    {recentSearches.slice(0, 4).map(term => (
                      <div key={term} className="flex items-center group hover:bg-foreground/[0.03] rounded-lg transition-colors">
                        <button onClick={() => handleSearch(term)} className="flex items-center gap-2.5 flex-1 px-2 py-2 text-left">
                          <Clock className="w-3.5 h-3.5 text-muted shrink-0 opacity-50" />
                          <span className="text-[0.82rem]">{term}</span>
                          <span className="text-[0.68rem] text-muted ml-auto">{navSearchType}</span>
                        </button>
                        <button onClick={() => clearRecent(term)} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-muted hover:text-foreground" />
                        </button>
                      </div>
                    ))}
                    <div className="h-px bg-foreground/[0.06] my-3" />
                  </>
                )}

                {/* Trending suggestions */}
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3 h-3 text-muted" />
                  <span className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">
                    {searchQuery.trim() ? "Matching ideas" : `Trending ${navSearchType}`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 mb-3">
                  {filteredSuggestions.slice(0, 6).map(s => (
                    <button key={s.label} onClick={() => { setSearchQuery(s.label); handleSearch(s.label); }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.05] transition-colors text-left group">
                      <Hash className="w-3 h-3 text-muted opacity-40 shrink-0" />
                      <span className="text-[0.8rem] truncate">{s.label}</span>
                      <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-md ml-auto shrink-0 ${categoryColors[s.category] || ""}`}>{s.category}</span>
                    </button>
                  ))}
                </div>

                {/* Quick topic pills */}
                <div className="h-px bg-foreground/[0.06] mb-3" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.68rem] text-muted font-medium">Try:</span>
                  {(topicPills[navSearchType] || topicPills["Images"]).map(pill => (
                    <button key={pill} onClick={() => { setSearchQuery(pill); handleSearch(pill); }} className="text-[0.72rem] font-medium px-3 py-1.5 rounded-lg bg-foreground/[0.05] hover:bg-foreground/[0.1] transition-colors">
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Right Actions */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        {isLoggedIn && (
          <div className="relative" ref={createMenuRef}>
            <div className="flex items-center">
              <Link to="/upload" className="flex items-center gap-1.5 px-4 py-2 rounded-l-lg text-[0.82rem] font-semibold bg-accent text-primary-foreground hover:bg-accent/85 transition-colors no-underline">
                <Upload className="w-3.5 h-3.5" /> Upload Art
              </Link>
              <button
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                className="flex items-center justify-center h-[36px] w-[30px] bg-accent text-primary-foreground rounded-r-lg border-l border-primary-foreground/20 hover:bg-accent/85 transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${createMenuOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
            {createMenuOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl w-[280px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[500]">
                <div className="px-3 pt-1.5 pb-1 text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-muted">Create with AI</div>
                <Link to="/create?type=image" onClick={() => setCreateMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors no-underline">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                    <Wand2 className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <div className="text-[0.82rem] font-semibold text-foreground">Generate Image</div>
                    <div className="text-[0.7rem] text-muted">Create with AI prompts</div>
                  </div>
                </Link>
                <Link to="/create?type=video" onClick={() => setCreateMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors no-underline">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                    <Film className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-[0.82rem] font-semibold text-foreground">Generate Video</div>
                    <div className="text-[0.7rem] text-muted">AI-powered video creation</div>
                  </div>
                </Link>
                <Link to="/create?type=music" onClick={() => setCreateMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors no-underline">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
                    <Music2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-[0.82rem] font-semibold text-foreground">Generate Music</div>
                    <div className="text-[0.7rem] text-muted">AI music & soundscapes</div>
                  </div>
                </Link>
                <div className="h-px bg-foreground/[0.06] my-1.5" />
                <div className="px-3 pt-1.5 pb-1 text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-muted">Or bring your own</div>
                <Link to="/upload" onClick={() => setCreateMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors no-underline">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-[0.82rem] font-semibold text-foreground">Upload Art</div>
                    <div className="text-[0.7rem] text-muted">Share your own creations</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}

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
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-foreground/[0.06] transition-colors ml-1"
            >
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-[0.7rem] font-bold text-accent">
                {userInitials}
              </div>
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

        {!isLoggedIn && (
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
        )}
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
