import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Bell, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search transactions, users..."
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary/50 border-0 text-sm text-foreground
            placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-foreground/70" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full gradient-primary" />
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-premium p-1 animate-scale-in z-50">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
