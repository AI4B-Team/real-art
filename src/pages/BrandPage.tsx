import { useState } from "react";
import {
  Palette, MessageSquare, Database, Brain, Users, ClipboardCheck,
  Check, X, Upload, AlertCircle, Briefcase, Smile, Hand, GraduationCap,
  PartyPopper, Heart, Zap, Sparkles, Plus, Globe, FileText, Type,
  ChevronRight, ArrowLeft, ArrowRight, Image as ImageIcon,
  Target, TrendingUp, Mic, BarChart3, Megaphone, UserPlus, ShoppingCart,
  Lightbulb, BookOpen, XCircle, SmilePlus,
} from "lucide-react";
import PageShell from "@/components/PageShell";

/* ─── Types ─── */

interface AudiencePersona {
  name: string;
  age: string;
  occupation: string;
  description: string;
}

interface ContentMix {
  educational: number;
  entertainment: number;
  promotional: number;
  behindScenes: number;
}

interface CompetitorBrand {
  id: string;
  name: string;
  website: string;
  socialHandle: string;
  platform: string;
  notes: string;
}

interface InspirationAccount {
  name: string;
  platform: string;
}

interface BrandFormData {
  // Identity
  brandName: string;
  tagline: string;
  industry: string;
  businessType: string;
  websiteUrl: string;
  brandArchetype: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  primaryFont: string;
  secondaryFont: string;
  // Voice
  toneOfVoice: string[];
  writingStyle: string;
  contentLength: string;
  emojiUsage: string;
  hashtagStrategy: string;
  brandPersonality: string[];
  communicationGuidelines: string;
  dosList: string[];
  dontsList: string[];
  voiceSample: string;
  // Audience
  audienceAgeRanges: string[];
  audienceGender: string[];
  audienceIncome: string;
  audienceLocation: string[];
  audienceValues: string[];
  audiencePainPoints: string[];
  audienceGoals: string[];
  audienceInterests: string[];
  audiencePersonas: AudiencePersona[];
  // Knowledge
  dataSources: { id: string; name: string; type: string; status: string }[];
  discoveryAnswers: string[];
  aiBrandSummary: string;
  // Strategy
  contentGoals: string[];
  contentPlatforms: string[];
  contentMix: ContentMix;
  postFrequency: string;
  contentPillars: string[];
  // Intelligence
  competitorBrands: CompetitorBrand[];
  trackingKeywords: string[];
  inspirationAccounts: InspirationAccount[];
  // Characters
  selectedCharacter: string;
  selectedVoice: string;
}

const STEPS = [
  { id: "identity", label: "Identity", icon: Palette },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "audience", label: "Audience", icon: Target },
  { id: "knowledge", label: "Knowledge", icon: Database },
  { id: "strategy", label: "Strategy", icon: BarChart3 },
  { id: "intelligence", label: "Intelligence", icon: TrendingUp },
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

const INDUSTRIES = [
  "Beauty & Personal Care", "Business & Finance", "Coaching & Consulting",
  "E-Commerce & Retail", "Education & Online Courses", "Entertainment & Media",
  "Fashion & Apparel", "Food & Beverage", "Health & Wellness", "Home & Real Estate",
  "Hospitality & Travel", "Legal & Professional Services", "Marketing & Advertising",
  "Non-Profit & Social Impact", "Parenting & Family", "Personal Development",
  "Photography & Videography", "Politics & Advocacy", "Real Estate Investing",
  "SaaS & Technology", "Sports & Fitness", "Sustainability & Environment", "Other",
];

const ARCHETYPES = [
  { id: "hero", name: "Hero", desc: "Courage. Transformation. Overcoming challenges." },
  { id: "creator", name: "Creator", desc: "Innovation. Imagination. Building something new." },
  { id: "sage", name: "Sage", desc: "Wisdom. Knowledge. Truth-seeking authority." },
  { id: "explorer", name: "Explorer", desc: "Freedom. Discovery. Authentic adventure." },
  { id: "rebel", name: "Rebel", desc: "Disruption. Revolution. Breaking the rules." },
  { id: "magician", name: "Magician", desc: "Transformation. Vision. Making dreams reality." },
  { id: "lover", name: "Lover", desc: "Passion. Connection. Deep relationships." },
  { id: "caregiver", name: "Caregiver", desc: "Nurturing. Protection. Service to others." },
  { id: "jester", name: "Jester", desc: "Fun. Playfulness. Joy in the moment." },
  { id: "everyman", name: "Everyman", desc: "Belonging. Authenticity. Down-to-earth trust." },
  { id: "ruler", name: "Ruler", desc: "Control. Leadership. Prestige and order." },
  { id: "innocent", name: "Innocent", desc: "Optimism. Simplicity. Pure goodness." },
];

const DISCOVERY_QUESTIONS = [
  { q: "What problem does your business solve?", placeholder: "We help [who] solve [problem] so they can [outcome]..." },
  { q: "Who is your ideal customer?", placeholder: "Small business owners, ages 30-50, looking to..." },
  { q: "What makes you different from competitors?", placeholder: "Unlike others who..., we..." },
  { q: "What are your main products or services?", placeholder: "AI content creation, coaching programs, digital courses..." },
  { q: "What values does your brand stand for?", placeholder: "Authenticity, innovation, radical transparency..." },
  { q: "What transformation do you create for customers?", placeholder: "From spending 10 hours on content to having it done in 10 minutes..." },
  { q: "What industry or niche do you operate in?", placeholder: "SaaS, Digital Marketing, Health & Wellness..." },
  { q: "What is your origin story? Why did you start this business?", placeholder: "I started this because I was frustrated with..." },
  { q: "What does your dream customer say after working with you?", placeholder: "They tell their friends: This completely changed how I..." },
  { q: "What content do you want to be known for?", placeholder: "I want to be the go-to voice for..." },
  { q: "Who are your top 2-3 competitors or inspirations?", placeholder: "I admire [Brand X] because..., but I differ in..." },
  { q: "What is your big promise or guarantee to your customers?", placeholder: "We guarantee you will [result] within [timeframe] or..." },
];

const AUDIENCE_VALUES = ["Family", "Freedom", "Success", "Health", "Creativity", "Community", "Spirituality", "Status", "Adventure", "Security", "Sustainability", "Learning"];
const AUDIENCE_PAIN_POINTS = ["Lack of Time", "Lack of Money", "Information Overload", "Fear of Failure", "Inconsistency", "No Clear Strategy", "Too Much Competition", "Imposter Syndrome", "Burnout", "Technical Barriers", "Can't Get Results", "No Audience Yet"];
const AUDIENCE_GOALS = ["Financial Freedom", "Grow an Audience", "Build a Business", "Career Change", "More Free Time", "Recognition in Industry", "Launch a Product", "Scale Revenue", "Create Passive Income", "Help Others", "Live Intentionally", "Be Debt Free"];
const AUDIENCE_INTERESTS = ["Entrepreneurship", "Personal Finance", "Health & Fitness", "Travel", "Technology", "Parenting", "Fashion", "Food", "Real Estate", "Self-Improvement", "Faith", "Sports"];

