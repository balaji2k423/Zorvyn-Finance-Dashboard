import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "viewer" | "analyst" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User & { password: string }> = {
  "admin@finova.com": {
    id: "1",
    name: "Alexandra Chen",
    email: "admin@finova.com",
    role: "admin",
    avatar: "",
    password: "admin123",
  },
  "analyst@finova.com": {
    id: "2",
    name: "Marcus Rivera",
    email: "analyst@finova.com",
    role: "analyst",
    avatar: "",
    password: "analyst123",
  },
  "viewer@finova.com": {
    id: "3",
    name: "Sarah Kim",
    email: "viewer@finova.com",
    role: "viewer",
    avatar: "",
    password: "viewer123",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("finance-user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1200));

    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userData } = mockUser;
      setUser(userData);
      localStorage.setItem("finance-user", JSON.stringify(userData));
      setIsLoading(false);
    } else {
      setError("Invalid email or password");
      setIsLoading(false);
      throw new Error("Invalid email or password");
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("finance-user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRole() {
  const { user } = useAuth();
  return {
    role: user?.role ?? "viewer",
    isAdmin: user?.role === "admin",
    isAnalyst: user?.role === "analyst" || user?.role === "admin",
    isViewer: true,
  };
}
