import { useRole, type UserRole } from "@/contexts/AuthContext";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { role } = useRole();
  if (!allowedRoles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
