import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { adminStaggerContainer } from '@/components/admin/shared/admin-analytics-ui'
import { cn } from '@/lib/utils'

interface AdminDashboardShellProps {
  children: ReactNode
  className?: string
}

export function AdminDashboardShell({ children, className }: AdminDashboardShellProps) {
  return (
    <motion.div
      className={cn('admin-dashboard-page', className)}
      variants={adminStaggerContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}
