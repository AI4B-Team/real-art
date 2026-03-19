import { Link } from "react-router-dom";

interface LogoProps {
  to?: string;
  className?: string;
}

export const Logo = ({ to = "/", className = "" }: LogoProps) => {
  const content = (
    <div className={`bg-primary w-[140px] p-[7px] ${className}`}>
      <div className="border-[2.5px] border-primary-foreground py-1.5 px-[18px] flex flex-col items-center">
        <span className="font-body text-[2.1rem] font-black text-primary-foreground tracking-[0.05em] leading-none text-center block">
          REAL
        </span>
        <span className="font-body text-[0.52rem] font-bold tracking-[0.3em] text-primary-foreground uppercase text-center block mt-[3px]">
          CREATOR
        </span>
      </div>
    </div>
  );

  return (
    <Link to={to} className="no-underline block relative top-[10px] flex-shrink-0">
      {content}
    </Link>
  );
};

export default Logo;
