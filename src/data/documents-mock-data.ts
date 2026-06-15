import { getPensionersStore } from '@/data/admin-mock-data'
import { addPensionerNotification } from '@/data/pensioner-mock-data'
import { DOCUMENT_TYPE_CATEGORY } from '@/lib/documents'
import { getPensionerFullName } from '@/types/pensioner'
import type {
  DocumentAuditEntry,
  DocumentDashboardStats,
  DocumentStatusChartItem,
  DocumentTypeChartItem,
  DocumentVersion,
  MonthlyUploadChartItem,
  PensionDocument,
  RejectDocumentInput,
  RequestReuploadInput,
  UploadDocumentInput,
  VerifyDocumentInput,
} from '@/types/documents'

let documentCounter = 28
let auditCounter = 45

function nowIso() {
  return new Date().toISOString()
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function createAuditEntry(
  partial: Omit<DocumentAuditEntry, 'id' | 'timestamp'>,
): DocumentAuditEntry {
  return {
    ...partial,
    id: `DOC-AUD-${String(auditCounter++).padStart(4, '0')}`,
    timestamp: nowIso(),
  }
}

function notifyPensioner(
  _pensionerId: string,
  title: string,
  message: string,
  type: 'document_request' | 'pension_update' | 'system_announcement' = 'document_request',
) {
  addPensionerNotification({
    type,
    title,
    message,
    actionHref: '/pensioner/documents',
    actionLabel: 'View Documents',
  })
}

function resolvePensioner(ppoNumber: string) {
  const pensioners = getPensionersStore()
  const record = pensioners.find((p) => p.service.ppoNumber === ppoNumber)
  if (!record) return null
  return {
    pensionerId: record.id,
    pensionerName: getPensionerFullName(record.personal),
    ppoNumber: record.service.ppoNumber,
  }
}

function buildVersion(
  partial: Omit<DocumentVersion, 'version'> & { version?: number },
  version: number,
): DocumentVersion {
  return { ...partial, version }
}

const documents: PensionDocument[] = [
  {
    id: 'DOC-2026-0001',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    documentType: 'aadhaar_card',
    category: 'personal',
    currentVersion: 2,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-08-10',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'aadhaar_v1.jpg',
          fileSize: 245600,
          mimeType: 'image/jpeg',
          status: 'rejected',
          rejectionReason: 'blurred_image',
          rejectionNotes: 'Image is too blurred to read Aadhaar number clearly.',
          description: 'Aadhaar card front side',
        },
        1,
      ),
      buildVersion(
        {
          uploadDate: '2025-08-15',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'aadhaar_v2.jpg',
          fileSize: 312400,
          mimeType: 'image/jpeg',
          status: 'verified',
          verifiedBy: 'Admin Officer',
          verificationDate: '2025-08-16',
          description: 'Aadhaar card front side - resubmitted',
        },
        2,
      ),
    ],
    status: 'verified',
    uploadDate: '2025-08-15',
    description: 'Aadhaar card for identity verification',
    integrationSource: 'onboarding',
    verifiedBy: 'Admin Officer',
    verificationDate: '2025-08-16',
    createdAt: '2025-08-10T10:00:00.000Z',
    updatedAt: '2025-08-16T14:30:00.000Z',
  },
  {
    id: 'DOC-2026-0002',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    documentType: 'pan_card',
    category: 'personal',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-08-12',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'pan_card.jpg',
          fileSize: 524288,
          mimeType: 'image/jpeg',
          status: 'verified',
          verifiedBy: 'Verification Officer',
          verificationDate: '2025-08-13',
        },
        1,
      ),
    ],
    status: 'verified',
    uploadDate: '2025-08-12',
    integrationSource: 'onboarding',
    verifiedBy: 'Verification Officer',
    verificationDate: '2025-08-13',
    createdAt: '2025-08-12T09:00:00.000Z',
    updatedAt: '2025-08-13T11:00:00.000Z',
  },
  {
    id: 'DOC-2026-0003',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    documentType: 'bank_passbook',
    category: 'bank',
    currentVersion: 2,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-09-01',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'passbook_v1.pdf',
          fileSize: 890000,
          mimeType: 'application/pdf',
          status: 'rejected',
          rejectionReason: 'mismatch_information',
          rejectionNotes: 'Account number does not match registered bank details.',
        },
        1,
      ),
      buildVersion(
        {
          uploadDate: '2025-09-05',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'passbook_v2.pdf',
          fileSize: 920000,
          mimeType: 'application/pdf',
          status: 'verified',
          verifiedBy: 'Admin Officer',
          verificationDate: '2025-09-06',
        },
        2,
      ),
    ],
    status: 'verified',
    uploadDate: '2025-09-05',
    integrationSource: 'profile_update',
    integrationRefId: 'PRU-2026-0012',
    verifiedBy: 'Admin Officer',
    verificationDate: '2025-09-06',
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-06T16:00:00.000Z',
  },
  {
    id: 'DOC-2026-0004',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    documentType: 'life_certificate',
    category: 'verification',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2026-01-15',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'life_cert_2026.pdf',
          fileSize: 456000,
          mimeType: 'application/pdf',
          status: 'pending_verification',
        },
        1,
      ),
    ],
    status: 'pending_verification',
    uploadDate: '2026-01-15',
    integrationSource: 'life_certificate',
    integrationRefId: 'LC-2026-0045',
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-01-15T10:30:00.000Z',
  },
  {
    id: 'DOC-2026-0005',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    documentType: 'ppo_copy',
    category: 'pension',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-07-20',
          uploadedBy: 'Admin Officer',
          uploadedByRole: 'pension_admin',
          fileName: 'ppo_copy.pdf',
          fileSize: 1200000,
          mimeType: 'application/pdf',
          status: 'verified',
          verifiedBy: 'Verification Officer',
          verificationDate: '2025-07-21',
        },
        1,
      ),
    ],
    status: 'verified',
    uploadDate: '2025-07-20',
    integrationSource: 'onboarding',
    verifiedBy: 'Verification Officer',
    verificationDate: '2025-07-21',
    createdAt: '2025-07-20T12:00:00.000Z',
    updatedAt: '2025-07-21T09:00:00.000Z',
  },
  {
    id: 'DOC-2026-0006',
    pensionerId: 'PEN-DEMO-002',
    ppoNumber: 'PPO789012',
    pensionerName: 'Sunita Devi',
    documentType: 'aadhaar_card',
    category: 'personal',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-10-05',
          uploadedBy: 'Sunita Devi',
          uploadedByRole: 'pensioner',
          fileName: 'aadhaar_sunita.jpg',
          fileSize: 298000,
          mimeType: 'image/jpeg',
          status: 'under_review',
        },
        1,
      ),
    ],
    status: 'under_review',
    uploadDate: '2025-10-05',
    integrationSource: 'onboarding',
    createdAt: '2025-10-05T14:00:00.000Z',
    updatedAt: '2025-10-06T09:00:00.000Z',
  },
  {
    id: 'DOC-2026-0007',
    pensionerId: 'PEN-DEMO-002',
    ppoNumber: 'PPO789012',
    pensionerName: 'Sunita Devi',
    documentType: 'cancelled_cheque',
    category: 'bank',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-10-08',
          uploadedBy: 'Sunita Devi',
          uploadedByRole: 'pensioner',
          fileName: 'cheque.jpg',
          fileSize: 180000,
          mimeType: 'image/jpeg',
          status: 'rejected',
          rejectionReason: 'incorrect_upload',
          rejectionNotes: 'Uploaded savings account statement instead of cancelled cheque.',
        },
        1,
      ),
    ],
    status: 'rejected',
    uploadDate: '2025-10-08',
    integrationSource: 'onboarding',
    rejectionReason: 'incorrect_upload',
    rejectionNotes: 'Uploaded savings account statement instead of cancelled cheque.',
    createdAt: '2025-10-08T11:00:00.000Z',
    updatedAt: '2025-10-09T10:00:00.000Z',
  },
  {
    id: 'DOC-2026-0008',
    pensionerId: 'PEN-DEMO-002',
    ppoNumber: 'PPO789012',
    pensionerName: 'Sunita Devi',
    documentType: 'nominee_aadhaar',
    category: 'nominee',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-10-10',
          uploadedBy: 'Sunita Devi',
          uploadedByRole: 'pensioner',
          fileName: 'nominee_aadhaar.png',
          fileSize: 340000,
          mimeType: 'image/png',
          status: 'pending_verification',
        },
        1,
      ),
    ],
    status: 'pending_verification',
    uploadDate: '2025-10-10',
    integrationSource: 'onboarding',
    createdAt: '2025-10-10T09:30:00.000Z',
    updatedAt: '2025-10-10T09:30:00.000Z',
  },
  {
    id: 'DOC-2026-0009',
    pensionerId: 'PEN-00003',
    ppoNumber: 'PPO100003',
    pensionerName: 'Ramesh Iyer',
    documentType: 'recovery_evidence',
    category: 'recovery',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-12-20',
          uploadedBy: 'Recovery Officer',
          uploadedByRole: 'recovery',
          fileName: 'excess_payment_proof.pdf',
          fileSize: 678000,
          mimeType: 'application/pdf',
          status: 'verified',
          verifiedBy: 'Admin Officer',
          verificationDate: '2025-12-22',
        },
        1,
      ),
    ],
    status: 'verified',
    uploadDate: '2025-12-20',
    integrationSource: 'recovery',
    integrationRefId: 'REC-2026-0003',
    verifiedBy: 'Admin Officer',
    verificationDate: '2025-12-22',
    createdAt: '2025-12-20T15:00:00.000Z',
    updatedAt: '2025-12-22T11:00:00.000Z',
  },
  {
    id: 'DOC-2026-0010',
    pensionerId: 'PEN-00003',
    ppoNumber: 'PPO100003',
    pensionerName: 'Ramesh Iyer',
    documentType: 'recovery_notice',
    category: 'recovery',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-12-18',
          uploadedBy: 'Recovery Officer',
          uploadedByRole: 'recovery',
          fileName: 'recovery_notice.pdf',
          fileSize: 445000,
          mimeType: 'application/pdf',
          status: 'verified',
          verifiedBy: 'Admin Officer',
          verificationDate: '2025-12-19',
        },
        1,
      ),
    ],
    status: 'verified',
    uploadDate: '2025-12-18',
    integrationSource: 'recovery',
    integrationRefId: 'REC-2026-0003',
    verifiedBy: 'Admin Officer',
    verificationDate: '2025-12-19',
    createdAt: '2025-12-18T10:00:00.000Z',
    updatedAt: '2025-12-19T14:00:00.000Z',
  },
  {
    id: 'DOC-2026-0011',
    pensionerId: 'PEN-00004',
    ppoNumber: 'PPO100004',
    pensionerName: 'Lakshmi Narayanan',
    documentType: 'death_certificate',
    category: 'demise',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2026-02-01',
          uploadedBy: 'Family Member',
          uploadedByRole: 'pensioner',
          fileName: 'death_certificate.pdf',
          fileSize: 890000,
          mimeType: 'application/pdf',
          status: 'under_review',
        },
        1,
      ),
    ],
    status: 'under_review',
    uploadDate: '2026-02-01',
    integrationSource: 'demise',
    integrationRefId: 'DEM-2026-0008',
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-02T10:00:00.000Z',
  },
  {
    id: 'DOC-2026-0012',
    pensionerId: 'PEN-00004',
    ppoNumber: 'PPO100004',
    pensionerName: 'Lakshmi Narayanan',
    documentType: 'legal_heir_certificate',
    category: 'demise',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2026-02-03',
          uploadedBy: 'Family Member',
          uploadedByRole: 'pensioner',
          fileName: 'legal_heir.pdf',
          fileSize: 1100000,
          mimeType: 'application/pdf',
          status: 'pending_verification',
        },
        1,
      ),
    ],
    status: 'pending_verification',
    uploadDate: '2026-02-03',
    integrationSource: 'demise',
    integrationRefId: 'DEM-2026-0008',
    createdAt: '2026-02-03T11:00:00.000Z',
    updatedAt: '2026-02-03T11:00:00.000Z',
  },
  {
    id: 'DOC-2026-0013',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    documentType: 'restoration_supporting',
    category: 'suspension',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2025-11-20',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'restoration_medical.pdf',
          fileSize: 560000,
          mimeType: 'application/pdf',
          status: 'verified',
          verifiedBy: 'Verification Officer',
          verificationDate: '2025-11-22',
        },
        1,
      ),
    ],
    status: 'verified',
    uploadDate: '2025-11-20',
    integrationSource: 'suspension_restoration',
    integrationRefId: 'RST-2025-0018',
    verifiedBy: 'Verification Officer',
    verificationDate: '2025-11-22',
    createdAt: '2025-11-20T13:00:00.000Z',
    updatedAt: '2025-11-22T09:00:00.000Z',
  },
  {
    id: 'DOC-2026-0014',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    documentType: 'passport_photo',
    category: 'personal',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2024-06-01',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'photo.jpg',
          fileSize: 156000,
          mimeType: 'image/jpeg',
          status: 'expired',
        },
        1,
      ),
    ],
    status: 'expired',
    uploadDate: '2024-06-01',
    expiryDate: '2025-06-01',
    integrationSource: 'onboarding',
    createdAt: '2024-06-01T10:00:00.000Z',
    updatedAt: '2025-06-02T00:00:00.000Z',
  },
  {
    id: 'DOC-2026-0015',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    documentType: 'signature',
    category: 'personal',
    currentVersion: 1,
    versions: [
      buildVersion(
        {
          uploadDate: '2026-03-10',
          uploadedBy: 'Ramesh Kumar Sharma',
          uploadedByRole: 'pensioner',
          fileName: 'signature.png',
          fileSize: 45000,
          mimeType: 'image/png',
          status: 'uploaded',
        },
        1,
      ),
    ],
    status: 'uploaded',
    uploadDate: '2026-03-10',
    integrationSource: 'manual',
    createdAt: '2026-03-10T16:00:00.000Z',
    updatedAt: '2026-03-10T16:00:00.000Z',
  },
]

