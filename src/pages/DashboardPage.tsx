import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Image, FolderOpen, DollarSign, Bell, Settings,
  Download, Eye, Users, Upload, Plus, ChevronRight, Key, TrendingUp,
  Heart, ArrowRight, RefreshCw, Code, Globe, Award, Star, Sparkles, Pin
} from "lucide-react";
import Navbar from "@/components/Navbar";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "exposure", label: "Exposure", icon: TrendingUp },
  { id: "images", label: "My Images", icon: Image },
  { id: "galleries", label: "Galleries", icon: FolderOpen },
  { id: "earnings", label: "Earnings", icon: DollarSign },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const recentActivity = [
  { text: "Your image Cosmic Dreamscape was downloaded", time: "2 min ago" },
  { text: "NeoPixel started following you", time: "18 min ago" },
  { text: "You earned $12.00 from an affiliate referral", time: "1 hr ago" },
  { text: "34 people liked Neon Boulevard today", time: "2 hr ago" },
  { text: "Your image Abstract Mind was downloaded", time: "3 hr ago" },
  { text: "You earned $24.00 from an affiliate referral", time: "5 hr ago" },
];

const topImages = [
  { photo: "photo-1618005182384-a83a8bd57fbe", title: "Cosmic Dreamscape", downloads: "3,412", likes: "847", views: "48,201", remixes: "247", embeds: "1,032", earnings: "$124.40", pinned: true },
  { photo: "photo-1557682250-33bd709cbe85", title: "Neon Boulevard", downloads: "2,180", likes: "612", views: "31,400", remixes: "189", embeds: "742", earnings: "$79.20", pinned: false },
  { photo: "photo-1604881991720-f91add269bed", title: "Digital Avatar 01", downloads: "1,940", likes: "534", views: "26,800", remixes: "156", embeds: "498", earnings: "$70.56", pinned: false },
  { photo: "photo-1579546929518-9e396f3cc809", title: "Cyberpunk City Night", downloads: "1,620", likes: "441", views: "22,100", remixes: "121", embeds: "387", earnings: "$58.90", pinned: false },
  { photo: "photo-1541701494587-cb58502866ab", title: "Abstract Fire", downloads: "1,410", likes: "388", views: "18,600", remixes: "94", embeds: "256", earnings: "$51.26", pinned: false },
];

const earningsData = [
  { month: "Oct", amount: 142 },
  { month: "Nov", amount: 218 },
  { month: "Dec", amount: 189 },
  { month: "Jan", amount: 304 },
  { month: "Feb", amount: 276 },
  { month: "Mar", amount: 412 },
];

const galleries = [
  { name: "Main Gallery", images: 84, members: 0, free: true, code: "" },
  { name: "Premium Prompts", images: 42, members: 127, free: false, code: "XK9F2M" },
  { name: "Avatar Collection", images: 31, members: 64, free: false, code: "RT7P4Q" },
];

const maxEarning = Math.max(...earningsData.map(d => d.amount));

const achievements = [
  { icon: Award, title: "Top Creator", desc: "Top 10 on leaderboard", unlocked: true },
  { icon: Download, title: "100K Downloads", desc: "Images downloaded 100,000 times", unlocked: false, progress: 82 },
  { icon: Users, title: "10K Followers", desc: "Reached 10,000 followers", unlocked: true },
  { icon: TrendingUp, title: "Trending Artist", desc: "Featured on trending page", unlocked: true },
  { icon: Sparkles, title: "Style Pioneer", desc: "Style used by 500+ creators", unlocked: true },
  { icon: Globe, title: "Embedded Everywhere", desc: "Images on 1,000+ websites", unlocked: false, progress: 64 },
];

