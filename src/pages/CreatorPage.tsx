import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Heart, Globe, Twitter, Instagram,
  Link2, Grid3X3, Bookmark, Download, Share2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const creatorsData = [
  {
    id: "1", name: "AI.Verse", handle: "@aiverse", avatar: "AV", color: "#4361ee",
    bio: "Generative art explorer specializing in cosmic and abstract digital landscapes. I push the boundaries of what AI can visualize — from deep space visions to microscopic worlds.",
    location: "San Francisco, CA",
    website: "aiverse.art",
    twitter: "@aiverseart",
    instagram: "@aiverse",
    followers: 12400, following: 284, images: 284, downloads: "892K", views: "4.2M",
    joined: "January 2024",
  },
  {
    id: "2", name: "NeoPixel", handle: "@neopixel", avatar: "NP", color: "#c9184a",
    bio: "Cyberpunk visuals and neon-drenched futures. I build tomorrow's cities today — one prompt at a time. Specializing in urban dystopia, retrofuturism, and digital noir.",
    location: "Tokyo, Japan",
    website: "neopixel.io",
    twitter: "@neopixelart",
    instagram: "@neopixel.art",
    followers: 9800, following: 156, images: 196, downloads: "641K", views: "3.1M",
    joined: "March 2024",
  },
  {
    id: "3", name: "DreamForge", handle: "@dreamforge", avatar: "DF", color: "#2a9d8f",
    bio: "Fantasy landscapes, mythical worlds, and surreal dreamscapes. Every image is a portal to somewhere impossible.",
    location: "London, UK",
    website: "dreamforge.co",
    twitter: "@dreamforgeart",
    instagram: "@dreamforge",
    followers: 7300, following: 412, images: 421, downloads: "1.1M", views: "5.8M",
    joined: "February 2024",
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

const tabs = ["Images", "Collections", "Liked"];

const CreatorPage = () => {
  const { id } = useParams();
  const creator = creatorsData.find(c => c.id === id) || creatorsData[0];
  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("Images");
  const heights = [220, 260, 190, 240, 180, 210, 250, 170, 230, 200, 265, 185];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
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

        {/* Profile header */}
        <div className="px-6 md:px-12 pb-8 max-w-[1440px] mx-auto">
          <div className="bg-card border border-foreground/[0.08] rounded-2xl p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0 shadow-lg"
                style={{ background: creator.color }}>
                {creator.avatar}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                  <div>
                    <h1 className="font-display text-[2.2rem] font-black tracking-[-0.03em] leading-none mb-1">{creator.name}</h1>
                    <div className="text-[0.82rem] text-muted">{creator.handle} · Joined {creator.joined}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFollowed(!followed)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold transition-colors ${followed ? "bg-foreground/[0.08] text-foreground border border-foreground/20" : "bg-foreground text-primary-foreground hover:bg-accent"}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${followed ? "fill-accent text-accent" : ""}`} />
                      {followed ? "Following" : "Follow"}
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.84rem] font-medium border border-foreground/[0.12] hover:border-foreground/30 transition-colors text-destructive">
                      <Heart className="w-4 h-4 fill-destructive text-destructive" /> Donate
                    </button>
                    <button className="w-10 h-10 rounded-lg border border-foreground/[0.12] flex items-center justify-center hover:border-foreground/30 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-[0.88rem] text-muted leading-[1.7] max-w-[560px] mb-4">{creator.bio}</p>

                {/* Links */}
                <div className="flex flex-wrap gap-4 text-[0.8rem] text-muted mb-5">
                  {creator.location && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> {creator.location}
                    </span>
                  )}
                  {creator.website && (
                    <a href={`https://${creator.website}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                      <Link2 className="w-3.5 h-3.5" /> {creator.website}
                    </a>
                  )}
                  {creator.twitter && (
                    <a href="#" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                      <Twitter className="w-3.5 h-3.5" /> {creator.twitter}
                    </a>
                  )}
                  {creator.instagram && (
                    <a href="#" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                      <Instagram className="w-3.5 h-3.5" /> {creator.instagram}
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  {[
                    { label: "Followers", value: (creator.followers / 1000).toFixed(1) + "K" },
                    { label: "Images", value: creator.images.toLocaleString() },
                    { label: "Downloads", value: creator.downloads },
                    { label: "Total Views", value: creator.views },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="font-display text-[1.5rem] font-black tracking-[-0.02em] leading-none">{stat.value}</div>
                      <div className="text-[0.72rem] text-muted uppercase tracking-[0.08em] mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-foreground/[0.06] pb-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-[0.85rem] font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab === "Images" && <Grid3X3 className="w-3.5 h-3.5" />}
                {tab === "Collections" && <Bookmark className="w-3.5 h-3.5" />}
                {tab === "Liked" && <Heart className="w-3.5 h-3.5" />}
                {tab}
              </button>
            ))}
          </div>

          {/* Image grid */}
          {activeTab === "Images" && (
            <div className="masonry-grid">
              {photos.map((photo, i) => (
                <Link
                  key={i}
                  to={`/image/${i}`}
                  className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative"
                >
                  <img
                    src={`https://images.unsplash.com/${photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                    alt=""
                    loading="lazy"
                    className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                    style={{ height: heights[i % heights.length], objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3" style={{ background: "var(--gradient-overlay)" }}>
                    <div className="flex gap-1.5 ml-auto">
                      <button onClick={e => e.preventDefault()} className="w-7 h-7 rounded-full border-none bg-primary-foreground/20 backdrop-blur-sm cursor-pointer text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/40 transition-colors">
                        <Download className="w-3 h-3" />
                      </button>
                      <button onClick={e => e.preventDefault()} className="w-7 h-7 rounded-full border-none bg-primary-foreground/20 backdrop-blur-sm cursor-pointer text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/40 transition-colors">
                        <Heart className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "Collections" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Cosmic Series", "Neon Nights", "Deep Space", "Abstracts"].map((name, i) => (
                <div key={name} className="cursor-pointer group">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2">
                    <img
                      src={`https://images.unsplash.com/${photos[i]}?w=400&h=530&fit=crop&q=78`}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="font-semibold text-[0.9rem]">{name}</p>
                  <p className="text-[0.78rem] text-muted">{20 + i * 7} images</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Liked" && (
            <div className="masonry-grid">
              {photos.slice(4, 10).map((photo, i) => (
                <Link key={i} to={`/image/${i + 4}`} className="masonry-item rounded-xl overflow-hidden block group relative">
                  <img
                    src={`https://images.unsplash.com/${photo}?w=400&h=${heights[(i + 4) % heights.length]}&fit=crop&q=78`}
                    alt="" loading="lazy"
                    className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                    style={{ height: heights[(i + 4) % heights.length], objectFit: "cover" }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default CreatorPage;
