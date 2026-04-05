import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useState, useEffect } from "react";
import { useRole } from "@/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────

interface Summary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  total_records: number;
  income_count: number;
  expense_count: number;
  savings_rate: number;
}

interface CurrentMonth {
  month: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
}

interface RecentActivity {
  id: number;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes: string;
  created_by: string;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface CategoryBreakdown {
  category: string;
  type: string;
  total: number;
  count: number;
}

// ── API ────────────────────────────────────────────────────────────────────

function authHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...authHeader() },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded mb-4" />
      <div className="h-8 w-32 bg-muted rounded mb-2" />
      <div className="h-3 w-24 bg-muted rounded" />
    </div>
  );
}

// ── Chart colors ───────────────────────────────────────────────────────────

const PIE_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#818cf8", "#4f46e5", "#7c3aed", "#ddd6fe",
];

// ── Main ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAnalyst } = useRole();

  const [loading, setLoading]         = useState(true);
  const [summary, setSummary]         = useState<Summary | null>(null);
  const [currentMonth, setCurrentMonth] = useState<CurrentMonth | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [monthlyTrends, setMonthlyTrends]   = useState<MonthlyTrend[]>([]);
  const [categoryData, setCategoryData]     = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // All roles get dashboard summary
        const dashboard = await apiFetch<{
          summary: Summary;
          current_month: CurrentMonth;
          recent_activity: RecentActivity[];
        }>("/api/analytics/dashboard/");

        setSummary(dashboard.summary);
        setCurrentMonth(dashboard.current_month);
        setRecentActivity(dashboard.recent_activity);

        // Analyst + Admin get charts
        if (isAnalyst) {
          const [trends, categories] = await Promise.all([
            apiFetch<MonthlyTrend[]>("/api/analytics/trends/monthly/?months=6"),
            apiFetch<CategoryBreakdown[]>("/api/analytics/categories/?type=expense"),
          ]);
          setMonthlyTrends(trends);
          setCategoryData(categories);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAnalyst]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div><div className="h-8 w-48 bg-muted rounded animate-pulse" /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Income",
      value: summary?.total_income ?? 0,
      sub: `${summary?.income_count ?? 0} transactions`,
      up: true,
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Total Expenses",
      value: summary?.total_expenses ?? 0,
      sub: `${summary?.expense_count ?? 0} transactions`,
      up: false,
      icon: CreditCard,
      color: "text-destructive",
    },
    {
      title: "Net Balance",
      value: summary?.net_balance ?? 0,
      sub: `${summary?.savings_rate ?? 0}% savings rate`,
      up: (summary?.net_balance ?? 0) >= 0,
      icon: Wallet,
      color: "text-primary",
    },
  ];

  // Build pie data from expense categories
  const pieData = categoryData
    .filter((c) => c.type === "expense")
    .slice(0, 6)
    .map((c, i) => ({
      name: c.category,
      value: c.total,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }));

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentMonth?.month ?? "Financial overview"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="group rounded-2xl bg-card border border-border p-6 hover-lift cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">{card.title}</span>
              <div className={`p-2 rounded-xl bg-secondary/60 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              ${card.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {card.up
                ? <TrendingUp className="h-3 w-3 text-success" />
                : <TrendingDown className="h-3 w-3 text-destructive" />}
              <span className="text-xs text-muted-foreground ml-1">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts — Analyst + Admin only */}
      {isAnalyst && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Area Chart */}
          <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-6">
            <h3 className="text-sm font-medium text-foreground mb-4">Income vs Expenses</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(234, 62%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(234, 62%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(260, 50%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(260, 50%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,18%,90%)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(220,10%,46%)"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.slice(0, 7)}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(220,10%,46%)"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                  />
                  <Area
                    type="monotone" dataKey="income"
                    stroke="hsl(234,62%,50%)" fill="url(#incomeGrad)" strokeWidth={2}
                  />
                  <Area
                    type="monotone" dataKey="expenses"
                    stroke="hsl(260,50%,55%)" fill="url(#expenseGrad)" strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
            <h3 className="text-sm font-medium text-foreground mb-4">Spending by Category</h3>
            {pieData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                No expense data
              </div>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={4} dataKey="value" strokeWidth={0}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {pieData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                      <span className="text-xs text-muted-foreground">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Viewer-only note */}
      {!isAnalyst && (
        <div className="rounded-2xl bg-card border border-border p-6 text-center text-sm text-muted-foreground">
          Upgrade to Analyst or Admin to view charts and trend analytics.
        </div>
      )}

      {/* Recent Transactions — all roles */}
      <div className="rounded-2xl bg-card border border-border">
        <div className="p-6 pb-4">
          <h3 className="text-sm font-medium text-foreground">Recent Transactions</h3>
        </div>
        <div className="px-6 pb-6">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No recent transactions.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold
                      ${tx.type === "income"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"}`}>
                      {tx.type === "income" ? "+" : "−"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.notes || "No notes"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category} · {tx.date}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold
                    ${tx.type === "income" ? "text-success" : "text-foreground"}`}>
                    {tx.type === "income" ? "+" : "−"}
                    ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}