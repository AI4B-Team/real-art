import { useState, useRef, useEffect, useCallback } from "react";
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
  download: Download, dollar: DollarSign, heart: Heart, userplus: UserPlus,
  comment: MessageCircle, refresh: RefreshCw, award: Award, eye: Eye, bookmark: Bookmark,
};

type Community = {
  id: string; name: string; to: string; newPosts?: number; pinned: boolean;
};

/* ── Search data ── */
type Suggestion = { label: string; category: string; count: string };

const suggestions: Record<string, Suggestion[]> = {
  Images: [
    { label: "cosmic abstract", category: "Trending", count: "14.2K" },
    { label: "cyberpunk city at night", category: "Trending", count: "9.8K" },
    { label: "ai avatar portrait", category: "Trending", count: "8.1K" },
    { label: "luxury interior design", category: "Popular", count: "6.4K" },
    { label: "dark fantasy landscape", category: "Popular", count: "5.7K" },
    { label: "neon botanical", category: "Rising", count: "3.2K" },
    { label: "minimalist architecture", category: "Popular", count: "4.1K" },
    { label: "surreal dreamscape", category: "Rising", count: "2.9K" },
  ],
  Videos: [
    { label: "looping abstract", category: "Trending", count: "7.4K" },
    { label: "particle effect loop", category: "Trending", count: "5.2K" },
    { label: "cinematic drone footage", category: "Popular", count: "4.8K" },
    { label: "neon light trails", category: "Rising", count: "2.1K" },
    { label: "liquid simulation", category: "Popular", count: "3.3K" },
    { label: "timelapse sky", category: "Popular", count: "3.9K" },
  ],
  Music: [
    { label: "lo-fi chill beats", category: "Trending", count: "11.1K" },
    { label: "ambient soundscape", category: "Popular", count: "6.3K" },
    { label: "cinematic orchestral", category: "Popular", count: "5.0K" },
    { label: "electronic dark synth", category: "Trending", count: "4.4K" },
    { label: "acoustic background", category: "Rising", count: "2.7K" },
  ],
};

type CreatorResult = { name: string; handle: string; initials: string; color: string; images: number };
type CollectionResult = { name: string; count: number; photo: string };

const creatorResults: Record<string, CreatorResult[]> = {
  cosmic: [{ name: "AI.Verse", handle: "@aiverse", initials: "AV", color: "#4361ee", images: 284 }, { name: "NeoPixel", handle: "@neopixel", initials: "NP", color: "#c9184a", images: 196 }],
  neon: [{ name: "NeoPixel", handle: "@neopixel", initials: "NP", color: "#c9184a", images: 196 }],
  luxury: [{ name: "LuminaAI", handle: "@luminaai", initials: "LA", color: "#e76f51", images: 142 }],
  fantasy: [{ name: "DreamForge", handle: "@dreamforge", initials: "DF", color: "#2a9d8f", images: 421 }],
  avatar: [{ name: "LuminaAI", handle: "@luminaai", initials: "LA", color: "#e76f51", images: 142 }],
  abstract: [{ name: "SpectraGen", handle: "@spectragen", initials: "SG", color: "#7b2d8b", images: 312 }],
  cyber: [{ name: "AI.Verse", handle: "@aiverse", initials: "AV", color: "#4361ee", images: 284 }],
};

const collectionResults: Record<string, CollectionResult[]> = {
  cosmic: [{ name: "Cosmic Worlds", count: 412, photo: "photo-1618005182384-a83a8bd57fbe" }],
  cyber: [{ name: "Cyberpunk Cities", count: 128, photo: "photo-1557682250-33bd709cbe85" }],
  neon: [{ name: "Neon Cities", count: 267, photo: "photo-1557682250-33bd709cbe85" }],
  luxury: [{ name: "Luxury Lifestyle", count: 239, photo: "photo-1600210492486-724fe5c67fb0" }],
  fantasy: [{ name: "Dark Fantasy", count: 156, photo: "photo-1541701494587-cb58502866ab" }],
  avatar: [{ name: "Digital Avatars", count: 520, photo: "photo-1579546929518-9e396f3cc809" }],
  "lo-fi": [{ name: "Chill Vibes", count: 88, photo: "photo-1470225620780-dba8ba36b745" }],
};

