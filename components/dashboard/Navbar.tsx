'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, Lightbulb,
  Settings, Eye, Zap, ChevronDown, X,
  Sun, Moon, Globe, User,
} from 'lucide-react';
import { useRole } from '@/lib/roleContext';
import { useSettings } from '@/lib/settingsContext';
import type { Currency, DateFmt } from '@/lib/settingsContext';
import { SignInButton, SignOutButton, SignUpButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/',             label: 'Overview',     icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { href: '/insights',     label: 'Insights',     icon: Lightbulb       },
];

const letterVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.3 + i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
};
const logoVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -15 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
};
const BRAND = 'Finora';

// ── Animated Finance Chart Logo ──────────────────────────────────────────
const BAR_HEIGHTS = [40, 65, 52, 80]; // % of viewBox height
const BAR_W = 6;
const BAR_GAP = 3;
const VB = 32; // viewBox size

function FinoraChartLogo() {
  // bars start at 0 height and grow up
  const barStartY = VB - 4; // baseline
  const bars = BAR_HEIGHTS.map((pct, i) => {
    const h = (pct / 100) * (VB - 6);
    const x = 2 + i * (BAR_W + BAR_GAP);
    return { x, h, i };
  });

  // trend line points (top-center of each bar)
  const pts = bars.map(b => ({ x: b.x + BAR_W / 2, y: barStartY - b.h }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className="flex-shrink-0"
      style={{ width: 32, height: 32 }}
    >
      <svg viewBox={`0 0 ${VB} ${VB}`} width="32" height="32" fill="none" overflow="visible">
        {/* Gradient defs */}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--secondary)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>

        {/* Animated bars */}
        {bars.map(({ x, h, i }) => (
          <motion.rect
            key={i}
            x={x}
            rx={1.5}
            width={BAR_W}
            fill="url(#barGrad)"
            // animate from bottom (height=0) to full height
            initial={{ y: barStartY, height: 0 }}
            animate={{ y: barStartY - h, height: h }}
            transition={{ delay: 0.25 + i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        {/* Rising trend line (draws itself via pathLength) */}
        <motion.polyline
          points={polyline}
          stroke="url(#lineGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.6, ease: 'easeOut' }}
        />

        {/* Dot on last point (highest bar) */}
        <motion.circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r={1.8}
          fill="var(--primary)"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.4, 1] }}
          transition={{ delay: 1.25, duration: 0.4 }}
        />

        {/* Idle pulse on dot */}
        <motion.circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r={3}
          stroke="var(--primary)"
          strokeWidth={0.8}
          fill="none"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ delay: 1.6, duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${on ? 'bg-primary' : 'bg-muted border border-border'}`}
    >
      <motion.span
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-0.5 left-0 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { currentRole, setRole } = useRole();
  const { isSignedIn } = useAuth();
  const { currency, setCurrency, dateFormat, setDateFormat, theme, toggleTheme, usdRate, rateLoading } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-primary/20 sticky top-0 z-50 bg-background/95 backdrop-blur-sm shadow-sm"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">

          {/* ── Animated Logo ── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          {/* Animated chart logo */}
          <FinoraChartLogo />
          <span className="font-bold text-lg sm:text-xl hidden sm:flex items-center overflow-hidden">
            {BRAND.split('').map((char, i) => (
              <motion.span key={i} custom={i} variants={letterVariants} initial="hidden" animate="visible"
                className="inline-block"
                style={{
                  background: i < 2 ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : undefined,
                  WebkitBackgroundClip: i < 2 ? 'text' : undefined,
                  WebkitTextFillColor: i < 2 ? 'transparent' : undefined,
                  color: i < 2 ? undefined : 'var(--foreground)',
                }}
              >{char}</motion.span>
            ))}
          </span>
        </Link>

          {/* ── Page Nav ── */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`relative flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:block">{label}</span>
                  {isActive && (
                    <motion.div layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg ring-1 ring-primary/30 bg-primary/5"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

            {/* Role Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-muted border border-primary/20 hover:border-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <motion.span
                    animate={currentRole === 'admin' ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
                    transition={currentRole === 'admin' ? { duration: 1.6, repeat: Infinity } : {}}
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${currentRole === 'admin' ? 'bg-[#FFB347]' : 'bg-blue-400'}`}
                  />
                  <span className={`text-[11px] sm:text-xs font-bold tracking-wide ${currentRole === 'admin' ? 'text-[#FFB347]' : 'text-blue-300'}`}>
                    {currentRole === 'admin' ? 'ADMIN' : 'VIEWER'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end"
                className="bg-[#0D1117] border border-primary/20 text-foreground shadow-2xl shadow-black/60 min-w-[160px] p-1">
                <p className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Switch Role</p>
                <DropdownMenuSeparator className="bg-primary/10 my-1" />
                {(['viewer', 'admin'] as const).map(role => (
                  <DropdownMenuItem key={role} onClick={() => setRole(role)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all focus:outline-none ${
                      currentRole === role
                        ? role === 'admin' ? 'bg-[#FFB347]/10 text-[#FFB347] font-semibold' : 'bg-blue-400/10 text-blue-300 font-semibold'
                        : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground focus:bg-white/[0.05]'
                    }`}
                  >
                    {role === 'admin' ? <Zap className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{role === 'admin' ? 'Admin' : 'Viewer'}</span>
                    {currentRole === role && (
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        role === 'admin' ? 'bg-[#FFB347]/20 text-[#FFB347]' : 'bg-blue-400/20 text-blue-300'
                      }`}>ACTIVE</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Button */}
            <motion.button onClick={() => setSettingsOpen(true)}
              whileHover={{ scale: 1.05, rotate: 45 }} whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            {/* Quick theme toggle button in navbar */}
            <motion.button onClick={toggleTheme}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-muted rounded-lg transition-colors hidden sm:flex"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark'
                  ? <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  : <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                }
              </AnimatePresence>
            </motion.button>

            {/* Auth Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0D1117] border border-primary/20 text-foreground shadow-xl shadow-black/40">
                {isSignedIn ? (
                  <>
                    <DropdownMenuItem className="cursor-default text-muted-foreground text-xs focus:bg-white/[0.05]">Signed in</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary/10" />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                      <SignOutButton><button className="w-full text-left text-sm">Sign out</button></SignOutButton>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="focus:bg-white/[0.05] focus:text-foreground cursor-pointer text-foreground">
                      <SignInButton><button className="w-full text-left text-sm">Sign in</button></SignInButton>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer text-muted-foreground">
                      <SignUpButton><button className="w-full text-left text-sm">Sign up</button></SignUpButton>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </motion.header>

      {/* ── Settings Side Panel ── */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" />

            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 h-full z-[70] w-[300px] sm:w-[320px] glassmorphic border-l border-primary/20 shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Settings</h2>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 custom-scrollbar">

                {/* ── Theme ── */}
                <section className="space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Appearance</p>
                  <div className="flex gap-2">
                    {(['dark', 'light'] as const).map(t => (
                      <button key={t} onClick={() => { if (theme !== t) toggleTheme(); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          theme === t ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {t === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                        {t === 'dark' ? 'Dark' : 'Light'}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="border-t border-primary/10" />

                {/* ── Role ── */}
                <section className="space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Access Role</p>
                  <div className="flex gap-2">
                    {(['viewer', 'admin'] as const).map(role => (
                      <button key={role} onClick={() => setRole(role)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          currentRole === role
                            ? role === 'admin' ? 'bg-[#FFB347]/15 border-[#FFB347]/40 text-[#FFB347]' : 'bg-blue-400/10 border-blue-400/40 text-blue-300'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {role === 'admin' ? <Zap className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {role === 'admin' ? 'Admin' : 'Viewer'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {currentRole === 'admin' ? '⚡ Admin can add & manage transactions.' : '👁 Viewer has read-only access.'}
                  </p>
                </section>

                <div className="border-t border-primary/10" />

                {/* ── Currency ── */}
                <section className="space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Currency Display</p>
                  <div className="flex gap-2">
                    {(['INR', 'USD'] as Currency[]).map(c => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          currency === c ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {c === 'INR' ? '₹ INR' : '$ USD'}
                      </button>
                    ))}
                  </div>
                  {currency === 'USD' && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                      {rateLoading
                        ? '⏳ Fetching live rate…'
                        : `💱 Live rate: 1 INR = $${usdRate.toFixed(5)}`}
                    </p>
                  )}
                </section>

                <div className="border-t border-primary/10" />

                {/* ── Date Format ── */}
                <section className="space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Date Format</p>
                  <div className="flex gap-2">
                    {(['DD/MM/YYYY', 'MM/DD/YYYY'] as DateFmt[]).map(f => (
                      <button key={f} onClick={() => setDateFormat(f)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                          dateFormat === f ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="border-t border-primary/10" />

                {/* ── Compact Mode ── */}



                {/* About */}
                <section className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">About</p>
                  <p className="text-xs text-muted-foreground">Finora v1.0.0 — Personal Finance Dashboard</p>
                  <p className="text-xs text-muted-foreground">Built with Next.js · Recharts · Tailwind CSS</p>
                </section>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-primary/10">
                <button onClick={() => setSettingsOpen(false)}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
                  Close
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
