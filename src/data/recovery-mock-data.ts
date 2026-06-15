import { getPensionersStore } from '@/data/admin-mock-data'
import { syncRecoveryDeduction } from '@/data/pension-structure-mock-data'
import {
  addPensionerNotification,
  findPensionerById,
} from '@/data/pensioner-mock-data'
import { calculateRecoveryBreakdown, PAYMENT_MODE_LABELS } from '@/lib/recovery'
import { getPensionerFullName } from '@/types/pensioner'
import type {
  CalculationBreakdownRow,
  ConfigureInstallmentsInput,
  CreateRecoveryCaseInput,
  ExcessCase,
  RecoveryApprovalAction,
  RecoveryAuditEntry,
  RecoveryCase,
  RecoveryDashboardStats,
  RecoveryInstallment,
  RecoveryPayment,
  RecoveryTimelineEvent,
  RecordPaymentInput,
  MonthlyRecoveryChartItem,
  OutstandingRecoveryChartItem,
  RecoveryCasesByDepartmentItem,
  RecoveryCollectionTrendItem,
  RecoveryFinancialOverview,
  RecoveryStatusChartItem,
} from '@/types/recovery'

let recoveryCounter = 9
let paymentCounter = 25
let auditCounter = 30

function today() {
  return new Date().toISOString().split('T')[0]
}

function nowIso() {
  return new Date().toISOString()
}

function createTimelineEvent(
  status: string,
  title: string,
  description?: string,
  actor?: string,
): RecoveryTimelineEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status,
    title,
    description,
    actor,
    timestamp: nowIso(),
  }
}

