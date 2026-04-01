import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { RoleProvider } from '@/lib/roleContext'
import { TransactionProvider } from '@/lib/transactionContext'
import { SettingsProvider } from '@/lib/settingsContext'
import { Navbar } from '@/components/dashboard/Navbar'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Finora — Personal Finance Dashboard',
  description: 'Track income, expenses, and spending patterns with a premium dashboard.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // No hard-coded 'dark' — SettingsProvider adds the right class to <html>
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <ClerkProvider>
          <SettingsProvider>
            <RoleProvider>
              <TransactionProvider>
                <Navbar />
                <main className="max-w-[1440px] mx-auto pb-12">
                  {children}
                </main>
                <Toaster richColors position="top-right" />
              </TransactionProvider>
            </RoleProvider>
          </SettingsProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
