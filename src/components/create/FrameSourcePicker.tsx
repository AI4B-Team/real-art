import { useState, useRef } from "react";
import { Upload, History, Users, Image, User, Search, ChevronLeft } from "lucide-react";

/* ── Stock images (Unsplash) ── */
const STOCK_IMAGES = [
  "photo-1506744038136-46273834b3fb", "photo-1470071459604-3b5ec3a7fe05", "photo-1441974231531-c6227db76b6e",
  "photo-1500534314263-0869cef27f40", "photo-1518837695005-2083093ee35b", "photo-1507525428034-b723cf961d3e",
  "photo-1519681393784-d120267933ba", "photo-1469474968028-56623f02e42e", "photo-1426604966848-d7adac402bff",
  "photo-1472214103451-9374bd1c798e", "photo-1465056836900-8f1e4f32c968", "photo-1501785888041-af3ef285b470",
  "photo-1540959733332-eab4deabeeaf", "photo-1504198453319-5ce911bafcde", "photo-1470252649378-9c29740c9fa8",
  "photo-1493246507139-91e8fad9978e", "photo-1502082553048-f009c37129b9", "photo-1498050108023-c5249f4df085",
  "photo-1536440136628-849c177e76a1", "photo-1485846234645-a62644f84728",
  "photo-1490730141103-6cac27aaab94", "photo-1433086966358-54859d0ed716", "photo-1475924156734-496f6cac6ec1",
  "photo-1505144808419-1957a94ca61e", "photo-1470813740244-df37b8c1edcb", "photo-1446776811953-b23d57bd21aa",
  "photo-1503803548695-c2a7b4a5b875", "photo-1494500764479-0c8f2919a3d8", "photo-1482192505345-5655af888cc4",
  "photo-1464822759023-fed622ff2c3b", "photo-1507400492013-162706c8c05e", "photo-1470770903676-69b98201ea1c",
];

/* ── Community mock images ── */
const COMMUNITY_IMAGES = [
  "photo-1633356122544-f134324a6cee", "photo-1677442136019-21780ecad995",
  "photo-1620712943543-bcc4688e7485", "photo-1655720828018-edd71de36645",
  "photo-1675271591211-930246f18c3e", "photo-1686191128892-3b37add4c844",
  "photo-1697577418970-95d99b5a55cf", "photo-1684779847639-fbcc5a57dfe9",
  "photo-1694891793604-9bb78dbcc637", "photo-1696446701796-da61225697cc",
  "photo-1682687221038-404670f09ef1", "photo-1682695796954-bad0d0f59ff1",
  "photo-1682685797886-79020e330c92", "photo-1699116548070-b8499ae91f04",
  "photo-1682686581580-d99b0230064e", "photo-1695653422543-7da6d6744364",
  "photo-1682686580036-b5e25932ce9a", "photo-1682695797221-8164ff1fafc9",
  "photo-1682687220742-aba13b6e50ba", "photo-1682687220063-4742bd7fd538",
];

/* ── History mock images ── */
const HISTORY_IMAGES = [
  "photo-1611532736597-de2d4265fba3", "photo-1618005182384-a83a8bd57fbe",
  "photo-1614850523459-c2f4c699c52e", "photo-1614854262340-ab1ca7d079c7",
  "photo-1617791160505-6f00504e3519", "photo-1618172193622-ae2d025f4032",
  "photo-1614849963640-9cc74b2a826f", "photo-1618005198919-d3d4b5a92ead",
  "photo-1614851099511-773084f6911d", "photo-1618556450994-a163d8d1e1b5",
  "photo-1614728263509-65e5e2a44e18", "photo-1617396900799-f4ec2b43c7ae",
  "photo-1614680376573-df3480f0c6ff", "photo-1617791160536-598cf32026fb",
  "photo-1618172193763-c511deb635ca", "photo-1614854262318-831574f15bcd",
];

/* ── Featured characters (same as CreatePage) ── */
const FEATURED_CHARACTERS = [
  { id: "f1", name: "Alex", avatar: "photo-1507003211169-0a1dd7228f2d" },
  { id: "f2", name: "Mia", avatar: "photo-1534528741775-53994a69daeb" },
  { id: "f3", name: "Jordan", avatar: "photo-1519085360753-af0119f7cbe7" },
  { id: "f4", name: "Suki", avatar: "photo-1438761681033-6461ffad8d80" },
  { id: "f5", name: "Marcus", avatar: "photo-1506794778202-cad84cf45f1d" },
  { id: "f6", name: "Leila", avatar: "photo-1487412720507-e7ab37603c6f" },
  { id: "f7", name: "Kai", avatar: "photo-1492562080023-ab3db95bfbce" },
  { id: "f8", name: "Nadia", avatar: "photo-1494790108377-be9c29b29330" },
  { id: "f9", name: "Ravi", avatar: "photo-1500648767791-00dcc994a43e" },
  { id: "f10", name: "Zara", avatar: "photo-1531746020798-e6953c6e8e04" },
  { id: "f11", name: "Ethan", avatar: "photo-1472099645785-5658abf4ff4e" },
  { id: "f12", name: "Luna", avatar: "photo-1529626455594-4ff0802cfb7e" },
  { id: "f13", name: "Derek", avatar: "photo-1504257432389-52343af06ae3" },
  { id: "f14", name: "Aria", avatar: "photo-1544005313-94ddf0286df2" },
  { id: "f15", name: "Theo", avatar: "photo-1506277886164-e25aa3f4ef7f" },
  { id: "f16", name: "Ivy", avatar: "photo-1524504388940-b1c1722653e1" },
  { id: "f17", name: "Omar", avatar: "photo-1522075469751-3a6694fb2f61" },
  { id: "f18", name: "Cleo", avatar: "photo-1517841905240-472988babdf9" },
  { id: "f19", name: "Felix", avatar: "photo-1521119989659-a83eee488004" },
  { id: "f20", name: "Sage", avatar: "photo-1488426862026-3ee34a7d66df" },
  { id: "f21", name: "Dante", avatar: "photo-1539571696357-5a69c17a67c6" },
  { id: "f22", name: "Yuki", avatar: "photo-1502823403499-6ccfcf4fb453" },
  { id: "f23", name: "Blake", avatar: "photo-1507591064344-4c6ce005b128" },
  { id: "f24", name: "Rosa", avatar: "photo-1524638431109-93d95c968f03" },
];

