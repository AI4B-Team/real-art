import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, User, Mail, Lock, Bell, Shield, Eye, EyeOff, Camera, LogOut, Trash2, Key, Globe, Check } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const AccountPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "privacy">("profile");

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Notification prefs
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFollows, setNotifFollows] = useState(true);
  const [notifDownloads, setNotifDownloads] = useState(false);
  const [notifNewsletter, setNotifNewsletter] = useState(true);

  // Privacy
  const [profilePublic, setProfilePublic] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showCollections, setShowCollections] = useState(true);

  useEffect(() => {
    const isLoggedIn = (() => { try { return localStorage.getItem("ra_auth") === "1"; } catch { return false; } })();
    if (!isLoggedIn) { navigate("/login"); return; }

    // Try Supabase profile first, fall back to localStorage
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
      // Fallback to localStorage
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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        display_name: displayName, username, bio, avatar_url: avatarUrl,
      }).eq("user_id", user.id);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("ra_auth");
    navigate("/");
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "security" as const, label: "Security", icon: Lock },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
  ];

  const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!on)} className={`w-10 h-6 rounded-full transition-colors relative ${on ? "bg-accent" : "bg-foreground/[0.12]"}`}>
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${on ? "left-5" : "left-1"}`} />
    </button>
  );

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
        <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3 h-3 opacity-30" />
        <span className="text-foreground">Account</span>
      </div>

      <div className="px-6 md:px-12 max-w-[1440px] mx-auto pb-16">
        <h1 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none mb-8">Account</h1>

        <div className="flex gap-8 flex-col md:flex-row">
          {/* Sidebar tabs */}
          <div className="md:w-[200px] shrink-0 flex md:flex-col gap-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium transition-colors w-full text-left ${activeTab === t.id ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
            <div className="h-px bg-foreground/[0.06] my-2" />
            <button onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[0.84rem] font-medium text-red-500 hover:bg-red-500/[0.06] transition-colors w-full text-left">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-[600px]">
            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-[1.4rem] font-bold mb-1">Profile</h2>
                  <p className="text-[0.82rem] text-muted">Manage your public profile information.</p>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center text-accent text-[1.4rem] font-bold overflow-hidden">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (displayName || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[0.82rem] font-semibold mb-1">Profile Photo</div>
                    <div className="text-[0.75rem] text-muted">JPG, PNG or GIF. Max 2MB.</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Display Name</label>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                      className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Username</label>
                    <div className="flex items-center bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 focus-within:border-accent transition-colors">
                      <span className="text-[0.85rem] text-muted mr-1">@</span>
                      <input value={username} onChange={e => setUsername(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[0.85rem]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself…"
                      className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Email</label>
                    <input value={email} disabled
                      className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] text-muted cursor-not-allowed" />
                    <p className="text-[0.72rem] text-muted mt-1">Contact support to change your email.</p>
                  </div>
                </div>

                <button onClick={handleSaveProfile} disabled={saving}
                  className="flex items-center gap-2 bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors disabled:opacity-50">
                  {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-[1.4rem] font-bold mb-1">Security</h2>
                  <p className="text-[0.82rem] text-muted">Manage your password and account security.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Current Password</label>
                    <div className="flex items-center bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 focus-within:border-accent transition-colors">
                      <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[0.85rem]" />
                      <button onClick={() => setShowCurrent(!showCurrent)} className="text-muted hover:text-foreground">
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[0.78rem] font-semibold mb-1.5">New Password</label>
                    <div className="flex items-center bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 focus-within:border-accent transition-colors">
                      <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[0.85rem]" placeholder="Min 6 characters" />
                      <button onClick={() => setShowNew(!showNew)} className="text-muted hover:text-foreground">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[0.78rem] font-semibold mb-1.5">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors" />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[0.72rem] text-red-500 mt-1">Passwords don't match.</p>
                    )}
                  </div>
                </div>

                <button onClick={handleChangePassword}
                  disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                  className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors disabled:opacity-50">
                  Update Password
                </button>

                <div className="border-t border-foreground/[0.06] pt-6 mt-8">
                  <h3 className="font-semibold text-[0.92rem] text-red-500 mb-2">Danger Zone</h3>
                  <p className="text-[0.82rem] text-muted mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/30 text-red-500 text-[0.84rem] font-medium hover:bg-red-500/[0.06] transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-[1.4rem] font-bold mb-1">Notifications</h2>
                  <p className="text-[0.82rem] text-muted">Choose what you get notified about.</p>
                </div>

                <div className="space-y-4">
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
                <div>
                  <h2 className="font-display text-[1.4rem] font-bold mb-1">Privacy</h2>
                  <p className="text-[0.82rem] text-muted">Control who sees your profile and activity.</p>
                </div>

                <div className="space-y-4">
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
          </div>
        </div>
      </div>

      <Footer />
    </PageShell>
  );
};

export default AccountPage;
