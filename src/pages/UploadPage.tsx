import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Upload, Image, X, Plus,
  Check, Info, Tag, Globe, Lock, ChevronDown, Sparkles, Video, Loader2, Search, ExternalLink, Star, MessageCircle
} from "lucide-react";
import PageShell from "@/components/PageShell";
import { getCollections, addCollection, type Collection } from "@/lib/collectionStore";
import { setCollectionLink } from "@/lib/linkStore";
import { detectAffiliatePartner, popularPartners, type AffiliatePartner } from "@/lib/affiliateNetwork";
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
  const [commentsEnabled, setCommentsEnabled] = useState(() => {
    try { return localStorage.getItem("ra_comments_default") !== "0"; } catch { return true; }
  });
  const [published, setPublished] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Collection targeting
  const [collections, setCollections] = useState<Collection[]>(() => getCollections());
  const [selectedCollection, setSelectedCollection] = useState<string>("none");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [showNewCol, setShowNewCol] = useState(false);

  // Shop / Affiliate link
  const [showLinkField, setShowLinkField] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkSite, setLinkSite] = useState("");
  const [linkPrice, setLinkPrice] = useState("");
  const [linkIsAffiliate, setLinkIsAffiliate] = useState(false);
  const [detectedPartner, setDetectedPartner] = useState<AffiliatePartner | null>(null);
  const [autoAffiliate, setAutoAffiliate] = useState(false);
  // Per-image AI prompts
  const [imagePrompts, setImagePrompts] = useState<Record<number, ImagePrompts>>({});

  const filteredCollections = collections.filter(c =>
    !collectionSearch || c.title.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  const selectedCollectionName =
    selectedCollection === "none" ? "" :
    selectedCollection === "new" ? newCollectionName :
    collections.find(c => c.id === selectedCollection)?.title || "";

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

      // Save external link to linkStore
      if (linkUrl.trim() && collectionId) {
        setCollectionLink({
          collectionId,
          defaultUrl: linkUrl.trim(),
          defaultLabel: linkLabel.trim() || "Shop this look",
          defaultSite: linkSite.trim() || new URL(linkUrl.trim().startsWith("http") ? linkUrl.trim() : "https://" + linkUrl.trim()).hostname.replace("www.", ""),
          isAffiliate: linkIsAffiliate,
        });
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
      <PageShell>
        <div className="flex items-center justify-center min-h-[80vh] px-6">
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
      </PageShell>
    );
  }

  return (
    <PageShell>
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
              <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2">Upload Your Art</h1>
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
                <div className="font-semibold text-[0.92rem] mb-1">{dragging ? "Drop To Upload" : "Drag & Drop Your Images Here"}</div>
                <div className="text-[0.78rem] text-muted">Or Click To Browse</div>
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
              {/* Persistent image previews */}
              {previews.length > 0 && (
                <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                  {previews.map((src, i) => (
                    <div key={i} className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 border-foreground/[0.08]">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <span className="text-[0.75rem] text-muted shrink-0 ml-1">{previews.length} image{previews.length !== 1 ? "s" : ""}</span>
                </div>
              )}

              <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2">Add Details</h1>
              <p className="text-muted text-[0.88rem] mb-4">Help people find your work. Better details = more downloads.</p>

              {/* Auto-tag status */}
              {autoTagsLoading && (
                <div className="flex items-center gap-2 text-[0.82rem] text-accent bg-accent/[0.06] border border-accent/20 rounded-xl px-4 py-3 mb-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI Is Analysing Your Image For Tags, Title & Categories…
                </div>
              )}
              {autoTagsDone && (
                <div className="flex items-center justify-between bg-accent/[0.06] border border-accent/20 rounded-xl px-4 py-3 mb-6">
                  <div className="flex items-center gap-2 text-[0.82rem] text-accent">
                    <Sparkles className="w-4 h-4" />
                    AI Auto-Filled Title, Tags & Categories
                  </div>
                  <button
                    onClick={() => { setAutoTagsDone(false); runAutoTag(); }}
                    className="text-[0.76rem] font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Re-Analyse
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
                  <label className="block text-[0.84rem] font-semibold mb-2">Categories <span className="text-accent">*</span> <span className="text-muted font-normal">(Up To 5)</span></label>
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
                  <label className="block text-[0.84rem] font-semibold mb-2">Tags <span className="text-muted font-normal">(Type And Press Enter)</span></label>
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
                      <option value="">Select Tool…</option>
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

                {/* Comments toggle */}
                <div>
                  <label className="block text-[0.84rem] font-semibold mb-2">Comments</label>
                  <button
                    onClick={() => setCommentsEnabled(!commentsEnabled)}
                    className={`flex items-center justify-between w-full p-4 rounded-xl border text-left transition-all ${commentsEnabled ? "border-foreground bg-foreground/[0.03]" : "border-foreground/[0.1]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-muted shrink-0" />
                      <div>
                        <div className="font-semibold text-[0.86rem]">{commentsEnabled ? "Comments Enabled" : "Comments Disabled"}</div>
                        <div className="text-[0.75rem] text-muted">{commentsEnabled ? "Viewers can leave comments on this post" : "No one can comment on this post"}</div>
                      </div>
                    </div>
                    <div className={`w-10 h-[22px] rounded-full relative transition-colors ${commentsEnabled ? "bg-accent" : "bg-foreground/[0.12]"}`}>
                      <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-primary-foreground shadow transition-transform ${commentsEnabled ? "left-[22px]" : "left-[3px]"}`} />
                    </div>
                  </button>
                </div>

                {/* Add to Collection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[0.84rem] font-semibold">Add To Collection <span className="text-muted font-normal">(Optional)</span></label>
                    {selectedCollection !== "none" && selectedCollection !== "new" && (
                      <button onClick={() => setSelectedCollection("none")} className="text-[0.74rem] text-muted hover:text-foreground transition-colors">
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
                    {/* Search */}
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/[0.06]">
                      <Search className="w-3.5 h-3.5 text-muted shrink-0" />
                      <input
                        value={collectionSearch}
                        onChange={e => setCollectionSearch(e.target.value)}
                        placeholder="Search collections…"
                        className="flex-1 text-[0.84rem] bg-transparent outline-none font-body"
                      />
                      {collectionSearch && (
                        <button onClick={() => setCollectionSearch("")} className="text-muted hover:text-foreground">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Scrollable list */}
                    <div className="max-h-[260px] overflow-y-auto">
                      {/* None option */}
                      <button
                        onClick={() => setSelectedCollection("none")}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-foreground/[0.06] ${selectedCollection === "none" ? "bg-foreground/[0.04]" : "hover:bg-foreground/[0.02]"}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-foreground/[0.06] flex items-center justify-center shrink-0">
                          <X className="w-4 h-4 text-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.84rem] font-medium">Don't Add To A Collection</div>
                          <div className="text-[0.72rem] text-muted">Publish As A Standalone Upload</div>
                        </div>
                        {selectedCollection === "none" && <Check className="w-4 h-4 text-accent shrink-0" />}
                      </button>

                      {/* No results */}
                      {filteredCollections.length === 0 && collectionSearch && (
                        <div className="p-4 text-center text-[0.82rem] text-muted">No collections match "{collectionSearch}"</div>
                      )}

                      {/* Collection items */}
                      {filteredCollections.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCollection(c.id); setShowNewCol(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-foreground/[0.04] last:border-none ${selectedCollection === c.id ? "bg-foreground/[0.04]" : "hover:bg-foreground/[0.02]"}`}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                            {c.thumbs?.[0] ? (
                              <img src={`https://images.unsplash.com/${c.thumbs[0]}?w=64&h=64&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-foreground/[0.06] flex items-center justify-center"><Image className="w-4 h-4 text-muted" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.84rem] font-medium truncate">{c.title}</div>
                            <div className="text-[0.72rem] text-muted">
                              {c.imageCount} images{(c.videoCount || 0) > 0 ? ` · ${c.videoCount} videos` : ""}{(c.musicCount || 0) > 0 ? ` · ${c.musicCount} tracks` : ""} · {c.visibility === "public" ? "Public" : "Private"}
                            </div>
                          </div>
                          {selectedCollection === c.id && <Check className="w-4 h-4 text-accent shrink-0" />}
                        </button>
                      ))}
                    </div>

                    {/* Create new */}
                    {!showNewCol ? (
                      <button
                        onClick={() => { setShowNewCol(true); setSelectedCollection("new"); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-t border-foreground/[0.06] transition-colors ${selectedCollection === "new" ? "bg-foreground/[0.04]" : "hover:bg-foreground/[0.02]"}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-foreground/[0.06] flex items-center justify-center shrink-0">
                          <Plus className="w-4 h-4 text-muted" />
                        </div>
                        <div className="text-[0.84rem] font-medium">Create New Collection…</div>
                      </button>
                    ) : (
                      <div className="px-4 py-3 border-t border-foreground/[0.06] bg-foreground/[0.02]">
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={newCollectionName}
                            onChange={e => setNewCollectionName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Escape") { setShowNewCol(false); setSelectedCollection("none"); } }}
                            maxLength={60}
                            placeholder="Collection name…"
                            className="flex-1 h-10 px-3 rounded-lg border border-foreground/[0.1] bg-background text-[0.84rem] font-body outline-none focus:border-foreground transition-colors"
                          />
                          <button onClick={() => { setShowNewCol(false); setSelectedCollection("none"); setNewCollectionName(""); }} className="ml-auto text-muted hover:text-foreground transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[0.72rem] text-muted mt-1.5">
                          {newCollectionName.trim().length > 0
                            ? `Will create "${newCollectionName.trim()}" and add your images to it`
                            : "Enter a name for the new collection"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selection confirmation */}
                  {selectedCollection !== "none" && (
                    <div className="mt-2.5 flex items-center gap-2 text-[0.78rem] text-green-600 bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      {selectedCollection === "new"
                        ? newCollectionName.trim() ? `Will create and add to "${newCollectionName.trim()}"` : "Enter a collection name above"
                        : `Will add to "${collections.find(c => c.id === selectedCollection)?.title}"`}
                    </div>
                  )}
                </div>

                {/* Shop / Affiliate Link */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[0.84rem] font-semibold">Shop / Affiliate Link <span className="text-muted font-normal">(Optional)</span></label>
                  </div>

                  {!showLinkField && (
                    <>
                      <button
                        onClick={() => setShowLinkField(true)}
                        className="flex items-center gap-3 w-full p-4 rounded-xl border border-dashed border-foreground/[0.14] text-[0.82rem] text-muted hover:border-foreground/30 hover:bg-foreground/[0.01] transition-all text-left mb-3"
                      >
                        <ExternalLink className="w-4 h-4 shrink-0 opacity-40" />
                        Link to your Etsy shop, print store, course page, or any URL. A "Shop" button appears on the image.
                      </button>
                      <p className="text-[0.72rem] text-muted mb-2">Quick select a partner — or paste any URL:</p>
                      <div className="flex flex-wrap gap-2">
                        {popularPartners.slice(0, 8).map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setShowLinkField(true);
                              setLinkLabel(p.defaultLabel);
                              setLinkSite(p.name);
                              setLinkIsAffiliate(true);
                              setDetectedPartner(p);
                              setAutoAffiliate(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foreground/[0.1] text-[0.76rem] font-medium hover:border-foreground/30 transition-all"
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                            <span>{p.name}</span>
                            <span className="text-muted text-[0.68rem]">{p.commission}</span>
                          </button>
                        ))}
                        <button
                          onClick={() => setShowLinkField(true)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-foreground/[0.14] text-[0.76rem] text-muted hover:border-foreground/30 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Other URL
                        </button>
                      </div>
                    </>
                  )}

                  {showLinkField && (
                    <div className="border border-foreground/[0.08] rounded-xl p-4 flex flex-col gap-3">
                      <div>
                        <label className="text-[0.76rem] font-semibold text-muted mb-1 block">Destination URL</label>
                        <input
                          value={linkUrl}
                          onChange={e => {
                            const url = e.target.value;
                            setLinkUrl(url);
                            const partner = detectAffiliatePartner(url);
                            setDetectedPartner(partner);
                            if (partner) {
                              setAutoAffiliate(true);
                              setLinkIsAffiliate(true);
                              if (!linkLabel) setLinkLabel(partner.defaultLabel);
                              if (!linkSite) setLinkSite(partner.name);
                            } else {
                              setAutoAffiliate(false);
                            }
                          }}
                          placeholder="https://etsy.com/your-listing, amazon link, course URL…"
                          className="w-full h-10 border border-foreground/[0.13] rounded-xl px-4 text-[0.86rem] bg-background outline-none focus:border-accent transition-colors"
                          autoFocus
                        />
                        {detectedPartner && linkUrl && (
                          <div className="flex items-center gap-2 mt-2 text-[0.76rem]">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: detectedPartner.color }} />
                            <span className="font-semibold">{detectedPartner.name} detected</span>
                            <span className="text-muted">·</span>
                            <span className="text-muted">{detectedPartner.commission} commission · {detectedPartner.cookieDays}-day cookie</span>
                            <span className="text-muted">·</span>
                            <span className="text-accent font-semibold">You keep 100%</span>
                          </div>
                        )}
                        {linkUrl && !detectedPartner && (
                          <p className="text-[0.72rem] text-muted mt-1.5">Not in our network — you can still add this as a manual link.</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[0.76rem] font-semibold text-muted mb-1 block">Button Label</label>
                          <input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="Shop this look" maxLength={40} className="w-full h-9 border border-foreground/[0.13] rounded-xl px-3 text-[0.83rem] bg-background outline-none focus:border-accent transition-colors" />
                        </div>
                        <div>
                          <label className="text-[0.76rem] font-semibold text-muted mb-1 block">Price (Optional)</label>
                          <input value={linkPrice} onChange={e => setLinkPrice(e.target.value)} placeholder="$49.99" maxLength={15} className="w-full h-9 border border-foreground/[0.13] rounded-xl px-3 text-[0.83rem] bg-background outline-none focus:border-accent transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <button onClick={() => setLinkIsAffiliate(!linkIsAffiliate)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer shrink-0 mt-0.5 transition-colors ${linkIsAffiliate ? "bg-foreground border-foreground" : "border-foreground/20 hover:border-foreground/40"}`}>
                          {linkIsAffiliate && <Check className="w-3 h-3 text-primary-foreground" />}
                        </button>
                        <div>
                          <div className="text-[0.82rem] font-medium">
                            This Is An Affiliate Link
                            {autoAffiliate && detectedPartner && (
                              <span className="ml-2 text-[0.68rem] text-accent bg-accent/10 px-1.5 py-0.5 rounded font-semibold">Auto-detected</span>
                            )}
                          </div>
                          <p className="text-[0.72rem] text-muted leading-[1.5]">FTC requires disclosure when you earn a commission. We'll add an "AD · Affiliate" badge on the image.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[0.72rem] text-muted">
                        <Info className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        Applies to all {files.length} image{files.length !== 1 ? "s" : ""} in this batch. You keep 100% of any commission — REAL ART takes nothing.
                      </div>
                    </div>
                  )}

                  {showLinkField && linkUrl && (
                    <div className="mt-2.5 flex items-center gap-2 text-[0.78rem] text-green-600 bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      {detectedPartner ? `${detectedPartner.name} affiliate link set` : "Link set"}
                      {linkIsAffiliate && " · disclosure enabled"}
                      <button onClick={() => { setShowLinkField(false); setLinkUrl(""); setLinkLabel(""); setLinkSite(""); setLinkPrice(""); setLinkIsAffiliate(false); setDetectedPartner(null); setAutoAffiliate(false); }} className="ml-auto text-[0.72rem] text-muted hover:text-foreground transition-colors">Remove</button>
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
              <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2">Ready To Publish</h1>
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
                    ["Comments", commentsEnabled ? "Enabled" : "Disabled"],
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
    </PageShell>
  );
};

export default UploadPage;
