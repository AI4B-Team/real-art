import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Check, Bookmark } from "lucide-react";

export type SavedTemplate = {
  id: string;
  name: string;
  previewUrl: string | null;
  contentType: string | null;
  subMode: string | null;
  model: string;
  style: string;
  ratio: string;
  prompt: string;
  number: number;
  duration: string;
  resolution: string;
  createdAt: string;
};

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: SavedTemplate) => void;
  defaults: {
    contentType: string | null;
    subMode: string | null;
    model: string;
    style: string;
    ratio: string;
    prompt: string;
    number: number;
    duration: string;
    resolution: string;
    references: { src: string }[];
  };
}

export function loadSavedTemplates(): SavedTemplate[] {
  try {
    const s = localStorage.getItem("ra_saved_templates");
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function saveSavedTemplates(templates: SavedTemplate[]) {
  localStorage.setItem("ra_saved_templates", JSON.stringify(templates));
}

export default function SaveTemplateModal({ open, onClose, onSave, defaults }: SaveTemplateModalProps) {
  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaults.references[0]?.src || null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileUpload = (files: FileList | null) => {
    if (!files?.[0]) return;
    setPreviewUrl(URL.createObjectURL(files[0]));
  };

  const handleSave = () => {
    const template: SavedTemplate = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled Template",
      previewUrl,
      contentType: defaults.contentType,
      subMode: defaults.subMode,
      model: defaults.model,
      style: defaults.style,
      ratio: defaults.ratio,
      prompt: defaults.prompt,
      number: defaults.number,
      duration: defaults.duration,
      resolution: defaults.resolution,
      createdAt: new Date().toISOString(),
    };
    const existing = loadSavedTemplates();
    saveSavedTemplates([template, ...existing]);
    onSave(template);
    onClose();
    setName("");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[640px] bg-background rounded-2xl border border-foreground/[0.1] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.08]">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-accent" />
            <h2 className="text-[1rem] font-bold">Save Template</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-foreground/[0.06] transition-colors">
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-[1fr_1fr] gap-6">
          {/* Left: settings summary */}
          <div className="space-y-4">
            {/* Model */}
            <div>
              <label className="block text-[0.72rem] font-semibold text-muted uppercase tracking-wider mb-1.5">Model</label>
              <div className="px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.02] text-[0.84rem]">
                {defaults.model}
              </div>
            </div>

            {/* References count */}
            <div>
              <label className="block text-[0.72rem] font-semibold text-muted uppercase tracking-wider mb-1.5">References</label>
              <div className="px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.02] text-[0.84rem]">
                {defaults.references.length}/8
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-[0.72rem] font-semibold text-muted uppercase tracking-wider mb-1.5">Prompt</label>
              <div className="px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.02] text-[0.82rem] text-muted min-h-[60px] max-h-[100px] overflow-y-auto leading-relaxed">
                {defaults.prompt || <span className="text-muted/40 italic">No prompt entered</span>}
              </div>
            </div>

            {/* Ratio */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[0.72rem] font-semibold text-muted uppercase tracking-wider mb-1.5">Ratio</label>
                <div className="px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.02] text-[0.84rem]">
                  {defaults.ratio}
                </div>
              </div>
            </div>
          </div>

          {/* Right: name + preview */}
          <div className="space-y-4">
            <div>
              <label className="block text-[0.72rem] font-semibold text-muted uppercase tracking-wider mb-1.5">Template Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Template Name"
                className="w-full px-3 py-2 rounded-lg border border-foreground/[0.13] bg-background text-[0.88rem] outline-none focus:border-accent transition-colors"
                maxLength={60}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[0.72rem] font-semibold text-muted uppercase tracking-wider mb-1.5">Preview</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} />
              {previewUrl ? (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-foreground/[0.08] group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="text-white text-[0.78rem] font-semibold">Replace</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-foreground/[0.12] flex flex-col items-center justify-center gap-2 hover:border-foreground/30 transition-colors"
                >
                  <ImageIcon size={24} className="text-muted" />
                  <span className="text-[0.8rem] text-muted font-medium">Select image</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-foreground/[0.08]">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-[0.84rem] font-medium text-muted hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-[0.84rem] font-bold hover:bg-accent/85 transition-colors"
          >
            <Check size={15} />
            Save template
          </button>
        </div>
      </div>
    </div>
  );
}
