import React from "react";
import {
  Sparkles, Upload, Link2, Mic, ChevronDown, Wand2,
  Globe, BookOpen, Headphones, Presentation, Users, Hash, AlignLeft
} from "lucide-react";
import { useEbook } from "../context/EbookContext";
import type { ContentType, SourceType, ToneType, CreativeStyle } from "../context/EbookContext";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

const TONES: { value: ToneType; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "academic", label: "Academic" },
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
  { value: "inspirational", label: "Inspirational" },
];

const STYLES: { value: CreativeStyle; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "minimalist", label: "Minimalist" },
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
];

const AI_MODELS = [
  { value: "auto", label: "Auto" },
  { value: "gemini-flash", label: "Gemini Flash" },
  { value: "gemini-pro", label: "Gemini 2.5 Pro" },
  { value: "gpt-5", label: "GPT-5" },
  { value: "gpt-5-mini", label: "GPT-5 Mini" },
];

export default function IdeaTab() {
  const { settings, updateSettings } = useEbook();

  const contentTypes: { value: ContentType; label: string; icon: React.ReactNode }[] = [
    { value: "ebook", label: "eBook", icon: <BookOpen size={16} /> },
    { value: "audiobook", label: "AudioBook", icon: <Headphones size={16} /> },
    { value: "presentation", label: "Presentation", icon: <Presentation size={16} /> },
  ];

  const sources: { value: SourceType; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: "ai", label: "GhostInk AI", icon: <Sparkles size={15} />, desc: "Generate from scratch" },
    { value: "upload", label: "Upload File", icon: <Upload size={15} />, desc: "PDF, DOCX, TXT" },
    { value: "link", label: "Insert Link", icon: <Link2 size={15} />, desc: "YouTube, Blog, etc." },
    { value: "record", label: "Record Audio", icon: <Mic size={15} />, desc: "Live transcription" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Content Type */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content Type</label>
        <div className="flex gap-2">
          {contentTypes.map((ct) => (
            <button key={ct.value} onClick={() => updateSettings({ contentType: ct.value })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                settings.contentType === ct.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}>
              {ct.icon} {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Source</label>
        <div className="grid grid-cols-2 gap-2">
          {sources.map((s) => (
            <button key={s.value} onClick={() => updateSettings({ sourceType: s.value })}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                settings.sourceType === s.value
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-foreground/30"
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.sourceType === s.value ? "bg-accent text-white" : "bg-muted text-muted-foreground"
              }`}>
                {s.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Language</label>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select value={settings.language} onChange={(e) => updateSettings({ language: e.target.value })}
              className="w-full pl-8 pr-8 py-2.5 border border-border rounded-lg text-sm appearance-none bg-card text-foreground focus:outline-none focus:border-accent">
              {LANGUAGES.map((l) => <option key={l.code} value={l.label}>{l.flag} {l.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">AI Model</label>
          <div className="relative">
            <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select value={settings.aiModel} onChange={(e) => updateSettings({ aiModel: e.target.value })}
              className="w-full pl-8 pr-8 py-2.5 border border-border rounded-lg text-sm appearance-none bg-card text-foreground focus:outline-none focus:border-accent">
              {AI_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Tone</label>
          <div className="relative">
            <AlignLeft size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select value={settings.tone} onChange={(e) => updateSettings({ tone: e.target.value as ToneType })}
              className="w-full pl-8 pr-8 py-2.5 border border-border rounded-lg text-sm appearance-none bg-card text-foreground focus:outline-none focus:border-accent">
              {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Style</label>
          <div className="relative">
            <Wand2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select value={settings.creativeStyle} onChange={(e) => updateSettings({ creativeStyle: e.target.value as CreativeStyle })}
              className="w-full pl-8 pr-8 py-2.5 border border-border rounded-lg text-sm appearance-none bg-card text-foreground focus:outline-none focus:border-accent">
              {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Target Audience</label>
        <div className="relative">
          <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={settings.targetAudience}
            onChange={(e) => updateSettings({ targetAudience: e.target.value })}
            placeholder="e.g. Real estate investors, beginners..."
            className="w-full pl-8 pr-4 py-2.5 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1"><Hash size={12} /> Chapters</span>
            <span className="text-accent font-bold">{settings.chapterCount}</span>
          </label>
          <input type="range" min={3} max={20} value={settings.chapterCount}
            onChange={(e) => updateSettings({ chapterCount: +e.target.value })}
            className="w-full accent-accent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Words/Chapter</span>
            <span className="text-accent font-bold">{settings.wordsPerChapter}</span>
          </label>
          <input type="range" min={100} max={2000} step={100} value={settings.wordsPerChapter}
            onChange={(e) => updateSettings({ wordsPerChapter: +e.target.value })}
            className="w-full accent-accent" />
        </div>
      </div>

      {/* Include Images Toggle */}
      <div className="flex items-center justify-between py-2 border-t border-border/50">
        <div>
          <div className="text-sm font-medium text-foreground">Include AI Images</div>
          <div className="text-xs text-muted-foreground">Generate visuals for each chapter</div>
        </div>
        <button onClick={() => updateSettings({ includeImages: !settings.includeImages })}
          className={`relative w-11 h-6 rounded-full transition-colors ${settings.includeImages ? "bg-accent" : "bg-muted"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            settings.includeImages ? "translate-x-5" : "translate-x-0"
          }`} />
        </button>
      </div>
    </div>
  );
}
