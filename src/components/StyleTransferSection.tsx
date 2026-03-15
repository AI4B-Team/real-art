import { Palette, ArrowRight } from "lucide-react";

const styles = [
  { name: "Watercolor", photo: "photo-1558618666-fcd25c85cd64", color: "#4361ee" },
  { name: "Oil Painting", photo: "photo-1501854140801-50d01698950b", color: "#2a9d8f" },
  { name: "Cyberpunk", photo: "photo-1579546929518-9e396f3cc809", color: "#c9184a" },
  { name: "Anime", photo: "photo-1604881991720-f91add269bed", color: "#e76f51" },
  { name: "Pencil Sketch", photo: "photo-1506905925346-21bda4d32df4", color: "#7b2d8b" },
  { name: "Pop Art", photo: "photo-1576091160550-2173dba999ef", color: "#f4a261" },
];

const StyleTransferSection = () => {
  return (
    <section className="py-12 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-accent" />
          <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent">Instant</span>
        </div>
        <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none mb-1.5">Style Transfer</h2>
        <p className="text-[0.83rem] text-muted mb-8">Change any image's art style instantly. One click, infinite possibilities.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {styles.map((s) => (
            <div key={s.name} className="rounded-[14px] overflow-hidden relative aspect-square cursor-pointer group">
              <img
                src={`https://images.unsplash.com/${s.photo}?w=300&h=300&fit=crop&q=78`}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[350ms]"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/40 backdrop-blur-[2px]">
                <button className="flex items-center gap-1.5 bg-primary-foreground text-foreground text-[0.78rem] font-semibold px-4 py-2 rounded-lg">
                  Apply Style <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                <span className="text-[0.78rem] font-semibold text-primary-foreground">{s.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StyleTransferSection;
