import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Lock, Globe, Key, Check, Info, Image, Users, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  "Abstract", "Portraits", "Nature", "Architecture", "Fantasy",
  "3D Art", "Fashion", "Sci-Fi", "Avatars", "Luxury", "Cyberpunk", "Minimal",
];

const coverPhotos = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85",
  "photo-1604881991720-f91add269bed", "photo-1501854140801-50d01698950b",
  "photo-1579546929518-9e396f3cc809", "photo-1500462918059-b1a0cb512f1d",
];

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const CreateGalleryPage = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [accessCode, setAccessCode] = useState(generateCode());
  const [coverIdx, setCoverIdx] = useState(0);
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);

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
            <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-3">Gallery created!</h1>
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
                  Share this code with anyone you want to give access. You can change or regenerate it anytime from your gallery settings.
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
                  View All Galleries
                </button>
              </Link>
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
        <div className="px-6 md:px-12 py-8 max-w-[780px] mx-auto pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-8">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <Link to="/communities" className="hover:text-foreground transition-colors">Communities</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">Create Gallery</span>
          </div>

          <h1 className="font-display text-[2.8rem] font-black tracking-[-0.03em] mb-2">Create your gallery</h1>
          <p className="text-muted text-[0.88rem] mb-10 leading-[1.65]">Build a public showcase or a private vault for your art — you control who sees it.</p>

          <div className="flex flex-col gap-7">
            {/* Gallery name */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2">Gallery name <span className="text-accent">*</span></label>
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
              <label className="block text-[0.84rem] font-semibold mb-2">Description <span className="text-accent">*</span></label>
              <textarea
                className="w-full border border-foreground/[0.13] rounded-xl px-4 py-3 font-body text-[0.88rem] bg-card outline-none focus:border-foreground transition-colors resize-none"
                rows={4}
                placeholder="Tell people what this gallery is about. What will they find inside?"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                maxLength={300}
              />
              <div className="text-[0.72rem] text-muted mt-1 text-right">{desc.length}/300</div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2">Category <span className="text-accent">*</span></label>
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

            {/* Cover image */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2">Cover image</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2">
                {coverPhotos.map((p, i) => (
                  <button key={i} onClick={() => setCoverIdx(i)} className={`aspect-square rounded-xl overflow-hidden relative border-2 transition-all ${coverIdx === i ? "border-accent" : "border-transparent"}`}>
                    <img src={`https://images.unsplash.com/${p}?w=150&h=150&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
                    {coverIdx === i && (
                      <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[0.72rem] text-muted">Select a cover, or it will auto-select from your first uploaded image.</p>
            </div>

            {/* Access type */}
            <div>
              <label className="block text-[0.84rem] font-semibold mb-2">Access type</label>
              <div className="flex flex-col gap-3">
                {([
                  { val: "public" as const, icon: Globe, title: "Public", desc: "Anyone on REAL ART can discover and join your gallery for free." },
                  { val: "private" as const, icon: Lock, title: "Private (Code Access)", desc: "Only people with your access code can view this gallery's content." },
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
                Every image in your gallery automatically carries your affiliate link. When someone joins REAL CREATOR after discovering your work here, you earn commission.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-accent/[0.04] border border-accent/15 rounded-xl p-4">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <p className="text-[0.78rem] text-muted leading-[1.6]">
                Your gallery will appear in the Communities section. Public galleries are discoverable by all REAL ART members.
              </p>
            </div>

            {/* Create button */}
            <button
              disabled={!canCreate}
              onClick={() => setCreated(true)}
              className="bg-foreground text-primary-foreground px-8 py-3.5 rounded-xl text-[0.9rem] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors w-full flex items-center justify-center gap-2"
            >
              Create Gallery
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default CreateGalleryPage;
