import { useState } from "react";
import { Search } from "lucide-react";

const LANGUAGES = [
  { name: "English", flag: "🇺🇸" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Portuguese", flag: "🇧🇷" },
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Chinese", flag: "🇨🇳" },
  { name: "Japanese", flag: "🇯🇵" },
  { name: "Korean", flag: "🇰🇷" },
  { name: "Hindi", flag: "🇮🇳" },
];

interface LanguageDropdownContentProps {
  selected: string | null;
  onSelect: (lang: string) => void;
}

export default function LanguageDropdownContent({ selected, onSelect }: LanguageDropdownContentProps) {
  const [search, setSearch] = useState("");

  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Language</p>
      <div className="px-2 pb-1.5">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-foreground/[0.04]">
          <Search className="w-3 h-3 text-muted shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-[0.78rem] outline-none placeholder:text-muted"
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {filtered.map(l => (
          <button
            key={l.name}
            onClick={() => onSelect(l.name)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[0.78rem] transition-colors ${
              selected === l.name ? "bg-accent/10 text-accent font-semibold" : "hover:bg-foreground/[0.04]"
            }`}
          >
            <span className="text-base leading-none">{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-[0.75rem] text-muted py-3">No languages found</p>
        )}
      </div>
    </>
  );
}
