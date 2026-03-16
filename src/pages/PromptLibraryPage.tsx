import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Search, Eye, Copy, Check,
  Shuffle, Sparkles, BookOpen, Filter, Lock, Plus
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const categories = ["All", "Avatars", "Landscapes", "Interiors", "Fashion", "Abstract", "Architecture", "Sci-Fi", "Fantasy", "Products", "Portraits"];

const packs = [
  {
    id: "1", title: "Cyberpunk City Pack", creator: "AI.Verse", creatorInit: "AV", creatorColor: "#4361ee",
    prompts: 42, price: "Free", category: "Sci-Fi",
    preview: "Neon-soaked metropolis with flying vehicles, holographic billboards, rain-slicked streets reflecting city lights, cinematic depth of field",
    samples: [
      "Ultra-detailed cyberpunk cityscape, neon rain, flying taxis, holographic ads, Blade Runner aesthetic, 8k, cinematic lighting",
      "Rainy cyberpunk alley, neon signs reflecting on wet pavement, lone figure with umbrella, volumetric fog, photorealistic",
      "Futuristic megacity skyline at night, densely packed skyscrapers, light pollution glow, aerial view, 4k render",
    ],
    photo: "photo-1579546929518-9e396f3cc809",
  },
  {
    id: "2", title: "Fantasy Landscapes", creator: "DreamForge", creatorInit: "DF", creatorColor: "#2a9d8f",
    prompts: 68, price: "$4.99", category: "Fantasy",
    preview: "Ancient elven forest with bioluminescent canopy, crystal rivers through moss-covered ruins, magical golden hour light",
    samples: [
      "Mystical forest at dawn, bioluminescent flora, ancient stone ruins covered in moss, golden mist, ethereal atmosphere",
      "Dragon perched on mountain peak, storm clouds below, lightning in background, fantasy painting style, epic scale",
      "Underwater fantasy kingdom, coral architecture, bioluminescent sea creatures, light rays from surface, dreamlike",
    ],
    photo: "photo-1501854140801-50d01698950b",
  },
  {
    id: "3", title: "Luxury Interiors", creator: "LuminaAI", creatorInit: "LA", creatorColor: "#e76f51",
    prompts: 35, price: "$2.99", category: "Interiors",
    preview: "Minimalist penthouse, floor-to-ceiling windows, marble surfaces, warm ambient lighting, architectural digest style",
    samples: [
      "Minimalist penthouse interior, marble floors, floor-to-ceiling windows, warm afternoon light, luxury furniture, architectural photography",
      "Italian villa living room, exposed stone walls, antique furniture, warm candlelight, editorial photography, film grain",
      "Modern spa bathroom, natural stone, tropical plant, soft diffused light, hotel luxury, product photography style",
    ],
    photo: "photo-1600210492486-724fe5c67fb0",
  },
  {
    id: "4", title: "Avatar Essentials", creator: "NeoPixel", creatorInit: "NP", creatorColor: "#c9184a",
    prompts: 120, price: "Free", category: "Avatars",
    preview: "Stylized digital portrait, ethereal glow, soft bokeh background, cinematic color grading, professional headshot quality",
    samples: [
      "Professional headshot, soft studio lighting, neutral background, sharp focus, 85mm portrait lens, photorealistic",
      "Fantasy warrior portrait, detailed armor, dramatic side lighting, character concept art, digital painting",
      "Futuristic AI avatar, glowing circuit elements, neon accents, dark background, sci-fi aesthetic, 4k",
    ],
    photo: "photo-1604881991720-f91add269bed",
  },
  {
    id: "5", title: "Abstract Textures", creator: "SpectraGen", creatorInit: "SG", creatorColor: "#7b2d8b",
    prompts: 55, price: "$3.99", category: "Abstract",
    preview: "Organic fluid dynamics, iridescent metallic surfaces, macro lens perspective, studio lighting, ultra-detailed",
    samples: [
      "Abstract fluid art, oil on water, iridescent colors, macro photography, studio lighting, 8k ultra-detailed",
      "Metallic liquid sculpture, chrome surface, dramatic lighting, minimalist composition, product photography",
      "Geometric crystal formation, light refraction, rainbow prism effect, macro closeup, scientific photography style",
    ],
    photo: "photo-1618005182384-a83a8bd57fbe",
  },
  {
    id: "6", title: "Product Photography", creator: "ChromaLab", creatorInit: "CL", creatorColor: "#f4a261",
    prompts: 48, price: "$5.99", category: "Products",
    preview: "Minimalist product shot on gradient background, soft diffused lighting, subtle reflections, commercial quality",
    samples: [
      "Luxury perfume bottle on marble surface, soft diffused light, subtle shadow, white background, commercial photography",
      "Skincare product arrangement, pastel background, fresh flowers, flat lay composition, beauty editorial",
      "Whiskey glass with ice, dark moody background, backlit, smoke effect, drinks photography, cinematic",
    ],
    photo: "photo-1557682250-33bd709cbe85",
  },
  {
    id: "7", title: "Fashion & Editorial", creator: "AI.Verse", creatorInit: "AV", creatorColor: "#4361ee",
    prompts: 72, price: "$6.99", category: "Fashion",
    preview: "High fashion editorial, dramatic lighting, model in designer outfit, avant-garde composition, magazine cover quality",
    samples: [
      "High fashion editorial, model in avant-garde outfit, dramatic shadows, black and white, Vogue magazine style",
      "Street fashion photography, urban environment, natural light, candid pose, film grain, 35mm aesthetic",
      "Couture gown on model, cathedral interior, dramatic lighting, full length, fashion week aesthetic",
    ],
    photo: "photo-1558618666-fcd25c85cd64",
  },
  {
    id: "8", title: "Architecture Dreams", creator: "VoidArt", creatorInit: "VA", creatorColor: "#023e8a",
    prompts: 40, price: "$4.99", category: "Architecture",
    preview: "Impossible structures, brutalist monuments, futuristic buildings, architectural visualization, golden hour light",
    samples: [
      "Futuristic museum building, parametric design, white concrete, surrounded by water, blue sky reflection, architectural render",
      "Brutalist monument at sunset, dramatic shadows, warm golden light, empty plaza, street photography",
      "Biophilic office tower covered in plants, glass facade, urban jungle, sustainable architecture, drone perspective",
    ],
    photo: "photo-1549880338-65ddcdfd017b",
  },
];

