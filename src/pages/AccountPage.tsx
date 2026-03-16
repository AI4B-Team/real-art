import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Settings, DollarSign, Bell, Megaphone, ChevronRight, ArrowRight,
  Eye, MousePointerClick, TrendingUp, Plus, Pause, Play, Trash2,
  Download, Users, Heart, Globe, Search, Key, Shield, Lock, Mail,
  AlertTriangle, XCircle, Check, X, User, MessageSquare, Upload,
  Layout as LayoutIcon
} from "lucide-react";
import Footer from "@/components/Footer";
import PageShell from "@/components/PageShell";

/* ═══ EARNINGS DATA ═══ */
const earningsData = [
  { month: "Oct", amount: 142 },
  { month: "Nov", amount: 218 },
  { month: "Dec", amount: 189 },
  { month: "Jan", amount: 304 },
  { month: "Feb", amount: 276 },
  { month: "Mar", amount: 412 },
];
const maxEarning = Math.max(...earningsData.map(d => d.amount));

/* ═══ ADS DATA ═══ */
type CampaignStatus = "active" | "paused" | "draft" | "completed";

interface MockCampaign {
  id: string;
  title: string;
  brandName: string;
  imageUrl: string;
  status: CampaignStatus;
  placements: string[];
  impressions: number;
  clicks: number;
  spent: number;
  budget: number;
  ctr: number;
}

