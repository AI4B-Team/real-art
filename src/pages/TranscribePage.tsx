import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic, Upload, Link2, Search, Clock, Globe, FileText, Copy,
  Share2, Trash2, MoreVertical, ChevronDown, Check, X,
  Volume2, Star, Grid, List, Filter, Download, Zap,
  Users, Hash, Video, StopCircle, Sparkles, RotateCcw, Loader2,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PageShell from "@/components/PageShell";
import { toast } from "@/hooks/use-toast";

/* ─── Types ─── */
export interface Transcript {
  id: string;
  title: string;
  duration: string;
  date: string;
  source: "upload" | "recording" | "link";
  status: "completed" | "processing" | "error";
  speakers: number;
  language: string;
  words: number | null;
  starred: boolean;
  tags: string[];
  summary: string | null;
}

/* ─── Mock Data ─── */
const MOCK_TRANSCRIPTS: Transcript[] = [
  { id: "t1", title: "Product Strategy Meeting Q4", duration: "42:15", date: "2026-03-20", source: "upload", status: "completed", speakers: 4, language: "English", words: 8250, starred: true, tags: ["Meeting", "Strategy"], summary: "Discussion about Q4 product roadmap, resource allocation, and launch timeline for the mobile app." },
  { id: "t2", title: "Customer Interview - Sarah Chen", duration: "28:30", date: "2026-03-19", source: "recording", status: "completed", speakers: 2, language: "English", words: 5420, starred: false, tags: ["Interview", "Customer"], summary: "User research interview covering pain points with current onboarding flow and feature requests." },
  { id: "t3", title: "Marketing Podcast Episode 12", duration: "1:05:22", date: "2026-03-18", source: "link", status: "completed", speakers: 3, language: "English", words: 12800, starred: true, tags: ["Podcast", "Marketing"], summary: "Episode covering AI-driven marketing strategies and content automation trends for 2026." },
  { id: "t4", title: "Team Standup - March 17", duration: "15:45", date: "2026-03-17", source: "recording", status: "completed", speakers: 6, language: "English", words: 3100, starred: false, tags: ["Standup", "Engineering"], summary: "Daily standup covering sprint progress, blockers, and deployment schedule." },
  { id: "t5", title: "Investor Pitch Recording", duration: "22:10", date: "2026-03-16", source: "upload", status: "completed", speakers: 2, language: "English", words: 4500, starred: true, tags: ["Pitch", "Fundraising"], summary: "Series B pitch deck presentation covering market opportunity, traction, and financial projections." },
  { id: "t6", title: "Spanish Webinar - AI Tools", duration: "55:00", date: "2026-03-15", source: "link", status: "completed", speakers: 2, language: "Spanish", words: 9800, starred: false, tags: ["Webinar", "AI"], summary: "Webinar en español sobre herramientas de IA para creadores de contenido." },
  { id: "t7", title: "Voice Note - App Ideas", duration: "03:22", date: "2026-03-14", source: "recording", status: "completed", speakers: 1, language: "English", words: 620, starred: false, tags: ["Voice Note"], summary: "Quick brainstorm on new app features and integration possibilities." },
  { id: "t8", title: "Sales Call - Acme Corp", duration: "35:40", date: "2026-03-22", source: "upload", status: "processing", speakers: 2, language: "English", words: null, starred: false, tags: ["Sales"], summary: null },
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Dutch", "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi",
];

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
};

const getSourceIcon = (source: string) => {
  switch (source) {
    case "link": return <Link2 className="w-5 h-5 text-blue-500" />;
    case "recording": return <Mic className="w-5 h-5 text-rose-500" />;
    default: return <Upload className="w-5 h-5 text-emerald-500" />;
  }
};

