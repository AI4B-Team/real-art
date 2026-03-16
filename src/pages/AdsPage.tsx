import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, BarChart3, Eye, MousePointerClick, DollarSign,
  Megaphone, TrendingUp, Pause, Play, Trash2, Globe, Search, Layout
} from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

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
  {
    id: "1",
    title: "Spring Collection Launch",
    brandName: "LuminaAI",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop&q=80",
    status: "active",
    placements: ["Explore Feed", "Search Results"],
    impressions: 24800,
    clicks: 1247,
    spent: 89.50,
    budget: 200,
    ctr: 5.03,
  },
  {
    id: "2",
    title: "AI Art Workshop Promo",
    brandName: "DreamForge",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=500&fit=crop&q=80",
    status: "paused",
    placements: ["Image Sidebar"],
    impressions: 8420,
    clicks: 312,
    spent: 31.20,
    budget: 100,
    ctr: 3.71,
  },
  {
    id: "3",
    title: "Premium Texture Pack",
    brandName: "SpectraGen",
    imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=500&fit=crop&q=80",
    status: "draft",
    placements: ["Explore Feed", "Search Results", "Image Sidebar"],
    impressions: 0,
    clicks: 0,
    spent: 0,
    budget: 150,
    ctr: 0,
  },
];

const statusColors: Record<CampaignStatus, string> = {
  active: "bg-green-500/10 text-green-600",
  paused: "bg-yellow-500/10 text-yellow-600",
  draft: "bg-muted/50 text-muted-foreground",
  completed: "bg-accent/10 text-accent",
};

const placementIcons: Record<string, typeof Globe> = {
  "Explore Feed": Layout,
  "Search Results": Search,
  "Image Sidebar": Globe,
};

