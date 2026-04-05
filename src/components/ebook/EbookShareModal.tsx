import { useState } from "react";
import {
  Globe, ChevronDown, Link2, Lock, Copy, Code, LinkIcon, Monitor,
  Calendar, MoreHorizontal, FileText, Image as ImageIcon, X,
  Facebook, Linkedin, Check,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const PERMISSION_OPTIONS = ["View", "Edit", "Comment"] as const;
type Permission = typeof PERMISSION_OPTIONS[number];

const DOWNLOAD_FORMATS = [
  { id: "pdf", label: "PDF", ext: ".pdf", icon: FileText, color: "text-red-500" },
  { id: "png", label: "PNG", ext: ".png", icon: ImageIcon, color: "text-green-500" },
  { id: "docx", label: "Word", ext: ".docx", icon: FileText, color: "text-blue-500" },
  { id: "txt", label: "Text", ext: ".txt", icon: FileText, color: "text-muted-foreground" },
  { id: "epub", label: "EPUB", ext: ".epub", icon: FileText, color: "text-purple-500" },
];

const SOCIAL_PLATFORMS = [
  { id: "schedule", label: "Schedule", icon: Calendar, color: "" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { id: "linkedin", label: "Linkedin", icon: Linkedin, color: "text-blue-700" },
  { id: "x", label: "X", icon: () => <span className="font-bold text-sm">𝕏</span>, color: "" },
  { id: "more", label: "See All", icon: MoreHorizontal, color: "" },
];

const MORE_OPTIONS = [
  { id: "copy", label: "Copy", icon: Copy },
  { id: "embed", label: "Embed", icon: Code },
  { id: "template", label: "Template Link", icon: LinkIcon },
  { id: "present", label: "Present", icon: Monitor },
  { id: "more", label: "See All", icon: MoreHorizontal },
];

interface EbookShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName?: string;
}

export default function EbookShareModal({ open, onOpenChange, projectName }: EbookShareModalProps) {
  const [permission, setPermission] = useState<Permission>("View");
  const [permDropdownOpen, setPermDropdownOpen] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/shared/ebook/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast({ title: "Link copied to clipboard!" });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDownload = (formatId: string) => {
    setSelectedFormat(formatId);
    const fmt = DOWNLOAD_FORMATS.find(f => f.id === formatId);
    toast({ title: `Preparing ${fmt?.label} download...`, description: `${projectName || "Untitled Book"}${fmt?.ext}` });
    // Simulate download
    setTimeout(() => {
      setSelectedFormat(null);
      toast({ title: `${fmt?.label} downloaded successfully!` });
    }, 1500);
  };

  const handleSocialShare = (platformId: string) => {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    if (platformId === "schedule") {
      toast({ title: "Schedule publishing", description: "Coming soon!" });
    } else if (platformId === "more") {
      toast({ title: "More platforms coming soon!" });
    } else {
      toast({ title: `Sharing to ${platform?.label}...`, description: "Opening sharing dialog" });
      // Construct share URLs
      const shareUrl = encodeURIComponent(`${window.location.origin}/shared/ebook`);
      const title = encodeURIComponent(projectName || "Check out my eBook!");
      let url = "";
      if (platformId === "facebook") url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      else if (platformId === "linkedin") url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
      else if (platformId === "x") url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}`;
      if (url) window.open(url, "_blank", "width=600,height=400");
    }
  };

  const handleMoreOption = (optionId: string) => {
    const opt = MORE_OPTIONS.find(o => o.id === optionId);
    if (optionId === "copy") {
      handleCopyLink();
    } else if (optionId === "embed") {
      const embedCode = `<iframe src="${window.location.origin}/embed/ebook/${Date.now()}" width="100%" height="600" frameborder="0"></iframe>`;
      navigator.clipboard.writeText(embedCode);
      toast({ title: "Embed code copied!", description: "Paste this into your website" });
    } else if (optionId === "present") {
      toast({ title: "Presentation mode", description: "Coming soon!" });
    } else {
      toast({ title: `${opt?.label}`, description: "Coming soon!" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-bold">Share</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-5">
          {/* Access Control */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Anyone With The Link Can</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setPermDropdownOpen(!permDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                {permission}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {permDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-background border border-foreground/[0.1] rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                  {PERMISSION_OPTIONS.map(p => (
                    <button key={p} onClick={() => { setPermission(p); setPermDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${permission === p ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Copy Link */}
          <button onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all text-sm font-medium">
            {linkCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
            {linkCopied ? "Copied!" : "Copy Link"}
          </button>

          {/* Password Protection */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-destructive/70" />
              <div>
                <p className="text-sm font-medium">Privately With Password</p>
                <p className="text-[11px] text-muted-foreground">Only Those With Password Can View The Visual</p>
              </div>
            </div>
            <Switch checked={passwordProtected} onCheckedChange={setPasswordProtected} />
          </div>

          {passwordProtected && (
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-3 py-2.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] text-sm outline-none focus:border-accent transition-colors"
            />
          )}

          {/* Download Section */}
          <div>
            <p className="text-sm font-bold mb-1">Download</p>
            <p className="text-[11px] text-muted-foreground mb-3">Select The Format</p>
            <div className="grid grid-cols-5 gap-2">
              {DOWNLOAD_FORMATS.map(fmt => (
                <button key={fmt.id} onClick={() => handleDownload(fmt.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    selectedFormat === fmt.id
                      ? "border-accent bg-accent/5 ring-1 ring-accent"
                      : "border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02]"
                  }`}>
                  <fmt.icon className={`w-5 h-5 ${fmt.color}`} />
                  <span className="text-xs font-semibold">{fmt.label}</span>
                  <span className="text-[9px] text-muted-foreground">{fmt.ext}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Publish to Social Media */}
          <div>
            <p className="text-sm font-bold mb-3">Publish To Social Media</p>
            <div className="grid grid-cols-5 gap-2">
              {SOCIAL_PLATFORMS.map(platform => (
                <button key={platform.id} onClick={() => handleSocialShare(platform.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    platform.id === "facebook" ? "bg-blue-600 text-white" :
                    platform.id === "linkedin" ? "bg-blue-700 text-white" :
                    "bg-foreground/[0.06]"
                  }`}>
                    <platform.icon className={`w-4 h-4 ${
                      platform.id === "facebook" || platform.id === "linkedin" ? "text-white" : ""
                    }`} />
                  </div>
                  <span className="text-[11px] font-medium">{platform.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* More Options */}
          <div>
            <p className="text-sm font-bold mb-3">More</p>
            <div className="grid grid-cols-5 gap-2">
              {MORE_OPTIONS.map(option => (
                <button key={option.id} onClick={() => handleMoreOption(option.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[11px] font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
