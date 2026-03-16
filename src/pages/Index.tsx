import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import MasonryGrid from "@/components/MasonryGrid";
import CollectionsSection from "@/components/CollectionsSection";
import TrendingCreatorsSection from "@/components/TrendingCreatorsSection";
import CommunitiesSection from "@/components/CommunitiesSection";
import ChallengesSection from "@/components/ChallengesSection";
import CreatorEarningsSection from "@/components/CreatorEarningsSection";
import BottomCTA from "@/components/BottomCTA";
import Footer from "@/components/Footer";
import PageShell from "@/components/PageShell";

const Index = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  // Listen for reset event from MasonryGrid empty state
  useEffect(() => {
    const reset = () => setActiveFilter("All");
    window.addEventListener("ra_filter_reset", reset);
    return () => window.removeEventListener("ra_filter_reset", reset);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem("ra_auth") === "1") {
        navigate("/dashboard", { replace: true });
      }
    } catch {}
  }, [navigate]);

  return (
    <PageShell>
      <HeroSection />
      <FilterBar active={activeFilter} onChange={setActiveFilter} />
      <MasonryGrid activeFilter={activeFilter} />
      <CollectionsSection />
      <CommunitiesSection />
      <ChallengesSection />
      <TrendingCreatorsSection />
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <CreatorEarningsSection />
        </div>
      </section>
      <BottomCTA />
      <Footer />
    </PageShell>
  );
};

export default Index;
