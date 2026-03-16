import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, Lock, DollarSign, Eye, EyeOff, Camera, Trash2, Check, MapPin, Image, Loader2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type TabId = "profile" | "notifications" | "privacy" | "account" | "payouts";

const AccountPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

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

  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFollows, setNotifFollows] = useState(true);
  const [notifDownloads, setNotifDownloads] = useState(false);
  const [notifNewsletter, setNotifNewsletter] = useState(true);

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
      // Always persist to localStorage so the rest of the app picks it up
      localStorage.setItem("ra_display", displayName);
      localStorage.setItem("ra_username", username);
      window.dispatchEvent(new Event("ra_auth_changed"));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("profiles").update({
          display_name: displayName, username, bio, avatar_url: avatarUrl,
        }).eq("user_id", user.id);
        if (error) console.error("Profile save error:", error);
      }
    } catch (err) {
      console.error("Profile save error:", err);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword || newPassword.length < 6) return;
    await supabase.auth.updateUser({ password: newPassword });
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Account", icon: Lock },
    { id: "payouts", label: "Payouts", icon: DollarSign },
  ];

  const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!on)} className={`w-10 h-6 rounded-full transition-colors relative ${on ? "bg-accent" : "bg-foreground/[0.12]"}`}>
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${on ? "left-5" : "left-1"}`} />
    </button>
  );

  const BIO_MAX = 200;

  return (
    <PageShell>
      <div className="px-6 md:px-10 max-w-[1100px] mx-auto py-8">
        {/* Header */}
        <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] leading-none mb-1">Settings</h1>
        <p className="text-[0.85rem] text-muted mb-6">Manage your profile, privacy, notifications, and payouts</p>

        {/* Horizontal Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
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

        {/* Content Card */}
        <div className="border border-foreground/[0.08] rounded-xl p-6 md:p-8">

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="font-display text-[1.2rem] font-bold">Public Profile</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-accent text-[1.2rem] font-bold overflow-hidden shrink-0">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (displayName || "U").charAt(0).toUpperCase()}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/[0.1] text-[0.82rem] font-medium text-muted hover:text-foreground hover:border-foreground/[0.2] transition-colors">
                  <Image className="w-4 h-4" /> Upload photo
                </button>
              </div>

              <div className="space-y-5 max-w-[700px]">
                <div>
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Display name</label>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-background border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Username</label>
                  <div className="flex items-center bg-background border border-foreground/[0.1] rounded-lg overflow-hidden focus-within:border-accent transition-colors">
                    <span className="text-[0.85rem] text-muted pl-4 pr-1">@</span>
                    <input value={username} onChange={e => setUsername(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-[0.85rem] py-2.5 pr-4" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Bio</label>
                  <div className="relative">
                    <textarea value={bio} onChange={e => { if (e.target.value.length <= BIO_MAX) setBio(e.target.value); }} rows={3} placeholder="Tell us about yourself…"
                      className="w-full bg-background border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors resize-none" />
                    <span className="absolute bottom-2 right-3 text-[0.72rem] text-muted">{bio.length}/{BIO_MAX}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Location</label>
                  <div className="flex items-center bg-background border border-foreground/[0.1] rounded-lg overflow-hidden focus-within:border-accent transition-colors">
                    <MapPin className="w-4 h-4 text-muted ml-4 shrink-0" />
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country"
                      className="flex-1 bg-transparent border-none outline-none text-[0.85rem] py-2.5 px-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Email</label>
                  <input value={email} disabled
                    className="w-full bg-background border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] text-muted cursor-not-allowed" />
                  <p className="text-[0.72rem] text-muted mt-1">Contact support to change your email.</p>
                </div>
              </div>

              <button onClick={handleSaveProfile} disabled={saving}
                className="flex items-center gap-2 bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors disabled:opacity-50">
                {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="font-display text-[1.2rem] font-bold">Notifications</h2>
              <div className="space-y-1 max-w-[700px]">
                {[
                  { label: "Likes", desc: "When someone likes your image", on: notifLikes, set: setNotifLikes },
                  { label: "Comments", desc: "When someone comments on your image", on: notifComments, set: setNotifComments },
                  { label: "New Followers", desc: "When someone follows you", on: notifFollows, set: setNotifFollows },
                  { label: "Downloads", desc: "When your images are downloaded", on: notifDownloads, set: setNotifDownloads },
                  { label: "Newsletter", desc: "Weekly digest and platform updates", on: notifNewsletter, set: setNotifNewsletter },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-foreground/[0.06]">
                    <div>
                      <div className="text-[0.86rem] font-medium">{item.label}</div>
                      <div className="text-[0.75rem] text-muted">{item.desc}</div>
                    </div>
                    <Toggle on={item.on} onChange={item.set} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="font-display text-[1.2rem] font-bold">Privacy</h2>
              <div className="space-y-1 max-w-[700px]">
                {[
                  { label: "Public Profile", desc: "Allow anyone to see your profile page", on: profilePublic, set: setProfilePublic },
                  { label: "Show Activity", desc: "Display your likes and downloads on your profile", on: showActivity, set: setShowActivity },
                  { label: "Show Collections", desc: "Make your public collections visible on your profile", on: showCollections, set: setShowCollections },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-foreground/[0.06]">
                    <div>
                      <div className="text-[0.86rem] font-medium">{item.label}</div>
                      <div className="text-[0.75rem] text-muted">{item.desc}</div>
                    </div>
                    <Toggle on={item.on} onChange={item.set} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACCOUNT (Security) */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <h2 className="font-display text-[1.2rem] font-bold">Account & Security</h2>
              <div className="space-y-4 max-w-[700px]">
                <div>
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Current Password</label>
                  <div className="flex items-center bg-background border border-foreground/[0.1] rounded-lg px-4 py-2.5 focus-within:border-accent transition-colors">
                    <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-[0.85rem]" />
                    <button onClick={() => setShowCurrent(!showCurrent)} className="text-muted hover:text-foreground">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold mb-1.5">New Password</label>
                  <div className="flex items-center bg-background border border-foreground/[0.1] rounded-lg px-4 py-2.5 focus-within:border-accent transition-colors">
                    <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-[0.85rem]" placeholder="Min 6 characters" />
                    <button onClick={() => setShowNew(!showNew)} className="text-muted hover:text-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-background border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[0.72rem] text-red-500 mt-1">Passwords don't match.</p>
                  )}
                </div>
                <button onClick={handleChangePassword}
                  disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                  className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors disabled:opacity-50">
                  Update Password
                </button>
              </div>

              <div className="border-t border-foreground/[0.06] pt-6 mt-8 max-w-[700px]">
                <h3 className="font-semibold text-[0.92rem] text-red-500 mb-2">Danger Zone</h3>
                <p className="text-[0.82rem] text-muted mb-4">Permanently delete your account and all associated data.</p>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/30 text-red-500 text-[0.84rem] font-medium hover:bg-red-500/[0.06] transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>
          )}

          {/* PAYOUTS */}
          {activeTab === "payouts" && (
            <div className="space-y-6">
              <h2 className="font-display text-[1.2rem] font-bold">Payouts</h2>
              <p className="text-[0.85rem] text-muted max-w-[500px]">
                Configure your payout method and view earnings history. This feature is coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default AccountPage;
