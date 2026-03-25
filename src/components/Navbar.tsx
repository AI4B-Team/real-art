import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, Menu, Grid3X3, Star, Users, Trophy, BarChart3,
  Upload, Sparkles, FileText, X, Layout, ChevronDown, Plus,
  Compass, Image, Video, Music, LayoutDashboard, DollarSign,
  LogOut, Settings, Bookmark, TrendingUp, FolderOpen, Bell,
  Megaphone, LayoutGrid, User, Heart, Download, MessageCircle,
  RefreshCw, Award, Eye, Check, ArrowRight, UserPlus,
  Clock, Flame, ArrowUpRight, Hash, Wand2, WandSparkles, Film, Music2,
  Sun, Moon, Monitor, Languages, ChevronRight,
  Mic, Camera, ImagePlus, ArrowUpFromLine, ScanText, SlidersHorizontal, Link2, Clapperboard,
  CreditCard, Mail, UserPlus2, Zap, Power, HelpCircle, BookOpen, Route, MessageSquarePlus
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import AppTabs from "./AppTabs";

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

const Navbar = ({ hideLogo = false, sidebarOffset }: { hideLogo?: boolean; sidebarOffset?: number }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [communitiesOpen, setCommunitiesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [navSearchType, setNavSearchType] = useState("Images");
  const [navSearchDropOpen, setNavSearchDropOpen] = useState(false);
  const [searchSuggestOpen, setSearchSuggestOpen] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [imageSearchMode, setImageSearchMode] = useState<"search" | "reimagine" | "upscale" | "prompt" | "edit" | "video">("search");
  const [dragOver, setDragOver] = useState(false);
  const [imageSearchFile, setImageSearchFile] = useState<File | null>(null);
  const [imageSearchPrev, setImageSearchPrev] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const searchSuggestRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ra_recent_searches") || "[]"); } catch { return []; }
  });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ghostText, setGhostText] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuPanel, setMenuPanel] = useState<"main" | "language" | "theme">("main");
  const [activeTheme, setActiveTheme] = useState<"light" | "dark" | "system">(() => {
    try { return (localStorage.getItem("ra_theme") as "light" | "dark" | "system") ?? "light"; } catch { return "light"; }
  });
  const [activeLang, setActiveLang] = useState(() => {
    try { return localStorage.getItem("ra_lang") ?? "en"; } catch { return "en"; }
  });
  const [langSearch, setLangSearch] = useState("");
  const [notifications, setNotifications] = useState(initialNotifs);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const notifRef = useRef<HTMLDivElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  const [creditInfoOpen, setCreditInfoOpen] = useState(false);
  const creditRef = useRef<HTMLDivElement>(null);
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
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) { setUserMenuOpen(false); setMenuPanel("main"); setLangSearch(""); }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
      if (creditRef.current && !creditRef.current.contains(e.target as Node)) setCreditInfoOpen(false);
      if (searchSuggestRef.current && !searchSuggestRef.current.contains(e.target as Node)) setSearchSuggestOpen(false);
      
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  // Apply theme to document
  useEffect(() => {
    const apply = (t: string) => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = t === "dark" || (t === "system" && prefersDark);
      document.documentElement.classList.toggle("dark", isDark);
    };
    apply(activeTheme);
    if (activeTheme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [activeTheme]);

  const setTheme = (t: "light" | "dark" | "system") => {
    setActiveTheme(t);
    try { localStorage.setItem("ra_theme", t); } catch {}
  };

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Spanish", flag: "🇪🇸" },
    { code: "fr", label: "French", flag: "🇫🇷" },
    { code: "de", label: "German", flag: "🇩🇪" },
    { code: "pt", label: "Portuguese", flag: "🇧🇷" },
    { code: "it", label: "Italian", flag: "🇮🇹" },
    { code: "zh", label: "Chinese", flag: "🇨🇳" },
    { code: "ja", label: "Japanese", flag: "🇯🇵" },
    { code: "ko", label: "Korean", flag: "🇰🇷" },
    { code: "ar", label: "Arabic", flag: "🇸🇦" },
    { code: "hi", label: "Hindi", flag: "🇮🇳" },
    { code: "ru", label: "Russian", flag: "🇷🇺" },
  ];

  const filteredLangs = langSearch ? languages.filter(l => l.label.toLowerCase().includes(langSearch.toLowerCase())) : languages;
  const currentLang = languages.find(l => l.code === activeLang) || languages[0];
  const themeLabel = activeTheme === "light" ? "Light" : activeTheme === "dark" ? "Dark" : "System";
  const ThemeIcon = activeTheme === "light" ? Sun : activeTheme === "dark" ? Moon : Monitor;

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

  /* ── Voice search ── */
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice search is not supported in this browser.");
      setTimeout(() => setVoiceError(""), 4000);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setVoiceListening(false);
      handleSearch(transcript);
    };
    recognition.onerror = (event: any) => {
      setVoiceListening(false);
      if (event.error === "not-allowed") {
        setVoiceError("Microphone access denied. Please allow microphone permissions.");
      } else {
        setVoiceError("Could not recognize speech. Please try again.");
      }
      setTimeout(() => setVoiceError(""), 4000);
    };
    recognition.onend = () => setVoiceListening(false);
    setVoiceListening(true);
    recognition.start();
  };

  /* ── Image search handlers ── */
  const handleImageFile = (file: File) => {
    setImageSearchFile(file);
    const reader = new FileReader();
    reader.onload = e => setImageSearchPrev(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageSearchAction = () => {
    if (!imageSearchFile) return;
    setImageSearchOpen(false);
    setImageSearchFile(null);
    setImageSearchPrev(null);
    navigate(`/explore?mode=${imageSearchMode}&imageSearch=1`);
  };

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
    { icon: Sparkles, label: "REAL CREATOR", to: "/create" },
    { icon: Upload, label: "Upload Art", to: "/upload" },
  ];
  const infoLinks = [{ icon: FileText, label: "License Info", to: "/license" }];
  const userMenuLinks: { icon: typeof Settings; label: string; to: string; badge?: string }[] = [
    { icon: Settings, label: "Account", to: "/account" },
    { icon: CreditCard, label: "Subscription", to: "/account?tab=subscription", badge: "Pro" },
    { icon: Mail, label: "Invites", to: "/account?tab=invites" },
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
                    Clear All
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
    <nav className="fixed top-0 right-0 z-[600] h-16 px-3 md:px-5 flex items-center justify-between bg-background border-b border-foreground/[0.08]" style={{ left: sidebarOffset ? `${sidebarOffset}px` : 0 }}>
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

      {/* Logo — hidden when sidebar has logo */}
      {!hideLogo && (
        <div className="hidden md:flex items-center gap-0 shrink-0">
          <Logo to={isLoggedIn ? "/dashboard" : "/"} />
        </div>
      )}
      <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
        <Logo to={isLoggedIn ? "/dashboard" : "/"} />
      </div>


      {/* Mobile: 🔍 right */}
      <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="md:hidden w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
        <Search className="w-4 h-4" />
      </button>

      {/* Desktop Center Search */}
      {(!isHomePage || scrolled) && (
        <div className="hidden md:flex flex-1 max-w-6xl ml-0 mr-4 items-center gap-2">
          {isLoggedIn && (
            <>
              <Link to="/create" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.82rem] font-semibold bg-accent text-primary-foreground hover:bg-accent/85 transition-colors no-underline shrink-0">
                <WandSparkles className="w-3.5 h-3.5" /> Create
              </Link>
            </>
          )}
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

            {/* Mic button */}
            <button
              onClick={startVoiceSearch}
              className="w-8 h-full flex items-center justify-center text-muted hover:text-foreground transition-colors shrink-0"
              title="Search by voice (Ctrl+Shift+M)"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Camera button */}
            <button
              onClick={() => setImageSearchOpen(true)}
              className="w-8 h-full flex items-center justify-center text-muted hover:text-foreground transition-colors shrink-0"
              title="Search by image"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (searchSuggestOpen) {
                  setSearchSuggestOpen(false);
                  setActiveIndex(-1);
                  searchInputRef.current?.blur();
                  return;
                }

                setSearchSuggestOpen(true);
                searchInputRef.current?.focus();
              }}
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
            <Link to="/upload" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.82rem] font-semibold border border-foreground/[0.18] text-foreground hover:border-foreground/40 transition-colors no-underline">
              <Upload className="w-3.5 h-3.5" /> Upload
            </Link>
        )}
        {isLoggedIn && (
          <div className="relative" ref={creditRef}>
            <div className="flex items-center bg-foreground/[0.06] rounded-lg pl-3 pr-1 py-1 gap-2">
              <span className="text-green-500 text-[0.8rem]">◆</span>
              <span className="text-[0.82rem] font-semibold tabular-nums">273,245</span>
              <button
                onClick={(e) => { e.stopPropagation(); setCreditInfoOpen(!creditInfoOpen); }}
                className="text-muted hover:text-foreground transition-colors"
                title="Credit info"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <Link to="/account?tab=subscription" onClick={() => {}} className="bg-accent text-primary-foreground text-[0.76rem] font-semibold px-3 py-1 rounded-lg hover:bg-accent/85 transition-colors no-underline">
                Upgrade
              </Link>
            </div>
            {creditInfoOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 bg-card border border-foreground/[0.07] rounded-xl shadow-[var(--shadow-card)] p-3 w-[260px] z-[400] animate-drop-in">
                <p className="text-[0.8rem] text-foreground leading-snug">Your monthly credits will be refilled when your subscription renews.</p>
                <Link to="/account?tab=subscription" onClick={() => setCreditInfoOpen(false)} className="text-[0.78rem] text-accent hover:underline mt-1.5 inline-block no-underline">Read More</Link>
              </div>
            )}
          </div>
        )}

        {isLoggedIn && (
          <div className="relative" ref={helpRef}>
            <button onClick={() => { setHelpOpen(!helpOpen); setNotifOpen(false); setUserMenuOpen(false); }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors shrink-0">
              <HelpCircle className="w-[17px] h-[17px] opacity-60" />
            </button>
            {helpOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[180px] shadow-[var(--shadow-card)] p-1.5 animate-drop-in z-[400]">
                {[
                  { icon: HelpCircle, label: "Help", to: "/about" },
                  { icon: Route, label: "Tour", action: () => {} },
                  { icon: BookOpen, label: "Tutorials", to: "/blog" },
                  { icon: MessageSquarePlus, label: "Feedback", action: () => {} },
                ].map(item => (
                  item.to ? (
                    <Link key={item.label} to={item.to} onClick={() => setHelpOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] text-foreground hover:bg-foreground/[0.05] transition-colors no-underline">
                      <item.icon className="w-4 h-4 opacity-40 shrink-0" />{item.label}
                    </Link>
                  ) : (
                    <button key={item.label} onClick={() => { item.action?.(); setHelpOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] text-foreground hover:bg-foreground/[0.05] transition-colors w-full text-left">
                      <item.icon className="w-4 h-4 opacity-40 shrink-0" />{item.label}
                    </button>
                  )
                ))}
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
                        <Check className="w-3 h-3" /> Mark All Read
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
                  className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-foreground/[0.06] text-[0.78rem] font-semibold text-muted hover:text-foreground transition-colors no-underline">
                  View All Notifications <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {isLoggedIn ? (
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="w-9 h-9 rounded-full hover:bg-foreground/[0.06] transition-colors ml-1 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-[0.7rem] font-bold text-accent">{userInitials}</div>
            </button>
            {userMenuOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[300px] shadow-[var(--shadow-card)] animate-drop-in z-[400] overflow-hidden max-h-[80vh] overflow-y-auto">
                {menuPanel === "main" && (
                  <div className="p-4">
                    {/* User header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-[0.9rem] font-bold text-accent relative">
                        {userInitials}
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                          <Award className="w-2.5 h-2.5 text-amber-900" />
                        </span>
                      </div>
                      <div>
                        <div className="text-[0.92rem] font-semibold capitalize">{userDisplay}</div>
                        <div className="text-[0.78rem] text-muted">{userHandle}@gmail.com</div>
                      </div>
                    </div>

                    {/* Upgrade button */}
                    <button onClick={() => { setUserMenuOpen(false); navigate("/account?tab=subscription"); }} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent/85 transition-colors mb-2">
                      <Zap className="w-4 h-4" /> Upgrade
                    </button>

                    {/* Add Members */}
                    <button onClick={() => { setUserMenuOpen(false); navigate("/account?tab=members"); }} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium text-foreground hover:bg-foreground/[0.04] transition-colors">
                      <UserPlus className="w-4 h-4 opacity-50" /> Add Members
                    </button>

                    <div className="h-px bg-foreground/[0.06] my-3" />

                    {/* Menu links */}
                    {userMenuLinks.map(({ icon: Icon, label, to, badge }) => (
                      <Link key={label} to={to} onClick={() => { setUserMenuOpen(false); setMenuPanel("main"); }} className="flex items-center gap-3 px-2 py-2.5 rounded-xl text-[0.88rem] text-foreground hover:bg-foreground/[0.05] transition-colors no-underline">
                        <Icon className="w-[18px] h-[18px] opacity-40 shrink-0" />
                        <span>{label}</span>
                        {badge && <span className="ml-auto text-[0.75rem] text-muted">{badge}</span>}
                      </Link>
                    ))}

                    <div className="h-px bg-foreground/[0.06] my-2" />

                    {/* Language row */}
                    <button onClick={(e) => { e.stopPropagation(); setMenuPanel("language"); }} className="flex items-center gap-3 px-2 py-2.5 rounded-xl w-full text-left hover:bg-foreground/[0.05] transition-colors">
                      <Languages className="w-[18px] h-[18px] text-muted shrink-0" />
                      <span className="text-[0.84rem]">Language:</span>
                      <span className="ml-auto flex items-center gap-1.5 text-[0.82rem] text-muted">
                        {currentLang.label}
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </span>
                    </button>
                    {/* Theme row */}
                    <button onClick={(e) => { e.stopPropagation(); setMenuPanel("theme"); }} className="flex items-center gap-3 px-2 py-2.5 rounded-xl w-full text-left hover:bg-foreground/[0.05] transition-colors">
                      <ThemeIcon className="w-[18px] h-[18px] text-muted shrink-0" />
                      <span className="text-[0.84rem]">Theme:</span>
                      <span className="ml-auto flex items-center gap-1.5 text-[0.82rem] text-muted">
                        {themeLabel}
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </span>
                    </button>

                    {/* Join Affiliate */}
                    <button onClick={() => { setUserMenuOpen(false); navigate("/affiliates"); }} className="flex items-center justify-center gap-2 w-full py-2 mt-1 rounded-lg border border-amber-400/40 text-amber-600 dark:text-amber-400 text-[0.82rem] font-medium hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                      Join Affiliate Program
                    </button>

                    {/* Log Out */}
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 rounded-lg bg-destructive text-destructive-foreground text-[0.84rem] font-semibold hover:bg-destructive/85 transition-colors">
                      <Power className="w-4 h-4" /> Log Out
                    </button>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-foreground/[0.06]">
                      <div className="flex items-center gap-1.5 text-[0.72rem] text-muted">
                        <Link to="/terms" onClick={() => setUserMenuOpen(false)} className="hover:text-foreground transition-colors no-underline text-muted">Terms</Link>
                        <span>|</span>
                        <Link to="/privacy" onClick={() => setUserMenuOpen(false)} className="hover:text-foreground transition-colors no-underline text-muted">Privacy</Link>
                      </div>
                      <div className="flex items-center gap-2.5 text-muted">
                        <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                        </a>
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {menuPanel === "language" && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-1 py-2">
                      <button onClick={() => { setMenuPanel("main"); setLangSearch(""); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/[0.07] transition-colors shrink-0">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <span className="text-[0.88rem] font-semibold">Language</span>
                    </div>
                    <div className="px-1 pb-2">
                      <div className="flex items-center gap-2 bg-background border border-foreground/[0.1] rounded-lg px-3 h-9">
                        <Search className="w-3.5 h-3.5 text-muted shrink-0" />
                        <input autoFocus value={langSearch} onChange={e => setLangSearch(e.target.value)} placeholder="Search languages..." className="flex-1 bg-transparent border-none outline-none text-[0.84rem] font-body placeholder:text-muted" />
                        {langSearch && <button onClick={() => setLangSearch("")}><X className="w-3.5 h-3.5 text-muted" /></button>}
                      </div>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto">
                      {filteredLangs.length === 0 ? (
                        <div className="px-3 py-4 text-[0.82rem] text-muted text-center">No languages found</div>
                      ) : filteredLangs.map(lang => (
                        <button key={lang.code} onClick={() => { setActiveLang(lang.code); try { localStorage.setItem("ra_lang", lang.code); } catch {} setMenuPanel("main"); setLangSearch(""); }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-colors ${activeLang === lang.code ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.04]"}`}>
                          <span className="text-base">{lang.flag}</span>
                          <span className="text-[0.84rem]">{lang.label}</span>
                          {activeLang === lang.code && <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {menuPanel === "theme" && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-1 py-2">
                      <button onClick={() => setMenuPanel("main")} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/[0.07] transition-colors shrink-0">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <span className="text-[0.88rem] font-semibold">Theme</span>
                    </div>
                    <div className="flex flex-col gap-1 px-1 pb-1">
                      {([
                        { key: "light" as const, icon: Sun, label: "Light" },
                        { key: "dark" as const, icon: Moon, label: "Dark" },
                        { key: "system" as const, icon: Monitor, label: "Split" },
                      ]).map(opt => (
                        <button key={opt.key} onClick={() => setTheme(opt.key)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-colors ${activeTheme === opt.key ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.04]"}`}>
                          <opt.icon className="w-4 h-4 text-muted shrink-0" />
                          <span className="text-[0.84rem]">{opt.label}</span>
                          {activeTheme === opt.key && <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Voice listening overlay */}
      {voiceListening && (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setVoiceListening(false)}>
          <div className="flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="relative w-24 h-24 flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" style={{ animationDuration: "1.5s" }} />
              <div className="absolute inset-2 rounded-full bg-accent/30 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.3s" }} />
              <div className="absolute inset-4 rounded-full bg-accent/40 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.6s" }} />
              <div className="relative w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <Mic className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-display font-bold mb-2">Listening…</h2>
            <p className="text-sm text-muted mb-6">Speak now — say what you're looking for</p>
            <button onClick={() => setVoiceListening(false)} className="text-[0.8rem] text-muted hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Voice error toast */}
      {voiceError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 bg-foreground text-primary-foreground px-5 py-3 rounded-xl shadow-lg animate-drop-in">
          <Mic className="w-4 h-4 text-accent shrink-0" />
          <span className="text-[0.82rem] font-medium">{voiceError}</span>
          <button onClick={() => setVoiceError("")} className="ml-2 text-primary-foreground/50 hover:text-primary-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image search modal */}
      {imageSearchOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setImageSearchOpen(false); setImageSearchFile(null); setImageSearchPrev(null); setDragOver(false); }}>
          <div className="bg-background rounded-2xl w-full max-w-[860px] flex flex-col overflow-hidden shadow-2xl border border-foreground/[0.08]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-foreground/[0.08]">
              <Camera className="w-4 h-4 text-accent" />
              <div className="flex-1">
                <h3 className="text-[0.92rem] font-semibold text-foreground leading-tight">Visual Search & AI Tools</h3>
                <p className="text-[0.74rem] text-muted mt-0.5">Upload an image to search, remix, or transform it with AI</p>
              </div>
              <button onClick={() => { setImageSearchOpen(false); setImageSearchFile(null); setImageSearchPrev(null); }} className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Two-panel layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left panel - Mode pills */}
              <div className="w-[320px] shrink-0 border-r border-foreground/[0.08] px-4 py-4 flex flex-col gap-1">
                {([
                  { id: "search" as const, icon: Search, label: "Find Similar", desc: "Discover visually related images", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
                  { id: "reimagine" as const, icon: RefreshCw, label: "Reimagine", desc: "Generate AI variations", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
                  { id: "upscale" as const, icon: ArrowUpFromLine, label: "Upscale 4×", desc: "Enhance to ultra-HD resolution", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
                  { id: "prompt" as const, icon: ScanText, label: "Extract Prompt", desc: "Reverse-engineer the AI prompt", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
                  { id: "edit" as const, icon: SlidersHorizontal, label: "Edit with AI", desc: "Modify using natural language", color: "text-accent", bg: "bg-accent/10" },
                  { id: "video" as const, icon: Video, label: "Animate", desc: "Turn this image into a video loop", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/40" },
                ]).map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setImageSearchMode(mode.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all group ${imageSearchMode === mode.id ? "bg-foreground text-primary-foreground shadow-sm" : "hover:bg-foreground/[0.04] text-foreground"}`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${imageSearchMode === mode.id ? "bg-primary-foreground/20" : mode.bg}`}>
                      <mode.icon className={`w-3.5 h-3.5 ${imageSearchMode === mode.id ? "text-primary-foreground" : mode.color}`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[0.82rem] font-medium block leading-tight">{mode.label}</span>
                      <span className={`text-[0.7rem] block mt-0.5 ${imageSearchMode === mode.id ? "text-primary-foreground/60" : "text-muted"}`}>{mode.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right panel - Drop zone / Preview */}
              <div className="flex-1 px-6 py-4 flex flex-col">
                {imageSearchPrev ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    {/* Preview */}
                    <div className="relative">
                      <img src={imageSearchPrev} alt="Preview" className="max-h-[240px] rounded-xl object-contain border border-foreground/[0.08]" />
                      <button onClick={() => { setImageSearchFile(null); setImageSearchPrev(null); }} className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-foreground text-primary-foreground flex items-center justify-center hover:bg-accent transition-colors shadow-md">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* File info */}
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] w-full max-w-sm">
                      <ImagePlus className="w-4 h-4 text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[0.78rem] text-foreground block truncate">{imageSearchFile?.name || "image.jpg"}</span>
                        <span className="text-[0.68rem] text-muted">{imageSearchFile ? (imageSearchFile.size / 1024 / 1024).toFixed(2) + " MB" : ""}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }} className="text-[0.74rem] font-medium text-accent hover:underline shrink-0">Change</button>
                    </div>
                    {/* CTA */}
                    <button onClick={handleImageSearchAction} className="flex items-center justify-center gap-2 w-full max-w-sm py-3 rounded-xl bg-accent text-white font-semibold text-[0.88rem] hover:bg-accent/85 transition-colors">
                      {imageSearchMode === "search" ? <><Search className="w-4 h-4" />Find Similar Images</>
                        : imageSearchMode === "reimagine" ? <><RefreshCw className="w-4 h-4" />Reimagine This Image</>
                        : imageSearchMode === "upscale" ? <><ArrowUpFromLine className="w-4 h-4" />Upscale to HD</>
                        : imageSearchMode === "prompt" ? <><ScanText className="w-4 h-4" />Extract AI Prompt</>
                        : imageSearchMode === "edit" ? <><SlidersHorizontal className="w-4 h-4" />Edit with AI</>
                        : <><Video className="w-4 h-4" />Animate This Image</>}
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Drop zone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false); }}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                      onClick={() => imageInputRef.current?.click()}
                      className={`relative flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[220px] ${
                        dragOver
                          ? "border-accent bg-accent/[0.06] scale-[1.01]"
                          : "border-foreground/[0.14] hover:border-foreground/30 hover:bg-foreground/[0.02]"
                      }`}
                    >
                      {dragOver && (
                        <div className="flex flex-col items-center gap-2">
                          <ImagePlus className="w-7 h-7 text-accent" />
                          <span className="text-[0.85rem] font-medium text-accent">Drop to upload</span>
                        </div>
                      )}
                      {!dragOver && (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-foreground/[0.05] flex items-center justify-center">
                            <ImagePlus className="w-7 h-7 text-muted" />
                          </div>
                          <div className="text-center">
                            <p className="text-[0.88rem] text-foreground font-medium mb-0.5">Drop an image here</p>
                            <p className="text-[0.74rem] text-muted">or click to browse files</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground/[0.07] text-foreground text-[0.82rem] font-medium hover:bg-foreground/[0.12] transition-colors">
                            <Upload className="w-3.5 h-3.5" /> Choose File
                          </button>
                          <p className="text-[0.68rem] text-muted">JPG, PNG, WEBP · max 60 MB · min 224×224 px</p>
                        </>
                      )}
                    </div>
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }} />

                    {/* URL input */}
                    <div className="text-center">
                      <p className="text-[0.72rem] text-muted mb-2">or paste an image URL</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-foreground/[0.04] border border-foreground/[0.1] rounded-xl px-3 py-2.5">
                          <Link2 className="w-3.5 h-3.5 text-muted shrink-0" />
                          <input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 bg-transparent border-none outline-none text-[0.82rem] text-foreground placeholder:text-muted/50 font-body"
                            onKeyDown={async (e) => {
                              if (e.key !== "Enter") return;
                              const url = (e.target as HTMLInputElement).value.trim();
                              if (!url) return;
                              try {
                                const res = await fetch(url);
                                const blob = await res.blob();
                                handleImageFile(new File([blob], "image.jpg", { type: blob.type }));
                              } catch { setVoiceError("Couldn't load that image URL."); }
                            }}
                          />
                        </div>
                        <button
                          onClick={async (e) => {
                            const input = (e.currentTarget.previousElementSibling?.querySelector("input") as HTMLInputElement);
                            if (!input?.value.trim()) return;
                            try {
                              const res = await fetch(input.value.trim());
                              const blob = await res.blob();
                              handleImageFile(new File([blob], "image.jpg", { type: blob.type }));
                              input.value = "";
                            } catch { setVoiceError("Couldn't load that URL."); }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-foreground/[0.07] text-foreground text-[0.82rem] font-medium hover:bg-foreground/[0.12] transition-colors"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
