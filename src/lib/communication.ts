import type {
  NoticeType,
  NotificationChannel,
  NotificationEventType,
  NoticeStatus,
  DeliveryStatus,
  TemplateStatus,
} from '@/types/communication'

export const NOTICE_TYPE_LABELS: Record<NoticeType, string> = {
  life_certificate_reminder: 'Life Certificate Reminder Notice',
  suspension_notice: 'Suspension Notice',
  restoration_approval: 'Restoration Approval Notice',
  recovery_notice: 'Recovery Notice',
  installment_due: 'Installment Due Notice',
  profile_update_approval: 'Profile Update Approval Notice',
  profile_update_rejection: 'Profile Update Rejection Notice',
  pension_activation: 'Pension Activation Notice',
  pension_suspension: 'Pension Suspension Notice',
  demise_verification: 'Demise Verification Notice',
  family_pension: 'Family Pension Notice',
}

export const NOTICE_STATUS_LABELS: Record<NoticeStatus, string> = {
  draft: 'Draft',
  generated: 'Generated',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
}

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEventType, string> = {
  account_activation: 'Account Activation',
  profile_update_submitted: 'Profile Update Request Submitted',
  profile_update_approved: 'Profile Update Approved',
  profile_update_rejected: 'Profile Update Rejected',
  life_certificate_due: 'Life Certificate Due',
  life_certificate_approved: 'Life Certificate Approved',
  life_certificate_rejected: 'Life Certificate Rejected',
  suspension_created: 'Suspension Created',
  restoration_submitted: 'Restoration Request Submitted',
  restoration_approved: 'Restoration Approved',
  restoration_rejected: 'Restoration Rejected',
  recovery_case_created: 'Recovery Case Created',
  installment_due: 'Installment Due',
  recovery_completed: 'Recovery Completed',
  demise_submitted: 'Demise Request Submitted',
  demise_approved: 'Demise Approved',
  family_pension_initiated: 'Family Pension Initiated',
}

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  sms: 'SMS',
  email: 'Email',
  in_app: 'In-App',
}

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: 'Pending',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
  read: 'Read',
}

export const TEMPLATE_STATUS_LABELS: Record<TemplateStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
}

export function formatNoticeCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function substituteTemplateVariables(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => variables[key] ?? `{${key}}`)
}

export function buildNoticeContent(
  templateContent: string,
  vars: {
    PensionerName: string
    PPONumber: string
    DueDate?: string
    Amount?: string
    Remarks?: string
    Department?: string
  },
): string {
  return substituteTemplateVariables(templateContent, {
    PensionerName: vars.PensionerName,
    PPONumber: vars.PPONumber,
    DueDate: vars.DueDate ?? 'N/A',
    Amount: vars.Amount ?? 'N/A',
    Remarks: vars.Remarks ?? '',
    Department: vars.Department ?? 'Pension Disbursement Office',
  })
}

export function noticeStatusTone(status: NoticeStatus): 'default' | 'blue' | 'green' | 'amber' | 'rose' {
  switch (status) {
    case 'draft':
      return 'default'
    case 'generated':
      return 'blue'
    case 'sent':
      return 'amber'
    case 'delivered':
      return 'green'
    case 'failed':
      return 'rose'
  }
}

export function deliveryStatusTone(status: DeliveryStatus): 'default' | 'blue' | 'green' | 'amber' | 'rose' {
  switch (status) {
    case 'pending':
      return 'amber'
    case 'sent':
      return 'blue'
    case 'delivered':
      return 'green'
    case 'failed':
      return 'rose'
    case 'read':
      return 'default'
  }
}
