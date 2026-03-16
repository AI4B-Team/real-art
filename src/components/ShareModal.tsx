import { useState } from "react";
import { X, Copy, Check, Download, ExternalLink, RefreshCw } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  creator: { name: string; avatar: string; color: string };
  prompt: string;
  recreations: string;
  imageId: string;
}

const ShareModal = ({ open, onClose, imageUrl, title, creator, prompt, recreations, imageId }: ShareModalProps) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"image" | "prompt">("image");

  if (!open) return null;

  const shareUrl = `https://realart.ai/image/${imageId}`;
  const shareText = `${title} by ${creator.name} — Recreated ${recreations} times. Recreate this artwork on REAL ART`;
  const promptShareText = `AI Prompt: "${prompt.slice(0, 120)}…" — View & recreate on REAL ART`;

  const socialLinks = [
    {
      name: "Twitter / X",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(activeTab === "prompt" ? promptShareText : shareText)}&url=${encodeURIComponent(shareUrl)}`,
      bg: "bg-foreground text-primary-foreground",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      bg: "bg-[#0A66C2] text-primary-foreground",
    },
    {
      name: "Reddit",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
      ),
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      bg: "bg-[#FF4500] text-primary-foreground",
    },
    {
      name: "Pinterest",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" /></svg>
      ),
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`,
      bg: "bg-[#E60023] text-primary-foreground",
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt).catch(() => {});
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
      <div
        className="relative bg-background rounded-2xl w-full max-w-[520px] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Tabs */}
        <div className="flex border-b border-foreground/[0.06]">
          <button
            onClick={() => setActiveTab("image")}
            className={`flex-1 py-4 text-[0.84rem] font-semibold transition-colors border-b-2 -mb-px ${activeTab === "image" ? "border-foreground text-foreground" : "border-transparent text-muted"}`}
          >
            Share Image
          </button>
          <button
            onClick={() => setActiveTab("prompt")}
            className={`flex-1 py-4 text-[0.84rem] font-semibold transition-colors border-b-2 -mb-px ${activeTab === "prompt" ? "border-foreground text-foreground" : "border-transparent text-muted"}`}
          >
            Share Prompt
          </button>
        </div>

        <div className="p-6">
          {/* Preview Card */}
          <div className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden mb-5">
            {activeTab === "image" ? (
              <>
                <div className="relative">
                  <img src={imageUrl} alt={title} className="w-full h-[200px] object-cover" />
                  {/* Watermark */}
                  <div className="absolute bottom-3 right-3 bg-foreground/50 backdrop-blur-sm text-primary-foreground text-[0.6rem] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-lg">
                    REAL ART
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-[1.1rem] font-black mb-1">{title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-primary-foreground" style={{ background: creator.color }}>
                      {creator.avatar}
                    </div>
                    <span className="text-[0.78rem] text-muted">by {creator.name.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[0.75rem] text-muted">
                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Recreated {recreations} times</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-accent text-[0.78rem] font-semibold">
                    <ExternalLink className="w-3.5 h-3.5" /> Recreate this artwork →
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-muted mb-2">Prompt</div>
                <p className="text-[0.88rem] leading-[1.7] font-mono text-foreground/80 mb-4">{prompt}</p>
                <div className="flex items-center gap-3 text-[0.75rem] text-muted mb-3">
                  <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Used {recreations} times</span>
                </div>
                <div className="flex items-center gap-2 text-accent text-[0.78rem] font-semibold">
                  <ExternalLink className="w-3.5 h-3.5" /> View image & recreate →
                </div>
                <div className="mt-3 pt-3 border-t border-foreground/[0.06] flex items-center gap-2">
                  <div className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-muted/40">REAL ART</div>
                </div>
              </div>
            )}
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {socialLinks.map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[0.82rem] font-semibold transition-opacity hover:opacity-80 no-underline ${s.bg}`}
              >
                {s.icon} {s.name}
              </a>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-background border border-foreground/[0.1] rounded-lg px-3 py-2.5 text-[0.8rem] text-muted truncate font-mono">
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[0.82rem] font-semibold transition-all ${linkCopied ? "bg-green-500/10 text-green-600 border border-green-500/30" : "bg-foreground text-primary-foreground hover:bg-accent"}`}
            >
              {linkCopied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
            </button>
          </div>

          {/* Copy prompt (only in prompt tab) */}
          {activeTab === "prompt" && (
            <button
              onClick={handleCopyPrompt}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[0.82rem] font-semibold transition-all mb-4 ${promptCopied ? "bg-green-500/10 text-green-600 border border-green-500/30" : "border border-foreground/[0.12] text-foreground hover:border-foreground/30"}`}
            >
              {promptCopied ? <><Check className="w-3.5 h-3.5" /> Prompt Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>}
            </button>
          )}

          {/* Download social card */}
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[0.82rem] font-semibold border border-foreground/[0.12] text-foreground hover:border-foreground/30 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download Social Card
          </button>

          {/* CTA */}
          <div className="mt-5 text-center">
            <p className="text-[0.72rem] text-muted">Every share helps creators get discovered</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
