import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Home, Upload, Compass } from "lucide-react";
import PageShell from "@/components/PageShell";

const suggestions = [
  { icon: Home, label: "Homepage", to: "/" },
  { icon: Compass, label: "Explore", to: "/explore" },
  { icon: Upload, label: "Upload Art", to: "/upload" },
  { icon: Search, label: "Collections", to: "/collections" },
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="font-display text-[8rem] md:text-[12rem] font-black leading-none text-foreground/[0.06] select-none mb-[-2rem]">
          404
        </div>
        <h1 className="font-display text-[2rem] md:text-[2.5rem] font-black tracking-[-0.03em] leading-tight mb-3">
          This page doesn't exist
        </h1>
        <p className="text-[0.88rem] text-muted mb-2 max-w-md">
          The URL <code className="text-[0.82rem] bg-foreground/[0.06] px-2 py-0.5 rounded-md font-mono">{location.pathname}</code> couldn't be found. It may have moved or never existed.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 mb-8 w-full max-w-lg">
          {suggestions.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-foreground/[0.08] bg-card hover:border-foreground/[0.2] transition-colors no-underline group"
            >
              <Icon className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
              <span className="text-[0.82rem] font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[0.84rem] font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    </PageShell>
  );
};

export default NotFound;
