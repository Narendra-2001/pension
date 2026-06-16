import type {
  BulkImportRecord,
  BulkImportResult,
  DashboardStats,
  DepartmentPensionerCount,
  DocumentUpload,
  PensionDetails,
  PensionerListItem,
  PensionerRecord,
  PensionerStatus,
  PensionType,
  RecentActivity,
  RecentPensionApplication,
  VerificationStatus,
} from '@/types/pensioner'
import { getPortalPensionerRecords } from '@/data/pensioner-mock-data'
import { calculatePensionAmounts, getPensionerFullName } from '@/types/pensioner'
import { buildStructureFromFlatPension, derivePensionDetails } from '@/lib/pension-structure'

const firstNames = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Lakshmi', 'Suresh', 'Meena',
  'Arun', 'Kavita', 'Ramesh', 'Anita', 'Deepak', 'Pooja', 'Sanjay', 'Rekha',
  'Manoj', 'Geeta', 'Ashok', 'Nirmala', 'Prakash', 'Sarita', 'Harish', 'Usha',
  'Gopal', 'Radha', 'Mohan', 'Indira', 'Krishna', 'Padma',
]
const middleNames = ['Kumar', 'Devi', 'Chandra', 'Bai', 'Singh', 'Lal', '']
const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Gupta', 'Iyer',
  'Joshi', 'Das', 'Rao', 'Verma', 'Mishra', 'Pillai', 'Chatterjee', 'Menon',
]
const departments = [
  'Finance Department', 'Revenue Department', 'Education Board', 'Health Services',
  'Municipal Corporation', 'Police Department', 'Transport Authority', 'Judiciary',
]
const designations = [
  'Section Officer', 'Deputy Secretary', 'Assistant Director', 'Clerk',
  'Superintendent', 'Inspector', 'Engineer', 'Teacher',
]
const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh']
const districts = ['Mumbai', 'Pune', 'Bengaluru', 'Chennai', 'Ahmedabad', 'Jaipur', 'Lucknow']
const banks = ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank']
const pensionTypes: PensionType[] = [
  'superannuation', 'family_pension', 'voluntary_retirement', 'compassionate', 'disability',
]
const statuses: PensionerStatus[] = [
  'active', 'active', 'active', 'active', 'pending_activation', 'suspended', 'deceased',
]
const verificationStatuses: VerificationStatus[] = ['approved', 'approved', 'pending', 'rejected']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(startYear: number, endYear: number): string {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1))
  const month = 1 + Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function mockPpoNumber(index: number): string {
  return `PPO${String(100001 + index).padStart(6, '0')}`
}

function generateDocuments(): DocumentUpload[] {
  const docs = [
    'Aadhaar Card', 'PAN Card', 'PPO Copy', 'Retirement Order', 'Pension Sanction Order',
    'Bank Passbook', 'Passport Size Photo', 'Signature', 'Nominee Proof', 'Address Proof',
  ]
  return docs.map((name, i) => ({
    id: `doc-${i}`,
    name,
    required: true,
    uploaded: Math.random() > 0.2,
    fileName: Math.random() > 0.2 ? `${name.toLowerCase().replace(/\s/g, '_')}.pdf` : undefined,
  }))
}

