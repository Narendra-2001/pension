export type DocumentType =
  | 'aadhaar_card'
  | 'pan_card'
  | 'passport_photo'
  | 'signature'
  | 'ppo_copy'
  | 'pension_sanction_order'
  | 'retirement_order'
  | 'bank_passbook'
  | 'cancelled_cheque'
  | 'nominee_aadhaar'
  | 'relationship_proof'
  | 'life_certificate'
  | 'restoration_supporting'
  | 'death_certificate'
  | 'legal_heir_certificate'
  | 'recovery_notice'
  | 'recovery_evidence'

export type DocumentCategory =
  | 'personal'
  | 'pension'
  | 'bank'
  | 'nominee'
  | 'verification'
  | 'suspension'
  | 'demise'
  | 'recovery'

export type DocumentVerificationStatus =
  | 'uploaded'
  | 'pending_verification'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired'

export type DocumentRejectionReason =
  | 'blurred_image'
  | 'invalid_document'
  | 'mismatch_information'
  | 'expired_document'
  | 'incorrect_upload'

export type DocumentAuditAction =
  | 'document_uploaded'
  | 'document_updated'
  | 'document_approved'
  | 'document_rejected'
  | 'document_reupload_requested'
  | 'new_version_uploaded'
  | 'status_changed'

export type DocumentIntegrationSource =
  | 'onboarding'
  | 'profile_update'
  | 'life_certificate'
  | 'suspension_restoration'
  | 'demise'
  | 'recovery'
  | 'manual'

export type DocumentMimeType = 'application/pdf' | 'image/jpeg' | 'image/jpg' | 'image/png'

export interface DocumentVersion {
  version: number
  uploadDate: string
  uploadedBy: string
  uploadedByRole: string
  fileName: string
  fileSize: number
  mimeType: DocumentMimeType
  status: DocumentVerificationStatus
  verifiedBy?: string
  verificationDate?: string
  rejectionReason?: DocumentRejectionReason
  rejectionNotes?: string
  description?: string
}

export interface PensionDocument {
  id: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  documentType: DocumentType
  category: DocumentCategory
  currentVersion: number
  versions: DocumentVersion[]
  status: DocumentVerificationStatus
  uploadDate: string
  description?: string
  integrationSource: DocumentIntegrationSource
  integrationRefId?: string
  expiryDate?: string
  verificationNotes?: string
  verifiedBy?: string
  verificationDate?: string
  rejectionReason?: DocumentRejectionReason
  rejectionNotes?: string
  createdAt: string
  updatedAt: string
}

export interface DocumentAuditEntry {
  id: string
  documentId: string
  user: string
  userRole: string
  action: DocumentAuditAction
  timestamp: string
  oldStatus?: DocumentVerificationStatus
  newStatus?: DocumentVerificationStatus
  version?: number
  remarks?: string
}

export interface DocumentDashboardStats {
  totalDocuments: number
  pendingVerification: number
  verifiedDocuments: number
  rejectedDocuments: number
  expiredDocuments: number
}

export interface DocumentTypeChartItem {
  type: DocumentType
  label: string
  count: number
}

export interface DocumentStatusChartItem {
  status: DocumentVerificationStatus
  label: string
  count: number
}

export interface MonthlyUploadChartItem {
  month: string
  uploads: number
}

export interface UploadDocumentInput {
  pensionerId?: string
  ppoNumber: string
  documentType: DocumentType
  fileName: string
  fileSize: number
  mimeType: DocumentMimeType
  description?: string
  uploadDate?: string
  integrationSource?: DocumentIntegrationSource
  integrationRefId?: string
  uploadedBy: string
  uploadedByRole: string
}

export interface VerifyDocumentInput {
  documentId: string
  verifiedBy: string
  verificationNotes?: string
}

export interface RejectDocumentInput {
  documentId: string
  rejectedBy: string
  reason: DocumentRejectionReason
  notes: string
}

export interface RequestReuploadInput {
  documentId: string
  requestedBy: string
  notes: string
}
