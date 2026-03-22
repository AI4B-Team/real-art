import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  List, LayoutGrid, Columns, Grid3X3, Rss,
  Trash2, Settings, Sparkles, Plus, ChevronDown, Search, Filter as FilterIcon, Download, MoreHorizontal,
  Image, Play, LayoutList, CircleDot, Check,
} from "lucide-react";

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
function generateDummyPosts(month: number, year: number) {
  const titles = [
    "Content Strategy Secrets!", "Visual Identity Vibe Check!", "Your Creative Superpower?",
    "Nail Your Niche! 🤩", "Unleash Your Creative Brand!", "Engagement Tactics REEL!",
    "What's Your Superpower Story?", "Brainstorming Blitz!", "Content Strategy Poll! 📊",
  ];
  const posts: { day: number; time: string; title: string; platform: string; score: number }[] = [];
  for (let d = 4; d <= 28; d += 1) {
    if (Math.random() > 0.45) {
      posts.push({
        day: d,
        time: `${Math.floor(Math.random() * 12 + 1)}:${Math.random() > 0.5 ? "30" : "00"} ${Math.random() > 0.5 ? "AM" : "PM"}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        platform: PLATFORMS[Math.floor(Math.random() * 4)].id,
        score: Math.floor(Math.random() * 30 + 65),
      });
    }
  }
  return posts;
}

/* ─── Component ──────────────────────────────── */

interface SocialContentPanelProps {
  onClose: () => void;
}

export default function SocialContentPanel({ onClose }: SocialContentPanelProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(["facebook", "instagram"]));
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
  const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);
  const [showBrandPrompt, setShowBrandPrompt] = useState(false);
  const [showManageLabels, setShowManageLabels] = useState(false);
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
    <div className="border-t border-foreground/[0.08] bg-background mt-3 overflow-hidden w-full">
      {/* Platform selection */}
      <div className="p-4 border-b border-foreground/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[0.88rem] font-bold text-center flex-1">Choose Your Platforms To Generate 7 Days Of Content For Each One</h3>
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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/[0.06]">
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
        <div className="flex items-center gap-2">
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
            Brand
            <div className={`w-8 h-[18px] rounded-full relative transition-colors ${brandEnabled ? "bg-accent" : "bg-foreground/20"}`}>
              <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all ${brandEnabled ? "left-[16px]" : "left-[2px]"}`} />
            </div>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-[0.78rem] font-bold hover:bg-accent/85 transition-colors">
            <Plus size={13} /> New Post <ChevronDown size={11} />
          </button>
        </div>
      </div>

      {/* Calendar sub-header */}
      {activeView === "calendar" && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-foreground/[0.04] text-[0.75rem] font-medium">
              <Grid3X3 size={12} /> Month <ChevronDown size={10} />
            </button>
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
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center"><Search size={12} /></button>
            <button onClick={() => setShowFilters(v => !v)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${showFilters ? "bg-accent text-white" : "bg-foreground/[0.04]"}`}><FilterIcon size={12} /></button>
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center"><Download size={12} /></button>
            <button className="w-6 h-6 rounded-lg bg-foreground/[0.04] flex items-center justify-center"><MoreHorizontal size={12} /></button>
          </div>
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="border-b border-foreground/[0.06] bg-foreground/[0.015] px-5 py-5">
          <h3 className="text-[0.95rem] font-bold mb-4">Filters</h3>
          <div className="grid grid-cols-4 gap-6">
            {/* Status */}
            <div>
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
            <div>
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
            <div>
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
            <div>
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
                              className="w-full text-left p-1.5 rounded-lg bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-colors"
                            >
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: platform?.color }} />
                                <span className="text-[0.62rem] font-medium" style={{ color: platform?.color }}>{post.time}</span>
                              </div>
                              <p className="text-[0.65rem] text-foreground truncate leading-tight mt-0.5">{post.title}</p>
                              <span className="text-[0.6rem] font-bold" style={{ color: post.score >= 80 ? "#22c55e" : post.score >= 60 ? "#f59e0b" : "#ef4444" }}>
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

      {/* Non-calendar views placeholder */}
      {activeView !== "calendar" && (
        <div className="flex items-center justify-center py-16 text-muted">
          <div className="text-center">
            <Grid3X3 size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-[0.85rem] font-medium">{VIEW_TABS.find(t => t.id === activeView)?.label} View</p>
            <p className="text-[0.75rem] text-muted/60">Coming soon</p>
          </div>
        </div>
      )}

      {/* Post detail modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
          <div className="bg-background rounded-2xl shadow-2xl w-[90vw] max-w-[700px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-foreground/[0.06]">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: PLATFORMS.find(p => p.id === selectedPost.platform)?.color }}
                >
                  <PlatformIcon platformId={selectedPost.platform} size={16} />
                </div>
                <div>
                  <h3 className="text-[0.88rem] font-bold">{PLATFORMS.find(p => p.id === selectedPost.platform)?.label}</h3>
                  <p className="text-[0.7rem] text-muted">carousel</p>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="p-5">
              {/* Content Score */}
              <h4 className="text-[0.82rem] font-semibold text-muted mb-2">Content Score</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[1.1rem] font-black text-white ${
                  selectedPost.score >= 80 ? "bg-green-500" : selectedPost.score >= 60 ? "bg-amber-500" : "bg-red-500"
                }`}>
                  {selectedPost.score}
                </div>
                <span className={`text-[0.88rem] font-bold ${
                  selectedPost.score >= 80 ? "text-green-500" : selectedPost.score >= 60 ? "text-amber-500" : "text-red-500"
                }`}>
                  {selectedPost.score >= 80 ? "Great" : selectedPost.score >= 60 ? "Good" : "Needs Work"}
                </span>
              </div>

              {/* Scores breakdown */}
              <div className="space-y-3 mb-4">
                {[
                  { label: "Caption Quality", score: Math.min(100, selectedPost.score - 10), status: "Fixable" },
                  { label: "Hashtags", score: 100, status: "Good" },
                  { label: "Content Type", score: 100, status: "Good" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.82rem] font-medium">{item.label}</span>
                      <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded ${
                        item.status === "Good" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>{item.status}</span>
                    </div>
                    <span className="text-[0.82rem] font-bold">{item.score}/100</span>
                  </div>
                ))}
              </div>

              <p className="text-[0.82rem] font-semibold mb-2">{selectedPost.title}</p>
              <p className="text-[0.78rem] text-muted/70 leading-relaxed">
                Hey creatives! 🚀 We're diving into what makes you uniquely YOU. What's one 'superpower' or unique skill you bring to your personal brand?
              </p>

              <div className="flex items-center gap-2 mt-5">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-foreground/[0.1] text-[0.82rem] font-semibold hover:bg-foreground/[0.04] transition-colors">
                  ✏️ Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-[0.82rem] font-bold hover:bg-accent/85 transition-colors">
                  🔄 Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Labels modal */}
      {showManageLabels && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowManageLabels(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-[90vw] max-w-[520px] p-6" onClick={e => e.stopPropagation()}>
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
    </div>
  );
}
