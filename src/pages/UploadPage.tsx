import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Upload, Image, X, Plus,
  Check, Info, Tag, Globe, Lock, ChevronDown, Sparkles, Video, Loader2, Search
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getCollections, addCollection, type Collection } from "@/lib/collectionStore";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Abstract", "Portraits", "Nature", "Architecture", "Fantasy",
  "3D Art", "Fashion", "Sci-Fi", "Avatars", "Backgrounds",
  "Luxury", "Cyberpunk", "Minimal", "Food", "Travel",
];

const steps = ["Upload", "Details", "Publish"];

interface ImagePrompts {
  image_prompt: string;
  video_prompt: string;
  loading: boolean;
}

const UploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [autoTagsLoading, setAutoTagsLoading] = useState(false);
  const [autoTagsDone, setAutoTagsDone] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tool, setTool] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [published, setPublished] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Collection targeting
  const [collections, setCollections] = useState<Collection[]>(() => getCollections());
  const [selectedCollection, setSelectedCollection] = useState<string>("none");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [showNewCol, setShowNewCol] = useState(false);

  // Per-image AI prompts
  const [imagePrompts, setImagePrompts] = useState<Record<number, ImagePrompts>>({});

  const filteredCollections = collections.filter(c =>
    !collectionSearch || c.name.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  const selectedCollectionName =
    selectedCollection === "none" ? "" :
    selectedCollection === "new" ? newCollectionName :
    collections.find(c => c.id === selectedCollection)?.name || "";

  const generatePromptsForImage = async (dataUrl: string, index: number) => {
    setImagePrompts(prev => ({
      ...prev,
      [index]: { image_prompt: "", video_prompt: "", loading: true },
    }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-prompts", {
        body: { imageUrl: dataUrl },
      });
      if (error) throw error;
      setImagePrompts(prev => ({
        ...prev,
        [index]: {
          image_prompt: data.image_prompt || "",
          video_prompt: data.video_prompt || "",
          loading: false,
        },
      }));
    } catch (err) {
      console.error("Prompt generation failed:", err);
      setImagePrompts(prev => ({
        ...prev,
        [index]: { image_prompt: "", video_prompt: "", loading: false },
      }));
    }
  };

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming).slice(0, 10);
    const startIdx = files.length;
    setFiles(prev => [...prev, ...arr].slice(0, 10));
    arr.forEach((f, i) => {
      const r = new FileReader();
      r.onload = e => {
        const dataUrl = e.target?.result as string;
        setPreviews(prev => [...prev, dataUrl].slice(0, 10));
        generatePromptsForImage(dataUrl, startIdx + i);
      };
      r.readAsDataURL(f);
    });
  };

  const removeFile = (i: number) => {
    setFiles(f => f.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
    // Reindex prompts
    setImagePrompts(prev => {
      const next: Record<number, ImagePrompts> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const k = parseInt(key);
        if (k < i) next[k] = val;
        else if (k > i) next[k - 1] = val;
      });
      return next;
    });
  };

  const toggleCat = (cat: string) => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat].slice(0, 5));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      setTags(prev => [...new Set([...prev, tagInput.trim().toLowerCase()])].slice(0, 15));
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const canProceed = [
    files.length > 0,
    title.trim().length > 2 && selectedCats.length > 0,
    true,
  ];

  const runAutoTag = async () => {
    if (autoTagsDone || previews.length === 0) return;
    setAutoTagsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-tag", {
        body: { imageUrl: previews[0] },
      });
      if (error) throw error;
      if (data.tags?.length) setTags(data.tags.slice(0, 12));
      if (data.title && !title) setTitle(data.title);
      if (data.categories?.length) {
        const validCats = categories;
        const matched = data.categories.filter((c: string) => validCats.includes(c)).slice(0, 3);
        if (matched.length) setSelectedCats(matched);
      }
      setAutoTagsDone(true);
    } catch (e) {
      console.error("Auto-tag failed:", e);
    } finally {
      setAutoTagsLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please log in", description: "You need to be logged in to upload art.", variant: "destructive" });
        setPublishing(false);
        return;
      }

      // Determine collection ID
      let collectionId: string | null = null;

      if (selectedCollection === "new" && newCollectionName.trim()) {
        const { data: col, error: colErr } = await supabase.from("collections").insert({
          name: newCollectionName.trim(),
          user_id: user.id,
          is_public: visibility === "public",
          description: title,
        }).select("id").single();
        if (colErr) throw colErr;
        collectionId = col.id;
      } else if (selectedCollection !== "none" && selectedCollection !== "new" && selectedCollection) {
        collectionId = selectedCollection;
      }

      // If no collection chosen, create a default one for this upload
      if (!collectionId) {
        const { data: col, error: colErr } = await supabase.from("collections").insert({
          name: title || `Upload ${new Date().toLocaleDateString()}`,
          user_id: user.id,
          is_public: visibility === "public",
        }).select("id").single();
        if (colErr) throw colErr;
        collectionId = col.id;
      }

      // Upload each file to storage and insert record
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${collectionId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("collection-images")
          .upload(path, file, { contentType: file.type });
        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from("collection-images")
          .getPublicUrl(path);

        const prompts = imagePrompts[i];
        const { error: insertErr } = await supabase.from("collection_images").insert({
          collection_id: collectionId,
          user_id: user.id,
          image_url: publicUrl,
          title: title || file.name,
          sort_order: i,
          image_prompt: prompts?.image_prompt || null,
          video_prompt: prompts?.video_prompt || null,
        });
        if (insertErr) throw insertErr;
      }

      toast({ title: "Published!", description: `${files.length} image${files.length > 1 ? "s" : ""} uploaded successfully.` });
      navigate(`/collections/${collectionId}`);
    } catch (err: any) {
      console.error("Publish failed:", err);
      toast({ title: "Upload failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };


  if (published) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[80vh] px-6">
          <div className="text-center max-w-[440px]">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-9 h-9 text-accent" />
            </div>
            <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-3">Published!</h1>
            <p className="text-muted text-[0.88rem] leading-[1.7] mb-8">
              Your {files.length} image{files.length > 1 ? "s are" : " is"} live on REAL ART. Your affiliate link is already attached to every image — start sharing.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/explore">
                <button className="w-full bg-foreground text-primary-foreground py-3 rounded-lg text-[0.86rem] font-semibold hover:bg-accent transition-colors">
                  View on Explore
                </button>
              </Link>
              <button
                onClick={() => { setPublished(false); setStep(0); setFiles([]); setPreviews([]); setTitle(""); setSelectedCats([]); setTags([]); setPrompt(""); }}
                className="w-full border border-foreground/[0.14] py-3 rounded-lg text-[0.86rem] font-medium hover:border-foreground/30 transition-colors"
              >
                Upload More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="px-6 md:px-12 py-8 max-w-[860px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-8">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">Upload Art</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.75rem] font-bold transition-colors ${i <= step ? "bg-accent text-white" : i === step ? "bg-foreground text-primary-foreground" : "bg-foreground/[0.08] text-muted"}`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-[0.82rem] font-medium ${i <= step ? "text-foreground" : "text-muted"}`}>{s}</span>
                </div>
                {i < steps.length - 1 && <div className="w-12 h-px bg-foreground/[0.1]" />}
              </div>
            ))}
          </div>

          {/* STEP 0: Upload */}
          {step === 0 && (
            <div>
              <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2">Upload your art</h1>
              <p className="text-muted text-[0.88rem] mb-8">Up to 10 images at once. JPG, PNG, WebP up to 20MB each.</p>

              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-16 px-8 cursor-pointer transition-colors mb-6 ${dragging ? "border-accent bg-accent/[0.04]" : "border-foreground/[0.14] hover:border-foreground/30 bg-card"}`}
              >
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
                <Upload className={`w-7 h-7 mb-3 ${dragging ? "text-accent" : "text-muted"}`} />
                <div className="font-semibold text-[0.92rem] mb-1">{dragging ? "Drop to upload" : "Drag & drop your images here"}</div>
                <div className="text-[0.78rem] text-muted">or click to browse</div>
              </div>

              <div className="flex items-center gap-2 text-[0.75rem] text-muted mb-6">
                <Info className="w-3.5 h-3.5" /> JPG, PNG, WebP · Max 20MB per file · Up to 10 images
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                  {previews.map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 10 && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-foreground/[0.12] flex items-center justify-center hover:border-foreground/30 transition-colors text-muted hover:text-foreground"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* AI-Generated Prompts Per Image */}
              {previews.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <h3 className="font-display text-[1.1rem] font-bold">AI-Generated Prompts</h3>
                    <span className="text-[0.72rem] text-muted bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-md">Auto</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {previews.map((src, i) => {
                      const prompts = imagePrompts[i];
                      return (
                        <div key={i} className="bg-card border border-foreground/[0.08] rounded-xl p-4">
                          <div className="flex gap-4 mb-3">
                            <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[0.82rem] font-semibold mb-1 truncate">Image {i + 1}</div>
                              {prompts?.loading && (
                                <div className="flex items-center gap-2 text-[0.78rem] text-accent">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating prompts with AI…
                                </div>
                              )}
                            </div>
                          </div>
                          {prompts && !prompts.loading && (
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="flex items-center gap-1.5 text-[0.76rem] font-semibold text-muted mb-1.5">
                                  <Image className="w-3 h-3" /> Image Prompt
                                </label>
                                <textarea
                                  value={prompts.image_prompt}
                                  onChange={e => setImagePrompts(prev => ({
                                    ...prev,
                                    [i]: { ...prev[i], image_prompt: e.target.value }
                                  }))}
                                  rows={3}
                                  className="w-full border border-foreground/[0.1] rounded-lg px-3 py-2 font-body text-[0.8rem] bg-background outline-none focus:border-accent/40 transition-colors resize-none leading-[1.6]"
                                />
                              </div>
                              <div>
                                <label className="flex items-center gap-1.5 text-[0.76rem] font-semibold text-muted mb-1.5">
                                  <Video className="w-3 h-3" /> Video Prompt
                                </label>
                                <textarea
                                  value={prompts.video_prompt}
                                  onChange={e => setImagePrompts(prev => ({
                                    ...prev,
                                    [i]: { ...prev[i], video_prompt: e.target.value }
                                  }))}
                                  rows={3}
                                  className="w-full border border-foreground/[0.1] rounded-lg px-3 py-2 font-body text-[0.8rem] bg-background outline-none focus:border-accent/40 transition-colors resize-none leading-[1.6]"
                                />
                              </div>
                              <button
                                onClick={() => generatePromptsForImage(src, i)}
                                className="self-start flex items-center gap-1.5 text-[0.76rem] font-medium text-accent hover:text-accent/80 transition-colors"
                              >
                                <Sparkles className="w-3 h-3" /> Regenerate
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                disabled={!canProceed[0]}
                onClick={() => { setStep(1); runAutoTag(); }}
                className="bg-foreground text-primary-foreground px-8 py-3 rounded-lg text-[0.86rem] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div>
              <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2">Add details</h1>
              <p className="text-muted text-[0.88rem] mb-4">Help people find your work. Better details = more downloads.</p>

              {/* Auto-tag status */}
              {autoTagsLoading && (
                <div className="flex items-center gap-2 text-[0.82rem] text-accent bg-accent/[0.06] border border-accent/20 rounded-xl px-4 py-3 mb-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI is analysing your image for tags, title & categories…
                </div>
              )}
              {autoTagsDone && (
                <div className="flex items-center justify-between bg-accent/[0.06] border border-accent/20 rounded-xl px-4 py-3 mb-6">
                  <div className="flex items-center gap-2 text-[0.82rem] text-accent">
                    <Sparkles className="w-4 h-4" />
                    AI auto-filled title, tags & categories
                  </div>
                  <button
                    onClick={() => { setAutoTagsDone(false); runAutoTag(); }}
                    className="text-[0.76rem] font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Re-analyse
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-7">
                {/* Title */}
                <div>
                  <label className="block text-[0.84rem] font-semibold mb-2">Title <span className="text-accent">*</span></label>
                  <input
                    className="w-full h-12 border border-foreground/[0.13] rounded-xl px-4 font-body text-[0.95rem] bg-card outline-none focus:border-foreground transition-colors"
                    placeholder="Give your art a title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={80}
                  />
                  <div className="text-[0.72rem] text-muted mt-1 text-right">{title.length}/80</div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-[0.84rem] font-semibold mb-2">Categories <span className="text-accent">*</span> <span className="text-muted font-normal">(up to 5)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCat(cat)}
                        className={`border px-3.5 py-1.5 rounded-md text-[0.79rem] font-medium transition-all ${selectedCats.includes(cat) ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.12] text-muted hover:border-foreground/30 hover:text-foreground"}`}
                      >
                        {selectedCats.includes(cat) && <Check className="w-3 h-3 inline mr-1" />}
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[0.84rem] font-semibold mb-2">Tags <span className="text-muted font-normal">(type and press Enter)</span></label>
                  <div className="flex flex-wrap items-center gap-2 border border-foreground/[0.13] rounded-xl px-3 py-2 bg-card focus-within:border-foreground transition-colors">
                    {tags.map(t => (
                      <span key={t} className="flex items-center gap-1.5 bg-foreground/[0.06] text-[0.78rem] font-medium px-2.5 py-1 rounded-md">
                        <Tag className="w-2.5 h-2.5" /> {t}
                        <button onClick={() => removeTag(t)} className="text-muted hover:text-foreground transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <input
                      className="flex-1 min-w-[120px] border-none outline-none font-body text-[0.88rem] bg-transparent py-1"
                      placeholder="Add a tag…"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                    />
                  </div>
                </div>

                {/* AI Prompts Summary */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-[0.86rem]">AI Prompts</span>
                    <span className="text-[0.72rem] text-accent bg-accent/10 px-2 py-0.5 rounded-md font-semibold">Auto-generated</span>
                  </div>
                  <p className="text-[0.78rem] text-muted mb-3">Image and video prompts were automatically generated for each image. You can edit them in the Upload step.</p>
                  <div className="text-[0.8rem]">
                    {Object.values(imagePrompts).filter(p => p.image_prompt).length} of {previews.length} images have prompts
                  </div>
                </div>

                {/* AI Tool */}
                <div>
                  <label className="block text-[0.84rem] font-semibold mb-2">AI Tool Used</label>
                  <div className="relative">
                    <select
                      value={tool}
                      onChange={e => setTool(e.target.value)}
                      className="w-full h-12 border border-foreground/[0.13] rounded-xl px-4 font-body text-[0.88rem] bg-card outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select tool…</option>
                      {["Midjourney", "DALL-E 3", "Stable Diffusion", "Firefly", "Leonardo", "Ideogram", "Flux", "Other"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-[0.84rem] font-semibold mb-2">Visibility</label>
                  <div className="flex flex-col gap-3">
                    {([
                      { val: "public" as const, icon: Globe, title: "Public", desc: "Anyone can view, download, and use this image for free" },
                      { val: "private" as const, icon: Lock, title: "Private Collection", desc: "Only accessible via your collection with an access code" },
                    ]).map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => setVisibility(opt.val)}
                        className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${visibility === opt.val ? "border-foreground bg-foreground/[0.03]" : "border-foreground/[0.1] hover:border-foreground/25"}`}
                      >
                        <opt.icon className="w-4 h-4 mt-0.5 shrink-0 text-muted" />
                        <div className="flex-1">
                          <div className="font-semibold text-[0.86rem]">{opt.title}</div>
                          <div className="text-[0.75rem] text-muted">{opt.desc}</div>
                        </div>
                        {visibility === opt.val && <Check className="w-4 h-4 text-foreground ml-auto shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add to Collection */}
                <div>
                  <label className="block text-[0.84rem] font-semibold mb-2">Add to Collection <span className="text-muted font-normal">(optional)</span></label>
                  <div className="flex flex-col gap-3">
                    {([
                      { val: "none" as CollectionTarget, title: "No Collection", desc: "Upload without adding to a collection" },
                      { val: "existing" as CollectionTarget, title: "Existing Collection", desc: "Add to one of your collections" },
                      { val: "new" as CollectionTarget, title: "Create New Collection", desc: "Create a new collection with these images" },
                    ]).map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => { setCollectionTarget(opt.val); setSelectedCollection(""); setNewCollectionName(""); setSelectedCommunity(""); }}
                        className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${collectionTarget === opt.val ? "border-foreground bg-foreground/[0.03]" : "border-foreground/[0.1] hover:border-foreground/25"}`}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-[0.86rem]">{opt.title}</div>
                          <div className="text-[0.75rem] text-muted">{opt.desc}</div>
                        </div>
                        {collectionTarget === opt.val && <Check className="w-4 h-4 text-foreground ml-auto shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>

                  {/* Community filter */}
                  {collectionTarget !== "none" && (
                    <div className="mt-4">
                      <label className="block text-[0.78rem] font-medium text-muted mb-1.5">Filter by Community</label>
                      <div className="relative">
                        <select
                          value={selectedCommunity}
                          onChange={e => { setSelectedCommunity(e.target.value); setSelectedCollection(""); }}
                          className="w-full h-11 border border-foreground/[0.13] rounded-xl px-4 font-body text-[0.88rem] bg-card outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
                        >
                          <option value="">All Communities</option>
                          {mockCommunities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Existing collection picker */}
                  {collectionTarget === "existing" && (
                    <div className="mt-4">
                      <div className="relative mb-3">
                        <input
                          value={collectionSearch}
                          onChange={e => setCollectionSearch(e.target.value)}
                          placeholder="Search collections…"
                          className="w-full h-11 border border-foreground/[0.13] rounded-xl pl-10 pr-4 font-body text-[0.88rem] bg-card outline-none focus:border-foreground transition-colors"
                        />
                        <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        {collectionSearch && (
                          <button onClick={() => setCollectionSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="max-h-[200px] overflow-y-auto border border-foreground/[0.08] rounded-xl divide-y divide-foreground/[0.06]">
                        {filteredCollections.length === 0 ? (
                          <div className="p-4 text-center text-[0.82rem] text-muted">No collections found</div>
                        ) : (
                          filteredCollections.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setSelectedCollection(c.id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] ${selectedCollection === c.id ? "bg-foreground/[0.05]" : ""}`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-foreground/[0.06] flex items-center justify-center shrink-0">
                                <Image className="w-4 h-4 text-muted" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[0.84rem] font-medium truncate">{c.name}</div>
                                {c.community_id && (
                                  <div className="text-[0.72rem] text-muted">{mockCommunities.find(mc => mc.id === c.community_id)?.name}</div>
                                )}
                              </div>
                              {selectedCollection === c.id && <Check className="w-4 h-4 text-accent shrink-0" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* New collection name */}
                  {collectionTarget === "new" && (
                    <div className="mt-4">
                      <label className="block text-[0.78rem] font-medium text-muted mb-1.5">Collection Name</label>
                      <input
                        value={newCollectionName}
                        onChange={e => setNewCollectionName(e.target.value)}
                        placeholder="e.g., Cosmic Portraits"
                        className="w-full h-11 border border-foreground/[0.13] rounded-xl px-4 font-body text-[0.88rem] bg-card outline-none focus:border-foreground transition-colors"
                        maxLength={60}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(0)} className="border border-foreground/[0.14] px-6 py-3 rounded-lg text-[0.86rem] font-medium hover:border-foreground/30 transition-colors">
                  Back
                </button>
                <button
                  disabled={!canProceed[1]}
                  onClick={() => setStep(2)}
                  className="bg-foreground text-primary-foreground px-8 py-3 rounded-lg text-[0.86rem] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Publish */}
          {step === 2 && (
            <div>
              <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2">Ready to publish</h1>
              <p className="text-muted text-[0.88rem] mb-8">Review your submission before going live.</p>

              {/* Preview thumbnails */}
              <div className="bg-card border border-foreground/[0.08] rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                  {previews.slice(0, 6).map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    ["Title", title || "—"],
                    ["Categories", selectedCats.join(", ") || "—"],
                    ["Tags", tags.join(", ") || "—"],
                    ["Visibility", visibility === "public" ? "Public — free for everyone" : "Private collection"],
                    ["Collection", selectedCollectionName || "None"],
                    ["AI Tool", tool || "Not specified"],
                    ["AI Prompts", `${Object.values(imagePrompts).filter(p => p.image_prompt).length}/${previews.length} images`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start gap-4 text-[0.82rem]">
                      <span className="text-muted w-28 shrink-0">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affiliate reminder */}
              <div className="bg-accent/[0.06] border border-accent/20 rounded-xl p-4 flex items-start gap-3 mb-8">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-[0.8rem] text-muted leading-[1.65]">
                  Your affiliate link is automatically attached to every image you publish. When someone joins REAL CREATOR through your art, you earn commission — no setup required.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="border border-foreground/[0.14] px-6 py-3 rounded-lg text-[0.86rem] font-medium hover:border-foreground/30 transition-colors">
                  Back
                </button>
                <button
                  disabled={publishing}
                  onClick={handlePublish}
                  className="bg-foreground text-primary-foreground px-8 py-3 rounded-lg text-[0.86rem] font-semibold hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {publishing ? "Publishing…" : `Publish ${files.length} Image${files.length > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default UploadPage;
