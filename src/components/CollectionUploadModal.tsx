import { useState, useCallback, useRef, useContext } from "react";
import {
  X, Upload, Search, Loader2, Sparkles, Check, Image, Video, Music, FileText,
  ChevronDown, Trash2, Tag, Type, Globe, Users, Palette, GripVertical, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LayoutContext } from "@/components/LayoutContext";

type SourceTab = "upload" | "creations" | "stock" | "community";

interface UploadFile {
  file: File;
  preview: string;
  status: "pending" | "analyzing" | "ready" | "uploading" | "done" | "error";
  title: string;
  tags: string[];
  categories: string[];
  prompt: string;
  selected: boolean;
}

interface Props {
  collectionId: string;
  onClose: () => void;
  onUploaded: (newImages: { id: string; image_url: string; title: string | null; sort_order: number | null }[]) => void;
  existingCount: number;
}

const SOURCE_TABS: { id: SourceTab; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "creations", label: "Creations", icon: Palette },
  { id: "stock", label: "Stock", icon: Globe },
  { id: "community", label: "Community", icon: Users },
];

// Sample stock/community images for browsing
const STOCK_IMAGES = Array.from({ length: 12 }, (_, i) => ({
  id: `stock-${i}`,
  url: `https://images.unsplash.com/photo-${["1618005182384-a83a8bd57fbe", "1558618666-fcd25c85cd64", "1541701494587-cb58502866ab", "1549880338-65ddcdfd017b", "1557682250-33bd709cbe85", "1506905925346-21bda4d32df4", "1518020382113-a7e8fc38eac9", "1547036967-23d11aacaee0", "1579546929518-9e396f3cc809", "1604881991720-f91add269bed", "1501854140801-50d01698950b", "1576091160550-2173dba999ef"][i]}?w=300&h=300&fit=crop&q=75`,
  title: ["Abstract Flow", "Silk Waves", "Liquid Color", "Mountain Haze", "Neon Pulse", "Alpine Vista", "Golden Hour", "Retro Glow", "Cosmic Swirl", "Urban Light", "Forest Mist", "Crystal Bloom"][i],
}));

