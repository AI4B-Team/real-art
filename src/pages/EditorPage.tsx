import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  RotateCcw, RotateCw, Plus, Minus, X, Image, Video, Music,
  Pencil, ChevronDown, Check, Cloud, UserPlus, Send, Download,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ImageEditor from "@/components/editor/ImageEditor";
import VideoEditor from "@/components/editor/VideoEditor";
import AudioEditor from "@/components/editor/AudioEditor";

const EDITING_MODES = ["Editing", "Reviewing", "Presenting"];

const EditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const imageUrl = (location.state as any)?.imageUrl;
  const videoUrl = (location.state as any)?.videoUrl;
  const initialTab = (location.state as any)?.editorTab || "image";
  const [editorTab, setEditorTab] = useState<"image" | "video" | "audio">(initialTab);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [editingMode, setEditingMode] = useState("Editing");
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-background text-foreground">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-14 bg-foreground/[0.95] flex items-center px-4 gap-3 shrink-0 border-b border-foreground/[0.2]">
          {/* Left: Editor title + Editing badge + Project name + Auto-Saved */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-lg font-display font-bold text-background">Editor</span>

            {/* Editing Mode Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 bg-accent px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-accent/90 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{editingMode}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1.5" align="start">
                {EDITING_MODES.map(mode => (
                  <button key={mode} onClick={() => setEditingMode(mode)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${editingMode === mode ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>
                    {mode}
                    {editingMode === mode && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Project Name */}
            {isEditingName ? (
              <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === "Enter" && setIsEditingName(false)}
                autoFocus
                className="bg-background/10 text-background text-sm font-medium px-3 py-1.5 rounded-lg border border-background/20 focus:outline-none focus:border-accent w-40"
              />
            ) : (
              <button onClick={() => setIsEditingName(true)}
                className="px-3 py-1.5 bg-background/10 rounded-lg text-sm font-medium text-background hover:bg-background/15 transition-colors">
                {projectName}
              </button>
            )}

            {/* Auto-Saved badge */}
            <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Auto-Saved</span>
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
          <div className="flex items-center gap-2.5 ml-auto shrink-0">
            {/* Collaborator avatars */}
            <div className="flex items-center -space-x-2">
              {["photo-1494790108377-be9c29b29330", "photo-1507003211169-0a1dd7228f2d", "photo-1534528741775-53994a69daeb"].map((id, i) => (
                <img key={i} src={`https://images.unsplash.com/${id}?w=32&h=32&fit=crop`} alt="" className="w-8 h-8 rounded-full border-2 border-foreground object-cover" />
              ))}
            </div>

            {/* Share */}
            <button className="flex items-center gap-2 px-4 py-2 bg-background/10 hover:bg-background/15 rounded-lg text-sm text-background font-medium transition-colors">
              <UserPlus className="w-4 h-4" /><span>Share</span>
            </button>

            {/* Publish */}
            <button className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm text-white font-medium transition-colors">
              <Send className="w-4 h-4" /><span>Publish</span>
            </button>

            {/* Export */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-background/10 hover:bg-background/15 rounded-lg text-sm text-background font-medium transition-colors">
                  <Download className="w-4 h-4" /><span>Export</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1.5" align="end">
                {["MP4 (H.264)", "MOV (ProRes)", "GIF", "PNG Sequence", "WAV Audio"].map(fmt => (
                  <button key={fmt} className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] transition-colors">{fmt}</button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Close */}
            <button onClick={() => navigate(-1)} className="p-2 text-background/60 hover:text-background transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {editorTab === "image" && <ImageEditor image={imageUrl} zoomLevel={zoomLevel} onZoomChange={setZoomLevel} />}
          {editorTab === "video" && <VideoEditor video={videoUrl} />}
          {editorTab === "audio" && <AudioEditor onSendToEditor={(asset, target) => { setEditorTab(target); }} />}
        </main>
      </div>
    </div>
  );
};

export default EditorPage;
