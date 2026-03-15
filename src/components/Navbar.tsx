import { useState, useRef, useEffect } from "react";
import { Search, Menu, Grid3X3, Star, Users, Trophy, BarChart3, Upload, Pen, FileText } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[300] h-16 px-6 md:px-12 flex items-center justify-between bg-background/96 backdrop-blur-xl border-b border-foreground/[0.08]">
      <div className="font-display text-xl font-black tracking-[0.06em] uppercase cursor-pointer">
        Real<span className="text-accent">.</span>Art
      </div>
      <div className="flex items-center gap-1">
        <button className="w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
          <Search className="w-4 h-4" />
        </button>
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
              {[
                { icon: Grid3X3, label: "Explore" },
                { icon: Star, label: "Collections" },
                { icon: Users, label: "Communities" },
                { icon: Trophy, label: "Challenges" },
                { icon: BarChart3, label: "Leaderboard" },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors">
                  <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  {label}
                </a>
              ))}
              <div className="h-px bg-foreground/[0.06] my-1.5" />
              <div className="px-3.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-muted">Creators</div>
              {[
                { icon: Upload, label: "Upload Art" },
                { icon: Pen, label: "REAL CREATOR" },
                { icon: FileText, label: "License Info" },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[0.85rem] text-foreground hover:bg-background transition-colors">
                  <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
        <button className="text-[0.8rem] font-medium bg-transparent border border-foreground/[0.18] px-[18px] py-[7px] rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors ml-1">
          Log In
        </button>
        <button className="text-[0.8rem] font-semibold bg-foreground text-primary-foreground border-none px-5 py-2 rounded-lg cursor-pointer hover:bg-foreground/90 transition-colors">
          Join Free
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
