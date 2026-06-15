import {
  getDocumentAuditLog,
  getDocumentById,
  getDocumentDashboardStats,
  getDocumentStatusChart,
  getDocumentTypeChart,
  getDocuments,
  getDocumentsByPensioner,
  getMonthlyUploadChart,
  getPendingVerificationDocuments,
  markDocumentUnderReview,
  rejectDocument,
  requestDocumentReupload,
  uploadDocument,
  verifyDocument,
} from '@/data/documents-mock-data'
import type {
  RejectDocumentInput,
  RequestReuploadInput,
  UploadDocumentInput,
  VerifyDocumentInput,
} from '@/types/documents'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchDocumentDashboardStats() {
  await delay(300)
  return getDocumentDashboardStats()
}

export async function fetchDocumentTypeChart() {
  await delay(250)
  return getDocumentTypeChart()
}

export async function fetchDocumentStatusChart() {
  await delay(250)
  return getDocumentStatusChart()
}

export async function fetchMonthlyUploadChart() {
  await delay(250)
  return getMonthlyUploadChart()
}

export async function fetchDocuments() {
  await delay(350)
  return getDocuments()
}

export async function fetchDocumentById(id: string) {
  await delay(300)
  const doc = getDocumentById(id)
  if (!doc) throw new Error('Document not found')
  return doc
}

export async function fetchPensionerDocumentsFromStore(pensionerId: string) {
  await delay(300)
  return getDocumentsByPensioner(pensionerId)
}

export async function fetchVerificationQueue() {
  await delay(350)
  return getPendingVerificationDocuments()
}

export async function fetchDocumentAuditLog(documentId?: string) {
  await delay(300)
  return getDocumentAuditLog(documentId)
}

export async function uploadDocumentApi(input: UploadDocumentInput) {
  await delay(500)
  return uploadDocument(input)
}

export async function verifyDocumentApi(input: VerifyDocumentInput) {
  await delay(400)
  return verifyDocument(input)
}

export async function rejectDocumentApi(input: RejectDocumentInput) {
  await delay(400)
  return rejectDocument(input)
}

export async function requestReuploadApi(input: RequestReuploadInput) {
  await delay(400)
  return requestDocumentReupload(input)
}

export async function markUnderReviewApi(documentId: string, reviewer: string) {
  await delay(300)
  return markDocumentUnderReview(documentId, reviewer)
}

export async function downloadDocumentApi(documentId: string) {
  await delay(200)
  const doc = getDocumentById(documentId)
  if (!doc) throw new Error('Document not found')
  const version = doc.versions.find((v) => v.version === doc.currentVersion)
  return { fileName: version?.fileName ?? 'document.pdf', documentId: doc.id }
}
