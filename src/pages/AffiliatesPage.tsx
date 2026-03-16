import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, DollarSign, ExternalLink,
  Check, ChevronDown, Link2, ShoppingBag, Zap, TrendingUp,
  Users, Globe, Shield, Star, Sparkles, Package
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import { affiliateNetwork, affiliateCategories } from "@/lib/affiliateNetwork";

/* ═══ TWO INCOME STREAMS ═══ */
const streams = [
  {
    icon: ShoppingBag,
    tag: "Stream 1",
    title: "Your shop & product links",
    headline: "Sell anything. Keep everything.",
    desc: "Add an affiliate or shop link to any image you upload — Etsy listings, courses, print shops, presets, gear, anything. When visitors click through and buy, you earn commission. REAL ART takes nothing. 0%. The full commission goes directly to you.",
    stats: [
      { value: "100%", label: "Commission to you", note: "We take nothing" },
      { value: "28+", label: "Partner brands", note: "Auto-detected on upload" },
      { value: "Auto", label: "Link detection", note: "Paste URL, done" },
    ],
    accent: true,
  },
  {
    icon: Users,
    tag: "Stream 2",
    title: "REAL ART platform referrals",
    headline: "Your images recruit for you.",
    desc: "Every image you publish carries your unique referral link. When anyone discovers your art and signs up for a REAL CREATOR plan, you earn commission — automatically, without any extra setup. The more you post, the more surface area you have.",
    stats: [
      { value: "Up to 40%", label: "Commission rate", note: "Scales with volume" },
      { value: "90 days", label: "Cookie window", note: "Long tracking period" },
      { value: "Auto", label: "Setup required", note: "Already embedded" },
    ],
    accent: false,
  },
];

const howItWorks = [
  { step: "01", icon: Package, title: "Upload your art", desc: "Post any image on REAL ART. Your affiliate link is automatically embedded — no setup, no code, no forms." },
  { step: "02", icon: Users, title: "Someone discovers it", desc: "A visitor finds your image, clicks through, and signs up for REAL CREATOR. We track it back to you for 90 days." },
  { step: "03", icon: DollarSign, title: "You earn commission", desc: "Get paid up to 40% of every plan they purchase — monthly, annual, or lifetime. Commission scales with your referral volume." },
];

const platformTiers = [
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
  { q: "How does the affiliate link work?", a: "Every image you publish on REAL ART automatically has your unique affiliate link embedded. When a visitor clicks on your image and signs up for REAL CREATOR, we track that referral back to you — no setup required." },
  { q: "When and how do I get paid?", a: "Starter creators are paid monthly via PayPal or Stripe. Creator and Pro tier creators unlock weekly payouts. Minimum payout threshold is $25." },
  { q: "What counts as a conversion?", a: "Any user who clicks through your affiliate link and purchases any REAL CREATOR plan within 90 days counts as your conversion. This includes monthly, annual, and lifetime plans." },
  { q: "Can I see which images are generating clicks?", a: "Yes. Your affiliate dashboard shows click-through rates, conversions, and earnings broken down by individual image so you can see what's working." },
  { q: "What about my shop links?", a: "Your external shop and affiliate links (Etsy, Amazon, Gumroad, etc.) are separate from the platform referral program. You keep 100% of commissions from those links — REAL ART takes nothing." },
  { q: "What if someone upgrades their plan later?", a: "Pro tier creators earn commission on plan upgrades as well. If someone you referred starts on the free plan and upgrades 6 months later, you earn commission on that upgrade." },
];

const AffiliatesPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [partnerFilter, setPartnerFilter] = useState("All");

  const filteredPartners = partnerFilter === "All"
    ? affiliateNetwork
    : affiliateNetwork.filter(p => p.category === partnerFilter);

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
            <span className="text-foreground">Earn</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-accent/[0.08] text-accent text-[0.72rem] font-bold px-3.5 py-1.5 rounded-full tracking-[0.1em] uppercase mb-6">
            <DollarSign className="w-3.5 h-3.5" /> Two Ways To Earn
          </div>
          <h1 className="font-display text-[clamp(2.8rem,6vw,5rem)] font-black tracking-[-0.04em] leading-none mb-5">
            Your art should<br />pay you.
          </h1>
          <p className="text-[1rem] text-muted font-light leading-[1.7] max-w-[600px] mx-auto mb-10">
            Every image you publish is a potential earner. Two income streams, zero setup for the platform one, and 100% of external commissions to you.
          </p>
          <Link to="/upload">
            <button className="inline-flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-3.5 rounded-lg text-[0.9rem] font-semibold hover:bg-accent transition-colors">
              <Zap className="w-4 h-4" /> Upload & Start Earning
            </button>
          </Link>
        </div>

        {/* Two Streams */}
        <div className="px-6 md:px-12 pb-16 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {streams.map((stream, idx) => (
              <div key={idx} className={`rounded-2xl border p-8 relative overflow-hidden ${stream.accent ? "border-accent bg-accent/[0.03] shadow-[0_0_40px_rgba(232,71,42,0.08)]" : "border-foreground/[0.08] bg-card"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <stream.icon className="w-4 h-4 text-accent" />
                  <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">{stream.tag}</span>
                </div>
                <h2 className="font-display text-[1.6rem] font-black tracking-[-0.03em] leading-none mb-1">{stream.title}</h2>
                <p className="text-[1.1rem] font-semibold text-foreground/80 mb-3">{stream.headline}</p>
                <p className="text-[0.82rem] text-muted leading-[1.65] mb-6">{stream.desc}</p>
                <div className="grid grid-cols-3 gap-3">
                  {stream.stats.map(st => (
                    <div key={st.label} className="bg-background border border-foreground/[0.06] rounded-xl p-3">
                      <div className="font-display text-[1.1rem] font-black tracking-[-0.02em] leading-none mb-0.5">{st.value}</div>
                      <div className="text-[0.68rem] font-semibold text-foreground mb-0.5">{st.label}</div>
                      <div className="text-[0.62rem] text-muted">{st.note}</div>
                    </div>
                  ))}
                </div>
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
              {howItWorks.map(item => (
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

        {/* Partner network */}
        <div className="px-6 md:px-12 py-16 max-w-[1440px] mx-auto">
          <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2 text-center">Partner network</h2>
          <p className="text-[0.88rem] text-muted text-center mb-8">{affiliateNetwork.length} brands. Auto-detected from your URL. You keep 100% of commission.</p>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {affiliateCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setPartnerFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors ${partnerFilter === cat ? "bg-foreground text-primary-foreground" : "bg-card border border-foreground/[0.1] text-muted hover:text-foreground"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredPartners.map(p => (
              <div key={p.id} className="bg-card border border-foreground/[0.08] rounded-xl p-4 hover:border-foreground/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="font-semibold text-[0.84rem] truncate">{p.name}</span>
                  {p.popular && <Star className="w-3 h-3 text-accent shrink-0 fill-accent" />}
                </div>
                <div className="text-[0.72rem] text-muted mb-2">{p.category}</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[0.88rem]">{p.commission}</span>
                  <span className="text-[0.68rem] text-muted">{p.cookieDays}d cookie</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform referral tiers */}
        <div className="px-6 md:px-12 py-16 max-w-[1440px] mx-auto">
          <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-2 text-center">Platform referral tiers</h2>
          <p className="text-[0.88rem] text-muted text-center mb-10">The more you refer, the higher your rate. Tiers reset monthly.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {platformTiers.map(tier => (
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
                <div className="text-[0.82rem] text-muted mb-1">commission rate</div>
                <div className="font-semibold text-[1rem] mb-2">{tier.name} Tier</div>
                <div className="text-[0.78rem] font-semibold mb-5">Per plan sold: {tier.perSale}</div>
                <div className="flex flex-col gap-2.5">
                  {tier.perks.map(perk => (
                    <div key={perk} className="flex items-start gap-2.5 text-[0.8rem] text-muted">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlight ? "text-accent" : "text-green-500"}`} />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FTC Compliance */}
        <div className="px-6 md:px-12 pb-16 max-w-[1440px] mx-auto">
          <div className="bg-card border border-foreground/[0.08] rounded-2xl p-8 flex items-start gap-5">
            <Shield className="w-8 h-8 text-muted shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-[1.4rem] font-black tracking-[-0.02em] mb-2">Transparency & FTC compliance</h3>
              <p className="text-[0.84rem] text-muted leading-[1.7]">
                When you upload an image with an affiliate link, REAL ART automatically adds an "AD · Affiliate" disclosure badge to that image in compliance with FTC guidelines. You don't need to add your own disclosure text. We also disclose REAL ART's own referral program throughout the platform. We believe transparency builds trust — both with visitors and with regulators.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="px-6 md:px-12 pb-16 max-w-[1440px] mx-auto">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] mb-8 text-center">Questions</h2>
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
        </div>

        {/* Bottom CTA */}
        <div className="px-6 md:px-12 pb-16 max-w-[1440px] mx-auto">
          <div className="bg-foreground rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
            <h2 className="font-display text-[2.2rem] font-black text-primary-foreground tracking-[-0.03em] mb-3">Your art should pay you.</h2>
            <p className="text-[0.88rem] text-primary-foreground/50 mb-6">
              Every image you publish is a potential earner. Two income streams, zero setup for the platform one, and 100% of external commissions to you.
            </p>
            <Link to="/upload">
              <button className="inline-flex items-center gap-2 bg-accent text-white px-7 py-3.5 rounded-lg text-[0.9rem] font-semibold hover:bg-accent/90 transition-colors">
                <Zap className="w-4 h-4" /> Upload & Start Earning
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
