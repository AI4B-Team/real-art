import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const MinimalHeader = () => (
  <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-end px-3 md:px-5 bg-background/80 backdrop-blur-md border-b border-foreground/[0.06] overflow-visible">
    <div className="absolute items-start flex" style={{ left: "24px", top: "4px" }}>
      <Logo to="/landing" />
    </div>
    <div className="flex items-center gap-3">
      <Link to="/login" className="px-4 py-2 rounded-lg text-[0.84rem] font-semibold text-foreground hover:bg-foreground/[0.04] transition-colors">
        Login
      </Link>
      <Link to="/signup" className="px-5 py-2 rounded-lg text-[0.84rem] font-semibold bg-accent text-primary-foreground hover:opacity-90 transition-opacity">
        Start Free
      </Link>
    </div>
  </header>
);

export default MinimalHeader;
