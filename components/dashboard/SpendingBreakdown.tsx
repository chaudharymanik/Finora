'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { itemVariants } from '@/lib/animations';
import { useSettings } from '@/lib/settingsContext';
import type { CategoryBreakdownItem } from '@/lib/mockData';

interface SpendingBreakdownProps {
  data: CategoryBreakdownItem[];
}

type PieSlice = CategoryBreakdownItem & { key: string };

function buildSlices(data: CategoryBreakdownItem[]): PieSlice[] {
  return data.map((row, i) => ({
    ...row,
    key: `${row.category}-${i}`,
  }));
}

export function SpendingBreakdown({ data }: SpendingBreakdownProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const pieSlices = useMemo(() => buildSlices(data), [data]);
  const { formatAmount } = useSettings();

  const totalExpenses = data.reduce((s, d) => s + d.amount, 0);

  const empty = data.length === 0;

  return (
    <motion.div
      variants={itemVariants}
      className="glassmorphic flex w-full flex-col gap-4 p-6"
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide text-foreground">
        <PieChartIcon className="w-5 h-5 text-primary" />
        Spending Breakdown
      </h3>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <PieChartIcon className="w-10 h-10 opacity-30" />
          <p className="text-sm">No expense data available</p>
        </div>
      ) : (
        <div className="flex w-full flex-1 flex-col gap-6 lg:flex-row lg:items-center">
          {/* Donut Chart Container */}
          <div className="relative flex aspect-square w-full max-w-[240px] flex-shrink-0 items-center justify-center mx-auto lg:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieSlices}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="none"
                  animationDuration={800}
                  onMouseEnter={(_, index) =>
                    setHoveredKey(pieSlices[index]?.key ?? null)
                  }
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  {pieSlices.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.color}
                      opacity={
                        hoveredKey === null || hoveredKey === entry.key
                          ? 1
                          : 0.35
                      }
                      style={{ 
                        transition: 'opacity 0.2s, filter 0.2s',
                        filter: hoveredKey === entry.key ? 'brightness(1.1) drop-shadow(0 0 8px rgba(0,0,0,0.5))' : 'none',
                        outline: 'none'
                      } as React.CSSProperties}
                    />
                  ))}
                </Pie>

              </RechartsPie>
            </ResponsiveContainer>

            {/* Dynamic Center Text */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <AnimatePresence mode="wait">
                {hoveredKey ? (
                  <motion.div
                    key={hoveredKey}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xl font-bold text-foreground">
                      {formatAmount(pieSlices.find(s => s.key === hoveredKey)?.amount ?? 0)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground mt-0.5 truncate max-w-[120px]">
                      {pieSlices.find(s => s.key === hoveredKey)?.category}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="total"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xl font-bold text-foreground">
                      {formatAmount(totalExpenses)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground mt-0.5">
                      Total Monthly
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Improved Legend List */}
          <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar lg:max-h-none">
            {pieSlices.sort((a, b) => b.amount - a.amount).map((item) => (
              <button
                key={item.key}
                type="button"
                className={`group flex items-center justify-between rounded-lg px-3 py-2 transition-all ${
                  hoveredKey === item.key ? 'bg-white/[0.08] ring-1 ring-white/10' : 'hover:bg-white/[0.04]'
                }`}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                  />
                  <span className={`text-sm font-medium transition-colors ${
                    hoveredKey === item.key ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  } truncate`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-xs font-mono text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold font-mono text-foreground min-w-[70px] text-right">
                    {formatAmount(item.amount)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
