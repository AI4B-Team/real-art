import { useState } from "react";
import { Eye, EyeOff, Trash2, Shield, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [enforceTwoFA, setEnforceTwoFA] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword || newPassword.length < 6) return;
    await supabase.auth.updateUser({ password: newPassword });
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    toast({ title: "Password updated", description: "Your password has been changed." });
  };

  return (
    <div className="space-y-6">
      {/* Password */}
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

      {/* Two Factor Authentication */}
      <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
        <div className="p-6 space-y-1">
          <h3 className="text-base font-semibold">Setup Two Factor Authentication (2FA)</h3>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Setup 2FA For My Account</div>
                <div className="text-xs text-muted">
                  Protect your account with the additional layer of security by activating two-factor authentication.{" "}
                  <span className="text-accent cursor-pointer hover:underline">Learn More.</span>
                </div>
              </div>
            </div>
            <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} className="data-[state=checked]:bg-accent" />
          </div>
        </div>
      </div>

      {/* Enforce 2FA */}
      <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Enforce Two Factor Authentication (2FA)</h3>
            <Switch checked={enforceTwoFA} onCheckedChange={setEnforceTwoFA} className="data-[state=checked]:bg-accent" />
          </div>
          <div className="text-sm font-medium mb-3">Enforce 2FA For</div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input type="radio" name="enforce2fa" className="accent-accent w-4 h-4" disabled={!enforceTwoFA} />
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Team Members</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input type="radio" name="enforce2fa" className="accent-accent w-4 h-4" disabled={!enforceTwoFA} />
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Clients</span>
            </label>
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
  );
}

import { Users } from "lucide-react";
