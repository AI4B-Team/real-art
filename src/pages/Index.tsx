import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ChevronLeft, ChevronRight, ArrowRight,
  ArrowUpRight, Play,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

/* ─── Data ───────────────────────────────────────────────────── */

const featureCards = [
  {
    title: "CINEMA STUDIO 2.5",
    desc: "Director-level control over characters and locations with color grading built in",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop&q=80",
    badge: null,
    link: "/create?type=image",
  },
  {
    title: "SOUL CINEMA IS HERE",
    desc: "Create film-style images with cinematic lighting and color",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=340&fit=crop&q=80",
    badge: null,
    link: "/create?type=video",
  },
  {
    title: "SOUL CAST",
    desc: "Build your perfect movie cast in Soul Cinema Studio",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=340&fit=crop&q=80",
    badge: null,
    link: "/create?type=image",
  },
  {
    title: "AI AUDIO STUDIO",
    desc: "Voice cloning, multilingual synthesis, localization and more",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=340&fit=crop&q=80",
    badge: "New",
    link: "/create?type=audio",
  },
  {
    title: "STYLE TRANSFER",
    desc: "Apply any artistic style to your photos with a single click",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=340&fit=crop&q=80",
    badge: null,
    link: "/create?type=image",
  },
];

const photodumpImages = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=280&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=260&h=320&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=260&h=330&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=280&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=310&fit=crop&q=80",
];

