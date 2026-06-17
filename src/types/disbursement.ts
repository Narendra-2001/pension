import type { PensionStatement } from '@/types/pensioner-portal'

export interface BulkDisbursementRecord {
  id: string
  rowNumber: number
  ppoNumber: string
  pensionerName: string
  pensionerId?: string
  grossPension: number
  recoveryAmount: number
  deductions: number
  netPension: number
  utrReference: string
  creditDate: string
  status: PensionStatement['status']
  isValid: boolean
  isDuplicate: boolean
  errors: string[]
}

export interface BulkDisbursementResult {
  paymentMonth: string
  fileName: string
  totalRecords: number
  validRecords: number
  invalidRecords: number
  duplicateRecords: number
  totalNetAmount: number
  records: BulkDisbursementRecord[]
}

export interface ConfirmBulkDisbursementInput {
  paymentMonth: string
  recordIds: string[]
  preview: BulkDisbursementResult
}

export type MonthlyPaymentChangeCategory =
  | 'new_pensioner'
  | 'family_pension'
  | 'reactivation'
  | 'deceased'
  | 'suspended'
  | 'dr_revision'
  | 'medical_allowance_revision'
  | 'correction'

export interface MonthlyPaymentAccountChange {
  id: string
  category: MonthlyPaymentChangeCategory
  label: string
  description: string
  accountDelta: number
  payoutDelta?: number
}

export interface MonthlyPaymentAccountSample {
  ppoNumber: string
  pensionerName: string
  reason: string
  category: MonthlyPaymentChangeCategory
}

export interface MonthlyPaymentForecast {
  nextMonth: string
  projectedNewPensioners: number
  projectedFamilyPension: number
  projectedNetAccountChange: number
  projectedAccountTotal: number
  projectedPayoutIncrease: number
  summary: string
}

export interface MonthlyPaymentAccountSummary {
  paymentMonth: string
  previousMonth: string
  previousMonthAccounts: number
  currentMonthAccounts: number
  netAccountChange: number
  changePercent: number
  previousMonthPayout: number
  currentMonthPayout: number
  netPayoutChange: number
  changes: MonthlyPaymentAccountChange[]
  samples: MonthlyPaymentAccountSample[]
  narrativeSummary: string
  forecast: MonthlyPaymentForecast
}

export interface ManualDisbursementInput {
  pensionerId: string
  paymentMonth: string
  grossPension: number
  recoveryAmount: number
  deductions: number
  netPension: number
  utrReference: string
  creditDate: string
  status: PensionStatement['status']
  remarks?: string
  recordedBy?: string
}
