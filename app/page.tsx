'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useTransactions } from '@/lib/transactionContext';
import { useSettings } from '@/lib/settingsContext';
import { KPIStrip } from '@/components/dashboard/KPIStrip';
import { BalanceTrendChart } from '@/components/dashboard/BalanceTrendChart';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';

export default function OverviewPage() {
  const { kpis, monthlyTrend, categoryBreakdown, transactions } = useTransactions();
  const { formatAmount, formatDate } = useSettings();
  const allCategories = categoryBreakdown;
  const recentTransactions = transactions.slice(0, 5);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 py-6 px-6"
    >
      {/* 1. Main KPI Summary */}
      <div className="-mx-6">
        <KPIStrip kpis={kpis} />
      </div>

      {/* 2. Main Balance Trend Chart (Highlight of the page) */}
      <motion.div variants={itemVariants} className="w-full">
        <BalanceTrendChart data={monthlyTrend} />
      </motion.div>

      {/* 3. Detailed Spending Analysis (Full width, side-side chart & legend) */}
      <motion.div variants={itemVariants} className="w-full">
        <SpendingBreakdown data={categoryBreakdown} />
      </motion.div>

      {/* 4. Bottom Row: Top Categories & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Spending Categories */}
        <motion.div
          variants={itemVariants}
          className="glassmorphic p-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide text-foreground">
              <Trophy className="w-5 h-5 text-[#FFB347]" />
              Spending by Category
            </h3>
            <span className="text-xs text-muted-foreground font-mono">{allCategories.length} categories</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {allCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center uppercase tracking-widest opacity-50">No Data</p>
            ) : (
              allCategories.map((item, index) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground text-sm">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono">{item.percentage.toFixed(1)}%</span>
                      <span className="font-mono text-sm font-bold" style={{ color: item.color }}>
                        {formatAmount(item.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.1 + index * 0.05 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${item.color}40, ${item.color})`,
                        boxShadow: `0 0 6px ${item.color}40`
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Activity Quick View */}
        <motion.div
          variants={itemVariants}
          className="glassmorphic p-6 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-foreground">Recent Activity</h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold tracking-widest uppercase outline-1 outline-primary/20">Live</span>
          </div>
          
          <div className="flex flex-col">
            {recentTransactions.map((tx, idx) => (
              <div 
                key={tx.id} 
                className={`flex items-center justify-between py-3 ${idx !== recentTransactions.length - 1 ? 'border-b border-white/[0.03]' : ''}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground truncate max-w-[180px]">{tx.description}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{tx.category}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-sm font-mono font-bold ${tx.type === 'income' ? 'text-secondary' : 'text-destructive'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatDate(tx.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