const categoryColors: Record<string, string> = {
  Trending: "text-accent bg-accent/10",
  Popular: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
  Rising: "text-green-600 bg-green-50 dark:bg-green-950/30",
};

const topicPills: Record<string, string[]> = {
  Images: ["cyberpunk", "portraits", "abstract", "luxury", "nature", "avatars"],
  Videos: ["loop", "cinematic", "particle", "ambient", "timelapse"],
  Music: ["lo-fi", "ambient", "orchestral", "chill", "dark"],
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ghostText, setGhostText] = useState("");
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

  const syncAuth = () => {
    try {
      setIsLoggedIn(localStorage.getItem("ra_auth") === "1");
      setUserDisplay((localStorage.getItem("ra_display") || "AI.Verse").toLowerCase());
      setUserHandle((localStorage.getItem("ra_username") || "aiverse").toLowerCase());
    } catch {}
  };
  useEffect(() => { syncAuth(); }, [location.pathname]);
  useEffect(() => {
    window.addEventListener("storage", syncAuth);
    window.addEventListener("ra_auth_changed", syncAuth);
    return () => { window.removeEventListener("storage", syncAuth); window.removeEventListener("ra_auth_changed", syncAuth); };
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

  /* ── Cmd+K / slash global shortcut ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchSuggestOpen(true);
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchSuggestOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem("ra_auth"); localStorage.removeItem("ra_display"); localStorage.removeItem("ra_username"); } catch {}
    setIsLoggedIn(false); setUserDisplay("AI.Verse"); setUserHandle("aiverse"); setUserMenuOpen(false);
    navigate("/");
  };

  const togglePin = (id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };
  const sortedCommunities = [...communities].sort((a, b) => { if (a.pinned !== b.pinned) return a.pinned ? -1 : 1; return 0; });

  const handleSearch = (q?: string) => {
    const term = (q || searchQuery).trim();
    if (!term) return;
    const next = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8);
    setRecentSearches(next);
    try { localStorage.setItem("ra_recent_searches", JSON.stringify(next)); } catch {}
    setSearchSuggestOpen(false);
    setActiveIndex(-1);
    setGhostText("");
    navigate(`/explore?q=${encodeURIComponent(term)}&type=${encodeURIComponent(navSearchType)}`);
    setSearchQuery("");
  };

  const clearRecent = (term: string) => {
    const next = recentSearches.filter(s => s !== term);
    setRecentSearches(next);
    try { localStorage.setItem("ra_recent_searches", JSON.stringify(next)); } catch {}
  };

  /* ── Derived search data ── */
  const currentSuggestions = suggestions[navSearchType] || suggestions["Images"];
  const q = searchQuery.trim().toLowerCase();
  const filteredSuggestions = q ? currentSuggestions.filter(s => s.label.includes(q)) : currentSuggestions;

  // Match creators & collections
  const matchedCreators: CreatorResult[] = q
    ? Object.entries(creatorResults).filter(([key]) => q.includes(key) || key.includes(q)).flatMap(([, v]) => v)
      .filter((c, i, arr) => arr.findIndex(x => x.handle === c.handle) === i)
    : [];
  const matchedCollections: CollectionResult[] = q
    ? Object.entries(collectionResults).filter(([key]) => q.includes(key) || key.includes(q)).flatMap(([, v]) => v)
      .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)
    : [];

  const hasResults = q ? (filteredSuggestions.length > 0 || matchedCreators.length > 0 || matchedCollections.length > 0) : true;

  // Total navigable items for keyboard
  const allNavItems = q
    ? [...filteredSuggestions.map((s, i) => ({ type: "suggestion" as const, idx: i })),
       ...matchedCreators.map((_, i) => ({ type: "creator" as const, idx: i })),
       ...matchedCollections.map((_, i) => ({ type: "collection" as const, idx: i }))]
    : [...(recentSearches.length > 0 ? recentSearches.slice(0, 4).map((_, i) => ({ type: "recent" as const, idx: i })) : []),
       ...currentSuggestions.slice(0, 6).map((_, i) => ({ type: "trending" as const, idx: i }))];

  /* ── Ghost text autocomplete ── */
  useEffect(() => {
    if (!q) { setGhostText(""); return; }
    const match = currentSuggestions.find(s => s.label.startsWith(q) && s.label.length > q.length);
    setGhostText(match ? match.label.slice(q.length) : "");
  }, [q, navSearchType]);

  /* ── Keyboard navigation ── */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && ghostText && !e.shiftKey) {
      e.preventDefault();
      setSearchQuery(searchQuery + ghostText);
      setGhostText("");
      setActiveIndex(-1);
      return;
    }
    if (e.key === "Escape") {
      setSearchSuggestOpen(false);
      setActiveIndex(-1);
      searchInputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % allNavItems.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev <= 0 ? allNavItems.length - 1 : prev - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < allNavItems.length) {
        const item = allNavItems[activeIndex];
        if (item.type === "suggestion") handleSearch(filteredSuggestions[item.idx].label);
        else if (item.type === "creator") {
          const c = matchedCreators[item.idx];
          navigate(`/creator/${c.handle.replace("@", "")}`);
          setSearchSuggestOpen(false);
        }
        else if (item.type === "collection") {
          handleSearch(matchedCollections[item.idx].name);
        }
        else if (item.type === "recent") handleSearch(recentSearches[item.idx]);
        else if (item.type === "trending") handleSearch(currentSuggestions[item.idx].label);
      } else {
        handleSearch();
      }
      return;
    }
  }, [ghostText, searchQuery, activeIndex, allNavItems, filteredSuggestions, matchedCreators, matchedCollections, recentSearches, currentSuggestions, navSearchType]);

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
  const infoLinks = [{ icon: FileText, label: "License Info", to: "/license" }];
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

  /* ── Search dropdown content ── */
  const renderSearchDropdown = () => {
    if (!searchSuggestOpen) return null;

    return (
      <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-foreground/[0.08] rounded-2xl shadow-[var(--shadow-card)] p-4 z-[500] animate-drop-in">
        {/* Ghost completion hint strip */}
        {ghostText && q && (
          <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-foreground/[0.03]">
            <span className="text-[0.75rem] text-muted">Complete:</span>
            <span className="text-[0.82rem] font-medium">
              {searchQuery}<span className="text-muted/50">{ghostText}</span>
            </span>
            <kbd className="ml-auto text-[0.6rem] font-mono px-1.5 py-0.5 rounded border border-foreground/[0.12] bg-foreground/[0.04] text-muted">Tab</kbd>
          </div>
        )}

        {q ? (
          /* ── Typed state: filtered results ── */
          <>
            {/* Creators */}
            {matchedCreators.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="w-3 h-3" />
                  <span className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">Creator</span>
                </div>
                {matchedCreators.map((c, i) => {
                  const itemIdx = filteredSuggestions.length + i;
                  return (
                    <Link
                      key={c.handle}
                      to={`/creator/${c.handle.replace("@", "")}`}
                      onClick={() => setSearchSuggestOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors no-underline ${activeIndex === itemIdx ? "bg-foreground/[0.07]" : "hover:bg-foreground/[0.04]"}`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-bold text-white shrink-0" style={{ backgroundColor: c.color }}>
                        {c.initials}
                      </div>
                      <div>
                        <div className="text-[0.82rem] font-semibold text-foreground">{c.name}</div>
                        <div className="text-[0.72rem] text-muted">{c.handle} · {c.images} images</div>
                      </div>
                    </Link>
                  );
                })}
                <div className="h-px bg-foreground/[0.06] my-2" />
              </>
            )}

            {/* Collections */}
            {matchedCollections.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 mb-2">
                  <FolderOpen className="w-3 h-3" />
                  <span className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">Collection</span>
                </div>
                {matchedCollections.map((c, i) => {
                  const itemIdx = filteredSuggestions.length + matchedCreators.length + i;
                  return (
                    <Link
                      key={c.name}
                      to={`/collections`}
                      onClick={() => setSearchSuggestOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors no-underline ${activeIndex === itemIdx ? "bg-foreground/[0.07]" : "hover:bg-foreground/[0.04]"}`}
                    >
                      <img
                        src={`https://images.unsplash.com/${c.photo}?w=64&h=64&fit=crop`}
                        alt={c.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <div className="text-[0.82rem] font-semibold text-foreground">{c.name}</div>
                        <div className="text-[0.72rem] text-muted">{c.count} images · Collection</div>
                      </div>
                    </Link>
                  );
                })}
                <div className="h-px bg-foreground/[0.06] my-2" />
              </>
            )}

            {/* Matching suggestions with counts */}
            {filteredSuggestions.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 mb-2">
                  {(() => { const Icon = navSearchType === "Images" ? Image : navSearchType === "Videos" ? Video : Music; return <Icon className="w-3 h-3" />; })()}
                  <span className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">{navSearchType}</span>
                </div>
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => handleSearch(s.label)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-colors text-left ${activeIndex === i ? "bg-foreground/[0.07]" : "hover:bg-foreground/[0.04]"}`}
                  >
                    <Search className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span className="text-[0.82rem] flex-1">
                      <span className="font-semibold">{s.label.slice(0, q.length)}</span>{s.label.slice(q.length)}
                    </span>
                    <span className="text-[0.68rem] text-muted shrink-0">{s.count}</span>
                    <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${categoryColors[s.category] || ""}`}>{s.category}</span>
                  </button>
                ))}
              </>
            )}

            {/* No results state */}
            {!hasResults && (
              <div className="py-6 text-center">
                <div className="text-[0.9rem] font-semibold mb-1">No results for "{q}"</div>
                <p className="text-[0.78rem] text-muted mb-4">Try different keywords or explore by category</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {["abstract", "portraits", "cyberpunk", "nature"].map(tag => (
                    <button key={tag} onClick={() => handleSearch(tag)} className="text-[0.75rem] font-medium px-2.5 py-1 rounded-lg border border-foreground/[0.1] text-muted hover:border-foreground/30 hover:text-foreground transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scope pills */}
            {hasResults && (
              <>
                <div className="h-px bg-foreground/[0.06] my-3" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.72rem] text-muted">Search "{q}" in:</span>
                  {(["Images", "Videos", "Music"] as const).map(type => {
                    const Icon = type === "Images" ? Image : type === "Videos" ? Video : Music;
                    return (
                      <button
                        key={type}
                        onClick={() => { setNavSearchType(type); handleSearch(searchQuery); }}
                        className={`flex items-center gap-1 text-[0.75rem] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                          navSearchType === type
                            ? "border-accent text-accent bg-accent/10"
                            : "border-foreground/[0.1] text-muted hover:border-foreground/30 hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {type}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          /* ── Idle state: recent + trending ── */
          <>
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted"><Clock className="w-3 h-3" /> Recent</span>
                  <button onClick={() => { setRecentSearches([]); try { localStorage.removeItem("ra_recent_searches"); } catch {} }} className="text-[0.68rem] text-muted hover:text-accent transition-colors">
                    Clear all
                  </button>
                </div>
                {recentSearches.slice(0, 4).map((term, i) => (
                  <div key={term} className={`flex items-center group rounded-lg transition-colors ${activeIndex === i ? "bg-foreground/[0.07]" : "hover:bg-foreground/[0.03]"}`}>
                    <button onClick={() => handleSearch(term)} className="flex items-center gap-2.5 flex-1 px-2 py-2 text-left">
                      <Clock className="w-3.5 h-3.5 text-muted shrink-0 opacity-40" />
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

            {/* Trending */}
            <div className="flex items-center gap-1.5 mb-2">
              <Flame className="w-3 h-3 text-accent" />
              <span className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">
                Trending {navSearchType}
              </span>
              <span className="text-[0.6rem] text-muted ml-1">searches today</span>
            </div>
            {currentSuggestions.slice(0, 6).map((s, i) => {
              const idx = recentSearches.length > 0 ? recentSearches.slice(0, 4).length + i : i;
              return (
                <button
                  key={s.label}
                  onClick={() => handleSearch(s.label)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-colors text-left group ${activeIndex === idx ? "bg-foreground/[0.07]" : "hover:bg-foreground/[0.04]"}`}
                >
                  <span className={`text-[0.68rem] font-bold w-5 text-center shrink-0 ${i < 3 ? "text-accent" : "text-muted"}`}>{i + 1}</span>
                  <span className="text-[0.82rem] flex-1">{s.label}</span>
                  <span className="text-[0.68rem] text-muted shrink-0">{s.count}</span>
                  <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${categoryColors[s.category] || ""}`}>{s.category}</span>
                </button>
              );
            })}

            {/* Quick topic pills */}
            <div className="h-px bg-foreground/[0.06] my-3" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[0.68rem] text-muted font-medium">Try:</span>
              {(topicPills[navSearchType] || topicPills["Images"]).map(tag => (
                <button key={tag} onClick={() => handleSearch(tag)} className="text-[0.75rem] font-medium px-2.5 py-1 rounded-lg border border-foreground/[0.1] text-muted hover:border-foreground/30 hover:text-foreground transition-colors">
                  {tag}
                </button>
              ))}
            </div>

            {/* Keyboard hints */}
            <div className="h-px bg-foreground/[0.06] my-3" />
            <div className="flex items-center justify-center gap-4 text-[0.65rem] text-muted">
              <span><kbd className="px-1 py-0.5 rounded border border-foreground/[0.1] bg-foreground/[0.03] font-mono text-[0.6rem] mr-1">↑↓</kbd>navigate</span>
              <span><kbd className="px-1 py-0.5 rounded border border-foreground/[0.1] bg-foreground/[0.03] font-mono text-[0.6rem] mr-1">↵</kbd>select</span>
              <span><kbd className="px-1 py-0.5 rounded border border-foreground/[0.1] bg-foreground/[0.03] font-mono text-[0.6rem] mr-1">Tab</kbd>complete</span>
              <span><kbd className="px-1 py-0.5 rounded border border-foreground/[0.1] bg-foreground/[0.03] font-mono text-[0.6rem] mr-1">Esc</kbd>close</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[600] h-16 px-4 md:px-12 flex items-center justify-between bg-background border-b border-foreground/[0.08]">
      {/* Mobile: ☰ left */}
      <div className="md:hidden relative" ref={menuRef}>
        <button onClick={() => setMenuOpen(!menuOpen)} className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        {menuOpen && (
          <div className="absolute top-[calc(100%+10px)] left-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[260px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]">
            {menuContent}
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="hidden md:flex items-center gap-0 shrink-0">
        <Link to="/" className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer no-underline shrink-0">
          Real<span className="text-accent">.</span>Art
        </Link>
      </div>
      <Link to="/" className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer no-underline shrink-0 absolute left-1/2 -translate-x-1/2 md:hidden">
        Real<span className="text-accent">.</span>Art
      </Link>

      {/* Mobile: 🔍 right */}
      <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="md:hidden w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
        <Search className="w-4 h-4" />
      </button>

      {/* Desktop Center Search */}
      {(!isHomePage || scrolled) && (
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div ref={searchSuggestRef} className="relative w-full flex items-center bg-foreground/[0.06] rounded-lg h-[42px] focus-within:ring-2 focus-within:ring-accent/20">
            {/* Type selector */}
            <div ref={navSearchDropRef} className="relative flex items-center gap-1.5 px-3 h-full cursor-pointer border-r border-foreground/[0.09] shrink-0 select-none" onClick={() => setNavSearchDropOpen(!navSearchDropOpen)}>
              {(() => { const Icon = navSearchType === "Images" ? Image : navSearchType === "Videos" ? Video : Music; return <Icon className="w-3.5 h-3.5 opacity-60" />; })()}
              <span className="text-[0.82rem] font-medium whitespace-nowrap">{navSearchType}</span>
              <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${navSearchDropOpen ? "rotate-180" : ""}`} />
              {navSearchDropOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 bg-card border border-foreground/[0.08] rounded-xl min-w-[150px] shadow-[var(--shadow-card)] p-1.5 z-[500] animate-drop-in">
                  {[{ label: "Images", icon: Image }, { label: "Videos", icon: Video }, { label: "Music", icon: Music }].map(({ label, icon: Icon }) => (
                    <div key={label} onClick={(e) => { e.stopPropagation(); setNavSearchType(label); setNavSearchDropOpen(false); setActiveIndex(-1); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-[0.82rem] font-medium transition-colors ${navSearchType === label ? "bg-accent text-primary-foreground" : "hover:bg-background"}`}
                    >
                      <Icon className="w-3.5 h-3.5" />{label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ghost text layer */}
            {ghostText && searchQuery && (
              <div className="absolute left-[120px] top-1/2 -translate-y-1/2 pointer-events-none font-body text-[0.88rem] whitespace-nowrap z-0">
                <span className="invisible">{searchQuery}</span>
                <span className="text-muted/50">{ghostText}</span>
              </div>
            )}

            {/* Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1); if (!searchSuggestOpen) setSearchSuggestOpen(true); }}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => setSearchSuggestOpen(true)}
              placeholder={`Search ${navSearchType.toLowerCase()}…`}
              className="w-full border-none outline-none bg-transparent font-body text-[0.88rem] text-foreground placeholder:text-muted px-3 relative z-10"
              autoComplete="off"
            />

            {/* Cmd+K hint */}
            {!searchQuery && !searchSuggestOpen && (
              <kbd className="hidden lg:inline-flex items-center text-[0.6rem] font-mono text-muted px-1.5 py-0.5 rounded border border-foreground/[0.1] bg-foreground/[0.03] mr-2 shrink-0">⌘K</kbd>
            )}

            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setActiveIndex(-1); setGhostText(""); }} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-foreground/10 mr-1 shrink-0">
                <X className="w-3 h-3 text-muted" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setSearchSuggestOpen(!searchSuggestOpen); searchInputRef.current?.focus(); }}
              className={`w-8 h-full flex items-center justify-center border-l border-foreground/[0.09] shrink-0 transition-colors ${searchSuggestOpen ? "text-accent" : "text-muted hover:text-foreground"}`}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${searchSuggestOpen ? "rotate-180" : ""}`} />
            </button>

            {renderSearchDropdown()}
          </div>
        </div>
      )}

      {/* Desktop Right Actions */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        {isLoggedIn && (
          <div className="relative" ref={createMenuRef}>
            <div className="flex items-center">
              <Link to="/create" className="flex items-center gap-1.5 px-4 py-2 rounded-l-lg text-[0.82rem] font-semibold bg-accent text-primary-foreground hover:bg-accent/85 transition-colors no-underline">
                <Upload className="w-3.5 h-3.5" /> Create
              </Link>
              <button onClick={() => setCreateMenuOpen(!createMenuOpen)}
                className="flex items-center justify-center h-[36px] w-[30px] bg-accent text-primary-foreground rounded-r-lg border-l border-primary-foreground/20 hover:bg-accent/85 transition-colors">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${createMenuOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
            {createMenuOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl w-[280px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[500]">
                <div className="px-3 pt-1.5 pb-1 text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-muted">Create with AI</div>
                {[
                  { icon: Wand2, label: "Generate Image", desc: "Text-to-image with AI", to: "/create?type=image", color: "text-violet-500", bg: "bg-violet-500/15" },
                  { icon: Film, label: "Generate Video", desc: "Animate a scene or loop", to: "/create?type=video", color: "text-blue-500", bg: "bg-blue-500/15" },
                  { icon: Music2, label: "Generate Music", desc: "AI soundtrack or sound effect", to: "/create?type=music", color: "text-emerald-500", bg: "bg-emerald-500/15" },
                ].map(item => (
                  <Link key={item.label} to={item.to} onClick={() => setCreateMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors no-underline">
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <div className="text-[0.82rem] font-semibold text-foreground">{item.label}</div>
                      <div className="text-[0.7rem] text-muted">{item.desc}</div>
                    </div>
                  </Link>
                ))}
                <div className="h-px bg-foreground/[0.06] my-1.5" />
                <div className="px-3 pt-1.5 pb-1 text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-muted">Or bring your own</div>
                <Link to="/upload" onClick={() => setCreateMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors no-underline">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0"><Upload className="w-4 h-4 text-accent" /></div>
                  <div>
                    <div className="text-[0.82rem] font-semibold text-foreground">Upload Art</div>
                    <div className="text-[0.7rem] text-muted">Images, video, or audio files</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}

        {isLoggedIn && (
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }} className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors shrink-0">
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
                      {unreadNotifs.length > 0 && <span className="text-[0.65rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-md">{unreadNotifs.length} unread</span>}
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button onClick={markAllNotifRead} className="flex items-center gap-1 text-[0.72rem] font-medium text-muted hover:text-foreground transition-colors">
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {(["all", "unread"] as const).map(f => (
                      <button key={f} onClick={() => setNotifFilter(f)}
                        className={`px-3.5 py-1.5 rounded-lg text-[0.76rem] font-medium capitalize transition-colors ${notifFilter === f ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.05]"}`}
                      >
                        {f}
                        {f === "unread" && unreadNotifs.length > 0 && <span className="ml-1 text-[0.6rem] bg-accent text-primary-foreground px-1 py-0.5 rounded-full">{unreadNotifs.length}</span>}
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
                        <Link key={n.id} to={n.link} onClick={() => { markNotifRead(n.id); setNotifOpen(false); }}
                          className={`flex items-start gap-3 px-5 py-3.5 transition-colors no-underline border-b border-foreground/[0.04] last:border-none ${!n.read ? "bg-accent/[0.025] hover:bg-accent/[0.04]" : "hover:bg-foreground/[0.02]"}`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${n.iconBg} flex items-center justify-center shrink-0 mt-0.5`}><Icon className={`w-4 h-4 ${n.iconColor}`} /></div>
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
                <Link to="/dashboard?section=notifications" onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-foreground/[0.06] text-[0.78rem] font-semibold text-accent hover:bg-foreground/[0.02] transition-colors no-underline">
                  View All Notifications <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {isLoggedIn ? (
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-foreground/[0.06] transition-colors ml-1">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-[0.7rem] font-bold text-accent">{userInitials}</div>
            </button>
            {userMenuOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[232px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]">
                <div className="flex items-center gap-3 px-3.5 py-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-[0.8rem] font-bold text-accent">{userInitials}</div>
                  <div>
                    <div className="text-[0.88rem] font-semibold">{userDisplay}</div>
                    <div className="text-[0.75rem] text-muted lowercase">@{userHandle}</div>
                  </div>
                </div>
                <div className="h-px bg-foreground/[0.06] my-1" />
                {userMenuLinks.map(({ icon: Icon, label, to }) => (
                  <Link key={label} to={to} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.84rem] text-foreground hover:bg-background transition-colors no-underline">
                    <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />{label}
                  </Link>
                ))}
                {userMenuSecondary.length > 0 && <div className="h-px bg-foreground/[0.06] my-1" />}
                {userMenuSecondary.map(({ icon: Icon, label, to }) => (
                  <Link key={label} to={to} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.84rem] text-foreground hover:bg-background transition-colors no-underline">
                    <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />{label}
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
          <>
            <Link to="/login"><button className="text-[0.8rem] font-medium bg-transparent border border-foreground/[0.18] px-[18px] py-[7px] rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors">Log In</button></Link>
            <Link to="/signup"><button className="text-[0.8rem] font-semibold bg-accent text-primary-foreground border-none px-6 py-2.5 rounded-lg cursor-pointer hover:bg-accent/85 transition-colors">Join Free</button></Link>
          </>
        )}

        {!isLoggedIn && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors ml-0.5">
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
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { handleSearch(); setMobileSearchOpen(false); } }}
              placeholder="Search visuals..." autoFocus
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-foreground/[0.06] border-none outline-none font-body text-[0.88rem] text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent/20"
            />
            <button onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-foreground/10">
              <X className="w-3 h-3 text-muted" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
