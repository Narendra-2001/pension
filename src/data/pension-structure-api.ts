import {
  addPensionComponent,
  getAllPensionStructures,
  getPensionCalculationPreview,
  getPensionComponentHistory,
  getPensionStructureForPensioner,
  savePensionStructure,
  updatePensionComponent,
} from '@/data/pension-structure-mock-data'
import { getPensionersStore } from '@/data/admin-mock-data'
import {
  buildComponentReportRows,
  buildDrRevisionReportRows,
  buildPensionReportRows,
  buildRecoveryDeductionReportRows,
} from '@/lib/pension-structure'
import type {
  AddPensionComponentInput,
  PensionComponentHistoryEntry,
  PensionComponentReportRow,
  PensionReportRow,
  PensionStructure,
  UpdatePensionComponentInput,
} from '@/types/pension-structure'
import type { PensionCalculationResult } from '@/types/pension-structure'
import type { PensionerRecord } from '@/types/pensioner'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchPensionStructure(pensionerId: string): Promise<PensionStructure | null> {
  await delay()
  return getPensionStructureForPensioner(pensionerId)
}

export async function fetchPensionCalculation(
  pensionerId: string,
): Promise<PensionCalculationResult | null> {
  await delay()
  return getPensionCalculationPreview(pensionerId)
}

export async function fetchPensionComponentHistory(
  pensionerId?: string,
): Promise<PensionComponentHistoryEntry[]> {
  await delay()
  return getPensionComponentHistory(pensionerId)
}

export async function updatePensionComponentApi(
  input: UpdatePensionComponentInput,
): Promise<{ record: PensionerRecord; history: PensionComponentHistoryEntry }> {
  await delay(600)
  return updatePensionComponent(input)
}

export async function addPensionComponentApi(
  input: AddPensionComponentInput,
): Promise<{ record: PensionerRecord; history: PensionComponentHistoryEntry }> {
  await delay(600)
  return addPensionComponent(input)
}

export async function savePensionStructureApi(
  pensionerId: string,
  structure: PensionStructure,
): Promise<PensionerRecord> {
  await delay(800)
  return savePensionStructure(pensionerId, structure)
}

export async function fetchPensionComponentReport(): Promise<PensionComponentReportRow[]> {
  await delay()
  return buildComponentReportRows(getPensionersStore())
}

export async function fetchGrossPensionReport(): Promise<PensionReportRow[]> {
  await delay()
  return buildPensionReportRows(getPensionersStore())
}

export async function fetchNetPensionReport(): Promise<PensionReportRow[]> {
  await delay()
  return buildPensionReportRows(getPensionersStore())
}

export async function fetchDrRevisionReport(): Promise<PensionComponentHistoryEntry[]> {
  await delay()
  return buildDrRevisionReportRows(getPensionComponentHistory())
}

export async function fetchRecoveryDeductionReport(): Promise<PensionComponentReportRow[]> {
  await delay()
  return buildRecoveryDeductionReportRows(getPensionersStore())
}

export { getAllPensionStructures }
