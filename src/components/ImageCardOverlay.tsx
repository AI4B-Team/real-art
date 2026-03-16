import { useState } from "react";
import { Download, RefreshCw, Video, Pencil, Eye, Copy, Shuffle, Bookmark, Maximize2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SaveToBoardModal from "@/components/SaveToBoardModal";

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

const prompts = [
  "A cosmic dreamscape with swirling nebula clouds, cinematic lighting, 8k ultra-detailed",
  "Neon-drenched cyberpunk street scene with holographic billboards, rain-soaked pavement",
  "Abstract liquid metal flowing through crystalline structures, iridescent reflections",
  "Misty mountain landscape at golden hour, ethereal fog, photorealistic render",
];

const iconBtnClass = "flex items-center justify-center w-8 h-8 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground hover:bg-primary-foreground/[0.38] transition-colors";

interface ImageCardOverlayProps {
  index: number;
  isVideo?: boolean;
}

const ImageCardOverlay = ({ index, isVideo = false }: ImageCardOverlayProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const cr = creators[index % creators.length];
  const prompt = prompts[index % prompts.length];
  const photo = imagePhotos[index % imagePhotos.length];

  return (
    <>
      <div
        className="absolute inset-0 rounded-xl flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "var(--gradient-overlay)" }}
      >
        <TooltipProvider>
          {/* Top right: Save + Like + Download + Open */}
          <div className="flex gap-1.5 justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setBoardModalOpen(true); }} className={iconBtnClass}>
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Save</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setLiked(!liked); }} className={iconBtnClass}>
                  <Heart className={`w-3.5 h-3.5 ${liked ? "fill-accent text-accent" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>{liked ? "Unlike" : "Like"}</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`https://images.unsplash.com/${photo}?w=4096&q=90`}
                  download={`realart-${index}.jpg`}
                  onClick={(e) => e.stopPropagation()}
                  className={iconBtnClass + " no-underline"}
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Download</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/image/${index}`); }} className={iconBtnClass}>
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Open full page</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Bottom row */}
          <div className="flex items-end justify-between mt-auto">
            {/* Creator info */}
            <Link
              to={`/creator/${cr.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 no-underline"
            >
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.58rem] font-bold text-primary-foreground border border-primary-foreground/30"
                style={{ background: cr.c }}
              >
                {cr.i}
              </div>
              <span className="text-[0.72rem] text-primary-foreground/90">{cr.n}</span>
            </Link>

            {/* Bottom right actions */}
            <div className="flex gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/image/${index}?recreate=1`); }} className={iconBtnClass}>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs"><p>Recreate</p></TooltipContent>
              </Tooltip>
              {!isVideo && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/image/${index}#prompts`); }} className={iconBtnClass}>
                        <Video className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs"><p>Animate</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/image/${index}`); }} className={iconBtnClass}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs"><p>Edit</p></TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </TooltipProvider>

        {/* Prompt overlay */}
        {showPrompt && (
          <div className="absolute bottom-12 left-3 right-3 bg-foreground/90 backdrop-blur-sm rounded-lg p-3" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
            <p className="text-[0.7rem] text-primary-foreground/80 leading-[1.5] mb-2">{prompt}</p>
            <div className="flex gap-2">
              <Link to={`/image/${index}`} onClick={(e) => e.stopPropagation()} className="text-[0.62rem] text-primary-foreground/60 hover:text-primary-foreground flex items-center gap-1 no-underline">
                <Eye className="w-[10px] h-[10px]" /> View
              </Link>
              <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(prompt); }} className="text-[0.62rem] text-primary-foreground/60 hover:text-primary-foreground flex items-center gap-1 bg-transparent border-none cursor-pointer">
                <Copy className="w-[10px] h-[10px]" /> Copy
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(prompt).catch(() => {}); navigate(`/image/${index}`); }} className="text-[0.62rem] text-primary-foreground/60 hover:text-primary-foreground flex items-center gap-1 bg-transparent border-none cursor-pointer">
                <Shuffle className="w-[10px] h-[10px]" /> Remix
              </button>
            </div>
          </div>
        )}
      </div>
      <SaveToBoardModal
        open={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        imageId={String(index)}
        imagePhoto={photo}
        imageTitle={imageTitles[index % imageTitles.length]}
      />
    </>
  );
};

export default ImageCardOverlay;
