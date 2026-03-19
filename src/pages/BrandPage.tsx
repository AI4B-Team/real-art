import { useState } from "react";
import {
  Palette, MessageSquare, Database, Brain, Users, ClipboardCheck,
  Check, X, Upload, AlertCircle, Briefcase, Smile, Hand, GraduationCap,
  PartyPopper, Heart, Zap, Sparkles, Plus, Globe, FileText, Type,
  ChevronRight, ArrowLeft, ArrowRight, Image as ImageIcon,
  Target, TrendingUp, Mic,
} from "lucide-react";
import PageShell from "@/components/PageShell";

/* ─── Types ─── */

interface BrandFormData {
  // Identity
  brandName: string;
  tagline: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
  // Voice
  toneOfVoice: string[];
  writingStyle: string;
  brandPersonality: string[];
  communicationGuidelines: string;
  dosList: string[];
  dontsList: string[];
  // Audience
  targetAge: string;
  targetGender: string;
  targetInterests: string[];
  targetPainPoints: string;
  // Knowledge
  dataSources: { id: string; name: string; type: string; status: string }[];
  // Intelligence
  competitors: string[];
  // Characters
  selectedCharacter: string;
  selectedVoice: string;
}

const STEPS = [
  { id: "identity", label: "Identity", icon: Palette },
  { id: "voice", label: "Voice", icon: MessageSquare },
  { id: "audience", label: "Audience", icon: Target },
  { id: "knowledge", label: "Knowledge", icon: Database },
  { id: "intelligence", label: "Intelligence", icon: Brain },
  { id: "characters", label: "Characters", icon: Users },
  { id: "review", label: "Review", icon: ClipboardCheck },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "friendly", label: "Friendly", icon: Smile },
  { value: "casual", label: "Casual", icon: Hand },
  { value: "formal", label: "Formal", icon: GraduationCap },
  { value: "enthusiastic", label: "Enthusiastic", icon: PartyPopper },
  { value: "empathetic", label: "Empathetic", icon: Heart },
  { value: "authoritative", label: "Authoritative", icon: Zap },
  { value: "playful", label: "Playful", icon: Sparkles },
];

const WRITING_STYLES = [
  { value: "concise", label: "Concise & Direct", desc: "Get to the point quickly" },
  { value: "detailed", label: "Detailed & Thorough", desc: "Comprehensive explanations" },
  { value: "conversational", label: "Conversational", desc: "Like talking to a friend" },
  { value: "storytelling", label: "Storytelling", desc: "Narrative-driven approach" },
];

const PERSONALITY_TRAITS = [
  "Innovative", "Trustworthy", "Bold", "Caring", "Sophisticated", "Down-to-earth",
  "Energetic", "Calm", "Adventurous", "Reliable", "Creative", "Analytical",
  "Inspiring", "Witty", "Luxurious", "Minimalist",
];

const FONTS = ["DM Sans", "Inter", "Roboto", "Poppins", "Montserrat", "Playfair Display", "Merriweather", "Lato", "Raleway", "Nunito"];

const INTEREST_OPTIONS = [
  "Art & Design", "Photography", "Fashion", "Technology", "Music", "Film",
  "Travel", "Fitness", "Food", "Business", "Education", "Gaming",
  "Sustainability", "Wellness", "Finance", "Entertainment",
];

const DEFAULT_DATA: BrandFormData = {
  brandName: "", tagline: "", logo: null,
  primaryColor: "#E8472A", secondaryColor: "#1A1A1A", accentColor: "#10B981",
  primaryFont: "DM Sans", secondaryFont: "DM Sans",
  toneOfVoice: [], writingStyle: "", brandPersonality: [],
  communicationGuidelines: "", dosList: [], dontsList: [],
  targetAge: "", targetGender: "", targetInterests: [], targetPainPoints: "",
  dataSources: [], competitors: [],
  selectedCharacter: "", selectedVoice: "",
};

/* ─── Progress Bar ─── */

