import { useState, useRef } from "react";
import { Upload, History, Users, Image, X, Search, ChevronLeft } from "lucide-react";

/* ── Stock images (Unsplash) ── */
const STOCK_IMAGES = [
  "photo-1506744038136-46273834b3fb", "photo-1470071459604-3b5ec3a7fe05", "photo-1441974231531-c6227db76b6e",
  "photo-1500534314263-0869cef27f40", "photo-1518837695005-2083093ee35b", "photo-1507525428034-b723cf961d3e",
  "photo-1519681393784-d120267933ba", "photo-1469474968028-56623f02e42e", "photo-1426604966848-d7adac402bff",
  "photo-1472214103451-9374bd1c798e", "photo-1465056836900-8f1e4f32c968", "photo-1501785888041-af3ef285b470",
  "photo-1540959733332-eab4deabeeaf", "photo-1504198453319-5ce911bafcde", "photo-1470252649378-9c29740c9fa8",
  "photo-1493246507139-91e8fad9978e", "photo-1502082553048-f009c37129b9", "photo-1498050108023-c5249f4df085",
  "photo-1536440136628-849c177e76a1", "photo-1485846234645-a62644f84728",
];

/* ── Community mock images ── */
const COMMUNITY_IMAGES = [
  "photo-1633356122544-f134324a6cee", "photo-1677442136019-21780ecad995",
  "photo-1620712943543-bcc4688e7485", "photo-1655720828018-edd71de36645",
  "photo-1675271591211-930246f18c3e", "photo-1686191128892-3b37add4c844",
  "photo-1697577418970-95d99b5a55cf", "photo-1684779847639-fbcc5a57dfe9",
  "photo-1694891793604-9bb78dbcc637", "photo-1696446701796-da61225697cc",
  "photo-1682687221038-404670f09ef1", "photo-1682695796954-bad0d0f59ff1",
];

/* ── History mock images ── */
const HISTORY_IMAGES = [
  "photo-1611532736597-de2d4265fba3", "photo-1618005182384-a83a8bd57fbe",
  "photo-1614850523459-c2f4c699c52e", "photo-1614854262340-ab1ca7d079c7",
  "photo-1617791160505-6f00504e3519", "photo-1618172193622-ae2d025f4032",
  "photo-1614849963640-9cc74b2a826f", "photo-1618005198919-d3d4b5a92ead",
];

type Source = "menu" | "computer" | "history" | "community" | "stock";

interface FrameSourcePickerProps {
  onSelect: (src: string) => void;
  onClose: () => void;
}

const sources = [
  { id: "computer" as Source, label: "Computer", icon: Upload, desc: "Upload from your device" },
  { id: "history" as Source, label: "Creations", icon: History, desc: "Pick from your past creations" },
  { id: "community" as Source, label: "Community", icon: Users, desc: "Browse community images" },
  { id: "stock" as Source, label: "Stock", icon: Image, desc: "Search free stock photos" },
];

export default function FrameSourcePicker({ onSelect, onClose }: FrameSourcePickerProps) {
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
  };

  const getImages = () => {
    const list = activeSource === "stock" ? STOCK_IMAGES : activeSource === "community" ? COMMUNITY_IMAGES : HISTORY_IMAGES;
    if (!search.trim()) return list;
    return list; // In a real app, this would filter by search
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

  // Browse view (history / community / stock)
  const images = getImages();
  const sourceLabel = sources.find(s => s.id === activeSource)?.label || "";

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setActiveSource("menu")} className="p-1.5 rounded-lg hover:bg-foreground/[0.06] transition-colors">
          <ChevronLeft size={16} className="text-muted" />
        </button>
        <span className="text-[0.82rem] font-bold flex-1">{sourceLabel}</span>
        <div className="relative flex-1 max-w-[220px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${sourceLabel.toLowerCase()}…`}
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-foreground/[0.1] bg-background text-[0.78rem] outline-none focus:border-foreground/30 transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
        {images.map((id, i) => (
          <button
            key={i}
            onClick={() => handleImageSelect(id)}
            className="aspect-square rounded-xl overflow-hidden border border-transparent hover:border-accent transition-all hover:shadow-md group"
          >
            <img
              src={`https://images.unsplash.com/${id}?w=200&h=200&fit=crop&q=60`}
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
