export type RecoveryCaseStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active_recovery'
  | 'recovery_completed'
  | 'closed'
  | 'cancelled'

export type RecoveryType = 'full_recovery' | 'installment_recovery'

export type RecoveryReason =
  | 'excess_pension_credit'
  | 'pay_revision_adjustment'
  | 'duplicate_disbursement'
  | 'wrong_pension_type'
  | 'arrear_overpayment'
  | 'other'

export type PaymentMode = 'pension_deduction' | 'direct_deposit' | 'manual_payment'

export type RecoveryFrequency = 'monthly' | 'quarterly'

export type InstallmentStatus =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'missed'
  | 'overdue'
  | 'completed'

export type RecoveryAuditAction =
  | 'case_created'
  | 'case_submitted'
  | 'case_approved'
  | 'case_rejected'
  | 'installment_configured'
  | 'installment_updated'
  | 'payment_recorded'
  | 'status_changed'
  | 'recovery_completed'
  | 'case_closed'
  | 'case_cancelled'

export type ExcessCaseStatus = 'identified' | 'under_review' | 'approved' | 'rejected' | 'recovery_initiated'

export interface RecoveryDocument {
  name: string
  fileName: string
}

export interface RecoveryTimelineEvent {
  id: string
  status: string
  title: string
  description?: string
  actor?: string
  timestamp: string
}

export interface RecoveryAuditEntry {
  id: string
  recoveryCaseId: string
  user: string
  action: RecoveryAuditAction
  timestamp: string
  oldValue?: string
  newValue?: string
  remarks?: string
}

export interface ExcessCase {
  id: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  pensionType: string
  department: string
  excessAmount: number
  identifiedDate: string
  status: ExcessCaseStatus
  remarks?: string
}

export interface RecoveryCalculation {
  totalExcessAmount: number
  arrearAdjustment: number
  remainingAmount: number
  installmentCount: number
  installmentAmount: number
  recoveredAmount: number
  outstandingBalance: number
  recoveryPeriodMonths: number
  expectedCompletionDate?: string
}

export interface CalculationBreakdownRow {
  period: number
  openingBalance: number
  installmentAmount: number
  recoveredAmount: number
  closingBalance: number
  status: InstallmentStatus
  dueDate: string
}

export interface InstallmentConfig {
  installmentCount: number
  installmentAmount: number
  recoveryStartDate: string
  paymentMode: PaymentMode
  recoveryFrequency: RecoveryFrequency
  autoGenerateSchedule: boolean
}

export interface RecoveryInstallment {
  id: string
  installmentNumber: number
  dueDate: string
  installmentAmount: number
  recoveredAmount: number
  balance: number
  status: InstallmentStatus
  paidDate?: string
  paymentReference?: string
}

export interface RecoveryPayment {
  id: string
  recoveryCaseId: string
  installmentId?: string
  installmentNumber?: number
  paymentDate: string
  paidAmount: number
  paymentReference: string
  paymentMode: PaymentMode
  remarks?: string
  recordedBy: string
  recordedAt: string
}

export interface RecoveryCase {
  id: string
  excessCaseId: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  pensionType: string
  department: string
  recoveryReason: RecoveryReason
  recoveryType: RecoveryType
  totalExcessAmount: number
  arrearAdjustment: number
  recoveryStartDate: string
  approvalStatus: RecoveryCaseStatus
  status: RecoveryCaseStatus
  remarks?: string
  documents: RecoveryDocument[]
  createdBy: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  installmentConfig?: InstallmentConfig
  calculation: RecoveryCalculation
  installments: RecoveryInstallment[]
  payments: RecoveryPayment[]
  timeline: RecoveryTimelineEvent[]
}

export interface RecoveryDashboardStats {
  totalCases: number
  activeCases: number
  completedCases: number
  pendingApprovals: number
  totalRecoverableAmount: number
  outstandingAmount: number
}

export interface RecoveryStatusChartItem {
  status: RecoveryCaseStatus
  label: string
  count: number
}

export interface MonthlyRecoveryChartItem {
  month: string
  collected: number
}

export interface OutstandingRecoveryChartItem {
  department: string
  outstanding: number
}

export interface RecoveryFinancialOverview {
  totalRecoverableAmount: number
  totalRecoveredAmount: number
  outstandingAmount: number
  recoveryRatePercent: number
}

export interface RecoveryCollectionTrendItem {
  month: string
  collected: number
  cumulative: number
}

export interface RecoveryCasesByDepartmentItem {
  department: string
  active: number
  completed: number
  total: number
}

export interface CreateRecoveryCaseInput {
  excessCaseId: string
  recoveryReason: RecoveryReason
  recoveryType: RecoveryType
  arrearAdjustment?: number
  recoveryStartDate: string
  remarks?: string
  documents: RecoveryDocument[]
  createdBy?: string
}

export interface ConfigureInstallmentsInput {
  recoveryCaseId: string
  installmentCount: number
  recoveryStartDate: string
  paymentMode: PaymentMode
  recoveryFrequency: RecoveryFrequency
  autoGenerateSchedule?: boolean
}

export interface RecordPaymentInput {
  recoveryCaseId: string
  installmentId?: string
  paymentDate: string
  paidAmount: number
  paymentReference: string
  paymentMode: PaymentMode
  remarks?: string
  recordedBy?: string
}

export type RecoveryApprovalAction = 'approve' | 'reject'
