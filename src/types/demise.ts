export type DemiseIntimationStatus =
  | 'draft'
  | 'submitted'
  | 'under_verification'
  | 'needs_clarification'
  | 'approved'
  | 'rejected'
  | 'reversed'

export type DemiseDocumentType =
  | 'death_certificate'
  | 'hospital_certificate'
  | 'legal_heir_certificate'
  | 'identity_proof'
  | 'supporting_document'

export type NomineePriority = 'primary' | 'secondary'

export type DemiseSubmittedBy = 'nominee' | 'admin'

export type DemiseVerificationAction = 'approve' | 'reject' | 'needs_clarification' | 'reverse'

export type DemiseAuditAction =
  | 'intimation_submitted'
  | 'document_uploaded'
  | 'verification_started'
  | 'clarification_requested'
  | 'approved'
  | 'rejected'
  | 'pension_status_changed'
  | 'recovery_triggered'
  | 'family_pension_created'
  | 'reversal_initiated'
  | 'status_changed'

export type FamilyPensionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'eligibility_check'
  | 'approved'
  | 'rejected'
  | 'activated'

export interface DemiseDocument {
  id: string
  type: DemiseDocumentType
  name: string
  fileName: string
  mandatory: boolean
  uploadedAt: string
}

export interface DemiseNomineeInfo {
  nomineeName: string
  relationship: string
  mobileNumber: string
  priority: NomineePriority
  aadhaarNumber?: string
}

export interface DemiseApprovalRecord {
  action: DemiseVerificationAction
  remarks: string
  actor: string
  timestamp: string
}

export interface DemiseTimelineEvent {
  id: string
  status: string
  title: string
  description?: string
  actor?: string
  timestamp: string
}

export interface DemiseAuditEntry {
  id: string
  intimationId: string
  user: string
  action: DemiseAuditAction
  timestamp: string
  oldValue?: string
  newValue?: string
  remarks?: string
}

export interface ExcessPensionPayment {
  month: string
  amount: number
  paidDate: string
}

export interface ExcessPensionCalculation {
  dateOfDeath: string
  paymentsAfterDeath: ExcessPensionPayment[]
  totalExcessAmount: number
  calculatedAt: string
  excessCaseId?: string
  recoveryCaseId?: string
}

export interface DemiseIntimation {
  id: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  nominee: DemiseNomineeInfo
  secondaryNominee?: DemiseNomineeInfo
  dateOfDeath: string
  placeOfDeath: string
  causeOfDeath?: string
  remarks: string
  declarationAccepted: boolean
  documents: DemiseDocument[]
  status: DemiseIntimationStatus
  submittedAt: string
  updatedAt: string
  submittedBy: DemiseSubmittedBy
  verificationNotes?: string
  approvalHistory: DemiseApprovalRecord[]
  excessPension?: ExcessPensionCalculation
  familyPensionId?: string
  deceasedProfileId?: string
  timeline: DemiseTimelineEvent[]
}

export interface FamilyPensionBankDetails {
  accountHolderName: string
  bankName: string
  branchName: string
  accountNumber: string
  ifscCode: string
}

export interface FamilyPensionApplication {
  id: string
  demiseIntimationId: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  nomineeName: string
  relationship: string
  mobileNumber: string
  address: string
  bankDetails: FamilyPensionBankDetails
  eligibilityVerified: boolean
  documents: DemiseDocument[]
  status: FamilyPensionStatus
  submittedAt: string
  updatedAt: string
  reviewedBy?: string
  adminRemarks?: string
  activatedAt?: string
  timeline: DemiseTimelineEvent[]
}

export interface DeceasedPensionerProfile {
  id: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  department: string
  pensionType: string
  dateOfDeath: string
  demiseApprovalDate: string
  demiseIntimationId: string
  excessPensionAmount: number
  recoveryStatus: string
  recoveryCaseId?: string
  familyPensionStatus: string
  familyPensionId?: string
  monthlyPension: number
}

export interface DemiseDashboardStats {
  totalRequests: number
  pendingVerification: number
  approvedCases: number
  rejectedCases: number
  familyPensionInitiated: number
  needsClarification: number
  deceasedProfiles: number
}

export interface SubmitDemiseIntimationInput {
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  nominee: DemiseNomineeInfo
  secondaryNominee?: DemiseNomineeInfo
  dateOfDeath: string
  placeOfDeath: string
  causeOfDeath?: string
  remarks: string
  declarationAccepted: boolean
  documents: Omit<DemiseDocument, 'id' | 'uploadedAt'>[]
  submittedBy: DemiseSubmittedBy
}

export interface DemiseVerificationInput {
  intimationId: string
  action: DemiseVerificationAction
  remarks: string
  actor: string
}

export interface InitiateFamilyPensionInput {
  demiseIntimationId: string
  nomineeName: string
  relationship: string
  mobileNumber: string
  address: string
  bankDetails: FamilyPensionBankDetails
  documents: Omit<DemiseDocument, 'id' | 'uploadedAt'>[]
  submittedBy: string
}

export interface FamilyPensionReviewInput {
  applicationId: string
  action: 'approve' | 'reject'
  remarks: string
  actor: string
}
