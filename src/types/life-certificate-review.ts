import type { ProfileUpdateTimelineEvent } from '@/types/profile-update-request'
import type {
  VerificationDeviceInfo,
  VerificationGeoLocation,
  VerificationUploadedDocument,
} from '@/types/verification-submission'

export type LifeCertificateReviewStatus =
  | 'submitted'
  | 'under_verification'
  | 'approved'
  | 'rejected'

export interface LifeCertificateSubmission {
  id: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  status: LifeCertificateReviewStatus
  method: string
  submittedAt: string
  updatedAt: string
  faceCaptureVerified: boolean
  livenessPassed: boolean
  otpVerified: boolean
  declarationAccepted: boolean
  verificationNotes?: string
  adminRemarks?: string
  reviewedBy?: string
  nextVerificationDueDate?: string
  isResubmission?: boolean
  faceCaptureTimestamp?: string
  livenessScore?: number
  livenessTimestamp?: string
  faceMatchScore?: number
  geoLocation?: VerificationGeoLocation
  deviceInfo?: VerificationDeviceInfo
  uploadedDocuments?: VerificationUploadedDocument[]
  timeline: ProfileUpdateTimelineEvent[]
}
