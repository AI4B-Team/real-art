import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

const CreateGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-foreground px-6 md:px-16 pb-20" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end gap-8 mb-8"
        >
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
        </motion.div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
          {createGallery.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="flex-shrink-0"
            >
              <Link
                to="/create"
                className="group w-[200px] relative rounded-2xl overflow-hidden no-underline block"
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-[280px] object-cover group-hover:scale-110 transition-transform duration-700"
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreateGallery;