const mockCampaigns: MockCampaign[] = [
  { id: "1", title: "Spring Collection Launch", brandName: "LuminaAI", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop&q=80", status: "active", placements: ["Explore Feed", "Search Results"], impressions: 24800, clicks: 1247, spent: 89.50, budget: 200, ctr: 5.03 },
  { id: "2", title: "AI Art Workshop Promo", brandName: "DreamForge", imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=500&fit=crop&q=80", status: "paused", placements: ["Image Sidebar"], impressions: 8420, clicks: 312, spent: 31.20, budget: 100, ctr: 3.71 },
  { id: "3", title: "Premium Texture Pack", brandName: "SpectraGen", imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=500&fit=crop&q=80", status: "draft", placements: ["Explore Feed", "Search Results", "Image Sidebar"], impressions: 0, clicks: 0, spent: 0, budget: 150, ctr: 0 },
];

const campaignStatusColors: Record<CampaignStatus, string> = {
  active: "bg-green-500/10 text-green-600",
  paused: "bg-yellow-500/10 text-yellow-600",
  draft: "bg-muted/50 text-muted-foreground",
  completed: "bg-accent/10 text-accent",
};

const placementIcons: Record<string, typeof Globe> = {
  "Explore Feed": LayoutIcon,
  "Search Results": Search,
  "Image Sidebar": Globe,
};

/* ═══ NOTIFICATIONS DATA ═══ */
const recentActivity = [
  { text: "Your image Cosmic Dreamscape was downloaded", time: "2 min ago", icon: Download },
  { text: "NeoPixel started following you", time: "18 min ago", icon: Users },
  { text: "You earned $12.00 from an affiliate referral", time: "1 hr ago", icon: DollarSign },
  { text: "34 people liked Neon Boulevard today", time: "2 hr ago", icon: Heart },
  { text: "Your image Abstract Mind was downloaded", time: "3 hr ago", icon: Download },
  { text: "You earned $24.00 from an affiliate referral", time: "5 hr ago", icon: DollarSign },
];

/* ═══ SIDEBAR TABS ═══ */
const tabs = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "password", label: "Password & Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "earnings", label: "Earnings", icon: DollarSign },
  { id: "ads", label: "Sponsored Ads", icon: Megaphone },
  { id: "delete", label: "Delete Account", icon: XCircle },
];

const AccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sectionParam = new URLSearchParams(location.search).get("section") || "settings";
  const setSection = (s: string) => navigate(`/account?section=${s}`);

  const [commentsDefault, setCommentsDefault] = useState(() => {
    try { return localStorage.getItem("ra_comments_default") !== "0"; } catch { return true; }
  });
  const [allowDMs, setAllowDMs] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [downloadNotifs, setDownloadNotifs] = useState(true);
  const [followerNotifs, setFollowerNotifs] = useState(true);
  const [earningsNotifs, setEarningsNotifs] = useState(true);

  // Delete account flow
  const [deleteStep, setDeleteStep] = useState(0); // 0 = not started, 1-4 = steps
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // Ads
  const [adsView, setAdsView] = useState<"campaigns" | "create">("campaigns");
  const [newCampaign, setNewCampaign] = useState({
    title: "", brandName: "", imageUrl: "", destinationUrl: "",
    placements: [] as string[], dailyBudget: "5.00", totalBudget: "50.00", tags: "",
  });

  const togglePlacement = (p: string) => {
    setNewCampaign(prev => ({
      ...prev,
      placements: prev.placements.includes(p) ? prev.placements.filter(x => x !== p) : [...prev.placements, p],
    }));
  };

  const totalImpressions = mockCampaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = mockCampaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSpent = mockCampaigns.reduce((s, c) => s + c.spent, 0);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-[22px] rounded-full relative transition-colors shrink-0 cursor-pointer ${value ? "bg-accent" : "bg-foreground/[0.12]"}`}
    >
      <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-primary-foreground shadow transition-transform ${value ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
    </button>
  );

  return (
    <PageShell>
      <div className="px-6 md:px-10 py-8 min-h-[calc(100vh-4rem)]">
        <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-1">Account</h1>
        <p className="text-[0.82rem] text-muted mb-8">Manage your profile, security, notifications, earnings, and ads</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <nav className="lg:w-[220px] shrink-0">
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSection(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[0.82rem] font-medium whitespace-nowrap transition-colors w-full text-left ${
                    sectionParam === tab.id
                      ? "bg-foreground text-primary-foreground"
                      : tab.id === "delete"
                        ? "text-destructive hover:bg-destructive/5"
                        : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ═══ SETTINGS ═══ */}
            {sectionParam === "settings" && (
              <>
                {/* Profile */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> Profile</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-[1.1rem] font-bold text-accent">AV</div>
                    <button className="text-[0.82rem] text-accent hover:underline">Change photo</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[0.78rem] font-semibold mb-1.5">Display name</label>
                      <input defaultValue="AI.Verse" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[0.78rem] font-semibold mb-1.5">Username</label>
                      <input defaultValue="aiverse" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Email</label>
                    <input defaultValue="aiverse@email.com" type="email" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Bio</label>
                    <textarea defaultValue="Generative art explorer specializing in cosmic and abstract digital landscapes." className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors resize-none h-20" />
                  </div>
                  <div className="mb-5">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Website</label>
                    <input defaultValue="https://aiverse.art" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <button className="bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
                    Save Changes
                  </button>
                </div>

                {/* Payout Settings */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5 flex items-center gap-2"><DollarSign className="w-4 h-4 text-accent" /> Payout Settings</h3>
                  <div className="mb-4">
                    <label className="block text-[0.78rem] font-semibold mb-2">Payout method</label>
                    <div className="flex gap-2">
                      {["PayPal", "Stripe", "Bank Transfer"].map((m, i) => (
                        <button key={m} className={`px-4 py-2 rounded-lg text-[0.82rem] font-medium border transition-colors ${i === 0 ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.1] text-muted hover:border-foreground/30"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-[0.78rem] font-semibold mb-1.5">PayPal email</label>
                    <input defaultValue="aiverse@email.com" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <button className="bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
                    Update Payout
                  </button>
                </div>

                {/* Content Preferences */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-accent" /> Content Preferences</h3>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.86rem] font-semibold">Allow comments by default</div>
                        <div className="text-[0.75rem] text-muted">New uploads will have comments enabled or disabled by default</div>
                      </div>
                      <Toggle
                        value={commentsDefault}
                        onChange={(next) => {
                          setCommentsDefault(next);
                          try { next ? localStorage.removeItem("ra_comments_default") : localStorage.setItem("ra_comments_default", "0"); } catch {}
                        }}
                      />
                    </div>
                    <div className="h-px bg-foreground/[0.04]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.86rem] font-semibold">Allow direct messages</div>
                        <div className="text-[0.75rem] text-muted">Other creators can send you direct messages</div>
                      </div>
                      <Toggle value={allowDMs} onChange={setAllowDMs} />
                    </div>
                    <div className="h-px bg-foreground/[0.04]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.86rem] font-semibold">Show activity status</div>
                        <div className="text-[0.75rem] text-muted">Let others see when you're online</div>
                      </div>
                      <Toggle value={showActivity} onChange={setShowActivity} />
                    </div>
                  </div>
                </div>

                {/* Data & Privacy */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
                  <h3 className="font-semibold text-[0.95rem] mb-5 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> Data & Privacy</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="text-[0.82rem] font-medium border border-foreground/[0.1] px-4 py-2 rounded-lg hover:border-foreground/30 transition-colors flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" /> Download my data
                    </button>
                    <Link to="/privacy" className="text-[0.82rem] font-medium border border-foreground/[0.1] px-4 py-2 rounded-lg hover:border-foreground/30 transition-colors no-underline text-foreground flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> Privacy policy
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* ═══ PASSWORD & SECURITY ═══ */}
            {sectionParam === "password" && (
              <>
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5 flex items-center gap-2"><Lock className="w-4 h-4 text-accent" /> Change Password</h3>
                  <div className="max-w-md flex flex-col gap-4">
                    <div>
                      <label className="block text-[0.78rem] font-semibold mb-1.5">Current password</label>
                      <input type="password" placeholder="Enter current password" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[0.78rem] font-semibold mb-1.5">New password</label>
                      <input type="password" placeholder="Enter new password" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                      <p className="text-[0.72rem] text-muted mt-1.5">Must be at least 8 characters with a number and special character</p>
                    </div>
                    <div>
                      <label className="block text-[0.78rem] font-semibold mb-1.5">Confirm new password</label>
                      <input type="password" placeholder="Confirm new password" className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors" />
                    </div>
                    <button className="bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors self-start mt-1">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> Two-Factor Authentication</h3>
                  <p className="text-[0.82rem] text-muted mb-4">Add an extra layer of security to your account by requiring a verification code on login.</p>
                  <button className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors">
                    <Shield className="w-4 h-4" /> Enable 2FA
                  </button>
                </div>

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
                  <h3 className="font-semibold text-[0.95rem] mb-5 flex items-center gap-2"><Key className="w-4 h-4 text-accent" /> Active Sessions</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { device: "Chrome on MacOS", location: "New York, US", current: true, lastActive: "Active now" },
                      { device: "Safari on iPhone", location: "New York, US", current: false, lastActive: "2 hours ago" },
                      { device: "Firefox on Windows", location: "London, UK", current: false, lastActive: "3 days ago" },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-foreground/[0.04] last:border-0">
                        <div>
                          <div className="text-[0.84rem] font-medium flex items-center gap-2">
                            {session.device}
                            {session.current && <span className="text-[0.65rem] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md">Current</span>}
                          </div>
                          <div className="text-[0.72rem] text-muted">{session.location} · {session.lastActive}</div>
                        </div>
                        {!session.current && (
                          <button className="text-[0.78rem] text-destructive hover:underline">Revoke</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="text-[0.82rem] font-medium text-destructive border border-destructive/20 px-4 py-2 rounded-lg hover:bg-destructive/5 transition-colors mt-4">
                    Revoke all other sessions
                  </button>
                </div>
              </>
            )}

            {/* ═══ NOTIFICATIONS ═══ */}
            {sectionParam === "notifications" && (
              <>
                {/* Notification Preferences */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5 flex items-center gap-2"><Mail className="w-4 h-4 text-accent" /> Notification Preferences</h3>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.86rem] font-semibold">Email notifications</div>
                        <div className="text-[0.75rem] text-muted">Receive important updates via email</div>
                      </div>
                      <Toggle value={emailNotifs} onChange={setEmailNotifs} />
                    </div>
                    <div className="h-px bg-foreground/[0.04]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.86rem] font-semibold">Download alerts</div>
                        <div className="text-[0.75rem] text-muted">When someone downloads your content</div>
                      </div>
                      <Toggle value={downloadNotifs} onChange={setDownloadNotifs} />
                    </div>
                    <div className="h-px bg-foreground/[0.04]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.86rem] font-semibold">New followers</div>
                        <div className="text-[0.75rem] text-muted">When someone starts following you</div>
                      </div>
                      <Toggle value={followerNotifs} onChange={setFollowerNotifs} />
                    </div>
                    <div className="h-px bg-foreground/[0.04]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.86rem] font-semibold">Earnings updates</div>
                        <div className="text-[0.75rem] text-muted">When you earn affiliate commissions</div>
                      </div>
                      <Toggle value={earningsNotifs} onChange={setEarningsNotifs} />
                    </div>
                  </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                  <h3 className="font-semibold text-[0.9rem] mb-4">Recent Notifications</h3>
                  <div className="flex flex-col">
                    {recentActivity.map((a, i) => (
                      <div key={i} className={`flex items-center gap-3 py-3.5 ${i < recentActivity.length - 1 ? "border-b border-foreground/[0.04]" : ""}`}>
                        <div className="w-7 h-7 rounded-lg bg-foreground/[0.05] flex items-center justify-center shrink-0">
                          <a.icon className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className={`text-[0.84rem] flex-1 ${i < 3 ? "text-foreground font-medium" : "text-muted"}`}>{a.text}</span>
                        <span className="text-[0.72rem] text-muted/60 shrink-0 ml-4">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ EARNINGS ═══ */}
            {sectionParam === "earnings" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "This month", value: "$412.00", sub: "+49% vs last month", color: "text-green-500" },
                    { label: "Pending payout", value: "$127.40", sub: "Pays out March 31", color: "text-orange-500" },
                    { label: "All time earned", value: "$2,840.00", sub: "Since Jan 2024", color: "" },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                      <div className="text-[0.78rem] text-muted mb-2">{s.label}</div>
                      <div className={`font-display text-[2rem] font-black tracking-[-0.03em] leading-none ${s.color}`}>{s.value}</div>
                      <div className="text-[0.72rem] text-muted mt-1">{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-semibold text-[0.9rem]">Affiliate Earnings</h3>
                      <div className="font-display text-[1.4rem] font-black tracking-[-0.02em] text-accent mt-0.5">${earningsData.reduce((s, d) => s + d.amount, 0).toLocaleString()}</div>
                    </div>
                    <span className="text-[0.72rem] text-muted">Last 6 months</span>
                  </div>
                  <div className="flex items-end gap-3 h-[140px]">
                    {earningsData.map(d => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[0.65rem] text-muted">${d.amount}</span>
                        <div className="w-full bg-accent/20 rounded-t-lg relative" style={{ height: `${(d.amount / maxEarning) * 100}%` }}>
                          <div className="absolute inset-0 bg-accent rounded-t-lg" />
                        </div>
                        <span className="text-[0.68rem] text-muted">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-6">
                  <h3 className="font-semibold text-[0.9rem] mb-4">Recent Transactions</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { date: "Mar 14", type: "Affiliate — Pro Plan", amount: "+$24.00", ref: "via Cosmic Dreamscape" },
                      { date: "Mar 13", type: "Affiliate — Annual Plan", amount: "+$48.00", ref: "via Avatar Collection" },
                      { date: "Mar 12", type: "Affiliate — Monthly Plan", amount: "+$12.00", ref: "via Neon Boulevard" },
                      { date: "Mar 10", type: "Affiliate — Monthly Plan", amount: "+$12.00", ref: "via Abstract Fire" },
                      { date: "Mar 8", type: "Affiliate — Pro Plan", amount: "+$24.00", ref: "via Digital Avatar 01" },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-foreground/[0.04] last:border-0">
                        <div>
                          <div className="text-[0.82rem]"><span className="text-muted">{t.date}</span> — {t.type}</div>
                          <div className="text-[0.72rem] text-muted">{t.ref}</div>
                        </div>
                        <span className="text-[0.88rem] font-semibold text-green-500">{t.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
                  <h3 className="font-semibold text-[0.9rem] mb-1">Earn more — upgrade your tier</h3>
                  <p className="text-[0.82rem] text-muted mb-3">You're on Starter (20%). Hit 10 referrals this month to unlock Creator tier (30%).</p>
                  <Link to="/affiliates" className="text-[0.82rem] text-accent font-semibold hover:underline flex items-center gap-1">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}

            {/* ═══ ADS ═══ */}
            {sectionParam === "ads" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-[1.5rem] font-black tracking-[-0.03em] leading-none">Sponsored Ads</h2>
                    <p className="text-[0.82rem] text-muted mt-1">Promote your images across REAL ART</p>
                  </div>
                  <button
                    onClick={() => setAdsView(adsView === "campaigns" ? "create" : "campaigns")}
                    className="flex items-center gap-2 bg-foreground text-primary-foreground text-[0.82rem] font-semibold px-5 py-2.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    {adsView === "campaigns" ? <><Plus className="w-4 h-4" /> New Campaign</> : <><ArrowRight className="w-4 h-4 rotate-180" /> Back</>}
                  </button>
                </div>

                {adsView === "campaigns" ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                      {[
                        { icon: Eye, label: "Impressions", value: totalImpressions.toLocaleString() },
                        { icon: MousePointerClick, label: "Clicks", value: totalClicks.toLocaleString() },
                        { icon: TrendingUp, label: "Avg CTR", value: totalClicks > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` : "0%" },
                        { icon: DollarSign, label: "Spent", value: `$${totalSpent.toFixed(2)}` },
                      ].map(stat => (
                        <div key={stat.label} className="bg-card border border-foreground/[0.08] rounded-xl p-4 flex flex-col items-center justify-center">
                          <stat.icon className="w-4 h-4 mb-2 text-accent" />
                          <div className="font-display font-black text-[1.1rem] tracking-[-0.02em]">{stat.value}</div>
                          <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em] mt-0.5">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {mockCampaigns.map(campaign => (
                        <div key={campaign.id} className="bg-card border border-foreground/[0.08] rounded-xl p-4 flex items-center gap-4 hover:border-foreground/[0.16] transition-all">
                          <img src={campaign.imageUrl} alt={campaign.title} className="w-16 h-20 rounded-lg object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[0.9rem] truncate">{campaign.title}</h3>
                              <span className={`text-[0.62rem] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md ${campaignStatusColors[campaign.status]}`}>
                                {campaign.status}
                              </span>
                            </div>
                            <div className="text-[0.72rem] text-muted mb-2">{campaign.brandName}</div>
                            <div className="flex items-center gap-3 flex-wrap">
                              {campaign.placements.map(p => {
                                const Icon = placementIcons[p] || Globe;
                                return <span key={p} className="flex items-center gap-1 text-[0.65rem] text-muted"><Icon className="w-3 h-3" /> {p}</span>;
                              })}
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-6 shrink-0">
                            {[
                              { v: campaign.impressions.toLocaleString(), l: "Impressions" },
                              { v: campaign.clicks.toLocaleString(), l: "Clicks" },
                              { v: `${campaign.ctr}%`, l: "CTR" },
                              { v: `$${campaign.spent.toFixed(2)}`, l: "Spent" },
                            ].map(s => (
                              <div key={s.l} className="text-center">
                                <div className="font-display font-bold text-[0.9rem]">{s.v}</div>
                                <div className="text-[0.6rem] text-muted uppercase">{s.l}</div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {campaign.status === "active" && (
                              <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-foreground/[0.12] transition-colors" title="Pause"><Pause className="w-3.5 h-3.5" /></button>
                            )}
                            {campaign.status === "paused" && (
                              <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-foreground/[0.12] transition-colors" title="Resume"><Play className="w-3.5 h-3.5" /></button>
                            )}
                            {campaign.status === "draft" && (
                              <button className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-[0.72rem] font-semibold px-3">Launch</button>
                            )}
                            <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="max-w-[640px]">
                    <div className="space-y-5">
                      {[
                        { label: "Campaign Title", key: "title", placeholder: "e.g. Spring Collection Launch" },
                        { label: "Brand Name", key: "brandName", placeholder: "Your brand or creator name" },
                        { label: "Ad Image URL", key: "imageUrl", placeholder: "https://..." },
                        { label: "Destination URL", key: "destinationUrl", placeholder: "Where should clicks go?" },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-[0.75rem] font-semibold mb-1.5 block">{field.label}</label>
                          <input
                            type="text"
                            value={(newCampaign as any)[field.key]}
                            onChange={e => setNewCampaign({ ...newCampaign, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      ))}

                      <div>
                        <label className="text-[0.75rem] font-semibold mb-1.5 block">Placements</label>
                        <div className="flex gap-2 flex-wrap">
                          {["Explore Feed", "Search Results", "Image Sidebar"].map(p => (
                            <button
                              key={p}
                              onClick={() => togglePlacement(p)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.78rem] font-medium border transition-all ${newCampaign.placements.includes(p) ? "border-accent bg-accent/10 text-accent" : "border-foreground/[0.1] bg-card hover:border-foreground/[0.2]"}`}
                            >
                              {(() => { const Icon = placementIcons[p] || Globe; return <Icon className="w-3.5 h-3.5" />; })()}
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[0.75rem] font-semibold mb-1.5 block">Daily Budget ($)</label>
                          <input type="text" value={newCampaign.dailyBudget} onChange={e => setNewCampaign({ ...newCampaign, dailyBudget: e.target.value })} className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
                        </div>
                        <div>
                          <label className="text-[0.75rem] font-semibold mb-1.5 block">Total Budget ($)</label>
                          <input type="text" value={newCampaign.totalBudget} onChange={e => setNewCampaign({ ...newCampaign, totalBudget: e.target.value })} className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button className="bg-foreground text-primary-foreground text-[0.82rem] font-semibold px-6 py-2.5 rounded-lg hover:bg-accent transition-colors">Save as Draft</button>
                        <button className="bg-accent text-primary-foreground text-[0.82rem] font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/85 transition-colors">Pay & Launch Campaign</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ═══ DELETE ACCOUNT ═══ */}
            {sectionParam === "delete" && (
              <>
                {deleteStep === 0 && (
                  <div className="max-w-lg">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[1rem]">Delete your account</h3>
                          <p className="text-[0.78rem] text-muted">This action is permanent and cannot be undone</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 mb-6">
                        {[
                          "All your uploaded images, videos, and music will be permanently deleted",
                          "Your collections, boards, and community memberships will be removed",
                          "Pending earnings will be forfeited",
                          "Your username will become available to others",
                          "Active ad campaigns will be stopped and remaining budget refunded",
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            <span className="text-[0.82rem] text-muted">{item}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setDeleteStep(1)}
                        className="text-[0.84rem] font-semibold text-destructive border border-destructive/30 px-6 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        I understand, continue
                      </button>
                    </div>
                  </div>
                )}

                {deleteStep === 1 && (
                  <div className="max-w-lg">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-[0.72rem] text-muted">Step 1 of 3</span>
                      <div className="flex gap-1 flex-1 max-w-[120px]">
                        <div className="h-1.5 flex-1 rounded-full bg-destructive" />
                        <div className="h-1.5 flex-1 rounded-full bg-foreground/[0.08]" />
                        <div className="h-1.5 flex-1 rounded-full bg-foreground/[0.08]" />
                      </div>
                    </div>

                    <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                      <h3 className="font-semibold text-[0.95rem] mb-2">Before you go…</h3>
                      <p className="text-[0.82rem] text-muted mb-5">We'd love to know why you're leaving. This helps us improve.</p>

                      <div className="flex flex-col gap-2 mb-5">
                        {[
                          "I found a better alternative",
                          "I don't use the platform enough",
                          "Privacy concerns",
                          "Too many notifications",
                          "The platform doesn't meet my needs",
                          "Other",
                        ].map(reason => (
                          <button
                            key={reason}
                            onClick={() => setDeleteReason(reason)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-[0.84rem] transition-colors ${
                              deleteReason === reason
                                ? "border-destructive bg-destructive/5 text-foreground"
                                : "border-foreground/[0.08] text-muted hover:border-foreground/20"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              deleteReason === reason ? "border-destructive" : "border-foreground/20"
                            }`}>
                              {deleteReason === reason && <div className="w-2 h-2 rounded-full bg-destructive" />}
                            </div>
                            {reason}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => deleteReason && setDeleteStep(2)}
                          disabled={!deleteReason}
                          className="bg-destructive text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-40"
                        >
                          Continue
                        </button>
                        <button onClick={() => { setDeleteStep(0); setDeleteReason(""); }} className="text-[0.84rem] text-muted hover:text-foreground transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>

                    {/* Offer */}
                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
                      <h4 className="font-semibold text-[0.9rem] mb-1">Wait — would a break help?</h4>
                      <p className="text-[0.82rem] text-muted mb-3">You can temporarily deactivate your account instead. Your data stays safe and you can come back any time.</p>
                      <button className="text-[0.82rem] text-accent font-semibold hover:underline flex items-center gap-1">
                        Deactivate instead <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {deleteStep === 2 && (
                  <div className="max-w-lg">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-[0.72rem] text-muted">Step 2 of 3</span>
                      <div className="flex gap-1 flex-1 max-w-[120px]">
                        <div className="h-1.5 flex-1 rounded-full bg-destructive" />
                        <div className="h-1.5 flex-1 rounded-full bg-destructive" />
                        <div className="h-1.5 flex-1 rounded-full bg-foreground/[0.08]" />
                      </div>
                    </div>

                    <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
                      <h3 className="font-semibold text-[0.95rem] mb-2">Verify your identity</h3>
                      <p className="text-[0.82rem] text-muted mb-5">Enter your password to confirm this is really you.</p>

                      <div className="mb-5">
                        <label className="block text-[0.78rem] font-semibold mb-1.5">Password</label>
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full px-4 py-2.5 rounded-lg bg-background border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-destructive transition-colors"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => deletePassword.length >= 1 && setDeleteStep(3)}
                          disabled={!deletePassword}
                          className="bg-destructive text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-40"
                        >
                          Verify & Continue
                        </button>
                        <button onClick={() => { setDeleteStep(0); setDeleteReason(""); setDeletePassword(""); }} className="text-[0.84rem] text-muted hover:text-foreground transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {deleteStep === 3 && (
                  <div className="max-w-lg">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-[0.72rem] text-muted">Step 3 of 3</span>
                      <div className="flex gap-1 flex-1 max-w-[120px]">
                        <div className="h-1.5 flex-1 rounded-full bg-destructive" />
                        <div className="h-1.5 flex-1 rounded-full bg-destructive" />
                        <div className="h-1.5 flex-1 rounded-full bg-destructive" />
                      </div>
                    </div>

                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h3 className="font-semibold text-[0.95rem]">Final confirmation</h3>
                      </div>
                      <p className="text-[0.82rem] text-muted mb-5">
                        Type <span className="font-mono font-bold text-destructive">DELETE MY ACCOUNT</span> below to permanently delete your account. This cannot be undone.
                      </p>

                      <div className="mb-5">
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={e => setDeleteConfirmText(e.target.value)}
                          placeholder="Type DELETE MY ACCOUNT"
                          className="w-full px-4 py-2.5 rounded-lg bg-background border border-destructive/30 text-[0.84rem] font-mono focus:outline-none focus:border-destructive transition-colors"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          disabled={deleteConfirmText !== "DELETE MY ACCOUNT"}
                          className="bg-destructive text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-40"
                        >
                          Permanently Delete Account
                        </button>
                        <button onClick={() => { setDeleteStep(0); setDeleteReason(""); setDeletePassword(""); setDeleteConfirmText(""); }} className="text-[0.84rem] text-muted hover:text-foreground transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </PageShell>
  );
};

export default AccountPage;
