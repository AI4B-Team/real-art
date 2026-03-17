import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Sparkles, Image, Video, Music2, Wand2, RefreshCw, Download,
  ChevronDown, X, Plus, Shuffle, Lock, Check, Copy, Bookmark,
  Sliders, ArrowRight, Star, Clock, Zap, Film,
} from "lucide-react";
import PageShell from "@/components/PageShell";

type MediaTab = "image" | "video" | "audio";

interface StylePreset {
  id: string;
  label: string;
  preview: string;
  pro?: boolean;
}

interface GeneratedResult {
  id: string;
  prompt: string;
  type: MediaTab;
  photo: string;
  model: string;
  liked: boolean;
}

/* ── Data ── */

const imageStyles: StylePreset[] = [
  { id: "none", label: "None", preview: "photo-1618005182384-a83a8bd57fbe" },
  { id: "photorealism", label: "Photorealistic", preview: "photo-1573496359142-b8d87734a5a2" },
  { id: "cinematic", label: "Cinematic", preview: "photo-1470071459604-3b5ec3a7fe05" },
  { id: "anime", label: "Anime", preview: "photo-1579546929518-9e396f3cc809" },
  { id: "concept", label: "Concept Art", preview: "photo-1541701494587-cb58502866ab" },
  { id: "3d", label: "3D Render", preview: "photo-1604881991720-f91add269bed" },
  { id: "watercolor", label: "Watercolor", preview: "photo-1462275646964-a0e3386b89fa", pro: true },
  { id: "oil", label: "Oil Painting", preview: "photo-1501854140801-50d01698950b", pro: true },
];

const videoStyles: StylePreset[] = [
  { id: "none", label: "None", preview: "photo-1557682250-33bd709cbe85" },
  { id: "loop", label: "Seamless Loop", preview: "photo-1558618666-fcd25c85cd64" },
  { id: "cinematic", label: "Cinematic", preview: "photo-1470071459604-3b5ec3a7fe05" },
  { id: "timelapse", label: "Timelapse", preview: "photo-1506905925346-21bda4d32df4", pro: true },
];

const audioStyles: StylePreset[] = [
  { id: "lofi", label: "Lo-Fi", preview: "photo-1511379938547-c1f69419868d" },
  { id: "ambient", label: "Ambient", preview: "photo-1470225620780-dba8ba36b745" },
  { id: "cinematic", label: "Cinematic", preview: "photo-1493225457124-a3eb161ffa5f" },
  { id: "electronic", label: "Electronic", preview: "photo-1571974599782-87624638275d" },
  { id: "acoustic", label: "Acoustic", preview: "photo-1468421870903-4df1664ac249", pro: true },
  { id: "orchestral", label: "Orchestral", preview: "photo-1507838153414-b4b713384a76", pro: true },
];

const imageModels = ["DALL-E 3", "Stable Diffusion XL", "Midjourney v6", "Flux Pro", "Adobe Firefly"];
const videoModels = ["Sora", "Runway Gen-3", "Kling AI", "Pika Labs"];
const audioModels = ["Suno v4", "Udio", "AudioCraft", "Stability Audio"];

const imageSizes = ["1:1 Square", "16:9 Landscape", "9:16 Portrait", "4:3 Standard", "3:2 Photo", "2:3 Tall"];
const videoLengths = ["3 seconds", "5 seconds", "10 seconds", "15 seconds", "30 seconds"];
const audioDurations = ["15 seconds", "30 seconds", "1 minute", "2 minutes", "5 minutes"];

const imagePlaceholders = [
  "A lone astronaut standing on a neon-lit alien world, photorealistic, golden hour…",
  "Abstract fluid painting in deep indigo and molten gold, 8K ultra-detailed…",
  "Cyberpunk street market at midnight, rain-soaked cobblestones, neon signs…",
  "Hyperrealistic portrait of a woman with bioluminescent tattoos, studio lighting…",
  "Ancient temple ruins overgrown with glowing crystal formations, misty dawn…",
];
const videoPlaceholders = [
  "Camera slowly pushes in on a cyberpunk cityscape at night, neon lights reflected in puddles…",
  "Underwater footage of bioluminescent jellyfish drifting in dark water, seamless loop…",
  "Time-lapse of storm clouds rolling over mountain peaks at sunset, wide angle…",
];
const audioPlaceholders = [
  "Chill lo-fi beats with soft piano, gentle vinyl crackle, and distant city ambience…",
  "Cinematic orchestral swell building to an epic climax, 60 BPM, full strings and brass…",
  "Dark ambient soundscape with distant thunder, metallic drones, and slow pulse…",
];

