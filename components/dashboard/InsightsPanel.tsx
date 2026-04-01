'use client';

import { motion } from 'framer-motion';
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useSettings } from '@/lib/settingsContext';
import type { Insight } from '@/lib/mockData';

interface InsightsPanelProps {
  insights: Insight[];
}

const TYPE_CONFIG: Record<
  Insight['type'],
  { color: string; borderColor: string; icon: React.ReactNode }
> = {
  warning: {
    color: 'text-[#FFB347]',
    borderColor: '#FFB347',
    icon: <AlertTriangle className="w-4 h-4 text-[#FFB347]" />,
  },
  info: {
    color: 'text-[#00D4FF]',
    borderColor: '#00D4FF',
    icon: <Info className="w-4 h-4 text-[#00D4FF]" />,
  },
  success: {
    color: 'text-[#00FF88]',
    borderColor: '#00FF88',
    icon: <CheckCircle className="w-4 h-4 text-[#00FF88]" />,
  },
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const empty = insights.length === 0;
  const { formatAmount } = useSettings();

  return (
    <motion.div
      variants={itemVariants}
      className="glassmorphic p-6 flex flex-col gap-4"
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide text-foreground">
        <Lightbulb className="w-5 h-5 text-primary" />
        Insights
      </h3>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
          <Lightbulb className="w-10 h-10 opacity-30" />
          <p className="text-sm">No insights available</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {insights.map((insight) => {
            const cfg = TYPE_CONFIG[insight.type];
            // If the insight has a raw INR amount, convert it via the settings formatter
            const displayMetric =
              insight.amount !== undefined
                ? formatAmount(insight.amount)
                : insight.metric;
            return (
              <motion.div
                key={insight.id}
                variants={itemVariants}
                className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 border-l-4 transition-all hover:bg-muted/80"
                style={{ borderLeftColor: cfg.borderColor }}
              >
                <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {insight.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-md px-2 py-1 text-xs font-mono font-bold ${cfg.color} bg-white/5`}
                >
                  {displayMetric}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
