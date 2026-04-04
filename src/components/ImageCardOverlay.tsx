import { useState } from "react";
import {
  Download, RefreshCw, Video, Pencil,
  Bookmark, Maximize2, Heart, Check, Plus,
  ChevronDown, ArrowUpCircle, Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SaveToBoardModal from "@/components/SaveToBoardModal";
import { suggestCollection, addItemToCollection } from "@/lib/collectionStore";

const creators = [
  { n: "AI.Verse", i: "AV", c: "#4361ee", id: "1" },
  { n: "NeoPixel", i: "NP", c: "#c9184a", id: "2" },
  { n: "DreamForge", i: "DF", c: "#2a9d8f", id: "3" },
  { n: "LuminaAI", i: "LA", c: "#e76f51", id: "4" },
  { n: "SpectraGen", i: "SG", c: "#7b2d8b", id: "5" },
  { n: "VoidArt", i: "VA", c: "#023e8a", id: "6" },
  { n: "ChromaLab", i: "CL", c: "#f4a261", id: "7" },
  { n: "Synthetix", i: "SX", c: "#06d6a0", id: "8" },
];

const imagePhotos = [
  "photo-1618005182384-a83a8bd57fbe","photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab","photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85","photo-1506905925346-21bda4d32df4",
  "photo-1604881991720-f91add269bed","photo-1462275646964-a0e3386b89fa",
  "photo-1579546929518-9e396f3cc809","photo-1547036967-23d11aacaee0",
  "photo-1518020382113-a7e8fc38eac9","photo-1576091160550-2173dba999ef",
];

const imageTitles = [
  "Cosmic Dreamscape","Neon Gradient","Abstract Fire","Mountain Vista",
  "Neon Boulevard","Sunset Peak","Digital Avatar","Celestial Dance",
  "Cyberpunk City","Holographic Portrait","Ocean Depths","Abstract Fluid",
];

const imageTags: string[][] = [
  ["cosmic","space","abstract"],
  ["neon","gradient","colorful"],
  ["abstract","fire","warm"],
  ["nature","mountain","landscape"],
  ["cyberpunk","neon","city"],
  ["nature","sunset","landscape"],
  ["portrait","avatar","digital"],
  ["cosmic","celestial","space"],
  ["cyberpunk","city","futuristic"],
  ["portrait","holographic","neon"],
  ["nature","ocean","water"],
  ["abstract","fluid","liquid"],
];

const prompts = [
  "A cosmic dreamscape with swirling nebula clouds, cinematic lighting, 8k ultra-detailed",
  "Neon-drenched cyberpunk gradient with electric pink and deep blue tones, abstract art",
  "Abstract liquid metal flowing through crystalline structures, iridescent reflections, warm tones",
  "Misty mountain landscape at golden hour, ethereal fog rolling through valleys, photorealistic",
  "Neon boulevard at midnight, rain-soaked streets reflecting holographic billboards, cyberpunk aesthetic",
  "Dramatic sunset over snow-capped peaks, golden light breaking through clouds, epic landscape",
  "Futuristic digital avatar portrait with holographic skin, glowing eyes, sci-fi character design",
  "Celestial dance of auroras and stars over a frozen lake, cosmic atmosphere, dreamy",
  "Cyberpunk cityscape with neon lights and flying cars, dystopian future, cinematic composition",
  "Holographic portrait with prismatic light refractions, iridescent colors, futuristic studio photography",
  "Deep ocean bioluminescent scene with glowing jellyfish, underwater dreamscape, ethereal blue tones",
  "Abstract fluid art with swirling metallic liquid, vibrant colors blending organically, macro photography",
];

const iconBtn = "flex items-center justify-center w-8 h-8 rounded-full bg-black/30 backdrop-blur-md cursor-pointer text-primary-foreground hover:bg-black/50 transition-all duration-150 shrink-0 border border-primary-foreground/10";

interface ImageCardOverlayProps {
  index: number;
  isVideo?: boolean;
  photo?: string;
  title?: string;
}

const USE_OPTIONS = [
  { id: "animate",   label: "Animate",   icon: Video },
  { id: "edit",      label: "Edit",      icon: Pencil },
  { id: "recreate",  label: "Recreate",  icon: RefreshCw },
  { id: "upscale",   label: "Upscale",   icon: ArrowUpCircle },
  { id: "variation", label: "Variation",  icon: Copy },
];

const ImageCardOverlay = ({ index, isVideo = false, photo: photoProp, title: titleProp }: ImageCardOverlayProps) => {
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [liked, setLiked] = useState(() => {
    try { return localStorage.getItem(`ra_liked_${index}`) === "1"; } catch { return false; }
  });
  const [quickSaved, setQuickSaved] = useState(false);
  const [useOpen, setUseOpen] = useState(false);
  const navigate = useNavigate();

  const cr = creators[index % creators.length];
  const prompt = prompts[index % prompts.length];
  const photo = photoProp || imagePhotos[index % imagePhotos.length];
  const title = titleProp || imageTitles[index % imageTitles.length];
  const tags = imageTags[index % imageTags.length] || [];

  const suggestedCol = (() => {
    try { return suggestCollection(title, prompt, tags); } catch { return null; }
  })();

  const pillLabel = quickSaved ? "Saved!" : suggestedCol ? suggestedCol.title : "Save";

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const next = !liked;
    setLiked(next);
    try { next ? localStorage.setItem(`ra_liked_${index}`, "1") : localStorage.removeItem(`ra_liked_${index}`); } catch {}
  };

  const handleQuickSave = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    if (!suggestedCol) { setBoardModalOpen(true); return; }
    try {
      addItemToCollection(suggestedCol.id, { imageId: String(index), photo, title });
      setQuickSaved(true);
      setTimeout(() => setQuickSaved(false), 2000);
    } catch { setBoardModalOpen(true); }
  };

  const handleUseAction = (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setUseOpen(false);
    switch (actionId) {
      case "animate":
        navigate(`/image/${index}#prompts`);
        break;
      case "edit":
        navigate("/editor", { state: { imageUrl: `https://images.unsplash.com/${photo}?w=1600&q=90`, editorTab: "image" } });
        break;
      case "recreate":
        navigate(`/create?prompt=${encodeURIComponent(prompt)}&type=image`);
        break;
      case "upscale":
        navigate(`/image/${index}?action=upscale`);
        break;
      case "variation":
        navigate(`/create?prompt=${encodeURIComponent(prompt)}&type=image&variation=true`);
        break;
    }
  };

  return (
    <>
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-hidden"
        style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.55) 100%)" }}
      >
        <TooltipProvider delayDuration={400}>
          {/* TOP LEFT — Collection pill */}
          <div className="absolute top-2.5 left-2.5 right-14 flex items-start">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={e => { e.stopPropagation(); e.preventDefault(); setBoardModalOpen(true); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[0.72rem] font-semibold backdrop-blur-sm transition-all truncate max-w-full ${
                    quickSaved
                      ? "bg-accent text-primary-foreground"
                      : "bg-black/30 text-primary-foreground hover:bg-black/50 border border-primary-foreground/10"
                  }`}
                >
                  {quickSaved
                    ? <Check className="w-3 h-3 shrink-0" />
                    : <Bookmark className="w-3 h-3 shrink-0" />
                  }
                  <span className="truncate">{pillLabel.length > 14 ? pillLabel.slice(0, 14) + "…" : pillLabel}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{quickSaved ? "Saved!" : suggestedCol ? `Save to "${suggestedCol.title}"` : "Save to collection"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* RIGHT COLUMN — vertical icon strip */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleQuickSave} className={iconBtn}>
                  {quickSaved
                    ? <Check className="w-3.5 h-3.5" />
                    : <Bookmark className={`w-3.5 h-3.5 ${suggestedCol ? "fill-primary-foreground/60" : ""}`} />
                  }
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                <p>{quickSaved ? "Saved!" : suggestedCol ? `Quick-Save To "${suggestedCol.title}"` : "Save"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleLike} className={iconBtn}>
                  <Heart className={`w-3.5 h-3.5 ${liked ? "fill-accent text-accent" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs"><p>{liked ? "Unlike" : "Like"}</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`https://images.unsplash.com/${photo}?w=4096&q=90`}
                  download={`realart-${index}.jpg`}
                  onClick={e => e.stopPropagation()}
                  className={`${iconBtn} no-underline`}
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs"><p>Download 4K</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={e => { e.stopPropagation(); e.preventDefault(); navigate(`/image/${index}`); }} className={iconBtn}>
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs"><p>Open</p></TooltipContent>
            </Tooltip>
          </div>

          {/* BOTTOM ROW — creator left, Use button right */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
            <Link
              to={`/creator/${cr.id}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 no-underline min-w-0 shrink"
            >
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.58rem] font-bold text-primary-foreground border border-primary-foreground/30 shrink-0"
                style={{ background: cr.c }}
              >
                {cr.i}
              </div>
              <span className="text-[0.72rem] text-primary-foreground/90 truncate">{cr.n}</span>
            </Link>

            <div className="flex gap-1.5 shrink-0">
              <Popover open={useOpen} onOpenChange={setUseOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); e.preventDefault(); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-primary-foreground hover:bg-black/50 transition-all text-[0.72rem] font-semibold border border-primary-foreground/10"
                  >
                    Use <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="end" side="top" sideOffset={6}>
                  {USE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={e => handleUseAction(opt.id, e)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[0.8rem] font-medium text-foreground hover:bg-foreground/[0.06] transition-colors"
                    >
                      <opt.icon className="w-3.5 h-3.5 text-muted" />
                      {opt.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </TooltipProvider>
      </div>

      <SaveToBoardModal
        open={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        imageId={String(index)}
        imagePhoto={photo}
        imageTitle={title}
      />
    </>
  );
};

export default ImageCardOverlay;
