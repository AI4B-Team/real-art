import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  User, Bell, Shield, Lock, DollarSign, Eye, EyeOff, Camera, Trash2, Check, MapPin, Image,
  Loader2, CreditCard, Zap, Clock, Mail, Smartphone, MessageSquare, Users, FileText, Globe,
  Heart, Download, ArrowRight, ChevronRight, Info, Plus, X, Gift,
  Settings, Share2, LayoutGrid, Bot, UserPlus, MailOpen, Plug, Grid3X3, Languages, Sun, Moon, ChevronDown
} from "lucide-react";
import PageShell from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AdminTab from "@/components/account/AdminTab";
import SecurityTab from "@/components/account/SecurityTab";
import SocialTab from "@/components/account/SocialTab";
import MembersTab from "@/components/account/MembersTab";
import AgentTab from "@/components/account/AgentTab";
import PlaceholderTab from "@/components/account/PlaceholderTab";
import CancellationFlow from "@/components/account/CancellationFlow";

type TabId = "profile" | "admin" | "security" | "notifications" | "subscription" | "social" | "spaces" | "agent" | "members" | "invites" | "integrations" | "whitelabel" | "privacy" | "payouts";

const AccountPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const allTabIds: TabId[] = ["profile", "admin", "security", "notifications", "subscription", "social", "spaces", "agent", "members", "invites", "integrations", "whitelabel", "privacy", "payouts"];
  const [activeTab, setActiveTab] = useState<TabId>((tabParam as TabId) || "profile");

  useEffect(() => {
    if (tabParam && allTabIds.includes(tabParam as TabId)) {
      setActiveTab(tabParam as TabId);
    }
  }, [tabParam]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    navigate(`/account?tab=${tab}`, { replace: true });
  };

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced notifications state
  const [notifSettings, setNotifSettings] = useState([
    { id: "likes", title: "Likes", desc: "When someone likes your image", icon: Heart, on: true, frequency: "immediately" as const, channels: { email: true, push: true, inApp: true } },
    { id: "comments", title: "Comments", desc: "When someone comments on your image", icon: MessageSquare, on: true, frequency: "immediately" as const, channels: { email: true, push: true, inApp: true } },
    { id: "follows", title: "New Followers", desc: "When someone follows you", icon: Users, on: true, frequency: "immediately" as const, channels: { email: false, push: true, inApp: true } },
    { id: "downloads", title: "Downloads", desc: "When your images are downloaded", icon: Download, on: false, frequency: "daily" as const, channels: { email: true, push: false, inApp: true } },
    { id: "challenges", title: "Challenges", desc: "New challenges, deadlines, and results", icon: Zap, on: true, frequency: "immediately" as const, channels: { email: true, push: true, inApp: true } },
    { id: "collections", title: "Collections", desc: "When your work is saved to collections", icon: Image, on: true, frequency: "daily" as const, channels: { email: true, push: false, inApp: true } },
    { id: "community", title: "Community Updates", desc: "New posts and activity in your communities", icon: Globe, on: true, frequency: "daily" as const, channels: { email: true, push: false, inApp: true } },
    { id: "billing", title: "Billing & Subscription", desc: "Payment confirmations and usage alerts", icon: FileText, on: true, frequency: "immediately" as const, channels: { email: true, push: false, inApp: true } },
    { id: "newsletter", title: "Newsletter", desc: "Weekly digest and platform updates", icon: Mail, on: true, frequency: "daily" as const, channels: { email: true, push: false, inApp: false } },
  ]);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");

  const [profilePublic, setProfilePublic] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showCollections, setShowCollections] = useState(true);

  useEffect(() => {
    const isLoggedIn = (() => { try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; } })();
    if (!isLoggedIn) { navigate("/login"); return; }

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (profile) {
          setDisplayName(profile.display_name || "");
          setUsername(profile.username || "");
          setBio(profile.bio || "");
          setLocation((profile as any).location || "");
          setAvatarUrl(profile.avatar_url || "");
          return;
        }
      }
      try {
        setDisplayName(localStorage.getItem("ra_display") || "");
        setUsername(localStorage.getItem("ra_username") || "");
        setEmail(localStorage.getItem("ra_email") || "");
      } catch {}
    };
    loadProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      localStorage.setItem("ra_display", displayName);
      localStorage.setItem("ra_username", username);
      window.dispatchEvent(new Event("ra_auth_changed"));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("profiles").update({
          display_name: displayName, username, bio, avatar_url: avatarUrl, location,
        }).eq("user_id", user.id);
        if (error) {
          toast({ title: "Save failed", description: error.message, variant: "destructive" });
          setSaving(false);
          return;
        }
      }
      toast({ title: "Profile saved", description: "Your changes have been saved successfully." });
    } catch (err: any) {
      console.error("Profile save error:", err);
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (additionalEmails.includes(newEmail)) {
      toast({ title: "Duplicate Email", description: "This email is already in the list.", variant: "destructive" });
      return;
    }
    setAdditionalEmails(prev => [...prev, newEmail]);
    setNewEmail("");
    toast({ title: "Email Added", description: "Additional recipient has been added." });
  };

  const tabs: { id: TabId; label: string; icon: typeof User; badge?: string }[] = [
    { id: "profile", label: "Account", icon: Settings },
    { id: "admin", label: "Admin", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "subscription", label: "Subscription", icon: CreditCard, badge: "Pro" },
    { id: "social", label: "Social", icon: Share2 },
    { id: "spaces", label: "Spaces", icon: LayoutGrid },
    { id: "agent", label: "Agent", icon: Bot },
    { id: "members", label: "Members", icon: Users },
    { id: "invites", label: "Invites", icon: MailOpen },
    { id: "integrations", label: "Integrations", icon: Plug },
    { id: "whitelabel", label: "White Label", icon: Grid3X3 },
  ];

  const BIO_MAX = 200;
  const planData = { name: "Free", price: 0 };
  const credits = { used: 3, total: 5, refillDate: "Apr 1" };
  const creditPct = (credits.used / credits.total) * 100;

  return (
    <PageShell>
      <div className="px-6 md:px-10 max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">Account</h1>
        </div>

        <div className="flex gap-8 items-start">
          {/* ─── Left Sidebar ─── */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="border border-foreground/[0.08] rounded-xl p-4 flex flex-col gap-4 sticky top-24">
              {/* User Card */}
              <div className="flex flex-col items-center text-center pb-4">
                <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xl font-bold overflow-hidden mb-3 border-2 border-accent">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    : (displayName || "U").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-lg">{displayName || "User"}</h3>
                <p className="text-sm text-muted">{email || "No email"}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Link to="/pricing">
                  <button className="w-full bg-accent hover:bg-accent/90 text-white font-medium px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                    <Zap className="w-4 h-4" />
                    Upgrade
                  </button>
                </Link>
                <button onClick={() => handleTabChange("members")} className="w-full border border-foreground/[0.1] hover:bg-foreground/[0.03] font-medium px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Add Members
                </button>
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col gap-1 mt-2">
                {tabs.map(t => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTabChange(t.id)}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-muted hover:bg-foreground/[0.05] hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{t.label}</span>
                      </div>
                      {t.badge && (
                        <span className="bg-foreground/[0.08] text-muted text-xs px-2 py-0.5 rounded-full">
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Footer: Language & Theme */}
              <div className="border-t border-foreground/[0.06] pt-3 mt-2 space-y-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Languages className="w-4 h-4" />
                    <span>Language:</span>
                  </div>
                  <button className="flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors">
                    English <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Sun className="w-4 h-4" />
                    <span>Theme:</span>
                  </div>
                  <button className="flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors">
                    Light <ChevronRight className="w-3.5 h-3.5" /> <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Mobile Tabs ─── */}
          <div className="lg:hidden w-full">
            <div className="flex gap-2 mb-6 flex-wrap">
              {tabs.map(t => (
                <button key={t.id} onClick={() => handleTabChange(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[0.84rem] font-medium transition-colors border ${
                    activeTab === t.id
                      ? "bg-foreground text-primary-foreground border-foreground"
                      : "bg-transparent text-muted border-foreground/[0.1] hover:text-foreground hover:border-foreground/[0.2]"
                  }`}>
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Content Area ─── */}
          <div className="flex-1 min-w-0">

            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-foreground/[0.06] flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-semibold">Profile</h2>
                      <p className="text-sm text-muted mt-1">Update your photo and personal details here.</p>
                    </div>
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                      {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xl font-bold overflow-hidden shrink-0">
                        {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (displayName || "U").charAt(0).toUpperCase()}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5MB", variant: "destructive" }); return; }
                          setUploading(true);
                          try {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) throw new Error("Not authenticated");
                            const ext = file.name.split(".").pop() || "jpg";
                            const path = `${user.id}/avatar.${ext}`;
                            const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
                            if (upErr) throw upErr;
                            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
                            const publicUrl = urlData.publicUrl + "?t=" + Date.now();
                            setAvatarUrl(publicUrl);
                            await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
                            toast({ title: "Photo uploaded!" });
                          } catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
                          setUploading(false);
                          e.target.value = "";
                        }}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/[0.1] text-sm font-medium text-muted hover:text-foreground hover:border-foreground/[0.2] transition-colors disabled:opacity-50">
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                          {uploading ? "Uploading…" : "Upload photo"}
                        </button>
                        {avatarUrl && (
                          <button onClick={async () => {
                            try {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (user) await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
                              setAvatarUrl("");
                              toast({ title: "Photo removed" });
                            } catch {}
                          }} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/[0.06] transition-colors">
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Display name</label>
                        <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                          className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Username</label>
                        <div className="flex items-center bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg overflow-hidden focus-within:border-accent transition-colors">
                          <span className="text-sm text-muted pl-4 pr-1">@</span>
                          <input value={username} onChange={e => setUsername(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm py-2.5 pr-4" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Bio</label>
                      <div className="relative">
                        <textarea value={bio} onChange={e => { if (e.target.value.length <= BIO_MAX) setBio(e.target.value); }} rows={3} placeholder="Tell us about yourself…"
                          className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" />
                        <span className="absolute bottom-2 right-3 text-xs text-muted">{bio.length}/{BIO_MAX}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Location</label>
                        <div className="flex items-center bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg overflow-hidden focus-within:border-accent transition-colors">
                          <MapPin className="w-4 h-4 text-muted ml-4 shrink-0" />
                          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country"
                            className="flex-1 bg-transparent border-none outline-none text-sm py-2.5 px-3" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Email</label>
                        <input value={email} disabled
                          className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm text-muted cursor-not-allowed" />
                        <p className="text-xs text-muted mt-1">Contact support to change your email.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN */}
            {activeTab === "admin" && <AdminTab />}

            {/* SECURITY */}
            {activeTab === "security" && <SecurityTab />}

            {/* SUBSCRIPTION */}
            {activeTab === "subscription" && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-lg font-semibold">Subscription & Billing</h2>
                  <p className="text-sm text-muted mt-1">Manage your subscription, team members, and billing history.</p>
                </div>
                <hr className="border-foreground/[0.06]" />

                {/* Subscription + Manage Billing */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Subscription</h3>
                  <button className="flex items-center gap-2 border border-foreground/[0.1] px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/[0.03] transition-colors">
                    <FileText className="w-4 h-4" /> Manage Billing
                  </button>
                </div>

                {/* Current Plan + Add-On */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-accent rounded-xl p-5 bg-accent/5 relative">
                    <span className="absolute top-3 right-3 bg-accent text-white text-xs font-medium px-2.5 py-1 rounded-full">Current</span>
                    <div className="flex items-center gap-2 text-sm text-muted mb-2">
                      <Zap className="w-4 h-4 text-accent" /> Current Plan
                    </div>
                    <div className="text-2xl font-bold mb-0.5">Pro</div>
                    <p className="text-sm text-muted mb-4">$47/Month</p>
                    <div className="flex gap-2">
                      <Link to="/pricing">
                        <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Change Plan</button>
                      </Link>
                      <button className="border border-foreground/[0.1] px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/[0.03] transition-colors">Cancel</button>
                    </div>
                  </div>

                  <div className="border-2 border-yellow-400/60 rounded-xl p-5 bg-yellow-50/50">
                    <div className="flex items-center gap-2 text-sm text-yellow-700 mb-2">
                      <Gift className="w-4 h-4" /> Optional Add-On
                    </div>
                    <div className="text-2xl font-bold mb-0.5">2 Packs</div>
                    <p className="text-sm text-muted mb-4">$15/Pack/Month</p>
                    <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add Credits Pack</button>
                  </div>
                </div>

                {/* Spaces + Seats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-foreground/[0.08] rounded-xl p-5">
                    <div className="flex items-center gap-2 text-sm text-muted mb-2">
                      <LayoutGrid className="w-4 h-4" /> Spaces
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted" /></TooltipTrigger>
                          <TooltipContent>Workspaces for organizing your projects</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-3xl font-bold mb-1">3</div>
                    <Progress value={66} className="h-1.5 mb-2 [&>div]:bg-accent" />
                    <p className="text-xs text-muted mb-4">2 of 3 Spaces In Use</p>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 border border-foreground/[0.1] px-3 py-2 rounded-lg text-sm font-medium hover:bg-foreground/[0.03] transition-colors">
                        <Settings className="w-3.5 h-3.5" /> Manage Spaces
                      </button>
                      <button className="flex items-center gap-1.5 border border-foreground/[0.1] px-3 py-2 rounded-lg text-sm font-medium hover:bg-foreground/[0.03] transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Space
                      </button>
                    </div>
                  </div>

                  <div className="border border-foreground/[0.08] rounded-xl p-5">
                    <div className="flex items-center gap-2 text-sm text-muted mb-2">
                      <Users className="w-4 h-4" /> Seats
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted" /></TooltipTrigger>
                          <TooltipContent>Team member seats on your plan</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-3xl font-bold mb-1">3</div>
                    <Progress value={66} className="h-1.5 mb-2 [&>div]:bg-accent" />
                    <p className="text-xs text-muted mb-4">2 of 3 Seats Being Used</p>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 border border-foreground/[0.1] px-3 py-2 rounded-lg text-sm font-medium hover:bg-foreground/[0.03] transition-colors">
                        <Settings className="w-3.5 h-3.5" /> Manage Seats
                      </button>
                      <button className="flex items-center gap-1.5 border border-foreground/[0.1] px-3 py-2 rounded-lg text-sm font-medium hover:bg-foreground/[0.03] transition-colors">
                        <UserPlus className="w-3.5 h-3.5" /> Invite Members
                      </button>
                    </div>
                  </div>
                </div>

                {/* Team Shared Credits */}
                <div className="border border-foreground/[0.08] rounded-xl p-5">
                  <h3 className="text-base font-semibold mb-1">Team Shared Credits</h3>
                  <p className="text-sm text-muted mb-3">Credits Left</p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-lg font-bold text-accent">10,000/98,000</span>
                    </div>
                    <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add Credits</button>
                  </div>
                  <p className="text-xs text-muted mb-2">Your monthly credits will be refilled on Jan 18. <button className="text-accent hover:underline">Read More</button></p>
                  <Progress value={10} className="h-1.5 [&>div]:bg-accent" />
                </div>

                {/* Payment Method */}
                <div className="border border-foreground/[0.08] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold">Payment Method</h3>
                    <button className="text-sm font-medium text-muted hover:text-foreground transition-colors">Edit</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">VISA</div>
                    <div>
                      <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                      <p className="text-xs text-muted">Expires 12/2025</p>
                    </div>
                  </div>
                </div>

                {/* Recent Invoices */}
                <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <div className="p-5 pb-0">
                    <h3 className="text-base font-semibold mb-4">Recent Invoices</h3>
                  </div>
                  <div className="divide-y divide-foreground/[0.06]">
                    {[
                      { month: "December 2025", date: "Dec 1, 2025", amount: "$47.00" },
                      { month: "November 2025", date: "Nov 1, 2025", amount: "$47.00" },
                      { month: "October 2025", date: "Oct 1, 2025", amount: "$47.00" },
                    ].map(inv => (
                      <div key={inv.month} className="flex items-center justify-between px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium">{inv.month}</p>
                          <p className="text-xs text-muted">Paid on {inv.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">{inv.amount}</span>
                          <button className="text-sm text-accent hover:underline">Download</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3">
                    <button className="w-full border border-foreground/[0.08] rounded-lg py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors">
                      View All Invoices
                    </button>
                  </div>
                </div>

                {/* Cancel Subscription */}
                <div className="border border-red-200 bg-red-50/50 rounded-xl p-5">
                  <h3 className="text-base font-semibold mb-2">Cancel Subscription</h3>
                  <p className="text-sm text-muted mb-4">
                    If you cancel your subscription, you'll lose access to all premium features at the end of your current billing period. Your account will be downgraded to the free plan.
                  </p>
                  <div className="border border-red-200 bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium mb-2">What you'll lose:</p>
                    <ul className="space-y-1.5">
                      {["100,000 monthly credits (reduced to 10,000)", "Priority support", "Advanced analytics", "White-label options"].map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted">
                          <X className="w-4 h-4 text-red-500 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancel Subscription</button>
                    <span className="text-xs text-muted">Access continues until Feb 1, 2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-foreground/[0.06] flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">Notification Preferences</h3>
                      <p className="text-sm text-muted mt-1">
                        Control how and when you receive notifications across all channels.
                      </p>
                    </div>
                    <button
                      onClick={() => toast({ title: "Settings saved", description: "Your notification preferences have been updated." })}
                      className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>

                  {/* Do Not Disturb */}
                  <div className="px-6 py-4 border-b border-foreground/[0.06] bg-foreground/[0.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Do Not Disturb</div>
                          <div className="text-xs text-muted">Pause all notifications temporarily</div>
                        </div>
                      </div>
                      <Switch checked={doNotDisturb} onCheckedChange={setDoNotDisturb} className="data-[state=checked]:bg-red-500" />
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div className="px-6 py-4 border-b border-foreground/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Quiet Hours</div>
                          <div className="text-xs text-muted">Mute push notifications during specific hours</div>
                        </div>
                      </div>
                      <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} className="data-[state=checked]:bg-accent" />
                    </div>
                    {quietHoursEnabled && (
                      <div className="flex items-center gap-4 mt-3 ml-[52px]">
                        <label className="text-sm text-muted">From</label>
                        <input type="time" value={quietHoursStart} onChange={e => setQuietHoursStart(e.target.value)}
                          className="bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-3 py-1.5 text-sm" />
                        <label className="text-sm text-muted">To</label>
                        <input type="time" value={quietHoursEnd} onChange={e => setQuietHoursEnd(e.target.value)}
                          className="bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-3 py-1.5 text-sm" />
                      </div>
                    )}
                  </div>

                  {/* Additional Email Recipients */}
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Additional Email Recipients</div>
                        <div className="text-xs text-muted">Send copies of notifications to additional email addresses</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input type="email" placeholder="Enter email address" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddEmail()}
                        className="flex-1 bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent transition-colors" />
                      <button onClick={handleAddEmail}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-accent/30 text-accent text-sm font-medium hover:bg-accent/[0.06] transition-colors">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    {additionalEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {additionalEmails.map(em => (
                          <div key={em} className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground/[0.05] rounded-full text-sm">
                            <span>{em}</span>
                            <button onClick={() => setAdditionalEmails(prev => prev.filter(e => e !== em))}
                              className="text-muted hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notification Categories */}
                <div className="space-y-4">
                  {notifSettings.map((setting, idx) => {
                    const Icon = setting.icon;
                    return (
                      <div key={setting.id} className="border border-foreground/[0.08] rounded-xl overflow-hidden">
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-foreground/[0.05] flex items-center justify-center">
                              <Icon className="w-5 h-5 text-muted" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{setting.title}</div>
                              <div className="text-xs text-muted">{setting.desc}</div>
                            </div>
                          </div>
                          <Switch
                            checked={setting.on}
                            onCheckedChange={(checked) => setNotifSettings(prev => prev.map((s, i) => i === idx ? { ...s, on: checked } : s))}
                            className="data-[state=checked]:bg-accent"
                          />
                        </div>

                        {setting.on && (
                          <div className="px-6 py-4 bg-foreground/[0.02] border-t border-foreground/[0.06]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-[52px]">
                              <div>
                                <div className="text-xs font-medium text-muted mb-3">Notification Frequency</div>
                                <div className="flex gap-4">
                                  {(["immediately", "daily"] as const).map(freq => (
                                    <label key={freq} className="flex items-center gap-1.5 cursor-pointer">
                                      <input type="radio" name={`freq-${setting.id}`}
                                        checked={setting.frequency === freq}
                                        onChange={() => setNotifSettings(prev => prev.map((s, i) => i === idx ? { ...s, frequency: freq } : s))}
                                        className="accent-accent w-3.5 h-3.5" />
                                      <span className="text-sm">{freq === "immediately" ? "Immediately" : "Daily Summary"}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-medium text-muted mb-3">Receive Via</div>
                                <div className="flex gap-4">
                                  <TooltipProvider delayDuration={100}>
                                    {([
                                      { key: "email" as const, icon: Mail, label: "Email" },
                                      { key: "push" as const, icon: Smartphone, label: "Push" },
                                      { key: "inApp" as const, icon: Bell, label: "In-App" },
                                    ]).map(ch => (
                                      <Tooltip key={ch.key}>
                                        <TooltipTrigger asChild>
                                          <label className="flex items-center gap-1.5 cursor-pointer">
                                            <Checkbox
                                              checked={setting.channels[ch.key]}
                                              onCheckedChange={(checked) => setNotifSettings(prev => prev.map((s, i) =>
                                                i === idx ? { ...s, channels: { ...s.channels, [ch.key]: checked } } : s
                                              ))}
                                            />
                                            <ch.icon className="w-3.5 h-3.5 text-muted" />
                                            <span className="text-sm">{ch.label}</span>
                                          </label>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Receive via {ch.label.toLowerCase()}</p></TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-400">
                      Notification preferences are saved to your account and sync across all your devices.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SOCIAL */}
            {activeTab === "social" && <SocialTab />}

            {/* AGENT */}
            {activeTab === "agent" && <AgentTab />}

            {/* MEMBERS */}
            {activeTab === "members" && <MembersTab />}

            {/* PRIVACY */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-foreground/[0.06]">
                    <h2 className="text-base font-semibold">Privacy</h2>
                    <p className="text-sm text-muted mt-1">Control your profile visibility and activity sharing.</p>
                  </div>
                  <div className="p-6 space-y-1">
                    {[
                      { label: "Public Profile", desc: "Allow anyone to see your profile page", on: profilePublic, set: setProfilePublic },
                      { label: "Show Activity", desc: "Display your likes and downloads on your profile", on: showActivity, set: setShowActivity },
                      { label: "Show Collections", desc: "Make your public collections visible on your profile", on: showCollections, set: setShowCollections },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-foreground/[0.06] last:border-none">
                        <div>
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-muted">{item.desc}</div>
                        </div>
                        <Switch checked={item.on} onCheckedChange={item.set} className="data-[state=checked]:bg-accent" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAYOUTS */}
            {activeTab === "payouts" && (
              <PlaceholderTab title="Payouts" description="Configure your payout method and view earnings history." icon={DollarSign} />
            )}

            {/* SPACES */}
            {activeTab === "spaces" && (
              <PlaceholderTab title="Spaces" description="Manage your creative spaces and workspaces." icon={LayoutGrid} />
            )}

            {/* INVITES */}
            {activeTab === "invites" && (
              <PlaceholderTab title="Invites" description="Manage pending invitations sent to team members." icon={MailOpen} />
            )}

            {/* INTEGRATIONS */}
            {activeTab === "integrations" && (
              <PlaceholderTab title="Integrations" description="Connect third-party tools and services to your account." icon={Plug} />
            )}

            {/* WHITE LABEL */}
            {activeTab === "whitelabel" && (
              <PlaceholderTab title="White Label" description="Customize branding and appearance for your clients." icon={Grid3X3} />
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AccountPage;