const CollectionUploadModal = ({ collectionId, onClose, onUploaded, existingCount }: Props) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SourceTab>("upload");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<Set<string>>(new Set());
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const mediaFiles = Array.from(newFiles).filter(f =>
      f.type.startsWith("image/") || f.type.startsWith("video/") || f.type.startsWith("audio/")
    );
    const entries: UploadFile[] = mediaFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
      title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      tags: [],
      categories: [],
      prompt: "",
      selected: true,
    }));
    setFiles(prev => [...prev, ...entries]);

    // Auto-analyze with AI if enabled
    if (autoAnalyze) {
      entries.forEach((entry, idx) => {
        if (entry.file.type.startsWith("image/")) {
          analyzeImage(files.length + idx, entry);
        }
      });
    }
  }, [files.length, autoAnalyze]);

  const analyzeImage = async (index: number, entry: UploadFile) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: "analyzing" } : f));
    try {
      // Convert to base64 for AI analysis
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(entry.file);
      });

      const { data, error } = await supabase.functions.invoke("auto-tag", {
        body: { imageUrl: base64 },
      });
      if (error) throw error;

      setFiles(prev => prev.map((f, i) => i === index ? {
        ...f,
        status: "ready",
        title: data?.title || f.title,
        tags: data?.tags || [],
        categories: data?.categories || [],
      } : f));
    } catch {
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: "ready" } : f));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateFile = (index: number, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const toggleSelectAll = () => {
    const allSelected = files.every(f => f.selected);
    setFiles(prev => prev.map(f => ({ ...f, selected: !allSelected })));
  };

  const handleUploadAll = async () => {
    const selected = files.filter(f => f.selected);
    if (selected.length === 0) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", description: "You need to be logged in to upload.", variant: "destructive" });
        setUploading(false);
        return;
      }

      const newImages: { id: string; image_url: string; title: string | null; sort_order: number | null }[] = [];
      let uploadIdx = 0;

      for (let i = 0; i < files.length; i++) {
        if (!files[i].selected) continue;
        updateFile(i, { status: "uploading" });

        const file = files[i].file;
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${collectionId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage.from("collection-images").upload(path, file);
        if (uploadErr) {
          updateFile(i, { status: "error" });
          continue;
        }

        const { data: urlData } = supabase.storage.from("collection-images").getPublicUrl(path);
        const sortOrder = existingCount + uploadIdx;

        const { data: row } = await supabase.from("collection_images").insert({
          collection_id: collectionId,
          user_id: user.id,
          image_url: urlData.publicUrl,
          title: files[i].title || file.name.replace(/\.[^.]+$/, ""),
          sort_order: sortOrder,
          image_prompt: files[i].prompt || null,
        }).select("id, image_url, title, sort_order").single();

        if (row) {
          newImages.push(row);
          updateFile(i, { status: "done" });
        } else {
          updateFile(i, { status: "error" });
        }
        uploadIdx++;
      }

      if (newImages.length > 0) {
        onUploaded(newImages);
        toast({ title: "Upload complete", description: `${newImages.length} file${newImages.length > 1 ? "s" : ""} added to the collection.` });
        onClose();
      }
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Something went wrong.", variant: "destructive" });
    }
    setUploading(false);
  };

  const toggleStockImage = (id: string) => {
    setSelectedStock(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedCount = files.filter(f => f.selected).length;
  const analyzingCount = files.filter(f => f.status === "analyzing").length;

  return (
    <div className="fixed inset-0 lg:left-[260px] z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[820px] shadow-2xl animate-drop-in max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06] shrink-0">
          <div>
            <h3 className="font-display text-[1.2rem] font-bold">Add Media</h3>
            <p className="text-[0.75rem] text-muted mt-0.5">Upload files or browse from existing sources</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source tabs */}
        <div className="flex border-b border-foreground/[0.06] px-6 shrink-0">
          {SOURCE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-[0.82rem] font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── Upload Tab ── */}
          {activeTab === "upload" && (
            <div className="p-6">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragActive ? "border-accent bg-accent/5" : "border-foreground/[0.12] hover:border-foreground/25 hover:bg-foreground/[0.02]"}`}
              >
                <Upload className="w-8 h-8 text-muted mx-auto mb-3" />
                <p className="text-[0.88rem] font-medium mb-1">Drag & drop files here</p>
                <p className="text-[0.75rem] text-muted mb-3">Images, Videos, Audio — up to 50MB each</p>
                <button className="px-5 py-2 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-medium hover:bg-accent transition-colors">
                  Browse Files
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
              </div>

              {/* AI auto-analyze toggle */}
              <div className="flex items-center justify-between mt-4 px-1">
                <div className="flex items-center gap-2 text-[0.82rem]">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="font-medium">AI Auto-Analyze</span>
                  <span className="text-muted">(title, tags, categories)</span>
                </div>
                <button
                  onClick={() => setAutoAnalyze(v => !v)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${autoAnalyze ? "bg-accent" : "bg-foreground/20"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoAnalyze ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button onClick={toggleSelectAll} className="text-[0.78rem] font-medium text-accent hover:text-accent/80 transition-colors">
                        {files.every(f => f.selected) ? "Deselect All" : "Select All"}
                      </button>
                      <span className="text-[0.75rem] text-muted">{selectedCount} of {files.length} selected</span>
                      {analyzingCount > 0 && (
                        <span className="flex items-center gap-1.5 text-[0.75rem] text-accent">
                          <Loader2 className="w-3 h-3 animate-spin" /> Analyzing {analyzingCount}…
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {files.map((f, i) => (
                      <div key={i} className={`flex gap-3 p-3 rounded-xl border transition-all ${f.selected ? "border-foreground/[0.12] bg-card" : "border-transparent bg-foreground/[0.02] opacity-60"}`}>
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-foreground/[0.06]">
                          <img src={f.preview} alt="" className="w-full h-full object-cover" />
                          {f.status === "analyzing" && (
                            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                          )}
                          {f.status === "done" && (
                            <div className="absolute inset-0 bg-green-600/50 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {f.status === "error" && (
                            <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <input
                            value={f.title}
                            onChange={e => updateFile(i, { title: e.target.value })}
                            className="w-full bg-transparent text-[0.84rem] font-medium outline-none border-b border-transparent focus:border-foreground/20 pb-0.5 mb-1"
                            placeholder="Title…"
                          />
                          {f.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {f.tags.slice(0, 5).map(tag => (
                                <span key={tag} className="text-[0.68rem] bg-foreground/[0.06] text-muted px-2 py-0.5 rounded-full">{tag}</span>
                              ))}
                              {f.tags.length > 5 && <span className="text-[0.68rem] text-muted">+{f.tags.length - 5}</span>}
                            </div>
                          )}
                          {f.categories.length > 0 && (
                            <div className="flex gap-1">
                              {f.categories.map(cat => (
                                <span key={cat} className="text-[0.65rem] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{cat}</span>
                              ))}
                            </div>
                          )}
                          {f.status === "analyzing" && f.tags.length === 0 && (
                            <p className="text-[0.72rem] text-accent flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> AI is analyzing…
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateFile(i, { selected: !f.selected })}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${f.selected ? "bg-accent border-accent" : "border-foreground/20 hover:border-foreground/40"}`}
                          >
                            {f.selected && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <button onClick={() => removeFile(i)} className="text-muted hover:text-destructive transition-colors mt-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {f.status === "pending" && f.file.type.startsWith("image/") && (
                            <button onClick={() => analyzeImage(i, f)} className="text-muted hover:text-accent transition-colors" title="Analyze with AI">
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Creations Tab ── */}
          {activeTab === "creations" && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 bg-card border border-foreground/[0.1] rounded-xl px-4 h-10">
                <Search className="w-4 h-4 text-muted shrink-0" />
                <input placeholder="Search your creations…" className="flex-1 bg-transparent text-[0.84rem] outline-none placeholder:text-muted" />
              </div>
              <div className="text-center py-12 text-muted">
                <Palette className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-[0.88rem] font-medium mb-1">No creations yet</p>
                <p className="text-[0.78rem]">Images you create will appear here for quick adding.</p>
              </div>
            </div>
          )}

          {/* ── Stock Tab ── */}
          {activeTab === "stock" && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 bg-card border border-foreground/[0.1] rounded-xl px-4 h-10">
                <Search className="w-4 h-4 text-muted shrink-0" />
                <input
                  value={stockSearch}
                  onChange={e => setStockSearch(e.target.value)}
                  placeholder="Search stock images…"
                  className="flex-1 bg-transparent text-[0.84rem] outline-none placeholder:text-muted"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {STOCK_IMAGES.map(img => {
                  const isSelected = selectedStock.has(img.id);
                  return (
                    <button
                      key={img.id}
                      onClick={() => toggleStockImage(img.id)}
                      className={`relative rounded-xl overflow-hidden aspect-square group border-2 transition-all ${isSelected ? "border-accent" : "border-transparent hover:border-foreground/20"}`}
                    >
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute bottom-1.5 left-2 text-[0.7rem] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">{img.title}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedStock.size > 0 && (
                <p className="text-[0.78rem] text-accent font-medium mt-3 text-center">{selectedStock.size} image{selectedStock.size > 1 ? "s" : ""} selected</p>
              )}
            </div>
          )}

          {/* ── Community Tab ── */}
          {activeTab === "community" && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 bg-card border border-foreground/[0.1] rounded-xl px-4 h-10">
                <Search className="w-4 h-4 text-muted shrink-0" />
                <input placeholder="Search community uploads…" className="flex-1 bg-transparent text-[0.84rem] outline-none placeholder:text-muted" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {STOCK_IMAGES.slice(0, 8).map(img => {
                  const isSelected = selectedStock.has(`c-${img.id}`);
                  return (
                    <button
                      key={`c-${img.id}`}
                      onClick={() => toggleStockImage(`c-${img.id}`)}
                      className={`relative rounded-xl overflow-hidden aspect-square group border-2 transition-all ${isSelected ? "border-accent" : "border-transparent hover:border-foreground/20"}`}
                    >
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute bottom-1.5 left-2 text-[0.7rem] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">{img.title}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-foreground/[0.06] flex items-center justify-between shrink-0">
          <div className="text-[0.78rem] text-muted">
            {activeTab === "upload" && files.length > 0 && `${selectedCount} file${selectedCount !== 1 ? "s" : ""} ready`}
            {(activeTab === "stock" || activeTab === "community") && selectedStock.size > 0 && `${selectedStock.size} selected from library`}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleUploadAll}
              disabled={uploading || (activeTab === "upload" ? selectedCount === 0 : selectedStock.size === 0)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Add to Collection</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionUploadModal;
