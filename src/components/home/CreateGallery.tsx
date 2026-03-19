import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const tools = [
  { image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop&q=80", label: "Create Image", link: "/create?type=image" },
  { image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=500&fit=crop&q=80", label: "Create Video", link: "/create?type=video" },
  { image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&q=80", label: "Motion Control", link: "/create?type=video" },
  { image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&q=80", label: "Soul 2.0", badge: "NEW", link: "/create" },
  { image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&q=80", label: "Soul ID", link: "/create" },
  { image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop&q=80", label: "Upscale", link: "/create" },
  { image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&q=80", label: "Edit Image", link: "/create?type=image" },
];

const CreateGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-foreground px-6 md:px-10 pb-16" ref={ref}>
      <div className="max-w-[1500px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-primary-foreground/[0.04] border border-primary-foreground/[0.06] rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Left text block */}
            <div className="flex-shrink-0 md:w-[220px] flex flex-col justify-center">
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-black text-primary-foreground leading-[1.05] uppercase mb-2">
                What Will You <span className="text-accent">Create Today?</span>
              </h2>
              <p className="text-[0.78rem] text-primary-foreground/40 leading-relaxed mb-5">
                Create authentic images and videos with natural texture and easy style
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-[0.82rem] hover:bg-accent/85 transition-all no-underline w-fit"
              >
                Explore All Tools <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tool cards scroll */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth flex-1 pb-1">
              {tools.map((tool, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex-shrink-0"
                >
                  <Link
                    to={tool.link}
                    className="group w-[160px] no-underline block"
                  >
                    <div className="relative rounded-xl overflow-hidden mb-2.5">
                      <img
                        src={tool.image}
                        alt={tool.label}
                        className="w-full h-[200px] object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      {tool.badge && (
                        <span className="absolute top-2 right-2 bg-accent text-primary-foreground text-[0.55rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[0.78rem] font-semibold text-primary-foreground">{tool.label}</p>
                      <ArrowRight className="w-3 h-3 text-primary-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CreateGallery;
