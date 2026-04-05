import { useState, useEffect } from "react";
import {
  Globe, ChevronDown, Link2, Lock, Copy, Code, LinkIcon, Monitor,
  Calendar, MoreHorizontal, FileText, Image as ImageIcon, X,
  Facebook, Linkedin, Check, Mail, MessageCircle, Send,
  Bookmark, Printer, QrCode, Rss, Share2, ArrowLeft,
  Instagram, Youtube, Clock, History, Pencil, Trash2, ExternalLink,
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

const SOCIAL_PLATFORMS_MAIN = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { id: "linkedin", label: "Linkedin", icon: Linkedin, color: "text-blue-700" },
  { id: "x", label: "X", icon: () => <span className="font-bold text-sm">𝕏</span>, color: "" },
];

const SOCIAL_PLATFORMS_ALL = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "text-red-600" },
  { id: "email", label: "Email", icon: Mail, color: "text-muted-foreground" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-600" },
  { id: "telegram", label: "Telegram", icon: Send, color: "text-blue-500" },
  { id: "pinterest", label: "Pinterest", icon: Bookmark, color: "text-red-500" },
  { id: "reddit", label: "Reddit", icon: Share2, color: "text-orange-500" },
  { id: "rss", label: "RSS", icon: Rss, color: "text-orange-400" },
];

const MORE_OPTIONS_MAIN = [
  { id: "copy", label: "Copy", icon: Copy },
  { id: "embed", label: "Embed", icon: Code },
  { id: "template", label: "Template Link", icon: LinkIcon },
  { id: "present", label: "Present", icon: Monitor },
];

const MORE_OPTIONS_ALL = [
  { id: "print", label: "Print", icon: Printer },
  { id: "qrcode", label: "QR Code", icon: QrCode },
  { id: "bookmark", label: "Bookmark", icon: Bookmark },
];

interface EbookShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName?: string;
}

interface ShareHistoryEntry {
  id: string;
  type: 'scheduled' | 'shared' | 'downloaded' | 'link-copied';
  platforms?: string[];
  format?: string;
  date: string;
  time?: string;
  scheduledFor?: string; // ISO date for scheduled items
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  createdAt: string;
}

const HISTORY_KEY = 'ebook-share-history';

const loadHistory = (): ShareHistoryEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
};

