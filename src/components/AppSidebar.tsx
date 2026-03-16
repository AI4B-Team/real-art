import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Image, FolderOpen, DollarSign, Bell, Settings,
  Upload, Users, Award, Eye, Bookmark, Megaphone, ExternalLink
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  type: "route" | "dashboard-section" | "divider";
  href?: string;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, type: "route", href: "/dashboard" },
  { id: "explore", label: "Explore", icon: Eye, type: "route", href: "/explore" },
  { id: "collections-browse", label: "Collections", icon: FolderOpen, type: "route", href: "/collections" },
  { id: "communities-browse", label: "Communities", icon: Users, type: "route", href: "/communities" },
  { id: "challenges-browse", label: "Challenges", icon: Award, type: "route", href: "/challenges" },
  { id: "divider1", label: "", icon: LayoutDashboard, type: "divider" },
  { id: "media", label: "Media", icon: Image, type: "dashboard-section" },
  { id: "galleries", label: "My Collections", icon: FolderOpen, type: "dashboard-section" },
  { id: "boards", label: "Boards", icon: Bookmark, type: "dashboard-section" },
  { id: "earnings", label: "Earnings", icon: DollarSign, type: "dashboard-section" },
  { id: "ads", label: "Ads", icon: Megaphone, type: "dashboard-section" },
  { id: "notifications", label: "Notifications", icon: Bell, type: "dashboard-section" },
  { id: "settings", label: "Settings", icon: Settings, type: "dashboard-section" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [display, setDisplay] = useState("aiverse");
  const [handle, setHandle] = useState("aiverse");

  useEffect(() => {
    const sync = () => {
      try {
        setDisplay((localStorage.getItem("ra_display") || "AI.Verse").toLowerCase());
        setHandle((localStorage.getItem("ra_username") || "aiverse").toLowerCase());
      } catch {}
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ra_auth_changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ra_auth_changed", sync);
    };
  }, []);

  const initials = display.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  // Determine active state
  const isDashboard = location.pathname === "/dashboard";
  const currentSection = isDashboard
    ? new URLSearchParams(location.search).get("section") || "overview"
    : null;

  const isActive = (item: NavItem) => {
    if (item.type === "route") {
      if (item.href === "/dashboard") return isDashboard && (currentSection === "overview" || currentSection === null);
      return location.pathname.startsWith(item.href!);
    }
    if (item.type === "dashboard-section") {
      return isDashboard && currentSection === item.id;
    }
    return false;
  };

  const handleClick = (item: NavItem) => {
    if (item.type === "route") {
      navigate(item.href!);
    } else if (item.type === "dashboard-section") {
      navigate(`/dashboard?section=${item.id}`);
    }
  };

  return (
    <aside className="bg-card border-r border-foreground/[0.06] px-4 py-6 hidden lg:flex flex-col w-[260px] shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8 px-3">
        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-[0.8rem] font-bold text-accent">{initials}</div>
        <div>
          <div className="font-semibold text-[0.88rem] lowercase">{display}</div>
          <div className="text-[0.72rem] text-muted lowercase">@{handle}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => {
          if (item.type === "divider") {
            return <div key={item.id} className="h-px bg-foreground/[0.06] my-2 mx-3" />;
          }
          const active = isActive(item);
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.84rem] font-medium w-full text-left transition-colors ${active ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {item.id === "notifications" && (
                <span className="ml-auto text-[0.65rem] font-bold bg-accent text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center">3</span>
              )}
            </button>
          );
        })}
      </nav>

      <Link to="/upload" className="flex items-center justify-center gap-2 bg-foreground text-primary-foreground py-2.5 rounded-xl text-[0.84rem] font-semibold hover:bg-accent transition-colors mt-6 w-full no-underline">
        <Upload className="w-3.5 h-3.5" /> Upload Art
      </Link>
    </aside>
  );
};

export default AppSidebar;
