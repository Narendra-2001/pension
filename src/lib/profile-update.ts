import type { ProfileUpdateRequestType } from '@/types/profile-update-request'
import type { PensionerRecord } from '@/types/pensioner'
import { getPensionerFullName } from '@/types/pensioner'

export const REQUEST_TYPE_LABELS: Record<ProfileUpdateRequestType, string> = {
  personal_details: 'Personal Details Update',
  address: 'Address Update',
  bank_details: 'Bank Details Update',
  nominee_details: 'Nominee Details Update',
  aadhaar: 'Aadhaar Update',
  pan: 'PAN Update',
}

export const REQUEST_TYPE_OPTIONS = Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => ({
  value: value as ProfileUpdateRequestType,
  label,
}))

export function getCurrentValueForType(
  record: PensionerRecord,
  type: ProfileUpdateRequestType,
): string {
  switch (type) {
    case 'personal_details':
      return [
        `Mobile: ${record.personal.mobileNumber}`,
        `Email: ${record.personal.emailAddress}`,
        record.personal.alternateMobile ? `Alternate Mobile: ${record.personal.alternateMobile}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    case 'address':
      return [
        record.address.houseNumber,
        record.address.street,
        record.address.villageCity,
        record.address.district,
        record.address.state,
        record.address.pincode,
      ].join(', ')
    case 'bank_details':
      return [
        `Bank: ${record.bank.bankName}`,
        `Branch: ${record.bank.branchName}`,
        `Account: ${record.bank.accountNumber}`,
        `IFSC: ${record.bank.ifscCode}`,
        `Holder: ${record.bank.accountHolderName}`,
      ].join('\n')
    case 'nominee_details':
      return [
        `Name: ${record.nominee.nomineeName}`,
        `Relationship: ${record.nominee.relationship}`,
        `Mobile: ${record.nominee.mobileNumber}`,
        `Aadhaar: ${record.nominee.aadhaarNumber}`,
        `Share: ${record.nominee.percentageShare}%`,
      ].join('\n')
    case 'aadhaar':
      return record.personal.aadhaarNumber
    case 'pan':
      return record.personal.panNumber
    default:
      return ''
  }
}

export function formatNewValueDisplay(
  type: ProfileUpdateRequestType,
  payload: Record<string, string>,
): string {
  switch (type) {
    case 'personal_details':
      return [
        payload.mobileNumber && `Mobile: ${payload.mobileNumber}`,
        payload.emailAddress && `Email: ${payload.emailAddress}`,
        payload.alternateMobile && `Alternate Mobile: ${payload.alternateMobile}`,
      ]
        .filter(Boolean)
        .join('\n')
    case 'address':
      return [
        payload.houseNumber,
        payload.street,
        payload.villageCity,
        payload.district,
        payload.state,
        payload.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    case 'bank_details':
      return [
        payload.bankName && `Bank: ${payload.bankName}`,
        payload.branchName && `Branch: ${payload.branchName}`,
        payload.accountNumber && `Account: ${payload.accountNumber}`,
        payload.ifscCode && `IFSC: ${payload.ifscCode}`,
        payload.accountHolderName && `Holder: ${payload.accountHolderName}`,
      ]
        .filter(Boolean)
        .join('\n')
    case 'nominee_details':
      return [
        payload.nomineeName && `Name: ${payload.nomineeName}`,
        payload.relationship && `Relationship: ${payload.relationship}`,
        payload.mobileNumber && `Mobile: ${payload.mobileNumber}`,
        payload.aadhaarNumber && `Aadhaar: ${payload.aadhaarNumber}`,
        payload.percentageShare && `Share: ${payload.percentageShare}%`,
      ]
        .filter(Boolean)
        .join('\n')
    case 'aadhaar':
      return payload.aadhaarNumber ?? ''
    case 'pan':
      return payload.panNumber ?? ''
    default:
      return ''
  }
}

export function applyProfileUpdateToRecord(
  record: PensionerRecord,
  type: ProfileUpdateRequestType,
  payload: Record<string, string>,
): PensionerRecord {
  const updated = { ...record, updatedAt: new Date().toISOString().split('T')[0] }

  switch (type) {
    case 'personal_details':
      updated.personal = {
        ...updated.personal,
        ...(payload.mobileNumber && { mobileNumber: payload.mobileNumber }),
        ...(payload.emailAddress && { emailAddress: payload.emailAddress }),
        ...(payload.alternateMobile && { alternateMobile: payload.alternateMobile }),
      }
      break
    case 'address':
      updated.address = {
        ...updated.address,
        ...(payload.houseNumber && { houseNumber: payload.houseNumber }),
        ...(payload.street && { street: payload.street }),
        ...(payload.villageCity && { villageCity: payload.villageCity }),
        ...(payload.district && { district: payload.district }),
        ...(payload.state && { state: payload.state }),
        ...(payload.pincode && { pincode: payload.pincode }),
      }
      break
    case 'bank_details':
      updated.bank = {
        ...updated.bank,
        ...(payload.bankName && { bankName: payload.bankName }),
        ...(payload.branchName && { branchName: payload.branchName }),
        ...(payload.accountNumber && { accountNumber: payload.accountNumber }),
        ...(payload.ifscCode && { ifscCode: payload.ifscCode }),
        ...(payload.accountHolderName && { accountHolderName: payload.accountHolderName }),
      }
      break
    case 'nominee_details':
      updated.nominee = {
        ...updated.nominee,
        ...(payload.nomineeName && { nomineeName: payload.nomineeName }),
        ...(payload.relationship && { relationship: payload.relationship }),
        ...(payload.mobileNumber && { mobileNumber: payload.mobileNumber }),
        ...(payload.aadhaarNumber && { aadhaarNumber: payload.aadhaarNumber }),
        ...(payload.percentageShare && { percentageShare: Number(payload.percentageShare) }),
        ...(payload.address && { address: payload.address }),
      }
      break
    case 'aadhaar':
      updated.personal = {
        ...updated.personal,
        ...(payload.aadhaarNumber && { aadhaarNumber: payload.aadhaarNumber }),
      }
      break
    case 'pan':
      updated.personal = {
        ...updated.personal,
        ...(payload.panNumber && { panNumber: payload.panNumber }),
      }
      break
  }

  return updated
}

export function getPensionerName(record: PensionerRecord) {
  return getPensionerFullName(record.personal)
}