function createPensioner(index: number): PensionerRecord {
  const fn = randomFrom(firstNames)
  const mn = randomFrom(middleNames)
  const ln = randomFrom(lastNames)
  const status = randomFrom(statuses)
  const verificationStatus = randomFrom(verificationStatuses)
  const pensionType = randomFrom(pensionTypes)
  const basicPension = 15000 + Math.floor(Math.random() * 35000)
  const pensionPartial = {
    basicPension,
    dearnessRelief: Math.floor(basicPension * 0.42),
    medicalAllowance: 1000,
    specialAllowance: Math.floor(Math.random() * 3000),
    arrears: Math.floor(Math.random() * 50000),
    taxDeduction: Math.floor(Math.random() * 2000),
    recoveryDeduction: Math.floor(Math.random() * 1500),
  }
  const amounts = calculatePensionAmounts(pensionPartial)
  const createdAt = randomDate(2023, 2025)

  return {
    id: `PEN-${String(index + 1).padStart(5, '0')}`,
    personal: {
      firstName: fn,
      middleName: mn || undefined,
      lastName: ln,
      gender: randomFrom(['male', 'female', 'other'] as const),
      dateOfBirth: randomDate(1945, 1970),
      aadhaarNumber: `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      mobileNumber: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      alternateMobile: Math.random() > 0.5 ? `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}` : undefined,
      emailAddress: `${fn.toLowerCase()}.${ln.toLowerCase()}@gov.in`,
    },
    service: {
      employeeId: `EMP-${String(10000 + index)}`,
      department: randomFrom(departments),
      designation: randomFrom(designations),
      officeName: `${randomFrom(districts)} Regional Office`,
      joiningDate: randomDate(1975, 1995),
      retirementDate: randomDate(2015, 2024),
      lastPayDrawn: 45000 + Math.floor(Math.random() * 80000),
      pensionType,
      ppoNumber: mockPpoNumber(index),
      sanctionOrderNumber: `SO/${2020 + (index % 5)}/${String(5000 + index)}`,
    },
    address: {
      houseNumber: `${Math.floor(1 + Math.random() * 200)}`,
      street: `${randomFrom(['MG Road', 'Station Road', 'Gandhi Nagar', 'Nehru Colony', 'Shivaji Marg'])}`,
      villageCity: randomFrom(districts),
      district: randomFrom(districts),
      state: randomFrom(states),
      pincode: String(400000 + Math.floor(Math.random() * 99999)),
    },
    bank: {
      accountHolderName: getPensionerFullName({ firstName: fn, middleName: mn, lastName: ln } as never),
      bankName: randomFrom(banks),
      branchName: `${randomFrom(districts)} Main Branch`,
      accountNumber: String(Math.floor(100000000000 + Math.random() * 899999999999)),
      ifscCode: `${randomFrom(['SBIN', 'BARB', 'PNBN', 'CNRB'])}0${String(Math.floor(100000 + Math.random() * 899999))}`,
      branchAddress: `${randomFrom(districts)}, ${randomFrom(states)}`,
    },
    pension: { ...pensionPartial, ...amounts },
    pensionStructure: undefined,
    nominee: {
      nomineeName: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
      relationship: randomFrom(['Spouse', 'Son', 'Daughter', 'Brother', 'Sister']),
      dateOfBirth: randomDate(1960, 2000),
      aadhaarNumber: `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      mobileNumber: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      percentageShare: 100,
      address: `${randomFrom(districts)}, ${randomFrom(states)}`,
    },
    documents: generateDocuments(),
    status,
    verificationStatus,
    activationStatus: status === 'pending_activation' ? 'pending' : 'activated',
    createdAt,
    updatedAt: createdAt,
  }
}

export const pensionerRecords: PensionerRecord[] = Array.from({ length: 85 }, (_, i) => {
  const record = createPensioner(i)
  const structure = buildStructureFromFlatPension(record)
  return {
    ...record,
    pensionStructure: structure,
    pension: derivePensionDetails(structure.components),
  }
})

export function toListItem(record: PensionerRecord): PensionerListItem {
  return {
    id: record.id,
    ppoNumber: record.service.ppoNumber,
    name: getPensionerFullName(record.personal),
    gender: record.personal.gender,
    mobileNumber: record.personal.mobileNumber,
    emailAddress: record.personal.emailAddress,
    pensionType: record.service.pensionType,
    status: record.status,
    verificationStatus: record.verificationStatus,
    activationStatus: record.activationStatus,
    createdAt: record.createdAt,
  }
}

export const pensionerListItems = pensionerRecords.map(toListItem)

