import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Search, Plus, TrendingUp, Users, Bookmark, X, Globe, Lock, Key, Check,
  Compass, Star, Edit3, Trash2, Image, Video, Music, CreditCard, MoreHorizontal, Share2, Merge,
  Archive, ArchiveRestore, FolderOpen, DollarSign, Link2, Copy, UserPlus, ShieldCheck, Loader2, Sparkles
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import {
  getCollections, addCollection, updateCollection, deleteCollection,
  archiveCollection, unarchiveCollection, mergeCollections, grantAccess,
  type Collection, type UnifiedCollection
} from "@/lib/collectionStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "All", "People & Portraits", "Fashion & Style", "Nature & Earth",
  "Architecture", "Abstract", "Sci-Fi & Fantasy", "Luxury",
  "Cyberpunk", "Avatars", "Backgrounds", "3D Art",
];

const communities = [
  { id: "c1", name: "Avatar Architects" },
  { id: "c2", name: "Abstract Minds" },
  { id: "c3", name: "Neon Futures" },
  { id: "c4", name: "Dreamweavers" },
];

const curatedCollections = [
  { id: "e1", name: "CEO / Boss Babe", count: 152, images: 120, videos: 24, tracks: 8, category: "People & Portraits", curator: "REAL ART", photo: "photo-1573496359142-b8d87734a5a2", featured: true, visibility: "public" as const, price: 0 },
  { id: "e2", name: "Luxury Lifestyle", count: 239, images: 180, videos: 42, tracks: 17, category: "Luxury", curator: "REAL ART", photo: "photo-1600210492486-724fe5c67fb0", featured: true, visibility: "public" as const, price: 0 },
  { id: "e3", name: "Cosmic Worlds", count: 412, images: 340, videos: 58, tracks: 14, category: "Sci-Fi & Fantasy", curator: "AI.Verse", photo: "photo-1618005182384-a83a8bd57fbe", featured: true, visibility: "public" as const, price: 0 },
  { id: "e4", name: "Digital Avatars", count: 520, images: 460, videos: 48, tracks: 12, category: "Avatars", curator: "LuminaAI", photo: "photo-1579546929518-9e396f3cc809", featured: true, visibility: "public" as const, price: 0 },
  { id: "e5", name: "Street Fashion", count: 185, images: 150, videos: 28, tracks: 7, category: "Fashion & Style", curator: "REAL ART", photo: "photo-1509631179647-0177331693ae", featured: false, visibility: "public" as const, price: 0 },
  { id: "e6", name: "Runway Inspired", count: 130, images: 98, videos: 22, tracks: 10, category: "Fashion & Style", curator: "REAL ART", photo: "photo-1558618666-fcd25c85cd64", featured: false, visibility: "public" as const, price: 0 },
  { id: "e7", name: "Neon Cities", count: 267, images: 210, videos: 45, tracks: 12, category: "Cyberpunk", curator: "NeoPixel", photo: "photo-1557682250-33bd709cbe85", featured: false, visibility: "private" as const, price: 499 },
  { id: "e8", name: "Ancient Forests", count: 198, images: 165, videos: 25, tracks: 8, category: "Nature & Earth", curator: "DreamForge", photo: "photo-1470071459604-3b5ec3a7fe05", featured: false, visibility: "public" as const, price: 0 },
  { id: "e9", name: "Modern Architecture", count: 344, images: 290, videos: 38, tracks: 16, category: "Architecture", curator: "ChromaLab", photo: "photo-1506905925346-21bda4d32df4", featured: false, visibility: "public" as const, price: 0 },
  { id: "e10", name: "Abstract Fluid", count: 189, images: 155, videos: 26, tracks: 8, category: "Abstract", curator: "SpectraGen", photo: "photo-1541701494587-cb58502866ab", featured: false, visibility: "private" as const, price: 299 },
  { id: "e11", name: "Minimal Spaces", count: 143, images: 120, videos: 18, tracks: 5, category: "Architecture", curator: "VoidArt", photo: "photo-1549880338-65ddcdfd017b", featured: false, visibility: "public" as const, price: 0 },
  { id: "e12", name: "Retro Futures", count: 231, images: 185, videos: 34, tracks: 12, category: "Sci-Fi & Fantasy", curator: "REAL ART", photo: "photo-1547036967-23d11aacaee0", featured: false, visibility: "public" as const, price: 0 },
];

