import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Lock, Globe, Key, Check, Info, Image, Users, ChevronDown, Upload, Plus, X } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const categories = [
  "Abstract", "Portraits", "Nature", "Architecture", "Fantasy",
  "3D Art", "Fashion", "Sci-Fi", "Avatars", "Luxury", "Cyberpunk", "Minimal",
];

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const CreateGalleryPage = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [accessCode, setAccessCode] = useState(generateCode());
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Image uploads
  const [uploadedImages, setUploadedImages] = useState<{ file: File; preview: string }[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [customCover, setCustomCover] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (coverIndex === index) setCoverIndex(0);
      else if (coverIndex > index) setCoverIndex(coverIndex - 1);
      return updated;
    });
    setCustomCover(null);
  };

  const handleUploadCover = (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    setCustomCover({ file, preview: URL.createObjectURL(file) });
    setCoverIndex(-1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canCreate = name.trim().length > 2 && desc.trim().length > 10 && category;

  // Success screen
  if (created) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[80vh] px-6">
          <div className="text-center max-w-[440px]">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-9 h-9 text-accent" />
            </div>
            <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-3 capitalize">Collection Created!</h1>
            <p className="text-muted text-[0.88rem] leading-[1.7] mb-8">
              {name} is live. Start adding images to build your collection.
            </p>

            {visibility === "private" && (
              <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-6 text-left">
                <div className="flex items-center gap-2 text-[0.82rem] font-semibold mb-3">
                  <Key className="w-4 h-4 text-accent" /> Access Code
                </div>
                <div className="flex items-center gap-3">
                  <code className="font-mono text-[1.3rem] font-bold tracking-[0.15em] bg-foreground/[0.04] px-4 py-2 rounded-lg flex-1 text-center">
                    {accessCode}
                  </code>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.8rem] font-semibold hover:bg-accent transition-colors whitespace-nowrap">
                    {copied ? <Check className="w-3.5 h-3.5" /> : null}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-[0.75rem] text-muted mt-3 leading-[1.6]">
                  Share this code with anyone you want to give access. You can change or regenerate it anytime from your collection settings.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link to="/upload">
                <button className="w-full bg-foreground text-primary-foreground py-3 rounded-lg text-[0.86rem] font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2">
                  <Image className="w-4 h-4" /> Add Images
                </button>
              </Link>
              <Link to="/communities">
                <button className="w-full border border-foreground/[0.14] py-3 rounded-lg text-[0.86rem] font-medium hover:border-foreground/30 transition-colors">
                  View All Collections
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedCoverPreview = customCover
    ? customCover.preview
    : uploadedImages[coverIndex]?.preview ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="px-6 md:px-12 py-8 max-w-[780px] mx-auto pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-8">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <Link to="/communities" className="hover:text-foreground transition-colors">Communities</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">Create Collection</span>
          </div>

          <h1 className="font-display text-[2.8rem] font-black tracking-[-0.03em] mb-2 capitalize">Create Your Collection</h1>
          <p className="text-muted text-[0.88rem] mb-10 leading-[1.65]">Build a public showcase or a private vault for your art — you control who sees it.</p>

          <div className="flex flex-col gap-7">
            {/* Collection name */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2 capitalize">Collection Name <span className="text-accent">*</span></label>
              <input
                className="w-full h-12 border border-foreground/[0.13] rounded-xl px-4 font-body text-[0.95rem] bg-card outline-none focus:border-foreground transition-colors"
                placeholder="e.g. My Cyberpunk Collection"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2 capitalize">Description <span className="text-accent">*</span></label>
              <textarea
                className="w-full border border-foreground/[0.13] rounded-xl px-4 py-3 font-body text-[0.88rem] bg-card outline-none focus:border-foreground transition-colors resize-none"
                rows={4}
                placeholder="Tell people what this collection is about. What will they find inside?"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                maxLength={300}
              />
              <div className="text-[0.72rem] text-muted mt-1 text-right">{desc.length}/300</div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2 capitalize">Category <span className="text-accent">*</span></label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-12 border border-foreground/[0.13] rounded-xl px-4 font-body text-[0.88rem] bg-card outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Choose a category…</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>

            {/* Upload images */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2 capitalize">Upload Images</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleAddImages(e.target.files)}
              />
              {uploadedImages.length === 0 ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[140px] rounded-xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-foreground/30 transition-colors"
                >
                  <Upload className="w-7 h-7 text-muted" />
                  <span className="text-[0.85rem] font-medium">Click to upload images</span>
                  <span className="text-[0.72rem] text-muted">JPG, PNG, WebP — multiple files supported</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-foreground/70 text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-foreground/[0.12] flex items-center justify-center hover:border-foreground/30 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-muted" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2 capitalize">Cover Image</label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleUploadCover(e.target.files)}
              />

              {uploadedImages.length === 0 && !customCover ? (
                <div className="rounded-xl border border-foreground/[0.1] p-5 text-center">
                  <p className="text-[0.82rem] text-muted mb-3">Upload images above first, or upload a separate cover image.</p>
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-foreground/[0.14] text-[0.82rem] font-medium hover:border-foreground/30 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Upload Cover Image
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {uploadedImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setCoverIndex(i); setCustomCover(null); }}
                        className={`aspect-square rounded-xl overflow-hidden relative border-2 transition-all ${!customCover && coverIndex === i ? "border-accent" : "border-transparent"}`}
                      >
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        {!customCover && coverIndex === i && (
                          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                    {customCover && (
                      <button
                        className="aspect-square rounded-xl overflow-hidden relative border-2 border-accent transition-all"
                      >
                        <img src={customCover.preview} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      className="inline-flex items-center gap-2 text-[0.78rem] text-muted hover:text-foreground font-medium transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Different Cover
                    </button>
                  </div>
                  <p className="text-[0.72rem] text-muted">Select a cover, or it will auto-select from your first uploaded image.</p>
                </div>
              )}
            </div>

            {/* Access type */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2 capitalize">Access Type</label>
              <div className="flex flex-col gap-3">
                {([
                  { val: "public" as const, icon: Globe, title: "Public", desc: "Anyone on REAL ART can discover and join your collection for free." },
                  { val: "private" as const, icon: Lock, title: "Private (Code Access)", desc: "Only people with your access code can view this collection's content." },
                ] as const).map(opt => (
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

            {/* Access code (private only) */}
            {visibility === "private" && (
              <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                <div className="flex items-center gap-2 text-[0.82rem] font-semibold mb-3">
                  <Key className="w-4 h-4 text-accent" /> Your Access Code
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <code className="font-mono text-[1.3rem] font-bold tracking-[0.15em] bg-foreground/[0.04] px-4 py-2 rounded-lg flex-1 text-center">
                    {accessCode}
                  </code>
                  <button
                    onClick={() => setAccessCode(generateCode())}
                    className="px-4 py-2.5 rounded-lg border border-foreground/[0.14] text-[0.8rem] font-medium hover:border-foreground/30 transition-colors whitespace-nowrap"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="text-[0.72rem] text-muted leading-[1.5]">
                  You can change this code at any time. Anyone who already joined will need the new code to re-enter if you change it.
                </p>
              </div>
            )}

            {/* Info boxes */}
            <div className="flex items-start gap-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl p-4">
              <Users className="w-4 h-4 text-muted shrink-0 mt-0.5" />
              <p className="text-[0.78rem] text-muted leading-[1.6]">
                Every image in your collection automatically carries your affiliate link. When someone joins REAL CREATOR after discovering your work here, you earn commission.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-accent/[0.04] border border-accent/15 rounded-xl p-4">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <p className="text-[0.78rem] text-muted leading-[1.6]">
                Your collection will appear in the Communities section. Public collections are discoverable by all REAL ART members.
              </p>
            </div>

            {/* Create button */}
            <button
              disabled={!canCreate}
              onClick={() => setCreated(true)}
              className="bg-foreground text-primary-foreground px-8 py-3.5 rounded-xl text-[0.9rem] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors w-full flex items-center justify-center gap-2"
            >
              Create Collection
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default CreateGalleryPage;