export const dashboardStats: DashboardStats = {
  totalPensioners: 5247,
  activePensioners: pensionerRecords.filter((p) => p.status === 'active').length + 4800,
  pendingActivations: pensionerRecords.filter((p) => p.status === 'pending_activation').length + 42,
  pendingVerifications: pensionerRecords.filter((p) => p.verificationStatus === 'pending').length + 28,
  suspendedPensioners: pensionerRecords.filter((p) => p.status === 'suspended').length + 15,
  deceasedPensioners: pensionerRecords.filter((p) => p.status === 'deceased').length + 8,
}

export const statusDistribution = [
  { name: 'Active', value: dashboardStats.activePensioners, fill: 'var(--color-active)' },
  { name: 'Pending Activation', value: dashboardStats.pendingActivations, fill: 'var(--color-pending)' },
  { name: 'Suspended', value: dashboardStats.suspendedPensioners, fill: 'var(--color-suspended)' },
  { name: 'Deceased', value: dashboardStats.deceasedPensioners, fill: 'var(--color-deceased)' },
]

export const statusDistributionTrend = [
  { month: 'Jan', active: 72, pendingActivation: 14, suspended: 5, deceased: 2 },
  { month: 'Feb', active: 68, pendingActivation: 16, suspended: 4, deceased: 1 },
  { month: 'Mar', active: 61, pendingActivation: 18, suspended: 6, deceased: 3 },
  { month: 'Apr', active: 55, pendingActivation: 15, suspended: 7, deceased: 2 },
  { month: 'May', active: 50, pendingActivation: 12, suspended: 5, deceased: 2 },
  { month: 'Jun', active: 48, pendingActivation: 10, suspended: 4, deceased: 1 },
  { month: 'Jul', active: 52, pendingActivation: 11, suspended: 3, deceased: 2 },
  { month: 'Aug', active: 56, pendingActivation: 9, suspended: 4, deceased: 1 },
  { month: 'Sep', active: 60, pendingActivation: 8, suspended: 3, deceased: 2 },
  { month: 'Oct', active: 58, pendingActivation: 7, suspended: 2, deceased: 1 },
]

export const statusDistributionSeries = [
  { dataKey: 'active', name: 'Active', color: 'hsl(38, 92%, 50%)' },
  { dataKey: 'pendingActivation', name: 'Pending Activation', color: 'hsl(215, 16%, 47%)' },
  { dataKey: 'suspended', name: 'Suspended', color: 'hsl(48, 96%, 53%)' },
  { dataKey: 'deceased', name: 'Deceased', color: 'hsl(217, 91%, 60%)' },
] as const

export const monthlyOnboarding = [
  { month: 'Jan', count: 45 },
  { month: 'Feb', count: 52 },
  { month: 'Mar', count: 38 },
  { month: 'Apr', count: 61 },
  { month: 'May', count: 55 },
  { month: 'Jun', count: 48 },
  { month: 'Jul', count: 72 },
  { month: 'Aug', count: 65 },
  { month: 'Sep', count: 58 },
  { month: 'Oct', count: 80 },
  { month: 'Nov', count: 67 },
  { month: 'Dec', count: 74 },
]

export const monthlyOnboardingSeries = [
  { dataKey: 'count', name: 'New pensioners', color: 'hsl(217, 91%, 60%)' },
] as const

export const onboardingChannelBreakdown = [
  { channel: 'Direct registration', count: 372, color: 'hsl(217, 91%, 60%)' },
  { channel: 'Bulk import', count: 243, color: 'hsl(262, 83%, 58%)' },
  { channel: 'Department referral', count: 100, color: 'hsl(142, 76%, 36%)' },
]

export const onboardingTopDepartments = [
  { department: 'Education', count: 142 },
  { department: 'Health', count: 118 },
  { department: 'Finance', count: 96 },
  { department: 'Police', count: 84 },
]

export const verificationOverview = [
  { name: 'Approved', value: 4890, fill: 'var(--color-approved)' },
  { name: 'Pending', value: dashboardStats.pendingVerifications, fill: 'var(--color-pending)' },
  { name: 'Rejected', value: 12, fill: 'var(--color-rejected)' },
]

