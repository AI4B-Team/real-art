import { useState, useRef, useEffect } from "react";
import { Search, Image, Video, Music, ChevronDown, Camera, Sparkles, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const searchTypes = [
  { label: "Photos", icon: Image, placeholder: "Search millions of free photos…" },
  { label: "Videos", icon: Video, placeholder: "Search millions of free videos…" },
  { label: "Music", icon: Music, placeholder: "Search millions of free music tracks…" },
];

const trendingTerms = ["avatars", "luxury homes", "cyberpunk", "podcast studio", "fitness women"];

const HeroSection = () => {
  const [selectedType, setSelectedType] = useState("Photos");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const SelectedIcon = searchTypes.find(t => t.label === selectedType)?.icon || Image;

  return (
    <section className="pt-[140px] pb-20 px-6 md:px-12 text-center relative overflow-hidden">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="text-[0.72rem] font-semibold tracking-[0.2em] uppercase text-muted mb-8"
      >
        2.4M Images &nbsp;·&nbsp; 5,000+ Creators &nbsp;·&nbsp; 100% Free
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.1 }}
        className="font-display text-[clamp(3.2rem,7vw,6.8rem)] font-black leading-[0.93] tracking-[-0.03em] text-foreground mb-6"
      >
        The Free<br />
        <em className="italic font-normal text-accent">Image Library</em>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18 }}
        className="text-[1.05rem] font-light text-muted leading-[1.65] mb-[52px] max-w-[480px] mx-auto"
      >
        Millions of stunning visuals — free to download and use in anything you build, sell, or share. Forever.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.26 }}
        className="max-w-[740px] mx-auto"
      >
        <div className="flex items-center bg-card border-[1.5px] border-foreground/[0.13] rounded-xl h-[68px] shadow-[var(--shadow-search)] transition-shadow focus-within:border-foreground focus-within:shadow-[var(--shadow-search-focus)] relative">
          <div ref={dropRef} className="relative flex items-center gap-[7px] px-6 h-full cursor-pointer border-r border-foreground/[0.09] shrink-0 select-none" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <SelectedIcon className="w-3.5 h-3.5" />
            <span className="text-[0.88rem] font-semibold whitespace-nowrap">{selectedType}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            {dropdownOpen && (
              <div className="absolute top-[calc(100%+12px)] left-0 bg-card border border-foreground/[0.08] rounded-[14px] min-w-[176px] shadow-[var(--shadow-card)] p-1.5 z-[100] animate-drop-in">
                {searchTypes.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    onClick={(e) => { e.stopPropagation(); setSelectedType(label); setDropdownOpen(false); }}
                    className={`flex items-center gap-[9px] px-3 py-2.5 rounded-lg cursor-pointer text-[0.85rem] font-medium hover:bg-background transition-colors ${selectedType === label ? "text-accent" : ""}`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            className="flex-1 border-none outline-none font-body text-[0.97rem] font-light px-[22px] bg-transparent text-foreground placeholder:text-foreground/30"
            placeholder={searchTypes.find(t => t.label === selectedType)?.placeholder || "Search millions of free visuals…"}
          />
          <button className="w-[50px] h-[50px] rounded-lg bg-card border border-foreground/[0.13] cursor-pointer flex items-center justify-center mr-[9px] shrink-0 hover:border-foreground/30 hover:scale-105 transition-all">
            <Search className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.65, delay: 0.4 }}
        className="mt-6 text-center"
      >
        <span className="text-[0.82rem] font-semibold text-muted tracking-[0.06em] uppercase">TRENDING:</span>
        {trendingTerms.map((term, i) => (
          <span key={term}>
            <span className="mx-2 text-[0.85rem] text-foreground/70">{term}</span>
            {i < trendingTerms.length - 1 && <span className="text-foreground/20">•</span>}
          </span>
        ))}
      </motion.p>

      {/* Three Primary Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.5 }}
        className="max-w-[820px] mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Link to="/explore" className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-foreground/[0.08] bg-card hover:border-accent/40 hover:shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.15)] transition-all duration-300 no-underline">
          <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Camera className="w-5 h-5 text-accent" />
          </div>
          <span className="font-display text-[1rem] font-bold text-foreground">Browse Images</span>
          <span className="text-[0.78rem] text-muted leading-snug">Explore millions of free visuals</span>
          <span className="text-[0.68rem] font-semibold text-accent/70 tracking-wide">2.4M images available</span>
        </Link>

        <Link to="/real-creator" className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-foreground/[0.08] bg-card hover:border-accent/40 hover:shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.15)] transition-all duration-300 no-underline">
          <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <span className="font-display text-[1rem] font-bold text-foreground">Recreate An Image</span>
          <span className="text-[0.78rem] text-muted leading-snug">Generate your own version instantly</span>
          <span className="text-[0.68rem] font-semibold text-accent/70 tracking-wide">Infinite variations</span>
        </Link>

        <Link to="/upload" className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-foreground/[0.08] bg-card hover:border-accent/40 hover:shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.15)] transition-all duration-300 no-underline">
          <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Upload className="w-5 h-5 text-accent" />
          </div>
          <span className="font-display text-[1rem] font-bold text-foreground">Upload Your Art</span>
          <span className="text-[0.78rem] text-muted leading-snug">Share your work with the world</span>
          <span className="text-[0.68rem] font-semibold text-accent/70 tracking-wide">Join 5,000+ creators</span>
        </Link>
      </motion.div>
    </section>
  );
};

export default HeroSection;
