import { z } from 'zod'

export const createGrievanceSchema = z.object({
  category: z.string().min(1, 'Select an issue type'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  contactNumber: z.string().min(10, 'Enter a valid contact number'),
  attachmentNames: z.array(z.string()).optional(),
})

export const assignGrievanceSchema = z.object({
  officerId: z.string().min(1, 'Select an officer'),
  remarks: z.string().optional(),
})

export const updateGrievanceStatusSchema = z.object({
  status: z.enum([
    'open',
    'assigned',
    'in_progress',
    'waiting_for_user',
    'resolved',
    'closed',
    'escalated',
    'reopened',
  ]),
  remarks: z.string().optional(),
})

export const resolveGrievanceSchema = z.object({
  notes: z.string().min(10, 'Resolution notes must be at least 10 characters'),
  rootCause: z.string().min(5, 'Root cause is required'),
  correctiveAction: z.string().min(5, 'Corrective action is required'),
})

export const escalateGrievanceSchema = z.object({
  reason: z.string().min(10, 'Escalation reason must be at least 10 characters'),
})

export const addGrievanceCommentSchema = z.object({
  message: z.string().min(3, 'Comment must be at least 3 characters'),
  isInternal: z.boolean().optional(),
})

export const rejectResolutionSchema = z.object({
  reason: z.string().min(10, 'Please explain why you are rejecting the resolution'),
})

export type CreateGrievanceFormValues = z.infer<typeof createGrievanceSchema>
export type AssignGrievanceFormValues = z.infer<typeof assignGrievanceSchema>
export type UpdateGrievanceStatusFormValues = z.infer<typeof updateGrievanceStatusSchema>
export type ResolveGrievanceFormValues = z.infer<typeof resolveGrievanceSchema>
export type EscalateGrievanceFormValues = z.infer<typeof escalateGrievanceSchema>
export type AddGrievanceCommentFormValues = z.infer<typeof addGrievanceCommentSchema>
export type RejectResolutionFormValues = z.infer<typeof rejectResolutionSchema>
