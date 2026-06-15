import type { UserRole } from '@/types/auth'

export type AdminUserStatus = 'active' | 'inactive' | 'locked'

export interface AdminUserRecord {
  id: string
  username: string
  name: string
  email: string
  mobile: string
  role: Exclude<UserRole, 'pensioner'>
  departmentId: string
  status: AdminUserStatus
  lastLogin?: string
  createdAt: string
}

export type DepartmentStatus = 'active' | 'inactive'

export interface DepartmentRecord {
  id: string
  code: string
  name: string
  headOfDepartment: string
  contactEmail: string
  contactPhone: string
  adminCount: number
  pensionerCount: number
  status: DepartmentStatus
  createdAt: string
}

export interface RoleDefinition {
  id: Exclude<UserRole, 'pensioner'>
  name: string
  description: string
  permissions: string[]
  isSystemRole: boolean
  userCount: number
}

export type SystemSettingType = 'text' | 'boolean' | 'number' | 'select'

export interface SystemSetting {
  id: string
  category: string
  label: string
  description: string
  value: string | boolean | number
  type: SystemSettingType
  options?: { value: string; label: string }[]
}

export interface AdminUserFormValues {
  username: string
  name: string
  email: string
  mobile: string
  role: Exclude<UserRole, 'pensioner'>
  departmentId: string
  status: AdminUserStatus
}

export interface DepartmentFormValues {
  code: string
  name: string
  headOfDepartment: string
  contactEmail: string
  contactPhone: string
  status: DepartmentStatus
}
