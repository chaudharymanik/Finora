/**
 * Mock Data Generators
 * Personal Finance Dashboard — Finora
 * All amounts in INR (₹)
 */

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category:
    // ── Expense categories ──
    | "Food & Dining"
    | "Transport"
    | "Shopping"
    | "Utilities"
    | "Entertainment"
    | "Healthcare"
    | "Rent"
    | "Education"
    | "Personal Care"
    | "Travel"
    | "Subscriptions"
    // ── Income categories ──
    | "Salary"
    | "Freelance"
    | "Investment"
    | "Business"
    | "Bonus"
    | "Gift"
    | "Rental Income"
    | "Dividend"
    // ── Shared ──
    | "Others"
    | string;   // allows custom user-entered categories
  status: "completed" | "pending" | "cancelled";
}

export interface SummaryKPIs {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  avgMonthlyExpense: number;
  avgMonthlyIncome: number;
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Insight {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  metric: string;       // display label (% values, text labels)
  amount?: number;      // raw INR value — set for currency metrics so InsightsPanel can convert it
}

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#00D4FF",
  Transport: "#00FF88",
  Shopping: "#FFB347",
  Utilities: "#FF3B5C",
  Entertainment: "#A78BFA",
  Healthcare: "#34D399",
  Rent: "#F87171",
  Others: "#94A3B8",
};

