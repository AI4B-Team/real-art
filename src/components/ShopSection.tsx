import { Link } from "react-router-dom";
import { ExternalLink, ShoppingBag } from "lucide-react";

export interface ShopLink {
  url: string;
  site: string;
  price?: string;
}

export interface ShopSimilarItem {
  photo: string;
  title: string;
  price: string;
  site: string;
  url: string;
}

interface ShopSectionProps {
  shopLink: ShopLink;
  shopSimilar?: ShopSimilarItem[];
}

const ShopSection = ({ shopLink, shopSimilar = [] }: ShopSectionProps) => (
  <>
    {/* Shop This Image */}
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-1">
        <ShoppingBag className="w-4 h-4 text-accent" />
        <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Shop the Look</span>
      </div>
      <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-4">Shop This Image</h2>
      <a
        href={shopLink.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl border border-foreground/[0.08] bg-card hover:border-accent/30 transition-all group no-underline"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="font-semibold text-[0.88rem] group-hover:text-accent transition-colors">
              {shopLink.price ? `Shop for ${shopLink.price}` : "Shop This Look"}
            </div>
            <div className="text-[0.72rem] text-muted">via {shopLink.site}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[0.78rem] text-accent font-semibold">
          Visit Site <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    </div>

    {/* Shop Similar */}
    {shopSimilar.length > 0 && (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-4 h-4 text-accent" />
          <span className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent">Visually Similar</span>
        </div>
        <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-4">Shop Similar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {shopSimilar.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block no-underline relative rounded-xl overflow-hidden"
            >
              <img
                src={`https://images.unsplash.com/${item.photo}?w=300&h=375&fit=crop&q=78`}
                alt={item.title}
                loading="lazy"
                className="w-full aspect-[4/5] object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
              <div
                className="absolute inset-x-0 bottom-0 p-3"
                style={{ background: "linear-gradient(transparent, hsl(0 0% 0% / 0.7))" }}
              >
                <p className="text-[0.75rem] text-primary-foreground font-semibold leading-tight">{item.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[0.72rem] text-primary-foreground/80 font-bold">{item.price}</span>
                  <span className="text-[0.62rem] text-primary-foreground/50">{item.site}</span>
                </div>
              </div>
              {/* Shop badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-accent text-primary-foreground text-[0.55rem] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-lg">
                <ShoppingBag className="w-2.5 h-2.5" /> Shop
              </div>
            </a>
          ))}
        </div>
      </div>
    )}
  </>
);

export default ShopSection;
