import type { AppUser } from '@/types/auth'
import { getPensionerFullName } from '@/types/pensioner'

import {
  DEMO_ACTIVATION_PPO,
  DEMO_PENSIONER,
  findPensionerByPpo,
  getPensionerPassword,
  setPensionerPassword,
} from '@/data/pensioner-mock-data'

export const DEMO_PENSIONER_CREDENTIALS = {
  ppoNumber: DEMO_PENSIONER.ppoNumber,
  password: 'Pension@123',
  mobile: DEMO_PENSIONER.mobile,
} as const

export const DEMO_ACTIVATION_CREDENTIALS = {
  ppoNumber: DEMO_ACTIVATION_PPO,
  mobile: '9123456789',
  otp: '123456',
} as const

export function isRegisteredPensionerPpo(ppoNumber: string): boolean {
  const record = findPensionerByPpo(ppoNumber)
  return !!record && record.activationStatus === 'activated'
}

export function validatePensionerCredentials(
  ppoNumber: string,
  password: string,
): AppUser | null {
  const record = findPensionerByPpo(ppoNumber)
  if (!record || record.activationStatus !== 'activated') return null

  const storedPassword = getPensionerPassword(ppoNumber)
  if (password !== storedPassword) return null

  return {
    username: record.service.ppoNumber,
    name: getPensionerFullName(record.personal),
    role: 'pensioner',
    department: record.service.department,
    pensionerId: record.id,
  }
}

export function validateActivationPpo(ppoNumber: string) {
  const record = findPensionerByPpo(ppoNumber)
  if (!record) return { valid: false as const, reason: 'PPO number not found' }
  if (record.activationStatus === 'activated') {
    return { valid: false as const, reason: 'Account already activated. Please login.' }
  }
  return { valid: true as const, record }
}

export function validateActivationMobile(ppoNumber: string, mobile: string) {
  const record = findPensionerByPpo(ppoNumber)
  if (!record) return false
  const normalized = mobile.replace(/\D/g, '').slice(-10)
  const recordMobile = record.personal.mobileNumber.replace(/\D/g, '').slice(-10)
  return normalized === recordMobile
}

export function activatePensionerAccount(ppoNumber: string, password: string): boolean {
  const record = findPensionerByPpo(ppoNumber)
  if (!record || record.activationStatus === 'activated') return false
  setPensionerPassword(ppoNumber, password)
  record.activationStatus = 'activated'
  record.status = 'active'
  record.updatedAt = new Date().toISOString().split('T')[0]
  return true
}
