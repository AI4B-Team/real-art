import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Sparkles, ChevronLeft, ChevronRight, ArrowRight,
  ArrowUpRight, Play,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import FeatureCarousel from "@/components/home/FeatureCarousel";
import PhotodumpBanner from "@/components/home/PhotodumpBanner";
import CreateGallery from "@/components/home/CreateGallery";
import CTABanner from "@/components/home/CTABanner";

/* ─── Data ───────────────────────────────────────────────────── */

const announcements = [
  "Video generation now live — animate any image in one click",
  "Audio generation beta — lo-fi, cinematic, orchestral and more",
  "New: Upscale 4× — turn any image into ultra-HD",
  "April Challenge is live — $5,000 in creator prizes",
];

/* ─── Component ──────────────────────────────────────────────── */

const Index = () => {
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
      <FeatureCarousel />

      {/* ─── 3. Photodump Banner ─────────────────────────────── */}
      <PhotodumpBanner />

      {/* ─── 4. "What Will You Create Today?" Gallery ────────── */}
      <CreateGallery />

      {/* ─── 5. CTA Banner ───────────────────────────────────── */}
      <CTABanner />

      <div className="bg-foreground">
        <Footer />
      </div>
    </PageShell>
  );
};

export default Index;
