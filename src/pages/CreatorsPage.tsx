import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Search, Download, Users, Image } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const allCreators = [
  { id: "1", name: "AI.Verse", handle: "@aiverse", init: "AV", color: "#4361ee", specialty: "Cosmic & abstract landscapes", images: 284, downloads: "12.4K", followers: "12.4K" },
  { id: "2", name: "NeoPixel", handle: "@neopixel", init: "NP", color: "#c9184a", specialty: "Cyberpunk & neon futures", images: 196, downloads: "10.9K", followers: "9.8K" },
  { id: "3", name: "DreamForge", handle: "@dreamforge", init: "DF", color: "#2a9d8f", specialty: "Fantasy & mythical worlds", images: 421, downloads: "9.8K", followers: "7.3K" },
  { id: "4", name: "LuminaAI", handle: "@luminaai", init: "LA", color: "#e76f51", specialty: "Light studies & minimalism", images: 158, downloads: "7.3K", followers: "5.9K" },
  { id: "5", name: "SpectraGen", handle: "@spectragen", init: "SG", color: "#7b2d8b", specialty: "Spectral art & color theory", images: 312, downloads: "5.9K", followers: "4.7K" },
  { id: "6", name: "VoidArt", handle: "@voidart", init: "VA", color: "#023e8a", specialty: "Dark surrealism & void scapes", images: 245, downloads: "4.7K", followers: "4.1K" },
  { id: "7", name: "ChromaLab", handle: "@chromalab", init: "CL", color: "#f4a261", specialty: "Color experiments & gradients", images: 189, downloads: "4.1K", followers: "3.8K" },
  { id: "8", name: "Synthetix", handle: "@synthetix", init: "SX", color: "#06d6a0", specialty: "Synthetic textures & patterns", images: 167, downloads: "3.8K", followers: "3.2K" },
  { id: "9", name: "PixelForge", handle: "@pixelforge", init: "PF", color: "#0891b2", specialty: "Pixel art & retro gaming", images: 298, downloads: "5.4K", followers: "4.5K" },
  { id: "10", name: "ArtWave", handle: "@artwave", init: "AW", color: "#7c3aed", specialty: "Wave forms & audio visuals", images: 134, downloads: "4.9K", followers: "3.9K" },
  { id: "11", name: "NeuralNest", handle: "@neuralnest", init: "NN", color: "#059669", specialty: "Neural patterns & bio art", images: 201, downloads: "4.2K", followers: "3.6K" },
  { id: "12", name: "SynthDream", handle: "@synthdream", init: "SD", color: "#dc2626", specialty: "Dreamcore & liminal spaces", images: 176, downloads: "3.8K", followers: "3.1K" },
];

const CreatorsPage = () => {
  const [query, setQuery] = useState("");
  const filtered = allCreators.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.handle.toLowerCase().includes(query.toLowerCase()) ||
    c.specialty.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageShell>
      <main className="pt-24 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[0.78rem] text-muted mb-8">
          <Link to="/" className="flex items-center gap-1 text-muted hover:text-foreground transition-colors no-underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground font-medium">Creators</span>
        </div>

        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-black tracking-[-0.03em] leading-none mb-3">Creators</h1>
            <p className="text-[0.92rem] text-muted max-w-[520px]">The artists behind the images. Follow, donate, explore their collections.</p>
          </div>
          <div className="flex items-center gap-3 bg-card border border-foreground/[0.1] rounded-xl px-4 h-11 w-full md:w-72 focus-within:border-foreground transition-colors">
            <Search className="w-3.5 h-3.5 text-muted shrink-0" />
            <input
              className="flex-1 bg-transparent border-none outline-none text-[0.88rem] font-body placeholder:text-muted"
              placeholder="Search creators…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(creator => (
            <Link
              key={creator.id}
              to={`/creator/${creator.id}`}
              className="bg-card border border-foreground/[0.08] rounded-2xl p-5 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all no-underline"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[0.82rem] font-bold text-primary-foreground shrink-0"
                  style={{ background: creator.color }}
                >
                  {creator.init}
                </div>
                <div>
                  <div className="font-bold text-[0.92rem] text-foreground">{creator.name}</div>
                  <div className="text-[0.76rem] text-muted">{creator.handle}</div>
                </div>
              </div>
              <p className="text-[0.8rem] text-muted leading-[1.55] mb-4">{creator.specialty}</p>
              <div className="flex items-center gap-4 text-[0.74rem] text-muted">
                <span className="flex items-center gap-1"><Image className="w-3.5 h-3.5" />{creator.images} images</span>
                <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{creator.downloads} dls</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{creator.followers}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </PageShell>
  );
};

export default CreatorsPage;