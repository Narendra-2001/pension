import type { FamilyPensionInitiationFormValues } from '@/lib/demise-schema'
import type {
  DemiseAuditAction,
  DemiseDocumentType,
  DemiseIntimationStatus,
  FamilyPensionStatus,
} from '@/types/demise'

export const DEMISE_STATUS_LABELS: Record<DemiseIntimationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_verification: 'Under Verification',
  needs_clarification: 'Needs Clarification',
  approved: 'Approved',
  rejected: 'Rejected',
  reversed: 'Reversed',
}

export const FAMILY_PENSION_STATUS_LABELS: Record<FamilyPensionStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  eligibility_check: 'Eligibility Check',
  approved: 'Approved',
  rejected: 'Rejected',
  activated: 'Activated',
}

export const DEMISE_DOCUMENT_LABELS: Record<DemiseDocumentType, string> = {
  death_certificate: 'Death Certificate',
  hospital_certificate: 'Hospital Certificate',
  legal_heir_certificate: 'Legal Heir Certificate',
  identity_proof: 'Identity Proof',
  supporting_document: 'Supporting Document',
}

export const DEMISE_AUDIT_ACTION_LABELS: Record<DemiseAuditAction, string> = {
  intimation_submitted: 'Intimation Submitted',
  document_uploaded: 'Document Uploaded',
  verification_started: 'Verification Started',
  clarification_requested: 'Clarification Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  pension_status_changed: 'Pension Status Changed',
  recovery_triggered: 'Recovery Triggered',
  family_pension_created: 'Family Pension Created',
  reversal_initiated: 'Reversal Initiated',
  status_changed: 'Status Changed',
}

export const NOMINEE_RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Legal Heir',
  'Other',
] as const

export function formatDemiseCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function isDemisePending(status: DemiseIntimationStatus): boolean {
  return ['submitted', 'under_verification', 'needs_clarification'].includes(status)
}

export function calculateExcessPension(
  dateOfDeath: string,
  monthlyPension: number,
  payments: { month: string; amount: number; paidDate: string }[],
): { paymentsAfterDeath: typeof payments; totalExcessAmount: number } {
  const deathDate = new Date(dateOfDeath)
  const paymentsAfterDeath = payments.filter((p) => new Date(p.paidDate) > deathDate)
  const totalExcessAmount =
    paymentsAfterDeath.length > 0
      ? paymentsAfterDeath.reduce((sum, p) => sum + p.amount, 0)
      : Math.max(0, Math.ceil((Date.now() - deathDate.getTime()) / (30 * 24 * 60 * 60 * 1000))) *
        monthlyPension

  return { paymentsAfterDeath, totalExcessAmount }
}

export function generateMonthlyPaymentsAfterDeath(
  dateOfDeath: string,
  monthlyPension: number,
  monthsAhead = 6,
): { month: string; amount: number; paidDate: string }[] {
  const deathDate = new Date(dateOfDeath)
  const payments: { month: string; amount: number; paidDate: string }[] = []
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  for (let i = 0; i < monthsAhead; i++) {
    const payDate = new Date(deathDate)
    payDate.setMonth(payDate.getMonth() + i + 1)
    payDate.setDate(1)
    if (payDate <= deathDate) continue
    payments.push({
      month: `${monthNames[payDate.getMonth()]} ${payDate.getFullYear()}`,
      amount: monthlyPension,
      paidDate: payDate.toISOString().split('T')[0],
    })
  }

  return payments
}

/** Demo values for family pension initiation form (government pension workflow). */
export function getFamilyPensionDemoFormValues(input: {
  nomineeName: string
  relationship: string
  mobileNumber: string
}): FamilyPensionInitiationFormValues {
  const mobile = input.mobileNumber.replace(/\D/g, '').slice(-10)
  return {
    nomineeName: input.nomineeName,
    relationship: input.relationship,
    mobileNumber: mobile.length === 10 ? mobile : '9123456780',
    address: '42 Gandhi Nagar, Andheri West, Mumbai, Maharashtra - 400058',
    accountHolderName: input.nomineeName,
    bankName: 'State Bank of India',
    branchName: 'Andheri West Branch',
    accountNumber: '30112233445',
    ifscCode: 'SBIN0001234',
  }
}
