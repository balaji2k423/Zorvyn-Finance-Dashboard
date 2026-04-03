import { useState } from "react";
import { transactions, type Transaction } from "@/data/mockData";
import { useRole } from "@/contexts/AuthContext";
import { Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = ["All", "Salary", "Freelance", "Investment", "Rent", "Software", "Food", "Utilities", "Marketing"];
const TYPES = ["All", "income", "expense"];
const PAGE_SIZE = 6;

export default function TransactionsPage() {
  const { isAdmin } = useRole();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = transactions.filter((tx) => {
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "All" && tx.category !== categoryFilter) return false;
    if (typeFilter !== "All" && tx.type !== typeFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage financial records</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm
              outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            {TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Description</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Category</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Date</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Amount</th>
              {isAdmin && <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.map((tx, i) => (
              <tr key={tx.id} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold
                      ${tx.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {tx.type === "income" ? "+" : "-"}
                    </div>
                    <span className="text-sm font-medium text-foreground">{tx.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">{tx.category}</span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{tx.date}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                    ${tx.status === "completed" ? "bg-success/10 text-success" : tx.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                    {tx.status}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-semibold text-right ${tx.type === "income" ? "text-success" : "text-foreground"}`}>
                  {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground text-sm">No transactions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="h-8 w-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors
                  ${page === i + 1 ? "gradient-primary text-white" : "border border-border hover:bg-muted"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 rounded-lg flex items-center justify-center border border-border hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
