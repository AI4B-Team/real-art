import { Filter } from "lucide-react";

const filters = [
  "Trending", "New", "Popular", "Abstract", "Portraits", "People",
  "Nature", "Architecture", "Fantasy", "3D Art", "Fashion", "Sci-Fi",
  "Avatars", "Backgrounds", "Luxury", "Cyberpunk", "Minimal",
];

interface FilterBarProps {
  active: string;
  onChange: (f: string) => void;
}

const FilterBar = ({ active, onChange }: FilterBarProps) => {
  return (
    <div className="px-6 md:px-12 pt-6 pb-3">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        <div className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-muted flex items-center gap-1.5 shrink-0 mr-1">
          <Filter className="w-3 h-3" /> Filter
        </div>
        <button
          onClick={() => onChange("All")}
          className={`border px-4 py-1.5 rounded-lg font-body text-[0.79rem] font-medium cursor-pointer whitespace-nowrap transition-all shrink-0 ${
            active === "All"
              ? "bg-foreground text-primary-foreground border-foreground"
              : "bg-transparent border-foreground/[0.18] text-muted hover:text-foreground hover:border-foreground/40"
          }`}
        >
          All
        </button>
        <div className="w-px h-4 bg-foreground/[0.1] shrink-0" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`border px-4 py-1.5 rounded-lg font-body text-[0.79rem] font-medium cursor-pointer whitespace-nowrap transition-all shrink-0 ${
              active === f
                ? "bg-foreground text-primary-foreground border-foreground"
                : "bg-transparent border-foreground/[0.18] text-muted hover:text-foreground hover:border-foreground/40"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
