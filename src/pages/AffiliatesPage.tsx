import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, ArrowRight, DollarSign, Image,
  Users, TrendingUp, Link2, Check, ChevronDown
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { value: "$12–$48", label: "Per Referral", note: "Depending on your tier" },
  { value: "90 days", label: "Cookie Window", note: "Conversions tracked for 90 days" },
  { value: "40%", label: "Max Commission", note: "At Pro tier" },
];

const tiers = [
  {
    name: "Starter", threshold: "0 referrals", rate: "20%", perSale: "$6–$24",
    perks: ["Affiliate link on all images", "Monthly payouts", "Basic analytics dashboard"],
    highlight: false,
  },
  {
    name: "Creator", threshold: "10+ referrals / mo", rate: "30%", perSale: "$9–$36",
    perks: ["Everything in Starter", "Priority payout (weekly)", "Featured in creator directory", "Commission on upgrades"],
    highlight: true,
  },
  {
    name: "Pro", threshold: "50+ referrals / mo", rate: "40%", perSale: "$12–$48",
    perks: ["Everything in Creator", "Dedicated affiliate manager", "Custom landing page", "Lifetime commission on referred users"],
    highlight: false,
  },
];

const faqs = [
  {
    q: "How does the affiliate link work?",
    a: "Every image you publish on REAL ART automatically has your unique affiliate link embedded. When a visitor clicks on your image and signs up for REAL CREATOR, we track that referral back to you — no setup required.",
  },
  {
    q: "When and how do I get paid?",
    a: "Starter creators are paid monthly via PayPal or Stripe. Creator and Pro tier creators unlock weekly payouts. Minimum payout threshold is $25.",
  },
  {
    q: "What counts as a conversion?",
    a: "Any user who clicks through your affiliate link and purchases any REAL CREATOR plan within 90 days counts as your conversion. This includes monthly, annual, and lifetime plans.",
  },
  {
    q: "Can I see which images are generating clicks?",
    a: "Yes. Your affiliate dashboard shows click-through rates, conversions, and earnings broken down by individual image so you can see what's working.",
  },
  {
    q: "What if someone upgrades their plan later?",
    a: "Pro tier creators earn commission on plan upgrades as well. If someone you referred starts on the free plan and upgrades 6 months later, you earn commission on that upgrade.",
  },
];

const AffiliatesPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="px-6 md:px-12 py-16 max-w-[1440px] mx-auto text-center">
          <div className="flex items-center gap-2 text-[0.8rem] text-muted mb-8 justify-center">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">Affiliates</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-accent/[0.08] text-accent text-[0.72rem] font-bold px-3.5 py-1.5 rounded-full tracking-[0.1em] uppercase mb-6">
            <DollarSign className="w-3.5 h-3.5" /> Earn While You Create
          </div>
          <h1 className="font-display text-[clamp(2.8rem,6vw,5rem)] font-black tracking-[-0.04em] leading-none mb-5">
            Your images work<br />for you — automatically.
          </h1>
          <p className="text-[1rem] text-muted font-light leading-[1.7] max-w-[560px] mx-auto mb-10">
            Every image you publish on REAL ART carries your affiliate link. When anyone joins REAL CREATOR through your art, you earn up to 40% commission — without lifting a finger.
          </p>
          <div className="flex items-center justify-center gap-3 mb-12">
            <Link to="/upload">
              <button className="flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-3.5 rounded-lg text-[0.9rem] font-semibold hover:bg-accent transition-colors">
                Start Earning <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button className="px-6 py-3.5 rounded-lg border border-foreground/[0.14] text-[0.9rem] font-medium hover:border-foreground/30 transition-colors">
              View Dashboard
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 max-w-[600px] mx-auto">
            {stats.map(stat => (
              <div key={stat.label} className="bg-card border border-foreground/[0.08] rounded-xl p-4">
                <div className="font-display text-[1.6rem] font-black tracking-[-0.03em] leading-none mb-1">{stat.value}</div>
                <div className="text-[0.72rem] font-semibold text-foreground mb-0.5">{stat.label}</div>
                <div className="text-[0.68rem] text-muted">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="px-6 md:px-12 py-12 bg-card">
          <div className="max-w-[1440px] mx-auto">
            <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2 text-center">How it works</h2>
            <p className="text-[0.88rem] text-muted text-center mb-10">Three steps. Zero setup.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "01", icon: Image, title: "Upload your art", desc: "Post any image on REAL ART. Your affiliate link is automatically embedded — no setup, no code, no forms." },
                { step: "02", icon: Users, title: "Someone discovers it", desc: "A visitor finds your image, clicks through, and signs up for REAL CREATOR. We track it back to you for 90 days." },
                { step: "03", icon: DollarSign, title: "You earn commission", desc: "Get paid up to 40% of every plan they purchase — monthly, annual, or lifetime. Commission scales with your referral volume." },
              ].map(item => (
                <div key={item.step} className="bg-foreground rounded-xl p-6 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/30 mb-2">{item.step}</div>
                  <h3 className="font-display text-[1.3rem] font-black text-primary-foreground tracking-[-0.02em] mb-2">{item.title}</h3>
                  <p className="text-[0.8rem] text-primary-foreground/55 leading-[1.65]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commission tiers */}
        <div className="px-6 md:px-12 py-16 max-w-[1440px] mx-auto">
          <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2 text-center">Commission tiers</h2>
          <p className="text-[0.88rem] text-muted text-center mb-10">The more you refer, the more you earn per referral.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map(tier => (
              <div key={tier.name} className={`rounded-2xl border p-6 relative overflow-hidden ${tier.highlight ? "border-accent bg-accent/[0.03] shadow-[0_0_40px_rgba(232,71,42,0.08)]" : "border-foreground/[0.08] bg-card"}`}>
                {tier.highlight && (
                  <div className="absolute top-3 right-3 text-[0.6rem] font-bold tracking-[0.1em] uppercase bg-accent text-white px-2.5 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-[0.72rem] text-muted mb-1">{tier.threshold}</div>
                <div className={`font-display text-[2.4rem] font-black tracking-[-0.03em] leading-none mb-1 ${tier.highlight ? "text-accent" : ""}`}>
                  {tier.rate}
                </div>
                <div className={`text-[0.82rem] mb-1 ${tier.highlight ? "text-primary-foreground/50" : "text-muted"}`}>
                  commission rate
                </div>
                <div className={`font-semibold text-[1rem] mb-5 ${tier.highlight ? "text-primary-foreground" : "text-foreground"}`}>
                  {tier.name}
                </div>
                <div className="text-[0.78rem] font-semibold mb-5 ${tier.highlight ? 'text-foreground' : ''}">
                  {tier.perSale} per referred member
                </div>
                <div className="flex flex-col gap-2.5">
                  {tier.perks.map(perk => (
                    <div key={perk} className={`flex items-start gap-2.5 text-[0.8rem] ${tier.highlight ? "text-primary-foreground/70" : "text-muted"}`}>
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${tier.highlight ? "text-accent" : "text-accent"}`} />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings calculator */}
        <div className="px-6 md:px-12 pb-16 max-w-[1440px] mx-auto">
          <div className="bg-card border border-foreground/[0.08] rounded-2xl p-8 mb-16">
            <h2 className="font-display text-[2rem] font-black tracking-[-0.03em] mb-2">Earnings potential</h2>
            <p className="text-muted text-[0.86rem] mb-6">With just 100 quality images and moderate traffic, here's what's possible:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "100 images published", icon: Image, sub: "Average 500 views/image/month" },
                { label: "50,000 monthly views", icon: TrendingUp, sub: "2% click-through to REAL CREATOR" },
                { label: "~1,000 referral clicks", icon: Link2, sub: "3% conversion to paid plan" },
                { label: "$360–$1,440/mo", icon: DollarSign, sub: "At Creator tier (30% commission)", highlight: true },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-5 ${item.highlight ? "bg-accent text-white" : "bg-background border border-foreground/[0.06]"}`}>
                  <item.icon className={`w-5 h-5 mb-3 ${item.highlight ? "text-white" : "text-muted"}`} />
                  <div className={`font-semibold text-[0.88rem] mb-1 ${item.highlight ? "text-white" : ""}`}>{item.label}</div>
                  <div className={`text-[0.75rem] ${item.highlight ? "text-white/70" : "text-muted"}`}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-[720px] mx-auto mb-16">
            <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-8 text-center">Common questions</h2>
            <div className="flex flex-col gap-2">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-foreground/[0.02] transition-colors"
                  >
                    <span className="font-semibold text-[0.88rem] pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-[0.83rem] text-muted leading-[1.7]">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-foreground rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
            <h2 className="font-display text-[2.2rem] font-black text-primary-foreground tracking-[-0.03em] mb-3">Ready to start earning?</h2>
            <p className="text-[0.88rem] text-primary-foreground/50 mb-6">Upload your first image. Your affiliate link is already waiting.</p>
            <Link to="/upload">
              <button className="inline-flex items-center gap-2 bg-accent text-white px-7 py-3.5 rounded-lg text-[0.9rem] font-semibold hover:bg-accent/90 transition-colors">
                Upload Art & Start Earning <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AffiliatesPage;
