import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  List, LayoutGrid, Columns, Grid3X3, Rss,
  Trash2, Settings, Sparkles, Plus, ChevronDown, Search, Filter as FilterIcon, Download, MoreHorizontal,
  Image, Play, LayoutList, CircleDot, Check, Heart, MessageCircle, Send, Bookmark, Eye, Users, Share2, Clock,
  TrendingUp, Hash, Pencil, FileText, PenLine, Palette,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

/* ─── SVG Logo components ────────────────────── */

const FacebookLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const ThreadsLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.083.718 5.496 2.057 7.164 1.432 1.784 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.724 2.104-1.128 3.443-1.17 1.003-.03 1.926.093 2.77.368a4.4 4.4 0 00-.044-.846c-.226-1.322-.943-2.012-2.585-2.012h-.072c-.963.015-1.77.368-2.275.997l-1.533-1.125c.768-1.05 1.946-1.624 3.403-1.66h.104c2.544 0 4.196 1.436 4.518 3.912.065.478.094.998.088 1.558l.003.173c.653.312 1.214.706 1.68 1.188 1.014 1.05 1.552 2.458 1.552 4.074 0 .184-.006.363-.02.538-1.703 1.924-3.914 2.943-6.58 2.98zM10.61 14.37c-.606.025-1.09.18-1.443.456-.43.339-.65.799-.618 1.299.046.729.582 1.508 2.12 1.508l.15-.003c1.559-.084 2.424-1.083 2.608-3.027-.651-.2-1.39-.28-2.182-.265l-.635.032z"/>
  </svg>
);

const XLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TikTokLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.1a8.16 8.16 0 004.77 1.52v-3.45a4.85 4.85 0 01-.81.04h-.38z"/>
  </svg>
);

const LinkedInLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const BlueSkyLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.6 3.497 6.168 3.16-.36.043-3.78.471-5.36 3.236C.402 18.525 1.834 20.467 2.644 21c1.477.972 5.045.178 7.356-3.428a11.9 11.9 0 002-4.097 11.9 11.9 0 002 4.097C16.311 21.178 19.879 21.972 21.356 21c.81-.533 2.242-2.475 1.218-4.357-1.58-2.765-5-3.193-5.36-3.236 2.568.337 5.383-.533 6.168-3.16.246-.828.624-5.789.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
  </svg>
);

const YouTubeLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const PinterestLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/>
  </svg>
);

const RedditLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/>
  </svg>
);

const BlogLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 14H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z"/>
  </svg>
);

const GmailLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const PLATFORM_LOGOS: Record<string, typeof FacebookLogo> = {
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  threads: ThreadsLogo,
  x: XLogo,
  tiktok: TikTokLogo,
  linkedin: LinkedInLogo,
  bluesky: BlueSkyLogo,
  youtube: YouTubeLogo,
  pinterest: PinterestLogo,
  reddit: RedditLogo,
  blog: BlogLogo,
  gmail: GmailLogo,
};

/* ─── Platform config ────────────────────────── */
const PLATFORMS = [
  { id: "facebook",  label: "Facebook",  color: "#1877F2" },
  { id: "instagram", label: "Instagram", color: "#E4405F" },
  { id: "threads",   label: "Threads",   color: "#000000" },
  { id: "x",         label: "X",         color: "#000000" },
  { id: "tiktok",    label: "TikTok",    color: "#000000" },
  { id: "linkedin",  label: "LinkedIn",  color: "#0A66C2" },
  { id: "bluesky",   label: "Bluesky",   color: "#0085FF" },
  { id: "youtube",   label: "YouTube",   color: "#FF0000" },
  { id: "pinterest", label: "Pinterest", color: "#BD081C" },
  { id: "reddit",    label: "Reddit",    color: "#FF4500" },
  { id: "blog",      label: "Blog",      color: "#333333" },
  { id: "gmail",     label: "Gmail",     color: "#EA4335" },
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const VIEW_TABS = [
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "plan",     label: "Plan",     icon: List },
  { id: "kanban",   label: "Kanban",   icon: Columns },
  { id: "grid",     label: "Grid",     icon: Grid3X3 },
  { id: "feed",     label: "Feed",     icon: Rss },
];

/* ─── Dummy posts ────────────────────────────── */
type PostStatus = "draft" | "awaiting" | "scheduled" | "published";
type ContentType = "post" | "carousel" | "reel" | "story";

interface DummyPost {
  day: number; time: string; title: string; platform: string; score: number;
  status: PostStatus; contentType: ContentType; caption: string; hashtags: string[];
  dateLabel: string;
}

const CAPTIONS = [
  "Ever feel like you're shouting into the void? 🗣️ Finding your niche is KEY to connecting with your ideal audience! If you're a creative, what's a struggle you've faced trying to define your unique space? Share your thoughts! Let's brainstorm! ✨ #NicheDiscovery #CreativeBranding #InstagramForCreatives #PersonalBrandTips #FindYourVoice",
  "Creative minds, listen up! 🚀 What's ONE burning question you have about building your personal brand online? Drop it below! 👇",
  "Feeling overwhelmed by content creation? You're not alone! 😤 What kind of content do YOU find most engaging?",
  "Your visual identity says everything before you say a word. How intentional are you about yours? 🎨",
  "Content strategy isn't just about posting — it's about connecting. What's your biggest challenge? 💡",
];

const HASHTAG_SETS = [
  ["#NicheDiscovery", "#CreativeBranding", "#InstagramForCreatives", "#PersonalBrandTips", "#FindYourVoice"],
  ["#ContentCreation", "#PersonalBrand", "#CreativeEntrepreneur", "#DigitalMarketing", "#SocialMediaTips"],
  ["#VisualIdentity", "#BrandDesign", "#CreativeStrategy", "#AestheticGoals", "#BrandVoice"],
];

