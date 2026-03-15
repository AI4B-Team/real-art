import { Check } from "lucide-react";

const BottomCTA = () => {
  return (
    <div className="mx-6 md:mx-12 mb-12 bg-foreground rounded-[20px] p-12 md:p-[88px_80px] grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center relative overflow-hidden">
      <div className="absolute -right-[60px] -top-[60px] w-[360px] h-[360px] rounded-full pointer-events-none" style={{ background: "var(--gradient-cta-glow)" }} />
      <div>
        <div className="text-[0.68rem] font-semibold tracking-[0.16em] uppercase text-primary-foreground/30 mb-5">Free Forever</div>
        <h2 className="font-display text-[clamp(2.4rem,4vw,3.8rem)] font-black tracking-[-0.03em] leading-none text-primary-foreground mb-4">
          Turn Your Art<br />Into <em className="italic font-normal text-accent">Influence.</em>
        </h2>
        <p className="text-[0.9rem] text-primary-foreground/45 font-light leading-[1.65]">
          Join 84,000+ creators sharing visuals, earning affiliate income, and building communities on REAL ART.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <button className="bg-card text-foreground font-body text-[0.88rem] font-bold px-9 py-3.5 rounded-lg border-none cursor-pointer hover:bg-accent hover:text-primary-foreground transition-colors text-center">
          Create Free Account
        </button>
        <button className="bg-transparent text-primary-foreground/50 font-body text-[0.88rem] font-normal px-7 py-3.5 rounded-lg border border-primary-foreground/[0.12] cursor-pointer hover:border-primary-foreground/[0.35] hover:text-primary-foreground/80 transition-colors text-center">
          Browse As Guest
        </button>
        <div className="flex flex-col gap-2 mt-1">
          {["No credit card required", "Download and use anywhere, instantly", "Earn from every image you share"].map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-[0.78rem] text-primary-foreground/[0.36]">
              <Check className="w-3 h-3 shrink-0 text-accent" />
              {perk}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomCTA;
