import {
  applyProfileUpdateToRecord,
  formatNewValueDisplay,
  getCurrentValueForType,
  getPensionerName,
} from '@/lib/profile-update'
import { addPensionerNotification, findPensionerById, updatePensionerRecord } from '@/data/pensioner-mock-data'
import type {
  AdminProfileUpdateAction,
  CreateProfileUpdateInput,
  ProfileUpdateAuditLog,
  ProfileUpdateRequest,
  ProfileUpdateTimelineEvent,
} from '@/types/profile-update-request'

let requestCounter = 4

function createTimelineEvent(
  status: ProfileUpdateTimelineEvent['status'],
  title: string,
  description?: string,
  actor?: string,
): ProfileUpdateTimelineEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status,
    title,
    description,
    actor,
    timestamp: new Date().toISOString(),
  }
}

const seedRequests: ProfileUpdateRequest[] = [
  {
    id: 'REQ-2026-0001',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    requestType: 'bank_details',
    currentValue:
      'Bank: State Bank of India\nBranch: Andheri West Branch\nAccount: 30245678901\nIFSC: SBIN0001234\nHolder: Ramesh Kumar Sharma',
    newValue:
      'Bank: HDFC Bank\nBranch: Andheri East Branch\nAccount: 50112233445\nIFSC: HDFC0001234\nHolder: Ramesh Kumar Sharma',
    updatePayload: {
      bankName: 'HDFC Bank',
      branchName: 'Andheri East Branch',
      accountNumber: '50112233445',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Ramesh Kumar Sharma',
    },
    reason: 'Relocated to new area; HDFC branch is closer for pension disbursement.',
    documents: [{ name: 'Bank Passbook', fileName: 'bank_passbook_update.pdf' }],
    status: 'pending_review',
    submittedAt: '2026-06-10',
    updatedAt: '2026-06-10',
    timeline: [
      createTimelineEvent('submitted', 'Request Submitted', 'Bank details update request created', 'Ramesh Kumar Sharma'),
      createTimelineEvent('pending_review', 'Pending Review', 'Awaiting pension admin review'),
    ],
  },
  {
    id: 'REQ-2026-0002',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    requestType: 'nominee_details',
    currentValue:
      'Name: Sunita Sharma\nRelationship: Spouse\nMobile: +91 9123456780\nAadhaar: 7890 1234 5678\nShare: 100%',
    newValue:
      'Name: Suresh Kumar Sharma\nRelationship: Son\nMobile: +91 9988776655\nAadhaar: 6789 0123 4567\nShare: 100%',
    updatePayload: {
      nomineeName: 'Suresh Kumar Sharma',
      relationship: 'Son',
      mobileNumber: '+91 9988776655',
      aadhaarNumber: '6789 0123 4567',
      percentageShare: '100',
    },
    reason: 'Change in nominee due to family circumstances. Supporting legal documents attached.',
    documents: [
      { name: 'Nominee Declaration', fileName: 'nominee_declaration.pdf' },
      { name: 'Aadhaar Copy', fileName: 'nominee_aadhaar.pdf' },
    ],
    status: 'approved',
    submittedAt: '2026-05-15',
    updatedAt: '2026-05-22',
    reviewedBy: 'Pension Administrator',
    adminRemarks: 'Documents verified. Nominee change approved as per submitted declaration.',
    verificationNotes: 'All supporting documents verified against records.',
    timeline: [
      createTimelineEvent('submitted', 'Request Submitted', 'Nominee details update request created', 'Ramesh Kumar Sharma'),
      createTimelineEvent('pending_review', 'Pending Review', 'Assigned to verification queue'),
      createTimelineEvent('under_verification', 'Under Verification', 'Documents verified by admin', 'Pension Administrator'),
      createTimelineEvent('approved', 'Approved', 'Profile updated successfully', 'Pension Administrator'),
    ],
  },
  {
    id: 'REQ-2026-0003',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    requestType: 'address',
    currentValue: '42, Gandhi Nagar, Andheri West, Mumbai, Mumbai, Maharashtra, 400058',
    newValue: '15B, FC Road, Pune, Pune, Maharashtra, 411004',
    updatePayload: {
      houseNumber: '15B',
      street: 'FC Road',
      villageCity: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
    },
    reason: 'Permanent relocation to Pune after retirement.',
    documents: [{ name: 'Address Proof', fileName: 'address_proof.pdf' }],
    status: 'rejected',
    submittedAt: '2026-04-20',
    updatedAt: '2026-04-28',
    reviewedBy: 'Pension Administrator',
    adminRemarks: 'Address proof document is outdated. Please submit a recent utility bill or ration card.',
    timeline: [
      createTimelineEvent('submitted', 'Request Submitted', 'Address update request created', 'Ramesh Kumar Sharma'),
      createTimelineEvent('pending_review', 'Pending Review', 'Awaiting document verification'),
      createTimelineEvent('under_verification', 'Under Verification', 'Documents reviewed', 'Pension Administrator'),
      createTimelineEvent('rejected', 'Rejected', 'Address proof insufficient', 'Pension Administrator'),
    ],
  },
]

