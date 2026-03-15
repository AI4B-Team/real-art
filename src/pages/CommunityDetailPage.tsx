import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Users, Globe, Plus, Key, Shield, Share2, Lock, Star, Settings, Lightbulb, Check, X as XIcon } from "lucide-react";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const communitiesData = [
  {
    id: "1", name: "Avatar Architects", category: "Portraits", free: false,
    desc: "The premier community for AI avatar and digital portrait creation. Inside you'll find a curated prompt library of 500+ tested avatar prompts, weekly tutorials, creator showcases, and a private channel for feedback and collaboration. Membership includes access to our exclusive Avatar Essentials prompt pack.",
    members: 2840, images: 4200, owner: "LuminaAI", ownerColor: "#e76f51", ownerInit: "LA",
    coverPhoto: "photo-1604881991720-f91add269bed",
    tags: ["Avatars", "Portraits", "AI Art", "Prompts"],
    rules: ["Be respectful and constructive", "Only post original AI-generated work", "Credit your tools and prompts when sharing", "No NSFW content"],
    collectionPermission: "moderators" as const,
  },
  {
    id: "2", name: "Abstract Minds", category: "Abstract", free: true,
    desc: "A vibrant open community for abstract AI artists. We do weekly drops, monthly challenges, and member showcases. No rules on style — if it's abstract and it's yours, it belongs here.",
    members: 5120, images: 9800, owner: "SpectraGen", ownerColor: "#7b2d8b", ownerInit: "SG",
    coverPhoto: "photo-1618005182384-a83a8bd57fbe",
    tags: ["Abstract", "Fluid Art", "Generative", "Open"],
    rules: ["Post original work only", "Weekly drop participation encouraged", "Constructive feedback only"],
    collectionPermission: "moderators" as const,
  },
];

const photos = [
  "photo-1618005182384-a83a8bd57fbe","photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab","photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85","photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9","photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809","photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b","photo-1576091160550-2173dba999ef",
];

const heights = [210, 260, 175, 235, 185, 255, 165, 215, 150, 240, 195, 170];

const members = [
  { name: "AI.Verse", init: "AV", color: "#4361ee", images: 84 },
  { name: "NeoPixel", init: "NP", color: "#c9184a", images: 62 },
  { name: "DreamForge", init: "DF", color: "#2a9d8f", images: 119 },
  { name: "LuminaAI", init: "LA", color: "#e76f51", images: 97 },
  { name: "SpectraGen", init: "SG", color: "#7b2d8b", images: 45 },
  { name: "VoidArt", init: "VA", color: "#023e8a", images: 73 },
];

const communityCollections: Record<string, { name: string; count: number; photo: string; curator: string }[]> = {
  "1": [
    { name: "Portrait Masterclass", count: 86, photo: "photo-1573496359142-b8d87734a5a2", curator: "LuminaAI" },
    { name: "Cyberpunk Avatars", count: 124, photo: "photo-1579546929518-9e396f3cc809", curator: "NeoPixel" },
    { name: "Ethereal Faces", count: 63, photo: "photo-1544005313-94ddf0286df2", curator: "DreamForge" },
    { name: "Neon Portraits", count: 97, photo: "photo-1557682250-33bd709cbe85", curator: "AI.Verse" },
  ],
  "2": [
    { name: "Fluid Gradients", count: 152, photo: "photo-1541701494587-cb58502866ab", curator: "SpectraGen" },
    { name: "Cosmic Abstractions", count: 89, photo: "photo-1618005182384-a83a8bd57fbe", curator: "VoidArt" },
    { name: "Geometric Dreams", count: 71, photo: "photo-1557682250-33bd709cbe85", curator: "AI.Verse" },
    { name: "Color Explosions", count: 108, photo: "photo-1576091160550-2173dba999ef", curator: "DreamForge" },
  ],
};

