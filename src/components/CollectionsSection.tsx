const collections = [
  {
    name: "Abstract Worlds",
    count: 152,
    main: "photo-1618005182384-a83a8bd57fbe",
    thumbs: ["photo-1558618666-fcd25c85cd64", "photo-1541701494587-cb58502866ab"],
  },
  {
    name: "Fantasy Realms",
    count: 239,
    main: "photo-1549880338-65ddcdfd017b",
    thumbs: ["photo-1506905925346-21bda4d32df4", "photo-1501854140801-50d01698950b"],
  },
  {
    name: "Portraits",
    count: 185,
    main: "photo-1518020382113-a7e8fc38eac9",
    thumbs: ["photo-1547036967-23d11aacaee0", "photo-1500462918059-b1a0cb512f1d"],
  },
  {
    name: "Sci-Fi",
    count: 130,
    main: "photo-1579546929518-9e396f3cc809",
    thumbs: ["photo-1604881991720-f91add269bed", "photo-1576091160550-2173dba999ef"],
  },
];

const CollectionsSection = () => {
  return (
    <section className="py-[72px] px-6 md:px-12 bg-card">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="font-display text-[2.2rem] font-black tracking-[-0.03em] leading-none">
              SIGNATURE STYLES
              <span className="text-[0.9rem] font-body font-normal text-muted ml-3">| Curated By: Our Team</span>
            </h2>
            <p className="text-[0.83rem] text-muted mt-[7px]">For Overall Aesthetic Direction & Mood</p>
          </div>
          <a href="#" className="text-[0.8rem] font-semibold text-foreground border-b-[1.5px] border-foreground pb-px whitespace-nowrap">View All →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
          {collections.map((col) => (
            <div key={col.name} className="cursor-pointer group">
              {/* Main image */}
              <div className="rounded-[14px] overflow-hidden aspect-[3/4] mb-2">
                <img
                  src={`https://images.unsplash.com/${col.main}?w=400&h=530&fit=crop&q=78`}
                  alt={col.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              {/* Thumbnails row */}
              <div className="flex gap-1.5 items-center">
                {col.thumbs.map((thumb, j) => (
                  <div key={j} className="w-[52px] h-[52px] rounded-[10px] overflow-hidden flex-shrink-0">
                    <img
                      src={`https://images.unsplash.com/${thumb}?w=100&h=100&fit=crop&q=70`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="h-[52px] px-4 rounded-[10px] bg-foreground/90 flex items-center justify-center">
                  <span className="text-primary-foreground text-[0.82rem] font-bold">+{col.count}</span>
                </div>
              </div>
              {/* Name */}
              <p className="text-[0.92rem] font-semibold text-foreground mt-2.5">{col.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
