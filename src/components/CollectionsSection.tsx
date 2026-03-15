const collectionPhotos = [
  "photo-1618005182384-a83a8bd57fbe", "photo-1558618666-fcd25c85cd64",
  "photo-1549880338-65ddcdfd017b", "photo-1518020382113-a7e8fc38eac9",
  "photo-1543722530-d2c3201371e7",
];

const collections = [
  { name: "Abstract Worlds", count: "12,400 images", big: true },
  { name: "Portraits", count: "8,200 images", big: false },
  { name: "Fantasy Realms", count: "9,800 images", big: false },
  { name: "Sci-Fi", count: "6,100 images", big: false },
  { name: "Architecture", count: "5,400 images", big: false },
];

const CollectionsSection = () => {
  return (
    <section className="py-[72px] px-6 md:px-12 bg-card">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-[2.8rem] font-black tracking-[-0.03em] leading-none">Collections</h2>
            <p className="text-[0.83rem] text-muted mt-[7px]">Hand-picked by our team — the finest in every category</p>
          </div>
          <a href="#" className="text-[0.8rem] font-semibold text-foreground border-b-[1.5px] border-foreground pb-px whitespace-nowrap">View All →</a>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-[240px_240px] gap-3">
          {collections.map((col, i) => (
            <div
              key={col.name}
              className={`rounded-[14px] overflow-hidden cursor-pointer relative hover:scale-[1.015] transition-transform ${col.big ? "row-span-2" : ""}`}
            >
              <img
                src={`https://images.unsplash.com/${collectionPhotos[i]}?w=${col.big ? 600 : 400}&h=${col.big ? 500 : 240}&fit=crop&q=78`}
                alt={col.name}
                loading="lazy"
                className="w-full h-full object-cover block"
              />
              <div className="absolute inset-0 p-5 flex flex-col justify-end" style={{ background: "var(--gradient-overlay-light)" }}>
                <div className="text-primary-foreground font-semibold text-base">{col.name}</div>
                <div className="text-primary-foreground/55 text-[0.74rem] mt-[3px]">{col.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