const recentPrompts = [
  "cyberpunk city at night, neon reflections",
  "abstract fluid painting, indigo and gold",
  "bioluminescent forest, ethereal glow",
];

const sampleResults: GeneratedResult[] = [
  { id: "r1", prompt: "Cosmic dreamscape, swirling nebula, deep purple and gold", type: "image", photo: "photo-1618005182384-a83a8bd57fbe", model: "DALL-E 3", liked: false },
  { id: "r2", prompt: "Neon city boulevard at midnight, rain-soaked streets", type: "image", photo: "photo-1557682250-33bd709cbe85", model: "Stable Diffusion XL", liked: true },
  { id: "r3", prompt: "Dark fantasy landscape, ancient ruins glowing amber", type: "image", photo: "photo-1541701494587-cb58502866ab", model: "Flux Pro", liked: false },
  { id: "r4", prompt: "AI avatar portrait, cyberpunk style, neon face paint", type: "image", photo: "photo-1579546929518-9e396f3cc809", model: "Midjourney v6", liked: false },
];

/* ── Style Grid Component ── */
const StyleGrid = ({ styles, selected, onSelect }: { styles: StylePreset[]; selected: string; onSelect: (id: string) => void }) => (
  <div className="grid grid-cols-4 gap-2">
    {styles.map(s => (
      <button
        key={s.id}
        onClick={() => !s.pro && onSelect(s.id)}
        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
          selected === s.id ? "border-accent shadow-[0_0_0_1px_hsl(var(--accent))]" : "border-transparent hover:border-foreground/20"
        } ${s.pro ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <img
          src={`https://images.unsplash.com/${s.preview}?w=120&h=120&fit=crop&q=60`}
          alt={s.label}
          className="w-full aspect-square object-cover"
        />
        {s.pro && (
          <div className="absolute top-1 right-1 bg-foreground/80 text-primary-foreground text-[0.55rem] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Lock className="w-2.5 h-2.5" /> PRO
          </div>
        )}
        {selected === s.id && (
          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-white drop-shadow-md" />
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-3">
          <span className="text-[0.62rem] font-semibold text-white">{s.label}</span>
        </div>
      </button>
    ))}
  </div>
);

/* ── Main Component ── */
const CreatePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get("type") || "image") as MediaTab;
  const [activeTab, setActiveTab] = useState<MediaTab>(initialType);
  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [showNeg, setShowNeg] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [outputCount, setOutputCount] = useState(4);
  const [quality, setQuality] = useState<"draft" | "standard" | "hd">("standard");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [likedResults, setLikedResults] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ type: activeTab }, { replace: true });
    setSelectedStyle("none");
    setSelectedModel("");
    setSelectedSize("");
    setPrompt("");
  }, [activeTab]);

  // Default model + size per tab
  useEffect(() => {
    if (activeTab === "image") { setSelectedModel(imageModels[0]); setSelectedSize(imageSizes[0]); }
    if (activeTab === "video") { setSelectedModel(videoModels[0]); setSelectedSize(videoLengths[0]); }
    if (activeTab === "audio") { setSelectedModel(audioModels[0]); setSelectedSize(audioDurations[0]); }
  }, [activeTab]);

  const currentStyles = activeTab === "image" ? imageStyles : activeTab === "video" ? videoStyles : audioStyles;
  const currentModels = activeTab === "image" ? imageModels : activeTab === "video" ? videoModels : audioModels;
  const currentSizes = activeTab === "image" ? imageSizes : activeTab === "video" ? videoLengths : audioDurations;
  const currentPlaceholders = activeTab === "image" ? imagePlaceholders : activeTab === "video" ? videoPlaceholders : audioPlaceholders;

  const handleShuffle = () => {
    const p = currentPlaceholders[Math.floor(Math.random() * currentPlaceholders.length)];
    setPrompt(p);
    textareaRef.current?.focus();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { textareaRef.current?.focus(); return; }
    setGenerating(true);
    setProgress(0);
    setResults([]);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 92) { clearInterval(interval); return 92; }
        return p + Math.random() * 12;
      });
    }, 200);
    await new Promise(r => setTimeout(r, 2800));
    clearInterval(interval);
    setProgress(100);

    const photos = [
      "photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85",
      "photo-1604881991720-f91add269bed", "photo-1579546929518-9e396f3cc809",
      "photo-1541701494587-cb58502866ab", "photo-1470071459604-3b5ec3a7fe05",
    ];
    const generated: GeneratedResult[] = Array.from({ length: outputCount }).map((_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      prompt,
      type: activeTab,
      photo: photos[i % photos.length],
      model: selectedModel,
      liked: false,
    }));

    setTimeout(() => {
      setResults(generated);
      setGenerating(false);
    }, 400);
  };

  const toggleLike = (id: string) => {
    setLikedResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <PageShell>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[0.78rem] text-muted mb-6">
          <Link to="/" className="hover:text-foreground transition-colors no-underline text-muted">Home</Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground font-medium">Create</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-[1.1] mb-2">Create with AI</h1>
            <p className="text-[0.88rem] text-muted">Describe what you want. Our AI handles the rest.</p>
          </div>
          <button className="flex items-center gap-2 text-[0.8rem] font-medium text-muted hover:text-foreground transition-colors">
            <Clock className="w-3.5 h-3.5" />Recent generations
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {([
            { tab: "image" as MediaTab, icon: Image, label: "Image" },
            { tab: "video" as MediaTab, icon: Film, label: "Video" },
            { tab: "audio" as MediaTab, icon: Music2, label: "Audio" },
          ]).map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.84rem] font-semibold border transition-all ${
                activeTab === tab
                  ? "bg-foreground text-primary-foreground border-foreground shadow-lg"
                  : "border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left column — Prompt + Results */}
          <div className="space-y-6">
            {/* Prompt area */}
            <div className="border border-foreground/[0.08] rounded-2xl bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-[0.82rem] font-semibold">
                  Describe your {activeTab}
                </span>
              </div>

              {/* Recent prompts */}
              <div className="flex items-center gap-2 px-5 pb-3 overflow-x-auto">
                <span className="text-[0.72rem] text-muted shrink-0">Recent:</span>
                {recentPrompts.map((rp, i) => (
                  <button key={i} onClick={() => { setPrompt(rp); textareaRef.current?.focus(); }}
                    className="text-[0.72rem] font-medium px-2.5 py-1 rounded-lg bg-foreground/[0.04] text-muted hover:text-foreground hover:bg-foreground/[0.07] transition-colors shrink-0 truncate max-w-[180px]">
                    {rp}
                  </button>
                ))}
                <button onClick={handleShuffle} className="flex items-center gap-1 text-[0.72rem] font-medium px-2.5 py-1 rounded-lg text-accent hover:bg-accent/10 transition-colors shrink-0">
                  <Shuffle className="w-3.5 h-3.5" /> Inspire me
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                placeholder={currentPlaceholders[0]}
                rows={5}
                className="w-full px-5 pt-4 pb-3 bg-transparent border-none outline-none resize-none text-[0.92rem] text-foreground placeholder:text-muted/50 font-body leading-[1.7]"
              />
              <div className="flex items-center justify-between px-5 pb-4">
                <span className="text-[0.7rem] text-muted/50">{prompt.length}/1000 · ⌘↵ to generate</span>
                {prompt && (
                  <button onClick={() => setPrompt("")} className="text-muted hover:text-foreground transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Negative prompt toggle */}
              <div className="border-t border-foreground/[0.05]">
                <button onClick={() => setShowNeg(!showNeg)} className="flex items-center gap-2 px-5 py-3 text-[0.76rem] font-medium text-muted hover:text-foreground transition-colors w-full text-left">
                  <Plus className={`w-3.5 h-3.5 transition-transform ${showNeg ? "rotate-45" : ""}`} />
                  {showNeg ? "Hide" : "Add"} negative prompt
                  <span className="text-[0.68rem] text-muted/50 ml-1">(things to avoid)</span>
                </button>
                {showNeg && (
                  <div className="px-5 pb-4">
                    <textarea
                      value={negPrompt}
                      onChange={e => setNegPrompt(e.target.value)}
                      placeholder="blurry, low quality, watermark, text, distorted faces…"
                      rows={2}
                      className="w-full bg-background/60 border border-foreground/[0.08] rounded-xl px-4 py-3 text-[0.84rem] placeholder:text-muted/40 outline-none focus:border-foreground/20 transition-colors resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Generate button */}
              <div className="border-t border-foreground/[0.06] px-5 py-4 flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-primary-foreground py-3 rounded-xl text-[0.88rem] font-bold hover:bg-accent/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {generating ? (
                    <>
                      <div className="absolute inset-0 bg-accent/30 origin-left transition-all duration-200" style={{ transform: `scaleX(${progress / 100})` }} />
                      <RefreshCw className="w-4 h-4 animate-spin relative z-10" />
                      <span className="relative z-10">Generating… {Math.round(progress)}%</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate {activeTab === "image" ? "Images" : activeTab === "video" ? "Video" : "Audio"}
                    </>
                  )}
                </button>
                {activeTab !== "audio" && (
                  <div className="flex items-center gap-1 border border-foreground/[0.1] rounded-xl overflow-hidden">
                    {[1, 2, 4].map(n => (
                      <button key={n} onClick={() => setOutputCount(n)}
                        className={`w-9 h-[44px] text-[0.8rem] font-semibold transition-colors ${
                          outputCount === n ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.05]"
                        }`}>
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results area */}
            {(results.length > 0 || generating) && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-black text-[1.2rem] tracking-[-0.02em]">
                    {generating ? "Generating…" : `${results.length} result${results.length !== 1 ? "s" : ""}`}
                  </h2>
                  {results.length > 0 && (
                    <button onClick={handleGenerate} className="flex items-center gap-1.5 text-[0.78rem] font-medium text-muted hover:text-foreground transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                  )}
                </div>

                {generating ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: outputCount }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-foreground/[0.06] animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent animate-[shimmer_1.5s_infinite]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {results.map(result => (
                      <div key={result.id} className="group relative rounded-2xl overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/${result.photo}?w=600&h=600&fit=crop&q=80`}
                          alt={result.prompt}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {/* Model badge */}
                        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-white text-[0.68rem] font-semibold px-2 py-0.5 rounded-md">
                          {result.model}
                        </div>
                        {/* Like button */}
                        <button onClick={() => toggleLike(result.id)}
                          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            likedResults.has(result.id) ? "bg-accent text-white" : "bg-black/30 text-white hover:bg-accent"
                          }`}>
                          <Star className={`w-4 h-4 ${likedResults.has(result.id) ? "fill-current" : ""}`} />
                        </button>
                        {/* Bottom actions */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`https://images.unsplash.com/${result.photo}?w=2000&q=90`}
                            download
                            className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-xl text-[0.76rem] font-semibold hover:bg-white/30 transition-colors no-underline"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                          <button onClick={() => copyPrompt(result.prompt)}
                            className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white">
                            {copied === result.prompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white">
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!generating && results.length === 0 && (
              <div className="text-center py-16 px-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-display text-[1.2rem] font-black tracking-[-0.02em] mb-2">Your creations appear here</h2>
                <p className="text-[0.84rem] text-muted mb-6">
                  Type a description above and hit Generate — or use "Inspire me" to start with an example.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {["cosmic dreamscape", "cyberpunk portrait", "lo-fi chill beats", "neon city loop"].map(ex => (
                    <button key={ex} onClick={() => { setPrompt(ex); textareaRef.current?.focus(); }}
                      className="text-[0.76rem] font-medium px-3 py-1.5 rounded-lg border border-foreground/[0.1] text-muted hover:border-foreground/30 hover:text-foreground transition-colors">
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent from community */}
            {!generating && results.length === 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-black text-[1.1rem] tracking-[-0.02em]">Recent from the community</h2>
                  <Link to="/explore" className="flex items-center gap-1 text-[0.78rem] font-medium text-muted hover:text-foreground transition-colors no-underline">
                    Explore all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sampleResults.map(r => (
                    <div key={r.id} className="group relative rounded-2xl overflow-hidden cursor-pointer">
                      <img src={`https://images.unsplash.com/${r.photo}?w=300&h=300&fit=crop&q=70`} alt={r.prompt} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[0.7rem] text-white/80 truncate">{r.prompt}</p>
                        <span className="text-[0.62rem] text-white/50">{r.model}</span>
                      </div>
                      <button onClick={() => setPrompt(r.prompt)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-accent">
                        <Zap className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — Settings */}
          <div className="space-y-5">
            {/* Model selector */}
            <div className="border border-foreground/[0.08] rounded-2xl bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="w-3 h-3 text-muted" />
                <span className="text-[0.78rem] font-semibold">AI Model</span>
              </div>
              <div className="space-y-1">
                {currentModels.map(m => (
                  <button key={m} onClick={() => setSelectedModel(m)}
                    className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-[0.82rem] font-medium transition-colors ${
                      selectedModel === m ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
                    }`}>
                    {m}
                    {selectedModel === m && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Style preset */}
            <div className="border border-foreground/[0.08] rounded-2xl bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sliders className="w-3 h-3 text-muted" />
                <span className="text-[0.78rem] font-semibold">Style Preset</span>
              </div>
              <StyleGrid styles={currentStyles} selected={selectedStyle} onSelect={setSelectedStyle} />
            </div>

            {/* Size / Duration */}
            <div className="border border-foreground/[0.08] rounded-2xl bg-card p-5">
              <span className="text-[0.78rem] font-semibold mb-3 block">
                {activeTab === "image" ? "Size / Ratio" : "Duration"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentSizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-[0.76rem] font-medium border transition-all ${
                      selectedSize === s ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.1] text-muted hover:border-foreground/25 hover:text-foreground"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="border border-foreground/[0.08] rounded-2xl bg-card p-5">
              <span className="text-[0.78rem] font-semibold mb-3 block">Quality</span>
              <div className="space-y-1.5">
                {([
                  { id: "draft" as const, label: "Draft", desc: "Fast · Free", cost: "Free" },
                  { id: "standard" as const, label: "Standard", desc: "Balanced · 1 credit", cost: "" },
                  { id: "hd" as const, label: "HD", desc: "Best · 3 credits", cost: "" },
                ]).map(q => (
                  <button key={q.id} onClick={() => setQuality(q.id)}
                    className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-[0.82rem] font-medium border transition-all ${
                      quality === q.id ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.08] text-muted hover:text-foreground hover:border-foreground/20"
                    }`}>
                    <div>
                      <div>{q.label}</div>
                      <div className={`text-[0.68rem] ${quality === q.id ? "text-primary-foreground/60" : "text-muted/60"}`}>{q.desc}</div>
                    </div>
                    {q.cost && <span className={`text-[0.72rem] font-semibold ${quality === q.id ? "text-primary-foreground" : "text-accent"}`}>{q.cost}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Credits */}
            <div className="border border-foreground/[0.08] rounded-2xl bg-card p-5">
              <span className="text-[0.78rem] font-semibold mb-3 block">Your Credits</span>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-display text-[2rem] font-black text-accent">12</span>
                <span className="text-[0.82rem] text-muted">credits remaining</span>
              </div>
              <button className="w-full bg-foreground/[0.06] text-foreground py-2.5 rounded-xl text-[0.82rem] font-semibold hover:bg-foreground/[0.1] transition-colors">
                Get More Credits
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default CreatePage;
