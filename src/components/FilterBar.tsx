import { useState } from "react";
import { Filter } from "lucide-react";

const filters = ["Trending", "New", "Popular", "Abstract", "Portraits", "Nature", "Architecture", "Fantasy", "3D Art", "Sci-Fi", "Fashion", "Dreamscapes"];

const FilterBar = () => {
  const [active, setActive] = useState("Trending");

  return (
    <div className="px-6 md:px-12 pt-7">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <div className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-muted mr-2.5 flex items-center gap-[5px] shrink-0">
          <Filter className="w-3 h-3" />
          Filter
        </div>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`border px-4 py-1.5 rounded-md font-body text-[0.79rem] font-medium cursor-pointer whitespace-nowrap transition-all ${
              active === f
                ? "bg-foreground text-primary-foreground border-foreground"
                : "bg-transparent border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"
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
