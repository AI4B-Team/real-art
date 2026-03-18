import { useState } from "react";
import { X, Plus, Search, Check } from "lucide-react";

const CHARACTERS = [
  { id: "none", name: "No Character", avatar: null, desc: "Generate without a character reference" },
  { id: "c1", name: "Alex", avatar: "photo-1507003211169-0a1dd7228f2d", desc: "Professional male, 30s, clean-cut" },
  { id: "c2", name: "Mia", avatar: "photo-1534528741775-53994a69daeb", desc: "Young woman, warm tones, editorial" },
  { id: "c3", name: "Jordan", avatar: "photo-1519085360753-af0119f7cbe7", desc: "Business casual, confident, modern" },
  { id: "c4", name: "Suki", avatar: "photo-1438761681033-6461ffad8d80", desc: "Creative, colorful, expressive" },
  { id: "c5", name: "Marcus", avatar: "photo-1506794778202-cad84cf45f1d", desc: "Athletic build, outdoor style" },
  { id: "c6", name: "Leila", avatar: "photo-1487412720507-e7ab37603c6f", desc: "Elegant, soft lighting, beauty" },
];

interface CharacterPanelProps {
  onClose: () => void;
  selectedCharacter: string | null;
  onSelect: (characterId: string | null) => void;
}

export default function CharacterPanel({ onClose, selectedCharacter, onSelect }: CharacterPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? CHARACTERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : CHARACTERS;

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[0.85rem] font-bold">Characters</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-[0.75rem] font-medium text-accent hover:underline">
            <Plus size={12} /> Create
          </button>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search characters..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] text-[0.82rem] outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {filtered.map(char => (
          <button
            key={char.id}
            onClick={() => onSelect(char.id === "none" ? null : char.id)}
            className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
              (selectedCharacter === char.id || (char.id === "none" && !selectedCharacter))
                ? "border-accent bg-accent/5"
                : "border-foreground/[0.06] hover:border-foreground/20 bg-foreground/[0.02]"
            }`}
          >
            {char.avatar ? (
              <img
                src={`https://images.unsplash.com/${char.avatar}?w=120&h=120&fit=crop&q=80`}
                alt={char.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-foreground/[0.08] flex items-center justify-center text-muted">
                <X size={16} />
              </div>
            )}
            <span className="text-[0.72rem] font-semibold text-center leading-tight">{char.name}</span>
            {(selectedCharacter === char.id || (char.id === "none" && !selectedCharacter)) && (
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
