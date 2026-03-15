import { useState } from "react";
import { Download, RefreshCw, Video, Pencil, Heart, Eye, Copy, Shuffle, FileText, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
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
  "photo-1533158628620-7e4d0a003147", "photo-1505765050516-f72dcac9c60e",
  "photo-1470071459604-3b5ec3a7fe05", "photo-1465146344425-f00d5f5c8f07",
];
const heights = [200, 260, 170, 230, 185, 255, 162, 215, 148, 238, 196, 172, 248, 182, 157, 226, 178, 262, 152, 212];
const isVideo = (i: number) => i % 4 === 3;

const creators = [
  { n: "AI.Verse", i: "AV", c: "#4361ee", dl: "12.4K", id: "1" },
  { n: "NeoPixel", i: "NP", c: "#c9184a", dl: "10.9K", id: "2" },
  { n: "DreamForge", i: "DF", c: "#2a9d8f", dl: "9.8K", id: "3" },
  { n: "LuminaAI", i: "LA", c: "#e76f51", dl: "7.3K", id: "4" },
  { n: "SpectraGen", i: "SG", c: "#7b2d8b", dl: "5.9K", id: "5" },
  { n: "VoidArt", i: "VA", c: "#023e8a", dl: "4.7K", id: "6" },
  { n: "ChromaLab", i: "CL", c: "#f4a261", dl: "4.1K", id: "7" },
  { n: "Synthetix", i: "SX", c: "#06d6a0", dl: "3.8K", id: "8" },
];

const prompts = [
  "A cosmic dreamscape with swirling nebula clouds, cinematic lighting, 8k ultra-detailed",
  "Neon-drenched cyberpunk street scene with holographic billboards, rain-soaked pavement",
  "Abstract liquid metal flowing through crystalline structures, iridescent reflections",
  "Misty mountain landscape at golden hour, ethereal fog, photorealistic render",
];

const iconBtnClass = "flex items-center justify-center w-8 h-8 rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground hover:bg-primary-foreground/[0.38] transition-colors";
const labelBtnClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground text-[0.68rem] font-medium hover:bg-primary-foreground/[0.38] transition-colors";

const MasonryGrid = () => {
  const [activePrompt, setActivePrompt] = useState<number | null>(null);

  return (
    <div className="px-6 md:px-12 py-6 pb-16">
      <div className="masonry-grid">
        {photos.map((photo, i) => {
          const cr = creators[i % creators.length];
          const h = heights[i % heights.length];
          const video = isVideo(i);
          const prompt = prompts[i % prompts.length];
          return (
            <Link
              key={i}
              to={`/image/${i}`}
              className="masonry-item rounded-xl overflow-hidden relative cursor-pointer group no-underline block"
              style={{ background: "#e0e0de" }}
            >
              <img
                src={`https://images.unsplash.com/${photo}?w=400&h=${h}&fit=crop&q=78`}
                alt="AI-Generated Digital Art"
                loading="lazy"
                className="w-full block rounded-xl transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                style={{ height: h, objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* AI label */}
              <div className="absolute top-2 left-2 text-[0.58rem] font-semibold tracking-[0.08em] uppercase bg-foreground/60 backdrop-blur-sm text-primary-foreground px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {video ? "AI Video" : "AI Art"}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-xl flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "var(--gradient-overlay)" }}>
                <TooltipProvider>
                  {/* Top right: Heart + Download + Prompt */}
                  <div className="flex gap-1.5 justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={(e) => e.stopPropagation()} className={iconBtnClass + " hover:bg-accent hover:text-primary-foreground"}>
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs"><p>Favorite</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={(e) => e.stopPropagation()} className={iconBtnClass}>
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs"><p>Download</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActivePrompt(activePrompt === i ? null : i); }} className={iconBtnClass}>
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
                          <button onClick={(e) => e.stopPropagation()} className={iconBtnClass}>
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs"><p>Recreate</p></TooltipContent>
                      </Tooltip>
                      {!video && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={(e) => e.stopPropagation()} className={iconBtnClass}>
                                <Video className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs"><p>Animate</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={(e) => e.stopPropagation()} className={iconBtnClass}>
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
                {activePrompt === i && (
                  <div className="absolute bottom-12 left-3 right-3 bg-foreground/90 backdrop-blur-sm rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[0.7rem] text-primary-foreground/80 leading-[1.5] mb-2">{prompt}</p>
                    <div className="flex gap-2">
                      <Link to={`/image/${i}`} onClick={(e) => e.stopPropagation()} className="text-[0.62rem] text-primary-foreground/60 hover:text-primary-foreground flex items-center gap-1 no-underline">
                        <Eye className="w-[10px] h-[10px]" /> View
                      </Link>
                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(prompt); }} className="text-[0.62rem] text-primary-foreground/60 hover:text-primary-foreground flex items-center gap-1 bg-transparent border-none cursor-pointer">
                        <Copy className="w-[10px] h-[10px]" /> Copy
                      </button>
                      <button onClick={(e) => e.stopPropagation()} className="text-[0.62rem] text-primary-foreground/60 hover:text-primary-foreground flex items-center gap-1 bg-transparent border-none cursor-pointer">
                        <Shuffle className="w-[10px] h-[10px]" /> Remix
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Link>
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