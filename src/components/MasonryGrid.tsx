import { useState } from "react";
import { Star, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ImageCardOverlay from "@/components/ImageCardOverlay";

const photos = [
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
];

const isVideo = (i: number) => i % 4 === 3;

const badgeMap: Record<number, { label: string; Icon: React.FC<{ className?: string }>; style: string }> = {
  0: { label: "Editor's Pick", Icon: Star, style: "bg-accent text-primary-foreground" },
  2: { label: "Trending", Icon: TrendingUp, style: "bg-foreground text-primary-foreground" },
  7: { label: "Featured", Icon: Star, style: "bg-accent text-primary-foreground" },
  11: { label: "Curated", Icon: Sparkles, style: "bg-foreground text-primary-foreground" },
  15: { label: "Trending", Icon: TrendingUp, style: "bg-foreground text-primary-foreground" },
};

// Map each photo index to categories for filtering
const categoryMap: Record<number, string[]> = {
  0: ["Abstract", "Trending", "Popular"],
  1: ["Abstract", "Backgrounds"],
  2: ["Abstract", "Trending", "3D Art"],
  3: ["Nature", "Popular"],
  4: ["Abstract", "Cyberpunk", "Backgrounds"],
  5: ["Nature", "Minimal"],
  6: ["Abstract", "Fantasy"],
  7: ["Portraits", "Sci-Fi", "Popular"],
  8: ["Cyberpunk", "Backgrounds", "Trending"],
  9: ["Avatars", "3D Art"],
  10: ["Nature", "Minimal"],
  11: ["Abstract", "Luxury", "New"],
  12: ["Architecture", "Minimal", "New"],
  13: ["Fantasy", "Backgrounds"],
  14: ["Portraits", "People", "Fashion"],
  15: ["Cyberpunk", "Trending", "Sci-Fi"],
  16: ["Nature", "Backgrounds"],
  17: ["Nature", "Fantasy"],
  18: ["Nature", "Minimal", "New"],
  19: ["Nature", "Backgrounds", "Popular"],
};

const PAGE_SIZE = 20;

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

  return (
    <div className="px-6 md:px-12 py-6 pb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {visible.map(({ photo, index, isVideo }) => (
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
            <ImageCardOverlay index={index} isVideo={isVideo} />
          </Link>
        ))}
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
