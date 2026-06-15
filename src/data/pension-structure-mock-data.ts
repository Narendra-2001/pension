import { recordSystemAuditLog } from '@/data/audit-mock-data'
import { getPensionersStore, resolvePensionerRef, updatePensioner } from '@/data/admin-mock-data'
import { findPensionerById, updatePensionerRecord } from '@/data/pensioner-mock-data'
import {
  calculatePensionFromComponents,
  createHistoryEntry,
  createPensionComponent,
  derivePensionDetails,
  generateComponentId,
  generateHistoryId,
  getActiveComponents,
  getPensionStructure,
  PENSION_COMPONENT_CATALOG,
  syncRecordPensionFromStructure,
} from '@/lib/pension-structure'
import type {
  AddPensionComponentInput,
  PensionComponent,
  PensionComponentHistoryEntry,
  PensionStructure,
  UpdatePensionComponentInput,
} from '@/types/pension-structure'
import type { PensionerRecord } from '@/types/pensioner'

let componentHistory: PensionComponentHistoryEntry[] = [
  {
    id: 'PCH-000001',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    componentId: 'PC-000002',
    componentName: 'Dearness Relief (DR)',
    componentKind: 'dearness_relief',
    oldValue: 11000,
    newValue: 11970,
    effectiveDate: '2026-01-01',
    changedBy: 'Pension Administrator',
    changedByRole: 'Pension Admin',
    reason: 'Government DR Revision — 8.8% increase effective January 2026',
    timestamp: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'PCH-000002',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    componentId: 'PC-000001',
    componentName: 'Basic Pension',
    componentKind: 'basic_pension',
    oldValue: 42000,
    newValue: 44100,
    effectiveDate: '2025-07-01',
    changedBy: 'Pension Administrator',
    changedByRole: 'Pension Admin',
    reason: 'Pay Commission revision applied to basic pension component',
    timestamp: '2025-07-01T09:30:00.000Z',
  },
  {
    id: 'PCH-000003',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    componentId: 'PC-000003',
    componentName: 'Medical Allowance',
    componentKind: 'medical_allowance',
    oldValue: 1000,
    newValue: 1250,
    effectiveDate: '2025-07-01',
    changedBy: 'Accounts Officer',
    changedByRole: 'Accounts',
    reason: 'Annual medical allowance revision as per departmental circular',
    timestamp: '2025-07-01T09:45:00.000Z',
  },
  {
    id: 'PCH-000004',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    componentId: 'PC-000005',
    componentName: 'Income Tax (TDS)',
    componentKind: 'income_tax',
    oldValue: 3200,
    newValue: 3850,
    effectiveDate: '2025-04-01',
    changedBy: 'Accounts Officer',
    changedByRole: 'Accounts',
    reason: 'Revised TDS deduction after updated gross pension calculation',
    timestamp: '2025-04-01T11:15:00.000Z',
  },
  {
    id: 'PCH-000005',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    componentId: 'PC-000002',
    componentName: 'Dearness Relief (DR)',
    componentKind: 'dearness_relief',
    oldValue: 10120,
    newValue: 11000,
    effectiveDate: '2025-01-01',
    changedBy: 'Pension Administrator',
    changedByRole: 'Pension Admin',
    reason: 'Government DR Revision — 8.7% increase effective January 2025',
    timestamp: '2025-01-01T10:00:00.000Z',
  },
]

function nowIso() {
  return new Date().toISOString()
}

function syncPensionerStores(record: PensionerRecord) {
  const synced = syncRecordPensionFromStructure(record)
  updatePensioner(synced.id, synced)
  const portalRecord = findPensionerById(synced.id)
  if (portalRecord) {
    updatePensionerRecord(synced)
  }
  return synced
}

function getRecordOrThrow(ref: string): PensionerRecord {
  const record = resolvePensionerRef(ref)
  if (record) return record
  throw new Error('Pensioner not found')
}

export function getPensionStructureForPensioner(pensionerId: string): PensionStructure | null {
  try {
    const record = getRecordOrThrow(pensionerId)
    return getPensionStructure(record)
  } catch {
    return null
  }
}

