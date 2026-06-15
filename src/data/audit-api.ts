import {
  getAuditActionChart,
  getAuditDashboardStats,
  getAuditModuleChart,
  getSystemAuditLogById,
  getSystemAuditLogs,
} from '@/data/audit-mock-data'
import type { AuditLogFilters } from '@/types/audit'

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchAuditDashboardStats() {
  await delay(300)
  return getAuditDashboardStats()
}

export async function fetchAuditModuleChart() {
  await delay(300)
  return getAuditModuleChart()
}

export async function fetchAuditActionChart() {
  await delay(300)
  return getAuditActionChart()
}

export async function fetchSystemAuditLogs(filters?: AuditLogFilters) {
  await delay(400)
  return getSystemAuditLogs(filters)
}

export async function fetchSystemAuditLogById(id: string) {
  await delay(200)
  return getSystemAuditLogById(id)
}
