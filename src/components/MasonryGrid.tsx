import { Heart, Download } from "lucide-react";

const photos = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab", "photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85", "photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9", "photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809", "photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b", "photo-1576091160550-2173dba999ef",
  "photo-1518770660439-4636190af475", "photo-1462275646964-a0e3386b89fa",
  "photo-1500462918059-b1a0cb512f1d", "photo-1543722530-d2c3201371e7",
  "photo-1607799279861-4dd421887fb3", "photo-1533158628620-7e4d0a003147",
  "photo-1567360425618-1594206637d2", "photo-1505765050516-f72dcac9c60e",
];
const heights = [200, 260, 170, 230, 185, 255, 162, 215, 148, 238, 196, 172, 248, 182, 157, 226, 178, 262, 152, 212];
const creators = [
  { n: "AI.Verse", i: "AV", c: "#4361ee" },
  { n: "NeoPixel", i: "NP", c: "#c9184a" },
  { n: "DreamForge", i: "DF", c: "#2a9d8f" },
  { n: "LuminaAI", i: "LA", c: "#e76f51" },
  { n: "SpectraGen", i: "SG", c: "#7b2d8b" },
  { n: "VoidArt", i: "VA", c: "#023e8a" },
  { n: "ChromaLab", i: "CL", c: "#f4a261" },
  { n: "Synthetix", i: "SX", c: "#06d6a0" },
];

const MasonryGrid = () => {
  return (
    <div className="px-6 md:px-12 py-6 pb-16">
      <div className="masonry-grid">
        {photos.map((photo, i) => {
          const cr = creators[i % creators.length];
          const h = heights[i % heights.length];
          return (
            <div key={i} className="masonry-item rounded-xl overflow-hidden relative cursor-pointer group" style={{ background: "#e0e0de" }}>
              <img
                src={`https://images.unsplash.com/${photo}?w=400&h=${h}&fit=crop&q=78`}
                alt="Art piece"
                loading="lazy"
                className="w-full block rounded-xl transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                style={{ height: h, objectFit: "cover" }}
              />
              <div className="absolute inset-0 rounded-xl flex flex-col justify-end p-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "var(--gradient-overlay)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.58rem] font-bold text-primary-foreground border border-primary-foreground/30"
                      style={{ background: cr.c }}
                    >
                      {cr.i}
                    </div>
                    <span className="text-[0.72rem] text-primary-foreground/90">{cr.n}</span>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-[27px] h-[27px] rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/[0.38] transition-colors">
                      <Heart className="w-[11px] h-[11px]" />
                    </button>
                    <button className="w-[27px] h-[27px] rounded-full border-none bg-primary-foreground/[0.18] backdrop-blur-sm cursor-pointer text-primary-foreground flex items-center justify-center hover:bg-primary-foreground/[0.38] transition-colors">
                      <Download className="w-[11px] h-[11px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-5">
        <button className="font-body text-[0.82rem] font-semibold bg-transparent border border-foreground/[0.14] px-8 py-2.5 rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors">
          Load More
        </button>
      </div>
    </div>
  );
};

export default MasonryGrid;
