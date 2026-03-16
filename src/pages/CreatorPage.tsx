import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Globe, Link2, Grid3X3, Bookmark, Download, Share2, Award, Eye, RefreshCw, Star,
  TrendingUp, Users, Palette, MapPin, Calendar, ExternalLink, Zap, Mail, Coffee, X, Check, Copy,
  UserCheck, MessageCircle, Heart, Lock, Globe2, Play
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import { getBoards, type Board } from "@/lib/boardStore";
import { getCollections, type Collection } from "@/lib/collectionStore";

/* ── Social icon map ── */
const TwitterIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
);
const YouTubeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const TikTokIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9a6.34 6.34 0 1 0 5.45 6.28V9.44a8.16 8.16 0 0 0 4.77 1.52V7.5a4.85 4.85 0 0 1-1-.81z"/></svg>
);
const LinkedInIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.958 20.452H3.718V9h3.24v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const DiscordIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
);

const socialIcons: Record<string, { icon: any; base?: string }> = {
  twitter: { icon: TwitterIcon, base: "https://x.com/" },
  instagram: { icon: InstagramIcon, base: "https://instagram.com/" },
  youtube: { icon: YouTubeIcon, base: "https://youtube.com/@" },
  tiktok: { icon: TikTokIcon, base: "https://tiktok.com/@" },
  linkedin: { icon: LinkedInIcon, base: "https://linkedin.com/in/" },
  discord: { icon: DiscordIcon },
};

