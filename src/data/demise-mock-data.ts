import { getPensionersStore, updatePensioner } from '@/data/admin-mock-data'
import { addPensionerNotification } from '@/data/pensioner-mock-data'
import {
  createExcessCaseFromDemise,
  createRecoveryCase,
  submitRecoveryCase,
} from '@/data/recovery-mock-data'
import { calculateExcessPension, generateMonthlyPaymentsAfterDeath } from '@/lib/demise'
import { getPensionerFullName } from '@/types/pensioner'
import type {
  DeceasedPensionerProfile,
  DemiseAuditEntry,
  DemiseDashboardStats,
  DemiseIntimation,
  DemiseTimelineEvent,
  DemiseVerificationInput,
  FamilyPensionApplication,
  FamilyPensionReviewInput,
  InitiateFamilyPensionInput,
  SubmitDemiseIntimationInput,
} from '@/types/demise'

let intimationCounter = 6
let familyPensionCounter = 2
let deceasedCounter = 2
let auditCounter = 20

const DEMISE_INTIMATIONS_KEY = 'pension_demise_intimations'
const DEMISE_INTIMATION_COUNTER_KEY = 'pension_demise_intimation_counter'

function loadPersistedIntimations(): DemiseIntimation[] | null {
  try {
    const raw = sessionStorage.getItem(DEMISE_INTIMATIONS_KEY)
    return raw ? (JSON.parse(raw) as DemiseIntimation[]) : null
  } catch {
    return null
  }
}

