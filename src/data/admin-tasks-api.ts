import { getAdminTaskCounts, getAdminTasks, getPendingAdminTaskCount } from '@/data/admin-tasks-mock-data'
import type { AdminTask, AdminTaskType } from '@/types/admin-task'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export interface AdminTaskFilters {
  type?: AdminTaskType | 'all'
  pendingOnly?: boolean
  search?: string
}

export async function fetchAdminTasks(filters?: AdminTaskFilters): Promise<AdminTask[]> {
  await delay()
  return getAdminTasks(filters)
}

export async function fetchAdminTaskCounts() {
  await delay(200)
  return getAdminTaskCounts()
}

export async function fetchPendingAdminTaskCount(): Promise<number> {
  await delay(200)
  return getPendingAdminTaskCount()
}
