import {
  calculateSlaDueAt,
  getDaysOpen,
  getResolutionHours,
  GRIEVANCE_CATEGORY_LABELS,
  GRIEVANCE_PRIORITY_LABELS,
  isSlaBreached,
} from '@/lib/grievance'
import type {
  AddGrievanceCommentInput,
  AssignGrievanceTicketInput,
  CreateGrievanceTicketInput,
  EscalateGrievanceTicketInput,
  GrievanceAuditEntry,
  GrievanceCategoryChartItem,
  GrievanceDashboardStats,
  GrievanceNotification,
  GrievanceOpenTicketsReportItem,
  GrievancePriorityChartItem,
  GrievanceResolutionTimeReportItem,
  GrievanceResolutionTrendItem,
  GrievanceSlaReportItem,
  GrievanceTicket,
  GrievanceTimelineEvent,
  HelpdeskOfficer,
  ResolveGrievanceTicketInput,
  UpdateGrievanceStatusInput,
} from '@/types/grievance'

let ticketCounter = 15

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function timelineEvent(
  type: GrievanceTimelineEvent['type'],
  title: string,
  timestamp: string,
  opts?: Partial<GrievanceTimelineEvent>,
): GrievanceTimelineEvent {
  return {
    id: uid('tl'),
    type,
    title,
    timestamp,
    ...opts,
  }
}

export const HELPDESK_OFFICERS: HelpdeskOfficer[] = [
  {
    id: 'hd-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@pension.gov.in',
    department: 'Helpdesk',
    activeTickets: 4,
  },
  {
    id: 'hd-002',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@pension.gov.in',
    department: 'Helpdesk',
    activeTickets: 3,
  },
  {
    id: 'hd-003',
    name: 'Anita Desai',
    email: 'anita.desai@pension.gov.in',
    department: 'Helpdesk',
    activeTickets: 2,
  },
]

