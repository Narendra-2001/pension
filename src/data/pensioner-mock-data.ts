import type {
  DemiseReport,
  LifeCertStatus,
  PensionerDashboardSummary,
  PensionerDocument,
  PensionerNotification,
  PensionerSettings,
  PensionStatement,
  RecoveryCase,
  VerificationHistoryEntry,
} from '@/types/pensioner-portal'
import type { PensionerRecord } from '@/types/pensioner'
import { calculatePensionAmounts, getPensionerFullName } from '@/types/pensioner'
import { buildStructureFromFlatPension, derivePensionDetails } from '@/lib/pension-structure'
import {
  calculateNextVerificationDueDate,
  formatVerificationDisplayDate,
} from '@/lib/verification-dates'

const PASSWORD_KEY = 'pensioner_passwords'

interface PensionerVerificationSchedule {
  lastVerificationDate: string
  nextVerificationDueDate: string
}

export const DEMO_PENSIONER = {
  ppoNumber: 'PPO123456',
  mobile: '9876543210',
} as const

export const DEMO_ACTIVATION_PPO = 'PPO789012'

function createRameshKumar(): PensionerRecord {
  const pensionPartial = {
    basicPension: 28500,
    dearnessRelief: 11970,
    medicalAllowance: 1000,
    specialAllowance: 2500,
    arrears: 12500,
    taxDeduction: 1800,
    recoveryDeduction: 1200,
  }
  const amounts = calculatePensionAmounts(pensionPartial)

  const baseRecord: PensionerRecord = {
    id: 'PEN-DEMO-001',
    personal: {
      firstName: 'Ramesh',
      middleName: 'Kumar',
      lastName: 'Sharma',
      gender: 'male',
      dateOfBirth: '1958-03-15',
      aadhaarNumber: '4567 8901 2345',
      panNumber: 'ABCDE1234F',
      mobileNumber: '+91 9876543210',
      alternateMobile: '+91 9123456780',
      emailAddress: 'ramesh.kumar.sharma@gov.in',
    },
    service: {
      employeeId: 'EMP-28456',
      department: 'Finance Department',
      designation: 'Deputy Secretary',
      officeName: 'Mumbai Regional Office',
      joiningDate: '1985-07-01',
      retirementDate: '2018-06-30',
      lastPayDrawn: 87500,
      pensionType: 'superannuation',
      ppoNumber: 'PPO123456',
      sanctionOrderNumber: 'SO/2018/4521',
    },
    address: {
      houseNumber: '42',
      street: 'Gandhi Nagar, Andheri West',
      villageCity: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400058',
    },
    bank: {
      accountHolderName: 'Ramesh Kumar Sharma',
      bankName: 'State Bank of India',
      branchName: 'Andheri West Branch',
      accountNumber: '30245678901',
      ifscCode: 'SBIN0001234',
      branchAddress: 'Andheri West, Mumbai, Maharashtra',
    },
    pension: { ...pensionPartial, ...amounts },
    nominee: {
      nomineeName: 'Suresh Kumar Sharma',
      relationship: 'Son',
      dateOfBirth: '1962-08-22',
      aadhaarNumber: '7890 1234 5678',
      mobileNumber: '+91 9123456780',
      percentageShare: 100,
      address: '42 Gandhi Nagar, Andheri West, Mumbai, Maharashtra - 400058',
    },
    documents: [
      { id: 'doc-aadhaar', name: 'Aadhaar', required: true, uploaded: true, fileName: 'aadhaar_ramesh.pdf' },
      { id: 'doc-pan', name: 'PAN', required: true, uploaded: true, fileName: 'pan_ramesh.pdf' },
      { id: 'doc-ppo', name: 'PPO Copy', required: true, uploaded: true, fileName: 'ppo_copy.pdf' },
      { id: 'doc-order', name: 'Pension Order', required: true, uploaded: true, fileName: 'pension_order.pdf' },
      { id: 'doc-photo', name: 'Photo', required: true, uploaded: true, fileName: 'photo_ramesh.jpg' },
      { id: 'doc-signature', name: 'Signature', required: true, uploaded: true, fileName: 'signature_ramesh.png' },
    ],
    status: 'active',
    verificationStatus: 'approved',
    activationStatus: 'activated',
    createdAt: '2024-01-15',
    updatedAt: '2025-11-20',
  }

  const structure = buildStructureFromFlatPension(baseRecord)
  return {
    ...baseRecord,
    pensionStructure: structure,
    pension: derivePensionDetails(structure.components),
  }
}

