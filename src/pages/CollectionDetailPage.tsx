import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageCardOverlay from "@/components/ImageCardOverlay";
import { supabase } from "@/integrations/supabase/client";

interface CollectionData {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  user_id: string;
}

interface CollectionImage {
  id: string;
  image_url: string;
  title: string | null;
  sort_order: number | null;
}

interface ProfileData {
  display_name: string | null;
  username: string | null;
}

const CollectionDetailPage = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [images, setImages] = useState<CollectionImage[]>([]);
  const [creator, setCreator] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: col } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (col) {
        setCollection(col);

        const [{ data: imgs }, { data: profile }] = await Promise.all([
          supabase
            .from("collection_images")
            .select("id, image_url, title, sort_order")
            .eq("collection_id", id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("profiles")
            .select("display_name, username")
            .eq("user_id", col.user_id)
            .single(),
        ]);

        if (imgs) setImages(imgs);
        if (profile) setCreator(profile);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="font-display text-[2rem] font-black mb-2">Collection not found</h1>
            <Link to="/collections" className="text-accent text-[0.88rem] hover:underline">Browse collections</Link>
          </div>
        </div>
      </div>
    );
  }

  const coverUrl = collection.cover_url || (images.length > 0 ? images[0].image_url : null);
  const curatorName = creator?.display_name || creator?.username || "Unknown";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Cover */}
        <div className="h-[240px] md:h-[320px] relative overflow-hidden bg-card">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6 max-w-[1440px] mx-auto">
            <div className="flex items-center gap-2 text-[0.8rem] text-white/70 mb-2">
              <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <Link to="/collections" className="hover:text-white transition-colors">Collections</Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="text-white">{collection.name}</span>
            </div>
            <h1 className="font-display text-[2.4rem] md:text-[3rem] font-black text-white tracking-[-0.03em] leading-none">{collection.name}</h1>
            {collection.description && (
              <p className="text-white/70 text-[0.85rem] mt-2 max-w-[520px]">{collection.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-6 py-5 border-b border-foreground/[0.06] text-[0.82rem] text-muted">
            <span>Curated by <strong className="text-foreground">{curatorName}</strong></span>
            <span><strong className="text-foreground">{images.length}</strong> image{images.length !== 1 ? "s" : ""}</span>
            {!collection.is_public && (
              <span className="px-2.5 py-1 rounded-md bg-card border border-foreground/[0.1] text-[0.75rem] font-medium">Private</span>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="px-6 md:px-12 py-8 max-w-[1440px] mx-auto">
          {images.length === 0 ? (
            <div className="text-center py-16 text-muted text-[0.88rem]">
              No images in this collection yet.
            </div>
          ) : (
            <div className="masonry-grid">
              {images.map((img, i) => (
                <Link key={img.id} to={`/image/${i}`} className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative">
                  <img
                    src={img.image_url}
                    alt={img.title || ""}
                    loading="lazy"
                    className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                    style={{ minHeight: 150 }}
                  />
                  <ImageCardOverlay index={i} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default CollectionDetailPage;
