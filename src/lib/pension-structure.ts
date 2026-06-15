import type { PensionDetails, PensionerRecord, PensionType } from '@/types/pensioner'
import type {
  AddPensionComponentInput,
  PensionCalculationResult,
  PensionComponent,
  PensionComponentCategory,
  PensionComponentCalcType,
  PensionComponentHistoryEntry,
  PensionComponentKind,
  PensionComponentReportRow,
  PensionMasterInfo,
  PensionMasterStatus,
  PensionReportRow,
  PensionStructure,
  UpdatePensionComponentInput,
} from '@/types/pension-structure'
import { getPensionerFullName } from '@/types/pensioner'

export const PENSION_TYPE_LABELS: Record<PensionType, string> = {
  superannuation: 'Service Pension',
  family_pension: 'Family Pension',
  voluntary_retirement: 'Voluntary Retirement',
  compassionate: 'Compassionate Pension',
  disability: 'Disability Pension',
}

export const PENSION_COMPONENT_CATEGORY_LABELS: Record<PensionComponentCategory, string> = {
  core: 'Core',
  allowance: 'Allowance',
  adjustment: 'Adjustment',
  deduction: 'Deduction',
}

export const PENSION_COMPONENT_CALC_TYPE_LABELS: Record<PensionComponentCalcType, string> = {
  fixed: 'Fixed',
  variable: 'Variable',
  deduction: 'Deduction',
}

interface ComponentCatalogEntry {
  name: string
  category: PensionComponentCategory
  calcType: PensionComponentCalcType
  isCredit: boolean
}

export const PENSION_COMPONENT_CATALOG: Record<PensionComponentKind, ComponentCatalogEntry> = {
  basic_pension: { name: 'Basic Pension', category: 'core', calcType: 'fixed', isCredit: true },
  dearness_relief: { name: 'Dearness Relief (DR)', category: 'core', calcType: 'variable', isCredit: true },
  medical_allowance: { name: 'Medical Allowance', category: 'allowance', calcType: 'fixed', isCredit: true },
  special_allowance: { name: 'Special Allowance', category: 'allowance', calcType: 'fixed', isCredit: true },
  disability_allowance: { name: 'Disability Allowance', category: 'allowance', calcType: 'fixed', isCredit: true },
  family_pension_component: { name: 'Family Pension Component', category: 'allowance', calcType: 'fixed', isCredit: true },
  other_allowances: { name: 'Other Allowances', category: 'allowance', calcType: 'fixed', isCredit: true },
  arrears: { name: 'Arrears', category: 'adjustment', calcType: 'variable', isCredit: true },
  commutation_adjustment: { name: 'Commutation Adjustment', category: 'adjustment', calcType: 'variable', isCredit: true },
  revision_adjustment: { name: 'Revision Adjustment', category: 'adjustment', calcType: 'variable', isCredit: true },
  income_tax: { name: 'Income Tax (TDS)', category: 'deduction', calcType: 'deduction', isCredit: false },
  recovery_deduction: { name: 'Recovery Deduction', category: 'deduction', calcType: 'deduction', isCredit: false },
  other_deductions: { name: 'Other Deductions', category: 'deduction', calcType: 'deduction', isCredit: false },
}

export const CREDIT_COMPONENT_KINDS: PensionComponentKind[] = (
  Object.entries(PENSION_COMPONENT_CATALOG) as [PensionComponentKind, ComponentCatalogEntry][]
)
  .filter(([, entry]) => entry.isCredit)
  .map(([kind]) => kind)

export const DEDUCTION_COMPONENT_KINDS: PensionComponentKind[] = (
  Object.entries(PENSION_COMPONENT_CATALOG) as [PensionComponentKind, ComponentCatalogEntry][]
)
  .filter(([, entry]) => !entry.isCredit)
  .map(([kind]) => kind)

export function getActiveComponents(components: PensionComponent[]): PensionComponent[] {
  return components.filter((c) => c.status === 'active')
}

export function calculatePensionFromComponents(components: PensionComponent[]): PensionCalculationResult {
  const active = getActiveComponents(components)
  const breakdown = active.map((c) => ({
    kind: c.kind,
    name: c.name,
    amount: c.amount,
    category: c.category,
    calcType: c.calcType,
  }))

  const grossPension = active
    .filter((c) => PENSION_COMPONENT_CATALOG[c.kind].isCredit)
    .reduce((sum, c) => sum + c.amount, 0)

  const totalDeductions = active
    .filter((c) => !PENSION_COMPONENT_CATALOG[c.kind].isCredit)
    .reduce((sum, c) => sum + c.amount, 0)

  const netPension = Math.max(0, grossPension - totalDeductions)

  return { grossPension, netPension, totalDeductions, breakdown }
}