function createPendingActivationPensioner(): PensionerRecord {
  const pensionPartial = {
    basicPension: 22000,
    dearnessRelief: 9240,
    medicalAllowance: 1000,
    specialAllowance: 1500,
    arrears: 0,
    taxDeduction: 1200,
    recoveryDeduction: 0,
  }
  const amounts = calculatePensionAmounts(pensionPartial)

  return {
    id: 'PEN-DEMO-002',
    personal: {
      firstName: 'Priya',
      lastName: 'Nair',
      gender: 'female',
      dateOfBirth: '1965-11-08',
      aadhaarNumber: '3456 7890 1234',
      panNumber: 'FGHIJ5678K',
      mobileNumber: '+91 9123456789',
      emailAddress: 'priya.nair@gov.in',
    },
    service: {
      employeeId: 'EMP-31200',
      department: 'Education Board',
      designation: 'Assistant Director',
      officeName: 'Pune Regional Office',
      joiningDate: '1990-04-15',
      retirementDate: '2025-03-31',
      lastPayDrawn: 72000,
      pensionType: 'superannuation',
      ppoNumber: 'PPO789012',
      sanctionOrderNumber: 'SO/2025/1890',
    },
    address: {
      houseNumber: '15B',
      street: 'FC Road',
      villageCity: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
    },
    bank: {
      accountHolderName: 'Priya Nair',
      bankName: 'Bank of Baroda',
      branchName: 'FC Road Branch',
      accountNumber: '50123456789',
      ifscCode: 'BARB0FCROAD',
      branchAddress: 'FC Road, Pune, Maharashtra',
    },
    pension: { ...pensionPartial, ...amounts },
    nominee: {
      nomineeName: 'Arun Nair',
      relationship: 'Spouse',
      dateOfBirth: '1968-02-14',
      aadhaarNumber: '5678 9012 3456',
      mobileNumber: '+91 9988776655',
      percentageShare: 100,
      address: '15B FC Road, Pune, Maharashtra - 411004',
    },
    documents: [
      { id: 'doc-aadhaar', name: 'Aadhaar', required: true, uploaded: true, fileName: 'aadhaar_priya.pdf' },
      { id: 'doc-pan', name: 'PAN', required: true, uploaded: true, fileName: 'pan_priya.pdf' },
      { id: 'doc-ppo', name: 'PPO Copy', required: true, uploaded: false },
      { id: 'doc-order', name: 'Pension Order', required: true, uploaded: false },
      { id: 'doc-photo', name: 'Photo', required: true, uploaded: true, fileName: 'photo_priya.jpg' },
      { id: 'doc-signature', name: 'Signature', required: true, uploaded: false },
    ],
    status: 'pending_activation',
    verificationStatus: 'pending',
    activationStatus: 'sms_sent',
    createdAt: '2025-12-01',
    updatedAt: '2025-12-10',
  }
}