let grievanceTickets: GrievanceTicket[] = [
  {
    id: 'GRV-2026-0001',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    contactNumber: '9876543210',
    category: 'pension_not_received',
    priority: 'high',
    subject: 'June 2026 pension not credited',
    description:
      'My pension for June 2026 has not been credited to my bank account. Last month payment was received on 1st. Account ending 4521.',
    status: 'in_progress',
    assignedTo: 'hd-001',
    assignedToName: 'Priya Sharma',
    escalationLevel: 1,
    slaDueAt: '2026-06-14T10:00:00',
    slaBreached: false,
    createdAt: '2026-06-13T08:30:00',
    updatedAt: '2026-06-14T11:00:00',
    attachments: [
      {
        id: 'att-001',
        fileName: 'bank-statement-june.pdf',
        uploadedAt: '2026-06-13T08:35:00',
        uploadedBy: 'Ramesh Kumar Sharma',
        sizeKb: 245,
      },
    ],
    comments: [
      {
        id: 'cmt-001',
        author: 'Priya Sharma',
        authorRole: 'Helpdesk Officer',
        message: 'We have escalated this to the disbursement team for verification.',
        timestamp: '2026-06-14T09:00:00',
      },
    ],
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-13T08:30:00', {
        actor: 'Ramesh Kumar Sharma',
        description: 'Grievance raised via pensioner portal',
      }),
      timelineEvent('ticket_assigned', 'Assigned to Priya Sharma', '2026-06-13T10:00:00', {
        actor: 'Helpdesk Manager',
      }),
      timelineEvent('status_changed', 'Status changed to In Progress', '2026-06-14T09:00:00', {
        actor: 'Priya Sharma',
        oldStatus: 'assigned',
        newStatus: 'in_progress',
      }),
      timelineEvent('comment_added', 'Comment added', '2026-06-14T09:00:00', {
        actor: 'Priya Sharma',
      }),
    ],
  },
  {
    id: 'GRV-2026-0002',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    contactNumber: '9876543210',
    category: 'wrong_pension_amount',
    priority: 'medium',
    subject: 'Arrears amount discrepancy after pay revision',
    description:
      'After the 7th CPC revision, my pension amount shows ₹28,500 but expected amount is ₹31,200 as per office letter dated Jan 2025.',
    status: 'waiting_for_user',
    assignedTo: 'hd-002',
    assignedToName: 'Rajesh Patel',
    escalationLevel: 1,
    slaDueAt: '2026-06-12T14:00:00',
    slaBreached: true,
    createdAt: '2026-06-10T14:00:00',
    updatedAt: '2026-06-12T16:00:00',
    attachments: [
      {
        id: 'att-002',
        fileName: 'revision-order-2025.pdf',
        uploadedAt: '2026-06-10T14:05:00',
        uploadedBy: 'Ramesh Kumar Sharma',
        sizeKb: 512,
      },
    ],
    comments: [
      {
        id: 'cmt-002',
        author: 'Rajesh Patel',
        authorRole: 'Helpdesk Officer',
        message: 'Please upload your latest pension payment slip for cross-verification.',
        timestamp: '2026-06-12T16:00:00',
      },
    ],
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-10T14:00:00', {
        actor: 'Ramesh Kumar Sharma',
      }),
      timelineEvent('ticket_assigned', 'Assigned to Rajesh Patel', '2026-06-10T16:00:00', {
        actor: 'Helpdesk Manager',
      }),
      timelineEvent('status_changed', 'Status changed to Waiting For User', '2026-06-12T16:00:00', {
        actor: 'Rajesh Patel',
        oldStatus: 'in_progress',
        newStatus: 'waiting_for_user',
      }),
    ],
  },
  {
    id: 'GRV-2026-0003',
    pensionerId: 'PEN-00012',
    ppoNumber: 'PPO555001',
    pensionerName: 'Geeta Verma',
    contactNumber: '9123456780',
    category: 'recovery_related',
    priority: 'high',
    subject: 'Incorrect recovery deduction on pension',
    description:
      '₹5,000 was deducted from my May pension for recovery case REC-2025-0089 which was already closed in March 2026.',
    status: 'escalated',
    assignedTo: 'hd-001',
    assignedToName: 'Priya Sharma',
    escalationLevel: 2,
    slaDueAt: '2026-06-11T08:00:00',
    slaBreached: true,
    createdAt: '2026-06-09T08:00:00',
    updatedAt: '2026-06-12T10:00:00',
    attachments: [],
    comments: [
      {
        id: 'cmt-003',
        author: 'Pension Admin',
        authorRole: 'Pension Admin',
        message: 'Escalated to recovery section for urgent review.',
        timestamp: '2026-06-12T10:00:00',
        isInternal: true,
      },
    ],
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-09T08:00:00', {
        actor: 'Geeta Verma',
      }),
      timelineEvent('escalation', 'Escalated to Level 2 – Pension Admin', '2026-06-12T10:00:00', {
        actor: 'Helpdesk Manager',
        description: 'SLA breached — recovery deduction dispute',
      }),
    ],
  },
  {
    id: 'GRV-2026-0004',
    pensionerId: 'PEN-00008',
    ppoNumber: 'PPO100008',
    pensionerName: 'Suresh Iyer',
    contactNumber: '9988776655',
    category: 'login_problem',
    priority: 'critical',
    subject: 'Unable to login to pension portal',
    description:
      'Getting "Invalid credentials" error despite resetting password twice. Need urgent access for life certificate submission due this week.',
    status: 'open',
    escalationLevel: 1,
    slaDueAt: '2026-06-15T06:00:00',
    slaBreached: false,
    createdAt: '2026-06-15T04:00:00',
    updatedAt: '2026-06-15T04:00:00',
    attachments: [],
    comments: [],
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-15T04:00:00', {
        actor: 'Suresh Iyer',
        description: 'Critical priority — login blocked',
      }),
    ],
  },
  {
    id: 'GRV-2026-0005',
    pensionerId: 'PEN-00015',
    ppoNumber: 'PPO100015',
    pensionerName: 'Lakshmi Devi',
    contactNumber: '9876501234',
    category: 'verification_issue',
    priority: 'medium',
    subject: 'Life certificate submission rejected',
    description:
      'My digital life certificate was rejected citing blurry photograph. I have resubmitted with better lighting but status still shows rejected.',
    status: 'assigned',
    assignedTo: 'hd-003',
    assignedToName: 'Anita Desai',
    escalationLevel: 1,
    slaDueAt: '2026-06-16T12:00:00',
    slaBreached: false,
    createdAt: '2026-06-14T12:00:00',
    updatedAt: '2026-06-14T14:00:00',
    attachments: [
      {
        id: 'att-005',
        fileName: 'lc-resubmission-screenshot.png',
        uploadedAt: '2026-06-14T12:10:00',
        uploadedBy: 'Lakshmi Devi',
        sizeKb: 890,
      },
    ],
    comments: [],
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-14T12:00:00', {
        actor: 'Lakshmi Devi',
      }),
      timelineEvent('ticket_assigned', 'Assigned to Anita Desai', '2026-06-14T14:00:00', {
        actor: 'Helpdesk Manager',
      }),
    ],
  },
  {
    id: 'GRV-2026-0006',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    contactNumber: '9876543210',
    category: 'document_issue',
    priority: 'low',
    subject: 'Uploaded document not visible in portal',
    description:
      'I uploaded my Aadhaar update document 3 days ago but it is not showing in my documents section.',
    status: 'resolved',
    assignedTo: 'hd-002',
    assignedToName: 'Rajesh Patel',
    escalationLevel: 1,
    slaDueAt: '2026-06-08T10:00:00',
    slaBreached: false,
    createdAt: '2026-06-05T10:00:00',
    updatedAt: '2026-06-08T15:00:00',
    attachments: [],
    comments: [],
    resolution: {
      notes: 'Document was stuck in processing queue. Manually indexed and made visible.',
      rootCause: 'Batch processing delay in document indexing service',
      correctiveAction: 'Document re-indexed; monitoring queue for similar cases',
      resolutionDate: '2026-06-08T15:00:00',
      resolvedBy: 'Rajesh Patel',
    },
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-05T10:00:00', {
        actor: 'Ramesh Kumar Sharma',
      }),
      timelineEvent('resolution_added', 'Resolution Added', '2026-06-08T15:00:00', {
        actor: 'Rajesh Patel',
        newStatus: 'resolved',
      }),
    ],
  },
  {
    id: 'GRV-2025-0045',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    contactNumber: '9876543210',
    category: 'pension_not_received',
    priority: 'high',
    subject: 'Delay in arrears payment',
    description: 'Arrears amount from January 2025 revision has not been credited yet.',
    status: 'closed',
    assignedTo: 'hd-001',
    assignedToName: 'Priya Sharma',
    escalationLevel: 1,
    slaDueAt: '2025-03-13T10:00:00',
    slaBreached: false,
    createdAt: '2025-03-10T10:00:00',
    updatedAt: '2025-04-05T10:00:00',
    attachments: [],
    comments: [
      {
        id: 'cmt-arrear-001',
        author: 'Ramesh Kumar Sharma',
        authorRole: 'Pensioner',
        message:
          'I raised this because the January 2025 pay revision arrears of ₹12,500 have still not appeared in my pension account.',
        timestamp: '2025-03-10T10:15:00.000Z',
      },
      {
        id: 'cmt-arrear-002',
        author: 'Priya Sharma',
        authorRole: 'Helpdesk Officer',
        message:
          'Thank you for reporting this. We have traced the delay to a processing backlog during the revision cycle and escalated it to the accounts team.',
        timestamp: '2025-03-12T14:30:00.000Z',
      },
      {
        id: 'cmt-arrear-003',
        author: 'Priya Sharma',
        authorRole: 'Helpdesk Officer',
        message:
          'Arrears of ₹12,500 have been credited to your registered bank account on 02 April 2025. Please confirm once you see the amount.',
        timestamp: '2025-04-02T10:30:00.000Z',
      },
    ],
    resolution: {
      notes: 'Arrears of ₹12,500 credited to pensioner account on 02 April 2025.',
      rootCause: 'Processing backlog during pay revision cycle',
      correctiveAction: 'Arrears disbursed; pensioner confirmed receipt',
      resolutionDate: '2025-04-02T10:00:00',
      resolvedBy: 'Priya Sharma',
    },
    resolutionAccepted: true,
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2025-03-10T10:00:00', {
        actor: 'Ramesh Kumar Sharma',
      }),
      timelineEvent('resolution_added', 'Resolution Added', '2025-04-02T10:00:00', {
        actor: 'Priya Sharma',
      }),
      timelineEvent('resolution_accepted', 'Resolution Accepted by Pensioner', '2025-04-05T10:00:00', {
        actor: 'Ramesh Kumar Sharma',
        newStatus: 'closed',
      }),
      timelineEvent('ticket_closed', 'Ticket Closed', '2025-04-05T10:00:00', {
        actor: 'System',
      }),
    ],
  },
  {
    id: 'GRV-2026-0007',
    pensionerId: 'PEN-00020',
    ppoNumber: 'PPO100020',
    pensionerName: 'Vikram Nair',
    contactNumber: '9012345678',
    category: 'family_pension',
    priority: 'high',
    subject: 'Family pension application status inquiry',
    description:
      'Submitted family pension application after demise of pensioner on 15 Feb 2026. No update received in 3 weeks.',
    status: 'in_progress',
    assignedTo: 'hd-003',
    assignedToName: 'Anita Desai',
    escalationLevel: 1,
    slaDueAt: '2026-06-13T16:00:00',
    slaBreached: true,
    createdAt: '2026-06-12T16:00:00',
    updatedAt: '2026-06-14T10:00:00',
    attachments: [
      {
        id: 'att-007',
        fileName: 'family-pension-form.pdf',
        uploadedAt: '2026-06-12T16:05:00',
        uploadedBy: 'Vikram Nair',
        sizeKb: 320,
      },
    ],
    comments: [],
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-12T16:00:00', {
        actor: 'Vikram Nair',
      }),
      timelineEvent('ticket_assigned', 'Assigned to Anita Desai', '2026-06-13T09:00:00', {
        actor: 'Helpdesk Manager',
      }),
    ],
  },
  {
    id: 'GRV-2026-0008',
    pensionerId: 'PEN-00025',
    ppoNumber: 'PPO100025',
    pensionerName: 'Mohammed Khan',
    contactNumber: '9765432109',
    category: 'suspension_related',
    priority: 'critical',
    subject: 'Pension suspended without notice',
    description:
      'My pension was suspended this month without any prior notice or communication. I submitted life certificate in May.',
    status: 'escalated',
    assignedTo: 'hd-001',
    assignedToName: 'Priya Sharma',
    escalationLevel: 3,
    slaDueAt: '2026-06-14T20:00:00',
    slaBreached: true,
    createdAt: '2026-06-14T12:00:00',
    updatedAt: '2026-06-15T02:00:00',
    attachments: [],
    comments: [
      {
        id: 'cmt-008',
        author: 'Super Admin',
        authorRole: 'Super Admin',
        message: 'Urgent review requested — suspension may be erroneous.',
        timestamp: '2026-06-15T02:00:00',
        isInternal: true,
      },
    ],
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-14T12:00:00', {
        actor: 'Mohammed Khan',
      }),
      timelineEvent('escalation', 'Escalated to Level 3 – Super Admin', '2026-06-15T02:00:00', {
        actor: 'Pension Admin',
        description: 'Critical suspension dispute — SLA breached',
      }),
    ],
  },
  {
    id: 'GRV-2026-0009',
    pensionerId: 'PEN-00030',
    ppoNumber: 'PPO100030',
    pensionerName: 'Kamala Reddy',
    contactNumber: '9654321098',
    category: 'account_activation',
    priority: 'medium',
    subject: 'Account activation OTP not received',
    description:
      'Trying to activate pension portal account for 2 days. OTP is not being received on registered mobile number.',
    status: 'open',
    escalationLevel: 1,
    slaDueAt: '2026-06-17T08:00:00',
    slaBreached: false,
    createdAt: '2026-06-15T08:00:00',
    updatedAt: '2026-06-15T08:00:00',
    attachments: [],
    comments: [],
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-15T08:00:00', {
        actor: 'Kamala Reddy',
      }),
    ],
  },
  {
    id: 'GRV-2026-0010',
    pensionerId: 'PEN-00035',
    ppoNumber: 'PPO100035',
    pensionerName: 'Harish Gupta',
    contactNumber: '9543210987',
    category: 'general_inquiry',
    priority: 'low',
    subject: 'How to update nominee details',
    description:
      'I want to update my nominee details. Please guide on the process and required documents.',
    status: 'resolved',
    assignedTo: 'hd-002',
    assignedToName: 'Rajesh Patel',
    escalationLevel: 1,
    slaDueAt: '2026-06-10T14:00:00',
    slaBreached: false,
    createdAt: '2026-06-07T14:00:00',
    updatedAt: '2026-06-09T11:00:00',
    attachments: [],
    comments: [
      {
        id: 'cmt-010',
        author: 'Rajesh Patel',
        authorRole: 'Helpdesk Officer',
        message:
          'Nominee update requires Form 14, nominee ID proof, and pensioner ID proof. Submit via Documents section.',
        timestamp: '2026-06-09T10:00:00',
      },
    ],
    resolution: {
      notes: 'Provided step-by-step guidance for nominee update via portal.',
      rootCause: 'Pensioner unaware of nominee update process',
      correctiveAction: 'Guidance shared; FAQ link provided',
      resolutionDate: '2026-06-09T11:00:00',
      resolvedBy: 'Rajesh Patel',
    },
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-07T14:00:00', {
        actor: 'Harish Gupta',
      }),
      timelineEvent('resolution_added', 'Resolution Added', '2026-06-09T11:00:00', {
        actor: 'Rajesh Patel',
      }),
    ],
  },
  {
    id: 'GRV-2026-0011',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    contactNumber: '9876543210',
    category: 'general_inquiry',
    priority: 'low',
    subject: 'Portal maintenance schedule inquiry',
    description: 'When is the next scheduled maintenance for the pension portal?',
    status: 'reopened',
    assignedTo: 'hd-002',
    assignedToName: 'Rajesh Patel',
    escalationLevel: 1,
    slaDueAt: '2026-06-16T10:00:00',
    slaBreached: false,
    createdAt: '2026-06-01T10:00:00',
    updatedAt: '2026-06-14T09:00:00',
    attachments: [],
    comments: [],
    resolution: {
      notes: 'Maintenance scheduled for 20 June 2026, 2:00 AM – 4:00 AM IST.',
      rootCause: 'Routine scheduled maintenance',
      correctiveAction: 'Maintenance notice published on portal',
      resolutionDate: '2026-06-03T10:00:00',
      resolvedBy: 'Rajesh Patel',
    },
    resolutionAccepted: false,
    resolutionRejectedAt: '2026-06-14T09:00:00',
    resolutionRejectionReason: 'Maintenance occurred but portal was down for 6 hours, not 2 as stated.',
    timeline: [
      timelineEvent('ticket_created', 'Ticket Created', '2026-06-01T10:00:00', {
        actor: 'Ramesh Kumar Sharma',
      }),
      timelineEvent('resolution_added', 'Resolution Added', '2026-06-03T10:00:00', {
        actor: 'Rajesh Patel',
      }),
      timelineEvent('resolution_rejected', 'Resolution Rejected by Pensioner', '2026-06-14T09:00:00', {
        actor: 'Ramesh Kumar Sharma',
        newStatus: 'reopened',
      }),
    ],
  },
]

