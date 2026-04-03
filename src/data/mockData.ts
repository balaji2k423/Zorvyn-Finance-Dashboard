// Mock data for the finance dashboard

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: "viewer" | "analyst" | "admin";
  status: "active" | "inactive";
  avatar: string;
  joinDate: string;
}

export const transactions: Transaction[] = [
  { id: "1", description: "Salary Deposit", amount: 8500, type: "income", category: "Salary", date: "2025-01-15", status: "completed" },
  { id: "2", description: "Office Rent", amount: 2200, type: "expense", category: "Rent", date: "2025-01-14", status: "completed" },
  { id: "3", description: "Client Payment — Acme Corp", amount: 4200, type: "income", category: "Freelance", date: "2025-01-13", status: "completed" },
  { id: "4", description: "Cloud Hosting (AWS)", amount: 340, type: "expense", category: "Software", date: "2025-01-12", status: "completed" },
  { id: "5", description: "Investment Returns", amount: 1250, type: "income", category: "Investment", date: "2025-01-11", status: "pending" },
  { id: "6", description: "Team Lunch", amount: 180, type: "expense", category: "Food", date: "2025-01-10", status: "completed" },
  { id: "7", description: "Design Tools Subscription", amount: 49, type: "expense", category: "Software", date: "2025-01-09", status: "completed" },
  { id: "8", description: "Consulting Fee", amount: 3000, type: "income", category: "Freelance", date: "2025-01-08", status: "completed" },
  { id: "9", description: "Electric Bill", amount: 120, type: "expense", category: "Utilities", date: "2025-01-07", status: "completed" },
  { id: "10", description: "Dividend Income", amount: 800, type: "income", category: "Investment", date: "2025-01-06", status: "completed" },
  { id: "11", description: "Marketing Campaign", amount: 950, type: "expense", category: "Marketing", date: "2025-01-05", status: "pending" },
  { id: "12", description: "Project Milestone — Beta", amount: 5500, type: "income", category: "Freelance", date: "2025-01-04", status: "completed" },
];

export const chartData = [
  { month: "Jul", income: 6200, expenses: 3100 },
  { month: "Aug", income: 7400, expenses: 3800 },
  { month: "Sep", income: 5800, expenses: 4200 },
  { month: "Oct", income: 8100, expenses: 3600 },
  { month: "Nov", income: 7900, expenses: 4100 },
  { month: "Dec", income: 9200, expenses: 3900 },
  { month: "Jan", income: 8500, expenses: 3800 },
];

export const categoryData = [
  { name: "Salary", value: 8500, fill: "hsl(234, 62%, 50%)" },
  { name: "Freelance", value: 12700, fill: "hsl(260, 50%, 55%)" },
  { name: "Investment", value: 2050, fill: "hsl(152, 55%, 42%)" },
  { name: "Rent", value: 2200, fill: "hsl(0, 65%, 55%)" },
  { name: "Software", value: 389, fill: "hsl(38, 92%, 50%)" },
];

export const managedUsers: ManagedUser[] = [
  { id: "1", name: "Alexandra Chen", email: "alex@finova.com", role: "admin", status: "active", avatar: "AC", joinDate: "2024-03-15" },
  { id: "2", name: "Marcus Rivera", email: "marcus@finova.com", role: "analyst", status: "active", avatar: "MR", joinDate: "2024-05-20" },
  { id: "3", name: "Sarah Kim", email: "sarah@finova.com", role: "viewer", status: "active", avatar: "SK", joinDate: "2024-07-10" },
  { id: "4", name: "David Thompson", email: "david@finova.com", role: "viewer", status: "inactive", avatar: "DT", joinDate: "2024-08-01" },
  { id: "5", name: "Priya Patel", email: "priya@finova.com", role: "analyst", status: "active", avatar: "PP", joinDate: "2024-09-22" },
];