const GOAL_OPTIONS = [
  { id: "awareness", label: "Brand Awareness", icon: Megaphone, desc: "Get more people to discover your brand" },
  { id: "leads", label: "Lead Generation", icon: UserPlus, desc: "Capture emails and qualified prospects" },
  { id: "sales", label: "Sales & Revenue", icon: ShoppingCart, desc: "Convert followers into paying customers" },
  { id: "thought", label: "Thought Leadership", icon: Lightbulb, desc: "Establish authority in your niche" },
  { id: "community", label: "Community Building", icon: Users, desc: "Build a loyal tribe around your brand" },
  { id: "education", label: "Product Education", icon: BookOpen, desc: "Teach customers how to use your product" },
];

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Twitter/X", "Facebook", "Pinterest", "Blog", "Email", "Podcast"];

const CHARACTERS = [
  { id: "char1", name: "John", initials: "JH", gradient: "from-blue-500 to-green-500", desc: "Innovative thinker", gender: "Male", ethnicity: "Caucasian", age: "30-40" },
  { id: "char2", name: "Maya", initials: "MY", gradient: "from-violet-500 to-pink-500", desc: "Tech-savvy innovator", gender: "Female", ethnicity: "Asian", age: "25-35" },
  { id: "char3", name: "Jordan", initials: "JD", gradient: "from-amber-500 to-orange-500", desc: "Creative storyteller", gender: "Non-binary", ethnicity: "African American", age: "28-38" },
  { id: "char4", name: "Sofia", initials: "SF", gradient: "from-rose-500 to-pink-500", desc: "Educational authority", gender: "Female", ethnicity: "Hispanic", age: "35-45" },
  { id: "char5", name: "Marcus", initials: "MC", gradient: "from-green-500 to-teal-500", desc: "Dynamic motivator", gender: "Male", ethnicity: "African American", age: "30-40" },
  { id: "char6", name: "Elena", initials: "EL", gradient: "from-cyan-500 to-blue-500", desc: "Healthcare professional", gender: "Female", ethnicity: "Middle Eastern", age: "32-42" },
];

const VOICES = [
  { id: "aria", name: "Aria" }, { id: "roger", name: "Roger" }, { id: "sarah", name: "Sarah" },
  { id: "laura", name: "Laura" }, { id: "charlie", name: "Charlie" }, { id: "george", name: "George" },
  { id: "liam", name: "Liam" }, { id: "charlotte", name: "Charlotte" },
];

const DEFAULT_DATA: BrandFormData = {
  brandName: "", tagline: "", industry: "", businessType: "", websiteUrl: "", brandArchetype: "",
  logo: null, primaryColor: "#E8472A", secondaryColor: "#1A1A1A", accentColor: "#10B981", backgroundColor: "#FFFFFF",
  primaryFont: "DM Sans", secondaryFont: "DM Sans",
  toneOfVoice: [], writingStyle: "", contentLength: "", emojiUsage: "", hashtagStrategy: "",
  brandPersonality: [], communicationGuidelines: "", dosList: [], dontsList: [], voiceSample: "",
  audienceAgeRanges: [], audienceGender: [], audienceIncome: "", audienceLocation: [],
  audienceValues: [], audiencePainPoints: [], audienceGoals: [], audienceInterests: [], audiencePersonas: [],
  dataSources: [], discoveryAnswers: Array(12).fill(""), aiBrandSummary: "",
  contentGoals: [], contentPlatforms: [], contentMix: { educational: 40, entertainment: 20, promotional: 25, behindScenes: 15 },
  postFrequency: "", contentPillars: [],
  competitorBrands: [], trackingKeywords: [], inspirationAccounts: [],
  selectedCharacter: "", selectedVoice: "",
};

/* ─── Progress Bar ─── */