const createGallery = [
  { image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=400&fit=crop&q=80", label: "Abstract" },
  { image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=400&fit=crop&q=80", label: "Portrait" },
  { image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop&q=80", label: "Fashion" },
  { image: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=300&h=400&fit=crop&q=80", label: "Cyberpunk", isNew: true },
  { image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop&q=80", label: "Landscape" },
  { image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&h=400&fit=crop&q=80", label: "Gradient" },
  { image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=300&h=400&fit=crop&q=80", label: "Neon" },
  { image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=400&fit=crop&q=80", label: "Abstract Fire" },
];

const announcements = [
  "Video generation now live — animate any image in one click",
  "Audio generation beta — lo-fi, cinematic, orchestral and more",
  "New: Upscale 4× — turn any image into ultra-HD",
  "April Challenge is live — $5,000 in creator prizes",
];

/* ─── Component ──────────────────────────────────────────────── */

const Index = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
    }
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

      {/* ─── 2. Feature Cards Carousel ───────────────────────── */}
      <section className="bg-foreground pt-10 pb-14 px-6 md:px-16 relative">
        <div className="max-w-[1440px] mx-auto relative">
          {/* Scroll Arrows */}
          <button
            onClick={() => scrollCarousel(-1)}
            className="absolute -left-2 top-[140px] z-20 w-10 h-10 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors border border-primary-foreground/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollCarousel(1)}
            className="absolute -right-2 top-[140px] z-20 w-10 h-10 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors border border-primary-foreground/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2"
          >
            {featureCards.map((card, i) => (
              <Link
                key={i}
                to={card.link}
                className="group flex-shrink-0 w-[340px] no-underline"
              >
                <div className="relative rounded-2xl overflow-hidden mb-3">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-[220px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Title overlay on image */}
                  <div className="absolute inset-0 flex items-end p-5">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <h3 className="relative font-display text-[1.4rem] font-black text-primary-foreground tracking-tight leading-tight uppercase">
                      {card.title}
                    </h3>
                  </div>
                  {card.badge && (
                    <span className="absolute top-3 right-3 bg-accent text-primary-foreground text-[0.6rem] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg">
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-[0.92rem] font-bold text-primary-foreground uppercase tracking-wide">{card.title}</p>
                <p className="text-[0.78rem] text-primary-foreground/45 mt-1 leading-relaxed line-clamp-2">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Photodump Banner ─────────────────────────────── */}
      <section className="bg-foreground px-6 md:px-16 pb-14">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-[hsl(0_0%_12%)] min-h-[380px]">
            {/* Scattered photos */}
            <div className="absolute inset-0 overflow-hidden">
              {photodumpImages.map((src, i) => {
                const positions = [
                  { top: "8%", right: "5%", rotate: "-6deg", width: "160px" },
                  { top: "15%", right: "22%", rotate: "4deg", width: "140px" },
                  { top: "5%", right: "40%", rotate: "-3deg", width: "150px" },
                  { bottom: "8%", right: "8%", rotate: "8deg", width: "145px" },
                  { bottom: "5%", right: "28%", rotate: "-5deg", width: "135px" },
                  { top: "30%", right: "50%", rotate: "3deg", width: "130px" },
                ];
                const pos = positions[i];
                return (
                  <div
                    key={i}
                    className="absolute rounded-xl overflow-hidden shadow-2xl border-2 border-primary-foreground/10"
                    style={{
                      ...pos,
                      transform: `rotate(${pos.rotate})`,
                      width: pos.width,
                    }}
                  >
                    <img src={src} alt="" className="w-full h-auto object-cover" />
                  </div>
                );
              })}
            </div>

            {/* Text content */}
            <div className="relative z-10 p-10 md:p-14 max-w-[420px]">
              <span className="inline-block bg-accent text-primary-foreground text-[0.65rem] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-lg mb-5">
                Photodump
              </span>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-black text-primary-foreground leading-[1.05] uppercase mb-3">
                Different Scenes<br />Same Star
              </h2>
              <p className="text-[0.88rem] text-primary-foreground/45 leading-relaxed mb-6">
                Build your character. One click does the rest
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-primary-foreground text-foreground px-5 py-2.5 rounded-lg font-semibold text-[0.85rem] hover:bg-primary-foreground/90 transition-all no-underline"
              >
                Try Photodump
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. "What Will You Create Today?" Gallery ────────── */}
      <section className="bg-foreground px-6 md:px-16 pb-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end gap-8 mb-8">
            <div>
              <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-black text-primary-foreground leading-[1.05] uppercase">
                What Will You<br />
                <span className="text-accent">Create Today?</span>
              </h2>
              <p className="text-[0.85rem] text-primary-foreground/40 mt-2 leading-relaxed">
                Create authentic images and videos with natural texture and easy style
              </p>
            </div>
            <Link to="/create" className="hidden md:inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-primary-foreground/50 hover:text-primary-foreground transition-colors no-underline whitespace-nowrap mb-1">
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div
            ref={galleryRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
          >
            {createGallery.map((item, i) => (
              <Link
                key={i}
                to="/create"
                className="group flex-shrink-0 w-[200px] relative rounded-2xl overflow-hidden no-underline"
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-[280px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {item.isNew && (
                  <span className="absolute top-2.5 left-2.5 bg-accent text-primary-foreground text-[0.55rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md">
                    New
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[0.82rem] font-semibold text-primary-foreground">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. CTA Banner ───────────────────────────────────── */}
      <section className="bg-foreground px-6 md:px-16 pb-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent/20 via-[hsl(0_0%_8%)] to-[hsl(0_0%_8%)] p-12 md:p-20 text-center">
            <div className="relative z-10 max-w-[600px] mx-auto">
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-black text-primary-foreground leading-[1.05] mb-4">
                Your creativity.<br />
                <em className="italic font-normal text-accent">Amplified by AI.</em>
              </h2>
              <p className="text-[0.92rem] text-primary-foreground/40 leading-relaxed mb-8">
                Join 180,000+ creators generating images, videos, and music — completely free to start.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link to="/signup" className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-7 py-3.5 rounded-lg font-semibold text-[0.92rem] hover:bg-accent/85 transition-all no-underline">
                  <Sparkles className="w-4 h-4" /> Get Started Free
                </Link>
                <Link to="/explore" className="inline-flex items-center gap-2 text-primary-foreground/50 text-[0.92rem] font-semibold hover:text-primary-foreground transition-colors no-underline">
                  Browse Gallery <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-foreground">
        <Footer />
      </div>
    </PageShell>
  );
};

export default Index;
