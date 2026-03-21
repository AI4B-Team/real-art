import { Link } from "react-router-dom";
import { Star, ArrowRight, Download, RefreshCw, Heart } from "lucide-react";
import ImageCardOverlay from "@/components/ImageCardOverlay";

const featured = [
  { photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", creator: { id: "1", name: "AI.Verse", init: "AV", color: "#4361ee" }, downloads: "3.4K", remixes: "247" },
  { photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", creator: { id: "2", name: "NeoPixel", init: "NP", color: "#c9184a" }, downloads: "2.1K", remixes: "189" },
  { photo: "photo-1579546929518-9e396f3cc809", title: "Chromatic Drift", creator: { id: "3", name: "DreamForge", init: "DF", color: "#2a9d8f" }, downloads: "1.9K", remixes: "156" },
  { photo: "photo-1541701494587-cb58502866ab", title: "Molten Abstract", creator: { id: "4", name: "LuminaAI", init: "LA", color: "#e76f51" }, downloads: "1.6K", remixes: "121" },
  { photo: "photo-1506905925346-21bda4d32df4", title: "Alpine Majesty", creator: { id: "5", name: "SpectraGen", init: "SG", color: "#7b2d8b" }, downloads: "1.4K", remixes: "94" },
  { photo: "photo-1604881991720-f91add269bed", title: "Digital Bloom", creator: { id: "6", name: "VoidArt", init: "VA", color: "#023e8a" }, downloads: "1.2K", remixes: "87" },
  { photo: "photo-1549880338-65ddcdfd017b", title: "Horizon Line", creator: { id: "7", name: "ChromaLab", init: "CL", color: "#f4a261" }, downloads: "980", remixes: "72" },
  { photo: "photo-1518020382113-a7e8fc38eac9", title: "Urban Glow", creator: { id: "8", name: "Synthetix", init: "SX", color: "#06d6a0" }, downloads: "840", remixes: "61" },
];

const FeaturedArtworkSection = () => (
  <section className="px-6 md:px-12 py-10">
    <div className="max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Hand-Selected</span>
          </div>
          <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none">Featured Artwork</h2>
          <p className="text-[0.82rem] text-muted mt-1">Curated by the REAL ART team</p>
        </div>
        <Link to="/explore" className="flex items-center gap-1.5 text-[0.82rem] text-accent font-semibold hover:underline">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2-row grid: first row 3 large, second row 5 smaller */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {featured.slice(0, 3).map((item, i) => (
          <Link key={i} to={`/image/${i}`} className="group block no-underline relative rounded-2xl overflow-hidden">
            <img
              src={`https://images.unsplash.com/${item.photo}?w=600&h=380&fit=crop&q=80`}
              alt={item.title}
              className="w-full h-[260px] md:h-[320px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            {/* Editor's Pick badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-accent text-primary-foreground text-[0.6rem] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-lg shadow-md z-10">
              <Star className="w-3 h-3 fill-primary-foreground" /> Editor's Pick
            </div>
            <ImageCardOverlay index={i} photo={item.photo} title={item.title} />
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {featured.slice(3).map((item, i) => (
          <Link key={i} to={`/image/${i + 3}`} className="group block no-underline relative rounded-xl overflow-hidden">
            <img
              src={`https://images.unsplash.com/${item.photo}?w=400&h=260&fit=crop&q=78`}
              alt={item.title}
              className="w-full h-[180px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            {i === 0 && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[0.55rem] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-lg z-10">
                <Star className="w-3 h-3" /> Featured
              </div>
            )}
            <ImageCardOverlay index={i + 3} photo={item.photo} title={item.title} />
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedArtworkSection;
