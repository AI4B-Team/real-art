import { Users } from "lucide-react";
import { Link } from "react-router-dom";

const comPhotos = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1557682250-33bd709cbe85",
  "photo-1604881991720-f91add269bed", "photo-1501854140801-50d01698950b",
  "photo-1579546929518-9e396f3cc809", "photo-1500462918059-b1a0cb512f1d",
];

const communities = [
  { name: "Avatar Architects", desc: "Master avatar and digital portrait creation. Premium prompt library inside.", members: 2840, free: false },
  { name: "Abstract Minds", desc: "Pushing the boundaries of abstract visuals. Open community, weekly drops.", members: 5120, free: true },
  { name: "Neon Futures", desc: "Cyberpunk visions of tomorrow. Join the movement and create the future.", members: 3670, free: true },
  { name: "Forest & Earth", desc: "Nature and organic imagery. A peaceful, beautiful corner of the platform.", members: 1980, free: true },
  { name: "PromptVault Pro", desc: "Exclusive prompt library for serious creators. Access by code only.", members: 890, free: false },
  { name: "Dreamweavers", desc: "Surrealist and dream-world imagery. The stranger the better.", members: 4210, free: true },
];

const CommunitiesSection = () => {
  return (
    <section className="py-12 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent mb-2">Creator Collections</div>
            <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none">Communities</h2>
            <p className="text-[0.83rem] text-muted mt-[7px]">Public collections and private vaults from creators worldwide</p>
          </div>
          <Link to="/communities" className="text-[0.8rem] font-semibold text-foreground border-b-[1.5px] border-foreground pb-px whitespace-nowrap no-underline hover:text-accent hover:border-accent transition-colors">Browse All →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((com, i) => (
            <Link to={`/communities/${i + 1}`} key={com.name} className="bg-card border border-foreground/[0.08] rounded-[18px] overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(0,0,0,0.1)] transition-all no-underline">
              <div className="h-[120px] relative">
                <img src={`https://images.unsplash.com/${comPhotos[i]}?w=400&h=240&fit=crop&q=78`} alt={com.name} loading="lazy" className="w-full h-full object-cover block" />
                <span className={`absolute bottom-2.5 left-3 text-[0.65rem] font-bold px-2.5 py-[3px] rounded-md tracking-[0.06em] uppercase ${com.free ? "bg-[rgba(15,180,90,0.9)] text-primary-foreground" : "bg-foreground/[0.72] text-primary-foreground/90"}`}>
                  {com.free ? "Free" : "Private"}
                </span>
              </div>
              <div className="p-4">
                <div className="font-bold text-[0.9rem] text-foreground mb-1">{com.name}</div>
                <div className="text-[0.78rem] text-muted leading-[1.55] mb-3">{com.desc}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[0.76rem] text-muted flex items-center gap-1">
                    <Users className="w-[11px] h-[11px]" />
                    {com.members.toLocaleString()}
                  </span>
                  <span
                    onClick={(e) => e.preventDefault()}
                    className="text-[0.76rem] font-bold px-4 py-[7px] rounded-lg border-none cursor-pointer bg-foreground text-primary-foreground hover:bg-accent transition-colors"
                  >
                    Join Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-3.5 bg-card border border-foreground/[0.08] rounded-[14px] p-[22px_26px] flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-bold text-[0.9rem] mb-[3px]">Build Your Own Gallery</div>
            <div className="text-[0.8rem] text-muted">Public or private. Earn affiliate credit on every image you post.</div>
          </div>
          <Link to="/create-gallery" className="font-body text-[0.8rem] font-semibold bg-accent text-primary-foreground border-none px-[22px] py-2.5 rounded-lg no-underline hover:bg-accent/85 transition-colors">
            Create Gallery
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunitiesSection;