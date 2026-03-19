import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

const topChoices = [
  {
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&q=80",
    label: "Nano Banana Pro",
    desc: "Best 4K image model ever",
    badge: null,
    link: "/create",
  },
  {
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&q=80",
    label: "Motion Control",
    desc: "Precise control of character action",
    badge: null,
    link: "/create?type=video",
  },
  {
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&q=80",
    label: "Skin Enhancer",
    desc: "Natural, realistic skin textures",
    badge: "PRO",
    link: "/create",
  },
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop&q=80",
    label: "Shots",
    desc: "9 unique shots from one image",
    badge: null,
    link: "/create",
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&q=80",
    label: "Angles 2.0",
    desc: "Generate any angle view for any character",
    badge: "PRO",
    link: "/create",
  },
  {
    image: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=400&h=500&fit=crop&q=80",
    label: "Kling 3.0",
    desc: "15-second videos with characters",
    badge: null,
    link: "/create?type=video",
  },
  {
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=500&fit=crop&q=80",
    label: "Seedream 5.0 Lite",
    desc: "Intelligent visual reasoning",
    badge: "NEW",
    link: "/create",
  },
];

const TopChoiceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-foreground px-6 md:px-10 pb-16" ref={ref}>
      <div className="max-w-[1500px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-6"
        >
          <div>
            <h2 className="font-display text-[clamp(1.4rem,3vw,1.8rem)] font-black text-primary-foreground leading-[1.1] uppercase">
              Top Choice
            </h2>
            <p className="text-[0.78rem] text-primary-foreground/40 mt-1">
              Creator-recommended tools tailored for you
            </p>
          </div>
          <Link
            to="/create"
            className="hidden md:inline-flex items-center gap-1 text-[0.78rem] font-semibold text-primary-foreground/50 hover:text-primary-foreground transition-colors no-underline border border-primary-foreground/10 px-3.5 py-2 rounded-lg"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
          {topChoices.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex-shrink-0"
            >
              <Link
                to={item.link}
                className="group w-[180px] no-underline block"
              >
                <div className="relative rounded-xl overflow-hidden mb-2.5">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-full h-[220px] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  {item.badge && (
                    <span className={`absolute top-2 right-2 text-[0.55rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${item.badge === "NEW" ? "bg-accent text-primary-foreground" : "bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground"}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[0.8rem] font-semibold text-primary-foreground">{item.label}</p>
                  <ArrowRight className="w-3 h-3 text-primary-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[0.7rem] text-primary-foreground/35 mt-0.5 line-clamp-1">{item.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopChoiceSection;
