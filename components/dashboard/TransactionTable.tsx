'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronUp, Plus, X,
  ChevronLeft, ChevronRight, Download, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { itemVariants } from '@/lib/animations';
import { useRole } from '@/lib/roleContext';
import { useSettings } from '@/lib/settingsContext';
import type { Transaction } from '@/lib/mockData';

// ─── Colors ────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining':  '#00D4FF',
  Transport:        '#00FF88',
  Shopping:         '#FFB347',
  Utilities:        '#FF3B5C',
  Entertainment:    '#A78BFA',
  Healthcare:       '#34D399',
  Rent:             '#F87171',
  Education:        '#60A5FA',
  'Personal Care':  '#F9A8D4',
  Travel:           '#FCD34D',
  Subscriptions:    '#C084FC',
  Salary:           '#38BDF8',
  Freelance:        '#818CF8',
  Investment:       '#FBBF24',
  Business:         '#34D399',
  Bonus:            '#F472B6',
  Gift:             '#FB923C',
  'Rental Income':  '#A3E635',
  Dividend:         '#E879F9',
  Others:           '#94A3B8',
};

// ─── Type-specific category lists ──────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Utilities',
  'Entertainment', 'Healthcare', 'Rent', 'Education',
  'Personal Care', 'Travel', 'Subscriptions', 'Others',
];
const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Business',
  'Bonus', 'Gift', 'Rental Income', 'Dividend', 'Others',
];

const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

const ROWS_PER_PAGE = 10;

// ─── Props ─────────────────────────────────────────────────────────────────
interface TransactionTableProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransaction: (id: string, patch: Partial<Transaction>) => void;
}

type SortColumn = 'date' | 'amount';
type SortDirection = 'asc' | 'desc';

