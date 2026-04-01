'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Transaction,
  generateTransactions,
  generateSummaryKPIs,
  generateMonthlyTrend,
  generateCategoryBreakdown,
  generateInsights,
  SummaryKPIs,
  MonthlyTrendPoint,
  CategoryBreakdownItem,
  Insight,
} from '@/lib/mockData';

const STORAGE_KEY = 'finora_transactions';

function loadFromStorage(): Transaction[] {
  if (typeof window === 'undefined') return generateTransactions();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Transaction[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* corrupt – ignore */ }
  return generateTransactions();
}

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  kpis: SummaryKPIs;
  monthlyTrend: MonthlyTrendPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
  insights: Insight[];
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(loadFromStorage);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch { /* quota */ }
  }, [transactions]);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...patch } : tx))
    );
  }, []);

  const kpis = useMemo(() => generateSummaryKPIs(transactions), [transactions]);
  const monthlyTrend = useMemo(() => generateMonthlyTrend(transactions), [transactions]);
  const categoryBreakdown = useMemo(() => generateCategoryBreakdown(transactions), [transactions]);
  const insights = useMemo(() => generateInsights(transactions), [transactions]);

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, updateTransaction, kpis, monthlyTrend, categoryBreakdown, insights }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
}
