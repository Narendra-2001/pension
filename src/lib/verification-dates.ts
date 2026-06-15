import { addYears, format, parseISO } from 'date-fns'

/** Annual life certificate — next due date is one year from approval. */
export function calculateNextVerificationDueDate(fromDate: string): string {
  return format(addYears(parseISO(fromDate), 1), 'yyyy-MM-dd')
}

export function formatVerificationDisplayDate(isoDate: string): string {
  return format(parseISO(isoDate), 'd MMMM yyyy')
}
