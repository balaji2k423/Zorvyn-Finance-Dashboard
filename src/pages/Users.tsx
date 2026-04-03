import { useState } from "react";
import { managedUsers, type ManagedUser } from "@/data/mockData";
import { useRole } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export default function UsersPage() {
  const { isAdmin } = useRole();
  const [users, setUsers] = useState<ManagedUser[]>(managedUsers);

  if (!isAdmin) return <Navigate to="/" replace />;

  const handleRoleChange = (userId: string, newRole: ManagedUser["role"]) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    toast.success("Role updated");
  };

  const handleStatusToggle = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
    toast.success("Status updated");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage team members and permissions</p>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">User</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Role</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as ManagedUser["role"])}
                    className="h-8 px-2 rounded-lg bg-secondary border-0 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleStatusToggle(user.id)}
                    className="flex items-center gap-2"
                  >
                    <div className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer
                      ${user.status === "active" ? "bg-success" : "bg-muted"}`}>
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform
                        ${user.status === "active" ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className={`text-xs font-medium ${user.status === "active" ? "text-success" : "text-muted-foreground"}`}>
                      {user.status}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.joinDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