export const pensionersByDepartment: DepartmentPensionerCount[] = [
  { department: 'Education', count: 1240 },
  { department: 'Health', count: 980 },
  { department: 'Finance', count: 860 },
  { department: 'Police', count: 720 },
  { department: 'Revenue', count: 640 },
  { department: 'Transport', count: 520 },
  { department: 'Judiciary', count: 410 },
  { department: 'Municipal', count: 380 },
]

export const recentPensionApplications: RecentPensionApplication[] = [
  {
    id: 'app-1',
    applicant: 'Rajesh Kumar Sharma',
    department: 'Education Board',
    appliedOn: '2025-06-14',
    status: 'approved',
    amount: 42500,
  },
  {
    id: 'app-2',
    applicant: 'Priya Patel',
    department: 'Health Services',
    appliedOn: '2025-06-13',
    status: 'pending',
    amount: 38200,
  },
  {
    id: 'app-3',
    applicant: 'Amit Singh',
    department: 'Finance Department',
    appliedOn: '2025-06-13',
    status: 'approved',
    amount: 51800,
  },
  {
    id: 'app-4',
    applicant: 'Sunita Reddy',
    department: 'Police Department',
    appliedOn: '2025-06-12',
    status: 'rejected',
    amount: 29400,
  },
  {
    id: 'app-5',
    applicant: 'Vikram Nair',
    department: 'Transport Authority',
    appliedOn: '2025-06-12',
    status: 'approved',
    amount: 36750,
  },
  {
    id: 'app-6',
    applicant: 'Lakshmi Iyer',
    department: 'Judiciary',
    appliedOn: '2025-06-11',
    status: 'pending',
    amount: 44100,
  },
]

export const recentActivities: RecentActivity[] = [
  {
    id: 'act-1',
    type: 'new_pensioner',
    title: 'New Pensioner Added',
    description: 'Rajesh Kumar Sharma registered with PPO100001',
    timestamp: '2025-06-14T09:30:00',
    pensionerId: 'PEN-00001',
  },
  {
    id: 'act-2',
    type: 'pending_activation',
    title: 'Pending Activation',
    description: 'Priya Patel account awaiting activation — SMS sent',
    timestamp: '2025-06-14T08:45:00',
    pensionerId: 'PEN-00005',
  },
  {
    id: 'act-3',
    type: 'verification_request',
    title: 'Verification Request',
    description: 'Life certificate submitted by Amit Singh for review',
    timestamp: '2025-06-14T07:20:00',
    pensionerId: 'PEN-00012',
  },
  {
    id: 'act-4',
    type: 'suspension_request',
    title: 'Suspension Request',
    description: 'Suspension request raised for Sunita Reddy — excess payment',
    timestamp: '2025-06-13T16:10:00',
    pensionerId: 'PEN-00008',
  },
  {
    id: 'act-5',
    type: 'new_pensioner',
    title: 'New Pensioner Added',
    description: 'Vikram Nair onboarded via bulk import',
    timestamp: '2025-06-13T14:00:00',
    pensionerId: 'PEN-00020',
  },
  {
    id: 'act-6',
    type: 'verification_request',
    title: 'Verification Request',
    description: 'Annual verification due for Lakshmi Iyer',
    timestamp: '2025-06-13T11:30:00',
    pensionerId: 'PEN-00015',
  },
]

