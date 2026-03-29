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
      className="fixed z-[999] bg-popover border border-border rounded-xl shadow-lg p-1.5 min-w-[200px] max-h-64 overflow-y-auto"
      style={{ top: position.top + 4, left: position.left }}
    >
      {filtered.map(cat => {
        const Icon = PROMPT_CHIP_ICONS[cat.type];
        return (
          <div key={cat.category}>
            <p className="px-2.5 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">{cat.category}</p>
            {cat.items.map(item => {
              const isAdded = chipIds.has(item.id);
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
                      <Icon className="w-3.5 h-3.5 text-muted" />
                    </span>
                  )}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
