import { getPensionersStore, updatePensioner } from '@/data/admin-mock-data'
import {
  addPensionerNotification,
  findPensionerById,
  updatePensionerRecord,
} from '@/data/pensioner-mock-data'
import { getDefaultSuspensionReason } from '@/lib/suspension'
import { getPensionerFullName } from '@/types/pensioner'
import type { PensionerStatus } from '@/types/pensioner'
import type {
  AdminRestorationAction,
  AdminSuspensionAction,
  CreateRestorationRequestInput,
  CreateSuspensionCaseInput,
  RestorationRequest,
  SuspensionAuditEntry,
  SuspensionCase,
  SuspensionDashboardStats,
  SuspensionTimelineEvent,
} from '@/types/suspension'

let suspensionCounter = 6
let restorationCounter = 3
let auditCounter = 10

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
): SuspensionTimelineEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status,
    title,
    description,
    actor,
    timestamp: nowIso(),
  }
}

function createAuditEntry(
  partial: Omit<SuspensionAuditEntry, 'id' | 'timestamp'>,
): SuspensionAuditEntry {
  return {
    ...partial,
    id: `AUD-SUS-${String(auditCounter++).padStart(4, '0')}`,
    timestamp: nowIso(),
  }
}

function syncPensionerStatus(pensionerId: string, status: PensionerStatus) {
  updatePensioner(pensionerId, { status })
  const record = findPensionerById(pensionerId)
  if (record) {
    updatePensionerRecord({
      ...record,
      status,
      updatedAt: today(),
    })
  }
}

function getPensionerInfo(pensionerId: string) {
  const adminRecord = getPensionersStore().find((p) => p.id === pensionerId)
  const portalRecord = findPensionerById(pensionerId)
  const record = portalRecord ?? adminRecord
  if (!record) return null
  return {
    id: record.id,
    ppoNumber: record.service.ppoNumber,
    name: getPensionerFullName(record.personal),
    mobile: record.personal.mobileNumber,
    pensionType: record.service.pensionType.replace(/_/g, ' '),
  }
}