function createSuspendedDemoPensioner(): PensionerRecord {
  const pensionPartial = {
    basicPension: 22000,
    dearnessRelief: 9240,
    medicalAllowance: 1000,
    specialAllowance: 1500,
    arrears: 0,
    taxDeduction: 1200,
    recoveryDeduction: 0,
  }
  const amounts = calculatePensionAmounts(pensionPartial)

  return {
    id: 'PEN-SUSP-001',
    personal: {
      firstName: 'Geeta',
      middleName: undefined,
      lastName: 'Verma',
      gender: 'female',
      dateOfBirth: '1960-07-22',
      aadhaarNumber: '2345 6789 0123',
      panNumber: 'GVERM1234M',
      mobileNumber: '+91 9876512345',
      emailAddress: 'geeta.verma@gov.in',
    },
    service: {
      employeeId: 'EMP-19850',
      department: 'Health Services',
      designation: 'Superintendent',
      officeName: 'Jaipur Regional Office',
      joiningDate: '1988-08-01',
      retirementDate: '2020-06-30',
      lastPayDrawn: 68000,
      pensionType: 'superannuation',
      ppoNumber: 'PPO555001',
      sanctionOrderNumber: 'SO/2020/3340',
    },
    address: {
      houseNumber: '8',
      street: 'Civil Lines',
      villageCity: 'Jaipur',
      district: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302006',
    },
    bank: {
      accountHolderName: 'Geeta Verma',
      bankName: 'Punjab National Bank',
      branchName: 'Civil Lines Branch',
      accountNumber: '40112233445',
      ifscCode: 'PUNB0123400',
      branchAddress: 'Civil Lines, Jaipur, Rajasthan',
    },
    pension: { ...pensionPartial, ...amounts },
    nominee: {
      nomineeName: 'Ravi Verma',
      relationship: 'Son',
      dateOfBirth: '1985-04-10',
      aadhaarNumber: '8901 2345 6789',
      mobileNumber: '+91 9123456700',
      percentageShare: 100,
      address: '8 Civil Lines, Jaipur, Rajasthan - 302006',
    },
    documents: [
      { id: 'doc-aadhaar', name: 'Aadhaar', required: true, uploaded: true, fileName: 'aadhaar_geeta.pdf' },
      { id: 'doc-pan', name: 'PAN', required: true, uploaded: true, fileName: 'pan_geeta.pdf' },
      { id: 'doc-ppo', name: 'PPO Copy', required: true, uploaded: true, fileName: 'ppo_geeta.pdf' },
    ],
    status: 'suspended',
    verificationStatus: 'rejected',
    activationStatus: 'activated',
    createdAt: '2024-08-15',
    updatedAt: '2026-05-01',
  }
}

export const DEMO_SUSPENDED_PENSIONER = {
  ppoNumber: 'PPO555001',
  mobile: '9876512345',
} as const

let pensionerStore: PensionerRecord[] = [
  createRameshKumar(),
  createPendingActivationPensioner(),
  createSuspendedDemoPensioner(),
]

