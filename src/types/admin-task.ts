export type AdminTaskType =
  | 'profile_update'
  | 'life_certificate'
  | 'activation'
  | 'grievance'
  | 'demise'
  | 'restoration'

export type AdminTaskPriority = 'normal' | 'urgent'

export interface AdminTask {
  id: string
  type: AdminTaskType
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  title: string
  summary: string
  status: string
  statusLabel: string
  priority: AdminTaskPriority
  submittedAt: string
  updatedAt: string
  detailHref: string
  isPending: boolean
}

export const ADMIN_TASK_TYPE_LABELS: Record<AdminTaskType, string> = {
  profile_update: 'Profile Update',
  life_certificate: 'Life Certificate',
  activation: 'Activation',
  grievance: 'Grievance',
  demise: 'Demise Report',
  restoration: 'Restoration Request',
}