function buildSeedCases(): SuspensionCase[] {
  const suspendedAdmin = getPensionersStore().filter((p) => p.status === 'suspended').slice(0, 4)

  const seeds: SuspensionCase[] = [
    {
      id: 'SUS-2026-0001',
      pensionerId: 'PEN-SUSP-001',
      ppoNumber: 'PPO555001',
      pensionerName: 'Geeta Verma',
      pensionerMobile: '+91 9876512345',
      pensionType: 'superannuation',
      suspensionReason: 'Life Certificate Not Submitted',
      triggerType: 'no_verification',
      source: 'automatic',
      suspensionDate: '2026-05-01',
      remarks: 'Grace period expired after two reminders. Auto-suspended per policy.',
      documents: [{ name: 'Suspension Notice', fileName: 'auto_suspension_notice.pdf' }],
      createdBy: 'System',
      status: 'suspended',
      timeline: [
        createTimelineEvent('reminder', 'Reminder Sent', 'First life certificate reminder sent', 'System'),
        createTimelineEvent('reminder', 'Final Reminder', 'Grace period reminder before suspension', 'System'),
        createTimelineEvent('suspended', 'Suspension Created', 'Automatic suspension — life certificate overdue', 'System'),
        createTimelineEvent('suspended', 'Notification Sent', 'Pensioner notified of suspension', 'System'),
      ],
      createdAt: '2026-05-01',
      updatedAt: '2026-05-01',
    },
    {
      id: 'SUS-2026-0002',
      pensionerId: 'PEN-SUSP-001',
      ppoNumber: 'PPO555001',
      pensionerName: 'Geeta Verma',
      pensionerMobile: '+91 9876512345',
      pensionType: 'superannuation',
      suspensionReason: 'Verification Failed',
      triggerType: 'no_verification',
      source: 'manual',
      suspensionDate: '2026-04-15',
      remarks: 'Life certificate verification failed after resubmission.',
      documents: [{ name: 'Verification Report', fileName: 'lc_verification_failure.pdf' }],
      createdBy: 'Pension Administrator',
      status: 'restoration_pending',
      timeline: [
        createTimelineEvent('suspended', 'Suspension Created', 'Manual suspension — verification failed', 'Pension Administrator'),
        createTimelineEvent('restoration_pending', 'Restoration Requested', 'Pensioner submitted restoration request', 'Pensioner'),
      ],
      createdAt: '2026-04-15',
      updatedAt: '2026-06-08',
    },
    {
      id: 'SUS-2026-0003',
      pensionerId: suspendedAdmin[1]?.id ?? 'PEN-00013',
      ppoNumber: suspendedAdmin[1]?.service.ppoNumber ?? 'PPO100013',
      pensionerName: suspendedAdmin[1] ? getPensionerFullName(suspendedAdmin[1].personal) : 'Sample Pensioner 2',
      pensionerMobile: suspendedAdmin[1]?.personal.mobileNumber,
      pensionType: suspendedAdmin[1]?.service.pensionType.replace(/_/g, ' '),
      suspensionReason: 'Fraud Detected',
      triggerType: 'fraud',
      source: 'manual',
      suspensionDate: '2026-03-20',
      remarks: 'Duplicate disbursement detected during audit review.',
      documents: [
        { name: 'Audit Report', fileName: 'fraud_audit_report.pdf' },
        { name: 'Investigation Summary', fileName: 'fraud_investigation.pdf' },
      ],
      createdBy: 'Audit Officer',
      status: 'suspended',
      timeline: [
        createTimelineEvent('suspended', 'Suspension Created', 'Fraud case flagged by audit team', 'Audit Officer'),
        createTimelineEvent('suspended', 'Notification Sent', 'Pensioner notified of suspension', 'System'),
      ],
      createdAt: '2026-03-20',
      updatedAt: '2026-03-20',
    },
    {
      id: 'SUS-2026-0004',
      pensionerId: suspendedAdmin[2]?.id ?? 'PEN-00020',
      ppoNumber: suspendedAdmin[2]?.service.ppoNumber ?? 'PPO100020',
      pensionerName: suspendedAdmin[2] ? getPensionerFullName(suspendedAdmin[2].personal) : 'Sample Pensioner 3',
      pensionerMobile: suspendedAdmin[2]?.personal.mobileNumber,
      pensionType: suspendedAdmin[2]?.service.pensionType.replace(/_/g, ' '),
      suspensionReason: 'Invalid Documents',
      triggerType: 'invalid_documents',
      source: 'manual',
      suspensionDate: '2026-02-10',
      remarks: 'Submitted documents did not match Aadhaar records.',
      documents: [{ name: 'Document Verification Report', fileName: 'invalid_docs_report.pdf' }],
      createdBy: 'Pension Administrator',
      status: 'restored',
      restoredAt: '2026-03-05',
      timeline: [
        createTimelineEvent('suspended', 'Suspension Created', 'Invalid documents detected', 'Pension Administrator'),
        createTimelineEvent('restoration_pending', 'Restoration Requested', 'Pensioner submitted corrected documents', 'Pensioner'),
        createTimelineEvent('restored', 'Restoration Approved', 'Documents verified — pension restored', 'Pension Administrator'),
      ],
      createdAt: '2026-02-10',
      updatedAt: '2026-03-05',
    },
    {
      id: 'SUS-2026-0005',
      pensionerId: suspendedAdmin[3]?.id ?? 'PEN-00027',
      ppoNumber: suspendedAdmin[3]?.service.ppoNumber ?? 'PPO100027',
      pensionerName: suspendedAdmin[3] ? getPensionerFullName(suspendedAdmin[3].personal) : 'Sample Pensioner 4',
      pensionerMobile: suspendedAdmin[3]?.personal.mobileNumber,
      pensionType: suspendedAdmin[3]?.service.pensionType.replace(/_/g, ' '),
      suspensionReason: 'Administrative Action',
      triggerType: 'administrative_hold',
      source: 'manual',
      suspensionDate: '2026-01-25',
      remarks: 'Pending departmental inquiry.',
      documents: [{ name: 'Administrative Order', fileName: 'admin_hold_order.pdf' }],
      createdBy: 'Pension Administrator',
      status: 'rejected',
      restorationRejectedAt: '2026-02-15',
      rejectionReason: 'Inquiry still pending. Restoration cannot be approved at this time.',
      timeline: [
        createTimelineEvent('suspended', 'Suspension Created', 'Administrative hold placed', 'Pension Administrator'),
        createTimelineEvent('restoration_pending', 'Restoration Requested', 'Pensioner requested restoration', 'Pensioner'),
        createTimelineEvent('rejected', 'Restoration Rejected', 'Inquiry not yet concluded', 'Pension Administrator'),
      ],
      createdAt: '2026-01-25',
      updatedAt: '2026-02-15',
    },
  ]

  return seeds
}

