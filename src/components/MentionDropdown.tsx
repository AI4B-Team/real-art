import { Check } from "lucide-react";
import { PROMPT_CHIP_ICONS } from "@/lib/promptChips";
import type { AssetChip } from "@/lib/promptChips";

interface MentionDropdownProps {
  assets: { category: string; type: AssetChip["type"]; items: { id: string; label: string; thumbnail?: string }[] }[];
  query: string;
  position: { top: number; left: number };
  chipIds: Set<string>;
  onSelect: (type: AssetChip["type"], item: { id: string; label: string; thumbnail?: string }) => void;
}

export default function MentionDropdown({ assets, query, position, chipIds, onSelect }: MentionDropdownProps) {
  const filtered = assets
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        query ? item.label.toLowerCase().includes(query.toLowerCase()) : true
      ),
    }))
    .filter(cat => cat.items.length > 0);

  if (filtered.length === 0) return null;

  return (
    <div
      className="absolute z-50 w-56 rounded-xl border border-foreground/[0.08] bg-background shadow-lg overflow-hidden"
      style={{ top: position.top + 4, left: Math.max(0, position.left) }}
      onMouseDown={e => e.preventDefault()}
    >
      <div className="max-h-52 overflow-y-auto p-1.5">
        {filtered.map(cat => (
          <div key={cat.category}>
            <p className="px-2.5 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">{cat.category}</p>
            {cat.items.map(item => {
              const isAdded = chipIds.has(item.id);
              const Icon = PROMPT_CHIP_ICONS[cat.type];
              return (
                <button
                  key={item.id}
                  onMouseDown={e => { e.preventDefault(); if (!isAdded) onSelect(cat.type, item); }}
                  disabled={isAdded}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${isAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-foreground/[0.04]"}`}
                >
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <span className="w-6 h-6 rounded bg-foreground/[0.06] flex items-center justify-center">
                      <Icon className="w-3 h-3 text-muted" />
                    </span>
                  )}
                  <span className="font-medium truncate">@{item.label}</span>
                  {isAdded && <Check className="w-3.5 h-3.5 text-accent ml-auto" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
