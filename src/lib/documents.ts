import type {
  DocumentCategory,
  DocumentRejectionReason,
  DocumentType,
  DocumentVerificationStatus,
  DocumentAuditAction,
  DocumentIntegrationSource,
  DocumentVersion,
} from '@/types/documents'

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  aadhaar_card: 'Aadhaar Card',
  pan_card: 'PAN Card',
  passport_photo: 'Passport Photo',
  signature: 'Signature',
  ppo_copy: 'PPO Copy',
  pension_sanction_order: 'Pension Sanction Order',
  retirement_order: 'Retirement Order',
  bank_passbook: 'Bank Passbook',
  cancelled_cheque: 'Cancelled Cheque',
  nominee_aadhaar: 'Nominee Aadhaar',
  relationship_proof: 'Relationship Proof',
  life_certificate: 'Life Certificate',
  restoration_supporting: 'Restoration Supporting Document',
  death_certificate: 'Death Certificate',
  legal_heir_certificate: 'Legal Heir Certificate',
  recovery_notice: 'Recovery Notice',
  recovery_evidence: 'Recovery Supporting Evidence',
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  personal: 'Personal Documents',
  pension: 'Pension Documents',
  bank: 'Bank Documents',
  nominee: 'Nominee Documents',
  verification: 'Verification Documents',
  suspension: 'Suspension Documents',
  demise: 'Demise Documents',
  recovery: 'Recovery Documents',
}

export const DOCUMENT_TYPE_CATEGORY: Record<DocumentType, DocumentCategory> = {
  aadhaar_card: 'personal',
  pan_card: 'personal',
  passport_photo: 'personal',
  signature: 'personal',
  ppo_copy: 'pension',
  pension_sanction_order: 'pension',
  retirement_order: 'pension',
  bank_passbook: 'bank',
  cancelled_cheque: 'bank',
  nominee_aadhaar: 'nominee',
  relationship_proof: 'nominee',
  life_certificate: 'verification',
  restoration_supporting: 'suspension',
  death_certificate: 'demise',
  legal_heir_certificate: 'demise',
  recovery_notice: 'recovery',
  recovery_evidence: 'recovery',
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentVerificationStatus, string> = {
  uploaded: 'Uploaded',
  pending_verification: 'Pending Verification',
  under_review: 'Under Review',
  verified: 'Verified',
  rejected: 'Rejected',
  expired: 'Expired',
}

export const DOCUMENT_REJECTION_REASON_LABELS: Record<DocumentRejectionReason, string> = {
  blurred_image: 'Blurred Image',
  invalid_document: 'Invalid Document',
  mismatch_information: 'Mismatch Information',
  expired_document: 'Expired Document',
  incorrect_upload: 'Incorrect Upload',
}

export const DOCUMENT_AUDIT_ACTION_LABELS: Record<DocumentAuditAction, string> = {
  document_uploaded: 'Document Uploaded',
  document_updated: 'Document Updated',
  document_approved: 'Document Approved',
  document_rejected: 'Document Rejected',
  document_reupload_requested: 'Re-upload Requested',
  new_version_uploaded: 'New Version Uploaded',
  status_changed: 'Status Changed',
}

export const DOCUMENT_INTEGRATION_LABELS: Record<DocumentIntegrationSource, string> = {
  onboarding: 'Pensioner Onboarding',
  profile_update: 'Profile Update Request',
  life_certificate: 'Life Certificate Verification',
  suspension_restoration: 'Suspension Restoration',
  demise: 'Demise Reporting',
  recovery: 'Recovery Case',
  manual: 'Manual Upload',
}

export const DOCUMENT_TYPES_BY_CATEGORY: Record<DocumentCategory, DocumentType[]> = {
  personal: ['aadhaar_card', 'pan_card', 'passport_photo', 'signature'],
  pension: ['ppo_copy', 'pension_sanction_order', 'retirement_order'],
  bank: ['bank_passbook', 'cancelled_cheque'],
  nominee: ['nominee_aadhaar', 'relationship_proof'],
  verification: ['life_certificate'],
  suspension: ['restoration_supporting'],
  demise: ['death_certificate', 'legal_heir_certificate'],
  recovery: ['recovery_notice', 'recovery_evidence'],
}

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const

export const SUPPORTED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'] as const

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getDocumentCurrentVersion(doc: { versions: DocumentVersion[]; currentVersion: number }) {
  return doc.versions.find((v) => v.version === doc.currentVersion) ?? doc.versions[doc.versions.length - 1]
}

export function isPendingVerification(status: DocumentVerificationStatus): boolean {
  return status === 'pending_verification' || status === 'under_review' || status === 'uploaded'
}

export function documentStatusTone(
  status: DocumentVerificationStatus,
): 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'violet' {
  switch (status) {
    case 'verified':
      return 'green'
    case 'pending_verification':
    case 'under_review':
    case 'uploaded':
      return 'amber'
    case 'rejected':
      return 'red'
    case 'expired':
      return 'slate'
    default:
      return 'blue'
  }
}
