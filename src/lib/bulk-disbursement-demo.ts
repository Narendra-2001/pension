export const DEMO_DISBURSEMENT_FILE_NAME = 'monthly_payments_demo.csv'

const TEMPLATE_HEADERS = [
  'PPO Number',
  'Gross Pension',
  'Recovery Amount',
  'Deductions',
  'Net Pension',
  'UTR Reference',
  'Credit Date',
  'Status',
] as const

const TEMPLATE_ROWS: string[][] = [
  ['PPO123456', '56470', '1200', '3000', '52270', 'NEFT20260701001', '2026-07-01', 'paid'],
  ['PPO555001', '48200', '0', '2400', '45800', 'NEFT20260701002', '2026-07-01', 'paid'],
  ['PPO789012', '38500', '500', '1800', '36200', 'NEFT20260701003', '2026-07-01', 'paid'],
]

export const BULK_DISBURSEMENT_STEPS = [
  {
    step: 1,
    title: 'Select month',
    description: 'Choose the pension payment month for this disbursement batch.',
  },
  {
    step: 2,
    title: 'Upload file',
    description: 'Upload a CSV with PPO numbers, amounts, UTR references, and credit dates.',
  },
  {
    step: 3,
    title: 'Validate rows',
    description: 'Review matched pensioners, amount checks, and duplicate payment flags.',
  },
  {
    step: 4,
    title: 'Confirm batch',
    description: 'Post payments to pensioner accounts and send credit notifications.',
  },
] as const

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function buildCsvContent(): string {
  const lines = [
    TEMPLATE_HEADERS.join(','),
    ...TEMPLATE_ROWS.map((row) => row.map(escapeCsvCell).join(',')),
  ]
  return lines.join('\n')
}

export function downloadBulkDisbursementTemplate() {
  const blob = new Blob([buildCsvContent()], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'monthly_payment_template.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function createDemoDisbursementFile(): File {
  const content = buildCsvContent()
  return new File([content], DEMO_DISBURSEMENT_FILE_NAME, { type: 'text/csv' })
}
