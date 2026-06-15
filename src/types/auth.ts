import type { LucideIcon } from 'lucide-react'

export type UserRole =
  | 'super_admin'
  | 'pension_admin'
  | 'accounts'
  | 'recovery'
  | 'audit'
  | 'helpdesk'
  | 'pensioner'

export interface AppUser {
  username: string
  name: string
  role: UserRole
  department: string
  pensionerId?: string
}

export interface RoleTile {
  role: UserRole
  label: string
  sub: string
  username: string
  Icon: LucideIcon
  tile: string
  iconColor: string
}
