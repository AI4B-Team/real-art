import { ExternalLink } from "lucide-react";

interface SponsoredCardProps {
  imageUrl: string;
  brandName: string;
  destinationUrl: string;
  variant?: "feed" | "sidebar";
}

const SponsoredCard = ({ imageUrl, brandName, destinationUrl, variant = "feed" }: SponsoredCardProps) => (
  <a
    href={destinationUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative block rounded-xl overflow-hidden no-underline"
  >
    <img
      src={imageUrl}
      alt={`Sponsored by ${brandName}`}
      loading="lazy"
      className={`w-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ${
        variant === "sidebar" ? "aspect-[4/5]" : "aspect-[3/4]"
      }`}
    />
    {/* Gradient overlay */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      style={{ background: "linear-gradient(to top, hsl(0 0% 0% / 0.6) 0%, transparent 40%)" }}
    />
    {/* Sponsored badge */}
    <div className="absolute top-2 left-2 flex items-center gap-1 bg-foreground/70 backdrop-blur-sm text-primary-foreground text-[0.55rem] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-md">
      Sponsored
    </div>
    {/* Brand info */}
    <div className="absolute bottom-0 left-0 right-0 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[0.78rem] text-primary-foreground font-semibold">{brandName}</div>
          <div className="text-[0.62rem] text-primary-foreground/60">Sponsored</div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-[0.65rem] text-primary-foreground/80 font-medium">
            Visit <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  </a>
);

export default SponsoredCard;
