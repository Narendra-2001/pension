import {
  createAutoSuspensionForLifeCert,
  createSuspensionCase,
  getActiveSuspensionForPensioner,
  getPendingRestorationCount,
  getRestorationRequestById,
  getRestorationRequests,
  getRestorationRequestsByPensioner,
  getSuspensionAuditLogs,
  getSuspensionCaseById,
  getSuspensionCases,
  getSuspensionCasesByPensioner,
  getSuspensionDashboardStats,
  processAdminRestorationAction,
  processAdminSuspensionAction,
  submitRestorationRequest,
} from '@/data/suspension-mock-data'
import type {
  AdminRestorationAction,
  AdminSuspensionAction,
  CreateRestorationRequestInput,
  CreateSuspensionCaseInput,
  RestorationRequest,
  SuspensionAuditEntry,
  SuspensionCase,
  SuspensionDashboardStats,
} from '@/types/suspension'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchSuspensionDashboardStats(): Promise<SuspensionDashboardStats> {
  await delay(300)
  return getSuspensionDashboardStats()
}

export async function fetchSuspensionCases(): Promise<SuspensionCase[]> {
  await delay()
  return getSuspensionCases()
}

export async function fetchSuspensionCase(id: string): Promise<SuspensionCase | null> {
  await delay()
  return getSuspensionCaseById(id) ?? null
}

export async function fetchPensionerSuspensionCases(pensionerId: string): Promise<SuspensionCase[]> {
  await delay()
  return getSuspensionCasesByPensioner(pensionerId)
}

export async function fetchPensionerActiveSuspension(pensionerId: string): Promise<SuspensionCase | null> {
  await delay(400)
  return getActiveSuspensionForPensioner(pensionerId) ?? null
}

export async function createAdminSuspensionCase(input: CreateSuspensionCaseInput): Promise<SuspensionCase> {
  await delay(800)
  return createSuspensionCase(input)
}

export async function fetchRestorationRequests(): Promise<RestorationRequest[]> {
  await delay()
  return getRestorationRequests()
}

export async function fetchRestorationRequest(id: string): Promise<RestorationRequest | null> {
  await delay()
  return getRestorationRequestById(id) ?? null
}

export async function fetchPensionerRestorationRequests(pensionerId: string): Promise<RestorationRequest[]> {
  await delay()
  return getRestorationRequestsByPensioner(pensionerId)
}

export async function fetchPendingRestorationCount(): Promise<number> {
  await delay(200)
  return getPendingRestorationCount()
}

export async function fetchSuspensionAuditLogs(suspensionCaseId: string): Promise<SuspensionAuditEntry[]> {
  await delay(300)
  return getSuspensionAuditLogs(suspensionCaseId)
}

export async function submitPensionerRestorationRequest(
  input: CreateRestorationRequestInput,
): Promise<RestorationRequest> {
  await delay(800)
  return submitRestorationRequest(input)
}

export async function adminProcessRestoration(
  requestId: string,
  action: AdminRestorationAction,
  remarks: string,
  adminName?: string,
): Promise<RestorationRequest> {
  await delay(700)
  return processAdminRestorationAction(requestId, action, remarks, adminName)
}

export async function adminProcessSuspension(
  caseId: string,
  action: AdminSuspensionAction,
  remarks: string,
  adminName?: string,
): Promise<SuspensionCase> {
  await delay(700)
  return processAdminSuspensionAction(caseId, action, remarks, adminName)
}

export async function triggerAutoSuspension(pensionerId: string): Promise<SuspensionCase | null> {
  await delay(600)
  return createAutoSuspensionForLifeCert(pensionerId)
}
