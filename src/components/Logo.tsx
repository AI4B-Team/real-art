import { Link } from "react-router-dom";

interface LogoProps {
  collapsed?: boolean;
  onClick?: () => void;
  as?: "link" | "button";
}

const Logo = ({ collapsed = false, onClick, as = "link" }: LogoProps) => {
  const fullLogo = (
    <div className="bg-accent p-[4px] shrink-0">
      <div className="border-2 border-primary-foreground py-0.5 px-2 flex flex-col items-center">
        <span className="font-body text-[1.25rem] font-black text-primary-foreground tracking-[0.05em] leading-none text-center block">REAL</span>
        <span className="font-body text-[0.32rem] font-bold tracking-[0.28em] text-primary-foreground uppercase text-center block mt-0.5">ART</span>
      </div>
    </div>
  );

  const miniLogo = (
    <div className="bg-accent p-[3px] shrink-0">
      <div className="border-2 border-primary-foreground py-0.5 px-1 flex flex-col items-center">
        <span className="font-body text-[1rem] font-black text-primary-foreground tracking-[0.05em] leading-none text-center block">R</span>
        <span className="font-body text-[0.22rem] font-bold tracking-[0.28em] text-primary-foreground uppercase text-center block mt-px">ART</span>
      </div>
    </div>
  );

  const content = collapsed ? miniLogo : fullLogo;

  if (as === "button" && onClick) {
    return (
      <button onClick={onClick} className="cursor-pointer hover:opacity-90 transition-opacity" title={collapsed ? "Expand sidebar" : "REAL ART"}>
        {content}
      </button>
    );
  }

  return (
    <Link to="/" className="no-underline hover:opacity-90 transition-opacity shrink-0">
      {content}
    </Link>
  );
};

export default Logo;
