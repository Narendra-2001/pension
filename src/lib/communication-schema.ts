import { z } from 'zod'

export const generateNoticeSchema = z.object({
  noticeType: z.enum([
    'life_certificate_reminder',
    'suspension_notice',
    'restoration_approval',
    'recovery_notice',
    'installment_due',
    'profile_update_approval',
    'profile_update_rejection',
    'pension_activation',
    'pension_suspension',
    'demise_verification',
    'family_pension',
  ]),
  templateId: z.string().min(1, 'Select a template'),
  pensionerId: z.string().min(1, 'Select a pensioner'),
  amount: z.number().optional(),
  dueDate: z.string().optional(),
  remarks: z.string().optional(),
})

export type GenerateNoticeFormValues = z.infer<typeof generateNoticeSchema>

export const templateFormSchema = z.object({
  name: z.string().min(3, 'Template name is required'),
  templateType: z.enum(['notice', 'notification']),
  channel: z.enum(['sms', 'email', 'in_app', 'pdf']),
  noticeType: z.string().optional(),
  eventType: z.string().optional(),
  subject: z.string().optional(),
  messageContent: z.string().min(10, 'Message content is required'),
  status: z.enum(['active', 'inactive', 'draft']),
})

export type TemplateFormValues = z.infer<typeof templateFormSchema>