// Helper — build a date string N days ago
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function generateTransactions(): Transaction[] {
  return [
    // ── INCOME (15) ──────────────────────────────────────────────────
    { id: "txn_001", date: daysAgo(2),   description: "Salary - Accenture",       amount: 95000,  type: "income",  category: "Salary",     status: "completed" },
    { id: "txn_002", date: daysAgo(32),  description: "Salary - Accenture",       amount: 95000,  type: "income",  category: "Salary",     status: "completed" },
    { id: "txn_003", date: daysAgo(62),  description: "Salary - Accenture",       amount: 90000,  type: "income",  category: "Salary",     status: "completed" },
    { id: "txn_004", date: daysAgo(92),  description: "Salary - Accenture",       amount: 90000,  type: "income",  category: "Salary",     status: "completed" },
    { id: "txn_005", date: daysAgo(122), description: "Salary - Accenture",       amount: 85000,  type: "income",  category: "Salary",     status: "completed" },
    { id: "txn_006", date: daysAgo(152), description: "Salary - Accenture",       amount: 85000,  type: "income",  category: "Salary",     status: "completed" },
    { id: "txn_007", date: daysAgo(10),  description: "Freelance - Web Project",  amount: 35000,  type: "income",  category: "Freelance",  status: "completed" },
    { id: "txn_008", date: daysAgo(55),  description: "Freelance - UI Design",    amount: 25000,  type: "income",  category: "Freelance",  status: "completed" },
    { id: "txn_009", date: daysAgo(100), description: "Freelance - Logo Design",  amount: 15000,  type: "income",  category: "Freelance",  status: "completed" },
    { id: "txn_010", date: daysAgo(140), description: "Freelance - App Mockup",   amount: 40000,  type: "income",  category: "Freelance",  status: "completed" },
    { id: "txn_011", date: daysAgo(20),  description: "Dividend - HDFC MF",       amount: 12000,  type: "income",  category: "Investment", status: "completed" },
    { id: "txn_012", date: daysAgo(75),  description: "Interest - FD Maturity",   amount: 8500,   type: "income",  category: "Investment", status: "completed" },
    { id: "txn_013", date: daysAgo(115), description: "Dividend - SBI Bluechip",  amount: 5000,   type: "income",  category: "Investment", status: "completed" },
    { id: "txn_014", date: daysAgo(1),   description: "Cashback - CRED",          amount: 750,    type: "income",  category: "Others",     status: "pending" },
    { id: "txn_015", date: daysAgo(160), description: "Tax Refund - IT Dept",     amount: 18000,  type: "income",  category: "Others",     status: "completed" },

    // ── EXPENSES (35) ────────────────────────────────────────────────
    // Rent
    { id: "txn_016", date: daysAgo(3),   description: "Rent - April",             amount: 18000,  type: "expense", category: "Rent",           status: "completed" },
    { id: "txn_017", date: daysAgo(33),  description: "Rent - March",             amount: 18000,  type: "expense", category: "Rent",           status: "completed" },
    { id: "txn_018", date: daysAgo(63),  description: "Rent - February",          amount: 18000,  type: "expense", category: "Rent",           status: "completed" },
    { id: "txn_019", date: daysAgo(93),  description: "Rent - January",           amount: 18000,  type: "expense", category: "Rent",           status: "completed" },
    { id: "txn_020", date: daysAgo(123), description: "Rent - December",          amount: 18000,  type: "expense", category: "Rent",           status: "completed" },
    { id: "txn_021", date: daysAgo(153), description: "Rent - November",          amount: 18000,  type: "expense", category: "Rent",           status: "completed" },

    // Food & Dining
    { id: "txn_022", date: daysAgo(1),   description: "Swiggy",                   amount: 650,    type: "expense", category: "Food & Dining",  status: "pending" },
    { id: "txn_023", date: daysAgo(4),   description: "Zomato",                   amount: 480,    type: "expense", category: "Food & Dining",  status: "completed" },
    { id: "txn_024", date: daysAgo(8),   description: "Starbucks",                amount: 750,    type: "expense", category: "Food & Dining",  status: "completed" },
    { id: "txn_025", date: daysAgo(15),  description: "Barbeque Nation",          amount: 2200,   type: "expense", category: "Food & Dining",  status: "completed" },
    { id: "txn_026", date: daysAgo(40),  description: "Swiggy",                   amount: 380,    type: "expense", category: "Food & Dining",  status: "completed" },
    { id: "txn_027", date: daysAgo(68),  description: "Domino's Pizza",           amount: 550,    type: "expense", category: "Food & Dining",  status: "completed" },
    { id: "txn_028", date: daysAgo(110), description: "Chai Point",               amount: 200,    type: "expense", category: "Food & Dining",  status: "completed" },
    { id: "txn_029", date: daysAgo(145), description: "Zomato",                   amount: 920,    type: "expense", category: "Food & Dining",  status: "completed" },

    // Transport
    { id: "txn_030", date: daysAgo(2),   description: "Ola",                      amount: 350,    type: "expense", category: "Transport",      status: "completed" },
    { id: "txn_031", date: daysAgo(12),  description: "Uber",                     amount: 480,    type: "expense", category: "Transport",      status: "completed" },
    { id: "txn_032", date: daysAgo(45),  description: "Metro Recharge",           amount: 500,    type: "expense", category: "Transport",      status: "completed" },
    { id: "txn_033", date: daysAgo(80),  description: "Rapido",                   amount: 120,    type: "expense", category: "Transport",      status: "completed" },
    { id: "txn_034", date: daysAgo(130), description: "Petrol - HP",              amount: 800,    type: "expense", category: "Transport",      status: "completed" },

    // Shopping
    { id: "txn_035", date: daysAgo(5),   description: "Amazon India",             amount: 4500,   type: "expense", category: "Shopping",       status: "pending" },
    { id: "txn_036", date: daysAgo(25),  description: "Myntra",                   amount: 3200,   type: "expense", category: "Shopping",       status: "completed" },
    { id: "txn_037", date: daysAgo(50),  description: "Flipkart",                 amount: 7800,   type: "expense", category: "Shopping",       status: "completed" },
    { id: "txn_038", date: daysAgo(105), description: "Croma",                    amount: 5500,   type: "expense", category: "Shopping",       status: "completed" },
    { id: "txn_039", date: daysAgo(135), description: "Reliance Digital",         amount: 2800,   type: "expense", category: "Shopping",       status: "completed" },

    // Utilities
    { id: "txn_040", date: daysAgo(7),   description: "BESCOM Bill",              amount: 1800,   type: "expense", category: "Utilities",      status: "completed" },
    { id: "txn_041", date: daysAgo(35),  description: "Airtel Broadband",         amount: 999,    type: "expense", category: "Utilities",      status: "completed" },
    { id: "txn_042", date: daysAgo(70),  description: "Jio Recharge",             amount: 599,    type: "expense", category: "Utilities",      status: "completed" },
    { id: "txn_043", date: daysAgo(95),  description: "BWSSB Water Bill",         amount: 500,    type: "expense", category: "Utilities",      status: "completed" },
    { id: "txn_044", date: daysAgo(150), description: "Piped Gas Bill",           amount: 650,    type: "expense", category: "Utilities",      status: "completed" },

    // Entertainment
    { id: "txn_045", date: daysAgo(9),   description: "PVR Cinemas",              amount: 800,    type: "expense", category: "Entertainment",  status: "completed" },
    { id: "txn_046", date: daysAgo(38),  description: "Netflix Subscription",     amount: 649,    type: "expense", category: "Entertainment",  status: "completed" },
    { id: "txn_047", date: daysAgo(85),  description: "Spotify Premium",          amount: 119,    type: "expense", category: "Entertainment",  status: "completed" },
    { id: "txn_048", date: daysAgo(125), description: "BookMyShow",               amount: 1200,   type: "expense", category: "Entertainment",  status: "completed" },

    // Healthcare
    { id: "txn_049", date: daysAgo(18),  description: "Apollo Pharmacy",          amount: 1350,   type: "expense", category: "Healthcare",     status: "completed" },
    { id: "txn_050", date: daysAgo(90),  description: "Practo Consultation",      amount: 500,    type: "expense", category: "Healthcare",     status: "pending" },
  ];
}

