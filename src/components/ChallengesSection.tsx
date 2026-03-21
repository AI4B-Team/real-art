import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ImageCardOverlay from "@/components/ImageCardOverlay";

const winners = [
  { photo: "photo-1618005182384-a83a8bd57fbe", name: "Cosmic Dreams", creator: "@AI.Verse", rank: "1st", rankClass: "bg-[#FFD700] text-[#5a3c00]" },
  { photo: "photo-1557682250-33bd709cbe85", name: "Ocean Depths", creator: "@NeoPixel", rank: "2nd", rankClass: "bg-[#D8D8D8] text-[#333]" },
  { photo: "photo-1541701494587-cb58502866ab", name: "Digital Noir", creator: "@DreamForge", rank: "3rd", rankClass: "bg-[#CD7F32] text-[#3a1800]" },
  { photo: "photo-1549880338-65ddcdfd017b", name: "Forest Spirit", creator: "@LuminaAI", rank: "Top 10", rankClass: "" },
];

const ChallengesSection = () => {
  return (
    <section className="py-12 px-6 md:px-12 bg-card">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none">Challenges</h2>
            <p className="text-[0.83rem] text-muted mt-[7px]">Enter, compete, win cash — open to all skill levels</p>
          </div>
        </div>

        {/* Live Challenge Card */}
        <div className="bg-foreground rounded-[20px] p-8 md:p-14 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center mb-7">
          <div>
            <div className="flex items-center gap-[7px] text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              Live Challenge
            </div>
            <h3 className="font-display text-[2.6rem] font-black tracking-[-0.03em] text-primary-foreground leading-[1.02] mb-3.5">
              CYBERPUNK CITY
            </h3>
            <p className="text-[0.92rem] text-primary-foreground/[0.9] leading-[1.65] mb-2 max-w-[460px] font-medium">
              Create the most stunning cyberpunk cityscape. Neon lights, flying cars, holographic ads — push the boundaries of futuristic urban imagination. Best entries win cash and a REAL CREATOR Pro subscription.
            </p>
            <div className="flex gap-8 mb-8 mt-6">
              {[
                { val: "7", label: "Days Left" },
                { val: "1,247", label: "Entries" },
                { val: "All", label: "Skill Levels" },
              ].map((s) => (
                <div key={s.label}>
                  <strong className="block text-primary-foreground text-[1.3rem] font-bold font-display">{s.val}</strong>
                  <span className="text-[0.68rem] text-primary-foreground/[0.6] uppercase tracking-[0.1em]">{s.label}</span>
                </div>
              ))}
            </div>
            <Link to="/challenges/1" className="inline-flex items-center gap-2 bg-card text-foreground font-body text-[0.86rem] font-bold px-7 py-3.5 rounded-lg border-none no-underline hover:bg-accent hover:text-primary-foreground transition-colors">
              Enter Now — Free
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-right">
            <div className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/[0.55] mb-1">Grand Prize</div>
            <div className="font-display text-[4rem] font-black text-accent tracking-[-0.04em] leading-none">$5,000</div>
            <div className="text-[0.75rem] text-primary-foreground/[0.7] mt-2 leading-[1.6]">+ REAL CREATOR Pro<br />+ Featured Placement</div>
          </div>
        </div>

        {/* Past Winners */}
        <div className="flex items-end justify-between mb-5">
          <h3 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">Past Winners</h3>
          <Link to="/challenges" className="text-[0.8rem] font-semibold text-foreground border-b-[1.5px] border-foreground pb-px whitespace-nowrap no-underline hover:text-accent hover:border-accent transition-colors">All Challenges →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {winners.map((w, i) => (
            <Link key={w.name} to={`/image/${i}`} className="rounded-xl overflow-hidden relative aspect-[3/4] cursor-pointer group block no-underline">
              <img src={`https://images.unsplash.com/${w.photo}?w=300&h=400&fit=crop&q=78`} alt={w.name} loading="lazy" className="w-full h-full object-cover block group-hover:scale-[1.04] transition-transform duration-[350ms]" />
              {w.rankClass && (
                <div className={`absolute top-2.5 left-2.5 text-[0.68rem] font-bold px-2.5 py-1 rounded-full z-10 ${w.rankClass}`}>{w.rank}</div>
              )}
              <ImageCardOverlay index={i} photo={w.photo} title={w.name} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChallengesSection;