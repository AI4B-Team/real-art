import { useState } from "react";
import { X, Search } from "lucide-react";

const THEMES = [
  { id: "editorial", label: "EDITORIAL SHOTS", creator: "lostsignal", photos: ["photo-1509631179647-0177331693ae", "photo-1534528741775-53994a69daeb", "photo-1496747611176-843222e1e57c"] },
  { id: "oldmoney", label: "OLD MONEY", creator: "luxelife", photos: ["photo-1507003211169-0a1dd7228f2d", "photo-1573497019940-1c28c88b4f3e", "photo-1519085360753-af0119f7cbe7"] },
  { id: "winter", label: "WINTER SPECIAL", creator: "frostbyte", photos: ["photo-1477601263568-180e2c6d046e", "photo-1457269449834-928af64c684d", "photo-1418985991508-e47386d96a71"] },
  { id: "christmas", label: "CHRISTMAS MAGIC", creator: "hollydays", photos: ["photo-1512389142860-9c449e58a814", "photo-1543589077-47d81606c1bf", "photo-1545048702-79362596cde5"] },
  { id: "hair", label: "HAIR GOALS", creator: "stylemaven", photos: ["photo-1522337360788-8b13dee7a37e", "photo-1595476108010-b4d1f102b1b1", "photo-1580618672591-eb180b1a973f"] },
  { id: "makeup", label: "MAKEUP GLAM", creator: "beatface", photos: ["photo-1487412720507-e7ab37603c6f", "photo-1596462502278-27bfdc403348", "photo-1571875257727-256c39da42af"] },
  { id: "fall", label: "FALL AESTHETIC", creator: "autumnleaf", photos: ["photo-1507003211169-0a1dd7228f2d", "photo-1476820865390-c52aeebb9891", "photo-1473496169904-658ba7c44d8a"] },
  { id: "spring", label: "SPRING BLOOM", creator: "cherryblsm", photos: ["photo-1490750967868-88aa4f44baee", "photo-1462275646964-a0e3386b89fa", "photo-1490750967868-88aa4f44baee"] },
];

interface PhotoshootThemesProps {
  onClose: () => void;
  selectedTheme: string | null;
  onThemeSelect: (themeId: string | null) => void;
}

export default function PhotoshootThemes({ onClose, selectedTheme, onThemeSelect }: PhotoshootThemesProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? THEMES.filter(t => t.label.toLowerCase().includes(search.toLowerCase()))
    : THEMES;

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[0.92rem] font-bold">Photoshoot Themes</h3>
        <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-[320px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search themes..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-[0.85rem] outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        {filtered.map(theme => (
          <button
            key={theme.id}
            onClick={() => onThemeSelect(selectedTheme === theme.id ? null : theme.id)}
            className={`relative rounded-xl overflow-hidden h-[180px] group text-left transition-all ${
              selectedTheme === theme.id ? "ring-2 ring-accent ring-offset-2" : ""
            }`}
          >
            {/* 3-image collage */}
            <div className="absolute inset-0 flex">
              {theme.photos.map((p, i) => (
                <div key={i} className="flex-1 h-full">
                  <img
                    src={`https://images.unsplash.com/${p}?w=200&h=300&fit=crop&q=75`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <span className="text-[0.68rem] text-white/60">{theme.creator}</span>
              <h4 className="text-[0.88rem] font-black text-white tracking-wide">{theme.label}</h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
