export type AuditModule =
  | 'pensioners'
  | 'profile_updates'
  | 'verification'
  | 'suspensions'
  | 'recovery'
  | 'communication'
  | 'documents'
  | 'demise'
  | 'system'

export type AuditAction =
  | 'record_created'
  | 'record_updated'
  | 'status_changed'
  | 'approval_granted'
  | 'approval_rejected'
  | 'document_uploaded'
  | 'document_verified'
  | 'document_rejected'
  | 'notice_generated'
  | 'notice_sent'
  | 'notification_sent'
  | 'payment_recorded'
  | 'case_created'
  | 'case_closed'
  | 'user_login'
  | 'bulk_import'

export interface SystemAuditEntry {
  id: string
  module: AuditModule
  action: AuditAction
  entityType: string
  entityId: string
  entityLabel?: string
  oldValue?: string
  newValue?: string
  user: string
  userRole: string
  department?: string
  timestamp: string
  remarks?: string
  ipAddress?: string
}

export interface AuditLogFilters {
  module?: AuditModule | 'all'
  action?: AuditAction | 'all'
  search?: string
  user?: string
}

export interface AuditDashboardStats {
  totalLogs: number
  logsToday: number
  uniqueUsers: number
  modulesActive: number
  recentActivity: number
}

export interface AuditModuleChartItem {
  module: AuditModule
  label: string
  count: number
}

export interface AuditActionChartItem {
  action: AuditAction
  label: string
  count: number
}

export interface RecordAuditInput {
  module: AuditModule
  action: AuditAction
  entityType: string
  entityId: string
  entityLabel?: string
  oldValue?: string
  newValue?: string
  user: string
  userRole: string
  department?: string
  remarks?: string
  ipAddress?: string
}