const seedRestorations: RestorationRequest[] = [
  {
    id: 'RST-2026-0001',
    suspensionCaseId: 'SUS-2026-0002',
    pensionerId: 'PEN-SUSP-001',
    ppoNumber: 'PPO555001',
    pensionerName: 'Geeta Verma',
    suspensionReason: 'Verification Failed',
    requestDate: '2026-06-08',
    reasonForRestoration: 'I have now submitted a valid life certificate with clear face capture and completed OTP verification. Request restoration of my pension.',
    documents: [
      {
        name: 'Digital Life Certificate',
        fileName: 'lc_resubmission_2026.pdf',
        documentType: 'life_certificate',
        fileSize: 842_000,
        mimeType: 'application/pdf',
      },
      {
        name: 'Aadhaar Card',
        fileName: 'aadhaar_identity_proof.pdf',
        documentType: 'aadhaar_card',
        fileSize: 1_184_000,
        mimeType: 'application/pdf',
      },
    ],
    remarks: 'Submitted via pensioner portal. Life certificate reference: DLC-2026-00482.',
    declarationAccepted: true,
    status: 'submitted',
    updatedAt: '2026-06-08',
    timeline: [
      createTimelineEvent('submitted', 'Request Submitted', 'Restoration request created with 2 supporting documents', 'Pensioner'),
    ],
  },
  {
    id: 'RST-2026-0002',
    suspensionCaseId: 'SUS-2026-0004',
    pensionerId: 'PEN-00020',
    ppoNumber: 'PPO100020',
    pensionerName: 'Sample Pensioner 3',
    suspensionReason: 'Invalid Documents',
    requestDate: '2026-02-20',
    reasonForRestoration: 'Corrected Aadhaar-linked documents submitted as per admin instructions.',
    documents: [
      {
        name: 'Updated Aadhaar Card',
        fileName: 'updated_aadhaar_2026.pdf',
        documentType: 'aadhaar_card',
        fileSize: 1_056_000,
        mimeType: 'application/pdf',
      },
    ],
    declarationAccepted: true,
    status: 'approved',
    reviewedBy: 'Pension Administrator',
    adminRemarks: 'Documents verified against UIDAI records.',
    updatedAt: '2026-03-05',
    timeline: [
      createTimelineEvent('submitted', 'Request Submitted', 'Restoration request created', 'Pensioner'),
      createTimelineEvent('under_review', 'Under Review', 'Documents verified', 'Pension Administrator'),
      createTimelineEvent('approved', 'Approved', 'Pension restored', 'Pension Administrator'),
    ],
  },
  {
    id: 'RST-2026-0003',
    suspensionCaseId: 'SUS-2026-0005',
    pensionerId: 'PEN-00027',
    ppoNumber: 'PPO100027',
    pensionerName: 'Sample Pensioner 4',
    suspensionReason: 'Administrative Action',
    requestDate: '2026-02-01',
    reasonForRestoration: 'Requesting restoration as departmental inquiry has been resolved on my end.',
    documents: [
      {
        name: 'Inquiry Closure Letter',
        fileName: 'inquiry_closure_letter.pdf',
        documentType: 'restoration_supporting',
        fileSize: 624_000,
        mimeType: 'application/pdf',
      },
    ],
    declarationAccepted: true,
    status: 'rejected',
    reviewedBy: 'Pension Administrator',
    rejectionReason: 'Official inquiry closure letter not received from department.',
    updatedAt: '2026-02-15',
    timeline: [
      createTimelineEvent('submitted', 'Request Submitted', 'Restoration request created', 'Pensioner'),
      createTimelineEvent('under_review', 'Under Review', 'Documents reviewed', 'Pension Administrator'),
      createTimelineEvent('rejected', 'Rejected', 'Insufficient supporting evidence', 'Pension Administrator'),
    ],
  },
]

