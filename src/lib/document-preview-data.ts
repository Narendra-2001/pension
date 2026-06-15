import { findPensionerById } from '@/data/pensioner-mock-data'
import { PENSION_TYPE_LABELS } from '@/lib/pension-structure'
import { formatCurrency } from '@/data/pensioner-mock-data'
import type { PensionDocument } from '@/types/documents'
import type { PensionerRecord } from '@/types/pensioner'
import { getPensionerFullName } from '@/types/pensioner'

export interface DocumentPreviewContext {
  holderName: string
  aadhaarNumber: string
  panNumber: string
  dateOfBirth: string
  gender: string
  fatherName: string
  ppoNumber: string
  address: string
  bankName: string
  accountNumber: string
  ifscCode: string
  department: string
  designation: string
  retirementDate: string
  netPension: string
  grossPension: string
  pensionType: string
  sanctionOrderNumber: string
  employeeId: string
}

function buildAddress(record: PensionerRecord) {
  const { address } = record
  return `${address.houseNumber}, ${address.street}, ${address.villageCity}, ${address.district}, ${address.state} - ${address.pincode}`
}

function buildContextFromRecord(record: PensionerRecord): DocumentPreviewContext {
  const fatherName =
    record.id === 'PEN-DEMO-001'
      ? 'Krishna Kumar Sharma'
      : `${record.personal.middleName ?? ''} ${record.personal.lastName}`.trim() || '—'

  return {
    holderName: getPensionerFullName(record.personal),
    aadhaarNumber: record.personal.aadhaarNumber,
    panNumber: record.personal.panNumber,
    dateOfBirth: record.personal.dateOfBirth,
    gender: record.personal.gender === 'male' ? 'Male' : record.personal.gender === 'female' ? 'Female' : 'Other',
    fatherName,
    ppoNumber: record.service.ppoNumber,
    address: buildAddress(record),
    bankName: record.bank.bankName,
    accountNumber: record.bank.accountNumber,
    ifscCode: record.bank.ifscCode,
    department: record.service.department,
    designation: record.service.designation,
    retirementDate: record.service.retirementDate,
    netPension: formatCurrency(record.pension.netPension),
    grossPension: formatCurrency(record.pension.grossPension),
    pensionType: PENSION_TYPE_LABELS[record.service.pensionType],
    sanctionOrderNumber: record.service.sanctionOrderNumber,
    employeeId: record.service.employeeId,
  }
}

const FALLBACK_CONTEXT: DocumentPreviewContext = {
  holderName: 'Ramesh Kumar Sharma',
  aadhaarNumber: '4567 8901 2345',
  panNumber: 'ABCDE1234F',
  dateOfBirth: '1958-03-15',
  gender: 'Male',
  fatherName: 'Krishna Kumar Sharma',
  ppoNumber: 'PPO123456',
  address: '42, Gandhi Nagar, Andheri West, Mumbai, Maharashtra - 400058',
  bankName: 'State Bank of India',
  accountNumber: '30245678901',
  ifscCode: 'SBIN0001234',
  department: 'Finance Department',
  designation: 'Deputy Secretary',
  retirementDate: '2018-06-30',
  netPension: '₹52,430',
  grossPension: '₹58,970',
  pensionType: 'Service Pension',
  sanctionOrderNumber: 'SO/2018/4521',
  employeeId: 'EMP-28456',
}

export function getDocumentPreviewContext(document: PensionDocument): DocumentPreviewContext {
  const record = findPensionerById(document.pensionerId)
  if (record) return buildContextFromRecord(record)

  return {
    ...FALLBACK_CONTEXT,
    holderName: document.pensionerName,
    ppoNumber: document.ppoNumber,
  }
}

/** Document types that render a realistic visual preview instead of generic placeholders */
export const REALISTIC_DOCUMENT_PREVIEWS = new Set<PensionDocument['documentType']>([
  'aadhaar_card',
  'pan_card',
  'nominee_aadhaar',
  'ppo_copy',
  'pension_sanction_order',
  'retirement_order',
  'life_certificate',
  'bank_passbook',
  'cancelled_cheque',
  'passport_photo',
  'signature',
  'relationship_proof',
  'restoration_supporting',
  'death_certificate',
  'legal_heir_certificate',
  'recovery_notice',
  'recovery_evidence',
])

export function hasRealisticDocumentPreview(documentType: PensionDocument['documentType']) {
  return REALISTIC_DOCUMENT_PREVIEWS.has(documentType)
}
