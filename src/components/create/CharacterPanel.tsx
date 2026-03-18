import { useState, useEffect } from "react";
import { X, Plus, Search, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CreateCharacterModal from "./CreateCharacterModal";

const PRESET_CHARACTERS = [
  { id: "none", name: "No Character", avatar: null, desc: "Generate without a character reference" },
];

interface DbCharacter {
  id: string;
  name: string;
  avatar_url: string | null;
  description: string | null;
}

interface CharacterPanelProps {
  onClose: () => void;
  selectedCharacter: string | null;
  onSelect: (characterId: string | null) => void;
}

export default function CharacterPanel({ onClose, selectedCharacter, onSelect }: CharacterPanelProps) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [userCharacters, setUserCharacters] = useState<DbCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("characters")
        .select("id, name, avatar_url, description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setUserCharacters(data);
      setLoading(false);
    };
    fetchCharacters();
  }, []);

  const allCharacters = [
    ...PRESET_CHARACTERS.map(p => ({ ...p, isPreset: true })),
    ...userCharacters.map(c => ({ id: c.id, name: c.name, avatar: c.avatar_url, desc: c.description || "Custom character", isPreset: false })),
  ];

  const filtered = search
    ? allCharacters.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : allCharacters;

  const handleCreated = (char: { id: string; name: string; avatar_url: string | null }) => {
    setUserCharacters(prev => [{ ...char, description: null }, ...prev]);
    onSelect(char.id);
  };

  return (
    <>
      <div className="rounded-xl border border-foreground/[0.08] bg-background p-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[0.85rem] font-bold">Characters</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 text-[0.75rem] font-medium text-accent hover:underline">
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        ) : (
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
                    src={char.isPreset ? `https://images.unsplash.com/${char.avatar}?w=120&h=120&fit=crop&q=80` : char.avatar}
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

            {/* Create new card */}
            <button
              onClick={() => setShowCreate(true)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-dashed border-foreground/[0.12] hover:border-accent/40 hover:bg-accent/5 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center">
                <Plus size={18} className="text-muted" />
              </div>
              <span className="text-[0.72rem] font-semibold text-center leading-tight text-muted">New</span>
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateCharacterModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