let suspensionCases: SuspensionCase[] = buildSeedCases()
let restorationRequests: RestorationRequest[] = [...seedRestorations]
let auditLogs: SuspensionAuditEntry[] = [
  createAuditEntry({
    suspensionCaseId: 'SUS-2026-0001',
    user: 'System',
    action: 'suspension_created',
    newStatus: 'suspended',
    remarks: 'Automatic suspension — life certificate grace period expired',
  }),
  createAuditEntry({
    suspensionCaseId: 'SUS-2026-0002',
    user: 'Pension Administrator',
    action: 'suspension_created',
    newStatus: 'suspended',
    remarks: 'Manual suspension — verification failed',
  }),
  createAuditEntry({
    suspensionCaseId: 'SUS-2026-0002',
    restorationRequestId: 'RST-2026-0001',
    user: 'Pensioner',
    action: 'restoration_requested',
    oldStatus: 'suspended',
    newStatus: 'restoration_pending',
  }),
  createAuditEntry({
    suspensionCaseId: 'SUS-2026-0004',
    restorationRequestId: 'RST-2026-0002',
    user: 'Pension Administrator',
    action: 'restoration_approved',
    oldStatus: 'restoration_pending',
    newStatus: 'restored',
    remarks: 'Documents verified — pension restored',
  }),
]

function patchRestorationFromCases() {
  restorationRequests = restorationRequests.map((req) => {
    const sc = suspensionCases.find((c) => c.id === req.suspensionCaseId)
    if (!sc) return req
    return {
      ...req,
      pensionerId: sc.pensionerId,
      ppoNumber: sc.ppoNumber,
      pensionerName: sc.pensionerName,
      suspensionReason: sc.suspensionReason,
    }
  })
}
patchRestorationFromCases()

export function getSuspensionCases() {
  return suspensionCases
}

export function getSuspensionCaseById(id: string) {
  return suspensionCases.find((c) => c.id === id)
}

export function getSuspensionCasesByPensioner(pensionerId: string) {
  return suspensionCases.filter((c) => c.pensionerId === pensionerId)
}

export function getActiveSuspensionForPensioner(pensionerId: string) {
  return suspensionCases.find(
    (c) =>
      c.pensionerId === pensionerId &&
      (c.status === 'suspended' || c.status === 'restoration_pending' || c.status === 'rejected'),
  )
}

export function getRestorationRequests() {
  return restorationRequests
}

export function getRestorationRequestById(id: string) {
  return restorationRequests.find((r) => r.id === id)
}

export function getRestorationRequestsByPensioner(pensionerId: string) {
  return restorationRequests.filter((r) => r.pensionerId === pensionerId)
}

export function getPendingRestorationCount() {
  return restorationRequests.filter((r) => r.status === 'submitted' || r.status === 'under_review').length
}

export function getSuspensionAuditLogs(suspensionCaseId?: string) {
  if (suspensionCaseId) return auditLogs.filter((l) => l.suspensionCaseId === suspensionCaseId)
  return auditLogs
}

export function getSuspensionDashboardStats(): SuspensionDashboardStats {
  const activeSuspended = suspensionCases.filter(
    (c) => c.status === 'suspended' || c.status === 'restoration_pending',
  ).length
  return {
    totalSuspended: activeSuspended,
    pendingRestoration: restorationRequests.filter(
      (r) => r.status === 'submitted' || r.status === 'under_review',
    ).length,
    restoredCases: suspensionCases.filter((c) => c.status === 'restored').length,
    fraudCases: suspensionCases.filter((c) => c.triggerType === 'fraud' && c.status !== 'restored').length,
    verificationFailureCases: suspensionCases.filter(
      (c) => c.triggerType === 'no_verification' && c.status !== 'restored',
    ).length,
  }
}