function WizardProgress({ step, onStep }: { step: number; onStep: (i: number) => void }) {
  if (step >= 7) return null;
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((s, i) => {
        const done = i < step;
        const current = i === step;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1">
            <button
              onClick={() => i <= step && onStep(i)}
              disabled={i > step}
              className={`flex flex-col items-center gap-1.5 transition-all ${i <= step ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                done ? "bg-green-500 text-white" : current ? "bg-accent text-white" : "bg-foreground/[0.06] text-muted"
              }`}>
                {done ? <Check size={18} /> : <Icon size={16} />}
              </div>
              <span className={`text-[0.65rem] font-semibold ${current ? "text-accent" : done ? "text-green-600" : "text-muted"}`}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full ${i < step ? "bg-green-500" : "bg-foreground/[0.06]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step Components ─── */

function StepShell({ title, subtitle, icon: Icon, iconColor, children, onBack, onNext, nextLabel, nextDisabled }: {
  title: string; subtitle: string; icon: typeof Palette; iconColor: string;
  children: React.ReactNode; onBack?: () => void; onNext: () => void;
  nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-[0.82rem] text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">{children}</div>
      <div className="flex items-center justify-between pt-4 border-t border-foreground/[0.06]">
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.85rem] font-medium text-muted hover:text-foreground hover:bg-foreground/[0.04] transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
        ) : <div />}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white text-[0.85rem] font-bold hover:bg-accent/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nextLabel || "Continue"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function IdentityStep({ data, onUpdate, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onNext: () => void }) {
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setLogoPreview(reader.result as string); onUpdate({ logo: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <StepShell title="Brand Identity" subtitle="Define your visual brand elements" icon={Palette} iconColor="bg-blue-600" onNext={onNext} nextDisabled={!data.brandName.trim()}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">Brand Name <span className="text-accent">*</span></label>
            <input value={data.brandName} onChange={e => onUpdate({ brandName: e.target.value })} placeholder="Enter your brand name"
              className="w-full px-4 py-3 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.88rem] outline-none focus:border-accent transition-colors" />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">Tagline</label>
            <input value={data.tagline} onChange={e => onUpdate({ tagline: e.target.value })} placeholder="A short phrase that captures your brand essence"
              className="w-full px-4 py-3 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.88rem] outline-none focus:border-accent transition-colors" />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">Brand Logo</label>
            <div className="border-2 border-dashed border-foreground/[0.12] rounded-xl p-6 text-center hover:border-accent/40 transition-colors">
              {logoPreview ? (
                <div className="space-y-3">
                  <img src={logoPreview} alt="Logo" className="max-h-20 mx-auto rounded-lg" />
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground/[0.06] rounded-lg text-[0.78rem] font-medium cursor-pointer hover:bg-foreground/[0.1]">
                    <Upload size={14} /> Change
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <ImageIcon size={24} className="mx-auto text-muted mb-2" />
                  <p className="text-[0.82rem] font-medium text-foreground/70">Upload Logo</p>
                  <p className="text-[0.7rem] text-muted/60">PNG, JPG, SVG (Max 5MB)</p>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">Brand Colors</label>
            <div className="grid grid-cols-3 gap-3">
              {([["primaryColor", "Primary"], ["secondaryColor", "Secondary"], ["accentColor", "Accent"]] as const).map(([key, label]) => (
                <div key={key}>
                  <span className="text-[0.72rem] text-muted mb-1 block">{label}</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={data[key]} onChange={e => onUpdate({ [key]: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-foreground/[0.1] cursor-pointer" />
                    <input type="text" value={data[key]} onChange={e => onUpdate({ [key]: e.target.value })}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.75rem] font-mono outline-none focus:border-accent" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">Typography</label>
            <div className="grid grid-cols-2 gap-3">
              {([["primaryFont", "Heading Font"], ["secondaryFont", "Body Font"]] as const).map(([key, label]) => (
                <div key={key}>
                  <span className="text-[0.72rem] text-muted mb-1 block">{label}</span>
                  <select value={data[key]} onChange={e => onUpdate({ [key]: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-0 self-start">
          <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-6">
            <h3 className="text-[0.82rem] font-bold text-foreground mb-4">Brand Preview</h3>
            <div className="bg-background rounded-lg border border-foreground/[0.06] p-6 space-y-4">
              <div className="text-center">
                {logoPreview && <img src={logoPreview} alt="Logo" className="h-10 mx-auto mb-3 rounded" />}
                <h2 className="text-lg font-bold" style={{ color: data.primaryColor, fontFamily: data.primaryFont }}>
                  {data.brandName || "Your Brand"}
                </h2>
                {data.tagline && <p className="text-[0.78rem] text-muted mt-1" style={{ fontFamily: data.secondaryFont }}>{data.tagline}</p>}
              </div>
              <div className="border-t border-foreground/[0.06] pt-4">
                <p className="text-[0.78rem] text-muted" style={{ fontFamily: data.secondaryFont }}>
                  This is how your brand will appear across all content and campaigns.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                {[data.primaryColor, data.secondaryColor, data.accentColor].map((c, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg border border-foreground/[0.08]" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepShell>
  );
}

function VoiceStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const [customDo, setCustomDo] = useState("");
  const [customDont, setCustomDont] = useState("");

  const toggleTone = (v: string) => onUpdate({ toneOfVoice: data.toneOfVoice.includes(v) ? data.toneOfVoice.filter(t => t !== v) : [...data.toneOfVoice, v] });
  const toggleTrait = (v: string) => onUpdate({ brandPersonality: data.brandPersonality.includes(v) ? data.brandPersonality.filter(t => t !== v) : [...data.brandPersonality, v] });

  return (
    <StepShell title="Brand Voice" subtitle="Define how your brand communicates" icon={MessageSquare} iconColor="bg-purple-600" onBack={onBack} onNext={onNext} nextDisabled={data.toneOfVoice.length === 0}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Tone */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">Tone of Voice <span className="text-accent">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map(t => {
                const sel = data.toneOfVoice.includes(t.value);
                return (
                  <button key={t.value} onClick={() => toggleTone(t.value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-left ${sel ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-accent/30"}`}>
                    <t.icon size={18} className={sel ? "text-accent" : "text-muted"} />
                    <span className="text-[0.82rem] font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Writing Style */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">Writing Style</label>
            <div className="space-y-2">
              {WRITING_STYLES.map(s => (
                <button key={s.value} onClick={() => onUpdate({ writingStyle: s.value })}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${data.writingStyle === s.value ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-accent/30"}`}>
                  <span className="text-[0.82rem] font-medium text-foreground">{s.label}</span>
                  <span className="text-[0.72rem] text-muted block">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">Brand Personality <span className="text-[0.72rem] text-muted font-normal">(pick 3-5)</span></label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TRAITS.map(t => (
                <button key={t} onClick={() => toggleTrait(t)}
                  className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-all ${data.brandPersonality.includes(t) ? "bg-accent text-white" : "bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">Communication Guidelines</label>
            <textarea value={data.communicationGuidelines} onChange={e => onUpdate({ communicationGuidelines: e.target.value })} rows={3}
              placeholder="E.g. 'Always use inclusive language', 'Avoid jargon'"
              className="w-full px-4 py-3 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent resize-none" />
          </div>

          {/* Do's / Don'ts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <h4 className="text-[0.78rem] font-semibold text-foreground mb-2 flex items-center gap-1.5"><Check size={14} className="text-green-500" /> Do's</h4>
              <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                {data.dosList.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-background px-2 py-1 rounded text-[0.72rem]">
                    <span className="flex-1">{d}</span>
                    <button onClick={() => onUpdate({ dosList: data.dosList.filter((_, idx) => idx !== i) })} className="text-muted hover:text-foreground"><X size={10} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <input value={customDo} onChange={e => setCustomDo(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && customDo.trim()) { onUpdate({ dosList: [...data.dosList, customDo.trim()] }); setCustomDo(""); } }}
                  placeholder="Add…" className="flex-1 px-2 py-1.5 rounded-lg border border-foreground/[0.1] bg-background text-[0.72rem] outline-none" />
                <button onClick={() => { if (customDo.trim()) { onUpdate({ dosList: [...data.dosList, customDo.trim()] }); setCustomDo(""); } }}
                  className="px-2 py-1.5 rounded-lg bg-green-500 text-white text-[0.72rem] font-medium">Add</button>
              </div>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <h4 className="text-[0.78rem] font-semibold text-foreground mb-2 flex items-center gap-1.5"><AlertCircle size={14} className="text-red-500" /> Don'ts</h4>
              <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                {data.dontsList.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-background px-2 py-1 rounded text-[0.72rem]">
                    <span className="flex-1">{d}</span>
                    <button onClick={() => onUpdate({ dontsList: data.dontsList.filter((_, idx) => idx !== i) })} className="text-muted hover:text-foreground"><X size={10} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <input value={customDont} onChange={e => setCustomDont(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && customDont.trim()) { onUpdate({ dontsList: [...data.dontsList, customDont.trim()] }); setCustomDont(""); } }}
                  placeholder="Add…" className="flex-1 px-2 py-1.5 rounded-lg border border-foreground/[0.1] bg-background text-[0.72rem] outline-none" />
                <button onClick={() => { if (customDont.trim()) { onUpdate({ dontsList: [...data.dontsList, customDont.trim()] }); setCustomDont(""); } }}
                  className="px-2 py-1.5 rounded-lg bg-red-500 text-white text-[0.72rem] font-medium">Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Summary */}
        <div className="lg:sticky lg:top-0 self-start">
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
            <h3 className="text-[0.82rem] font-bold text-foreground mb-4 flex items-center gap-2"><Sparkles size={14} className="text-purple-500" /> Voice Summary</h3>
            <div className="bg-background rounded-lg border border-foreground/[0.06] p-5 space-y-4">
              {data.toneOfVoice.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-2">Tone</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.toneOfVoice.map(t => <span key={t} className="px-2.5 py-1 bg-purple-500/10 text-purple-700 rounded-lg text-[0.72rem] font-medium capitalize">{t}</span>)}
                  </div>
                </div>
              )}
              {data.writingStyle && (
                <div className="border-t border-foreground/[0.06] pt-3">
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Style</p>
                  <p className="text-[0.82rem] font-medium text-foreground capitalize">{data.writingStyle}</p>
                </div>
              )}
              {data.brandPersonality.length > 0 && (
                <div className="border-t border-foreground/[0.06] pt-3">
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-2">Personality</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.brandPersonality.map(t => <span key={t} className="px-2.5 py-1 bg-foreground/[0.06] text-foreground/70 rounded-lg text-[0.72rem]">{t}</span>)}
                  </div>
                </div>
              )}
              {data.toneOfVoice.length === 0 && !data.writingStyle && data.brandPersonality.length === 0 && (
                <p className="text-[0.78rem] text-muted text-center py-4">Start selecting options to see your voice summary</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StepShell>
  );
}

function AudienceStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const toggleInterest = (v: string) => onUpdate({ targetInterests: data.targetInterests.includes(v) ? data.targetInterests.filter(t => t !== v) : [...data.targetInterests, v] });

  return (
    <StepShell title="Target Audience" subtitle="Define who your brand speaks to" icon={Target} iconColor="bg-amber-500" onBack={onBack} onNext={onNext}>
      <div className="max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">Age Range</label>
            <select value={data.targetAge} onChange={e => onUpdate({ targetAge: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent">
              <option value="">Select…</option>
              {["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "All Ages"].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">Gender</label>
            <select value={data.targetGender} onChange={e => onUpdate({ targetGender: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent">
              <option value="">Select…</option>
              {["All", "Male", "Female", "Non-binary"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[0.82rem] font-semibold text-foreground mb-3">Interests & Topics</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(i => (
              <button key={i} onClick={() => toggleInterest(i)}
                className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-all ${data.targetInterests.includes(i) ? "bg-amber-500 text-white" : "bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]"}`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[0.82rem] font-semibold text-foreground mb-2">Pain Points & Needs</label>
          <textarea value={data.targetPainPoints} onChange={e => onUpdate({ targetPainPoints: e.target.value })} rows={4}
            placeholder="What problems does your audience face? What are they looking for?"
            className="w-full px-4 py-3 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent resize-none" />
        </div>
      </div>
    </StepShell>
  );
}

function KnowledgeStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [sourceType, setSourceType] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [sourceContent, setSourceContent] = useState("");

  const addSource = () => {
    if (!sourceName.trim()) return;
    const src = { id: crypto.randomUUID(), name: sourceName, type: sourceType || "text", status: "trained" };
    onUpdate({ dataSources: [...data.dataSources, src] });
    setSourceName(""); setSourceContent(""); setSourceType(null); setShowAdd(false);
  };

  const sourceTypes = [
    { type: "website", icon: Globe, label: "Website", desc: "Crawl content from URLs", color: "text-green-600 bg-green-50" },
    { type: "file", icon: FileText, label: "Files", desc: "Upload documents or PDFs", color: "text-purple-600 bg-purple-50" },
    { type: "text", icon: Type, label: "Text", desc: "Add custom information", color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <StepShell title="Knowledge Base" subtitle="Add data sources to train your AI" icon={Database} iconColor="bg-green-600" onBack={onBack} onNext={onNext}>
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[0.82rem] text-muted">Manage your knowledge base sources</p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-semibold hover:bg-accent/85 transition-colors">
            <Plus size={16} /> Add Data
          </button>
        </div>

        {data.dataSources.length > 0 ? (
          <div className="space-y-2">
            {data.dataSources.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.type === "website" ? "bg-green-50 text-green-600" : s.type === "file" ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"}`}>
                  {s.type === "website" ? <Globe size={16} /> : s.type === "file" ? <FileText size={16} /> : <Type size={16} />}
                </div>
                <div className="flex-1"><span className="text-[0.82rem] font-medium">{s.name}</span><span className="text-[0.7rem] text-muted ml-2 capitalize">{s.type}</span></div>
                <span className="text-[0.7rem] text-green-600 font-medium flex items-center gap-1"><Check size={12} /> Trained</span>
                <button onClick={() => onUpdate({ dataSources: data.dataSources.filter(d => d.id !== s.id) })} className="text-muted hover:text-foreground"><X size={14} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-foreground/[0.1]">
            <Database size={32} className="mx-auto text-muted mb-3" />
            <p className="text-[0.85rem] font-medium text-foreground mb-1">No Data Sources Yet</p>
            <p className="text-[0.75rem] text-muted">Add your first data source to start building your knowledge base</p>
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <div className="bg-background rounded-2xl shadow-2xl w-[90vw] max-w-[500px] p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[0.92rem] font-bold">Add Data Source</h3>
                <button onClick={() => setShowAdd(false)} className="text-muted hover:text-foreground"><X size={18} /></button>
              </div>
              {!sourceType ? (
                <div className="grid grid-cols-3 gap-3">
                  {sourceTypes.map(t => (
                    <button key={t.type} onClick={() => setSourceType(t.type)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-foreground/[0.08] hover:border-accent/30 transition-all">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.color}`}><t.icon size={20} /></div>
                      <span className="text-[0.78rem] font-semibold">{t.label}</span>
                      <span className="text-[0.65rem] text-muted text-center">{t.desc}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => setSourceType(null)} className="text-[0.78rem] text-muted hover:text-foreground">← Back</button>
                  <input value={sourceName} onChange={e => setSourceName(e.target.value)} placeholder="Source name"
                    className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
                  {sourceType === "text" && (
                    <textarea value={sourceContent} onChange={e => setSourceContent(e.target.value)} rows={4} placeholder="Paste content…"
                      className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent resize-none" />
                  )}
                  {sourceType === "website" && (
                    <input value={sourceContent} onChange={e => setSourceContent(e.target.value)} placeholder="https://example.com"
                      className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
                  )}
                  <button onClick={addSource} disabled={!sourceName.trim()} className="w-full py-2.5 rounded-lg bg-accent text-white text-[0.82rem] font-bold disabled:opacity-40">Add Source</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </StepShell>
  );
}

function IntelligenceStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const [input, setInput] = useState("");
  const addCompetitor = () => {
    if (!input.trim()) return;
    onUpdate({ competitors: [...data.competitors, input.trim()] });
    setInput("");
  };

  return (
    <StepShell title="Competitive Intelligence" subtitle="Track your competitors' strategies" icon={Brain} iconColor="bg-yellow-500" onBack={onBack} onNext={onNext}>
      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-[0.82rem] font-semibold text-foreground mb-2">Add Competitors</label>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addCompetitor()}
              placeholder="Competitor name or URL" className="flex-1 px-4 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
            <button onClick={addCompetitor} disabled={!input.trim()} className="px-4 py-2.5 rounded-lg bg-accent text-white text-[0.82rem] font-bold disabled:opacity-40">Add</button>
          </div>
        </div>
        {data.competitors.length > 0 ? (
          <div className="space-y-2">
            {data.competitors.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
                <div className="flex items-center gap-3">
                  <TrendingUp size={16} className="text-yellow-500" />
                  <span className="text-[0.82rem] font-medium">{c}</span>
                </div>
                <button onClick={() => onUpdate({ competitors: data.competitors.filter((_, idx) => idx !== i) })} className="text-muted hover:text-foreground"><X size={14} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 rounded-xl border-2 border-dashed border-foreground/[0.1]">
            <TrendingUp size={28} className="mx-auto text-muted mb-2" />
            <p className="text-[0.82rem] text-muted">No competitors added yet</p>
          </div>
        )}
      </div>
    </StepShell>
  );
}

function CharactersStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const characters = [
    { id: "alex", name: "Alex", emoji: "👨‍💼", desc: "Professional business expert" },
    { id: "maya", name: "Maya", emoji: "👩‍💻", desc: "Tech-savvy innovator" },
    { id: "jordan", name: "Jordan", emoji: "🧑‍🎨", desc: "Creative storyteller" },
    { id: "sofia", name: "Sofia", emoji: "👩‍🏫", desc: "Educational expert" },
    { id: "marcus", name: "Marcus", emoji: "👨‍🎤", desc: "Dynamic motivator" },
    { id: "elena", name: "Elena", emoji: "👩‍⚕️", desc: "Healthcare professional" },
  ];

  const voices = [
    { id: "aria", name: "Aria" }, { id: "roger", name: "Roger" }, { id: "sarah", name: "Sarah" },
    { id: "laura", name: "Laura" }, { id: "charlie", name: "Charlie" }, { id: "george", name: "George" },
    { id: "liam", name: "Liam" }, { id: "charlotte", name: "Charlotte" },
  ];

  return (
    <StepShell title="Characters" subtitle="Select your AI spokesperson and voice" icon={Users} iconColor="bg-indigo-600" onBack={onBack} onNext={onNext} nextLabel="Review">
      <div className="max-w-3xl space-y-8">
        <div>
          <label className="block text-[0.82rem] font-semibold text-foreground mb-3">Choose Spokesperson</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {characters.map(c => (
              <button key={c.id} onClick={() => onUpdate({ selectedCharacter: c.id })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${data.selectedCharacter === c.id ? "border-accent bg-accent/5" : "border-foreground/[0.08] hover:border-accent/30"}`}>
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-[0.75rem] font-semibold">{c.name}</span>
                <span className="text-[0.6rem] text-muted text-center">{c.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[0.82rem] font-semibold text-foreground mb-3 flex items-center gap-2"><Mic size={14} /> Choose Voice</label>
          <div className="grid grid-cols-4 gap-2">
            {voices.map(v => (
              <button key={v.id} onClick={() => onUpdate({ selectedVoice: v.id })}
                className={`px-4 py-2.5 rounded-xl border-2 text-[0.82rem] font-medium transition-all ${data.selectedVoice === v.id ? "border-accent bg-accent/5 text-accent" : "border-foreground/[0.08] text-foreground hover:border-accent/30"}`}>
                {v.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepShell>
  );
}

function ReviewStep({ data, onBack, onComplete, onEdit }: { data: BrandFormData; onBack: () => void; onComplete: () => void; onEdit: (step: number) => void }) {
  const sections = [
    { title: "Identity", icon: Palette, color: "text-blue-600", step: 0, items: [
      { label: "Brand Name", value: data.brandName },
      { label: "Tagline", value: data.tagline || "—" },
      { label: "Colors", value: "", isColors: true, colors: [data.primaryColor, data.secondaryColor, data.accentColor] },
      { label: "Fonts", value: `${data.primaryFont} / ${data.secondaryFont}` },
    ]},
    { title: "Voice", icon: MessageSquare, color: "text-purple-600", step: 1, items: [
      { label: "Tone", value: data.toneOfVoice.join(", ") || "—" },
      { label: "Style", value: data.writingStyle || "—" },
      { label: "Personality", value: data.brandPersonality.join(", ") || "—" },
    ]},
    { title: "Audience", icon: Target, color: "text-amber-500", step: 2, items: [
      { label: "Age", value: data.targetAge || "—" },
      { label: "Interests", value: data.targetInterests.join(", ") || "—" },
    ]},
    { title: "Knowledge", icon: Database, color: "text-green-600", step: 3, items: [
      { label: "Sources", value: `${data.dataSources.length} added` },
    ]},
    { title: "Intelligence", icon: Brain, color: "text-yellow-500", step: 4, items: [
      { label: "Competitors", value: `${data.competitors.length} tracked` },
    ]},
    { title: "Characters", icon: Users, color: "text-indigo-600", step: 5, items: [
      { label: "Spokesperson", value: data.selectedCharacter || "—" },
      { label: "Voice", value: data.selectedVoice || "—" },
    ]},
  ];

  return (
    <StepShell title="Review" subtitle="Review your brand profile before completing" icon={ClipboardCheck} iconColor="bg-accent" onBack={onBack} onNext={onComplete} nextLabel="Complete Brand Setup">
      <div className="max-w-3xl space-y-3">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="rounded-xl border border-foreground/[0.08] p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center"><Icon size={16} className={s.color} /></div>
                  <h3 className="text-[0.88rem] font-bold">{s.title}</h3>
                </div>
                <button onClick={() => onEdit(s.step)} className="text-[0.75rem] text-accent font-medium hover:underline">Edit</button>
              </div>
              <div className="space-y-2 ml-[42px]">
                {s.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[0.75rem] text-muted min-w-[100px]">{item.label}:</span>
                    {(item as any).isColors ? (
                      <div className="flex gap-1.5">
                        {(item as any).colors.map((c: string, ci: number) => (
                          <div key={ci} className="w-6 h-6 rounded border border-foreground/[0.08]" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[0.78rem] font-medium text-foreground capitalize">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </StepShell>
  );
}

function CompletionStep() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
        <Check size={36} className="text-white" />
      </div>
      <h1 className="text-3xl font-black text-foreground mb-3">Brand Profile Complete!</h1>
      <p className="text-[0.92rem] text-muted max-w-md mb-8">
        Your brand profile is ready. Start creating content that matches your unique brand identity.
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
        <a href="/create" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-bold text-[0.85rem] hover:bg-accent/85 transition-colors no-underline">
          <Sparkles size={16} /> Create Content
        </a>
        <a href="/dashboard" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-foreground/[0.1] text-foreground font-semibold text-[0.85rem] hover:bg-foreground/[0.04] transition-colors no-underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function BrandPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<BrandFormData>(() => {
    try {
      const stored = localStorage.getItem("ra_brand_wizard");
      return stored ? JSON.parse(stored) : DEFAULT_DATA;
    } catch { return DEFAULT_DATA; }
  });

  const update = (u: Partial<BrandFormData>) => {
    setFormData(prev => {
      const next = { ...prev, ...u };
      try { localStorage.setItem("ra_brand_wizard", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleComplete = () => {
    setStep(7);
    try { localStorage.setItem("ra_brand_complete", "1"); } catch {}
  };

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <WizardProgress step={step} onStep={setStep} />
        {step === 0 && <IdentityStep data={formData} onUpdate={update} onNext={() => setStep(1)} />}
        {step === 1 && <VoiceStep data={formData} onUpdate={update} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
        {step === 2 && <AudienceStep data={formData} onUpdate={update} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <KnowledgeStep data={formData} onUpdate={update} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
        {step === 4 && <IntelligenceStep data={formData} onUpdate={update} onBack={() => setStep(3)} onNext={() => setStep(5)} />}
        {step === 5 && <CharactersStep data={formData} onUpdate={update} onBack={() => setStep(4)} onNext={() => setStep(6)} />}
        {step === 6 && <ReviewStep data={formData} onBack={() => setStep(5)} onComplete={handleComplete} onEdit={setStep} />}
        {step === 7 && <CompletionStep />}
      </div>
    </PageShell>
  );
}
