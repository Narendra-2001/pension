import { addLifeCertificateSubmission, isLifeCertificateResubmission } from '@/data/life-certificate-mock-data'
import {
  createGrievanceTicketApi,
  fetchGrievanceTicketsByPensioner,
} from '@/data/grievance-api'
import { getNoticesForPensioner } from '@/data/communication-mock-data'
import {
  clearLifeCertificateRejection,
  findPensionerById,
  formatCurrency,
  getDashboardSummary,
  getLifeCertStatus,
  getNotifications,
  getPensionerDocuments,
  getPensionerSettings,
  getPensionerVerificationRejection,
  getPensionerVerificationSchedule,
  getStatements,
  getVerificationHistory,
  markNotificationRead,
  setLifeCertStatus,
  setPensionerPassword,
  submitLifeCertificate,
  updatePensionerSettings,
} from '@/data/pensioner-mock-data'
import { fetchPensionerRecoverySummary } from '@/data/recovery-api'
import { ACTIVE_GRIEVANCE_STATUSES } from '@/lib/grievance'
import type { OfficialNotice } from '@/types/communication'
import type { GrievanceTicket } from '@/types/grievance'
import type {
  LifeCertStatus,
  NeftMonthlyChartPoint,
  PensionerDashboardSummary,
  PensionerDocument,
  PensionerNotification,
  PensionerSettings,
  PensionStatement,
  RecoveryCase,
  VerificationHistoryEntry,
} from '@/types/pensioner-portal'
import type { PensionerRecord } from '@/types/pensioner'
import type { LifeCertificateVerificationPayload } from '@/types/verification-submission'

export type PensionerRecoverySummary = NonNullable<Awaited<ReturnType<typeof fetchPensionerRecoverySummary>>>

export interface PensionerDashboardData {
  record: PensionerRecord
  summary: PensionerDashboardSummary
  lifeCertStatus: LifeCertStatus
  rejectionReason?: string
  recentStatements: PensionStatement[]
  pensionTrend: number[]
  neftMonthlyChart: NeftMonthlyChartPoint[]
  recentNotifications: PensionerNotification[]
  unreadNotificationCount: number
  openGrievances: GrievanceTicket[]
  verificationHistory: VerificationHistoryEntry[]
  recovery: PensionerRecoverySummary | null
}

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

function requirePensioner(pensionerId: string): PensionerRecord {
  const record = findPensionerById(pensionerId)
  if (!record) throw new Error('Pensioner not found')
  return record
}

function buildPensionTrend(statements: PensionStatement[]): number[] {
  if (statements.length === 0) return []
  return [...statements].reverse().slice(-8).map((statement) => statement.netPension)
}

function buildNeftMonthlyChart(statements: PensionStatement[]): NeftMonthlyChartPoint[] {
  return [...statements].reverse().map((statement) => ({
    month: statement.month.split(' ')[0]!.slice(0, 3),
    monthLabel: statement.month,
    netAmount: statement.netPension,
    grossPension: statement.grossPension,
    recoveryAmount: statement.recoveryAmount,
    deductions: statement.deductions,
    status: statement.status,
  }))
}

function enrichDashboardSummary(
  record: PensionerRecord,
  base: PensionerDashboardSummary,
  recovery: PensionerRecoverySummary | null,
): PensionerDashboardSummary {
  return {
    ...base,
    recoveryStatus: recovery
      ? `Active — ${formatCurrency(recovery.remainingBalance)} remaining`
      : 'No active recovery',
    familyPensionStatus: record.nominee
      ? `${record.nominee.relationship} — ${record.nominee.nomineeName}`
      : 'Not Applicable',
  }
}

export async function fetchPensionerProfile(pensionerId: string): Promise<PensionerRecord> {
  await delay()
  return requirePensioner(pensionerId)
}

