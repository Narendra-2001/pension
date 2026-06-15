import { findPensionerByPpo } from '@/data/pensioner-mock-data'
import { getPensionerFullName } from '@/types/pensioner'

const NOMINEE_SESSION_KEY = 'pension_nominee_session'
const DEMO_NOMINEE_OTP = '654321'

export interface NomineeSession {
  ppoNumber: string
  pensionerId: string
  pensionerName: string
  nomineeName: string
  nomineeMobile: string
  verifiedAt: string
}

export function validateNomineeCredentials(ppoNumber: string, mobileNumber: string): NomineeSession | null {
  const record = findPensionerByPpo(ppoNumber)
  if (!record || record.status === 'deceased') return null

  const normalized = mobileNumber.replace(/\D/g, '').slice(-10)
  const nomineeMobile = record.nominee.mobileNumber.replace(/\D/g, '').slice(-10)
  if (normalized !== nomineeMobile) return null

  return {
    ppoNumber: record.service.ppoNumber,
    pensionerId: record.id,
    pensionerName: getPensionerFullName(record.personal),
    nomineeName: record.nominee.nomineeName,
    nomineeMobile: normalized,
    verifiedAt: new Date().toISOString(),
  }
}

export function validateNomineeOtp(otp: string): boolean {
  return otp === DEMO_NOMINEE_OTP
}

export function saveNomineeSession(session: NomineeSession) {
  sessionStorage.setItem(NOMINEE_SESSION_KEY, JSON.stringify(session))
}

export function getNomineeSession(): NomineeSession | null {
  try {
    const raw = sessionStorage.getItem(NOMINEE_SESSION_KEY)
    return raw ? (JSON.parse(raw) as NomineeSession) : null
  } catch {
    return null
  }
}

export function clearNomineeSession() {
  sessionStorage.removeItem(NOMINEE_SESSION_KEY)
}

export const DEMO_NOMINEE_CREDENTIALS = {
  ppoNumber: 'PPO123456',
  mobile: '9123456780',
  otp: DEMO_NOMINEE_OTP,
} as const
