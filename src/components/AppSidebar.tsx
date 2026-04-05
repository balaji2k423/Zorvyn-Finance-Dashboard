import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useRole, type UserRole } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["viewer", "analyst", "admin"] as UserRole[] },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight, roles: ["viewer", "analyst", "admin"] as UserRole[] },
  { title: "Users", url: "/users", icon: Users, roles: ["admin"] as UserRole[] },
];

export function AppSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
  const location = useLocation();
  const { role } = useRole();

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col border-r border-sidebar-border bg-sidebar 
        transition-all duration-300 ease-in-out z-50 shadow-sm
        ${collapsed ? "w-[72px]" : "w-[260px]"}`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        {!collapsed ? (
          <span className="text-2xl font-display font-bold tracking-tight gradient-text">
            Zorvyn
          </span>
        ) : (
          <span className="text-2xl font-display font-bold tracking-tight gradient-text mx-auto">
            Z
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {filtered.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-7 w-7 rounded-full bg-card border border-border 
          flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        {!collapsed && (
          <p className="text-xs text-muted-foreground font-mono tracking-widest">
            Zorvyn v1.0
          </p>
        )}
      </div>
    </aside>
  );
}