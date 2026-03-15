import { useState, useRef, useEffect } from "react";
import { Search, Menu, Grid3X3, Star, Users, Trophy, BarChart3, Upload, Sparkles, FileText, X, Layout, ChevronDown, Plus, Compass } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (!isHomePage) return;
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

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
    { icon: Grid3X3, label: "Explore", to: "/explore" },
    { icon: Star, label: "Collections", to: "/collections" },
    { icon: Layout, label: "Boards", to: "/boards" },
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
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-[300] h-16 px-4 md:px-12 flex items-center justify-between bg-background/96 backdrop-blur-xl border-b border-foreground/[0.08]">
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
            <div className="h-px bg-foreground/[0.06] my-1.5" />
            <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Account</div>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline">
              Log In
            </Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] font-semibold text-accent hover:bg-background transition-colors no-underline">
              Join Free
            </Link>
          </div>
        )}
      </div>

      {/* Logo — centered on mobile */}
      <Link to="/" className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer no-underline shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
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
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search visuals..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-foreground/[0.06] border-none outline-none font-body text-[0.88rem] text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-foreground/10"
              >
                <X className="w-3 h-3 text-muted" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Right Actions */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <Link to="/upload" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[0.82rem] font-medium text-foreground hover:bg-foreground/[0.06] transition-colors">
          <Upload className="w-3.5 h-3.5" /> Upload Art
        </Link>
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
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-foreground/[0.06] border-none outline-none font-body text-[0.88rem] text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent/20"
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
