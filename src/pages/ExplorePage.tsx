import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronDown, Download, Heart, SlidersHorizontal, Image, Video, Music, Sparkles, Users, TrendingUp } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import SponsoredCard from "@/components/SponsoredCard";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import { useQuickView } from "@/context/QuickViewContext";

const sponsoredAds = [
  { imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=260&fit=crop&q=80", brandName: "Poshmark", destinationUrl: "#" },
  { imageUrl: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=400&h=230&fit=crop&q=80", brandName: "SHEIN", destinationUrl: "#" },
  { imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop&q=80", brandName: "Target", destinationUrl: "#" },
];

const imageData = [
  { photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", tags: ["abstract", "cosmic", "space", "fantasy", "purple", "dark"] },
  { photo: "photo-1558618666-fcd25c85cd64", title: "Neon Gradient", tags: ["abstract", "neon", "gradient", "minimal", "colorful"] },
  { photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", tags: ["abstract", "fire", "colorful", "blue", "orange", "texture"] },
  { photo: "photo-1549880338-65ddcdfd017b", title: "Mountain Vista", tags: ["nature", "mountains", "landscape", "snow", "cold"] },
  { photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", tags: ["cyberpunk", "neon", "city", "night", "abstract", "purple"] },
  { photo: "photo-1506905925346-21bda4d32df4", title: "Alpine Glow", tags: ["nature", "mountains", "sunrise", "landscape", "golden"] },
  { photo: "photo-1518020382113-a7e8fc38eac9", title: "Geometric Architecture", tags: ["architecture", "geometric", "minimal", "white", "structure"] },
  { photo: "photo-1547036967-23d11aacaee0", title: "Night Sky", tags: ["space", "night", "stars", "dark", "galaxy", "cosmic"] },
  { photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City Night", tags: ["cyberpunk", "city", "night", "neon", "futuristic", "sci-fi"] },
  { photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar 01", tags: ["avatars", "portraits", "digital", "face", "art"] },
  { photo: "photo-1501854140801-50d01698950b", title: "Forest Spirit", tags: ["nature", "forest", "green", "trees", "fantasy", "landscape"] },
  { photo: "photo-1576091160550-2173dba999ef", title: "Abstract Fluid", tags: ["abstract", "fluid", "colorful", "texture", "art", "minimal"] },
  { photo: "photo-1518770660439-4636190af475", title: "Tech Circuit Board", tags: ["technology", "circuit", "sci-fi", "dark", "abstract"] },
  { photo: "photo-1462275646964-a0e3386b89fa", title: "Studio Setup", tags: ["architecture", "interior", "studio", "minimal", "dark"] },
  { photo: "photo-1500462918059-b1a0cb512f1d", title: "Sunset Haze", tags: ["nature", "sunset", "sky", "orange", "landscape", "warm"] },
  { photo: "photo-1543722530-d2c3201371e7", title: "Luxury Interior", tags: ["luxury", "architecture", "interior", "minimal", "white"] },
  { photo: "photo-1533158628620-7e4d0a003147", title: "Portrait Study", tags: ["portraits", "people", "face", "art", "dramatic"] },
  { photo: "photo-1505765050516-f72dcac9c60e", title: "Tropical Shore", tags: ["nature", "beach", "travel", "tropical", "blue", "ocean"] },
  { photo: "photo-1470071459604-3b5ec3a7fe05", title: "Golden Valley", tags: ["nature", "landscape", "hills", "golden", "travel"] },
  { photo: "photo-1465146344425-f00d5f5c8f07", title: "Spring Blossoms", tags: ["nature", "flowers", "pink", "spring", "macro", "backgrounds"] },
  { photo: "photo-1607799279861-4dd421887fb3", title: "Hands Clasped", tags: ["people", "hands", "connection", "portraits", "warm"] },
  { photo: "photo-1567360425618-1594206637d2", title: "Desert Sands", tags: ["nature", "desert", "sand", "landscape", "travel", "minimal"] },
  { photo: "photo-1519681393784-d120267933ba", title: "Starry Mountains", tags: ["nature", "mountains", "night", "stars", "landscape"] },
  { photo: "photo-1472214103451-9374bd1c798e", title: "Emerald Lake", tags: ["nature", "lake", "green", "landscape", "travel"] },
  { photo: "photo-1507003211169-0a1dd7228f2d", title: "Portrait Light", tags: ["portraits", "people", "light", "face", "warm"] },
  { photo: "photo-1493246507139-91e8fad9978e", title: "Waterfall Mist", tags: ["nature", "waterfall", "landscape", "travel", "green"] },
  { photo: "photo-1540959733332-eab4deabeeaf", title: "Tokyo Nights", tags: ["city", "neon", "cyberpunk", "night", "travel", "architecture"] },
  { photo: "photo-1516466723877-e4ec1d736c8a", title: "Surfer Wave", tags: ["people", "ocean", "travel", "nature", "action"] },
  { photo: "photo-1504198453319-5ce911bafcde", title: "Northern Lights", tags: ["nature", "aurora", "night", "landscape", "cosmic"] },
  { photo: "photo-1519125323398-675f0ddb6308", title: "Coffee Mood", tags: ["minimal", "lifestyle", "warm", "interior", "luxury"] },
  { photo: "photo-1531746020798-e6953c6e8e04", title: "Fierce Look", tags: ["portraits", "people", "fashion", "face", "dramatic"] },
  { photo: "photo-1551524559-8af4e6624178", title: "Coral Reef", tags: ["nature", "ocean", "underwater", "colorful", "travel"] },
  { photo: "photo-1488590528505-98d2b5aba04b", title: "Code Screen", tags: ["technology", "minimal", "dark", "sci-fi", "abstract"] },
  { photo: "photo-1531297484001-80022131f5a1", title: "Server Room", tags: ["technology", "architecture", "dark", "sci-fi", "minimal"] },
  { photo: "photo-1487058792275-0ad4aaf24ca7", title: "Gradient Screens", tags: ["abstract", "colorful", "technology", "backgrounds", "minimal"] },
  { photo: "photo-1526374965328-7f61d4dc18c5", title: "Matrix Rain", tags: ["sci-fi", "technology", "dark", "cyberpunk", "abstract"] },
  { photo: "photo-1502239608882-93b729c6af43", title: "Flower Field", tags: ["nature", "flowers", "landscape", "colorful", "spring"] },
  { photo: "photo-1494790108377-be9c29b29330", title: "Casual Portrait", tags: ["portraits", "people", "fashion", "warm", "lifestyle"] },
  { photo: "photo-1506744038136-46273834b3fb", title: "Yosemite Dawn", tags: ["nature", "mountains", "landscape", "travel", "golden"] },
  { photo: "photo-1470252649378-9c29740c9fa8", title: "Autumn Road", tags: ["nature", "forest", "travel", "landscape", "warm"] },
  { photo: "photo-1497366811353-6870744d04b2", title: "Modern Office", tags: ["architecture", "interior", "minimal", "white", "luxury"] },
  { photo: "photo-1486312338219-ce68d2c6f44d", title: "Working Laptop", tags: ["technology", "lifestyle", "minimal", "people", "warm"] },
  { photo: "photo-1485470733090-0aae1788d668", title: "Dance Movement", tags: ["people", "art", "dramatic", "fashion", "action"] },
  { photo: "photo-1534528741775-53994a69daeb", title: "Model Headshot", tags: ["portraits", "fashion", "people", "face", "editorial"] },
  { photo: "photo-1520483691742-e1c3d7dfe758", title: "Lightning Storm", tags: ["nature", "dramatic", "dark", "landscape", "night"] },
  { photo: "photo-1498036882173-b41c28a8ba34", title: "Highway Lights", tags: ["city", "night", "neon", "travel", "abstract"] },
  { photo: "photo-1508739773434-c26b3d09e071", title: "Sunset Beach", tags: ["nature", "beach", "sunset", "travel", "warm", "ocean"] },
  { photo: "photo-1484589065579-248aad0d628b", title: "Bubbles Abstract", tags: ["abstract", "colorful", "macro", "art", "backgrounds"] },
  { photo: "photo-1517694712202-14dd9538aa97", title: "Developer Desk", tags: ["technology", "minimal", "lifestyle", "interior"] },
  { photo: "photo-1529778873920-4da4926a72c2", title: "Cat Portrait", tags: ["nature", "animal", "portraits", "warm", "minimal"] },
  { photo: "photo-1513836279014-a89f7a76ae86", title: "Spring Trees", tags: ["nature", "trees", "green", "landscape", "spring"] },
  { photo: "photo-1517816428104-797678c7cf0c", title: "Rainy Window", tags: ["abstract", "minimal", "dark", "mood", "texture"] },
  { photo: "photo-1444464666168-49d633b86797", title: "Bird Flight", tags: ["nature", "animal", "sky", "minimal", "landscape"] },
  { photo: "photo-1496181133206-80ce9b88a853", title: "Laptop Minimal", tags: ["technology", "minimal", "white", "lifestyle"] },
  { photo: "photo-1529626455594-4ff0802cfb7e", title: "Golden Portrait", tags: ["portraits", "people", "fashion", "golden", "warm"] },
  { photo: "photo-1555952517-2e8e729e0b44", title: "Neon Signs", tags: ["neon", "night", "cyberpunk", "city", "colorful"] },
  { photo: "photo-1469474968028-56623f02e42e", title: "Valley Sunset", tags: ["nature", "landscape", "sunset", "mountains", "golden"] },
  { photo: "photo-1519638399535-1b036603ac77", title: "Ocean Waves", tags: ["nature", "ocean", "blue", "travel", "minimal"] },
  { photo: "photo-1558591710-4b4a1ae0f04d", title: "Marble Texture", tags: ["abstract", "texture", "minimal", "luxury", "backgrounds"] },
  { photo: "photo-1504384308090-c894fdcc538d", title: "Team Office", tags: ["people", "architecture", "interior", "technology", "lifestyle"] },
  { photo: "photo-1521747116042-5a810fda9664", title: "Silhouette Hiker", tags: ["people", "nature", "landscape", "travel", "dramatic"] },
  { photo: "photo-1509718443690-d8e2fb3474b7", title: "Bridge Night", tags: ["architecture", "city", "night", "travel", "landscape"] },
  { photo: "photo-1490730141103-6cac27aaab94", title: "Sunrise Glow", tags: ["nature", "sunrise", "sky", "warm", "landscape", "golden"] },
  { photo: "photo-1542273917363-3b1817f69a2d", title: "Palm Trees", tags: ["nature", "tropical", "travel", "sky", "summer"] },
  { photo: "photo-1517841905240-472988babdf9", title: "Fashion Street", tags: ["fashion", "portraits", "people", "lifestyle", "editorial"] },
  { photo: "photo-1481349518771-20055b2a7b24", title: "Clock Face", tags: ["abstract", "minimal", "dark", "texture", "art"] },
  { photo: "photo-1516542076529-1ea3854896f2", title: "Desert Canyon", tags: ["nature", "desert", "landscape", "travel", "warm"] },
  { photo: "photo-1523712999610-f77fbcfc3843", title: "Forest Path", tags: ["nature", "forest", "green", "landscape", "travel"] },
  { photo: "photo-1515886657613-9f3515b0c78f", title: "Model Pose", tags: ["fashion", "portraits", "people", "editorial", "luxury"] },
  { photo: "photo-1492144534655-ae79c964c9d7", title: "Sports Car", tags: ["luxury", "technology", "dark", "minimal", "editorial"] },
  { photo: "photo-1500530855697-b586d89ba3ee", title: "Maldives Blue", tags: ["nature", "ocean", "travel", "tropical", "blue"] },
  { photo: "photo-1527443224154-c4a3942d3acf", title: "Geometric Light", tags: ["abstract", "architecture", "minimal", "art", "backgrounds"] },
  { photo: "photo-1503023345310-bd7c1de61c7d", title: "Mountain Man", tags: ["portraits", "nature", "people", "travel", "dramatic"] },
  { photo: "photo-1532274402911-5a369e4c4bb5", title: "Island Paradise", tags: ["nature", "ocean", "travel", "tropical", "landscape"] },
  { photo: "photo-1553095066-5cd563f1f1e4", title: "Minimal Still Life", tags: ["minimal", "art", "interior", "luxury", "white"] },
  { photo: "photo-1501785888041-af3ef285b470", title: "Lake Mirror", tags: ["nature", "lake", "landscape", "travel", "mountains"] },
  { photo: "photo-1518895949257-7621c3c786d7", title: "Crystals Macro", tags: ["abstract", "macro", "colorful", "texture", "art"] },
  { photo: "photo-1484101403633-562f891dc89a", title: "Workspace Flat", tags: ["minimal", "technology", "lifestyle", "interior", "white"] },
  { photo: "photo-1524504388940-b1c1722653e1", title: "Snow Boarder", tags: ["people", "action", "nature", "winter", "travel"] },
  { photo: "photo-1511884642898-4c92249e20b6", title: "Autumn Forest", tags: ["nature", "forest", "autumn", "warm", "landscape"] },
  { photo: "photo-1495616811223-4d98c6e9c869", title: "Galaxy Swirl", tags: ["cosmic", "space", "abstract", "dark", "fantasy"] },
  { photo: "photo-1506744038136-46273834b3fb", title: "Valley Morning", tags: ["nature", "mountains", "landscape", "travel", "golden"] },
  { photo: "photo-1528360983277-13d401cdc186", title: "City Skyline", tags: ["city", "architecture", "night", "travel", "landscape"] },
  { photo: "photo-1494500764479-0c8f2919a3d8", title: "Forest Fog", tags: ["nature", "forest", "dark", "landscape", "fantasy"] },
  { photo: "photo-1527549993586-dff825b37782", title: "Color Smoke", tags: ["abstract", "colorful", "art", "texture", "backgrounds"] },
  { photo: "photo-1504384764586-bb4cee6f5b81", title: "Festival Crowd", tags: ["people", "night", "colorful", "neon", "action"] },
  { photo: "photo-1520004434532-668416a08753", title: "Glass Building", tags: ["architecture", "minimal", "city", "geometric", "white"] },
  { photo: "photo-1509114397022-ed747cca3f65", title: "Model Editorial", tags: ["fashion", "portraits", "people", "editorial", "luxury"] },
  { photo: "photo-1483728642387-6c3bdd6c93e5", title: "Misty Peaks", tags: ["nature", "mountains", "landscape", "travel", "minimal"] },
  { photo: "photo-1535916707207-35f97e715e1c", title: "Drone View", tags: ["nature", "landscape", "travel", "ocean", "abstract"] },
  { photo: "photo-1519681393784-d120267933ba", title: "Winter Summit", tags: ["nature", "mountains", "snow", "night", "stars"] },
  { photo: "photo-1542601906990-b4d3fb778b09", title: "Green Leaves", tags: ["nature", "macro", "green", "minimal", "spring"] },
  { photo: "photo-1492684223f8-5e3de7f4d267", title: "Neon City Walk", tags: ["city", "cyberpunk", "neon", "night", "people"] },
  { photo: "photo-1464822759023-fed622ff2c3b", title: "Peak Summit", tags: ["nature", "mountains", "dramatic", "landscape", "travel"] },
  { photo: "photo-1507525428034-b723cf961d3e", title: "White Sand Beach", tags: ["nature", "beach", "tropical", "travel", "blue"] },
  { photo: "photo-1519985176271-adb1088fa94c", title: "City Rain", tags: ["city", "night", "dark", "travel", "mood"] },
  { photo: "photo-1470104240373-bc1812eddc9f", title: "Jellyfish Glow", tags: ["nature", "ocean", "dark", "abstract", "colorful"] },
  { photo: "photo-1495195134817-aeb325a55b65", title: "Café Corner", tags: ["interior", "lifestyle", "warm", "minimal", "travel"] },
  { photo: "photo-1517649763962-0c623066013b", title: "Runner Motion", tags: ["people", "action", "dramatic", "fashion", "lifestyle"] },
];

const heights = [200, 260, 170, 230, 185, 255, 162, 215, 148, 238, 196, 172, 248, 182, 157, 226, 178, 262, 152, 212];

const isVideo = (i: number) => i % 7 === 3;

const badgeMap: Record<number, { label: string; icon: string }> = {
  0: { label: "Staff Pick", icon: "⭐" },
  4: { label: "Trending", icon: "🔥" },
  9: { label: "New", icon: "✨" },
};

const creators = [
  { n: "AI.Verse", i: "AV", c: "#4361ee" }, { n: "NeoPixel", i: "NP", c: "#c9184a" },
  { n: "DreamForge", i: "DF", c: "#2a9d8f" }, { n: "LuminaAI", i: "LA", c: "#e76f51" },
  { n: "SpectraGen", i: "SG", c: "#7b2d8b" }, { n: "VoidArt", i: "VA", c: "#023e8a" },
  { n: "ChromaLab", i: "CL", c: "#f4a261" }, { n: "Synthetix", i: "SX", c: "#06d6a0" },
];

const filters = [
  "All", "For You", "Following", "Trending", "New", "Popular", "Abstract", "Portraits", "People",
  "Nature", "Architecture", "Fantasy", "3D Art", "Fashion", "Sci-Fi",
  "Avatars", "Backgrounds", "Luxury", "Cyberpunk", "Minimal",
];

const downloadWeights = [3412,2180,1940,1620,1410,1120,842,3820,890,2950,1280,1090,2640,740,1820,960,1530,680,2100,1250,900,600,1100,800,1300,700,500,400];
const likesWeights = [847,612,534,441,407,302,256,982,213,801,388,302,723,188,541,267,412,156,634,345,200,150,300,220,380,180,120,100];

const sortOptions = ["Most Relevant", "Newest First", "Most Downloaded", "Most Liked"];

const searchTypes = [
  { label: "Images", icon: Image },
  { label: "Videos", icon: Video },
  { label: "Music", icon: Music },
];

const feedTabs = [
  { id: "for-you", label: "For You", icon: Sparkles },
  { id: "following", label: "Following", icon: Users },
  { id: "trending", label: "Trending", icon: TrendingUp },
];

const ExplorePage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { open } = useQuickView();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("for-you");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeType, setActiveType] = useState("Images");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [sort, setSort] = useState("Most Relevant");
  const [sortOpen, setSortOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; }
  });
  const [visibleCount, setVisibleCount] = useState(20);
  const typeDropRef = useRef<HTMLDivElement>(null);
  const sortDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { try { sessionStorage.setItem("ra_visited_explore", "1"); } catch {} }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (typeDropRef.current && !typeDropRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
      if (sortDropRef.current && !sortDropRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const sync = () => {
      try { setIsLoggedIn(localStorage.getItem("ra_auth") === "1"); } catch {}
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ra_auth_changed", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ra_auth_changed", sync);
    };
  }, []);

  const filteredImages = (() => {
    const q = query.trim().toLowerCase();
    const cat = activeFilter.toLowerCase();
    let base = imageData.filter(img => {
      const matchQuery = !q || img.title.toLowerCase().includes(q) || img.tags.some(t => t.includes(q));
      const matchCat = activeFilter === "All" || img.tags.some(t => t.toLowerCase() === cat || t.toLowerCase().includes(cat));
      return matchQuery && matchCat;
    });

    // Tab-based ordering (simulated personalization)
    if (activeTab === "trending") {
      base = [...base].sort((a, b) => (downloadWeights[imageData.indexOf(b)] || 0) - (downloadWeights[imageData.indexOf(a)] || 0));
    } else if (activeTab === "following") {
      // Simulate "following" feed — show a subset with different order
      base = [...base].filter((_, i) => i % 3 === 0 || i % 5 === 0);
    } else {
      // "For You" — mix of liked + trending signals
      base = [...base].sort((a, b) => {
        const aScore = (likesWeights[imageData.indexOf(a)] || 0) * 2 + (downloadWeights[imageData.indexOf(a)] || 0);
        const bScore = (likesWeights[imageData.indexOf(b)] || 0) * 2 + (downloadWeights[imageData.indexOf(b)] || 0);
        return bScore - aScore;
      });
    }

    if (sort === "Newest First") return [...base].sort((a, b) => imageData.indexOf(b) - imageData.indexOf(a));
    if (sort === "Most Downloaded") return [...base].sort((a, b) => (downloadWeights[imageData.indexOf(b)] || 0) - (downloadWeights[imageData.indexOf(a)] || 0));
    if (sort === "Most Liked") return [...base].sort((a, b) => (likesWeights[imageData.indexOf(b)] || 0) - (likesWeights[imageData.indexOf(a)] || 0));
    return base;
  })();

  return (
    <PageShell>


        {/* Feed tabs */}
        <div className="px-4 md:px-5 pt-5 pb-0">
          <div className="max-w-[1440px] mx-auto flex items-center gap-1">
            {feedTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[0.84rem] font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? "bg-foreground text-primary-foreground border-foreground"
                      : "bg-transparent border-transparent text-muted hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 md:px-5 pt-4 pb-6">
          <div className="max-w-[1440px] mx-auto flex items-center gap-2.5 overflow-x-auto no-scrollbar">
            <div className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-muted mr-1 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3 h-3" /> Filter
            </div>
            {filters.map((f, idx) => (
              <>
                {idx === 1 && <div key="divider" className="w-px h-4 bg-foreground/[0.1] shrink-0" />}
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`border px-4 py-1.5 rounded-lg font-body text-[0.79rem] font-medium cursor-pointer whitespace-nowrap transition-all shrink-0 ${
                    activeFilter === f
                      ? "bg-foreground text-primary-foreground border-foreground"
                      : "bg-transparent border-foreground/[0.18] text-muted hover:text-foreground hover:border-foreground/40"
                  }`}
                >
                  {f}
                </button>
              </>
            ))}
          </div>
        </div>




        {/* Grid */}
        <div className="px-4 md:px-5 pb-16">
          <div className="max-w-[1440px] mx-auto">
            {filteredImages.length === 0 && (
              <div className="text-center py-20">
                <Search className="w-7 h-7 text-muted opacity-40 mx-auto mb-3" />
                <h3 className="font-display text-[1.4rem] font-black mb-2">No results</h3>
                <p className="text-[0.84rem] text-muted mb-5">Try a different keyword, category, or clear your filters.</p>
                <button
                  onClick={() => { setQuery(""); setActiveType("Images"); setActiveFilter("All"); }}
                  className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors mx-auto"
                >
                  Clear Filters
                </button>
              </div>
            )}
            <div className="masonry-grid">
              {(isLoggedIn ? filteredImages : filteredImages.slice(0, visibleCount)).map((img, i) => {
                const cr = creators[i % creators.length];
                const h = heights[i % heights.length];

                const sponsoredIndex = Math.floor(i / 25);
                const showSponsored = i > 0 && i % 25 === 0 && sponsoredIndex <= sponsoredAds.length;
                const ad = showSponsored ? sponsoredAds[(sponsoredIndex - 1) % sponsoredAds.length] : null;

                return (
                  <div key={`${img.photo}-${i}`}>
                    {showSponsored && ad && (
                      <div className="masonry-item rounded-xl overflow-hidden">
                        <SponsoredCard imageUrl={ad.imageUrl} brandName={ad.brandName} destinationUrl={ad.destinationUrl} />
                      </div>
                    )}
                    <div
                      onClick={() => open({ id: String(i), photo: img.photo, title: img.title })}
                      className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative"
                      style={{ background: "#e0e0de" }}
                    >
                      <img
                        src={`https://images.unsplash.com/${img.photo}?w=400&h=${h}&fit=crop&q=78`}
                        alt={img.title}
                        loading="lazy"
                        className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-[350ms] ease-out"
                        style={{ height: h, objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      {/* Hover overlay with all actions */}
                      <ImageCardOverlay index={i} isVideo={isVideo(i)} photo={img.photo} title={img.title} />
                    </div>
                  </div>
                );
              })}
            </div>
            {!isLoggedIn && visibleCount < filteredImages.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisibleCount(c => c + 20)}
                  className="font-body text-[0.82rem] font-semibold bg-transparent border border-foreground/[0.14] px-8 py-2.5 rounded-lg cursor-pointer text-foreground hover:border-foreground transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
        <Footer />
    </PageShell>
  );
};

export default ExplorePage;
