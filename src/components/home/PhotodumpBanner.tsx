import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const photodumpImages = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=280&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=260&h=320&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=260&h=330&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=280&h=350&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=310&fit=crop&q=80",
];

const positions = [
  { top: "8%", right: "5%", rotate: -6, width: "160px" },
  { top: "15%", right: "22%", rotate: 4, width: "140px" },
  { top: "5%", right: "40%", rotate: -3, width: "150px" },
  { bottom: "8%", right: "8%", rotate: 8, width: "145px" },
  { bottom: "5%", right: "28%", rotate: -5, width: "135px" },
  { top: "30%", right: "50%", rotate: 3, width: "130px" },
];

const floatVariants = (i: number) => ({
  animate: {
    y: [0, -8, 0, 6, 0],
    rotate: [positions[i].rotate, positions[i].rotate + 2, positions[i].rotate, positions[i].rotate - 1.5, positions[i].rotate],
    transition: {
      duration: 5 + i * 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});

const PhotodumpBanner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-foreground px-6 md:px-16 pb-14">
      <div className="max-w-[1440px] mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden bg-[hsl(0_0%_12%)] min-h-[380px]"
        >
          {/* Floating scattered photos */}
          <div className="absolute inset-0 overflow-hidden">
            {photodumpImages.map((src, i) => {
              const pos = positions[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={isInView ? {
                    opacity: 1,
                    scale: 1,
                    y: [0, -8, 0, 6, 0],
                    rotate: [pos.rotate, pos.rotate + 2, pos.rotate, pos.rotate - 1.5, pos.rotate],
                  } : undefined}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.2 + i * 0.1 },
                    scale: { duration: 0.6, delay: 0.2 + i * 0.1 },
                    y: { duration: 5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 + i * 0.1 },
                    rotate: { duration: 5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 + i * 0.1 },
                  }
                  className="absolute rounded-xl overflow-hidden shadow-2xl border-2 border-primary-foreground/10 hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                  style={{
                    top: pos.top,
                    right: pos.right,
                    bottom: (pos as any).bottom,
                    width: pos.width,
                  }}
                >
                  <img src={src} alt="" className="w-full h-auto object-cover" />
                </motion.div>
              );
            })}
          </div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative z-10 p-10 md:p-14 max-w-[420px]"
          >
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PhotodumpBanner;
