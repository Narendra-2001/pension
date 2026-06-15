import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  className?: string
  iconClassName?: string
  delay?: number
}

export function StatCard({ title, value, icon: Icon, trend, className, iconClassName, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        className={cn(
          'group relative overflow-hidden border-border/60 py-0 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08),0_16px_32px_rgba(15,23,42,0.06)]',
          className,
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(ellipse_70%_50%_at_80%_-10%,rgba(59,130,246,0.1),transparent)]"
          aria-hidden
        />
        <CardContent className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
              {trend && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{trend}</p>
              )}
            </div>
            <div
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-icy-blue-100 to-sky-100 shadow-sm ring-1 ring-sky-200/60 transition-transform duration-300 group-hover:scale-105 dark:from-icy-blue-950/60 dark:to-sky-950/40 dark:ring-sky-800/40',
                iconClassName,
              )}
            >
              <Icon className="size-5 text-icy-blue-600 dark:text-icy-blue-400" strokeWidth={1.75} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="py-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="size-11 rounded-2xl" />
        </div>
      </CardContent>
    </Card>
  )
}
