import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { transactions, chartData, categoryData } from "@/data/mockData";
import { useState, useEffect } from "react";

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded mb-4" />
      <div className="h-8 w-32 bg-muted rounded mb-2" />
      <div className="h-3 w-24 bg-muted rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const summaryCards = [
    { title: "Total Income", value: totalIncome, trend: "+12.5%", up: true, icon: DollarSign, color: "text-success" },
    { title: "Total Expenses", value: totalExpenses, trend: "+3.2%", up: true, icon: CreditCard, color: "text-destructive" },
    { title: "Net Balance", value: netBalance, trend: "+18.7%", up: true, icon: Wallet, color: "text-primary" },
  ];

  const recentTx = transactions.slice(0, 5);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Financial overview for January 2025</p>
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
              ${card.value.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {card.up ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={`text-xs font-medium ${card.up ? "text-success" : "text-destructive"}`}>
                {card.trend}
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Area Chart */}
        <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 90%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="hsl(234, 62%, 50%)" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" stroke="hsl(260, 50%, 55%)" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Spending by Category</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                <span className="text-xs text-muted-foreground">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl bg-card border border-border">
        <div className="p-6 pb-4">
          <h3 className="text-sm font-medium text-foreground">Recent Transactions</h3>
        </div>
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {recentTx.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold
                      ${tx.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === "income" ? "text-success" : "text-foreground"}`}>
                  {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
