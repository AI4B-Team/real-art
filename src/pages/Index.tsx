import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Play, ChevronLeft, ChevronRight, ArrowRight,
  ArrowUpRight, Image, Video, Music2, Zap, Wand2, Upload,
  TrendingUp, Users, Star, Globe, RefreshCw,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

/* ─── Data ───────────────────────────────────────────────────── */

const announcements = [
  "Video generation now live — animate any image in one click",
  "Audio generation beta — lo-fi, cinematic, orchestral and more",
  "New: Upscale 4× — turn any image into ultra-HD",
  "April Challenge is live — $5,000 in creator prizes",
];

const heroSlides = [
  { tag: "Image Generation", title: "Soul Cinema",      sub: "Film-style images with cinematic lighting and color",    photo: "photo-1618005182384-a83a8bd57fbe" },
  { tag: "Video Animation",  title: "Motion Control",   sub: "Precise character actions and expressions up to 30 seconds", photo: "photo-1557682250-33bd709cbe85" },
  { tag: "AI Avatar",        title: "Digital Identity",  sub: "Build your AI persona across every style and medium",    photo: "photo-1579546929518-9e396f3cc809" },
  { tag: "Abstract Art",     title: "Fluid Generation",  sub: "Push the boundaries of abstract AI creation",            photo: "photo-1541701494587-cb58502866ab" },
  { tag: "Portrait Studio",  title: "Soul ID",           sub: "Ultra-realistic fashion visuals with any character",      photo: "photo-1604881991720-f91add269bed" },
];

const stats = [
  { value: "2.4M+", label: "AI Creations" },
  { value: "180K+", label: "Creators" },
  { value: "14M+",  label: "Downloads" },
  { value: "100%",  label: "Free to Start" },
];

const tools: { label: string; desc: string; icon: typeof Image; photo: string; link: string; gradient: string; badge?: string }[] = [
  { label: "Generate Image", desc: "Text to stunning visuals",      icon: Image,  photo: "photo-1618005182384-a83a8bd57fbe", link: "/create?type=image", gradient: "from-violet-700 to-violet-950" },
  { label: "Generate Video", desc: "Animate scenes and characters", icon: Video,  photo: "photo-1557682250-33bd709cbe85",    link: "/create?type=video", gradient: "from-blue-700 to-blue-950", badge: "New" },
  { label: "Generate Audio", desc: "Soundscapes and music tracks",  icon: Music2, photo: "photo-1511379938547-c1f69419868d", link: "/create?type=audio", gradient: "from-emerald-700 to-emerald-950" },
  { label: "Upscale 4×",     desc: "Enhance to ultra-HD resolution",icon: Zap,    photo: "photo-1604881991720-f91add269bed", link: "/create?type=image", gradient: "from-amber-700 to-amber-950" },
  { label: "Edit with AI",   desc: "Modify using natural language", icon: Wand2,  photo: "photo-1541701494587-cb58502866ab", link: "/create?type=image", gradient: "from-rose-700 to-rose-950" },
  { label: "Upload Art",     desc: "Publish your own creations",    icon: Upload, photo: "photo-1470071459604-3b5ec3a7fe05", link: "/upload",            gradient: "from-slate-700 to-slate-950" },
];