export function getPensionComponentHistory(pensionerId?: string): PensionComponentHistoryEntry[] {
  const sorted = [...componentHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
  if (!pensionerId) return sorted
  const record = resolvePensionerRef(pensionerId)
  const resolvedId = record?.id ?? pensionerId
  return sorted.filter((h) => h.pensionerId === resolvedId)
}

export function savePensionStructure(
  pensionerId: string,
  structure: PensionStructure,
  changedBy = 'Pension Administrator',
  changedByRole = 'Pension Admin',
): PensionerRecord {
  const record = getRecordOrThrow(pensionerId)
  const synced = syncPensionerStores({ ...record, pensionStructure: structure })

  recordSystemAuditLog({
    module: 'pensioners',
    action: 'record_updated',
    entityType: 'pension_structure',
    entityId: pensionerId,
    entityLabel: `${synced.service.ppoNumber} — Pension Structure`,
    newValue: `Gross ${derivePensionDetails(structure.components).grossPension}`,
    user: changedBy,
    userRole: changedByRole,
    remarks: 'Pension structure saved',
  })

  return synced
}

export function updatePensionComponent(input: UpdatePensionComponentInput): {
  record: PensionerRecord
  history: PensionComponentHistoryEntry
} {
  const record = getRecordOrThrow(input.pensionerId)
  const structure = getPensionStructure(record)
  const component = structure.components.find((c) => c.id === input.componentId)
  if (!component) throw new Error('Pension component not found')

  const oldValue = component.amount
  const updatedComponent: PensionComponent = {
    ...component,
    amount: input.amount,
    effectiveDate: input.effectiveDate,
    updatedAt: new Date().toISOString().split('T')[0],
  }

  const updatedStructure: PensionStructure = {
    ...structure,
    components: structure.components.map((c) =>
      c.id === input.componentId ? updatedComponent : c,
    ),
  }

  const history = createHistoryEntry(updatedComponent, oldValue, input.amount, input)
  history.id = generateHistoryId()
  componentHistory = [history, ...componentHistory]

  const synced = syncPensionerStores({ ...record, pensionStructure: updatedStructure })

  recordSystemAuditLog({
    module: 'pensioners',
    action: 'record_updated',
    entityType: 'pension_component',
    entityId: input.componentId,
    entityLabel: `${component.ppoNumber} — ${component.name}`,
    oldValue: String(oldValue),
    newValue: String(input.amount),
    user: input.changedBy,
    userRole: input.changedByRole,
    remarks: input.reason,
  })

  return { record: synced, history }
}

export function addPensionComponent(input: AddPensionComponentInput): {
  record: PensionerRecord
  component: PensionComponent
  history: PensionComponentHistoryEntry
} {
  const record = getRecordOrThrow(input.pensionerId)
  const structure = getPensionStructure(record)
  const catalog = PENSION_COMPONENT_CATALOG[input.kind]

  const existing = structure.components.find(
    (c) => c.kind === input.kind && c.status === 'active',
  )
  if (existing) {
    const result = updatePensionComponent({
      pensionerId: input.pensionerId,
      componentId: existing.id,
      amount: input.amount,
      effectiveDate: input.effectiveDate,
      reason: input.reason,
      changedBy: input.changedBy,
      changedByRole: input.changedByRole,
    })
    return { record: result.record, component: existing, history: result.history }
  }

  const component = createPensionComponent(
    input.pensionerId,
    record.service.ppoNumber,
    input.kind,
    input.amount,
    input.effectiveDate,
  )
  component.id = generateComponentId()

  const updatedStructure: PensionStructure = {
    ...structure,
    components: [...structure.components, component],
  }

  const history: PensionComponentHistoryEntry = {
    id: generateHistoryId(),
    pensionerId: input.pensionerId,
    ppoNumber: record.service.ppoNumber,
    componentId: component.id,
    componentName: catalog.name,
    componentKind: input.kind,
    oldValue: 0,
    newValue: input.amount,
    effectiveDate: input.effectiveDate,
    changedBy: input.changedBy,
    changedByRole: input.changedByRole,
    reason: input.reason,
    timestamp: nowIso(),
  }
  componentHistory = [history, ...componentHistory]

  const synced = syncPensionerStores({ ...record, pensionStructure: updatedStructure })

  recordSystemAuditLog({
    module: 'pensioners',
    action: 'record_created',
    entityType: 'pension_component',
    entityId: component.id,
    entityLabel: `${component.ppoNumber} — ${component.name}`,
    newValue: String(input.amount),
    user: input.changedBy,
    userRole: input.changedByRole,
    remarks: input.reason,
  })

  return { record: synced, component, history }
}

export function syncRecoveryDeduction(
  pensionerId: string,
  monthlyAmount: number,
  reason: string,
  changedBy = 'System',
  changedByRole = 'Recovery Module',
): PensionerRecord | null {
  const record = getPensionersStore().find((p) => p.id === pensionerId)
  if (!record) return null

  const structure = getPensionStructure(record)
  const recoveryComponent = structure.components.find(
    (c) => c.kind === 'recovery_deduction' && c.status === 'active',
  )

  if (recoveryComponent) {
    updatePensionComponent({
      pensionerId,
      componentId: recoveryComponent.id,
      amount: monthlyAmount,
      effectiveDate: new Date().toISOString().split('T')[0],
      reason,
      changedBy,
      changedByRole,
    })
  } else {
    addPensionComponent({
      pensionerId,
      kind: 'recovery_deduction',
      amount: monthlyAmount,
      effectiveDate: new Date().toISOString().split('T')[0],
      reason,
      changedBy,
      changedByRole,
    })
  }

  return getPensionersStore().find((p) => p.id === pensionerId) ?? null
}

export function getPensionCalculationPreview(pensionerId: string) {
  const structure = getPensionStructureForPensioner(pensionerId)
  if (!structure) return null
  return calculatePensionFromComponents(structure.components)
}

export function getAllPensionStructures(): PensionStructure[] {
  return getPensionersStore().map((r) => getPensionStructure(r))
}

export { getActiveComponents, derivePensionDetails }
