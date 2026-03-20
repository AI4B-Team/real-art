import { ExternalLink, HelpCircle, Play } from "lucide-react";

const channels = [
  { name: "Instagram", desc: "Business or Creator accounts", icon: "📸", hasVideo: true },
  { name: "Facebook", desc: "Page", icon: "📘", hasVideo: true },
  { name: "LinkedIn", desc: "Page or Profile", icon: "💼", hasVideo: true },
  { name: "Google Business Profile", desc: "Profile", icon: "🔍", hasVideo: false },
  { name: "TikTok", desc: "Profile", icon: "🎵", hasVideo: false },
  { name: "Pinterest", desc: "Boards", icon: "📌", hasVideo: false },
  { name: "Twitter", desc: "Profile", icon: "𝕏", hasVideo: true },
  { name: "Youtube", desc: "Channel", icon: "▶️", hasVideo: false },
];

export default function SocialTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Connect Social Media Accounts</h2>
        <p className="text-sm text-muted mt-1">
          Choose the platforms where your posts should be published. You must connect at least one to enable auto posting.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-accent font-medium">0/{channels.length} Channels Connected →</span>
      </div>
      <p className="text-sm text-muted -mt-4">You can connect up to {channels.length} channels</p>

      <div className="space-y-3">
        {channels.map(ch => (
          <div key={ch.name} className="border border-foreground/[0.08] rounded-xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ch.icon}</span>
              <div>
                <div className="text-sm font-medium">{ch.name}</div>
                <div className="text-xs text-muted">{ch.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-1.5 rounded-lg border border-accent/30 text-accent text-sm font-medium hover:bg-accent/[0.06] transition-colors">
                Add
              </button>
              <button className="text-muted hover:text-foreground transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
              {ch.hasVideo && (
                <button className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
                  <Play className="w-3.5 h-3.5" /> Watch Videos
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