let grievanceAuditLogs: GrievanceAuditEntry[] = grievanceTickets.flatMap((ticket) =>
  ticket.timeline.map((event, i) => ({
    id: `audit-${ticket.id}-${i}`,
    ticketId: ticket.id,
    user: event.actor ?? 'System',
    action: mapTimelineToAudit(event.type),
    timestamp: event.timestamp,
    oldStatus: event.oldStatus,
    newStatus: event.newStatus,
    remarks: event.description,
  })),
)

let grievanceNotifications: GrievanceNotification[] = [
  {
    id: 'gn-001',
    ticketId: 'GRV-2026-0001',
    channel: 'portal',
    recipient: 'Ramesh Kumar Sharma',
    subject: 'Ticket Assigned',
    message: 'Your grievance GRV-2026-0001 has been assigned to Priya Sharma.',
    sentAt: '2026-06-13T10:00:00',
  },
  {
    id: 'gn-002',
    ticketId: 'GRV-2026-0004',
    channel: 'sms',
    recipient: '9988776655',
    subject: 'Ticket Created',
    message: 'Grievance GRV-2026-0004 registered. Our team will respond shortly.',
    sentAt: '2026-06-15T04:05:00',
  },
]

function mapTimelineToAudit(type: GrievanceTimelineEvent['type']): GrievanceAuditEntry['action'] {
  const map: Record<GrievanceTimelineEvent['type'], GrievanceAuditEntry['action']> = {
    ticket_created: 'ticket_created',
    comment_added: 'comment_added',
    document_uploaded: 'document_uploaded',
    status_changed: 'status_changed',
    resolution_added: 'resolution_added',
    escalation: 'escalation_triggered',
    ticket_assigned: 'ticket_assigned',
    ticket_closed: 'ticket_closed',
    resolution_accepted: 'ticket_closed',
    resolution_rejected: 'status_changed',
  }
  return map[type]
}

