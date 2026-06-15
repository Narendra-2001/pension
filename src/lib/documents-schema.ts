import { z } from 'zod'

const documentTypeEnum = z.enum([
  'aadhaar_card',
  'pan_card',
  'passport_photo',
  'signature',
  'ppo_copy',
  'pension_sanction_order',
  'retirement_order',
  'bank_passbook',
  'cancelled_cheque',
  'nominee_aadhaar',
  'relationship_proof',
  'life_certificate',
  'restoration_supporting',
  'death_certificate',
  'legal_heir_certificate',
  'recovery_notice',
  'recovery_evidence',
])

const mimeTypeEnum = z.enum(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])

export const uploadDocumentSchema = z.object({
  ppoNumber: z.string().min(1, 'PPO number is required'),
  documentType: documentTypeEnum,
  fileName: z.string().min(1, 'File is required'),
  fileSize: z.number().positive('Invalid file size'),
  mimeType: mimeTypeEnum,
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  uploadDate: z.string().min(1, 'Upload date is required'),
})

export type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>

export const verifyDocumentSchema = z.object({
  verificationNotes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),
})

export type VerifyDocumentFormValues = z.infer<typeof verifyDocumentSchema>

export const rejectDocumentSchema = z.object({
  reason: z.enum([
    'blurred_image',
    'invalid_document',
    'mismatch_information',
    'expired_document',
    'incorrect_upload',
  ]),
  notes: z.string().min(10, 'Rejection notes must be at least 10 characters'),
})

export type RejectDocumentFormValues = z.infer<typeof rejectDocumentSchema>

export const requestReuploadSchema = z.object({
  notes: z.string().min(10, 'Notes must be at least 10 characters'),
})

export type RequestReuploadFormValues = z.infer<typeof requestReuploadSchema>
