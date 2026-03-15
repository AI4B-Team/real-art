import { Link } from "react-router-dom";

interface CollectionCardProps {
  id: string;
  name: string;
  subtitle: string;
  count: number;
  mainPhoto: string;
  thumbPhotos?: string[];
  badge?: string;
}

const CollectionCard = ({ id, name, subtitle, count, mainPhoto, thumbPhotos = [], badge }: CollectionCardProps) => {
  const thumbs = thumbPhotos.length > 0 ? thumbPhotos : [mainPhoto, mainPhoto, mainPhoto, mainPhoto];

  return (
    <Link to={`/collections/${id}`} className="cursor-pointer group no-underline block">
      <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2.5 relative">
        <img
          src={`https://images.unsplash.com/${mainPhoto}?w=400&h=530&fit=crop&q=78`}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
          <div className="absolute top-3 left-3 bg-accent text-primary-foreground text-[0.62rem] font-bold px-2.5 py-1 rounded-lg uppercase tracking-[0.06em]">
            {badge}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {thumbs.slice(0, 4).map((t, i) => (
          <div key={i} className="h-[42px] rounded-lg overflow-hidden flex-1 min-w-0">
            <img src={`https://images.unsplash.com/${t}?w=100&h=100&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="h-[42px] px-3 rounded-lg bg-muted-foreground/80 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-semibold text-sm">+{count}</span>
        </div>
      </div>
      <p className="text-foreground font-semibold text-[0.95rem] mt-2.5">{name}</p>
      <p className="text-muted text-[0.76rem] leading-[1.4] mt-0.5">{subtitle}</p>
    </Link>
  );
};

export default CollectionCard;
