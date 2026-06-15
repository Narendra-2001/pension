export type NoticeType =
  | 'life_certificate_reminder'
  | 'suspension_notice'
  | 'restoration_approval'
  | 'recovery_notice'
  | 'installment_due'
  | 'profile_update_approval'
  | 'profile_update_rejection'
  | 'pension_activation'
  | 'pension_suspension'
  | 'demise_verification'
  | 'family_pension'

export type NoticeStatus = 'draft' | 'generated' | 'sent' | 'delivered' | 'failed'

export type NotificationChannel = 'sms' | 'email' | 'in_app'

export type NotificationEventType =
  | 'account_activation'
  | 'profile_update_submitted'
  | 'profile_update_approved'
  | 'profile_update_rejected'
  | 'life_certificate_due'
  | 'life_certificate_approved'
  | 'life_certificate_rejected'
  | 'suspension_created'
  | 'restoration_submitted'
  | 'restoration_approved'
  | 'restoration_rejected'
  | 'recovery_case_created'
  | 'installment_due'
  | 'recovery_completed'
  | 'demise_submitted'
  | 'demise_approved'
  | 'family_pension_initiated'

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read'

export type TemplateType = 'notice' | 'notification'

export type TemplateStatus = 'active' | 'inactive' | 'draft'

export type CommunicationAuditAction =
  | 'notice_generated'
  | 'notice_sent'
  | 'notice_downloaded'
  | 'notice_resend'
  | 'notification_sent'
  | 'notification_failed'
  | 'notification_read'
  | 'template_activated'
  | 'template_updated'

export interface NoticeAttachment {
  name: string
  fileName: string
}

export interface OfficialNotice {
  id: string
  noticeType: NoticeType
  templateId: string
  templateName: string
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  amount?: number
  dueDate?: string
  remarks?: string
  attachments: NoticeAttachment[]
  content: string
  status: NoticeStatus
  generatedBy: string
  generatedAt: string
  sentAt?: string
  deliveredAt?: string
  failureReason?: string
  department: string
  supportingInfo?: string
}

export interface NotificationDelivery {
  channel: NotificationChannel
  status: DeliveryStatus
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failureReason?: string
}

export interface SystemNotification {
  id: string
  eventType: NotificationEventType
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  channel: NotificationChannel
  title: string
  message: string
  subject?: string
  templateId: string
  templateName: string
  status: DeliveryStatus
  read: boolean
  sentAt: string
  deliveredAt?: string
  readAt?: string
  failureReason?: string
  relatedNoticeId?: string
  deliveries?: NotificationDelivery[]
}

export interface CommunicationTemplate {
  id: string
  name: string
  templateType: TemplateType
  channel: NotificationChannel | 'pdf'
  noticeType?: NoticeType
  eventType?: NotificationEventType
  subject?: string
  messageContent: string
  status: TemplateStatus
  updatedAt: string
  updatedBy: string
}

export interface CommunicationAuditEntry {
  id: string
  action: CommunicationAuditAction
  user: string
  timestamp: string
  channel?: NotificationChannel | 'pdf' | 'system'
  status?: string
  entityType: 'notice' | 'notification' | 'template'
  entityId: string
  details?: string
}

export interface NoticeDashboardStats {
  totalGenerated: number
  sentToday: number
  pending: number
  failed: number
  delivered: number
}

export interface NotificationDashboardStats {
  totalNotifications: number
  smsSent: number
  emailsSent: number
  failed: number
  pending: number
}

export interface NoticeTypeChartItem {
  type: NoticeType
  label: string
  count: number
}

export interface MonthlyNoticeChartItem {
  month: string
  count: number
}

export interface DeliveryStatusChartItem {
  status: string
  label: string
  count: number
}

export interface CreateNoticeInput {
  noticeType: NoticeType
  templateId: string
  pensionerId: string
  amount?: number
  dueDate?: string
  remarks?: string
  attachments: NoticeAttachment[]
  generatedBy: string
  saveAsDraft?: boolean
}

export interface TriggerNotificationInput {
  eventType: NotificationEventType
  pensionerId: string
  variables?: Record<string, string>
  relatedNoticeId?: string
  triggeredBy?: string
}