export function generateSummaryKPIs(transactions: Transaction[]): SummaryKPIs {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10
      : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savingsRate,
    avgMonthlyExpense: Math.round(totalExpenses / 6),
    avgMonthlyIncome: Math.round(totalIncome / 6),
  };
}

export function generateMonthlyTrend(
  transactions: Transaction[]
): MonthlyTrendPoint[] {
  const buckets: Record<string, { income: number; expenses: number }> = {};

  // Build 6 month keys (oldest → newest)
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }); // e.g. "Oct 24"
    buckets[key] = { income: 0, expenses: 0 };
  }

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    if (!buckets[key]) continue; // outside 6-month window
    if (tx.type === "income") buckets[key].income += tx.amount;
    else buckets[key].expenses += tx.amount;
  }

  return Object.entries(buckets).map(([month, v]) => ({
    month,
    income: v.income,
    expenses: v.expenses,
    balance: v.income - v.expenses,
  }));
}

export function generateCategoryBreakdown(
  transactions: Transaction[]
): CategoryBreakdownItem[] {
  const expenseOnly = transactions.filter((t) => t.type === "expense");
  const totalExpenses = expenseOnly.reduce((s, t) => s + t.amount, 0);

  if (totalExpenses === 0) return [];

  const grouped: Record<string, number> = {};
  for (const tx of expenseOnly) {
    grouped[tx.category] = (grouped[tx.category] ?? 0) + tx.amount;
  }

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalExpenses) * 1000) / 10,
      color: CATEGORY_COLORS[category] ?? "#94A3B8",
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function generateInsights(transactions: Transaction[]): Insight[] {
  const kpis = generateSummaryKPIs(transactions);
  const categoryBreakdown = generateCategoryBreakdown(transactions);

  const topCategory = categoryBreakdown[0];

  // Current-month expenses
  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      t.type === "expense" &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
  const lastMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    const lm = new Date();
    lm.setMonth(lm.getMonth() - 1);
    return (
      t.type === "expense" &&
      d.getMonth() === lm.getMonth() &&
      d.getFullYear() === lm.getFullYear()
    );
  });
  const thisMonthTotal = thisMonth.reduce((s, t) => s + t.amount, 0);
  const lastMonthTotal = lastMonth.reduce((s, t) => s + t.amount, 0);

  const monthChange =
    lastMonthTotal > 0
      ? Math.round(
          ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        )
      : 0;

  const rentTotal = transactions
    .filter((t) => t.category === "Rent" && t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const rentPct =
    kpis.totalIncome > 0
      ? Math.round((rentTotal / kpis.totalIncome) * 100)
      : 0;

  const biggestExpense = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
    )
    .sort((a, b) => b.amount - a.amount)[0];

  // `fmt` kept only for fallback display; InsightsPanel now uses `amount` for currency
  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  void fmt; // suppress unused-variable warning

  return [
    {
      id: "ins_1",
      type: "warning",
      title: "High Food Spending",
      description:
        topCategory?.category === "Food & Dining"
          ? "Food & Dining is your top expense category this month"
          : `${topCategory?.category ?? "Food & Dining"} leads your spending`,
      metric: `₹${(topCategory?.amount ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      amount: topCategory?.amount ?? 0,
    },
    {
      id: "ins_2",
      type: "info",
      title: "Monthly Comparison",
      description:
        monthChange >= 0
          ? `You spent ${monthChange}% more this month compared to last month`
          : `You spent ${Math.abs(monthChange)}% less this month compared to last month`,
      metric: `${monthChange >= 0 ? "+" : ""}${monthChange}%`,
    },
    {
      id: "ins_3",
      type: kpis.savingsRate >= 20 ? "success" : "warning",
      title: "Savings on Track",
      description:
        kpis.savingsRate >= 20
          ? "Your savings rate is above the recommended 20% threshold"
          : "Your savings rate is below the recommended 20% threshold",
      metric: `${kpis.savingsRate}%`,
    },
    {
      id: "ins_4",
      type: rentPct > 30 ? "warning" : "info",
      title: `Rent is ${rentPct}% of Income`,
      description:
        rentPct > 30
          ? "Housing costs exceed the recommended 30% of income"
          : "Housing costs are within the recommended 30% of income",
      metric: `${rentPct}%`,
    },
    {
      id: "ins_5",
      type: "info",
      title: "Largest Transaction",
      description: biggestExpense
        ? `Your biggest expense this month was ${biggestExpense.description}`
        : "No expenses recorded this month",
      metric: biggestExpense ? `₹${biggestExpense.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "₹0",
      amount: biggestExpense?.amount ?? 0,
    },
  ];
}
