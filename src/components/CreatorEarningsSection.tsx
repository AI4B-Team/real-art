import { Link2, Lock, DollarSign, Package, ShoppingBag, Palette } from "lucide-react";

const earningMethods = [
  {
    title: "Affiliate Links",
    desc: "Every image automatically carries your affiliate link. When someone joins REAL CREATOR through your work, you earn commission.",
    icon: Link2,
    highlight: false,
  },
  {
    title: "Creator Donations",
    desc: "Fans tip you on your profile or at download — we ask at exactly the right moment so you never have to.",
    icon: DollarSign,
    highlight: true,
  },
  {
    title: "Prompt Packs",
    desc: "Package your best prompts into sellable packs. Set your price, earn on every sale. Your creative recipes, monetized.",
    icon: Package,
    highlight: false,
  },
  {
    title: "Collections Marketplace",
    desc: "Curate premium image vaults and sell access. Build themed collections that other creators and businesses need.",
    icon: ShoppingBag,
    highlight: false,
  },
  {
    title: "Private Collection Codes",
    desc: "Lock your collection with a code. Share it with whoever you choose. Charge for premium access.",
    icon: Lock,
    highlight: false,
  },
  {
    title: "Style Transfer Commissions",
    desc: "Offer your unique art style as a service. Others apply your style to their images, you earn per transfer.",
    icon: Palette,
    highlight: false,
  },
];

const CreatorEarningsSection = () => {
  return (
    <div>
      <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none mb-3">Earn As A Creator</h2>
      <p className="text-[0.92rem] text-muted mb-2">Upload your art once and earn from:</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6">
        {["affiliate links", "donations", "prompt packs", "collections", "style transfers"].map(item => (
          <span key={item} className="text-[0.86rem] text-foreground font-medium flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-accent" /> {item}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {earningMethods.map((e) => (
          <div key={e.title} className={`border rounded-[16px] p-6 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] ${e.highlight ? "bg-accent border-accent" : "bg-card border-foreground/[0.08]"}`}>
            <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center ${e.highlight ? "bg-primary-foreground/20" : "bg-foreground/[0.06]"}`}>
              <e.icon className={`w-5 h-5 ${e.highlight ? "text-primary-foreground" : "text-foreground"}`} />
            </div>
            <div className={`font-semibold text-[0.92rem] ${e.highlight ? "text-primary-foreground" : ""}`}>{e.title}</div>
            <div className={`text-[0.8rem] leading-[1.6] ${e.highlight ? "text-primary-foreground/70" : "text-muted"}`}>{e.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorEarningsSection;