const CommunityDetailPage = () => {
  const { id } = useParams();
  const community = communitiesData.find(c => c.id === id) || communitiesData[0];
  const [joined, setJoined] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Gallery");
  const [collectionPerm, setCollectionPerm] = useState<"owner" | "moderators" | "any_member">(community.collectionPermission);
  const [requestName, setRequestName] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [requests, setRequests] = useState([
    { id: "r1", name: "Portrait Lighting", by: "NeoPixel", status: "pending" as const },
    { id: "r2", name: "AI Fashion Editorial", by: "DreamForge", status: "pending" as const },
    { id: "r3", name: "Luxury Interiors", by: "AI.Verse", status: "approved" as const },
  ]);
  const tabs = ["Gallery", "Collections", "Members", "About", "Settings"];
  const collections = communityCollections[community.id] || communityCollections["2"];

  const handleJoin = () => {
    if (!community.free) {
      setShowCodeModal(true);
    } else {
      setJoined(true);
    }
  };

  const handleCodeSubmit = () => {
    if (codeInput.length > 0) {
      setJoined(true);
      setShowCodeModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Cover image */}
        <div className="h-[260px] md:h-[340px] relative overflow-hidden">
          <img
            src={`https://images.unsplash.com/${community.coverPhoto}?w=1400&h=340&fit=crop&q=85`}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6 max-w-[1440px] mx-auto">
            <div>
              <div className="flex items-center gap-2 text-[0.8rem] text-white/70 mb-2">
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Home
                </Link>
                <ChevronRight className="w-3 h-3 opacity-50" />
                <Link to="/communities" className="hover:text-white transition-colors">Communities</Link>
                <ChevronRight className="w-3 h-3 opacity-50" />
                <span className="text-white">{community.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[0.65rem] font-bold px-2.5 py-1 rounded-md tracking-[0.06em] uppercase ${community.free ? "bg-[rgba(15,180,90,0.9)] text-white" : "bg-black/60 text-white/90"}`}>
                  {community.free ? "Free" : "Private"}
                </span>
                <span className="text-[0.72rem] text-white/60">{community.category}</span>
              </div>
              <h1 className="font-display text-[2.4rem] md:text-[3rem] font-black text-white tracking-[-0.03em] leading-none">{community.name}</h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-foreground/[0.06]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
                <Users className="w-4 h-4" />
                <strong className="text-foreground">{community.members.toLocaleString()}</strong> members
              </div>
              <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
                <Globe className="w-4 h-4" />
                <strong className="text-foreground">{community.images.toLocaleString()}</strong> images
              </div>
              <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-white" style={{ background: community.ownerColor }}>
                  {community.ownerInit}
                </div>
                by <strong className="text-foreground">{community.owner}</strong>
              </div>
            </div>
            <div className="flex gap-2">
              {!joined ? (
                <button
                  onClick={handleJoin}
                  className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors"
                >
                  {community.free ? <><Plus className="w-4 h-4" /> Join Free</> : <><Key className="w-4 h-4" /> Enter Code</>}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-accent/10 text-accent px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold border border-accent/20">
                  <Shield className="w-4 h-4" /> Member
                </div>
              )}
              <button className="w-10 h-10 rounded-lg border border-foreground/[0.12] flex items-center justify-center hover:border-foreground/30 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-foreground/[0.06]">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[0.85rem] font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-8 pb-16">
            {activeTab === "Gallery" && (
              <>
                {(!community.free && !joined) ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-foreground/[0.06] flex items-center justify-center mb-5">
                      <Lock className="w-7 h-7 text-muted" />
                    </div>
                    <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] mb-3">This gallery is private</h2>
                    <p className="text-muted text-[0.88rem] max-w-[380px] leading-[1.65] mb-6">
                      Enter the access code shared by the gallery owner to view the full image library and prompt collection.
                    </p>
                    <button
                      onClick={() => setShowCodeModal(true)}
                      className="flex items-center gap-2 bg-foreground text-primary-foreground px-6 py-3 rounded-lg text-[0.86rem] font-semibold hover:bg-accent transition-colors"
                    >
                      <Key className="w-4 h-4" /> Enter Access Code
                    </button>
                  </div>
                ) : (
                  <div className="masonry-grid">
                    {photos.map((photo, i) => (
                      <Link key={i} to={`/image/${i}`} className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative">
                        <img
                          src={`https://images.unsplash.com/${photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                          alt="" loading="lazy"
                          className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                          style={{ height: heights[i % heights.length], objectFit: "cover" }}
                        />
                        <ImageCardOverlay index={i} />
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "Collections" && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Community Curated</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {collections.map(col => (
                    <Link key={col.name} to="/collections" className="cursor-pointer group block no-underline">
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2.5 relative">
                        <img
                          src={`https://images.unsplash.com/${col.photo}?w=400&h=530&fit=crop&q=78`}
                          alt={col.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)" }} />
                      </div>
                      <p className="font-semibold text-[0.92rem]">{col.name}</p>
                      <p className="text-[0.75rem] text-muted mt-0.5">by {col.curator} · {col.count} images</p>
                    </Link>
                  ))}
                </div>

                {/* Request a Collection */}
                {joined && (
                  <div className="mt-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4 text-accent" />
                      <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Suggest</span>
                    </div>
                    <h3 className="font-display text-[1.4rem] font-black tracking-[-0.03em] mb-4">Request a Collection</h3>
                    <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 max-w-[480px]">
                      <input
                        type="text"
                        value={requestName}
                        onChange={e => setRequestName(e.target.value)}
                        placeholder="Collection name idea…"
                        maxLength={80}
                        className="w-full h-11 px-4 rounded-lg border border-foreground/[0.12] bg-background text-[0.88rem] font-body outline-none focus:border-foreground transition-colors mb-3"
                      />
                      <textarea
                        value={requestDesc}
                        onChange={e => setRequestDesc(e.target.value)}
                        placeholder="Brief description (optional)"
                        maxLength={200}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border border-foreground/[0.12] bg-background text-[0.88rem] font-body outline-none focus:border-foreground transition-colors resize-none mb-3"
                      />
                      <button
                        onClick={() => {
                          if (requestName.trim()) {
                            setRequests(prev => [...prev, { id: `r${Date.now()}`, name: requestName.trim(), by: "You", status: "pending" }]);
                            setRequestName("");
                            setRequestDesc("");
                          }
                        }}
                        disabled={!requestName.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Lightbulb className="w-3.5 h-3.5" /> Submit Request
                      </button>
                    </div>

                    {/* Pending requests visible to members */}
                    {requests.filter(r => r.status === "pending").length > 0 && (
                      <div className="mt-6">
                        <div className="text-[0.75rem] font-semibold text-muted mb-3">Pending Requests</div>
                        <div className="flex flex-col gap-2 max-w-[480px]">
                          {requests.filter(r => r.status === "pending").map(r => (
                            <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl border border-foreground/[0.08] bg-card">
                              <div>
                                <div className="font-semibold text-[0.85rem]">{r.name}</div>
                                <div className="text-[0.72rem] text-muted">by {r.by}</div>
                              </div>
                              <span className="text-[0.7rem] font-medium text-muted bg-foreground/[0.06] px-2.5 py-1 rounded-lg">Pending</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Members" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map(m => (
                  <div key={m.name} className="bg-card border border-foreground/[0.08] rounded-xl p-4 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-[0.7rem] font-bold text-white mx-auto mb-3" style={{ background: m.color }}>
                      {m.init}
                    </div>
                    <div className="font-semibold text-[0.88rem]">{m.name}</div>
                    <div className="text-[0.75rem] text-muted">{m.images} images</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "About" && (
              <div className="max-w-[600px]">
                <p className="text-[0.88rem] text-muted leading-[1.7] mb-6">{community.desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {community.tags.map(tag => (
                    <span key={tag} className="text-[0.78rem] font-medium px-3 py-1.5 rounded-md bg-card border border-foreground/[0.1] text-muted">{tag}</span>
                  ))}
                </div>
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-4">
                  <div className="font-semibold text-[0.88rem] mb-3">Community Rules</div>
                  <div className="flex flex-col gap-2">
                    {community.rules.map((rule, i) => (
                      <div key={i} className="text-[0.78rem] text-muted">{i + 1}. {rule}</div>
                    ))}
                  </div>
                </div>
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                  <div className="text-[0.75rem] text-muted mb-2">Community Owner</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-white" style={{ background: community.ownerColor }}>
                      {community.ownerInit}
                    </div>
                    <div>
                      <div className="font-semibold text-[0.85rem]">{community.owner}</div>
                      <div className="text-[0.72rem] text-muted">Gallery owner</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="max-w-[600px]">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-muted" />
                  <h2 className="font-display text-[1.6rem] font-black tracking-[-0.03em]">Community Settings</h2>
                </div>

                {/* Collection permissions */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-4">
                  <div className="font-semibold text-[0.88rem] mb-1">Who can create collections?</div>
                  <p className="text-[0.75rem] text-muted mb-4">Control who is allowed to create new collections inside this community.</p>
                  <div className="flex flex-col gap-2">
                    {([
                      { value: "owner" as const, label: "Owner only", desc: "Only you can create collections" },
                      { value: "moderators" as const, label: "Moderators", desc: "Owner and moderators can create collections" },
                      { value: "any_member" as const, label: "Any member", desc: "All community members can create collections" },
                    ]).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setCollectionPerm(opt.value)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${collectionPerm === opt.value ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-foreground/20"}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${collectionPerm === opt.value ? "border-accent" : "border-foreground/20"}`}>
                          {collectionPerm === opt.value && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                        <div>
                          <div className="font-semibold text-[0.85rem]">{opt.label}</div>
                          <div className="text-[0.72rem] text-muted">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[0.72rem] text-muted">Settings are only visible to the community owner.</p>
              </div>
            )}
          </div>
        </div>

        {/* Code modal */}
        {showCodeModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <div className="bg-card rounded-2xl p-8 w-full max-w-[400px] mx-4 shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
              <div className="w-12 h-12 rounded-xl bg-foreground/[0.06] flex items-center justify-center mb-5">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="font-display text-[1.5rem] font-black tracking-[-0.03em] mb-2">Enter Access Code</h2>
              <p className="text-[0.82rem] text-muted mb-5 leading-[1.65]">
                This gallery is private. Enter the code provided by the gallery owner to gain access.
              </p>
              <input
                autoFocus
                className="w-full h-11 border border-foreground/[0.13] rounded-xl px-4 font-body text-[0.9rem] bg-background outline-none focus:border-foreground transition-colors mb-3 font-semibold text-center tracking-[0.12em]"
                placeholder="Enter code…"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCodeSubmit()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCodeSubmit}
                  className="flex-1 bg-foreground text-primary-foreground py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors"
                >
                  Unlock Gallery
                </button>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-foreground/[0.12] text-[0.84rem] font-medium hover:border-foreground/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default CommunityDetailPage;
