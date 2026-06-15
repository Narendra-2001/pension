import { Badge } from '@/components/ui/badge'
import { AUDIT_MODULE_COLORS, AUDIT_MODULE_LABELS } from '@/lib/audit'
import type { AuditModule } from '@/types/audit'
import { cn } from '@/lib/utils'

interface AuditModuleBadgeProps {
  module: AuditModule
  className?: string
}

export function AuditModuleBadge({ module, className }: AuditModuleBadgeProps) {
  const color = AUDIT_MODULE_COLORS[module]

  return (
    <Badge
      variant="outline"
      className={cn('border-transparent text-[10px] font-semibold uppercase tracking-wide', className)}
      style={{
        backgroundColor: `${color}18`,
        color,
      }}
    >
      {AUDIT_MODULE_LABELS[module]}
    </Badge>
  )
}