function pushAudit(entry: Omit<GrievanceAuditEntry, 'id'>) {
  grievanceAuditLogs = [{ id: uid('audit'), ...entry }, ...grievanceAuditLogs]
}

function pushNotification(notification: Omit<GrievanceNotification, 'id'>) {
  grievanceNotifications = [{ id: uid('gn'), ...notification }, ...grievanceNotifications]
}

function pushTimeline(ticket: GrievanceTicket, event: GrievanceTimelineEvent) {
  ticket.timeline = [event, ...ticket.timeline]
  pushAudit({
    ticketId: ticket.id,
    user: event.actor ?? 'System',
    action: mapTimelineToAudit(event.type),
    timestamp: event.timestamp,
    oldStatus: event.oldStatus,
    newStatus: event.newStatus,
    remarks: event.description,
  })
}

function notifyTicketEvent(
  ticket: GrievanceTicket,
  subject: string,
  message: string,
  channels: GrievanceNotification['channel'][] = ['portal', 'email'],
) {
  const now = new Date().toISOString()
  for (const channel of channels) {
    pushNotification({
      ticketId: ticket.id,
      channel,
      recipient: channel === 'sms' ? ticket.contactNumber : ticket.pensionerName,
      subject,
      message,
      sentAt: now,
    })
  }
}