const auditLog: DocumentAuditEntry[] = [
  {
    id: 'DOC-AUD-0001',
    documentId: 'DOC-2026-0001',
    user: 'Ramesh Kumar Sharma',
    userRole: 'pensioner',
    action: 'document_uploaded',
    timestamp: '2025-08-10T10:00:00.000Z',
    newStatus: 'pending_verification',
    version: 1,
  },
  {
    id: 'DOC-AUD-0002',
    documentId: 'DOC-2026-0001',
    user: 'Verification Officer',
    userRole: 'pension_admin',
    action: 'document_rejected',
    timestamp: '2025-08-12T11:00:00.000Z',
    oldStatus: 'pending_verification',
    newStatus: 'rejected',
    version: 1,
    remarks: 'Blurred image',
  },
  {
    id: 'DOC-AUD-0003',
    documentId: 'DOC-2026-0001',
    user: 'Ramesh Kumar Sharma',
    userRole: 'pensioner',
    action: 'new_version_uploaded',
    timestamp: '2025-08-15T09:00:00.000Z',
    oldStatus: 'rejected',
    newStatus: 'pending_verification',
    version: 2,
  },
  {
    id: 'DOC-AUD-0004',
    documentId: 'DOC-2026-0001',
    user: 'Admin Officer',
    userRole: 'pension_admin',
    action: 'document_approved',
    timestamp: '2025-08-16T14:30:00.000Z',
    oldStatus: 'pending_verification',
    newStatus: 'verified',
    version: 2,
  },
]

