import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { ChevronRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  delay?: number
  className?: string
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  delay = 0,
  className,
}: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Link
        to={href}
        className={cn(
          'group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08),0_16px_32px_rgba(15,23,42,0.06)]',
          className,
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(ellipse_60%_50%_at_0%_-20%,rgba(59,130,246,0.1),transparent)]"
          aria-hidden
        />
        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-icy-blue-600 text-white shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">
            {title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <ChevronRight className="relative size-4 shrink-0 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>
    </motion.div>
  )
}