const PromptLibraryPage = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [activePack, setActivePack] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  const handleCopy = (idx: string) => {
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const filtered = packs
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .filter(p => !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.creator.toLowerCase().includes(query.toLowerCase()))
    .filter(p => !freeOnly || p.price === "Free");

  return (
    <PageShell>
        <div className="px-6 md:px-12 py-8 max-w-[1440px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-6">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">Prompt Library</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <span className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-accent">Community Prompts</span>
              </div>
              <h1 className="font-display text-[3.2rem] font-black tracking-[-0.03em] leading-none mb-2">Prompt Library</h1>
              <p className="text-[0.88rem] text-muted">Browse, copy, and remix prompts from top creators. Free and premium packs.</p>
            </div>
            <Link to="/upload">
              <button className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors whitespace-nowrap">
                <Plus className="w-4 h-4" /> Create Prompt Pack
              </button>
            </Link>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-2 bg-card border border-foreground/[0.12] rounded-xl px-4 h-10 flex-1 min-w-[220px] focus-within:border-foreground transition-colors">
              <Search className="w-3.5 h-3.5 text-muted shrink-0" />
              <input
                className="flex-1 border-none outline-none font-body text-[0.88rem] bg-transparent"
                placeholder="Search packs and creators…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setFreeOnly(!freeOnly)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-[0.82rem] font-medium transition-colors ${freeOnly ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.12] hover:border-foreground/30"}`}
            >
              Free Only
            </button>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted ml-auto">
              <Filter className="w-3.5 h-3.5" /> {filtered.length} packs
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`border px-4 py-1.5 rounded-md text-[0.79rem] font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Pack grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
            {filtered.map(pack => (
              <div key={pack.id} className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden">
                <div className="flex gap-4 p-5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={`https://images.unsplash.com/${pack.photo}?w=160&h=160&fit=crop&q=78`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full ${pack.price === "Free" ? "bg-green-500/10 text-green-600" : "bg-foreground/[0.06] text-muted"}`}>
                        {pack.price}
                      </span>
                      <span className="text-[0.68rem] text-muted">{pack.category}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-white" style={{ background: pack.creatorColor }}>
                        {pack.creatorInit}
                      </div>
                      <h3 className="font-bold text-[0.92rem] truncate">{pack.title}</h3>
                    </div>
                    <div className="text-[0.72rem] text-muted mb-1">by {pack.creator}</div>
                    <p className="text-[0.76rem] text-muted leading-[1.55] line-clamp-2 mb-2">{pack.preview}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[0.72rem] text-muted flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {pack.prompts} prompts
                      </span>
                      <button
                        onClick={() => setActivePack(activePack === pack.id ? null : pack.id)}
                        className="text-[0.72rem] font-medium text-foreground flex items-center gap-1 hover:text-accent transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> {activePack === pack.id ? "Hide" : "Preview"}
                      </button>
                      {pack.price === "Free" ? (
                        <button className="ml-auto text-[0.72rem] font-semibold flex items-center gap-1 bg-foreground text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
                          <Shuffle className="w-3.5 h-3.5" /> Use Free
                        </button>
                      ) : (
                        <button className="ml-auto text-[0.72rem] font-semibold flex items-center gap-1 bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors">
                          <Lock className="w-3.5 h-3.5" /> Get Pack
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded samples */}
                {activePack === pack.id && (
                  <div className="border-t border-foreground/[0.06] p-5 bg-background/50">
                    <div className="flex flex-col gap-2.5">
                      {pack.samples.map((s, i) => (
                        <div key={i} className="relative group bg-card border border-foreground/[0.06] rounded-lg p-3 pr-10 text-[0.78rem] text-muted leading-[1.6] font-mono">
                          {s}
                          <button
                            onClick={() => handleCopy(`${pack.id}-${i}`)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center bg-foreground/[0.06] text-muted hover:bg-foreground/[0.12] transition-colors opacity-0 group-hover:opacity-100"
                          >
                            {copiedIdx === `${pack.id}-${i}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-foreground rounded-2xl p-8 text-center relative overflow-hidden mb-16">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
            <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent mb-3">Earn Passive Income</div>
            <h2 className="font-display text-[2rem] font-black text-primary-foreground tracking-[-0.03em] mb-3">Sell Your Prompt Packs</h2>
            <p className="text-[0.86rem] text-primary-foreground/60 max-w-[480px] mx-auto mb-6 leading-[1.65]">
              Package your best prompts into a product. Set your price, keep the majority of revenue. Your creative expertise, monetized once — paid forever.
            </p>
            <Link to="/upload">
              <button className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg text-[0.86rem] font-semibold hover:bg-accent/90 transition-colors">
                <Plus className="w-4 h-4" /> Create Prompt Pack
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default PromptLibraryPage;
