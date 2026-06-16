import { getPensionersStore, resolvePensionerRef } from '@/data/admin-mock-data'
import {
  addPensionStatement,
  addPensionerNotification,
  formatCurrency,
  hasStatementForMonth,
} from '@/data/pensioner-mock-data'
import { getPensionerFullName } from '@/types/pensioner'
import type {
  BulkDisbursementRecord,
  BulkDisbursementResult,
  ConfirmBulkDisbursementInput,
  ManualDisbursementInput,
} from '@/types/disbursement'
import type { PensionStatement } from '@/types/pensioner-portal'

function postPensionPayment(input: {
  pensionerId: string
  paymentMonth: string
  grossPension: number
  recoveryAmount: number
  deductions: number
  netPension: number
  status: PensionStatement['status']
  utrReference: string
  creditDate: string
  source: 'batch' | 'manual'
  recordedBy?: string
}): PensionStatement {
  const statement: PensionStatement = {
    id: `stmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    month: input.paymentMonth,
    grossPension: input.grossPension,
    recoveryAmount: input.recoveryAmount,
    deductions: input.deductions,
    netPension: input.netPension,
    status: input.status,
    utrReference: input.utrReference,
    neftCreditedAt: input.creditDate,
  }

  addPensionStatement(input.pensionerId, statement)

  if (input.status === 'paid') {
    addPensionerNotification({
      type: 'pension_update',
      title: `${input.paymentMonth} Pension Credited`,
      message: `Net pension of ${formatCurrency(input.netPension)} has been credited to your bank account.`,
      details: `Transaction reference: ${input.utrReference}. ${
        input.source === 'manual'
          ? `Posted manually by ${input.recordedBy ?? 'Pension Administrator'}.`
          : 'Batch disbursement posted by Pension Administrator.'
      }`,
    })
  }

  return statement
}

const DEMO_PPOS = ['PPO123456', 'PPO555001', 'PPO789012'] as const

function randomAmount(base: number, spread: number) {
  return base + Math.floor(Math.random() * spread)
}

function buildDemoRecord(
  index: number,
  paymentMonth: string,
  ppoNumber: string,
  pensionerName: string,
  pensionerId: string,
  gross: number,
  recovery: number,
  deductions: number,
  status: PensionStatement['status'],
  hasError: boolean,
  forceDuplicate: boolean,
): BulkDisbursementRecord {
  const net = gross - recovery - deductions
  const errors: string[] = []
  const resolved = hasError ? undefined : resolvePensionerRef(ppoNumber)
  const duplicateInStore =
    resolved ? hasStatementForMonth(resolved.id, paymentMonth) : false
  const isDuplicate = forceDuplicate || duplicateInStore

  if (hasError) errors.push('PPO number not found in pensioner registry')
  if (!hasError && !resolved) errors.push('PPO number not found in pensioner registry')
  if (hasError) errors.push('Net pension does not match gross minus recovery and deductions')
  if (isDuplicate) errors.push(`Payment for ${paymentMonth} already exists for this PPO`)

  const isValid = errors.length === 0

  return {
    id: `disb-${index + 1}`,
    rowNumber: index + 1,
    ppoNumber,
    pensionerName,
    pensionerId: resolved?.id ?? pensionerId,
    grossPension: gross,
    recoveryAmount: recovery,
    deductions,
    netPension: hasError ? net + 500 : net,
    utrReference: `NEFT${paymentMonth.replace(/\s/g, '').slice(-4)}${String(index + 1).padStart(3, '0')}`,
    creditDate: '2026-07-01',
    status,
    isValid,
    isDuplicate,
    errors,
  }
}

export function generateBulkDisbursementPreview(
  fileName: string,
  paymentMonth: string,
): BulkDisbursementResult {
  const pensioners = getPensionersStore().filter((p) => p.status === 'active' || p.status === 'suspended')
  const count = fileName.endsWith('.csv') ? Math.min(10, pensioners.length) : Math.min(15, pensioners.length)

  const records: BulkDisbursementRecord[] = Array.from({ length: count }, (_, index) => {
    const pensioner = pensioners[index % pensioners.length]
    const name = getPensionerFullName(pensioner.personal)
    const gross = randomAmount(pensioner.pension.grossPension || 42000, 4000)
    const recovery = pensioner.pension.recoveryDeduction || 0
    const deductions = pensioner.pension.taxDeduction || 2000
    const hasError = index === 2
    const isDuplicate = index === 5

    const ppoNumber =
      index < DEMO_PPOS.length
        ? DEMO_PPOS[index]!
        : pensioner.service.ppoNumber

    return buildDemoRecord(
      index,
      paymentMonth,
      hasError ? 'PPO-INVALID' : ppoNumber,
      name,
      pensioner.id,
      gross,
      recovery,
      deductions,
      index === 7 ? 'failed' : 'paid',
      hasError,
      isDuplicate,
    )
  })

  const validRecords = records.filter((record) => record.isValid)

  return {
    paymentMonth,
    fileName,
    totalRecords: count,
    validRecords: validRecords.length,
    invalidRecords: records.filter((record) => !record.isValid && !record.isDuplicate).length,
    duplicateRecords: records.filter((record) => record.isDuplicate).length,
    totalNetAmount: validRecords.reduce((sum, record) => sum + record.netPension, 0),
    records,
  }
}

export function confirmBulkDisbursement(
  input: ConfirmBulkDisbursementInput,
): { processed: number; totalNetAmount: number } {
  const validRecords = input.preview.records.filter(
    (record) => record.isValid && input.recordIds.includes(record.id),
  )

  for (const record of validRecords) {
    const pensioner = resolvePensionerRef(record.ppoNumber)
    if (!pensioner) continue

    postPensionPayment({
      pensionerId: pensioner.id,
      paymentMonth: input.paymentMonth,
      grossPension: record.grossPension,
      recoveryAmount: record.recoveryAmount,
      deductions: record.deductions,
      netPension: record.netPension,
      status: record.status,
      utrReference: record.utrReference,
      creditDate: record.creditDate,
      source: 'batch',
    })
  }

  return {
    processed: validRecords.length,
    totalNetAmount: validRecords.reduce((sum, record) => sum + record.netPension, 0),
  }
}

export function recordManualDisbursement(input: ManualDisbursementInput): PensionStatement {
  const pensioner = resolvePensionerRef(input.pensionerId)
  if (!pensioner) throw new Error('Pensioner not found')
  if (!['active', 'suspended'].includes(pensioner.status)) {
    throw new Error('Payments can only be posted for active or suspended pensioners')
  }
  if (hasStatementForMonth(pensioner.id, input.paymentMonth)) {
    throw new Error(`Payment for ${input.paymentMonth} already exists for this pensioner`)
  }

  const expectedNet = input.grossPension - input.recoveryAmount - input.deductions
  if (Math.abs(expectedNet - input.netPension) > 0.01) {
    throw new Error('Net pension does not match gross minus recovery and deductions')
  }

  return postPensionPayment({
    pensionerId: pensioner.id,
    paymentMonth: input.paymentMonth,
    grossPension: input.grossPension,
    recoveryAmount: input.recoveryAmount,
    deductions: input.deductions,
    netPension: input.netPension,
    status: input.status,
    utrReference: input.utrReference,
    creditDate: input.creditDate,
    source: 'manual',
    recordedBy: input.recordedBy,
  })
}
