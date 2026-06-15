export type GrievanceTicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'waiting_for_user'
  | 'resolved'
  | 'closed'
  | 'escalated'
  | 'reopened'

export type GrievancePriority = 'low' | 'medium' | 'high' | 'critical'

export type GrievanceCategory =
  | 'pension_not_received'
  | 'wrong_pension_amount'
  | 'recovery_related'
  | 'verification_issue'
  | 'login_problem'
  | 'document_issue'
  | 'suspension_related'
  | 'family_pension'
  | 'account_activation'
  | 'general_inquiry'

export type EscalationLevel = 1 | 2 | 3

export type GrievanceTimelineEventType =
  | 'ticket_created'
  | 'comment_added'
  | 'document_uploaded'
  | 'status_changed'
  | 'resolution_added'
  | 'escalation'
  | 'ticket_assigned'
  | 'ticket_closed'
  | 'resolution_accepted'
  | 'resolution_rejected'

export type GrievanceAuditAction =
  | 'ticket_created'
  | 'ticket_assigned'
  | 'status_changed'
  | 'resolution_added'
  | 'escalation_triggered'
  | 'ticket_closed'
  | 'comment_added'
  | 'document_uploaded'

export type GrievanceNotificationChannel = 'sms' | 'email' | 'portal'

export interface GrievanceAttachment {
  id: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
  sizeKb?: number
}

export interface GrievanceComment {
  id: string
  author: string
  authorRole: string
  message: string
  timestamp: string
  isInternal?: boolean
}

export interface GrievanceResolution {
  notes: string
  rootCause: string
  correctiveAction: string
  resolutionDate: string
  resolvedBy: string
  attachmentIds?: string[]
}

export interface GrievanceTimelineEvent {
  id: string
  type: GrievanceTimelineEventType
  title: string
  description?: string
  actor?: string
  timestamp: string
  oldStatus?: GrievanceTicketStatus
  newStatus?: GrievanceTicketStatus
}

export interface GrievanceAuditEntry {
  id: string
  ticketId: string
  user: string
  action: GrievanceAuditAction
  timestamp: string
  oldStatus?: GrievanceTicketStatus
  newStatus?: GrievanceTicketStatus
  remarks?: string
}

export interface GrievanceTicket {
  id: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  contactNumber: string
  category: GrievanceCategory
  priority: GrievancePriority
  subject: string
  description: string
  status: GrievanceTicketStatus
  assignedTo?: string
  assignedToName?: string
  escalationLevel: EscalationLevel
  slaDueAt: string
  slaBreached: boolean
  createdAt: string
  updatedAt: string
  attachments: GrievanceAttachment[]
  comments: GrievanceComment[]
  timeline: GrievanceTimelineEvent[]
  resolution?: GrievanceResolution
  resolutionAccepted?: boolean
  resolutionRejectedAt?: string
  resolutionRejectionReason?: string
}

export interface GrievanceDashboardStats {
  openTickets: number
  assignedTickets: number
  inProgressTickets: number
  escalatedTickets: number
  resolvedTickets: number
  closedTickets: number
  waitingForUser: number
  slaBreached: number
  avgResolutionHours: number
  totalTickets: number
}

export interface GrievanceCategoryChartItem {
  category: GrievanceCategory
  label: string
  count: number
}

export interface GrievancePriorityChartItem {
  priority: GrievancePriority
  label: string
  count: number
}

export interface GrievanceResolutionTrendItem {
  month: string
  resolved: number
  closed: number
  escalated: number
}

export interface GrievanceSlaReportItem {
  priority: GrievancePriority
  label: string
  total: number
  withinSla: number
  breached: number
  complianceRate: number
}

export interface GrievanceOpenTicketsReportItem {
  id: string
  subject: string
  category: string
  priority: GrievancePriority
  status: GrievanceTicketStatus
  assignedTo?: string
  createdAt: string
  slaDueAt: string
  slaBreached: boolean
  daysOpen: number
}

export interface GrievanceResolutionTimeReportItem {
  id: string
  subject: string
  category: string
  priority: GrievancePriority
  createdAt: string
  resolvedAt: string
  resolutionHours: number
  withinSla: boolean
}

export interface HelpdeskOfficer {
  id: string
  name: string
  email: string
  department: string
  activeTickets: number
}

export interface CreateGrievanceTicketInput {
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  contactNumber: string
  category: GrievanceCategory
  priority: GrievancePriority
  subject: string
  description: string
  attachmentNames?: string[]
}

export interface AssignGrievanceTicketInput {
  ticketId: string
  officerId: string
  officerName: string
  assignedBy: string
}

export interface UpdateGrievanceStatusInput {
  ticketId: string
  status: GrievanceTicketStatus
  updatedBy: string
  remarks?: string
}

export interface ResolveGrievanceTicketInput {
  ticketId: string
  notes: string
  rootCause: string
  correctiveAction: string
  resolvedBy: string
  attachmentNames?: string[]
}

export interface EscalateGrievanceTicketInput {
  ticketId: string
  escalatedBy: string
  reason: string
}

export interface AddGrievanceCommentInput {
  ticketId: string
  author: string
  authorRole: string
  message: string
  isInternal?: boolean
}

export interface GrievanceNotification {
  id: string
  ticketId: string
  channel: GrievanceNotificationChannel
  recipient: string
  subject: string
  message: string
  sentAt: string
}
