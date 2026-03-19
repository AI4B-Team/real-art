import { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const featureCards = [
  {
    title: "REAL STUDIO 2.5",
    desc: "Director-level control over characters and locations with color grading built in",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop&q=80",
    video: "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4",
    badge: null,
    link: "/create?type=image",
  },
  {
    title: "SOUL CINEMA IS HERE",
    desc: "Create film-style images with cinematic lighting and color",
    poster: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=450&fit=crop&q=80",
    video: "https://videos.pexels.com/video-files/5752729/5752729-uhd_2560_1440_30fps.mp4",
    badge: null,
    link: "/create?type=video",
  },
  {
    title: "SOUL CAST",
    desc: "Build your perfect movie cast in Soul Cinema Studio",
    poster: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=450&fit=crop&q=80",
    video: "https://videos.pexels.com/video-files/4763824/4763824-uhd_2560_1440_24fps.mp4",
    badge: null,
    link: "/create?type=image",
  },
  {
    title: "AI AUDIO STUDIO",
    desc: "Voice cloning, multilingual synthesis, localization and more",
    poster: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop&q=80",
    video: "https://videos.pexels.com/video-files/6981411/6981411-uhd_2560_1440_25fps.mp4",
    badge: "55% Off",
    link: "/create?type=audio",
  },
  {
    title: "STYLE TRANSFER",
    desc: "Apply any artistic style to your photos with a single click",
    poster: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=450&fit=crop&q=80",
    video: "https://videos.pexels.com/video-files/5377700/5377700-uhd_2560_1440_25fps.mp4",
    badge: "New",
    link: "/create?type=image",
  },
];

const VideoCard = ({ card, index }: { card: typeof featureCards[0]; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 1.3;
    const timer = setTimeout(() => {
      video.play().catch(() => {});
    }, index * 400);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={card.link}
        className="group flex-shrink-0 w-full no-underline block"
      >
        <div className="relative rounded-2xl overflow-hidden mb-3 border border-primary-foreground/[0.06]">
          {/* Poster image (fallback) */}
          <img
            src={card.poster}
            alt={card.title}
            className={`w-full h-[240px] object-cover transition-opacity duration-500 ${videoReady ? "opacity-0" : "opacity-100"}`}
          />
          {/* Video layer — always playing */}
          <video
            ref={videoRef}
            src={card.video}
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
          />
          {/* Title overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-500" />
            <h3 className="relative font-display text-[clamp(1.6rem,2.2vw,2.4rem)] font-black text-primary-foreground tracking-tight leading-[1.1] text-center uppercase drop-shadow-lg px-4">
              {card.title}
            </h3>
          </div>
          {card.badge && (
            <span className="absolute top-3 right-3 bg-accent text-primary-foreground text-[0.6rem] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg z-10">
              {card.badge}
            </span>
          )}
        </div>
        <p className="text-[0.82rem] font-bold text-primary-foreground uppercase tracking-wide">{card.title}</p>
        <p className="text-[0.75rem] text-primary-foreground/40 mt-0.5 leading-relaxed line-clamp-2">{card.desc}</p>
      </Link>
    </motion.div>
  );
};

const FeatureCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-foreground pt-8 pb-14 px-6 md:px-10 relative">
      <div className="max-w-[1500px] mx-auto relative">
        <button
          onClick={() => scrollCarousel(-1)}
          className="absolute left-4 top-[120px] z-20 w-9 h-9 rounded-lg bg-primary-foreground/15 backdrop-blur-md flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors border border-primary-foreground/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scrollCarousel(1)}
          className="absolute right-4 top-[120px] z-20 w-9 h-9 rounded-lg bg-primary-foreground/15 backdrop-blur-md flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors border border-primary-foreground/10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {featureCards.map((card, i) => (
            <div key={i} className="flex-shrink-0 w-[calc(33.333%-11px)] min-w-[300px]">
              <VideoCard card={card} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCarousel;
