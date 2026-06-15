import {
  createProfileUpdateRequest,
  getPendingProfileUpdateCount,
  getProfileUpdateAuditLogs,
  getProfileUpdateRequestById,
  getProfileUpdateRequests,
  getProfileUpdateRequestsByPensioner,
  processAdminProfileUpdateAction,
} from '@/data/profile-update-mock-data'
import type {
  AdminProfileUpdateAction,
  CreateProfileUpdateInput,
  ProfileUpdateAuditLog,
  ProfileUpdateRequest,
} from '@/types/profile-update-request'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchPensionerProfileUpdateRequests(
  pensionerId: string,
): Promise<ProfileUpdateRequest[]> {
  await delay()
  return getProfileUpdateRequestsByPensioner(pensionerId)
}

export async function fetchProfileUpdateRequest(id: string): Promise<ProfileUpdateRequest | null> {
  await delay()
  return getProfileUpdateRequestById(id) ?? null
}

export async function submitProfileUpdateRequest(
  input: CreateProfileUpdateInput,
): Promise<ProfileUpdateRequest> {
  await delay(800)
  return createProfileUpdateRequest(input)
}

export async function fetchAdminProfileUpdateRequests(): Promise<ProfileUpdateRequest[]> {
  await delay()
  return getProfileUpdateRequests()
}

export async function fetchPendingProfileUpdateCount(): Promise<number> {
  await delay(200)
  return getPendingProfileUpdateCount()
}

export async function fetchRequestAuditLogs(requestId: string): Promise<ProfileUpdateAuditLog[]> {
  await delay(300)
  return getProfileUpdateAuditLogs(requestId)
}

export async function adminProcessProfileUpdate(
  requestId: string,
  action: AdminProfileUpdateAction,
  remarks: string,
  adminName?: string,
): Promise<ProfileUpdateRequest> {
  await delay(700)
  return processAdminProfileUpdateAction(requestId, action, remarks, adminName)
}