function updateTicket(id: string, updater: (ticket: GrievanceTicket) => GrievanceTicket) {
  const index = grievanceTickets.findIndex((t) => t.id === id)
  if (index < 0) return null
  grievanceTickets[index] = updater(grievanceTickets[index])
  grievanceTickets[index].slaBreached = isSlaBreached(
    grievanceTickets[index].slaDueAt,
    grievanceTickets[index].status,
  )
  return grievanceTickets[index]
}

export function getGrievanceTickets(): GrievanceTicket[] {
  return grievanceTickets.map((t) => ({
    ...t,
    slaBreached: isSlaBreached(t.slaDueAt, t.status),
  }))
}

export function getGrievanceTicketById(id: string): GrievanceTicket | undefined {
  const ticket = grievanceTickets.find((t) => t.id === id)
  if (!ticket) return undefined
  return { ...ticket, slaBreached: isSlaBreached(ticket.slaDueAt, ticket.status) }
}

export function getGrievanceTicketsByPensioner(pensionerId: string): GrievanceTicket[] {
  return getGrievanceTickets().filter((t) => t.pensionerId === pensionerId)
}

export function getHelpdeskOfficers(): HelpdeskOfficer[] {
  return HELPDESK_OFFICERS.map((o) => ({
    ...o,
    activeTickets: grievanceTickets.filter(
      (t) =>
        t.assignedTo === o.id &&
        !['closed', 'resolved'].includes(t.status),
    ).length,
  }))
}

