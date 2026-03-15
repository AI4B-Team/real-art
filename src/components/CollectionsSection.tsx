const collections = [
  {
    name: "CEO / Boss Babe",
    count: 152,
    main: "photo-1573496359142-b8d87734a5a2",
    thumbs: ["photo-1573496359142-b8d87734a5a2", "photo-1573497019940-1c28c88b4f3e"],
  },
  {
    name: "Luxury Lifestyle",
    count: 239,
    main: "photo-1600210492486-724fe5c67fb0",
    thumbs: ["photo-1600210492486-724fe5c67fb0", "photo-1616486338812-3dadae4b4ace"],
  },
  {
    name: "Street Fashion",
    count: 185,
    main: "photo-1509631179647-0177331693ae",
    thumbs: ["photo-1509631179647-0177331693ae", "photo-1529139574466-a303027c1d8b"],
  },
  {
    name: "Runway Inspired",
    count: 130,
    main: "photo-1558618666-fcd25c85cd64",
    thumbs: ["photo-1558618666-fcd25c85cd64", "photo-1509631179647-0177331693ae"],
  },
];

const CollectionsSection = () => {
  return (
    <section className="py-12 px-6 md:px-12 bg-card">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none">Collections</h2>
            <p className="text-[0.83rem] text-muted mt-[7px]">Hand-picked by our team — the finest in every category</p>
          </div>
          <a href="#" className="text-[0.8rem] font-semibold text-foreground border-b-[1.5px] border-foreground pb-px whitespace-nowrap">View All →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {collections.map((col) => (
            <div key={col.name} className="cursor-pointer group">
              {/* Main image */}
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2.5">
                <img
                  src={`https://images.unsplash.com/${col.main}?w=400&h=530&fit=crop&q=78`}
                  alt={col.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Thumbnails row */}
              <div className="flex items-center gap-1.5">
                {col.thumbs.map((t, i) => (
                  <div key={i} className="w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={`https://images.unsplash.com/${t}?w=100&h=100&fit=crop&q=70`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="h-[52px] px-4 rounded-xl bg-muted-foreground/80 flex items-center justify-center ml-auto">
                  <span className="text-primary-foreground font-semibold text-sm">+{col.count}</span>
                </div>
              </div>
              {/* Name */}
              <p className="text-foreground font-semibold text-[0.95rem] mt-2.5">{col.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
