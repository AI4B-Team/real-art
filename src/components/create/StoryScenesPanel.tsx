import { useState, useRef, useCallback } from "react";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

export interface StoryScene {
  id: string;
  description: string;
  duration: number;
}

interface StoryScenesPanelProps {
  scenes: StoryScene[];
  onScenesChange: (scenes: StoryScene[]) => void;
}

let sceneCounter = 1;

function makeScene(): StoryScene {
  return { id: `scene-${Date.now()}-${sceneCounter++}`, description: "", duration: 10 };
}

export default function StoryScenesPanel({ scenes, onScenesChange }: StoryScenesPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [countOpen, setCountOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  const setSceneCount = (count: number) => {
    if (count === scenes.length) { setCountOpen(false); return; }
    if (count < scenes.length) {
      onScenesChange(scenes.slice(0, count));
    } else {
      const newScenes = [...scenes];
      for (let i = scenes.length; i < count; i++) newScenes.push(makeScene());
      onScenesChange(newScenes);
    }
    setCountOpen(false);
  };

  const addScene = () => {
    onScenesChange([...scenes, makeScene()]);
  };

  const removeScene = (id: string) => {
    if (scenes.length <= 1) return;
    onScenesChange(scenes.filter(s => s.id !== id));
  };

  const updateScene = (id: string, patch: Partial<StoryScene>) => {
    onScenesChange(scenes.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const moveScene = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= scenes.length) return;
    const next = [...scenes];
    [next[index], next[target]] = [next[target], next[index]];
    onScenesChange(next);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  };

  const handleDragLeave = () => {
    setOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...scenes];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    onScenesChange(next);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-background mt-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/[0.06]">
        <div className="flex items-center gap-3">
          {/* Scene count dropdown */}
          <Popover open={countOpen} onOpenChange={setCountOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 text-accent text-[0.78rem] font-semibold cursor-pointer hover:bg-accent/15 transition-colors">
                {scenes.length} Scene{scenes.length !== 1 ? "s" : ""}
                <ChevronUp size={12} className={`transition-transform ${countOpen ? "" : "rotate-180"}`} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1.5" align="start" sideOffset={6}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <button
                  key={n}
                  onClick={() => setSceneCount(n)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-[0.82rem] font-medium transition-colors ${
                    n === scenes.length
                      ? "bg-accent/10 text-accent"
                      : "text-foreground hover:bg-foreground/[0.05]"
                  }`}
                >
                  {n} Scene{n !== 1 ? "s" : ""}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1 text-[0.8rem] text-muted hover:text-foreground transition-colors font-medium"
          >
            {collapsed ? "Show" : "Hide"} Scenes
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
        <span className="text-[0.78rem] text-muted font-medium">
          Total: {totalDuration}s
        </span>
      </div>

      {/* Scene list */}
      {!collapsed && (
        <div className="p-4 space-y-1">
          {scenes.map((scene, i) => (
            <div
              key={scene.id}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragOver={e => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={`group rounded-xl p-3 transition-all ${
                dragIndex === i ? "opacity-40" : ""
              } ${overIndex === i && dragIndex !== i ? "ring-2 ring-accent/30 bg-accent/[0.03]" : ""}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-foreground/[0.06] transition-colors"
                  title="Drag to reorder"
                >
                  <GripVertical size={14} className="text-muted/40" />
                </div>
                <span className="w-7 h-7 rounded-full bg-accent text-white text-[0.72rem] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-[0.85rem] font-semibold text-foreground">Scene {i + 1}</span>
                {scenes.length > 1 && (
                  <button
                    onClick={() => removeScene(scene.id)}
                    className="ml-auto p-1.5 rounded-lg text-muted/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Remove scene"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="ml-[3.25rem]">
                <textarea
                  value={scene.description}
                  onChange={e => updateScene(scene.id, { description: e.target.value })}
                  placeholder="Describe this scene..."
                  rows={3}
                  className="w-full rounded-xl border border-foreground/[0.08] bg-foreground/[0.01] px-4 py-3 text-[0.85rem] text-foreground placeholder:text-muted/40 resize-none outline-none focus:border-foreground/20 transition-colors font-body"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[0.78rem] text-muted font-medium">Duration:</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={scene.duration}
                    onChange={e => updateScene(scene.id, { duration: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)) })}
                    className="w-16 h-8 rounded-lg border border-foreground/[0.1] bg-background px-2.5 text-[0.82rem] text-foreground outline-none focus:border-foreground/25 transition-colors text-center font-medium"
                  />
                  <span className="text-[0.78rem] text-muted">sec</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add scene button */}
          <button
            onClick={addScene}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-foreground/[0.1] hover:border-accent/30 hover:bg-accent/[0.02] text-muted hover:text-accent transition-all text-[0.82rem] font-medium"
          >
            <Plus size={15} />
            Add Scene
          </button>
        </div>
      )}
    </div>
  );
}

export { makeScene };