let requests: ProfileUpdateRequest[] = [...seedRequests]
let auditLogs: ProfileUpdateAuditLog[] = [
  {
    id: 'AUD-2026-0001',
    requestId: 'REQ-2026-0002',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    requestType: 'nominee_details',
    field: 'Nominee Name',
    oldValue: 'Sunita Sharma',
    newValue: 'Suresh Kumar Sharma',
    approvedBy: 'Pension Administrator',
    approvedAt: '2026-05-22',
  },
]

export function getProfileUpdateRequests() {
  return requests
}

export function getProfileUpdateRequestsByPensioner(pensionerId: string) {
  return requests.filter((r) => r.pensionerId === pensionerId)
}

export function getProfileUpdateRequestById(id: string) {
  return requests.find((r) => r.id === id)
}

export function getPendingProfileUpdateCount() {
  return requests.filter((r) => r.status === 'pending_review' || r.status === 'under_verification').length
}

export function getProfileUpdateAuditLogs(requestId?: string) {
  if (requestId) return auditLogs.filter((l) => l.requestId === requestId)
  return auditLogs
}

export function createProfileUpdateRequest(input: CreateProfileUpdateInput): ProfileUpdateRequest {
  const record = findPensionerById(input.pensionerId)
  if (!record) throw new Error('Pensioner not found')

  const currentValue = getCurrentValueForType(record, input.requestType)
  const newValue = formatNewValueDisplay(input.requestType, input.updatePayload)
  const now = new Date().toISOString().split('T')[0]

  const request: ProfileUpdateRequest = {
    id: `REQ-2026-${String(requestCounter++).padStart(4, '0')}`,
    pensionerId: input.pensionerId,
    ppoNumber: record.service.ppoNumber,
    pensionerName: getPensionerName(record),
    requestType: input.requestType,
    currentValue,
    newValue,
    updatePayload: input.updatePayload,
    reason: input.reason,
    documents: input.documents,
    status: 'pending_review',
    submittedAt: now,
    updatedAt: now,
    timeline: [
      createTimelineEvent(
        'submitted',
        'Request Submitted',
        `${input.requestType.replace(/_/g, ' ')} update request created`,
        getPensionerName(record),
      ),
      createTimelineEvent('pending_review', 'Pending Review', 'Notification sent to Pension Admin'),
    ],
  }

  requests = [request, ...requests]
  return request
}

export function processAdminProfileUpdateAction(
  requestId: string,
  action: AdminProfileUpdateAction,
  remarks: string,
  adminName = 'Pension Administrator',
): ProfileUpdateRequest {
  const request = requests.find((r) => r.id === requestId)
  if (!request) throw new Error('Request not found')

  const now = new Date().toISOString().split('T')[0]

  switch (action) {
    case 'verify': {
      const timeline = [
        ...request.timeline,
        createTimelineEvent('document_verified', 'Documents Verified', remarks, adminName),
        createTimelineEvent('under_verification', 'Under Verification', 'Documents verified, pending final decision', adminName),
      ]
      requests = requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'under_verification',
              verificationNotes: remarks,
              updatedAt: now,
              reviewedBy: adminName,
              timeline,
            }
          : r,
      )
      break
    }

    case 'approve': {
      const record = findPensionerById(request.pensionerId)
      if (!record) throw new Error('Pensioner not found')

      updatePensionerRecord(applyProfileUpdateToRecord(record, request.requestType, request.updatePayload))

      auditLogs = [
        {
          id: `AUD-2026-${String(auditLogs.length + 1).padStart(4, '0')}`,
          requestId: request.id,
          pensionerId: request.pensionerId,
          ppoNumber: request.ppoNumber,
          requestType: request.requestType,
          field: request.requestType.replace(/_/g, ' '),
          oldValue: request.currentValue.split('\n')[0] ?? request.currentValue,
          newValue: request.newValue.split('\n')[0] ?? request.newValue,
          approvedBy: adminName,
          approvedAt: now,
        },
        ...auditLogs,
      ]

      requests = requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              adminRemarks: remarks,
              reviewedBy: adminName,
              updatedAt: now,
              timeline: [...r.timeline, createTimelineEvent('approved', 'Approved', remarks, adminName)],
            }
          : r,
      )

      addPensionerNotification({
        type: 'system_announcement',
        title: 'Profile Update Approved',
        message:
          'Your profile update request has been approved and your profile has been updated successfully.',
        details: `Request ${request.id} — ${request.requestType.replace(/_/g, ' ')}`,
      })
      break
    }

    case 'reject':
      requests = requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              adminRemarks: remarks,
              reviewedBy: adminName,
              updatedAt: now,
              timeline: [...r.timeline, createTimelineEvent('rejected', 'Rejected', remarks, adminName)],
            }
          : r,
      )
      addPensionerNotification({
        type: 'system_announcement',
        title: 'Profile Update Rejected',
        message: 'Your profile update request has been rejected.',
        details: `Request ${request.id}. Reason: ${remarks}`,
      })
      break

    case 'more_info':
      requests = requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'more_info_required',
              adminRemarks: remarks,
              reviewedBy: adminName,
              updatedAt: now,
              timeline: [
                ...r.timeline,
                createTimelineEvent('more_info_required', 'More Information Required', remarks, adminName),
              ],
            }
          : r,
      )
      addPensionerNotification({
        type: 'document_request',
        title: 'Additional Documents Required',
        message: 'Your profile update request requires additional information.',
        details: remarks,
      })
      break
  }

  return getProfileUpdateRequestById(requestId)!
}
