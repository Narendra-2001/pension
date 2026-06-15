import { getPensionersStore } from '@/data/admin-mock-data'
import {
  addPensionerNotification,
  findPensionerById,
  getPortalPensionerRecords,
} from '@/data/pensioner-mock-data'
import {
  buildNoticeContent,
  NOTICE_TYPE_LABELS,
  substituteTemplateVariables,
} from '@/lib/communication'
import { getPensionerFullName } from '@/types/pensioner'
import type { NotificationType } from '@/types/pensioner-portal'
import type {
  CommunicationAuditEntry,
  CommunicationTemplate,
  CreateNoticeInput,
  DeliveryStatusChartItem,
  MonthlyNoticeChartItem,
  NoticeDashboardStats,
  NoticeTypeChartItem,
  NotificationDashboardStats,
  OfficialNotice,
  SystemNotification,
  TriggerNotificationInput,
  CommunicationAuditAction,
} from '@/types/communication'

let noticeCounter = 12
let notificationCounter = 48
let auditCounter = 100
let templateCounter = 20

function nowIso() {
  return new Date().toISOString()
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function createAudit(
  partial: Omit<CommunicationAuditEntry, 'id' | 'timestamp'>,
): CommunicationAuditEntry {
  return {
    ...partial,
    id: `AUD-COM-${String(auditCounter++).padStart(4, '0')}`,
    timestamp: nowIso(),
  }
}

let auditLog: CommunicationAuditEntry[] = [
  createAudit({
    action: 'notice_generated',
    user: 'Pension Administrator',
    channel: 'pdf',
    status: 'generated',
    entityType: 'notice',
    entityId: 'NTC-2026-0001',
    details: 'Life Certificate Reminder Notice generated for PPO123456',
  }),
  createAudit({
    action: 'notice_sent',
    user: 'System',
    channel: 'pdf',
    status: 'sent',
    entityType: 'notice',
    entityId: 'NTC-2026-0001',
    details: 'Notice dispatched via SMS, Email, and Portal',
  }),
  createAudit({
    action: 'notification_sent',
    user: 'System',
    channel: 'sms',
    status: 'delivered',
    entityType: 'notification',
    entityId: 'NTF-2026-0042',
    details: 'Life Certificate Due reminder sent',
  }),
  createAudit({
    action: 'notification_read',
    user: 'Ramesh Kumar Sharma',
    channel: 'in_app',
    status: 'read',
    entityType: 'notification',
    entityId: 'NTF-2026-0042',
    details: 'Pensioner read in-app notification',
  }),
  createAudit({
    action: 'notice_downloaded',
    user: 'Ramesh Kumar Sharma',
    channel: 'pdf',
    status: 'delivered',
    entityType: 'notice',
    entityId: 'NTC-2026-0003',
    details: 'Recovery Notice downloaded from portal',
  }),
]

const defaultTemplates: CommunicationTemplate[] = [
  {
    id: 'TPL-NOT-001',
    name: 'Life Certificate Reminder',
    templateType: 'notice',
    channel: 'pdf',
    noticeType: 'life_certificate_reminder',
    messageContent: `Dear {PensionerName},

This is to inform you that your Life Certificate verification for PPO Number {PPONumber} is due on {DueDate}.

Please complete the verification through the pensioner portal or visit the nearest pension office before the due date to avoid suspension of pension payments.

{Remarks}

Yours faithfully,
{Department}`,
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Pension Administrator',
  },
  {
    id: 'TPL-NOT-002',
    name: 'Recovery Notice',
    templateType: 'notice',
    channel: 'pdf',
    noticeType: 'recovery_notice',
    messageContent: `Dear {PensionerName},

Reference: PPO Number {PPONumber}

You are hereby notified that an excess pension amount of {Amount} is recoverable from your account. Please remit the outstanding amount by {DueDate}.

{Remarks}

Failure to comply may result in recovery through future pension installments.

{Department}`,
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Recovery Officer',
  },
  {
    id: 'TPL-NOT-003',
    name: 'Suspension Notice',
    templateType: 'notice',
    channel: 'pdf',
    noticeType: 'suspension_notice',
    messageContent: `Dear {PensionerName},

Your pension account (PPO: {PPONumber}) has been suspended effective immediately.

Reason: {Remarks}

Please contact the pension office for further information.

{Department}`,
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Pension Administrator',
  },
  {
    id: 'TPL-SMS-001',
    name: 'Life Certificate SMS Reminder',
    templateType: 'notification',
    channel: 'sms',
    eventType: 'life_certificate_due',
    messageContent:
      'Dear Pensioner, your Life Certificate verification is due on {DueDate}. Please complete verification before the due date. - Pension Dept',
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Pension Administrator',
  },
  {
    id: 'TPL-EML-001',
    name: 'Life Certificate Email Reminder',
    templateType: 'notification',
    channel: 'email',
    eventType: 'life_certificate_due',
    subject: 'Life Certificate Verification Reminder',
    messageContent: `Dear {PensionerName},

Your Life Certificate verification is due on {DueDate}. Please login to the portal and complete verification.

Regards,
Pension Disbursement Office`,
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Pension Administrator',
  },
  {
    id: 'TPL-APP-001',
    name: 'Life Certificate In-App Reminder',
    templateType: 'notification',
    channel: 'in_app',
    eventType: 'life_certificate_due',
    messageContent:
      'Your Life Certificate verification is due within 15 days. Complete verification to avoid pension suspension.',
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Pension Administrator',
  },
  {
    id: 'TPL-SMS-002',
    name: 'Recovery Case SMS',
    templateType: 'notification',
    channel: 'sms',
    eventType: 'recovery_case_created',
    messageContent:
      'Dear Pensioner, a recovery case has been initiated for PPO {PPONumber}. Amount: {Amount}. Login to portal for details.',
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Recovery Officer',
  },
  {
    id: 'TPL-EML-002',
    name: 'Profile Update Approved Email',
    templateType: 'notification',
    channel: 'email',
    eventType: 'profile_update_approved',
    subject: 'Profile Update Approved',
    messageContent: `Dear {PensionerName},

Your profile update request has been approved and your records have been updated successfully.

Regards,
Pension Disbursement Office`,
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Pension Administrator',
  },
  {
    id: 'TPL-APP-002',
    name: 'Suspension In-App Alert',
    templateType: 'notification',
    channel: 'in_app',
    eventType: 'suspension_created',
    messageContent:
      'Your pension has been suspended. Please review the suspension notice and contact the pension office if you have questions.',
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Pension Administrator',
  },
  {
    id: 'TPL-NOT-004',
    name: 'Installment Due Notice',
    templateType: 'notice',
    channel: 'pdf',
    noticeType: 'installment_due',
    messageContent: `Dear {PensionerName},

This is a reminder that your recovery installment of {Amount} is due on {DueDate} for PPO {PPONumber}.

Please ensure timely payment to avoid penalties.

{Remarks}

{Department}`,
    status: 'active',
    updatedAt: '2026-05-01',
    updatedBy: 'Accounts Officer',
  },
]

let templates: CommunicationTemplate[] = [...defaultTemplates]

export interface PensionerOption {
  id: string
  ppoNumber: string
  name: string
  department: string
  isDemo?: boolean
}

function findPensionerRecordById(pensionerId: string) {
  return (
    findPensionerById(pensionerId) ??
    getPensionersStore().find((p) => p.id === pensionerId)
  )
}

function buildNoticeFromTemplate(
  template: CommunicationTemplate,
  pensionerId: string,
  opts: { amount?: number; dueDate?: string; remarks?: string },
): { content: string; pensionerName: string; ppoNumber: string; department: string } {
  const pensioner = findPensionerRecordById(pensionerId)
  if (!pensioner) throw new Error('Pensioner not found')
  const pensionerName = getPensionerFullName(pensioner.personal)
  const ppoNumber = pensioner.service.ppoNumber
  const department = pensioner.service.officeName
  const content = buildNoticeContent(template.messageContent, {
    PensionerName: pensionerName,
    PPONumber: ppoNumber,
    DueDate: opts.dueDate,
    Amount: opts.amount != null ? `₹${opts.amount.toLocaleString('en-IN')}` : undefined,
    Remarks: opts.remarks,
    Department: department,
  })
  return { content, pensionerName, ppoNumber, department }
}

let notices: OfficialNotice[] = [
  {
    id: 'NTC-2026-0001',
    noticeType: 'life_certificate_reminder',
    templateId: 'TPL-NOT-001',
    templateName: 'Life Certificate Reminder',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    dueDate: '2026-07-15',
    remarks: 'Complete verification via portal or visit regional office.',
    attachments: [],
    content: buildNoticeContent(defaultTemplates[0].messageContent, {
      PensionerName: 'Ramesh Kumar Sharma',
      PPONumber: 'PPO123456',
      DueDate: '2026-07-15',
      Remarks: 'Complete verification via portal or visit regional office.',
      Department: 'Mumbai Regional Office',
    }),
    status: 'delivered',
    generatedBy: 'System',
    generatedAt: '2026-06-01T09:00:00.000Z',
    sentAt: '2026-06-01T09:05:00.000Z',
    deliveredAt: '2026-06-01T09:10:00.000Z',
    department: 'Mumbai Regional Office',
    supportingInfo: 'Auto-generated from life certificate due date scheduler',
  },
  {
    id: 'NTC-2026-0002',
    noticeType: 'recovery_notice',
    templateId: 'TPL-NOT-002',
    templateName: 'Recovery Notice',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    amount: 45000,
    dueDate: '2026-08-01',
    remarks: 'Excess pension paid during pay revision adjustment.',
    attachments: [{ name: 'Excess Calculation Sheet', fileName: 'excess_calc.pdf' }],
    content: buildNoticeContent(defaultTemplates[1].messageContent, {
      PensionerName: 'Ramesh Kumar Sharma',
      PPONumber: 'PPO123456',
      Amount: '₹45,000',
      DueDate: '2026-08-01',
      Remarks: 'Excess pension paid during pay revision adjustment.',
      Department: 'Mumbai Regional Office',
    }),
    status: 'sent',
    generatedBy: 'Recovery Officer',
    generatedAt: '2026-06-05T11:30:00.000Z',
    sentAt: '2026-06-05T11:35:00.000Z',
    department: 'Mumbai Regional Office',
  },
  {
    id: 'NTC-2026-0003',
    noticeType: 'suspension_notice',
    templateId: 'TPL-NOT-003',
    templateName: 'Suspension Notice',
    pensionerId: 'PEN-DEMO-003',
    ppoNumber: 'PPO345678',
    pensionerName: 'Geeta Devi Patel',
    remarks: 'Life certificate verification overdue by 90 days.',
    attachments: [],
    content: buildNoticeContent(defaultTemplates[2].messageContent, {
      PensionerName: 'Geeta Devi Patel',
      PPONumber: 'PPO345678',
      Remarks: 'Life certificate verification overdue by 90 days.',
      Department: 'Pune Regional Office',
    }),
    status: 'delivered',
    generatedBy: 'System',
    generatedAt: '2026-06-08T08:00:00.000Z',
    sentAt: '2026-06-08T08:05:00.000Z',
    deliveredAt: '2026-06-08T08:15:00.000Z',
    department: 'Pune Regional Office',
  },
  {
    id: 'NTC-2026-0004',
    noticeType: 'installment_due',
    templateId: 'TPL-NOT-004',
    templateName: 'Installment Due Notice',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    amount: 3750,
    dueDate: '2026-06-30',
    attachments: [],
    content: buildNoticeContent(defaultTemplates[9].messageContent, {
      PensionerName: 'Ramesh Kumar Sharma',
      PPONumber: 'PPO123456',
      Amount: '₹3,750',
      DueDate: '2026-06-30',
      Department: 'Mumbai Regional Office',
    }),
    status: 'generated',
    generatedBy: 'Accounts Officer',
    generatedAt: '2026-06-10T14:00:00.000Z',
    department: 'Mumbai Regional Office',
  },
  {
    id: 'NTC-2026-0005',
    noticeType: 'profile_update_approval',
    templateId: 'TPL-NOT-001',
    templateName: 'Life Certificate Reminder',
    pensionerId: 'PEN-DEMO-002',
    ppoNumber: 'PPO789012',
    pensionerName: 'Priya Sharma',
    remarks: 'Bank details update approved.',
    attachments: [],
    content: 'Your profile update request has been approved.',
    status: 'draft',
    generatedBy: 'Pension Administrator',
    generatedAt: '2026-06-12T10:00:00.000Z',
    department: 'Delhi Regional Office',
  },
  {
    id: 'NTC-2026-0006',
    noticeType: 'restoration_approval',
    templateId: 'TPL-NOT-001',
    templateName: 'Life Certificate Reminder',
    pensionerId: 'PEN-DEMO-003',
    ppoNumber: 'PPO345678',
    pensionerName: 'Geeta Devi Patel',
    remarks: 'Pension restoration approved after verification.',
    attachments: [],
    content: 'Your pension restoration request has been approved.',
    status: 'failed',
    generatedBy: 'Pension Administrator',
    generatedAt: '2026-06-11T16:00:00.000Z',
    sentAt: '2026-06-11T16:05:00.000Z',
    failureReason: 'Email delivery failed — invalid email address',
    department: 'Pune Regional Office',
  },
]

let notifications: SystemNotification[] = [
  {
    id: 'NTF-2026-0042',
    eventType: 'life_certificate_due',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    channel: 'in_app',
    title: 'Verification Due Soon',
    message: 'Your Life Certificate verification is due within 15 days.',
    templateId: 'TPL-APP-001',
    templateName: 'Life Certificate In-App Reminder',
    status: 'read',
    read: true,
    sentAt: '2026-06-01T09:05:00.000Z',
    deliveredAt: '2026-06-01T09:05:00.000Z',
    readAt: '2026-06-02T08:30:00.000Z',
    relatedNoticeId: 'NTC-2026-0001',
  },
  {
    id: 'NTF-2026-0043',
    eventType: 'life_certificate_due',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    channel: 'sms',
    title: 'SMS Notification',
    message:
      'Dear Pensioner, your Life Certificate verification is due on 2026-07-15. Please complete verification before the due date. - Pension Dept',
    templateId: 'TPL-SMS-001',
    templateName: 'Life Certificate SMS Reminder',
    status: 'delivered',
    read: false,
    sentAt: '2026-06-01T09:05:00.000Z',
    deliveredAt: '2026-06-01T09:06:00.000Z',
    relatedNoticeId: 'NTC-2026-0001',
  },
  {
    id: 'NTF-2026-0044',
    eventType: 'recovery_case_created',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    channel: 'email',
    title: 'Recovery Case Created',
    subject: 'Recovery Case Notification',
    message: 'A recovery case has been initiated for your pension account.',
    templateId: 'TPL-SMS-002',
    templateName: 'Recovery Case SMS',
    status: 'delivered',
    read: false,
    sentAt: '2026-06-05T11:35:00.000Z',
    deliveredAt: '2026-06-05T11:36:00.000Z',
    relatedNoticeId: 'NTC-2026-0002',
  },
  {
    id: 'NTF-2026-0045',
    eventType: 'suspension_created',
    pensionerId: 'PEN-DEMO-003',
    ppoNumber: 'PPO345678',
    pensionerName: 'Geeta Devi Patel',
    channel: 'in_app',
    title: 'Pension Suspended',
    message:
      'Your pension has been suspended. Please review the suspension notice and contact the pension office if you have questions.',
    templateId: 'TPL-APP-002',
    templateName: 'Suspension In-App Alert',
    status: 'delivered',
    read: false,
    sentAt: '2026-06-08T08:05:00.000Z',
    deliveredAt: '2026-06-08T08:05:00.000Z',
    relatedNoticeId: 'NTC-2026-0003',
  },
  {
    id: 'NTF-2026-0046',
    eventType: 'installment_due',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Ramesh Kumar Sharma',
    channel: 'sms',
    title: 'Installment Due',
    message: 'Recovery installment of ₹3,750 is due on 2026-06-30.',
    templateId: 'TPL-SMS-002',
    templateName: 'Recovery Case SMS',
    status: 'pending',
    read: false,
    sentAt: '2026-06-14T08:00:00.000Z',
  },
  {
    id: 'NTF-2026-0047',
    eventType: 'profile_update_approved',
    pensionerId: 'PEN-DEMO-002',
    ppoNumber: 'PPO789012',
    pensionerName: 'Priya Sharma',
    channel: 'email',
    title: 'Profile Update Approved',
    subject: 'Profile Update Approved',
    message: 'Your profile update request has been approved and your records have been updated successfully.',
    templateId: 'TPL-EML-002',
    templateName: 'Profile Update Approved Email',
    status: 'failed',
    read: false,
    sentAt: '2026-06-12T10:30:00.000Z',
    failureReason: 'SMTP connection timeout',
  },
]

export function getNotices(): OfficialNotice[] {
  return [...notices].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
  )
}

