import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";

const CTABanner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-foreground px-6 md:px-16 pb-20" ref={ref}>
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent/20 via-[hsl(0_0%_8%)] to-[hsl(0_0%_8%)] p-12 md:p-20 text-center"
        >
          {/* Animated glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          />
          <div className="relative z-10 max-w-[600px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-black text-primary-foreground leading-[1.05] mb-4"
            >
              Your creativity.<br />
              <em className="italic font-normal text-accent">Amplified by AI.</em>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-[0.92rem] text-primary-foreground/40 leading-relaxed mb-8"
            >
              Join 180,000+ creators generating images, videos, and music — completely free to start.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              <Link to="/signup" className="inline-flex items-center gap-2 bg-accent text-primary-foreground px-7 py-3.5 rounded-lg font-semibold text-[0.92rem] hover:bg-accent/85 transition-all no-underline">
                <Sparkles className="w-4 h-4" /> Get Started Free
              </Link>
              <Link to="/explore" className="inline-flex items-center gap-2 text-primary-foreground/50 text-[0.92rem] font-semibold hover:text-primary-foreground transition-colors no-underline">
                Browse Gallery <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
