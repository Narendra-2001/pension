import { resolvePensionerRef } from '@/data/admin-mock-data'
import { hasStatementForMonth } from '@/data/pensioner-mock-data'
import { getPensionerFullName } from '@/types/pensioner'
import type { BulkDisbursementRecord, BulkDisbursementResult } from '@/types/disbursement'

function resolveLinkedPensioner(record: Pick<BulkDisbursementRecord, 'ppoNumber' | 'pensionerId'>) {
  return resolvePensionerRef(record.ppoNumber) ?? (record.pensionerId ? resolvePensionerRef(record.pensionerId) : undefined)
}

export function buildSuggestedDisbursementDraft(record: BulkDisbursementRecord): Partial<BulkDisbursementRecord> {
  const resolved = resolveLinkedPensioner(record)
  const expectedNet = Math.max(0, record.grossPension - record.recoveryAmount - record.deductions)

  return {
    ppoNumber: resolved?.service.ppoNumber ?? record.ppoNumber,
    pensionerId: resolved?.id ?? record.pensionerId,
    pensionerName: resolved ? getPensionerFullName(resolved.personal) : record.pensionerName,
    grossPension: record.grossPension,
    recoveryAmount: record.recoveryAmount,
    deductions: record.deductions,
    netPension: expectedNet,
    utrReference: record.utrReference,
    creditDate: record.creditDate,
    status: record.status,
  }
}

export function applyDemoDisbursementFixes(record: BulkDisbursementRecord): BulkDisbursementRecord {
  const suggested = buildSuggestedDisbursementDraft(record)
  return { ...record, ...suggested }
}

export function validateBulkDisbursementRecord(
  record: Omit<BulkDisbursementRecord, 'isValid' | 'isDuplicate' | 'errors'>,
  paymentMonth: string,
  allRecords: BulkDisbursementRecord[],
): Pick<BulkDisbursementRecord, 'isValid' | 'isDuplicate' | 'errors' | 'pensionerId' | 'pensionerName'> {
  const errors: string[] = []
  const resolved = resolveLinkedPensioner(record)
  const duplicateInStore = resolved ? hasStatementForMonth(resolved.id, paymentMonth) : false
  const duplicateInBatch = allRecords.some(
    (row) => row.id !== record.id && row.ppoNumber.trim().toLowerCase() === record.ppoNumber.trim().toLowerCase(),
  )
  const isDuplicate = duplicateInStore || duplicateInBatch

  if (!resolved) {
    errors.push('PPO number not found in pensioner registry')
  }

  const expectedNet = record.grossPension - record.recoveryAmount - record.deductions
  if (Math.abs(expectedNet - record.netPension) > 0.01) {
    errors.push('Net pension does not match gross minus recovery and deductions')
  }

  if (isDuplicate) {
    errors.push(`Payment for ${paymentMonth} already exists for this PPO`)
  }

  if (!record.utrReference.trim()) {
    errors.push('UTR reference is required')
  }

  if (!record.creditDate.trim()) {
    errors.push('Credit date is required')
  }

  return {
    pensionerId: resolved?.id ?? record.pensionerId,
    pensionerName: resolved ? getPensionerFullName(resolved.personal) : record.pensionerName,
    isDuplicate,
    isValid: errors.length === 0,
    errors,
  }
}

export function applyBulkDisbursementRecordEdit(
  result: BulkDisbursementResult,
  recordId: string,
  updates: Partial<BulkDisbursementRecord>,
): BulkDisbursementResult {
  const draftRecords = result.records.map((record) =>
    record.id === recordId ? { ...record, ...updates } : record,
  )

  const records = draftRecords.map((record) => {
    const validation = validateBulkDisbursementRecord(record, result.paymentMonth, draftRecords)
    return { ...record, ...validation }
  })

  return summarizeBulkDisbursementResult(result, records)
}

export function summarizeBulkDisbursementResult(
  result: BulkDisbursementResult,
  records: BulkDisbursementRecord[],
): BulkDisbursementResult {
  const validRecords = records.filter((record) => record.isValid)

  return {
    ...result,
    records,
    totalRecords: records.length,
    validRecords: validRecords.length,
    invalidRecords: records.filter((record) => !record.isValid && !record.isDuplicate).length,
    duplicateRecords: records.filter((record) => record.isDuplicate).length,
    totalNetAmount: validRecords.reduce((sum, record) => sum + record.netPension, 0),
  }
}
