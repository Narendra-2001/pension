import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  RotateCcw,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { fetchDashboardData } from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { label: 'Overview', icon: TrendingUp },
  { label: 'Pensioners', icon: Users },
  { label: 'Recovery', icon: RotateCcw },
  { label: 'Verification', icon: CheckCircle2 },
]

export function DashboardPreviewPage() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-preview'],
    queryFn: fetchDashboardData,
  })

  const filteredPensioners = data?.pensioners.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.pensionId.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-svh bg-regal-navy-950">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-icy-blue-500 to-regal-navy-600">
              <span className="text-xs font-bold text-white">PF</span>
            </div>
            <div>
              <p className="text-sm font-bold">PensionFlow AI</p>
              <p className="text-xs text-bright-snow-400">Interactive Demo</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1">
            <div className="size-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs text-green-400">Live Demo</span>
          </div>
          <Button className="rounded-xl bg-icy-blue-500" asChild>
            <Link to="/register">Start Free Trial</Link>
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-white/5 p-4 lg:block">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveNav(item.label)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  activeNav === item.label
                    ? 'bg-icy-blue-500/20 text-icy-blue-300'
                    : 'text-bright-snow-400 hover:bg-white/5 hover:text-foreground',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-bright-snow-400">
              Loading dashboard...
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: 'Total Pensioners', value: '50,000', icon: Users },
                  { label: 'Pending Verification', value: data?.stats.pendingVerification, icon: AlertTriangle },
                  { label: 'Recovery Cases', value: data?.stats.recoveryCases, icon: RotateCcw },
                  {
                    label: 'Monthly Collections',
                    value: `₹${((data?.stats.monthlyCollections ?? 0) / 100000).toFixed(1)}L`,
                    icon: IndianRupee,
                  },
                  { label: 'Suspended', value: data?.stats.suspendedAccounts, icon: AlertTriangle },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-white/5 bg-regal-navy-900/60 p-4"
                  >
                    <stat.icon className="mb-2 size-4 text-icy-blue-400" />
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-bright-snow-400">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bright-snow-400" />
                  <Input
                    placeholder="Search pensioners..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-xl border-white/10 bg-regal-navy-900/60 pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-regal-navy-900/60 p-6">
                  <h3 className="mb-4 text-sm font-semibold">Recent Pensioners</h3>
                  <div className="space-y-3">
                    {filteredPensioners?.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-regal-navy-800/50 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-bright-snow-400">{p.pensionId}</p>
                        </div>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs capitalize',
                            p.status === 'verified' && 'bg-green-500/10 text-green-400',
                            p.status === 'pending' && 'bg-yellow-500/10 text-yellow-400',
                            p.status === 'suspended' && 'bg-red-500/10 text-red-400',
                          )}
                        >
                          {p.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-regal-navy-900/60 p-6">
                  <h3 className="mb-4 text-sm font-semibold">Recovery Cases</h3>
                  <div className="space-y-3">
                    {data?.recoveryCases.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-regal-navy-800/50 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{c.pensionerName}</p>
                          <p className="text-xs text-bright-snow-400">{c.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-icy-blue-300">
                            ₹{(c.excessAmount / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs capitalize text-bright-snow-400">{c.status}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
