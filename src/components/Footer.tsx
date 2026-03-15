import { Link } from "react-router-dom";

const footerCols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Creators",
    links: [
      { label: "Upload", to: "/upload" },
      { label: "Start Gallery", to: "/create-gallery" },
      { label: "Boards", to: "/boards" },
      { label: "Affiliates", to: "/affiliates" },
      { label: "Private Vaults", to: "/create-gallery" },
      { label: "Prompt Packs", to: "/prompts" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "License", to: "/license" },
      { label: "Blog", to: "/blog" },
      { label: "REAL CREATOR", to: "/real-creator" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-foreground px-6 md:px-12 pt-14 pb-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-[2.2fr_1fr_1fr] gap-12 mb-[52px]">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="no-underline">
              <div className="font-display text-2xl font-black text-primary-foreground tracking-[0.06em] uppercase mb-3.5">
                Real<span className="text-accent">.</span>Art
              </div>
            </Link>
            <p className="text-[0.8rem] text-primary-foreground/30 leading-[1.7] max-w-[240px]">
              The world's largest free visual library. Download, share, and create — no strings attached.
            </p>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <h5 className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-primary-foreground/[0.22] mb-4">{col.title}</h5>
              {col.links.map((link) => (
                <Link key={link.label} to={link.to} className="block text-[0.82rem] text-primary-foreground/[0.48] no-underline mb-[9px] hover:text-primary-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-primary-foreground/[0.07] pt-5 flex justify-between items-center flex-wrap gap-4">
          <div className="text-[0.75rem] text-primary-foreground/20">© 2026 REAL ART — Part of the REAL CREATOR ecosystem</div>
          <div className="flex gap-5">
            {[
              { label: "Privacy", to: "/privacy" },
              { label: "Terms", to: "/terms" },
              { label: "License", to: "/license" },
            ].map((l) => (
              <Link key={l.label} to={l.to} className="text-[0.75rem] text-primary-foreground/20 no-underline hover:text-primary-foreground/50 transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;