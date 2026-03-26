import { useState, useRef, useEffect, useCallback } from "react";
import {
  MousePointer2, Paintbrush, Eraser, PaintBucket, Type, Layers,
  ZoomIn, Play, SlidersHorizontal, Download, Save, Globe, ExternalLink,
  Trash2, Upload, Scissors, Wand2, Plus, X, Check, ChevronDown, Image,
  RotateCcw, RotateCw, Eye, EyeOff, Lock, Unlock, Search, Settings,
  FileText, User, Video, Sparkles, Captions, LayoutGrid, AudioLines, Mic,
  Film, Send, ChevronLeft, Wrench, Palette, Heart, Zap,
  MessageSquare, RefreshCw, Loader2, Shuffle, X as XIcon,
  Hash, Copy, Box, Link, Clock,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

/* ─── Types ─── */
interface Layer {
  id: string; name: string; type: "image" | "drawing" | "text"; visible: boolean; locked: boolean; opacity: number;
}

interface TextElement {
  id: string; text: string; x: number; y: number; fontSize: number; fontFamily: string;
  color: string; isBold: boolean; isItalic: boolean; isUnderline: boolean;
}

const TOOL_CONFIGS: Record<string, { title: string; settings: { type: string; label: string; key?: string; min?: number; max?: number; step?: number; options?: string[] }[] }> = {
  select: { title: "Selection", settings: [{ type: "buttons", label: "Mode", options: ["Rectangle", "Ellipse", "Freeform", "Magic"] }] },
  brush: { title: "Brush", settings: [
    { type: "slider", label: "Size", key: "brushSize", min: 1, max: 500 },
    { type: "slider", label: "Hardness", key: "hardness", min: 0, max: 100 },
    { type: "slider", label: "Opacity", key: "opacity", min: 0, max: 100 },
    { type: "color", label: "Color", key: "brushColor" },
  ]},
  eraser: { title: "Eraser", settings: [
    { type: "slider", label: "Size", key: "eraserSize", min: 1, max: 500 },
    { type: "slider", label: "Opacity", key: "eraserOpacity", min: 0, max: 100 },
  ]},
  fill: { title: "Fill", settings: [{ type: "color", label: "Fill Color", key: "fillColor" }, { type: "slider", label: "Tolerance", key: "tolerance", min: 0, max: 255 }] },
  text: { title: "Text", settings: [
    { type: "slider", label: "Font Size", key: "fontSize", min: 8, max: 200 },
    { type: "color", label: "Text Color", key: "textColor" },
    { type: "buttons", label: "Style", options: ["Bold", "Italic", "Underline"] },
  ]},
  magic: { title: "AI Magic", settings: [
    { type: "buttons", label: "Mode", options: ["Generate", "Inpaint", "Outpaint", "Enhance"] },
    { type: "slider", label: "Strength", key: "aiStrength", min: 0, max: 100 },
  ]},
  layers: { title: "Layers", settings: [] },
  upscale: { title: "Upscale", settings: [{ type: "buttons", label: "Scale", options: ["2x", "4x", "8x"] }] },
  animate: { title: "Animate", settings: [
    { type: "buttons", label: "Type", options: ["Pan", "Zoom", "Rotate", "Morph"] },
    { type: "slider", label: "Duration", key: "duration", min: 1, max: 30 },
  ]},
  opacity: { title: "Opacity", settings: [{ type: "slider", label: "Image Opacity", key: "imageOpacity", min: 0, max: 100 }] },
  download: { title: "Download", settings: [{ type: "buttons", label: "Format", options: ["PNG", "JPG", "WEBP", "SVG"] }, { type: "slider", label: "Quality", key: "quality", min: 1, max: 100 }] },
};

const CANVAS_TOOLS = [
  { id: "select", icon: MousePointer2, tooltip: "Select" },
  { id: "brush", icon: Paintbrush, tooltip: "Brush" },
  { id: "eraser", icon: Eraser, tooltip: "Eraser" },
  { id: "removebg", icon: Scissors, tooltip: "Remove Background" },
  { id: "fill", icon: PaintBucket, tooltip: "Fill" },
  { id: "text", icon: Type, tooltip: "Text" },
  { id: "magic", icon: Wand2, tooltip: "AI Magic" },
  { id: "layers", icon: Layers, tooltip: "Layers" },
  { id: "upscale", icon: ZoomIn, tooltip: "Upscale" },
  { id: "animate", icon: Play, tooltip: "Animate" },
  { id: "opacity", icon: SlidersHorizontal, tooltip: "Opacity" },
  { id: "save", icon: Save, tooltip: "Save" },
  { id: "download", icon: Download, tooltip: "Download" },
  { id: "delete", icon: Trash2, tooltip: "Delete" },
];

/* ─── Left Panel Tab Config ─── */
type LeftTab = "creations" | "layers" | "adjustments" | "ai-tools" | "text" | "effects" | "templates" | "settings";

const LEFT_TABS: { id: LeftTab; icon: typeof Image; label: string }[] = [
  { id: "creations", icon: Image, label: "Creations" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "adjustments", icon: SlidersHorizontal, label: "Adjustments" },
  { id: "ai-tools", icon: Wand2, label: "AI Tools" },
  { id: "text", icon: Type, label: "Text" },
  { id: "effects", icon: Zap, label: "Effects" },
  { id: "templates", icon: LayoutGrid, label: "Templates" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=200",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200",
  "https://images.unsplash.com/photo-1552168324-d612d77725e3?w=200",
];

const FILTER_PRESETS = [
  { name: "Original", value: "none" },
  { name: "Vivid", value: "saturate(1.4) contrast(1.1)" },
  { name: "Warm", value: "sepia(0.3) saturate(1.2)" },
  { name: "Cool", value: "hue-rotate(20deg) saturate(0.9)" },
  { name: "B&W", value: "grayscale(1)" },
  { name: "Vintage", value: "sepia(0.5) contrast(0.9) brightness(1.1)" },
  { name: "Dramatic", value: "contrast(1.4) brightness(0.9)" },
  { name: "Fade", value: "brightness(1.1) contrast(0.85) saturate(0.8)" },
];

const AI_IMAGE_TOOLS = [
  { name: "Remove Background", desc: "Isolate Subject From Background", icon: Scissors },
  { name: "Upscale", desc: "Enhance Resolution Up To 4x", icon: ZoomIn },
  { name: "AI Enhance", desc: "Auto-improve Colors And Sharpness", icon: Sparkles },
  { name: "Inpaint", desc: "Remove Or Replace Objects", icon: Eraser },
  { name: "Outpaint", desc: "Extend Image Beyond Borders", icon: Image },
  { name: "Style Transfer", desc: "Apply Artistic Styles", icon: Paintbrush },
];

interface Props {
  image?: string;
  zoomLevel: number;
  onZoomChange: (z: number) => void;
}

const ImageEditor = ({ image, zoomLevel, onZoomChange }: Props) => {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(image);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [inputValue, setInputValue] = useState("");
  const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>("creations");
  const [adjustSubTab, setAdjustSubTab] = useState<"adjustments" | "filters">("adjustments");
  const [effectsSubTab, setEffectsSubTab] = useState<"effects" | "elements">("effects");
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "brand">("general");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{x:number;y:number}[]>([]);
  const [brushStrokes, setBrushStrokes] = useState<{points:{x:number;y:number}[]; color:string; size:number; opacity:number; isEraser?:boolean}[]>([]);

  // Text state
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);

  // Layers
  const [layers, setLayers] = useState<Layer[]>([
    { id: "text-layer", name: "Text", type: "text", visible: true, locked: false, opacity: 100 },
    { id: "drawing-layer", name: "Drawing", type: "drawing", visible: true, locked: false, opacity: 100 },
    { id: "base-image", name: "Background", type: "image", visible: true, locked: false, opacity: 100 },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("text-layer");

  // Tool settings
  const [toolSettings, setToolSettings] = useState<Record<string, any>>({
    fontSize: 24, brushSize: 20, brushColor: "#000000", hardness: 100, opacity: 100,
    tolerance: 32, aiStrength: 75, imageOpacity: 100, quality: 90, eraserSize: 20, eraserOpacity: 100,
    fillColor: "#000000", textColor: "#000000",
  });

  // Creations strip
  const [creations, setCreations] = useState(() => {
    const items = SAMPLE_IMAGES.map((src, i) => ({ id: `s-${i}`, thumbnail: src, title: `Image ${i + 1}`, isActive: false }));
    if (image) items.unshift({ id: "current", thumbnail: image, title: "Current", isActive: true });
    return items;
  });
  const [activeCreationId, setActiveCreationId] = useState<string | null>(image ? "current" : null);

  // Wheel zoom
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); onZoomChange(Math.min(200, Math.max(25, zoomLevel + (e.deltaY > 0 ? -10 : 10)))); }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [zoomLevel, onZoomChange]);

  // Brush drawing
  const handleBrushStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "brush" && activeTool !== "eraser") return;
    const canvas = drawingCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    setIsDrawing(true);
    setCurrentStroke([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    const ctx = canvas.getContext("2d")!;
    const isEraser = activeTool === "eraser";
    const size = isEraser ? toolSettings.eraserSize : toolSettings.brushSize;
    ctx.globalAlpha = (isEraser ? toolSettings.eraserOpacity : toolSettings.opacity) / 100;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : toolSettings.brushColor;
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, size / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleBrushMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (activeTool !== "brush" && activeTool !== "eraser")) return;
    const canvas = drawingCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    setCurrentStroke(prev => [...prev, { x, y }]);
    const ctx = canvas.getContext("2d")!;
    const isEraser = activeTool === "eraser";
    const size = isEraser ? toolSettings.eraserSize : toolSettings.brushSize;
    ctx.globalAlpha = (isEraser ? toolSettings.eraserOpacity : toolSettings.opacity) / 100;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : toolSettings.brushColor;
    const last = currentStroke[currentStroke.length - 1];
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleBrushEnd = () => {
    if (isDrawing && currentStroke.length > 0) {
      setBrushStrokes(prev => [...prev, {
        points: currentStroke,
        color: activeTool === "eraser" ? "eraser" : toolSettings.brushColor,
        size: activeTool === "eraser" ? toolSettings.eraserSize : toolSettings.brushSize,
        opacity: activeTool === "eraser" ? toolSettings.eraserOpacity : toolSettings.opacity,
        isEraser: activeTool === "eraser",
      }]);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  // Canvas click to add text
  const handleCanvasTextClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "text") return;
    const rect = drawingCanvasRef.current!.getBoundingClientRect();
    const newText: TextElement = {
      id: `text-${Date.now()}`, text: "Double-click to edit", x: e.clientX - rect.left, y: e.clientY - rect.top,
      fontSize: toolSettings.fontSize, fontFamily: "DM Sans", color: toolSettings.textColor,
      isBold: false, isItalic: false, isUnderline: false,
    };
    setTextElements(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setEditingTextId(newText.id);
  };

  // Redraw strokes on resize
  useEffect(() => {
    if (!drawingCanvasRef.current || !imageRef.current || isDrawing) return;
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const imgRect = imageRef.current.getBoundingClientRect();
    canvas.width = imgRect.width;
    canvas.height = imgRect.height;
    brushStrokes.forEach(stroke => {
      ctx.globalCompositeOperation = stroke.isEraser ? "destination-out" : "source-over";
      ctx.globalAlpha = stroke.opacity / 100;
      if (stroke.points.length < 2) {
        ctx.fillStyle = stroke.isEraser ? "rgba(0,0,0,1)" : stroke.color;
        ctx.beginPath(); ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = stroke.isEraser ? "rgba(0,0,0,1)" : stroke.color;
        ctx.lineWidth = stroke.size; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach((p, i) => { if (i > 0) ctx.lineTo(p.x, p.y); }); ctx.stroke();
      }
    });
    ctx.globalCompositeOperation = "source-over";
  }, [brushStrokes, selectedImage, isDrawing]);

  // Image drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedImage && activeTool === "select" && isImageSelected) {
      e.preventDefault(); setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedImage) setImagePosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleToolClick = (toolId: string) => {
    if (toolId === "delete") {
      setSelectedImage(undefined); setIsImageSelected(false); setActiveTool(null);
      toast({ title: "Image removed" });
    } else if (toolId === "download" && selectedImage) {
      const link = document.createElement("a");
      link.href = selectedImage; link.download = `image-${Date.now()}.png`; link.click();
      toast({ title: "Downloading..." });
    } else if (toolId === "save") {
      toast({ title: "Saved to creations" });
    } else if (toolId === "select") {
      setActiveTool(activeTool === "select" ? null : "select");
      if (selectedImage) setIsImageSelected(true);
    } else {
      setActiveTool(activeTool === toolId ? null : toolId);
    }
  };

  const handleSelectCreation = (c: typeof creations[0]) => {
    setSelectedImage(c.thumbnail); setActiveCreationId(c.id); setIsImageSelected(true);
    setImagePosition({ x: 0, y: 0 });
    setCreations(prev => prev.map(cr => ({ ...cr, isActive: cr.id === c.id })));
  };

  const currentToolConfig = activeTool ? TOOL_CONFIGS[activeTool] : null;

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* Left Panel */}
      {!isLeftPanelCollapsed && (
        <div className="w-[420px] bg-card border-r border-foreground/[0.08] flex flex-col overflow-hidden shrink-0">
          {/* Icon strip - horizontal at top */}
          <div className="bg-foreground/[0.03] border-b border-foreground/[0.06] flex flex-wrap items-center justify-center px-3 py-2 gap-1 shrink-0">
            {LEFT_TABS.map(tab => (
              <Tooltip key={tab.id}><TooltipTrigger asChild>
                <button onClick={() => setActiveLeftTab(tab.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 ${activeLeftTab === tab.id ? "bg-foreground/[0.08] text-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                  <tab.icon className="w-5 h-5" />
                </button>
              </TooltipTrigger><TooltipContent>{tab.label}</TooltipContent></Tooltip>
            ))}
          </div>

          {/* Search bar + action icons */}
          <div className="px-4 py-3 shrink-0 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" placeholder="Search" className="w-full pl-9 pr-3 h-9 bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
            <Tooltip><TooltipTrigger asChild><button className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/[0.04] transition-colors shrink-0"><LayoutGrid className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Grid View</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><button className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/[0.04] transition-colors shrink-0"><Download className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Download</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><button className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/[0.04] transition-colors shrink-0"><SlidersHorizontal className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Settings</TooltipContent></Tooltip>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Creations Tab */}
            {activeLeftTab === "creations" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Creations</h3>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors">
                    <Upload className="w-3.5 h-3.5" />Upload
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-foreground/[0.12] flex items-center justify-center hover:border-foreground/[0.25] transition-colors">
                    <Plus className="w-5 h-5 text-muted" />
                  </button>
                  {creations.map(c => (
                    <button key={c.id} onClick={() => handleSelectCreation(c)}
                      className={`aspect-square rounded-xl overflow-hidden transition-all ${c.isActive ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"}`}>
                      <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Layers Tab */}
            {activeLeftTab === "layers" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold">Layers</h3>
                {layers.map(layer => (
                  <div key={layer.id} onClick={() => setSelectedLayerId(layer.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${selectedLayerId === layer.id ? "bg-accent/10 ring-1 ring-accent" : "bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12]"}`}>
                    <button onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l)); }}
                      className={`p-1 rounded transition-colors ${layer.visible ? "text-foreground" : "text-muted"}`}>
                      {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div className="w-8 h-8 bg-foreground/[0.06] rounded-lg flex items-center justify-center">
                      {layer.type === "image" && <Image className="w-4 h-4 text-muted" />}
                      {layer.type === "drawing" && <Paintbrush className="w-4 h-4 text-muted" />}
                      {layer.type === "text" && <Type className="w-4 h-4 text-muted" />}
                    </div>
                    <span className="flex-1 text-sm truncate">{layer.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, locked: !l.locked } : l)); }}
                      className={`p-1 rounded transition-colors ${layer.locked ? "text-amber-500" : "text-muted hover:text-foreground"}`}>
                      {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
                {selectedLayerId && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Opacity</span>
                      <span className="text-sm text-muted tabular-nums">{layers.find(l => l.id === selectedLayerId)?.opacity ?? 100}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={layers.find(l => l.id === selectedLayerId)?.opacity ?? 100}
                      onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, opacity: Number(e.target.value) } : l))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-foreground/[0.12]
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-lg" />
                  </div>
                )}
              </div>
            )}

            {/* Adjustments Sub-Tab Nav */}
            {activeLeftTab === "adjustments" && (
              <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1 mb-2">
                {([{id:"adjustments",label:"Adjustments"},{id:"filters",label:"Filters"}] as const).map(sub => (
                  <button key={sub.id} onClick={() => setAdjustSubTab(sub.id)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${adjustSubTab === sub.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>{sub.label}</button>
                ))}
              </div>
            )}
            {activeLeftTab === "adjustments" && adjustSubTab === "adjustments" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Adjustments</h3>
                {[
                  { label: "Brightness", key: "brightness", min: -100, max: 100 },
                  { label: "Contrast", key: "contrast", min: -100, max: 100 },
                  { label: "Saturation", key: "saturation", min: -100, max: 100 },
                  { label: "Exposure", key: "exposure", min: -100, max: 100 },
                  { label: "Highlights", key: "highlights", min: -100, max: 100 },
                  { label: "Shadows", key: "shadows", min: -100, max: 100 },
                  { label: "Temperature", key: "temperature", min: -100, max: 100 },
                  { label: "Sharpness", key: "sharpness", min: 0, max: 100 },
                ].map(adj => (
                  <div key={adj.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">{adj.label}</span>
                      <span className="text-xs text-muted tabular-nums">{toolSettings[adj.key] ?? 0}</span>
                    </div>
                    <input type="range" min={adj.min} max={adj.max}
                      value={toolSettings[adj.key] ?? 0}
                      onChange={e => setToolSettings(prev => ({ ...prev, [adj.key]: Number(e.target.value) }))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-foreground/[0.12]
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-lg" />
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            {activeLeftTab === "adjustments" && adjustSubTab === "filters" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FILTER_PRESETS.map(f => (
                    <button key={f.name}
                      className="rounded-xl overflow-hidden border border-foreground/[0.08] hover:border-accent transition-colors group">
                      <div className="aspect-video bg-foreground/[0.04] flex items-center justify-center">
                        {selectedImage ? (
                          <img src={selectedImage} alt={f.name} className="w-full h-full object-cover" style={{ filter: f.value }} />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.02]" style={{ filter: f.value }} />
                        )}
                      </div>
                      <div className="px-2 py-1.5 text-center">
                        <span className="text-xs font-medium">{f.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Tools Tab */}
            {activeLeftTab === "ai-tools" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold">AI Tools</h3>
                {AI_IMAGE_TOOLS.map(tool => (
                  <button key={tool.name}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <tool.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-muted">{tool.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Templates Tab */}
            {activeLeftTab === "templates" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Templates</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium hover:bg-foreground/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" />Create Template
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Social Post", "Story", "Banner", "Thumbnail", "Flyer", "Card"].map(t => (
                    <button key={t}
                      className="aspect-video rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] hover:border-accent flex items-center justify-center transition-colors">
                      <span className="text-xs font-medium text-muted">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Elements Tab */}
            {activeLeftTab === "elements" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Elements</h3>
                <div className="flex gap-1 bg-foreground/[0.04] rounded-lg p-1">
                  {["Shapes", "Stickers", "Frames", "Icons"].map(sub => (
                    <button key={sub} className="flex-1 py-2 rounded-md text-xs font-medium text-muted hover:text-foreground hover:bg-background transition-colors">{sub}</button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {["Circle", "Rectangle", "Triangle", "Star", "Arrow", "Line", "Heart", "Diamond", "Hexagon", "Pentagon", "Cross", "Ring"].map(shape => (
                    <button key={shape} onClick={() => toast({ title: `${shape} added` })}
                      className="aspect-square rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] hover:border-accent/40 flex items-center justify-center transition-all">
                      <div className="w-8 h-8 bg-foreground/[0.1] rounded-md" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Tab */}
            {activeLeftTab === "text" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold">Text</h3>
                {["Heading", "Subheading", "Body Text", "Caption", "Watermark", "Logo Text"].map(preset => (
                  <button key={preset} onClick={() => toast({ title: `${preset} added` })}
                    className="w-full p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] hover:border-accent/40 text-left transition-all">
                    <span className={`text-foreground font-medium ${preset === "Heading" ? "text-xl" : preset === "Subheading" ? "text-base" : "text-sm"}`}>{preset}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Effects Tab */}
            {activeLeftTab === "effects" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Effects</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["Blur", "Sharpen", "Noise", "Vignette", "Glow", "Pixelate", "Grain", "Tilt Shift", "Distort"].map(fx => (
                    <button key={fx} onClick={() => toast({ title: `${fx} applied` })}
                      className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-foreground/[0.06] hover:border-accent/40 flex flex-col items-center justify-center gap-1 transition-all">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <span className="text-[10px] font-medium">{fx}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Kit Tab */}
            {activeLeftTab === "brand" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Brand Kit</h3>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Logo</h4>
                  <button className="w-full h-24 border-2 border-dashed border-foreground/[0.1] rounded-xl flex flex-col items-center justify-center gap-2 text-muted hover:text-foreground hover:border-foreground/[0.2] transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Upload Logo</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Brand Colors</h4>
                  <div className="flex gap-2">
                    {["#E8472A", "#1a1a2e", "#f5f5f0", "#3b82f6", "#10b981"].map((color, i) => (
                      <button key={i} className="w-10 h-10 rounded-lg border border-foreground/[0.08] hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                    ))}
                    <button className="w-10 h-10 rounded-lg border-2 border-dashed border-foreground/[0.1] flex items-center justify-center text-muted hover:text-foreground transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Fonts</h4>
                  {["Heading — Playfair Display", "Body — DM Sans"].map(font => (
                    <div key={font} className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <span className="text-sm font-medium">{font}</span>
                      <ChevronDown className="w-4 h-4 text-muted" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeLeftTab === "settings" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Settings</h3>

                {/* Size */}
                <div>
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Size</span>
                  <div className="mt-2 p-3 rounded-xl border border-foreground/[0.08] cursor-pointer hover:border-foreground/[0.15] transition-colors">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-muted" />
                      <span className="text-sm font-medium">Landscape (16:9)</span>
                      <ChevronDown className="w-4 h-4 text-muted ml-auto" />
                    </div>
                  </div>
                  <div className="mt-2 p-3 rounded-xl border border-foreground/[0.08] cursor-pointer hover:border-foreground/[0.15] transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-sm font-medium">Resize For Social Media</p>
                        <p className="text-xs text-muted">Create New Version For Social Media</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background */}
                <div className="border-t border-foreground/[0.06] pt-3">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Background</span>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-accent flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        </div>
                        <span className="text-sm font-medium">Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">#FF4F4A</span>
                        <div className="w-5 h-5 rounded bg-accent" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08] cursor-pointer hover:border-foreground/[0.15] transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-foreground/[0.2]" />
                        <span className="text-sm font-medium">Image</span>
                      </div>
                      <span className="text-xs text-muted">Upload</span>
                    </div>
                  </div>
                </div>




                {/* Version History */}
                <div className="border-t border-foreground/[0.06] pt-3">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Version History</span>
                  <div className="mt-2 p-3 rounded-xl border border-foreground/[0.08] cursor-pointer hover:border-foreground/[0.15] transition-colors">
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-5 h-5 text-muted shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Restore To A Previous Version</p>
                        <p className="text-xs text-muted">Creates A New Project</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Prompt at bottom of left panel */}
          <div className="px-4 pb-4 pt-2 border-t border-foreground/[0.06] shrink-0">
            <div className="rounded-xl border-2 border-accent/30 p-3">
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Describe what you want to create..."
                className="w-full bg-transparent text-sm placeholder:text-muted focus:outline-none resize-none min-h-[60px]"
              />
              <div className="flex items-center justify-between mt-2">
                <button className="p-1.5 text-muted hover:text-foreground transition-colors">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-muted hover:text-foreground transition-colors">
                    <Sparkles className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle — pinned to right edge of left panel */}
      <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 z-10 w-5 h-10 bg-card border border-foreground/[0.08] rounded-r-lg flex items-center justify-center hover:bg-foreground/[0.04] transition-colors"
        style={{ left: isLeftPanelCollapsed ? 0 : 420, transform: "translateY(-50%) translateX(0)" }}>
        <ChevronLeft className={`w-3 h-3 text-muted transition-transform ${isLeftPanelCollapsed ? "rotate-180" : ""}`} />
      </button>

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div ref={canvasRef} className="flex-1 bg-foreground/[0.03] relative overflow-hidden"
          style={{ cursor: selectedImage ? (isDragging ? "grabbing" : "grab") : "default" }}
          onClick={(e) => { if (e.target === e.currentTarget && activeTool !== "select") { setIsImageSelected(false); setActiveTool(null); } }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

          {/* Undo/Clear on canvas */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button onClick={() => setBrushStrokes(prev => prev.slice(0, -1))}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-foreground/[0.08] rounded-lg text-muted text-sm font-medium hover:bg-foreground/[0.04] transition-colors shadow-sm">
              <RotateCcw className="w-4 h-4" />Undo
            </button>
            <button onClick={() => { setBrushStrokes([]); if (drawingCanvasRef.current) drawingCanvasRef.current.getContext("2d")?.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-foreground/[0.08] rounded-lg text-muted text-sm font-medium hover:bg-foreground/[0.04] transition-colors shadow-sm">
              <RotateCw className="w-4 h-4" />Clear
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-8">
            {selectedImage ? (
              <div className="relative" style={{
                transform: `scale(${zoomLevel / 100}) translate(${imagePosition.x / (zoomLevel / 100)}px, ${imagePosition.y / (zoomLevel / 100)}px)`,
                transformOrigin: "center center",
                cursor: activeTool === "select" && isImageSelected ? (isDragging ? "grabbing" : "move") : "pointer",
              }}>
                {/* Floating tools above image */}
                {isImageSelected && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card rounded-xl p-1.5 shadow-lg border border-foreground/[0.08] z-10"
                    style={{ transform: `translateX(-50%) scale(${100 / zoomLevel})`, transformOrigin: "center bottom" }}>
                    {CANVAS_TOOLS.map(tool => (
                      <Tooltip key={tool.id}><TooltipTrigger asChild>
                        <button onClick={() => handleToolClick(tool.id)}
                          className={`p-2.5 rounded-lg transition-all ${activeTool === tool.id ? "bg-accent text-white shadow-lg" : "bg-card text-muted hover:bg-foreground/[0.06] hover:text-foreground shadow-sm"}`}>
                          <tool.icon className="w-4 h-4" />
                        </button>
                      </TooltipTrigger><TooltipContent>{tool.tooltip}</TooltipContent></Tooltip>
                    ))}
                  </div>
                )}

                <div className={`bg-card rounded-xl shadow-xl overflow-hidden transition-all max-w-2xl relative ${isImageSelected ? "ring-2 ring-accent ring-offset-2" : "border border-foreground/[0.08]"}`}
                  onClick={(e) => { e.stopPropagation(); setIsImageSelected(true); }}>
                  {/* Base image */}
                  {layers.find(l => l.id === "base-image")?.visible && (
                    <img ref={imageRef} src={selectedImage} alt="Editing" className="w-full h-auto" draggable={false}
                      style={{ opacity: (layers.find(l => l.id === "base-image")?.opacity ?? 100) / 100 }} />
                  )}
                  {/* Drawing canvas */}
                  {layers.find(l => l.id === "drawing-layer")?.visible && (
                    <canvas ref={drawingCanvasRef} className="absolute inset-0 w-full h-full"
                      style={{
                        cursor: ["brush", "eraser", "fill", "text"].includes(activeTool || "") ? "crosshair" : "inherit",
                        pointerEvents: ["brush", "eraser", "fill", "text"].includes(activeTool || "") ? "auto" : "none",
                        opacity: (layers.find(l => l.id === "drawing-layer")?.opacity ?? 100) / 100,
                      }}
                      onMouseDown={handleBrushStart} onMouseMove={handleBrushMove} onMouseUp={handleBrushEnd} onMouseLeave={handleBrushEnd}
                      onClick={(e) => { if (activeTool === "text") handleCanvasTextClick(e); }} />
                  )}
                  {/* Text elements */}
                  {layers.find(l => l.id === "text-layer")?.visible && (
                    <div className="absolute inset-0" style={{ pointerEvents: "none", opacity: (layers.find(l => l.id === "text-layer")?.opacity ?? 100) / 100 }}>
                      {textElements.map(te => (
                        <div key={te.id} className={`absolute ${selectedTextId === te.id ? "ring-2 ring-blue-500 rounded" : ""}`}
                          style={{ left: te.x, top: te.y, transform: "translate(-50%, -50%)", pointerEvents: "auto", zIndex: selectedTextId === te.id ? 10 : 1 }}
                          onClick={(e) => { e.stopPropagation(); setSelectedTextId(te.id); }}
                          onDoubleClick={(e) => { e.stopPropagation(); setEditingTextId(te.id); }}>
                          {editingTextId === te.id ? (
                            <textarea value={te.text} onChange={e => setTextElements(prev => prev.map(t => t.id === te.id ? { ...t, text: e.target.value } : t))}
                              onBlur={() => setEditingTextId(null)} autoFocus
                              className="bg-transparent border-none outline-none resize-none overflow-hidden"
                              style={{ fontSize: te.fontSize, fontFamily: te.fontFamily, color: te.color, fontWeight: te.isBold ? "bold" : "normal", fontStyle: te.isItalic ? "italic" : "normal", textDecoration: te.isUnderline ? "underline" : "none", minWidth: 150 }} />
                          ) : (
                            <div style={{ fontSize: te.fontSize, fontFamily: te.fontFamily, color: te.color, fontWeight: te.isBold ? "bold" : "normal", fontStyle: te.isItalic ? "italic" : "normal", textDecoration: te.isUnderline ? "underline" : "none", minWidth: 150, whiteSpace: "pre-wrap", userSelect: "none" }}>
                              {te.text}
                            </div>
                          )}
                          {selectedTextId === te.id && !editingTextId && (
                            <button onClick={(e) => { e.stopPropagation(); setTextElements(prev => prev.filter(t => t.id !== te.id)); if (selectedTextId === te.id) setSelectedTextId(null); }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center text-xs hover:bg-accent/80">×</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 rounded-2xl bg-foreground/[0.04] flex items-center justify-center">
                  <Image className="w-10 h-10 text-muted/30" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground mb-1">No Image Selected</p>
                  <p className="text-sm text-muted mb-4">Upload an image or select from your creations</p>
                </div>
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors">
                  <Upload className="w-5 h-5" />Upload Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Tool Settings */}
      {currentToolConfig && (
        <div className="w-72 bg-foreground/[0.95] border-l border-foreground/[0.2] overflow-y-auto">
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-background">{currentToolConfig.title}</h3>
              <button onClick={() => setActiveTool(null)} className="text-background/40 hover:text-background"><X className="w-4 h-4" /></button>
            </div>

            {/* Layers panel */}
            {activeTool === "layers" && (
              <div className="space-y-2">
                {layers.map(layer => (
                  <div key={layer.id} onClick={() => setSelectedLayerId(layer.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${selectedLayerId === layer.id ? "bg-accent/30 ring-1 ring-accent" : "bg-background/10 hover:bg-background/15"}`}>
                    <button onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l)); }}
                      className={`p-1 rounded transition-colors ${layer.visible ? "text-background" : "text-background/30"}`}>
                      {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div className="w-8 h-8 bg-background/10 rounded flex items-center justify-center">
                      {layer.type === "image" && <Image className="w-4 h-4 text-background/60" />}
                      {layer.type === "drawing" && <Paintbrush className="w-4 h-4 text-background/60" />}
                      {layer.type === "text" && <Type className="w-4 h-4 text-background/60" />}
                    </div>
                    <span className="flex-1 text-sm text-background truncate">{layer.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, locked: !l.locked } : l)); }}
                      className={`p-1 rounded transition-colors ${layer.locked ? "text-amber-400" : "text-background/30 hover:text-background/60"}`}>
                      {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
                {selectedLayerId && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-background/80">Opacity</span>
                      <span className="text-sm text-background/60 tabular-nums">{layers.find(l => l.id === selectedLayerId)?.opacity ?? 100}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={layers.find(l => l.id === selectedLayerId)?.opacity ?? 100}
                      onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, opacity: Number(e.target.value) } : l))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-background/20
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-lg" />
                  </div>
                )}
              </div>
            )}

            {/* Dynamic tool settings */}
            {currentToolConfig.settings.map((setting, i) => (
              <div key={i} className="space-y-2">
                {setting.type === "slider" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-background/80">{setting.label}</span>
                      <span className="text-sm text-background/60 tabular-nums">{toolSettings[setting.key!] ?? setting.min}</span>
                    </div>
                    <input type="range" min={setting.min} max={setting.max} step={setting.step || 1}
                      value={toolSettings[setting.key!] ?? setting.min}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setToolSettings(prev => ({ ...prev, [setting.key!]: val }));
                        if (activeTool === "text" && selectedTextId && setting.key === "fontSize")
                          setTextElements(prev => prev.map(t => t.id === selectedTextId ? { ...t, fontSize: val } : t));
                      }}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-background/20
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-lg" />
                  </>
                )}
                {setting.type === "buttons" && (
                  <>
                    <span className="text-sm text-background/80">{setting.label}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {setting.options?.map(opt => (
                        <button key={opt} onClick={() => {
                          if (activeTool === "text" && setting.label === "Style" && selectedTextId) {
                            setTextElements(prev => prev.map(t => {
                              if (t.id !== selectedTextId) return t;
                              if (opt === "Bold") return { ...t, isBold: !t.isBold };
                              if (opt === "Italic") return { ...t, isItalic: !t.isItalic };
                              if (opt === "Underline") return { ...t, isUnderline: !t.isUnderline };
                              return t;
                            }));
                          } else {
                            setToolSettings(prev => ({ ...prev, [setting.key || setting.label.toLowerCase()]: opt }));
                          }
                        }}
                          className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${toolSettings[setting.key || setting.label.toLowerCase()] === opt ? "bg-accent text-white" : "bg-background/10 text-background/60 hover:bg-background/15 hover:text-background"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {setting.type === "color" && (
                  <>
                    <span className="text-sm text-background/80">{setting.label}</span>
                    <div className="flex items-center gap-2">
                      <input type="color" value={toolSettings[setting.key!] || "#000000"}
                        onChange={e => {
                          setToolSettings(prev => ({ ...prev, [setting.key!]: e.target.value }));
                          if (activeTool === "text" && selectedTextId && setting.key === "textColor")
                            setTextElements(prev => prev.map(t => t.id === selectedTextId ? { ...t, color: e.target.value } : t));
                        }}
                        className="w-8 h-8 rounded-lg border border-background/20 cursor-pointer bg-transparent p-0 overflow-hidden" />
                      <input type="text" value={toolSettings[setting.key!] || "#000000"} readOnly
                        className="flex-1 bg-background/10 text-background/80 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Delete text button */}
            {activeTool === "text" && selectedTextId && (
              <button onClick={() => { setTextElements(prev => prev.filter(t => t.id !== selectedTextId)); setSelectedTextId(null); }}
                className="w-full px-4 py-2.5 bg-destructive/20 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/30 transition-colors flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />Delete Selected Text
              </button>
            )}
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
        onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { const url = reader.result as string; setSelectedImage(url); setIsImageSelected(true); setImagePosition({ x: 0, y: 0 }); const newC = { id: `u-${Date.now()}`, thumbnail: url, title: "Upload", isActive: true }; setCreations(prev => [newC, ...prev.map(c => ({ ...c, isActive: false }))]); setActiveCreationId(newC.id); }; reader.readAsDataURL(file); } }} />
    </div>
  );
};

export default ImageEditor;
