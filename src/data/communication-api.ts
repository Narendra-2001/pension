import {
  activateTemplate,
  createNotice,
  createTemplate,
  getAuditLog,
  getDeliveryStatusChart,
  getMonthlyNoticeChart,
  getNoticeById,
  getNoticeDashboardStats,
  getNoticeTypeChart,
  getNotices,
  getNoticesForPensioner,
  getNotificationById,
  getNotificationDashboardStats,
  getNotifications,
  getPensionerOptions,
  getTemplateById,
  getTemplates,
  markSystemNotificationRead,
  recordNoticeDownload,
  resendNotice,
  sendNotice,
  triggerNotificationEngine,
  updateTemplate,
} from '@/data/communication-mock-data'
import type {
  CommunicationTemplate,
  CreateNoticeInput,
  TriggerNotificationInput,
} from '@/types/communication'
import type { TemplateFormValues } from '@/lib/communication-schema'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchNoticeDashboardStats() {
  await delay(300)
  return getNoticeDashboardStats()
}

export async function fetchNotificationDashboardStats() {
  await delay(300)
  return getNotificationDashboardStats()
}

export async function fetchNoticeTypeChart() {
  await delay(250)
  return getNoticeTypeChart()
}

export async function fetchMonthlyNoticeChart() {
  await delay(250)
  return getMonthlyNoticeChart()
}

export async function fetchDeliveryStatusChart() {
  await delay(250)
  return getDeliveryStatusChart()
}

export async function fetchNotices() {
  await delay(350)
  return getNotices()
}

export async function fetchNoticeById(id: string) {
  await delay(300)
  const notice = getNoticeById(id)
  if (!notice) throw new Error('Notice not found')
  return notice
}

export async function fetchPensionerNotices(pensionerId: string) {
  await delay(300)
  return getNoticesForPensioner(pensionerId)
}

export async function fetchNotifications() {
  await delay(350)
  return getNotifications()
}

export async function fetchNotificationById(id: string) {
  await delay(300)
  const notification = getNotificationById(id)
  if (!notification) throw new Error('Notification not found')
  return notification
}

export async function fetchTemplates(type?: 'notice' | 'notification') {
  await delay(300)
  const all = getTemplates()
  return type ? all.filter((t) => t.templateType === type) : all
}

export async function fetchTemplateById(id: string) {
  await delay(250)
  const template = getTemplateById(id)
  if (!template) throw new Error('Template not found')
  return template
}

export async function fetchCommunicationAuditLog() {
  await delay(350)
  return getAuditLog()
}

export async function fetchPensionerOptions() {
  await delay(200)
  return getPensionerOptions()
}

export async function createNoticeApi(input: CreateNoticeInput) {
  await delay(500)
  return createNotice(input)
}

export async function sendNoticeApi(noticeId: string, sentBy: string) {
  await delay(600)
  return sendNotice(noticeId, sentBy)
}

export async function resendNoticeApi(noticeId: string, sentBy: string) {
  await delay(600)
  return resendNotice(noticeId, sentBy)
}

export async function downloadNoticeApi(noticeId: string, user: string) {
  await delay(200)
  recordNoticeDownload(noticeId, user)
}

export async function triggerNotificationApi(input: TriggerNotificationInput) {
  await delay(500)
  return triggerNotificationEngine(input)
}

export async function updateTemplateApi(
  id: string,
  values: TemplateFormValues,
  updatedBy: string,
) {
  await delay(400)
  return updateTemplate(id, values as Partial<CommunicationTemplate>, updatedBy)
}

export async function activateTemplateApi(id: string, updatedBy: string) {
  await delay(300)
  return activateTemplate(id, updatedBy)
}

export async function createTemplateApi(
  values: TemplateFormValues,
  createdBy: string,
) {
  await delay(400)
  return createTemplate(values as Omit<CommunicationTemplate, 'id' | 'updatedAt' | 'updatedBy'>, createdBy)
}

export async function markNotificationReadApi(id: string, user: string) {
  await delay(200)
  markSystemNotificationRead(id, user)
}
