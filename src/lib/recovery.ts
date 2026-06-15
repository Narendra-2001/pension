import type {
  InstallmentStatus,
  PaymentMode,
  RecoveryCaseStatus,
  RecoveryFrequency,
  RecoveryReason,
  RecoveryType,
} from '@/types/recovery'

export const RECOVERY_STATUS_LABELS: Record<RecoveryCaseStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  active_recovery: 'Active Recovery',
  recovery_completed: 'Recovery Completed',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

export const RECOVERY_TYPE_LABELS: Record<RecoveryType, string> = {
  full_recovery: 'Full Recovery',
  installment_recovery: 'Installment Recovery',
}

export const RECOVERY_REASON_LABELS: Record<RecoveryReason, string> = {
  excess_pension_credit: 'Excess Pension Credit',
  pay_revision_adjustment: 'Pay Revision Adjustment',
  duplicate_disbursement: 'Duplicate Disbursement',
  wrong_pension_type: 'Wrong Pension Type',
  arrear_overpayment: 'Arrear Overpayment',
  other: 'Other',
}

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  pension_deduction: 'Pension Deduction',
  direct_deposit: 'Direct Deposit',
  manual_payment: 'Manual Payment',
}

export const RECOVERY_FREQUENCY_LABELS: Record<RecoveryFrequency, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
}

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  missed: 'Missed',
  overdue: 'Overdue',
  completed: 'Completed',
}

export const RECOVERY_AUDIT_ACTION_LABELS: Record<string, string> = {
  case_created: 'Case Created',
  case_submitted: 'Case Submitted',
  case_approved: 'Case Approved',
  case_rejected: 'Case Rejected',
  installment_configured: 'Installment Configured',
  installment_updated: 'Installment Updated',
  payment_recorded: 'Payment Recorded',
  status_changed: 'Status Changed',
  recovery_completed: 'Recovery Completed',
  case_closed: 'Case Closed',
  case_cancelled: 'Case Cancelled',
}

export function formatRecoveryCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateRecoveryBreakdown(
  totalExcess: number,
  arrearAdjustment: number,
  installmentCount: number,
  startDate: string,
  frequency: RecoveryFrequency = 'monthly',
  existingPayments: { period: number; amount: number }[] = [],
): {
  remainingAmount: number
  installmentAmount: number
  rows: {
    period: number
    openingBalance: number
    installmentAmount: number
    recoveredAmount: number
    closingBalance: number
    status: InstallmentStatus
    dueDate: string
  }[]
} {
  const remainingAmount = Math.max(0, totalExcess - arrearAdjustment)
  const installmentAmount =
    installmentCount > 0 ? Math.ceil(remainingAmount / installmentCount) : remainingAmount

  const rows: {
    period: number
    openingBalance: number
    installmentAmount: number
    recoveredAmount: number
    closingBalance: number
    status: InstallmentStatus
    dueDate: string
  }[] = []

  let balance = remainingAmount
  const start = new Date(startDate)

  for (let i = 1; i <= installmentCount && balance > 0; i++) {
    const openingBalance = balance
    const planned = Math.min(installmentAmount, balance)
    const paid = existingPayments.find((p) => p.period === i)?.amount ?? 0
    const recoveredAmount = Math.min(paid, planned)
    balance = Math.max(0, openingBalance - recoveredAmount)

    const due = new Date(start)
    if (frequency === 'monthly') {
      due.setMonth(due.getMonth() + (i - 1))
    } else {
      due.setMonth(due.getMonth() + (i - 1) * 3)
    }

    const today = new Date().toISOString().split('T')[0]
    const dueStr = due.toISOString().split('T')[0]

    let status: InstallmentStatus = 'pending'
    if (recoveredAmount >= planned) status = 'paid'
    else if (recoveredAmount > 0) status = 'partially_paid'
    else if (dueStr < today) status = 'overdue'

    rows.push({
      period: i,
      openingBalance,
      installmentAmount: planned,
      recoveredAmount,
      closingBalance: balance,
      status,
      dueDate: dueStr,
    })
  }

  return { remainingAmount, installmentAmount, rows }
}
