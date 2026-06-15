import {
  createAdminDemiseEntry,
  getDeceasedProfileById,
  getDeceasedProfiles,
  getDemiseAuditLogs,
  getDemiseDashboardStats,
  getDemiseIntimationById,
  getDemiseIntimations,
  getDemiseIntimationsByPpo,
  getFamilyPensionApplications,
  getFamilyPensionByDemiseId,
  getFamilyPensionById,
  getLegacyDemiseReports,
  initiateFamilyPension,
  processDemiseVerification,
  reviewFamilyPension,
  startDemiseVerification,
  submitDemiseIntimation,
} from '@/data/demise-mock-data'
import type {
  DemiseAuditEntry,
  DemiseDashboardStats,
  DemiseIntimation,
  DeceasedPensionerProfile,
  FamilyPensionApplication,
  FamilyPensionReviewInput,
  InitiateFamilyPensionInput,
  DemiseVerificationInput,
  SubmitDemiseIntimationInput,
} from '@/types/demise'
import type { DemiseReport } from '@/types/pensioner-portal'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchDemiseDashboardStats(): Promise<DemiseDashboardStats> {
  await delay()
  return getDemiseDashboardStats()
}

export async function fetchDemiseIntimations(): Promise<DemiseIntimation[]> {
  await delay()
  return getDemiseIntimations()
}

export async function fetchDemiseIntimation(id: string): Promise<DemiseIntimation | undefined> {
  await delay()
  return getDemiseIntimationById(id)
}

export async function fetchDemiseIntimationsByPpo(ppoNumber: string): Promise<DemiseIntimation[]> {
  await delay()
  return getDemiseIntimationsByPpo(ppoNumber)
}

export async function fetchDemiseAuditLogs(intimationId: string): Promise<DemiseAuditEntry[]> {
  await delay()
  return getDemiseAuditLogs(intimationId)
}

export async function submitDemiseIntimationApi(
  input: SubmitDemiseIntimationInput,
): Promise<DemiseIntimation> {
  await delay(600)
  return submitDemiseIntimation(input)
}

export async function startDemiseVerificationApi(
  intimationId: string,
  actor: string,
): Promise<DemiseIntimation> {
  await delay()
  return startDemiseVerification(intimationId, actor)
}

export async function processDemiseVerificationApi(
  input: DemiseVerificationInput,
): Promise<DemiseIntimation> {
  await delay(600)
  return processDemiseVerification(input)
}

export async function fetchDeceasedProfiles(): Promise<DeceasedPensionerProfile[]> {
  await delay()
  return getDeceasedProfiles()
}

export async function fetchDeceasedProfile(id: string): Promise<DeceasedPensionerProfile | undefined> {
  await delay()
  return getDeceasedProfileById(id)
}

export async function fetchFamilyPensionApplications(): Promise<FamilyPensionApplication[]> {
  await delay()
  return getFamilyPensionApplications()
}

export async function fetchFamilyPensionApplication(
  id: string,
): Promise<FamilyPensionApplication | undefined> {
  await delay()
  return getFamilyPensionById(id)
}

export async function fetchFamilyPensionByDemiseId(
  demiseId: string,
): Promise<FamilyPensionApplication | undefined> {
  await delay()
  return getFamilyPensionByDemiseId(demiseId)
}

export async function initiateFamilyPensionApi(
  input: InitiateFamilyPensionInput,
): Promise<FamilyPensionApplication> {
  await delay(600)
  return initiateFamilyPension(input)
}

export async function reviewFamilyPensionApi(
  input: FamilyPensionReviewInput,
): Promise<FamilyPensionApplication> {
  await delay(600)
  return reviewFamilyPension(input)
}

export async function createAdminDemiseEntryApi(
  pensionerId: string,
  input: Omit<SubmitDemiseIntimationInput, 'pensionerId' | 'ppoNumber' | 'pensionerName' | 'submittedBy'>,
): Promise<DemiseIntimation> {
  await delay(600)
  return createAdminDemiseEntry(pensionerId, input)
}

// Legacy API compatibility
export async function fetchDemiseReports(): Promise<DemiseReport[]> {
  await delay()
  return getLegacyDemiseReports()
}

export async function createDemiseReport(
  data: Omit<DemiseReport, 'id' | 'status' | 'submittedAt'>,
): Promise<DemiseReport> {
  await delay(600)
  const pensioner = getDemiseIntimations()[0]
  const result = submitDemiseIntimation({
    pensionerId: pensioner?.pensionerId ?? 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    nominee: {
      nomineeName: 'Suresh Kumar Sharma',
      relationship: 'Son',
      mobileNumber: '9123456780',
      priority: 'primary',
    },
    dateOfDeath: data.dateOfDeath,
    placeOfDeath: data.placeOfDeath,
    remarks: data.remarks,
    declarationAccepted: true,
    documents: [
      {
        type: 'death_certificate',
        name: 'Death Certificate',
        fileName: data.certificateFileName ?? 'death_certificate.pdf',
        mandatory: true,
      },
    ],
    submittedBy: 'nominee',
  })
  return {
    id: result.id,
    dateOfDeath: result.dateOfDeath,
    placeOfDeath: result.placeOfDeath,
    remarks: result.remarks,
    certificateFileName: data.certificateFileName,
    status: 'submitted',
    submittedAt: result.submittedAt,
  }
}
