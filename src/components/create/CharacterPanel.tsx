import { useState, useEffect } from "react";
import { X, Plus, Search, Check, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CreateCharacterModal from "./CreateCharacterModal";

const FEATURED_CHARACTERS = [
  { id: "f1", name: "Alex", avatar: "photo-1507003211169-0a1dd7228f2d", desc: "Professional male, 30s, clean-cut" },
  { id: "f2", name: "Mia", avatar: "photo-1534528741775-53994a69daeb", desc: "Young woman, warm tones, editorial" },
  { id: "f3", name: "Jordan", avatar: "photo-1519085360753-af0119f7cbe7", desc: "Business casual, confident, modern" },
  { id: "f4", name: "Suki", avatar: "photo-1438761681033-6461ffad8d80", desc: "Creative, colorful, expressive" },
  { id: "f5", name: "Marcus", avatar: "photo-1506794778202-cad84cf45f1d", desc: "Athletic build, outdoor style" },
  { id: "f6", name: "Leila", avatar: "photo-1487412720507-e7ab37603c6f", desc: "Elegant, soft lighting, beauty" },
  { id: "f7", name: "Kai", avatar: "photo-1492562080023-ab3db95bfbce", desc: "Casual, youthful, warm smile" },
  { id: "f8", name: "Nadia", avatar: "photo-1494790108377-be9c29b29330", desc: "Natural beauty, golden hour" },
  { id: "f9", name: "Ravi", avatar: "photo-1500648767791-00dcc994a43e", desc: "Sharp features, studio portrait" },
  { id: "f10", name: "Zara", avatar: "photo-1531746020798-e6953c6e8e04", desc: "Bold, artistic, dramatic lighting" },
  { id: "f11", name: "Ethan", avatar: "photo-1472099645785-5658abf4ff4e", desc: "Friendly, approachable, casual" },
  { id: "f12", name: "Luna", avatar: "photo-1529626455594-4ff0802cfb7e", desc: "Dreamy, soft focus, ethereal" },
  { id: "f13", name: "Derek", avatar: "photo-1504257432389-52343af06ae3", desc: "Rugged, outdoor, adventurous" },
  { id: "f14", name: "Aria", avatar: "photo-1544005313-94ddf0286df2", desc: "Minimalist, clean, modern" },
  { id: "f15", name: "Theo", avatar: "photo-1506277886164-e25aa3f4ef7f", desc: "Scholarly, thoughtful, warm" },
  { id: "f16", name: "Ivy", avatar: "photo-1524504388940-b1c1722653e1", desc: "Fashion-forward, street style" },
  { id: "f17", name: "Omar", avatar: "photo-1522075469751-3a6694fb2f61", desc: "Distinguished, professional" },
  { id: "f18", name: "Cleo", avatar: "photo-1517841905240-472988babdf9", desc: "Vibrant, energetic, joyful" },
  { id: "f19", name: "Felix", avatar: "photo-1521119989659-a83eee488004", desc: "Creative, artistic, expressive" },
  { id: "f20", name: "Sage", avatar: "photo-1488426862026-3ee34a7d66df", desc: "Serene, nature-inspired" },
  { id: "f21", name: "Dante", avatar: "photo-1539571696357-5a69c17a67c6", desc: "Stylish, confident, urban" },
  { id: "f22", name: "Yuki", avatar: "photo-1502823403499-6ccfcf4fb453", desc: "Gentle, warm light, calm" },
  { id: "f23", name: "Blake", avatar: "photo-1507591064344-4c6ce005b128", desc: "Edgy, contemporary, bold" },
  { id: "f24", name: "Rosa", avatar: "photo-1524638431109-93d95c968f03", desc: "Glamorous, cinematic, rich" },
];

interface DbCharacter {
  id: string;
  name: string;
  avatar_url: string | null;
  description: string | null;
}

interface CharacterPanelProps {
  onClose: () => void;
  selectedCharacters: string[];
  onToggle: (characterId: string) => void;
  onClear: () => void;
}

type Section = "featured" | "mine";

function CharacterCard({
  id, name, avatar, isSelected, onClick,
}: {
  id: string; name: string; avatar: string | null; isSelected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 rounded-xl overflow-hidden transition-all ${
        isSelected
          ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
          : "hover:opacity-90"
      }`}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full aspect-square rounded-xl object-cover" />
      ) : (
        <div className="w-full aspect-square rounded-xl bg-foreground/[0.08] flex items-center justify-center text-muted">
          <User size={24} />
        </div>
      )}
      <span className="text-[0.72rem] font-semibold text-center leading-tight pb-1">{name}</span>
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-sm">
          <Check size={11} className="text-white" />
        </div>
      )}
    </button>
  );
}

export default function CharacterPanel({ onClose, selectedCharacters, onToggle, onClear }: CharacterPanelProps) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [userCharacters, setUserCharacters] = useState<DbCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("featured");
  const [previewChar, setPreviewChar] = useState<{ name: string; avatar: string } | null>(null);

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

  const featuredFiltered = search
    ? FEATURED_CHARACTERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : FEATURED_CHARACTERS;

  const myFiltered = search
    ? userCharacters.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : userCharacters;

  const handleCreated = (char: { id: string; name: string; avatar_url: string | null }) => {
    setUserCharacters(prev => [{ ...char, description: null }, ...prev]);
    onToggle(char.id);
    setSection("mine");
  };

  // Resolve selected characters to display data
  const allCharacters = [
    ...FEATURED_CHARACTERS.map(c => ({ id: c.id, name: c.name, avatar: `https://images.unsplash.com/${c.avatar}?w=120&h=120&fit=crop&q=80` })),
    ...userCharacters.map(c => ({ id: c.id, name: c.name, avatar: c.avatar_url })),
  ];
  const selectedChars = selectedCharacters.map(id => allCharacters.find(c => c.id === id)).filter(Boolean) as { id: string; name: string; avatar: string | null }[];

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

        {/* Selected characters strip */}
        {selectedChars.length > 0 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto overflow-y-visible pb-1 pt-2 pr-2">
            {selectedChars.map(char => (
              <div key={char.id} className="relative group shrink-0">
                {char.avatar ? (
                  <img src={char.avatar} alt={char.name} className="w-10 h-10 rounded-lg object-cover border border-foreground/[0.08]" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-foreground/[0.08] flex items-center justify-center border border-foreground/[0.08]">
                    <User size={16} className="text-muted" />
                  </div>
                )}
                <button
                  onClick={() => onToggle(char.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={8} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Section tabs */}
        <div className="flex items-center gap-1 mb-3">
          {([
            { id: "featured" as Section, label: "Featured" },
            { id: "mine" as Section, label: `My Characters${userCharacters.length > 0 ? ` (${userCharacters.length})` : ""}` },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-colors ${
                section === tab.id
                  ? "bg-foreground/[0.08] text-foreground"
                  : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {/* No character option */}
          {selectedCharacters.length > 0 && (
            <button
              onClick={onClear}
              className="ml-auto px-3 py-1.5 rounded-lg text-[0.78rem] font-medium text-muted hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
            >
              Clear ({selectedCharacters.length})
            </button>
          )}
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

        {/* Featured section */}
        {section === "featured" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {featuredFiltered.map(char => (
              <CharacterCard
                key={char.id}
                id={char.id}
                name={char.name}
                avatar={`https://images.unsplash.com/${char.avatar}?w=120&h=120&fit=crop&q=80`}
                isSelected={selectedCharacters.includes(char.id)}
                onClick={() => onToggle(char.id)}
              />
            ))}
          </div>
        )}

        {/* My Characters section */}
        {section === "mine" && (
          loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted" />
            </div>
          ) : myFiltered.length === 0 && !search ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-14 h-14 rounded-full bg-foreground/[0.06] flex items-center justify-center">
                <User size={24} className="text-muted" />
              </div>
              <p className="text-[0.85rem] font-semibold text-foreground/70">No Characters Yet</p>
              <p className="text-[0.75rem] text-muted/60 text-center max-w-[260px]">Create your first character by uploading images, using your camera, or describing them.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-[0.8rem] font-bold hover:bg-accent/85 transition-colors"
              >
                <Plus size={14} /> Create Character
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {myFiltered.map(char => (
                <CharacterCard
                  key={char.id}
                  id={char.id}
                  name={char.name}
                  avatar={char.avatar_url}
                  isSelected={selectedCharacters.includes(char.id)}
                  onClick={() => onToggle(char.id)}
                />
              ))}
              <button
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-dashed border-foreground/[0.12] hover:border-accent/40 hover:bg-accent/5 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center">
                  <Plus size={18} className="text-muted" />
                </div>
                <span className="text-[0.72rem] font-semibold text-center leading-tight text-muted">New</span>
              </button>
              {search && myFiltered.length === 0 && (
                <p className="col-span-full text-center text-[0.78rem] text-muted py-4">No characters match "{search}"</p>
              )}
            </div>
          )
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
