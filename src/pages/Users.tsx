import { useState, useEffect, useCallback } from "react";
import { useRole } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  UserPlus, Trash2, X, Loader2,
  ShieldCheck, BarChart2, Eye, Users, Search,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
// Exactly matches UserSerializer fields:
// ['id', 'username', 'email', 'role', 'is_active', 'created_at']

type Role = "viewer" | "analyst" | "admin";

interface ManagedUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

// RegisterSerializer fields: id, username, email, password, password2, role
interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  role: Role;
}

// ─── API ───────────────────────────────────────────────────────────────────

function authHeader(): Record<string, string> {
  // Change "access_token" to whatever key your LoginView stores it under
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://zorvyn.duckdns.org${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    // DRF error shapes: { detail: "..." } or { field: ["msg"] }
    const err = await res.json().catch(() => ({}));
    const message =
      (err as Record<string, unknown>).detail as string
      ?? (err as Record<string, unknown>).error as string
      ?? Object.values(err).flat().join(" ")
      ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// DRF list returns EITHER a plain array OR { count, next, previous, results }
// depending on whether DEFAULT_PAGINATION_CLASS is set. Handle both.
async function fetchUserList(): Promise<ManagedUser[]> {
  const raw = await apiFetch<ManagedUser[] | { results: ManagedUser[] }>("/");
  return Array.isArray(raw) ? raw : raw.results;
}

const api = {
  list: fetchUserList,

  // POST /api/users/ — uses RegisterSerializer (needs password + password2)
  create: (payload: CreateUserPayload) =>
    apiFetch<ManagedUser>("/", { method: "POST", body: JSON.stringify(payload) }),

  // PATCH /api/users/:id/toggle-status/
  toggleStatus: (id: number) =>
    apiFetch<{ message: string; is_active: boolean }>(`/${id}/toggle-status/`, {
      method: "PATCH",
    }),

  // PATCH /api/users/:id/change-role/
  changeRole: (id: number, role: Role) =>
    apiFetch<{ message: string; user: ManagedUser }>(`/${id}/change-role/`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  // DELETE /api/users/:id/
  remove: (id: number) =>
    apiFetch<void>(`/${id}/`, { method: "DELETE" }),
};

// ─── Helpers ───────────────────────────────────────────────────────────────

// UserSerializer has no first_name/last_name — use username only
function displayName(u: ManagedUser) {
  return u.username;
}

function initials(u: ManagedUser) {
  return u.username.slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const ROLE_META: Record<Role, { label: string; icon: React.ReactNode; color: string }> = {
  admin:   { label: "Admin",   icon: <ShieldCheck size={11} />, color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  analyst: { label: "Analyst", icon: <BarChart2   size={11} />, color: "bg-sky-500/15 text-sky-400 border-sky-500/20"         },
  viewer:  { label: "Viewer",  icon: <Eye          size={11} />, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
};

// ─── Create User Modal ──────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateUserPayload) => Promise<void>;
}

function CreateUserModal({ open, onClose, onCreate }: CreateModalProps) {
  const [username,  setUsername]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");
  const [role,      setRole]      = useState<Role>("viewer");
  const [loading,   setLoading]   = useState(false);

  const reset = () => {
    setUsername(""); setEmail(""); setPassword(""); setPassword2(""); setRole("viewer");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!username.trim() || !email.trim() || !password || !password2) {
      toast.error("All fields are required");
      return;
    }
    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await onCreate({ username: username.trim(), email: email.trim(), password, password2, role });
      reset();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const fields: { label: string; value: string; set: (v: string) => void; placeholder: string; type?: string }[] = [
    { label: "Username",         value: username,  set: setUsername,  placeholder: "janesmith"          },
    { label: "Email address",    value: email,     set: setEmail,     placeholder: "jane@company.com", type: "email"    },
    { label: "Password",         value: password,  set: setPassword,  placeholder: "Password",         type: "password" },
    { label: "Confirm password", value: password2, set: setPassword2, placeholder: "Repeat password",  type: "password" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Add team member</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Account is created immediately.</p>
          </div>
          <button onClick={handleClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {fields.map(({ label, value, set, placeholder, type = "text" }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full h-9 px-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(["viewer", "analyst", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-medium transition-all
                    ${role === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  {ROLE_META[r].icon}
                  {ROLE_META[r].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={handleClose} className="flex-1 h-9 rounded-xl border border-border bg-secondary text-sm text-foreground hover:bg-muted/60 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-9 rounded-xl gradient-primary text-sm font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Create user
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ───────────────────────────────────────────────────

function ConfirmDeleteModal({
  user, onConfirm, onCancel,
}: {
  user: ManagedUser | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  if (!user) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/15 flex items-center justify-center text-destructive shrink-0">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-foreground">Remove user</h2>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{user.username}</span> will lose all access. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-9 rounded-xl border border-border bg-secondary text-sm text-foreground hover:bg-muted/60 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-9 rounded-xl bg-destructive text-sm font-medium text-destructive-foreground flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { isAdmin } = useRole();

  const [users,        setUsers]        = useState<ManagedUser[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [showCreate,   setShowCreate]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [updating,     setUpdating]     = useState<Record<number, boolean>>({});

  if (!isAdmin) return <Navigate to="/" replace />;

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list();
      setUsers(data);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Spinner helper ───────────────────────────────────────────────────────

  const withSpinner = (id: number, fn: () => Promise<void>) => {
    setUpdating((p) => ({ ...p, [id]: true }));
    return fn().finally(() => setUpdating((p) => ({ ...p, [id]: false })));
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = async (payload: CreateUserPayload) => {
    const created = await api.create(payload);
    setUsers((prev) => [created, ...prev]);
    toast.success(`${created.username} created`);
  };

  const handleToggleStatus = (user: ManagedUser) =>
    withSpinner(user.id, async () => {
      try {
        const { is_active } = await api.toggleStatus(user.id);
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active } : u));
        toast.success(is_active ? "User activated" : "User deactivated");
      } catch (err) {
        toast.error((err as Error).message ?? "Failed to update status");
      }
    });

  const handleRoleChange = (user: ManagedUser, newRole: Role) => {
    if (newRole === user.role) return;
    withSpinner(user.id, async () => {
      try {
        const { user: updated } = await api.changeRole(user.id, newRole);
        setUsers((prev) => prev.map((u) => u.id === user.id ? updated : u));
        toast.success(`Role updated to ${newRole}`);
      } catch (err) {
        toast.error((err as Error).message ?? "Failed to update role");
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.remove(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`${deleteTarget.username} removed`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to remove user");
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const activeCount = users.filter((u) => u.is_active).length;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Loading…" : `${activeCount} active · ${users.length} total`}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl gradient-primary text-sm font-medium text-white hover:opacity-90 transition self-start sm:self-auto"
          >
            <UserPlus size={15} />
            Add user
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or email…"
            className="w-full h-9 pl-8 pr-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Fetching users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Users size={32} className="opacity-40" />
              <p className="text-sm">{search ? "No users match your search." : "No users yet."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    {["User", "Role", "Status", "Joined", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => {
                    const meta = ROLE_META[user.role];
                    const busy = !!updating[user.id];

                    return (
                      <tr
                        key={user.id}
                        className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors
                          ${i % 2 === 1 ? "bg-muted/10" : ""}
                          ${busy ? "opacity-60 pointer-events-none" : ""}`}
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {initials(user)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{displayName(user)}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role — badge with invisible <select> overlay */}
                        <td className="px-6 py-4">
                          <div className="relative inline-flex items-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${meta.color}`}>
                              {meta.icon}
                              {meta.label}
                            </span>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full"
                              title="Change role"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="analyst">Analyst</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </td>

                        {/* Status toggle */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="flex items-center gap-2"
                            aria-label={`Toggle status for ${user.username}`}
                          >
                            {busy ? (
                              <Loader2 size={14} className="animate-spin text-muted-foreground" />
                            ) : (
                              <div className={`relative h-5 w-9 rounded-full transition-colors ${user.is_active ? "bg-success" : "bg-muted"}`}>
                                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${user.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                              </div>
                            )}
                            <span className={`text-xs font-medium ${user.is_active ? "text-success" : "text-muted-foreground"}`}>
                              {user.is_active ? "active" : "inactive"}
                            </span>
                          </button>
                        </td>

                        {/* Joined — from created_at */}
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </td>

                        {/* Delete */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            aria-label={`Remove ${user.username}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
      <ConfirmDeleteModal
        user={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}