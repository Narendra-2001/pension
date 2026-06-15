import { z } from 'zod'

export const nomineeInfoSchema = z.object({
  nomineeName: z.string().min(2, 'Nominee name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  mobileNumber: z
    .string()
    .min(10, 'Valid mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  aadhaarNumber: z.string().optional(),
})

export const demiseIntimationSchema = z.object({
  ppoNumber: z.string().min(3, 'PPO number is required'),
  nomineeName: z.string().min(2, 'Nominee name is required'),
  nomineeRelationship: z.string().min(1, 'Relationship is required'),
  nomineeMobile: z
    .string()
    .min(10, 'Valid mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  dateOfDeath: z.string().min(1, 'Date of death is required'),
  placeOfDeath: z.string().min(3, 'Place of death is required'),
  causeOfDeath: z.string().optional(),
  remarks: z.string().optional(),
  declarationAccepted: z.boolean().refine((v) => v === true, {
    message: 'You must accept the legal declaration',
  }),
})

export const demiseVerificationSchema = z.object({
  remarks: z.string().min(5, 'Remarks are required (minimum 5 characters)'),
})

export const familyPensionInitiationSchema = z.object({
  nomineeName: z.string().min(2, 'Nominee name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  mobileNumber: z
    .string()
    .min(10, 'Valid mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  address: z.string().min(10, 'Address is required'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  branchName: z.string().min(2, 'Branch name is required'),
  accountNumber: z.string().min(8, 'Account number is required'),
  ifscCode: z
    .string()
    .min(11, 'IFSC code is required')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code'),
})

export const nomineeLoginSchema = z.object({
  ppoNumber: z.string().min(3, 'PPO number is required'),
  mobileNumber: z
    .string()
    .min(10, 'Valid mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
})

export type DemiseIntimationFormValues = z.infer<typeof demiseIntimationSchema>
export type DemiseVerificationFormValues = z.infer<typeof demiseVerificationSchema>
export type FamilyPensionInitiationFormValues = z.infer<typeof familyPensionInitiationSchema>
export type NomineeLoginFormValues = z.infer<typeof nomineeLoginSchema>
