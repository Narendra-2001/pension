import { z } from 'zod'

export const createRecoveryCaseSchema = z.object({
  excessCaseId: z.string().min(1, 'Select an approved excess case'),
  recoveryReason: z.enum([
    'excess_pension_credit',
    'pay_revision_adjustment',
    'duplicate_disbursement',
    'wrong_pension_type',
    'arrear_overpayment',
    'other',
  ]),
  recoveryType: z.enum(['full_recovery', 'installment_recovery']),
  arrearAdjustment: z.number().min(0, 'Arrear adjustment cannot be negative'),
  recoveryStartDate: z.string().min(1, 'Recovery start date is required'),
  remarks: z.string().optional(),
})

export type CreateRecoveryFormValues = z.infer<typeof createRecoveryCaseSchema>

export const configureInstallmentsSchema = z.object({
  installmentCount: z.number().int().min(1, 'At least 1 installment required').max(120),
  recoveryStartDate: z.string().min(1, 'Start date is required'),
  paymentMode: z.enum(['pension_deduction', 'direct_deposit', 'manual_payment']),
  recoveryFrequency: z.enum(['monthly', 'quarterly']),
  autoGenerateSchedule: z.boolean(),
})

export type ConfigureInstallmentsFormValues = z.infer<typeof configureInstallmentsSchema>

export const recordPaymentSchema = z.object({
  installmentId: z.string().optional(),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paidAmount: z.number().positive('Amount must be greater than zero'),
  paymentReference: z.string().min(1, 'Payment reference is required'),
  paymentMode: z.enum(['pension_deduction', 'direct_deposit', 'manual_payment']),
  remarks: z.string().optional(),
})

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>

export const approvalRemarksSchema = z.object({
  remarks: z.string().min(5, 'Remarks must be at least 5 characters'),
})
