import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Image, Users, Download, DollarSign, Heart, Zap, FileText, Sparkles } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const stats = [
  { icon: Image, value: "2.4M+", label: "Free images" },
  { icon: Users, value: "84K+", label: "Creators" },
  { icon: Download, value: "1.2M+", label: "Downloads" },
  { icon: DollarSign, value: "$284K", label: "Paid to creators" },
];

const values = [
  { icon: Heart, title: "Free, forever", desc: "Every image on REAL ART is free to download and use commercially. No attribution, no subscription, no tricks. We monetize through REAL CREATOR — not through the people downloading." },
  { icon: Users, title: "Creators first", desc: "We built the affiliate system, donation flow, and private vault features because creators deserve revenue. Every product decision starts with: does this help creators earn more?" },
  { icon: FileText, title: "No hidden terms", desc: "Our license is simple: download it, use it, modify it, sell products with it. One page. Plain English. No lawyer required." },
  { icon: Zap, title: "Radical simplicity", desc: "We obsessively remove complexity. Upload in seconds. Download in one click. No watermarks, no export settings, no hoops. Speed is a feature." },
];

const milestones = [
  { year: "2023", title: "Idea born", desc: "Frustrated by the cost and complexity of stock image libraries, the founding team started prototyping a free alternative built for the AI era." },
  { year: "Jan 2024", title: "Private beta", desc: "100 hand-picked creators. 12,000 images uploaded in the first month. The affiliate program was the feature they kept asking about." },
  { year: "Jun 2024", title: "Public launch", desc: "Opened to the public. 50,000 images uploaded in the first week. Downloads hit 100K within a month." },
  { year: "Dec 2024", title: "1M downloads", desc: "Hit 1 million downloads. Launched challenges, communities, and the leaderboard system." },
  { year: "2025", title: "REAL CREATOR", desc: "Launched the AI creation suite. The flywheel between REAL ART and REAL CREATOR began driving massive organic growth." },
  { year: "2026", title: "Now", desc: "2.4M+ images. 84K+ creators. $284K paid out. And we're just getting started." },
];

const team = [
  { name: "Marcus Cole", role: "Founder & CEO", initials: "MC", color: "#4361ee", bio: "Serial entrepreneur. Built three platforms before REAL ART. Believes the best creative tools should be free." },
  { name: "Anya Reyes", role: "Head of Product", initials: "AR", color: "#c9184a", bio: "Former product lead at a major design tool. Obsessed with removing friction between creators and their audience." },
  { name: "James Okafor", role: "Head of Engineering", initials: "JO", color: "#2a9d8f", bio: "Full-stack engineer. Built the first version in 6 weeks. Still writes code every day." },
  { name: "Priya Shah", role: "Head of Community", initials: "PS", color: "#e76f51", bio: "Community architect. Grew three online creator communities to 100K+ members before joining REAL ART." },
  { name: "Leo Vance", role: "Lead Designer", initials: "LV", color: "#7209b7", bio: "Obsessive about craft. Every pixel on this platform went through Leo twice." },
  { name: "Dani Kim", role: "Creator Partnerships", initials: "DK", color: "#f72585", bio: "Works directly with top creators to build the programs that keep them earning and engaged." },
];

const AboutPage = () => {
  return (
    <PageShell>
        {/* Breadcrumb */}
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">About</span>
        </div>

        {/* Hero */}
        <section className="px-6 md:px-12 pt-8 pb-16 max-w-[1440px] mx-auto">
          <div className="max-w-[680px]">
            <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent mb-4 block">Our Story</span>
            <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-black tracking-[-0.03em] leading-[1.02] mb-6">
              Art should be free.<br />
              <span className="text-muted">Creators should earn.</span>
            </h1>
            <p className="text-[0.94rem] text-muted leading-[1.75] mb-4">
              REAL ART was built on a simple conviction: the best visuals in the world shouldn't sit behind a paywall. They should be free for anyone building something — and the people who made them should earn from the ecosystem, not from selling access.
            </p>
            <p className="text-[0.94rem] text-muted leading-[1.75]">
              We're a team of creators, engineers, and community builders who got tired of the old model. So we built a new one.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-12">
            {stats.map(s => (
              <div key={s.label} className="bg-card border border-foreground/[0.08] rounded-xl p-5 text-center">
                <s.icon className="w-5 h-5 text-accent mb-3 mx-auto" />
                <div className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-1">{s.value}</div>
                <div className="text-[0.75rem] text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="px-6 md:px-12 py-16 bg-card max-w-full">
          <div className="max-w-[1440px] mx-auto">
            <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent mb-2 block">What we believe</span>
            <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] leading-none mb-10">Our values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {values.map(v => (
                <div key={v.title} className="bg-background border border-foreground/[0.06] rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-[1.2rem] font-black tracking-[-0.02em] mb-2">{v.title}</h3>
                  <p className="text-[0.84rem] text-muted leading-[1.7]">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="px-6 md:px-12 py-16 max-w-[1440px] mx-auto">
          <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent mb-2 block">The journey</span>
          <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] leading-none mb-10">How we got here</h2>
          <div className="relative">
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-foreground/[0.08]" />
            <div className="flex flex-col gap-8">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-5 relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[0.65rem] font-bold shrink-0 z-10 ${i === milestones.length - 1 ? "bg-accent text-primary-foreground" : "bg-foreground text-primary-foreground"}`}>
                    {m.year.slice(-2)}
                  </div>
                  <div>
                    <div className="text-[0.72rem] font-bold text-accent uppercase tracking-[0.1em] mb-0.5">{m.year}</div>
                    <h3 className="font-display text-[1.1rem] font-black tracking-[-0.02em] mb-1">{m.title}</h3>
                    <p className="text-[0.84rem] text-muted leading-[1.65] max-w-[520px]">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="px-6 md:px-12 py-16 bg-card">
          <div className="max-w-[1440px] mx-auto">
            <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent mb-2 block">The people</span>
            <h2 className="font-display text-[2.4rem] font-black tracking-[-0.03em] leading-none mb-10">Who builds this</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {team.map(t => (
                <div key={t.name} className="bg-background border border-foreground/[0.06] rounded-xl p-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-[1rem] font-bold text-white mb-4 shadow-lg" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <h3 className="font-display text-[1.05rem] font-black tracking-[-0.02em]">{t.name}</h3>
                  <div className="text-[0.75rem] text-accent font-semibold mb-2">{t.role}</div>
                  <p className="text-[0.82rem] text-muted leading-[1.6]">{t.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 md:px-12 py-20 text-center max-w-[1440px] mx-auto">
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] leading-none mb-3">Come build with us.</h2>
          <p className="text-[0.9rem] text-muted mb-8 max-w-[480px] mx-auto leading-[1.65]">
            Upload your art, build a community, or just download something beautiful. We made this for you.
          </p>
          <Link to="/upload" className="inline-flex items-center gap-2 bg-foreground text-primary-foreground text-[0.86rem] font-semibold px-7 py-3.5 rounded-lg hover:bg-accent transition-colors">
            <Sparkles className="w-4 h-4" /> Start Uploading
          </Link>
        </section>

        <Footer />
    </PageShell>
  );
};

export default AboutPage;