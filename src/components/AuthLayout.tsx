import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/AppSidebar";
import { LayoutContext } from "@/components/LayoutContext";
import { useQuickView } from "@/context/QuickViewContext";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const NO_SIDEBAR_ROUTES = ["/login", "/signup"];
const BARE_ROUTES = ["/landing"];
const COLLAPSED_SIDEBAR_PATTERNS = [/^\/image\//, /^\/explore$/, /^\/create$/, /^\/account/, /^\/ebook-creator/, /^\/transcribe/, /^\/editor/];

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userOverride, setUserOverride] = useState(false);
  const { isOpen: quickViewOpen } = useQuickView();
  const location = useLocation();

  useEffect(() => {
    const sync = () => {
      try { setIsLoggedIn(localStorage.getItem("ra_auth") === "1"); } catch {}
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ra_auth_changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ra_auth_changed", sync);
    };
  }, [location.pathname]);

  // Auto-collapse sidebar on certain routes
  const shouldAutoCollapse = COLLAPSED_SIDEBAR_PATTERNS.some(p => p.test(location.pathname)) || quickViewOpen;

  useEffect(() => {
    if (shouldAutoCollapse) {
      setSidebarCollapsed(true);
      setUserOverride(false);
    } else {
      if (!userOverride) {
        setSidebarCollapsed(false);
      }
    }
  }, [shouldAutoCollapse]);

  const handleSetCollapsed = (v: boolean) => {
    setSidebarCollapsed(v);
    setUserOverride(true);
  };

  const showSidebar = isLoggedIn && !NO_SIDEBAR_ROUTES.includes(location.pathname);
  const sidebarWidth = sidebarCollapsed ? 68 : 260;

  return (
    <LayoutContext.Provider value={{ hasGlobalNavbar: true, sidebarCollapsed, setSidebarCollapsed: handleSetCollapsed }}>
      <div className="min-h-screen bg-background">
        {showSidebar ? (
          <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex-1 min-w-0 flex flex-col">
              <Navbar hideLogo sidebarOffset={sidebarWidth} />
              <div className="pt-16 flex-1">
                <main>{children}</main>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Navbar />
            <div className="pt-16">
              {children}
            </div>
          </>
        )}
      </div>
    </LayoutContext.Provider>
  );
};

export default AuthLayout;
