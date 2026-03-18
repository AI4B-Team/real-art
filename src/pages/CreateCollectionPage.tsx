import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Upload, X, Lock, Globe, Image, Loader2, Sparkles, UserPlus, Mail, ChevronDown, Check, Trash2, Users, Copy } from "lucide-react";
import CoverImageEditor from "@/components/CoverImageEditor";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type CollabRole = "viewer" | "editor" | "admin";
interface PendingInvite { email: string; role: CollabRole; }
const ROLE_META: Record<CollabRole, { label: string; desc: string; color: string }> = {
  viewer: { label: "Viewer",  desc: "Can view only",             color: "bg-foreground/[0.06] text-muted" },
  editor: { label: "Editor",  desc: "Can add & edit images",     color: "bg-blue-100 text-blue-700" },
  admin:  { label: "Admin",   desc: "Full access & can invite",  color: "bg-purple-100 text-purple-700" },
};

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
  const [aiWriting, setAiWriting] = useState(false);
  // Collaborator state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollabRole>("editor");
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [roleDropdownIndex, setRoleDropdownIndex] = useState<number | null>(null);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [shareLink] = useState(() => `https://realart.ai/join/${Math.random().toString(36).slice(2, 10)}`);

  const generateDescription = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Enter a collection name first so AI can write a description.", variant: "destructive" });
      return;
    }
    setAiWriting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-description", {
        body: { collectionName: name.trim() },
      });
      if (error) throw error;
      if (data?.description) setDescription(data.description);
    } catch (err: any) {
      toast({ title: "AI error", description: err.message || "Could not generate description.", variant: "destructive" });
    } finally {
      setAiWriting(false);
    }
  };

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

  const handleAddInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (invites.some(i => i.email === email)) {
      toast({ title: "Already added", description: `${email} is already in the invite list.` });
      return;
    }
    setInvites(prev => [...prev, { email, role: inviteRole }]);
    setInviteEmail("");
  };

  const handleUpdateRole = (email: string, role: CollabRole) =>
    setInvites(prev => prev.map(i => i.email === email ? { ...i, role } : i));

  const handleRemoveInvite = (email: string) =>
    setInvites(prev => prev.filter(i => i.email !== email));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    toast({ title: "Link copied!", description: "Share this link with collaborators." });
  };

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

        // Set cover from uploaded cover file or first image
        let finalCoverUrl = imageRecords[0].image_url;
        if (coverFile) {
          const coverExt = coverFile.name.split(".").pop();
          const coverPath = `${user.id}/${collection.id}/cover.${coverExt}`;
          const { error: coverUploadErr } = await supabase.storage
            .from("collection-images")
            .upload(coverPath, coverFile);
          if (!coverUploadErr) {
            const { data: { publicUrl: coverPublicUrl } } = supabase.storage
              .from("collection-images")
              .getPublicUrl(coverPath);
            finalCoverUrl = coverPublicUrl;
          }
        }
        await supabase
          .from("collections")
          .update({ cover_url: finalCoverUrl })
          .eq("id", collection.id);
      } else if (coverFile) {
        const coverExt = coverFile.name.split(".").pop();
        const coverPath = `${user.id}/${collection.id}/cover.${coverExt}`;
        const { error: coverUploadErr } = await supabase.storage
          .from("collection-images")
          .upload(coverPath, coverFile);
        if (!coverUploadErr) {
          const { data: { publicUrl: coverPublicUrl } } = supabase.storage
            .from("collection-images")
            .getPublicUrl(coverPath);
          await supabase
            .from("collections")
            .update({ cover_url: coverPublicUrl })
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
    <PageShell>
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-[0.82rem] font-semibold">Description <span className="text-muted font-normal">(optional)</span></label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiWriting || !name.trim()}
                className="flex items-center gap-1.5 text-[0.75rem] font-medium text-accent hover:text-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {aiWriting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {aiWriting ? "Writing…" : "AI Write"}
              </button>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell people what this collection is about. What will they find inside?"
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl border border-foreground/[0.12] bg-card text-[0.9rem] font-body outline-none focus:border-foreground transition-colors resize-none"
            />
            <div className="text-right text-[0.72rem] text-muted mt-1">{description.length}/300</div>
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

          {/* Invite Collaborators */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-[0.82rem] font-semibold">Invite Collaborators</label>
              <span className="text-[0.72rem] text-muted font-normal">(optional)</span>
              {invites.length > 0 && (
                <span className="ml-auto text-[0.72rem] font-semibold text-accent">{invites.length} pending</span>
              )}
            </div>
            <p className="text-[0.75rem] text-muted mb-4">Let others view, contribute, or co-manage this collection.</p>

            {/* Add invite row */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddInvite()}
                  placeholder="colleague@example.com"
                  className="w-full pl-9 pr-4 h-11 rounded-xl border border-foreground/[0.12] bg-card text-[0.88rem] font-body outline-none focus:border-foreground transition-colors"
                />
              </div>

              {/* Role selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAddRoleOpen(v => !v)}
                  className="flex items-center gap-1.5 h-11 px-3.5 rounded-xl border border-foreground/[0.12] bg-card text-[0.84rem] font-medium hover:border-foreground/30 transition-colors whitespace-nowrap"
                >
                  {ROLE_META[inviteRole].label}
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>
                {addRoleOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-background border border-foreground/[0.1] rounded-2xl shadow-xl z-20 w-44 overflow-hidden">
                    {(Object.entries(ROLE_META) as [CollabRole, typeof ROLE_META[CollabRole]][]).map(([key, meta]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setInviteRole(key); setAddRoleOpen(false); }}
                        className={`flex items-start gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-foreground/[0.04] ${inviteRole === key ? "bg-foreground/[0.03]" : ""}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`text-[0.8rem] font-semibold ${inviteRole === key ? "text-accent" : "text-foreground"}`}>{meta.label}</div>
                          <div className="text-[0.7rem] text-muted mt-0.5">{meta.desc}</div>
                        </div>
                        {inviteRole === key && <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddInvite}
                disabled={!inviteEmail.trim()}
                className="h-11 px-5 rounded-xl bg-foreground text-primary-foreground text-[0.84rem] font-semibold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Invite
              </button>
            </div>

            {/* Pending invites list */}
            {invites.length > 0 && (
              <div className="rounded-2xl border border-foreground/[0.08] overflow-hidden mb-4">
                {invites.map((inv, idx) => (
                  <div key={inv.email} className={`flex items-center gap-3 px-4 py-3 ${idx !== 0 ? "border-t border-foreground/[0.05]" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shrink-0">
                      <UserPlus className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.84rem] font-medium truncate">{inv.email}</div>
                      <div className="text-[0.71rem] text-muted">Invite pending</div>
                    </div>

                    {/* Inline role changer */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setRoleDropdownIndex(roleDropdownIndex === idx ? null : idx)}
                        className={`flex items-center gap-1 text-[0.72rem] font-semibold px-2 py-1 rounded-lg transition-colors ${ROLE_META[inv.role].color}`}
                      >
                        {ROLE_META[inv.role].label}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                      {roleDropdownIndex === idx && (
                        <div className="absolute right-0 top-full mt-1 bg-background border border-foreground/[0.1] rounded-xl shadow-lg z-20 w-40 overflow-hidden">
                          {(Object.entries(ROLE_META) as [CollabRole, typeof ROLE_META[CollabRole]][]).map(([key, meta]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => { handleUpdateRole(inv.email, key); setRoleDropdownIndex(null); }}
                              className={`flex items-center justify-between w-full px-3 py-2.5 text-[0.78rem] transition-colors hover:bg-foreground/[0.04] ${inv.role === key ? "text-accent font-semibold" : "text-foreground"}`}
                            >
                              <div>
                                <div className="font-medium">{meta.label}</div>
                                <div className="text-[0.67rem] text-muted">{meta.desc}</div>
                              </div>
                              {inv.role === key && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveInvite(inv.email)}
                      className="text-muted hover:text-destructive transition-colors ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Share link */}
            <div className="flex items-center gap-2 p-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
              <div className="flex-1 min-w-0">
                <div className="text-[0.72rem] font-semibold text-muted mb-0.5">Shareable invite link</div>
                <div className="text-[0.78rem] text-foreground font-mono truncate">{shareLink}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foreground/[0.12] text-[0.76rem] font-semibold hover:border-foreground/30 hover:bg-foreground/[0.04] transition-colors whitespace-nowrap shrink-0"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>

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
            ) : invites.length > 0 ? (
              <>
                <Users className="w-4 h-4" />
                Create & Invite {invites.length} Collaborator{invites.length !== 1 ? "s" : ""}
              </>
            ) : (
              "Create Collection"
            )}
          </button>
        </div>

        <Footer />
    </PageShell>
  );
};

export default CreateCollectionPage;
