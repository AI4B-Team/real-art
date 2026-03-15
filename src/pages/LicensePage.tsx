import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Check, X, Shield, Download, Globe, Briefcase, AlertTriangle, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allowed = [
  "Download and use images for free — forever",
  "Use in personal projects, websites, and social media",
  "Use in commercial projects, client work, and products for sale",
  "Modify, crop, edit, filter, or remix any image",
  "Use in digital advertising and marketing materials",
  "Print on physical products like merchandise and packaging",
  "Embed in apps, software, or digital products",
  "Use in presentations, publications, and editorial work",
  "Animate, stylize, or transform any image",
];

const notAllowed = [
  "Claim authorship of the original unmodified image",
  "Sell unmodified images on stock image platforms",
  "Use images in ways that target or defame identifiable individuals",
  "Redistribute as a standalone file as if it were your own stock library",
  "Use in contexts that violate applicable law",
];

const noNeed = [
  "Attribution or credit to REAL ART",
  "Attribution or credit to the original creator",
  "Linking back to the source",
  "Asking for permission",
  "Purchasing a license",
];

const useCases: { icon: React.ElementType; title: string; desc: string; ok: boolean }[] = [
  { icon: Globe, title: "Websites & Apps", desc: "Use any image as a hero, background, illustration, or UI element in any website or application you build.", ok: true },
  { icon: Briefcase, title: "Client Work", desc: "Use images in work you produce for clients — websites, ads, presentations, reports. No separate license needed.", ok: true },
  { icon: Download, title: "Print & Merch", desc: "Print images on t-shirts, posters, mugs, phone cases, and any other physical product you sell.", ok: true },
  { icon: Shield, title: "Editorial & Press", desc: "Use images in articles, blog posts, news pieces, and editorial publications without restriction.", ok: true },
  { icon: AlertTriangle, title: "Reselling as Stock", desc: "You cannot package unmodified REAL ART images and sell them as your own stock photo collection.", ok: false },
  { icon: X, title: "Defamatory Use", desc: "Images cannot be used in ways that defame, mislead about, or harm the reputation of real identifiable individuals.", ok: false },
];

const fullLicense = `REAL ART FREE LICENSE — Version 1.0
Effective Date: January 1, 2024

1. GRANT OF LICENSE
REAL ART hereby grants you a worldwide, non-exclusive, royalty-free, perpetual license to download, copy, modify, distribute, perform, and use the images available on the REAL ART platform ("Content") for any lawful purpose, including commercial purposes, without attribution.

2. PERMITTED USES
You may use Content in:
(a) Personal and commercial websites, apps, and software
(b) Advertising, marketing, and promotional materials
(c) Editorial publications, articles, and media
(d) Physical products including merchandise and packaging
(e) Any other lawful use, whether digital or physical

3. RESTRICTIONS
You may not:
(a) Claim original authorship of unmodified Content
(b) Resell or redistribute unmodified Content as stock imagery
(c) Use Content in any unlawful manner
(d) Use Content to defame or mislead about identifiable individuals

4. NO WARRANTY
Content is provided "as is" without warranty of any kind. REAL ART makes no representations regarding accuracy, completeness, or fitness for a particular purpose.

5. ATTRIBUTION
Attribution is not required but always appreciated.

6. MODIFICATIONS
REAL ART reserves the right to update this license at any time. Continued use of Content following any update constitutes acceptance.`;

const LicensePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">License</span>
        </div>

        {/* Hero */}
        <section className="px-6 md:px-12 pt-8 pb-12 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className="text-[0.72rem] font-semibold text-accent">Free License</span>
          </div>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-black tracking-[-0.03em] leading-[1.02] mb-4">
            Simple License.<br /><span className="text-muted">Plain Language.</span>
          </h1>
          <p className="text-[0.94rem] text-muted leading-[1.75] max-w-[600px]">
            All images on REAL ART are free to use. No attribution, no subscription, no lawyer.<br />
            This page explains exactly what that means.
          </p>
        </section>

        {/* TL;DR */}
        <section className="px-6 md:px-12 max-w-[1440px] mx-auto mb-12">
          <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-accent" />
              <span className="font-semibold text-[0.9rem]">The Short Version</span>
            </div>
            <p className="text-[0.88rem] text-muted leading-[1.7]">
              Download any image. Use it in anything you build, sell, or share. Modify it however you want. Don't claim you made the original or try to resell it as stock. That's it.
            </p>
          </div>
        </section>

        {/* 3 Columns */}
        <section className="px-6 md:px-12 max-w-[1440px] mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Allowed */}
            <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-display text-[1.1rem] font-black">What you can do</h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {allowed.map(item => (
                  <div key={item} className="flex items-start gap-2 text-[0.8rem] text-muted">
                    <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Not Allowed */}
            <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-display text-[1.1rem] font-black">What you cannot do</h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {notAllowed.map(item => (
                  <div key={item} className="flex items-start gap-2 text-[0.8rem] text-muted">
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* No Need */}
            <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-display text-[1.1rem] font-black">What you don't need</h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {noNeed.map(item => (
                  <div key={item} className="flex items-start gap-2 text-[0.8rem] text-muted">
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 md:px-12 py-16 bg-card">
          <div className="max-w-[1440px] mx-auto">
            <h2 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-2">Common use cases</h2>
            <p className="text-[0.84rem] text-muted mb-8">Still not sure if your use case is covered? Here are the most common ones.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {useCases.map(uc => (
                <div key={uc.title} className="bg-background border border-foreground/[0.06] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <uc.icon className="w-5 h-5 text-muted" />
                    <span className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-full ${uc.ok ? "bg-green-600/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                      {uc.ok ? "Allowed" : "Not allowed"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[0.92rem] mb-1">{uc.title}</h3>
                  <p className="text-[0.8rem] text-muted leading-[1.6]">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full License Text */}
        <section className="px-6 md:px-12 py-16 max-w-[1440px] mx-auto">
          <h2 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-6">Full license text</h2>
          <pre className="bg-card border border-foreground/[0.08] rounded-xl p-6 text-[0.78rem] text-muted leading-[1.8] whitespace-pre-wrap font-mono overflow-x-auto">
            {fullLicense}
          </pre>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-12 py-16 text-center max-w-[1440px] mx-auto">
          <h2 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-3">Still have questions?</h2>
          <p className="text-[0.88rem] text-muted mb-8 max-w-[520px] mx-auto leading-[1.65]">
            Our license is designed to be as permissive as possible. If you're unsure about a specific use case, the answer is almost certainly yes. For anything unusual, email us at legal@realart.ai.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/explore" className="inline-flex items-center gap-2 bg-foreground text-primary-foreground text-[0.86rem] font-semibold px-7 py-3 rounded-lg hover:bg-accent transition-colors">
              <Download className="w-4 h-4" /> Start Downloading
            </Link>
            <a href="mailto:legal@realart.ai" className="inline-flex items-center gap-2 bg-card border border-foreground/[0.12] text-[0.86rem] font-semibold px-7 py-3 rounded-lg hover:border-foreground/30 transition-colors">
              Contact Us
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default LicensePage;