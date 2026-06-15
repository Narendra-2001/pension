import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileQuestion,
  HelpCircle,
  Lock,
  LogIn,
  RefreshCw,
  Shield,
  ShieldAlert,
  Users,
  Wallet,
} from 'lucide-react'

import { GRIEVANCE_CATEGORY_LABELS } from '@/lib/grievance'
import type { GrievanceCategory, GrievanceTicket, GrievanceTicketStatus } from '@/types/grievance'

interface CategoryVisual {
  icon: LucideIcon
  tone: string
  badge: string
}

const CATEGORY_VISUALS: Record<GrievanceCategory, CategoryVisual> = {
  pension_not_received: {
    icon: Wallet,
    tone: 'from-amber-500/[0.08] via-card to-orange-500/[0.05]',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  },
  wrong_pension_amount: {
    icon: AlertCircle,
    tone: 'from-rose-500/[0.08] via-card to-orange-500/[0.04]',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
  },
  recovery_related: {
    icon: RefreshCw,
    tone: 'from-violet-500/[0.08] via-card to-indigo-500/[0.04]',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
  },
  verification_issue: {
    icon: Shield,
    tone: 'from-sky-500/[0.08] via-card to-blue-500/[0.04]',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
  },
  login_problem: {
    icon: LogIn,
    tone: 'from-slate-500/[0.08] via-card to-zinc-500/[0.04]',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300',
  },
  document_issue: {
    icon: FileQuestion,
    tone: 'from-blue-500/[0.08] via-card to-cyan-500/[0.04]',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  },
  suspension_related: {
    icon: ShieldAlert,
    tone: 'from-red-500/[0.08] via-card to-rose-500/[0.04]',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  },
  family_pension: {
    icon: Users,
    tone: 'from-teal-500/[0.08] via-card to-emerald-500/[0.04]',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300',
  },
  account_activation: {
    icon: Lock,
    tone: 'from-indigo-500/[0.08] via-card to-violet-500/[0.04]',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300',
  },
  general_inquiry: {
    icon: HelpCircle,
    tone: 'from-primary/[0.06] via-card to-primary/[0.03]',
    badge: 'bg-muted text-foreground',
  },
}

export function getGrievanceCategoryVisual(category: GrievanceCategory) {
  return {
    ...CATEGORY_VISUALS[category],
    label: GRIEVANCE_CATEGORY_LABELS[category],
  }
}

const STATUS_STEPS: { key: GrievanceTicketStatus | 'closed'; label: string }[] = [
  { key: 'open', label: 'Submitted' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
]

const STATUS_ORDER: GrievanceTicketStatus[] = [
  'open',
  'assigned',
  'in_progress',
  'waiting_for_user',
  'resolved',
  'closed',
  'escalated',
  'reopened',
]

export function getTicketStatusStepIndex(status: GrievanceTicketStatus): number {
  if (status === 'closed') return 4
  if (status === 'resolved') return 3
  if (status === 'waiting_for_user') return 2
  if (status === 'in_progress' || status === 'escalated' || status === 'reopened') return 2
  if (status === 'assigned') return 1
  return 0
}

export function getTicketStatusSteps(currentStatus: GrievanceTicketStatus) {
  const currentIndex = getTicketStatusStepIndex(currentStatus)
  const isFullyClosed = currentStatus === 'closed'

  return STATUS_STEPS.map((step, index) => ({
    ...step,
    state: isFullyClosed
      ? 'complete'
      : index < currentIndex
        ? 'complete'
        : index === currentIndex
          ? 'current'
          : 'upcoming',
  })) as Array<(typeof STATUS_STEPS)[number] & { state: 'complete' | 'current' | 'upcoming' }>
}

export function getTicketStatusTone(status: GrievanceTicketStatus) {
  switch (status) {
    case 'closed':
      return {
        icon: CheckCircle2,
        label: 'Closed',
        banner: 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20',
        text: 'text-emerald-800 dark:text-emerald-200',
      }
    case 'resolved':
      return {
        icon: CheckCircle2,
        label: 'Awaiting your review',
        banner: 'border-sky-200/80 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/20',
        text: 'text-sky-800 dark:text-sky-200',
      }
    case 'escalated':
      return {
        icon: AlertCircle,
        label: 'Escalated',
        banner: 'border-red-200/80 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20',
        text: 'text-red-800 dark:text-red-200',
      }
    default:
      return {
        icon: Clock,
        label: 'In progress',
        banner: 'border-amber-200/80 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20',
        text: 'text-amber-800 dark:text-amber-200',
      }
  }
}

export function getTicketAgeDays(ticket: GrievanceTicket): number {
  const created = new Date(ticket.createdAt).getTime()
  const end = ticket.status === 'closed' ? new Date(ticket.updatedAt).getTime() : Date.now()
  return Math.max(1, Math.ceil((end - created) / (1000 * 60 * 60 * 24)))
}

export function isTicketTerminal(status: GrievanceTicketStatus) {
  return status === 'closed' || status === 'resolved'
}

export { STATUS_ORDER }