export async function fetchPensionerDashboard(pensionerId: string): Promise<PensionerDashboardData> {
  await delay(600)
  const record = requirePensioner(pensionerId)
  const rejection = getPensionerVerificationRejection(pensionerId)
  const recovery = await fetchPensionerRecoverySummary(pensionerId)
  const baseSummary = getDashboardSummary(record)
  const allStatements = getStatements()
  const recentStatements = allStatements.slice(0, 6)
  const allNotifications = getNotifications()
  const grievanceTickets = await fetchGrievanceTicketsByPensioner(pensionerId)
  const openGrievances = grievanceTickets.filter((ticket) =>
    ACTIVE_GRIEVANCE_STATUSES.includes(ticket.status),
  )

  return {
    record,
    summary: enrichDashboardSummary(record, baseSummary, recovery),
    lifeCertStatus: getLifeCertStatus(pensionerId),
    rejectionReason: rejection?.reason,
    recentStatements,
    pensionTrend: buildPensionTrend(recentStatements),
    neftMonthlyChart: buildNeftMonthlyChart(allStatements),
    recentNotifications: allNotifications.slice(0, 5),
    unreadNotificationCount: allNotifications.filter((notification) => !notification.read).length,
    openGrievances: openGrievances.slice(0, 4),
    verificationHistory: getVerificationHistory(pensionerId).slice(0, 4),
    recovery,
  }
}

export async function fetchPensionStatements(): Promise<PensionStatement[]> {
  await delay()
  return getStatements()
}

export async function fetchRecoveryStatus(pensionerId: string): Promise<RecoveryCase | null> {
  await delay()
  return fetchPensionerRecoverySummary(pensionerId)
}

export async function fetchPensionerDocuments(pensionerId: string): Promise<PensionerDocument[]> {
  await delay()
  const record = requirePensioner(pensionerId)
  return getPensionerDocuments(record)
}

export async function fetchOfficialNotices(pensionerId: string): Promise<OfficialNotice[]> {
  await delay(350)
  return getNoticesForPensioner(pensionerId)
}

export async function fetchNotifications(): Promise<PensionerNotification[]> {
  await delay(400)
  return getNotifications()
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await delay(200)
  markNotificationRead(id)
}

export async function fetchGrievanceTickets(pensionerId?: string): Promise<GrievanceTicket[]> {
  await delay()
  if (pensionerId) return fetchGrievanceTicketsByPensioner(pensionerId)
  return fetchGrievanceTicketsByPensioner('PEN-DEMO-001')
}

/** @deprecated Use createGrievanceTicketApi from grievance-api directly */
export async function createGrievanceTicket(
  data: Parameters<typeof createGrievanceTicketApi>[0],
): Promise<GrievanceTicket> {
  return createGrievanceTicketApi(data)
}

export async function fetchVerificationData(pensionerId: string): Promise<{
  status: LifeCertStatus
  history: VerificationHistoryEntry[]
  lastVerificationDate?: string
  nextVerificationDueDate?: string
  rejectionReason?: string
  rejectedAt?: string
}> {
  await delay()
  const schedule = getPensionerVerificationSchedule(pensionerId)
  const rejection = getPensionerVerificationRejection(pensionerId)
  return {
    status: getLifeCertStatus(pensionerId),
    history: getVerificationHistory(pensionerId),
    lastVerificationDate: schedule?.lastVerificationDate,
    nextVerificationDueDate: schedule?.nextVerificationDueDate,
    rejectionReason: rejection?.reason,
    rejectedAt: rejection?.rejectedAt,
  }
}

export async function submitVerification(
  pensionerId: string,
  verification: LifeCertificateVerificationPayload,
): Promise<VerificationHistoryEntry> {
  await delay(1200)
  const isResubmission = isLifeCertificateResubmission(pensionerId)
  clearLifeCertificateRejection(pensionerId)
  const entry = submitLifeCertificate(pensionerId, isResubmission)
  addLifeCertificateSubmission(pensionerId, verification)
  return entry
}

export async function updateVerificationProgress(
  status: 'in_progress' | 'not_started',
  pensionerId: string,
): Promise<void> {
  await delay(200)
  setLifeCertStatus(pensionerId, status)
}

export { fetchDemiseReports, createDemiseReport } from '@/data/demise-api'

export async function fetchPensionerSettingsData(): Promise<PensionerSettings> {
  await delay(300)
  return getPensionerSettings()
}

export async function savePensionerSettings(
  settings: Partial<PensionerSettings>,
): Promise<PensionerSettings> {
  await delay(500)
  return updatePensionerSettings(settings)
}

export async function changePensionerPassword(
  ppoNumber: string,
  newPassword: string,
): Promise<void> {
  await delay(600)
  setPensionerPassword(ppoNumber, newPassword)
}

export async function sendActivationOtp(_mobile: string): Promise<void> {
  await delay(1500)
}

export async function verifyActivationOtp(_otp: string): Promise<boolean> {
  await delay(800)
  return true
}
