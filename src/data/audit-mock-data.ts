import type {
  AuditActionChartItem,
  AuditDashboardStats,
  AuditLogFilters,
  AuditModuleChartItem,
  RecordAuditInput,
  SystemAuditEntry,
} from '@/types/audit'
import { AUDIT_ACTION_LABELS, AUDIT_MODULE_LABELS } from '@/lib/audit'

let auditCounter = 48

function nowIso() {
  return new Date().toISOString()
}

function hoursAgo(hours: number) {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

function daysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function createAuditEntry(partial: Omit<SystemAuditEntry, 'id' | 'timestamp'> & { timestamp?: string }): SystemAuditEntry {
  return {
    ...partial,
    id: `AUD-SYS-${String(auditCounter++).padStart(5, '0')}`,
    timestamp: partial.timestamp ?? nowIso(),
  }
}

let auditLogs: SystemAuditEntry[] = [
  createAuditEntry({
    module: 'profile_updates',
    action: 'approval_granted',
    entityType: 'profile_update_request',
    entityId: 'PUR-2026-0012',
    entityLabel: 'PPO123456 — Mobile Number Update',
    oldValue: '+91 9876543210',
    newValue: '+91 9123456789',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: hoursAgo(1),
    remarks: 'Mobile number verified against Aadhaar records',
    ipAddress: '192.168.10.45',
  }),
  createAuditEntry({
    module: 'recovery',
    action: 'status_changed',
    entityType: 'recovery_case',
    entityId: 'REC-2026-0008',
    entityLabel: 'PPO789012 — Excess Pension Credit',
    oldValue: 'Pending Approval',
    newValue: 'Active Recovery',
    user: 'Kavitha Reddy',
    userRole: 'Accounts Officer',
    department: 'Finance Department',
    timestamp: hoursAgo(2),
    remarks: 'Recovery case approved by accounts and audit',
    ipAddress: '192.168.10.22',
  }),
  createAuditEntry({
    module: 'suspensions',
    action: 'case_created',
    entityType: 'suspension_case',
    entityId: 'SUS-2026-0004',
    entityLabel: 'PPO555001 — Geeta Verma',
    newValue: 'Suspended',
    user: 'Audit Officer',
    userRole: 'Audit Officer',
    department: 'Audit Bureau',
    timestamp: hoursAgo(3),
    remarks: 'Fraud case flagged by audit team',
    ipAddress: '192.168.10.88',
  }),
  createAuditEntry({
    module: 'documents',
    action: 'document_verified',
    entityType: 'document',
    entityId: 'DOC-2026-0034',
    entityLabel: 'Life Certificate — PPO123456',
    oldValue: 'Pending Verification',
    newValue: 'Verified',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: hoursAgo(4),
    remarks: 'Life certificate verified for FY 2025-26',
    ipAddress: '192.168.10.45',
  }),
  createAuditEntry({
    module: 'communication',
    action: 'notice_sent',
    entityType: 'notice',
    entityId: 'NTC-2026-0001',
    entityLabel: 'Life Certificate Reminder — PPO123456',
    newValue: 'Sent via SMS, Email, Portal',
    user: 'System',
    userRole: 'System',
    department: 'Automated',
    timestamp: hoursAgo(5),
    remarks: 'Life Certificate Reminder Notice dispatched',
  }),
  createAuditEntry({
    module: 'recovery',
    action: 'payment_recorded',
    entityType: 'recovery_case',
    entityId: 'REC-2026-0003',
    entityLabel: 'PPO456789 — Installment #3',
    oldValue: '₹12,000 outstanding',
    newValue: '₹8,000 outstanding',
    user: 'Rajesh Kumar',
    userRole: 'Recovery Officer',
    department: 'Recovery Cell',
    timestamp: hoursAgo(6),
    remarks: 'Installment payment of ₹4,000 recorded',
    ipAddress: '192.168.10.33',
  }),
  createAuditEntry({
    module: 'verification',
    action: 'status_changed',
    entityType: 'life_certificate',
    entityId: 'LC-2026-0089',
    entityLabel: 'PPO234567 — Ramesh Kumar Sharma',
    oldValue: 'Under Review',
    newValue: 'Approved',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: hoursAgo(8),
    remarks: 'Life certificate approved for current financial year',
    ipAddress: '192.168.10.45',
  }),
  createAuditEntry({
    module: 'pensioners',
    action: 'bulk_import',
    entityType: 'pensioner_batch',
    entityId: 'BATCH-2026-004',
    entityLabel: 'Bulk Import — 24 records',
    newValue: '24 pensioners imported',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: hoursAgo(10),
    remarks: 'CSV import completed — 24 valid, 2 duplicates skipped',
    ipAddress: '192.168.10.45',
  }),
  createAuditEntry({
    module: 'profile_updates',
    action: 'approval_rejected',
    entityType: 'profile_update_request',
    entityId: 'PUR-2026-0011',
    entityLabel: 'PPO345678 — Bank Account Update',
    oldValue: 'Pending Review',
    newValue: 'Rejected',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: hoursAgo(12),
    remarks: 'Cancelled cheque image does not match account number',
    ipAddress: '192.168.10.45',
  }),
  createAuditEntry({
    module: 'documents',
    action: 'document_rejected',
    entityType: 'document',
    entityId: 'DOC-2026-0028',
    entityLabel: 'Aadhaar Card — PPO567890',
    oldValue: 'Under Review',
    newValue: 'Rejected',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: hoursAgo(14),
    remarks: 'Blurred image — re-upload requested',
    ipAddress: '192.168.10.45',
  }),
  createAuditEntry({
    module: 'suspensions',
    action: 'status_changed',
    entityType: 'restoration_request',
    entityId: 'RST-2026-0002',
    entityLabel: 'PPO555001 — Restoration Request',
    oldValue: 'Pending Review',
    newValue: 'Approved',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: hoursAgo(18),
    remarks: 'Life certificate submitted — pension restored',
    ipAddress: '192.168.10.45',
  }),
  createAuditEntry({
    module: 'communication',
    action: 'notification_sent',
    entityType: 'notification',
    entityId: 'NTF-2026-0042',
    entityLabel: 'Life Certificate Due — PPO123456',
    newValue: 'Delivered via SMS',
    user: 'System',
    userRole: 'System',
    department: 'Automated',
    timestamp: hoursAgo(20),
    remarks: 'Life Certificate Due reminder sent',
  }),
  createAuditEntry({
    module: 'recovery',
    action: 'case_created',
    entityType: 'recovery_case',
    entityId: 'REC-2026-0010',
    entityLabel: 'PPO901234 — Duplicate Disbursement',
    newValue: 'Draft',
    user: 'Rajesh Kumar',
    userRole: 'Recovery Officer',
    department: 'Recovery Cell',
    timestamp: daysAgo(1),
    remarks: 'Excess payment of ₹18,500 identified via reconciliation',
    ipAddress: '192.168.10.33',
  }),
  createAuditEntry({
    module: 'demise',
    action: 'record_created',
    entityType: 'demise_report',
    entityId: 'DEM-2026-0003',
    entityLabel: 'PPO678901 — Family Pension Initiated',
    newValue: 'Under Review',
    user: 'Ramesh Kumar Sharma',
    userRole: 'Pensioner',
    department: 'Citizen',
    timestamp: daysAgo(1),
    remarks: 'Demise reported with death certificate uploaded',
  }),
  createAuditEntry({
    module: 'pensioners',
    action: 'record_created',
    entityType: 'pensioner',
    entityId: 'PEN-2026-0156',
    entityLabel: 'PPO998877 — Sunita Devi',
    newValue: 'Pending Activation',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: daysAgo(2),
    remarks: 'New pensioner record created via manual entry',
    ipAddress: '192.168.10.45',
  }),
  createAuditEntry({
    module: 'system',
    action: 'user_login',
    entityType: 'session',
    entityId: 'SES-2026-8821',
    entityLabel: 'Dr. Anil Mehta',
    newValue: 'Authenticated',
    user: 'Dr. Anil Mehta',
    userRole: 'Audit Officer',
    department: 'Audit Bureau',
    timestamp: daysAgo(2),
    ipAddress: '192.168.10.88',
  }),
  createAuditEntry({
    module: 'recovery',
    action: 'case_closed',
    entityType: 'recovery_case',
    entityId: 'REC-2026-0001',
    entityLabel: 'PPO112233 — Full Recovery Complete',
    oldValue: 'Active Recovery',
    newValue: 'Closed',
    user: 'Kavitha Reddy',
    userRole: 'Accounts Officer',
    department: 'Finance Department',
    timestamp: daysAgo(3),
    remarks: 'Full excess amount of ₹24,000 recovered',
    ipAddress: '192.168.10.22',
  }),
  createAuditEntry({
    module: 'documents',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'DOC-2026-0041',
    entityLabel: 'Bank Passbook — PPO123456',
    newValue: 'Uploaded (v1)',
    user: 'Ramesh Kumar Sharma',
    userRole: 'Pensioner',
    department: 'Citizen',
    timestamp: daysAgo(3),
    remarks: 'Bank passbook uploaded via pensioner portal',
  }),
  createAuditEntry({
    module: 'communication',
    action: 'notice_generated',
    entityType: 'notice',
    entityId: 'NTC-2026-0005',
    entityLabel: 'Recovery Notice — PPO456789',
    newValue: 'Generated',
    user: 'Rajesh Kumar',
    userRole: 'Recovery Officer',
    department: 'Recovery Cell',
    timestamp: daysAgo(4),
    remarks: 'Recovery Notice generated for installment default',
    ipAddress: '192.168.10.33',
  }),
  createAuditEntry({
    module: 'verification',
    action: 'status_changed',
    entityType: 'life_certificate',
    entityId: 'LC-2026-0075',
    entityLabel: 'PPO445566 — Anita Singh',
    oldValue: 'Submitted',
    newValue: 'Rejected',
    user: 'Pension Administrator',
    userRole: 'Pension Admin',
    department: 'Pension Authority',
    timestamp: daysAgo(5),
    remarks: 'Signature mismatch with records on file',
    ipAddress: '192.168.10.45',
  }),
]

export function recordSystemAuditLog(input: RecordAuditInput): SystemAuditEntry {
  const entry = createAuditEntry({
    ...input,
    timestamp: nowIso(),
    ipAddress: input.ipAddress ?? '192.168.10.1',
  })
  auditLogs = [entry, ...auditLogs]
  return entry
}

export function getSystemAuditLogs(filters?: AuditLogFilters): SystemAuditEntry[] {
  let result = [...auditLogs]

  if (filters?.module && filters.module !== 'all') {
    result = result.filter((e) => e.module === filters.module)
  }

  if (filters?.action && filters.action !== 'all') {
    result = result.filter((e) => e.action === filters.action)
  }

  if (filters?.user) {
    const q = filters.user.toLowerCase()
    result = result.filter((e) => e.user.toLowerCase().includes(q))
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (e) =>
        e.entityId.toLowerCase().includes(q) ||
        e.entityLabel?.toLowerCase().includes(q) ||
        e.remarks?.toLowerCase().includes(q) ||
        e.oldValue?.toLowerCase().includes(q) ||
        e.newValue?.toLowerCase().includes(q),
    )
  }

  return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getSystemAuditLogById(id: string): SystemAuditEntry | undefined {
  return auditLogs.find((e) => e.id === id)
}

export function getAuditDashboardStats(): AuditDashboardStats {
  const today = new Date().toISOString().split('T')[0]
  const logsToday = auditLogs.filter((e) => e.timestamp.startsWith(today)).length
  const uniqueUsers = new Set(auditLogs.map((e) => e.user)).size
  const modulesActive = new Set(auditLogs.map((e) => e.module)).size
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  const recentActivity = auditLogs.filter((e) => new Date(e.timestamp).getTime() > dayAgo).length

  return {
    totalLogs: auditLogs.length,
    logsToday,
    uniqueUsers,
    modulesActive,
    recentActivity,
  }
}

export function getAuditModuleChart(): AuditModuleChartItem[] {
  const counts = new Map<string, number>()
  for (const entry of auditLogs) {
    counts.set(entry.module, (counts.get(entry.module) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([module, count]) => ({
      module: module as AuditModuleChartItem['module'],
      label: AUDIT_MODULE_LABELS[module as AuditModuleChartItem['module']],
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

export function getAuditActionChart(): AuditActionChartItem[] {
  const counts = new Map<string, number>()
  for (const entry of auditLogs) {
    counts.set(entry.action, (counts.get(entry.action) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([action, count]) => ({
      action: action as AuditActionChartItem['action'],
      label: AUDIT_ACTION_LABELS[action as AuditActionChartItem['action']],
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}
