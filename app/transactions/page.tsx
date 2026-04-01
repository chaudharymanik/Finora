'use client';

import { motion } from 'framer-motion';
import { containerVariants } from '@/lib/animations';
import { useTransactions } from '@/lib/transactionContext';
import { TransactionTable } from '@/components/dashboard/TransactionTable';

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction } = useTransactions();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-6 px-6 space-y-6"
    >
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse, search, filter and export all your financial transactions.
        </p>
      </div>

      <TransactionTable
        transactions={transactions}
        onAddTransaction={addTransaction}
        onUpdateTransaction={updateTransaction}
      />
    </motion.div>
  );
}
