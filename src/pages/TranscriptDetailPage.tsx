import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Play, Pause, FileText, Clock, Users, Globe,
  Share2, ChevronDown, Copy, Sparkles, Volume2, Languages,
  MessageSquare, Wand2, Download, Pencil, Check, X, Search,
  Star, Undo2, Redo2, Eye, Loader2, FileDown, RefreshCw,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PageShell from "@/components/PageShell";
import { toast } from "@/hooks/use-toast";

/* ─── Types ─── */
interface TranscriptLine {
  speaker: string;
  time: string;
  endTime?: string;
  text: string;
}

const SPEAKER_COLORS = [
  { bg: "bg-emerald-500/20", text: "text-emerald-600", dot: "bg-emerald-400" },
  { bg: "bg-blue-500/20", text: "text-blue-600", dot: "bg-blue-400" },
  { bg: "bg-purple-500/20", text: "text-purple-600", dot: "bg-purple-400" },
  { bg: "bg-orange-500/20", text: "text-orange-600", dot: "bg-orange-400" },
];

const TRANSLATE_LANGUAGES = [
  "Spanish", "French", "German", "Portuguese", "Italian", "Chinese",
  "Japanese", "Korean", "Arabic", "Hindi", "Russian", "Dutch",
];

/* ─── Mock content generator ─── */
const generateMockContent = (title: string, speakers: number): TranscriptLine[] => {
  const lines: { text: string; speaker: number }[] = [
    { text: "Welcome everyone to today's session. We have a lot to cover, so let's get started right away.", speaker: 0 },
    { text: "Thanks for organizing this. I've prepared the materials we discussed last week and I'm ready to present.", speaker: 1 },
    { text: "Perfect. Before we dive in, let's do a quick round of updates from each team to make sure we're aligned.", speaker: 0 },
    { text: "The engineering team has completed the core features for the new release. We're now in the testing phase and things are looking good.", speaker: 1 % speakers },
    { text: "Marketing has finalized the launch campaign. We're targeting early next month for the public announcement.", speaker: 2 % speakers },
    { text: "Great progress across the board. The numbers look very promising - we're projecting significant growth in user engagement.", speaker: 0 },
    { text: "That's excellent news. Let's discuss the resource allocation for the next quarter and how we can best support the launch.", speaker: 1 % speakers },
    { text: "I think we need additional developers to help with the final testing phase. The timeline is tight but achievable.", speaker: 2 % speakers },
    { text: "We can actually share some budget if engineering needs additional resources. Our campaign prep is mostly complete.", speaker: 3 % speakers },
    { text: "That's a great point. I'll run the numbers and see how we can reallocate funds effectively.", speaker: 0 },
    { text: "Let's also talk about the customer feedback we've been collecting. There are some interesting patterns emerging from the data.", speaker: 1 % speakers },
    { text: "Yes, users are really excited about the new features. The beta testers gave us overwhelmingly positive feedback.", speaker: 2 % speakers },
    { text: "We should highlight those testimonials in our launch materials. Real user stories always resonate well with our audience.", speaker: 3 % speakers },
    { text: "I can compile a comprehensive report on the feedback trends. We have data from over 500 beta users now.", speaker: 1 % speakers },
    { text: "Perfect. Let's reconvene next week with all action items completed. Great progress everyone, keep up the momentum.", speaker: 0 },
  ];

  const totalDuration = 42 * 60 + 15;
  const totalWords = lines.reduce((acc, l) => acc + l.text.split(" ").length, 0);
  let wordCursor = 0;

  return lines.map((line, i) => {
    const wordsInLine = line.text.split(" ").length;
    const startSeconds = Math.floor((wordCursor / totalWords) * totalDuration);
    wordCursor += wordsInLine;
    const endSeconds = Math.floor((wordCursor / totalWords) * totalDuration);
    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    return {
      speaker: `Speaker ${line.speaker + 1}`,
      time: fmt(startSeconds),
      endTime: fmt(endSeconds),
      text: line.text,
    };
  });
};

