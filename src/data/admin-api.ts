import {
  addPensioner,
  dashboardStats,
  deletePensioner,
  generateBulkImportPreview,
  generatePensionerId,
  getPensionersStore,
  monthlyOnboarding,
  monthlyOnboardingSeries,
  onboardingChannelBreakdown,
  onboardingTopDepartments,
  pensionerListItems,
  pensionersByDepartment,
  recentActivities,
  recentPensionApplications,
  resolvePensionerRef,
  statusDistribution,
  statusDistributionSeries,
  statusDistributionTrend,
  toListItem,
  updatePensioner,
  verificationOverview,
} from '@/data/admin-mock-data'
import type {
  BulkImportResult,
  DashboardStats,
  PensionerListItem,
  PensionerRecord,
  RecentActivity,
} from '@/types/pensioner'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchDashboardStats(): Promise<{
  stats: DashboardStats
  statusDistribution: typeof statusDistribution
  statusDistributionTrend: typeof statusDistributionTrend
  statusDistributionSeries: typeof statusDistributionSeries
  monthlyOnboarding: typeof monthlyOnboarding
  monthlyOnboardingSeries: typeof monthlyOnboardingSeries
  onboardingChannelBreakdown: typeof onboardingChannelBreakdown
  onboardingTopDepartments: typeof onboardingTopDepartments
  verificationOverview: typeof verificationOverview
  pensionersByDepartment: typeof pensionersByDepartment
  recentApplications: typeof recentPensionApplications
  activities: RecentActivity[]
}> {
  await delay()
  return {
    stats: dashboardStats,
    statusDistribution,
    statusDistributionTrend,
    statusDistributionSeries,
    monthlyOnboarding,
    monthlyOnboardingSeries,
    onboardingChannelBreakdown,
    onboardingTopDepartments,
    verificationOverview,
    pensionersByDepartment,
    recentApplications: recentPensionApplications,
    activities: recentActivities,
  }
}

export interface PensionerFilters {
  search?: string
  status?: string
  verificationStatus?: string
  pensionType?: string
}

export async function fetchPensioners(filters?: PensionerFilters): Promise<PensionerListItem[]> {
  await delay()
  let items = getPensionersStore().map(toListItem)

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.ppoNumber.toLowerCase().includes(q) ||
        p.mobileNumber.includes(q) ||
        p.id.toLowerCase().includes(q),
    )
  }
  if (filters?.status && filters.status !== 'all') {
    items = items.filter((p) => p.status === filters.status)
  }
  if (filters?.verificationStatus && filters.verificationStatus !== 'all') {
    items = items.filter((p) => p.verificationStatus === filters.verificationStatus)
  }
  if (filters?.pensionType && filters.pensionType !== 'all') {
    items = items.filter((p) => p.pensionType === filters.pensionType)
  }
  return items
}

export async function fetchPensionerById(ref: string): Promise<PensionerRecord | null> {
  await delay()
  return resolvePensionerRef(ref) ?? null
}

export async function createPensioner(record: PensionerRecord): Promise<PensionerRecord> {
  await delay(800)
  return addPensioner(record)
}

export async function savePensioner(ref: string, updates: Partial<PensionerRecord>): Promise<PensionerRecord | null> {
  await delay(600)
  const record = resolvePensionerRef(ref)
  if (!record) return null
  return updatePensioner(record.id, updates) ?? null
}

export async function removePensioner(ref: string): Promise<void> {
  await delay(500)
  const record = resolvePensionerRef(ref)
  if (!record) return
  deletePensioner(record.id)
}

export async function fetchPendingActivations(): Promise<PensionerListItem[]> {
  await delay()
  return getPensionersStore()
    .filter((p) => p.status === 'pending_activation')
    .map(toListItem)
}

export async function resendActivationSms(ref: string): Promise<void> {
  await delay(600)
  const record = resolvePensionerRef(ref)
  if (!record) return
  updatePensioner(record.id, { activationStatus: 'sms_sent' })
}

export async function resendActivationEmail(ref: string): Promise<void> {
  await delay(600)
  const record = resolvePensionerRef(ref)
  if (!record) return
  updatePensioner(record.id, { activationStatus: 'email_sent' })
}

export async function activateManually(ref: string): Promise<void> {
  await delay(800)
  const record = resolvePensionerRef(ref)
  if (!record) return
  updatePensioner(record.id, { status: 'active', activationStatus: 'activated' })
}

export async function processBulkImport(fileName: string): Promise<BulkImportResult> {
  await delay(1500)
  return generateBulkImportPreview(fileName)
}

export async function confirmBulkImport(validRecordIds: string[]): Promise<{ imported: number }> {
  await delay(1200)
  return { imported: validRecordIds.length }
}

export { generatePensionerId }

export function exportPensionersCsv(items: PensionerListItem[]): string {
  const headers = ['ID', 'PPO Number', 'Name', 'Mobile', 'Pension Type', 'Status', 'Verification', 'Created Date']
  const rows = items.map((p) =>
    [p.id, p.ppoNumber, p.name, p.mobileNumber, p.pensionType, p.status, p.verificationStatus, p.createdAt].join(','),
  )
  return [headers.join(','), ...rows].join('\n')
}

export { pensionerListItems }
