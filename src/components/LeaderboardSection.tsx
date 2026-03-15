import { Link2, Lock, DollarSign } from "lucide-react";

const leaderboard = [
  { name: "AI.Verse", pts: "48,200", dl: "12.4K dls", c: "#4361ee", i: "AV" },
  { name: "NeoPixel", pts: "41,800", dl: "10.9K dls", c: "#c9184a", i: "NP" },
  { name: "DreamForge", pts: "37,100", dl: "9.8K dls", c: "#2a9d8f", i: "DF" },
  { name: "LuminaAI", pts: "29,400", dl: "7.3K dls", c: "#e76f51", i: "LA" },
  { name: "SpectraGen", pts: "24,600", dl: "5.9K dls", c: "#7b2d8b", i: "SG" },
];

const earnItems = [
  { title: "Auto Affiliate Links", desc: "Every image automatically carries your affiliate link. When someone joins REAL CREATOR through your work, you earn commission.", icon: Link2, bg: "#0A0A0A" },
  { title: "Private Gallery Codes", desc: "Lock your gallery with a code. Share it with whoever you choose. Change or revoke access anytime.", icon: Lock, bg: "#0A0A0A" },
  { title: "Creator Donations", desc: "Fans tip you on your profile or at download — we ask at exactly the right moment so you never have to.", icon: DollarSign, bg: "#E8472A" },
];

const LeaderboardSection = () => {
  return (
    <section className="py-[72px] px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Leaderboard */}
          <div>
            <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none mb-1.5">Leaderboard</h2>
            <p className="text-[0.82rem] text-muted mb-5">Top creators this month by downloads and engagement</p>
            <div className="bg-card border border-foreground/[0.08] rounded-2xl overflow-hidden">
              <div className="px-[22px] py-[18px] border-b border-foreground/[0.08] flex justify-between items-center">
                <span className="font-bold text-[0.86rem]">This Month</span>
                <span className="text-[0.74rem] text-muted">March 2026</span>
              </div>
              {leaderboard.map((r, i) => (
                <div key={r.name} className="flex items-center gap-3.5 px-[22px] py-3.5 border-b border-foreground/[0.04] last:border-none">
                  <div className={`font-display text-[1.1rem] font-black w-[22px] ${i < 3 ? "text-accent" : "text-foreground/20"}`}>{i + 1}</div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.72rem] font-bold text-primary-foreground shrink-0" style={{ background: r.c }}>{r.i}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[0.85rem]">{r.name}</div>
                    <div className="text-[0.73rem] text-muted">{r.pts} pts</div>
                  </div>
                  <div className="text-[0.78rem] font-semibold">{r.dl}</div>
                </div>
              ))}
            </div>
            <a href="#" className="text-[0.8rem] font-semibold text-foreground border-b-[1.5px] border-foreground pb-px inline-block mt-3.5">Full Leaderboard →</a>
          </div>

          {/* Earn */}
          <div>
            <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none mb-1.5">Earn As A Creator</h2>
            <p className="text-[0.82rem] text-muted mb-5">Every image you post works for you automatically</p>
            <div className="flex flex-col gap-2.5">
              {earnItems.map((e) => (
                <div key={e.title} className="bg-card border border-foreground/[0.08] rounded-[14px] p-[18px_20px] flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: e.bg }}>
                    <e.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-[0.86rem] mb-[3px]">{e.title}</div>
                    <div className="text-[0.78rem] text-muted leading-[1.55]">{e.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
