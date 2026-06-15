import { workflowVideos } from '@/assets/media'

export type PensionerStatus = 'active' | 'suspended' | 'verified' | 'pending'

export interface Pensioner {
  id: string
  name: string
  pensionId: string
  department: string
  status: PensionerStatus
  monthlyAmount: number
  lastVerified: string
}

export interface RecoveryCase {
  id: string
  pensionerId: string
  pensionerName: string
  excessAmount: number
  recoveredAmount: number
  status: 'open' | 'approved' | 'installments' | 'completed'
  createdAt: string
  installments: number
}

const firstNames = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Lakshmi', 'Suresh', 'Meena',
  'Arun', 'Kavita', 'Ramesh', 'Anita', 'Deepak', 'Pooja', 'Sanjay', 'Rekha',
  'Manoj', 'Geeta', 'Ashok', 'Nirmala', 'Prakash', 'Sarita', 'Harish', 'Usha',
]
const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Gupta', 'Iyer',
  'Joshi', 'Das', 'Rao', 'Verma', 'Mishra', 'Pillai', 'Chatterjee', 'Menon',
]
const departments = [
  'Finance Department', 'Revenue Department', 'Education Board', 'Health Services',
  'Municipal Corporation', 'Police Department', 'Transport Authority', 'Judiciary',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePensioners(): Pensioner[] {
  const pensioners: Pensioner[] = []
  const statuses: PensionerStatus[] = []

  for (let i = 0; i < 450; i++) statuses.push('verified')
  for (let i = 0; i < 12; i++) statuses.push('suspended')
  for (let i = 0; i < 38; i++) statuses.push('pending')

  statuses.sort(() => Math.random() - 0.5)

  for (let i = 0; i < 100; i++) {
    const fn = randomFrom(firstNames)
    const ln = randomFrom(lastNames)
    pensioners.push({
      id: `PEN-${String(i + 1).padStart(4, '0')}`,
      name: `${fn} ${ln}`,
      pensionId: `GP-${2020 + (i % 5)}-${String(10000 + i)}`,
      department: randomFrom(departments),
      status: statuses[i],
      monthlyAmount: 12000 + Math.floor(Math.random() * 38000),
      lastVerified: `2025-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    })
  }
  return pensioners
}

function generateRecoveryCases(pensioners: Pensioner[]): RecoveryCase[] {
  const cases: RecoveryCase[] = []
  const statuses: RecoveryCase['status'][] = ['open', 'approved', 'installments', 'completed']

  for (let i = 0; i < 25; i++) {
    const pensioner = pensioners[i % pensioners.length]
    const excess = 50000 + Math.floor(Math.random() * 450000)
    const status = statuses[i % 4]
    const recovered =
      status === 'completed'
        ? excess
        : status === 'installments'
          ? Math.floor(excess * (0.3 + Math.random() * 0.5))
          : status === 'approved'
            ? Math.floor(excess * 0.1)
            : 0

    cases.push({
      id: `RC-${String(i + 1).padStart(4, '0')}`,
      pensionerId: pensioner.id,
      pensionerName: pensioner.name,
      excessAmount: excess,
      recoveredAmount: recovered,
      status,
      createdAt: `2024-${String(6 + (i % 6)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
      installments: status === 'installments' || status === 'completed' ? 6 + (i % 12) : 0,
    })
  }
  return cases
}

export const pensioners = generatePensioners()
export const recoveryCases = generateRecoveryCases(pensioners)

export const dashboardStats = {
  totalPensioners: 50000,
  pendingVerification: pensioners.filter((p) => p.status === 'pending').length,
  recoveryCases: recoveryCases.length,
  monthlyCollections: recoveryCases.reduce((sum, c) => sum + c.recoveredAmount, 0),
  suspendedAccounts: pensioners.filter((p) => p.status === 'suspended').length,
  verifiedUsers: 450,
}

export const trustLogos = [
  'Gov Finance Corp', 'State Treasury', 'Municipal Board', 'Revenue Dept',
  'Pension Authority', 'Civil Services', 'Public Accounts', 'Treasury Board',
  'Finance Commission', 'Audit Bureau', 'Social Security', 'Pension Fund',
]

export const features = [
  {
    title: 'Pensioner Management',
    description: 'Centralized registry with complete pensioner profiles, history, and status tracking.',
    icon: 'Users',
    size: 'large' as const,
  },
  {
    title: 'Life Verification',
    description: 'Automated life certificate processing with biometric and document validation.',
    icon: 'ShieldCheck',
    size: 'medium' as const,
  },
  {
    title: 'Recovery Management',
    description: 'End-to-end excess pension recovery with approval workflows and case tracking.',
    icon: 'RotateCcw',
    size: 'medium' as const,
  },
  {
    title: 'Installment Tracking',
    description: 'Monitor recovery installments, payment schedules, and outstanding balances.',
    icon: 'Calendar',
    size: 'small' as const,
  },
  {
    title: 'Document Management',
    description: 'Secure document vault with version control and digital signatures.',
    icon: 'FileText',
    size: 'small' as const,
  },
  {
    title: 'Audit Logs',
    description: 'Immutable audit trail for every action with compliance-ready reporting.',
    icon: 'ScrollText',
    size: 'medium' as const,
  },
  {
    title: 'Notifications',
    description: 'Real-time alerts for verifications, recoveries, and compliance deadlines.',
    icon: 'Bell',
    size: 'small' as const,
  },
  {
    title: 'Role Management',
    description: 'Granular RBAC with department-level permissions and access controls.',
    icon: 'KeyRound',
    size: 'large' as const,
  },
]

export type WorkflowStep = {
  title: string
  description: string
  summary: string
  demoTitle?: string
  video?: string
}

export const workflowSteps: WorkflowStep[] = [
  {
    title: 'Register Pensioner',
    description: 'Capture identity and employment records with guided data entry.',
    summary: 'An officer opens the registration form and enters the pensioner’s personal, employment, and department details.',
    demoTitle: 'Register Pensioner Capture',
    video: workflowVideos.registerPensionerCapture,
  },
  {
    title: 'Verify Identity',
    description: 'Validate credentials against government databases in real time.',
    summary: 'The system cross-checks Aadhaar, service records, and department data to confirm the pensioner is eligible.',
  },
  {
    title: 'Setup Pension',
    description: 'Configure pension type, amount, and beneficiaries.',
    summary: 'Pension type, monthly amount, bank account, and nominee details are configured and saved to the profile.',
  },
  {
    title: 'Life Verification',
    description: 'Annual life certificate and biometric check.',
    summary: 'The pensioner submits a life certificate — digitally or in person — to confirm they are still alive and eligible.',
  },
  {
    title: 'Recovery Tracking',
    description: 'Monitor excess payments and recovery cases.',
    summary: 'If an overpayment is detected, a recovery case is opened and tracked through approval and installment payments.',
  },
  {
    title: 'Reports',
    description: 'Generate compliance and audit-ready reports.',
    summary: 'Officers generate disbursement, verification, and compliance reports ready for audit and government review.',
  },
]

export const recoveryFlowSteps = [
  { title: 'Excess Pension Found', description: 'AI detects overpayment through reconciliation' },
  { title: 'Create Recovery Case', description: 'Auto-generate case with supporting documents' },
  { title: 'Approval', description: 'Multi-level approval by accounts and audit officers' },
  { title: 'Installments', description: 'Structured repayment plan with automated reminders' },
  { title: 'Recovery Complete', description: 'Case closed with full audit documentation' },
]

export const userRoles = [
  {
    id: 'pensioner',
    title: 'Pensioner',
    description: 'View pension details, submit life certificates, and track payments.',
    permissions: ['View pension details', 'Submit life certificate', 'Download payment slips', 'Update contact info', 'View recovery status'],
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Full system administration with user and department management.',
    permissions: ['Manage all users', 'Configure departments', 'System settings', 'View all reports', 'Manage roles', 'Override workflows'],
  },
  {
    id: 'accounts',
    title: 'Accounts Officer',
    description: 'Handle pension disbursements, reconciliations, and financial records.',
    permissions: ['Process payments', 'Reconcile accounts', 'Create recovery cases', 'Approve installments', 'Financial reports'],
  },
  {
    id: 'recovery',
    title: 'Recovery Officer',
    description: 'Manage recovery cases from detection through completion.',
    permissions: ['Create recovery cases', 'Track installments', 'Send recovery notices', 'Update case status', 'Recovery reports'],
  },
  {
    id: 'audit',
    title: 'Audit Officer',
    description: 'Review audit logs, compliance reports, and system integrity.',
    permissions: ['View audit logs', 'Compliance reports', 'Approve recoveries', 'Flag anomalies', 'Export audit data'],
  },
  {
    id: 'helpdesk',
    title: 'Helpdesk',
    description: 'Support pensioners with queries, tickets, and document assistance.',
    permissions: ['View pensioner profiles', 'Create support tickets', 'Assist with documents', 'Escalate issues', 'FAQ management'],
  },
]

export const testimonials = [
  {
    quote: 'PensionFlow AI reduced our verification backlog by 78% in the first quarter. The automated life certificate workflow alone saved 200+ officer hours monthly.',
    author: 'Dr. Anil Mehta',
    role: 'Director, State Pension Authority',
    avatar: 'AM',
  },
  {
    quote: 'Recovery case management went from spreadsheets to a fully auditable system. We recovered ₹2.4 crore in excess payments within six months.',
    author: 'Smt. Kavitha Reddy',
    role: 'Chief Accounts Officer',
    avatar: 'KR',
  },
  {
    quote: 'As IT administrator, the role-based access and audit logs give us complete confidence in compliance. Deployment was seamless across 12 departments.',
    author: 'Rajesh Kumar',
    role: 'IT Administrator, Finance Department',
    avatar: 'RK',
  },
  {
    quote: 'The dashboard gives our officers real-time visibility into pending verifications and recovery cases. Decision-making is now data-driven.',
    author: 'Priya Sharma',
    role: 'Deputy Commissioner, Revenue',
    avatar: 'PS',
  },
  {
    quote: 'Document workflows that used to take weeks now complete in days. Pensioners can submit certificates digitally with full traceability.',
    author: 'Vikram Nair',
    role: 'Pension Officer, Municipal Corp',
    avatar: 'VN',
  },
]

export const pricingPlans = [
  {
    name: 'Starter',
    price: '₹49,999',
    period: '/month',
    description: 'For small departments getting started with digital pension management.',
    features: ['Up to 5,000 pensioners', 'Basic verification workflow', 'Document management', 'Email support', 'Standard reports', '2 user roles'],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₹1,49,999',
    period: '/month',
    description: 'Complete platform for mid-size government organizations.',
    features: ['Up to 50,000 pensioners', 'AI-powered verification', 'Full recovery management', 'Priority support', 'Advanced analytics', 'All user roles', 'API access', 'Custom workflows'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solution for large-scale state and national deployments.',
    features: ['Unlimited pensioners', 'Multi-tenant architecture', 'Dedicated infrastructure', '24/7 support', 'Custom integrations', 'On-premise option', 'SLA guarantee', 'Training & onboarding'],
    highlighted: false,
  },
]

export const faqItems = [
  {
    question: 'What is PensionFlow AI?',
    answer: 'PensionFlow AI is an enterprise-grade platform for government organizations to manage pension verification, recovery, life certificate processing, document workflows, and compliance tracking from a single secure system.',
  },
  {
    question: 'How does life certificate verification work?',
    answer: 'Pensioners can submit life certificates digitally with biometric validation. The system cross-references government databases, flags anomalies, and automatically updates pension status upon successful verification.',
  },
  {
    question: 'Can the system handle recovery cases automatically?',
    answer: 'Yes. Our AI reconciliation engine detects excess pension payments, auto-generates recovery cases with supporting documentation, and routes them through multi-level approval workflows with installment tracking.',
  },
  {
    question: 'Is PensionFlow AI compliant with government security standards?',
    answer: 'PensionFlow AI is built with enterprise security including role-based access control, immutable audit logs, data encryption at rest and in transit, and compliance with government IT security guidelines.',
  },
  {
    question: 'How long does deployment take?',
    answer: 'Standard deployment for a single department takes 2-4 weeks including data migration, user training, and workflow configuration. Enterprise multi-department rollouts are typically completed within 8-12 weeks.',
  },
  {
    question: 'Can we integrate with existing government systems?',
    answer: 'Yes. PensionFlow AI provides REST APIs and supports integration with treasury systems, HR databases, biometric systems, and existing document management platforms.',
  },
]

export async function fetchDashboardData() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    stats: dashboardStats,
    pensioners: pensioners.slice(0, 10),
    recoveryCases: recoveryCases.slice(0, 8),
  }
}