// ─── Helpers ───────────────────────────────────────────────────────────────
// Rename the local formatDate helper so it doesn't clash with the context one
function formatDateISO(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function exportCSV(rows: Transaction[]) {
  const header = 'Date,Description,Amount,Type,Category,Status';
  const lines = rows.map(t =>
    `"${formatDateISO(t.date)}","${t.description}",${t.amount},${t.type},"${t.category}",${t.status}`
  );
  downloadFile([header, ...lines].join('\n'), 'finora_transactions.csv', 'text/csv');
}

function exportJSON(rows: Transaction[]) {
  downloadFile(JSON.stringify(rows, null, 2), 'finora_transactions.json', 'application/json');
}

// Reusable select class — works in both dark and light modes
const SELECT_CLS =
  'bg-input border border-primary/20 rounded-lg px-3 py-2 text-sm text-foreground ' +
  'focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition-all w-full sm:w-auto';

// ─── Component ─────────────────────────────────────────────────────────────
export function TransactionTable({
  transactions, onAddTransaction, onUpdateTransaction,
}: TransactionTableProps) {
  const { currentRole } = useRole();
  const { formatAmount, formatDate } = useSettings();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');

  // Sort
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState<{ msg: string; variant: 'success' | 'info' | 'warn' } | null>(null);

  // Pending action popover: which tx id is showing actions
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate]     = useState('');
  const [formDesc, setFormDesc]     = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType]     = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState<string>('Food & Dining');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formStatus, setFormStatus] = useState<Transaction['status']>('completed');

  // Derived: category options based on selected type
  const categoryOptions = formType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // When type changes, reset category to first valid one
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setFormType(newType);
    setFormCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    setFormCustomCategory('');
  };

  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  }, [sortColumn]);

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter);
    if (categoryFilter !== 'all') result = result.filter(t => t.category === categoryFilter);
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    result.sort((a, b) => {
      let cmp = sortColumn === 'date'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : a.amount - b.amount;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [transactions, searchQuery, typeFilter, categoryFilter, statusFilter, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = filteredAndSorted.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);
  const startIdx = (safePage - 1) * ROWS_PER_PAGE + 1;
  const endIdx = Math.min(safePage * ROWS_PER_PAGE, filteredAndSorted.length);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <div className="w-4 h-4" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  const showTemporaryToast = (msg: string, variant: 'success' | 'info' | 'warn' = 'success') => {
    setShowToast({ msg, variant });
    setTimeout(() => setShowToast(null), 2500);
  };

  const resetForm = () => {
    setFormDate(''); setFormDesc(''); setFormAmount('');
    setFormType('expense'); setFormCategory('Food & Dining');
    setFormCustomCategory(''); setFormStatus('completed');
  };

  const handleSubmit = () => {
    if (!formDate || !formDesc.trim() || !formAmount || Number(formAmount) <= 0) return;
    const finalCategory = formCategory === 'Others' && formCustomCategory.trim()
      ? formCustomCategory.trim()
      : formCategory;
    const newTx: Transaction = {
      id: `txn_${Date.now()}`,
      date: new Date(formDate).toISOString(),
      description: formDesc.trim(),
      amount: Number(formAmount),
      type: formType,
      category: finalCategory,
      status: formStatus,
    };
    onAddTransaction(newTx);
    setShowModal(false);
    resetForm();
    showTemporaryToast('Transaction added!');
  };

  // Pending action handlers
  const handleComplete = (txId: string) => {
    onUpdateTransaction(txId, { status: 'completed' });
    setPendingAction(null);
    showTemporaryToast('Transaction marked as completed!', 'success');
  };

  const handleCancel = (txId: string) => {
    onUpdateTransaction(txId, { status: 'cancelled' });
    setPendingAction(null);
    showTemporaryToast('Transaction cancelled.', 'warn');
  };

  return (
    <motion.div
      variants={itemVariants}
      className="glassmorphic p-6 flex flex-col"
    >
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-semibold text-foreground uppercase tracking-wide">
          Transactions
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => exportCSV(filteredAndSorted)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/20 text-muted-foreground text-xs font-medium hover:text-foreground hover:border-primary/40 transition-all"
          ><Download className="w-3.5 h-3.5" />CSV</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => exportJSON(filteredAndSorted)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/20 text-muted-foreground text-xs font-medium hover:text-foreground hover:border-primary/40 transition-all"
          ><Download className="w-3.5 h-3.5" />JSON</motion.button>
          {currentRole === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all hover:bg-primary/90"
            ><Plus className="w-4 h-4" />Add Transaction</motion.button>
          )}
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search description or category…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-input border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition-all text-sm"
          />
        </div>

        <select value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value as typeof typeFilter); setCurrentPage(1); }}
          className={SELECT_CLS}>
          <option value="all">All Types</option>
          <option value="income">💰 Income</option>
          <option value="expense">💸 Expense</option>
        </select>

        <select value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          className={SELECT_CLS}>
          <option value="all">All Categories</option>
          <optgroup label="─── Expense ───">
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </optgroup>
          <optgroup label="─── Income ───">
            {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </optgroup>
        </select>

        <select value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1); }}
          className={SELECT_CLS}>
          <option value="all">All Status</option>
          <option value="completed">✅ Completed</option>
          <option value="pending">⏳ Pending</option>
          <option value="cancelled">❌ Cancelled</option>
        </select>
      </div>

      {/* ─── Table ─── */}
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/20">
              <th>
                <button onClick={() => handleSort('date')}
                  className="w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  Date <SortIcon column="date" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Type</th>
              <th>
                <button onClick={() => handleSort('amount')}
                  className="w-full text-left px-4 py-3 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  Amount <SortIcon column="amount" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((tx, index) => {
              const isPending = tx.status === 'pending';
              const isCancelled = tx.status === 'cancelled';

              return (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`border-b border-primary/10 transition-all ${
                    index % 2 === 1 ? 'bg-[rgba(255,255,255,0.02)]' : ''
                  } ${isCancelled ? 'opacity-50' : 'hover:bg-white/[0.04]'}`}
                >
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className={`px-4 py-3 max-w-[200px] truncate ${isCancelled ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {tx.description}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[tx.category] ?? '#94A3B8'}20`,
                        color: CATEGORY_COLORS[tx.category] ?? '#94A3B8',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[tx.category] ?? '#94A3B8' }} />
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      tx.type === 'income' ? 'bg-secondary/20 text-secondary' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {tx.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className={`px-3 py-3 font-mono text-sm font-semibold whitespace-nowrap ${
                    isCancelled ? 'text-muted-foreground line-through' :
                    tx.type === 'income' ? 'text-secondary' : 'text-destructive'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                  </td>

                  {/* ─── Status cell — clickable if pending ─── */}
                  <td className="px-4 py-3">
                    {isPending ? (
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPendingAction(pendingAction === tx.id ? null : tx.id)}
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#FFB347]/20 text-[#FFB347] hover:bg-[#FFB347]/30 transition-all cursor-pointer border border-[#FFB347]/20"
                        >
                          <Clock className="w-3 h-3" />
                          Pending ▾
                        </motion.button>

                        {/* Action popover */}
                        <AnimatePresence>
                          {pendingAction === tx.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 top-8 z-50 glassmorphic border border-primary/20 rounded-xl p-3 flex flex-col gap-2 min-w-[160px] shadow-2xl shadow-black/50"
                            >
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold px-1 mb-1">
                                Update status
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleComplete(tx.id)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/20 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Mark Completed
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleCancel(tx.id)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel Transaction
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isCancelled
                          ? 'bg-muted text-muted-foreground/50 line-through'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCancelled
                          ? <><XCircle className="w-3 h-3" />Cancelled</>
                          : <><CheckCircle2 className="w-3 h-3 text-secondary" />Completed</>
                        }
                      </span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Empty State ─── */}
      {filteredAndSorted.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <Search className="w-10 h-10 opacity-30" />
          <p className="text-sm">No transactions found</p>
        </motion.div>
      )}

      {/* ─── Pagination ─── */}
      {filteredAndSorted.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
          <p className="text-xs text-muted-foreground">
            Showing {startIdx}–{endIdx} of {filteredAndSorted.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              disabled={safePage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-muted/80">
              <ChevronLeft className="w-3 h-3" />Prev
            </motion.button>
            <span className="text-xs text-muted-foreground font-mono">{safePage}/{totalPages}</span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-muted/80">
              Next<ChevronRight className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
      )}

      {/* ─── Add Transaction Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => { setShowModal(false); resetForm(); }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="glassmorphic relative w-full max-w-md p-6 rounded-xl border border-primary/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Add Transaction</h3>
                <button onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Date</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0D1117] border border-primary/20 rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
                    style={{ colorScheme: 'dark' }} />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Description</label>
                  <input type="text" placeholder="e.g. Swiggy order" value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0D1117] border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30" />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Amount (₹)</label>
                  <input type="number" placeholder="Enter amount" value={formAmount}
                    onChange={e => setFormAmount(e.target.value)} min="1"
                    className="w-full px-3 py-2 bg-[#0D1117] border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30" />
                </div>

                {/* Type + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Type</label>
                    <select value={formType} onChange={e => handleTypeChange(e.target.value as 'income' | 'expense')}
                      className={`w-full ${SELECT_CLS}`} style={{ colorScheme: 'dark' }}>
                      <option value="expense">💸 Expense</option>
                      <option value="income">💰 Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Status</label>
                    <select value={formStatus} onChange={e => setFormStatus(e.target.value as Transaction['status'])}
                      className={`w-full ${SELECT_CLS}`} style={{ colorScheme: 'dark' }}>
                      <option value="completed">✅ Completed</option>
                      <option value="pending">⏳ Pending</option>
                    </select>
                  </div>
                </div>

                {/* Category — type-aware */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Category
                    <span className="ml-2 text-primary/60 font-normal">
                      ({formType === 'expense' ? 'expense categories' : 'income categories'})
                    </span>
                  </label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                    className={`w-full ${SELECT_CLS}`} style={{ colorScheme: 'dark' }}>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Custom category input — shown when "Others" is selected */}
                <AnimatePresence>
                  {formCategory === 'Others' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <label className="block text-xs text-muted-foreground mb-1">
                        Custom Category Name
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. ${formType === 'expense' ? 'Pet Care' : 'Side Hustle'}`}
                        value={formCustomCategory}
                        onChange={e => setFormCustomCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0D1117] border border-primary/40 rounded-lg text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!formDate || !formDesc.trim() || !formAmount || Number(formAmount) <= 0}
                  className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-semibold glow-primary transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                  Add Transaction
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Toast ─── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed top-20 right-6 z-[110] glassmorphic px-4 py-3 rounded-lg border shadow-lg flex items-center gap-2 ${
              showToast.variant === 'warn'
                ? 'border-destructive/30'
                : 'border-secondary/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              showToast.variant === 'warn' ? 'bg-destructive' : 'bg-secondary'
            }`} />
            <span className="text-sm text-foreground font-medium">{showToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
