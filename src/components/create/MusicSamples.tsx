import { useState } from "react";
import { X, ChevronRight, Play, Pause } from "lucide-react";

const GENRES = [
  { id: "rnb", label: "R&B", photo: "photo-1493225457124-a3eb161ffa5f", isNew: true },
  { id: "pop", label: "POP", photo: "photo-1514525253161-7a46d19cd819" },
  { id: "jazz", label: "Jazz", photo: "photo-1511192336575-5a79af67a629" },
  { id: "country", label: "Country", photo: "photo-1506157786151-b8491531f063" },
  { id: "blues", label: "Blues", photo: "photo-1415201364774-f6f0bb35f28f" },
  { id: "hiphop", label: "Hip-Hop", photo: "photo-1547355253-ff0740f6e8c1" },
  { id: "electronic", label: "Electronic", photo: "photo-1571330735066-03aaa9429d89" },
  { id: "classical", label: "Classical", photo: "photo-1507838153414-b4b713384a76" },
  { id: "rock", label: "Rock", photo: "photo-1498038432885-c6f3f1b912ee" },
  { id: "lofi", label: "Lo-Fi", photo: "photo-1459749411175-04bf5292ceea" },
];

interface MusicSamplesProps {
  onClose: () => void;
  selectedGenre: string | null;
  onGenreSelect: (genreId: string | null) => void;
  onUseStyle: (genre: string) => void;
}

export default function MusicSamples({ onClose, selectedGenre, onGenreSelect, onUseStyle }: MusicSamplesProps) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[0.92rem] font-bold">Samples</h3>
          <span className="text-[0.7rem] text-muted bg-foreground/[0.06] px-2 py-0.5 rounded-md">{GENRES.length} styles</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-[0.78rem] font-medium text-accent hover:underline">
            View All <ChevronRight size={14} />
          </button>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors"><X size={16} /></button>
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {GENRES.map(g => (
          <button
            key={g.id}
            onClick={() => {
              onGenreSelect(selectedGenre === g.id ? null : g.id);
              onUseStyle(g.label);
            }}
            className={`relative shrink-0 w-[120px] h-[120px] rounded-xl overflow-hidden group transition-all ${
              selectedGenre === g.id ? "ring-2 ring-accent ring-offset-2" : ""
            }`}
          >
            <img
              src={`https://images.unsplash.com/${g.photo}?w=240&h=240&fit=crop&q=80`}
              alt={g.label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {g.isNew && (
              <span className="absolute top-2 left-2 bg-accent text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md uppercase">New</span>
            )}
            <span className="absolute bottom-2 left-2 text-white text-[0.78rem] font-bold drop-shadow">{g.label}</span>

            {/* Play preview button */}
            <button
              onClick={e => { e.stopPropagation(); setPlaying(playing === g.id ? null : g.id); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {playing === g.id ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