const AdsPage = () => {
  const [view, setView] = useState<"campaigns" | "create">("campaigns");
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    brandName: "",
    imageUrl: "",
    destinationUrl: "",
    placements: [] as string[],
    dailyBudget: "5.00",
    totalBudget: "50.00",
    tags: "",
  });

  const togglePlacement = (p: string) => {
    setNewCampaign((prev) => ({
      ...prev,
      placements: prev.placements.includes(p)
        ? prev.placements.filter((x) => x !== p)
        : [...prev.placements, p],
    }));
  };

  const totalImpressions = mockCampaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = mockCampaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSpent = mockCampaigns.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="px-6 md:px-12 max-w-[1200px] mx-auto py-10">
        {/* Breadcrumb */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[0.78rem] text-muted hover:text-foreground mb-6 no-underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-5 h-5 text-accent" />
              <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Advertising</span>
            </div>
            <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] leading-none">Sponsored Ads</h1>
            <p className="text-[0.83rem] text-muted mt-1.5">Promote your images across REAL ART and reach millions of creators</p>
          </div>
          <button
            onClick={() => setView(view === "campaigns" ? "create" : "campaigns")}
            className="flex items-center gap-2 bg-foreground text-primary-foreground text-[0.82rem] font-semibold px-5 py-2.5 rounded-lg hover:bg-accent transition-colors"
          >
            {view === "campaigns" ? <><Plus className="w-4 h-4" /> New Campaign</> : <><ArrowLeft className="w-4 h-4" /> Back to Campaigns</>}
          </button>
        </div>

        {view === "campaigns" ? (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Eye, label: "Total Impressions", value: totalImpressions.toLocaleString() },
                { icon: MousePointerClick, label: "Total Clicks", value: totalClicks.toLocaleString() },
                { icon: TrendingUp, label: "Avg CTR", value: totalClicks > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` : "0%" },
                { icon: DollarSign, label: "Total Spent", value: `$${totalSpent.toFixed(2)}` },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-foreground/[0.08] rounded-xl p-4 flex flex-col items-center justify-center">
                  <stat.icon className="w-4 h-4 mb-2 text-accent" />
                  <div className="font-display font-black text-[1.1rem] tracking-[-0.02em]">{stat.value}</div>
                  <div className="text-[0.65rem] text-muted uppercase tracking-[0.08em] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Campaigns list */}
            <div className="space-y-3">
              {mockCampaigns.map((campaign) => (
                <div key={campaign.id} className="bg-card border border-foreground/[0.08] rounded-xl p-4 flex items-center gap-4 hover:border-foreground/[0.16] transition-all">
                  <img src={campaign.imageUrl} alt={campaign.title} className="w-16 h-20 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[0.9rem] truncate">{campaign.title}</h3>
                      <span className={`text-[0.62rem] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="text-[0.72rem] text-muted mb-2">{campaign.brandName}</div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {campaign.placements.map((p) => {
                        const Icon = placementIcons[p] || Globe;
                        return (
                          <span key={p} className="flex items-center gap-1 text-[0.65rem] text-muted">
                            <Icon className="w-3 h-3" /> {p}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <div className="font-display font-bold text-[0.9rem]">{campaign.impressions.toLocaleString()}</div>
                      <div className="text-[0.6rem] text-muted uppercase">Impressions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-bold text-[0.9rem]">{campaign.clicks.toLocaleString()}</div>
                      <div className="text-[0.6rem] text-muted uppercase">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-bold text-[0.9rem]">{campaign.ctr}%</div>
                      <div className="text-[0.6rem] text-muted uppercase">CTR</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-bold text-[0.9rem]">${campaign.spent.toFixed(2)}</div>
                      <div className="text-[0.6rem] text-muted uppercase">Spent</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {campaign.status === "active" && (
                      <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-foreground/[0.12] transition-colors" title="Pause">
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {campaign.status === "paused" && (
                      <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-foreground/[0.12] transition-colors" title="Resume">
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {campaign.status === "draft" && (
                      <button className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-[0.72rem] font-semibold px-3">
                        Launch
                      </button>
                    )}
                    <button className="p-2 rounded-lg bg-foreground/[0.06] hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-10 bg-card border border-foreground/[0.08] rounded-xl p-6">
              <h3 className="font-display text-[1.2rem] font-black mb-4">How Sponsored Ads Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { step: "1", title: "Create a Campaign", desc: "Upload your image, set your brand name, choose placements, and set your budget." },
                  { step: "2", title: "Pay & Go Live", desc: "Your ad enters review and goes live within 24 hours. Pay only for impressions served." },
                  { step: "3", title: "Track Performance", desc: "Monitor impressions, clicks, CTR, and spend in real-time from your dashboard." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[0.8rem] font-bold shrink-0">{s.step}</div>
                    <div>
                      <div className="font-semibold text-[0.85rem] mb-1">{s.title}</div>
                      <div className="text-[0.75rem] text-muted leading-[1.6]">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing tiers */}
            <div className="mt-6 bg-card border border-foreground/[0.08] rounded-xl p-6">
              <h3 className="font-display text-[1.2rem] font-black mb-4">Placement Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Layout, title: "Explore Feed", desc: "Mixed into the main masonry grid. 1 ad per ~25 images.", cpm: "$2.50", priority: "Most Popular" },
                  { icon: Search, title: "Search Results", desc: "Top of search results for targeted keywords.", cpm: "$4.00", priority: "Highest Intent" },
                  { icon: Globe, title: "Image Sidebar", desc: "Contextual placement on image detail pages.", cpm: "$1.50", priority: "Best Value" },
                ].map((tier) => (
                  <div key={tier.title} className="border border-foreground/[0.08] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <tier.icon className="w-4 h-4 text-accent" />
                      <span className="font-semibold text-[0.85rem]">{tier.title}</span>
                    </div>
                    <p className="text-[0.72rem] text-muted leading-[1.6] mb-3">{tier.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-[1rem]">{tier.cpm} <span className="text-[0.65rem] text-muted font-normal">CPM</span></span>
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-accent bg-accent/10 px-2 py-0.5 rounded-md">{tier.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Create campaign form */
          <div className="max-w-[640px]">
            <div className="space-y-5">
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Campaign Title</label>
                <input
                  type="text"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  placeholder="e.g. Spring Collection Launch"
                  className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Brand Name</label>
                <input
                  type="text"
                  value={newCampaign.brandName}
                  onChange={(e) => setNewCampaign({ ...newCampaign, brandName: e.target.value })}
                  placeholder="Your brand or creator name"
                  className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Ad Image URL</label>
                <input
                  type="url"
                  value={newCampaign.imageUrl}
                  onChange={(e) => setNewCampaign({ ...newCampaign, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Destination URL</label>
                <input
                  type="url"
                  value={newCampaign.destinationUrl}
                  onChange={(e) => setNewCampaign({ ...newCampaign, destinationUrl: e.target.value })}
                  placeholder="Where should clicks go?"
                  className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Placements</label>
                <div className="flex gap-2 flex-wrap">
                  {["Explore Feed", "Search Results", "Image Sidebar"].map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePlacement(p)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.78rem] font-medium border transition-all ${
                        newCampaign.placements.includes(p)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-foreground/[0.1] bg-card hover:border-foreground/[0.2]"
                      }`}
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
                  <input
                    type="text"
                    value={newCampaign.dailyBudget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, dailyBudget: e.target.value })}
                    className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold mb-1.5 block">Total Budget ($)</label>
                  <input
                    type="text"
                    value={newCampaign.totalBudget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, totalBudget: e.target.value })}
                    className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold mb-1.5 block">Targeting Tags (comma separated)</label>
                <input
                  type="text"
                  value={newCampaign.tags}
                  onChange={(e) => setNewCampaign({ ...newCampaign, tags: e.target.value })}
                  placeholder="e.g. cyberpunk, fashion, landscape"
                  className="w-full bg-card border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-[0.85rem] focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Preview */}
              {newCampaign.imageUrl && (
                <div>
                  <label className="text-[0.75rem] font-semibold mb-1.5 block">Preview</label>
                  <div className="w-48">
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={newCampaign.imageUrl} alt="Preview" className="w-full aspect-[3/4] object-cover" />
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.55rem] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-md">
                        Sponsored
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(transparent, hsl(0 0% 0% / 0.6))" }}>
                        <div className="text-[0.78rem] text-primary-foreground font-semibold">{newCampaign.brandName || "Brand Name"}</div>
                        <div className="text-[0.62rem] text-primary-foreground/60">Sponsored</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button className="bg-foreground text-primary-foreground text-[0.82rem] font-semibold px-6 py-2.5 rounded-lg hover:bg-accent transition-colors">
                  Save as Draft
                </button>
                <button className="bg-accent text-primary-foreground text-[0.82rem] font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/85 transition-colors">
                  Pay & Launch Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdsPage;