function loadPersistedIntimationCounter(): number | null {
  try {
    const raw = sessionStorage.getItem(DEMISE_INTIMATION_COUNTER_KEY)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

function persistDemiseIntimations() {
  sessionStorage.setItem(DEMISE_INTIMATIONS_KEY, JSON.stringify(demiseIntimations))
  sessionStorage.setItem(DEMISE_INTIMATION_COUNTER_KEY, String(intimationCounter))
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function nowIso() {
  return new Date().toISOString()
}

function createTimelineEvent(
  status: string,
  title: string,
  description?: string,
  actor?: string,
): DemiseTimelineEvent {
  return {
    id: `dmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status,
    title,
    description,
    actor,
    timestamp: nowIso(),
  }
}

function createAuditEntry(
  partial: Omit<DemiseAuditEntry, 'id' | 'timestamp'>,
): DemiseAuditEntry {
  return {
    ...partial,
    id: `AUD-DEM-${String(auditCounter++).padStart(4, '0')}`,
    timestamp: nowIso(),
  }
}

function notifyNominee(ppoNumber: string, title: string, message: string, details?: string) {
  const pensioner = getPensionersStore().find((p) => p.service.ppoNumber === ppoNumber)
  if (pensioner) {
    addPensionerNotification({
      type: 'system_announcement',
      title,
      message,
      details,
    })
  }
}

const SEED_DEMISE_INTIMATIONS: DemiseIntimation[] = [
  {
    id: 'DMI-2026-0001',
    pensionerId: 'PEN-00020',
    ppoNumber: 'PPO100020',
    pensionerName: 'Vikram Nair',
    nominee: {
      nomineeName: 'Priya Nair',
      relationship: 'Spouse',
      mobileNumber: '9876501234',
      priority: 'primary',
      aadhaarNumber: '2345 6789 0123',
    },
    dateOfDeath: '2026-02-15',
    placeOfDeath: 'Kochi, Kerala',
    causeOfDeath: 'Cardiac arrest',
    remarks: 'Death certificate submitted by spouse. Hospital records attached.',
    declarationAccepted: true,
    documents: [
      {
        id: 'doc-dm-1',
        type: 'death_certificate',
        name: 'Death Certificate',
        fileName: 'death-certificate-vikram-nair.pdf',
        mandatory: true,
        uploadedAt: '2026-03-01',
      },
      {
        id: 'doc-dm-2',
        type: 'hospital_certificate',
        name: 'Hospital Certificate',
        fileName: 'hospital-discharge-vikram.pdf',
        mandatory: false,
        uploadedAt: '2026-03-01',
      },
    ],
    status: 'submitted',
    submittedAt: '2026-03-01',
    updatedAt: '2026-03-01',
    submittedBy: 'nominee',
    approvalHistory: [],
    timeline: [
      createTimelineEvent('submitted', 'Demise Reported', 'Intimation submitted by nominee Priya Nair', 'Priya Nair'),
    ],
  },
  {
    id: 'DMI-2026-0002',
    pensionerId: 'PEN-00008',
    ppoNumber: 'PPO100008',
    pensionerName: 'Geeta Sharma',
    nominee: {
      nomineeName: 'Rahul Sharma',
      relationship: 'Son',
      mobileNumber: '9123409876',
      priority: 'primary',
    },
    secondaryNominee: {
      nomineeName: 'Meera Sharma',
      relationship: 'Daughter',
      mobileNumber: '9123409877',
      priority: 'secondary',
    },
    dateOfDeath: '2026-01-01',
    placeOfDeath: 'Delhi',
    remarks: 'Delayed reporting — death occurred 3 months ago.',
    declarationAccepted: true,
    documents: [
      {
        id: 'doc-dm-3',
        type: 'death_certificate',
        name: 'Death Certificate',
        fileName: 'death-cert-geeta-sharma.pdf',
        mandatory: true,
        uploadedAt: '2026-04-10',
      },
      {
        id: 'doc-dm-4',
        type: 'legal_heir_certificate',
        name: 'Legal Heir Certificate',
        fileName: 'legal-heir-geeta.pdf',
        mandatory: false,
        uploadedAt: '2026-04-10',
      },
    ],
    status: 'under_verification',
    submittedAt: '2026-04-10',
    updatedAt: '2026-04-12',
    submittedBy: 'nominee',
    verificationNotes: 'Verifying death certificate authenticity with issuing authority.',
    approvalHistory: [],
    timeline: [
      createTimelineEvent('submitted', 'Demise Reported', 'Delayed intimation submitted by son', 'Rahul Sharma'),
      createTimelineEvent('under_verification', 'Under Verification', 'Assigned to verification officer', 'Pension Administrator'),
    ],
  },
  {
    id: 'DMI-2026-0003',
    pensionerId: 'PEN-00012',
    ppoNumber: 'PPO100012',
    pensionerName: 'Harish Patel',
    nominee: {
      nomineeName: 'Anita Patel',
      relationship: 'Spouse',
      mobileNumber: '9988771122',
      priority: 'primary',
    },
    dateOfDeath: '2025-11-20',
    placeOfDeath: 'Ahmedabad, Gujarat',
    remarks: '',
    declarationAccepted: true,
    documents: [
      {
        id: 'doc-dm-5',
        type: 'death_certificate',
        name: 'Death Certificate',
        fileName: 'death-cert-harish.pdf',
        mandatory: true,
        uploadedAt: '2025-11-25',
      },
    ],
    status: 'approved',
    submittedAt: '2025-11-25',
    updatedAt: '2025-12-02',
    submittedBy: 'nominee',
    verificationNotes: 'Death certificate verified. Nominee details match records.',
    approvalHistory: [
      {
        action: 'approve',
        remarks: 'Demise verified. Pension to be stopped. Excess pension identified.',
        actor: 'Pension Administrator',
        timestamp: '2025-12-02T10:30:00.000Z',
      },
    ],
    excessPension: {
      dateOfDeath: '2025-11-20',
      paymentsAfterDeath: [
        { month: 'December 2025', amount: 18500, paidDate: '2025-12-01' },
        { month: 'January 2026', amount: 18500, paidDate: '2026-01-01' },
      ],
      totalExcessAmount: 37000,
      calculatedAt: '2025-12-02',
      excessCaseId: 'EXC-2026-0007',
      recoveryCaseId: 'REC-2026-0010',
    },
    familyPensionId: 'FMP-2026-0001',
    deceasedProfileId: 'DEC-2026-0001',
    timeline: [
      createTimelineEvent('submitted', 'Demise Reported', 'Intimation submitted by spouse', 'Anita Patel'),
      createTimelineEvent('under_verification', 'Under Verification', 'Documents under review', 'Pension Administrator'),
      createTimelineEvent('approved', 'Demise Approved', 'Pension status changed to Deceased', 'Pension Administrator'),
      createTimelineEvent('recovery', 'Recovery Initiated', 'Excess pension case created — ₹37,000', 'System'),
      createTimelineEvent('family_pension', 'Family Pension Initiated', 'Application FMP-2026-0001 created', 'System'),
    ],
  },
  {
    id: 'DMI-2026-0004',
    pensionerId: 'PEN-00015',
    ppoNumber: 'PPO100015',
    pensionerName: 'Kamala Devi',
    nominee: {
      nomineeName: 'Rajesh Kumar',
      relationship: 'Son',
      mobileNumber: '9876512345',
      priority: 'primary',
    },
    dateOfDeath: '2026-05-01',
    placeOfDeath: 'Lucknow, UP',
    remarks: 'Incorrect reporting — pensioner is alive.',
    declarationAccepted: true,
    documents: [
      {
        id: 'doc-dm-6',
        type: 'death_certificate',
        name: 'Death Certificate',
        fileName: 'suspect-death-cert.pdf',
        mandatory: true,
        uploadedAt: '2026-05-05',
      },
    ],
    status: 'rejected',
    submittedAt: '2026-05-05',
    updatedAt: '2026-05-08',
    submittedBy: 'nominee',
    verificationNotes: 'Death certificate could not be verified with municipal records.',
    approvalHistory: [
      {
        action: 'reject',
        remarks: 'Death certificate appears fraudulent. Pension remains active.',
        actor: 'Pension Administrator',
        timestamp: '2026-05-08T14:00:00.000Z',
      },
    ],
    timeline: [
      createTimelineEvent('submitted', 'Demise Reported', 'Intimation submitted', 'Rajesh Kumar'),
      createTimelineEvent('under_verification', 'Under Verification', 'Death certificate verification in progress', 'Pension Administrator'),
      createTimelineEvent('rejected', 'Demise Rejected', 'Pension remains active', 'Pension Administrator'),
    ],
  },
  {
    id: 'DMI-2026-0005',
    pensionerId: 'PEN-00018',
    ppoNumber: 'PPO100018',
    pensionerName: 'Suresh Menon',
    nominee: {
      nomineeName: 'Lakshmi Menon',
      relationship: 'Spouse',
      mobileNumber: '9123456700',
      priority: 'primary',
    },
    dateOfDeath: '2026-04-20',
    placeOfDeath: 'Thiruvananthapuram, Kerala',
    remarks: '',
    declarationAccepted: true,
    documents: [
      {
        id: 'doc-dm-7',
        type: 'death_certificate',
        name: 'Death Certificate',
        fileName: 'death-cert-suresh.pdf',
        mandatory: true,
        uploadedAt: '2026-04-22',
      },
    ],
    status: 'needs_clarification',
    submittedAt: '2026-04-22',
    updatedAt: '2026-04-25',
    submittedBy: 'nominee',
    verificationNotes: 'Nominee name on death certificate differs from pension records.',
    approvalHistory: [
      {
        action: 'needs_clarification',
        remarks: 'Please submit legal heir certificate and identity proof matching nominee records.',
        actor: 'Pension Administrator',
        timestamp: '2026-04-25T09:00:00.000Z',
      },
    ],
    timeline: [
      createTimelineEvent('submitted', 'Demise Reported', 'Intimation submitted by spouse', 'Lakshmi Menon'),
      createTimelineEvent('needs_clarification', 'Clarification Requested', 'Additional documents required', 'Pension Administrator'),
    ],
  },
]

const persistedIntimations = loadPersistedIntimations()
const persistedCounter = loadPersistedIntimationCounter()
let demiseIntimations: DemiseIntimation[] = persistedIntimations ?? SEED_DEMISE_INTIMATIONS
if (persistedCounter !== null) {
  intimationCounter = persistedCounter
}

let familyPensionApplications: FamilyPensionApplication[] = [
  {
    id: 'FMP-2026-0001',
    demiseIntimationId: 'DMI-2026-0003',
    pensionerId: 'PEN-00012',
    ppoNumber: 'PPO100012',
    pensionerName: 'Harish Patel',
    nomineeName: 'Anita Patel',
    relationship: 'Spouse',
    mobileNumber: '9988771122',
    address: '12, Ashram Road, Ahmedabad, Gujarat - 380009',
    bankDetails: {
      accountHolderName: 'Anita Patel',
      bankName: 'State Bank of India',
      branchName: 'Ashram Road Branch',
      accountNumber: '30112233445',
      ifscCode: 'SBIN0001234',
    },
    eligibilityVerified: true,
    documents: [
      {
        id: 'doc-fp-1',
        type: 'identity_proof',
        name: 'Identity Proof',
        fileName: 'anita-aadhaar.pdf',
        mandatory: true,
        uploadedAt: '2025-12-03',
      },
      {
        id: 'doc-fp-2',
        type: 'legal_heir_certificate',
        name: 'Relationship Proof',
        fileName: 'marriage-certificate.pdf',
        mandatory: true,
        uploadedAt: '2025-12-03',
      },
    ],
    status: 'under_review',
    submittedAt: '2025-12-03',
    updatedAt: '2025-12-05',
    timeline: [
      createTimelineEvent('submitted', 'Family Pension Application', 'Application submitted by nominee', 'Anita Patel'),
      createTimelineEvent('under_review', 'Under Review', 'Eligibility verification in progress', 'Pension Administrator'),
    ],
  },
]

let deceasedProfiles: DeceasedPensionerProfile[] = [
  {
    id: 'DEC-2026-0001',
    pensionerId: 'PEN-00012',
    ppoNumber: 'PPO100012',
    pensionerName: 'Harish Patel',
    department: 'Revenue Department',
    pensionType: 'Superannuation',
    dateOfDeath: '2025-11-20',
    demiseApprovalDate: '2025-12-02',
    demiseIntimationId: 'DMI-2026-0003',
    excessPensionAmount: 37000,
    recoveryStatus: 'Recovery Case Active',
    recoveryCaseId: 'REC-2026-0010',
    familyPensionStatus: 'Under Review',
    familyPensionId: 'FMP-2026-0001',
    monthlyPension: 18500,
  },
]

let auditLogs: DemiseAuditEntry[] = [
  createAuditEntry({
    intimationId: 'DMI-2026-0001',
    user: 'Priya Nair',
    action: 'intimation_submitted',
    newValue: 'submitted',
    remarks: 'Demise intimation submitted with death certificate',
  }),
  createAuditEntry({
    intimationId: 'DMI-2026-0003',
    user: 'Pension Administrator',
    action: 'approved',
    oldValue: 'under_verification',
    newValue: 'approved',
    remarks: 'Demise verified and approved',
  }),
  createAuditEntry({
    intimationId: 'DMI-2026-0003',
    user: 'System',
    action: 'pension_status_changed',
    oldValue: 'active',
    newValue: 'deceased',
    remarks: 'Pension status updated after demise approval',
  }),
  createAuditEntry({
    intimationId: 'DMI-2026-0003',
    user: 'System',
    action: 'recovery_triggered',
    newValue: 'EXC-2026-0007',
    remarks: 'Excess pension case created — ₹37,000',
  }),
]

export function getDemiseIntimations(): DemiseIntimation[] {
  return [...demiseIntimations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function getDemiseIntimationById(id: string): DemiseIntimation | undefined {
  return demiseIntimations.find((d) => d.id === id)
}

export function getDemiseIntimationsByPpo(ppoNumber: string): DemiseIntimation[] {
  return demiseIntimations.filter(
    (d) => d.ppoNumber.toLowerCase() === ppoNumber.toLowerCase(),
  )
}

export function getFamilyPensionApplications(): FamilyPensionApplication[] {
  return [...familyPensionApplications].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function getFamilyPensionById(id: string): FamilyPensionApplication | undefined {
  return familyPensionApplications.find((f) => f.id === id)
}

export function getFamilyPensionByDemiseId(demiseId: string): FamilyPensionApplication | undefined {
  return familyPensionApplications.find((f) => f.demiseIntimationId === demiseId)
}

export function getDeceasedProfiles(): DeceasedPensionerProfile[] {
  return [...deceasedProfiles]
}

export function getDeceasedProfileById(id: string): DeceasedPensionerProfile | undefined {
  return deceasedProfiles.find((d) => d.id === id)
}

export function getDeceasedProfileByPensionerId(pensionerId: string): DeceasedPensionerProfile | undefined {
  return deceasedProfiles.find((d) => d.pensionerId === pensionerId)
}

export function getDemiseAuditLogs(intimationId: string): DemiseAuditEntry[] {
  return auditLogs
    .filter((a) => a.intimationId === intimationId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getDemiseDashboardStats(): DemiseDashboardStats {
  return {
    totalRequests: demiseIntimations.length,
    pendingVerification: demiseIntimations.filter((d) =>
      ['submitted', 'under_verification', 'needs_clarification'].includes(d.status),
    ).length,
    approvedCases: demiseIntimations.filter((d) => d.status === 'approved').length,
    rejectedCases: demiseIntimations.filter((d) => d.status === 'rejected').length,
    familyPensionInitiated: familyPensionApplications.length,
    needsClarification: demiseIntimations.filter((d) => d.status === 'needs_clarification').length,
    deceasedProfiles: deceasedProfiles.length,
  }
}

export function submitDemiseIntimation(input: SubmitDemiseIntimationInput): DemiseIntimation {
  const id = `DMI-2026-${String(++intimationCounter).padStart(4, '0')}`
  const now = today()

  const intimation: DemiseIntimation = {
    id,
    pensionerId: input.pensionerId,
    ppoNumber: input.ppoNumber,
    pensionerName: input.pensionerName,
    nominee: input.nominee,
    secondaryNominee: input.secondaryNominee,
    dateOfDeath: input.dateOfDeath,
    placeOfDeath: input.placeOfDeath,
    causeOfDeath: input.causeOfDeath,
    remarks: input.remarks,
    declarationAccepted: input.declarationAccepted,
    documents: input.documents.map((doc, i) => ({
      ...doc,
      id: `doc-dm-new-${i}`,
      uploadedAt: now,
    })),
    status: 'submitted',
    submittedAt: now,
    updatedAt: now,
    submittedBy: input.submittedBy,
    approvalHistory: [],
    timeline: [
      createTimelineEvent(
        'submitted',
        'Demise Reported',
        `Intimation submitted by ${input.submittedBy === 'admin' ? 'Pension Admin' : 'nominee'}`,
        input.nominee.nomineeName,
      ),
    ],
  }

  demiseIntimations = [intimation, ...demiseIntimations]

  auditLogs.push(
    createAuditEntry({
      intimationId: id,
      user: input.nominee.nomineeName,
      action: 'intimation_submitted',
      newValue: 'submitted',
      remarks: 'Demise intimation submitted',
    }),
  )

  notifyNominee(
    input.ppoNumber,
    'Demise Request Submitted',
    `Your demise intimation ${id} has been submitted and is pending verification.`,
    `Pensioner: ${input.pensionerName}. Status: Submitted.`,
  )

  persistDemiseIntimations()

  return intimation
}

function processDemiseApproval(intimation: DemiseIntimation, actor: string): void {
  const pensioner = getPensionersStore().find((p) => p.id === intimation.pensionerId)
  const monthlyPension = pensioner?.pension.netPension ?? 20000

  updatePensioner(intimation.pensionerId, { status: 'deceased' })

  auditLogs.push(
    createAuditEntry({
      intimationId: intimation.id,
      user: actor,
      action: 'pension_status_changed',
      oldValue: 'active',
      newValue: 'deceased',
      remarks: 'Pension stopped. Life certificate cycles halted.',
    }),
  )

  const payments = generateMonthlyPaymentsAfterDeath(intimation.dateOfDeath, monthlyPension)
  const { paymentsAfterDeath, totalExcessAmount } = calculateExcessPension(
    intimation.dateOfDeath,
    monthlyPension,
    payments,
  )

  let excessCaseId: string | undefined
  let recoveryCaseId: string | undefined

  if (totalExcessAmount > 0) {
    const excessCase = createExcessCaseFromDemise({
      pensionerId: intimation.pensionerId,
      ppoNumber: intimation.ppoNumber,
      pensionerName: intimation.pensionerName,
      pensionType: pensioner?.service.pensionType ?? 'superannuation',
      department: pensioner?.service.department ?? 'Government',
      excessAmount: totalExcessAmount,
      remarks: `Excess pension after death on ${intimation.dateOfDeath}`,
    })
    excessCaseId = excessCase.id

    const recoveryCase = createRecoveryCase({
      excessCaseId: excessCase.id,
      recoveryReason: 'excess_pension_credit',
      recoveryType: 'installment_recovery',
      recoveryStartDate: today(),
      remarks: `Auto-created from demise approval ${intimation.id}`,
      documents: [{ name: 'Demise Approval Record', fileName: `${intimation.id}-approval.pdf` }],
      createdBy: 'System (Demise Module)',
    })
    submitRecoveryCase(recoveryCase.id, 'System (Demise Module)')
    recoveryCaseId = recoveryCase.id

    auditLogs.push(
      createAuditEntry({
        intimationId: intimation.id,
        user: 'System',
        action: 'recovery_triggered',
        newValue: recoveryCaseId,
        remarks: `Excess pension ₹${totalExcessAmount.toLocaleString('en-IN')} — recovery case created`,
      }),
    )

    intimation.timeline.push(
      createTimelineEvent(
        'recovery',
        'Recovery Case Created',
        `Excess pension ₹${totalExcessAmount.toLocaleString('en-IN')} — ${recoveryCaseId}`,
        'System',
      ),
    )
  }

  intimation.excessPension = {
    dateOfDeath: intimation.dateOfDeath,
    paymentsAfterDeath,
    totalExcessAmount,
    calculatedAt: today(),
    excessCaseId,
    recoveryCaseId,
  }

  const deceasedId = `DEC-2026-${String(++deceasedCounter).padStart(4, '0')}`
  const deceasedProfile: DeceasedPensionerProfile = {
    id: deceasedId,
    pensionerId: intimation.pensionerId,
    ppoNumber: intimation.ppoNumber,
    pensionerName: intimation.pensionerName,
    department: pensioner?.service.department ?? 'Government',
    pensionType: pensioner?.service.pensionType ?? 'superannuation',
    dateOfDeath: intimation.dateOfDeath,
    demiseApprovalDate: today(),
    demiseIntimationId: intimation.id,
    excessPensionAmount: totalExcessAmount,
    recoveryStatus: recoveryCaseId ? 'Recovery Case Active' : 'No Excess Pension',
    recoveryCaseId,
    familyPensionStatus: 'Not Initiated',
    monthlyPension,
  }
  deceasedProfiles = [deceasedProfile, ...deceasedProfiles]
  intimation.deceasedProfileId = deceasedId

  notifyNominee(
    intimation.ppoNumber,
    'Demise Approved',
    `Demise intimation ${intimation.id} has been approved. Pension has been stopped.`,
    totalExcessAmount > 0
      ? `Excess pension of ₹${totalExcessAmount.toLocaleString('en-IN')} identified. Recovery case initiated.`
      : 'No excess pension identified.',
  )
}

export function processDemiseVerification(input: DemiseVerificationInput): DemiseIntimation {
  const intimation = getDemiseIntimationById(input.intimationId)
  if (!intimation) throw new Error('Demise intimation not found')

  const oldStatus = intimation.status
  const now = nowIso()

  intimation.approvalHistory.push({
    action: input.action,
    remarks: input.remarks,
    actor: input.actor,
    timestamp: now,
  })

  switch (input.action) {
    case 'approve':
      intimation.status = 'approved'
      intimation.verificationNotes = input.remarks
      intimation.timeline.push(
        createTimelineEvent('approved', 'Demise Approved', input.remarks, input.actor),
      )
      processDemiseApproval(intimation, input.actor)
      auditLogs.push(
        createAuditEntry({
          intimationId: intimation.id,
          user: input.actor,
          action: 'approved',
          oldValue: oldStatus,
          newValue: 'approved',
          remarks: input.remarks,
        }),
      )
      break

    case 'reject':
      intimation.status = 'rejected'
      intimation.verificationNotes = input.remarks
      intimation.timeline.push(
        createTimelineEvent('rejected', 'Demise Rejected', 'Pension remains active', input.actor),
      )
      auditLogs.push(
        createAuditEntry({
          intimationId: intimation.id,
          user: input.actor,
          action: 'rejected',
          oldValue: oldStatus,
          newValue: 'rejected',
          remarks: input.remarks,
        }),
      )
      notifyNominee(
        intimation.ppoNumber,
        'Demise Rejected',
        `Demise intimation ${intimation.id} has been rejected. Pension remains active.`,
        input.remarks,
      )
      break

    case 'needs_clarification':
      intimation.status = 'needs_clarification'
      intimation.verificationNotes = input.remarks
      intimation.timeline.push(
        createTimelineEvent('needs_clarification', 'Clarification Requested', input.remarks, input.actor),
      )
      auditLogs.push(
        createAuditEntry({
          intimationId: intimation.id,
          user: input.actor,
          action: 'clarification_requested',
          oldValue: oldStatus,
          newValue: 'needs_clarification',
          remarks: input.remarks,
        }),
      )
      notifyNominee(
        intimation.ppoNumber,
        'Clarification Requested',
        `Additional information required for demise intimation ${intimation.id}.`,
        input.remarks,
      )
      break

    case 'reverse':
      intimation.status = 'reversed'
      updatePensioner(intimation.pensionerId, { status: 'active' })
      intimation.timeline.push(
        createTimelineEvent('reversed', 'Demise Reversal', 'Pension status restored to active', input.actor),
      )
      auditLogs.push(
        createAuditEntry({
          intimationId: intimation.id,
          user: input.actor,
          action: 'reversal_initiated',
          oldValue: 'approved',
          newValue: 'reversed',
          remarks: input.remarks,
        }),
      )
      break
  }

  intimation.updatedAt = today()
  demiseIntimations = demiseIntimations.map((d) => (d.id === intimation.id ? intimation : d))
  persistDemiseIntimations()
  return intimation
}

export function startDemiseVerification(intimationId: string, actor: string): DemiseIntimation {
  const intimation = getDemiseIntimationById(intimationId)
  if (!intimation) throw new Error('Demise intimation not found')
  if (intimation.status !== 'submitted' && intimation.status !== 'needs_clarification') {
    throw new Error('Intimation cannot be moved to verification')
  }

  const oldStatus = intimation.status
  intimation.status = 'under_verification'
  intimation.updatedAt = today()
  intimation.timeline.push(
    createTimelineEvent('under_verification', 'Verification Started', 'Assigned for admin review', actor),
  )

  auditLogs.push(
    createAuditEntry({
      intimationId,
      user: actor,
      action: 'verification_started',
      oldValue: oldStatus,
      newValue: 'under_verification',
    }),
  )

  demiseIntimations = demiseIntimations.map((d) => (d.id === intimationId ? intimation : d))
  persistDemiseIntimations()
  return intimation
}

export function initiateFamilyPension(input: InitiateFamilyPensionInput): FamilyPensionApplication {
  const intimation = getDemiseIntimationById(input.demiseIntimationId)
  if (!intimation) throw new Error('Demise intimation not found')
  if (intimation.status !== 'approved') throw new Error('Demise must be approved first')

  const id = `FMP-2026-${String(++familyPensionCounter).padStart(4, '0')}`
  const now = today()

  const application: FamilyPensionApplication = {
    id,
    demiseIntimationId: input.demiseIntimationId,
    pensionerId: intimation.pensionerId,
    ppoNumber: intimation.ppoNumber,
    pensionerName: intimation.pensionerName,
    nomineeName: input.nomineeName,
    relationship: input.relationship,
    mobileNumber: input.mobileNumber,
    address: input.address,
    bankDetails: input.bankDetails,
    eligibilityVerified: false,
    documents: input.documents.map((doc, i) => ({
      ...doc,
      id: `doc-fp-new-${i}`,
      uploadedAt: now,
    })),
    status: 'submitted',
    submittedAt: now,
    updatedAt: now,
    timeline: [
      createTimelineEvent('submitted', 'Family Pension Application', 'Application submitted', input.submittedBy),
    ],
  }

  familyPensionApplications = [application, ...familyPensionApplications]
  intimation.familyPensionId = id
  intimation.timeline.push(
    createTimelineEvent('family_pension', 'Family Pension Initiated', `Application ${id} created`, input.submittedBy),
  )

  if (intimation.deceasedProfileId) {
    deceasedProfiles = deceasedProfiles.map((d) =>
      d.id === intimation.deceasedProfileId
        ? { ...d, familyPensionId: id, familyPensionStatus: 'Submitted' }
        : d,
    )
  }

  auditLogs.push(
    createAuditEntry({
      intimationId: intimation.id,
      user: input.submittedBy,
      action: 'family_pension_created',
      newValue: id,
      remarks: 'Family pension application initiated',
    }),
  )

  notifyNominee(
    intimation.ppoNumber,
    'Family Pension Initiated',
    `Family pension application ${id} has been initiated.`,
    `Nominee: ${input.nomineeName}`,
  )

  demiseIntimations = demiseIntimations.map((d) =>
    d.id === intimation.id ? { ...intimation, familyPensionId: id } : d,
  )
  persistDemiseIntimations()

  return application
}

export function reviewFamilyPension(input: FamilyPensionReviewInput): FamilyPensionApplication {
  const application = getFamilyPensionById(input.applicationId)
  if (!application) throw new Error('Family pension application not found')

  application.reviewedBy = input.actor
  application.adminRemarks = input.remarks
  application.updatedAt = today()

  if (input.action === 'approve') {
    application.status = 'activated'
    application.eligibilityVerified = true
    application.activatedAt = today()
    application.timeline.push(
      createTimelineEvent('activated', 'Family Pension Activated', input.remarks, input.actor),
    )

    deceasedProfiles = deceasedProfiles.map((d) =>
      d.pensionerId === application.pensionerId
        ? { ...d, familyPensionStatus: 'Activated' }
        : d,
    )

    notifyNominee(
      application.ppoNumber,
      'Family Pension Activated',
      `Family pension for ${application.nomineeName} has been activated.`,
      input.remarks,
    )
  } else {
    application.status = 'rejected'
    application.timeline.push(
      createTimelineEvent('rejected', 'Family Pension Rejected', input.remarks, input.actor),
    )
    deceasedProfiles = deceasedProfiles.map((d) =>
      d.pensionerId === application.pensionerId
        ? { ...d, familyPensionStatus: 'Rejected' }
        : d,
    )
  }

  familyPensionApplications = familyPensionApplications.map((f) =>
    f.id === application.id ? application : f,
  )

  return application
}

export function createAdminDemiseEntry(
  pensionerId: string,
  input: Omit<SubmitDemiseIntimationInput, 'pensionerId' | 'ppoNumber' | 'pensionerName' | 'submittedBy'>,
): DemiseIntimation {
  const pensioner = getPensionersStore().find((p) => p.id === pensionerId)
  if (!pensioner) throw new Error('Pensioner not found')

  return submitDemiseIntimation({
    ...input,
    pensionerId,
    ppoNumber: pensioner.service.ppoNumber,
    pensionerName: getPensionerFullName(pensioner.personal),
    submittedBy: 'admin',
  })
}

// Backward compatibility for legacy demise reports
export function getLegacyDemiseReports() {
  return getDemiseIntimations().map((d) => ({
    id: d.id,
    dateOfDeath: d.dateOfDeath,
    placeOfDeath: d.placeOfDeath,
    remarks: d.remarks,
    certificateFileName: d.documents.find((doc) => doc.type === 'death_certificate')?.fileName,
    status: d.status === 'under_verification' ? 'under_review' as const
      : d.status === 'needs_clarification' ? 'under_review' as const
      : d.status === 'reversed' ? 'rejected' as const
      : d.status as 'submitted' | 'approved' | 'rejected',
    submittedAt: d.submittedAt,
  }))
}
