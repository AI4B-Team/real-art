import { useState } from "react";
import { ShoppingBag, Star, TrendingUp, Sparkles } from "lucide-react";
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
const heights = [200, 260, 170, 230, 185, 255, 162, 215, 148, 238, 196, 172, 248, 182, 157, 226, 178, 262, 152, 212];
const isVideo = (i: number) => i % 4 === 3;
const isShoppable = (i: number) => [0, 3, 5, 7, 9].includes(i);
const badgeMap: Record<number, { label: string; Icon: React.FC<{ className?: string }>; style: string }> = {
  0: { label: "Editor's Pick", Icon: Star, style: "bg-accent text-primary-foreground" },
  2: { label: "Trending", Icon: TrendingUp, style: "bg-foreground text-primary-foreground" },
  7: { label: "Featured", Icon: Star, style: "bg-accent text-primary-foreground" },
  11: { label: "Curated", Icon: Sparkles, style: "bg-foreground text-primary-foreground" },
  15: { label: "Trending", Icon: TrendingUp, style: "bg-foreground text-primary-foreground" },
};

const MasonryGrid = () => {
  return (
    <div className="px-6 md:px-12 py-6 pb-16">
      <div className="masonry-grid">
        {photos.map((photo, i) => {
          const h = heights[i % heights.length];
          const video = isVideo(i);
          return (
            <Link
              key={i}
              to={`/image/${i}`}
              className="masonry-item rounded-xl overflow-hidden relative cursor-pointer group no-underline block"
              style={{ background: "#e0e0de" }}
            >
              <img
                src={`https://images.unsplash.com/${photo}?w=400&h=${h}&fit=crop&q=78`}
                alt="AI-Generated Digital Art"
                loading="lazy"
                className="w-full block rounded-xl transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                style={{ height: h, objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Badge */}
              {badgeMap[i] && (() => {
                const BadgeIcon = badgeMap[i].Icon;
                return (
                  <div className={`absolute top-2 left-2 flex items-center gap-1 text-[0.58rem] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-lg shadow-sm z-10 ${badgeMap[i].style}`}>
                    <BadgeIcon className="w-3 h-3" /> {badgeMap[i].label}
                  </div>
                );
              })()}
              {/* AI label (only when no badge) */}
              {!badgeMap[i] && (
                <div className="absolute top-2 left-2 text-[0.58rem] font-semibold tracking-[0.08em] uppercase bg-foreground/60 backdrop-blur-sm text-primary-foreground px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {video ? "AI Video" : "AI Art"}
                </div>
              )}
              {/* Hover overlay with all actions */}
              <ImageCardOverlay index={i} isVideo={video} />
            </Link>
          );
        })}
      </div>
      <div className="text-center mt-5">
        <button className="font-body text-[0.82rem] font-semibold bg-transparent border border-foreground/[0.14] px-8 py-2.5 rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors">
          Load More
        </button>
      </div>
    </div>
  );
};

export default MasonryGrid;
