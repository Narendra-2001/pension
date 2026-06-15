import type { AuditAction, AuditModule } from '@/types/audit'

export const AUDIT_MODULE_LABELS: Record<AuditModule, string> = {
  pensioners: 'Pensioners',
  profile_updates: 'Profile Updates',
  verification: 'Verification',
  suspensions: 'Suspensions',
  recovery: 'Recovery',
  communication: 'Communication',
  documents: 'Documents',
  demise: 'Demise',
  system: 'System',
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  record_created: 'Record Created',
  record_updated: 'Record Updated',
  status_changed: 'Status Changed',
  approval_granted: 'Approval Granted',
  approval_rejected: 'Approval Rejected',
  document_uploaded: 'Document Uploaded',
  document_verified: 'Document Verified',
  document_rejected: 'Document Rejected',
  notice_generated: 'Notice Generated',
  notice_sent: 'Notice Sent',
  notification_sent: 'Notification Sent',
  payment_recorded: 'Payment Recorded',
  case_created: 'Case Created',
  case_closed: 'Case Closed',
  user_login: 'User Login',
  bulk_import: 'Bulk Import',
}

export const AUDIT_MODULE_COLORS: Record<AuditModule, string> = {
  pensioners: '#0ea5e9',
  profile_updates: '#8b5cf6',
  verification: '#10b981',
  suspensions: '#ef4444',
  recovery: '#f59e0b',
  communication: '#06b6d4',
  documents: '#6366f1',
  demise: '#ec4899',
  system: '#64748b',
}

export function formatAuditChange(oldValue?: string, newValue?: string): string {
  if (oldValue && newValue) return `${oldValue} → ${newValue}`
  if (newValue) return newValue
  if (oldValue) return oldValue
  return '—'
}
