import {
  Ban,
  Bell,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FilePlus,
  FileX,
  FolderPlus,
  FolderX,
  LogIn,
  Mail,
  Pencil,
  PlusCircle,
  ShieldCheck,
  ShieldX,
  Upload,
  type LucideIcon,
} from 'lucide-react'

import type { AuditAction } from '@/types/audit'

export const AUDIT_ACTION_ICONS: Record<AuditAction, LucideIcon> = {
  record_created: PlusCircle,
  record_updated: Pencil,
  status_changed: ShieldCheck,
  approval_granted: CheckCircle2,
  approval_rejected: ShieldX,
  document_uploaded: Upload,
  document_verified: FileCheck,
  document_rejected: FileX,
  notice_generated: FilePlus,
  notice_sent: Mail,
  notification_sent: Bell,
  payment_recorded: CreditCard,
  case_created: FolderPlus,
  case_closed: FolderX,
  user_login: LogIn,
  bulk_import: Ban,
}

export function getAuditActionTone(action: AuditAction): 'neutral' | 'success' | 'warning' | 'danger' {
  if (['approval_granted', 'document_verified', 'case_closed', 'payment_recorded'].includes(action)) {
    return 'success'
  }
  if (['approval_rejected', 'document_rejected', 'bulk_import'].includes(action)) {
    return 'danger'
  }
  if (['status_changed', 'notice_sent', 'notification_sent'].includes(action)) {
    return 'warning'
  }
  return 'neutral'
}

const ACTION_TONE_CLASSES = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
} as const

export function getAuditActionToneClasses(action: AuditAction): string {
  return ACTION_TONE_CLASSES[getAuditActionTone(action)]
}