function generateDummyPosts(month: number, year: number): DummyPost[] {
  const titles = [
    "Content Strategy Secrets!", "Visual Identity Vibe Check!", "Your Creative Superpower?",
    "Nail Your Niche! 🤩", "Unleash Your Creative Brand!", "Engagement Tactics REEL!",
    "What's Your Superpower Story?", "Brainstorming Blitz!", "Content Strategy Poll! 📊",
  ];
  const statuses: PostStatus[] = ["draft", "draft", "published", "draft", "published", "scheduled", "awaiting", "draft", "published"];
  const contentTypes: ContentType[] = ["post", "carousel", "reel", "story", "carousel", "post"];
  const posts: DummyPost[] = [];
  for (let d = 4; d <= 28; d += 1) {
    if (Math.random() > 0.45) {
      const idx = posts.length;
      posts.push({
        day: d,
        time: `${Math.floor(Math.random() * 12 + 1)}:${Math.random() > 0.5 ? "30" : "00"} ${Math.random() > 0.5 ? "AM" : "PM"}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        platform: PLATFORMS[Math.floor(Math.random() * 4)].id,
        score: Math.floor(Math.random() * 30 + 65),
        status: statuses[idx % statuses.length],
        contentType: contentTypes[idx % contentTypes.length],
        caption: CAPTIONS[idx % CAPTIONS.length],
        hashtags: HASHTAG_SETS[idx % HASHTAG_SETS.length],
        dateLabel: `Jan ${d}`,
      });
    }
  }
  return posts;
}

/* ─── Component ──────────────────────────────── */

interface SocialContentPanelProps {
  onClose: () => void;
  frequency?: string;
}

export default function SocialContentPanel({ onClose, frequency = "7 Days" }: SocialContentPanelProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showDrafts, setShowDrafts] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set(["all"]));
  const [filterContentType, setFilterContentType] = useState<Set<string>>(new Set());
  const [filterPlatforms, setFilterPlatforms] = useState<Set<string>>(new Set());
  const [filterLabels, setFilterLabels] = useState<Set<string>>(new Set());
  const [posts] = useState(() => generateDummyPosts(currentMonth, currentYear));
  const [selectedPost, setSelectedPost] = useState<DummyPost | null>(null);
  const [postDetailTab, setPostDetailTab] = useState<"details"|"predictions">("details");
  const [showBrandPrompt, setShowBrandPrompt] = useState(false);
  const [showNewPostMenu, setShowNewPostMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [feedDevice, setFeedDevice] = useState<"mobile"|"desktop">("mobile");
  const [feedPlatform, setFeedPlatform] = useState("instagram");
  const [showManageLabels, setShowManageLabels] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSelected, setExportSelected] = useState<Set<number>>(new Set());
  const [showPostingSchedule, setShowPostingSchedule] = useState(false);
  const [scheduleTab, setScheduleTab] = useState<"schedule"|"analytics"|"general">("schedule");
  const [scheduleView, setScheduleView] = useState<"day"|"week">("day");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [scheduleAccount, setScheduleAccount] = useState("All Accounts");

  // Posting schedule data
  const scheduleData: Record<string, { peak: number; total: number; slots: { time: string; type: "peak"|"good"|"low"; desc: string; reach: string }[] }> = {
    Monday:    { peak: 2, total: 3, slots: [{ time: "9:00 AM", type: "peak", desc: "Highest Audience Activity Expected", reach: "~2.4K reach" }, { time: "12:30 PM", type: "good", desc: "Good Engagement Potential", reach: "~1.5K reach" }, { time: "5:00 PM", type: "peak", desc: "Highest Audience Activity Expected", reach: "~2.4K reach" }] },
    Tuesday:   { peak: 2, total: 3, slots: [{ time: "8:30 AM", type: "peak", desc: "Morning Peak Activity", reach: "~2.1K reach" }, { time: "1:00 PM", type: "good", desc: "Lunch Break Engagement", reach: "~1.8K reach" }, { time: "6:00 PM", type: "peak", desc: "Evening Rush Hour", reach: "~2.3K reach" }] },
    Wednesday: { peak: 2, total: 4, slots: [{ time: "7:00 AM", type: "good", desc: "Early Bird Window", reach: "~1.2K reach" }, { time: "10:00 AM", type: "peak", desc: "Mid-Morning Surge", reach: "~2.6K reach" }, { time: "2:00 PM", type: "good", desc: "Afternoon Engagement", reach: "~1.4K reach" }, { time: "7:30 PM", type: "peak", desc: "Prime Evening Slot", reach: "~2.5K reach" }] },
    Thursday:  { peak: 2, total: 3, slots: [{ time: "9:00 AM", type: "peak", desc: "Highest Audience Activity Expected", reach: "~2.2K reach" }, { time: "12:00 PM", type: "good", desc: "Midday Engagement Window", reach: "~1.6K reach" }, { time: "5:30 PM", type: "peak", desc: "After-Work Peak", reach: "~2.3K reach" }] },
    Friday:    { peak: 1, total: 3, slots: [{ time: "10:00 AM", type: "peak", desc: "Friday Morning Surge", reach: "~2.0K reach" }, { time: "1:00 PM", type: "good", desc: "Pre-Weekend Browse", reach: "~1.3K reach" }, { time: "4:00 PM", type: "low", desc: "Lower Weekend Transition", reach: "~0.9K reach" }] },
    Saturday:  { peak: 2, total: 3, slots: [{ time: "10:00 AM", type: "peak", desc: "Weekend Morning Activity", reach: "~2.1K reach" }, { time: "2:00 PM", type: "good", desc: "Afternoon Leisure Time", reach: "~1.7K reach" }, { time: "8:00 PM", type: "peak", desc: "Saturday Night Peak", reach: "~2.4K reach" }] },
    Sunday:    { peak: 2, total: 3, slots: [{ time: "11:00 AM", type: "peak", desc: "Late Morning Window", reach: "~2.0K reach" }, { time: "3:00 PM", type: "good", desc: "Afternoon Engagement", reach: "~1.5K reach" }, { time: "7:00 PM", type: "peak", desc: "Sunday Evening Peak", reach: "~2.3K reach" }] },
  };

  // Check if brand profile exists
  const hasBrandProfile = (() => {
    try {
      const stored = localStorage.getItem("ra_brand_profile");
      return stored ? JSON.parse(stored)?.completed === true : false;
    } catch { return false; }
  })();
  const [brandEnabled, setBrandEnabled] = useState(hasBrandProfile);
  const [contentStyle, setContentStyle] = useState<"ai"|"stock">("ai");

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPlatforms.size === PLATFORMS.length) {
      setSelectedPlatforms(new Set());
    } else {
      setSelectedPlatforms(new Set(PLATFORMS.map(p => p.id)));
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const PlatformIcon = ({ platformId, size = 16 }: { platformId: string; size?: number }) => {
    const Logo = PLATFORM_LOGOS[platformId];
    return Logo ? <Logo size={size} /> : null;
  };

  return (
    <div className="border-t border-foreground/[0.08] bg-background mt-3 w-full">
      {/* Platform selection */}
      <div className="p-4 border-b border-foreground/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[0.88rem] font-bold text-center flex-1">Choose Your Platforms To Generate {frequency} Of Content For Each One</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors shrink-0 ml-2"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-2 justify-center flex-wrap">
          <button
            onClick={selectAll}
            className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium border transition-colors ${
              selectedPlatforms.size === PLATFORMS.length
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            {selectedPlatforms.size === PLATFORMS.length ? "Deselect All" : "Select All"}
          </button>
          {PLATFORMS.map(p => {
            const selected = selectedPlatforms.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className="relative transition-all"
                title={p.label}
              >
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all bg-foreground/[0.06] ${
                  selected ? "ring-2 ring-emerald-500 scale-105" : "hover:scale-105"
                }`}
                  style={{ color: p.color }}
                >
                  <PlatformIcon platformId={p.id} size={24} />
                  {selected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {/* Selection info + Brand toggle */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="text-[0.72rem] text-muted">
            {selectedPlatforms.size} platform{selectedPlatforms.size !== 1 ? "s" : ""} selected
            {selectedPlatforms.size > 0 && ` · ${selectedPlatforms.size * 7} posts will be generated`}
          </span>
        </div>
        {showBrandPrompt && (
          <div className="mt-3 mx-auto max-w-md bg-accent/[0.06] border border-accent/20 rounded-lg p-3 flex items-center gap-3">
            <span className="text-[0.78rem] text-foreground flex-1">No brand profile found. Create one to enable brand voice in your content.</span>
            <a href="/brand" className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-[0.75rem] font-semibold no-underline whitespace-nowrap hover:bg-accent/90 transition-colors">Create Brand</a>
            <button onClick={() => setShowBrandPrompt(false)} className="text-muted hover:text-foreground"><X size={14} /></button>
          </div>
        )}
      </div>

      {/* View tabs toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/[0.06] overflow-x-auto">
        <div className="flex items-center gap-1">
          {VIEW_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all ${
                activeView === tab.id
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-[0.78rem] font-medium hover:bg-destructive/5 transition-colors">
            <Trash2 size={13} /> Delete All
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-[0.78rem] font-medium hover:bg-blue-100 transition-colors">
            <Settings size={13} /> Connect Accounts
          </button>
          <button
            onClick={() => setShowPostingSchedule(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-600 text-[0.78rem] font-medium hover:bg-green-100 transition-colors"
          >
            <Sparkles size={13} /> Best Time To Post
          </button>
          {/* Style popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[0.78rem] font-medium transition-colors ${contentStyle === "stock" ? "border-accent bg-accent/5 text-accent" : "border-foreground/[0.1] text-muted hover:text-foreground"}`}>
                <PenLine size={13} /> Style
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1.5" align="end" side="top" sideOffset={6}>
              <p className="text-[0.7rem] font-semibold text-muted px-2 py-1">Content Style</p>
              {[
                { id: "ai" as const, label: "AI Generated", icon: Sparkles, color: "text-purple-500" },
                { id: "stock" as const, label: "Stock", icon: Image, color: "text-blue-500" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setContentStyle(opt.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.82rem] font-medium transition-colors ${contentStyle === opt.id ? "bg-foreground/[0.04]" : "hover:bg-foreground/[0.04]"}`}
                >
                  <opt.icon size={16} className={opt.color} />
                  <span className="flex-1 text-left">{opt.label}</span>
                  {contentStyle === opt.id && <Check size={14} className="text-emerald-500" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          {/* Brand toggle */}
          <button
            onClick={() => {
              if (!hasBrandProfile && !brandEnabled) {
                setShowBrandPrompt(true);
              } else {
                setBrandEnabled(v => !v);
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[0.78rem] font-medium transition-colors ${
              brandEnabled ? "border-accent bg-accent/5 text-accent" : "border-foreground/[0.1] text-muted hover:text-foreground"
            }`}
          >
            <Palette size={13} /> Brand
            <div className={`w-8 h-[18px] rounded-full relative transition-colors ${brandEnabled ? "bg-accent" : "bg-foreground/20"}`}>
              <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all ${brandEnabled ? "left-[16px]" : "left-[2px]"}`} />
            </div>
          </button>
          <div className="relative">
            <button onClick={() => setShowNewPostMenu(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-[0.78rem] font-bold hover:bg-accent/85 transition-colors">
              <Plus size={13} /> New Post <ChevronDown size={11} />
            </button>
            {showNewPostMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNewPostMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-background border border-foreground/[0.08] rounded-xl shadow-lg py-1.5 w-48">
                  {[
                    { icon: Pencil, label: "Create Post" },
                    { icon: LayoutGrid, label: "Use Template" },
                    { icon: Rss, label: "Recycle Content" },
                  ].map(item => (
                    <button key={item.label} onClick={() => setShowNewPostMenu(false)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.82rem] font-medium hover:bg-foreground/[0.04] transition-colors">
                      <item.icon size={15} className="text-muted-foreground" /> {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Calendar sub-header — shown for calendar, plan, grid, kanban, feed */}
      {(activeView === "calendar" || activeView === "plan" || activeView === "grid" || activeView === "kanban" || activeView === "feed") && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowMonthPicker(v => !v)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-foreground/[0.04] text-[0.75rem] font-medium hover:bg-foreground/[0.08] transition-colors">
                <Grid3X3 size={12} /> Month <ChevronDown size={10} />
              </button>
              {showMonthPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                  <div className="absolute left-0 top-full mt-1 z-50 bg-background border border-foreground/[0.08] rounded-xl shadow-lg py-1 w-28">
                    {["Day", "Week", "Month"].map(v => (
                      <button key={v} onClick={() => setShowMonthPicker(false)} className={`w-full text-left px-3 py-2 text-[0.82rem] hover:bg-foreground/[0.04] transition-colors ${v === "Month" ? "font-semibold bg-foreground/[0.03]" : ""}`}>{v}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center" title="Today">
              <CalendarIcon size={12} />
            </button>
            <button onClick={prevMonth} className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center hover:bg-foreground/[0.08]">
              <ChevronLeft size={14} />
            </button>
            <button onClick={nextMonth} className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center hover:bg-foreground/[0.08]">
              <ChevronRight size={14} />
            </button>
            <span className="text-[0.88rem] font-bold ml-1">{monthName} {currentYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[0.75rem] text-muted cursor-pointer">
              <div
                onClick={() => setShowDrafts(v => !v)}
                className={`w-8 h-[18px] rounded-full transition-colors cursor-pointer relative ${showDrafts ? "bg-accent" : "bg-foreground/[0.15]"}`}
              >
                <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${showDrafts ? "left-[16px]" : "left-[2px]"}`} />
              </div>
              Drafts
            </label>
            <span className="text-[0.72rem] text-muted">{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
            <button onClick={() => { setShowSearchBar(v => !v); if (showSearchBar) setSearchQuery(""); }} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${showSearchBar ? "bg-accent text-white" : "bg-foreground/[0.04]"}`}><Search size={12} /></button>
            <button onClick={() => setShowFilters(v => !v)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${showFilters ? "bg-accent text-white" : "bg-foreground/[0.04]"}`}><FilterIcon size={12} /></button>
            <button onClick={() => { setShowExportModal(true); setExportSelected(new Set(posts.map((_, i) => i))); }} className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center hover:bg-foreground/[0.08] transition-colors"><Download size={12} /></button>
            <div className="relative">
              <button onClick={() => setShowMoreMenu(v => !v)} className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center hover:bg-foreground/[0.08] transition-colors"><MoreHorizontal size={12} /></button>
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-background border border-foreground/[0.08] rounded-xl shadow-lg py-1.5 w-48">
                    {[
                      { icon: Users, label: "Add Account" },
                      { icon: CalendarIcon, label: "Calendar Events" },
                      { icon: CircleDot, label: "Manage Labels" },
                      { icon: LayoutGrid, label: "Templates" },
                      { icon: Rss, label: "Content Recycling" },
                    ].map(item => (
                      <button key={item.label} onClick={() => { setShowMoreMenu(false); if (item.label === "Manage Labels") setShowManageLabels(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.82rem] font-medium hover:bg-foreground/[0.04] transition-colors">
                        <item.icon size={15} className="text-muted-foreground" /> {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      {showSearchBar && (
        <div className="border-b border-foreground/[0.06] px-5 py-3">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              autoFocus
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08] text-[0.84rem] font-body outline-none focus:border-accent/40 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="border-b border-foreground/[0.06] bg-foreground/[0.015] px-5 py-5">
          <h3 className="text-[0.95rem] font-bold mb-4">Filters</h3>
          <div className="flex divide-x divide-foreground/[0.08]">
            {/* Status */}
            <div className="flex-1 px-5">
              <h4 className="text-[0.82rem] font-bold mb-3">Status</h4>
              <div className="space-y-2">
                {[
                  { id: "all", label: "Select All", dot: null, icon: true },
                  { id: "scheduled", label: "Scheduled", dot: "bg-emerald-500" },
                  { id: "draft", label: "Draft", dot: "bg-foreground/30" },
                  { id: "published", label: "Published", dot: "bg-emerald-500" },
                  { id: "awaiting", label: "Awaiting Approval", dot: null },
                  { id: "failed", label: "Failed", dot: "bg-red-500" },
                ].map(s => {
                  const checked = s.id === "all" ? filterStatus.has("all") : filterStatus.has(s.id);
                  return (
                    <button key={s.id} onClick={() => {
                      if (s.id === "all") {
                        setFilterStatus(prev => prev.has("all") ? new Set() : new Set(["all"]));
                      } else {
                        setFilterStatus(prev => {
                          const next = new Set(prev);
                          next.delete("all");
                          next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                          return next;
                        });
                      }
                    }} className="flex items-center gap-2.5 w-full text-left group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? "border-foreground bg-foreground" : "border-foreground/20 group-hover:border-foreground/40"}`}>
                        {checked && <Check size={11} className="text-primary-foreground" />}
                      </div>
                      {s.dot && <div className={`w-2 h-2 rounded-full ${s.dot}`} />}
                      <span className="text-[0.82rem] font-medium">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Type */}
            <div className="flex-1 px-5">
              <h4 className="text-[0.82rem] font-bold mb-3">Content Type</h4>
              <div className="space-y-2">
                {[
                  { id: "post", label: "Post", icon: Image },
                  { id: "carousel", label: "Carousel", icon: LayoutGrid },
                  { id: "reel", label: "Reel", icon: Grid3X3 },
                  { id: "story", label: "Story", icon: Play },
                ].map(ct => {
                  const checked = filterContentType.has(ct.id);
                  return (
                    <button key={ct.id} onClick={() => {
                      setFilterContentType(prev => {
                        const next = new Set(prev);
                        next.has(ct.id) ? next.delete(ct.id) : next.add(ct.id);
                        return next;
                      });
                    }} className="flex items-center gap-2.5 w-full text-left group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? "border-foreground bg-foreground" : "border-foreground/20 group-hover:border-foreground/40"}`}>
                        {checked && <Check size={11} className="text-primary-foreground" />}
                      </div>
                      <ct.icon size={14} className="text-muted" />
                      <span className="text-[0.82rem] font-medium">{ct.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platforms */}
            <div className="flex-1 px-5">
              <h4 className="text-[0.82rem] font-bold mb-3">Platforms</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { id: "instagram", label: "Instagram" },
                  { id: "facebook", label: "Facebook" },
                  { id: "x", label: "Twitter/X" },
                  { id: "linkedin", label: "LinkedIn" },
                  { id: "tiktok", label: "TikTok" },
                  { id: "threads", label: "Threads" },
                  { id: "youtube", label: "YouTube" },
                  { id: "pinterest", label: "Pinterest" },
                ].map(p => {
                  const checked = filterPlatforms.has(p.id);
                  const platform = PLATFORMS.find(pl => pl.id === p.id);
                  return (
                    <button key={p.id} onClick={() => {
                      setFilterPlatforms(prev => {
                        const next = new Set(prev);
                        next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                        return next;
                      });
                    }} className="flex items-center gap-2 w-full text-left group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? "border-foreground bg-foreground" : "border-foreground/20 group-hover:border-foreground/40"}`}>
                        {checked && <Check size={11} className="text-primary-foreground" />}
                      </div>
                      <span style={{ color: platform?.color }}><PlatformIcon platformId={p.id} size={14} /></span>
                      <span className="text-[0.82rem] font-medium">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Labels */}
            <div className="flex-1 px-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[0.82rem] font-bold">Labels</h4>
                <button onClick={() => setShowManageLabels(true)} className="text-[0.72rem] font-semibold text-blue-500 hover:text-blue-600 transition-colors">Manage</button>
              </div>
              <div className="space-y-2">
                {[
                  { id: "influencer", label: "INFLUENCER", color: "border-foreground/20 text-foreground bg-foreground/[0.04]" },
                  { id: "educational", label: "EDUCATIONAL", color: "border-blue-200 text-blue-600 bg-blue-50" },
                  { id: "promotional", label: "PROMOTIONAL", color: "border-purple-200 text-purple-600 bg-purple-50" },
                  { id: "engagement", label: "ENGAGEMENT", color: "border-pink-200 text-pink-600 bg-pink-50" },
                  { id: "bts", label: "BEHIND THE SCENES", color: "border-amber-200 text-amber-600 bg-amber-50" },
                ].map(l => {
                  const checked = filterLabels.has(l.id);
                  return (
                    <button key={l.id} onClick={() => {
                      setFilterLabels(prev => {
                        const next = new Set(prev);
                        next.has(l.id) ? next.delete(l.id) : next.add(l.id);
                        return next;
                      });
                    }} className="flex items-center gap-2.5 w-full text-left group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? "border-foreground bg-foreground" : "border-foreground/20 group-hover:border-foreground/40"}`}>
                        {checked && <Check size={11} className="text-primary-foreground" />}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[0.68rem] font-bold tracking-[0.04em] border ${l.color}`}>{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      {activeView === "calendar" && (
        <div className="p-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-[0.72rem] font-semibold text-muted text-center py-1">{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7 border-t border-l border-foreground/[0.06]">
            {cells.map((day, i) => {
              const dayPosts = day ? posts.filter(p => p.day === day) : [];
              return (
                <div
                  key={i}
                  className="min-h-[120px] border-r border-b border-foreground/[0.06] p-1.5"
                >
                  {day && (
                    <>
                      <span className="text-[0.72rem] font-medium text-muted">{day}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayPosts.slice(0, 2).map((post, pi) => {
                          const platform = PLATFORMS.find(p => p.id === post.platform);
                          return (
                            <button
                              key={pi}
                              onClick={() => setSelectedPost(post)}
                              className="w-full text-left p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 hover:bg-emerald-100/70 transition-colors"
                            >
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: platform?.color }} />
                                <span className="text-[0.65rem] font-bold" style={{ color: platform?.color }}>{post.time}</span>
                              </div>
                              <div className="flex items-start gap-1 mt-0.5">
                                <span style={{ color: platform?.color }} className="shrink-0 mt-0.5"><PlatformIcon platformId={post.platform} size={12} /></span>
                                <p className="text-[0.65rem] text-foreground truncate leading-tight">{post.title}</p>
                              </div>
                              <span className={`inline-flex items-center justify-center mt-1 text-[0.58rem] font-bold px-1.5 py-0.5 rounded-full text-white ${
                                post.score >= 80 ? "bg-emerald-500" : post.score >= 60 ? "bg-amber-500" : "bg-red-500"
                              }`}>
                                {post.score}
                              </span>
                            </button>
                          );
                        })}
                        {dayPosts.length > 2 && (
                          <span className="text-[0.58rem] text-muted">+{dayPosts.length - 2} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Kanban View ─── */}
      {activeView === "kanban" && (
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {(["draft", "awaiting", "scheduled", "published"] as PostStatus[]).map(status => {
              const statusLabels: Record<PostStatus, string> = { draft: "Drafts", awaiting: "Awaiting Approval", scheduled: "Scheduled", published: "Published" };
              const statusPosts = posts.filter(p => p.status === status);
              return (
                <div key={status} className="bg-foreground/[0.02] rounded-xl border border-foreground/[0.06] p-3 min-h-[400px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[0.88rem] font-bold">{statusLabels[status]}</h3>
                      <span className="text-[0.78rem] text-muted-foreground font-medium">{statusPosts.length}</span>
                    </div>
                    <button className="text-muted hover:text-foreground"><Plus size={16} /></button>
                  </div>
                  {statusPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <p className="text-[0.85rem] font-medium">No Content</p>
                      <p className="text-[0.75rem]">Drag Posts Here Or Click + To Add</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {statusPosts.map((post, i) => {
                        const platform = PLATFORMS.find(p => p.id === post.platform);
                        return (
                          <button key={i} onClick={() => { setSelectedPost(post); setPostDetailTab("details"); }}
                            className="w-full text-left bg-background rounded-xl border border-foreground/[0.06] p-3 hover:border-foreground/[0.15] transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-4 h-4 rounded-full border border-foreground/[0.15]" />
                              <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-[0.6rem] font-bold">Y</div>
                              <span className="text-[0.78rem] font-semibold">@yourbrand</span>
                              <span style={{ color: platform?.color }} className="ml-auto"><PlatformIcon platformId={post.platform} size={14} /></span>
                              <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full ${
                                post.score >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              }`}>{post.score}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[0.7rem] text-muted-foreground mb-1.5">
                              <Pencil size={10} />
                              <span>{post.time}</span>
                              <span className="ml-1">{post.dateLabel.toUpperCase()}</span>
                            </div>
                            <p className="text-[0.78rem] text-foreground line-clamp-2 leading-snug">{post.caption.slice(0, 80)}...</p>
                            <div className="mt-2 w-full h-24 rounded-lg bg-emerald-50 flex items-center justify-center">
                              <div style={{ color: platform?.color }}><PlatformIcon platformId={post.platform} size={28} /></div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Grid View ─── */}
      {activeView === "grid" && (
        <div className="p-4">
          <div className="grid grid-cols-5 gap-4">
            {posts.map((post, i) => {
              const platform = PLATFORMS.find(p => p.id === post.platform);
              return (
                <button key={i} onClick={() => { setSelectedPost(post); setPostDetailTab("details"); }}
                  className="text-left bg-background rounded-xl border border-foreground/[0.06] overflow-hidden hover:border-foreground/[0.15] transition-colors group"
                >
                  <div className="h-40 bg-emerald-50 flex items-center justify-center relative">
                    <div style={{ color: platform?.color }} className="opacity-60 group-hover:opacity-80 transition-opacity">
                      <PlatformIcon platformId={post.platform} size={36} />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[0.78rem] font-semibold truncate flex-1 mr-2">{post.title}</p>
                      <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        post.score >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>{post.score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.72rem] text-muted-foreground">{post.dateLabel}</span>
                      <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded ${
                        post.status === "published" ? "bg-emerald-100 text-emerald-700" :
                        post.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                        "bg-foreground/[0.06] text-muted-foreground"
                      }`}>{post.status === "published" ? "Published" : post.status === "scheduled" ? "Scheduled" : "Draft"}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Plan View (Table) ─── */}
      {activeView === "plan" && (
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/[0.06]">
                {["PLATFORM", "CONTENT", "SCORE", "DATE", "TIME", "STATUS", ""].map(h => (
                  <th key={h} className="text-left text-[0.72rem] font-bold text-muted-foreground tracking-wider py-3 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => {
                const platform = PLATFORMS.find(p => p.id === post.platform);
                return (
                  <tr key={i} onClick={() => { setSelectedPost(post); setPostDetailTab("details"); }}
                    className="border-b border-foreground/[0.04] hover:bg-foreground/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ color: platform?.color, backgroundColor: `${platform?.color}15` }}>
                        <PlatformIcon platformId={post.platform} size={14} />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[0.82rem] font-medium">{post.title}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[0.72rem] font-bold text-white ${
                        post.score >= 80 ? "bg-emerald-500" : post.score >= 60 ? "bg-amber-500" : "bg-red-500"
                      }`}>{post.score}</span>
                    </td>
                    <td className="py-3 px-3 text-[0.82rem] text-muted-foreground">{post.dateLabel}</td>
                    <td className="py-3 px-3 text-[0.82rem] text-muted-foreground">{post.time}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-[0.72rem] font-semibold px-2.5 py-1 rounded-full ${
                        post.status === "published" ? "bg-emerald-100 text-emerald-700" :
                        post.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                        post.status === "awaiting" ? "bg-amber-100 text-amber-700" :
                        "bg-foreground/[0.06] text-muted-foreground"
                      }`}>
                        {post.status === "published" && <Check size={10} />}
                        {post.status === "draft" && <Pencil size={10} />}
                        {post.status === "published" ? "Published" : post.status === "scheduled" ? "Scheduled" : post.status === "awaiting" ? "Awaiting" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-3"><MoreHorizontal size={14} className="text-muted-foreground" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Feed View ─── */}
      {activeView === "feed" && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[0.88rem] font-bold flex items-center gap-2"><Grid3X3 size={14} /> Feed Preview</h3>
            <div className="flex items-center bg-foreground/[0.04] rounded-lg p-0.5">
              <button onClick={() => setFeedDevice("mobile")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${feedDevice === "mobile" ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </button>
              <button onClick={() => setFeedDevice("desktop")} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${feedDevice === "desktop" ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
              </button>
            </div>
          </div>
          <div className="flex gap-6">
            {/* Platform sidebar */}
            <div className="flex flex-col gap-2 pt-2">
              {["instagram", "tiktok", "linkedin", "x", "facebook"].map(pid => {
                const p = PLATFORMS.find(pl => pl.id === pid);
                return (
                  <button key={pid} onClick={() => setFeedPlatform(pid)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      feedPlatform === pid ? "ring-2 ring-offset-2 ring-accent" : "hover:bg-foreground/[0.04]"
                    }`}
                    style={{ color: p?.color }}
                  >
                    <PlatformIcon platformId={pid} size={20} />
                  </button>
                );
              })}
            </div>
            {/* Phone / Desktop mockup */}
            <div className="flex-1 flex justify-center">
              <div className={`bg-foreground/[0.03] border border-foreground/[0.08] overflow-hidden ${
                feedDevice === "mobile" ? "rounded-[2rem] w-[280px]" : "rounded-xl w-full max-w-[700px]"
              }`}>
                {/* Top bar */}
                <div className={`flex items-center justify-center gap-4 py-3 border-b border-foreground/[0.06] ${feedDevice === "mobile" ? "pt-6" : ""}`}>
                  <button className="text-muted-foreground"><Grid3X3 size={16} /></button>
                  <button className="text-muted-foreground"><LayoutGrid size={16} /></button>
                </div>
                {/* Grid of posts */}
                <div className={`grid gap-0.5 ${feedDevice === "mobile" ? "grid-cols-3" : "grid-cols-3"}`}>
                  {posts.slice(0, feedDevice === "mobile" ? 9 : 9).map((post, i) => {
                    const p = PLATFORMS.find(pl => pl.id === post.platform);
                    return (
                      <div key={i} onClick={() => { setSelectedPost(post); setPostDetailTab("details"); }}
                        className="aspect-square bg-emerald-50 flex items-center justify-center relative group cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div style={{ color: p?.color }} className="opacity-40">
                          <PlatformIcon platformId={post.platform} size={feedDevice === "mobile" ? 24 : 36} />
                        </div>
                        {post.contentType === "carousel" && (
                          <div className="absolute top-1.5 right-1.5"><LayoutGrid size={10} className="text-foreground/50" /></div>
                        )}
                        {post.contentType === "reel" && (
                          <div className="absolute top-1.5 right-1.5"><Play size={10} className="text-foreground/50" /></div>
                        )}
                        {/* Hover overlay with stats */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white">
                          <span className="flex items-center gap-1 text-[0.72rem] font-bold"><Heart size={12} /> {Math.floor(Math.random() * 2000 + 200).toLocaleString()}</span>
                          <span className="flex items-center gap-1 text-[0.72rem] font-bold"><MessageCircle size={12} /> {Math.floor(Math.random() * 100 + 10)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`py-4 ${feedDevice === "mobile" ? "pb-8" : ""}`} />
              </div>
            </div>
          </div>
          <p className="text-[0.75rem] text-muted-foreground mt-3">{posts.length} posts scheduled for {feedPlatform}</p>
        </div>
      )}

      {/* ─── Post Detail Modal (two-panel) ─── */}
      {selectedPost && (() => {
        const platform = PLATFORMS.find(p => p.id === selectedPost.platform);
        const captionScore = Math.min(100, selectedPost.score - 10);
        const hashtagScore = 100;
        const contentTypeScore = 100;
        const mediaScore = 90;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
            <div className="bg-background rounded-2xl shadow-2xl w-[90vw] max-w-[1100px] max-h-[85vh] flex overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Left panel — Details / Predictions */}
              <div className="w-[480px] border-r border-foreground/[0.06] flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-foreground/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: platform?.color }}>
                      <PlatformIcon platformId={selectedPost.platform} size={18} />
                    </div>
                    <div>
                      <h3 className="text-[0.92rem] font-bold">{platform?.label}</h3>
                      <p className="text-[0.72rem] text-muted-foreground">{selectedPost.contentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-muted hover:text-foreground"><MoreHorizontal size={18} /></button>
                    <button onClick={() => setSelectedPost(null)} className="text-muted hover:text-foreground"><X size={18} /></button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 px-5 border-b border-foreground/[0.06]">
                  <button onClick={() => setPostDetailTab("details")} className={`flex items-center gap-1.5 pb-3 pt-3 border-b-2 text-[0.82rem] font-medium transition-colors ${postDetailTab === "details" ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}>
                    <CalendarIcon size={13} /> Details
                  </button>
                  <button onClick={() => setPostDetailTab("predictions")} className={`flex items-center gap-1.5 pb-3 pt-3 border-b-2 text-[0.82rem] font-medium transition-colors ${postDetailTab === "predictions" ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}>
                    <TrendingUp size={13} /> Predictions
                  </button>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-5">
                  {postDetailTab === "details" && (
                    <div className="space-y-5">
                      {/* Draft toggle */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-foreground/[0.06] text-[0.78rem] font-semibold flex items-center gap-1.5">
                            <Pencil size={12} /> Draft
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.78rem] text-muted-foreground">Draft</span>
                          <div className="w-10 h-5 rounded-full bg-emerald-500 relative cursor-pointer">
                            <div className="absolute top-[2.5px] right-[2.5px] w-[15px] h-[15px] rounded-full bg-white shadow-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Content Score */}
                      <div>
                        <p className="text-[0.82rem] font-semibold text-muted-foreground mb-2">Content Score</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[1.2rem] font-black text-white ${
                            selectedPost.score >= 80 ? "bg-emerald-500" : selectedPost.score >= 60 ? "bg-amber-500" : "bg-red-500"
                          }`}>{selectedPost.score}</div>
                          <span className={`text-[0.92rem] font-bold ${
                            selectedPost.score >= 80 ? "text-emerald-500" : selectedPost.score >= 60 ? "text-amber-500" : "text-red-500"
                          }`}>{selectedPost.score >= 80 ? "Excellent" : selectedPost.score >= 60 ? "Good" : "Needs Work"}</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 text-[0.78rem] text-amber-700 mb-2">
                          <span>💡</span> <span>🔥 This post is optimized for maximum reach!</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 text-[0.78rem] mb-4">
                          <span>💡</span>
                          <span>Your biggest opportunity: <span className="text-emerald-600 font-semibold cursor-pointer">Upgrade your caption</span></span>
                        </div>
                      </div>

                      {/* Score breakdowns */}
                      {[
                        { label: "Caption Quality", icon: MessageCircle, score: captionScore, color: "bg-emerald-500" },
                        { label: "Hashtags", icon: Hash, score: hashtagScore, color: "bg-emerald-500" },
                        { label: "Content Type", icon: LayoutGrid, score: contentTypeScore, color: "bg-emerald-500" },
                        { label: "Media", icon: Image, score: mediaScore, color: "bg-emerald-500" },
                      ].map((item, idx) => (
                        <div key={item.label} className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <item.icon size={16} className="text-muted-foreground" />
                              <span className="text-[0.85rem] font-semibold">{item.label}</span>
                              <span className="text-[0.68rem] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Good</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[0.85rem] font-bold">{item.score}<span className="text-muted-foreground font-normal">/100</span></span>
                              {idx === 0 && <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-foreground/[0.04] text-[0.72rem] font-semibold hover:bg-foreground/[0.08] transition-colors"><Sparkles size={11} /> Improve</button>}
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-foreground/[0.06] overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                          </div>
                          {idx === 3 && <p className="text-[0.75rem] text-muted-foreground mt-2 flex items-center gap-1">💡 Short videos get 48% more views</p>}
                        </div>
                      ))}

                      {/* Date/time */}
                      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-[0.82rem]"><CalendarIcon size={14} className="text-muted-foreground" /> Sun, Jan {selectedPost.day}, 2026</div>
                        <div className="flex items-center gap-2 text-[0.82rem]"><Clock size={14} className="text-muted-foreground" /> {selectedPost.time}</div>
                      </div>

                      {/* Image placeholder */}
                      <div>
                        <p className="text-[0.82rem] font-semibold mb-2">Image</p>
                        <div className="w-full h-32 rounded-xl bg-emerald-50 flex items-center justify-center" style={{ color: platform?.color }}>
                          <PlatformIcon platformId={selectedPost.platform} size={40} />
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[0.82rem] font-semibold">Caption</p>
                          <button className="flex items-center gap-1 text-[0.75rem] font-semibold text-emerald-600 hover:text-emerald-700"><Sparkles size={12} /> AI Writer</button>
                        </div>
                        <p className="text-[0.82rem] text-foreground leading-relaxed">{selectedPost.caption}</p>
                      </div>

                      {/* Hashtags */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-[0.82rem] font-semibold">Hashtags</p>
                            <span className="text-[0.68rem] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-1"><Check size={10} /> Optimized</span>
                          </div>
                          <button className="flex items-center gap-1 text-[0.75rem] font-semibold text-emerald-600 hover:text-emerald-700"><Hash size={12} /> Suggestions</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-1.5">
                          {selectedPost.hashtags.map(h => (
                            <span key={h} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[0.78rem] font-medium border border-emerald-200">#{h.replace(/#/g, '')}</span>
                          ))}
                        </div>
                        <p className="text-[0.72rem] text-muted-foreground">{selectedPost.hashtags.length} hashtags · Optimal range (5-15)</p>
                      </div>
                    </div>
                  )}

                  {postDetailTab === "predictions" && (
                    <div className="space-y-5">
                      {/* Main prediction */}
                      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-6 text-center">
                        <p className="text-[0.82rem] text-muted-foreground mb-1">Predicted Engagement Rate</p>
                        <p className="text-3xl font-black">2.0%</p>
                        <p className="text-[0.78rem] text-muted-foreground mt-1">Based on AI analysis</p>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4 text-center">
                          <Eye size={18} className="mx-auto text-muted-foreground mb-1" />
                          <p className="text-xl font-black">5,234</p>
                          <p className="text-[0.75rem] text-muted-foreground">Est. Reach</p>
                        </div>
                        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4 text-center">
                          <Users size={18} className="mx-auto text-muted-foreground mb-1" />
                          <p className="text-xl font-black">87%</p>
                          <p className="text-[0.75rem] text-muted-foreground">Audience Match</p>
                        </div>
                        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4 text-center">
                          <Heart size={18} className="mx-auto text-red-400 mb-1" />
                          <p className="text-xl font-black">453</p>
                          <p className="text-[0.75rem] text-muted-foreground">Est. Likes</p>
                        </div>
                        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-4 text-center">
                          <MessageCircle size={18} className="mx-auto text-emerald-500 mb-1" />
                          <p className="text-xl font-black">34</p>
                          <p className="text-[0.75rem] text-muted-foreground">Est. Comments</p>
                        </div>
                      </div>

                      {/* Performance Insights */}
                      <div>
                        <h4 className="text-[0.88rem] font-bold mb-3">Performance Insights</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-[0.82rem]"><Clock size={14} className="text-amber-500" /> Best Time to Post</div>
                            <span className="text-[0.82rem] font-semibold">9:00 AM - 11:00 AM</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-[0.82rem]"><TrendingUp size={14} className="text-emerald-500" /> Content Quality</div>
                            <span className="text-[0.82rem] font-semibold text-emerald-600">Good</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-[0.82rem]"><Share2 size={14} className="text-blue-500" /> Est. Shares</div>
                            <span className="text-[0.82rem] font-semibold">2</span>
                          </div>
                        </div>
                      </div>

                      {/* Tip */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <p className="text-[0.82rem] text-amber-800">💡 <strong>Tip:</strong> Posts with 5-15 hashtags typically see 20% higher engagement on instagram.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-foreground/[0.06] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-[0.82rem] font-semibold">Auto Publish</p>
                        <p className="text-[0.72rem] text-muted-foreground">Post will be published automatically on schedule</p>
                      </div>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-emerald-500 relative cursor-pointer">
                      <div className="absolute top-[2.5px] right-[2.5px] w-[15px] h-[15px] rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-foreground/[0.1] text-[0.82rem] font-semibold hover:bg-foreground/[0.04] transition-colors">
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[0.82rem] font-bold hover:bg-emerald-600 transition-colors">
                      <CalendarIcon size={14} /> Reschedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Right panel — Platform Preview */}
              <div className="flex-1 bg-foreground/[0.02] flex flex-col overflow-y-auto">
                <div className="p-5 pb-0">
                  <h3 className="text-[0.92rem] font-bold mb-4">{platform?.label} Preview</h3>
                </div>
                <div className="flex-1 flex items-start justify-center p-5">
                  <div className="w-full max-w-[340px] bg-background rounded-xl border border-foreground/[0.06] overflow-hidden shadow-sm">
                    {/* Profile header */}
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-[0.7rem] font-bold">Y</div>
                        <span className="text-[0.82rem] font-semibold">@yourbrand</span>
                      </div>
                      <MoreHorizontal size={16} className="text-muted-foreground" />
                    </div>
                    {/* Image */}
                    <div className="w-full aspect-square bg-foreground/[0.04] flex items-center justify-center" style={{ color: platform?.color }}>
                      <PlatformIcon platformId={selectedPost.platform} size={64} />
                    </div>
                    {/* Carousel dots */}
                    {selectedPost.contentType === "carousel" && (
                      <div className="flex items-center justify-center gap-1 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                      </div>
                    )}
                    {/* Actions */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Heart size={20} className="text-foreground" />
                        <MessageCircle size={20} className="text-foreground" />
                        <Send size={20} className="text-foreground" />
                      </div>
                      <Bookmark size={20} className="text-foreground" />
                    </div>
                    {/* Caption preview */}
                    <div className="px-3 pb-3">
                      <p className="text-[0.78rem] leading-relaxed">
                        <span className="font-bold">@yourbrand</span>{" "}
                        {selectedPost.caption.slice(0, 200)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Export Posts modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-[90vw] max-w-[640px] max-h-[90vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4">
              <h3 className="text-[1.1rem] font-bold">Export Posts</h3>
              <button onClick={() => setShowExportModal(false)} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 space-y-3">
              {posts.map((post, i) => {
                const selected = exportSelected.has(i);
                const platform = PLATFORMS.find(p => p.id === post.platform);
                return (
                  <div
                    key={i}
                    onClick={() => setExportSelected(prev => {
                      const next = new Set(prev);
                      next.has(i) ? next.delete(i) : next.add(i);
                      return next;
                    })}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selected ? "border-emerald-400 bg-emerald-50/50" : "border-foreground/[0.06] hover:border-foreground/[0.12]"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      selected ? "bg-emerald-500 text-white" : "border-2 border-foreground/[0.15]"
                    }`}>
                      {selected && <Check size={13} />}
                    </div>
                    <div className="w-14 h-14 rounded-lg bg-foreground/[0.06] shrink-0 relative overflow-hidden flex items-center justify-center">
                      <div style={{ color: platform?.color }} className="opacity-50">
                        <PlatformIcon platformId={post.platform} size={20} />
                      </div>
                      <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-background shadow-sm" style={{ color: platform?.color }}>
                        <PlatformIcon platformId={post.platform} size={11} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.82rem] font-bold">{post.time}</span>
                        <span className="text-[0.78rem] text-muted-foreground">{post.dateLabel}</span>
                        <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          📫 {post.score > 70 ? post.score : 5}
                        </span>
                      </div>
                      <p className="text-[0.8rem] text-muted-foreground leading-snug line-clamp-2">{post.caption}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-foreground/[0.06] p-6 pt-4 flex items-center justify-between">
              <span className="text-[0.88rem] font-semibold text-emerald-600">{exportSelected.size} Posts selected</span>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.84rem] font-semibold hover:bg-foreground/[0.03] transition-colors">
                  <FileText size={15} /> PDF
                </button>
                <button onClick={() => setShowExportModal(false)} className="px-5 py-2.5 rounded-lg border border-foreground/[0.1] text-[0.84rem] font-semibold hover:bg-foreground/[0.03] transition-colors">
                  Cancel
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 text-white text-[0.84rem] font-bold hover:bg-emerald-600 transition-colors">
                  <Download size={15} /> Download file
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Labels modal */}
      {showManageLabels && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowManageLabels(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-[90vw] max-w-[520px] max-h-[90vh] overflow-y-auto p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[1.1rem] font-bold">Manage Labels</h3>
              <button onClick={() => setShowManageLabels(false)} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { label: "INFLUENCER", bg: "bg-foreground", dot: "bg-foreground" },
                { label: "EDUCATIONAL", bg: "bg-blue-500", dot: "bg-blue-500" },
                { label: "PROMOTIONAL", bg: "bg-purple-500", dot: "bg-purple-500" },
                { label: "ENGAGEMENT", bg: "bg-pink-500", dot: "bg-pink-500" },
                { label: "BEHIND THE SCENES", bg: "bg-amber-500", dot: "bg-amber-500" },
              ].map(l => (
                <div key={l.label} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-foreground/[0.04] transition-colors">
                  <div className="text-muted/30 cursor-grab">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.5"/><circle cx="11" cy="3" r="1.5"/><circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/><circle cx="5" cy="13" r="1.5"/><circle cx="11" cy="13" r="1.5"/></svg>
                  </div>
                  <div className={`w-7 h-7 rounded-full ${l.dot}`} />
                  <div className={`flex-1 ${l.bg} text-white text-[0.78rem] font-bold tracking-[0.04em] px-4 py-2.5 rounded-lg`}>
                    {l.label}
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/[0.06] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Add new label input */}
            <div className="border-2 border-dashed border-foreground/[0.12] rounded-xl p-4 mb-6">
              <input
                type="text"
                placeholder="LABEL NAME"
                className="w-full border-2 border-foreground/[0.15] rounded-lg px-4 py-3 text-[0.88rem] font-bold tracking-[0.04em] bg-transparent outline-none focus:border-foreground transition-colors mb-3 placeholder:text-muted/40"
              />
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  "bg-foreground/10", "bg-pink-200", "bg-red-300", "bg-rose-300",
                  "bg-orange-300", "bg-amber-300", "bg-yellow-200", "bg-lime-200",
                  "bg-green-300", "bg-emerald-300", "bg-teal-300", "bg-cyan-300",
                  "bg-sky-300", "bg-blue-300", "bg-indigo-200", "bg-violet-200",
                ].map((c, i) => (
                  <button key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-transparent hover:border-foreground/30 hover:scale-110 transition-all`} />
                ))}
              </div>
            </div>
            <div className="border-t border-foreground/[0.06] pt-4 flex justify-end">
              <button onClick={() => setShowManageLabels(false)} className="px-8 py-2.5 rounded-lg bg-emerald-500 text-white text-[0.88rem] font-bold hover:bg-emerald-600 transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Posting Schedule Modal ─── */}
      {showPostingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPostingSchedule(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-[90vw] max-w-[780px] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Posting Schedule</h2>
                  <p className="text-[0.82rem] text-muted-foreground">Optimize When You Post For Maximum Reach</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={scheduleAccount}
                  onChange={e => setScheduleAccount(e.target.value)}
                  className="border border-foreground/[0.12] rounded-lg px-3 py-2 text-[0.82rem] bg-background outline-none"
                >
                  <option>All Accounts</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>X / Twitter</option>
                  <option>TikTok</option>
                  <option>LinkedIn</option>
                </select>
                <button onClick={() => setShowPostingSchedule(false)} className="text-muted hover:text-foreground transition-colors"><X size={18} /></button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-foreground/[0.06]">
              {([
                { id: "schedule" as const, label: "Schedule", icon: CalendarIcon },
                { id: "analytics" as const, label: "Analytics", icon: LayoutGrid },
                { id: "general" as const, label: "General", icon: Settings },
              ]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setScheduleTab(t.id)}
                  className={`flex items-center gap-1.5 pb-3 border-b-2 text-[0.85rem] font-medium transition-colors ${
                    scheduleTab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Schedule Tab Content */}
            {scheduleTab === "schedule" && (
              <div className="p-6">
                {/* Day / Week toggle */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[0.82rem] text-muted-foreground font-medium">View:</span>
                  <div className="flex rounded-lg overflow-hidden border border-foreground/[0.1]">
                    <button
                      onClick={() => setScheduleView("day")}
                      className={`flex items-center gap-1.5 px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
                        scheduleView === "day" ? "bg-emerald-500 text-white" : "bg-background text-muted hover:bg-foreground/[0.04]"
                      }`}
                    >
                      <List size={13} /> Day
                    </button>
                    <button
                      onClick={() => setScheduleView("week")}
                      className={`flex items-center gap-1.5 px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
                        scheduleView === "week" ? "bg-emerald-500 text-white" : "bg-background text-muted hover:bg-foreground/[0.04]"
                      }`}
                    >
                      <LayoutGrid size={13} /> Week
                    </button>
                  </div>
                </div>

                <div className="flex gap-6">
                  {/* Days sidebar */}
                  <div className="w-[200px] shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[0.75rem] font-bold text-muted-foreground tracking-wider">DAYS</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500"><Sparkles size={14} /></span>
                        <span className="text-[0.72rem] font-semibold text-muted-foreground">AI</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-2 px-3">
                      <span className="text-[0.7rem] text-muted-foreground font-medium ml-auto w-10 text-center">Peak</span>
                      <span className="text-[0.7rem] text-muted-foreground font-medium w-10 text-center">Total</span>
                    </div>
                    <div className="space-y-1">
                      {DAYS.map(day => {
                        const data = scheduleData[day];
                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[0.82rem] font-medium transition-all ${
                              selectedDay === day
                                ? "bg-emerald-500 text-white"
                                : "text-foreground hover:bg-foreground/[0.04]"
                            }`}
                          >
                            <span className="flex-1 text-left">{day}</span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.72rem] font-bold ${
                              selectedDay === day ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                            }`}>{data.peak}</span>
                            <span className={`w-6 text-center text-[0.78rem] ${selectedDay === day ? "text-white/80" : "text-muted-foreground"}`}>{data.total}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 px-1">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[0.72rem] text-muted-foreground">Peak</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[0.72rem] text-muted-foreground">Good</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-foreground/30" /><span className="text-[0.72rem] text-muted-foreground">Low</span></div>
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="flex-1 border-l border-foreground/[0.06] pl-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{selectedDay}</h3>
                        <p className="text-[0.8rem] text-muted-foreground">{scheduleData[selectedDay].total} Posting Times Scheduled</p>
                      </div>
                      <button className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground hover:text-foreground transition-colors">
                        <Trash2 size={14} /> Clear Day
                      </button>
                    </div>
                    <div className="space-y-3">
                      {scheduleData[selectedDay].slots.map((slot, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            slot.type === "peak" ? "bg-emerald-500" : slot.type === "good" ? "bg-blue-500" : "bg-foreground/20"
                          } text-white`}>
                            <CalendarIcon size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[0.92rem] font-bold">{slot.time}</span>
                              <span className={`px-2 py-0.5 rounded text-[0.68rem] font-bold uppercase tracking-wider ${
                                slot.type === "peak" ? "bg-emerald-100 text-emerald-700" :
                                slot.type === "good" ? "bg-blue-100 text-blue-700" :
                                "bg-foreground/[0.08] text-muted-foreground"
                              }`}>{slot.type}</span>
                            </div>
                            <p className="text-[0.78rem] text-muted-foreground mt-0.5">{slot.desc}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                            {slot.reach}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {scheduleTab === "analytics" && (
              <div className="p-6 space-y-5">
                {/* Engagement Trends */}
                <div className="border border-foreground/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <h3 className="font-bold">Engagement Trends</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-foreground/[0.06] rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-500">2.4K</p>
                      <p className="text-[0.78rem] text-muted-foreground mt-1">Avg. Peak Reach</p>
                    </div>
                    <div className="border border-foreground/[0.06] rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-500">1.5K</p>
                      <p className="text-[0.78rem] text-muted-foreground mt-1">Avg. Good Reach</p>
                    </div>
                    <div className="border border-foreground/[0.06] rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">18%</p>
                      <p className="text-[0.78rem] text-muted-foreground mt-1">Engagement Rate</p>
                    </div>
                  </div>
                </div>
                {/* Audience Activity */}
                <div className="border border-foreground/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <h3 className="font-bold">Audience Activity</h3>
                  </div>
                  <p className="text-[0.85rem] text-muted-foreground">Your audience is most active on <span className="font-bold text-foreground">Wednesdays</span> and <span className="font-bold text-foreground">Sundays</span> between 6-8 PM.</p>
                </div>
              </div>
            )}

            {/* General Tab */}
            {scheduleTab === "general" && (
              <div className="p-6 space-y-5">
                {/* Timezone */}
                <div className="border border-foreground/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    <h3 className="font-bold">Timezone Settings</h3>
                  </div>
                  <select className="w-full border border-foreground/[0.12] rounded-lg px-4 py-3 text-[0.85rem] bg-background outline-none">
                    <option>Pacific Time (UTC-8)</option>
                    <option>Mountain Time (UTC-7)</option>
                    <option>Central Time (UTC-6)</option>
                    <option>Eastern Time (UTC-5)</option>
                    <option>GMT (UTC+0)</option>
                    <option>Central European (UTC+1)</option>
                    <option>India Standard (UTC+5:30)</option>
                    <option>Japan Standard (UTC+9)</option>
                  </select>
                </div>
                {/* Posting Preferences */}
                <div className="border border-foreground/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings size={18} />
                    <h3 className="font-bold">Posting Preferences</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[0.85rem] font-medium">Auto-Schedule Posts</p>
                        <p className="text-[0.78rem] text-muted-foreground">Automatically schedule based on optimal times</p>
                      </div>
                      <div className="w-11 h-6 rounded-full bg-foreground/20 relative cursor-pointer">
                        <div className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[0.85rem] font-medium">Smart Suggestions</p>
                        <p className="text-[0.78rem] text-muted-foreground">Get AI recommendations for posting times</p>
                      </div>
                      <div className="w-11 h-6 rounded-full bg-emerald-500 relative cursor-pointer">
                        <div className="absolute top-[3px] right-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/[0.06]">
              <button className="px-4 py-2 rounded-lg border border-foreground/[0.12] text-[0.82rem] text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                Clear All
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPostingSchedule(false)} className="px-5 py-2.5 rounded-lg text-[0.85rem] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button onClick={() => setShowPostingSchedule(false)} className="px-6 py-2.5 rounded-lg bg-emerald-500 text-white text-[0.85rem] font-bold hover:bg-emerald-600 transition-colors">
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