const saveHistory = (entries: ShareHistoryEntry[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
};

export default function EbookShareModal({ open, onOpenChange, projectName }: EbookShareModalProps) {
  const [permission, setPermission] = useState<Permission>("View");
  const [permDropdownOpen, setPermDropdownOpen] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showAllSocial, setShowAllSocial] = useState(false);
  const [showAllMore, setShowAllMore] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [schedulePlatforms, setSchedulePlatforms] = useState<Set<string>>(new Set());
  const [scheduleError, setScheduleError] = useState("");
  const [shareHistory, setShareHistory] = useState<ShareHistoryEntry[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ShareHistoryEntry | null>(null);

  useEffect(() => { saveHistory(shareHistory); }, [shareHistory]);

  const addHistoryEntry = (entry: Omit<ShareHistoryEntry, 'id' | 'createdAt'>) => {
    const newEntry: ShareHistoryEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setShareHistory(prev => [newEntry, ...prev]);
  };

  const removeHistoryEntry = (id: string) => {
    setShareHistory(prev => prev.filter(e => e.id !== id));
  };

  const updateHistoryEntry = (id: string, updates: Partial<ShareHistoryEntry>) => {
    setShareHistory(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/shared/ebook/${btoa(Date.now().toString()).slice(0, 12)}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast({ title: "Link copied to clipboard!" });
    setTimeout(() => setLinkCopied(false), 2000);
    addHistoryEntry({ type: 'link-copied', date: new Date().toLocaleDateString(), status: 'completed' });
  };

  const handleSelectFormat = (formatId: string) => {
    setSelectedFormat(prev => prev === formatId ? null : formatId);
  };

  const handleConfirmDownload = () => {
    if (!selectedFormat) return;
    const fmt = DOWNLOAD_FORMATS.find(f => f.id === selectedFormat);
    toast({ title: `Preparing ${fmt?.label} download...`, description: `${projectName || "Untitled Book"}${fmt?.ext}` });
    setTimeout(() => {
      setSelectedFormat(null);
      toast({ title: `${fmt?.label} downloaded successfully!` });
      addHistoryEntry({ type: 'downloaded', format: fmt?.label || selectedFormat!, date: new Date().toLocaleDateString(), status: 'completed' });
    }, 1500);
  };

  const handleSocialShare = (platformId: string) => {
    const shareUrl = encodeURIComponent(`${window.location.origin}/shared/ebook`);
    const title = encodeURIComponent(projectName || "Check out my eBook!");
    let url = "";
    if (platformId === "facebook") url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    else if (platformId === "linkedin") url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
    else if (platformId === "x") url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}`;
    else if (platformId === "whatsapp") url = `https://wa.me/?text=${title}%20${shareUrl}`;
    else if (platformId === "telegram") url = `https://t.me/share/url?url=${shareUrl}&text=${title}`;
    else if (platformId === "pinterest") url = `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${title}`;
    else if (platformId === "reddit") url = `https://www.reddit.com/submit?url=${shareUrl}&title=${title}`;
    else if (platformId === "email") url = `mailto:?subject=${title}&body=${shareUrl}`;

    if (url) {
      if (platformId === "email") window.location.href = url;
      else window.open(url, "_blank", "width=600,height=400");
      toast({ title: `Opening ${platformId}...` });
      addHistoryEntry({ type: 'shared', platforms: [platformId], date: new Date().toLocaleDateString(), status: 'sent' });
    } else {
      toast({ title: `${platformId} sharing`, description: "Coming soon!" });
    }
  };

  const handleMoreOption = (optionId: string) => {
    if (optionId === "copy") {
      handleCopyLink();
    } else if (optionId === "embed") {
      const embedCode = `<iframe src="${window.location.origin}/embed/ebook/${Date.now()}" width="100%" height="600" frameborder="0"></iframe>`;
      navigator.clipboard.writeText(embedCode);
      toast({ title: "Embed code copied!", description: "Paste this into your website" });
    } else if (optionId === "print") {
      window.print();
    } else if (optionId === "qrcode") {
      toast({ title: "QR Code generated!", description: "Coming soon!" });
    } else {
      toast({ title: `${optionId}`, description: "Coming soon!" });
    }
  };

  const toggleSchedulePlatform = (id: string) => {
    setSchedulePlatforms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleScheduleConfirm = () => {
    if (!scheduleDate || !scheduleTime || schedulePlatforms.size === 0) {
      setScheduleError("Please select a date, time, and at least one platform");
      return;
    }
    setScheduleError("");
    const names = [...schedulePlatforms].join(", ");
    toast({ title: "Publishing scheduled!", description: `${scheduleDate} at ${scheduleTime} on ${names}` });
    addHistoryEntry({
      type: 'scheduled',
      platforms: [...schedulePlatforms],
      date: new Date().toLocaleDateString(),
      time: scheduleTime,
      scheduledFor: `${scheduleDate}T${scheduleTime}`,
      status: 'pending',
    });
    setShowSchedule(false);
    setScheduleDate("");
    setScheduleTime("");
    setSchedulePlatforms(new Set());
  };

  const socialCircleClass = (id: string) =>
    id === "facebook" ? "bg-blue-600 text-white" :
    id === "linkedin" ? "bg-blue-700 text-white" :
    id === "instagram" ? "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white" :
    id === "youtube" ? "bg-red-600 text-white" :
    id === "whatsapp" ? "bg-green-600 text-white" :
    id === "telegram" ? "bg-blue-500 text-white" :
    id === "pinterest" ? "bg-red-500 text-white" :
    "bg-foreground/[0.06]";

  const SocialButton = ({ platform }: { platform: { id: string; label: string; icon: any; color: string } }) => (
    <button onClick={() => handleSocialShare(platform.id)}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${socialCircleClass(platform.id)}`}>
        <platform.icon className="w-4 h-4" />
      </div>
      <span className="text-[11px] font-medium">{platform.label}</span>
    </button>
  );

  // Schedule sub-view
  if (showSchedule) {
    // Also handle editing an existing entry
    const allPlatforms = [...SOCIAL_PLATFORMS_MAIN, ...SOCIAL_PLATFORMS_ALL];

    // If editing, pre-populate
    useEffect(() => {
      if (editingEntry && showSchedule) {
        if (editingEntry.scheduledFor) {
          const [d, t] = editingEntry.scheduledFor.split('T');
          setScheduleDate(d || '');
          setScheduleTime(t || '');
        }
        setSchedulePlatforms(new Set(editingEntry.platforms || []));
      }
    }, [editingEntry, showSchedule]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 rounded-2xl overflow-hidden">
          <DialogHeader className="p-5 pb-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSchedule(false)} className="p-1 rounded-lg hover:bg-foreground/[0.05]">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <DialogTitle className="text-lg font-bold">Schedule Publishing</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] text-sm outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] text-sm outline-none focus:border-accent" />
              </div>
            </div>

            <div>
              <p className="text-sm font-bold mb-3">Select Platforms</p>
              <div className="grid grid-cols-5 gap-2">
                {allPlatforms.map(p => (
                  <button key={p.id} onClick={() => toggleSchedulePlatform(p.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      schedulePlatforms.has(p.id) ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                    }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${socialCircleClass(p.id)}`}>
                      <p.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {scheduleError && (
              <p className="text-sm text-destructive text-center">{scheduleError}</p>
            )}
            <button onClick={handleScheduleConfirm}
              className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              onClick={() => {
                if (!scheduleDate || !scheduleTime || schedulePlatforms.size === 0) {
                  setScheduleError("Please select a date, time, and at least one platform");
                  return;
                }
                setScheduleError("");
                const names = [...schedulePlatforms].join(", ");
                if (editingEntry) {
                  updateHistoryEntry(editingEntry.id, {
                    platforms: [...schedulePlatforms],
                    scheduledFor: `${scheduleDate}T${scheduleTime}`,
                    time: scheduleTime,
                    date: new Date().toLocaleDateString(),
                  });
                  toast({ title: "Schedule updated!", description: `${scheduleDate} at ${scheduleTime} on ${names}` });
                  setEditingEntry(null);
                  setShowSchedule(false);
                  setScheduleDate("");
                  setScheduleTime("");
                  setSchedulePlatforms(new Set());
                } else {
                  handleScheduleConfirm();
                }
              }}>
              <Clock className="w-4 h-4" />
              {editingEntry ? 'Update Schedule' : 'Schedule'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // History sub-view
  if (showHistory) {
    const getStatusBadge = (status: ShareHistoryEntry['status']) => {
      switch (status) {
        case 'pending': return 'bg-amber-100 text-amber-700';
        case 'sent': return 'bg-blue-100 text-blue-700';
        case 'completed': return 'bg-emerald-100 text-emerald-700';
        case 'cancelled': return 'bg-foreground/[0.06] text-muted-foreground line-through';
      }
    };
    const getTypeLabel = (entry: ShareHistoryEntry) => {
      switch (entry.type) {
        case 'scheduled': return `Scheduled → ${(entry.platforms || []).join(', ')}`;
        case 'shared': return `Shared → ${(entry.platforms || []).join(', ')}`;
        case 'downloaded': return `Downloaded ${entry.format || ''}`;
        case 'link-copied': return 'Link Copied';
      }
    };
    const pendingEntries = shareHistory.filter(e => e.status === 'pending');
    const pastEntries = shareHistory.filter(e => e.status !== 'pending');

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="p-5 pb-0 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(false)} className="p-1 rounded-lg hover:bg-foreground/[0.05]">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5" /> Share History
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {shareHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No share history yet</p>
                <p className="text-xs mt-1">Your scheduled and shared items will appear here</p>
              </div>
            ) : (
              <>
                {pendingEntries.length > 0 && (
                  <div>
                    <p className="text-sm font-bold mb-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">{pendingEntries.length}</span>
                    </p>
                    <div className="space-y-2">
                      {pendingEntries.map(entry => (
                        <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.01]">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{getTypeLabel(entry)}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {entry.scheduledFor ? new Date(entry.scheduledFor).toLocaleString() : entry.date}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(entry.status)}`}>
                            {entry.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingEntry(entry);
                                setShowHistory(false);
                                setShowSchedule(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-foreground/[0.05] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateHistoryEntry(entry.id, { status: 'cancelled' })}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pastEntries.length > 0 && (
                  <div>
                    <p className="text-sm font-bold mb-2">History</p>
                    <div className="space-y-2">
                      {pastEntries.map(entry => (
                        <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl border border-foreground/[0.08] bg-foreground/[0.01]">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{getTypeLabel(entry)}</p>
                            <p className="text-[11px] text-muted-foreground">{entry.date}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(entry.status)}`}>
                            {entry.status}
                          </span>
                          <button
                            onClick={() => removeHistoryEntry(entry.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <DialogHeader className="p-5 pb-0 shrink-0">
          <DialogTitle className="text-lg font-bold flex items-center gap-2"><Share2 className="w-5 h-5" />Share</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
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
                <button key={fmt.id} onClick={() => handleSelectFormat(fmt.id)}
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
            {selectedFormat && (
              <button onClick={handleConfirmDownload}
                className="mt-3 w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                Download {DOWNLOAD_FORMATS.find(f => f.id === selectedFormat)?.label}
              </button>
            )}
          </div>

          {/* Publish to Social Media */}
          <div>
            <p className="text-sm font-bold mb-3">Publish To Social Media</p>
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => setShowSchedule(true)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-foreground/[0.06]">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium">Schedule</span>
              </button>
              {SOCIAL_PLATFORMS_MAIN.map(p => (
                <SocialButton key={p.id} platform={p} />
              ))}
              {!showAllSocial && (
                <button onClick={() => setShowAllSocial(true)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-foreground/[0.06]">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-medium">See All</span>
                </button>
              )}
            </div>
            {/* Pending schedules summary */}
            {shareHistory.filter(e => e.status === 'pending').length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="mt-2 w-full flex items-center justify-between px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-sm"
              >
                <span className="flex items-center gap-2 text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">{shareHistory.filter(e => e.status === 'pending').length} scheduled</span>
                </span>
                <span className="text-[11px] text-amber-600 font-medium">View All →</span>
              </button>
            )}
            {showAllSocial && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {SOCIAL_PLATFORMS_ALL.map(p => (
                  <SocialButton key={p.id} platform={p} />
                ))}
                <button onClick={() => setShowAllSocial(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-foreground/[0.06]">
                    <X className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-medium">Collapse</span>
                </button>
              </div>
            )}
          </div>

          {/* More Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">More</p>
              <button onClick={() => setShowHistory(true)}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors">
                <History className="w-3.5 h-3.5" /> Share History
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {MORE_OPTIONS_MAIN.map(option => (
                <button key={option.id} onClick={() => handleMoreOption(option.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[11px] font-medium">{option.label}</span>
                </button>
              ))}
              {!showAllMore && (
                <button onClick={() => setShowAllMore(true)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[11px] font-medium">See All</span>
                </button>
              )}
            </div>
            {showAllMore && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {MORE_OPTIONS_ALL.map(option => (
                  <button key={option.id} onClick={() => handleMoreOption(option.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                    <option.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[11px] font-medium">{option.label}</span>
                  </button>
                ))}
                <button onClick={() => setShowAllMore(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.15] hover:bg-foreground/[0.02] transition-all">
                  <X className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[11px] font-medium">Collapse</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}