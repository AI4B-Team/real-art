import { useState } from "react";
import { Download, FileText, RefreshCw, Video, Pencil, Eye, Copy, Shuffle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const photos = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab", "photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85", "photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9", "photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809", "photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b", "photo-1576091160550-2173dba999ef",
  "photo-1518770660439-4636190af475", "photo-1462275646964-a0e3386b89fa",
  "photo-1500462918059-b1a0cb512f1d", "photo-1543722530-d2c3201371e7",
  "photo-1607799279861-4dd421887fb3", "photo-1533158628620-7e4d0a003147",
  "photo-1567360425618-1594206637d2", "photo-1505765050516-f72dcac9c60e",
];
const heights = [200, 260, 170, 230, 185, 255, 162, 215, 148, 238, 196, 172, 248, 182, 157, 226, 178, 262, 152, 212];
const creators = [
  { n: "AI.Verse", i: "AV", c: "#4361ee" },
  { n: "NeoPixel", i: "NP", c: "#c9184a" },
  { n: "DreamForge", i: "DF", c: "#2a9d8f" },
  { n: "LuminaAI", i: "LA", c: "#e76f51" },
  { n: "SpectraGen", i: "SG", c: "#7b2d8b" },
  { n: "VoidArt", i: "VA", c: "#023e8a" },
  { n: "ChromaLab", i: "CL", c: "#f4a261" },
  { n: "Synthetix", i: "SX", c: "#06d6a0" },
];

const samplePrompts = [
  "A cosmic dreamscape with nebula clouds and floating crystalline structures, cinematic lighting, 8k",
  "Abstract fluid art with deep ocean blues and metallic gold, macro photography style",
  "Surreal mountain landscape at golden hour with bioluminescent flora, fantasy art",
  "Digital portrait with neon cyberpunk aesthetics, rain-soaked cityscape reflection",
  "Ethereal forest spirit emerging from ancient trees, volumetric fog, mystical atmosphere",
  "Geometric abstract composition with brutalist architecture influence, monochrome palette",
  "Underwater cathedral with coral pillars and light rays, photorealistic render",
  "Retro-futuristic space station interior, warm analog film grain, 70s sci-fi aesthetic",
];

const actionButtons = [
  { icon: Download, label: "Download" },
  { icon: FileText, label: "Prompt" },
  { icon: RefreshCw, label: "Recreate" },
  { icon: Video, label: "Animate" },
  { icon: Pencil, label: "Edit" },
];

const MasonryGrid = () => {
  const [activePrompt, setActivePrompt] = useState<number | null>(null);

  return (
    <div className="px-6 md:px-12 py-6 pb-16">
      <div className="masonry-grid">
        {photos.map((photo, i) => {
          const cr = creators[i % creators.length];
          const h = heights[i % heights.length];
          const prompt = samplePrompts[i % samplePrompts.length];
          return (
            <div key={i} className="masonry-item rounded-xl overflow-hidden relative cursor-pointer group" style={{ background: "#e0e0de" }}>
              <img
                src={`https://images.unsplash.com/${photo}?w=400&h=${h}&fit=crop&q=78`}
                alt="AI-Generated Digital Art"
                loading="lazy"
                className="w-full block rounded-xl transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                style={{ height: h, objectFit: "cover" }}
              />
              {/* AI label */}
              <div className="absolute top-2 left-2 text-[0.58rem] font-semibold tracking-[0.08em] uppercase bg-foreground/60 backdrop-blur-sm text-primary-foreground px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                AI-Generated
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-xl flex flex-col justify-end items-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "var(--gradient-overlay)" }}>
                {/* Creator info */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.58rem] font-bold text-primary-foreground border border-primary-foreground/30"
                    style={{ background: cr.c }}
                  >
                    {cr.i}
                  </div>
                  <span className="text-[0.72rem] text-primary-foreground/90">{cr.n}</span>
                </div>
                {/* Action buttons */}
                <TooltipProvider>
                  <div className="flex gap-1.5 flex-wrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center w-8 h-8 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground hover:bg-primary-foreground/[0.38] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActivePrompt(activePrompt === i ? null : i); }}
                          className="flex items-center justify-center w-8 h-8 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground hover:bg-primary-foreground/[0.38] transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>View Prompt</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center w-8 h-8 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground hover:bg-primary-foreground/[0.38] transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Recreate</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center w-8 h-8 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground hover:bg-primary-foreground/[0.38] transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Animate</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center w-8 h-8 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground hover:bg-primary-foreground/[0.38] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Edit</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
              {/* Prompt popup */}
              {activePrompt === i && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-foreground/95 backdrop-blur-md rounded-b-xl p-3 z-10 animate-drop-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[0.72rem] text-primary-foreground/80 leading-[1.5] mb-2">{prompt}</p>
                  <div className="flex gap-1.5">
                    <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-foreground/[0.15] text-primary-foreground text-[0.62rem] font-medium hover:bg-primary-foreground/[0.3] transition-colors">
                      <Eye className="w-[10px] h-[10px]" /> View
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-foreground/[0.15] text-primary-foreground text-[0.62rem] font-medium hover:bg-primary-foreground/[0.3] transition-colors">
                      <Copy className="w-[10px] h-[10px]" /> Copy
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-primary-foreground text-[0.62rem] font-medium hover:bg-accent/80 transition-colors">
                      <Shuffle className="w-[10px] h-[10px]" /> Remix
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-5">
        <button className="font-body text-[0.82rem] font-semibold bg-transparent border border-foreground/[0.14] px-8 py-2.5 rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors">
          Load More
        </button>
      </div>
    </div>
  );
};

export default MasonryGrid;
