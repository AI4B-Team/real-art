import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/AppSidebar";
import { LayoutContext } from "@/components/LayoutContext";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const NO_SIDEBAR_ROUTES = ["/login", "/signup"];

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const showSidebar = isLoggedIn && !NO_SIDEBAR_ROUTES.includes(location.pathname);

  return (
    <LayoutContext.Provider value={{ hasGlobalNavbar: true, sidebarCollapsed, setSidebarCollapsed }}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16">
          {showSidebar ? (
            <div className="flex min-h-[calc(100vh-4rem)]">
              <AppSidebar />
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
          ) : (
            <>{children}</>
          )}
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default AuthLayout;
