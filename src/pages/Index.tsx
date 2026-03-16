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
  return (
    <PageShell>
      <HeroSection />
      
      <FilterBar />
      <MasonryGrid />
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