/* ─── Page ─── */
const TranscriptDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transcript = (location.state as any)?.transcript;

  const title = transcript?.title || "Untitled Transcript";
  const duration = transcript?.duration || "00:00";
  const speakers = transcript?.speakers || 2;
  const language = transcript?.language || "English";

  const [content, setContent] = useState<TranscriptLine[]>(() => generateMockContent(title, speakers));
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "chat">("transcript");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedLang, setTranslatedLang] = useState<string | null>(null);
  const [showTranslatePopover, setShowTranslatePopover] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const speakerColors = (speaker: string) => {
    const num = parseInt(speaker.replace("Speaker ", "")) - 1;
    return SPEAKER_COLORS[num % SPEAKER_COLORS.length];
  };

  const handleStartEdit = (index: number) => {
    setEditingLine(index);
    setEditingText(content[index].text);
  };

  const handleSaveEdit = (index: number) => {
    setContent(prev => prev.map((l, i) => i === index ? { ...l, text: editingText } : l));
    setEditingLine(null);
    toast({ title: "Segment updated" });
  };

  const handleTranslate = (lang: string) => {
    setIsTranslating(true);
    setShowTranslatePopover(false);
    setTimeout(() => {
      setTranslatedLang(lang);
      setIsTranslating(false);
      toast({ title: `Translated to ${lang}` });
    }, 2000);
  };

  const handleGenerateSummary = () => {
    setIsGeneratingSummary(true);
    setActiveTab("summary");
    setTimeout(() => {
      setAiSummary(`## Meeting Summary\n\n**Duration:** ${duration} | **Speakers:** ${speakers}\n\n### Key Discussion Points\n\n1. **Project Progress:** The engineering team completed core features and entered the testing phase. Marketing finalized the launch campaign targeting next month.\n\n2. **Resource Allocation:** Discussion about reallocating budget from marketing to engineering for additional developers needed during the testing phase.\n\n3. **Customer Feedback:** Beta testing with 500+ users yielded overwhelmingly positive feedback. Team plans to compile a comprehensive feedback trends report.\n\n4. **Action Items:**\n   - Run budget reallocation numbers\n   - Compile customer feedback report\n   - Highlight user testimonials for launch materials\n   - Reconvene next week with completed action items\n\n### Key Decisions\n- Marketing will share budget with engineering for final testing support\n- Launch announcement targeting early next month\n- User testimonials to be featured in launch materials`);
      setIsGeneratingSummary(false);
    }, 3000);
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Based on the transcript, here's what I found regarding "${userMsg}":\n\nThe discussion covered several key points related to your question. The team discussed project progress, resource allocation, and customer feedback. Specifically, the engineering team has completed core features and is in testing, while marketing has finalized the launch campaign. There was agreement to reallocate some budget from marketing to support additional developers.` }]);
      setIsChatLoading(false);
    }, 2000);
  };

  const filteredContent = searchQuery
    ? content.filter(l => l.text.toLowerCase().includes(searchQuery.toLowerCase()) || l.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
    : content;

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/transcribe")} className="p-2 rounded-lg hover:bg-foreground/[0.05] transition-colors"><ArrowLeft size={20} className="text-foreground" /></button>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">{title}</h1>
              <div className="flex items-center gap-3 text-xs text-muted mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-500" />{duration}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-purple-500" />{speakers} Speakers</span>
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-orange-500" />{translatedLang || language}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-lg hover:bg-foreground/[0.05] text-muted"><Search size={18} /></button>

            <Popover open={showTranslatePopover} onOpenChange={setShowTranslatePopover}>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Languages size={14} />{isTranslating ? "Translating..." : "Translate"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1.5" align="end">
                {TRANSLATE_LANGUAGES.map(l => (
                  <button key={l} onClick={() => handleTranslate(l)} className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-foreground hover:bg-foreground/[0.04] transition-colors">{l}</button>
                ))}
              </PopoverContent>
            </Popover>

            <button onClick={() => toast({ title: "Exporting..." })} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
              <FileDown size={14} />Export
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
              <Share2 size={14} />Share
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="mb-4 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search in transcript..." autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-foreground/[0.1] bg-background text-sm focus:outline-none focus:border-accent transition-colors" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-foreground/[0.03] rounded-xl p-1 w-fit">
          {([
            { id: "transcript", label: "Transcript", icon: FileText },
            { id: "summary", label: "AI Summary", icon: Sparkles },
            { id: "chat", label: "Ask AI", icon: MessageSquare },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "summary" && !aiSummary && !isGeneratingSummary) handleGenerateSummary();
            }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Transcript Tab */}
            {activeTab === "transcript" && (
              <div className="space-y-1">
                {filteredContent.map((line, i) => {
                  const colors = speakerColors(line.speaker);
                  const isEditing = editingLine === i;
                  return (
                    <div key={i} className="group flex gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors">
                      <div className="shrink-0 pt-1">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${colors.text}`}>{line.speaker}</span>
                          <button className="text-[10px] text-muted hover:text-accent transition-colors font-mono">{line.time}</button>
                          {line.endTime && <span className="text-[10px] text-muted/50">→ {line.endTime}</span>}
                        </div>
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <textarea value={editingText} onChange={e => setEditingText(e.target.value)} className="w-full text-sm text-foreground bg-background border border-foreground/[0.15] rounded-lg px-3 py-2 focus:outline-none focus:border-accent resize-none" rows={3} />
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveEdit(i)} className="px-3 py-1 rounded-lg bg-accent text-white text-xs font-medium flex items-center gap-1"><Check size={12} />Save</button>
                              <button onClick={() => setEditingLine(null)} className="px-3 py-1 rounded-lg bg-foreground/[0.04] text-muted text-xs font-medium flex items-center gap-1"><X size={12} />Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground/90 leading-relaxed">{line.text}</p>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Tooltip><TooltipTrigger asChild>
                            <button onClick={() => handleStartEdit(i)} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/[0.05] transition-colors"><Pencil size={13} /></button>
                          </TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <button onClick={() => { navigator.clipboard.writeText(line.text); toast({ title: "Copied!" }); }} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/[0.05] transition-colors"><Copy size={13} /></button>
                          </TooltipTrigger><TooltipContent>Copy</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/[0.05] transition-colors"><Wand2 size={13} /></button>
                          </TooltipTrigger><TooltipContent>AI Rewrite</TooltipContent></Tooltip>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="bg-card border border-foreground/[0.08] rounded-2xl p-6">
                {isGeneratingSummary ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                    <p className="text-sm text-muted">Generating AI summary...</p>
                  </div>
                ) : aiSummary ? (
                  <div className="prose prose-sm max-w-none text-foreground/90">
                    {aiSummary.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-foreground mt-0 mb-3">{line.replace("## ", "")}</h2>;
                      if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-2">{line.replace("### ", "")}</h3>;
                      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-foreground">{line.replace(/\*\*/g, "")}</p>;
                      if (line.startsWith("- ")) return <li key={i} className="text-sm text-foreground/80 ml-4">{line.replace("- ", "")}</li>;
                      if (line.trim() === "") return <br key={i} />;
                      return <p key={i} className="text-sm text-foreground/80 mb-2">{line}</p>;
                    })}
                    <div className="flex gap-2 mt-6 pt-4 border-t border-foreground/[0.06]">
                      <button onClick={() => { navigator.clipboard.writeText(aiSummary); toast({ title: "Summary copied!" }); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors flex items-center gap-1.5"><Copy size={13} />Copy</button>
                      <button onClick={handleGenerateSummary} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] text-muted hover:text-foreground transition-colors flex items-center gap-1.5"><RefreshCw size={13} />Regenerate</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Sparkles className="w-8 h-8 text-muted/30 mb-4" />
                    <p className="text-sm text-muted mb-4">Generate an AI summary of this transcript</p>
                    <button onClick={handleGenerateSummary} className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold flex items-center gap-2"><Sparkles size={16} />Generate Summary</button>
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="bg-card border border-foreground/[0.08] rounded-2xl flex flex-col" style={{ height: "calc(100vh - 300px)" }}>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-10 h-10 text-muted/20 mb-4" />
                      <p className="text-sm font-medium text-foreground mb-1">Ask anything about this transcript</p>
                      <p className="text-xs text-muted">AI will answer based on the transcript content</p>
                      <div className="flex flex-wrap gap-2 mt-6 max-w-md justify-center">
                        {["What were the main decisions?", "Summarize action items", "Who spoke the most?", "What topics were discussed?"].map(q => (
                          <button key={q} onClick={() => { setChatInput(q); }} className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] text-xs text-muted hover:text-foreground hover:border-foreground/[0.15] transition-colors">{q}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-accent text-white rounded-br-md" : "bg-foreground/[0.04] text-foreground rounded-bl-md"}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-foreground/[0.04] px-4 py-3 rounded-2xl rounded-bl-md">
                        <Loader2 className="w-4 h-4 animate-spin text-muted" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-foreground/[0.06]">
                  <div className="flex gap-2">
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleChatSubmit(); }} placeholder="Ask about this transcript..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-foreground/[0.1] bg-background text-sm focus:outline-none focus:border-accent transition-colors" />
                    <button onClick={handleChatSubmit} disabled={!chatInput.trim() || isChatLoading} className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50">Send</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - Speakers */}
          <div className="w-64 shrink-0 hidden lg:block">
            <div className="bg-card border border-foreground/[0.08] rounded-2xl p-4 sticky top-24">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Speakers</h3>
              <div className="space-y-3">
                {Array.from({ length: speakers }, (_, i) => {
                  const colors = SPEAKER_COLORS[i % SPEAKER_COLORS.length];
                  const speakerLines = content.filter(l => l.speaker === `Speaker ${i + 1}`);
                  const wordCount = speakerLines.reduce((acc, l) => acc + l.text.split(" ").length, 0);
                  const totalWords = content.reduce((acc, l) => acc + l.text.split(" ").length, 0);
                  const pct = Math.round((wordCount / totalWords) * 100);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${colors.text}`}>Speaker {i + 1}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${colors.dot}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-foreground/[0.06]">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Quick Stats</h3>
                <div className="space-y-2 text-xs text-muted">
                  <div className="flex justify-between"><span>Duration</span><span className="text-foreground font-medium">{duration}</span></div>
                  <div className="flex justify-between"><span>Speakers</span><span className="text-foreground font-medium">{speakers}</span></div>
                  <div className="flex justify-between"><span>Language</span><span className="text-foreground font-medium">{translatedLang || language}</span></div>
                  <div className="flex justify-between"><span>Words</span><span className="text-foreground font-medium">{content.reduce((acc, l) => acc + l.text.split(" ").length, 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Segments</span><span className="text-foreground font-medium">{content.length}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default TranscriptDetailPage;
