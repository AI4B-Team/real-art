const footerCols = [
  { title: "Explore", links: ["Photos", "Videos", "Music", "3D Art", "Trending", "Prompt Library"] },
  { title: "Community", links: ["Galleries", "Challenges", "Leaderboard", "Creators", "Recreations"] },
  { title: "Creators", links: ["Upload", "Start Gallery", "Affiliates", "Private Vaults", "Prompt Packs", "Style Transfer"] },
  { title: "Company", links: ["About", "License", "Blog", "REAL CREATOR"] },
];

const Footer = () => {
  return (
    <footer className="bg-foreground px-6 md:px-12 pt-14 pb-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-[2.2fr_1fr_1fr_1fr_1fr] gap-12 mb-[52px]">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-2xl font-black text-primary-foreground tracking-[0.06em] uppercase mb-3.5">
              Real<span className="text-accent">.</span>Art
            </div>
            <p className="text-[0.8rem] text-primary-foreground/30 leading-[1.7] max-w-[240px]">
              The world's largest free AI-generated digital art library. Download, share, and create — no strings attached.
            </p>
            <div className="mt-3 text-[0.65rem] text-primary-foreground/20 uppercase tracking-[0.1em]">
              AI-Generated Digital Art
            </div>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <h5 className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/[0.22] mb-4">{col.title}</h5>
              {col.links.map((link) => (
                <a key={link} href="#" className="block text-[0.82rem] text-primary-foreground/[0.48] no-underline mb-[9px] hover:text-primary-foreground transition-colors">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-primary-foreground/[0.07] pt-5 flex justify-between items-center flex-wrap gap-4">
          <div className="text-[0.75rem] text-primary-foreground/20">© 2026 REAL ART — AI-Generated Digital Art — Part of the REAL CREATOR ecosystem</div>
          <div className="flex gap-5">
            {["Privacy", "Terms", "License"].map((l) => (
              <a key={l} href="#" className="text-[0.75rem] text-primary-foreground/20 no-underline hover:text-primary-foreground/50 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
