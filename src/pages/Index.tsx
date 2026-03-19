import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import FeatureCarousel from "@/components/home/FeatureCarousel";
import PhotodumpBanner from "@/components/home/PhotodumpBanner";
import CreateGallery from "@/components/home/CreateGallery";
import TopChoiceSection from "@/components/home/TopChoiceSection";

const announcements = [
  "Video generation now live — animate any image in one click",
  "Audio generation beta — lo-fi, cinematic, orchestral and more",
  "New: Upscale 4× — turn any image into ultra-HD",
  "April Challenge is live — $5,000 in creator prizes",
];

const Index = () => {
  return (
    <PageShell>

      {/* Feature Cards — videos autoplay */}
      <FeatureCarousel />

      {/* What Will You Create Today? */}
      <CreateGallery />

      {/* Top Choice */}
      <TopChoiceSection />

      {/* Photodump Banner */}
      <PhotodumpBanner />


      <div className="bg-foreground">
        <Footer />
      </div>
    </PageShell>
  );
};

export default Index;