export function createSuspensionCase(input: CreateSuspensionCaseInput): SuspensionCase {
  const info = getPensionerInfo(input.pensionerId)
  if (!info) throw new Error('Pensioner not found')

  const existing = getActiveSuspensionForPensioner(input.pensionerId)
  if (existing) throw new Error('An active suspension case already exists for this pensioner')

  const now = today()
  const suspensionCase: SuspensionCase = {
    id: `SUS-2026-${String(suspensionCounter++).padStart(4, '0')}`,
    pensionerId: info.id,
    ppoNumber: info.ppoNumber,
    pensionerName: info.name,
    pensionerMobile: info.mobile,
    pensionType: info.pensionType,
    suspensionReason: input.suspensionReason,
    triggerType: input.triggerType,
    source: input.source ?? 'manual',
    suspensionDate: input.suspensionDate,
    remarks: input.remarks,
    documents: input.documents,
    createdBy: input.createdBy ?? 'Pension Administrator',
    status: 'suspended',
    timeline: [
      createTimelineEvent(
        'suspended',
        'Suspension Created',
        `${input.source === 'automatic' ? 'Automatic' : 'Manual'} suspension case created`,
        input.createdBy ?? 'Pension Administrator',
      ),
      createTimelineEvent('suspended', 'Notification Sent', 'Pensioner notified of suspension', 'System'),
    ],
    createdAt: now,
    updatedAt: now,
  }

  suspensionCases = [suspensionCase, ...suspensionCases]
  syncPensionerStatus(info.id, 'suspended')

  auditLogs = [
    createAuditEntry({
      suspensionCaseId: suspensionCase.id,
      user: suspensionCase.createdBy,
      action: 'suspension_created',
      newStatus: 'suspended',
      remarks: input.remarks ?? input.suspensionReason,
    }),
    ...auditLogs,
  ]

  addPensionerNotification({
    title: 'Pension Suspended',
    message: `Your pension has been suspended. Reason: ${input.suspensionReason}. Submit a restoration request from the Suspension section.`,
    type: 'suspension_notice',
    actionHref: '/pensioner/suspension',
    actionLabel: 'View Suspension',
  })

  return suspensionCase
}

export function createAutoSuspensionForLifeCert(
  pensionerId: string,
  remarks?: string,
): SuspensionCase | null {
  if (getActiveSuspensionForPensioner(pensionerId)) return null
  return createSuspensionCase({
    pensionerId,
    triggerType: 'no_verification',
    suspensionReason: getDefaultSuspensionReason('no_verification'),
    suspensionDate: today(),
    remarks: remarks ?? 'Grace period expired after reminders. Automatic suspension applied.',
    documents: [{ name: 'Auto Suspension Notice', fileName: 'auto_suspension_notice.pdf' }],
    createdBy: 'System',
    source: 'automatic',
  })
}