export function derivePensionDetails(components: PensionComponent[]): PensionDetails {
  const calc = calculatePensionFromComponents(components)
  const getAmount = (kind: PensionComponentKind) =>
    getActiveComponents(components).find((c) => c.kind === kind)?.amount ?? 0

  return {
    basicPension: getAmount('basic_pension'),
    dearnessRelief: getAmount('dearness_relief'),
    medicalAllowance: getAmount('medical_allowance'),
    specialAllowance: getAmount('special_allowance'),
    arrears: getAmount('arrears'),
    taxDeduction: getAmount('income_tax'),
    recoveryDeduction: getAmount('recovery_deduction'),
    grossPension: calc.grossPension,
    netPension: calc.netPension,
  }
}

export function mapPensionerStatusToMasterStatus(status: PensionerRecord['status']): PensionMasterStatus {
  if (status === 'active') return 'active'
  if (status === 'suspended') return 'suspended'
  if (status === 'deceased') return 'deceased'
  if (status === 'pending_activation') return 'pending_activation'
  return 'draft'
}

export function buildPensionMasterFromRecord(record: PensionerRecord): PensionMasterInfo {
  return {
    ppoNumber: record.service.ppoNumber,
    pensionType: record.service.pensionType,
    pensionStartDate: record.pensionStructure?.master.pensionStartDate ?? record.service.retirementDate,
    sanctionDate: record.pensionStructure?.master.sanctionDate ?? record.createdAt,
    retirementDate: record.service.retirementDate,
    lastPayDrawn: record.service.lastPayDrawn,
    sanctionAuthority: record.pensionStructure?.master.sanctionAuthority ?? 'Pension Sanctioning Authority',
    pensionStatus: mapPensionerStatusToMasterStatus(record.status),
  }
}

let componentCounter = 1
let historyCounter = 1

export function generateComponentId(): string {
  return `PC-${String(componentCounter++).padStart(6, '0')}`
}

export function generateHistoryId(): string {
  return `PCH-${String(historyCounter++).padStart(6, '0')}`
}

export function resetPensionStructureCounters(componentStart = 1, historyStart = 1) {
  componentCounter = componentStart
  historyCounter = historyStart
}

