import { useState } from "react";
import { Star, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import SponsoredCard from "@/components/SponsoredCard";

const photoPool = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64",
  "photo-1541701494587-cb58502866ab", "photo-1549880338-65ddcdfd017b",
  "photo-1557682250-33bd709cbe85", "photo-1506905925346-21bda4d32df4",
  "photo-1518020382113-a7e8fc38eac9", "photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809", "photo-1604881991720-f91add269bed",
  "photo-1501854140801-50d01698950b", "photo-1576091160550-2173dba999ef",
  "photo-1518770660439-4636190af475", "photo-1462275646964-a0e3386b89fa",
  "photo-1500462918059-b1a0cb512f1d", "photo-1543722530-d2c3201371e7",
  "photo-1533158628620-7e4d0a003147", "photo-1505765050516-f72dcac9c60e",
  "photo-1470071459604-3b5ec3a7fe05", "photo-1465146344425-f00d5f5c8f07",
  "photo-1519681393784-d120267933ba", "photo-1446776811953-b23d57bd21aa",
  "photo-1488590528505-98d2b5aba04b", "photo-1526374965328-7f61d4dc18c5",
  "photo-1451187580459-43490279c0fa", "photo-1534972195531-d756b9bfa9f2",
  "photo-1498050108023-c5249f4df085", "photo-1550751827-4bd374c3f58b",
  "photo-1558591710-4b4a1ae0f04d", "photo-1563089145-599997674d42",
  "photo-1478760329108-5c3ed9d495a0", "photo-1531297484001-80022131f5a1",
  "photo-1535378917042-10a22c95931a", "photo-1516116216299-8a41f1bab3e0",
];

// Generate 100 images by cycling through the pool
const photos = Array.from({ length: 100 }, (_, i) => photoPool[i % photoPool.length]);

const isVideo = (i: number) => [3, 7, 14, 22, 31, 38, 45, 53, 62, 71, 78, 85, 93].includes(i);

const badgeMap: Record<number, { label: string; Icon: React.FC<{ className?: string }>; style: string }> = {
  0: { label: "Editor's Pick", Icon: Star, style: "bg-accent text-primary-foreground" },
  2: { label: "Trending", Icon: TrendingUp, style: "bg-foreground text-primary-foreground" },
  7: { label: "Featured", Icon: Star, style: "bg-accent text-primary-foreground" },
  11: { label: "Curated", Icon: Sparkles, style: "bg-foreground text-primary-foreground" },
  15: { label: "Trending", Icon: TrendingUp, style: "bg-foreground text-primary-foreground" },
  28: { label: "Editor's Pick", Icon: Star, style: "bg-accent text-primary-foreground" },
  42: { label: "Featured", Icon: Star, style: "bg-accent text-primary-foreground" },
  55: { label: "Trending", Icon: TrendingUp, style: "bg-foreground text-primary-foreground" },
  67: { label: "Curated", Icon: Sparkles, style: "bg-foreground text-primary-foreground" },
  80: { label: "Editor's Pick", Icon: Star, style: "bg-accent text-primary-foreground" },
  91: { label: "Featured", Icon: Star, style: "bg-accent text-primary-foreground" },
};

const categories = ["Abstract", "Portraits", "People", "Nature", "Architecture", "Fantasy", "3D Art", "Fashion", "Sci-Fi", "Avatars", "Backgrounds", "Luxury", "Cyberpunk", "Minimal", "Trending", "New", "Popular"];

// Deterministic category assignment
const categoryMap: Record<number, string[]> = {};
for (let i = 0; i < 100; i++) {
  const cats: string[] = [];
  cats.push(categories[i % categories.length]);
  cats.push(categories[(i * 3 + 5) % categories.length]);
  if (i % 5 === 0) cats.push("Popular");
  if (i % 7 === 0) cats.push("Trending");
  if (i % 11 === 0) cats.push("New");
  categoryMap[i] = [...new Set(cats)];
}

// Sponsored ad positions (inserted after these indices)
const sponsoredAds = [
  { afterIndex: 9, brandName: "Adobe Firefly", imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=500&fit=crop&q=80", destinationUrl: "https://firefly.adobe.com" },
  { afterIndex: 29, brandName: "Midjourney", imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=500&fit=crop&q=80", destinationUrl: "https://midjourney.com" },
  { afterIndex: 49, brandName: "Runway ML", imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=500&fit=crop&q=80", destinationUrl: "https://runwayml.com" },
  { afterIndex: 69, brandName: "Stability AI", imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=500&fit=crop&q=80", destinationUrl: "https://stability.ai" },
  { afterIndex: 89, brandName: "Leonardo AI", imageUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=500&fit=crop&q=80", destinationUrl: "https://leonardo.ai" },
];

const PAGE_SIZE = 40;

interface MasonryGridProps {
  activeFilter?: string;
}

const MasonryGrid = ({ activeFilter = "All" }: MasonryGridProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allImages = photos.map((photo, i) => ({ photo, index: i, isVideo: isVideo(i) }));

  const filtered = activeFilter === "All"
    ? allImages
    : allImages.filter(img => (categoryMap[img.index] || []).includes(activeFilter));

  const visible = filtered.slice(0, visibleCount);

  if (filtered.length === 0) {
    return (
      <div className="px-6 md:px-12 py-16 text-center">
        <svg className="w-6 h-6 text-muted opacity-30 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-[0.88rem] font-medium text-muted mb-1">No {activeFilter} images yet</p>
        <p className="text-[0.8rem] text-muted/70">
          Try a different category or{" "}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("ra_filter_reset"))}
            className="text-accent hover:underline font-medium bg-transparent border-none cursor-pointer"
          >
            show all
          </button>
        </p>
      </div>
    );
  }

  // Build items with sponsored ads interleaved
  const itemsWithAds: Array<{ type: "image"; data: typeof visible[0] } | { type: "ad"; data: typeof sponsoredAds[0] }> = [];
  let adIdx = 0;
  visible.forEach((img) => {
    itemsWithAds.push({ type: "image", data: img });
    if (adIdx < sponsoredAds.length && img.index === sponsoredAds[adIdx].afterIndex) {
      itemsWithAds.push({ type: "ad", data: sponsoredAds[adIdx] });
      adIdx++;
    }
  });

  return (
    <div className="px-6 md:px-12 py-6 pb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {itemsWithAds.map((item, i) => {
          if (item.type === "ad") {
            return (
              <div key={`ad-${item.data.brandName}`} className="aspect-[4/3]">
                <SponsoredCard
                  imageUrl={item.data.imageUrl}
                  brandName={item.data.brandName}
                  destinationUrl={item.data.destinationUrl}
                  variant="feed"
                />
              </div>
            );
          }
          const { photo, index, isVideo: vid } = item.data;
          return (
            <Link
              key={index}
              to={`/image/${index}`}
              className="rounded-xl overflow-hidden relative cursor-pointer group no-underline block aspect-[4/3]"
              style={{ background: "#e0e0de" }}
            >
              <img
                src={`https://images.unsplash.com/${photo}?w=400&h=300&fit=crop&q=78`}
                alt="AI-Generated Digital Art"
                loading="lazy"
                className="w-full h-full object-cover rounded-xl transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {vid && (
                <div className="absolute top-2 left-2 bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.55rem] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Video
                </div>
              )}
              <ImageCardOverlay index={index} isVideo={vid} />
            </Link>
          );
        })}
      </div>
      {visibleCount < filtered.length && (
        <div className="text-center mt-5">
          <button
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            className="font-body text-[0.82rem] font-semibold bg-transparent border border-foreground/[0.14] px-8 py-2.5 rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