const communityCollections = [
  { id: "b1", title: "Cyberpunk Cities", creator: "VoidArt", creatorColor: "#023e8a", creatorInit: "VA", followers: "1,248", images: 128, videos: 32, tracks: 9, cover: "photo-1557682250-33bd709cbe85", category: "Cyberpunk", visibility: "public" as const, price: 0 },
  { id: "b2", title: "Surreal Dreamscapes", creator: "DreamForge", creatorColor: "#2a9d8f", creatorInit: "DF", followers: "892", images: 94, videos: 18, tracks: 6, cover: "photo-1579546929518-9e396f3cc809", category: "Sci-Fi & Fantasy", visibility: "public" as const, price: 0 },
  { id: "b3", title: "Dark Fantasy", creator: "NeoPixel", creatorColor: "#c9184a", creatorInit: "NP", followers: "1,034", images: 156, videos: 41, tracks: 14, cover: "photo-1541701494587-cb58502866ab", category: "Sci-Fi & Fantasy", visibility: "private" as const, price: 599 },
  { id: "b4", title: "Abstract Minimalism", creator: "ChromaLab", creatorColor: "#f4a261", creatorInit: "CL", followers: "674", images: 82, videos: 12, tracks: 4, cover: "photo-1618005182384-a83a8bd57fbe", category: "Abstract", visibility: "public" as const, price: 0 },
  { id: "b5", title: "Cosmic Visions", creator: "AI.Verse", creatorColor: "#4361ee", creatorInit: "AV", followers: "2,118", images: 241, videos: 56, tracks: 18, cover: "photo-1462275646964-a0e3386b89fa", category: "Sci-Fi & Fantasy", visibility: "public" as const, price: 0 },
  { id: "b6", title: "Neon Portraits", creator: "LuminaAI", creatorColor: "#e76f51", creatorInit: "LA", followers: "561", images: 67, videos: 15, tracks: 3, cover: "photo-1547036967-23d11aacaee0", category: "People & Portraits", visibility: "private" as const, price: 0 },
  { id: "b7", title: "Nature Reimagined", creator: "SpectraGen", creatorColor: "#7b2d8b", creatorInit: "SG", followers: "723", images: 109, videos: 22, tracks: 7, cover: "photo-1470071459604-3b5ec3a7fe05", category: "Nature & Earth", visibility: "public" as const, price: 0 },
  { id: "b8", title: "Retro Futurism", creator: "Synthetix", creatorColor: "#06d6a0", creatorInit: "SX", followers: "498", images: 73, videos: 14, tracks: 5, cover: "photo-1518020382113-a7e8fc38eac9", category: "Sci-Fi & Fantasy", visibility: "public" as const, price: 0 },
  { id: "b9", title: "Liquid Metal", creator: "AI.Verse", creatorColor: "#4361ee", creatorInit: "AV", followers: "1,390", images: 88, videos: 20, tracks: 6, cover: "photo-1558618666-fcd25c85cd64", category: "Abstract", visibility: "private" as const, price: 799 },
];

const TABS = [
  { id: "discover" as const, label: "All Collections", icon: Compass },
  { id: "mine" as const, label: "My Collections", icon: Bookmark },
];

/* ── VisBadge ── */
const VisBadge = ({ visibility }: { visibility: string; price?: number }) => {
  if (visibility === "private") {
    return <span className="flex items-center gap-1 bg-accent/90 backdrop-blur-sm text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-md"><Lock className="w-2.5 h-2.5" /> Private</span>;
  }
  return <span className="flex items-center gap-1 bg-green-600/90 backdrop-blur-sm text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-md"><Globe className="w-2.5 h-2.5" /> Public</span>;
};

