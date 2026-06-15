export type ProfileUpdateRequestType =
  | 'personal_details'
  | 'address'
  | 'bank_details'
  | 'nominee_details'
  | 'aadhaar'
  | 'pan'

export type ProfileUpdateRequestStatus =
  | 'pending_review'
  | 'under_verification'
  | 'approved'
  | 'rejected'
  | 'more_info_required'

export interface ProfileUpdateDocument {
  name: string
  fileName: string
  fileSize?: number
  mimeType?: string
}

export interface ProfileUpdateTimelineEvent {
  id: string
  status: ProfileUpdateRequestStatus | 'submitted' | 'document_verified'
  title: string
  description?: string
  actor?: string
  timestamp: string
}

export interface ProfileUpdateRequest {
  id: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  requestType: ProfileUpdateRequestType
  currentValue: string
  newValue: string
  updatePayload: Record<string, string>
  reason: string
  documents: ProfileUpdateDocument[]
  status: ProfileUpdateRequestStatus
  submittedAt: string
  updatedAt: string
  verificationNotes?: string
  adminRemarks?: string
  reviewedBy?: string
  timeline: ProfileUpdateTimelineEvent[]
}

export interface ProfileUpdateAuditLog {
  id: string
  requestId: string
  pensionerId: string
  ppoNumber: string
  requestType: ProfileUpdateRequestType
  field: string
  oldValue: string
  newValue: string
  approvedBy: string
  approvedAt: string
}

export interface CreateProfileUpdateInput {
  pensionerId: string
  requestType: ProfileUpdateRequestType
  updatePayload: Record<string, string>
  reason: string
  documents: ProfileUpdateDocument[]
}

export type AdminProfileUpdateAction = 'approve' | 'reject' | 'more_info' | 'verify'
