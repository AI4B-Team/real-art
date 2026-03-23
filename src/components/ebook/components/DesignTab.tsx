import React, { useState } from "react";
import {
  LayoutTemplate, Type, ImageIcon, Square, Video, Music, Zap, Layers, Book, Check
} from "lucide-react";
import { useEbook } from "../context/EbookContext";

type DesignSection = "templates" | "content" | "elements" | "text" | "image" | "video" | "audio" | "interactive";

const TEMPLATES = [
  { id: "minimal", label: "Minimal", bg: "#FFFFFF", accent: "#1a1a1a" },
  { id: "modern", label: "Modern", bg: "#0f0f23", accent: "#6366f1" },
  { id: "classic", label: "Classic", bg: "#fef9f0", accent: "#92400e" },
  { id: "bold", label: "Bold", bg: "#dc2626", accent: "#FFFFFF" },
  { id: "elegant", label: "Elegant", bg: "#1c1c1e", accent: "#d4af37" },
  { id: "nature", label: "Nature", bg: "#14532d", accent: "#86efac" },
];

const SIDEBAR_SECTIONS: { id: DesignSection; label: string; icon: React.ReactNode }[] = [
  { id: "templates", label: "Templates", icon: <LayoutTemplate size={14} /> },
  { id: "content", label: "Content", icon: <Book size={14} /> },
  { id: "elements", label: "Elements", icon: <Layers size={14} /> },
  { id: "text", label: "Text", icon: <Type size={14} /> },
  { id: "image", label: "Image", icon: <ImageIcon size={14} /> },
  { id: "video", label: "Video", icon: <Video size={14} /> },
  { id: "audio", label: "Audio", icon: <Music size={14} /> },
  { id: "interactive", label: "Interactive", icon: <Zap size={14} /> },
];

const ELEMENTS = {
  Widgets: [
    { label: "AI Image", icon: "🖼️" }, { label: "Map", icon: "🗺️" },
    { label: "Table", icon: "⊞" }, { label: "QR Code", icon: "📱" },
    { label: "Quiz", icon: "❓" }, { label: "Slideshow", icon: "▶️" },
    { label: "Video", icon: "🎬" }, { label: "Countdown", icon: "⏱️" },
  ],
  Shapes: [
    { label: "Rectangle", icon: "▬" }, { label: "Circle", icon: "●" },
    { label: "Triangle", icon: "▲" }, { label: "Star", icon: "★" },
  ],
  Charts: [
    { label: "Bar", icon: "📊" }, { label: "Line", icon: "📈" },
    { label: "Pie", icon: "🥧" }, { label: "Donut", icon: "🍩" },
  ],
};

export default function DesignTab() {
  const { currentBook, updateCurrentBook } = useEbook();
  const [activeSection, setActiveSection] = useState<DesignSection>("templates");

  return (
    <div className="flex h-full">
      {/* Section nav */}
      <div className="w-16 border-r border-border/50 flex flex-col py-3 gap-1 flex-shrink-0">
        {SIDEBAR_SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex flex-col items-center gap-1 py-2 px-1 mx-1 rounded-lg text-center transition-all ${
              activeSection === s.id ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}>
            {s.icon}
            <span className="text-[9px] leading-tight">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === "templates" && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Choose Template</h3>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((tmpl) => (
                <button key={tmpl.id} onClick={() => updateCurrentBook?.({ template: tmpl.id })}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    currentBook?.template === tmpl.id ? "border-accent shadow-md" : "border-border hover:border-foreground/20"
                  }`}>
                  <div className="h-24 p-2 flex flex-col justify-between" style={{ backgroundColor: tmpl.bg }}>
                    <div className="flex flex-col gap-1">
                      <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: tmpl.accent, opacity: 0.9 }} />
                      <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: tmpl.accent, opacity: 0.4 }} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="h-1 rounded-full w-full" style={{ backgroundColor: tmpl.accent, opacity: 0.2 }} />
                      <div className="h-1 rounded-full w-4/5" style={{ backgroundColor: tmpl.accent, opacity: 0.2 }} />
                    </div>
                  </div>
                  <div className="py-1.5 text-center text-xs font-medium text-foreground bg-card">{tmpl.label}</div>
                  {currentBook?.template === tmpl.id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === "content" && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pages</h3>
            {currentBook ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 cursor-pointer">
                  <div className="w-5 h-6 rounded-sm flex-shrink-0" style={{ backgroundColor: currentBook.coverColor }} />
                  <span className="text-xs font-medium text-foreground">Cover</span>
                  <span className="ml-auto text-xs text-muted-foreground">p.1</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <Book size={12} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Table of Contents</span>
                  <span className="ml-auto text-xs text-muted-foreground">p.2</span>
                </div>
                {currentBook.chapters.map((ch, i) => (
                  <div key={ch.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <div className="w-5 h-5 bg-muted rounded text-xs flex items-center justify-center font-bold text-muted-foreground flex-shrink-0">{i + 1}</div>
                    <span className="text-xs text-muted-foreground truncate">Ch. {i + 1}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{ch.pageCount}p</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <Book size={12} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Back Cover</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Generate your eBook first</p>
            )}
          </div>
        )}

        {activeSection === "elements" && (
          <div className="flex flex-col gap-4">
            {Object.entries(ELEMENTS).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{category}</h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {items.map((item) => (
                    <button key={item.label}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border hover:border-accent/30 hover:bg-accent/5 transition-all">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight text-center">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "text" && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Add Text</h3>
            {[
              { label: "Heading 1", style: "text-2xl font-bold" },
              { label: "Heading 2", style: "text-xl font-bold" },
              { label: "Heading 3", style: "text-lg font-semibold" },
              { label: "Body Text", style: "text-sm" },
              { label: "Caption", style: "text-xs text-muted-foreground" },
              { label: "Pull Quote", style: "text-sm italic border-l-2 border-accent pl-2" },
            ].map((t) => (
              <button key={t.label}
                className="text-left px-3 py-2.5 border border-border rounded-lg hover:border-accent/30 hover:bg-accent/5 transition-all">
                <span className={t.style + " text-foreground"}>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {activeSection === "interactive" && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Interactive Tools</h3>
            {[
              { label: "Flashcard Set", desc: "Flip cards for learning", icon: "🃏" },
              { label: "Quiz", desc: "Multiple choice & more", icon: "✏️" },
              { label: "Course Module", desc: "Structured lessons", icon: "🎓" },
              { label: "Certificate", desc: "Completion badge", icon: "🏆" },
            ].map((tool) => (
              <button key={tool.label}
                className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-accent/30 hover:bg-accent/5 transition-all text-left">
                <span className="text-xl">{tool.icon}</span>
                <div>
                  <div className="text-sm font-medium text-foreground">{tool.label}</div>
                  <div className="text-xs text-muted-foreground">{tool.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {(activeSection === "image" || activeSection === "video" || activeSection === "audio") && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              {activeSection === "image" ? <ImageIcon size={20} className="text-muted-foreground" />
                : activeSection === "video" ? <Video size={20} className="text-muted-foreground" />
                : <Music size={20} className="text-muted-foreground" />}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground capitalize">Add {activeSection}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click on a page in the canvas to insert</p>
            </div>
            <button className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 transition-colors">Browse Library</button>
          </div>
        )}
      </div>
    </div>
  );
}
