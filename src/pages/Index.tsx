import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import MasonryGrid from "@/components/MasonryGrid";
import CollectionsSection from "@/components/CollectionsSection";
import CommunitiesSection from "@/components/CommunitiesSection";
import ChallengesSection from "@/components/ChallengesSection";
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
      <CollectionsSection />
      <CommunitiesSection />
      <ChallengesSection />
      <LeaderboardSection />
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default Index;
