import { addPensionerNotification, findPensionerById, recordLifeCertificateApproval, recordLifeCertificateRejection } from '@/data/pensioner-mock-data'
import { getPensionerName } from '@/lib/profile-update'
import { formatVerificationDisplayDate } from '@/lib/verification-dates'
import type { ProfileUpdateTimelineEvent } from '@/types/profile-update-request'
import type {
  LifeCertificateReviewStatus,
  LifeCertificateSubmission,
} from '@/types/life-certificate-review'
import type { LifeCertificateVerificationPayload } from '@/types/verification-submission'

let lcCounter = 6

function timelineEvent(
  status: ProfileUpdateTimelineEvent['status'],
  title: string,
  description?: string,
  actor?: string,
): ProfileUpdateTimelineEvent {
  return {
    id: `lc-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status,
    title,
    description,
    actor,
    timestamp: new Date().toISOString(),
  }
}

const seedSubmissions: LifeCertificateSubmission[] = [
  {
    id: 'LC-2026-0005',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    status: 'submitted',
    method: 'Digital Life Certificate',
    submittedAt: '2026-06-14',
    updatedAt: '2026-06-14',
    faceCaptureVerified: true,
    livenessPassed: true,
    otpVerified: true,
    declarationAccepted: true,
    timeline: [
      timelineEvent('submitted', 'Submitted', 'Digital life certificate submitted', 'Ramesh Kumar Sharma'),
      timelineEvent('pending_review', 'Pending Review', 'Awaiting admin verification'),
    ],
  },
  {
    id: 'LC-2026-0004',
    pensionerId: 'PEN-DEMO-002',
    ppoNumber: 'PPO789012',
    pensionerName: 'Priya Nair',
    status: 'submitted',
    method: 'Digital Life Certificate',
    submittedAt: '2026-06-13',
    updatedAt: '2026-06-13',
    faceCaptureVerified: true,
    livenessPassed: true,
    otpVerified: true,
    declarationAccepted: true,
    timeline: [
      timelineEvent('submitted', 'Submitted', 'Digital life certificate submitted', 'Priya Nair'),
    ],
  },
  {
    id: 'LC-2026-0003',
    pensionerId: 'PEN-00012',
    ppoNumber: 'PPO100012',
    pensionerName: 'Amit Singh',
    status: 'under_verification',
    method: 'Digital Life Certificate',
    submittedAt: '2026-06-12',
    updatedAt: '2026-06-13',
    faceCaptureVerified: true,
    livenessPassed: true,
    otpVerified: true,
    declarationAccepted: true,
    verificationNotes: 'Face match score 94%. Documents under review.',
    reviewedBy: 'Pension Administrator',
    timeline: [
      timelineEvent('submitted', 'Submitted', 'Digital life certificate submitted', 'Amit Singh'),
      timelineEvent('under_verification', 'Under Verification', 'Documents verified', 'Pension Administrator'),
    ],
  },
  {
    id: 'LC-2026-0002',
    pensionerId: 'PEN-00015',
    ppoNumber: 'PPO100015',
    pensionerName: 'Lakshmi Iyer',
    status: 'submitted',
    method: 'Digital Life Certificate',
    submittedAt: '2026-06-11',
    updatedAt: '2026-06-11',
    faceCaptureVerified: true,
    livenessPassed: true,
    otpVerified: true,
    declarationAccepted: true,
    timeline: [timelineEvent('submitted', 'Submitted', 'Pending admin review', 'Lakshmi Iyer')],
  },
  {
    id: 'LC-2026-0001',
    pensionerId: 'PEN-00008',
    ppoNumber: 'PPO100008',
    pensionerName: 'Sunita Reddy',
    status: 'approved',
    method: 'Digital Life Certificate',
    submittedAt: '2026-06-10',
    updatedAt: '2026-06-11',
    faceCaptureVerified: true,
    livenessPassed: true,
    otpVerified: true,
    declarationAccepted: true,
    adminRemarks: 'All verification checks passed. Life certificate approved for FY 2025-26.',
    reviewedBy: 'Pension Administrator',
    nextVerificationDueDate: '2027-06-10',
    faceCaptureTimestamp: '2026-06-10T10:15:00.000Z',
    livenessScore: 94,
    livenessTimestamp: '2026-06-10T10:16:30.000Z',
    faceMatchScore: 96,
    geoLocation: {
      latitude: 19.076,
      longitude: 72.8777,
      accuracy: 18,
      label: 'Mumbai, Maharashtra, India',
      capturedAt: '2026-06-10T10:17:00.000Z',
    },
    deviceInfo: {
      userAgent: 'Mozilla/5.0 (Demo)',
      platform: 'MacIntel',
      language: 'en-IN',
      screenResolution: '1440x900',
      timezone: 'Asia/Kolkata',
      capturedAt: '2026-06-10T10:15:00.000Z',
    },
    uploadedDocuments: [
      {
        name: 'Aadhaar Copy',
        fileName: 'aadhaar_life_cert.pdf',
        fileSize: 245760,
        uploadedAt: '2026-06-10',
      },
    ],
    timeline: [
      timelineEvent('submitted', 'Submitted', 'Pending admin review', 'Sunita Reddy'),
      timelineEvent('approved', 'Approved', 'Annual life certificate approved', 'Pension Administrator'),
    ],
  },
  {
    id: 'LC-2025-0042',
    pensionerId: 'PEN-00022',
    ppoNumber: 'PPO100022',
    pensionerName: 'Rajesh Menon',
    status: 'approved',
    method: 'Physical Submission',
    submittedAt: '2025-11-20',
    updatedAt: '2025-11-22',
    faceCaptureVerified: false,
    livenessPassed: false,
    otpVerified: false,
    declarationAccepted: true,
    adminRemarks: 'Physical life certificate verified at Thiruvananthapuram office.',
    reviewedBy: 'Pension Administrator',
    nextVerificationDueDate: '2026-11-20',
    timeline: [
      timelineEvent('submitted', 'Submitted', 'Physical certificate received', 'Rajesh Menon'),
      timelineEvent('approved', 'Approved', 'Physical verification completed', 'Pension Administrator'),
    ],
  },
  {
    id: 'LC-2025-0038',
    pensionerId: 'PEN-00019',
    ppoNumber: 'PPO100019',
    pensionerName: 'Geeta Patel',
    status: 'rejected',
    method: 'Digital Life Certificate',
    submittedAt: '2025-10-05',
    updatedAt: '2025-10-07',
    faceCaptureVerified: true,
    livenessPassed: false,
    otpVerified: true,
    declarationAccepted: true,
    adminRemarks: 'Liveness check failed. Face capture did not match Aadhaar records. Please resubmit.',
    reviewedBy: 'Pension Administrator',
    timeline: [
      timelineEvent('submitted', 'Submitted', 'Digital life certificate submitted', 'Geeta Patel'),
      timelineEvent('rejected', 'Rejected', 'Liveness verification failed', 'Pension Administrator'),
    ],
  },
]

let submissions: LifeCertificateSubmission[] = [...seedSubmissions]

export function getLifeCertificateSubmissions() {
  return submissions
}

export function getLifeCertificateSubmissionsByStatus(
  status: LifeCertificateReviewStatus,
) {
  return submissions.filter((s) => s.status === status)
}

export function getLifeCertificateById(id: string) {
  return submissions.find((s) => s.id === id)
}

export function isLifeCertificateResubmission(pensionerId: string) {
  return submissions.some((s) => s.pensionerId === pensionerId && s.status === 'rejected')
}

export function addLifeCertificateSubmission(
  pensionerId: string,
  verification?: LifeCertificateVerificationPayload,
): LifeCertificateSubmission {
  const record = findPensionerById(pensionerId)
  if (!record) throw new Error('Pensioner not found')

  const isResubmission = isLifeCertificateResubmission(pensionerId)
  const now = new Date().toISOString().split('T')[0]
  const pensionerName = getPensionerName(record)
  const submission: LifeCertificateSubmission = {
    id: `LC-2026-${String(lcCounter++).padStart(4, '0')}`,
    pensionerId,
    ppoNumber: record.service.ppoNumber,
    pensionerName,
    status: 'submitted',
    method: 'Digital Life Certificate',
    submittedAt: now,
    updatedAt: now,
    faceCaptureVerified: true,
    livenessPassed: true,
    otpVerified: true,
    declarationAccepted: true,
    isResubmission,
    faceCaptureTimestamp: verification?.faceCaptureTimestamp,
    livenessScore: verification?.livenessScore,
    livenessTimestamp: verification?.livenessTimestamp,
    faceMatchScore: verification?.faceMatchScore,
    geoLocation: verification?.geoLocation,
    deviceInfo: verification?.deviceInfo,
    uploadedDocuments: verification?.uploadedDocuments,
    timeline: isResubmission
      ? [
          timelineEvent('submitted', 'Resubmitted', 'Life certificate resubmitted after rejection', pensionerName),
          timelineEvent('pending_review', 'Pending Review', 'Resubmission added to admin work queue'),
        ]
      : [
          timelineEvent('submitted', 'Submitted', 'Digital life certificate submitted', pensionerName),
          timelineEvent('pending_review', 'Pending Review', 'Task added to admin work queue'),
        ],
  }
  submissions = [submission, ...submissions]
  return submission
}

export function processLifeCertificateAction(
  id: string,
  action: 'verify' | 'approve' | 'reject',
  remarks: string,
  adminName = 'Pension Administrator',
): LifeCertificateSubmission {
  const submission = submissions.find((s) => s.id === id)
  if (!submission) throw new Error('Submission not found')

  const now = new Date().toISOString().split('T')[0]

  if (action === 'verify') {
    submissions = submissions.map((s) =>
      s.id === id
        ? {
            ...s,
            status: 'under_verification',
            verificationNotes: remarks,
            reviewedBy: adminName,
            updatedAt: now,
            timeline: [
              ...s.timeline,
              timelineEvent('under_verification', 'Under Verification', remarks, adminName),
            ],
          }
        : s,
    )
  } else if (action === 'approve') {
    const schedule = recordLifeCertificateApproval(submission.pensionerId, now)
    submissions = submissions.map((s) =>
      s.id === id
        ? {
            ...s,
            status: 'approved',
            adminRemarks: remarks,
            reviewedBy: adminName,
            updatedAt: now,
            nextVerificationDueDate: schedule.nextVerificationDueDateIso,
            timeline: [...s.timeline, timelineEvent('approved', 'Approved', remarks, adminName)],
          }
        : s,
    )
    addPensionerNotification({
      type: 'verification_reminder',
      title: 'Life Certificate Approved',
      message: `Your annual life certificate has been approved. Next verification is due by ${schedule.nextVerificationDueDate}.`,
      details: `Submission ${id} approved on ${formatVerificationDisplayDate(now)}. Next due: ${schedule.nextVerificationDueDate}.`,
    })
  } else {
    recordLifeCertificateRejection(submission.pensionerId, remarks, now)
    submissions = submissions.map((s) =>
      s.id === id
        ? {
            ...s,
            status: 'rejected',
            adminRemarks: remarks,
            reviewedBy: adminName,
            updatedAt: now,
            timeline: [...s.timeline, timelineEvent('rejected', 'Rejected', remarks, adminName)],
          }
        : s,
    )
    addPensionerNotification({
      type: 'verification_reminder',
      title: 'Life Certificate Rejected',
      message: 'Your life certificate submission was rejected. Please review the reason and resubmit.',
      details: remarks,
      actionHref: '/pensioner/verification/start?mode=resubmit',
      actionLabel: 'Resubmit Life Certificate',
    })
  }

  return getLifeCertificateById(id)!
}

export function getPendingLifeCertificateCount() {
  return submissions.filter((s) => s.status === 'submitted' || s.status === 'under_verification').length
}
