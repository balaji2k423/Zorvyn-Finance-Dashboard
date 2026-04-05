import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, useRole } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import TransactionsPage from "@/pages/Transactions";
import UsersPage from "@/pages/Users";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Blocks unauthenticated users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Redirects already logged in users away from /login
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Blocks by role — redirects to / if not allowed
function RoleRoute({
  children,
  allowed,
}: {
  children: React.ReactNode;
  allowed: Array<"viewer" | "analyst" | "admin">;
}) {
  const { user } = useAuth();
  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* All roles */}
              <Route path="/" element={<DashboardPage />} />

              {/* Analyst + Admin only */}
              <Route
                path="/transactions"
                element={
                  <RoleRoute allowed={["analyst", "admin"]}>
                    <TransactionsPage />
                  </RoleRoute>
                }
              />

              {/* Admin only */}
              <Route
                path="/users"
                element={
                  <RoleRoute allowed={["admin"]}>
                    <UsersPage />
                  </RoleRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;