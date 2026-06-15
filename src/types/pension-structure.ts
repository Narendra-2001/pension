import type { PensionType } from '@/types/pensioner'

export type PensionComponentKind =
  | 'basic_pension'
  | 'dearness_relief'
  | 'medical_allowance'
  | 'special_allowance'
  | 'disability_allowance'
  | 'family_pension_component'
  | 'other_allowances'
  | 'arrears'
  | 'commutation_adjustment'
  | 'revision_adjustment'
  | 'income_tax'
  | 'recovery_deduction'
  | 'other_deductions'

export type PensionComponentCategory = 'core' | 'allowance' | 'adjustment' | 'deduction'

export type PensionComponentCalcType = 'fixed' | 'variable' | 'deduction'

export type PensionComponentStatus = 'active' | 'inactive' | 'superseded'

export type PensionMasterStatus =
  | 'active'
  | 'suspended'
  | 'deceased'
  | 'pending_activation'
  | 'draft'

export interface PensionMasterInfo {
  ppoNumber: string
  pensionType: PensionType
  pensionStartDate: string
  sanctionDate: string
  retirementDate: string
  lastPayDrawn: number
  sanctionAuthority: string
  pensionStatus: PensionMasterStatus
}

export interface PensionComponent {
  id: string
  pensionerId: string
  ppoNumber: string
  name: string
  kind: PensionComponentKind
  category: PensionComponentCategory
  calcType: PensionComponentCalcType
  amount: number
  effectiveDate: string
  status: PensionComponentStatus
  createdAt: string
  updatedAt: string
}

export interface PensionComponentHistoryEntry {
  id: string
  pensionerId: string
  ppoNumber: string
  componentId: string
  componentName: string
  componentKind: PensionComponentKind
  oldValue: number
  newValue: number
  effectiveDate: string
  changedBy: string
  changedByRole: string
  reason: string
  timestamp: string
}

export interface PensionStructure {
  master: PensionMasterInfo
  components: PensionComponent[]
}

export interface PensionCalculationResult {
  grossPension: number
  netPension: number
  totalDeductions: number
  breakdown: {
    kind: PensionComponentKind
    name: string
    amount: number
    category: PensionComponentCategory
    calcType: PensionComponentCalcType
  }[]
}

export interface UpdatePensionComponentInput {
  pensionerId: string
  componentId: string
  amount: number
  effectiveDate: string
  reason: string
  changedBy: string
  changedByRole: string
}

export interface AddPensionComponentInput {
  pensionerId: string
  kind: PensionComponentKind
  amount: number
  effectiveDate: string
  reason: string
  changedBy: string
  changedByRole: string
}

export interface PensionReportRow {
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  pensionType: string
  grossPension: number
  netPension: number
  basicPension: number
  dearnessRelief: number
  recoveryDeduction: number
  taxDeduction: number
}

export interface PensionComponentReportRow {
  pensionerId: string
  ppoNumber: string
  componentName: string
  componentType: PensionComponentCalcType
  category: PensionComponentCategory
  amount: number
  effectiveDate: string
  status: PensionComponentStatus
}
