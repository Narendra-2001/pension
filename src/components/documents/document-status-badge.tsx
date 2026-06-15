import { Badge } from '@/components/ui/badge'
import { DOCUMENT_STATUS_LABELS, documentStatusTone } from '@/lib/documents'
import type { DocumentVerificationStatus } from '@/types/documents'
import { cn } from '@/lib/utils'

const toneClasses: Record<ReturnType<typeof documentStatusTone>, string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  red: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
  blue: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
  slate: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  violet: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
}

interface DocumentStatusBadgeProps {
  status: DocumentVerificationStatus
  className?: string
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const tone = documentStatusTone(status)
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium capitalize', toneClasses[tone], className)}>
      {DOCUMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