function WizardProgress({ step, onStep }: { step: number; onStep: (i: number) => void }) {
  if (step >= 8) return null;
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
              <span className={`text-[0.6rem] font-semibold hidden sm:block ${current ? "text-accent" : done ? "text-green-600" : "text-muted"}`}>
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

/* ─── Step Shell ─── */

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

/* ─── Pill Select Helper ─── */

function PillSelect({ options, value, onChange, color = "bg-accent" }: { options: string[]; value: string; onChange: (v: string) => void; color?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-4 py-2 rounded-lg text-[0.82rem] font-medium transition-all ${value === o ? `${color} text-white` : "bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function MultiPillSelect({ options, value, onChange, color = "bg-accent", max }: { options: string[]; value: string[]; onChange: (v: string[]) => void; color?: string; max?: number }) {
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter(v => v !== o));
    else if (!max || value.length < max) onChange([...value, o]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} onClick={() => toggle(o)}
          className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-all ${value.includes(o) ? `${color} text-white` : "bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 1 — IDENTITY
   ═══════════════════════════════════════════════════ */

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
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">BRAND NAME <span className="text-accent">*</span></label>
            <input value={data.brandName} onChange={e => onUpdate({ brandName: e.target.value })} placeholder="Enter your brand name"
              className="w-full px-4 py-3 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.88rem] outline-none focus:border-accent transition-colors" />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">TAGLINE</label>
            <input value={data.tagline} onChange={e => onUpdate({ tagline: e.target.value })} placeholder="Your brand in one powerful line..."
              className="w-full px-4 py-3 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.88rem] outline-none focus:border-accent transition-colors" />
            <button className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-medium text-accent hover:text-accent/80 transition-colors">
              <Sparkles size={14} /> AI Generate Tagline
            </button>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">INDUSTRY / NICHE</label>
            <select value={data.industry} onChange={e => onUpdate({ industry: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent">
              <option value="">Select industry...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">BUSINESS TYPE</label>
            <PillSelect options={["B2B", "B2C", "Both", "Non-Profit"]} value={data.businessType} onChange={v => onUpdate({ businessType: v })} color="bg-blue-600" />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">WEBSITE URL (Optional)</label>
            <input value={data.websiteUrl} onChange={e => onUpdate({ websiteUrl: e.target.value })} placeholder="https://yourbrand.com"
              className="w-full px-4 py-3 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.88rem] outline-none focus:border-accent transition-colors" />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">BRAND LOGO</label>
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
                  <p className="text-[0.82rem] font-medium text-foreground/70">Drop your logo here or click to upload</p>
                  <p className="text-[0.7rem] text-muted/60">PNG, JPG, SVG (Max 5MB)</p>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Brand Archetype */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-1">BRAND ARCHETYPE</label>
            <p className="text-[0.72rem] text-muted mb-3">Choose the archetype that best represents your brand's personality</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ARCHETYPES.map(a => (
                <button key={a.id} onClick={() => onUpdate({ brandArchetype: a.id })}
                  className={`text-left px-3 py-3 rounded-xl border-2 transition-all ${data.brandArchetype === a.id ? "border-blue-600 bg-blue-600/5" : "border-foreground/[0.08] hover:border-blue-600/30"}`}>
                  <p className="text-[0.78rem] font-semibold text-foreground">{a.name}</p>
                  <p className="text-[0.65rem] text-muted leading-tight mt-0.5">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">BRAND COLORS</label>
            <div className="grid grid-cols-2 gap-3">
              {([["primaryColor", "Primary"], ["secondaryColor", "Secondary"], ["accentColor", "Accent"], ["backgroundColor", "Background"]] as const).map(([key, label]) => (
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
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">TYPOGRAPHY</label>
            <div className="grid grid-cols-2 gap-3">
              {([["primaryFont", "Heading Font"], ["secondaryFont", "Body Font"]] as const).map(([key, label]) => (
                <div key={key}>
                  <span className="text-[0.72rem] text-muted mb-1 block">{label}</span>
                  <select value={data[key]} onChange={e => onUpdate({ [key]: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="mt-1.5 text-[0.75rem] text-muted" style={{ fontFamily: data[key] }}>The quick brown fox jumps over the lazy dog</p>
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
                {data.tagline && <p className="text-[0.78rem] text-muted mt-1 italic" style={{ fontFamily: data.secondaryFont }}>{data.tagline}</p>}
                {data.industry && <p className="text-[0.65rem] text-muted/60 mt-1">{data.industry}</p>}
              </div>
              <div className="border-t border-foreground/[0.06] pt-4">
                <p className="text-[0.78rem] text-muted" style={{ fontFamily: data.secondaryFont }}>
                  This is how your brand will appear across all content and campaigns.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                {[data.primaryColor, data.secondaryColor, data.accentColor, data.backgroundColor].map((c, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg border border-foreground/[0.08]" style={{ backgroundColor: c }} />
                ))}
              </div>
              {data.brandArchetype && (
                <div className="text-center pt-1">
                  <span className="px-2.5 py-1 bg-blue-600/10 text-blue-700 rounded-lg text-[0.7rem] font-medium capitalize">{data.brandArchetype}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StepShell>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 2 — VOICE
   ═══════════════════════════════════════════════════ */

function VoiceStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const [customDo, setCustomDo] = useState("");
  const [customDont, setCustomDont] = useState("");

  const toggleTone = (v: string) => onUpdate({ toneOfVoice: data.toneOfVoice.includes(v) ? data.toneOfVoice.filter(t => t !== v) : [...data.toneOfVoice, v] });
  const toggleTrait = (v: string) => onUpdate({ brandPersonality: data.brandPersonality.includes(v) ? data.brandPersonality.filter(t => t !== v) : [...data.brandPersonality, v] });

  return (
    <StepShell title="Brand Voice" subtitle="Define how your brand communicates" icon={Mic} iconColor="bg-purple-600" onBack={onBack} onNext={onNext} nextDisabled={data.toneOfVoice.length === 0}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Tone */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">TONE OF VOICE <span className="text-accent">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map(t => {
                const sel = data.toneOfVoice.includes(t.value);
                return (
                  <button key={t.value} onClick={() => toggleTone(t.value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-left ${sel ? "border-purple-600 bg-purple-600/5" : "border-foreground/[0.08] hover:border-purple-600/30"}`}>
                    <t.icon size={18} className={sel ? "text-purple-600" : "text-muted"} />
                    <span className="text-[0.82rem] font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Writing Style */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">WRITING STYLE</label>
            <div className="space-y-2">
              {WRITING_STYLES.map(s => (
                <button key={s.value} onClick={() => onUpdate({ writingStyle: s.value })}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${data.writingStyle === s.value ? "border-purple-600 bg-purple-600/5" : "border-foreground/[0.08] hover:border-purple-600/30"}`}>
                  <span className="text-[0.82rem] font-medium text-foreground">{s.label}</span>
                  <span className="text-[0.72rem] text-muted block">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">BRAND PERSONALITY <span className="text-[0.72rem] text-muted font-normal">(pick 3-5)</span></label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TRAITS.map(t => (
                <button key={t} onClick={() => toggleTrait(t)}
                  className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-all ${data.brandPersonality.includes(t) ? "bg-purple-600 text-white" : "bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Content Length */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">CONTENT LENGTH PREFERENCE</label>
            <PillSelect options={["Punchy & Concise", "Balanced", "In-Depth & Thorough"]} value={data.contentLength} onChange={v => onUpdate({ contentLength: v })} color="bg-purple-600" />
          </div>

          {/* Emoji Usage */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">EMOJI USAGE</label>
            <div className="flex gap-2">
              {[{ label: "Never", icon: XCircle }, { label: "Occasionally", icon: Smile }, { label: "Frequently", icon: SmilePlus }].map(o => (
                <button key={o.label} onClick={() => onUpdate({ emojiUsage: o.label })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[0.82rem] font-medium transition-all ${data.emojiUsage === o.label ? "bg-purple-600 text-white" : "bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]"}`}>
                  <o.icon size={16} /> {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hashtag Strategy */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">HASHTAG STRATEGY</label>
            <PillSelect options={["No Hashtags", "Minimal (1-3)", "Full Strategy (5-15)"]} value={data.hashtagStrategy} onChange={v => onUpdate({ hashtagStrategy: v })} color="bg-purple-600" />
          </div>

          {/* Guidelines */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">COMMUNICATION GUIDELINES</label>
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

          {/* AI Voice Sample */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-1 flex items-center gap-2"><Sparkles size={14} className="text-purple-600" /> AI VOICE SAMPLE</label>
            <p className="text-[0.72rem] text-muted mb-3">Generate a sample paragraph written in your exact brand voice</p>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-[0.82rem] font-semibold hover:bg-purple-700 transition-colors">
              <Sparkles size={14} /> Generate Voice Sample
            </button>
            {data.voiceSample && (
              <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-4 text-[0.82rem] text-foreground/80 italic">
                {data.voiceSample}
              </div>
            )}
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
              {data.contentLength && (
                <div className="border-t border-foreground/[0.06] pt-3">
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Content Length</p>
                  <span className="px-2.5 py-1 bg-purple-500/10 text-purple-700 rounded-lg text-[0.72rem] font-medium">{data.contentLength}</span>
                </div>
              )}
              {data.emojiUsage && (
                <div className="border-t border-foreground/[0.06] pt-3">
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Emoji Policy</p>
                  <span className="px-2.5 py-1 bg-foreground/[0.06] text-foreground/70 rounded-lg text-[0.72rem]">{data.emojiUsage}</span>
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

/* ═══════════════════════════════════════════════════
   STEP 3 — TARGET AUDIENCE (NEW)
   ═══════════════════════════════════════════════════ */

function AudienceStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const [newPersona, setNewPersona] = useState<AudiencePersona | null>(null);

  const addPersona = () => {
    if (!newPersona?.name) return;
    onUpdate({ audiencePersonas: [...data.audiencePersonas, newPersona] });
    setNewPersona(null);
  };

  return (
    <StepShell title="Target Audience" subtitle="Define who your brand speaks to" icon={Target} iconColor="bg-rose-500" onBack={onBack} onNext={onNext}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Demographics */}
          <div>
            <h3 className="text-[0.88rem] font-bold text-foreground mb-4">WHO IS YOUR IDEAL CUSTOMER?</h3>

            <label className="block text-[0.78rem] font-semibold text-foreground mb-2">Age Range</label>
            <MultiPillSelect options={["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"]} value={data.audienceAgeRanges} onChange={v => onUpdate({ audienceAgeRanges: v })} color="bg-rose-500" />

            <label className="block text-[0.78rem] font-semibold text-foreground mb-2 mt-4">Gender</label>
            <MultiPillSelect options={["Men", "Women", "Non-binary", "All Genders"]} value={data.audienceGender} onChange={v => onUpdate({ audienceGender: v })} color="bg-rose-500" />

            <label className="block text-[0.78rem] font-semibold text-foreground mb-2 mt-4">Income Level</label>
            <PillSelect options={["Under $30K", "$30K-$60K", "$60K-$100K", "$100K-$200K", "$200K+"]} value={data.audienceIncome} onChange={v => onUpdate({ audienceIncome: v })} color="bg-rose-500" />

            <label className="block text-[0.78rem] font-semibold text-foreground mb-2 mt-4">Location</label>
            <MultiPillSelect options={["Urban", "Suburban", "Rural", "Global"]} value={data.audienceLocation} onChange={v => onUpdate({ audienceLocation: v })} color="bg-rose-500" />
          </div>

          {/* Psychographics */}
          <div>
            <h3 className="text-[0.88rem] font-bold text-foreground mb-4">WHAT DO THEY CARE ABOUT?</h3>

            <label className="block text-[0.78rem] font-semibold text-foreground mb-2">Core Values <span className="text-muted font-normal">(up to 6)</span></label>
            <MultiPillSelect options={AUDIENCE_VALUES} value={data.audienceValues} onChange={v => onUpdate({ audienceValues: v })} color="bg-rose-500" max={6} />

            <label className="block text-[0.78rem] font-semibold text-foreground mb-2 mt-4">Biggest Pain Points <span className="text-muted font-normal">(up to 5)</span></label>
            <MultiPillSelect options={AUDIENCE_PAIN_POINTS} value={data.audiencePainPoints} onChange={v => onUpdate({ audiencePainPoints: v })} color="bg-rose-500" max={5} />

            <label className="block text-[0.78rem] font-semibold text-foreground mb-2 mt-4">Goals & Aspirations <span className="text-muted font-normal">(up to 5)</span></label>
            <MultiPillSelect options={AUDIENCE_GOALS} value={data.audienceGoals} onChange={v => onUpdate({ audienceGoals: v })} color="bg-rose-500" max={5} />

            <label className="block text-[0.78rem] font-semibold text-foreground mb-2 mt-4">Interests <span className="text-muted font-normal">(up to 8)</span></label>
            <MultiPillSelect options={AUDIENCE_INTERESTS} value={data.audienceInterests} onChange={v => onUpdate({ audienceInterests: v })} color="bg-rose-500" max={8} />
          </div>

          {/* Personas */}
          <div>
            <h3 className="text-[0.88rem] font-bold text-foreground mb-1">BUILD YOUR AUDIENCE PERSONAS</h3>
            <p className="text-[0.72rem] text-muted mb-3">Give your ideal customers a face and a name (up to 3)</p>

            {data.audiencePersonas.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] mb-2">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold text-[0.82rem] flex-shrink-0">
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.82rem] font-semibold">{p.name}, {p.age}</p>
                  <p className="text-[0.72rem] text-muted">{p.occupation}</p>
                  <p className="text-[0.72rem] text-muted/70 mt-1">{p.description}</p>
                </div>
                <button onClick={() => onUpdate({ audiencePersonas: data.audiencePersonas.filter((_, idx) => idx !== i) })} className="text-muted hover:text-foreground"><X size={14} /></button>
              </div>
            ))}

            {data.audiencePersonas.length < 3 && !newPersona && (
              <button onClick={() => setNewPersona({ name: "", age: "", occupation: "", description: "" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-foreground/[0.12] text-[0.82rem] font-medium text-muted hover:border-accent/30 hover:text-foreground transition-all w-full justify-center">
                <Plus size={16} /> Add Persona
              </button>
            )}

            {newPersona && (
              <div className="p-4 rounded-xl border border-foreground/[0.1] bg-foreground/[0.02] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={newPersona.name} onChange={e => setNewPersona({ ...newPersona, name: e.target.value })} placeholder="Persona Name"
                    className="px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
                  <input value={newPersona.age} onChange={e => setNewPersona({ ...newPersona, age: e.target.value })} placeholder="Age"
                    className="px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
                </div>
                <input value={newPersona.occupation} onChange={e => setNewPersona({ ...newPersona, occupation: e.target.value })} placeholder="Occupation"
                  className="w-full px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
                <textarea value={newPersona.description} onChange={e => setNewPersona({ ...newPersona, description: e.target.value })} placeholder="Description" rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent resize-none" />
                <div className="flex gap-2">
                  <button onClick={addPersona} disabled={!newPersona.name.trim()} className="px-4 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-semibold disabled:opacity-40">Save</button>
                  <button onClick={() => setNewPersona(null)} className="px-4 py-2 rounded-lg text-[0.82rem] text-muted hover:text-foreground">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audience Snapshot */}
        <div className="lg:sticky lg:top-0 self-start">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6">
            <h3 className="text-[0.82rem] font-bold text-foreground mb-4 flex items-center gap-2"><Target size={14} className="text-rose-500" /> Audience Snapshot</h3>
            <div className="bg-background rounded-lg border border-foreground/[0.06] p-5 space-y-3">
              {data.audienceAgeRanges.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Age Ranges</p>
                  <div className="flex flex-wrap gap-1">{data.audienceAgeRanges.map(a => <span key={a} className="px-2 py-0.5 bg-rose-500/10 text-rose-700 rounded text-[0.7rem]">{a}</span>)}</div>
                </div>
              )}
              {data.audienceGender.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Gender</p>
                  <p className="text-[0.78rem] text-foreground">{data.audienceGender.join(", ")}</p>
                </div>
              )}
              {data.audienceValues.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Values</p>
                  <div className="flex flex-wrap gap-1">{data.audienceValues.map(v => <span key={v} className="px-2 py-0.5 bg-foreground/[0.06] text-foreground/70 rounded text-[0.7rem]">{v}</span>)}</div>
                </div>
              )}
              {data.audiencePersonas.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Personas</p>
                  {data.audiencePersonas.map((p, i) => <p key={i} className="text-[0.78rem] text-foreground">{p.name} — {p.occupation}</p>)}
                </div>
              )}
              {data.audienceAgeRanges.length === 0 && data.audienceGender.length === 0 && data.audiencePersonas.length === 0 && (
                <div className="text-center py-4">
                  <Target size={24} className="mx-auto text-muted mb-2" />
                  <p className="text-[0.78rem] text-muted">No required fields — this step is optional but encouraged.</p>
                  <p className="text-[0.7rem] text-muted/60 mt-1">Skipping this step? Your AI content may be less targeted.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StepShell>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 4 — KNOWLEDGE BASE
   ═══════════════════════════════════════════════════ */

function KnowledgeStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [sourceType, setSourceType] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [showDiscovery, setShowDiscovery] = useState(false);

  const addSource = () => {
    if (!sourceName.trim()) return;
    const src = { id: crypto.randomUUID(), name: sourceName, type: sourceType || "text", status: "trained" };
    onUpdate({ dataSources: [...data.dataSources, src] });
    setSourceName(""); setSourceContent(""); setSourceType(null); setShowAdd(false);
  };

  const updateAnswer = (i: number, val: string) => {
    const answers = [...data.discoveryAnswers];
    answers[i] = val;
    onUpdate({ discoveryAnswers: answers });
  };

  const sourceTypes = [
    { type: "website", icon: Globe, label: "Website", desc: "Crawl content from URLs", color: "text-green-600 bg-green-50" },
    { type: "file", icon: FileText, label: "Files", desc: "Upload documents or PDFs", color: "text-purple-600 bg-purple-50" },
    { type: "text", icon: Type, label: "Text", desc: "Add custom information", color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <StepShell title="Knowledge Base" subtitle="Add data sources to train your AI" icon={Database} iconColor="bg-green-600" onBack={onBack} onNext={onNext}>
      <div className="max-w-3xl space-y-6">
        {/* Discovery Questionnaire */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[0.88rem] font-bold text-foreground">Brand Discovery Questionnaire</h3>
              <p className="text-[0.72rem] text-muted">Answer these 12 questions to help AI understand your brand</p>
            </div>
            <button onClick={() => setShowDiscovery(!showDiscovery)} className="text-[0.78rem] font-medium text-accent hover:text-accent/80">
              {showDiscovery ? "Hide" : "Show"} Questions
            </button>
          </div>

          {showDiscovery && (
            <div className="space-y-4 mb-6">
              {DISCOVERY_QUESTIONS.map((dq, i) => (
                <div key={i}>
                  <label className="block text-[0.78rem] font-semibold text-foreground mb-1">Q{i + 1}: {dq.q}</label>
                  <textarea value={data.discoveryAnswers[i] || ""} onChange={e => updateAnswer(i, e.target.value)} rows={2}
                    placeholder={dq.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent resize-none" />
                </div>
              ))}

              {data.discoveryAnswers.some(a => a.trim()) && (
                <div>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-[0.82rem] font-semibold hover:bg-green-700 transition-colors">
                    <Sparkles size={14} /> Generate My Brand Summary
                  </button>
                  {data.aiBrandSummary && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 text-[0.82rem] text-foreground/80">
                      {data.aiBrandSummary}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data Sources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.82rem] font-semibold text-foreground">Data Sources</p>
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
            <div className="text-center py-10 rounded-xl border-2 border-dashed border-foreground/[0.1]">
              <Database size={28} className="mx-auto text-muted mb-2" />
              <p className="text-[0.82rem] font-medium text-foreground mb-1">No Data Sources Yet</p>
              <p className="text-[0.72rem] text-muted">Add data sources to build your knowledge base</p>
            </div>
          )}
        </div>

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

/* ═══════════════════════════════════════════════════
   STEP 5 — CONTENT STRATEGY (NEW)
   ═══════════════════════════════════════════════════ */

function StrategyStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const [pillarInput, setPillarInput] = useState("");

  const toggleGoal = (id: string) => {
    const goals = data.contentGoals.includes(id) ? data.contentGoals.filter(g => g !== id) : data.contentGoals.length < 3 ? [...data.contentGoals, id] : data.contentGoals;
    onUpdate({ contentGoals: goals });
  };

  const togglePlatform = (p: string) => {
    onUpdate({ contentPlatforms: data.contentPlatforms.includes(p) ? data.contentPlatforms.filter(x => x !== p) : [...data.contentPlatforms, p] });
  };

  const updateMix = (key: keyof ContentMix, val: number) => {
    onUpdate({ contentMix: { ...data.contentMix, [key]: val } });
  };

  const mixTotal = data.contentMix.educational + data.contentMix.entertainment + data.contentMix.promotional + data.contentMix.behindScenes;

  const addPillar = () => {
    if (!pillarInput.trim() || data.contentPillars.length >= 5) return;
    onUpdate({ contentPillars: [...data.contentPillars, pillarInput.trim()] });
    setPillarInput("");
  };

  return (
    <StepShell title="Content Strategy" subtitle="Plan your content approach" icon={BarChart3} iconColor="bg-orange-500" onBack={onBack} onNext={onNext} nextDisabled={data.contentGoals.length === 0 || data.contentPillars.length < 3}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Goals */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-3">PRIMARY GOALS <span className="text-accent">*</span> <span className="text-muted font-normal">(select 1-3)</span></label>
            <div className="grid grid-cols-2 gap-3">
              {GOAL_OPTIONS.map(g => {
                const sel = data.contentGoals.includes(g.id);
                return (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${sel ? "border-orange-500 bg-orange-500/5" : "border-foreground/[0.08] hover:border-orange-500/30"}`}>
                    <g.icon size={20} className={sel ? "text-orange-500" : "text-muted"} />
                    <div>
                      <p className="text-[0.78rem] font-semibold text-foreground">{g.label}</p>
                      <p className="text-[0.65rem] text-muted leading-tight mt-0.5">{g.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">PUBLISHING PLATFORMS</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => togglePlatform(p)}
                  className={`px-4 py-2 rounded-lg text-[0.82rem] font-medium transition-all ${data.contentPlatforms.includes(p) ? "bg-orange-500 text-white" : "bg-foreground/[0.06] text-foreground/70 hover:bg-foreground/[0.1]"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Content Mix */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-1">CONTENT MIX</label>
            <p className="text-[0.72rem] text-muted mb-3">How will you split your content? (must total 100%)</p>
            {([
              ["educational", "Educational / Value"] as const,
              ["entertainment", "Entertainment"] as const,
              ["promotional", "Promotional"] as const,
              ["behindScenes", "Behind the Scenes"] as const,
            ]).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3 mb-2">
                <span className="text-[0.75rem] text-foreground/70 w-36">{label}</span>
                <input type="range" min={0} max={100} step={5} value={data.contentMix[key]}
                  onChange={e => updateMix(key, Number(e.target.value))}
                  className="flex-1 accent-orange-500" />
                <span className="text-[0.78rem] font-semibold text-foreground w-10 text-right">{data.contentMix[key]}%</span>
              </div>
            ))}
            <p className={`text-[0.72rem] font-medium mt-1 ${mixTotal === 100 ? "text-green-600" : "text-red-500"}`}>
              {mixTotal === 100 ? "✓ Total: 100%" : `⚠ Adjust your mix to equal 100% (currently ${mixTotal}%)`}
            </p>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-2">HOW OFTEN WILL YOU POST?</label>
            <PillSelect options={["Daily", "5x/week", "3x/week", "Weekly", "2x/month", "Monthly"]} value={data.postFrequency} onChange={v => onUpdate({ postFrequency: v })} color="bg-orange-500" />
          </div>

          {/* Content Pillars */}
          <div>
            <label className="block text-[0.82rem] font-semibold text-foreground mb-1">CONTENT PILLARS <span className="text-accent">*</span></label>
            <p className="text-[0.72rem] text-muted mb-3">Define 3-5 core topics your content will revolve around</p>
            <div className="flex gap-2 mb-2">
              <input value={pillarInput} onChange={e => setPillarInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addPillar()}
                placeholder="e.g. Business Tips, Mindset, Client Results..."
                className="flex-1 px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
              <button onClick={addPillar} disabled={!pillarInput.trim() || data.contentPillars.length >= 5}
                className="px-4 py-2.5 rounded-lg bg-accent text-white text-[0.82rem] font-bold disabled:opacity-40">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.contentPillars.map((p, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-700 rounded-lg text-[0.78rem] font-medium">
                  {p}
                  <button onClick={() => onUpdate({ contentPillars: data.contentPillars.filter((_, idx) => idx !== i) })} className="text-orange-500/50 hover:text-orange-700"><X size={12} /></button>
                </span>
              ))}
            </div>
            <p className="text-[0.7rem] text-muted mt-1">{data.contentPillars.length} of 5 pillars defined</p>
          </div>
        </div>

        {/* Strategy Snapshot */}
        <div className="lg:sticky lg:top-0 self-start">
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6">
            <h3 className="text-[0.82rem] font-bold text-foreground mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-orange-500" /> Your Content Strategy</h3>
            <div className="bg-background rounded-lg border border-foreground/[0.06] p-5 space-y-3">
              {data.contentGoals.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Goals</p>
                  <div className="flex flex-wrap gap-1">{data.contentGoals.map(g => <span key={g} className="px-2 py-0.5 bg-orange-500/10 text-orange-700 rounded text-[0.7rem] capitalize">{g}</span>)}</div>
                </div>
              )}
              {data.contentPlatforms.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Platforms</p>
                  <div className="flex flex-wrap gap-1">{data.contentPlatforms.map(p => <span key={p} className="px-2 py-0.5 bg-foreground/[0.06] text-foreground/70 rounded text-[0.7rem]">{p}</span>)}</div>
                </div>
              )}
              {data.postFrequency && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Frequency</p>
                  <span className="px-2 py-0.5 bg-orange-500/10 text-orange-700 rounded text-[0.7rem]">{data.postFrequency}</span>
                </div>
              )}
              {data.contentPillars.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Pillars</p>
                  <ul className="space-y-0.5">{data.contentPillars.map((p, i) => <li key={i} className="text-[0.78rem] text-foreground">• {p}</li>)}</ul>
                </div>
              )}
              {/* Mini content mix bar */}
              <div>
                <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1">Content Mix</p>
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-500" style={{ width: `${data.contentMix.educational}%` }} />
                  <div className="bg-pink-500" style={{ width: `${data.contentMix.entertainment}%` }} />
                  <div className="bg-green-500" style={{ width: `${data.contentMix.promotional}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${data.contentMix.behindScenes}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[0.6rem] text-muted">
                  <span>Edu {data.contentMix.educational}%</span>
                  <span>Ent {data.contentMix.entertainment}%</span>
                  <span>Promo {data.contentMix.promotional}%</span>
                  <span>BTS {data.contentMix.behindScenes}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepShell>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 6 — COMPETITIVE INTELLIGENCE
   ═══════════════════════════════════════════════════ */

function IntelligenceStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const [showCompForm, setShowCompForm] = useState(false);
  const [compForm, setCompForm] = useState<Omit<CompetitorBrand, "id">>({ name: "", website: "", socialHandle: "", platform: "", notes: "" });
  const [kwInput, setKwInput] = useState("");
  const [inspName, setInspName] = useState("");
  const [inspPlatform, setInspPlatform] = useState("Instagram");

  const addCompetitor = () => {
    if (!compForm.name.trim()) return;
    onUpdate({ competitorBrands: [...data.competitorBrands, { ...compForm, id: crypto.randomUUID() }] });
    setCompForm({ name: "", website: "", socialHandle: "", platform: "", notes: "" });
    setShowCompForm(false);
  };

  const addKeyword = () => {
    if (!kwInput.trim() || data.trackingKeywords.length >= 20) return;
    onUpdate({ trackingKeywords: [...data.trackingKeywords, kwInput.trim()] });
    setKwInput("");
  };

  const addInspiration = () => {
    if (!inspName.trim() || data.inspirationAccounts.length >= 10) return;
    onUpdate({ inspirationAccounts: [...data.inspirationAccounts, { name: inspName.trim(), platform: inspPlatform }] });
    setInspName("");
  };

  return (
    <StepShell title="Competitive Intelligence" subtitle="Track competitors and industry landscape" icon={TrendingUp} iconColor="bg-yellow-500" onBack={onBack} onNext={onNext}>
      <div className="max-w-3xl space-y-8">
        {/* Competitors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[0.88rem] font-bold text-foreground">WHO ARE YOUR MAIN COMPETITORS?</h3>
              <p className="text-[0.72rem] text-muted">Add up to 5 brands you compete with or want to study</p>
            </div>
            {data.competitorBrands.length < 5 && !showCompForm && (
              <button onClick={() => setShowCompForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-semibold">
                <Plus size={16} /> Add Competitor
              </button>
            )}
          </div>

          {showCompForm && (
            <div className="p-4 rounded-xl border border-foreground/[0.1] bg-foreground/[0.02] space-y-3 mb-3">
              <input value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })} placeholder="Competitor Name *"
                className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
              <div className="grid grid-cols-2 gap-2">
                <input value={compForm.website} onChange={e => setCompForm({ ...compForm, website: e.target.value })} placeholder="Website URL"
                  className="px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
                <input value={compForm.socialHandle} onChange={e => setCompForm({ ...compForm, socialHandle: e.target.value })} placeholder="@handle"
                  className="px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
              </div>
              <select value={compForm.platform} onChange={e => setCompForm({ ...compForm, platform: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent">
                <option value="">Primary Platform</option>
                {["Instagram", "TikTok", "YouTube", "LinkedIn", "Other"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <textarea value={compForm.notes} onChange={e => setCompForm({ ...compForm, notes: e.target.value })} rows={2} placeholder="What can we learn from them?"
                className="w-full px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent resize-none" />
              <div className="flex gap-2">
                <button onClick={addCompetitor} disabled={!compForm.name.trim()} className="px-4 py-2 rounded-lg bg-accent text-white text-[0.82rem] font-semibold disabled:opacity-40">Save</button>
                <button onClick={() => setShowCompForm(false)} className="px-4 py-2 rounded-lg text-[0.82rem] text-muted hover:text-foreground">Cancel</button>
              </div>
            </div>
          )}

          {data.competitorBrands.length > 0 ? (
            <div className="space-y-2">
              {data.competitorBrands.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
                  <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600 font-bold text-[0.78rem]">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-semibold">{c.name}</p>
                    <p className="text-[0.7rem] text-muted truncate">{[c.platform, c.socialHandle].filter(Boolean).join(" · ") || "No details"}</p>
                  </div>
                  <button onClick={() => onUpdate({ competitorBrands: data.competitorBrands.filter(x => x.id !== c.id) })} className="text-muted hover:text-foreground"><X size={14} /></button>
                </div>
              ))}
            </div>
          ) : !showCompForm && (
            <div className="text-center py-8 rounded-xl border-2 border-dashed border-foreground/[0.1]">
              <TrendingUp size={24} className="mx-auto text-muted mb-2" />
              <p className="text-[0.82rem] text-muted">No competitors added yet</p>
            </div>
          )}
        </div>

        {/* Keywords */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-[0.88rem] font-bold text-foreground">KEYWORDS & TOPICS TO MONITOR</h3>
              <p className="text-[0.72rem] text-muted">What search terms and topics should your content rank for?</p>
            </div>
            <button className="flex items-center gap-1.5 text-[0.78rem] font-medium text-accent hover:text-accent/80">
              <Sparkles size={14} /> AI Suggest
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            <input value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addKeyword()}
              placeholder="Type keyword + Enter" className="flex-1 px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
            <button onClick={addKeyword} disabled={!kwInput.trim()} className="px-4 py-2.5 rounded-lg bg-accent text-white text-[0.82rem] font-bold disabled:opacity-40">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.trackingKeywords.map((kw, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-700 rounded-lg text-[0.78rem] font-medium">
                {kw}
                <button onClick={() => onUpdate({ trackingKeywords: data.trackingKeywords.filter((_, idx) => idx !== i) })} className="text-yellow-500/50 hover:text-yellow-700"><X size={12} /></button>
              </span>
            ))}
          </div>
          <p className="text-[0.7rem] text-muted mt-1">{data.trackingKeywords.length} of 20 keywords</p>
        </div>

        {/* Inspiration */}
        <div>
          <h3 className="text-[0.88rem] font-bold text-foreground mb-1">BRANDS OR CREATORS YOU ADMIRE</h3>
          <p className="text-[0.72rem] text-muted mb-3">Who creates the kind of content you aspire to?</p>
          <div className="flex gap-2 mb-2">
            <input value={inspName} onChange={e => setInspName(e.target.value)} placeholder="Name"
              className="flex-1 px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent" />
            <select value={inspPlatform} onChange={e => setInspPlatform(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.03] text-[0.82rem] outline-none focus:border-accent">
              {["Instagram", "TikTok", "YouTube", "LinkedIn", "Twitter/X"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={addInspiration} disabled={!inspName.trim()} className="px-4 py-2.5 rounded-lg bg-accent text-white text-[0.82rem] font-bold disabled:opacity-40">Add</button>
          </div>
          {data.inspirationAccounts.length > 0 && (
            <div className="space-y-1.5">
              {data.inspirationAccounts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02]">
                  <div className="w-7 h-7 rounded-full bg-foreground/[0.06] flex items-center justify-center text-[0.72rem] font-bold text-foreground/70">{a.name[0]}</div>
                  <span className="text-[0.82rem] font-medium flex-1">{a.name}</span>
                  <span className="px-2 py-0.5 bg-foreground/[0.06] text-muted rounded text-[0.65rem]">{a.platform}</span>
                  <button onClick={() => onUpdate({ inspirationAccounts: data.inspirationAccounts.filter((_, idx) => idx !== i) })} className="text-muted hover:text-foreground"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StepShell>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 7 — CHARACTERS
   ═══════════════════════════════════════════════════ */

function CharactersStep({ data, onUpdate, onBack, onNext }: { data: BrandFormData; onUpdate: (u: Partial<BrandFormData>) => void; onBack: () => void; onNext: () => void }) {
  const selectedChar = CHARACTERS.find(c => c.id === data.selectedCharacter);

  return (
    <StepShell title="AI Characters" subtitle="Select your AI spokesperson and voice" icon={Users} iconColor="bg-indigo-600" onBack={onBack} onNext={onNext} nextLabel="Review">
      <div className="max-w-3xl space-y-8">
        {/* Character Selection */}
        <div>
          <label className="block text-[0.82rem] font-semibold text-foreground mb-3">CHOOSE SPOKESPERSON</label>
          {selectedChar ? (
            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-accent bg-accent/5">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${selectedChar.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                {selectedChar.initials}
              </div>
              <div className="flex-1">
                <p className="text-[0.88rem] font-bold text-foreground">{selectedChar.name}</p>
                <p className="text-[0.75rem] text-muted">{selectedChar.desc}</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 bg-foreground/[0.06] rounded text-[0.6rem] text-muted">{selectedChar.gender}</span>
                  <span className="px-2 py-0.5 bg-foreground/[0.06] rounded text-[0.6rem] text-muted">{selectedChar.ethnicity}</span>
                  <span className="px-2 py-0.5 bg-foreground/[0.06] rounded text-[0.6rem] text-muted">{selectedChar.age}</span>
                </div>
              </div>
              <button onClick={() => onUpdate({ selectedCharacter: "" })} className="text-[0.78rem] text-accent font-medium hover:underline">Change</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CHARACTERS.map(c => (
                <button key={c.id} onClick={() => onUpdate({ selectedCharacter: c.id })}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-foreground/[0.08] hover:border-accent/30 transition-all">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                    {c.initials}
                  </div>
                  <p className="text-[0.78rem] font-semibold text-foreground">{c.name}</p>
                  <p className="text-[0.65rem] text-muted text-center">{c.desc}</p>
                  <div className="flex gap-1 flex-wrap justify-center">
                    <span className="px-1.5 py-0.5 bg-foreground/[0.06] rounded text-[0.55rem] text-muted">{c.gender}</span>
                    <span className="px-1.5 py-0.5 bg-foreground/[0.06] rounded text-[0.55rem] text-muted">{c.ethnicity}</span>
                    <span className="px-1.5 py-0.5 bg-foreground/[0.06] rounded text-[0.55rem] text-muted">{c.age}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Selection */}
        <div>
          <label className="block text-[0.82rem] font-semibold text-foreground mb-3 flex items-center gap-2"><Mic size={14} /> CHOOSE VOICE</label>
          <div className="grid grid-cols-4 gap-2">
            {VOICES.map(v => (
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

/* ═══════════════════════════════════════════════════
   STEP 8 — REVIEW & BRAND KIT
   ═══════════════════════════════════════════════════ */

function ReviewStep({ data, onBack, onComplete, onEdit }: { data: BrandFormData; onBack: () => void; onComplete: () => void; onEdit: (step: number) => void }) {
  const sections = [
    { title: "Brand Identity", icon: Palette, color: "text-blue-600", bgColor: "bg-blue-600/10", step: 0, items: [
      { label: "Brand Name", value: data.brandName },
      { label: "Tagline", value: data.tagline || "—" },
      { label: "Industry", value: data.industry || "—" },
      { label: "Archetype", value: data.brandArchetype ? ARCHETYPES.find(a => a.id === data.brandArchetype)?.name || data.brandArchetype : "—" },
      { label: "Colors", value: "", isColors: true, colors: [data.primaryColor, data.secondaryColor, data.accentColor, data.backgroundColor] },
    ]},
    { title: "Brand Voice", icon: Mic, color: "text-purple-600", bgColor: "bg-purple-600/10", step: 1, items: [
      { label: "Tone", value: data.toneOfVoice.join(", ") || "—" },
      { label: "Style", value: data.writingStyle || "—" },
      { label: "Content Length", value: data.contentLength || "—" },
      { label: "Emoji Policy", value: data.emojiUsage || "—" },
    ]},
    { title: "Target Audience", icon: Target, color: "text-rose-500", bgColor: "bg-rose-500/10", step: 2, items: [
      { label: "Age Ranges", value: data.audienceAgeRanges.join(", ") || "—" },
      { label: "Pain Points", value: `${data.audiencePainPoints.length} selected` },
      { label: "Personas", value: `${data.audiencePersonas.length} created` },
    ]},
    { title: "Knowledge Base", icon: Database, color: "text-green-600", bgColor: "bg-green-600/10", step: 3, items: [
      { label: "Sources", value: `${data.dataSources.length} added` },
      { label: "Discovery", value: `${data.discoveryAnswers.filter(a => a.trim()).length} of 12 answered` },
    ]},
    { title: "Content Strategy", icon: BarChart3, color: "text-orange-500", bgColor: "bg-orange-500/10", step: 4, items: [
      { label: "Goals", value: data.contentGoals.join(", ") || "—" },
      { label: "Platforms", value: data.contentPlatforms.join(", ") || "—" },
      { label: "Frequency", value: data.postFrequency || "—" },
      { label: "Pillars", value: `${data.contentPillars.length} defined` },
    ]},
    { title: "Intelligence", icon: TrendingUp, color: "text-yellow-500", bgColor: "bg-yellow-500/10", step: 5, items: [
      { label: "Competitors", value: `${data.competitorBrands.length} tracked` },
      { label: "Keywords", value: `${data.trackingKeywords.length} tracked` },
    ]},
    { title: "Characters", icon: Users, color: "text-indigo-600", bgColor: "bg-indigo-600/10", step: 6, items: [
      { label: "Spokesperson", value: CHARACTERS.find(c => c.id === data.selectedCharacter)?.name || "—" },
      { label: "Voice", value: VOICES.find(v => v.id === data.selectedVoice)?.name || "—" },
    ]},
  ];

  return (
    <StepShell title="Review & Brand Kit" subtitle="Review your brand profile before completing" icon={ClipboardCheck} iconColor="bg-accent" onBack={onBack} onNext={onComplete} nextLabel="Complete Brand Setup">
      <div className="max-w-4xl">
        {/* Brand Kit Preview */}
        <div className="rounded-2xl border border-foreground/[0.1] bg-foreground/[0.02] p-6 mb-6">
          <p className="text-[0.72rem] font-semibold text-muted uppercase tracking-wider mb-4">YOUR BRAND KIT PREVIEW</p>
          <div className="flex items-center gap-6">
            <div className="text-center flex-shrink-0">
              <h2 className="text-2xl font-black" style={{ color: data.primaryColor, fontFamily: data.primaryFont }}>
                {data.brandName || "Your Brand"}
              </h2>
              {data.tagline && <p className="text-[0.82rem] text-muted italic mt-1" style={{ fontFamily: data.secondaryFont }}>{data.tagline}</p>}
              {data.industry && <p className="text-[0.65rem] text-muted/60 mt-0.5">{data.industry}</p>}
            </div>
            <div className="flex gap-2">
              {[data.primaryColor, data.secondaryColor, data.accentColor].map((c, i) => (
                <div key={i} className="w-10 h-10 rounded-lg border border-foreground/[0.08]" style={{ backgroundColor: c }} />
              ))}
            </div>
            {data.brandArchetype && (
              <span className="px-3 py-1 bg-blue-600/10 text-blue-700 rounded-lg text-[0.72rem] font-medium capitalize">
                {ARCHETYPES.find(a => a.id === data.brandArchetype)?.name}
              </span>
            )}
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-xl border border-foreground/[0.08] p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${s.bgColor} flex items-center justify-center`}><Icon size={16} className={s.color} /></div>
                    <h3 className="text-[0.85rem] font-bold">{s.title}</h3>
                  </div>
                  <button onClick={() => onEdit(s.step)} className="text-[0.75rem] text-accent font-medium hover:underline">Edit</button>
                </div>
                <div className="space-y-1.5 ml-[42px]">
                  {s.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[0.72rem] text-muted min-w-[90px]">{item.label}:</span>
                      {(item as any).isColors ? (
                        <div className="flex gap-1">
                          {(item as any).colors.map((c: string, ci: number) => (
                            <div key={ci} className="w-5 h-5 rounded border border-foreground/[0.08]" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[0.75rem] font-medium text-foreground capitalize truncate">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StepShell>
  );
}

/* ═══════════════════════════════════════════════════
   COMPLETION
   ═══════════════════════════════════════════════════ */

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
        <a href="/create" className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-white font-bold text-[0.85rem] hover:bg-accent/85 transition-colors no-underline">
          <Sparkles size={16} /> Create Content
        </a>
        <a href="/dashboard" className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-foreground/[0.1] text-foreground font-semibold text-[0.85rem] hover:bg-foreground/[0.04] transition-colors no-underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */

export default function BrandPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<BrandFormData>(() => {
    try {
      const stored = localStorage.getItem("ra_brand_wizard");
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_DATA, ...parsed };
      }
      return DEFAULT_DATA;
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
    setStep(8);
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
        {step === 4 && <StrategyStep data={formData} onUpdate={update} onBack={() => setStep(3)} onNext={() => setStep(5)} />}
        {step === 5 && <IntelligenceStep data={formData} onUpdate={update} onBack={() => setStep(4)} onNext={() => setStep(6)} />}
        {step === 6 && <CharactersStep data={formData} onUpdate={update} onBack={() => setStep(5)} onNext={() => setStep(7)} />}
        {step === 7 && <ReviewStep data={formData} onBack={() => setStep(6)} onComplete={handleComplete} onEdit={setStep} />}
        {step === 8 && <CompletionStep />}
      </div>
    </PageShell>
  );
}
