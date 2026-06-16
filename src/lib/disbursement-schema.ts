import { format, subMonths } from 'date-fns'
import { z } from 'zod'

export function buildPaymentMonthOptions(count = 12): string[] {
  const now = new Date()
  return Array.from({ length: count }, (_, index) =>
    format(subMonths(now, index), 'MMMM yyyy'),
  )
}

export const manualDisbursementSchema = z
  .object({
    pensionerId: z.string().min(1, 'Select a pensioner'),
    paymentMonth: z.string().min(1, 'Payment month is required'),
    grossPension: z.number().positive('Gross pension must be greater than zero'),
    recoveryAmount: z.number().min(0, 'Recovery cannot be negative'),
    deductions: z.number().min(0, 'Deductions cannot be negative'),
    netPension: z.number().positive('Net pension must be greater than zero'),
    utrReference: z.string().min(1, 'UTR reference is required'),
    creditDate: z.string().min(1, 'Credit date is required'),
    status: z.enum(['paid', 'pending', 'failed']),
    remarks: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const expectedNet = values.grossPension - values.recoveryAmount - values.deductions
    if (Math.abs(expectedNet - values.netPension) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Net pension must equal gross minus recovery and deductions (expected ₹${expectedNet.toLocaleString('en-IN')})`,
        path: ['netPension'],
      })
    }
  })

export type ManualDisbursementFormValues = z.infer<typeof manualDisbursementSchema>
