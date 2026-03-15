import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import MasonryGrid from "@/components/MasonryGrid";
import PromptLibrary from "@/components/PromptLibrary";
import CollectionsSection from "@/components/CollectionsSection";
import StyleTransferSection from "@/components/StyleTransferSection";
import RecreationsSection from "@/components/RecreationsSection";
import CommunitiesSection from "@/components/CommunitiesSection";
import ChallengesSection from "@/components/ChallengesSection";
import CreatorEarningsSection from "@/components/CreatorEarningsSection";
import LeaderboardSection from "@/components/LeaderboardSection";
import BottomCTA from "@/components/BottomCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FilterBar />
      <MasonryGrid />
      <PromptLibrary />
      <CollectionsSection />
      <StyleTransferSection />
      <RecreationsSection />
      <CommunitiesSection />
      <ChallengesSection />
      <CreatorEarningsSection />
      <LeaderboardSection />
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default Index;