type Source = "menu" | "computer" | "history" | "community" | "stock" | "character";

interface FrameSourcePickerProps {
  onSelect: (src: string) => void;
  onClose: () => void;
  onBrowseModeChange?: (browsing: boolean) => void;
}

const sources = [
  { id: "computer" as Source, label: "Upload", icon: Upload, desc: "Upload from your device" },
  { id: "character" as Source, label: "Characters", icon: User, desc: "Pick a character" },
  { id: "history" as Source, label: "Creations", icon: History, desc: "Pick from your past creations" },
  { id: "community" as Source, label: "Community", icon: Users, desc: "Browse community images" },
  { id: "stock" as Source, label: "Stock", icon: Image, desc: "Search free stock photos" },
];

export default function FrameSourcePicker({ onSelect, onClose, onBrowseModeChange }: FrameSourcePickerProps) {
  const [activeSource, setActiveSource] = useState<Source>("menu");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onSelect(URL.createObjectURL(file));
  };

  const handleSourceClick = (id: Source) => {
    if (id === "computer") {
      fileRef.current?.click();
      return;
    }
    setActiveSource(id);
    setSearch("");
    onBrowseModeChange?.(true);
  };

  const handleBack = () => {
    setActiveSource("menu");
    onBrowseModeChange?.(false);
  };

  const getImages = () => {
    const list = activeSource === "stock" ? STOCK_IMAGES : activeSource === "community" ? COMMUNITY_IMAGES : HISTORY_IMAGES;
    if (!search.trim()) return list;
    return list;
  };

  const handleImageSelect = (id: string) => {
    onSelect(`https://images.unsplash.com/${id}?w=800&h=800&fit=crop&q=80`);
  };

  // Main menu
  if (activeSource === "menu") {
    return (
      <div className="w-full">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { handleFileUpload(e.target.files); e.target.value = ""; }} />
        <div className="grid grid-cols-2 gap-2">
          {sources.map(s => (
            <button
              key={s.id}
              onClick={() => handleSourceClick(s.id)}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.02] transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                <s.icon size={16} className="text-muted group-hover:text-accent transition-colors" />
              </div>
              <div>
                <div className="text-[0.82rem] font-semibold">{s.label}</div>
                <div className="text-[0.68rem] text-muted leading-tight">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Character browse view
  if (activeSource === "character") {
    const filteredChars = search.trim()
      ? FEATURED_CHARACTERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      : FEATURED_CHARACTERS;

    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-foreground/[0.06] transition-colors">
            <ChevronLeft size={16} className="text-muted" />
          </button>
          <span className="text-[0.88rem] font-bold flex-1">Characters</span>
          <div className="relative flex-1 max-w-[280px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search characters…"
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-foreground/[0.1] bg-background text-[0.8rem] outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {filteredChars.map(c => (
            <button
              key={c.id}
              onClick={() => handleImageSelect(c.avatar)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 border-transparent hover:border-accent transition-all hover:shadow-md group"
            >
              <img
                src={`https://images.unsplash.com/${c.avatar}?w=240&h=240&fit=crop&q=60`}
                alt={c.name}
                className="w-full aspect-square rounded-xl object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <span className="text-[0.72rem] font-medium text-foreground truncate w-full text-center">{c.name}</span>
            </button>
          ))}
        </div>
        {filteredChars.length === 0 && (
          <div className="text-center py-8 text-muted text-[0.82rem]">No characters found</div>
        )}
      </div>
    );
  }

  // Browse view (history / community / stock)
  const images = getImages();
  const sourceLabel = sources.find(s => s.id === activeSource)?.label || "";

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-foreground/[0.06] transition-colors">
          <ChevronLeft size={16} className="text-muted" />
        </button>
        <span className="text-[0.88rem] font-bold flex-1">{sourceLabel}</span>
        <div className="relative flex-1 max-w-[280px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${sourceLabel.toLowerCase()}…`}
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-foreground/[0.1] bg-background text-[0.8rem] outline-none focus:border-foreground/30 transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
        {images.map((id, i) => (
          <button
            key={i}
            onClick={() => handleImageSelect(id)}
            className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-accent transition-all hover:shadow-md group"
          >
            <img
              src={`https://images.unsplash.com/${id}?w=240&h=240&fit=crop&q=60`}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      {images.length === 0 && (
        <div className="text-center py-8 text-muted text-[0.82rem]">No images found</div>
      )}
    </div>
  );
}
