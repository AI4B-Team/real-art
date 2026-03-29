import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEbooks, type Ebook } from "@/contexts/EbookContext";
import {
  Book, Plus, Upload, Search, Download, Edit, Trash2,
  Clock, FileText, Layers, X, Check, Sparkles, Filter,
  Grid, List, Calendar, Copy, MoreVertical, Palette,
  Mic, Lightbulb, Cpu, Link2, Rss,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PageShell from "@/components/PageShell";
import { toast } from "@/hooks/use-toast";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700 border-emerald-200",
    draft: "bg-muted text-muted-foreground border-border",
    generating: "bg-amber-100 text-amber-700 border-amber-200",
  };
  const labels: Record<string, string> = { published: "Published", draft: "Draft", generating: "Generating..." };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]} inline-flex items-center`}>
      {status === "generating" && <span className="w-1.5 h-1.5 mr-1.5 bg-amber-500 rounded-full animate-pulse" />}
      {labels[status]}
    </span>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
    <div className="h-full rounded-full transition-all duration-500 bg-accent" style={{ width: `${Math.min(progress, 100)}%` }} />
  </div>
);

const EbookCreatorPage = () => {
  const navigate = useNavigate();
  const { ebooks, deleteEbook: contextDeleteEbook, addEbook } = useEbooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<Ebook | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredEbooks = ebooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || book.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const duplicateEbook = (book: Ebook) => {
    addEbook({ ...book, id: Date.now(), title: `${book.title} (Copy)`, status: "draft", progress: 0, createdAt: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString().split("T")[0] });
    setShowDropdown(null);
    toast({ title: "eBook duplicated" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Ebook Creator</h1>
            <p className="text-muted text-sm mt-1">AI ghostwriting for ebooks, audiobooks & presentations</p>
          </div>
          <button onClick={() => navigate("/ebook-creator/new")} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors">
            <Plus size={16} />New eBook
          </button>
        </div>

        {/* Source Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <button onClick={() => navigate("/ebook-creator/new?source=ai-generate")} className="group relative pt-8 px-8 pb-2 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 transition-all min-h-[280px] flex flex-col">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mb-5 transition-all">
                <Sparkles className="w-9 h-9 text-accent group-hover:scale-110 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Start With AI</h3>
              <p className="text-sm text-muted mb-4">Create From Scratch With AI</p>
              <div className="flex items-center gap-2 text-xs text-muted">
                <div className="flex flex-col items-center"><Lightbulb className="w-4 h-4 text-accent" /><span>Idea</span></div>
                <span className="text-muted/40">→</span>
                <div className="flex flex-col items-center"><Cpu className="w-4 h-4 text-accent" /><span>Generate</span></div>
                <span className="text-muted/40">→</span>
                <div className="flex flex-col items-center"><Palette className="w-4 h-4 text-accent" /><span>Design</span></div>
                <span className="text-muted/40">→</span>
                <div className="flex flex-col items-center"><Book className="w-4 h-4 text-accent" /><span>eBook</span></div>
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="px-2.5 py-1 bg-accent/20 text-accent text-xs rounded-full font-medium">Recommended</span>
              </div>
            </div>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="group relative p-8 rounded-2xl border-2 border-dashed border-foreground/[0.15] bg-foreground/[0.02] hover:border-amber-400/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all min-h-[280px] flex flex-col">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 flex items-center justify-center mb-5 transition-all">
                <Upload className="w-9 h-9 text-amber-600 group-hover:scale-110 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Upload File</h3>
              <div className="w-full px-4 py-3 rounded-xl border-2 border-foreground/[0.15] bg-background flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-muted shrink-0" />
                <span className="text-sm text-muted whitespace-nowrap flex-1 text-center">Drag & Drop Your File</span>
              </div>
              <div className="flex justify-center gap-1.5 items-center flex-wrap">
                {[
                  { label: "PDF", color: "#E53935" },
                  { label: "DOCX", color: "#1565C0" },
                  { label: "TXT", color: "#546E7A" },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-foreground/[0.06]">
                    <div className="w-4 h-5 rounded-[2px] flex items-center justify-center" style={{ backgroundColor: f.color }}>
                      <span className="text-[5px] font-black text-white leading-none">{f.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{f.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-foreground/[0.06]">
                  <span className="text-[10px] font-semibold text-muted-foreground">+ more</span>
                </div>
              </div>
            </div>
          </button>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.txt,.doc,.epub" onChange={() => { navigate("/ebook-creator/new?source=upload"); }} />

          <button onClick={() => navigate("/ebook-creator/new?source=url")} className="group relative p-8 rounded-2xl border-2 border-dashed border-foreground/[0.15] bg-foreground/[0.02] hover:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all min-h-[280px] flex flex-col">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 flex items-center justify-center mb-5 transition-all">
                <Link2 className="w-9 h-9 text-blue-500 group-hover:scale-110 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Insert Link</h3>
              <div className="w-full px-4 py-3 rounded-xl border-2 border-foreground/[0.15] bg-background flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-sm text-muted whitespace-nowrap flex-1 text-center">Paste Website Link</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {/* RSS / Blog */}
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#F57C00"><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56z"/><path d="M4 10.1v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/></svg>
                </div>
                {/* YouTube */}
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-xs font-medium text-muted-foreground">+45</div>
              </div>
            </div>
          </button>

          <button onClick={() => navigate("/ebook-creator/new?source=voice")} className="group relative p-8 rounded-2xl border-2 border-dashed border-foreground/[0.15] bg-foreground/[0.02] hover:border-rose-400/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all min-h-[280px] flex flex-col">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-20 h-20 rounded-2xl bg-rose-100 dark:bg-rose-900/30 group-hover:bg-rose-200 dark:group-hover:bg-rose-800/40 flex items-center justify-center mb-5 transition-all">
                <Mic className="w-9 h-9 text-rose-500 group-hover:scale-110 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Record Audio</h3>
              <p className="text-sm text-muted">Click To Start Recording</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wide">Live</span>
                Real-Time Transcription
              </div>
              <div className="mt-3 flex items-center justify-center gap-[2px] h-5">
                {[...Array(28)].map((_, i) => (
                  <div key={i} className="w-[2px] bg-rose-400/60 rounded-full group-hover:bg-rose-500 transition-colors group-hover:animate-pulse" style={{ height: `${Math.sin((i / 28) * Math.PI * 3) * 6 + 8}px`, animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>
            </div>
          </button>
        </div>

        {/* Search + Filter bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search ebooks..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-foreground/[0.1] bg-background text-sm focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex items-center gap-1 bg-foreground/[0.04] rounded-xl p-1">
            {["all", "published", "draft", "generating"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border border-foreground/[0.1] rounded-lg p-0.5">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-foreground/[0.06]" : ""}`}><List size={16} className="text-muted" /></button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-foreground/[0.06]" : ""}`}><Grid size={16} className="text-muted" /></button>
          </div>
        </div>

        {/* Book List */}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {filteredEbooks.map(book => (
              <div key={book.id} className="group bg-card border border-foreground/[0.08] rounded-xl p-4 hover:border-foreground/[0.15] hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/ebook-creator/new?tab=design", { state: { book } })}>
                <div className="flex items-start gap-4">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-16 h-20 rounded-lg object-cover shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-16 h-20 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: book.coverColor + "20", borderLeft: `4px solid ${book.coverColor}` }}>
                      <Book className="w-8 h-8" style={{ color: book.coverColor }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">{book.title}</h3>
                        <p className="text-sm text-muted line-clamp-1 mt-0.5">{book.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                          <Tooltip><TooltipTrigger asChild>
                            <button onClick={e => { e.stopPropagation(); navigate("/ebook-creator/new?tab=design", { state: { book } }); }} className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                          </TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <button onClick={e => { e.stopPropagation(); }} className="p-2 text-muted hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"><Download className="w-5 h-5" /></button>
                          </TooltipTrigger><TooltipContent>Export</TooltipContent></Tooltip>
                          <div className="relative">
                            <button onClick={e => { e.stopPropagation(); setShowDropdown(showDropdown === book.id ? null : book.id); }} className="p-2 text-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"><MoreVertical className="w-5 h-5" /></button>
                            {showDropdown === book.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-foreground/[0.08] rounded-xl shadow-lg py-1 z-10">
                                <button onClick={e => { e.stopPropagation(); duplicateEbook(book); }} className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"><Copy className="w-4 h-4" />Duplicate</button>
                                <button onClick={e => { e.stopPropagation(); setDeleteConfirmBook(book); setShowDropdown(null); }} className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={book.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDate(book.updatedAt)}</span>
                      <span className="flex items-center gap-1"><Layers className="w-4 h-4" />{book.chapters} chapters</span>
                      <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{(book.words / 1000).toFixed(1)}k words</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {book.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full font-medium">{tag}</span>)}
                    </div>
                  </div>
                </div>
                {book.status !== "published" && (
                  <div className="mt-3 pl-20">
                    <div className="flex items-center justify-between text-xs text-muted mb-1"><span>Progress</span><span>{Math.round(book.progress)}%</span></div>
                    <ProgressBar progress={book.progress} />
                  </div>
                )}
              </div>
            ))}
            {filteredEbooks.length === 0 && (
              <div className="text-center py-16 text-muted">
                <Book className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No ebooks found</p>
                <p className="text-sm mt-1">Create your first ebook to get started</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEbooks.map(book => (
              <div key={book.id} className="group bg-card border border-foreground/[0.08] rounded-xl overflow-hidden hover:border-foreground/[0.15] hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/ebook-creator/new?tab=design", { state: { book } })}>
                <div className="h-40 flex items-center justify-center relative" style={{ backgroundColor: book.coverColor + "15" }}>
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-24 h-32 rounded-lg shadow-xl object-cover" />
                  ) : (
                    <div className="w-24 h-32 rounded-lg shadow-xl flex items-center justify-center" style={{ backgroundColor: book.coverColor }}>
                      <Book className="w-12 h-12 text-white/80" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3"><StatusBadge status={book.status} /></div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">{book.title}</h3>
                  <p className="text-sm text-muted line-clamp-2 mt-1">{book.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted"><span>{book.chapters} ch</span><span>•</span><span>{(book.words / 1000).toFixed(1)}k words</span></div>
                  {book.status !== "published" && <div className="mt-3"><ProgressBar progress={book.progress} /></div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation dialog */}
        {deleteConfirmBook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setDeleteConfirmBook(null)}>
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-foreground/[0.08]" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold text-lg text-foreground">Delete eBook?</h3>
              <p className="text-sm text-muted mt-2">Are you sure you want to delete "{deleteConfirmBook.title}"? This action cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteConfirmBook(null)} className="flex-1 px-4 py-2 rounded-lg border border-foreground/[0.1] text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => { contextDeleteEbook(deleteConfirmBook.id); setDeleteConfirmBook(null); toast({ title: "eBook deleted" }); }} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default EbookCreatorPage;