const defaultStatements: PensionStatement[] = [
  {
    id: 'stmt-1',
    month: 'June 2025',
    grossPension: 56470,
    recoveryAmount: 1200,
    deductions: 3000,
    netPension: 52270,
    status: 'pending',
    utrReference: 'NEFT20250601001',
    neftCreditedAt: '2025-06-01',
  },
  {
    id: 'stmt-2',
    month: 'May 2025',
    grossPension: 56470,
    recoveryAmount: 1200,
    deductions: 3000,
    netPension: 52270,
    status: 'paid',
    utrReference: 'NEFT20250501001',
    neftCreditedAt: '2025-05-01',
  },
  {
    id: 'stmt-3',
    month: 'April 2025',
    grossPension: 56470,
    recoveryAmount: 1200,
    deductions: 3000,
    netPension: 52270,
    status: 'paid',
    utrReference: 'NEFT20250401001',
    neftCreditedAt: '2025-04-01',
  },
  {
    id: 'stmt-4',
    month: 'March 2025',
    grossPension: 56470,
    recoveryAmount: 1200,
    deductions: 3000,
    netPension: 52270,
    status: 'paid',
    utrReference: 'NEFT20250301001',
    neftCreditedAt: '2025-03-01',
  },
  {
    id: 'stmt-5',
    month: 'February 2025',
    grossPension: 56470,
    recoveryAmount: 1200,
    deductions: 3000,
    netPension: 52270,
    status: 'paid',
    utrReference: 'NEFT20250201001',
    neftCreditedAt: '2025-02-01',
  },
  {
    id: 'stmt-6',
    month: 'January 2025',
    grossPension: 68970,
    recoveryAmount: 1200,
    deductions: 3000,
    netPension: 64770,
    status: 'paid',
    utrReference: 'NEFT20250101001',
    neftCreditedAt: '2025-01-01',
  },
  {
    id: 'stmt-7',
    month: 'December 2024',
    grossPension: 43970,
    recoveryAmount: 1200,
    deductions: 3000,
    netPension: 39770,
    status: 'paid',
    utrReference: 'NEFT20241201001',
    neftCreditedAt: '2024-12-01',
  },
  {
    id: 'stmt-8',
    month: 'November 2024',
    grossPension: 43970,
    recoveryAmount: 1200,
    deductions: 3000,
    netPension: 39770,
    status: 'paid',
    utrReference: 'NEFT20241101001',
    neftCreditedAt: '2024-11-01',
  },
]

let statementStore: Record<string, PensionStatement[]> = {
  'PEN-DEMO-001': [...defaultStatements],
}

const recoveryCase: RecoveryCase = {
  caseId: 'REC-2024-0892',
  reason: 'Excess pension credited due to pay revision adjustment',
  totalAmount: 24000,
  recoveredAmount: 14400,
  remainingBalance: 9600,
  installments: [
    { installmentNumber: 1, amount: 1200, status: 'paid', date: '2025-01-01' },
    { installmentNumber: 2, amount: 1200, status: 'paid', date: '2025-02-01' },
    { installmentNumber: 3, amount: 1200, status: 'paid', date: '2025-03-01' },
    { installmentNumber: 4, amount: 1200, status: 'paid', date: '2025-04-01' },
    { installmentNumber: 5, amount: 1200, status: 'paid', date: '2025-05-01' },
    { installmentNumber: 6, amount: 1200, status: 'paid', date: '2025-06-01' },
    { installmentNumber: 7, amount: 1200, status: 'paid', date: '2025-07-01' },
    { installmentNumber: 8, amount: 1200, status: 'paid', date: '2025-08-01' },
    { installmentNumber: 9, amount: 1200, status: 'paid', date: '2025-09-01' },
    { installmentNumber: 10, amount: 1200, status: 'paid', date: '2025-10-01' },
    { installmentNumber: 11, amount: 1200, status: 'paid', date: '2025-11-01' },
    { installmentNumber: 12, amount: 1200, status: 'paid', date: '2025-12-01' },
    { installmentNumber: 13, amount: 1200, status: 'pending', date: '2026-01-01' },
    { installmentNumber: 14, amount: 1200, status: 'pending', date: '2026-02-01' },
    { installmentNumber: 15, amount: 1200, status: 'pending', date: '2026-03-01' },
    { installmentNumber: 16, amount: 1200, status: 'pending', date: '2026-04-01' },
    { installmentNumber: 17, amount: 1200, status: 'pending', date: '2026-05-01' },
    { installmentNumber: 18, amount: 1200, status: 'pending', date: '2026-06-01' },
    { installmentNumber: 19, amount: 1200, status: 'pending', date: '2026-07-01' },
    { installmentNumber: 20, amount: 1200, status: 'pending', date: '2026-08-01' },
  ],
}

let verificationSchedules: Record<string, PensionerVerificationSchedule> = {
  'PEN-DEMO-001': {
    lastVerificationDate: '2025-06-15',
    nextVerificationDueDate: '2026-06-15',
  },
}

interface PensionerVerificationRejection {
  reason: string
  rejectedAt: string
}