export function createPensionComponent(
  pensionerId: string,
  ppoNumber: string,
  kind: PensionComponentKind,
  amount: number,
  effectiveDate: string,
): PensionComponent {
  const catalog = PENSION_COMPONENT_CATALOG[kind]
  const now = new Date().toISOString().split('T')[0]
  return {
    id: generateComponentId(),
    pensionerId,
    ppoNumber,
    name: catalog.name,
    kind,
    category: catalog.category,
    calcType: catalog.calcType,
    amount,
    effectiveDate,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
}

export function buildStructureFromFlatPension(
  record: PensionerRecord,
  effectiveDate?: string,
): PensionStructure {
  const date = effectiveDate ?? record.service.retirementDate
  const ppo = record.service.ppoNumber
  const id = record.id
  const p = record.pension

  const components: PensionComponent[] = [
    createPensionComponent(id, ppo, 'basic_pension', p.basicPension, date),
    createPensionComponent(id, ppo, 'dearness_relief', p.dearnessRelief, date),
    createPensionComponent(id, ppo, 'medical_allowance', p.medicalAllowance, date),
    createPensionComponent(id, ppo, 'special_allowance', p.specialAllowance, date),
    createPensionComponent(id, ppo, 'arrears', p.arrears, date),
    createPensionComponent(id, ppo, 'income_tax', p.taxDeduction, date),
    createPensionComponent(id, ppo, 'recovery_deduction', p.recoveryDeduction, date),
  ]

  if (record.service.pensionType === 'disability') {
    components.push(createPensionComponent(id, ppo, 'disability_allowance', 0, date))
  }
  if (record.service.pensionType === 'family_pension') {
    components.push(createPensionComponent(id, ppo, 'family_pension_component', 0, date))
  }

  return {
    master: buildPensionMasterFromRecord({ ...record, pensionStructure: undefined }),
    components,
  }
}

export function buildStructureFromOnboardingInput(
  record: PensionerRecord,
  input: {
    basicPension: number
    dearnessRelief: number
    medicalAllowance: number
    specialAllowance: number
    disabilityAllowance?: number
    familyPensionComponent?: number
    otherAllowances?: number
    arrears: number
    commutationAdjustment?: number
    revisionAdjustment?: number
    taxDeduction: number
    recoveryDeduction: number
    otherDeductions?: number
    pensionStartDate?: string
    sanctionDate?: string
    sanctionAuthority?: string
  },
): PensionStructure {
  const date = input.pensionStartDate ?? record.service.retirementDate
  const ppo = record.service.ppoNumber
  const id = record.id

  const componentAmounts: Partial<Record<PensionComponentKind, number>> = {
    basic_pension: input.basicPension,
    dearness_relief: input.dearnessRelief,
    medical_allowance: input.medicalAllowance,
    special_allowance: input.specialAllowance,
    disability_allowance: input.disabilityAllowance ?? 0,
    family_pension_component: input.familyPensionComponent ?? 0,
    other_allowances: input.otherAllowances ?? 0,
    arrears: input.arrears,
    commutation_adjustment: input.commutationAdjustment ?? 0,
    revision_adjustment: input.revisionAdjustment ?? 0,
    income_tax: input.taxDeduction,
    recovery_deduction: input.recoveryDeduction,
    other_deductions: input.otherDeductions ?? 0,
  }

  const components = (Object.keys(componentAmounts) as PensionComponentKind[])
    .filter((kind) => (componentAmounts[kind] ?? 0) > 0 || kind === 'basic_pension' || kind === 'medical_allowance')
    .map((kind) => createPensionComponent(id, ppo, kind, componentAmounts[kind] ?? 0, date))

  return {
    master: {
      ...buildPensionMasterFromRecord(record),
      pensionStartDate: input.pensionStartDate ?? record.service.retirementDate,
      sanctionDate: input.sanctionDate ?? record.createdAt,
      sanctionAuthority: input.sanctionAuthority ?? 'Pension Sanctioning Authority',
    },
    components,
  }
}

export function getPensionStructure(record: PensionerRecord): PensionStructure {
  if (record.pensionStructure) return record.pensionStructure
  return buildStructureFromFlatPension(record)
}

export function syncRecordPensionFromStructure(record: PensionerRecord): PensionerRecord {
  const structure = getPensionStructure(record)
  return {
    ...record,
    pensionStructure: structure,
    pension: derivePensionDetails(structure.components),
  }
}

export function createHistoryEntry(
  component: PensionComponent,
  oldValue: number,
  newValue: number,
  input: Pick<UpdatePensionComponentInput, 'effectiveDate' | 'reason' | 'changedBy' | 'changedByRole'>,
): PensionComponentHistoryEntry {
  return {
    id: generateHistoryId(),
    pensionerId: component.pensionerId,
    ppoNumber: component.ppoNumber,
    componentId: component.id,
    componentName: component.name,
    componentKind: component.kind,
    oldValue,
    newValue,
    effectiveDate: input.effectiveDate,
    changedBy: input.changedBy,
    changedByRole: input.changedByRole,
    reason: input.reason,
    timestamp: new Date().toISOString(),
  }
}

export function buildPensionReportRows(records: PensionerRecord[]): PensionReportRow[] {
  return records.map((record) => {
    const structure = getPensionStructure(record)
    const calc = calculatePensionFromComponents(structure.components)
    const getAmount = (kind: PensionComponentKind) =>
      getActiveComponents(structure.components).find((c) => c.kind === kind)?.amount ?? 0

    return {
      pensionerId: record.id,
      ppoNumber: record.service.ppoNumber,
      pensionerName: getPensionerFullName(record.personal),
      pensionType: PENSION_TYPE_LABELS[record.service.pensionType],
      grossPension: calc.grossPension,
      netPension: calc.netPension,
      basicPension: getAmount('basic_pension'),
      dearnessRelief: getAmount('dearness_relief'),
      recoveryDeduction: getAmount('recovery_deduction'),
      taxDeduction: getAmount('income_tax'),
    }
  })
}

export function buildComponentReportRows(records: PensionerRecord[]): PensionComponentReportRow[] {
  return records.flatMap((record) => {
    const structure = getPensionStructure(record)
    return getActiveComponents(structure.components).map((c) => ({
      pensionerId: record.id,
      ppoNumber: record.service.ppoNumber,
      componentName: c.name,
      componentType: c.calcType,
      category: c.category,
      amount: c.amount,
      effectiveDate: c.effectiveDate,
      status: c.status,
    }))
  })
}

export function buildDrRevisionReportRows(
  history: PensionComponentHistoryEntry[],
): PensionComponentHistoryEntry[] {
  return history.filter((h) => h.componentKind === 'dearness_relief')
}

export function buildRecoveryDeductionReportRows(records: PensionerRecord[]): PensionComponentReportRow[] {
  return buildComponentReportRows(records).filter((r) => r.componentName === 'Recovery Deduction')
}

export function formatPensionCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export type { AddPensionComponentInput, UpdatePensionComponentInput }
