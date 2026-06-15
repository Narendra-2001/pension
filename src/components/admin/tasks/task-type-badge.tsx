import {
  FileText,
  Heart,
  RotateCcw,
  Shield,
  UserCheck,
  UserPen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AdminTaskType } from '@/types/admin-task'
import { ADMIN_TASK_TYPE_LABELS } from '@/types/admin-task'

const TYPE_CONFIG: Record<
  AdminTaskType,
  { icon: LucideIcon; className: string }
> = {
  profile_update: {
    icon: UserPen,
    className: 'bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400',
  },
  life_certificate: {
    icon: Shield,
    className: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400',
  },
  activation: {
    icon: UserCheck,
    className: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
  },
  grievance: {
    icon: FileText,
    className: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400',
  },
  demise: {
    icon: Heart,
    className: 'bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-400',
  },
  restoration: {
    icon: RotateCcw,
    className: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400',
  },
}

export function TaskTypeBadge({ type }: { type: AdminTaskType }) {
  const config = TYPE_CONFIG[type]
  const Icon = config.icon
  return (
    <Badge variant="outline" className={cn('gap-1 font-medium whitespace-nowrap', config.className)}>
      <Icon className="size-3" />
      {ADMIN_TASK_TYPE_LABELS[type]}
    </Badge>
  )
}
