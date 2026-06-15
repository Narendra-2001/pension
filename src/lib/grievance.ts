import type {
  EscalationLevel,
  GrievanceAuditAction,
  GrievanceCategory,
  GrievancePriority,
  GrievanceTicketStatus,
  GrievanceTimelineEventType,
} from '@/types/grievance'

export const GRIEVANCE_CATEGORY_LABELS: Record<GrievanceCategory, string> = {
  pension_not_received: 'Pension Not Received',
  wrong_pension_amount: 'Wrong Pension Amount',
  recovery_related: 'Recovery Related Issue',
  verification_issue: 'Verification Issue',
  login_problem: 'Login Problem',
  document_issue: 'Document Issue',
  suspension_related: 'Suspension Related Issue',
  family_pension: 'Family Pension Issue',
  account_activation: 'Account Activation Issue',
  general_inquiry: 'General Inquiry',
}

export const GRIEVANCE_STATUS_LABELS: Record<GrievanceTicketStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  waiting_for_user: 'Waiting For User',
  resolved: 'Resolved',
  closed: 'Closed',
  escalated: 'Escalated',
  reopened: 'Reopened',
}

export const GRIEVANCE_PRIORITY_LABELS: Record<GrievancePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const ESCALATION_LEVEL_LABELS: Record<EscalationLevel, string> = {
  1: 'Level 1 – Helpdesk Officer',
  2: 'Level 2 – Pension Admin',
  3: 'Level 3 – Super Admin',
}

export const GRIEVANCE_AUDIT_ACTION_LABELS: Record<GrievanceAuditAction, string> = {
  ticket_created: 'Ticket Created',
  ticket_assigned: 'Ticket Assigned',
  status_changed: 'Status Changed',
  resolution_added: 'Resolution Added',
  escalation_triggered: 'Escalation Triggered',
  ticket_closed: 'Ticket Closed',
  comment_added: 'Comment Added',
  document_uploaded: 'Document Uploaded',
}

export const GRIEVANCE_TIMELINE_TYPE_LABELS: Record<GrievanceTimelineEventType, string> = {
  ticket_created: 'Ticket Created',
  comment_added: 'Comment Added',
  document_uploaded: 'Document Uploaded',
  status_changed: 'Status Changed',
  resolution_added: 'Resolution Added',
  escalation: 'Escalation',
  ticket_assigned: 'Ticket Assigned',
  ticket_closed: 'Ticket Closed',
  resolution_accepted: 'Resolution Accepted',
  resolution_rejected: 'Resolution Rejected',
}

export const GRIEVANCE_CATEGORIES = Object.entries(GRIEVANCE_CATEGORY_LABELS).map(([value, label]) => ({
  value: value as GrievanceCategory,
  label,
}))

export const GRIEVANCE_PRIORITIES = Object.entries(GRIEVANCE_PRIORITY_LABELS).map(([value, label]) => ({
  value: value as GrievancePriority,
  label,
}))

export const SLA_HOURS_BY_PRIORITY: Record<GrievancePriority, number> = {
  low: 72,
  medium: 48,
  high: 24,
  critical: 8,
}

export function calculateSlaDueAt(priority: GrievancePriority, fromDate = new Date()): string {
  const hours = SLA_HOURS_BY_PRIORITY[priority]
  const due = new Date(fromDate.getTime() + hours * 60 * 60 * 1000)
  return due.toISOString()
}

export function isSlaBreached(slaDueAt: string, status: GrievanceTicketStatus): boolean {
  if (status === 'closed' || status === 'resolved') return false
  return new Date(slaDueAt) < new Date()
}

export function formatGrievanceDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function formatGrievanceDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function getDaysOpen(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
}

export function getResolutionHours(createdAt: string, resolvedAt: string): number {
  const created = new Date(createdAt)
  const resolved = new Date(resolvedAt)
  return Math.round((resolved.getTime() - created.getTime()) / (1000 * 60 * 60))
}

export const ACTIVE_GRIEVANCE_STATUSES: GrievanceTicketStatus[] = [
  'open',
  'assigned',
  'in_progress',
  'waiting_for_user',
  'escalated',
  'reopened',
]

export const HISTORY_GRIEVANCE_STATUSES: GrievanceTicketStatus[] = ['resolved', 'closed']
