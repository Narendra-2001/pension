import {
  getLifeCertificateById,
  getLifeCertificateSubmissions,
  getLifeCertificateSubmissionsByStatus,
  processLifeCertificateAction,
} from '@/data/life-certificate-mock-data'
import type { LifeCertificateReviewStatus, LifeCertificateSubmission } from '@/types/life-certificate-review'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchLifeCertificateSubmissions(): Promise<LifeCertificateSubmission[]> {
  await delay()
  return getLifeCertificateSubmissions()
}

export async function fetchLifeCertificateSubmissionsByStatus(
  status: LifeCertificateReviewStatus,
): Promise<LifeCertificateSubmission[]> {
  await delay()
  return getLifeCertificateSubmissionsByStatus(status)
}

export async function fetchLifeCertificateById(id: string): Promise<LifeCertificateSubmission | null> {
  await delay()
  return getLifeCertificateById(id) ?? null
}

export async function adminProcessLifeCertificate(
  id: string,
  action: 'verify' | 'approve' | 'reject',
  remarks: string,
  adminName?: string,
): Promise<LifeCertificateSubmission> {
  await delay(700)
  return processLifeCertificateAction(id, action, remarks, adminName)
}
