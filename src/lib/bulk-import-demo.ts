export const DEMO_IMPORT_FILE_NAME = 'pensioners_demo.csv'

const TEMPLATE_HEADERS = [
  'First Name',
  'Last Name',
  'Employee ID',
  'PPO Number',
  'Department',
  'Designation',
  'Mobile',
  'Email',
  'Aadhaar',
  'PAN',
  'Bank Name',
  'Account Number',
  'IFSC',
  'Basic Pension',
  'Nominee Name',
  'Relationship',
] as const

const TEMPLATE_ROWS: string[][] = [
  [
    'Rajesh',
    'Sharma',
    'EMP-10452',
    'PPO104521',
    'Finance Department',
    'Deputy Secretary',
    '9876543210',
    'rajesh.kumar.sharma@gov.in',
    '2345 6789 0123',
    'ABCDE1234F',
    'State Bank of India',
    '30123456789',
    'SBIN0001234',
    '38500',
    'Sunita Sharma',
    'Spouse',
  ],
  [
    'Priya',
    'Patel',
    'EMP-10453',
    'PPO104522',
    'Revenue Department',
    'Section Officer',
    '9876543211',
    'priya.patel@gov.in',
    '3456 7890 1234',
    'FGHIJ5678K',
    'Bank of Baroda',
    '30234567890',
    'BARB0PUNE01',
    '32000',
    'Amit Patel',
    'Spouse',
  ],
  [
    'Vikram',
    'Nair',
    'EMP-10454',
    'PPO104523',
    'Health Services',
    'Assistant Director',
    '9876543212',
    'vikram.nair@gov.in',
    '4567 8901 2345',
    'KLMNO9012P',
    'Punjab National Bank',
    '30345678901',
    'PNBN0005678',
    '41000',
    'Lakshmi Nair',
    'Spouse',
  ],
  [
    'Sunita',
    'Reddy',
    'EMP-10455',
    'PPO104524',
    'Education Board',
    'Teacher',
    '9876543213',
    'sunita.reddy@gov.in',
    '5678 9012 3456',
    'PQRST3456U',
    'Canara Bank',
    '30456789012',
    'CNRB0009012',
    '28500',
    'Ramesh Reddy',
    'Spouse',
  ],
  [
    'Amit',
    'Gupta',
    'EMP-10456',
    'PPO104525',
    'Municipal Corporation',
    'Superintendent',
    '9876543214',
    'amit.gupta@gov.in',
    '6789 0123 4567',
    'UVWXY7890Z',
    'State Bank of India',
    '30567890123',
    'SBIN0004567',
    '35200',
    'Meena Gupta',
    'Spouse',
  ],
]

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildCsvContent(): string {
  const lines = [
    TEMPLATE_HEADERS.join(','),
    ...TEMPLATE_ROWS.map((row) => row.map(escapeCsvCell).join(',')),
  ]
  return lines.join('\n')
}

export function downloadBulkImportTemplate(): void {
  const blob = new Blob([buildCsvContent()], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'pensioners_import_template.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function createDemoImportFile(): File {
  return new File([buildCsvContent()], DEMO_IMPORT_FILE_NAME, { type: 'text/csv' })
}

export const BULK_IMPORT_STEPS = [
  {
    step: 1,
    title: 'Prepare your file',
    description: 'Download the sample CSV template or export pensioner data from Excel (.xlsx) or PDF.',
  },
  {
    step: 2,
    title: 'Upload',
    description: 'Drag and drop or choose a .xlsx, .csv, or .pdf file on this page.',
  },
  {
    step: 3,
    title: 'AI extraction & validation',
    description: 'Fields are auto-mapped, validated, and checked for duplicates before import.',
  },
  {
    step: 4,
    title: 'Review & confirm',
    description: 'Preview extracted rows, then import valid records as Pending Activation.',
  },
] as const