/* ── Creator data ── */
const creatorsData = [
  {
    id: "1", name: "AI.Verse", handle: "@aiverse", avatar: "AV", color: "#4361ee",
    banner: "photo-1618005182384-a83a8bd57fbe",
    bio: "Generative art explorer specializing in cosmic and abstract digital landscapes. I push the boundaries of what AI can visualize — from deep space visions to microscopic worlds. Available for commissions, brand collabs, and print licensing. DM or email to connect.",
    location: "San Francisco, CA", joined: "January 2024", website: "aiverse.art",
    social: { twitter: "aiverseart", instagram: "aiverse", youtube: "aiverse", tiktok: "aiverse.art", linkedin: "", discord: "AI.Verse#1234" },
    followers: 12400, following: 284, images: 284, downloads: "4.2M", views: "18.6M", remixes: "8.4K",
    commissions: "open" as const,
    tools: ["Midjourney", "DALL-E 3", "Stable Diffusion", "Adobe Firefly"],
    styles: ["Cosmic", "Abstract", "Sci-Fi", "Surreal", "Generative"],
    badges: [
      { icon: Award, label: "Top Creator" },
      { icon: Users, label: "10K+ Followers" },
      { icon: TrendingUp, label: "Trending" },
      { icon: Palette, label: "Style Pioneer" },
    ],
    pinnedImage: { photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", id: "0", downloads: "3,412", views: "48,201", likes: "847" },
    photos: [
      "photo-1618005182384-a83a8bd57fbe","photo-1558618666-fcd25c85cd64",
      "photo-1541701494587-cb58502866ab","photo-1549880338-65ddcdfd017b",
      "photo-1557682250-33bd709cbe85","photo-1506905925346-21bda4d32df4",
      "photo-1518020382113-a7e8fc38eac9","photo-1547036967-23d11aacaee0",
      "photo-1579546929518-9e396f3cc809","photo-1604881991720-f91add269bed",
      "photo-1501854140801-50d01698950b","photo-1576091160550-2173dba999ef",
    ],
    collections: [
      { name: "Cosmic Visions", cover: "photo-1618005182384-a83a8bd57fbe", count: 56, free: true },
      { name: "Abstract Realms", cover: "photo-1541701494587-cb58502866ab", count: 34, free: false },
      { name: "Deep Space", cover: "photo-1579546929518-9e396f3cc809", count: 28, free: true },
    ],
    boards: [
      { title: "Inspiration", cover: "photo-1549880338-65ddcdfd017b", items: 12, visibility: "private" },
      { title: "Color Studies", cover: "photo-1576091160550-2173dba999ef", items: 8, visibility: "public" },
    ],
    communities: [
      { name: "AI Artists Collective", members: "4.2K", cover: "photo-1557682250-33bd709cbe85" },
      { name: "Generative Art Lab", members: "2.8K", cover: "photo-1618005182384-a83a8bd57fbe" },
    ],
    liked: ["photo-1557682250-33bd709cbe85", "photo-1576091160550-2173dba999ef", "photo-1549880338-65ddcdfd017b", "photo-1518020382113-a7e8fc38eac9", "photo-1547036967-23d11aacaee0", "photo-1604881991720-f91add269bed"],
  },
  {
    id: "2", name: "NeoPixel", handle: "@neopixel", avatar: "NP", color: "#c9184a",
    banner: "photo-1557682250-33bd709cbe85",
    bio: "Cyberpunk visuals and neon-drenched futures. I build tomorrow's cities today — one prompt at a time. Specializing in urban dystopia, retrofuturism, and digital noir. Open for print licensing.",
    location: "Tokyo, Japan", joined: "March 2024", website: "neopixel.io",
    social: { twitter: "neopixelart", instagram: "neopixel.art", youtube: "", tiktok: "", linkedin: "", discord: "" },
    followers: 9800, following: 156, images: 196, downloads: "2.8M", views: "12.1M", remixes: "5.2K",
    commissions: "closed" as const,
    tools: ["Midjourney", "Stable Diffusion XL", "ControlNet"],
    styles: ["Cyberpunk", "Neon", "Urban", "Noir", "Retrofuturism"],
    badges: [
      { icon: TrendingUp, label: "Trending" },
      { icon: Download, label: "2M+ Downloads" },
    ],
    pinnedImage: { photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", id: "4", downloads: "2,180", views: "31,400", likes: "612" },
    photos: [
      "photo-1557682250-33bd709cbe85","photo-1579546929518-9e396f3cc809",
      "photo-1547036967-23d11aacaee0","photo-1576091160550-2173dba999ef",
      "photo-1506905925346-21bda4d32df4","photo-1549880338-65ddcdfd017b",
      "photo-1618005182384-a83a8bd57fbe","photo-1518020382113-a7e8fc38eac9",
      "photo-1541701494587-cb58502866ab",
    ],
    collections: [
      { name: "Neon Streets", cover: "photo-1557682250-33bd709cbe85", count: 44, free: true },
      { name: "Cyber Tokyo", cover: "photo-1579546929518-9e396f3cc809", count: 22, free: false },
    ],
    boards: [
      { title: "References", cover: "photo-1576091160550-2173dba999ef", items: 8, visibility: "public" },
    ],
    communities: [
      { name: "AI Artists Collective", members: "4.2K", cover: "photo-1557682250-33bd709cbe85" },
      { name: "Generative Art Lab", members: "2.8K", cover: "photo-1618005182384-a83a8bd57fbe" },
    ],
    liked: ["photo-1618005182384-a83a8bd57fbe", "photo-1541701494587-cb58502866ab", "photo-1604881991720-f91add269bed"],
  },
  {
    id: "3", name: "DreamForge", handle: "@dreamforge", avatar: "DF", color: "#2a9d8f",
    banner: "photo-1579546929518-9e396f3cc809",
    bio: "Fantasy landscapes, mythical worlds, and surreal dreamscapes. Every image is a portal to somewhere impossible.",
    location: "London, UK", joined: "February 2024", website: "dreamforge.co",
    social: { twitter: "dreamforgeart", instagram: "dreamforge", youtube: "", tiktok: "", linkedin: "", discord: "DreamForge#5678" },
    followers: 7300, following: 412, images: 421, downloads: "1.9M", views: "9.4M", remixes: "3.8K",
    commissions: "waitlist" as const,
    tools: ["DALL-E 3", "Adobe Firefly", "Leonardo AI"],
    styles: ["Fantasy", "Mythical", "Surreal", "Dreamscape", "Nature"],
    badges: [
      { icon: Palette, label: "Style Pioneer" },
      { icon: Users, label: "7K+ Followers" },
    ],
    pinnedImage: { photo: "photo-1579546929518-9e396f3cc809", title: "Dream Portal", id: "8", downloads: "1,940", views: "26,800", likes: "534" },
    photos: [
      "photo-1579546929518-9e396f3cc809","photo-1618005182384-a83a8bd57fbe",
      "photo-1541701494587-cb58502866ab","photo-1604881991720-f91add269bed",
      "photo-1501854140801-50d01698950b","photo-1543722530-d2c3201371e7",
      "photo-1547036967-23d11aacaee0","photo-1506905925346-21bda4d32df4",
    ],
    collections: [
      { name: "Fantasy Worlds", cover: "photo-1579546929518-9e396f3cc809", count: 35, free: true },
    ],
    boards: [],
    communities: [
      { name: "Fantasy Art Hub", members: "3.4K", cover: "photo-1579546929518-9e396f3cc809" },
    ],
    liked: ["photo-1557682250-33bd709cbe85", "photo-1576091160550-2173dba999ef", "photo-1549880338-65ddcdfd017b", "photo-1518020382113-a7e8fc38eac9"],
  },
];

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "images", label: "Images", icon: Grid3X3 },
  { id: "collections", label: "Collections", icon: Bookmark },
  { id: "boards", label: "Boards", icon: Bookmark },
  { id: "communities", label: "Communities", icon: Users },
  { id: "liked", label: "Liked", icon: Heart },
  { id: "about", label: "About", icon: Eye },
];

