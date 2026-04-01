'use client';

import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useTransactions } from '@/lib/transactionContext';
import { useSettings } from '@/lib/settingsContext';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';
import { TrendingDown, TrendingUp, PiggyBank, BarChart2 } from 'lucide-react';

export default function InsightsPage() {
  const { insights, categoryBreakdown, kpis, monthlyTrend } = useTransactions();
  const { formatAmount } = useSettings();

  // Monthly net savings (last 3 months)
  const last3 = monthlyTrend.slice(-3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-6 px-6 space-y-6"
    >
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Understand your spending patterns and financial health at a glance.
        </p>
      </div>

      {/* Summary stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Savings Rate',
            value: `${kpis.savingsRate.toFixed(1)}%`,
            sub: kpis.savingsRate >= 20 ? 'Above 20% target ✓' : 'Below 20% target',
            color: kpis.savingsRate >= 20 ? 'text-secondary' : 'text-destructive',
            icon: PiggyBank,
            accent: '#00FF88',
          },
          {
            label: 'Top Category',
            value: categoryBreakdown[0]?.category ?? '—',
            sub: categoryBreakdown[0]
              ? formatAmount(categoryBreakdown[0].amount)
              : 'No data',
            color: 'text-accent',
            icon: TrendingDown,
            accent: '#FFB347',
          },
          {
            label: 'Total Income',
            value: formatAmount(kpis.totalIncome),
            sub: `${monthlyTrend.length} months tracked`,
            color: 'text-secondary',
            icon: TrendingUp,
            accent: '#00D4FF',
          },
          {
            label: 'Avg Monthly',
            value: formatAmount(kpis.avgMonthlyExpense),
            sub: 'Monthly expense avg',
            color: 'text-muted-foreground',
            icon: BarChart2,
            accent: '#818CF8',
          },
        ].map(({ label, value, sub, color, icon: Icon, accent }) => (
          <motion.div
            key={label}
            variants={itemVariants}
            className="glassmorphic p-5 flex flex-col gap-3"
            style={{ borderTop: `2px solid ${accent}40` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <Icon className="w-4 h-4" style={{ color: accent }} />
            </div>
            <p className={`text-xl font-bold font-mono break-all ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Insights + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsPanel insights={insights} />
        <SpendingBreakdown data={categoryBreakdown} />
      </div>

      {/* Monthly comparison table */}
      <motion.div variants={itemVariants} className="glassmorphic p-6">
        <h3 className="text-lg font-semibold uppercase tracking-wide text-foreground mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" />
          Monthly Comparison
        </h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-primary/20 text-left text-muted-foreground text-xs uppercase tracking-wide">
                <th className="pb-3 pr-6">Month</th>
                <th className="pb-3 pr-6">Income</th>
                <th className="pb-3 pr-6">Expenses</th>
                <th className="pb-3 pr-6">Net Balance</th>
                <th className="pb-3">Savings</th>
              </tr>
            </thead>
            <tbody>
              {[...monthlyTrend].reverse().map((row) => {
                const savingsRate = row.income > 0
                  ? ((row.income - row.expenses) / row.income * 100).toFixed(1)
                  : '0.0';
                const isPositive = row.balance >= 0;
                return (
                  <tr key={row.month} className="border-b border-primary/10 hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 pr-6 font-medium text-foreground whitespace-nowrap">{row.month}</td>
                    <td className="py-3 pr-6 font-mono text-secondary whitespace-nowrap">
                      {formatAmount(row.income)}
                    </td>
                    <td className="py-3 pr-6 font-mono text-destructive whitespace-nowrap">
                      {formatAmount(row.expenses)}
                    </td>
                    <td className={`py-3 pr-6 font-mono font-semibold whitespace-nowrap ${isPositive ? 'text-secondary' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{formatAmount(row.balance)}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        Number(savingsRate) >= 20
                          ? 'bg-secondary/20 text-secondary'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {savingsRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Last 3 months at a glance */}
      {last3.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {last3.map((m) => (
            <div key={m.month} className="glassmorphic p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m.month}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Income</span>
                  <span className="font-mono text-secondary">{formatAmount(m.income)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expenses</span>
                  <span className="font-mono text-destructive">{formatAmount(m.expenses)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-primary/10 pt-1.5">
                  <span className="font-medium text-foreground">Net</span>
                  <span className={`font-mono font-bold ${m.balance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                    {m.balance >= 0 ? '+' : ''}{formatAmount(m.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
