import { useState, useRef, useEffect } from "react";
import { Search, Image, Video, Music, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const searchTypes = [
  { label: "Photos", icon: Image },
  { label: "Videos", icon: Video },
  { label: "Music", icon: Music },
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
        2.4 Million Images &nbsp;·&nbsp; 5,000+ Creators &nbsp;·&nbsp; Always Free
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
            placeholder="Search millions of free visuals…"
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
    </section>
  );
};

export default HeroSection;
