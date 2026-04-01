'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Calendar } from 'lucide-react';
import { KPICounter } from './KPICounter';
import { containerVariants } from '@/lib/animations';
import type { SummaryKPIs } from '@/lib/mockData';

interface KPIStripProps {
  kpis: SummaryKPIs;
}

export function KPIStrip({ kpis }: KPIStripProps) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-5 gap-3 px-6 py-2 md:gap-4"
    >
      <KPICounter
        label="Total Balance"
        value={kpis.totalBalance}
        format="currency"
        isPositive={kpis.totalBalance >= 0}
        icon={<Wallet className="w-5 h-5" />}
      />

      <KPICounter
        label="Total Income"
        value={kpis.totalIncome}
        format="currency"
        isPositive={true}
        icon={<TrendingUp className="w-5 h-5" />}
      />

      <KPICounter
        label="Total Expenses"
        value={kpis.totalExpenses}
        format="currency"
        isPositive={false}
        icon={<TrendingDown className="w-5 h-5" />}
      />

      <KPICounter
        label="Savings Rate"
        value={kpis.savingsRate}
        format="percent"
        isPositive={kpis.savingsRate >= 20}
        icon={<PiggyBank className="w-5 h-5" />}
      />

      <KPICounter
        label="Avg Monthly Expense"
        value={kpis.avgMonthlyExpense}
        format="currency"
        icon={<Calendar className="w-5 h-5" />}
      />
    </motion.section>
  );
}