function createAuditEntry(
  partial: Omit<RecoveryAuditEntry, 'id' | 'timestamp'>,
): RecoveryAuditEntry {
  return {
    ...partial,
    id: `AUD-REC-${String(auditCounter++).padStart(4, '0')}`,
    timestamp: nowIso(),
  }
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function buildInstallmentsFromBreakdown(
  caseId: string,
  rows: CalculationBreakdownRow[],
  payments: RecoveryPayment[],
): RecoveryInstallment[] {
  return rows.map((row) => {
    const payment = payments.find((p) => p.installmentNumber === row.period)
    return {
      id: `INST-${caseId}-${row.period}`,
      installmentNumber: row.period,
      dueDate: row.dueDate,
      installmentAmount: row.installmentAmount,
      recoveredAmount: row.recoveredAmount,
      balance: row.closingBalance,
      status: row.status,
      paidDate: payment?.paymentDate,
      paymentReference: payment?.paymentReference,
    }
  })
}

function buildCalculation(
  totalExcess: number,
  arrearAdjustment: number,
  installmentCount: number,
  startDate: string,
  recoveredAmount: number,
  frequency: 'monthly' | 'quarterly' = 'monthly',
): RecoveryCase['calculation'] {
  const remainingAmount = Math.max(0, totalExcess - arrearAdjustment)
  const installmentAmount =
    installmentCount > 0 ? Math.ceil(remainingAmount / installmentCount) : remainingAmount
  const outstandingBalance = Math.max(0, remainingAmount - recoveredAmount)
  const monthsPerInstallment = frequency === 'monthly' ? 1 : 3
  const recoveryPeriodMonths = installmentCount * monthsPerInstallment

  return {
    totalExcessAmount: totalExcess,
    arrearAdjustment,
    remainingAmount,
    installmentCount,
    installmentAmount,
    recoveredAmount,
    outstandingBalance,
    recoveryPeriodMonths,
    expectedCompletionDate:
      installmentCount > 0 ? addMonths(startDate, recoveryPeriodMonths) : undefined,
  }
}

const excessCases: ExcessCase[] = [
  {
    id: 'EXC-2026-0001',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Rajesh Kumar Sharma',
    pensionType: 'Superannuation',
    department: 'Finance Department',
    excessAmount: 60000,
    identifiedDate: '2025-11-15',
    status: 'approved',
    remarks: 'Pay revision excess credited in Nov 2025 disbursement cycle.',
  },
  {
    id: 'EXC-2026-0002',
    pensionerId: 'PEN-DEMO-002',
    ppoNumber: 'PPO789012',
    pensionerName: 'Sunita Devi',
    pensionType: 'Family Pension',
    department: 'Education Department',
    excessAmount: 45000,
    identifiedDate: '2025-12-01',
    status: 'approved',
    remarks: 'Duplicate arrear payment detected during reconciliation.',
  },
  {
    id: 'EXC-2026-0003',
    pensionerId: 'PEN-00003',
    ppoNumber: 'PPO100003',
    pensionerName: 'Ramesh Iyer',
    pensionType: 'Superannuation',
    department: 'Revenue Department',
    excessAmount: 32000,
    identifiedDate: '2026-01-10',
    status: 'approved',
  },
  {
    id: 'EXC-2026-0004',
    pensionerId: 'PEN-00004',
    ppoNumber: 'PPO100004',
    pensionerName: 'Lakshmi Nair',
    pensionType: 'Voluntary Retirement',
    department: 'Health Department',
    excessAmount: 18500,
    identifiedDate: '2026-02-05',
    status: 'approved',
  },
  {
    id: 'EXC-2026-0005',
    pensionerId: 'PEN-00005',
    ppoNumber: 'PPO100005',
    pensionerName: 'Mohammed Ali',
    pensionType: 'Superannuation',
    department: 'Transport Department',
    excessAmount: 72000,
    identifiedDate: '2026-03-12',
    status: 'approved',
  },
  {
    id: 'EXC-2026-0006',
    pensionerId: 'PEN-00007',
    ppoNumber: 'PPO100007',
    pensionerName: 'Anita Patel',
    pensionType: 'Family Pension',
    department: 'Social Welfare',
    excessAmount: 24000,
    identifiedDate: '2026-04-20',
    status: 'recovery_initiated',
    remarks: 'Recovery case already created.',
  },
]

function buildSeedCases(): RecoveryCase[] {
  const pensioners = getPensionersStore()

  const case1Payments: RecoveryPayment[] = Array.from({ length: 8 }, (_, i) => ({
    id: `PAY-REC-000${i + 1}`,
    recoveryCaseId: 'REC-2026-0001',
    installmentId: `INST-REC-2026-0001-${i + 1}`,
    installmentNumber: i + 1,
    paymentDate: addMonths('2025-07-01', i),
    paidAmount: 5000,
    paymentReference: `DD-2025-${String(i + 7).padStart(2, '0')}-001`,
    paymentMode: 'pension_deduction',
    remarks: 'Auto-deducted from monthly pension',
    recordedBy: 'System',
    recordedAt: addMonths('2025-07-01', i) + 'T10:00:00',
  }))

  const case1Breakdown = calculateRecoveryBreakdown(
    60000,
    10000,
    10,
    '2025-07-01',
    'monthly',
    case1Payments.map((p) => ({ period: p.installmentNumber!, amount: p.paidAmount })),
  )

  const case1: RecoveryCase = {
    id: 'REC-2026-0001',
    excessCaseId: 'EXC-2026-0001',
    pensionerId: 'PEN-DEMO-001',
    ppoNumber: 'PPO123456',
    pensionerName: 'Rajesh Kumar Sharma',
    pensionType: 'Superannuation',
    department: 'Finance Department',
    recoveryReason: 'pay_revision_adjustment',
    recoveryType: 'installment_recovery',
    totalExcessAmount: 60000,
    arrearAdjustment: 10000,
    recoveryStartDate: '2025-07-01',
    approvalStatus: 'active_recovery',
    status: 'active_recovery',
    remarks: 'Standard 10-month installment plan after arrear adjustment.',
    documents: [{ name: 'Excess Calculation Sheet', fileName: 'excess_calc_exc_0001.pdf' }],
    createdBy: 'Rajesh Kumar',
    createdAt: '2025-06-20',
    updatedAt: today(),
    approvedBy: 'Rajesh Kumar',
    approvedAt: '2025-06-25',
    installmentConfig: {
      installmentCount: 10,
      installmentAmount: 5000,
      recoveryStartDate: '2025-07-01',
      paymentMode: 'pension_deduction',
      recoveryFrequency: 'monthly',
      autoGenerateSchedule: true,
    },
    calculation: buildCalculation(60000, 10000, 10, '2025-07-01', 40000),
    installments: buildInstallmentsFromBreakdown('REC-2026-0001', case1Breakdown.rows, case1Payments),
    payments: case1Payments,
    timeline: [
      createTimelineEvent('draft', 'Case Created', 'Recovery case initiated from approved excess case', 'Rajesh Kumar'),
      createTimelineEvent('pending_approval', 'Submitted for Approval', 'Case submitted to recovery workflow', 'Rajesh Kumar'),
      createTimelineEvent('approved', 'Case Approved', 'Recovery approved — active recovery begins', 'Rajesh Kumar'),
      createTimelineEvent('active_recovery', 'Installment Configured', '10 monthly installments of ₹5,000', 'Rajesh Kumar'),
      createTimelineEvent('active_recovery', 'Recovery Started', 'First pension deduction scheduled', 'System'),
      createTimelineEvent('active_recovery', 'Payment Received', '8 installments recovered via pension deduction', 'System'),
    ],
  }

  const case2: RecoveryCase = {
    id: 'REC-2026-0002',
    excessCaseId: 'EXC-2026-0002',
    pensionerId: 'PEN-DEMO-002',
    ppoNumber: 'PPO789012',
    pensionerName: 'Sunita Devi',
    pensionType: 'Family Pension',
    department: 'Education Department',
    recoveryReason: 'duplicate_disbursement',
    recoveryType: 'installment_recovery',
    totalExcessAmount: 45000,
    arrearAdjustment: 5000,
    recoveryStartDate: '2026-01-01',
    approvalStatus: 'pending_approval',
    status: 'pending_approval',
    remarks: 'Awaiting final approval before installment setup.',
    documents: [{ name: 'Duplicate Payment Report', fileName: 'dup_payment_exc_0002.pdf' }],
    createdBy: 'Rajesh Kumar',
    createdAt: '2025-12-15',
    updatedAt: '2025-12-15',
    calculation: buildCalculation(45000, 5000, 8, '2026-01-01', 0),
    installments: [],
    payments: [],
    timeline: [
      createTimelineEvent('draft', 'Case Created', 'Recovery case from excess EXC-2026-0002', 'Rajesh Kumar'),
      createTimelineEvent('pending_approval', 'Submitted for Approval', 'Pending recovery officer approval', 'Rajesh Kumar'),
    ],
  }

  const p3 = pensioners[2]
  const case3: RecoveryCase = {
    id: 'REC-2026-0003',
    excessCaseId: 'EXC-2026-0003',
    pensionerId: p3?.id ?? 'PEN-00003',
    ppoNumber: p3?.service.ppoNumber ?? 'PPO100003',
    pensionerName: p3 ? getPensionerFullName(p3.personal) : 'Ramesh Iyer',
    pensionType: p3?.service.pensionType.replace(/_/g, ' ') ?? 'Superannuation',
    department: 'Revenue Department',
    recoveryReason: 'excess_pension_credit',
    recoveryType: 'full_recovery',
    totalExcessAmount: 32000,
    arrearAdjustment: 0,
    recoveryStartDate: '2026-02-01',
    approvalStatus: 'recovery_completed',
    status: 'recovery_completed',
    remarks: 'Full recovery completed via single direct deposit.',
    documents: [{ name: 'Bank Credit Note', fileName: 'credit_note_exc_0003.pdf' }],
    createdBy: 'Rajesh Kumar',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-15',
    approvedBy: 'Rajesh Kumar',
    approvedAt: '2026-01-25',
    installmentConfig: {
      installmentCount: 1,
      installmentAmount: 32000,
      recoveryStartDate: '2026-02-01',
      paymentMode: 'direct_deposit',
      recoveryFrequency: 'monthly',
      autoGenerateSchedule: true,
    },
    calculation: buildCalculation(32000, 0, 1, '2026-02-01', 32000),
    installments: [
      {
        id: 'INST-REC-2026-0003-1',
        installmentNumber: 1,
        dueDate: '2026-02-01',
        installmentAmount: 32000,
        recoveredAmount: 32000,
        balance: 0,
        status: 'paid',
        paidDate: '2026-02-10',
        paymentReference: 'DD-2026-02-003',
      },
    ],
    payments: [
      {
        id: 'PAY-REC-0020',
        recoveryCaseId: 'REC-2026-0003',
        installmentId: 'INST-REC-2026-0003-1',
        installmentNumber: 1,
        paymentDate: '2026-02-10',
        paidAmount: 32000,
        paymentReference: 'DD-2026-02-003',
        paymentMode: 'direct_deposit',
        remarks: 'Full amount deposited by pensioner',
        recordedBy: 'Kavitha Reddy',
        recordedAt: '2026-02-10T14:30:00',
      },
    ],
    timeline: [
      createTimelineEvent('draft', 'Case Created', 'Full recovery case initiated', 'Rajesh Kumar'),
      createTimelineEvent('approved', 'Case Approved', 'Approved for full recovery', 'Rajesh Kumar'),
      createTimelineEvent('active_recovery', 'Recovery Started', 'Awaiting direct deposit', 'System'),
      createTimelineEvent('recovery_completed', 'Payment Received', 'Full ₹32,000 recovered', 'Kavitha Reddy'),
      createTimelineEvent('recovery_completed', 'Recovery Completed', 'Outstanding balance zero', 'System'),
    ],
  }

  const case4: RecoveryCase = {
    id: 'REC-2026-0004',
    excessCaseId: 'EXC-2026-0004',
    pensionerId: 'PEN-00004',
    ppoNumber: 'PPO100004',
    pensionerName: 'Lakshmi Nair',
    pensionType: 'Voluntary Retirement',
    department: 'Health Department',
    recoveryReason: 'arrear_overpayment',
    recoveryType: 'installment_recovery',
    totalExcessAmount: 18500,
    arrearAdjustment: 1500,
    recoveryStartDate: '2026-03-01',
    approvalStatus: 'active_recovery',
    status: 'active_recovery',
    remarks: 'Quarterly recovery plan.',
    documents: [],
    createdBy: 'Rajesh Kumar',
    createdAt: '2026-02-20',
    updatedAt: today(),
    approvedBy: 'Rajesh Kumar',
    approvedAt: '2026-02-25',
    installmentConfig: {
      installmentCount: 4,
      installmentAmount: 4250,
      recoveryStartDate: '2026-03-01',
      paymentMode: 'manual_payment',
      recoveryFrequency: 'quarterly',
      autoGenerateSchedule: true,
    },
    calculation: buildCalculation(18500, 1500, 4, '2026-03-01', 4250, 'quarterly'),
    installments: buildInstallmentsFromBreakdown(
      'REC-2026-0004',
      calculateRecoveryBreakdown(18500, 1500, 4, '2026-03-01', 'quarterly', [
        { period: 1, amount: 4250 },
      ]).rows,
      [
        {
          id: 'PAY-REC-0021',
          recoveryCaseId: 'REC-2026-0004',
          installmentNumber: 1,
          paymentDate: '2026-03-05',
          paidAmount: 4250,
          paymentReference: 'CHQ-884521',
          paymentMode: 'manual_payment',
          recordedBy: 'Kavitha Reddy',
          recordedAt: '2026-03-05T11:00:00',
        },
      ],
    ),
    payments: [
      {
        id: 'PAY-REC-0021',
        recoveryCaseId: 'REC-2026-0004',
        installmentNumber: 1,
        paymentDate: '2026-03-05',
        paidAmount: 4250,
        paymentReference: 'CHQ-884521',
        paymentMode: 'manual_payment',
        recordedBy: 'Kavitha Reddy',
        recordedAt: '2026-03-05T11:00:00',
      },
    ],
    timeline: [
      createTimelineEvent('draft', 'Case Created', 'Quarterly installment recovery', 'Rajesh Kumar'),
      createTimelineEvent('approved', 'Case Approved', 'Approved for quarterly recovery', 'Rajesh Kumar'),
      createTimelineEvent('active_recovery', 'Installment Configured', '4 quarterly installments', 'Rajesh Kumar'),
      createTimelineEvent('active_recovery', 'Payment Received', 'Q1 installment received', 'Kavitha Reddy'),
    ],
  }

  const case5: RecoveryCase = {
    id: 'REC-2026-0005',
    excessCaseId: 'EXC-2026-0005',
    pensionerId: 'PEN-00005',
    ppoNumber: 'PPO100005',
    pensionerName: 'Mohammed Ali',
    pensionType: 'Superannuation',
    department: 'Transport Department',
    recoveryReason: 'wrong_pension_type',
    recoveryType: 'installment_recovery',
    totalExcessAmount: 72000,
    arrearAdjustment: 12000,
    recoveryStartDate: '2026-04-01',
    approvalStatus: 'draft',
    status: 'draft',
    remarks: 'Draft — pending document upload.',
    documents: [],
    createdBy: 'Rajesh Kumar',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    calculation: buildCalculation(72000, 12000, 12, '2026-04-01', 0),
    installments: [],
    payments: [],
    timeline: [createTimelineEvent('draft', 'Case Created', 'Draft recovery case', 'Rajesh Kumar')],
  }

  const overdueBreakdown = calculateRecoveryBreakdown(24000, 0, 6, '2025-10-01', 'monthly', [
    { period: 1, amount: 4000 },
    { period: 2, amount: 4000 },
  ])

  const case6: RecoveryCase = {
    id: 'REC-2026-0006',
    excessCaseId: 'EXC-2026-0006',
    pensionerId: 'PEN-00007',
    ppoNumber: 'PPO100007',
    pensionerName: 'Anita Patel',
    pensionType: 'Family Pension',
    department: 'Social Welfare',
    recoveryReason: 'excess_pension_credit',
    recoveryType: 'installment_recovery',
    totalExcessAmount: 24000,
    arrearAdjustment: 0,
    recoveryStartDate: '2025-10-01',
    approvalStatus: 'active_recovery',
    status: 'active_recovery',
    remarks: 'Has overdue installments — notification sent.',
    documents: [{ name: 'Overdue Notice', fileName: 'overdue_notice.pdf' }],
    createdBy: 'Rajesh Kumar',
    createdAt: '2025-09-15',
    updatedAt: today(),
    approvedBy: 'Rajesh Kumar',
    approvedAt: '2025-09-20',
    installmentConfig: {
      installmentCount: 6,
      installmentAmount: 4000,
      recoveryStartDate: '2025-10-01',
      paymentMode: 'pension_deduction',
      recoveryFrequency: 'monthly',
      autoGenerateSchedule: true,
    },
    calculation: buildCalculation(24000, 0, 6, '2025-10-01', 8000),
    installments: buildInstallmentsFromBreakdown('REC-2026-0006', overdueBreakdown.rows, [
      {
        id: 'PAY-REC-0022',
        recoveryCaseId: 'REC-2026-0006',
        installmentNumber: 1,
        paymentDate: '2025-10-01',
        paidAmount: 4000,
        paymentReference: 'DD-2025-10-006',
        paymentMode: 'pension_deduction',
        recordedBy: 'System',
        recordedAt: '2025-10-01T10:00:00',
      },
      {
        id: 'PAY-REC-0023',
        recoveryCaseId: 'REC-2026-0006',
        installmentNumber: 2,
        paymentDate: '2025-11-01',
        paidAmount: 4000,
        paymentReference: 'DD-2025-11-006',
        paymentMode: 'pension_deduction',
        recordedBy: 'System',
        recordedAt: '2025-11-01T10:00:00',
      },
    ]),
    payments: [
      {
        id: 'PAY-REC-0022',
        recoveryCaseId: 'REC-2026-0006',
        installmentNumber: 1,
        paymentDate: '2025-10-01',
        paidAmount: 4000,
        paymentReference: 'DD-2025-10-006',
        paymentMode: 'pension_deduction',
        recordedBy: 'System',
        recordedAt: '2025-10-01T10:00:00',
      },
      {
        id: 'PAY-REC-0023',
        recoveryCaseId: 'REC-2026-0006',
        installmentNumber: 2,
        paymentDate: '2025-11-01',
        paidAmount: 4000,
        paymentReference: 'DD-2025-11-006',
        paymentMode: 'pension_deduction',
        recordedBy: 'System',
        recordedAt: '2025-11-01T10:00:00',
      },
    ],
    timeline: [
      createTimelineEvent('draft', 'Case Created', 'Recovery from excess credit', 'Rajesh Kumar'),
      createTimelineEvent('approved', 'Case Approved', 'Approved for monthly deduction', 'Rajesh Kumar'),
      createTimelineEvent('active_recovery', 'Installment Configured', '6 monthly installments', 'Rajesh Kumar'),
      createTimelineEvent('active_recovery', 'Installment Overdue', 'Installment #3 overdue — notification sent', 'System'),
    ],
  }

  const closedCase: RecoveryCase = {
    ...case3,
    id: 'REC-2025-0088',
    excessCaseId: 'EXC-2025-0099',
    status: 'closed',
    approvalStatus: 'closed',
    updatedAt: '2026-03-01',
    timeline: [
      ...case3.timeline,
      createTimelineEvent('closed', 'Case Closed', 'Recovery case archived after completion', 'Rajesh Kumar'),
    ],
  }

  return [case1, case2, case3, case4, case5, case6, closedCase]
}

let recoveryCases: RecoveryCase[] = buildSeedCases()
const auditLogs: RecoveryAuditEntry[] = []

function notifyPensioner(
  pensionerId: string,
  title: string,
  message: string,
  details?: string,
) {
  const record = findPensionerById(pensionerId)
  if (!record) return
  addPensionerNotification({
    type: 'recovery_notice',
    title,
    message,
    details,
    actionHref: '/pensioner/recovery',
    actionLabel: 'View Recovery Status',
  })
}

function notifyOfficers(title: string, message: string) {
  void title
  void message
}

function refreshCaseCalculation(recoveryCase: RecoveryCase): void {
  const recovered = recoveryCase.payments.reduce((sum, p) => sum + p.paidAmount, 0)
  const config = recoveryCase.installmentConfig
  const count = config?.installmentCount ?? (recoveryCase.recoveryType === 'full_recovery' ? 1 : 10)
  const frequency = config?.recoveryFrequency ?? 'monthly'

  recoveryCase.calculation = buildCalculation(
    recoveryCase.totalExcessAmount,
    recoveryCase.arrearAdjustment,
    count,
    recoveryCase.recoveryStartDate,
    recovered,
    frequency,
  )

  if (recoveryCase.installments.length > 0 || config) {
    const breakdown = calculateRecoveryBreakdown(
      recoveryCase.totalExcessAmount,
      recoveryCase.arrearAdjustment,
      count,
      recoveryCase.recoveryStartDate,
      frequency,
      recoveryCase.payments.map((p) => ({
        period: p.installmentNumber ?? 0,
        amount: p.paidAmount,
      })),
    )
    recoveryCase.installments = buildInstallmentsFromBreakdown(
      recoveryCase.id,
      breakdown.rows,
      recoveryCase.payments,
    )
  }

  if (recoveryCase.calculation.outstandingBalance <= 0 && recoveryCase.status === 'active_recovery') {
    recoveryCase.status = 'recovery_completed'
    recoveryCase.approvalStatus = 'recovery_completed'
    recoveryCase.timeline.push(
      createTimelineEvent('recovery_completed', 'Recovery Completed', 'Outstanding balance is zero', 'System'),
    )
    auditLogs.push(
      createAuditEntry({
        recoveryCaseId: recoveryCase.id,
        user: 'System',
        action: 'recovery_completed',
        oldValue: 'active_recovery',
        newValue: 'recovery_completed',
        remarks: 'Automatic completion — balance zero',
      }),
    )
    notifyPensioner(
      recoveryCase.pensionerId,
      'Recovery Completed',
      `Recovery case ${recoveryCase.id} has been completed.`,
      `Total recovered: ₹${recovered.toLocaleString('en-IN')}`,
    )
    notifyOfficers('Recovery Completed', `Case ${recoveryCase.id} completed`)
  }
}

export function getApprovedExcessCases(): ExcessCase[] {
  return excessCases.filter((e) => e.status === 'approved')
}

export function getExcessCaseById(id: string): ExcessCase | undefined {
  return excessCases.find((e) => e.id === id)
}

let excessCounter = 7

export function createExcessCaseFromDemise(input: {
  pensionerId: string
  ppoNumber: string
  pensionerName: string
  pensionType: string
  department: string
  excessAmount: number
  remarks?: string
}): ExcessCase {
  const id = `EXC-2026-${String(++excessCounter).padStart(4, '0')}`
  const excessCase: ExcessCase = {
    id,
    pensionerId: input.pensionerId,
    ppoNumber: input.ppoNumber,
    pensionerName: input.pensionerName,
    pensionType: input.pensionType,
    department: input.department,
    excessAmount: input.excessAmount,
    identifiedDate: today(),
    status: 'approved',
    remarks: input.remarks ?? 'Excess pension identified after demise approval',
  }
  excessCases.push(excessCase)
  return excessCase
}

export function getRecoveryCases(): RecoveryCase[] {
  return [...recoveryCases].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function getRecoveryCaseById(id: string): RecoveryCase | undefined {
  return recoveryCases.find((c) => c.id === id)
}

export function getRecoveryCasesByPensioner(pensionerId: string): RecoveryCase[] {
  return recoveryCases.filter((c) => c.pensionerId === pensionerId)
}

export function getActiveRecoveryForPensioner(pensionerId: string): RecoveryCase | undefined {
  return recoveryCases.find(
    (c) =>
      c.pensionerId === pensionerId &&
      (c.status === 'active_recovery' || c.status === 'approved'),
  )
}

export function getRecoveryAuditLogs(recoveryCaseId: string): RecoveryAuditEntry[] {
  return auditLogs.filter((a) => a.recoveryCaseId === recoveryCaseId)
}

export function getRecoveryDashboardStats(): RecoveryDashboardStats {
  const active = recoveryCases.filter((c) => c.status === 'active_recovery')
  const completed = recoveryCases.filter(
    (c) => c.status === 'recovery_completed' || c.status === 'closed',
  )
  const pending = recoveryCases.filter((c) => c.status === 'pending_approval')

  return {
    totalCases: recoveryCases.length,
    activeCases: active.length,
    completedCases: completed.length,
    pendingApprovals: pending.length,
    totalRecoverableAmount: recoveryCases.reduce(
      (sum, c) => sum + c.calculation.remainingAmount,
      0,
    ),
    outstandingAmount: recoveryCases.reduce(
      (sum, c) => sum + c.calculation.outstandingBalance,
      0,
    ),
  }
}

export function getRecoveryStatusChart(): RecoveryStatusChartItem[] {
  const counts = new Map<string, number>()
  for (const c of recoveryCases) {
    counts.set(c.status, (counts.get(c.status) ?? 0) + 1)
  }
  const labels: Record<string, string> = {
    draft: 'Draft',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    active_recovery: 'Active Recovery',
    recovery_completed: 'Completed',
    closed: 'Closed',
    cancelled: 'Cancelled',
  }
  return Array.from(counts.entries()).map(([status, count]) => ({
    status: status as RecoveryCase['status'],
    label: labels[status] ?? status,
    count,
  }))
}

export function getMonthlyRecoveryCollection(): MonthlyRecoveryChartItem[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const year = 2026
  return months.map((month, i) => {
    const collected = recoveryCases
      .flatMap((c) => c.payments)
      .filter((p) => {
        const d = new Date(p.paymentDate)
        return d.getFullYear() === year && d.getMonth() === i
      })
      .reduce((sum, p) => sum + p.paidAmount, 0)
    return { month: `${month} ${year}`, collected }
  })
}

export function getOutstandingByDepartment(): OutstandingRecoveryChartItem[] {
  const map = new Map<string, number>()
  for (const c of recoveryCases) {
    if (c.calculation.outstandingBalance > 0) {
      map.set(c.department, (map.get(c.department) ?? 0) + c.calculation.outstandingBalance)
    }
  }
  return Array.from(map.entries())
    .map(([department, outstanding]) => ({
      department: department.replace(/ Department$/, ''),
      outstanding,
    }))
    .sort((a, b) => b.outstanding - a.outstanding)
}

export function getRecoveryFinancialOverview(): RecoveryFinancialOverview {
  const totalRecoverableAmount = recoveryCases.reduce(
    (sum, c) => sum + c.calculation.remainingAmount,
    0,
  )
  const totalRecoveredAmount = recoveryCases.reduce(
    (sum, c) => sum + c.calculation.recoveredAmount,
    0,
  )
  const outstandingAmount = recoveryCases.reduce(
    (sum, c) => sum + c.calculation.outstandingBalance,
    0,
  )
  const recoveryRatePercent =
    totalRecoverableAmount > 0
      ? Math.round((totalRecoveredAmount / totalRecoverableAmount) * 100)
      : 0

  return {
    totalRecoverableAmount,
    totalRecoveredAmount,
    outstandingAmount,
    recoveryRatePercent,
  }
}

export function getRecoveryCollectionTrend(): RecoveryCollectionTrendItem[] {
  const monthly = getMonthlyRecoveryCollection()
  let cumulative = 0

  return monthly.map((item) => {
    cumulative += item.collected
    return {
      month: item.month.split(' ')[0] ?? item.month,
      collected: item.collected,
      cumulative,
    }
  })
}

export function getRecoveryCasesByDepartment(): RecoveryCasesByDepartmentItem[] {
  const map = new Map<string, { active: number; completed: number; total: number }>()

  for (const c of recoveryCases) {
    const department = c.department.replace(/ Department$/, '')
    const entry = map.get(department) ?? { active: 0, completed: 0, total: 0 }
    entry.total += 1
    if (c.status === 'active_recovery' || c.status === 'approved') entry.active += 1
    if (c.status === 'recovery_completed' || c.status === 'closed') entry.completed += 1
    map.set(department, entry)
  }

  return Array.from(map.entries())
    .map(([department, counts]) => ({ department, ...counts }))
    .sort((a, b) => b.total - a.total)
}

export function getCalculationBreakdown(caseId: string): CalculationBreakdownRow[] {
  const recoveryCase = getRecoveryCaseById(caseId)
  if (!recoveryCase) return []
  const count = recoveryCase.installmentConfig?.installmentCount ?? recoveryCase.calculation.installmentCount
  const frequency = recoveryCase.installmentConfig?.recoveryFrequency ?? 'monthly'
  const { rows } = calculateRecoveryBreakdown(
    recoveryCase.totalExcessAmount,
    recoveryCase.arrearAdjustment,
    count,
    recoveryCase.recoveryStartDate,
    frequency,
    recoveryCase.payments.map((p) => ({
      period: p.installmentNumber ?? 0,
      amount: p.paidAmount,
    })),
  )
  return rows
}

export function createRecoveryCase(input: CreateRecoveryCaseInput): RecoveryCase {
  const excess = getExcessCaseById(input.excessCaseId)
  if (!excess) throw new Error('Excess case not found')
  if (excess.status !== 'approved') throw new Error('Excess case must be approved')

  const arrearAdjustment = input.arrearAdjustment ?? 0
  if (arrearAdjustment > excess.excessAmount) {
    throw new Error('Arrear adjustment cannot exceed excess amount')
  }

  const id = `REC-2026-${String(recoveryCounter++).padStart(4, '0')}`
  const installmentCount = input.recoveryType === 'full_recovery' ? 1 : 10

  const recoveryCase: RecoveryCase = {
    id,
    excessCaseId: excess.id,
    pensionerId: excess.pensionerId,
    ppoNumber: excess.ppoNumber,
    pensionerName: excess.pensionerName,
    pensionType: excess.pensionType,
    department: excess.department,
    recoveryReason: input.recoveryReason,
    recoveryType: input.recoveryType,
    totalExcessAmount: excess.excessAmount,
    arrearAdjustment,
    recoveryStartDate: input.recoveryStartDate,
    approvalStatus: 'draft',
    status: 'draft',
    remarks: input.remarks,
    documents: input.documents,
    createdBy: input.createdBy ?? 'Recovery Officer',
    createdAt: today(),
    updatedAt: today(),
    calculation: buildCalculation(excess.excessAmount, arrearAdjustment, installmentCount, input.recoveryStartDate, 0),
    installments: [],
    payments: [],
    timeline: [
      createTimelineEvent('draft', 'Case Created', `Linked to excess case ${excess.id}`, input.createdBy),
    ],
  }

  recoveryCases = [recoveryCase, ...recoveryCases]
  excess.status = 'recovery_initiated'

  auditLogs.push(
    createAuditEntry({
      recoveryCaseId: id,
      user: input.createdBy ?? 'Recovery Officer',
      action: 'case_created',
      newValue: 'draft',
      remarks: input.remarks,
    }),
  )

  notifyOfficers('Recovery Case Created', `New case ${id} for ${excess.pensionerName}`)
  return recoveryCase
}

export function submitRecoveryCase(caseId: string, submittedBy?: string): RecoveryCase {
  const recoveryCase = getRecoveryCaseById(caseId)
  if (!recoveryCase) throw new Error('Recovery case not found')
  if (recoveryCase.status !== 'draft') throw new Error('Only draft cases can be submitted')

  const oldStatus = recoveryCase.status
  recoveryCase.status = 'pending_approval'
  recoveryCase.approvalStatus = 'pending_approval'
  recoveryCase.updatedAt = today()
  recoveryCase.timeline.push(
    createTimelineEvent('pending_approval', 'Submitted for Approval', 'Awaiting recovery officer approval', submittedBy),
  )

  auditLogs.push(
    createAuditEntry({
      recoveryCaseId: caseId,
      user: submittedBy ?? 'Recovery Officer',
      action: 'case_submitted',
      oldValue: oldStatus,
      newValue: 'pending_approval',
    }),
  )

  notifyOfficers('Recovery Pending Approval', `Case ${caseId} submitted for approval`)
  return recoveryCase
}

export function processRecoveryApproval(
  caseId: string,
  action: RecoveryApprovalAction,
  remarks: string,
  approverName?: string,
): RecoveryCase {
  const recoveryCase = getRecoveryCaseById(caseId)
  if (!recoveryCase) throw new Error('Recovery case not found')
  if (recoveryCase.status !== 'pending_approval') {
    throw new Error('Case is not pending approval')
  }

  const approver = approverName ?? 'Recovery Officer'

  if (action === 'reject') {
    recoveryCase.status = 'cancelled'
    recoveryCase.approvalStatus = 'cancelled'
    recoveryCase.rejectionReason = remarks
    recoveryCase.updatedAt = today()
    recoveryCase.timeline.push(
      createTimelineEvent('cancelled', 'Case Rejected', remarks, approver),
    )
    auditLogs.push(
      createAuditEntry({
        recoveryCaseId: caseId,
        user: approver,
        action: 'case_rejected',
        oldValue: 'pending_approval',
        newValue: 'cancelled',
        remarks,
      }),
    )
    return recoveryCase
  }

  recoveryCase.status = 'active_recovery'
  recoveryCase.approvalStatus = 'active_recovery'
  recoveryCase.approvedBy = approver
  recoveryCase.approvedAt = today()
  recoveryCase.updatedAt = today()
  recoveryCase.timeline.push(
    createTimelineEvent('approved', 'Case Approved', remarks, approver),
    createTimelineEvent('active_recovery', 'Recovery Started', 'Active recovery phase begins', 'System'),
  )

  auditLogs.push(
    createAuditEntry({
      recoveryCaseId: caseId,
      user: approver,
      action: 'case_approved',
      oldValue: 'pending_approval',
      newValue: 'active_recovery',
      remarks,
    }),
  )

  notifyPensioner(
    recoveryCase.pensionerId,
    'Recovery Case Approved',
    `Your recovery case ${caseId} has been approved.`,
    remarks,
  )
  notifyOfficers('Recovery Approved', `Case ${caseId} approved`)

  return recoveryCase
}

export function configureInstallments(input: ConfigureInstallmentsInput): RecoveryCase {
  const recoveryCase = getRecoveryCaseById(input.recoveryCaseId)
  if (!recoveryCase) throw new Error('Recovery case not found')
  if (!['approved', 'active_recovery'].includes(recoveryCase.status)) {
    throw new Error('Installments can only be configured for approved or active cases')
  }

  const { remainingAmount, installmentAmount, rows } = calculateRecoveryBreakdown(
    recoveryCase.totalExcessAmount,
    recoveryCase.arrearAdjustment,
    input.installmentCount,
    input.recoveryStartDate,
    input.recoveryFrequency,
  )

  recoveryCase.installmentConfig = {
    installmentCount: input.installmentCount,
    installmentAmount,
    recoveryStartDate: input.recoveryStartDate,
    paymentMode: input.paymentMode,
    recoveryFrequency: input.recoveryFrequency,
    autoGenerateSchedule: input.autoGenerateSchedule ?? true,
  }
  recoveryCase.recoveryStartDate = input.recoveryStartDate
  recoveryCase.installments = rows.map((row) => ({
    id: `INST-${recoveryCase.id}-${row.period}`,
    installmentNumber: row.period,
    dueDate: row.dueDate,
    installmentAmount: row.installmentAmount,
    recoveredAmount: 0,
    balance: row.closingBalance,
    status: 'pending' as const,
  }))
  recoveryCase.calculation = {
    ...recoveryCase.calculation,
    remainingAmount,
    installmentCount: input.installmentCount,
    installmentAmount,
    recoveryPeriodMonths:
      input.recoveryFrequency === 'monthly'
        ? input.installmentCount
        : input.installmentCount * 3,
    expectedCompletionDate: addMonths(
      input.recoveryStartDate,
      input.recoveryFrequency === 'monthly' ? input.installmentCount : input.installmentCount * 3,
    ),
  }
  recoveryCase.status = 'active_recovery'
  recoveryCase.approvalStatus = 'active_recovery'
  recoveryCase.updatedAt = today()
  recoveryCase.timeline.push(
    createTimelineEvent(
      'active_recovery',
      'Installment Configured',
      `${input.installmentCount} ${input.recoveryFrequency} installments of ₹${installmentAmount.toLocaleString('en-IN')}`,
      'Recovery Officer',
    ),
  )

  auditLogs.push(
    createAuditEntry({
      recoveryCaseId: recoveryCase.id,
      user: 'Recovery Officer',
      action: 'installment_configured',
      newValue: `${input.installmentCount} installments`,
      remarks: `${PAYMENT_MODE_LABELS[input.paymentMode]} — ${input.recoveryFrequency}`,
    }),
  )

  notifyPensioner(
    recoveryCase.pensionerId,
    'Installment Schedule Generated',
    `${input.installmentCount} recovery installments configured for case ${recoveryCase.id}.`,
  )

  if (input.paymentMode === 'pension_deduction') {
    syncRecoveryDeduction(
      recoveryCase.pensionerId,
      installmentAmount,
      `Recovery case ${recoveryCase.id} — monthly pension deduction of ₹${installmentAmount.toLocaleString('en-IN')}`,
      'Recovery Officer',
      'Recovery Module',
    )
  }

  return recoveryCase
}

export function recordRecoveryPayment(input: RecordPaymentInput): RecoveryCase {
  const recoveryCase = getRecoveryCaseById(input.recoveryCaseId)
  if (!recoveryCase) throw new Error('Recovery case not found')
  if (!['active_recovery', 'approved'].includes(recoveryCase.status)) {
    throw new Error('Payments can only be recorded for active recovery cases')
  }

  const payment: RecoveryPayment = {
    id: `PAY-REC-${String(paymentCounter++).padStart(4, '0')}`,
    recoveryCaseId: input.recoveryCaseId,
    installmentId: input.installmentId,
    installmentNumber: input.installmentId
      ? recoveryCase.installments.find((i) => i.id === input.installmentId)?.installmentNumber
      : undefined,
    paymentDate: input.paymentDate,
    paidAmount: input.paidAmount,
    paymentReference: input.paymentReference,
    paymentMode: input.paymentMode,
    remarks: input.remarks,
    recordedBy: input.recordedBy ?? 'Accounts Officer',
    recordedAt: nowIso(),
  }

  recoveryCase.payments.push(payment)
  recoveryCase.updatedAt = today()
  recoveryCase.timeline.push(
    createTimelineEvent(
      'active_recovery',
      'Payment Received',
      `₹${input.paidAmount.toLocaleString('en-IN')} — Ref: ${input.paymentReference}`,
      input.recordedBy,
    ),
  )

  auditLogs.push(
    createAuditEntry({
      recoveryCaseId: recoveryCase.id,
      user: input.recordedBy ?? 'Accounts Officer',
      action: 'payment_recorded',
      newValue: `₹${input.paidAmount}`,
      remarks: input.paymentReference,
    }),
  )

  refreshCaseCalculation(recoveryCase)

  notifyPensioner(
    recoveryCase.pensionerId,
    'Recovery Payment Received',
    `₹${input.paidAmount.toLocaleString('en-IN')} credited towards recovery case ${recoveryCase.id}.`,
    `Reference: ${input.paymentReference}. Outstanding: ₹${recoveryCase.calculation.outstandingBalance.toLocaleString('en-IN')}`,
  )

  return recoveryCase
}

export function closeRecoveryCase(caseId: string, closedBy?: string): RecoveryCase {
  const recoveryCase = getRecoveryCaseById(caseId)
  if (!recoveryCase) throw new Error('Recovery case not found')
  if (recoveryCase.status !== 'recovery_completed') {
    throw new Error('Only completed cases can be closed')
  }

  recoveryCase.status = 'closed'
  recoveryCase.approvalStatus = 'closed'
  recoveryCase.updatedAt = today()
  recoveryCase.timeline.push(
    createTimelineEvent('closed', 'Case Closed', 'Recovery case archived', closedBy),
  )

  auditLogs.push(
    createAuditEntry({
      recoveryCaseId: caseId,
      user: closedBy ?? 'Recovery Officer',
      action: 'case_closed',
      oldValue: 'recovery_completed',
      newValue: 'closed',
    }),
  )

  return recoveryCase
}

export function applyAutomaticPensionDeduction(caseId: string): RecoveryCase | null {
  const recoveryCase = getRecoveryCaseById(caseId)
  if (!recoveryCase) return null
  if (recoveryCase.installmentConfig?.paymentMode !== 'pension_deduction') return null
  if (recoveryCase.status !== 'active_recovery') return null

  const nextInstallment = recoveryCase.installments.find(
    (i) => i.status === 'pending' || i.status === 'overdue',
  )
  if (!nextInstallment) return null

  const todayStr = today()
  if (nextInstallment.dueDate > todayStr) return null

  return recordRecoveryPayment({
    recoveryCaseId: caseId,
    installmentId: nextInstallment.id,
    paymentDate: todayStr,
    paidAmount: nextInstallment.installmentAmount,
    paymentReference: `AUTO-DD-${caseId}-${nextInstallment.installmentNumber}`,
    paymentMode: 'pension_deduction',
    remarks: 'Automatic pension deduction',
    recordedBy: 'System',
  })
}

export function getPensionerRecoverySummary(pensionerId: string) {
  const active = getActiveRecoveryForPensioner(pensionerId)
  if (!active) return null

  const paidCount = active.installments.filter((i) => i.status === 'paid').length
  const remainingCount = active.installments.filter(
    (i) => i.status === 'pending' || i.status === 'overdue' || i.status === 'partially_paid',
  ).length

  return {
    caseId: active.id,
    reason: RECOVERY_REASON_LABELS[active.recoveryReason] ?? active.recoveryReason,
    totalAmount: active.calculation.remainingAmount,
    recoveredAmount: active.calculation.recoveredAmount,
    remainingBalance: active.calculation.outstandingBalance,
    installmentsPaid: paidCount,
    installmentsRemaining: remainingCount,
    expectedCompletionDate: active.calculation.expectedCompletionDate,
    installments: active.installments.map((i) => ({
      installmentNumber: i.installmentNumber,
      amount: i.installmentAmount,
      status: mapInstallmentStatusForPortal(i.status),
      date: i.dueDate,
    })),
  }
}

function mapInstallmentStatusForPortal(
  status: RecoveryInstallment['status'],
): 'paid' | 'pending' | 'overdue' {
  if (status === 'paid' || status === 'completed') return 'paid'
  if (status === 'overdue' || status === 'missed') return 'overdue'
  return 'pending'
}

const RECOVERY_REASON_LABELS: Record<string, string> = {
  excess_pension_credit: 'Excess pension credited',
  pay_revision_adjustment: 'Pay revision adjustment',
  duplicate_disbursement: 'Duplicate disbursement',
  wrong_pension_type: 'Wrong pension type',
  arrear_overpayment: 'Arrear overpayment',
  other: 'Other',
}
