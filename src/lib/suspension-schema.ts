import { z } from 'zod'

export const createSuspensionSchema = z.object({
  pensionerId: z.string().min(1, 'Select a pensioner'),
  triggerType: z.enum([
    'no_verification',
    'fraud',
    'duplicate',
    'invalid_documents',
    'deceased',
    'administrative_hold',
    'other',
  ]),
  suspensionReason: z.string().min(10, 'Suspension reason must be at least 10 characters'),
  suspensionDate: z.string().min(1, 'Suspension date is required'),
  remarks: z.string().optional(),
  documents: z
    .array(
      z.object({
        name: z.string(),
        fileName: z.string(),
      }),
    )
    .optional(),
})

export const restorationRequestSchema = z.object({
  reasonForRestoration: z.string().min(20, 'Please provide a detailed reason (min 20 characters)'),
  remarks: z.string().optional(),
  declarationAccepted: z
    .boolean()
    .refine((val) => val === true, { message: 'You must accept the declaration to submit' }),
})

export const adminRemarksSchema = z.object({
  remarks: z.string().min(10, 'Remarks must be at least 10 characters'),
})

export type CreateSuspensionFormValues = z.infer<typeof createSuspensionSchema>
export type RestorationRequestFormValues = z.infer<typeof restorationRequestSchema>
