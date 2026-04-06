import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Bell, LogOut, ChevronDown, User, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery.trim());
      // TODO: Add your search logic here
      // Example: navigate to search results page
      // router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  // Dynamic Profile Icon with Role-based Initial
  const renderProfileIcon = () => {
    if (!user) {
      return (
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    }

    const avatarUrl = user.avatar || user.profileImage || user.image;
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={user.name || "User"}
          className="h-8 w-8 rounded-lg object-cover border border-border"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }

    // Role-based Initial
    let initial = "U";
    let gradientClass = "from-blue-500 to-indigo-600";

    const role = user.role?.toLowerCase().trim();
    if (role === "admin") {
      initial = "A";
      gradientClass = "from-red-500 to-rose-600";
    } else if (role === "analyst") {
      initial = "A";
      gradientClass = "from-amber-500 to-orange-600";
    } else if (role === "viewer") {
      initial = "V";
      gradientClass = "from-emerald-500 to-teal-600";
    } else if (user.name) {
      initial = user.name.charAt(0).toUpperCase();
    }

    return (
      <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradientClass} 
                       flex items-center justify-center text-white text-sm font-bold shadow-sm ring-1 ring-white/20`}>
        {initial}
      </div>
    );
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      
      {/* Active Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-md w-full group">
        <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search transactions, users, reports..."
            className="w-full h-10 pl-11 pr-10 rounded-2xl bg-secondary/70 border border-border/50 
                       text-sm text-foreground placeholder:text-muted-foreground 
                       focus:outline-none focus:border-primary/50 focus:bg-card focus:ring-2 focus:ring-primary/20 
                       transition-all duration-200"
          />

          {/* Clear button - appears when there's text */}
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2.5 rounded-2xl bg-secondary/60 hover:bg-secondary transition-all active:scale-95">
          <Bell className="h-5 w-5 text-foreground/70" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 ring-2 ring-background" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-secondary/60 transition-all active:scale-95"
          >
            {renderProfileIcon()}

            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role || "User"}
              </p>
            </div>

            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {showProfile && user && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-premium p-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  {renderProfileIcon()}
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors mt-1"
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