export function submitRestorationRequest(input: CreateRestorationRequestInput): RestorationRequest {
  const suspensionCase = getSuspensionCaseById(input.suspensionCaseId)
  if (!suspensionCase) throw new Error('Suspension case not found')
  if (suspensionCase.pensionerId !== input.pensionerId) throw new Error('Unauthorized')
  if (suspensionCase.status === 'restored') throw new Error('Pension already restored')
  if (suspensionCase.status === 'restoration_pending') {
    throw new Error('A restoration request is already pending review')
  }

  const now = today()
  const request: RestorationRequest = {
    id: `RST-2026-${String(restorationCounter++).padStart(4, '0')}`,
    suspensionCaseId: suspensionCase.id,
    pensionerId: suspensionCase.pensionerId,
    ppoNumber: suspensionCase.ppoNumber,
    pensionerName: suspensionCase.pensionerName,
    suspensionReason: suspensionCase.suspensionReason,
    requestDate: now,
    reasonForRestoration: input.reasonForRestoration,
    documents: input.documents,
    remarks: input.remarks,
    declarationAccepted: input.declarationAccepted,
    status: 'submitted',
    updatedAt: now,
    timeline: [
      createTimelineEvent('submitted', 'Request Submitted', 'Restoration request submitted by pensioner', 'Pensioner'),
    ],
  }

  restorationRequests = [request, ...restorationRequests]

  suspensionCases = suspensionCases.map((c) =>
    c.id === suspensionCase.id
      ? {
          ...c,
          status: 'restoration_pending' as const,
          updatedAt: now,
          timeline: [
            ...c.timeline,
            createTimelineEvent(
              'restoration_pending',
              'Restoration Requested',
              `Request ${request.id} submitted`,
              'Pensioner',
            ),
          ],
        }
      : c,
  )

  auditLogs = [
    createAuditEntry({
      suspensionCaseId: suspensionCase.id,
      restorationRequestId: request.id,
      user: 'Pensioner',
      action: 'restoration_requested',
      oldStatus: 'suspended',
      newStatus: 'restoration_pending',
      remarks: input.reasonForRestoration,
    }),
    ...auditLogs,
  ]

  addPensionerNotification({
    title: 'Restoration Request Submitted',
    message: `Your restoration request ${request.id} has been submitted and is pending admin review.`,
    type: 'restoration_update',
    actionHref: '/pensioner/suspension/requests',
    actionLabel: 'Track Request',
  })

  return request
}

export function processAdminRestorationAction(
  requestId: string,
  action: AdminRestorationAction,
  remarks: string,
  adminName = 'Pension Administrator',
): RestorationRequest {
  const request = getRestorationRequestById(requestId)
  if (!request) throw new Error('Restoration request not found')

  const suspensionCase = getSuspensionCaseById(request.suspensionCaseId)
  if (!suspensionCase) throw new Error('Suspension case not found')

  const now = today()

  if (action === 'verify') {
    const updated: RestorationRequest = {
      ...request,
      status: 'under_review',
      reviewedBy: adminName,
      adminRemarks: remarks,
      updatedAt: now,
      timeline: [
        ...request.timeline,
        createTimelineEvent('under_review', 'Under Review', remarks, adminName),
      ],
    }
    restorationRequests = restorationRequests.map((r) => (r.id === requestId ? updated : r))
    return updated
  }

  if (action === 'approve') {
    const updatedRequest: RestorationRequest = {
      ...request,
      status: 'approved',
      reviewedBy: adminName,
      adminRemarks: remarks,
      updatedAt: now,
      timeline: [
        ...request.timeline,
        createTimelineEvent('approved', 'Restoration Approved', remarks, adminName),
      ],
    }
    restorationRequests = restorationRequests.map((r) => (r.id === requestId ? updatedRequest : r))

    suspensionCases = suspensionCases.map((c) =>
      c.id === suspensionCase.id
        ? {
            ...c,
            status: 'restored' as const,
            restoredAt: now,
            updatedAt: now,
            timeline: [
              ...c.timeline,
              createTimelineEvent('restored', 'Pension Restored', remarks, adminName),
            ],
          }
        : c,
    )

    syncPensionerStatus(suspensionCase.pensionerId, 'active')

    auditLogs = [
      createAuditEntry({
        suspensionCaseId: suspensionCase.id,
        restorationRequestId: requestId,
        user: adminName,
        action: 'restoration_approved',
        oldStatus: 'restoration_pending',
        newStatus: 'restored',
        remarks,
      }),
      ...auditLogs,
    ]

    addPensionerNotification({
      title: 'Pension Restored',
      message: `Your restoration request has been approved. Your pension is now active. Restoration date: ${now}.`,
      type: 'pension_update',
      actionHref: '/pensioner/pension',
      actionLabel: 'View Pension',
    })

    return updatedRequest
  }

  const updatedRequest: RestorationRequest = {
    ...request,
    status: 'rejected',
    reviewedBy: adminName,
    rejectionReason: remarks,
    adminRemarks: remarks,
    updatedAt: now,
    timeline: [
      ...request.timeline,
      createTimelineEvent('rejected', 'Restoration Rejected', remarks, adminName),
    ],
  }
  restorationRequests = restorationRequests.map((r) => (r.id === requestId ? updatedRequest : r))

  suspensionCases = suspensionCases.map((c) =>
    c.id === suspensionCase.id
      ? {
          ...c,
          status: 'rejected' as const,
          restorationRejectedAt: now,
          rejectionReason: remarks,
          updatedAt: now,
          timeline: [
            ...c.timeline,
            createTimelineEvent('rejected', 'Restoration Rejected', remarks, adminName),
          ],
        }
      : c,
  )

  auditLogs = [
    createAuditEntry({
      suspensionCaseId: suspensionCase.id,
      restorationRequestId: requestId,
      user: adminName,
      action: 'restoration_rejected',
      oldStatus: 'restoration_pending',
      newStatus: 'rejected',
      remarks,
    }),
    ...auditLogs,
  ]

  addPensionerNotification({
    title: 'Restoration Request Rejected',
    message: `Your restoration request was rejected. Reason: ${remarks}. Your pension remains suspended.`,
    type: 'suspension_notice',
    actionHref: '/pensioner/suspension/restoration',
    actionLabel: 'Resubmit Request',
  })

  return updatedRequest
}