export function getGrievanceAuditLogs(ticketId?: string): GrievanceAuditEntry[] {
  if (ticketId) return grievanceAuditLogs.filter((a) => a.ticketId === ticketId)
  return [...grievanceAuditLogs]
}

export function getGrievanceNotifications(ticketId?: string): GrievanceNotification[] {
  if (ticketId) return grievanceNotifications.filter((n) => n.ticketId === ticketId)
  return [...grievanceNotifications]
}

export function createGrievanceTicket(input: CreateGrievanceTicketInput): GrievanceTicket {
  ticketCounter += 1
  const now = new Date().toISOString()
  const id = `GRV-2026-${String(ticketCounter).padStart(4, '0')}`
  const slaDueAt = calculateSlaDueAt(input.priority)

  const attachments = (input.attachmentNames ?? []).map((fileName) => ({
    id: uid('att'),
    fileName,
    uploadedAt: now,
    uploadedBy: input.pensionerName,
    sizeKb: Math.floor(Math.random() * 500) + 50,
  }))

  const ticket: GrievanceTicket = {
    id,
    pensionerId: input.pensionerId,
    ppoNumber: input.ppoNumber,
    pensionerName: input.pensionerName,
    contactNumber: input.contactNumber,
    category: input.category,
    priority: input.priority,
    subject: input.subject,
    description: input.description,
    status: 'open',
    escalationLevel: 1,
    slaDueAt,
    slaBreached: false,
    createdAt: now,
    updatedAt: now,
    attachments,
    comments: [],
    timeline: [],
  }

  pushTimeline(
    ticket,
    timelineEvent('ticket_created', 'Ticket Created', now, {
      actor: input.pensionerName,
      description: `Category: ${GRIEVANCE_CATEGORY_LABELS[input.category]}, Priority: ${GRIEVANCE_PRIORITY_LABELS[input.priority]}`,
      newStatus: 'open',
    }),
  )

  if (attachments.length > 0) {
    pushTimeline(
      ticket,
      timelineEvent('document_uploaded', `${attachments.length} document(s) uploaded`, now, {
        actor: input.pensionerName,
      }),
    )
  }

  grievanceTickets = [ticket, ...grievanceTickets]
  notifyTicketEvent(
    ticket,
    'Ticket Created',
    `Grievance ${id} registered successfully. Our helpdesk team will review shortly.`,
    ['portal', 'sms', 'email'],
  )
  notifyTicketEvent(
    ticket,
    'New Ticket — Helpdesk',
    `New grievance ${id} from ${input.pensionerName} (${input.ppoNumber}): ${input.subject}`,
    ['portal'],
  )

  return ticket
}

export function assignGrievanceTicket(input: AssignGrievanceTicketInput): GrievanceTicket | null {
  const now = new Date().toISOString()
  return updateTicket(input.ticketId, (ticket) => {
    const oldStatus = ticket.status
    pushTimeline(
      ticket,
      timelineEvent('ticket_assigned', `Assigned to ${input.officerName}`, now, {
        actor: input.assignedBy,
        description: input.officerName,
        oldStatus,
        newStatus: 'assigned',
      }),
    )
    notifyTicketEvent(
      ticket,
      'Ticket Assigned',
      `Grievance ${ticket.id} has been assigned to ${input.officerName}.`,
    )
    return {
      ...ticket,
      assignedTo: input.officerId,
      assignedToName: input.officerName,
      status: 'assigned',
      updatedAt: now,
    }
  })
}

export function updateGrievanceStatus(input: UpdateGrievanceStatusInput): GrievanceTicket | null {
  const now = new Date().toISOString()
  return updateTicket(input.ticketId, (ticket) => {
    const oldStatus = ticket.status
    pushTimeline(
      ticket,
      timelineEvent('status_changed', `Status changed to ${input.status.replace(/_/g, ' ')}`, now, {
        actor: input.updatedBy,
        description: input.remarks,
        oldStatus,
        newStatus: input.status,
      }),
    )
    notifyTicketEvent(
      ticket,
      'Status Updated',
      `Grievance ${ticket.id} status updated to ${input.status.replace(/_/g, ' ')}.`,
    )
    return { ...ticket, status: input.status, updatedAt: now }
  })
}

export function resolveGrievanceTicket(input: ResolveGrievanceTicketInput): GrievanceTicket | null {
  const now = new Date().toISOString()
  return updateTicket(input.ticketId, (ticket) => {
    pushTimeline(
      ticket,
      timelineEvent('resolution_added', 'Resolution Added', now, {
        actor: input.resolvedBy,
        description: input.notes,
        oldStatus: ticket.status,
        newStatus: 'resolved',
      }),
    )
    notifyTicketEvent(
      ticket,
      'Resolution Added',
      `Resolution added for grievance ${ticket.id}. Please review and confirm.`,
      ['portal', 'sms', 'email'],
    )
    return {
      ...ticket,
      status: 'resolved',
      updatedAt: now,
      resolution: {
        notes: input.notes,
        rootCause: input.rootCause,
        correctiveAction: input.correctiveAction,
        resolutionDate: now,
        resolvedBy: input.resolvedBy,
      },
    }
  })
}

