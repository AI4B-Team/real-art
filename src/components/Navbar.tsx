import { useState, useRef, useEffect } from "react";
import { Search, Menu, Grid3X3, Star, Users, Trophy, BarChart3, Upload, Pen, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { icon: Grid3X3, label: "Explore", to: "/explore" },
    { icon: Star, label: "Collections", to: "/collections" },
    { icon: Users, label: "Communities", to: "/communities" },
    { icon: Trophy, label: "Challenges", to: "/challenges" },
    { icon: BarChart3, label: "Leaderboard", to: "/leaderboard" },
  ];

  const creatorLinks = [
    { icon: Upload, label: "Upload Art", to: "/upload" },
    { icon: Pen, label: "REAL CREATOR", to: "/real-creator" },
    { icon: FileText, label: "License Info", to: "/license" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[300] h-16 px-6 md:px-12 flex items-center justify-between bg-background/96 backdrop-blur-xl border-b border-foreground/[0.08]">
      <Link to="/" className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer no-underline">
        Real<span className="text-accent">.</span>Art
      </Link>
      <div className="flex items-center gap-1">
        {/* Search icon + inline expand */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          {searchOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 bg-card border border-foreground/[0.1] rounded-xl shadow-[var(--shadow-card)] p-2 w-72 animate-drop-in">
              <div className="flex items-center gap-2 px-3 py-2">
                <Search className="w-3.5 h-3.5 text-muted shrink-0" />
                <input
                  autoFocus
                  className="flex-1 border-none outline-none font-body text-[0.88rem] bg-transparent"
                  placeholder="Search visuals… press Enter"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
          )}
        </div>

        {/* Hamburger menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute top-[calc(100%+10px)] right-0 bg-card border border-foreground/[0.07] rounded-2xl min-w-[232px] shadow-[var(--shadow-card)] p-2.5 animate-drop-in z-[400]">
              <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Discover</div>
              {navLinks.map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline"
                >
                  <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  {label}
                </Link>
              ))}
              <div className="h-px bg-foreground/[0.06] my-1.5" />
              <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Creators</div>
              {creatorLinks.map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors no-underline"
                >
                  <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/login">
          <button className="text-[0.8rem] font-medium bg-transparent border border-foreground/[0.18] px-[18px] py-[7px] rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors ml-1">
            Log In
          </button>
        </Link>
        <Link to="/signup">
          <button className="text-[0.8rem] font-semibold bg-foreground text-primary-foreground border-none px-5 py-2 rounded-lg cursor-pointer hover:bg-foreground/90 transition-colors">
            Join Free
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
