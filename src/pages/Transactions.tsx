import { useState, useEffect, useCallback } from "react";
import { useRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search, Filter, Trash2, ChevronLeft, ChevronRight,
  Loader2, RefreshCw, Plus, X, Pencil,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type RecordType = "income" | "expense";

interface FinancialRecord {
  id: number;
  amount: string;
  type: RecordType;
  category: number | null;
  category_name: string | null;
  date: string;
  notes: string | null;
  created_by: number | null;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface RecordPayload {
  amount: string;
  type: RecordType;
  category: number | null;
  date: string;
  notes: string;
}

// ── API ────────────────────────────────────────────────────────────────────

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      (err as Record<string, unknown>).detail as string ??
      (err as Record<string, unknown>).error as string ??
      Object.values(err).flat().join(" ") ??
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function buildUrl(params: Record<string, string>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
  const qs = q.toString();
  return `/api/records/${qs ? `?${qs}` : ""}`;
}

const api = {
  list: (params: Record<string, string>) =>
    apiFetch<PaginatedResponse<FinancialRecord>>(buildUrl(params)),

  create: (payload: RecordPayload) =>
    apiFetch<FinancialRecord>("/api/records/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: RecordPayload) =>
    apiFetch<FinancialRecord>(`/api/records/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: number) =>
    apiFetch<{ message: string }>(`/api/records/${id}/`, { method: "DELETE" }),

  categories: () =>
    apiFetch<{ results: Category[] } | Category[]>("/api/categories/"),
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatAmount(amount: string) {
  return parseFloat(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const PAGE_SIZE = 6;

// ── Transaction Modal (Create + Edit) ──────────────────────────────────────

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (record: FinancialRecord, isEdit: boolean) => void;
  editRecord?: FinancialRecord | null;
}

function TransactionModal({
  open, onClose, onSaved, editRecord,
}: TransactionModalProps) {
  const isEdit = !!editRecord;

  const [amount,     setAmount]     = useState("");
  const [type,       setType]       = useState<RecordType>("expense");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date,       setDate]       = useState(todayISO());
  const [notes,      setNotes]      = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    api.categories().then((res) => {
      const list = Array.isArray(res) ? res : res.results;
      setCategories(list);
    }).catch(() => toast.error("Failed to load categories"));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editRecord) {
      setAmount(editRecord.amount);
      setType(editRecord.type);
      setCategoryId(editRecord.category);
      setDate(editRecord.date);
      setNotes(editRecord.notes ?? "");
    } else {
      setAmount("");
      setType("expense");
      setDate(todayISO());
      setNotes("");
      setErrors({});
    }
  }, [open, editRecord]);

  useEffect(() => {
    if (categories.length > 0 && !isEdit && categoryId === null) {
      setCategoryId(categories[0].id);
    }
  }, [categories, isEdit, categoryId]);

  const reset = () => {
    setAmount(""); setType("expense");
    setDate(todayISO()); setNotes("");
    setCategoryId(null); setErrors({});
  };

  const handleClose = () => { reset(); onClose(); };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)))
      errs.amount = "Enter a valid amount";
    else if (Number(amount) <= 0)
      errs.amount = "Amount must be greater than 0";
    if (!date)
      errs.date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: RecordPayload = { amount, type, category: categoryId, date, notes };
      const saved = isEdit
        ? await api.update(editRecord!.id, payload)
        : await api.create(payload);
      toast.success(isEdit ? "Transaction updated" : "Transaction created");
      onSaved(saved, isEdit);
      reset();
      onClose();
    } catch (err) {
      toast.error((err as Error).message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border
        border-border shadow-2xl p-6 space-y-5 animate-fade-in">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">
              {isEdit ? "Edit Transaction" : "New Transaction"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit
                ? "Update the transaction details below."
                : "Record a new income or expense entry."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center
              text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-secondary">
          {(["income", "expense"] as RecordType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`h-9 rounded-lg text-sm font-medium capitalize transition-all
                ${type === t
                  ? t === "income"
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-destructive/20 text-destructive border border-destructive/30"
                  : "text-muted-foreground hover:text-foreground"}`}
            >
              {t === "income" ? "+ Income" : "− Expense"}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: "" })); }}
              placeholder="0.00"
              className={`w-full h-10 pl-7 pr-3 rounded-xl bg-secondary border text-sm
                text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition
                ${errors.amount ? "border-destructive" : "border-border"}`}
            />
          </div>
          {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-xl bg-secondary border border-border
              text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: "" })); }}
            className={`w-full h-10 px-3 rounded-xl bg-secondary border text-sm
              text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition
              ${errors.date ? "border-destructive" : "border-border"}`}
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Notes <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a description…"
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border
              text-sm text-foreground placeholder:text-muted-foreground/50
              outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleClose}
            className="flex-1 h-10 rounded-xl border border-border bg-secondary
              text-sm text-foreground hover:bg-muted/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 h-10 rounded-xl text-sm font-medium text-white
              flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60
              ${isEdit ? "bg-primary" : type === "income" ? "bg-success" : "gradient-primary"}`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : isEdit ? <Pencil size={14} /> : <Plus size={14} />}
            {isEdit ? "Save changes" : `Add ${type}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────

function ConfirmDeleteModal({
  record, onConfirm, onCancel,
}: {
  record: FinancialRecord | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  if (!record) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card border
        border-border shadow-2xl p-6 space-y-4 animate-fade-in">

        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/15 flex items-center
            justify-center text-destructive shrink-0">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-foreground">
              Delete transaction
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              This <span className="font-medium text-foreground">{record.type}</span> of{" "}
              <span className="font-medium text-foreground">${formatAmount(record.amount)}</span>
              {" "}will be soft deleted. Admin can restore it later.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-xl border border-border bg-secondary
              text-sm text-foreground hover:bg-muted/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-9 rounded-xl bg-destructive text-sm font-medium
              text-destructive-foreground flex items-center justify-center gap-2
              hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { isAdmin } = useRole();

  const [records,      setRecords]      = useState<FinancialRecord[]>([]);
  const [count,        setCount]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editRecord,   setEditRecord]   = useState<FinancialRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinancialRecord | null>(null);

  const [search,   setSearch]   = useState("");
  const [type,     setType]     = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [page,     setPage]     = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        page_size: String(PAGE_SIZE),
        ordering: "-date",
      };
      if (type)     params.type      = type;
      if (search)   params.search    = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo)   params.date_to   = dateTo;

      const data = await api.list(params);

      if (Array.isArray(data)) {
        setRecords(data as unknown as FinancialRecord[]);
        setCount((data as unknown as FinancialRecord[]).length);
      } else {
        setRecords(data.results);
        setCount(data.count);
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, [page, type, search, dateFrom, dateTo]);

  useEffect(() => {
    const t = setTimeout(fetchRecords, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchRecords, search]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [type, search, dateFrom, dateTo]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSaved = (record: FinancialRecord, isEdit: boolean) => {
    if (isEdit) {
      setRecords((prev) => prev.map((r) => r.id === record.id ? record : r));
    } else {
      setRecords((prev) => [record, ...prev]);
      setCount((c) => c + 1);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.remove(deleteTarget.id);
    toast.success("Transaction deleted");
    setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setCount((c) => c - 1);
    setDeleteTarget(null);
  };

  const openCreate = () => { setEditRecord(null); setShowModal(true); };
  const openEdit   = (r: FinancialRecord) => { setEditRecord(r); setShowModal(true); };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Transactions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Loading…" : `${count} record${count !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchRecords}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl
                border border-border bg-secondary text-sm text-foreground
                hover:bg-muted/60 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            {isAdmin && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl
                  gradient-primary text-sm font-medium text-white hover:opacity-90 transition"
              >
                <Plus size={15} />
                New transaction
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-card border border-border
                text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Type */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 px-3 rounded-lg bg-card border border-border text-sm
                outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">From</span>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || todayISO()}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 px-3 rounded-lg bg-card border border-border text-sm
                outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">To</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={todayISO()}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 px-3 rounded-lg bg-card border border-border text-sm
                outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Clear dates */}
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="h-9 px-3 rounded-lg border border-border bg-secondary
                text-sm text-muted-foreground hover:text-foreground
                flex items-center gap-1.5 transition-colors"
            >
              <X size={13} /> Clear dates
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Fetching records…</p>
            </div>
          ) : records.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-3">
              <p className="text-muted-foreground text-sm">No transactions found.</p>
              {isAdmin && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-xl
                    gradient-primary text-sm font-medium text-white hover:opacity-90 transition"
                >
                  <Plus size={14} />
                  Add your first transaction
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Notes", "Category", "Date", "By", "Amount",
                      ...(isAdmin ? ["Actions"] : [])].map((h) => (
                      <th
                        key={h}
                        className={`text-xs font-medium text-muted-foreground uppercase
                          tracking-wider px-6 py-3
                          ${h === "Amount" || h === "Actions" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((tx, i) => (
                    <tr
                      key={tx.id}
                      className={`border-b border-border/50 last:border-0
                        hover:bg-muted/30 transition-colors
                        ${i % 2 === 1 ? "bg-muted/10" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center
                            text-xs font-bold shrink-0
                            ${tx.type === "income"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"}`}>
                            {tx.type === "income" ? "+" : "−"}
                          </div>
                          <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                            {tx.notes || (
                              <span className="text-muted-foreground italic">No notes</span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full
                          bg-secondary text-secondary-foreground font-medium">
                          {tx.category_name ?? "Uncategorised"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground truncate max-w-[140px]">
                        {tx.created_by_email ?? "—"}
                      </td>

                      <td className={`px-6 py-4 text-sm font-semibold text-right whitespace-nowrap
                        ${tx.type === "income" ? "text-success" : "text-foreground"}`}>
                        {tx.type === "income" ? "+" : "−"}${formatAmount(tx.amount)}
                      </td>

                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(tx)}
                              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors
                                text-muted-foreground hover:text-primary"
                              aria-label="Edit record"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(tx)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors
                                text-muted-foreground hover:text-destructive"
                              aria-label="Delete record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, count)} of {count}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg flex items-center justify-center
                  border border-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors
                    ${page === i + 1
                      ? "gradient-primary text-white"
                      : "border border-border hover:bg-muted"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 rounded-lg flex items-center justify-center
                  border border-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleSaved}
        editRecord={editRecord}
      />

      <ConfirmDeleteModal
        record={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}