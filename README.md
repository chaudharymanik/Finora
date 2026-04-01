# 💰 Finora — Personal Finance Dashboard

<div align="center">

**A fully interactive personal finance dashboard built as a frontend developer assignment submission.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge)
![Recharts](https://img.shields.io/badge/Charts-Recharts-FF6384?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Animations-Framer_Motion-EF4444?style=for-the-badge)

</div>

---


## 📋 Assignment Requirements Coverage

| Requirement | Status | Implementation |
|---|---|---|
| Summary cards (Balance, Income, Expenses) | ✅ | 5 animated KPI cards with live currency |
| Time-based visualization | ✅ | 3M / 6M balance trend chart (bar + area) |
| Categorical visualization | ✅ | Animated spending breakdown donut chart |
| Transaction list with date, amount, category, type | ✅ | Full paginated transaction table |
| Filtering | ✅ | Filter by type, category, status, date range |
| Sorting & Search | ✅ | Sort by date/amount + full-text search |
| Role-based UI (Admin / Viewer) | ✅ | Role switcher in navbar — Admin adds/edits, Viewer is read-only |
| Insights section | ✅ | Top spend category, monthly comparison, smart alerts |
| State management | ✅ | React Context for transactions, filters, role & settings |
| Responsive design | ✅ | Mobile, tablet, and desktop layouts |
| Empty / no data handling | ✅ | Graceful empty states throughout |
| **Optional** — Dark mode | ✅ | Full dark / light mode toggle |
| **Optional** — Data persistence | ✅ | LocalStorage for transactions and all settings |
| **Optional** — Export functionality | ✅ | One-click CSV and JSON export |
| **Optional** — Animations & transitions | ✅ | Framer Motion throughout |
| **Optional** — Live currency conversion | ✅ | Real-time INR ↔ USD via open exchange rate API |

---

## 📸 Overview

Finora allows users to track and understand their financial activity through a clean, role-aware interface:

- **5 KPI Cards** — Total Balance, Income, Expenses, Savings Rate, Avg Monthly Expense
- **Balance Trend Chart** — 3M / 6M toggle, grouped bar + area chart with live tooltips
- **Spending Breakdown** — Animated donut chart with hover-highlight and ranked legend
- **Transaction Management** — Full CRUD with search, filters, sorting, pagination, and export
- **Insights Panel** — Smart observations, monthly comparison, and highest spend category
- **Role-Based UI** — Admin vs Viewer modes with a simple toggle in the navbar
- **Live Currency Toggle** — Instantly convert all values between ₹ INR and $ USD
- **Theme Toggle** — Full dark and light mode with persisted preference

---

## 🗂 Approach & Design Decisions

### State Management
All application state is managed using **React Context** split into three focused providers:

| Context | Responsibility |
|---|---|
| `TransactionContext` | All transaction data, CRUD operations, persisted via localStorage |
| `SettingsContext` | Theme, currency, date format — all persisted via localStorage |
| `RoleContext` | Current role (Admin / Viewer), drives UI permission gates |

This approach was chosen over Redux or Zustand to keep the project lightweight and dependency-free while still being clean and scalable.

### Role-Based UI
Roles are simulated entirely on the frontend via a toggle in the navbar:
- **Viewer** — can only read data; all action buttons are hidden
- **Admin** — full access to add transactions, change statuses, and export data

### Data
All data is generated from realistic mock seed functions in `lib/mockData.ts`, spanning 6 months of transactions across multiple categories. No backend or database is required.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A free [Clerk](https://clerk.com) account for authentication keys

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/finora.git
cd finora
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> Get your keys from [clerk.com](https://clerk.com) → Create application → API Keys

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> For a production build: `npm run build && npm run start`

---

## ✨ Features

### 🏠 Overview Dashboard
- **5 KPI Cards** — Total Balance, Income, Expenses, Savings Rate, Avg Monthly Expense
- Animated count-up numbers with currency-aware display
- **Balance Trend Chart** — 3M / 6M toggle, grouped bar + line chart with live tooltips
- **Spending Breakdown** — Animated donut chart with hover-to-highlight and ranked legend
- **Recent Activity** — Last 5 transactions with status badges
- **Spending by Category** — Ranked progress bars per category

### 💳 Transactions
- Full data table with **search**, **type filter**, **category filter**, **status filter**
- **Sort** by Date or Amount (asc / desc)
- **Pagination** — 10 rows per page
- **Add Transaction** (Admin only) — modal form with dynamic category selection
- **Status management** — click pending badge to approve or cancel
- **Export** — one-click CSV and JSON download
- Fully **responsive** across all screen sizes

### 📊 Insights
- 4 stat cards — Savings Rate, Top Category, Total Income, Avg Monthly
- **Smart Alerts** — 5 AI-style observations (warning / info / success) with currency-aware metrics
- **Monthly Comparison Table** — 6-month history with income, expenses, net balance, savings %
- **Last 3 Months Cards** — Quick-glance breakdown

### ⚙️ Settings
| Setting | Options |
|---|---|
| Theme | 🌙 Dark / ☀️ Light |
| Currency | ₹ INR / $ USD (live exchange rate) |
| Date Format | DD/MM/YYYY / MM/DD/YYYY |

All settings persist to localStorage across sessions.

### 🔐 Authentication & Roles
- **Clerk** authentication — Sign In / Sign Up / Sign Out
- **Role toggle** in navbar — Viewer (read-only) or Admin (full access)
- Middleware guards all dashboard routes

---

## 💱 Live Currency Conversion

When USD is selected, Finora fetches the live INR → USD exchange rate from:

```
https://open.er-api.com/v6/latest/INR
```

- **No API key required** — free open API
- Rate refreshes every **10 minutes** automatically
- Falls back to `0.012` if the API is unavailable
- Every amount across the entire app converts in real-time

---

## 🏗 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.7.3 |
| Styling | Tailwind CSS | v4.2 |
| Animations | Framer Motion | 11 |
| Charts | Recharts | 2.15 |
| Auth | Clerk | 7 |
| Icons | Lucide React | 0.564 |
| UI Primitives | Radix UI | various |
| Notifications | Sonner | 1.7 |

---

## 📁 Project Structure

```
finora/
├── app/
│   ├── globals.css              # Theme variables (dark + light mode)
│   ├── layout.tsx               # Root layout — providers, navbar
│   ├── page.tsx                 # / Overview page
│   ├── transactions/
│   │   └── page.tsx             # /transactions
│   └── insights/
│       └── page.tsx             # /insights
│
├── components/
│   └── dashboard/
│       ├── Navbar.tsx           # Top nav + settings panel + role toggle
│       ├── KPIStrip.tsx         # Row of 5 KPI cards
│       ├── KPICounter.tsx       # Animated count-up card (currency-aware)
│       ├── BalanceTrendChart.tsx # Recharts area+bar chart
│       ├── SpendingBreakdown.tsx # Donut chart + ranked legend
│       ├── TransactionTable.tsx # Full CRUD table with filters + pagination
│       └── InsightsPanel.tsx    # Smart insight alerts
│
├── lib/
│   ├── mockData.ts              # Data models + seed data generators
│   ├── transactionContext.tsx   # Global transaction state (React Context)
│   ├── settingsContext.tsx      # Theme / currency / date format (localStorage)
│   ├── roleContext.tsx          # Viewer / Admin role state
│   └── animations.ts           # Shared Framer Motion variants
│
├── proxy.ts                     # Clerk auth middleware
├── package.json
└── .env.local                   # Clerk keys (git-ignored)
```

---

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot-reload |
| `npm run build` | Build the optimised production bundle |
| `npm run start` | Start the production server (after build) |
| `npm run lint` | Run ESLint checks |

---

## 🌐 Deployment

Deployed on **Vercel**:

1. Push code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` as environment variables
4. Deploy — Vercel auto-runs `npm run build` and serves the result

---

## 📝 Notes

- **Mock Data** — Ships with realistic seed transactions spanning 6 months. No backend or database needed.
- **Extending** — Replace `lib/mockData.ts` generators with real API calls to connect a backend.
- **Clerk Keys** — `.env.local` is git-ignored. Never commit your secret key.

---

<div align="center">
  <strong>Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion</strong>
</div>
