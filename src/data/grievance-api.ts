import {
  acceptGrievanceResolution,
  addGrievanceAttachments,
  addGrievanceComment,
  assignGrievanceTicket,
  createGrievanceTicket,
  escalateGrievanceTicket,
  getEscalatedTicketsReport,
  getGrievanceAuditLogs,
  getGrievanceCategoryChart,
  getGrievanceDashboardStats,
  getGrievanceNotifications,
  getGrievancePriorityChart,
  getGrievanceResolutionTrend,
  getGrievanceSlaReport,
  getGrievanceTicketById,
  getGrievanceTickets,
  getGrievanceTicketsByPensioner,
  getHelpdeskOfficers,
  getOpenTicketsReport,
  getResolutionTimeReport,
  rejectGrievanceResolution,
  resolveGrievanceTicket,
  updateGrievanceStatus,
} from '@/data/grievance-mock-data'
import type {
  AddGrievanceCommentInput,
  AssignGrievanceTicketInput,
  CreateGrievanceTicketInput,
  EscalateGrievanceTicketInput,
  GrievanceAuditEntry,
  GrievanceCategoryChartItem,
  GrievanceDashboardStats,
  GrievanceNotification,
  GrievanceOpenTicketsReportItem,
  GrievancePriorityChartItem,
  GrievanceResolutionTimeReportItem,
  GrievanceResolutionTrendItem,
  GrievanceSlaReportItem,
  GrievanceTicket,
  HelpdeskOfficer,
  ResolveGrievanceTicketInput,
  UpdateGrievanceStatusInput,
} from '@/types/grievance'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchGrievanceDashboardStats(): Promise<GrievanceDashboardStats> {
  await delay(300)
  return getGrievanceDashboardStats()
}

export async function fetchGrievanceCategoryChart(): Promise<GrievanceCategoryChartItem[]> {
  await delay(300)
  return getGrievanceCategoryChart()
}

export async function fetchGrievancePriorityChart(): Promise<GrievancePriorityChartItem[]> {
  await delay(300)
  return getGrievancePriorityChart()
}

export async function fetchGrievanceResolutionTrend(): Promise<GrievanceResolutionTrendItem[]> {
  await delay(300)
  return getGrievanceResolutionTrend()
}

export async function fetchGrievanceSlaReport(): Promise<GrievanceSlaReportItem[]> {
  await delay(300)
  return getGrievanceSlaReport()
}

export async function fetchOpenTicketsReport(): Promise<GrievanceOpenTicketsReportItem[]> {
  await delay(400)
  return getOpenTicketsReport()
}

export async function fetchResolutionTimeReport(): Promise<GrievanceResolutionTimeReportItem[]> {
  await delay(400)
  return getResolutionTimeReport()
}

export async function fetchEscalatedTicketsReport(): Promise<GrievanceOpenTicketsReportItem[]> {
  await delay(400)
  return getEscalatedTicketsReport()
}

export async function fetchGrievanceTickets(): Promise<GrievanceTicket[]> {
  await delay()
  return getGrievanceTickets()
}

export async function fetchGrievanceTicketsByPensioner(pensionerId: string): Promise<GrievanceTicket[]> {
  await delay()
  return getGrievanceTicketsByPensioner(pensionerId)
}

export async function fetchGrievanceTicket(id: string): Promise<GrievanceTicket | null> {
  await delay()
  return getGrievanceTicketById(id) ?? null
}

export async function fetchHelpdeskOfficers(): Promise<HelpdeskOfficer[]> {
  await delay(300)
  return getHelpdeskOfficers()
}

export async function fetchGrievanceAuditLogs(ticketId?: string): Promise<GrievanceAuditEntry[]> {
  await delay(300)
  return getGrievanceAuditLogs(ticketId)
}

export async function fetchGrievanceNotifications(ticketId?: string): Promise<GrievanceNotification[]> {
  await delay(200)
  return getGrievanceNotifications(ticketId)
}

export async function createGrievanceTicketApi(input: CreateGrievanceTicketInput): Promise<GrievanceTicket> {
  await delay(800)
  return createGrievanceTicket(input)
}

export async function assignGrievanceTicketApi(input: AssignGrievanceTicketInput): Promise<GrievanceTicket> {
  await delay(600)
  const result = assignGrievanceTicket(input)
  if (!result) throw new Error('Ticket not found')
  return result
}

export async function updateGrievanceStatusApi(input: UpdateGrievanceStatusInput): Promise<GrievanceTicket> {
  await delay(500)
  const result = updateGrievanceStatus(input)
  if (!result) throw new Error('Ticket not found')
  return result
}

export async function resolveGrievanceTicketApi(input: ResolveGrievanceTicketInput): Promise<GrievanceTicket> {
  await delay(700)
  const result = resolveGrievanceTicket(input)
  if (!result) throw new Error('Ticket not found')
  return result
}

export async function escalateGrievanceTicketApi(input: EscalateGrievanceTicketInput): Promise<GrievanceTicket> {
  await delay(600)
  const result = escalateGrievanceTicket(input)
  if (!result) throw new Error('Ticket not found')
  return result
}

export async function addGrievanceCommentApi(input: AddGrievanceCommentInput): Promise<GrievanceTicket> {
  await delay(400)
  const result = addGrievanceComment(input)
  if (!result) throw new Error('Ticket not found')
  return result
}

export async function addGrievanceAttachmentsApi(
  ticketId: string,
  fileNames: string[],
  uploadedBy: string,
): Promise<GrievanceTicket> {
  await delay(500)
  const result = addGrievanceAttachments(ticketId, fileNames, uploadedBy)
  if (!result) throw new Error('Ticket not found')
  return result
}

export async function acceptGrievanceResolutionApi(
  ticketId: string,
  pensionerName: string,
): Promise<GrievanceTicket> {
  await delay(500)
  const result = acceptGrievanceResolution(ticketId, pensionerName)
  if (!result) throw new Error('Ticket not found')
  return result
}

export async function rejectGrievanceResolutionApi(
  ticketId: string,
  pensionerName: string,
  reason: string,
): Promise<GrievanceTicket> {
  await delay(500)
  const result = rejectGrievanceResolution(ticketId, pensionerName, reason)
  if (!result) throw new Error('Ticket not found')
  return result
}
