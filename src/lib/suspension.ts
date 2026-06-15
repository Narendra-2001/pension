import type {
  RestorationRequestStatus,
  SuspensionCaseStatus,
  SuspensionSource,
  SuspensionTriggerType,
} from '@/types/suspension'

export const TRIGGER_TYPE_LABELS: Record<SuspensionTriggerType, string> = {
  no_verification: 'No Verification',
  fraud: 'Fraud',
  duplicate: 'Duplicate',
  invalid_documents: 'Invalid Documents',
  deceased: 'Deceased',
  administrative_hold: 'Administrative Hold',
  other: 'Other',
}

export const SUSPENSION_STATUS_LABELS: Record<SuspensionCaseStatus, string> = {
  suspended: 'Suspended',
  restoration_pending: 'Restoration Pending',
  restored: 'Restored',
  rejected: 'Rejected',
}

export const RESTORATION_STATUS_LABELS: Record<RestorationRequestStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const SUSPENSION_SOURCE_LABELS: Record<SuspensionSource, string> = {
  automatic: 'Automatic',
  manual: 'Manual',
}

export const SUSPENSION_REASONS: Record<SuspensionTriggerType, string> = {
  no_verification: 'Life Certificate Not Submitted',
  fraud: 'Fraud Detected',
  duplicate: 'Duplicate Pension Record Found',
  invalid_documents: 'Invalid Documents',
  deceased: 'Deceased Pensioner',
  administrative_hold: 'Administrative Action',
  other: 'Other Compliance Issues',
}

export function getDefaultSuspensionReason(triggerType: SuspensionTriggerType): string {
  return SUSPENSION_REASONS[triggerType]
}

export type RestorationStatusStepState = 'complete' | 'current' | 'upcoming'

export interface RestorationStatusStep {
  key: string
  label: string
  state: RestorationStatusStepState
}

export function getRestorationStatusSteps(
  status: RestorationRequestStatus,
): RestorationStatusStep[] {
  const decisionLabel =
    status === 'rejected' ? 'Rejected' : status === 'approved' ? 'Approved' : 'Decision'

  const steps: RestorationStatusStep[] = [
    { key: 'submitted', label: 'Submitted', state: 'upcoming' },
    { key: 'under_review', label: 'Under Review', state: 'upcoming' },
    { key: 'decision', label: decisionLabel, state: 'upcoming' },
  ]

  if (status === 'submitted') {
    steps[0]!.state = 'current'
    return steps
  }

  steps[0]!.state = 'complete'

  if (status === 'under_review') {
    steps[1]!.state = 'current'
    return steps
  }

  steps[1]!.state = 'complete'
  steps[2]!.state = status === 'approved' || status === 'rejected' ? 'complete' : 'current'
  return steps
}

export function getRestorationStatusTone(status: RestorationRequestStatus) {
  switch (status) {
    case 'approved':
      return {
        hero: 'from-emerald-500/[0.07] via-card to-emerald-500/[0.03]',
        badge: 'border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      }
    case 'rejected':
      return {
        hero: 'from-rose-500/[0.07] via-card to-rose-500/[0.03]',
        badge: 'border-rose-200/60 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300',
      }
    case 'under_review':
      return {
        hero: 'from-violet-500/[0.07] via-card to-violet-500/[0.03]',
        badge: 'border-violet-200/60 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300',
      }
    default:
      return {
        hero: 'from-sky-500/[0.07] via-card to-sky-500/[0.03]',
        badge: 'border-sky-200/60 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300',
      }
  }
}
