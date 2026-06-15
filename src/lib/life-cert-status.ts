import type { LifeCertStatus } from '@/types/pensioner-portal'

const DISPLAY_LABELS: Record<LifeCertStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'In Progress',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function getLifeCertDisplayLabel(status: LifeCertStatus): string {
  return DISPLAY_LABELS[status] ?? status
}

export function isPendingAdminReview(status: LifeCertStatus): boolean {
  return status === 'submitted'
}

export function canStartLifeCertificate(status: LifeCertStatus, wizardActive = false): boolean {
  if (wizardActive) return false
  if (status === 'submitted' || status === 'approved') return false
  return status === 'not_started' || status === 'rejected' || status === 'in_progress'
}

export function shouldShowResubmitAction(
  status: LifeCertStatus,
  wizardActive: boolean,
  rejectionReason?: string,
): boolean {
  if (wizardActive) return false
  if (status === 'submitted' || status === 'approved') return false
  return status === 'rejected' || !!rejectionReason || status === 'not_started' || status === 'in_progress'
}
