export type SuspensionTriggerType =
  | 'no_verification'
  | 'fraud'
  | 'duplicate'
  | 'invalid_documents'
  | 'deceased'
  | 'administrative_hold'
  | 'other'

export type SuspensionCaseStatus =
  | 'suspended'
  | 'restoration_pending'
  | 'restored'
  | 'rejected'

export type SuspensionSource = 'automatic' | 'manual'

export type RestorationRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type SuspensionAuditAction =
  | 'suspension_created'
  | 'suspension_updated'
  | 'restoration_requested'
  | 'restoration_approved'
  | 'restoration_rejected'

import type { DocumentMimeType, DocumentType } from '@/types/documents'

export interface SuspensionDocument {
  name: string
  fileName: string
  documentType?: DocumentType
  fileSize?: number
  mimeType?: DocumentMimeType
}

export interface SuspensionTimelineEvent {
  id: string
  status: string
  title: string
  description?: string
  actor?: string
  timestamp: string
}

export interface SuspensionAuditEntry {
  id: string
  suspensionCaseId: string
  restorationRequestId?: string
  user: string
  action: SuspensionAuditAction
  timestamp: string
  oldStatus?: string
  newStatus?: string
  remarks?: string
}

export interface SuspensionCase {
  id: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  pensionerMobile?: string
  pensionType?: string
  suspensionReason: string
  triggerType: SuspensionTriggerType
  source: SuspensionSource
  suspensionDate: string
  remarks?: string
  documents: SuspensionDocument[]
  createdBy: string
  status: SuspensionCaseStatus
  restoredAt?: string
  restorationRejectedAt?: string
  rejectionReason?: string
  timeline: SuspensionTimelineEvent[]
  createdAt: string
  updatedAt: string
}

export interface RestorationRequest {
  id: string
  suspensionCaseId: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  suspensionReason: string
  requestDate: string
  reasonForRestoration: string
  documents: SuspensionDocument[]
  remarks?: string
  declarationAccepted: boolean
  status: RestorationRequestStatus
  reviewedBy?: string
  adminRemarks?: string
  rejectionReason?: string
  updatedAt: string
  timeline: SuspensionTimelineEvent[]
}

export interface SuspensionDashboardStats {
  totalSuspended: number
  pendingRestoration: number
  restoredCases: number
  fraudCases: number
  verificationFailureCases: number
}

export interface CreateSuspensionCaseInput {
  pensionerId: string
  suspensionReason: string
  triggerType: SuspensionTriggerType
  suspensionDate: string
  remarks?: string
  documents: SuspensionDocument[]
  createdBy?: string
  source?: SuspensionSource
}

export interface CreateRestorationRequestInput {
  suspensionCaseId: string
  pensionerId: string
  reasonForRestoration: string
  documents: SuspensionDocument[]
  remarks?: string
  declarationAccepted: boolean
}

export type AdminRestorationAction = 'approve' | 'reject' | 'verify'
export type AdminSuspensionAction = 'restore' | 'reject_restoration' | 'verify_documents'
