import { getPensionersStore, toListItem } from '@/data/admin-mock-data'
import { getLifeCertificateSubmissions } from '@/data/life-certificate-mock-data'
import { getGrievanceTickets } from '@/data/grievance-mock-data'
import { getDemiseIntimations } from '@/data/demise-mock-data'
import { GRIEVANCE_CATEGORY_LABELS, GRIEVANCE_STATUS_LABELS } from '@/lib/grievance'
import { getProfileUpdateRequests } from '@/data/profile-update-mock-data'
import { getRestorationRequests } from '@/data/suspension-mock-data'
import { REQUEST_TYPE_LABELS } from '@/lib/profile-update'
import type { AdminTask, AdminTaskType } from '@/types/admin-task'
import { ADMIN_TASK_TYPE_LABELS } from '@/types/admin-task'

const PROFILE_PENDING = new Set(['pending_review', 'under_verification', 'more_info_required'])
const LC_PENDING = new Set(['submitted', 'under_verification'])
const GRIEVANCE_PENDING = new Set(['open', 'assigned', 'in_progress', 'waiting_for_user', 'escalated', 'reopened'])
const DEMISE_PENDING = new Set(['submitted', 'under_verification', 'needs_clarification'])
const RESTORATION_PENDING = new Set(['submitted', 'under_review'])

function profileStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildAdminTasks(): AdminTask[] {
  const tasks: AdminTask[] = []

  for (const req of getProfileUpdateRequests()) {
    const isPending = PROFILE_PENDING.has(req.status)
    tasks.push({
      id: req.id,
      type: 'profile_update',
      pensionerId: req.pensionerId,
      ppoNumber: req.ppoNumber,
      pensionerName: req.pensionerName,
      title: ADMIN_TASK_TYPE_LABELS.profile_update,
      summary: `${REQUEST_TYPE_LABELS[req.requestType]} — ${req.newValue.split('\n')[0] ?? 'Update requested'}`,
      status: req.status,
      statusLabel: profileStatusLabel(req.status),
      priority: req.requestType === 'bank_details' ? 'urgent' : 'normal',
      submittedAt: req.submittedAt,
      updatedAt: req.updatedAt,
      detailHref: `/admin/profile-updates/${req.id}`,
      isPending,
    })
  }

  for (const lc of getLifeCertificateSubmissions()) {
    const isPending = LC_PENDING.has(lc.status)
    tasks.push({
      id: lc.id,
      type: 'life_certificate',
      pensionerId: lc.pensionerId,
      ppoNumber: lc.ppoNumber,
      pensionerName: lc.pensionerName,
      title: ADMIN_TASK_TYPE_LABELS.life_certificate,
      summary: lc.isResubmission
        ? `Resubmitted — ${lc.method} — face capture & OTP verified`
        : `${lc.method} — face capture & OTP verified`,
      status: lc.status,
      statusLabel: lc.isResubmission ? 'Resubmitted' : profileStatusLabel(lc.status),
      priority: lc.isResubmission ? 'urgent' : 'normal',
      submittedAt: lc.submittedAt,
      updatedAt: lc.updatedAt,
      detailHref: `/admin/tasks/life-certificate/${lc.id}`,
      isPending,
    })
  }

  for (const p of getPensionersStore().filter((r) => r.status === 'pending_activation')) {
    const item = toListItem(p)
    tasks.push({
      id: `ACT-${p.id}`,
      type: 'activation',
      pensionerId: p.id,
      ppoNumber: item.ppoNumber,
      pensionerName: item.name,
      title: ADMIN_TASK_TYPE_LABELS.activation,
      summary: `Activation ${p.activationStatus.replace(/_/g, ' ')} — account not yet active`,
      status: p.activationStatus,
      statusLabel: profileStatusLabel(p.activationStatus),
      priority: p.activationStatus === 'pending' ? 'urgent' : 'normal',
      submittedAt: p.createdAt,
      updatedAt: p.updatedAt,
      detailHref: `/admin/tasks/activation/${p.id}`,
      isPending: true,
    })
  }

  for (const g of getGrievanceTickets()) {
    const isPending = GRIEVANCE_PENDING.has(g.status)
    tasks.push({
      id: g.id,
      type: 'grievance',
      pensionerId: g.pensionerId,
      ppoNumber: g.ppoNumber,
      pensionerName: g.pensionerName,
      title: ADMIN_TASK_TYPE_LABELS.grievance,
      summary: `${GRIEVANCE_CATEGORY_LABELS[g.category]} — ${g.subject}`,
      status: g.status,
      statusLabel: GRIEVANCE_STATUS_LABELS[g.status],
      priority: g.priority === 'critical' || g.priority === 'high' ? 'urgent' : 'normal',
      submittedAt: g.createdAt,
      updatedAt: g.updatedAt,
      detailHref: `/admin/grievance/tickets/${g.id}`,
      isPending,
    })
  }

  for (const d of getDemiseIntimations()) {
    const isPending = DEMISE_PENDING.has(d.status)
    tasks.push({
      id: d.id,
      type: 'demise',
      pensionerId: d.pensionerId,
      ppoNumber: d.ppoNumber,
      pensionerName: d.pensionerName,
      title: ADMIN_TASK_TYPE_LABELS.demise,
      summary: `Demise reported on ${d.dateOfDeath} — ${d.placeOfDeath}`,
      status: d.status,
      statusLabel: profileStatusLabel(d.status),
      priority: 'urgent',
      submittedAt: d.submittedAt,
      updatedAt: d.updatedAt,
      detailHref: `/admin/demise/requests/${d.id}`,
      isPending,
    })
  }

  for (const r of getRestorationRequests()) {
    const isPending = RESTORATION_PENDING.has(r.status)
    tasks.push({
      id: r.id,
      type: 'restoration',
      pensionerId: r.pensionerId,
      ppoNumber: r.ppoNumber,
      pensionerName: r.pensionerName,
      title: ADMIN_TASK_TYPE_LABELS.restoration,
      summary: `${r.suspensionReason} — ${r.reasonForRestoration.slice(0, 80)}`,
      status: r.status,
      statusLabel: profileStatusLabel(r.status),
      priority: r.status === 'submitted' ? 'urgent' : 'normal',
      submittedAt: r.requestDate,
      updatedAt: r.updatedAt,
      detailHref: `/admin/suspensions/restoration/${r.id}`,
      isPending,
    })
  }

  return tasks.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )
}

export function getAdminTasks(filters?: {
  type?: AdminTaskType | 'all'
  pendingOnly?: boolean
  search?: string
}) {
  let tasks = buildAdminTasks()

  if (filters?.pendingOnly) {
    tasks = tasks.filter((t) => t.isPending)
  }
  if (filters?.type && filters.type !== 'all') {
    tasks = tasks.filter((t) => t.type === filters.type)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    tasks = tasks.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.ppoNumber.toLowerCase().includes(q) ||
        t.pensionerName.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q),
    )
  }

  return tasks
}

export function getAdminTaskCounts() {
  const tasks = buildAdminTasks()
  const pending = tasks.filter((t) => t.isPending)
  const byType = (type: AdminTaskType) => pending.filter((t) => t.type === type).length

  return {
    total: pending.length,
    profile_update: byType('profile_update'),
    life_certificate: byType('life_certificate'),
    activation: byType('activation'),
    grievance: byType('grievance'),
    demise: byType('demise'),
    restoration: byType('restoration'),
  }
}

export function getPendingAdminTaskCount() {
  return buildAdminTasks().filter((t) => t.isPending).length
}