export function generateBulkImportPreview(fileName: string): BulkImportResult {
  const count = fileName.endsWith('.pdf') ? 5 : fileName.endsWith('.csv') ? 12 : 18
  const records: BulkImportRecord[] = Array.from({ length: count }, (_, i) => {
    const fn = randomFrom(firstNames)
    const ln = randomFrom(lastNames)
    const hasError = i === 2 || i === 7
    const isDuplicate = i === 4 || i === 11
    const errors: string[] = []
    if (hasError) errors.push('Invalid IFSC code format')
    if (hasError) errors.push('Aadhaar number checksum failed')
    if (isDuplicate) errors.push('Duplicate PPO number detected')

    return {
      id: `import-${i + 1}`,
      rowNumber: i + 1,
      personal: {
        firstName: fn,
        lastName: ln,
        mobileNumber: hasError ? 'invalid' : `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
        emailAddress: `${fn.toLowerCase()}@gov.in`,
        aadhaarNumber: hasError ? '1234' : `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      },
      service: {
        ppoNumber: isDuplicate ? pensionerRecords[0].service.ppoNumber : `PPO${String(200001 + i).padStart(6, '0')}`,
        department: randomFrom(departments),
        pensionType: randomFrom(pensionTypes),
        employeeId: `EMP-BULK-${String(1000 + i)}`,
      },
      bank: {
        bankName: randomFrom(banks),
        accountNumber: String(Math.floor(100000000000 + Math.random() * 899999999999)),
        ifscCode: hasError ? 'INVALID' : `SBIN0${Math.floor(100000 + Math.random() * 899999)}`,
      },
      pension: {
        basicPension: 18000 + Math.floor(Math.random() * 20000),
      },
      nominee: {
        nomineeName: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
        relationship: 'Spouse',
      },
      isValid: !hasError && !isDuplicate,
      isDuplicate,
      errors,
    }
  })

  return {
    totalRecords: count,
    validRecords: records.filter((r) => r.isValid).length,
    invalidRecords: records.filter((r) => !r.isValid && !r.isDuplicate).length,
    duplicateRecords: records.filter((r) => r.isDuplicate).length,
    records,
  }
}

let mutableRecords = [...pensionerRecords]

function mergePensionerRecords(...sources: PensionerRecord[][]): PensionerRecord[] {
  const seenPpos = new Set<string>()
  const merged: PensionerRecord[] = []

  for (const source of sources) {
    for (const record of source) {
      const ppoKey = record.service.ppoNumber.toLowerCase()
      if (seenPpos.has(ppoKey)) continue
      seenPpos.add(ppoKey)
      merged.push(record)
    }
  }

  return merged
}

export function getPensionersStore() {
  return mergePensionerRecords(getPortalPensionerRecords(), mutableRecords)
}

export function resolvePensionerRef(ref: string): PensionerRecord | undefined {
  const normalized = ref.trim().toLowerCase()
  return getPensionersStore().find(
    (p) =>
      p.id.toLowerCase() === normalized ||
      p.service.ppoNumber.toLowerCase() === normalized,
  )
}

export function addPensioner(record: PensionerRecord) {
  const withStructure = record.pensionStructure
    ? { ...record, pension: derivePensionDetails(record.pensionStructure.components) }
    : (() => {
        const structure = buildStructureFromFlatPension(record)
        return { ...record, pensionStructure: structure, pension: derivePensionDetails(structure.components) }
      })()
  mutableRecords = [withStructure, ...mutableRecords]
  return withStructure
}

export function updatePensioner(id: string, updates: Partial<PensionerRecord>) {
  mutableRecords = mutableRecords.map((r) => {
    if (r.id !== id) return r
    const merged = { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
    if (merged.pensionStructure) {
      merged.pension = derivePensionDetails(merged.pensionStructure.components)
    }
    return merged
  })
  return mutableRecords.find((r) => r.id === id)
}

export function deletePensioner(id: string) {
  mutableRecords = mutableRecords.filter((r) => r.id !== id)
}

export function generatePensionerId(): string {
  const maxNum = mutableRecords.reduce((max, r) => {
    const num = parseInt(r.id.replace('PEN-', ''), 10)
    return num > max ? num : max
  }, 0)
  return `PEN-${String(maxNum + 1).padStart(5, '0')}`
}

export function createEmptyPensionDetails(): PensionDetails {
  return {
    basicPension: 0,
    dearnessRelief: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    arrears: 0,
    taxDeduction: 0,
    recoveryDeduction: 0,
    grossPension: 0,
    netPension: 0,
  }
}
