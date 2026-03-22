import { useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

const LanguageSelector = () => {
  const [selected, setSelected] = useState(LANGUAGES[0]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-foreground/[0.1] bg-card text-[0.84rem] font-medium hover:border-foreground/25 transition-colors"
        >
          <span className="text-base">{selected.flag}</span>
          {selected.label}
          <ChevronDown size={13} className="text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end" sideOffset={6}>
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Languages..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.1] bg-background text-[0.82rem] focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="max-h-52 overflow-y-auto">
          {filtered.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => { setSelected(lang); setOpen(false); setSearch(""); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.84rem] transition-colors ${
                selected.code === lang.code
                  ? "bg-accent/8 text-foreground"
                  : "hover:bg-foreground/[0.04] text-foreground/80"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {selected.code === lang.code && (
                <Check size={14} className="text-accent" />
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-[0.78rem] text-muted text-center py-3">No languages found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
