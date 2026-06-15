import type { PensionType, VerificationStatus } from '@/types/pensioner'

export type LifeCertStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'rejected'

export type { GrievanceTicket, GrievanceTicketStatus as GrievanceStatus } from '@/types/grievance'

export type DemiseReportStatus = 'submitted' | 'under_review' | 'approved' | 'rejected'

export type DocumentStatus = 'verified' | 'pending' | 'rejected' | 'not_uploaded'

export type NotificationType =
  | 'verification_reminder'
  | 'pension_update'
  | 'recovery_notice'
  | 'document_request'
  | 'system_announcement'
  | 'suspension_notice'
  | 'restoration_update'

export interface PensionerDashboardSummary {
  ppoNumber: string
  pensionType: PensionType
  status: string
  lastVerificationDate: string
  nextVerificationDueDate: string
  currentPensionAmount: number
  verificationStatus: VerificationStatus
  recoveryStatus: string
  familyPensionStatus: string
}

export interface PensionStatement {
  id: string
  month: string
  grossPension: number
  recoveryAmount: number
  deductions: number
  netPension: number
  status: 'paid' | 'pending' | 'failed'
  utrReference?: string
  neftCreditedAt?: string
}

export interface NeftMonthlyChartPoint {
  month: string
  monthLabel: string
  netAmount: number
  grossPension: number
  recoveryAmount: number
  deductions: number
  status: PensionStatement['status']
}

export interface RecoveryInstallment {
  installmentNumber: number
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  date: string
}

export interface RecoveryCase {
  caseId: string
  reason: string
  totalAmount: number
  recoveredAmount: number
  remainingBalance: number
  installments: RecoveryInstallment[]
}

export interface PensionerNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  details?: string
  actionHref?: string
  actionLabel?: string
}

export interface VerificationHistoryEntry {
  id: string
  submittedAt: string
  status: LifeCertStatus
  method: string
  remarks?: string
}

export interface DemiseReport {
  id: string
  dateOfDeath: string
  placeOfDeath: string
  remarks: string
  certificateFileName?: string
  status: DemiseReportStatus
  submittedAt: string
}

export interface PensionerDocument {
  id: string
  name: string
  fileName?: string
  status: DocumentStatus
  uploadedAt?: string
}

export interface PensionerSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  twoFactorEnabled: boolean
}
