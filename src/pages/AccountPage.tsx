import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  User, Bell, Shield, Lock, DollarSign, Eye, EyeOff, Camera, Trash2, Check, MapPin, Image,
  Loader2, CreditCard, Zap, Clock, Mail, Smartphone, MessageSquare, Users, FileText, Globe,
  Heart, Download, ArrowRight, ChevronRight, Info, Plus, X
} from "lucide-react";
import PageShell from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TabId = "profile" | "notifications" | "privacy" | "account" | "payouts" | "subscription";

const AccountPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>((tabParam as TabId) || "profile");

  useEffect(() => {
    if (tabParam && ["profile", "notifications", "privacy", "account", "payouts", "subscription"].includes(tabParam)) {
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

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

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword || newPassword.length < 6) return;
    await supabase.auth.updateUser({ password: newPassword });
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    toast({ title: "Password updated", description: "Your password has been changed." });
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

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Security", icon: Lock },
    { id: "payouts", label: "Payouts", icon: DollarSign },
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
                    Upgrade Plan
                  </button>
                </Link>
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
                      {t.id === "subscription" && (
                        <span className="bg-foreground/[0.08] text-muted text-xs px-2 py-0.5 rounded-full">
                          {planData.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* ─── Mobile Tabs (visible on smaller screens) ─── */}
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

            {/* SUBSCRIPTION */}
            {activeTab === "subscription" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Subscription</h2>
                </div>

                <div className="border border-foreground/[0.08] rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Plan Card */}
                    <div className="border-2 border-accent rounded-xl p-5 bg-accent/5 relative">
                      <span className="absolute top-3 right-3 bg-accent text-white text-xs font-medium px-2 py-1 rounded-full">Current</span>
                      <div className="flex items-center gap-2 text-sm text-muted mb-3">
                        <Zap className="w-4 h-4 text-accent" />
                        Current Plan
                      </div>
                      <div className="mb-1">
                        <span className="text-2xl font-bold">{planData.name}</span>
                      </div>
                      <p className="text-sm text-muted mb-4">
                        {planData.price === 0 ? "Free forever" : `$${planData.price}/month`}
                      </p>
                      <div className="flex gap-2">
                        <Link to="/pricing">
                          <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Change Plan
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Usage Card */}
                    <div className="border border-foreground/[0.08] rounded-xl p-5">
                      <div className="flex items-center gap-2 text-sm text-muted mb-3">
                        <Image className="w-4 h-4" />
                        AI Credits
                      </div>
                      <div className="mb-1">
                        <span className="text-2xl font-bold">{credits.used}/{credits.total}</span>
                      </div>
                      <p className="text-sm text-muted mb-3">Images generated this month</p>
                      <Progress value={creditPct} className="h-1.5 mb-1 [&>div]:bg-accent" />
                      <p className="text-xs text-muted">Credits refill on {credits.refillDate}</p>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="border border-foreground/[0.08] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted mb-1">
                          <FileText className="w-4 h-4" />
                          Storage
                        </div>
                        <span className="text-lg font-bold">32 MB / 500 MB</span>
                      </div>
                      <Link to="/pricing">
                        <button className="text-accent text-sm font-medium hover:underline">
                          Get more storage →
                        </button>
                      </Link>
                    </div>
                    <Progress value={6.4} className="h-1.5 [&>div]:bg-accent" />
                  </div>
                </div>

                {/* Plan Comparison Teaser */}
                <div className="border border-foreground/[0.08] rounded-xl p-6 text-center">
                  <h3 className="font-display text-base font-bold mb-2">Want more creative power?</h3>
                  <p className="text-sm text-muted mb-4 max-w-md mx-auto">
                    Upgrade to unlock unlimited AI generation, private collections, ad campaigns, and more.
                  </p>
                  <Link to="/pricing">
                    <button className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent transition-colors inline-flex items-center gap-2">
                      View All Plans <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                {/* Header */}
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
                              {/* Frequency */}
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

                              {/* Channels */}
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

                {/* Info Footer */}
                <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-400">
                      Notification preferences are saved to your account and sync across all your devices.
                      You can also manage notifications from the bell icon in the navigation bar.
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {/* ACCOUNT (Security) */}
            {activeTab === "account" && (
              <div className="space-y-6">
                {/* Password Section */}
                <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-foreground/[0.06]">
                    <h3 className="text-base font-semibold">Password</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Current Password</label>
                        <div className="relative">
                          <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="Enter Current Password"
                            className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm pr-12 focus:outline-none focus:border-accent transition-colors" />
                          <button onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                            {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">New Password</label>
                        <div className="relative">
                          <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter New Password"
                            className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm pr-12 focus:outline-none focus:border-accent transition-colors" />
                          <button onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                            {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleChangePassword}
                        disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                        className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-500/20 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-red-500/10">
                    <h3 className="text-base font-semibold text-red-500">Danger Zone</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted mb-4">Permanently delete your account and all associated data.</p>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/[0.06] transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAYOUTS */}
            {activeTab === "payouts" && (
              <div className="space-y-6">
                <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-foreground/[0.06]">
                    <h2 className="text-base font-semibold">Payouts</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted max-w-md">
                      Configure your payout method and view earnings history. This feature is coming soon.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AccountPage;
