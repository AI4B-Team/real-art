import { RefreshCw } from "lucide-react";

const originalPhoto = "photo-1618005182384-a83a8bd57fbe";
const recreations = [
  { photo: "photo-1557682250-33bd709cbe85", creator: "@NeoPixel", style: "Watercolor" },
  { photo: "photo-1541701494587-cb58502866ab", creator: "@DreamForge", style: "Cyberpunk" },
  { photo: "photo-1579546929518-9e396f3cc809", creator: "@LuminaAI", style: "Minimal" },
  { photo: "photo-1604881991720-f91add269bed", creator: "@SpectraGen", style: "3D Render" },
  { photo: "photo-1549880338-65ddcdfd017b", creator: "@VoidArt", style: "Oil Painting" },
];

const RecreationsSection = () => {
  return (
    <section className="py-12 px-6 md:px-12 bg-card">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-5 h-5 text-accent" />
          <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent">Viral Feature</span>
        </div>
        <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none mb-1.5">Recreated From This Image</h2>
        <p className="text-[0.83rem] text-muted mb-8">See how the community reimagines the same starting point</p>

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] gap-3 items-stretch">
          {/* Original */}
          <div className="relative rounded-[14px] overflow-hidden aspect-[3/4]">
            <img
              src={`https://images.unsplash.com/${originalPhoto}?w=400&h=500&fit=crop&q=80`}
              alt="Original artwork"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-accent text-primary-foreground text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.06em]">
              Original
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3.5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82), transparent)" }}>
              <div className="text-[0.82rem] text-primary-foreground font-semibold">Cosmic Dreams</div>
              <div className="text-[0.7rem] text-primary-foreground/55">by @AI.Verse</div>
            </div>
          </div>

          {/* Recreations */}
          {recreations.map((r) => (
            <div key={r.creator} className="relative rounded-[14px] overflow-hidden aspect-[3/4] cursor-pointer group">
              <img
                src={`https://images.unsplash.com/${r.photo}?w=250&h=340&fit=crop&q=78`}
                alt={`Recreation by ${r.creator}`}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[350ms]"
              />
              <div className="absolute top-2 left-2 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[0.6rem] font-semibold px-2 py-0.5 rounded-full">
                {r.style}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2.5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                <div className="text-[0.72rem] text-primary-foreground/80">{r.creator.toLowerCase()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button className="inline-flex items-center gap-2 font-body text-[0.82rem] font-semibold bg-foreground text-primary-foreground border-none px-7 py-3 rounded-lg cursor-pointer hover:bg-accent transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Recreate This Image
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecreationsSection;