let verificationRejections: Record<string, PensionerVerificationRejection> = {}

let notifications: PensionerNotification[] = [
  {
    id: 'notif-1',
    type: 'verification_reminder',
    title: 'Life Certificate Due',
    message: 'Your annual life certificate verification is due by 30 June 2026.',
    timestamp: '2026-06-01T09:00:00',
    read: false,
    details: 'Please submit your life certificate through the portal to avoid pension suspension.',
  },
  {
    id: 'notif-2',
    type: 'pension_update',
    title: 'May 2025 Pension Credited',
    message: 'Net pension of ₹52,270 has been credited to your bank account.',
    timestamp: '2026-05-01T14:30:00',
    read: false,
    details: 'Transaction reference: TXN20250501001. Account ending 8901.',
  },
  {
    id: 'notif-3',
    type: 'recovery_notice',
    title: 'Recovery Installment Deducted',
    message: '₹1,200 recovery installment deducted from May 2025 pension.',
    timestamp: '2026-05-01T14:35:00',
    read: true,
    details: 'Recovery Case ID: REC-2024-0892. Remaining balance: ₹9,600.',
  },
  {
    id: 'notif-4',
    type: 'document_request',
    title: 'Updated Bank Passbook Required',
    message: 'Please upload your latest bank passbook for verification.',
    timestamp: '2026-04-15T10:00:00',
    read: true,
  },
  {
    id: 'notif-5',
    type: 'system_announcement',
    title: 'Portal Maintenance Scheduled',
    message: 'Scheduled maintenance on 20 June 2026, 2:00 AM – 4:00 AM IST.',
    timestamp: '2026-06-10T08:00:00',
    read: false,
  },
]

let verificationHistories: Record<string, VerificationHistoryEntry[]> = {
  'PEN-DEMO-001': [
    {
      id: 'ver-1',
      submittedAt: '2025-06-15',
      status: 'approved',
      method: 'Digital Life Certificate',
      remarks: 'Verified via face capture and OTP',
    },
    {
      id: 'ver-2',
      submittedAt: '2024-06-20',
      status: 'approved',
      method: 'Digital Life Certificate',
    },
    {
      id: 'ver-3',
      submittedAt: '2023-07-05',
      status: 'approved',
      method: 'Physical Submission',
      remarks: 'Submitted at Mumbai Pension Office',
    },
  ],
}

let lifeCertStatuses: Record<string, LifeCertStatus> = {}

let demiseReports: DemiseReport[] = [
  {
    id: 'DMR-2026-0001',
    dateOfDeath: '2026-02-15',
    placeOfDeath: 'Kochi, Kerala',
    remarks: 'Death certificate submitted by family member. Awaiting verification.',
    certificateFileName: 'death-certificate-vikram-nair.pdf',
    status: 'submitted',
    submittedAt: '2026-03-01',
  },
]

let pensionerSettings: PensionerSettings = {
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: false,
  twoFactorEnabled: false,
}

function ensureVerificationHistory(pensionerId: string) {
  if (!verificationHistories[pensionerId]) {
    verificationHistories[pensionerId] = []
  }
}

function findPendingHistoryIndex(pensionerId: string) {
  const history = verificationHistories[pensionerId] ?? []
  return history.findIndex((entry) => entry.status === 'submitted' || entry.status === 'in_progress')
}

function updatePendingHistoryEntry(
  pensionerId: string,
  update: Partial<VerificationHistoryEntry> & Pick<VerificationHistoryEntry, 'status'>,
) {
  ensureVerificationHistory(pensionerId)
  const pendingIndex = findPendingHistoryIndex(pensionerId)
  if (pendingIndex < 0) return
  verificationHistories[pensionerId] = verificationHistories[pensionerId].map((entry, index) =>
    index === pendingIndex ? { ...entry, ...update } : entry,
  )
}

function loadPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORD_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function savePasswords(passwords: Record<string, string>) {
  localStorage.setItem(PASSWORD_KEY, JSON.stringify(passwords))
}

export function getPensionerPassword(ppoNumber: string): string {
  const passwords = loadPasswords()
  return passwords[ppoNumber] ?? 'Pension@123'
}

export function setPensionerPassword(ppoNumber: string, password: string) {
  const passwords = loadPasswords()
  passwords[ppoNumber] = password
  savePasswords(passwords)
}

export function findPensionerByPpo(ppoNumber: string): PensionerRecord | undefined {
  return pensionerStore.find(
    (p) => p.service.ppoNumber.toLowerCase() === ppoNumber.toLowerCase(),
  )
}

export function getPortalPensionerRecords(): PensionerRecord[] {
  return [...pensionerStore]
}

export function findPensionerById(id: string): PensionerRecord | undefined {
  return pensionerStore.find((p) => p.id === id)
}

export function updatePensionerRecord(record: PensionerRecord) {
  pensionerStore = pensionerStore.map((p) => (p.id === record.id ? record : p))
  return record
}

export function addPensionerNotification(
  notification: Omit<PensionerNotification, 'id' | 'timestamp' | 'read'>,
) {
  const entry: PensionerNotification = {
    ...notification,
    id: `notif-${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
  }
  notifications = [entry, ...notifications]
  return entry
}

export function getDashboardSummary(record: PensionerRecord): PensionerDashboardSummary {
  const schedule = verificationSchedules[record.id]
  return {
    ppoNumber: record.service.ppoNumber,
    pensionType: record.service.pensionType,
    status: record.status === 'active' ? 'Active' : record.status.replace('_', ' '),
    lastVerificationDate: schedule
      ? formatVerificationDisplayDate(schedule.lastVerificationDate)
      : '—',
    nextVerificationDueDate: schedule
      ? formatVerificationDisplayDate(schedule.nextVerificationDueDate)
      : '—',
    currentPensionAmount: record.pension.netPension,
    verificationStatus: record.verificationStatus,
    recoveryStatus: 'Active — ₹9,600 remaining',
    familyPensionStatus: 'Not Applicable',
  }
}

export function getPensionerVerificationSchedule(pensionerId: string) {
  const schedule = verificationSchedules[pensionerId]
  if (!schedule) return undefined
  return {
    lastVerificationDate: formatVerificationDisplayDate(schedule.lastVerificationDate),
    nextVerificationDueDate: formatVerificationDisplayDate(schedule.nextVerificationDueDate),
  }
}

export function recordLifeCertificateApproval(pensionerId: string, approvalDate: string) {
  const nextDueIso = calculateNextVerificationDueDate(approvalDate)

  verificationSchedules[pensionerId] = {
    lastVerificationDate: approvalDate,
    nextVerificationDueDate: nextDueIso,
  }

  const record = findPensionerById(pensionerId)
  if (record) {
    updatePensionerRecord({
      ...record,
      verificationStatus: 'approved',
      updatedAt: approvalDate,
    })
  }

  setLifeCertStatus(pensionerId, 'approved')
  clearLifeCertificateRejection(pensionerId)
  updatePendingHistoryEntry(pensionerId, {
    status: 'approved',
    remarks: 'Approved by pension administrator',
  })

  return {
    lastVerificationDate: formatVerificationDisplayDate(approvalDate),
    nextVerificationDueDate: formatVerificationDisplayDate(nextDueIso),
    nextVerificationDueDateIso: nextDueIso,
  }
}

export function recordLifeCertificateRejection(
  pensionerId: string,
  reason: string,
  rejectedAt: string,
) {
  verificationRejections[pensionerId] = { reason, rejectedAt }

  const record = findPensionerById(pensionerId)
  if (record) {
    updatePensionerRecord({
      ...record,
      verificationStatus: 'rejected',
      updatedAt: rejectedAt,
    })
  }

  setLifeCertStatus(pensionerId, 'rejected')
  updatePendingHistoryEntry(pensionerId, {
    status: 'rejected',
    remarks: reason,
  })
}

export function getPensionerVerificationRejection(pensionerId: string) {
  const rejection = verificationRejections[pensionerId]
  if (!rejection) return undefined
  return {
    reason: rejection.reason,
    rejectedAt: rejection.rejectedAt,
  }
}

export function clearLifeCertificateRejection(pensionerId: string) {
  delete verificationRejections[pensionerId]
}

export function getPensionerDocuments(record: PensionerRecord): PensionerDocument[] {
  const statusMap: Record<string, 'verified' | 'pending' | 'not_uploaded'> = {
    Aadhaar: 'verified',
    PAN: 'verified',
    'PPO Copy': 'verified',
    'Pension Order': 'verified',
    Photo: 'verified',
    Signature: 'verified',
  }
  return record.documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    fileName: doc.fileName,
    status: doc.uploaded ? (statusMap[doc.name] ?? 'pending') : 'not_uploaded',
    uploadedAt: doc.uploaded ? '2024-02-10' : undefined,
  }))
}

export function getStatements(pensionerId = 'PEN-DEMO-001') {
  return statementStore[pensionerId] ?? []
}

export function hasStatementForMonth(pensionerId: string, month: string) {
  return getStatements(pensionerId).some(
    (statement) => statement.month.toLowerCase() === month.toLowerCase(),
  )
}

export function addPensionStatement(pensionerId: string, statement: PensionStatement) {
  const existing = statementStore[pensionerId] ?? []
  statementStore = {
    ...statementStore,
    [pensionerId]: [statement, ...existing.filter((entry) => entry.month !== statement.month)],
  }
  return statement
}

export function getRecoveryCase() {
  return recoveryCase
}

export function getNotifications() {
  return notifications
}

export function markNotificationRead(id: string) {
  notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
}

export function getVerificationHistory(pensionerId: string) {
  return verificationHistories[pensionerId] ?? []
}

export function getLifeCertStatus(pensionerId: string): LifeCertStatus {
  return lifeCertStatuses[pensionerId] ?? 'not_started'
}

export function setLifeCertStatus(pensionerId: string, status: LifeCertStatus) {
  lifeCertStatuses[pensionerId] = status
}

export function submitLifeCertificate(pensionerId: string, isResubmission = false) {
  setLifeCertStatus(pensionerId, 'submitted')
  ensureVerificationHistory(pensionerId)
  const entry: VerificationHistoryEntry = {
    id: `ver-${Date.now()}`,
    submittedAt: new Date().toISOString().split('T')[0],
    status: 'submitted',
    method: 'Digital Life Certificate',
    remarks: isResubmission
      ? 'Resubmitted — pending admin review'
      : 'Submitted — pending admin review',
  }
  verificationHistories[pensionerId] = [entry, ...verificationHistories[pensionerId]]
  return entry
}

export function getDemiseReports() {
  return demiseReports
}

export function submitDemiseReport(report: Omit<DemiseReport, 'id' | 'status' | 'submittedAt'>) {
  const newReport: DemiseReport = {
    ...report,
    id: `DMR-2026-${String(demiseReports.length + 1).padStart(4, '0')}`,
    status: 'submitted',
    submittedAt: new Date().toISOString().split('T')[0],
  }
  demiseReports = [newReport, ...demiseReports]
  return newReport
}

export function getPensionerSettings() {
  return pensionerSettings
}

export function updatePensionerSettings(settings: Partial<PensionerSettings>) {
  pensionerSettings = { ...pensionerSettings, ...settings }
  return pensionerSettings
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPensionerDisplayName(record: PensionerRecord) {
  return getPensionerFullName(record.personal)
}

// Initialize demo password
setPensionerPassword(DEMO_PENSIONER.ppoNumber, 'Pension@123')