export function escalateGrievanceTicket(input: EscalateGrievanceTicketInput): GrievanceTicket | null {
  const now = new Date().toISOString()
  return updateTicket(input.ticketId, (ticket) => {
    const newLevel = Math.min(3, ticket.escalationLevel + 1) as 1 | 2 | 3
    pushTimeline(
      ticket,
      timelineEvent('escalation', `Escalated to Level ${newLevel}`, now, {
        actor: input.escalatedBy,
        description: input.reason,
        oldStatus: ticket.status,
        newStatus: 'escalated',
      }),
    )
    notifyTicketEvent(
      ticket,
      'Ticket Escalated',
      `Grievance ${ticket.id} escalated to Level ${newLevel}. Reason: ${input.reason}`,
      ['portal', 'email'],
    )
    return {
      ...ticket,
      status: 'escalated',
      escalationLevel: newLevel,
      updatedAt: now,
    }
  })
}

export function addGrievanceComment(input: AddGrievanceCommentInput): GrievanceTicket | null {
  const now = new Date().toISOString()
  return updateTicket(input.ticketId, (ticket) => {
    const comment = {
      id: uid('cmt'),
      author: input.author,
      authorRole: input.authorRole,
      message: input.message,
      timestamp: now,
      isInternal: input.isInternal,
    }
    pushTimeline(
      ticket,
      timelineEvent('comment_added', 'Comment Added', now, {
        actor: input.author,
        description: input.isInternal ? '(Internal)' : input.message.slice(0, 80),
      }),
    )
    if (!input.isInternal) {
      notifyTicketEvent(
        ticket,
        'New Comment',
        `New comment on grievance ${ticket.id} from ${input.author}.`,
      )
    }
    return {
      ...ticket,
      comments: [...ticket.comments, comment],
      updatedAt: now,
    }
  })
}

export function addGrievanceAttachments(
  ticketId: string,
  fileNames: string[],
  uploadedBy: string,
): GrievanceTicket | null {
  const now = new Date().toISOString()
  return updateTicket(ticketId, (ticket) => {
    const newAttachments = fileNames.map((fileName) => ({
      id: uid('att'),
      fileName,
      uploadedAt: now,
      uploadedBy,
      sizeKb: Math.floor(Math.random() * 500) + 50,
    }))
    pushTimeline(
      ticket,
      timelineEvent('document_uploaded', `${fileNames.length} document(s) uploaded`, now, {
        actor: uploadedBy,
      }),
    )
    return {
      ...ticket,
      attachments: [...ticket.attachments, ...newAttachments],
      updatedAt: now,
    }
  })
}

export function acceptGrievanceResolution(ticketId: string, pensionerName: string): GrievanceTicket | null {
  const now = new Date().toISOString()
  return updateTicket(ticketId, (ticket) => {
    pushTimeline(
      ticket,
      timelineEvent('resolution_accepted', 'Resolution Accepted', now, {
        actor: pensionerName,
        oldStatus: 'resolved',
        newStatus: 'closed',
      }),
    )
    pushTimeline(
      ticket,
      timelineEvent('ticket_closed', 'Ticket Closed', now, {
        actor: 'System',
        newStatus: 'closed',
      }),
    )
    notifyTicketEvent(ticket, 'Ticket Closed', `Grievance ${ticket.id} has been closed. Thank you for your feedback.`)
    return {
      ...ticket,
      status: 'closed',
      resolutionAccepted: true,
      updatedAt: now,
    }
  })
}

export function rejectGrievanceResolution(
  ticketId: string,
  pensionerName: string,
  reason: string,
): GrievanceTicket | null {
  const now = new Date().toISOString()
  return updateTicket(ticketId, (ticket) => {
    pushTimeline(
      ticket,
      timelineEvent('resolution_rejected', 'Resolution Rejected', now, {
        actor: pensionerName,
        description: reason,
        oldStatus: 'resolved',
        newStatus: 'reopened',
      }),
    )
    notifyTicketEvent(
      ticket,
      'Resolution Rejected',
      `Pensioner rejected resolution for ${ticket.id}. Ticket reopened for further action.`,
      ['portal'],
    )
    return {
      ...ticket,
      status: 'reopened',
      resolutionAccepted: false,
      resolutionRejectedAt: now,
      resolutionRejectionReason: reason,
      updatedAt: now,
    }
  })
}

