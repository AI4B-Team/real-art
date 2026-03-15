import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Upload, X, Lock, Globe, Image, Loader2 } from "lucide-react";
import CoverImageEditor from "@/components/CoverImageEditor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const communities = [
  { id: "1", name: "Avatar Architects" },
  { id: "2", name: "Abstract Minds" },
  { id: "3", name: "Neon Futures" },
  { id: "4", name: "Forest & Earth" },
  { id: "5", name: "PromptVault Pro" },
  { id: "6", name: "Dreamweavers" },
];

interface PreviewFile {
  file: File;
  preview: string;
}

const CreateCollectionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [communityId, setCommunityId] = useState("");
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPosition, setCoverPosition] = useState({ x: 50, y: 50, scale: 1 });

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith("image/"));
    const previews = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles(prev => [...prev, ...previews]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleCoverChange = useCallback((preview: string | null, file: File | null, pos: { x: number; y: number; scale: number }) => {
    setCoverPreview(preview);
    if (file) setCoverFile(file);
    if (!preview) setCoverFile(null);
    setCoverPosition(pos);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please give your collection a name.", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please log in", description: "You need to be logged in to create a collection.", variant: "destructive" });
        setUploading(false);
        return;
      }

      // Create collection
      const { data: collection, error: colError } = await supabase
        .from("collections")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          community_id: !isPublic ? communityId || null : null,
        })
        .select()
        .single();

      if (colError) throw colError;

      // Upload images in parallel
      if (files.length > 0) {
        const uploadPromises = files.map(async (f, i) => {
          const ext = f.file.name.split(".").pop();
          const path = `${user.id}/${collection.id}/${crypto.randomUUID()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("collection-images")
            .upload(path, f.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("collection-images")
            .getPublicUrl(path);

          return {
            collection_id: collection.id,
            user_id: user.id,
            image_url: publicUrl,
            title: f.file.name.replace(/\.[^.]+$/, ""),
            sort_order: i,
          };
        });

        const imageRecords = await Promise.all(uploadPromises);

        const { error: imgError } = await supabase
          .from("collection_images")
          .insert(imageRecords);

        if (imgError) throw imgError;

        // Set first image as cover
        if (imageRecords.length > 0) {
          await supabase
            .from("collections")
            .update({ cover_url: imageRecords[0].image_url })
            .eq("id", collection.id);
        }
      }

      toast({ title: "Collection created!", description: `"${name}" is ready.` });
      navigate("/collections");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">Create</span>
        </div>

        <div className="px-6 md:px-12 pb-16 max-w-[720px] mx-auto">
          <h1 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none mb-2">Create Collection</h1>
          <p className="text-[0.88rem] text-muted mb-8">Organize your best work into curated collections.</p>

          {/* Name */}
          <div className="mb-6">
            <label className="block text-[0.82rem] font-semibold mb-2">Collection Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Cosmic Portraits"
              className="w-full h-12 px-4 rounded-xl border border-foreground/[0.12] bg-card text-[0.9rem] font-body outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-[0.82rem] font-semibold mb-2">Description <span className="text-muted font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this collection about?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-foreground/[0.12] bg-card text-[0.9rem] font-body outline-none focus:border-foreground transition-colors resize-none"
            />
          </div>

          {/* Cover Image */}
          <CoverImageEditor
            uploadedImages={files}
            coverPreview={coverPreview}
            onCoverChange={handleCoverChange}
            position={coverPosition}
          />

          {/* Visibility */}
          <div className="mb-6">
            <label className="block text-[0.82rem] font-semibold mb-3">Visibility</label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${isPublic ? "border-accent bg-accent/5" : "border-foreground/[0.12] hover:border-foreground/30"}`}
              >
                <Globe className={`w-5 h-5 ${isPublic ? "text-accent" : "text-muted"}`} />
                <div className="text-left">
                  <div className="font-semibold text-[0.88rem]">Public</div>
                  <div className="text-[0.75rem] text-muted">Anyone can view</div>
                </div>
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${!isPublic ? "border-accent bg-accent/5" : "border-foreground/[0.12] hover:border-foreground/30"}`}
              >
                <Lock className={`w-5 h-5 ${!isPublic ? "text-accent" : "text-muted"}`} />
                <div className="text-left">
                  <div className="font-semibold text-[0.88rem]">Private</div>
                  <div className="text-[0.75rem] text-muted">Inside a community</div>
                </div>
              </button>
            </div>
          </div>

          {/* Community selector (private only) */}
          {!isPublic && (
            <div className="mb-6">
              <label className="block text-[0.82rem] font-semibold mb-2">Community</label>
              <select
                value={communityId}
                onChange={e => setCommunityId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-foreground/[0.12] bg-card text-[0.9rem] font-body outline-none focus:border-foreground transition-colors"
              >
                <option value="">Select a community…</option>
                {communities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-[0.72rem] text-muted mt-1.5">Only the community owner can create private collections.</p>
            </div>
          )}

          {/* Bulk Upload */}
          <div className="mb-8">
            <label className="block text-[0.82rem] font-semibold mb-3">Upload Images</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${dragActive ? "border-accent bg-accent/5" : "border-foreground/[0.12] hover:border-foreground/30"}`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />
              <Upload className="w-8 h-8 text-muted mx-auto mb-3" />
              <p className="text-[0.88rem] font-medium mb-1">Drop images here or click to browse</p>
              <p className="text-[0.75rem] text-muted">JPG, PNG, WebP · Up to 20MB each</p>
            </div>

            {/* Preview grid */}
            {files.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.78rem] text-muted">{files.length} image{files.length !== 1 ? "s" : ""} selected</span>
                  <button onClick={() => { files.forEach(f => URL.revokeObjectURL(f.preview)); setFiles([]); }} className="text-[0.75rem] text-accent font-medium hover:underline">
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={f.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/70 text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => document.getElementById("file-input")?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-foreground/[0.12] flex items-center justify-center hover:border-foreground/30 transition-colors"
                  >
                    <Image className="w-5 h-5 text-muted" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={uploading || !name.trim()}
            className="w-full h-12 rounded-lg bg-foreground text-primary-foreground font-semibold text-[0.9rem] hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating…
              </>
            ) : (
              "Create Collection"
            )}
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default CreateCollectionPage;
