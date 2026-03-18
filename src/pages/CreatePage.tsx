import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Image, Video, Music, Palette,
  Sparkles, Shuffle, Send, Mic, MicOff,
  ChevronDown, X, Check, Loader2,
  User, Copy, Hash, Clock, SlidersHorizontal,
  Play, Pencil, MessageCircle, Move, RefreshCw,
  Film, BookOpen, Presentation, Star,
  Download, Bookmark, Zap, ArrowRight,
  LayoutGrid, Layers, Lock, Package,
  Headphones, AudioLines, Captions,
  RatioIcon, Heart,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import PageShell from "@/components/PageShell";

type ContentType = "Image" | "Video" | "Audio" | "Design";

interface GeneratedResult {
  id: string;
  prompt: string;
  type: ContentType;
  photo: string;
  model: string;
  liked: boolean;
}

const CONTENT_TYPES = [
  { key: "Image"  as ContentType, icon: Image,   accentColor: "text-blue-600",    accentBg: "bg-blue-50",    accentBorder: "border-blue-400" },
  { key: "Video"  as ContentType, icon: Video,   accentColor: "text-red-500",     accentBg: "bg-red-50",     accentBorder: "border-red-400" },
  { key: "Audio"  as ContentType, icon: Music,   accentColor: "text-emerald-600", accentBg: "bg-emerald-50", accentBorder: "border-emerald-400" },
  { key: "Design" as ContentType, icon: Palette, accentColor: "text-amber-600",   accentBg: "bg-amber-50",   accentBorder: "border-amber-400" },
];

const IMAGE_MODES  = [{ value:"Create", icon:Sparkles },{ value:"Batch", icon:Layers },{ value:"Draw", icon:Pencil },{ value:"Swap", icon:RefreshCw },{ value:"Photoshoot", icon:Image }];
const VIDEO_MODES  = [{ value:"Animate", icon:Play },{ value:"Draw", icon:Pencil },{ value:"Lip-Sync", icon:MessageCircle },{ value:"Motion-Sync", icon:Move },{ value:"Avatar Video", icon:User },{ value:"UGC", icon:Video },{ value:"Recast", icon:RefreshCw },{ value:"Story", icon:BookOpen },{ value:"Presentation", icon:Presentation },{ value:"Podcast", icon:Mic }];
const AUDIO_MODES  = [{ value:"Voiceover", icon:Mic, color:"text-emerald-500" },{ value:"Clone", icon:User, color:"text-blue-500" },{ value:"Revoice", icon:RefreshCw, color:"text-cyan-500" },{ value:"Transcribe", icon:Captions, color:"text-orange-500" },{ value:"Sound Effects", icon:AudioLines, color:"text-red-500" },{ value:"Music", icon:Music, color:"text-pink-500" },{ value:"AudioBook", icon:Headphones, color:"text-blue-500" }];
const DESIGN_TYPES = [{ value:"Logo", icon:Sparkles },{ value:"Poster", icon:Presentation },{ value:"Thumbnail", icon:Film },{ value:"Flyer", icon:BookOpen },{ value:"Business Card", icon:User },{ value:"Brochure", icon:BookOpen },{ value:"Infographic", icon:LayoutGrid },{ value:"Invitation", icon:Heart }];

const IMAGE_MODELS  = ["Auto","Flux Pro","GPT-4o Image","Imagen 4 Ultra","Seedream 4.0","Grok Imagine"];
const VIDEO_MODELS  = ["Auto","Veo 3.1 Fast","Veo 3.1 Quality","Kling 2.6","Sora 2","Wan 2.5"];
const AUDIO_MODELS  = ["Auto","ElevenLabs Turbo","ElevenLabs Multilingual"];
const DESIGN_MODELS = ["Auto","Flux Pro","GPT-4o Image","Imagen 4 Ultra"];

const ASPECT_RATIOS   = ["1:1","16:9","9:16","4:3","3:4","3:2","2:3"];
const VIDEO_DURATIONS = ["5s","10s","15s","25s"];

