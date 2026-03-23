import React from "react";
import {
  ArrowLeft, Lightbulb, Cpu, Palette, Save, MoreHorizontal,
  Sparkles, Users, Cloud, ChevronRight
} from "lucide-react";
import { useEbook } from "../context/EbookContext";
import type { WizardTab } from "../context/EbookContext";
import IdeaTab from "./IdeaTab";
import GenerateTab from "./GenerateTab";
import DesignTab from "./DesignTab";
import EbookPreview from "./EbookPreview";

const TABS: { id: WizardTab; label: string; icon: React.ReactNode }[] = [
  { id: "idea", label: "Idea", icon: <Lightbulb size={14} /> },
  { id: "generate", label: "Generate", icon: <Cpu size={14} /> },
  { id: "design", label: "Design", icon: <Palette size={14} /> },
];

export default function EbookStudio() {
  const {
    activeTab, setActiveTab, resetStudio, settings, updateSettings,
    currentBook, startGeneration, isGenerating,
  } = useEbook();

  const canGenerate = settings.prompt.trim().length > 5;

  const handleNext = async () => {
    if (activeTab === "idea") {
      await startGeneration();
    } else if (activeTab === "generate") {
      setActiveTab("design");
    }
  };

  const tabIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      {/* LEFT PANEL */}
      <div className="w-[420px] flex-shrink-0 flex flex-col h-full border-r border-border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 flex-shrink-0">
          <button
            onClick={resetStudio}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-accent rounded flex items-center justify-center flex-shrink-0">
                <Sparkles size={10} className="text-white" />
              </div>
              <span className="text-sm font-bold text-foreground truncate">eBook Studio</span>
            </div>
            {currentBook && (
              <p className="text-xs text-muted-foreground truncate pl-7">
                {currentBook.selectedTitle || currentBook.title || "Untitled"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Cloud size={11} />
              <span>Saved</span>
            </div>
            <div className="flex -space-x-1.5">
              {["D", "R"].map((l) => (
                <div
                  key={l}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-[9px] font-bold text-white border-2 border-card"
                >
                  {l}
                </div>
              ))}
            </div>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Wizard Step Indicator */}
        <div className="flex px-4 pt-3 pb-0 gap-0 flex-shrink-0">
          {TABS.map((tab, i) => (
            <React.Fragment key={tab.id}>
              <button
                onClick={() => {
                  if (i <= tabIndex || (tab.id === "generate" && currentBook) || (tab.id === "design" && currentBook?.chapters?.length)) {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex-1 flex flex-col items-center gap-1 pb-2.5 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : i < tabIndex
                    ? "border-green-400 text-green-500 cursor-pointer"
                    : "border-border text-muted-foreground"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-accent text-white"
                      : i < tabIndex
                      ? "bg-green-100 text-green-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < tabIndex ? "✓" : tab.icon}
                </div>
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
              {i < TABS.length - 1 && (
                <div className="flex items-center pb-2.5">
                  <ChevronRight size={14} className="text-muted-foreground/40 mx-1" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Tab prompt input (Idea tab only) */}
        {activeTab === "idea" && (
          <div className="px-4 pt-3 pb-0 flex-shrink-0">
            <div className="relative">
              <textarea
                value={settings.prompt}
                onChange={(e) => updateSettings({ prompt: e.target.value })}
                placeholder="Describe your eBook topic... e.g. 'A guide to real estate investing for beginners'"
                rows={3}
                className="w-full px-3 py-2.5 pr-10 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:border-accent resize-none transition-colors"
              />
              <button
                className="absolute right-2 top-2 w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-accent transition-colors"
                title="AI enhance prompt"
              >
                <Sparkles size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "idea" && <IdeaTab />}
          {activeTab === "generate" && <GenerateTab />}
          {activeTab === "design" && <DesignTab />}
        </div>

        {/* CTA Footer */}
        <div className="flex-shrink-0 border-t border-border/50 px-4 py-3 bg-card">
          {activeTab === "idea" && (
            <button
              onClick={handleNext}
              disabled={!canGenerate || isGenerating}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
                canGenerate && !isGenerating
                  ? "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/30"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Sparkles size={15} />
              Generate eBook
            </button>
          )}
          {activeTab === "generate" && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("idea")}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveTab("design")}
                disabled={!currentBook?.chapters?.length}
                className={`flex-grow py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  currentBook?.chapters?.length
                    ? "bg-accent hover:bg-accent/90 text-white"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <Palette size={14} />
                Open Design
              </button>
            </div>
          )}
          {activeTab === "design" && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("generate")}
                className="py-2.5 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft size={14} className="inline mr-1" />
                Back
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-foreground hover:bg-foreground/90 text-primary-foreground text-sm font-semibold transition-colors">
                <Save size={14} />
                Save & Export
              </button>
              <button className="py-2.5 px-4 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-colors">
                <Users size={14} className="inline" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 h-full overflow-hidden">
        <EbookPreview />
      </div>
    </div>
  );
}
