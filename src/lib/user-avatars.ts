import accountsAvatar from '@/assets/avatars/accounts-avatar.png'
import auditAvatar from '@/assets/avatars/audit-avatar.png'
import helpdeskAvatar from '@/assets/avatars/helpdesk-avatar.png'
import pensionAdminAvatar from '@/assets/avatars/pension-admin-avatar.png'
import pensionerFemaleAvatar from '@/assets/avatars/pensioner-female-avatar.png'
import pensionerMaleAvatar from '@/assets/avatars/pensioner-male-avatar.png'
import recoveryAvatar from '@/assets/avatars/recovery-avatar.png'
import superAdminAvatar from '@/assets/avatars/super-admin-avatar.png'
import type { AppUser, UserRole } from '@/types/auth'

/** Demo officer accounts — username lookup */
const AVATARS_BY_USERNAME: Record<string, string> = {
  superadmin: superAdminAvatar,
  pensionadmin: pensionAdminAvatar,
  accounts: accountsAvatar,
  recovery: recoveryAvatar,
  audit: auditAvatar,
  helpdesk: helpdeskAvatar,
}

/** Pensioner portal — PPO number lookup */
const AVATARS_BY_PPO: Record<string, string> = {
  ppo123456: pensionerMaleAvatar,
  ppo555001: pensionerFemaleAvatar,
  ppo789012: pensionerFemaleAvatar,
}

/** Pensioner portal — internal record id lookup */
const AVATARS_BY_PENSIONER_ID: Record<string, string> = {
  'pen-demo-001': pensionerMaleAvatar,
  'pen-susp-001': pensionerFemaleAvatar,
  'pen-demo-002': pensionerFemaleAvatar,
}

/** Role fallback when username is unavailable */
const AVATARS_BY_ROLE: Record<UserRole, string> = {
  super_admin: superAdminAvatar,
  pension_admin: pensionAdminAvatar,
  accounts: accountsAvatar,
  recovery: recoveryAvatar,
  audit: auditAvatar,
  helpdesk: helpdeskAvatar,
  pensioner: pensionerMaleAvatar,
}

/** Pensioner profile photos for admin detail views */
export function getPensionerAvatarSrc(
  ppo?: string,
  gender?: 'male' | 'female' | 'other',
): string {
  if (ppo) {
    const key = ppo.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (AVATARS_BY_PPO[key]) return AVATARS_BY_PPO[key]
  }
  if (gender === 'female') return pensionerFemaleAvatar
  return pensionerMaleAvatar
}

export function getUserAvatarSrc(user?: AppUser | null): string | undefined {
  if (!user) return undefined

  const usernameKey = user.username?.toLowerCase()
  if (usernameKey && AVATARS_BY_USERNAME[usernameKey]) {
    return AVATARS_BY_USERNAME[usernameKey]
  }

  if (usernameKey && AVATARS_BY_PPO[usernameKey]) {
    return AVATARS_BY_PPO[usernameKey]
  }

  const pensionerKey = user.pensionerId?.toLowerCase()
  if (pensionerKey && AVATARS_BY_PENSIONER_ID[pensionerKey]) {
    return AVATARS_BY_PENSIONER_ID[pensionerKey]
  }

  return AVATARS_BY_ROLE[user.role]
}

export const ROLE_AVATARS = AVATARS_BY_ROLE