const weeklyExposure = [
  { day: "Mon", views: 34200 },
  { day: "Tue", views: 41800 },
  { day: "Wed", views: 38600 },
  { day: "Thu", views: 52100 },
  { day: "Fri", views: 48900 },
  { day: "Sat", views: 56200 },
  { day: "Sun", views: 44300 },
];
const maxWeekly = Math.max(...weeklyExposure.map(d => d.views));

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <aside className="bg-card border-r border-foreground/[0.06] px-4 py-6 hidden lg:block">
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="w-10 h-10 rounded-full bg-[#4361ee] flex items-center justify-center text-[0.8rem] font-bold text-primary-foreground">AV</div>
              <div>
                <div className="font-semibold text-[0.88rem]">AI.Verse</div>
                <div className="text-[0.72rem] text-muted">@aiverse</div>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] font-medium w-full text-left transition-colors ${activeSection === item.id ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {item.id === "notifications" && (
                    <span className="ml-auto text-[0.65rem] font-bold bg-accent text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center">3</span>
                  )}
                </button>
              ))}
            </nav>

            <Link to="/upload" className="flex items-center justify-center gap-2 bg-foreground text-primary-foreground py-2.5 rounded-xl text-[0.84rem] font-semibold hover:bg-accent transition-colors mt-6 w-full no-underline">
              <Upload className="w-3.5 h-3.5" /> Upload Art
            </Link>
          </aside>

          {/* Main Content */}
          <main className="px-6 md:px-10 py-8 overflow-y-auto">
            {/* Mobile Nav */}
            <div className="flex items-center gap-2 mb-6 lg:hidden overflow-x-auto pb-2 no-scrollbar">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[0.78rem] font-medium whitespace-nowrap transition-colors ${activeSection === item.id ? "bg-foreground text-primary-foreground" : "bg-card border border-foreground/[0.1] text-muted"}`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* ═══ OVERVIEW ═══ */}
            {activeSection === "overview" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">Overview</h1>
                    <p className="text-[0.82rem] text-muted mt-1">March 2026 · Last 30 days</p>
                  </div>
                  <Link to="/upload" className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline">
                    Upload <Plus className="w-4 h-4" />
                  </Link>
                </div>

                {/* Stats — 6 cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Views", value: "248,421", change: "+22%", icon: Eye, color: "text-blue-500" },
                    { label: "Downloads", value: "18,204", change: "+18%", icon: Download, color: "text-green-500" },
                    { label: "Remixes", value: "1,347", change: "+34%", icon: RefreshCw, color: "text-purple-500" },
                    { label: "Embeds", value: "93 websites", change: "+12%", icon: Code, color: "text-orange-500" },
                    { label: "Followers", value: "+2,431", change: "+6%", icon: Users, color: "text-pink-500" },
                    { label: "Earnings", value: "$412", change: "+49%", icon: DollarSign, color: "text-emerald-500" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[0.75rem] text-muted">{stat.label}</span>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none">{stat.value}</div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-[0.72rem] text-green-500 font-semibold">{stat.change}</span>
                        <span className="text-[0.72rem] text-muted">this month</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Featured Artwork (pinned) */}
                <div className="bg-foreground rounded-2xl p-6 mb-8 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-accent" />
                    <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/40">Featured Artwork</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-5">
                    <img
                      src={`https://images.unsplash.com/${topImages[0].photo}?w=300&h=200&fit=crop&q=80`}
                      alt="Featured"
                      className="w-full md:w-[200px] h-[140px] rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-display text-[1.3rem] font-black text-primary-foreground mb-2">{topImages[0].title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {[
                          { l: "Views", v: topImages[0].views },
                          { l: "Downloads", v: topImages[0].downloads },
                          { l: "Remixes", v: topImages[0].remixes },
                          { l: "Embeds", v: topImages[0].embeds + " sites" },
                        ].map(s => (
                          <div key={s.l}>
                            <div className="font-display font-black text-[1.1rem] text-primary-foreground">{s.v}</div>
                            <div className="text-[0.65rem] text-primary-foreground/40 uppercase tracking-[0.08em]">{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[0.75rem] text-primary-foreground/35">Your most viewed image · Pinned to profile</p>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-8">
                  <h3 className="font-semibold text-[0.95rem] mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent" /> Achievements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {achievements.map(a => (
                      <div key={a.title} className={`border rounded-xl p-4 transition-colors ${a.unlocked ? "border-accent/20 bg-accent/[0.03]" : "border-foreground/[0.06] bg-card opacity-60"}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <a.icon className="w-5 h-5 text-accent shrink-0" />
                          <span className="text-[0.82rem] font-semibold">{a.title}</span>
                          {a.unlocked && <span className="ml-auto text-[0.6rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-md">Unlocked</span>}
                        </div>
                        <p className="text-[0.72rem] text-muted">{a.desc}</p>
                        {!a.unlocked && a.progress && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${a.progress}%` }} />
                            </div>
                            <span className="text-[0.65rem] text-muted mt-1 block">{a.progress}% complete</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Your Communities */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[0.9rem] flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" /> Your Communities
                    </h3>
                    <Link to="/communities" className="text-[0.78rem] text-accent hover:underline flex items-center gap-1 no-underline">
                      Browse All <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "Avatar Architects", members: "2.4K", posts: 3, lastPost: "Neural portrait series by @stellarink", color: "#4361ee", to: "/communities/1" },
                      { name: "PromptVault Pro", members: "1.8K", posts: 0, lastPost: "Best negative prompts for realism", color: "#7209b7", to: "/communities/2" },
                      { name: "Abstract Minds", members: "3.1K", posts: 1, lastPost: "Weekly color palette challenge results", color: "#e63946", to: "/communities/3" },
                    ].map(c => (
                      <Link key={c.name} to={c.to} className="border border-foreground/[0.06] rounded-xl p-4 hover:border-accent/30 transition-colors no-underline group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[0.7rem] font-bold text-primary-foreground" style={{ background: c.color }}>
                            {c.name.split(" ").map(w => w[0]).join("")}
                          </div>
                          <div>
                            <div className="text-[0.84rem] font-semibold group-hover:text-accent transition-colors">{c.name}</div>
                            <div className="text-[0.7rem] text-muted">{c.members} members</div>
                          </div>
                          {c.posts > 0 && (
                            <span className="ml-auto text-[0.65rem] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                              {c.posts} new
                            </span>
                          )}
                        </div>
                        <p className="text-[0.75rem] text-muted leading-relaxed line-clamp-1">{c.lastPost}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Earnings Chart + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                  <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-[0.9rem]">Affiliate Earnings</h3>
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

                  <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                    <h3 className="font-semibold text-[0.9rem] mb-4">Recent Activity</h3>
                    <div className="flex flex-col gap-3">
                      {recentActivity.slice(0, 5).map((a, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-foreground/[0.04] last:border-0">
                          <span className="text-[0.8rem] text-muted">{a.text}</span>
                          <span className="text-[0.7rem] text-muted/60 shrink-0 ml-3">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Images */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[0.9rem]">Top Performing Images</h3>
                    <button onClick={() => setActiveSection("images")} className="text-[0.78rem] text-accent hover:underline flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-foreground/[0.06]">
                          <th className="text-left text-[0.72rem] text-muted font-medium py-2 pr-4">Image</th>
                          <th className="text-left text-[0.72rem] text-muted font-medium py-2 pr-4">Title</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2 pr-4">Downloads</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2 pr-4">Remixes</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2 pr-4">Embeds</th>
                          <th className="text-right text-[0.72rem] text-muted font-medium py-2">Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topImages.map((img, i) => (
                          <tr key={i} className="border-b border-foreground/[0.04] last:border-0">
                            <td className="py-2.5 pr-4">
                              <img src={`https://images.unsplash.com/${img.photo}?w=60&h=40&fit=crop&q=75`} alt="" className="w-10 h-7 rounded-lg object-cover" />
                            </td>
                            <td className="text-[0.82rem] font-medium py-2.5 pr-4">
                              <div className="flex items-center gap-1.5">
                                {img.pinned && <Star className="w-3 h-3 text-accent fill-accent shrink-0" />}
                                {img.title}
                              </div>
                            </td>
                            <td className="text-[0.82rem] text-muted text-right py-2.5 pr-4">{img.downloads}</td>
                            <td className="text-[0.82rem] text-muted text-right py-2.5 pr-4">{img.remixes}</td>
                            <td className="text-[0.82rem] text-muted text-right py-2.5 pr-4">{img.embeds}</td>
                            <td className="text-[0.82rem] font-semibold text-accent text-right py-2.5">{img.earnings}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ═══ EXPOSURE DASHBOARD ═══ */}
            {activeSection === "exposure" && (
              <>
                <div className="mb-6">
                  <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">Your Reach This Month</h1>
                  <p className="text-[0.82rem] text-muted mt-1">Real-time exposure stats for all your images</p>
                </div>

                {/* Big stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: "Views", value: "248,421", icon: Eye, color: "text-blue-500" },
                    { label: "Downloads", value: "18,204", icon: Download, color: "text-green-500" },
                    { label: "Remixes", value: "1,347", icon: RefreshCw, color: "text-purple-500" },
                    { label: "Embeds", value: "93 websites", icon: Globe, color: "text-orange-500" },
                    { label: "New Followers", value: "+2,431", icon: Users, color: "text-pink-500" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-card border border-foreground/[0.08] rounded-xl p-5 text-center">
                      <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                      <div className="font-display text-[1.6rem] font-black tracking-[-0.03em] leading-none mb-1">{stat.value}</div>
                      <div className="text-[0.72rem] text-muted uppercase tracking-[0.08em]">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Weekly views chart */}
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 mb-8">
                  <h3 className="font-semibold text-[0.9rem] mb-5">Views This Week</h3>
                  <div className="flex items-end gap-4 h-[160px]">
                    {weeklyExposure.map(d => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[0.65rem] text-muted">{(d.views / 1000).toFixed(1)}K</span>
                        <div className="w-full bg-accent/15 rounded-t-lg relative" style={{ height: `${(d.views / maxWeekly) * 100}%` }}>
                          <div className="absolute inset-0 bg-accent/80 rounded-t-lg" />
                        </div>
                        <span className="text-[0.72rem] text-muted font-medium">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Performance */}
                <div className="mb-8">
                  <h3 className="font-semibold text-[0.95rem] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" /> Image Performance
                  </h3>
                  <div className="flex flex-col gap-3">
                    {topImages.map((img, i) => (
                      <div key={i} className="bg-card border border-foreground/[0.08] rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                        <img src={`https://images.unsplash.com/${img.photo}?w=100&h=70&fit=crop&q=75`} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-[0.88rem]">{img.title}</span>
                            {img.pinned && <span className="text-[0.6rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-lg">Pinned</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-[0.78rem] text-muted">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {img.views} views</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {img.downloads} downloads</span>
                            <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {img.remixes} remixes</span>
                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {img.embeds} websites</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-display font-black text-accent text-[1.1rem]">{img.earnings}</div>
                          <div className="text-[0.65rem] text-muted">earned</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Where your images are used */}
                <div className="bg-foreground rounded-2xl p-6 mb-8 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-accent" />
                    <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/40">Real-world Impact</span>
                  </div>
                  <h3 className="font-display text-[1.4rem] font-black text-primary-foreground mb-3">Your Images Are Embedded On</h3>
                  <div className="font-display text-[3rem] font-black text-accent leading-none mb-2">1,032</div>
                  <p className="text-[0.82rem] text-primary-foreground/40 mb-4">websites across blogs, newsletters, and social media</p>
                  <div className="flex flex-wrap gap-2">
                    {["Medium.com", "Dev.to", "Notion pages", "WordPress blogs", "Substack", "And 1,027 more…"].map(s => (
                      <span key={s} className="text-[0.72rem] text-primary-foreground/50 bg-primary-foreground/[0.06] px-3 py-1.5 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Achievements in exposure tab too */}
                <div>
                  <h3 className="font-semibold text-[0.95rem] mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent" /> Achievements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {achievements.map(a => (
                      <div key={a.title} className={`border rounded-xl p-4 transition-colors ${a.unlocked ? "border-accent/20 bg-accent/[0.03]" : "border-foreground/[0.06] bg-card opacity-60"}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-lg">{a.icon}</span>
                          <span className="text-[0.82rem] font-semibold">{a.title}</span>
                          {a.unlocked && <span className="ml-auto text-[0.6rem] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-lg">✓</span>}
                        </div>
                        <p className="text-[0.72rem] text-muted">{a.desc}</p>
                        {!a.unlocked && a.progress && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${a.progress}%` }} />
                            </div>
                            <span className="text-[0.65rem] text-muted mt-1 block">{a.progress}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ MY IMAGES ═══ */}
            {activeSection === "images" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">My Images</h1>
                  <Link to="/upload" className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline">
                    <Upload className="w-4 h-4" /> Upload New
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {topImages.map((img, i) => (
                    <div key={i} className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden group">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img src={`https://images.unsplash.com/${img.photo}?w=400&h=300&fit=crop&q=78`} alt={img.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                        {img.pinned && (
                          <div className="absolute top-2 left-2 bg-accent text-primary-foreground text-[0.6rem] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Featured
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.65rem] font-semibold px-2 py-1 rounded-lg">Edit</button>
                          <button className="bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.65rem] font-semibold px-2 py-1 rounded-lg">View</button>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-[0.82rem] font-semibold mb-1">{img.title}</div>
                        <div className="flex items-center gap-3 text-[0.72rem] text-muted">
                          <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5" />{img.downloads}</span>
                          <span className="flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" />{img.remixes}</span>
                          <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" />{img.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ GALLERIES ═══ */}
            {activeSection === "galleries" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">My Galleries</h1>
                  <Link to="/create-gallery" className="flex items-center gap-2 bg-foreground text-primary-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline">
                    <Plus className="w-4 h-4" /> New Gallery
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  {galleries.map((g, i) => (
                    <div key={i} className="bg-card border border-foreground/[0.08] rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[0.92rem]">{g.name}</h3>
                          <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${g.free ? "bg-green-600/10 text-green-600" : "bg-accent/10 text-accent"}`}>
                            {g.free ? "Public" : "Private"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[0.78rem] text-muted">
                          <span>{g.images} images</span>
                          {!g.free && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.members} members</span>}
                          {g.code && <span className="flex items-center gap-1"><Key className="w-3 h-3 text-muted" /> {g.code}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {g.code && <button className="text-[0.78rem] text-muted border border-foreground/[0.1] px-3 py-1.5 rounded-lg hover:border-foreground/30 transition-colors">Change Code</button>}
                        <button className="text-[0.78rem] font-medium bg-foreground text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-accent transition-colors">Manage</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ EARNINGS ═══ */}
            {activeSection === "earnings" && (
              <>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-2">Earnings</h1>
                <p className="text-[0.84rem] text-muted mb-6">Your affiliate commission history and payout details</p>

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

            {/* ═══ NOTIFICATIONS ═══ */}
            {activeSection === "notifications" && (
              <>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-6">Notifications</h1>
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                  <div className="flex flex-col">
                    {recentActivity.map((a, i) => (
                      <div key={i} className={`flex items-center justify-between py-3.5 ${i < recentActivity.length - 1 ? "border-b border-foreground/[0.04]" : ""}`}>
                        <span className={`text-[0.84rem] ${i < 3 ? "text-foreground font-medium" : "text-muted"}`}>{a.text}</span>
                        <span className="text-[0.72rem] text-muted/60 shrink-0 ml-4">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ SETTINGS ═══ */}
            {activeSection === "settings" && (
              <>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-6">Settings</h1>
                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5">Profile</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#4361ee] flex items-center justify-center text-[1.1rem] font-bold text-primary-foreground">AV</div>
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

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6 mb-5">
                  <h3 className="font-semibold text-[0.95rem] mb-5">Payout Settings</h3>
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

                <div className="bg-card border border-foreground/[0.08] rounded-xl p-6">
                  <h3 className="font-semibold text-[0.95rem] mb-5">Account</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="text-[0.82rem] font-medium border border-foreground/[0.1] px-4 py-2 rounded-lg hover:border-foreground/30 transition-colors">Change password</button>
                    <button className="text-[0.82rem] font-medium border border-foreground/[0.1] px-4 py-2 rounded-lg hover:border-foreground/30 transition-colors">Download my data</button>
                  </div>
                  <button className="text-[0.82rem] font-medium text-destructive border border-destructive/20 px-4 py-2 rounded-lg hover:bg-destructive/5 transition-colors mt-4">
                    Delete account
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
