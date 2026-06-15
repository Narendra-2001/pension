export type PensionerStatus =
  | 'active'
  | 'pending_activation'
  | 'suspended'
  | 'deceased'
  | 'draft'

export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export type PensionType =
  | 'superannuation'
  | 'family_pension'
  | 'voluntary_retirement'
  | 'compassionate'
  | 'disability'

export type Gender = 'male' | 'female' | 'other'

export type ActivationStatus = 'pending' | 'sms_sent' | 'email_sent' | 'activated'

export interface PersonalDetails {
  firstName: string
  middleName?: string
  lastName: string
  gender: Gender
  dateOfBirth: string
  aadhaarNumber: string
  panNumber: string
  mobileNumber: string
  alternateMobile?: string
  emailAddress: string
  photoUrl?: string
  signatureUrl?: string
}

export interface ServiceDetails {
  employeeId: string
  department: string
  designation: string
  officeName: string
  joiningDate: string
  retirementDate: string
  lastPayDrawn: number
  pensionType: PensionType
  ppoNumber: string
  sanctionOrderNumber: string
}

export interface AddressDetails {
  houseNumber: string
  street: string
  villageCity: string
  district: string
  state: string
  pincode: string
}

export interface BankDetails {
  accountHolderName: string
  bankName: string
  branchName: string
  accountNumber: string
  ifscCode: string
  branchAddress: string
}

import type { PensionStructure } from '@/types/pension-structure'

export interface PensionDetails {
  basicPension: number
  dearnessRelief: number
  medicalAllowance: number
  specialAllowance: number
  arrears: number
  taxDeduction: number
  recoveryDeduction: number
  grossPension: number
  netPension: number
}

export interface NomineeDetails {
  nomineeName: string
  relationship: string
  dateOfBirth: string
  aadhaarNumber: string
  mobileNumber: string
  percentageShare: number
  address: string
}

export interface DocumentUpload {
  id: string
  name: string
  required: boolean
  uploaded: boolean
  fileName?: string
}

export interface PensionerRecord {
  id: string
  personal: PersonalDetails
  service: ServiceDetails
  address: AddressDetails
  bank: BankDetails
  /** Derived from pensionStructure.components — kept for backward compatibility */
  pension: PensionDetails
  /** Component-based pension structure — source of truth for calculations */
  pensionStructure?: PensionStructure
  nominee: NomineeDetails
  documents: DocumentUpload[]
  status: PensionerStatus
  verificationStatus: VerificationStatus
  activationStatus: ActivationStatus
  createdAt: string
  updatedAt: string
}

export interface PensionerListItem {
  id: string
  ppoNumber: string
  name: string
  mobileNumber: string
  emailAddress: string
  pensionType: PensionType
  status: PensionerStatus
  verificationStatus: VerificationStatus
  activationStatus: ActivationStatus
  createdAt: string
}

export interface DashboardStats {
  totalPensioners: number
  activePensioners: number
  pendingActivations: number
  pendingVerifications: number
  suspendedPensioners: number
  deceasedPensioners: number
}

export interface RecentActivity {
  id: string
  type: 'new_pensioner' | 'pending_activation' | 'verification_request' | 'suspension_request'
  title: string
  description: string
  timestamp: string
  pensionerId?: string
}

export interface DepartmentPensionerCount {
  department: string
  count: number
}

export type PensionApplicationStatus = 'approved' | 'pending' | 'rejected'

export interface RecentPensionApplication {
  id: string
  applicant: string
  department: string
  appliedOn: string
  status: PensionApplicationStatus
  amount: number
}

export interface BulkImportRecord {
  id: string
  rowNumber: number
  personal: Partial<PersonalDetails>
  service: Partial<ServiceDetails>
  bank: Partial<BankDetails>
  pension: Partial<PensionDetails>
  nominee: Partial<NomineeDetails>
  isValid: boolean
  isDuplicate: boolean
  errors: string[]
}

export interface BulkImportResult {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  duplicateRecords: number
  records: BulkImportRecord[]
}

export function getPensionerFullName(personal: PersonalDetails): string {
  return [personal.firstName, personal.middleName, personal.lastName]
    .filter(Boolean)
    .join(' ')
}

export function calculatePensionAmounts(details: Omit<PensionDetails, 'grossPension' | 'netPension'>): {
  grossPension: number
  netPension: number
} {
  const grossPension =
    details.basicPension +
    details.dearnessRelief +
    details.medicalAllowance +
    details.specialAllowance +
    details.arrears
  const netPension = grossPension - details.taxDeduction - details.recoveryDeduction
  return { grossPension, netPension: Math.max(0, netPension) }
}
