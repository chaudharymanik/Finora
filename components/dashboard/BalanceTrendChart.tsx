'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { itemVariants } from '@/lib/animations';
import { useSettings } from '@/lib/settingsContext';
import type { MonthlyTrendPoint } from '@/lib/mockData';

interface BalanceTrendChartProps {
  data: MonthlyTrendPoint[];
}



export function BalanceTrendChart({ data }: BalanceTrendChartProps) {
  const [timeframe, setTimeframe] = useState<'3M' | '6M'>('6M');
  const timeframes: Array<'3M' | '6M'> = ['3M', '6M'];
  const { formatAmount, currency, usdRate } = useSettings();

  // Short label for Y-axis ticks
  const formatYAxis = (value: number): string => {
    if (currency === 'USD') {
      const usd = value * usdRate;
      if (Math.abs(usd) >= 1000) return `$${(usd / 1000).toFixed(0)}K`;
      return `$${usd.toFixed(0)}`;
    }
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (Math.abs(value) >= 1000)   return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const filteredData = useMemo(() => {
    if (timeframe === '3M') return data.slice(-3);
    return data;
  }, [data, timeframe]);

  const avgIncome =
    filteredData.length > 0
      ? Math.round(
          filteredData.reduce((s, d) => s + d.income, 0) / filteredData.length
        )
      : 0;

  const avgExpense =
    filteredData.length > 0
      ? Math.round(
          filteredData.reduce((s, d) => s + d.expenses, 0) /
            filteredData.length
        )
      : 0;

  const netSaved = filteredData.reduce((s, d) => s + d.balance, 0);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (!active || !payload) return null;
    const income   = payload.find(p => p.dataKey === 'income')?.value   ?? 0;
    const expenses = payload.find(p => p.dataKey === 'expenses')?.value ?? 0;
    const balance  = payload.find(p => p.dataKey === 'balance')?.value  ?? 0;
    return (
      <div className="tooltip-solid p-3 text-xs">
        <p className="text-muted-foreground mb-2 font-semibold border-b border-border pb-1.5">{label}</p>
        <p className="text-secondary font-mono">Income   : {income.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        <p className="text-destructive font-mono">Expenses : {expenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        <p className="text-primary font-mono font-bold mt-1">Balance  : {balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
      </div>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      className="glassmorphic p-6 col-span-1 md:col-span-2 lg:col-span-2"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground uppercase tracking-wide">
          <BarChart3 className="w-5 h-5 text-primary" />
          Balance Trend
        </h3>

        {/* Timeframe selector */}
        <motion.div className="flex gap-2 bg-muted rounded-lg p-1">
          {timeframes.map((tf) => (
            <motion.button
              key={tf}
              onClick={() => setTimeframe(tf)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-primary text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={filteredData}
          margin={{ top: 8, right: 16, bottom: 4, left: 16 }}
        >
          <defs>
            <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FF88" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#00FF88" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3B5C" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#FF3B5C" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0, 212, 255, 0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="rgba(232, 235, 255, 0.4)"
            style={{ fontSize: '11px' }}
            tick={{ fill: 'rgba(232, 235, 255, 0.6)' }}
          />
          <YAxis
            stroke="rgba(232, 235, 255, 0.4)"
            style={{ fontSize: '11px' }}
            tick={{ fill: 'rgba(232, 235, 255, 0.6)' }}
            tickFormatter={formatYAxis}
            width={68}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="url(#incomeBarGrad)"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="url(#expenseBarGrad)"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Balance"
            stroke="#00D4FF"
            strokeWidth={2}
            dot={{ fill: '#00D4FF', r: 4 }}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Stats footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 grid grid-cols-3 gap-4 text-center text-sm"
      >
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Avg Income</p>
            <p className="text-secondary font-mono font-bold">{formatAmount(avgIncome)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Avg Expense</p>
            <p className="text-destructive font-mono font-bold">{formatAmount(avgExpense)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Net Saved</p>
            <p className={`font-mono font-bold ${netSaved >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              {formatAmount(netSaved)}
            </p>
          </div>
      </motion.div>
    </motion.div>
  );
}
