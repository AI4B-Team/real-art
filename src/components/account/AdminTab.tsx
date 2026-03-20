import { useState } from "react";
import {
  LayoutDashboard, Users, FileText, Image, Video, Music, Shield, BarChart3,
  Activity, Database, Cpu, HardDrive, Lock, TrendingUp
} from "lucide-react";

const subTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "images", label: "Images", icon: Image },
  { id: "videos", label: "Videos", icon: Video },
  { id: "audio", label: "Audio", icon: Music },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

type SubTab = typeof subTabs[number]["id"];

const stats = [
  { label: "Total Users", value: "0", icon: Users, color: "text-blue-500 bg-blue-500/10" },
  { label: "Social Posts", value: "0", icon: FileText, color: "text-green-500 bg-green-500/10" },
  { label: "Generated Images", value: "0", icon: Image, color: "text-purple-500 bg-purple-500/10" },
  { label: "AI Videos", value: "0", icon: Video, color: "text-rose-500 bg-rose-500/10" },
];

const systemStatus = [
  { label: "Database", status: "Healthy", color: "text-green-500" },
  { label: "Edge Functions", status: "Operational", color: "text-green-500" },
  { label: "Storage", status: "Available", color: "text-green-500" },
  { label: "Authentication", status: "Active", color: "text-green-500" },
];

export default function AdminTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("dashboard");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Admin</h2>
          <p className="text-sm text-muted">Management Console</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {subTabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSubTab === t.id
                  ? "bg-foreground text-primary-foreground"
                  : "text-muted hover:bg-foreground/[0.05] hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard content */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold">Dashboard</h3>
            <p className="text-sm text-muted">Welcome to the admin panel. Here's an overview of your platform.</p>
          </div>

          {/* Live visitors */}
          <div className="border border-green-500/20 bg-green-500/[0.03] rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted">Live Visitors</span>
                </div>
                <span className="text-2xl font-bold">0</span>
              </div>
            </div>
            <span className="text-sm text-muted">Click To See Who's Online</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="border border-foreground/[0.08] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted">{s.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{s.value}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="border border-foreground/[0.08] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-muted" />
                <h4 className="font-semibold">Recent Activity</h4>
              </div>
              <p className="text-sm text-muted">No recent activity to display.</p>
            </div>

            {/* System Status */}
            <div className="border border-foreground/[0.08] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-muted" />
                <h4 className="font-semibold">System Status</h4>
              </div>
              <div className="space-y-3">
                {systemStatus.map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-sm">{s.label}</span>
                    <span className={`text-xs font-medium ${s.color}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other sub-tabs */}
      {activeSubTab !== "dashboard" && (
        <div className="border border-foreground/[0.08] rounded-xl p-8 text-center">
          <p className="text-sm text-muted">
            {subTabs.find(t => t.id === activeSubTab)?.label} management coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