const SAMPLE_PHOTOS = [
  "photo-1618005182384-a83a8bd57fbe","photo-1557682250-33bd709cbe85",
  "photo-1604881991720-f91add269bed","photo-1579546929518-9e396f3cc809",
  "photo-1541701494587-cb58502866ab","photo-1470071459604-3b5ec3a7fe05",
];

const PLACEHOLDERS: Record<ContentType,string> = {
  Image:  "A lone astronaut standing on a neon-lit alien world, photorealistic, golden hour…",
  Video:  "Camera slowly pushes into a cyberpunk cityscape at night, neon reflections in puddles…",
  Audio:  "Chill lo-fi beats with soft piano, gentle vinyl crackle, and distant city ambience…",
  Design: "Minimalist luxury brand logo for a high-end fashion house, gold on black…",
};

const EXAMPLES: Record<ContentType,string[]> = {
  Image: ["A lone astronaut on a neon-lit alien planet at golden hour, photorealistic","Hyperrealistic portrait with bioluminescent tattoos, studio lighting","Cyberpunk street market at midnight, rain-soaked cobblestones, neon signs"],
  Video: ["Camera slowly pushes into a cyberpunk cityscape at night, neon reflections","Underwater bioluminescent jellyfish drifting in dark water, seamless loop","Time-lapse of storm clouds rolling over mountain peaks at sunset"],
  Audio: ["Chill lo-fi beats with soft piano, gentle vinyl crackle, city ambience","Cinematic orchestral swell building to an epic climax, 60 BPM, full strings","Dark ambient soundscape with distant thunder, metallic drones, slow pulse"],
  Design: ["Minimalist luxury logo for a high-end fashion house, gold on black","Bold modernist poster for an art exhibition, geometric shapes, red accent","Clean tech startup business card, midnight blue and electric teal"],
};

function useSpeech(onResult: (t: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window));
  const recogRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => { onResult(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false);
    r.onend   = () => setIsListening(false);
    recogRef.current = r;
    r.start();
    setIsListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => { recogRef.current?.stop(); setIsListening(false); }, []);
  return { isListening, isSupported, startListening, stopListening };
}

/* ─── GenerationInput ────────────────────────────────────────── */