export function getDocuments(): PensionDocument[] {
  return [...documents]
}

export function getDocumentById(id: string): PensionDocument | undefined {
  return documents.find((d) => d.id === id)
}

export function getDocumentsByPensioner(pensionerId: string): PensionDocument[] {
  return documents.filter((d) => d.pensionerId === pensionerId)
}

export function getDocumentsByPpo(ppoNumber: string): PensionDocument[] {
  return documents.filter((d) => d.ppoNumber === ppoNumber)
}

export function getPendingVerificationDocuments(): PensionDocument[] {
  return documents.filter(
    (d) =>
      d.status === 'pending_verification' ||
      d.status === 'under_review' ||
      d.status === 'uploaded',
  )
}

export function getDocumentAuditLog(documentId?: string): DocumentAuditEntry[] {
  const sorted = [...auditLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
  return documentId ? sorted.filter((e) => e.documentId === documentId) : sorted
}

export function getDocumentDashboardStats(): DocumentDashboardStats {
  return {
    totalDocuments: documents.length,
    pendingVerification: documents.filter(
      (d) =>
        d.status === 'pending_verification' ||
        d.status === 'under_review' ||
        d.status === 'uploaded',
    ).length,
    verifiedDocuments: documents.filter((d) => d.status === 'verified').length,
    rejectedDocuments: documents.filter((d) => d.status === 'rejected').length,
    expiredDocuments: documents.filter((d) => d.status === 'expired').length,
  }
}

export function getDocumentTypeChart(): DocumentTypeChartItem[] {
  const counts = new Map<string, number>()
  for (const doc of documents) {
    counts.set(doc.documentType, (counts.get(doc.documentType) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([type, count]) => ({
    type: type as DocumentTypeChartItem['type'],
    label: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count,
  }))
}

export function getDocumentStatusChart(): DocumentStatusChartItem[] {
  const counts = new Map<string, number>()
  for (const doc of documents) {
    counts.set(doc.status, (counts.get(doc.status) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([status, count]) => ({
    status: status as DocumentStatusChartItem['status'],
    label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count,
  }))
}

export function getMonthlyUploadChart(): MonthlyUploadChartItem[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const counts = new Map(months.map((m) => [m, 0]))
  for (const doc of documents) {
    const month = new Date(doc.uploadDate).toLocaleString('en-US', { month: 'short' })
    if (counts.has(month)) {
      counts.set(month, (counts.get(month) ?? 0) + 1)
    }
  }
  return months.map((month) => ({ month, uploads: counts.get(month) ?? 0 }))
}

function addAudit(partial: Omit<DocumentAuditEntry, 'id' | 'timestamp'>) {
  const entry = createAuditEntry(partial)
  auditLog.unshift(entry)
  return entry
}

function syncDocumentFromVersion(doc: PensionDocument) {
  const current = doc.versions.find((v) => v.version === doc.currentVersion)
  if (!current) return
  doc.status = current.status
  doc.uploadDate = current.uploadDate
  doc.verifiedBy = current.verifiedBy
  doc.verificationDate = current.verificationDate
  doc.rejectionReason = current.rejectionReason
  doc.rejectionNotes = current.rejectionNotes
  doc.updatedAt = nowIso()
}

export function uploadDocument(input: UploadDocumentInput): PensionDocument {
  const pensioner = resolvePensioner(input.ppoNumber)
  if (!pensioner) throw new Error('Pensioner not found for PPO number')

  const existing = documents.find(
    (d) =>
      d.ppoNumber === input.ppoNumber &&
      d.documentType === input.documentType &&
      d.status !== 'expired',
  )

  const category = DOCUMENT_TYPE_CATEGORY[input.documentType]
  const uploadDate = input.uploadDate ?? today()

  if (existing) {
    const newVersion = existing.currentVersion + 1
    const version: DocumentVersion = {
      version: newVersion,
      uploadDate,
      uploadedBy: input.uploadedBy,
      uploadedByRole: input.uploadedByRole,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      status: 'pending_verification',
      description: input.description,
    }
    existing.versions.push(version)
    existing.currentVersion = newVersion
    existing.description = input.description ?? existing.description
    syncDocumentFromVersion(existing)

    addAudit({
      documentId: existing.id,
      user: input.uploadedBy,
      userRole: input.uploadedByRole,
      action: 'new_version_uploaded',
      oldStatus: existing.versions[newVersion - 2]?.status,
      newStatus: 'pending_verification',
      version: newVersion,
    })

    notifyPensioner(
      existing.pensionerId,
      'Document Re-uploaded',
      `New version of ${input.documentType.replace(/_/g, ' ')} submitted for verification.`,
    )

    return existing
  }

  const id = `DOC-2026-${String(documentCounter++).padStart(4, '0')}`
  const version: DocumentVersion = {
    version: 1,
    uploadDate,
    uploadedBy: input.uploadedBy,
    uploadedByRole: input.uploadedByRole,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    status: 'pending_verification',
    description: input.description,
  }

  const doc: PensionDocument = {
    id,
    pensionerId: input.pensionerId ?? pensioner.pensionerId,
    ppoNumber: pensioner.ppoNumber,
    pensionerName: pensioner.pensionerName,
    documentType: input.documentType,
    category,
    currentVersion: 1,
    versions: [version],
    status: 'pending_verification',
    uploadDate,
    description: input.description,
    integrationSource: input.integrationSource ?? 'manual',
    integrationRefId: input.integrationRefId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  documents.unshift(doc)

  addAudit({
    documentId: id,
    user: input.uploadedBy,
    userRole: input.uploadedByRole,
    action: 'document_uploaded',
    newStatus: 'pending_verification',
    version: 1,
  })

  notifyPensioner(
    doc.pensionerId,
    'Document Uploaded',
    `Your ${input.documentType.replace(/_/g, ' ')} has been uploaded and is pending verification.`,
  )

  return doc
}

export function verifyDocument(input: VerifyDocumentInput): PensionDocument {
  const doc = documents.find((d) => d.id === input.documentId)
  if (!doc) throw new Error('Document not found')

  const version = doc.versions.find((v) => v.version === doc.currentVersion)
  if (!version) throw new Error('Version not found')

  const oldStatus = doc.status
  version.status = 'verified'
  version.verifiedBy = input.verifiedBy
  version.verificationDate = today()
  doc.status = 'verified'
  doc.verifiedBy = input.verifiedBy
  doc.verificationDate = today()
  doc.verificationNotes = input.verificationNotes
  doc.rejectionReason = undefined
  doc.rejectionNotes = undefined
  doc.updatedAt = nowIso()

  addAudit({
    documentId: doc.id,
    user: input.verifiedBy,
    userRole: 'pension_admin',
    action: 'document_approved',
    oldStatus,
    newStatus: 'verified',
    version: doc.currentVersion,
    remarks: input.verificationNotes,
  })

  notifyPensioner(
    doc.pensionerId,
    'Document Approved',
    `Your ${doc.documentType.replace(/_/g, ' ')} has been verified successfully.`,
    'pension_update',
  )

  return doc
}

export function rejectDocument(input: RejectDocumentInput): PensionDocument {
  const doc = documents.find((d) => d.id === input.documentId)
  if (!doc) throw new Error('Document not found')

  const version = doc.versions.find((v) => v.version === doc.currentVersion)
  if (!version) throw new Error('Version not found')

  const oldStatus = doc.status
  version.status = 'rejected'
  version.rejectionReason = input.reason
  version.rejectionNotes = input.notes
  doc.status = 'rejected'
  doc.rejectionReason = input.reason
  doc.rejectionNotes = input.notes
  doc.updatedAt = nowIso()

  addAudit({
    documentId: doc.id,
    user: input.rejectedBy,
    userRole: 'pension_admin',
    action: 'document_rejected',
    oldStatus,
    newStatus: 'rejected',
    version: doc.currentVersion,
    remarks: input.notes,
  })

  notifyPensioner(
    doc.pensionerId,
    'Document Rejected',
    `Your ${doc.documentType.replace(/_/g, ' ')} was rejected. Reason: ${input.notes}. Please upload a new version.`,
  )

  return doc
}

export function requestDocumentReupload(input: RequestReuploadInput): PensionDocument {
  const doc = documents.find((d) => d.id === input.documentId)
  if (!doc) throw new Error('Document not found')

  const oldStatus = doc.status
  doc.status = 'pending_verification'
  const version = doc.versions.find((v) => v.version === doc.currentVersion)
  if (version) version.status = 'pending_verification'
  doc.updatedAt = nowIso()

  addAudit({
    documentId: doc.id,
    user: input.requestedBy,
    userRole: 'pension_admin',
    action: 'document_reupload_requested',
    oldStatus,
    newStatus: 'pending_verification',
    version: doc.currentVersion,
    remarks: input.notes,
  })

  notifyPensioner(
    doc.pensionerId,
    'Re-upload Required',
    `Please re-upload your ${doc.documentType.replace(/_/g, ' ')}. ${input.notes}`,
  )

  return doc
}

export function markDocumentUnderReview(documentId: string, reviewer: string): PensionDocument {
  const doc = documents.find((d) => d.id === documentId)
  if (!doc) throw new Error('Document not found')

  const oldStatus = doc.status
  doc.status = 'under_review'
  const version = doc.versions.find((v) => v.version === doc.currentVersion)
  if (version) version.status = 'under_review'
  doc.updatedAt = nowIso()

  addAudit({
    documentId: doc.id,
    user: reviewer,
    userRole: 'pension_admin',
    action: 'status_changed',
    oldStatus,
    newStatus: 'under_review',
    version: doc.currentVersion,
  })

  return doc
}
