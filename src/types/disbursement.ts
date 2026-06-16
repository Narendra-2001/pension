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