function GenerationInput({ selectedType, onGenerationStart }: { selectedType: ContentType; onGenerationStart?: (r: GeneratedResult[]) => void }) {
  const { toast } = useToast();
  const [prompt,         setPrompt]         = useState("");
  const [isGenerating,   setIsGenerating]   = useState(false);
  const [imageMode,      setImageMode]      = useState("");
  const [videoMode,      setVideoMode]      = useState("");
  const [audioMode,      setAudioMode]      = useState<string|null>(null);
  const [designType,     setDesignType]     = useState("");
  const [selectedModel,  setSelectedModel]  = useState("Auto");
  const [aspectRatio,    setAspectRatio]    = useState("1:1");
  const [videoDuration,  setVideoDuration]  = useState("10s");
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [modelOpen,      setModelOpen]      = useState(false);
  const [ratioOpen,      setRatioOpen]      = useState(false);
  const [numberOpen,     setNumberOpen]     = useState(false);
  const [durationOpen,   setDurationOpen]   = useState(false);
  const [imageModeOpen,  setImageModeOpen]  = useState(false);
  const [videoModeOpen,  setVideoModeOpen]  = useState(false);
  const [audioModeOpen,  setAudioModeOpen]  = useState(false);
  const [designTypeOpen, setDesignTypeOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setImageMode(""); setVideoMode(""); setAudioMode(null); setDesignType("");
    setSelectedModel("Auto"); setPrompt("");
  }, [selectedType]);

  const currentModels =
    selectedType === "Image"  ? IMAGE_MODELS  :
    selectedType === "Video"  ? VIDEO_MODELS  :
    selectedType === "Audio"  ? AUDIO_MODELS  :
    DESIGN_MODELS;

  const handleShuffle = () => {
    const list = EXAMPLES[selectedType];
    setPrompt(list[Math.floor(Math.random() * list.length)]);
    textareaRef.current?.focus();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { textareaRef.current?.focus(); toast({ title: "Add a prompt first" }); return; }
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2200));
    const generated: GeneratedResult[] = Array.from({ length: numberOfImages }).map((_,i) => ({
      id: `gen-${Date.now()}-${i}`, prompt, type: selectedType,
      photo: SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length],
      model: selectedModel, liked: false,
    }));
    setIsGenerating(false);
    onGenerationStart?.(generated);
    toast({ title: "Created!", description: `${numberOfImages} ${selectedType.toLowerCase()}${numberOfImages > 1 ? "s" : ""} generated.` });
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    toast({ title: "Enhancing prompt…" });
    await new Promise(r => setTimeout(r, 1000));
    setPrompt(p => p.trimEnd() + ", ultra detailed, professional quality, award-winning composition.");
    toast({ title: "Enhanced!" });
  };

  const handleSpeechResult = useCallback((t: string) => setPrompt(t), []);
  const { isListening, isSupported, startListening, stopListening } = useSpeech(handleSpeechResult);

  const CategoryIcon = selectedType === "Image" ? Image : selectedType === "Video" ? Video : selectedType === "Audio" ? Music : Palette;
  const categoryColor = selectedType === "Image" ? "text-blue-600" : selectedType === "Video" ? "text-red-500" : selectedType === "Audio" ? "text-emerald-600" : "text-amber-600";
  const borderColor   = selectedType === "Image" ? "border-blue-400" : selectedType === "Video" ? "border-red-400" : selectedType === "Audio" ? "border-emerald-500" : "border-amber-400";
  const hasMode = imageMode || videoMode || audioMode || designType;

  const ModeSelector = () => {
    if (selectedType === "Image") return (
      <Popover open={imageModeOpen} onOpenChange={setImageModeOpen}>
        <PopoverTrigger asChild>
          <button className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all ${imageMode ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-foreground/[0.04] text-muted border-foreground/10 hover:border-foreground/25 hover:text-foreground"}`}>
            <LayoutGrid size={14} />
            {imageMode || "Type"}
            {imageMode ? <X size={12} className="text-blue-500" onClick={e=>{e.stopPropagation();setImageMode("");}} /> : <ChevronDown size={12}/>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1.5" align="start" side="bottom">
          {IMAGE_MODES.map(m=>(
            <button key={m.value} onClick={()=>{setImageMode(m.value);setImageModeOpen(false);}}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${imageMode===m.value?"bg-blue-50 text-blue-700":"hover:bg-foreground/[0.04] text-foreground"}`}>
              <m.icon size={14}/>{m.value}{imageMode===m.value&&<Check size={13} className="ml-auto text-blue-600"/>}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );

    if (selectedType === "Video") return (
      <Popover open={videoModeOpen} onOpenChange={setVideoModeOpen}>
        <PopoverTrigger asChild>
          <button className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all ${videoMode ? "bg-red-50 text-red-700 border-red-300" : "bg-foreground/[0.04] text-muted border-foreground/10 hover:border-foreground/25 hover:text-foreground"}`}>
            <LayoutGrid size={14}/>
            {videoMode || "Type"}
            {videoMode ? <X size={12} className="text-red-500" onClick={e=>{e.stopPropagation();setVideoMode("");}} /> : <ChevronDown size={12}/>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1.5" align="start" side="bottom">
          {VIDEO_MODES.map(m=>(
            <button key={m.value} onClick={()=>{setVideoMode(m.value);setVideoModeOpen(false);}}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${videoMode===m.value?"bg-red-50 text-red-700":"hover:bg-foreground/[0.04] text-foreground"}`}>
              <m.icon size={14}/>{m.value}{videoMode===m.value&&<Check size={13} className="ml-auto text-red-600"/>}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );

    if (selectedType === "Audio") return (
      <Popover open={audioModeOpen} onOpenChange={setAudioModeOpen}>
        <PopoverTrigger asChild>
          <button className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all ${audioMode ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-foreground/[0.04] text-muted border-foreground/10 hover:border-foreground/25 hover:text-foreground"}`}>
            <LayoutGrid size={14}/>
            {audioMode || "Type"}
            {audioMode ? <X size={12} className="text-emerald-600" onClick={e=>{e.stopPropagation();setAudioMode(null);}} /> : <ChevronDown size={12}/>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1.5" align="start" side="bottom">
          {AUDIO_MODES.map(m=>(
            <button key={m.value} onClick={()=>{setAudioMode(m.value);setAudioModeOpen(false);}}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${audioMode===m.value?"bg-emerald-50 text-emerald-700":"hover:bg-foreground/[0.04] text-foreground"}`}>
              <m.icon size={14} className={m.color}/>{m.value}{audioMode===m.value&&<Check size={13} className="ml-auto text-emerald-600"/>}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );

    return (
      <Popover open={designTypeOpen} onOpenChange={setDesignTypeOpen}>
        <PopoverTrigger asChild>
          <button className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all ${designType ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-foreground/[0.04] text-muted border-foreground/10 hover:border-foreground/25 hover:text-foreground"}`}>
            <LayoutGrid size={14}/>
            {designType || "Type"}
            {designType ? <X size={12} className="text-amber-600" onClick={e=>{e.stopPropagation();setDesignType("");}} /> : <ChevronDown size={12}/>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1.5" align="start" side="bottom">
          {DESIGN_TYPES.map(m=>(
            <button key={m.value} onClick={()=>{setDesignType(m.value);setDesignTypeOpen(false);}}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${designType===m.value?"bg-amber-50 text-amber-700":"hover:bg-foreground/[0.04] text-foreground"}`}>
              <m.icon size={14}/>{m.value}{designType===m.value&&<Check size={13} className="ml-auto text-amber-600"/>}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-[860px] mx-auto mb-10">
        <div className={`relative bg-white border-2 ${borderColor} rounded-2xl shadow-sm overflow-hidden`}>
          {/* Top: icons + textarea */}
          <div className="flex items-start gap-3 p-5 pb-2">
            <div className="flex flex-col items-center gap-2 pt-0.5 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 hover:opacity-70 transition" onClick={handleShuffle}>
                    <CategoryIcon size={19} className={categoryColor} strokeWidth={2.2}/>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Auto Prompt</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 hover:opacity-70 transition" onClick={handleShuffle}>
                    <Shuffle size={17} className="text-emerald-500" strokeWidth={2.2}/>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Inspire Me</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter" && (e.metaKey||e.ctrlKey)) handleGenerate(); }}
                placeholder={PLACEHOLDERS[selectedType]}
                className="w-full h-[115px] bg-transparent border-none outline-none resize-none text-[0.94rem] text-foreground placeholder:text-muted/50 leading-[1.65] font-body pt-0.5"
              />
              {prompt && (
                <button onClick={()=>setPrompt("")} className="absolute top-1 right-0 text-muted hover:text-foreground transition">
                  <X size={14}/>
                </button>
              )}
            </div>
          </div>

          <div className="px-5 pb-2">
            <span className="text-[0.68rem] text-muted/40">{prompt.length}/1000 · ⌘↵ to generate</span>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-foreground/[0.06] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            {/* Left */}
            <div className="flex items-center gap-2 flex-wrap">
              <ModeSelector/>

              {hasMode && <div className="w-px h-6 bg-foreground/10"/>}

              {/* Model */}
              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedModel!=="Auto"?"bg-purple-50 text-purple-700":"bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                        <Zap size={13}/>{selectedModel}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Model</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-52 p-1.5" align="start" side="bottom">
                  {currentModels.map(m=>(
                    <button key={m} onClick={()=>{setSelectedModel(m);setModelOpen(false);}}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedModel===m?"bg-foreground text-primary-foreground":"hover:bg-foreground/[0.04] text-foreground"}`}>
                      {m}{selectedModel===m&&<Check size={13}/>}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Character */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-lg bg-foreground/[0.04] text-muted hover:text-foreground transition-colors"
                    onClick={()=>toast({title:"Characters",description:"Select an AI character to feature in your creation."})}>
                    <User size={15}/>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Character</TooltipContent>
              </Tooltip>

              {/* Reference */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-lg bg-foreground/[0.04] text-muted hover:text-foreground transition-colors"
                    onClick={()=>toast({title:"References",description:"Upload reference images to guide your generation."})}>
                    <Copy size={15}/>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Reference</TooltipContent>
              </Tooltip>

              {/* Ratio — Image & Design */}
              {(selectedType==="Image"||selectedType==="Design") && (
                <Popover open={ratioOpen} onOpenChange={setRatioOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${aspectRatio!=="1:1"?"bg-amber-50 text-amber-700":"bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <RatioIcon size={13}/>
                          {aspectRatio!=="1:1"&&<span>{aspectRatio}</span>}
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Ratio</TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-40 p-1.5" align="start" side="bottom">
                    {ASPECT_RATIOS.map(r=>(
                      <button key={r} onClick={()=>{setAspectRatio(r);setRatioOpen(false);}}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${aspectRatio===r?"bg-foreground text-primary-foreground":"hover:bg-foreground/[0.04] text-foreground"}`}>
                        {r}{aspectRatio===r&&<Check size={13}/>}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              )}

              {/* Duration — Video */}
              {selectedType==="Video" && (
                <Popover open={durationOpen} onOpenChange={setDurationOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                          <Clock size={13}/>{videoDuration}
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Duration</TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-32 p-1.5" align="start" side="bottom">
                    {VIDEO_DURATIONS.map(d=>(
                      <button key={d} onClick={()=>{setVideoDuration(d);setDurationOpen(false);}}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${videoDuration===d?"bg-foreground text-primary-foreground":"hover:bg-foreground/[0.04] text-foreground"}`}>
                        {d}{videoDuration===d&&<Check size={13}/>}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              )}

              {/* Number — Image & Design */}
              {(selectedType==="Image"||selectedType==="Design") && (
                <Popover open={numberOpen} onOpenChange={setNumberOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${numberOfImages!==1?"bg-red-50 text-red-600":"bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                          <Hash size={13}/>{numberOfImages!==1&&<span>{numberOfImages}</span>}
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Count</TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-36 p-1.5" align="start" side="bottom">
                    {[1,2,3,4].map(n=>(
                      <button key={n} onClick={()=>{setNumberOfImages(n);setNumberOpen(false);}}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${numberOfImages===n?"bg-foreground text-primary-foreground":"hover:bg-foreground/[0.04] text-foreground"}`}>
                        {n} {n===1?"output":"outputs"}{numberOfImages===n&&<Check size={13}/>}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              )}

              {/* Quality knob — Audio */}
              {selectedType==="Audio" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-lg bg-foreground/[0.04] text-muted hover:text-foreground transition-colors"
                      onClick={()=>toast({title:"Quality",description:"Adjust audio generation quality settings."})}>
                      <SlidersHorizontal size={15}/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Quality</TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {prompt.trim() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleEnhance}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.05] text-muted hover:text-foreground text-sm font-medium transition-colors">
                      <Sparkles size={14} className="text-purple-500"/>AI
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Enhance Prompt</TooltipContent>
                </Tooltip>
              )}

              {isSupported && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={isListening ? stopListening : startListening}
                      className={`p-2 rounded-lg text-sm transition-colors ${isListening?"bg-red-50 text-red-500 animate-pulse":"bg-foreground/[0.04] text-muted hover:text-foreground"}`}>
                      {isListening ? <MicOff size={16}/> : <Mic size={16}/>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isListening?"Stop":"Speak"}</TooltipContent>
                </Tooltip>
              )}

              <button onClick={handleGenerate} disabled={isGenerating||!prompt.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isGenerating ? (<><Loader2 size={14} className="animate-spin"/>Generating…</>) : (<><Send size={14}/>Generate</>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */

const CreatePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get("type") as ContentType | null;
  const [selectedType, setSelectedType] = useState<ContentType>(initialType || "Image");
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const handleTypeChange = (t: ContentType) => {
    setSelectedType(t);
    setResults([]);
    setSearchParams({ type: t }, { replace: true });
  };

  const toggleLike = (id: string) => {
    setLikedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(text);
    setTimeout(()=>setCopied(null), 1800);
  };

  return (
    <PageShell>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10">
        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="font-body text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-[-0.01em] leading-[1.15] mb-3">
            What Would You Like To Create Today?
          </h1>
        </div>

        {/* Pills */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {CONTENT_TYPES.map(({ key, icon: Icon, accentColor, accentBg, accentBorder }) => (
            <button key={key} onClick={() => handleTypeChange(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                selectedType === key
                  ? `${accentBg} ${accentBorder} ${accentColor}`
                  : "bg-white border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"
              }`}>
              <Icon size={15} className={selectedType === key ? accentColor : "text-muted"}/>
              {key}
            </button>
          ))}
        </div>

        {/* Prompt box */}
        <GenerationInput
          selectedType={selectedType}
          onGenerationStart={r => { setResults(r); window.scrollTo({ top: 500, behavior: "smooth" }); }}
        />

        {/* Results */}
        {results.length > 0 && (
          <div className="max-w-[860px] mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-body font-bold text-xl md:text-2xl">{results.length} result{results.length!==1?"s":""}</h2>
              <button onClick={()=>setResults([])} className="flex items-center gap-1.5 text-[0.78rem] font-medium text-muted hover:text-foreground transition-colors"><X size={13}/>Clear</button>
            </div>
            <div className={`grid gap-4 ${results.length===1?"grid-cols-1 max-w-[420px]":results.length===2?"grid-cols-2":results.length===3?"grid-cols-3":"grid-cols-2 md:grid-cols-4"}`}>
              {results.map(r => (
                <div key={r.id} className="group relative rounded-2xl overflow-hidden">
                  <img src={`https://images.unsplash.com/${r.photo}?w=600&h=600&fit=crop&q=80`} alt={r.prompt} className="w-full aspect-square object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                  <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-white text-[0.68rem] font-semibold px-2 py-0.5 rounded-md">{r.model}</div>
                  <button onClick={()=>toggleLike(r.id)} className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${likedIds.has(r.id)?"bg-accent text-white":"bg-black/30 text-white hover:bg-accent"}`}>
                    <Star size={14} className={likedIds.has(r.id)?"fill-current":""}/>
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`https://images.unsplash.com/${r.photo}?w=2000&q=90`} download className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-xl text-[0.76rem] font-semibold hover:bg-white/30 transition-colors no-underline">
                      <Download size={13}/>Download
                    </a>
                    <button onClick={()=>copyPrompt(r.prompt)} className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white">
                      {copied===r.prompt?<Check size={14}/>:<Copy size={14}/>}
                    </button>
                    <button className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white"><Bookmark size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community */}
        {results.length===0 && selectedType && (
          <div className="max-w-[860px] mx-auto mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-body font-bold text-xl md:text-2xl">Recent From The Community</h2>
              <Link to="/explore" className="flex items-center gap-1 text-[0.78rem] font-medium text-muted hover:text-foreground transition-colors no-underline">
                Explore all<ArrowRight size={12}/>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SAMPLE_PHOTOS.slice(0,4).map((photo,i)=>(
                <div key={i} className="group relative rounded-2xl overflow-hidden cursor-pointer">
                  <img src={`https://images.unsplash.com/${photo}?w=300&h=300&fit=crop&q=70`} alt="Community creation" className="w-full aspect-square object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CreatePage;
