import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image, Video, Music, Palette, Calendar, FileText, Code,
  Send, Mic, Sparkles, ChevronLeft, ChevronRight, RefreshCw,
  Camera, Play, MessageCircle, Move, User, BookOpen, Presentation,
  Headphones, AudioLines, Captions, Pencil, Layers, Zap,
  Bot, Globe, Package, BarChart2, Film, LayoutGrid, Lock,
  Target, PenTool, ShoppingCart, Rss, Clapperboard, X, Copy, Hash,
} from "lucide-react";
import { Logo } from "@/components/Logo";

/* ─── Content type config (mirrors CreatePage) ──────────────── */

type ContentType = "image" | "video" | "audio" | "design" | "content" | "document" | "app";

const CONTENT_TYPES: {
  id: ContentType;
  label: string;
  icon: typeof Image;
  color: string;
  bg: string;
  border: string;
  promptBorder: string;
}[] = [
  { id: "image",    label: "Image",    icon: Image,    color: "text-blue-500",   bg: "bg-blue-50",    border: "border-blue-200",   promptBorder: "border-blue-400" },
  { id: "video",    label: "Video",    icon: Video,    color: "text-red-500",    bg: "bg-red-50",     border: "border-red-200",    promptBorder: "border-red-400" },
  { id: "audio",    label: "Audio",    icon: Music,    color: "text-green-500",  bg: "bg-green-50",   border: "border-green-200",  promptBorder: "border-green-400" },
  { id: "design",   label: "Design",   icon: Palette,  color: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-200", promptBorder: "border-orange-400" },
  { id: "content",  label: "Content",  icon: Calendar, color: "text-purple-500", bg: "bg-purple-50",  border: "border-purple-200", promptBorder: "border-purple-400" },
  { id: "document", label: "Document", icon: FileText, color: "text-blue-500",   bg: "bg-blue-50",    border: "border-blue-200",   promptBorder: "border-blue-400" },
  { id: "app",      label: "App",      icon: Code,     color: "text-rose-500",   bg: "bg-rose-50",    border: "border-rose-200",   promptBorder: "border-rose-400" },
];

/* ─── Suggestion data per pill (24 each) ─────────────────────── */

interface Suggestion {
  icon: typeof Image;
  title: string;
  desc: string;
  color: string;
}

const SUGGESTIONS: Record<ContentType, Suggestion[]> = {
  image: [
    { icon: Sparkles, title: "AI Portrait", desc: "Stunning photorealistic portraits.", color: "text-blue-500" },
    { icon: Camera, title: "Product Shot", desc: "Professional product photography.", color: "text-indigo-500" },
    { icon: Image, title: "Stock Photo", desc: "Royalty-free stock images.", color: "text-sky-500" },
    { icon: Palette, title: "Digital Art", desc: "Unique digital illustrations.", color: "text-violet-500" },
    { icon: Layers, title: "Batch Generate", desc: "Create multiple images at once.", color: "text-blue-600" },
    { icon: Pencil, title: "Sketch to Image", desc: "Turn sketches into art.", color: "text-cyan-500" },
    { icon: RefreshCw, title: "Face Swap", desc: "Swap faces seamlessly.", color: "text-teal-500" },
    { icon: Camera, title: "AI Photoshoot", desc: "Professional studio quality.", color: "text-blue-400" },
    { icon: Target, title: "Background Remove", desc: "Clean background removal.", color: "text-indigo-400" },
    { icon: Sparkles, title: "Upscale 4×", desc: "Ultra-HD enhancement.", color: "text-purple-500" },
    { icon: Palette, title: "Style Transfer", desc: "Apply any artistic style.", color: "text-pink-500" },
    { icon: Image, title: "Texture Gen", desc: "Seamless texture creation.", color: "text-emerald-500" },
    { icon: Layers, title: "Image Variation", desc: "Generate image variants.", color: "text-blue-500" },
    { icon: Pencil, title: "Inpainting", desc: "Edit parts of any image.", color: "text-orange-500" },
    { icon: Camera, title: "Headshots", desc: "Professional AI headshots.", color: "text-sky-600" },
    { icon: Sparkles, title: "Concept Art", desc: "Game & film concept art.", color: "text-violet-600" },
    { icon: Image, title: "Moodboard", desc: "Visual inspiration boards.", color: "text-rose-500" },
    { icon: Palette, title: "Color Palette", desc: "Generate color schemes.", color: "text-amber-500" },
    { icon: Target, title: "Object Remove", desc: "Remove unwanted objects.", color: "text-red-500" },
    { icon: Camera, title: "Food Photography", desc: "Appetizing food shots.", color: "text-yellow-600" },
    { icon: Sparkles, title: "Fantasy Art", desc: "Magical fantasy scenes.", color: "text-purple-600" },
    { icon: Layers, title: "Pattern Design", desc: "Repeating pattern generator.", color: "text-teal-600" },
    { icon: Image, title: "Architecture Viz", desc: "3D architectural renders.", color: "text-slate-500" },
    { icon: Pencil, title: "Character Design", desc: "Original character creation.", color: "text-cyan-600" },
  ],
  video: [
    { icon: Play, title: "AI Video", desc: "Stunning visuals in seconds.", color: "text-red-500" },
    { icon: Clapperboard, title: "Motion Control", desc: "Precise character animation.", color: "text-rose-500" },
    { icon: MessageCircle, title: "Lip Sync", desc: "Sync lips to any audio.", color: "text-pink-500" },
    { icon: Move, title: "Motion Sync", desc: "Match body movements.", color: "text-red-400" },
    { icon: User, title: "Avatar Video", desc: "AI avatar presentations.", color: "text-orange-500" },
    { icon: Video, title: "UGC Creator", desc: "User-generated content.", color: "text-red-600" },
    { icon: RefreshCw, title: "Video Recast", desc: "Swap characters in video.", color: "text-rose-600" },
    { icon: BookOpen, title: "Story Video", desc: "AI narrative stories.", color: "text-purple-500" },
    { icon: Presentation, title: "Presentation", desc: "Animated slide decks.", color: "text-blue-500" },
    { icon: Mic, title: "Podcast Video", desc: "Video podcast creation.", color: "text-green-500" },
    { icon: Film, title: "Short Film", desc: "Mini cinematic films.", color: "text-indigo-500" },
    { icon: Sparkles, title: "Viral Shorts", desc: "Trending short content.", color: "text-pink-600" },
    { icon: Camera, title: "Product Demo", desc: "Engaging product demos.", color: "text-teal-500" },
    { icon: Pencil, title: "Animated Draw", desc: "Drawing-style animation.", color: "text-amber-500" },
    { icon: Globe, title: "Explainer", desc: "Clear explainer videos.", color: "text-cyan-500" },
    { icon: BarChart2, title: "Data Video", desc: "Animated data stories.", color: "text-blue-600" },
    { icon: Zap, title: "Trailer", desc: "Cinematic trailers.", color: "text-red-700" },
    { icon: Video, title: "Tutorial", desc: "Step-by-step tutorials.", color: "text-emerald-500" },
    { icon: Sparkles, title: "Music Video", desc: "AI music visuals.", color: "text-violet-500" },
    { icon: User, title: "Talking Head", desc: "AI presenter videos.", color: "text-slate-500" },
    { icon: Film, title: "Documentary", desc: "Mini documentaries.", color: "text-gray-600" },
    { icon: Camera, title: "Time-Lapse", desc: "AI time-lapse effects.", color: "text-sky-500" },
    { icon: Layers, title: "Multi-Scene", desc: "Complex scene sequences.", color: "text-indigo-600" },
    { icon: Play, title: "Loop Video", desc: "Seamless video loops.", color: "text-rose-400" },
  ],
  audio: [
    { icon: Mic, title: "Voiceover", desc: "Professional narration.", color: "text-green-500" },
    { icon: User, title: "Voice Clone", desc: "Your voice, everywhere.", color: "text-emerald-500" },
    { icon: RefreshCw, title: "Revoice", desc: "Change voice in audio.", color: "text-teal-500" },
    { icon: Captions, title: "Transcribe", desc: "Audio to text instantly.", color: "text-blue-500" },
    { icon: AudioLines, title: "Sound Effects", desc: "Custom SFX generation.", color: "text-lime-500" },
    { icon: Music, title: "Custom Music", desc: "Sounds that move souls.", color: "text-pink-500" },
    { icon: Headphones, title: "Audiobook", desc: "Full audiobook creation.", color: "text-purple-500" },
    { icon: Sparkles, title: "Lo-Fi Beats", desc: "Chill lo-fi generators.", color: "text-amber-500" },
    { icon: Music, title: "Orchestral", desc: "Epic orchestral scores.", color: "text-indigo-500" },
    { icon: AudioLines, title: "Ambient", desc: "Ambient soundscapes.", color: "text-cyan-500" },
    { icon: Mic, title: "Podcast Intro", desc: "Professional intros.", color: "text-green-600" },
    { icon: Music, title: "Jingle", desc: "Catchy brand jingles.", color: "text-yellow-500" },
    { icon: Headphones, title: "Meditation", desc: "Guided meditations.", color: "text-violet-500" },
    { icon: AudioLines, title: "Noise Remove", desc: "Clean audio instantly.", color: "text-slate-500" },
    { icon: Sparkles, title: "AI DJ", desc: "Auto DJ mixing.", color: "text-red-500" },
    { icon: Music, title: "EDM Track", desc: "Electronic dance music.", color: "text-blue-600" },
    { icon: Mic, title: "Ad Voiceover", desc: "Commercial narration.", color: "text-orange-500" },
    { icon: AudioLines, title: "Foley", desc: "Realistic foley sounds.", color: "text-gray-500" },
    { icon: Music, title: "Hip-Hop Beat", desc: "Custom hip-hop beats.", color: "text-rose-500" },
    { icon: Headphones, title: "ASMR", desc: "Relaxing ASMR audio.", color: "text-teal-600" },
    { icon: Sparkles, title: "Cinematic", desc: "Film score creation.", color: "text-indigo-600" },
    { icon: Music, title: "Jazz", desc: "Smooth jazz generation.", color: "text-amber-600" },
    { icon: Mic, title: "Character Voice", desc: "Unique character voices.", color: "text-purple-600" },
    { icon: AudioLines, title: "Ringtone", desc: "Custom ringtones.", color: "text-green-400" },
  ],
  design: [
    { icon: Sparkles, title: "Logo Design", desc: "Professional brand logos.", color: "text-orange-500" },
    { icon: Presentation, title: "Poster", desc: "Eye-catching posters.", color: "text-red-500" },
    { icon: Film, title: "Thumbnail", desc: "Click-worthy thumbnails.", color: "text-pink-500" },
    { icon: FileText, title: "Flyer", desc: "Event & promo flyers.", color: "text-amber-500" },
    { icon: User, title: "Business Card", desc: "Professional cards.", color: "text-blue-500" },
    { icon: BookOpen, title: "Brochure", desc: "Multi-page brochures.", color: "text-teal-500" },
    { icon: BarChart2, title: "Infographic", desc: "Data visualization.", color: "text-green-500" },
    { icon: Palette, title: "Brand Kit", desc: "Complete brand identity.", color: "text-violet-500" },
    { icon: Image, title: "Social Banner", desc: "Platform cover images.", color: "text-purple-500" },
    { icon: Layers, title: "Mockup", desc: "Product mockups.", color: "text-indigo-500" },
    { icon: Pencil, title: "Icon Set", desc: "Custom icon design.", color: "text-cyan-500" },
    { icon: Package, title: "Packaging", desc: "Product packaging.", color: "text-emerald-500" },
    { icon: FileText, title: "Menu Design", desc: "Restaurant menus.", color: "text-yellow-600" },
    { icon: Sparkles, title: "Sticker", desc: "Custom sticker sheets.", color: "text-pink-600" },
    { icon: Globe, title: "Web Banner", desc: "Digital ad banners.", color: "text-blue-600" },
    { icon: Image, title: "Album Cover", desc: "Music album artwork.", color: "text-rose-600" },
    { icon: Presentation, title: "Slide Deck", desc: "Presentation slides.", color: "text-sky-500" },
    { icon: Layers, title: "Certificate", desc: "Award certificates.", color: "text-amber-600" },
    { icon: Pencil, title: "Invitation", desc: "Event invitations.", color: "text-violet-600" },
    { icon: Palette, title: "Pattern", desc: "Seamless patterns.", color: "text-teal-600" },
    { icon: FileText, title: "Resume", desc: "Professional resumes.", color: "text-slate-500" },
    { icon: Image, title: "Postcard", desc: "Digital postcards.", color: "text-orange-600" },
    { icon: Sparkles, title: "T-Shirt", desc: "Apparel design.", color: "text-red-600" },
    { icon: Presentation, title: "Billboard", desc: "Large format design.", color: "text-gray-600" },
  ],
  content: [
    { icon: Globe, title: "Social Content", desc: "Posts that stop the scroll.", color: "text-purple-500" },
    { icon: FileText, title: "Newsletter", desc: "Engaging email content.", color: "text-blue-500" },
    { icon: BookOpen, title: "Article", desc: "Long-form articles.", color: "text-indigo-500" },
    { icon: Pencil, title: "Blog Post", desc: "SEO-optimized blogs.", color: "text-teal-500" },
    { icon: FileText, title: "Email Campaign", desc: "Email marketing flows.", color: "text-green-500" },
    { icon: Zap, title: "Ad Copy", desc: "High-converting ads.", color: "text-amber-500" },
    { icon: Calendar, title: "Content Calendar", desc: "Monthly content plans.", color: "text-pink-500" },
    { icon: Sparkles, title: "Caption Writer", desc: "Viral captions.", color: "text-violet-500" },
    { icon: Globe, title: "Thread Writer", desc: "Twitter/X threads.", color: "text-sky-500" },
    { icon: Video, title: "Script Writer", desc: "Video scripts.", color: "text-red-500" },
    { icon: Target, title: "Landing Copy", desc: "Landing page copy.", color: "text-orange-500" },
    { icon: Pencil, title: "Product Desc", desc: "E-commerce descriptions.", color: "text-emerald-500" },
    { icon: Globe, title: "LinkedIn Post", desc: "Professional posts.", color: "text-blue-600" },
    { icon: Sparkles, title: "Hook Generator", desc: "Attention-grabbing hooks.", color: "text-rose-500" },
    { icon: BookOpen, title: "Case Study", desc: "Client success stories.", color: "text-cyan-500" },
    { icon: FileText, title: "Press Release", desc: "Media announcements.", color: "text-slate-500" },
    { icon: Calendar, title: "Social Strategy", desc: "Platform strategy.", color: "text-purple-600" },
    { icon: Zap, title: "CTA Generator", desc: "Compelling CTAs.", color: "text-yellow-600" },
    { icon: Pencil, title: "Brand Voice", desc: "Consistent tone guide.", color: "text-teal-600" },
    { icon: Globe, title: "Hashtag Strategy", desc: "Trending hashtags.", color: "text-indigo-600" },
    { icon: Sparkles, title: "Carousel", desc: "Swipeable carousels.", color: "text-pink-600" },
    { icon: Target, title: "A/B Headlines", desc: "Split-test headlines.", color: "text-red-600" },
    { icon: FileText, title: "Whitepaper", desc: "Authority content.", color: "text-gray-600" },
    { icon: BookOpen, title: "Guest Post", desc: "Guest blog pitches.", color: "text-violet-600" },
  ],
  document: [
    { icon: BookOpen, title: "Ebook", desc: "Full ebook creation.", color: "text-blue-500" },
    { icon: FileText, title: "Whitepaper", desc: "Research documents.", color: "text-indigo-500" },
    { icon: BarChart2, title: "Report", desc: "Data-driven reports.", color: "text-green-500" },
    { icon: Package, title: "Business Plan", desc: "Investor-ready plans.", color: "text-violet-500" },
    { icon: Layers, title: "Handbook", desc: "Employee handbooks.", color: "text-teal-500" },
    { icon: PenTool, title: "Proposal", desc: "Client proposals.", color: "text-orange-500" },
    { icon: Target, title: "Case Study", desc: "Success case studies.", color: "text-pink-500" },
    { icon: Pencil, title: "Cover Letter", desc: "Job cover letters.", color: "text-amber-500" },
    { icon: FileText, title: "Contract", desc: "Legal contracts.", color: "text-slate-500" },
    { icon: BookOpen, title: "Course Material", desc: "Online course content.", color: "text-purple-500" },
    { icon: BarChart2, title: "Financial Report", desc: "Financial analysis.", color: "text-emerald-500" },
    { icon: Layers, title: "SOPs", desc: "Standard procedures.", color: "text-blue-600" },
    { icon: PenTool, title: "Grant Application", desc: "Funding applications.", color: "text-cyan-500" },
    { icon: Target, title: "Marketing Plan", desc: "Strategy documents.", color: "text-red-500" },
    { icon: FileText, title: "Resume/CV", desc: "Professional resumes.", color: "text-indigo-600" },
    { icon: BookOpen, title: "User Manual", desc: "Product documentation.", color: "text-teal-600" },
    { icon: BarChart2, title: "Survey Report", desc: "Survey analysis.", color: "text-green-600" },
    { icon: Package, title: "Pitch Deck", desc: "Investor pitch decks.", color: "text-violet-600" },
    { icon: Pencil, title: "Policy Doc", desc: "Company policies.", color: "text-gray-600" },
    { icon: FileText, title: "Meeting Notes", desc: "AI meeting summaries.", color: "text-sky-500" },
    { icon: Layers, title: "Onboarding Guide", desc: "New hire guides.", color: "text-amber-600" },
    { icon: BookOpen, title: "Research Paper", desc: "Academic papers.", color: "text-rose-500" },
    { icon: PenTool, title: "Newsletter", desc: "Email newsletters.", color: "text-pink-600" },
    { icon: Target, title: "Competitive Analysis", desc: "Market comparison.", color: "text-orange-600" },
  ],
  app: [
    { icon: Code, title: "Web App", desc: "Full-stack web apps.", color: "text-rose-500" },
    { icon: Bot, title: "AI Agent", desc: "Autonomous AI agents.", color: "text-purple-500" },
    { icon: Package, title: "SaaS", desc: "SaaS product builder.", color: "text-blue-500" },
    { icon: LayoutGrid, title: "Website", desc: "Multi-page websites.", color: "text-teal-500" },
    { icon: FileText, title: "Landing Page", desc: "High-converting pages.", color: "text-amber-500" },
    { icon: Rss, title: "Blog Platform", desc: "Custom blog sites.", color: "text-green-500" },
    { icon: Lock, title: "Membership", desc: "Membership portals.", color: "text-indigo-500" },
    { icon: ShoppingCart, title: "Ecommerce", desc: "Online stores.", color: "text-pink-500" },
    { icon: BarChart2, title: "Dashboard", desc: "Analytics dashboards.", color: "text-cyan-500" },
    { icon: Globe, title: "Portfolio", desc: "Creative portfolios.", color: "text-violet-500" },
    { icon: Sparkles, title: "AI Chatbot", desc: "Custom chatbots.", color: "text-emerald-500" },
    { icon: Calendar, title: "Booking App", desc: "Appointment scheduling.", color: "text-orange-500" },
    { icon: Layers, title: "CRM", desc: "Customer management.", color: "text-blue-600" },
    { icon: FileText, title: "Form Builder", desc: "Custom forms.", color: "text-slate-500" },
    { icon: Zap, title: "Automation", desc: "Workflow automation.", color: "text-yellow-600" },
    { icon: User, title: "Directory", desc: "Listing directories.", color: "text-red-500" },
    { icon: Music, title: "Streaming App", desc: "Media streaming.", color: "text-pink-600" },
    { icon: Globe, title: "Social Network", desc: "Community platforms.", color: "text-sky-500" },
    { icon: BarChart2, title: "Survey Tool", desc: "Survey & polls.", color: "text-teal-600" },
    { icon: Package, title: "Marketplace", desc: "Multi-vendor market.", color: "text-violet-600" },
    { icon: Bot, title: "Knowledge Base", desc: "Help center & docs.", color: "text-indigo-600" },
    { icon: Calendar, title: "Event Platform", desc: "Event management.", color: "text-rose-600" },
    { icon: Code, title: "API Builder", desc: "REST/GraphQL APIs.", color: "text-gray-600" },
    { icon: Sparkles, title: "No-Code Tool", desc: "Visual app builder.", color: "text-amber-600" },
  ],
};

const ITEMS_PER_PAGE = 6;

/* ─── Shuffle helper ─────────────────────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Landing Page ───────────────────────────────────────────── */

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [prompt, setPrompt] = useState("");
  const [suggestionsPage, setSuggestionsPage] = useState(0);
  const [shuffledSuggestions, setShuffledSuggestions] = useState<Record<string, Suggestion[]>>({});
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const activeBorderColor = selectedType
    ? CONTENT_TYPES.find(t => t.id === selectedType)?.promptBorder || "border-accent"
    : "border-foreground/[0.12]";

  const handlePillClick = (type: ContentType) => {
    if (selectedType === type) {
      setSelectedType(null);
      setSuggestionsPage(0);
      return;
    }
    setSelectedType(type);
    setSuggestionsPage(0);
    if (!shuffledSuggestions[type]) {
      setShuffledSuggestions(prev => ({ ...prev, [type]: shuffle(SUGGESTIONS[type]) }));
    }
  };

  const handleRegenerate = () => {
    if (!selectedType) return;
    setShuffledSuggestions(prev => ({ ...prev, [selectedType]: shuffle(SUGGESTIONS[selectedType]) }));
    setSuggestionsPage(0);
  };

  const currentSuggestions = selectedType
    ? (shuffledSuggestions[selectedType] || SUGGESTIONS[selectedType])
    : [];
  const totalPages = Math.ceil(currentSuggestions.length / ITEMS_PER_PAGE);
  const visibleSuggestions = currentSuggestions.slice(
    suggestionsPage * ITEMS_PER_PAGE,
    (suggestionsPage + 1) * ITEMS_PER_PAGE
  );

  const handleGenerate = () => {
    navigate("/signup");
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setPrompt(suggestion.title + " — " + suggestion.desc);
    promptRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 bg-background/80 backdrop-blur-md border-b border-foreground/[0.06]">
        <Logo to="/landing" />
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 rounded-lg text-[0.84rem] font-semibold text-foreground hover:bg-foreground/[0.04] transition-colors">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 rounded-lg text-[0.84rem] font-semibold bg-accent text-primary-foreground hover:opacity-90 transition-opacity">
            Start Free
          </Link>
        </div>
      </header>

      <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 md:px-12 pt-24 pb-10">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[0.82rem] font-semibold tracking-[0.15em] uppercase text-muted mb-4"
        >
          Create Anything — Automate Everything
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-black leading-[1.05] tracking-[-0.03em] text-foreground text-center mb-8"
        >
          What Will You Create Today?
        </motion.h1>

        {/* Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="flex flex-wrap items-center justify-center gap-2.5 mb-8"
        >
          {CONTENT_TYPES.map(({ id, label, icon: Icon, color, bg, border }) => {
            const isActive = selectedType === id;
            return (
              <button
                key={id}
                onClick={() => handlePillClick(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-[0.88rem] font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? `${bg} ${border} ${color}`
                    : "border-foreground/[0.1] text-foreground/70 hover:border-foreground/20 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* Prompt Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="w-full max-w-[780px]"
        >
          <div className={`rounded-2xl border-2 ${activeBorderColor} bg-card transition-colors shadow-sm`}>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              placeholder="Describe what you want to create..."
              rows={3}
              className="w-full resize-none border-none outline-none bg-transparent text-foreground text-[0.95rem] font-light px-5 pt-5 pb-2 placeholder:text-foreground/30"
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {/* Type badge pill */}
                {selectedType ? (() => {
                  const tc = CONTENT_TYPES.find(t => t.id === selectedType)!;
                  const TIcon = tc.icon;
                  return (
                    <button onClick={() => setSelectedType(null)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.8rem] font-semibold border whitespace-nowrap shrink-0 ${tc.bg} ${tc.border} ${tc.color}`}>
                      <TIcon className="w-3.5 h-3.5" />{tc.label}
                      <X className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  );
                })() : (
                  <span className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-muted bg-foreground/[0.04] px-2.5 py-1.5 rounded-xl whitespace-nowrap shrink-0">
                    <Sparkles className="w-3 h-3" /> Auto
                  </span>
                )}

                {selectedType && (
                  <>
                    <div className="w-px h-5 bg-foreground/[0.08] mx-1 shrink-0" />
                    {/* Model */}
                    <button onClick={handleGenerate} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                      <Sparkles className="w-3 h-3" />Auto
                    </button>
                    {/* Style */}
                    <button onClick={handleGenerate} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium whitespace-nowrap shrink-0 bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                      <Pencil className="w-3 h-3" />Style
                    </button>
                    {/* Character */}
                    <button onClick={handleGenerate} className="p-1.5 rounded-lg shrink-0 bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </button>
                    {/* Reference */}
                    <button onClick={handleGenerate} className="p-1.5 rounded-lg shrink-0 bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    {/* Ratio */}
                    <button onClick={handleGenerate} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium whitespace-nowrap shrink-0 bg-accent/10 text-accent">
                      <Copy className="w-3 h-3" />1:1
                    </button>
                    {/* Count */}
                    <button onClick={handleGenerate} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium whitespace-nowrap shrink-0 bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                      <Hash className="w-3 h-3" />1
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button onClick={handleGenerate} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 bg-accent text-primary-foreground px-5 py-2 rounded-lg font-semibold text-[0.85rem] hover:bg-accent/85 transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Create For Free!
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Suggestions Section */}
        <AnimatePresence mode="wait">
          {selectedType && (
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[780px] mt-8 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[0.95rem] font-bold text-foreground">
                  Not Sure Where To Start? Try One Of These...
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleRegenerate}
                    className="w-8 h-8 rounded-lg border border-foreground/[0.1] flex items-center justify-center text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSuggestionsPage(p => Math.max(0, p - 1))}
                    disabled={suggestionsPage === 0}
                    className="w-8 h-8 rounded-lg border border-foreground/[0.1] flex items-center justify-center text-muted hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSuggestionsPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={suggestionsPage >= totalPages - 1}
                    className="w-8 h-8 rounded-lg border border-foreground/[0.1] flex items-center justify-center text-muted hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {visibleSuggestions.map((s, i) => (
                  <motion.button
                    key={`${selectedType}-${suggestionsPage}-${i}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    onClick={() => handleSuggestionClick(s)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-foreground/[0.08] bg-card hover:border-foreground/[0.16] hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0 ${s.color} group-hover:bg-foreground/[0.07] transition-colors`}>
                      <s.icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.85rem] font-semibold text-foreground truncate">{s.title}</p>
                      <p className="text-[0.72rem] text-muted truncate">{s.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default LandingPage;
