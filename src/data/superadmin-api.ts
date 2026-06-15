import {
  generateAdminUserId,
  generateDepartmentId,
  getAdminUsersStore,
  getDepartmentsStore,
  getRolesStore,
  getSettingsStore,
  setAdminUsersStore,
  setDepartmentsStore,
  setRolesStore,
  setSettingsStore,
} from '@/data/superadmin-mock-data'
import type {
  AdminUserFormValues,
  AdminUserRecord,
  DepartmentFormValues,
  DepartmentRecord,
  RoleDefinition,
  SystemSetting,
} from '@/types/superadmin'

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

export interface AdminUserFilters {
  search?: string
  role?: string
  departmentId?: string
  status?: string
}

export interface DepartmentFilters {
  search?: string
  status?: string
}

export async function fetchAdminUsers(filters?: AdminUserFilters): Promise<AdminUserRecord[]> {
  await delay()
  let items = [...getAdminUsersStore()]

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    items = items.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.mobile.includes(q),
    )
  }
  if (filters?.role && filters.role !== 'all') {
    items = items.filter((u) => u.role === filters.role)
  }
  if (filters?.departmentId && filters.departmentId !== 'all') {
    items = items.filter((u) => u.departmentId === filters.departmentId)
  }
  if (filters?.status && filters.status !== 'all') {
    items = items.filter((u) => u.status === filters.status)
  }
  return items
}

export async function createAdminUser(values: AdminUserFormValues): Promise<AdminUserRecord> {
  await delay()
  const store = getAdminUsersStore()
  if (store.some((u) => u.username.toLowerCase() === values.username.toLowerCase())) {
    throw new Error('Username already exists')
  }
  const record: AdminUserRecord = {
    id: generateAdminUserId(),
    ...values,
    createdAt: new Date().toISOString().split('T')[0],
  }
  setAdminUsersStore([...store, record])
  return record
}

export async function updateAdminUser(
  id: string,
  values: AdminUserFormValues,
): Promise<AdminUserRecord> {
  await delay()
  const store = getAdminUsersStore()
  const index = store.findIndex((u) => u.id === id)
  if (index === -1) throw new Error('Admin user not found')
  if (
    store.some(
      (u) => u.id !== id && u.username.toLowerCase() === values.username.toLowerCase(),
    )
  ) {
    throw new Error('Username already exists')
  }
  const updated = { ...store[index], ...values }
  const next = [...store]
  next[index] = updated
  setAdminUsersStore(next)
  return updated
}

export async function deleteAdminUser(id: string): Promise<void> {
  await delay()
  const store = getAdminUsersStore()
  const user = store.find((u) => u.id === id)
  if (!user) throw new Error('Admin user not found')
  if (user.role === 'super_admin') throw new Error('Cannot delete super admin account')
  setAdminUsersStore(store.filter((u) => u.id !== id))
}

export async function fetchDepartments(filters?: DepartmentFilters): Promise<DepartmentRecord[]> {
  await delay()
  let items = [...getDepartmentsStore()]

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    items = items.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.headOfDepartment.toLowerCase().includes(q),
    )
  }
  if (filters?.status && filters.status !== 'all') {
    items = items.filter((d) => d.status === filters.status)
  }
  return items
}

export async function createDepartment(values: DepartmentFormValues): Promise<DepartmentRecord> {
  await delay()
  const store = getDepartmentsStore()
  if (store.some((d) => d.code.toLowerCase() === values.code.toLowerCase())) {
    throw new Error('Department code already exists')
  }
  const record: DepartmentRecord = {
    id: generateDepartmentId(),
    ...values,
    adminCount: 0,
    pensionerCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  }
  setDepartmentsStore([...store, record])
  return record
}

export async function updateDepartment(
  id: string,
  values: DepartmentFormValues,
): Promise<DepartmentRecord> {
  await delay()
  const store = getDepartmentsStore()
  const index = store.findIndex((d) => d.id === id)
  if (index === -1) throw new Error('Department not found')
  if (store.some((d) => d.id !== id && d.code.toLowerCase() === values.code.toLowerCase())) {
    throw new Error('Department code already exists')
  }
  const updated = { ...store[index], ...values }
  const next = [...store]
  next[index] = updated
  setDepartmentsStore(next)
  return updated
}

export async function deleteDepartment(id: string): Promise<void> {
  await delay()
  const store = getDepartmentsStore()
  const dept = store.find((d) => d.id === id)
  if (!dept) throw new Error('Department not found')
  if (dept.adminCount > 0) throw new Error('Cannot delete department with assigned admin users')
  setDepartmentsStore(store.filter((d) => d.id !== id))
}

export async function fetchRoles(): Promise<RoleDefinition[]> {
  await delay()
  return [...getRolesStore()]
}

export async function updateRolePermissions(
  id: string,
  permissions: string[],
): Promise<RoleDefinition> {
  await delay()
  const store = getRolesStore()
  const index = store.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Role not found')
  if (store[index].id === 'super_admin') {
    throw new Error('Super Admin permissions cannot be modified')
  }
  const updated = { ...store[index], permissions }
  const next = [...store]
  next[index] = updated
  setRolesStore(next)
  return updated
}

export async function fetchSystemSettings(): Promise<SystemSetting[]> {
  await delay()
  return [...getSettingsStore()]
}

export async function updateSystemSettings(
  updates: { id: string; value: string | boolean | number }[],
): Promise<SystemSetting[]> {
  await delay()
  const store = getSettingsStore()
  const next = store.map((setting) => {
    const update = updates.find((u) => u.id === setting.id)
    return update ? { ...setting, value: update.value } : setting
  })
  setSettingsStore(next)
  return next
}