export function getGrievanceDashboardStats(): GrievanceDashboardStats {
  const tickets = getGrievanceTickets()
  const resolvedTickets = tickets.filter((t) => t.resolution)
  const avgResolutionHours =
    resolvedTickets.length > 0
      ? Math.round(
          resolvedTickets.reduce(
            (sum, t) => sum + getResolutionHours(t.createdAt, t.resolution!.resolutionDate),
            0,
          ) / resolvedTickets.length,
        )
      : 0

  return {
    openTickets: tickets.filter((t) => t.status === 'open').length,
    assignedTickets: tickets.filter((t) => t.status === 'assigned').length,
    inProgressTickets: tickets.filter((t) => t.status === 'in_progress').length,
    escalatedTickets: tickets.filter((t) => t.status === 'escalated').length,
    resolvedTickets: tickets.filter((t) => t.status === 'resolved').length,
    closedTickets: tickets.filter((t) => t.status === 'closed').length,
    waitingForUser: tickets.filter((t) => t.status === 'waiting_for_user').length,
    slaBreached: tickets.filter((t) => t.slaBreached).length,
    avgResolutionHours,
    totalTickets: tickets.length,
  }
}

export function getGrievanceCategoryChart(): GrievanceCategoryChartItem[] {
  const tickets = getGrievanceTickets()
  const counts = new Map<string, number>()
  for (const t of tickets) {
    counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
  }
  return Object.entries(GRIEVANCE_CATEGORY_LABELS).map(([category, label]) => ({
    category: category as GrievanceCategoryChartItem['category'],
    label,
    count: counts.get(category) ?? 0,
  }))
}

export function getGrievancePriorityChart(): GrievancePriorityChartItem[] {
  const tickets = getGrievanceTickets()
  const counts = new Map<string, number>()
  for (const t of tickets) {
    counts.set(t.priority, (counts.get(t.priority) ?? 0) + 1)
  }
  return Object.entries(GRIEVANCE_PRIORITY_LABELS).map(([priority, label]) => ({
    priority: priority as GrievancePriorityChartItem['priority'],
    label,
    count: counts.get(priority) ?? 0,
  }))
}

export function getGrievanceResolutionTrend(): GrievanceResolutionTrendItem[] {
  return [
    { month: 'Jan', resolved: 8, closed: 6, escalated: 1 },
    { month: 'Feb', resolved: 12, closed: 10, escalated: 2 },
    { month: 'Mar', resolved: 15, closed: 12, escalated: 1 },
    { month: 'Apr', resolved: 10, closed: 9, escalated: 3 },
    { month: 'May', resolved: 18, closed: 15, escalated: 2 },
    { month: 'Jun', resolved: 6, closed: 4, escalated: 4 },
  ]
}

export function getGrievanceSlaReport(): GrievanceSlaReportItem[] {
  const tickets = getGrievanceTickets()
  return Object.entries(GRIEVANCE_PRIORITY_LABELS).map(([priority, label]) => {
    const subset = tickets.filter((t) => t.priority === priority)
    const breached = subset.filter((t) => t.slaBreached).length
    const total = subset.length
    const withinSla = total - breached
    return {
      priority: priority as GrievanceSlaReportItem['priority'],
      label,
      total,
      withinSla,
      breached,
      complianceRate: total > 0 ? Math.round((withinSla / total) * 100) : 100,
    }
  })
}

export function getOpenTicketsReport(): GrievanceOpenTicketsReportItem[] {
  return getGrievanceTickets()
    .filter((t) => !['closed', 'resolved'].includes(t.status))
    .map((t) => ({
      id: t.id,
      subject: t.subject,
      category: GRIEVANCE_CATEGORY_LABELS[t.category],
      priority: t.priority,
      status: t.status,
      assignedTo: t.assignedToName,
      createdAt: t.createdAt,
      slaDueAt: t.slaDueAt,
      slaBreached: t.slaBreached,
      daysOpen: getDaysOpen(t.createdAt),
    }))
}

export function getResolutionTimeReport(): GrievanceResolutionTimeReportItem[] {
  return getGrievanceTickets()
    .filter((t) => t.resolution)
    .map((t) => ({
      id: t.id,
      subject: t.subject,
      category: GRIEVANCE_CATEGORY_LABELS[t.category],
      priority: t.priority,
      createdAt: t.createdAt,
      resolvedAt: t.resolution!.resolutionDate,
      resolutionHours: getResolutionHours(t.createdAt, t.resolution!.resolutionDate),
      withinSla: !t.slaBreached,
    }))
}

export function getEscalatedTicketsReport(): GrievanceOpenTicketsReportItem[] {
  return getGrievanceTickets()
    .filter((t) => t.status === 'escalated' || t.escalationLevel > 1)
    .map((t) => ({
      id: t.id,
      subject: t.subject,
      category: GRIEVANCE_CATEGORY_LABELS[t.category],
      priority: t.priority,
      status: t.status,
      assignedTo: t.assignedToName,
      createdAt: t.createdAt,
      slaDueAt: t.slaDueAt,
      slaBreached: t.slaBreached,
      daysOpen: getDaysOpen(t.createdAt),
    }))
}