const commissionLabels: Record<string, { label: string; color: string }> = {
  open: { label: "Open for commissions", color: "text-green-600 bg-green-50 border-green-200" },
  closed: { label: "Commissions closed", color: "text-muted bg-foreground/[0.04] border-foreground/[0.08]" },
  waitlist: { label: "Commissions — waitlist", color: "text-amber-600 bg-amber-50 border-amber-200" },
};

const heights = [220, 260, 190, 240, 180, 210, 250, 170, 230, 200, 265, 185];

const CreatorPage = () => {
  const { id } = useParams();
  const creator = creatorsData.find(c => c.id === id) || creatorsData[0];
  const [activeTab, setActiveTab] = useState("images");
  const [followed, setFollowed] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  // Modals
  const [showShare, setShowShare] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [tipAmount, setTipAmount] = useState(5);
  const [tipSent, setTipSent] = useState(false);

  // Own profile check
  const isLoggedIn = (() => { try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; } })();
  const loggedInUsername = (() => { try { return localStorage.getItem("ra_username") || ""; } catch { return ""; } })();
  const isOwnProfile = isLoggedIn && loggedInUsername.toLowerCase() === creator.handle.replace("@", "").toLowerCase();

  // Merge boards/collections from stores for own profile
  const displayBoards = isOwnProfile ? getBoards() : creator.boards.map((b, i) => ({
    id: `creator-board-${i}`, title: b.title, visibility: b.visibility as "public" | "private",
    items: Array.from({ length: b.items }, (_, j) => ({ imageId: String(j), photo: b.cover, title: `Item ${j + 1}` })),
    createdAt: Date.now(),
  }));

  const displayCollections = isOwnProfile
    ? getCollections().map(c => ({ name: c.name, cover: c.thumbs?.[0] || "photo-1618005182384-a83a8bd57fbe", count: c.images || 0, free: c.visibility === "public" }))
    : creator.collections;

  const commissionBadge = commissionLabels[creator.commissions];

  const bioLines = creator.bio.split(". ");
  const showBioToggle = creator.bio.length > 140;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell>
        {/* Breadcrumb */}
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <Link to="/creators" className="hover:text-foreground transition-colors">Creators</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">{creator.name}</span>
        </div>

        <div className="px-6 md:px-12 pb-8 max-w-[1440px] mx-auto">
          {/* Banner */}
          <div className="relative h-[200px] md:h-[280px] rounded-2xl overflow-hidden mb-0">
            <img
              src={`https://images.unsplash.com/${creator.banner}?w=1400&h=400&fit=crop&q=80`}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>

          {/* Profile header */}
          <div className="relative -mt-16 bg-card border border-foreground/[0.08] rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0 shadow-lg border-4 border-card -mt-16 md:-mt-20"
                style={{ background: creator.color }}>
                {creator.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h1 className="font-display text-[2.2rem] font-black tracking-[-0.03em] leading-none">{creator.name}</h1>
                      {/* Top badges */}
                      {creator.badges.slice(0, 2).map(b => {
                        const Icon = b.icon;
                        return (
                          <span key={b.label} className="flex items-center gap-1 text-[0.65rem] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-lg border border-accent/15">
                            <Icon className="w-2.5 h-2.5" /> {b.label}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-[0.82rem] text-muted flex items-center gap-2 flex-wrap">
                      <span>{creator.handle}</span>
                      {commissionBadge && (
                        <span className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded-lg border ${commissionBadge.color}`}>
                          {commissionBadge.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {!isOwnProfile && (
                      <>
                        <button
                          onClick={() => setFollowed(!followed)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold transition-all ${followed ? "bg-foreground/[0.08] text-foreground border border-foreground/20" : "bg-foreground text-primary-foreground hover:bg-accent"}`}
                        >
                          <UserCheck className={`w-4 h-4 ${followed ? "text-accent" : ""}`} />
                          {followed ? "Following" : "Follow"}
                        </button>
                        <button
                          onClick={() => setShowContact(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium border border-foreground/[0.14] hover:border-foreground/30 transition-colors"
                        >
                          <Mail className="w-4 h-4" /> Message
                        </button>
                        <button
                          onClick={() => setShowTip(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium border border-foreground/[0.14] hover:border-foreground/30 transition-colors"
                        >
                          <Coffee className="w-4 h-4" /> Tip
                        </button>
                      </>
                    )}
                    {isOwnProfile && (
                      <Link to="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold bg-foreground text-primary-foreground hover:bg-accent transition-colors">
                        Edit Profile
                      </Link>
                    )}
                    <button
                      onClick={() => setShowShare(true)}
                      className="w-10 h-10 rounded-lg border border-foreground/[0.14] flex items-center justify-center hover:border-foreground/30 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bio */}
                <div className="max-w-[600px] mb-4">
                  <p className="text-[0.88rem] text-muted leading-[1.7]">
                    {bioExpanded || !showBioToggle ? creator.bio : bioLines[0] + "."}
                  </p>
                  {showBioToggle && (
                    <button onClick={() => setBioExpanded(!bioExpanded)} className="text-[0.78rem] text-accent font-medium hover:underline mt-1">
                      {bioExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>

                {/* Meta links */}
                <div className="flex flex-wrap gap-4 text-[0.8rem] text-muted mb-5">
                  {creator.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {creator.location}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {creator.joined}</span>
                  {creator.website && (
                    <a href={`https://${creator.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                      <Globe className="w-3.5 h-3.5" /> {creator.website}
                    </a>
                  )}
                  {Object.entries(creator.social).filter(([_, v]) => v).map(([key, val]) => {
                    const s = socialIcons[key];
                    if (!s) return null;
                    const Icon = s.icon;
                    const href = s.base ? `${s.base}${val}` : "#";
                    return (
                      <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 bg-background rounded-xl p-4">
                  {[
                    { label: "Followers", value: creator.followers >= 1000 ? (creator.followers / 1000).toFixed(1) + "K" : String(creator.followers) },
                    { label: "Following", value: String(creator.following) },
                    { label: "Images", value: String(creator.images) },
                    { label: "Downloads", value: creator.downloads },
                    { label: "Views", value: creator.views },
                    { label: "Remixes", value: creator.remixes },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className="font-display text-[1.3rem] font-black tracking-[-0.02em] leading-none">{stat.value}</div>
                      <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em] mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Badges row */}
                {creator.badges.length > 2 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {creator.badges.slice(2).map(badge => {
                      const BadgeIcon = badge.icon;
                      return (
                        <span key={badge.label} className="flex items-center gap-1 text-[0.65rem] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-lg border border-accent/15">
                          <BadgeIcon className="w-2.5 h-2.5" /> {badge.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pinned artwork */}
          {creator.pinnedImage && (
            <div className="bg-foreground rounded-2xl p-6 mb-6 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-[0.06]"
                style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/40">Pinned Artwork</span>
              </div>
              <div className="flex flex-col md:flex-row gap-5">
                <Link to={`/image/${creator.pinnedImage.id}`}>
                  <img
                    src={`https://images.unsplash.com/${creator.pinnedImage.photo}?w=320&h=200&fit=crop&q=80`}
                    alt={creator.pinnedImage.title}
                    className="w-full md:w-[240px] h-[160px] rounded-xl object-cover hover:scale-[1.02] transition-transform"
                  />
                </Link>
                <div>
                  <h3 className="font-display text-[1.4rem] font-black text-primary-foreground mb-1">
                    Signature piece by {creator.name}
                  </h3>
                  <p className="text-[0.82rem] text-primary-foreground/40 mb-3">{creator.pinnedImage.title}</p>
                  <div className="flex gap-5 mb-4">
                    {[
                      { icon: Eye, value: creator.pinnedImage.views, label: "views" },
                      { icon: Download, value: creator.pinnedImage.downloads, label: "downloads" },
                      { icon: Heart, value: creator.pinnedImage.likes, label: "likes" },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex items-center gap-1.5">
                          <s.icon className="w-3.5 h-3.5 text-primary-foreground/40" />
                          <span className="font-display font-black text-[1.1rem] text-primary-foreground">{s.value}</span>
                        </div>
                        <div className="text-[0.62rem] text-primary-foreground/30 uppercase tracking-[0.08em]">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <Link to={`/image/${creator.pinnedImage.id}`} className="text-[0.82rem] text-accent font-semibold hover:underline flex items-center gap-1.5">
                    View image <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-0 mb-6 border-b border-foreground/[0.06] pb-0 overflow-x-auto">
            {TABS.map(t => {
              const Icon = t.icon;
              const count =
                t.id === "images" ? creator.photos.length :
                t.id === "collections" ? displayCollections.length :
                t.id === "boards" ? displayBoards.length :
                t.id === "communities" ? creator.communities.length :
                t.id === "liked" ? creator.liked.length :
                null;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-[0.84rem] font-medium transition-colors border-b-2 -mb-px shrink-0 ${
                    activeTab === t.id
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                  {count !== null && count > 0 && (
                    <span className="text-[0.68rem] text-muted bg-foreground/[0.06] px-1.5 py-0.5 rounded-md">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ═══ IMAGES TAB ═══ */}
          {activeTab === "images" && (
            <div className="masonry-grid">
              {creator.photos.map((photo, i) => (
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

          {/* ═══ COLLECTIONS TAB ═══ */}
          {activeTab === "collections" && (
            displayCollections.length === 0 ? (
              <p className="text-[0.88rem] text-muted text-center py-12">No public collections yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayCollections.map((col, i) => (
                  <div key={i} className="cursor-pointer group">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2 relative">
                      <img
                        src={`https://images.unsplash.com/${col.cover}?w=400&h=530&fit=crop&q=78`}
                        alt={col.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {!col.free && (
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-foreground/80 text-primary-foreground px-2 py-1 rounded-lg text-[0.65rem] font-semibold">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-[0.9rem]">{col.name}</p>
                    <p className="text-[0.78rem] text-muted">{col.count} images</p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ═══ BOARDS TAB ═══ */}
          {activeTab === "boards" && (
            displayBoards.length === 0 ? (
              <p className="text-[0.88rem] text-muted text-center py-12">No public boards yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayBoards.map((board, i) => {
                  const cover = "items" in board && board.items.length > 0
                    ? (typeof board.items[0] === "object" && "photo" in board.items[0] ? board.items[0].photo : creator.photos[0])
                    : creator.photos[0];
                  const itemCount = Array.isArray(board.items) ? board.items.length : 0;
                  return (
                    <Link key={board.id || i} to={`/boards/${board.id || i}`} className="group">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-2 bg-foreground/[0.04]">
                        <img
                          src={`https://images.unsplash.com/${cover}?w=400&h=300&fit=crop&q=78`}
                          alt={board.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="font-semibold text-[0.9rem]">{board.title.replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                      <p className="text-[0.78rem] text-muted flex items-center gap-1">
                        {board.visibility === "private" ? <Lock className="w-2.5 h-2.5" /> : <Globe2 className="w-2.5 h-2.5" />}
                        {itemCount} saved
                      </p>
                    </Link>
                  );
                })}
              </div>
            )
          )}

          {/* ═══ COMMUNITIES TAB ═══ */}
          {activeTab === "communities" && (
            creator.communities.length === 0 ? (
              <p className="text-[0.88rem] text-muted text-center py-12">Not a member of any communities yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {creator.communities.map((cm, i) => (
                  <div key={i} className="cursor-pointer group">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-2">
                      <img
                        src={`https://images.unsplash.com/${cm.cover}?w=400&h=300&fit=crop&q=78`}
                        alt={cm.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-semibold text-[0.9rem]">{cm.name}</p>
                    <p className="text-[0.78rem] text-muted">{cm.members} members</p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ═══ LIKED TAB ═══ */}
          {activeTab === "liked" && (
            creator.liked.length === 0 ? (
              <p className="text-[0.88rem] text-muted text-center py-12">No liked images yet.</p>
            ) : (
              <div className="masonry-grid">
                {creator.liked.map((photo, i) => (
                  <Link key={i} to={`/image/${i}`} className="masonry-item rounded-xl overflow-hidden block group relative">
                    <img
                      src={`https://images.unsplash.com/${photo}?w=400&h=${heights[(i + 4) % heights.length]}&fit=crop&q=78`}
                      alt="" loading="lazy"
                      className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                      style={{ height: heights[(i + 4) % heights.length], objectFit: "cover" }}
                    />
                    <ImageCardOverlay index={i + 4} />
                  </Link>
                ))}
              </div>
            )
          )}

          {/* ═══ ABOUT TAB ═══ */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-display text-[1.4rem] font-black tracking-[-0.03em] mb-3">About {creator.name}</h2>
                <p className="text-[0.88rem] text-muted leading-[1.7] mb-6">{creator.bio}</p>

                {/* Tools */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 font-semibold text-[0.9rem] mb-3">
                    <Zap className="w-4 h-4 text-accent" /> AI Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {creator.tools.map(t => (
                      <span key={t} className="text-[0.78rem] px-3 py-1.5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08]">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Styles */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 font-semibold text-[0.9rem] mb-3">
                    <Palette className="w-4 h-4 text-accent" /> Styles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {creator.styles.map(s => (
                      <span key={s} className="text-[0.78rem] px-3 py-1.5 rounded-lg bg-accent/[0.06] text-accent border border-accent/15">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {/* Contact */}
                <h3 className="flex items-center gap-2 font-semibold text-[0.9rem] mb-3">
                  <Mail className="w-4 h-4 text-accent" /> Contact
                </h3>
                <div className="flex flex-col gap-2 mb-6">
                  {Object.entries(creator.social).filter(([_, v]) => v).map(([key, val]) => {
                    const s = socialIcons[key];
                    if (!s) return null;
                    const Icon = s.icon;
                    const href = s.base ? `${s.base}${val}` : "#";
                    return (
                      <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/[0.03] transition-colors group">
                        <Icon className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.82rem] font-medium capitalize">{key}</div>
                          <div className="text-[0.72rem] text-muted">@{val}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                  <button
                    onClick={() => setShowContact(true)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:bg-accent/[0.03] transition-colors group"
                  >
                    <MessageCircle className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[0.82rem] font-medium">Direct message</div>
                      <div className="text-[0.72rem] text-muted">Send on REAL ART</div>
                    </div>
                  </button>
                </div>

                {/* Commissions */}
                {creator.commissions !== "closed" && (
                  <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                    <h3 className="font-semibold text-[0.9rem] mb-1">Commissions</h3>
                    <span className={`inline-block text-[0.72rem] font-semibold px-2 py-0.5 rounded-lg border mb-2 ${commissionBadge.color}`}>
                      {creator.commissions === "open" ? "Open" : "Waitlist"}
                    </span>
                    <p className="text-[0.82rem] text-muted leading-[1.6] mb-3">
                      {creator.commissions === "open"
                        ? "This creator is currently accepting commission requests. Send them a message to discuss your project."
                        : "This creator has a waitlist for commissions. Send a message to join the queue."}
                    </p>
                    <button
                      onClick={() => setShowContact(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-primary-foreground text-[0.82rem] font-semibold hover:bg-accent transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> Send commission request
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Footer />

      {/* ═══ SHARE MODAL ═══ */}
      {showShare && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-foreground/50 backdrop-blur-sm px-4" onClick={() => setShowShare(false)}>
          <div className="bg-card rounded-2xl w-full max-w-[400px] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-[1.1rem] font-bold">Share {creator.name}'s profile</h2>
              <button onClick={() => setShowShare(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/[0.07] transition-colors text-muted">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-foreground/[0.04] border border-foreground/[0.08] rounded-xl px-3 py-2.5 mb-4">
              <Link2 className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="text-[0.78rem] text-muted truncate flex-1">{window.location.href}</span>
              <button onClick={handleCopyLink} className="text-[0.78rem] text-accent font-semibold flex items-center gap-1 shrink-0">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <div className="flex gap-2">
              {[
                { label: "X", color: "#000", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out ${creator.name} on REAL ART`)}` },
                { label: "f", color: "#1877F2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                { label: "W", color: "#25D366", url: `https://wa.me/?text=${encodeURIComponent(`${creator.name} on REAL ART — ${window.location.href}`)}` },
                { label: "✉", color: "hsl(var(--muted))", url: `mailto:?subject=${encodeURIComponent(`Check out ${creator.name}`)}&body=${encodeURIComponent(window.location.href)}` },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground text-[0.82rem] font-bold hover:opacity-80 transition-opacity"
                  style={{ background: s.color }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MESSAGE MODAL ═══ */}
      {showContact && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-foreground/50 backdrop-blur-sm px-4" onClick={() => setShowContact(false)}>
          <div className="bg-card rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-primary-foreground" style={{ background: creator.color }}>
                  {creator.avatar}
                </div>
                <h2 className="font-semibold text-[0.95rem]">Message {creator.name}</h2>
              </div>
              <button onClick={() => setShowContact(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/[0.07] transition-colors text-muted">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5">
              {!isLoggedIn ? (
                <div className="text-center py-4">
                  <p className="text-[0.88rem] text-muted mb-3">You need to be logged in to send messages.</p>
                  <Link to="/login" className="text-accent font-semibold hover:underline">Log in</Link>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Subject</label>
                    <input
                      value={contactSubject}
                      onChange={e => setContactSubject(e.target.value)}
                      placeholder="What's this about?"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.84rem] bg-background outline-none focus:border-accent/40 transition-colors"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Message</label>
                    <textarea
                      value={contactMsg}
                      onChange={e => setContactMsg(e.target.value)}
                      placeholder={`Write a message to ${creator.name}...`}
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.84rem] bg-background outline-none focus:border-accent/40 transition-colors resize-none leading-[1.6]"
                    />
                  </div>
                  <button
                    onClick={() => { setShowContact(false); setContactMsg(""); setContactSubject(""); }}
                    disabled={!contactMsg.trim()}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-foreground text-primary-foreground text-[0.88rem] font-semibold hover:bg-accent transition-colors disabled:opacity-40"
                  >
                    <Mail className="w-4 h-4" /> Send Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TIP MODAL ═══ */}
      {showTip && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-foreground/50 backdrop-blur-sm px-4" onClick={() => { setShowTip(false); setTipSent(false); }}>
          <div className="bg-card rounded-2xl w-full max-w-[380px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.07]">
              <h2 className="font-semibold text-[0.95rem]">Support {creator.name}</h2>
              <button onClick={() => { setShowTip(false); setTipSent(false); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/[0.07] transition-colors text-muted">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5">
              {tipSent ? (
                <div className="text-center py-6">
                  <Coffee className="w-6 h-6 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-display text-[1.2rem] font-bold mb-1">Thanks for the support!</h3>
                  <p className="text-[0.82rem] text-muted">Your tip to {creator.name} was sent.</p>
                </div>
              ) : (
                <>
                  <p className="text-[0.86rem] text-muted text-center mb-5">Show some love for their work</p>
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {[3, 5, 10, 25].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setTipAmount(amount)}
                        className={`py-2.5 rounded-lg text-[0.88rem] font-semibold border transition-all ${
                          tipAmount === amount
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-foreground/[0.12] hover:border-foreground/30"
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setTipSent(true)}
                    className="w-full py-3 rounded-lg bg-amber-500 text-primary-foreground text-[0.88rem] font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-4 h-4" /> Send ${tipAmount} tip
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default CreatorPage;
