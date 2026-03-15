import { Eye, Copy, Shuffle, Sparkles, BookOpen } from "lucide-react";

const promptPacks = [
  {
    title: "Cyberpunk City Pack",
    creator: "AI.Verse",
    prompts: 42,
    price: "Free",
    color: "#4361ee",
    preview: "Neon-soaked metropolis with flying vehicles, holographic billboards, rain-slicked streets reflecting city lights...",
  },
  {
    title: "Fantasy Landscapes",
    creator: "DreamForge",
    prompts: 68,
    price: "$4.99",
    color: "#2a9d8f",
    preview: "Ancient elven forest with bioluminescent canopy, crystal clear rivers flowing through moss-covered ruins...",
  },
  {
    title: "Luxury Interiors",
    creator: "LuminaAI",
    prompts: 35,
    price: "$2.99",
    color: "#e76f51",
    preview: "Minimalist penthouse with floor-to-ceiling windows, marble surfaces, warm ambient lighting, architectural digest style...",
  },
  {
    title: "Avatar Essentials",
    creator: "NeoPixel",
    prompts: 120,
    price: "Free",
    color: "#c9184a",
    preview: "Stylized digital portrait with ethereal glow, soft bokeh background, cinematic color grading, professional headshot...",
  },
  {
    title: "Abstract Textures",
    creator: "SpectraGen",
    prompts: 56,
    price: "$3.99",
    color: "#7b2d8b",
    preview: "Organic fluid dynamics with iridescent metallic surfaces, macro lens perspective, studio lighting...",
  },
  {
    title: "Product Photography",
    creator: "ChromaLab",
    prompts: 44,
    price: "$5.99",
    color: "#f4a261",
    preview: "Minimalist product shot on gradient background, soft diffused lighting, subtle reflections, commercial quality...",
  },
];

const PromptLibrary = () => {
  return (
    <section className="py-[72px] px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent">New</span>
            </div>
            <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none">Prompt Library</h2>
            <p className="text-[0.83rem] text-muted mt-[7px]">Browse, copy, and remix prompts from top creators</p>
          </div>
          <a href="#" className="text-[0.8rem] font-semibold text-foreground border-b-[1.5px] border-foreground pb-px whitespace-nowrap">Browse All Packs →</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promptPacks.map((pack) => (
            <div key={pack.title} className="bg-card border border-foreground/[0.08] rounded-[18px] p-5 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(0,0,0,0.1)] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: pack.color }}>
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-[0.88rem]">{pack.title}</div>
                    <div className="text-[0.7rem] text-muted">by {pack.creator}</div>
                  </div>
                </div>
                <span className={`text-[0.75rem] font-bold px-3 py-1 rounded-md ${pack.price === "Free" ? "bg-accent/10 text-accent" : "bg-foreground/[0.06] text-foreground"}`}>
                  {pack.price}
                </span>
              </div>

              <p className="text-[0.76rem] text-muted leading-[1.6] mb-3 line-clamp-2">{pack.preview}</p>

              <div className="flex items-center justify-between">
                <span className="text-[0.72rem] text-muted">{pack.prompts} prompts</span>
                <div className="flex gap-1">
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-foreground/[0.06] text-[0.68rem] font-medium hover:bg-foreground/[0.12] transition-colors">
                    <Eye className="w-[10px] h-[10px]" /> View
                  </button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-foreground/[0.06] text-[0.68rem] font-medium hover:bg-foreground/[0.12] transition-colors">
                    <Copy className="w-[10px] h-[10px]" /> Copy
                  </button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-accent text-primary-foreground text-[0.68rem] font-medium hover:bg-accent/80 transition-colors">
                    <Shuffle className="w-[10px] h-[10px]" /> Remix
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sell Your Prompts CTA */}
        <div className="mt-5 bg-card border border-foreground/[0.08] rounded-[14px] p-[22px_26px] flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-bold text-[0.9rem] mb-[3px]">Sell Your Prompt Packs</div>
            <div className="text-[0.8rem] text-muted">Package your best prompts and earn passive income from every sale.</div>
          </div>
          <button className="font-body text-[0.8rem] font-semibold bg-foreground text-primary-foreground border-none px-[22px] py-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors">
            Create Prompt Pack
          </button>
        </div>
      </div>
    </section>
  );
};

export default PromptLibrary;
