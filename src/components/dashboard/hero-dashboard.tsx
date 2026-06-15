import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Users,
} from 'lucide-react'

import { dashboardStats } from '@/data/mock-data'
import { cn } from '@/lib/utils'

const widgets = [
  {
    label: 'Total Pensioners',
    value: `${(dashboardStats.totalPensioners / 1000).toFixed(0)}K+`,
    icon: Users,
    color: 'from-icy-blue-50 to-white',
    iconColor: 'text-icy-blue-500',
    delay: 0,
  },
  {
    label: 'Pending Verification',
    value: dashboardStats.pendingVerification.toString(),
    icon: AlertTriangle,
    color: 'from-amber-50 to-white',
    iconColor: 'text-amber-500',
    delay: 0.2,
  },
  {
    label: 'Recovery Cases',
    value: dashboardStats.recoveryCases.toString(),
    icon: TrendingUp,
    color: 'from-icy-blue-50 to-white',
    iconColor: 'text-icy-blue-600',
    delay: 0.4,
  },
  {
    label: 'Monthly Collections',
    value: `₹${(dashboardStats.monthlyCollections / 100000).toFixed(1)}L`,
    icon: IndianRupee,
    color: 'from-green-50 to-white',
    iconColor: 'text-green-600',
    delay: 0.6,
  },
  {
    label: 'Suspended Accounts',
    value: dashboardStats.suspendedAccounts.toString(),
    icon: CheckCircle2,
    color: 'from-muted to-white',
    iconColor: 'text-muted-foreground',
    delay: 0.8,
  },
]

export function HeroDashboard() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-white p-1 shadow-2xl glow-blue"
        style={{ perspective: 1000 }}
      >
        <div className="rounded-[22px] bg-muted/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400/80" />
                <div className="size-3 rounded-full bg-yellow-400/80" />
                <div className="size-3 rounded-full bg-green-400/80" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                PensionFlow Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1">
              <div className="size-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs text-green-700">Live</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {widgets.map((widget) => (
              <motion.div
                key={widget.label}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4 + widget.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: widget.delay,
                }}
                className={cn(
                  'rounded-2xl border border-border bg-gradient-to-br p-4',
                  widget.color,
                )}
              >
                <widget.icon className={cn('mb-2 size-4', widget.iconColor)} />
                <p className="text-lg font-bold tracking-tight">{widget.value}</p>
                <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                  {widget.label}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white p-4 lg:col-span-2">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Monthly Recovery Trend
              </p>
              <div className="flex h-24 items-end gap-1.5">
                {[40, 55, 35, 70, 50, 85, 60, 90, 75, 95, 80, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.05 }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-icy-blue-600 to-icy-blue-400 opacity-80"
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Recent Activity
              </p>
              <div className="space-y-2">
                {['Life cert verified', 'Recovery approved', 'Payment processed'].map(
                  (item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="size-1.5 rounded-full bg-icy-blue-500" />
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 -top-4 rounded-2xl border border-icy-blue-200 bg-white px-4 py-3 shadow-xl"
      >
        <p className="text-xs text-muted-foreground">System Accuracy</p>
        <p className="text-xl font-bold text-icy-blue-600">99.9%</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-4 -left-4 rounded-2xl border border-border bg-white px-4 py-3 shadow-xl"
      >
        <p className="text-xs text-muted-foreground">Verified Today</p>
        <p className="text-xl font-bold text-green-600">+127</p>
      </motion.div>
    </div>
  )
}