const trending = [
  { photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape",  creator: "aiverse",    views: "248K" },
  { photo: "photo-1579546929518-9e396f3cc809", title: "Digital Avatar 01",  creator: "luminaai",   views: "134K" },
  { photo: "photo-1557682250-33bd709cbe85",    title: "Neon Boulevard",     creator: "neopixel",   views: "98K" },
  { photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire",      creator: "spectragen", views: "76K" },
  { photo: "photo-1604881991720-f91add269bed", title: "Cyberpunk Portrait", creator: "voidart",    views: "189K" },
  { photo: "photo-1470071459604-3b5ec3a7fe05", title: "Misty Highlands",   creator: "dreamforge", views: "61K" },
];

const creators = [
  { name: "AI.Verse",   handle: "aiverse",    color: "#4361ee", init: "AV", images: 284, followers: "12.4K" },
  { name: "NeoPixel",   handle: "neopixel",   color: "#c9184a", init: "NP", images: 196, followers: "9.8K" },
  { name: "DreamForge", handle: "dreamforge", color: "#2a9d8f", init: "DF", images: 421, followers: "18.2K" },
  { name: "LuminaAI",   handle: "luminaai",   color: "#e76f51", init: "LA", images: 142, followers: "7.1K" },
];

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=`;

/* ─── Component ──────────────────────────────────────────────── */

const Index = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [toolHover, setToolHover] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Auto-advance hero
  useEffect(() => {
    timerRef.current = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goSlide = (dir: number) => {
    clearInterval(timerRef.current);
    setActiveSlide(p => (p + dir + heroSlides.length) % heroSlides.length);
    timerRef.current = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 5000);
  };

  return (
    <PageShell>
      {/* ─── 1. Announcement Ticker ──────────────────────────── */}
      <div className="bg-foreground overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap py-2">
          {[...announcements, ...announcements].map((a, i) => (
            <span key={i} className="mx-8 text-[0.75rem] font-medium text-primary-foreground/60 shrink-0">
              {a}
              <span className="mx-8 text-primary-foreground/20">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── 2. Hero Carousel ────────────────────────────────── */}
      <section className="relative w-full h-[85vh] min-h-[560px] max-h-[900px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={`${img(heroSlides[activeSlide].photo)}1920&q=80`}
              alt={heroSlides[activeSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 md:px-16 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-white/60 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 mb-4">
                {heroSlides[activeSlide].tag}
              </span>
              <h1 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] font-black text-white leading-[0.95] tracking-[-0.02em] mb-3">
                {heroSlides[activeSlide].title}
              </h1>
              <p className="text-[1rem] text-white/60 font-light max-w-[480px] mb-8 leading-relaxed">
                {heroSlides[activeSlide].sub}
              </p>
              <div className="flex items-center gap-3">
                <Link to="/create" className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-6 py-3 rounded-lg font-semibold text-[0.88rem] hover:bg-accent/85 transition-all no-underline">
                  <Sparkles className="w-4 h-4" /> Start Creating
                </Link>
                <Link to="/explore" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold text-[0.88rem] hover:bg-white/20 transition-all no-underline border border-white/15">
                  <Play className="w-4 h-4" /> Explore Gallery
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex items-center gap-2 mt-8">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(timerRef.current); setActiveSlide(i); timerRef.current = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 5000); }}
                className={`rounded-full transition-all duration-300 ${i === activeSlide ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/35 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>

        {/* Arrows */}
        <div className="absolute right-6 md:right-16 bottom-20 flex items-center gap-2 z-10">
          <button onClick={() => goSlide(-1)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => goSlide(1)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {heroSlides.map((s, i) => (
            <button
              key={i}
              onClick={() => { clearInterval(timerRef.current); setActiveSlide(i); timerRef.current = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 5000); }}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${i === activeSlide ? "border-white scale-110" : "border-white/25 opacity-50 hover:opacity-80"}`}
            >
              <img src={`${img(s.photo)}100&q=60`} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* ─── 3. Stats Bar ────────────────────────────────────── */}
      <section className="bg-foreground">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-0">
          {stats.map(s => (
            <div key={s.label} className="text-center py-8 border-r border-primary-foreground/[0.06] last:border-r-0">
              <div className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-black text-primary-foreground">{s.value}</div>
              <div className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-primary-foreground/35 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. Tools Grid ───────────────────────────────────── */}
      <section className="px-6 md:px-16 py-20 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-muted/60">AI Tools</span>
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-black text-foreground leading-[1] mt-2">
              What will you<br />create today?
            </h2>
          </div>
          <Link to="/create" className="hidden md:inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-foreground/60 hover:text-foreground transition-colors no-underline">
            Explore all tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tools.map((tool, i) => (
            <Link
              key={tool.label}
              to={tool.link}
              onMouseEnter={() => setToolHover(i)}
              onMouseLeave={() => setToolHover(null)}
              className="group relative rounded-2xl overflow-hidden no-underline cursor-pointer"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={`${img(tool.photo)}500&q=75`}
                alt={tool.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${tool.gradient} opacity-70 group-hover:opacity-80 transition-opacity`} />
              <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <tool.icon className="w-5 h-5 text-white/80 mb-2" />
                <h3 className="text-[0.92rem] font-bold text-white">{tool.label}</h3>
                <p className="text-[0.72rem] text-white/55 mt-0.5 leading-snug">{tool.desc}</p>
              </div>
              {tool.badge && (
                <span className="absolute top-3 right-3 bg-accent text-primary-foreground text-[0.62rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md z-10">
                  {tool.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 5. Trending Grid ────────────────────────────────── */}
      <section className="px-6 md:px-16 pb-20 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-muted/60">Community</span>
            <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-black text-foreground leading-[1] mt-2">Trending Now</h2>
          </div>
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-foreground/60 hover:text-foreground transition-colors no-underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {trending.map((item, i) => (
            <Link key={i} to={`/image/${item.creator}-${i}`} className="group relative rounded-2xl overflow-hidden no-underline" style={{ aspectRatio: "3/4" }}>
              <img
                src={`${img(item.photo)}500&q=75`}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <h3 className="text-[0.82rem] font-bold text-white truncate">{item.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[0.7rem] text-white/55">@{item.creator}</span>
                  <span className="flex items-center gap-1 text-[0.65rem] text-white/45">
                    <TrendingUp className="w-2.5 h-2.5" />{item.views}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 6. Feature Banner ───────────────────────────────── */}
      <section className="px-6 md:px-16 pb-20 max-w-[1440px] mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent" />
          <div className="relative grid md:grid-cols-2 gap-8 p-10 md:p-16">
            <div className="flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.15em] uppercase text-accent mb-4">
                <Zap className="w-3 h-3" /> Featured
              </span>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-black text-primary-foreground leading-[1.05] mb-4">
                Build Your<br />AI Identity
              </h2>
              <p className="text-[0.9rem] text-primary-foreground/45 leading-relaxed mb-8 max-w-[400px]">
                Create a persistent AI character with Soul ID. One character, every style, infinite possibilities — and you earn from every download.
              </p>
              <div className="flex items-center gap-3">
                <Link to="/create" className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-6 py-3 rounded-lg font-semibold text-[0.88rem] hover:bg-accent/85 transition-all no-underline">
                  <Sparkles className="w-4 h-4" /> Try it free
                </Link>
                <Link to="/explore" className="inline-flex items-center gap-2 text-primary-foreground/50 text-[0.88rem] font-semibold hover:text-primary-foreground transition-colors no-underline">
                  See examples <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-5">
              {[
                { icon: RefreshCw, text: "Consistent identity across every style" },
                { icon: Globe,     text: "Share publicly or keep collections private" },
                { icon: Star,      text: "Earn from every download and save" },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-foreground/[0.06] flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[0.88rem] text-primary-foreground/60 font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Creator Cards ────────────────────────────────── */}
      <section className="px-6 md:px-16 pb-20 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-muted/60">People</span>
            <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-black text-foreground leading-[1] mt-2">Top Creators</h2>
          </div>
          <Link to="/creators" className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-foreground/60 hover:text-foreground transition-colors no-underline">
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {creators.map(cr => (
            <Link key={cr.handle} to={`/creator/${cr.handle}`} className="group bg-card border border-foreground/[0.06] rounded-2xl p-5 text-center hover:border-foreground/[0.12] hover:shadow-lg transition-all no-underline">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: cr.color }}
              >
                {cr.init}
              </div>
              <h3 className="text-[0.92rem] font-bold text-foreground">{cr.name}</h3>
              <p className="text-[0.75rem] text-muted mt-0.5">@{cr.handle}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-[0.72rem] text-foreground/40">
                <span>{cr.images} <span className="text-foreground/25">images</span></span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cr.followers}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 8. CTA Footer ───────────────────────────────────── */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-cta-glow)]" />
        <div className="relative z-10 max-w-[600px] mx-auto">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] font-black text-foreground leading-[1.05] mb-4">
            Your creativity.<br />
            <em className="italic font-normal text-accent">Amplified by AI.</em>
          </h2>
          <p className="text-[0.95rem] text-muted leading-relaxed mb-8">
            Join 180,000+ creators generating images, videos, and music — completely free to start.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-7 py-3.5 rounded-lg font-semibold text-[0.92rem] hover:bg-accent/85 transition-all no-underline">
              <Sparkles className="w-4 h-4" /> Get Started Free
            </Link>
            <Link to="/explore" className="inline-flex items-center gap-2 text-foreground/50 text-[0.92rem] font-semibold hover:text-foreground transition-colors no-underline">
              Browse Gallery <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </PageShell>
  );
};

export default Index;
