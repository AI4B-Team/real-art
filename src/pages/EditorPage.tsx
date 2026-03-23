import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  RotateCcw, RotateCw, Plus, Minus, X, Image, Video, Music,
  Pencil, ChevronDown, Check, Cloud, UserPlus,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ImageEditor from "@/components/editor/ImageEditor";
import VideoEditor from "@/components/editor/VideoEditor";

const EditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const imageUrl = (location.state as any)?.imageUrl;
  const videoUrl = (location.state as any)?.videoUrl;
  const initialTab = (location.state as any)?.editorTab || "image";
  const [editorTab, setEditorTab] = useState<"image" | "video" | "audio">(initialTab);
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-background text-foreground">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-14 bg-foreground/[0.95] flex items-center px-4 gap-4 shrink-0 border-b border-foreground/[0.2]">
          <div className="flex items-center gap-3">
            <span className="text-lg font-display font-bold text-background">Editor</span>
            <div className="flex items-center gap-1.5 bg-accent/30 px-3 py-1.5 rounded-lg">
              <Pencil className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm font-medium text-accent">Editing</span>
            </div>
          </div>

          {/* Undo/Redo & Zoom */}
          <div className="flex items-center gap-2 ml-4">
            <Tooltip><TooltipTrigger asChild>
              <button className="p-2 text-background/60 hover:text-background transition-colors"><RotateCcw className="w-4 h-4" /></button>
            </TooltipTrigger><TooltipContent>Undo</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <button className="p-2 text-background/60 hover:text-background transition-colors"><RotateCw className="w-4 h-4" /></button>
            </TooltipTrigger><TooltipContent>Redo</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <button className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors relative">
                <Cloud className="w-4 h-4" /><Check className="w-2 h-2 absolute bottom-1.5 right-1.5 stroke-[3]" />
              </button>
            </TooltipTrigger><TooltipContent>Saved</TooltipContent></Tooltip>
            <div className="flex items-center gap-1 bg-background/10 rounded-lg px-2 py-1">
              <button onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))} className="p-1 text-background/50 hover:text-background transition-colors"><Minus className="w-3 h-3" /></button>
              <span className="text-sm text-background/80 min-w-[50px] text-center">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="p-1 text-background/50 hover:text-background transition-colors"><Plus className="w-3 h-3" /></button>
            </div>
          </div>

          {/* Center: Media Type Tabs */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-4 lg:gap-8">
              {([
                { id: "image" as const, icon: Image, label: "Image" },
                { id: "video" as const, icon: Video, label: "Video" },
                { id: "audio" as const, icon: Music, label: "Audio" },
              ]).map((tab) => (
                <button key={tab.id} onClick={() => setEditorTab(tab.id)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${editorTab === tab.id ? "text-background" : "text-background/40 hover:text-background"}`}>
                  <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center -space-x-2">
              {["photo-1494790108377-be9c29b29330", "photo-1507003211169-0a1dd7228f2d", "photo-1534528741775-53994a69daeb"].map((id, i) => (
                <img key={i} src={`https://images.unsplash.com/${id}?w=32&h=32&fit=crop`} alt="" className="w-8 h-8 rounded-full border-2 border-foreground object-cover" />
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm text-white font-medium transition-colors">
              <UserPlus className="w-4 h-4" /><span>Share</span>
            </button>
            <button onClick={() => navigate(-1)} className="p-2 text-background/60 hover:text-background transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Editor Content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {editorTab === "image" && <ImageEditor image={imageUrl} zoomLevel={zoomLevel} onZoomChange={setZoomLevel} />}
          {editorTab === "video" && <VideoEditor video={videoUrl} />}
          {editorTab === "audio" && (
            <div className="flex items-center justify-center h-full bg-foreground/[0.02]">
              <div className="text-center text-muted">
                <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Audio Editor</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EditorPage;
