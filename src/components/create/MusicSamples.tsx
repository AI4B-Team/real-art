import { useState, useRef, useCallback } from "react";
import { X, ChevronRight, Play, Pause } from "lucide-react";

const GENRES = [
  { id: "rnb", label: "R&B", photo: "photo-1493225457124-a3eb161ffa5f", isNew: true, preview: "https://cdn.pixabay.com/audio/2024/11/29/audio_d50ea4fb9a.mp3" },
  { id: "pop", label: "POP", photo: "photo-1514525253161-7a46d19cd819", preview: "https://cdn.pixabay.com/audio/2024/09/10/audio_6e1cec32c4.mp3" },
  { id: "jazz", label: "Jazz", photo: "photo-1511192336575-5a79af67a629", preview: "https://cdn.pixabay.com/audio/2024/09/03/audio_fabba56a05.mp3" },
  { id: "country", label: "Country", photo: "photo-1506157786151-b8491531f063", preview: "https://cdn.pixabay.com/audio/2022/10/18/audio_14fbc71e1a.mp3" },
  { id: "blues", label: "Blues", photo: "photo-1415201364774-f6f0bb35f28f", preview: "https://cdn.pixabay.com/audio/2024/04/15/audio_75b250a2e4.mp3" },
  { id: "hiphop", label: "Hip-Hop", photo: "photo-1547355253-ff0740f6e8c1", preview: "https://cdn.pixabay.com/audio/2022/08/23/audio_d7c8e84e47.mp3" },
  { id: "electronic", label: "Electronic", photo: "photo-1571330735066-03aaa9429d89", preview: "https://cdn.pixabay.com/audio/2024/07/19/audio_c2a6076944.mp3" },
  { id: "classical", label: "Classical", photo: "photo-1507838153414-b4b713384a76", preview: "https://cdn.pixabay.com/audio/2024/02/14/audio_90fad4a4d1.mp3" },
  { id: "rock", label: "Rock", photo: "photo-1498038432885-c6f3f1b912ee", preview: "https://cdn.pixabay.com/audio/2022/01/12/audio_79b079a462.mp3" },
  { id: "lofi", label: "Lo-Fi", photo: "photo-1459749411175-04bf5292ceea", preview: "https://cdn.pixabay.com/audio/2024/09/24/audio_24fdf8d00b.mp3" },
];

interface MusicSamplesProps {
  onClose: () => void;
  selectedGenre: string | null;
  onGenreSelect: (genreId: string | null) => void;
  onUseStyle: (genre: string) => void;
}

export default function MusicSamples({ onClose, selectedGenre, onGenreSelect, onUseStyle }: MusicSamplesProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playPreview = useCallback((genreId: string) => {
    const genre = GENRES.find(g => g.id === genreId);
    if (!genre) return;

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(genre.preview);
    audio.volume = 0.4;
    audioRef.current = audio;
    setPlaying(genreId);
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(null);
  }, []);

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(null);
  }, []);

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

      <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 px-1 -mx-1 scrollbar-hide">
        {GENRES.map(g => (
          <button
            key={g.id}
            onClick={() => {
              onGenreSelect(selectedGenre === g.id ? null : g.id);
              onUseStyle(g.label);
            }}
            onMouseEnter={() => playPreview(g.id)}
            onMouseLeave={stopPreview}
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

            {/* Playing indicator */}
            <div
              className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-opacity ${
                playing === g.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {playing === g.id ? (
                <span className="flex items-center gap-[2px]">
                  <span className="w-[2px] h-2.5 bg-white rounded-full animate-pulse" />
                  <span className="w-[2px] h-3.5 bg-white rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-[2px] h-2 bg-white rounded-full animate-pulse [animation-delay:300ms]" />
                </span>
              ) : (
                <Play size={10} className="ml-0.5" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