export function processAdminSuspensionAction(
  caseId: string,
  action: AdminSuspensionAction,
  remarks: string,
  adminName = 'Pension Administrator',
): SuspensionCase {
  const suspensionCase = getSuspensionCaseById(caseId)
  if (!suspensionCase) throw new Error('Suspension case not found')

  const now = today()
  const pendingRequest = restorationRequests.find(
    (r) =>
      r.suspensionCaseId === caseId &&
      (r.status === 'submitted' || r.status === 'under_review'),
  )

  if (action === 'verify_documents') {
    const updated: SuspensionCase = {
      ...suspensionCase,
      updatedAt: now,
      timeline: [
        ...suspensionCase.timeline,
        createTimelineEvent('under_review', 'Documents Verified', remarks, adminName),
      ],
    }
    suspensionCases = suspensionCases.map((c) => (c.id === caseId ? updated : c))
    if (pendingRequest) {
      processAdminRestorationAction(pendingRequest.id, 'verify', remarks, adminName)
    }
    return updated
  }

  if (action === 'restore') {
    if (pendingRequest) {
      processAdminRestorationAction(pendingRequest.id, 'approve', remarks, adminName)
    } else {
      suspensionCases = suspensionCases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'restored' as const,
              restoredAt: now,
              updatedAt: now,
              timeline: [
                ...c.timeline,
                createTimelineEvent('restored', 'Pension Restored', remarks, adminName),
              ],
            }
          : c,
      )
      syncPensionerStatus(suspensionCase.pensionerId, 'active')
      auditLogs = [
        createAuditEntry({
          suspensionCaseId: caseId,
          user: adminName,
          action: 'restoration_approved',
          oldStatus: suspensionCase.status,
          newStatus: 'restored',
          remarks,
        }),
        ...auditLogs,
      ]
      addPensionerNotification({
        title: 'Pension Restored',
        message: `Your pension has been restored by administrator. ${remarks}`,
        type: 'pension_update',
        actionHref: '/pensioner/pension',
        actionLabel: 'View Pension',
      })
    }
    return getSuspensionCaseById(caseId)!
  }

  if (pendingRequest) {
    processAdminRestorationAction(pendingRequest.id, 'reject', remarks, adminName)
  } else {
    suspensionCases = suspensionCases.map((c) =>
      c.id === caseId
        ? {
            ...c,
            status: 'rejected' as const,
            restorationRejectedAt: now,
            rejectionReason: remarks,
            updatedAt: now,
            timeline: [
              ...c.timeline,
              createTimelineEvent('rejected', 'Restoration Rejected', remarks, adminName),
            ],
          }
        : c,
    )
  }
  return getSuspensionCaseById(caseId)!
}