/* ── Access Modal ── */
const AccessModal = ({ id, title, price, onClose, onGranted }: {
  id: string; title: string; price?: number; onClose: () => void; onGranted: () => void;
}) => {
  const [tab, setTab] = useState<"code" | "pay">(price && price > 0 ? "pay" : "code");
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const tryCode = () => {
    const all = [...curatedCollections.map(c => ({ id: c.id, code: undefined as string | undefined })),
      ...communityCollections.map(c => ({ id: c.id, code: undefined as string | undefined }))];
    // Check localStorage collections too
    const userCols = getCollections();
    const match = userCols.find(c => c.id === id && c.accessCode);
    const staticMatch = curatedCollections.find(c => c.id === id) || communityCollections.find(c => c.id === id);
    // For demo, accept code "XK9F2M" or any 6-char code
    if (code.length >= 4) {
      grantAccess(id);
      onGranted();
    } else {
      setCodeErr("Invalid Code — Check With The Collection Owner");
    }
  };

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => { setPaid(true); grantAccess(id); setTimeout(onGranted, 800); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[420px] shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/[0.06]">
          <div>
            <div className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-accent mb-1">Private Collection</div>
            <h3 className="font-display text-[1.15rem] font-bold leading-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {price && price > 0 && (
          <div className="flex border-b border-foreground/[0.06]">
            {([{ id: "pay" as const, label: `Buy Access — $${(price / 100).toFixed(2)}`, icon: CreditCard },
              { id: "code" as const, label: "Free Access", icon: Key }]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[0.8rem] font-medium border-b-2 transition-colors ${tab === t.id ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"}`}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 py-5">
          {tab === "code" ? (
            <>
              <p className="text-[0.82rem] text-muted mb-4">Enter The Access Code From The Collection Owner To Unlock This Collection For Free.</p>
              <div className="flex items-center gap-2 h-12 border border-foreground/[0.12] rounded-xl px-4 bg-background focus-within:border-accent transition-colors mb-3">
                <Key className="w-4 h-4 text-muted shrink-0" />
                <input value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setCodeErr(""); }}
                  onKeyDown={e => e.key === "Enter" && tryCode()}
                  placeholder="ENTER CODE" className="flex-1 border-none outline-none bg-transparent text-[0.9rem] font-mono tracking-[0.14em] uppercase" autoFocus />
              </div>
              {codeErr && <p className="text-[0.78rem] text-destructive mb-3">{codeErr}</p>}
              <button onClick={tryCode} className="w-full py-3 rounded-xl bg-foreground text-primary-foreground text-[0.88rem] font-semibold hover:bg-accent transition-colors">
                Unlock With Code
              </button>
              {price && price > 0 && (
                <button onClick={() => setTab("pay")} className="w-full mt-2.5 text-[0.78rem] text-muted hover:text-foreground transition-colors">
                  No Code? Buy Access For ${(price / 100).toFixed(2)} →
                </button>
              )}
            </>
          ) : (
            <>
              {paid ? (
                <div className="text-center py-6">
                  <Check className="w-7 h-7 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-[0.92rem]">Payment Complete!</div>
                  <div className="text-[0.78rem] text-muted mt-1">Unlocking Collection…</div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-5">
                    <div className="text-[0.78rem] text-muted mb-1">Lifetime Access</div>
                    <div className="font-display text-[2rem] font-black">${(price! / 100).toFixed(2)}</div>
                  </div>
                  <div className="space-y-2 mb-5">
                    {["Full Collection Access Forever", "Download All Images", "Access On Any Device"].map(f => (
                      <div key={f} className="flex items-center gap-2.5 text-[0.82rem]">
                        <Check className="w-3 h-3 text-green-500 shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                  <button onClick={handlePay} disabled={paying}
                    className="w-full py-3 rounded-xl bg-foreground text-primary-foreground text-[0.88rem] font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                     {paying ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</> : <><CreditCard className="w-4 h-4" />Pay ${(price! / 100).toFixed(2)} — Get Access</>}
                  </button>
                  <button onClick={() => setTab("code")} className="w-full mt-2.5 text-[0.78rem] text-muted hover:text-foreground transition-colors">
                    Have A Code? Enter It Free →
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Collection Form Modal (Create + Edit) ── */
const CollectionFormModal = ({ initial, onClose, onSave }: {
  initial?: Collection; onClose: () => void; onSave: (col: Collection) => void;
}) => {
  const isEdit = !!initial;
  const [colType, setColType] = useState<"saved" | "published">(initial?.type || "saved");
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [visibility, setVisibility] = useState<"public" | "private">(initial?.visibility || "private");
  const [code, setCode] = useState(initial?.accessCode || "");
  const [price, setPrice] = useState(initial?.price ? (initial.price / 100).toFixed(2) : "");
  const [communityId, setCommunityId] = useState(initial?.communityId || "");
  const [aiWriting, setAiWriting] = useState(false);
  const { toast } = useToast();

  const generateDescription = async () => {
    if (!title.trim()) {
      toast({ title: "Name required", description: "Enter a name first so AI can write a description.", variant: "destructive" });
      return;
    }
    setAiWriting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-description", {
        body: { collectionName: title.trim() },
      });
      if (error) throw error;
      if (data?.description) setDesc(data.description);
    } catch (err: any) {
      toast({ title: "AI error", description: err.message || "Could not generate description.", variant: "destructive" });
    } finally {
      setAiWriting(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const community = communities.find(c => c.id === communityId);
    const priceCents = price ? Math.round(parseFloat(price) * 100) : undefined;
    if (isEdit) {
      updateCollection(initial!.id, {
        title: title.trim(), description: desc, visibility,
        accessCode: visibility === "private" ? code.trim() || undefined : undefined,
        price: visibility === "private" ? priceCents : undefined,
        communityId: communityId || undefined,
        communityName: community?.name,
      });
      onSave({ ...initial!, title: title.trim() });
    } else {
      const newCol = addCollection({
        title: title.trim(), description: desc, type: colType, visibility,
        accessCode: visibility === "private" ? code.trim() || undefined : undefined,
        price: visibility === "private" ? priceCents : undefined,
        communityId: communityId || undefined,
        communityName: community?.name,
        collaborators: [], members: 0,
        slug: title.trim().toLowerCase().replace(/\s+/g, "-"),
        imageCount: 0, videoCount: 0, musicCount: 0, thumbs: [], items: [],
        createdAt: new Date().toISOString(),
      });
      onSave(newCol);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[480px] shadow-2xl animate-drop-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/[0.06]">
          <h3 className="font-display text-[1.2rem] font-bold">{isEdit ? "Edit Collection" : "New Collection"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {!isEdit && (
            <div>
              <label className="block text-[0.78rem] font-semibold mb-2">Collection Type</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { val: "saved" as const, label: "Personal Board", desc: "Save images from anywhere" },
                  { val: "published" as const, label: "Published Gallery", desc: "Your original uploads" },
                ]).map(opt => (
                  <button key={opt.val} onClick={() => setColType(opt.val)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${colType === opt.val ? "border-foreground bg-foreground/[0.04]" : "border-foreground/[0.1] hover:border-foreground/25"}`}>
                    <div className="font-semibold text-[0.84rem]">{opt.label}</div>
                    <div className="text-[0.7rem] text-muted">{opt.desc}</div>
                    {colType === opt.val && <Check className="w-3.5 h-3.5 text-accent mt-1" />}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-[0.78rem] font-semibold mb-1.5">Name *</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()} maxLength={60}
              className="w-full bg-card border border-foreground/[0.1] rounded-xl px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
              placeholder="Give your collection a name…" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[0.78rem] font-semibold">Description <span className="font-normal text-muted">(optional)</span></label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiWriting || !title.trim()}
                className="flex items-center gap-1.5 text-[0.75rem] font-medium text-accent hover:text-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {aiWriting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {aiWriting ? "Writing…" : "AI Write"}
              </button>
            </div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              className="w-full bg-card border border-foreground/[0.1] rounded-xl px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-[0.78rem] font-semibold mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: "public" as const, icon: Globe, label: "Public", desc: "Anyone can view" },
                { val: "private" as const, icon: Lock, label: "Private", desc: "Code or purchase required" },
              ]).map(opt => (
                <button key={opt.val} onClick={() => setVisibility(opt.val)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${visibility === opt.val ? "border-foreground bg-foreground/[0.04]" : "border-foreground/[0.1] hover:border-foreground/25"}`}>
                  <opt.icon className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <div className="font-semibold text-[0.84rem]">{opt.label}</div>
                    <div className="text-[0.7rem] text-muted">{opt.desc}</div>
                  </div>
                  {visibility === opt.val && <Check className="w-4 h-4 text-accent ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>
          {visibility === "private" && (
            <>
              <div>
                <label className="block text-[0.78rem] font-semibold mb-1.5">Access Code <span className="font-normal text-muted">(optional — grant free access)</span></label>
                <div className="flex items-center gap-2 h-11 border border-foreground/[0.12] rounded-xl px-4 bg-background focus-within:border-accent transition-colors">
                  <Key className="w-3.5 h-3.5 text-muted shrink-0" />
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. XK9F2M — leave blank for invite-only"
                    className="flex-1 border-none outline-none bg-transparent text-[0.85rem] font-mono tracking-[0.1em] uppercase" maxLength={12} />
                </div>
              </div>
              <div>
                <label className="block text-[0.78rem] font-semibold mb-1.5">Paid Access Price <span className="font-normal text-muted">(optional — charge others for access)</span></label>
                <div className="flex items-center gap-2 h-11 border border-foreground/[0.12] rounded-xl px-4 bg-background focus-within:border-accent transition-colors">
                  <DollarSign className="w-3.5 h-3.5 text-muted shrink-0" />
                  <input value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="0.00 — leave blank for code-only"
                    type="number" min="0" step="0.01"
                    className="flex-1 border-none outline-none bg-transparent text-[0.85rem]" />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-[0.78rem] font-semibold mb-1.5">Add to Community <span className="font-normal text-muted">(optional)</span></label>
            <select value={communityId} onChange={e => setCommunityId(e.target.value)}
              className="w-full bg-card border border-foreground/[0.1] rounded-xl px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors">
              <option value="">— No community —</option>
              {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-foreground/[0.06] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors">Cancel</button>
          <button onClick={handleSave} className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
            {isEdit ? "Save Changes" : "Create Collection"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Share Modal ── */
const ShareModal = ({ col, onClose }: { col: Collection; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [inviteHandle, setInviteHandle] = useState("");
  const [invited, setInvited] = useState<string[]>(col.collaborators || []);
  const url = `${window.location.origin}/collections/${col.id}`;

  const copyUrl = () => { navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const addCollaborator = () => {
    if (inviteHandle.trim() && !invited.includes(inviteHandle.trim())) {
      const n = [...invited, inviteHandle.trim()];
      setInvited(n);
      updateCollection(col.id, { collaborators: n });
      setInviteHandle("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[440px] shadow-2xl animate-drop-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/[0.06]">
          <h3 className="font-display text-[1.15rem] font-bold">Share & Collaborate</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="text-[0.78rem] font-semibold mb-1.5">Share Link</div>
            <div className="flex items-center gap-2 h-11 border border-foreground/[0.12] rounded-xl px-4 bg-background">
              <Link2 className="w-3.5 h-3.5 mr-2 shrink-0 text-muted" />
              <span className="flex-1 text-[0.82rem] truncate text-muted">{url}</span>
              <button onClick={copyUrl} className="flex items-center gap-1 text-[0.78rem] font-medium text-accent hover:text-foreground transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
              </button>
            </div>
          </div>
          {col.accessCode && (
            <div className="flex items-center gap-2 text-[0.82rem] text-muted">
              <Key className="w-3 h-3" />Access code: <span className="font-mono font-bold text-foreground">{col.accessCode}</span>
              <button onClick={() => navigator.clipboard.writeText(col.accessCode!)} className="text-accent hover:underline text-[0.78rem]">copy</button>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 text-[0.78rem] font-semibold mb-1.5"><UserPlus className="w-3.5 h-3.5 text-muted" />Invite Collaborators</div>
            <div className="flex items-center gap-2">
              <input value={inviteHandle} onChange={e => setInviteHandle(e.target.value)} onKeyDown={e => e.key === "Enter" && addCollaborator()}
                placeholder="@username" className="flex-1 bg-card border border-foreground/[0.1] rounded-lg px-3 py-2 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
              <button onClick={addCollaborator} className="px-4 py-2 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-medium hover:bg-accent transition-colors">Add</button>
            </div>
          </div>
          {invited.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {invited.map(h => (
                <span key={h} className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-[0.78rem] font-medium">
                  <ShieldCheck className="w-3 h-3" />{h}
                  <button onClick={() => { const n = invited.filter(x => x !== h); setInvited(n); updateCollection(col.id, { collaborators: n }); }} className="ml-0.5 text-muted hover:text-foreground"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-foreground/[0.06] flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
};

/* ── Merge Modal ── */
const MergeModal = ({ col, myCollections, onClose, onMerged }: {
  col: Collection; myCollections: Collection[]; onClose: () => void; onMerged: () => void;
}) => {
  const others = myCollections.filter(c => c.id !== col.id && !c.archived);
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleMerge = () => {
    if (selected.length === 0) return;
    mergeCollections(col.id, selected);
    setDone(true);
    setTimeout(onMerged, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[440px] shadow-2xl animate-drop-in max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/[0.06]">
          <div>
            <h3 className="font-display text-[1.15rem] font-bold">Merge Into "{col.title}"</h3>
            <p className="text-[0.78rem] text-muted mt-0.5">Selected collections will be merged and removed</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-6">
              <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <div className="font-semibold">Merged successfully!</div>
            </div>
          ) : others.length === 0 ? (
            <p className="text-muted text-[0.88rem] text-center py-6">No other collections to merge.</p>
          ) : (
            <div className="space-y-2">
              {others.map(c => (
                <button key={c.id} onClick={() => toggle(c.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all ${selected.includes(c.id) ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-foreground/20"}`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-foreground/[0.06] shrink-0">
                    {c.thumbs[0] && <img src={`https://images.unsplash.com/${c.thumbs[0]}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[0.85rem] truncate">{c.title}</div>
                    <div className="text-[0.72rem] text-muted">{c.items.length + c.imageCount} items</div>
                  </div>
                  {selected.includes(c.id) && <Check className="w-4 h-4 text-accent shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {!done && (
          <div className="px-6 py-4 border-t border-foreground/[0.06] flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors">Cancel</button>
            <button onClick={handleMerge} disabled={selected.length === 0}
              className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors disabled:opacity-40">
              Merge {selected.length > 0 ? `(${selected.length})` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Featured Card ── */
const curatorColors: Record<string, string> = {
  "REAL ART": "#E8472A", "AI.Verse": "#4361ee", "LuminaAI": "#e76f51",
  "NeoPixel": "#c9184a", "DreamForge": "#2a9d8f", "ChromaLab": "#f4a261",
  "SpectraGen": "#7b2d8b", "VoidArt": "#023e8a", "Synthetix": "#06d6a0",
};
const curatorInits = (name: string) => name.split(/[\s.]+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

const FeaturedCard = ({ col, onNeedAccess, large = false }: {
  col: typeof curatedCollections[0];
  onNeedAccess: (info: { id: string; title: string; price?: number }) => void;
  large?: boolean;
}) => {
  const navigate = useNavigate();
  const isLocked = col.visibility === "private";
  const granted = (() => { try { return (JSON.parse(sessionStorage.getItem("ra_access_granted") || "[]") as string[]).includes(col.id); } catch { return false; } })();
  const needsGate = isLocked && !granted;

  const handleClick = () => {
    if (needsGate) onNeedAccess({ id: col.id, title: col.name, price: col.price });
    else navigate(`/collections/${col.id}`);
  };

  return (
    <div onClick={handleClick} className="group rounded-2xl overflow-hidden border border-foreground/[0.08] bg-card hover:border-foreground/20 hover:-translate-y-1 transition-all cursor-pointer">
      <div className={`relative overflow-hidden ${large ? "h-[240px]" : "h-[200px]"}`}>
        <img src={`https://images.unsplash.com/${col.photo}?w=600&h=${large ? 480 : 400}&fit=crop&q=78`} alt={col.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }} />
        <div className="absolute top-3 left-3">
          <VisBadge visibility={col.visibility} price={col.price} />
        </div>
        {needsGate && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display font-black text-white text-[1.05rem] leading-tight">{col.name}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white" style={{ background: curatorColors[col.curator] || "#666" }}>
              {curatorInits(col.curator)}
            </div>
            <span className="text-[0.8rem] text-muted">by {col.curator.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1 text-[0.72rem] text-muted"><Users className="w-3 h-3" />{col.count}</div>
        </div>
        <div className="flex items-center gap-4 text-[0.75rem] text-muted">
          <span className="flex items-center gap-1"><Image className="w-3 h-3" /> {col.images}</span>
          <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {col.videos}</span>
          <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {col.tracks}</span>
        </div>
      </div>
    </div>
  );
};

/* ── Community Card ── */
const CommunityCard = ({ col, onNeedAccess }: {
  col: typeof communityCollections[0];
  onNeedAccess: (info: { id: string; title: string; price?: number }) => void;
}) => {
  const navigate = useNavigate();
  const isLocked = col.visibility === "private";
  const granted = (() => { try { return (JSON.parse(sessionStorage.getItem("ra_access_granted") || "[]") as string[]).includes(col.id); } catch { return false; } })();
  const needsGate = isLocked && !granted;

  const handleClick = () => {
    if (needsGate) onNeedAccess({ id: col.id, title: col.title, price: col.price });
    else navigate(`/collections/${col.id}`);
  };

  return (
    <div onClick={handleClick} className="group rounded-2xl overflow-hidden border border-foreground/[0.08] bg-card hover:border-foreground/20 hover:-translate-y-1 transition-all cursor-pointer">
      <div className="relative h-[180px] overflow-hidden">
        <img src={`https://images.unsplash.com/${col.cover}?w=600&h=360&fit=crop&q=78`} alt={col.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
        <div className="absolute top-3 left-3">
          <VisBadge visibility={col.visibility} price={col.price} />
        </div>
        {needsGate && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-[1.2rem] font-black text-white leading-tight">{col.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white" style={{ background: col.creatorColor }}>
              {col.creatorInit}
            </div>
            <span className="text-[0.8rem] text-muted">by {col.creator.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1 text-[0.72rem] text-muted"><Users className="w-3 h-3" />{col.followers}</div>
        </div>
        <div className="flex items-center gap-4 text-[0.75rem] text-muted">
          <span className="flex items-center gap-1"><Image className="w-3 h-3" /> {col.images}</span>
          <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {col.videos}</span>
          <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {col.tracks}</span>
        </div>
      </div>
    </div>
  );
};

/* ── My Collection Card ── */
const MyCollectionCard = ({ col, onEdit, onDelete, onShare, onMerge, onArchive }: {
  col: Collection; onEdit: () => void; onDelete: () => void; onShare: () => void; onMerge: () => void; onArchive: () => void;
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const cover = col.thumbs[0] || col.coverPhoto;
  const itemCount = col.items.length || col.imageCount;

  return (
    <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] bg-card hover:border-foreground/[0.14] transition-all hover:-translate-y-1 group">
      {/* Cover */}
      <div className="h-[180px] overflow-hidden bg-foreground/[0.04] relative cursor-pointer" onClick={() => navigate(`/collections/${col.id}`)}>
        {cover ? (
          <img src={`https://images.unsplash.com/${cover}?w=400&h=180&fit=crop&q=80`} alt={col.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="w-10 h-10 text-muted opacity-20" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <VisBadge visibility={col.visibility} price={col.price} />
          {col.archived && (
            <span className="flex items-center gap-1 bg-foreground/70 backdrop-blur-sm text-white text-[0.6rem] font-bold px-2 py-1 rounded-md">
              <Archive className="w-2.5 h-2.5" />Archived
            </span>
          )}
          {col.communityName && (
            <span className="flex items-center gap-1 bg-foreground/70 backdrop-blur-sm text-white text-[0.6rem] font-bold px-2 py-1 rounded-md">
              <Users className="w-2.5 h-2.5" />{col.communityName}
            </span>
          )}
        </div>
        {/* Context menu */}
        <div ref={menuRef} className="absolute top-2.5 right-2.5">
          <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
            <MoreHorizontal className="w-3.5 h-3.5 text-white" />
          </button>
          {menuOpen && (
            <div className="absolute top-9 right-0 bg-background border border-foreground/[0.1] rounded-xl shadow-lg py-1.5 w-48 z-20 animate-drop-in">
              {[
                { icon: Edit3, label: "Edit", action: onEdit },
                { icon: Share2, label: "Share & Invite", action: onShare },
                { icon: Merge, label: "Merge Into…", action: onMerge },
                { icon: col.archived ? ArchiveRestore : Archive, label: col.archived ? "Unarchive" : "Archive", action: onArchive },
                { icon: Trash2, label: "Delete", action: onDelete, danger: true },
              ].map(item => (
                <button key={item.label} onClick={e => { e.stopPropagation(); setMenuOpen(false); item.action(); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[0.82rem] transition-colors text-left ${
                    (item as any).danger ? "text-destructive hover:bg-destructive/[0.08]" : "text-foreground hover:bg-foreground/[0.05]"
                  }`}>
                  <item.icon className="w-3.5 h-3.5 opacity-60 shrink-0" />{item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Thumb strip */}
      {col.thumbs.length > 1 && (() => {
        const availableThumbs = col.thumbs.slice(1);
        const showCount = availableThumbs.length > 0 ? Math.min(Math.max(availableThumbs.length, 1), 6) : 0;
        const thumbsToShow = [...availableThumbs];
        while (thumbsToShow.length < showCount && availableThumbs.length > 0) {
          thumbsToShow.push(availableThumbs[thumbsToShow.length % availableThumbs.length]);
        }
        return (
          <div className="flex gap-1 px-2 -mt-5 relative z-10">
            {thumbsToShow.slice(0, showCount).map((t, i) => (
              <div key={i} className="w-[48px] h-[48px] rounded-md overflow-hidden border-2 border-card shrink-0">
                <img src={`https://images.unsplash.com/${t}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );
      })()}
      <div className="p-4">
        <h3 className="font-semibold text-[0.92rem] truncate">{col.title}</h3>
        <div className="flex items-center gap-2 text-[0.72rem] text-muted mt-1">
          <span>{itemCount} items</span>
          {col.collaborators && col.collaborators.length > 0 && (
            <span className="flex items-center gap-1"><UserPlus className="w-3 h-3" />{col.collaborators.length} collab{col.collaborators.length > 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
export default function CollectionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"discover" | "mine">("discover");
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editCol, setEditCol] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [shareCol, setShareCol] = useState<Collection | null>(null);
  const [mergeCol, setMergeCol] = useState<Collection | null>(null);
  const [accessCol, setAccessCol] = useState<{ id: string; title: string; price?: number } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [sortMine, setSortMine] = useState<"newest" | "name" | "size">("newest");
  const [myCollections, setMyCollections] = useState<Collection[]>(() => getCollections());

  const refresh = () => setMyCollections(getCollections());

  useEffect(() => { try { sessionStorage.setItem("ra_visited_collections", "1"); } catch {} }, []);

  useEffect(() => {
    const sync = () => refresh();
    window.addEventListener("ra_collections_changed", sync);
    return () => window.removeEventListener("ra_collections_changed", sync);
  }, []);

  const activeCollections = myCollections.filter(c => !c.archived);
  const archivedCollections = myCollections.filter(c => c.archived);

  const filteredCurated = curatedCollections.filter(c => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchQ = !query || c.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const filteredCommunity = communityCollections.filter(b => {
    const matchCat = activeCategory === "All" || b.category === activeCategory;
    const matchQ = !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.creator.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const filteredMine = activeCollections
    .filter(c => !query || c.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortMine === "name") return a.title.localeCompare(b.title);
      if (sortMine === "size") return b.items.length - a.items.length;
      return 0;
    });

  const discoverFeatured = filteredCurated.filter(c => c.featured);
  const discoverCurated = filteredCurated.filter(c => !c.featured);

  const handleArchive = (col: Collection) => {
    if (col.archived) unarchiveCollection(col.id);
    else archiveCollection(col.id);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteCollection(id);
    refresh();
    setDeleteTarget(null);
  };

  return (
    <PageShell>
      <div className="px-6 md:px-10 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">Collections</h1>
          <p className="text-[0.82rem] text-muted mt-1">Public galleries, private vaults, and personal boards</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-card border border-foreground/[0.12] rounded-xl px-4 h-11 w-full md:w-72 focus-within:border-foreground transition-colors">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input className="flex-1 border-none outline-none font-body text-[0.88rem] bg-transparent" placeholder="Search collections…"
              value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button onClick={() => setQuery("")} className="text-muted hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent transition-colors shrink-0">
            <Plus className="w-4 h-4" /> New Collection
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-foreground/[0.06]">
        <div className="px-6 md:px-10 flex items-center gap-0">
          {TABS.map(t => {
            const Icon = t.icon;
            const count = t.id === "mine" ? activeCollections.length : communityCollections.length + curatedCollections.length;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[0.86rem] font-medium border-b-2 -mb-px transition-colors ${activeTab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {count > 0 && (
                  <span className="text-[0.68rem] bg-foreground/10 text-foreground px-1.5 py-0.5 rounded-md font-bold">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter */}
      {activeTab !== "mine" && (
        <div className="border-b border-foreground/[0.06]">
          <div className="px-6 md:px-10 py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat, i) => (
              <React.Fragment key={cat}>
                <button onClick={() => setActiveCategory(cat)}
                  className={`border px-4 py-1.5 rounded-lg text-[0.79rem] font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat ? "bg-foreground text-primary-foreground border-foreground" : "bg-transparent border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"
                  }`}>
                  {cat}
                </button>
                {i === 0 && <div className="w-px h-4 bg-foreground/[0.1] shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 md:px-10 py-8">
        {/* ALL COLLECTIONS TAB */}
        {activeTab === "discover" && (
          <>
            {/* Featured */}
            {discoverFeatured.length > 0 && query === "" && activeCategory === "All" && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-4 h-4 text-accent" />
                  <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent">Featured</div>
                  <div className="flex-1 h-px bg-foreground/[0.06]" />
                </div>
                <h2 className="font-display text-[1.8rem] font-black tracking-[-0.02em] mb-5">Editor's Picks</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {discoverFeatured.map(c => (
                    <FeaturedCard key={c.id} col={c} onNeedAccess={setAccessCol} />
                  ))}
                </div>
              </div>
            )}

            {/* Community */}
            {filteredCommunity.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-muted">From the Community</div>
                  <div className="flex-1 h-px bg-foreground/[0.06]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCommunity.map(b => (
                    <CommunityCard key={b.id} col={b} onNeedAccess={setAccessCol} />
                  ))}
                </div>
              </div>
            )}

            {/* More Curated */}
            {discoverCurated.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-muted">More Curated Collections</div>
                  <div className="flex-1 h-px bg-foreground/[0.06]" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {discoverCurated.map(col => (
                    <FeaturedCard key={col.id} col={col} onNeedAccess={setAccessCol} />
                  ))}
                </div>
              </div>
            )}

            {filteredCurated.length === 0 && filteredCommunity.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-8 h-8 text-muted opacity-20 mx-auto mb-3" />
                <div className="font-display text-[1.4rem] font-black mb-1">No collections found</div>
                <p className="text-muted text-[0.85rem]">Try different keywords or clear the filter</p>
              </div>
            )}
          </>
        )}

        {/* MY COLLECTIONS TAB */}
        {activeTab === "mine" && (
          <>
            {filteredMine.length === 0 && archivedCollections.length === 0 ? (
              <div className="text-center py-20">
                <Bookmark className="w-10 h-10 text-muted mx-auto mb-4 opacity-30" />
                <h2 className="font-display text-[1.6rem] font-black mb-2">No collections yet</h2>
                <p className="text-muted text-[0.88rem] mb-6">Create your first collection or save images from the gallery</p>
                <button onClick={() => setCreateOpen(true)}
                  className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" /> Create Collection
                </button>
              </div>
            ) : (
              <>
                {/* Sort bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-[0.82rem] text-muted">{filteredMine.length} collection{filteredMine.length !== 1 ? "s" : ""}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.75rem] text-muted mr-1">Sort:</span>
                    {([["newest", "Newest"], ["name", "Name"], ["size", "Most saved"]] as const).map(([v, l]) => (
                      <button key={v} onClick={() => setSortMine(v)}
                        className={`px-3 py-1 rounded-lg text-[0.76rem] font-medium transition-colors ${sortMine === v ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredMine.map(col => (
                    <MyCollectionCard key={col.id} col={col}
                      onEdit={() => setEditCol(col)}
                      onDelete={() => setDeleteTarget(col)}
                      onShare={() => setShareCol(col)}
                      onMerge={() => setMergeCol(col)}
                      onArchive={() => handleArchive(col)} />
                  ))}
                  <button onClick={() => setCreateOpen(true)}
                    className="rounded-2xl border-2 border-dashed border-foreground/[0.1] flex flex-col items-center justify-center hover:border-foreground/25 hover:bg-foreground/[0.02] transition-colors min-h-[240px] group">
                    <Plus className="w-6 h-6 text-muted group-hover:text-foreground transition-colors mb-2" />
                    <span className="text-[0.82rem] text-muted group-hover:text-foreground font-medium">New Collection</span>
                  </button>
                </div>

                {/* Archived */}
                {archivedCollections.length > 0 && (
                  <div className="mt-8">
                    <button onClick={() => setShowArchived(!showArchived)}
                      className="flex items-center gap-2 text-[0.82rem] font-medium text-muted hover:text-foreground transition-colors mb-4">
                      <Archive className="w-3.5 h-3.5" />
                      {showArchived ? "Hide" : "Show"} Archived ({archivedCollections.length})
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showArchived ? "rotate-90" : ""}`} />
                    </button>
                    {showArchived && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {archivedCollections.map(col => (
                          <MyCollectionCard key={col.id} col={col}
                            onEdit={() => setEditCol(col)}
                            onDelete={() => setDeleteTarget(col)}
                            onShare={() => setShareCol(col)}
                            onMerge={() => setMergeCol(col)}
                            onArchive={() => handleArchive(col)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {createOpen && (
        <CollectionFormModal onClose={() => setCreateOpen(false)}
          onSave={col => { refresh(); setCreateOpen(false); navigate(`/collections/${col.id}`); }} />
      )}
      {editCol && (
        <CollectionFormModal initial={editCol} onClose={() => setEditCol(null)}
          onSave={() => { refresh(); setEditCol(null); }} />
      )}
      {shareCol && <ShareModal col={shareCol} onClose={() => setShareCol(null)} />}
      {mergeCol && (
        <MergeModal col={mergeCol} myCollections={myCollections} onClose={() => setMergeCol(null)}
          onMerged={() => { refresh(); setMergeCol(null); }} />
      )}
      {accessCol && (
        <AccessModal id={accessCol.id} title={accessCol.title} price={accessCol.price}
          onClose={() => setAccessCol(null)}
          onGranted={() => { setAccessCol(null); navigate(`/collections/${accessCol.id}`); }} />
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[400px] shadow-2xl animate-drop-in p-6 text-center" onClick={e => e.stopPropagation()}>
            <Trash2 className="w-5 h-5 text-destructive mx-auto mb-4" />
            <h3 className="font-display text-[1.2rem] font-bold mb-2">Delete "{deleteTarget.title}"?</h3>
            <p className="text-[0.85rem] text-muted mb-1">All {deleteTarget.items.length} saved images will be permanently removed.</p>
            <p className="text-[0.78rem] text-muted/70 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 py-3 rounded-xl bg-destructive text-white text-[0.88rem] font-semibold hover:bg-destructive/90 transition-colors">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="px-5 py-3 rounded-xl border border-foreground/[0.12] text-[0.88rem] font-medium hover:border-foreground/30 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </PageShell>
  );
}
