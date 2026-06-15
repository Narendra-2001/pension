import { z } from 'zod'

export const pensionMasterSchema = z.object({
  pensionStartDate: z.string().min(1, 'Pension start date is required'),
  sanctionDate: z.string().min(1, 'Sanction date is required'),
  sanctionAuthority: z.string().min(2, 'Sanction authority is required'),
})

export const pensionComponentUpdateSchema = z.object({
  amount: z.coerce.number().min(0, 'Amount must be zero or positive'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  reason: z.string().min(3, 'Reason is required'),
})

export const pensionOnboardingComponentsSchema = z.object({
  basicPension: z.coerce.number().min(0),
  dearnessRelief: z.coerce.number().min(0),
  medicalAllowance: z.coerce.number().min(0),
  specialAllowance: z.coerce.number().min(0),
  disabilityAllowance: z.coerce.number().min(0).optional(),
  familyPensionComponent: z.coerce.number().min(0).optional(),
  otherAllowances: z.coerce.number().min(0).optional(),
  arrears: z.coerce.number().min(0),
  commutationAdjustment: z.coerce.number().min(0).optional(),
  revisionAdjustment: z.coerce.number().min(0).optional(),
  taxDeduction: z.coerce.number().min(0),
  recoveryDeduction: z.coerce.number().min(0),
  otherDeductions: z.coerce.number().min(0).optional(),
  pensionStartDate: z.string().min(1),
  sanctionDate: z.string().min(1),
  sanctionAuthority: z.string().min(2),
})

export type PensionComponentUpdateFormValues = z.infer<typeof pensionComponentUpdateSchema>
export type PensionOnboardingComponentsFormValues = z.infer<typeof pensionOnboardingComponentsSchema>
