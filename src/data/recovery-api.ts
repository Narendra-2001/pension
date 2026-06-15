import {
  closeRecoveryCase,
  configureInstallments,
  createRecoveryCase,
  getApprovedExcessCases,
  getCalculationBreakdown,
  getExcessCaseById,
  getMonthlyRecoveryCollection,
  getOutstandingByDepartment,
  getPensionerRecoverySummary,
  getRecoveryAuditLogs,
  getRecoveryCaseById,
  getRecoveryCases,
  getRecoveryCasesByDepartment,
  getRecoveryCasesByPensioner,
  getRecoveryCollectionTrend,
  getRecoveryDashboardStats,
  getRecoveryFinancialOverview,
  getRecoveryStatusChart,
  processRecoveryApproval,
  recordRecoveryPayment,
  submitRecoveryCase,
} from '@/data/recovery-mock-data'
import type {
  ConfigureInstallmentsInput,
  CreateRecoveryCaseInput,
  ExcessCase,
  CalculationBreakdownRow,
  RecoveryApprovalAction,
  RecoveryAuditEntry,
  RecoveryCase,
  RecoveryDashboardStats,
  MonthlyRecoveryChartItem,
  OutstandingRecoveryChartItem,
  RecoveryCasesByDepartmentItem,
  RecoveryCollectionTrendItem,
  RecoveryFinancialOverview,
  RecoveryStatusChartItem,
  RecordPaymentInput,
} from '@/types/recovery'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchRecoveryDashboardStats(): Promise<RecoveryDashboardStats> {
  await delay(300)
  return getRecoveryDashboardStats()
}

export async function fetchRecoveryStatusChart(): Promise<RecoveryStatusChartItem[]> {
  await delay(300)
  return getRecoveryStatusChart()
}

export async function fetchMonthlyRecoveryCollection(): Promise<MonthlyRecoveryChartItem[]> {
  await delay(300)
  return getMonthlyRecoveryCollection()
}

export async function fetchOutstandingByDepartment(): Promise<OutstandingRecoveryChartItem[]> {
  await delay(300)
  return getOutstandingByDepartment()
}

export async function fetchRecoveryFinancialOverview(): Promise<RecoveryFinancialOverview> {
  await delay(300)
  return getRecoveryFinancialOverview()
}

export async function fetchRecoveryCollectionTrend(): Promise<RecoveryCollectionTrendItem[]> {
  await delay(300)
  return getRecoveryCollectionTrend()
}

export async function fetchRecoveryCasesByDepartment(): Promise<RecoveryCasesByDepartmentItem[]> {
  await delay(300)
  return getRecoveryCasesByDepartment()
}

export async function fetchRecoveryCases(): Promise<RecoveryCase[]> {
  await delay()
  return getRecoveryCases()
}

export async function fetchRecoveryCase(id: string): Promise<RecoveryCase | null> {
  await delay()
  return getRecoveryCaseById(id) ?? null
}

export async function fetchApprovedExcessCases(): Promise<ExcessCase[]> {
  await delay(400)
  return getApprovedExcessCases()
}

export async function fetchExcessCase(id: string): Promise<ExcessCase | null> {
  await delay(300)
  return getExcessCaseById(id) ?? null
}

export async function fetchRecoveryAuditLogs(caseId: string): Promise<RecoveryAuditEntry[]> {
  await delay(300)
  return getRecoveryAuditLogs(caseId)
}

export async function fetchCalculationBreakdown(caseId: string): Promise<CalculationBreakdownRow[]> {
  await delay(300)
  return getCalculationBreakdown(caseId)
}

export async function fetchPensionerRecoveryCases(pensionerId: string): Promise<RecoveryCase[]> {
  await delay()
  return getRecoveryCasesByPensioner(pensionerId)
}

export async function fetchPensionerRecoverySummary(pensionerId: string) {
  await delay(400)
  return getPensionerRecoverySummary(pensionerId)
}

export async function createRecoveryCaseApi(input: CreateRecoveryCaseInput): Promise<RecoveryCase> {
  await delay(800)
  return createRecoveryCase(input)
}

export async function submitRecoveryCaseApi(caseId: string, submittedBy?: string): Promise<RecoveryCase> {
  await delay(600)
  return submitRecoveryCase(caseId, submittedBy)
}

export async function processRecoveryApprovalApi(
  caseId: string,
  action: RecoveryApprovalAction,
  remarks: string,
  approverName?: string,
): Promise<RecoveryCase> {
  await delay(700)
  return processRecoveryApproval(caseId, action, remarks, approverName)
}

export async function configureInstallmentsApi(input: ConfigureInstallmentsInput): Promise<RecoveryCase> {
  await delay(800)
  return configureInstallments(input)
}

export async function recordRecoveryPaymentApi(input: RecordPaymentInput): Promise<RecoveryCase> {
  await delay(700)
  return recordRecoveryPayment(input)
}

export async function closeRecoveryCaseApi(caseId: string, closedBy?: string): Promise<RecoveryCase> {
  await delay(600)
  return closeRecoveryCase(caseId, closedBy)
}