/* ─── Page ─── */
const TranscribePage = () => {
  const navigate = useNavigate();
  const [transcripts, setTranscripts] = useState<Transcript[]>(MOCK_TRANSCRIPTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Recording state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const filteredTranscripts = transcripts.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "starred") return matchesSearch && t.starred;
    if (activeFilter === "processing") return matchesSearch && t.status === "processing";
    return matchesSearch && t.source === activeFilter;
  });

  const handleEdit = (t: Transcript) => {
    navigate(`/transcribe/${t.id}`, { state: { transcript: t } });
  };

  const toggleStar = (id: string) => {
    setTranscripts(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const handleDelete = (id: string) => {
    setTranscripts(prev => prev.filter(t => t.id !== id));
    toast({ title: "Transcript deleted" });
  };

  const handleFileUpload = () => {
    const newT: Transcript = {
      id: `t-${Date.now()}`, title: `Uploaded File ${new Date().toLocaleTimeString()}`, duration: "00:00",
      date: new Date().toISOString().split("T")[0], source: "upload", status: "processing",
      speakers: 1, language: "Detecting...", words: null, starred: false, tags: ["Upload"], summary: null,
    };
    setTranscripts(prev => [newT, ...prev]);
    toast({ title: "File uploaded, transcribing..." });
    setTimeout(() => {
      setTranscripts(prev => prev.map(t => t.id === newT.id ? { ...t, status: "completed", language: "English", words: 3200, summary: "Transcription complete." } : t));
      toast({ title: "Transcription complete!" });
    }, 4000);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    const newT: Transcript = {
      id: `t-${Date.now()}`, title: `Link Import - ${new Date().toLocaleTimeString()}`, duration: "00:00",
      date: new Date().toISOString().split("T")[0], source: "link", status: "processing",
      speakers: 1, language: "Detecting...", words: null, starred: false, tags: ["Link"], summary: null,
    };
    setTranscripts(prev => [newT, ...prev]);
    setUrlInput("");
    toast({ title: "Link imported, transcribing..." });
    setTimeout(() => {
      setTranscripts(prev => prev.map(t => t.id === newT.id ? { ...t, status: "completed", duration: "12:30", language: "English", words: 2500, summary: "Transcription from link complete." } : t));
    }, 4000);
  };

  const handleSaveRecording = () => {
    const newT: Transcript = {
      id: `t-${Date.now()}`, title: `Recording ${new Date().toLocaleTimeString()}`, duration: formatTime(recordingTime),
      date: new Date().toISOString().split("T")[0], source: "recording", status: "processing",
      speakers: 1, language: selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1),
      words: null, starred: false, tags: ["Recording"], summary: null,
    };
    setTranscripts(prev => [newT, ...prev]);
    setShowRecordModal(false);
    setIsRecording(false);
    setRecordingTime(0);
    toast({ title: "Recording saved, transcribing..." });
    setTimeout(() => {
      setTranscripts(prev => prev.map(t => t.id === newT.id ? { ...t, status: "completed", words: 800, summary: "Recording transcription complete." } : t));
    }, 4000);
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Transcribe</h1>
          <p className="text-muted text-sm mt-1">Convert speech to text with high accuracy</p>
        </div>

        {/* Source Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFileUpload(); }}
            className={`group relative p-8 rounded-2xl border-2 border-dashed transition-all ${dragOver ? "border-emerald-400 bg-emerald-500/10" : "border-foreground/[0.15] bg-foreground/[0.02] hover:border-emerald-400/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 flex items-center justify-center mb-5 transition-all">
                <Upload className="w-9 h-9 text-emerald-600 group-hover:scale-110 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Upload File</h3>
              <div className="w-full px-4 py-3 rounded-xl border-2 border-foreground/[0.15] bg-background flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-muted shrink-0" />
                <span className="text-sm text-muted whitespace-nowrap flex-1 text-center">Drag & Drop Your Video Or Audio File</span>
              </div>
              <div className="flex justify-center gap-1.5 items-center">
                {["MP3", "MP4", "WAV", "MOV"].map(f => (
                  <div key={f} className="flex items-center gap-1 px-1.5 py-1 rounded bg-muted/50 border border-foreground/[0.06]">
                    <div className="w-4 h-4 rounded bg-muted flex items-center justify-center">
                      {f === "MP4" || f === "MOV" ? <Video className="w-2.5 h-2.5 text-muted-foreground" /> : <Volume2 className="w-2.5 h-2.5 text-muted-foreground" />}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{f}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-muted/50 border border-foreground/[0.06]">
                  <span className="text-[10px] font-semibold text-muted-foreground">+ more</span>
                </div>
              </div>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="audio/*,video/*,.mp3,.wav,.m4a,.webm,.mp4,.mov" onChange={handleFileUpload} className="hidden" />

          {/* Link */}
          <div className="group relative p-8 rounded-2xl border-2 border-dashed border-foreground/[0.15] bg-foreground/[0.02] hover:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 flex items-center justify-center mb-5 transition-all">
                <Link2 className="w-9 h-9 text-blue-500 group-hover:scale-110 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Insert Link</h3>
              <div className="w-full px-4 py-3 rounded-xl border-2 border-foreground/[0.15] bg-background flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-blue-500 shrink-0" />
                <input
                  type="text" placeholder="Paste A Supported Public Media Link" value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleUrlSubmit(); }}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted text-center focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["YouTube", "TikTok", "Instagram", "Vimeo"].map(p => (
                  <div key={p} className="px-2 py-1 rounded-lg bg-muted/50 text-[10px] font-semibold text-muted-foreground">{p}</div>
                ))}
                <div className="px-2 py-1 rounded-lg bg-muted/50 text-[10px] font-semibold text-muted-foreground">+43</div>
              </div>
            </div>
          </div>

          {/* Record */}
          <button onClick={() => setShowRecordModal(true)} className="group relative p-8 rounded-2xl border-2 border-dashed border-foreground/[0.15] bg-foreground/[0.02] hover:border-rose-400/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-rose-100 dark:bg-rose-900/30 group-hover:bg-rose-200 dark:group-hover:bg-rose-800/40 flex items-center justify-center mb-5 transition-all">
                <Mic className="w-9 h-9 text-rose-500 group-hover:scale-110 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Record Audio</h3>
              <p className="text-sm text-muted mb-4">Click To Start Recording</p>
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wide">Live</span>
                Real-Time Transcription
              </div>
              <div className="mt-3 flex items-center justify-center gap-[2px] h-5">
                {[...Array(28)].map((_, i) => (
                  <div key={i} className="w-[2px] bg-rose-400/60 rounded-full group-hover:bg-rose-500 transition-colors" style={{ height: `${Math.sin((i / 28) * Math.PI * 3) * 6 + 8}px` }} />
                ))}
              </div>
            </div>
          </button>
        </section>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search transcripts..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-foreground/[0.1] bg-background text-sm focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex items-center gap-1 bg-foreground/[0.04] rounded-xl p-1">
            {["all", "starred", "upload", "recording", "link", "processing"].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeFilter === f ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border border-foreground/[0.1] rounded-lg p-0.5">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-foreground/[0.06]" : ""}`}><List size={16} className="text-muted" /></button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-foreground/[0.06]" : ""}`}><Grid size={16} className="text-muted" /></button>
          </div>
        </div>

        {/* Transcript List */}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {filteredTranscripts.map((t, i) => (
              <div key={t.id} onClick={() => handleEdit(t)}
                onMouseEnter={() => setHoveredRowId(t.id)} onMouseLeave={() => setHoveredRowId(null)}
                className="group bg-card border border-foreground/[0.08] rounded-xl p-4 hover:border-foreground/[0.15] hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <span className="w-7 h-7 rounded-full bg-foreground/[0.06] flex items-center justify-center text-sm font-semibold text-muted shrink-0">{i + 1}</span>
                  <div className="w-10 h-10 rounded-xl bg-background border border-foreground/[0.08] flex items-center justify-center shrink-0">
                    {getSourceIcon(t.source)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingTitleId === t.id ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input type="text" value={editingTitleValue} onChange={e => setEditingTitleValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { setTranscripts(prev => prev.map(tr => tr.id === t.id ? { ...tr, title: editingTitleValue } : tr)); setEditingTitleId(null); } if (e.key === "Escape") setEditingTitleId(null); }}
                          className="flex-1 text-sm font-medium text-foreground bg-background border border-foreground/[0.15] rounded px-2 py-0.5 focus:outline-none focus:border-accent" autoFocus />
                        <button onClick={e => { e.stopPropagation(); setTranscripts(prev => prev.map(tr => tr.id === t.id ? { ...tr, title: editingTitleValue } : tr)); setEditingTitleId(null); }} className="p-1 text-accent"><Check className="w-4 h-4" /></button>
                        <button onClick={e => { e.stopPropagation(); setEditingTitleId(null); }} className="p-1 text-muted"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate group-hover:text-accent transition-colors">{t.title}</h3>
                        <button onClick={e => { e.stopPropagation(); setEditingTitleId(t.id); setEditingTitleValue(t.title); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                    {t.summary && <p className="text-xs text-muted line-clamp-1 mt-0.5">{t.summary}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-500" />{t.duration}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-purple-500" />{t.speakers} {t.speakers === 1 ? "Speaker" : "Speakers"}</span>
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-orange-500" />{t.language}</span>
                      {t.words && <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5 text-red-500" />{t.words.toLocaleString()} Words</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {t.tags.map(tag => <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">{tag}</span>)}
                    </div>
                  </div>

                  {t.status === "processing" && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm font-medium animate-pulse shrink-0">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />Processing...
                    </div>
                  )}

                  <div className={`flex items-center gap-2 transition-opacity shrink-0 ${hoveredRowId === t.id ? "opacity-100" : "opacity-0"}`}>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={e => { e.stopPropagation(); toggleStar(t.id); }} className={`p-2 rounded-lg transition-colors ${t.starred ? "text-amber-400" : "text-muted hover:text-amber-400"}`}>
                        <Star className={`w-4 h-4 ${t.starred ? "fill-current" : ""}`} />
                      </button>
                    </TooltipTrigger><TooltipContent>{t.starred ? "Unfavorite" : "Favorite"}</TooltipContent></Tooltip>
                    <button onClick={e => { e.stopPropagation(); toast({ title: "Downloading..." }); }} disabled={t.status === "processing"} className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] text-muted text-xs font-medium hover:bg-foreground/[0.08] transition-colors disabled:opacity-50 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />Download
                    </button>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={e => { e.stopPropagation(); handleDelete(t.id); }} className="p-2 rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                  </div>
                </div>
              </div>
            ))}
            {filteredTranscripts.length === 0 && (
              <div className="text-center py-16 text-muted">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No transcripts found</p>
                <p className="text-sm mt-1">Upload a file, paste a link, or record audio to get started</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTranscripts.map((t, i) => (
              <div key={t.id} onClick={() => handleEdit(t)} className="group bg-card border border-foreground/[0.08] rounded-xl p-5 hover:border-foreground/[0.15] hover:shadow-lg transition-all cursor-pointer flex flex-col min-h-[260px]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-foreground/[0.06] flex items-center justify-center text-sm font-semibold text-muted">{i + 1}</span>
                    <div className="w-10 h-10 rounded-xl bg-background border border-foreground/[0.08] flex items-center justify-center">{getSourceIcon(t.source)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); toggleStar(t.id); }}>
                      <Star className={`w-4 h-4 ${t.starred ? "fill-amber-400 text-amber-400" : "text-muted hover:text-amber-400"}`} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(t.id); }} className="p-1 text-muted hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-medium text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors">{t.title}</h3>
                {t.summary && <p className="text-xs text-muted mb-3 line-clamp-2">{t.summary}</p>}
                <div className="flex flex-wrap gap-2 mb-4">
                  {t.tags.map(tag => <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">{tag}</span>)}
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-muted mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500" />{t.duration}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3 text-purple-500" />{t.speakers}</span>
                    </div>
                    <span>{formatDate(t.date)}</span>
                  </div>
                  {t.status === "processing" ? (
                    <div className="flex items-center justify-center gap-2 text-amber-600 text-sm font-medium animate-pulse py-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); toast({ title: "Downloading..." }); }} className="flex-1 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] text-muted text-xs font-medium hover:bg-foreground/[0.08] transition-colors flex items-center justify-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowRecordModal(false); setIsRecording(false); setRecordingTime(0); }}>
          <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-foreground/[0.08] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><Mic className="w-5 h-5 text-rose-500" />Record Audio</h2>
              <button onClick={() => { setShowRecordModal(false); setIsRecording(false); setRecordingTime(0); }} className="p-2 rounded-lg hover:bg-foreground/[0.05] text-muted"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col items-center py-8">
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all ${isRecording ? "bg-rose-500/20" : "bg-foreground/[0.04]"}`}>
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-rose-500/10 animate-pulse" />
                  </>
                )}
                <button onClick={() => setIsRecording(!isRecording)}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-rose-500 hover:bg-rose-400" : "bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500"}`}>
                  {isRecording ? <StopCircle className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
                </button>
              </div>

              <div className="text-4xl font-mono text-foreground mb-2">{formatTime(recordingTime)}</div>
              <p className="text-sm text-muted">{isRecording ? "Recording..." : "Click To Start Recording"}</p>

              {isRecording && (
                <div className="flex items-center gap-1 mt-6">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-1 bg-rose-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 24 + 8}px`, animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08] mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-medium text-foreground">Real-Time Transcription</h3>
              </div>
              <p className="text-xs text-muted">{isRecording ? "Listening for speech..." : "Start recording to see your words appear"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-muted mb-2">Language</label>
                <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/[0.1] text-sm text-foreground focus:outline-none">
                  {LANGUAGES.map(l => <option key={l} value={l.toLowerCase()}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-2">Audio Quality</label>
                <select className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/[0.1] text-sm text-foreground focus:outline-none">
                  <option>High Quality</option><option>Medium</option><option>Low (smaller file)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => { setRecordingTime(0); }} disabled={recordingTime === 0} className="px-5 py-2.5 rounded-lg border border-foreground/[0.1] text-muted hover:bg-foreground/[0.04] transition-colors disabled:opacity-50 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />Reset
              </button>
              <button onClick={handleSaveRecording} disabled={recordingTime === 0 || isRecording} className="px-5 py-2.5 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-400 transition-colors flex items-center gap-2 disabled:opacity-50">
                <Sparkles className="w-4 h-4" />Save & Transcribe
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default TranscribePage;
