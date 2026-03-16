import { useLayoutContext } from "@/components/LayoutContext";
import Navbar from "@/components/Navbar";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content. When inside AuthLayout (global navbar + sidebar),
 * it renders children directly. Otherwise, renders the full shell with
 * Navbar and padding.
 */
const PageShell = ({ children, className }: PageShellProps) => {
  const { hasGlobalNavbar } = useLayoutContext();

  if (hasGlobalNavbar) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen bg-background ${className || ""}`}>
      <Navbar />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
};

export default PageShell;
