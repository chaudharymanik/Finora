'use client';

import {
  createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode,
} from 'react';

export type Currency   = 'INR' | 'USD';
export type DateFmt    = 'DD/MM/YYYY' | 'MM/DD/YYYY';
export type ThemeMode  = 'dark' | 'light';

interface SettingsCtxValue {
  currency:       Currency;
  setCurrency:    (c: Currency) => void;
  dateFormat:     DateFmt;
  setDateFormat:  (f: DateFmt) => void;
  theme:          ThemeMode;
  toggleTheme:    () => void;
  compactMode:    boolean;
  setCompactMode: (v: boolean) => void;
  /** Live USD rate per 1 INR (fetched from open API) */
  usdRate:        number;
  /** Whether the live rate is being fetched */
  rateLoading:    boolean;
  /** Format an INR number according to current currency + live rate */
  formatAmount:   (inrAmount: number) => string;
  /** Format a date ISO string according to current dateFormat */
  formatDate:     (isoString: string) => string;
}

const SettingsContext = createContext<SettingsCtxValue | null>(null);

// ─── localStorage helpers ────────────────────────────────────────────────
function loadSetting<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(`finora_${key}`);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function saveSetting(key: string, value: unknown) {
  try { localStorage.setItem(`finora_${key}`, JSON.stringify(value)); } catch {}
}

// ─── Fallback rate if API is unavailable ─────────────────────────────────
const FALLBACK_USD_RATE = 0.012;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency,    setCurrencyState]    = useState<Currency>  (() => loadSetting('currency',    'INR'));
  const [dateFormat,  setDateFormatState]  = useState<DateFmt>   (() => loadSetting('dateFormat',  'DD/MM/YYYY'));
  const [theme,       setThemeState]       = useState<ThemeMode> (() => loadSetting('theme',       'dark'));
  const [compactMode, setCompactModeState] = useState<boolean>   (() => loadSetting('compactMode', false));

  // Live exchange rate state
  const [usdRate,     setUsdRate]          = useState<number>(FALLBACK_USD_RATE);
  const [rateLoading, setRateLoading]      = useState(false);

  // Apply theme class to <html> on mount and on change
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(theme);
  }, [theme]);

  // Fetch live INR → USD rate on mount (and when currency changes to USD)
  useEffect(() => {
    if (currency !== 'USD') return; // don't fetch if not needed
    let cancelled = false;

    const fetchRate = async () => {
      setRateLoading(true);
      try {
        // Free API — no key needed, CORS enabled
        const res = await fetch('https://open.er-api.com/v6/latest/INR', {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Rate fetch failed');
        const data = await res.json();
        const rate: number = data?.rates?.USD;
        if (rate && !cancelled) setUsdRate(rate);
      } catch {
        // Silently fall back to the baked-in rate
        if (!cancelled) setUsdRate(FALLBACK_USD_RATE);
      } finally {
        if (!cancelled) setRateLoading(false);
      }
    };

    fetchRate();
    // Refresh every 10 minutes while user has USD selected
    const interval = setInterval(fetchRate, 10 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [currency]);

  // ─── Setters ─────────────────────────────────────────────────────────
  const setCurrency    = useCallback((c: Currency)  => { setCurrencyState(c);    saveSetting('currency',    c); }, []);
  const setDateFormat  = useCallback((f: DateFmt)   => { setDateFormatState(f);  saveSetting('dateFormat',  f); }, []);
  const setCompactMode = useCallback((v: boolean)   => { setCompactModeState(v); saveSetting('compactMode', v); }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      saveSetting('theme', next);
      return next;
    });
  }, []);

  // ─── Formatters ───────────────────────────────────────────────────────
  const formatAmount = useCallback((inrAmount: number): string => {
    if (currency === 'USD') {
      const usd = inrAmount * usdRate;
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${inrAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }, [currency, usdRate]);

  const formatDate = useCallback((isoString: string): string => {
    const d = new Date(isoString);
    const dd   = String(d.getDate()).padStart(2, '0');
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return dateFormat === 'DD/MM/YYYY' ? `${dd}/${mm}/${yyyy}` : `${mm}/${dd}/${yyyy}`;
  }, [dateFormat]);

  const value = useMemo<SettingsCtxValue>(() => ({
    currency, setCurrency,
    dateFormat, setDateFormat,
    theme, toggleTheme,
    compactMode, setCompactMode,
    usdRate, rateLoading,
    formatAmount, formatDate,
  }), [currency, setCurrency, dateFormat, setDateFormat, theme, toggleTheme,
      compactMode, setCompactMode, usdRate, rateLoading, formatAmount, formatDate]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
}
