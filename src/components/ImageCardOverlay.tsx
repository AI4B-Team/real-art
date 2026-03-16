import { useState } from "react";
import { Download, RefreshCw, Video, Pencil, Eye, Copy, Shuffle, FileText, Bookmark } from "lucide-react";
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
  const cr = creators[index % creators.length];
  const prompt = prompts[index % prompts.length];

  return (
    <>
      <div
        className="absolute inset-0 rounded-xl flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "var(--gradient-overlay)" }}
      >
        <TooltipProvider>
          {/* Top right: Heart + Download + Bookmark + Prompt */}
          <div className="flex gap-1.5 justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className={iconBtnClass}>
                  <Download className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>Download</p></TooltipContent>
            </Tooltip>
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
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowPrompt(!showPrompt); }} className={iconBtnClass}>
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs"><p>View Prompt</p></TooltipContent>
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
                  <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className={iconBtnClass}>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs"><p>Recreate</p></TooltipContent>
              </Tooltip>
              {!isVideo && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className={iconBtnClass}>
                        <Video className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs"><p>Animate</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className={iconBtnClass}>
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
              <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className="text-[0.62rem] text-primary-foreground/60 hover:text-primary-foreground flex items-center gap-1 bg-transparent border-none cursor-pointer">
                <Shuffle className="w-[10px] h-[10px]" /> Remix
              </button>
            </div>
          </div>
        )}
      </div>
      <SaveToBoardModal open={boardModalOpen} onClose={() => setBoardModalOpen(false)} />
    </>
  );
};

export default ImageCardOverlay;
