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
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["viewer", "analyst", "admin"] as UserRole[] },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight, roles: ["viewer", "analyst", "admin"] as UserRole[] },
  { title: "Users", url: "/users", icon: Users, roles: ["admin"] as UserRole[] },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { role } = useRole();

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`relative h-screen flex flex-col border-r border-sidebar-border bg-sidebar
        transition-all duration-300 ease-in-out ${collapsed ? "w-[68px]" : "w-[240px]"}`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-display font-bold gradient-text">Finova</span>
        )}
        {collapsed && (
          <span className="text-lg font-display font-bold gradient-text mx-auto">F</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {filtered.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              activeClassName=""
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border border-border
          flex items-center justify-center shadow-sm hover:shadow-md transition-all
          text-muted-foreground hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Finova v1.0</p>
          </div>
        )}
      </div>
    </aside>
  );
}
