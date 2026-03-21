import { useState, useRef, useCallback } from "react";
import { X, Upload, Camera, Clock, Pencil, ChevronLeft, ChevronRight, Loader2, Check, ImageIcon, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Step = "name" | "source" | "images" | "describe" | "review";
type SourceMethod = "upload" | "camera" | "history" | "describe";

const DUMMY_HISTORY = [
  { id: "h1", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop", title: "Cosmic Dreamscape" },
  { id: "h2", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=200&fit=crop", title: "Neon City" },
  { id: "h3", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop", title: "Portrait Study" },
  { id: "h4", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop", title: "Athletic Pose" },
  { id: "h5", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", title: "Clean Portrait" },
  { id: "h6", url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop", title: "Elegant Shot" },
];

interface CreateCharacterModalProps {
  onClose: () => void;
  onCreated: (character: { id: string; name: string; avatar_url: string | null }) => void;
}

export default function CreateCharacterModal({ onClose, onCreated }: CreateCharacterModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<{ id: string; src: string; file?: File }[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 6 - images.length).forEach(file => {
      const id = crypto.randomUUID();
      const src = URL.createObjectURL(file);
      setImages(prev => [...prev, { id, src, file }]);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast({ title: "Camera access denied", variant: "destructive" });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const id = crypto.randomUUID();
      const file = new File([blob], `camera-${id}.jpg`, { type: "image/jpeg" });
      const src = URL.createObjectURL(blob);
      setImages(prev => [...prev, { id, src, file }]);
    }, "image/jpeg", 0.9);
    stopCamera();
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setCameraActive(false);
  };

  const toggleHistory = (id: string) => {
    setSelectedHistory(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  const confirmHistory = () => {
    const historyImages = DUMMY_HISTORY.filter(h => selectedHistory.includes(h.id)).map(h => ({
      id: h.id,
      src: h.url,
    }));
    setImages(prev => [...prev, ...historyImages].slice(0, 6));
    setStep("review");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to create characters");

      // Upload images to storage
      const uploadedUrls: string[] = [];
      for (const img of images) {
        if (img.file) {
          const ext = img.file.name.split(".").pop() || "jpg";
          const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("character-images")
            .upload(path, img.file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from("character-images").getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        } else {
          uploadedUrls.push(img.src);
        }
      }

      const avatarUrl = uploadedUrls[0] || null;

      const { data, error } = await supabase.from("characters").insert({
        user_id: user.id,
        name,
        description: description || null,
        avatar_url: avatarUrl,
        training_images: uploadedUrls,
      }).select("id, name, avatar_url").single();

      if (error) throw error;

      toast({ title: "Character created!", description: `${name} is ready to use.` });
      onCreated(data);
      onClose();
    } catch (e: any) {
      console.error("Save character error:", e);
      toast({ title: "Failed to save character", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    if (step === "name") return name.trim().length > 0;
    if (step === "review") return images.length > 0 || description.trim().length > 0;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background rounded-2xl border border-foreground/[0.1] shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-2">
            {step !== "name" && (
              <button
                onClick={() => {
                  if (step === "source") setStep("name");
                  else if (step === "images" || step === "describe") { stopCamera(); setStep("source"); }
                  else if (step === "review") setStep("source");
                }}
                className="p-1 rounded-lg hover:bg-foreground/[0.06] text-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <h2 className="text-[0.95rem] font-bold">Create Character</h2>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-muted hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-1.5 px-5 pt-3">
          {(["name", "source", "review"] as const).map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
              (s === step || (s === "source" && (step === "images" || step === "describe")))
                ? "bg-accent"
                : i < ["name", "source", "review"].indexOf(step === "images" || step === "describe" ? "source" : step)
                  ? "bg-accent/40"
                  : "bg-foreground/[0.08]"
            }`} />
          ))}
        </div>

        <div className="px-5 py-5 min-h-[320px]">
          {/* Step: Name */}
          {step === "name" && (
            <div className="space-y-4">
              <div>
                <label className="text-[0.78rem] font-semibold text-foreground/70 mb-1.5 block">Character Name</label>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex, Luna, Brand Ambassador..."
                  className="w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.1] text-[0.9rem] outline-none focus:border-accent transition-colors"
                  onKeyDown={e => e.key === "Enter" && canProceed() && setStep("source")}
                />
              </div>
              <p className="text-[0.75rem] text-muted/60">Give your character a memorable name. You can change it later.</p>
            </div>
          )}

          {/* Step: Source selection */}
          {step === "source" && (
            <div className="space-y-3">
              <p className="text-[0.82rem] text-foreground/70 mb-2">How do you want to define <span className="font-semibold text-foreground">{name}</span>?</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: "upload" as SourceMethod, icon: Upload, label: "Upload Images", desc: "Upload reference photos" },
                  { id: "camera" as SourceMethod, icon: Camera, label: "Use Camera", desc: "Take a photo now" },
                  { id: "history" as SourceMethod, icon: Clock, label: "From Creations", desc: "Pick from your history" },
                  { id: "describe" as SourceMethod, icon: Pencil, label: "Describe", desc: "Write a description" },
                ]).map(method => (
                  <button
                    key={method.id}
                    onClick={() => {
                      if (method.id === "upload") { setStep("images"); setTimeout(() => fileRef.current?.click(), 100); }
                      else if (method.id === "camera") { setStep("images"); startCamera(); }
                      else if (method.id === "history") setStep("images");
                      else setStep("describe");
                    }}
                    className="flex flex-col items-center gap-2 p-5 rounded-xl border border-foreground/[0.08] hover:border-accent/40 hover:bg-accent/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                      <method.icon size={20} className="text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <span className="text-[0.82rem] font-semibold">{method.label}</span>
                    <span className="text-[0.7rem] text-muted/60">{method.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Images (upload, camera, or history) */}
          {step === "images" && (
            <div className="space-y-4">
              {/* Camera view */}
              {cameraActive && (
                <div className="space-y-3">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] rounded-xl bg-black object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={stopCamera} className="px-4 py-2 rounded-lg bg-foreground/[0.06] text-[0.82rem] font-medium hover:bg-foreground/[0.1] transition-colors">Cancel</button>
                    <button onClick={capturePhoto} className="px-6 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-colors">Capture</button>
                  </div>
                </div>
              )}

              {/* History picker */}
              {!cameraActive && selectedHistory.length === 0 && images.length === 0 && (
                <div>
                  <p className="text-[0.78rem] font-semibold text-foreground/70 mb-3">Select From Creations</p>
                  <div className="grid grid-cols-3 gap-2">
                    {DUMMY_HISTORY.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleHistory(item.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedHistory.includes(item.id)
                            ? "border-accent ring-2 ring-accent/20"
                            : "border-transparent hover:border-foreground/20"
                        }`}
                      >
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        {selectedHistory.includes(item.id) && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <span className="text-[0.65rem] text-white font-medium">{item.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedHistory.length > 0 && (
                    <button onClick={confirmHistory} className="mt-3 w-full py-2 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-colors">
                      Use {selectedHistory.length} Selected
                    </button>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-px bg-foreground/[0.08]" />
                    <span className="text-[0.7rem] text-muted/50">or</span>
                    <div className="flex-1 h-px bg-foreground/[0.08]" />
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-foreground/[0.12] hover:border-accent/40 flex items-center justify-center gap-2 text-[0.82rem] text-muted hover:text-foreground transition-colors"
                  >
                    <Upload size={16} /> Upload Images Instead
                  </button>
                </div>
              )}

              {/* Uploaded images grid */}
              {!cameraActive && images.length > 0 && (
                <div>
                  <p className="text-[0.78rem] font-semibold text-foreground/70 mb-2">Training Images ({images.length}/6)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map(img => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {images.length < 6 && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-1 hover:border-accent/40 transition-colors"
                      >
                        <Upload size={16} className="text-muted" />
                        <span className="text-[0.65rem] text-muted">Add More</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
              />
            </div>
          )}

          {/* Step: Describe */}
          {step === "describe" && (
            <div className="space-y-4">
              <div>
                <label className="text-[0.78rem] font-semibold text-foreground/70 mb-1.5 block">Describe {name}</label>
                <textarea
                  autoFocus
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the character's appearance, style, mood, and any distinguishing features..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.1] text-[0.88rem] outline-none focus:border-accent transition-colors resize-none leading-relaxed"
                />
              </div>
              <p className="text-[0.72rem] text-muted/60">Be as detailed as possible — include physical features, clothing style, mood, lighting preferences, etc.</p>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {images[0] ? (
                  <img src={images[0].src} alt={name} className="w-16 h-16 rounded-xl object-cover border border-foreground/[0.08]" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-foreground/[0.06] flex items-center justify-center">
                    <ImageIcon size={24} className="text-muted" />
                  </div>
                )}
                <div>
                  <h3 className="text-[0.95rem] font-bold">{name}</h3>
                  <p className="text-[0.78rem] text-muted">{images.length} training image{images.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {description && (
                <div>
                  <label className="text-[0.72rem] font-semibold text-muted mb-1 block">Description</label>
                  <p className="text-[0.82rem] text-foreground/80 leading-relaxed">{description}</p>
                </div>
              )}

              {images.length > 1 && (
                <div>
                  <label className="text-[0.72rem] font-semibold text-muted mb-1.5 block">All Images</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map(img => (
                      <img key={img.id} src={img.src} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ))}
                  </div>
                </div>
              )}

              {/* Optional description on review */}
              {!description && (
                <div>
                  <label className="text-[0.72rem] font-semibold text-muted mb-1.5 block">Add Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Optionally describe the character..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.1] text-[0.85rem] outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-foreground/[0.06]">
          <button onClick={() => { stopCamera(); onClose(); }} className="px-4 py-2 rounded-lg text-[0.82rem] font-medium text-muted hover:text-foreground transition-colors">
            Cancel
          </button>
          {step === "name" && (
            <button
              onClick={() => setStep("source")}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          )}
          {(step === "images" || step === "describe") && (
            <button
              onClick={() => setStep("review")}
              disabled={step === "images" ? images.length === 0 : !description.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Review <ChevronRight size={14} />
            </button>
          )}
          {step === "review" && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <>Create Character</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
