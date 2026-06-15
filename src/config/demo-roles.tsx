import {
  Crown,
  FileText,
  Headphones,
  Heart,
  RotateCcw,
  ScrollText,
  Settings2,
  Wallet,
} from 'lucide-react'

import { DEMO_NOMINEE_CREDENTIALS } from '@/lib/nominee-auth'
import type { RoleTile, UserRole } from '@/types/auth'

export type LoginPortalRole = UserRole | 'nominee'

export interface NomineeDemoTile {
  role: 'nominee'
  label: string
  sub: string
  ppoNumber: string
  mobile: string
  Icon: RoleTile['Icon']
  tile: string
  iconColor: string
}

export type LoginDemoTile = RoleTile | NomineeDemoTile

export function isNomineeDemoTile(tile: LoginDemoTile): tile is NomineeDemoTile {
  return tile.role === 'nominee'
}

export const DEMO_PASSWORD = 'Admin@123'
export const PENSIONER_DEMO_PASSWORD = 'Pension@123'

export const ROLE_TILES: RoleTile[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    sub: 'System & governance',
    username: 'superadmin',
    Icon: Crown,
    tile: 'bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-500/15 dark:to-slate-600/10',
    iconColor: 'text-slate-700 dark:text-slate-200',
  },
  {
    role: 'pension_admin',
    label: 'Pension Admin',
    sub: 'Pensioner operations',
    username: 'pensionadmin',
    Icon: Settings2,
    tile: 'bg-gradient-to-br from-icy-blue-100 to-icy-blue-200/70 dark:from-icy-blue-500/15 dark:to-icy-blue-600/10',
    iconColor: 'text-icy-blue-600 dark:text-icy-blue-300',
  },
  {
    role: 'accounts',
    label: 'Accounts',
    sub: 'Disbursements & finance',
    username: 'accounts',
    Icon: Wallet,
    tile: 'bg-gradient-to-br from-emerald-100 to-emerald-200/70 dark:from-emerald-500/15 dark:to-emerald-600/10',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
  },
  {
    role: 'recovery',
    label: 'Recovery',
    sub: 'Excess payment cases',
    username: 'recovery',
    Icon: RotateCcw,
    tile: 'bg-gradient-to-br from-amber-100 to-amber-200/70 dark:from-amber-500/15 dark:to-amber-600/10',
    iconColor: 'text-amber-600 dark:text-amber-300',
  },
  {
    role: 'audit',
    label: 'Audit',
    sub: 'Compliance & logs',
    username: 'audit',
    Icon: ScrollText,
    tile: 'bg-gradient-to-br from-violet-100 to-violet-200/70 dark:from-violet-500/15 dark:to-violet-600/10',
    iconColor: 'text-violet-600 dark:text-violet-300',
  },
  {
    role: 'helpdesk',
    label: 'Helpdesk',
    sub: 'Pensioner support',
    username: 'helpdesk',
    Icon: Headphones,
    tile: 'bg-gradient-to-br from-rose-100 to-rose-200/70 dark:from-rose-500/15 dark:to-rose-600/10',
    iconColor: 'text-rose-600 dark:text-rose-300',
  },
  {
    role: 'pensioner',
    label: 'Pensioner',
    sub: 'Enter any PPO number',
    username: 'PPO123456',
    Icon: FileText,
    tile: 'bg-gradient-to-br from-teal-100 to-teal-200/70 dark:from-teal-500/15 dark:to-teal-600/10',
    iconColor: 'text-teal-600 dark:text-teal-300',
  },
]

export const NOMINEE_DEMO_TILE: NomineeDemoTile = {
  role: 'nominee',
  label: 'Nominee',
  sub: 'Demise reporting',
  ppoNumber: DEMO_NOMINEE_CREDENTIALS.ppoNumber,
  mobile: DEMO_NOMINEE_CREDENTIALS.mobile,
  Icon: Heart,
  tile: 'bg-gradient-to-br from-pink-100 to-rose-200/70 dark:from-rose-500/15 dark:to-rose-600/10',
  iconColor: 'text-rose-600 dark:text-rose-300',
}

export const LOGIN_OFFICER_TILES: RoleTile[] = ROLE_TILES.filter((tile) => tile.role !== 'pensioner')

export const LOGIN_CITIZEN_TILES: LoginDemoTile[] = [
  ROLE_TILES.find((tile) => tile.role === 'pensioner')!,
  NOMINEE_DEMO_TILE,
]

export const LOGIN_DEMO_TILES: LoginDemoTile[] = [...LOGIN_OFFICER_TILES, ...LOGIN_CITIZEN_TILES]

export const NOMINEE_DEMO_OTP = DEMO_NOMINEE_CREDENTIALS.otp

/** Demo PPO numbers for pensioner login (active, suspended, etc.) */
export const PENSIONER_DEMO_PPONumbers = [
  { ppo: 'PPO123456', hint: 'Active pensioner' },
  { ppo: 'PPO555001', hint: 'Suspended — restoration demo' },
] as const

export function getDemoPassword(role: LoginPortalRole): string {
  return role === 'pensioner' ? PENSIONER_DEMO_PASSWORD : DEMO_PASSWORD
}

export function getRoleTile(username: string): RoleTile | undefined {
  return ROLE_TILES.find((t) => t.username.toLowerCase() === username.toLowerCase())
}