export function getNoticeById(id: string): OfficialNotice | undefined {
  return notices.find((n) => n.id === id)
}

export function getNoticesForPensioner(pensionerId: string): OfficialNotice[] {
  return getNotices().filter(
    (n) => n.pensionerId === pensionerId && n.status !== 'draft',
  )
}

export function getTemplates(): CommunicationTemplate[] {
  return [...templates]
}

export function getTemplateById(id: string): CommunicationTemplate | undefined {
  return templates.find((t) => t.id === id)
}

export function getNotifications(): SystemNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
  )
}

export function getNotificationById(id: string): SystemNotification | undefined {
  return notifications.find((n) => n.id === id)
}

export function getAuditLog(): CommunicationAuditEntry[] {
  return [...auditLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

export function getNoticeDashboardStats(): NoticeDashboardStats {
  const todayStr = today()
  return {
    totalGenerated: notices.length,
    sentToday: notices.filter((n) => n.sentAt?.startsWith(todayStr)).length,
    pending: notices.filter((n) => n.status === 'draft' || n.status === 'generated').length,
    failed: notices.filter((n) => n.status === 'failed').length,
    delivered: notices.filter((n) => n.status === 'delivered').length,
  }
}

export function getNotificationDashboardStats(): NotificationDashboardStats {
  return {
    totalNotifications: notifications.length,
    smsSent: notifications.filter((n) => n.channel === 'sms' && n.status !== 'failed' && n.status !== 'pending').length,
    emailsSent: notifications.filter((n) => n.channel === 'email' && n.status !== 'failed' && n.status !== 'pending').length,
    failed: notifications.filter((n) => n.status === 'failed').length,
    pending: notifications.filter((n) => n.status === 'pending').length,
  }
}

export function getNoticeTypeChart(): NoticeTypeChartItem[] {
  const counts = new Map<string, number>()
  for (const notice of notices) {
    counts.set(notice.noticeType, (counts.get(notice.noticeType) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([type, count]) => ({
    type: type as OfficialNotice['noticeType'],
    label: NOTICE_TYPE_LABELS[type as OfficialNotice['noticeType']],
    count,
  }))
}

export function getMonthlyNoticeChart(): MonthlyNoticeChartItem[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, i) => ({
    month,
    count: notices.filter((n) => {
      const d = new Date(n.generatedAt)
      return d.getMonth() === i && d.getFullYear() === 2026
    }).length,
  }))
}

export function getDeliveryStatusChart(): DeliveryStatusChartItem[] {
  const statuses = ['delivered', 'sent', 'generated', 'draft', 'failed'] as const
  return statuses.map((status) => ({
    status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    count: notices.filter((n) => n.status === status).length,
  }))
}

function addAudit(action: CommunicationAuditAction, partial: Omit<CommunicationAuditEntry, 'id' | 'timestamp' | 'action'>) {
  const entry = createAudit({ action, ...partial })
  auditLog = [entry, ...auditLog]
  return entry
}

export function createNotice(input: CreateNoticeInput): OfficialNotice {
  const template = getTemplateById(input.templateId)
  if (!template) throw new Error('Template not found')

  const { content, pensionerName, ppoNumber, department } = buildNoticeFromTemplate(
    template,
    input.pensionerId,
    { amount: input.amount, dueDate: input.dueDate, remarks: input.remarks },
  )

  const notice: OfficialNotice = {
    id: `NTC-2026-${String(noticeCounter++).padStart(4, '0')}`,
    noticeType: input.noticeType,
    templateId: template.id,
    templateName: template.name,
    pensionerId: input.pensionerId,
    ppoNumber,
    pensionerName,
    amount: input.amount,
    dueDate: input.dueDate,
    remarks: input.remarks,
    attachments: input.attachments,
    content,
    status: input.saveAsDraft ? 'draft' : 'generated',
    generatedBy: input.generatedBy,
    generatedAt: nowIso(),
    department,
  }

  notices = [notice, ...notices]
  addAudit('notice_generated', {
    user: input.generatedBy,
    channel: 'pdf',
    status: notice.status,
    entityType: 'notice',
    entityId: notice.id,
    details: `${template.name} generated for ${ppoNumber}`,
  })

  return notice
}

export function sendNotice(noticeId: string, sentBy: string): OfficialNotice {
  const notice = notices.find((n) => n.id === noticeId)
  if (!notice) throw new Error('Notice not found')
  if (notice.status === 'draft') {
    notice.status = 'generated'
  }

  notice.status = Math.random() > 0.1 ? 'delivered' : 'sent'
  notice.sentAt = nowIso()
  if (notice.status === 'delivered') {
    notice.deliveredAt = nowIso()
  }

  triggerNotificationEngine({
    eventType: mapNoticeToEvent(notice.noticeType),
    pensionerId: notice.pensionerId,
    relatedNoticeId: notice.id,
    triggeredBy: sentBy,
    variables: {
      PensionerName: notice.pensionerName,
      PPONumber: notice.ppoNumber,
      DueDate: notice.dueDate ?? '',
      Amount: notice.amount?.toString() ?? '',
    },
  })

  addAudit('notice_sent', {
    user: sentBy,
    channel: 'pdf',
    status: notice.status,
    entityType: 'notice',
    entityId: notice.id,
    details: 'Notice sent via SMS, Email, and Portal',
  })

  return notice
}

export function resendNotice(noticeId: string, sentBy: string): OfficialNotice {
  const notice = sendNotice(noticeId, sentBy)
  addAudit('notice_resend', {
    user: sentBy,
    channel: 'pdf',
    status: notice.status,
    entityType: 'notice',
    entityId: notice.id,
    details: 'Notice resent to pensioner',
  })
  return notice
}

export function recordNoticeDownload(noticeId: string, user: string): void {
  addAudit('notice_downloaded', {
    user,
    channel: 'pdf',
    status: 'delivered',
    entityType: 'notice',
    entityId: noticeId,
    details: 'Notice PDF downloaded',
  })
}

function mapNoticeToEvent(noticeType: OfficialNotice['noticeType']) {
  const map: Record<OfficialNotice['noticeType'], TriggerNotificationInput['eventType']> = {
    life_certificate_reminder: 'life_certificate_due',
    suspension_notice: 'suspension_created',
    restoration_approval: 'restoration_approved',
    recovery_notice: 'recovery_case_created',
    installment_due: 'installment_due',
    profile_update_approval: 'profile_update_approved',
    profile_update_rejection: 'profile_update_rejected',
    pension_activation: 'account_activation',
    pension_suspension: 'suspension_created',
    demise_verification: 'demise_submitted',
    family_pension: 'family_pension_initiated',
  }
  return map[noticeType]
}

const NOTIFICATION_TITLE_MAP: Partial<Record<TriggerNotificationInput['eventType'], string>> = {
  life_certificate_due: 'Verification Due Soon',
  recovery_case_created: 'Recovery Case Created',
  suspension_created: 'Pension Suspended',
  installment_due: 'Installment Due',
  profile_update_approved: 'Profile Update Approved',
  account_activation: 'Account Activated',
}

function mapEventToPortalType(event: TriggerNotificationInput['eventType']): NotificationType {
  const map: Partial<Record<TriggerNotificationInput['eventType'], NotificationType>> = {
    life_certificate_due: 'verification_reminder',
    recovery_case_created: 'recovery_notice',
    installment_due: 'recovery_notice',
    suspension_created: 'suspension_notice',
    restoration_approved: 'restoration_update',
    profile_update_approved: 'pension_update',
    profile_update_rejected: 'system_announcement',
    account_activation: 'system_announcement',
  }
  return map[event] ?? 'system_announcement'
}

export function triggerNotificationEngine(input: TriggerNotificationInput): SystemNotification[] {
  const pensioner = findPensionerRecordById(input.pensionerId)
  if (!pensioner) return []

  const pensionerName = getPensionerFullName(pensioner.personal)
  const ppoNumber = pensioner.service.ppoNumber
  const vars: Record<string, string> = {
    PensionerName: pensionerName,
    PPONumber: ppoNumber,
    DueDate: input.variables?.DueDate ?? '',
    Amount: input.variables?.Amount ?? '',
    ...input.variables,
  }

  const activeTemplates = templates.filter(
    (t) => t.templateType === 'notification' && t.status === 'active' && t.eventType === input.eventType,
  )

  const created: SystemNotification[] = []

  for (const template of activeTemplates) {
    const message = substituteTemplateVariables(template.messageContent, vars)
    const subject = template.subject ? substituteTemplateVariables(template.subject, vars) : undefined
    const status: SystemNotification['status'] =
      template.channel === 'sms' && Math.random() > 0.95
        ? 'failed'
        : template.channel === 'email' && Math.random() > 0.9
          ? 'failed'
          : 'delivered'

    const notification: SystemNotification = {
      id: `NTF-2026-${String(notificationCounter++).padStart(4, '0')}`,
      eventType: input.eventType,
      pensionerId: input.pensionerId,
      ppoNumber,
      pensionerName,
      channel: template.channel as SystemNotification['channel'],
      title: subject ?? NOTIFICATION_TITLE_MAP[input.eventType] ?? 'Notification',
      message,
      subject,
      templateId: template.id,
      templateName: template.name,
      status,
      read: false,
      sentAt: nowIso(),
      deliveredAt: status === 'delivered' ? nowIso() : undefined,
      failureReason: status === 'failed' ? 'Delivery gateway error' : undefined,
      relatedNoticeId: input.relatedNoticeId,
    }

    notifications = [notification, ...notifications]
    created.push(notification)

    if (template.channel === 'in_app') {
      addPensionerNotification({
        type: mapEventToPortalType(input.eventType),
        title: notification.title,
        message: notification.message,
        details: input.relatedNoticeId ? `Related notice: ${input.relatedNoticeId}` : undefined,
      })
    }

    addAudit(status === 'failed' ? 'notification_failed' : 'notification_sent', {
      user: input.triggeredBy ?? 'System',
      channel: template.channel as SystemNotification['channel'],
      status,
      entityType: 'notification',
      entityId: notification.id,
      details: `${template.name} — ${input.eventType}`,
    })
  }

  return created
}

export function updateTemplate(
  id: string,
  updates: Partial<CommunicationTemplate>,
  updatedBy: string,
): CommunicationTemplate {
  const idx = templates.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Template not found')
  templates[idx] = {
    ...templates[idx],
    ...updates,
    updatedAt: today(),
    updatedBy,
  }
  addAudit('template_updated', {
    user: updatedBy,
    entityType: 'template',
    entityId: id,
    details: `Template "${templates[idx].name}" updated`,
  })
  return templates[idx]
}

export function activateTemplate(id: string, updatedBy: string): CommunicationTemplate {
  const template = updateTemplate(id, { status: 'active' }, updatedBy)
  addAudit('template_activated', {
    user: updatedBy,
    entityType: 'template',
    entityId: id,
    details: `Template "${template.name}" activated`,
  })
  return template
}

export function createTemplate(
  partial: Omit<CommunicationTemplate, 'id' | 'updatedAt' | 'updatedBy'>,
  createdBy: string,
): CommunicationTemplate {
  const template: CommunicationTemplate = {
    ...partial,
    id: `TPL-NEW-${String(templateCounter++).padStart(3, '0')}`,
    updatedAt: today(),
    updatedBy: createdBy,
  }
  templates = [...templates, template]
  return template
}

export function getPensionerOptions(): PensionerOption[] {
  const seenPpos = new Set<string>()
  const options: PensionerOption[] = []

  const addOption = (p: import('@/types/pensioner').PensionerRecord, isDemo = false) => {
    const ppoKey = p.service.ppoNumber.toLowerCase()
    if (seenPpos.has(ppoKey)) return
    seenPpos.add(ppoKey)
    options.push({
      id: p.id,
      ppoNumber: p.service.ppoNumber,
      name: getPensionerFullName(p.personal),
      department: p.service.officeName,
      isDemo,
    })
  }

  for (const p of getPortalPensionerRecords()) {
    addOption(p, true)
  }
  for (const p of getPensionersStore()) {
    addOption(p, false)
  }

  return options.sort((a, b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function markSystemNotificationRead(id: string, user: string): void {
  const notification = notifications.find((n) => n.id === id)
  if (!notification) return
  notification.read = true
  notification.status = 'read'
  notification.readAt = nowIso()
  addAudit('notification_read', {
    user,
    channel: notification.channel,
    status: 'read',
    entityType: 'notification',
    entityId: id,
    details: 'Notification marked as read',
  })
}
