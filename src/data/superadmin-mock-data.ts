import type {
  AdminUserRecord,
  DepartmentRecord,
  RoleDefinition,
  SystemSetting,
} from '@/types/superadmin'

const departmentsSeed: DepartmentRecord[] = [
  {
    id: 'dept-001',
    code: 'PA',
    name: 'Pension Authority',
    headOfDepartment: 'Dr. Sunita Rao',
    contactEmail: 'pension.authority@gov.in',
    contactPhone: '+91 11 2345 6701',
    adminCount: 8,
    pensionerCount: 1240,
    status: 'active',
    createdAt: '2022-04-01',
  },
  {
    id: 'dept-002',
    code: 'FIN',
    name: 'Finance Department',
    headOfDepartment: 'Shri Vikram Singh',
    contactEmail: 'finance.dept@gov.in',
    contactPhone: '+91 11 2345 6702',
    adminCount: 6,
    pensionerCount: 890,
    status: 'active',
    createdAt: '2022-04-15',
  },
  {
    id: 'dept-003',
    code: 'RC',
    name: 'Recovery Cell',
    headOfDepartment: 'Rajesh Kumar',
    contactEmail: 'recovery.cell@gov.in',
    contactPhone: '+91 11 2345 6703',
    adminCount: 4,
    pensionerCount: 320,
    status: 'active',
    createdAt: '2022-06-01',
  },
  {
    id: 'dept-004',
    code: 'AB',
    name: 'Audit Bureau',
    headOfDepartment: 'Dr. Anil Mehta',
    contactEmail: 'audit.bureau@gov.in',
    contactPhone: '+91 11 2345 6704',
    adminCount: 3,
    pensionerCount: 0,
    status: 'active',
    createdAt: '2022-07-10',
  },
  {
    id: 'dept-005',
    code: 'CS',
    name: 'Citizen Support',
    headOfDepartment: 'Priya Sharma',
    contactEmail: 'citizen.support@gov.in',
    contactPhone: '+91 11 2345 6705',
    adminCount: 5,
    pensionerCount: 0,
    status: 'active',
    createdAt: '2022-08-20',
  },
  {
    id: 'dept-006',
    code: 'CIT',
    name: 'Central IT & Governance',
    headOfDepartment: 'System Super Administrator',
    contactEmail: 'it.governance@gov.in',
    contactPhone: '+91 11 2345 6700',
    adminCount: 2,
    pensionerCount: 0,
    status: 'active',
    createdAt: '2022-01-01',
  },
  {
    id: 'dept-007',
    code: 'REV',
    name: 'Revenue Department',
    headOfDepartment: 'Smt. Lakshmi Devi',
    contactEmail: 'revenue.dept@gov.in',
    contactPhone: '+91 11 2345 6706',
    adminCount: 4,
    pensionerCount: 560,
    status: 'active',
    createdAt: '2023-01-15',
  },
  {
    id: 'dept-008',
    code: 'EDU',
    name: 'Education Board',
    headOfDepartment: 'Prof. Arun Joshi',
    contactEmail: 'education.board@gov.in',
    contactPhone: '+91 11 2345 6707',
    adminCount: 3,
    pensionerCount: 780,
    status: 'inactive',
    createdAt: '2023-03-01',
  },
]

const adminUsersSeed: AdminUserRecord[] = [
  {
    id: 'adm-001',
    username: 'superadmin',
    name: 'System Super Administrator',
    email: 'superadmin@gov.in',
    mobile: '+91 98765 43210',
    role: 'super_admin',
    departmentId: 'dept-006',
    status: 'active',
    lastLogin: '2026-06-15T08:30:00',
    createdAt: '2022-01-01',
  },
  {
    id: 'adm-002',
    username: 'pensionadmin',
    name: 'Pension Administrator',
    email: 'pensionadmin@gov.in',
    mobile: '+91 98765 43211',
    role: 'pension_admin',
    departmentId: 'dept-001',
    status: 'active',
    lastLogin: '2026-06-14T16:45:00',
    createdAt: '2022-04-01',
  },
  {
    id: 'adm-003',
    username: 'accounts',
    name: 'Kavitha Reddy',
    email: 'kavitha.reddy@gov.in',
    mobile: '+91 98765 43212',
    role: 'accounts',
    departmentId: 'dept-002',
    status: 'active',
    lastLogin: '2026-06-15T09:15:00',
    createdAt: '2022-04-15',
  },
  {
    id: 'adm-004',
    username: 'recovery',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gov.in',
    mobile: '+91 98765 43213',
    role: 'recovery',
    departmentId: 'dept-003',
    status: 'active',
    lastLogin: '2026-06-13T11:20:00',
    createdAt: '2022-06-01',
  },
  {
    id: 'adm-005',
    username: 'audit',
    name: 'Dr. Anil Mehta',
    email: 'anil.mehta@gov.in',
    mobile: '+91 98765 43214',
    role: 'audit',
    departmentId: 'dept-004',
    status: 'active',
    lastLogin: '2026-06-12T14:00:00',
    createdAt: '2022-07-10',
  },
  {
    id: 'adm-006',
    username: 'helpdesk',
    name: 'Priya Sharma',
    email: 'priya.sharma@gov.in',
    mobile: '+91 98765 43215',
    role: 'helpdesk',
    departmentId: 'dept-005',
    status: 'active',
    lastLogin: '2026-06-15T07:50:00',
    createdAt: '2022-08-20',
  },
  {
    id: 'adm-007',
    username: 'ramesh.patel',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@gov.in',
    mobile: '+91 98765 43216',
    role: 'pension_admin',
    departmentId: 'dept-001',
    status: 'active',
    lastLogin: '2026-06-10T10:30:00',
    createdAt: '2023-02-14',
  },
  {
    id: 'adm-008',
    username: 'sunita.iyer',
    name: 'Sunita Iyer',
    email: 'sunita.iyer@gov.in',
    mobile: '+91 98765 43217',
    role: 'accounts',
    departmentId: 'dept-002',
    status: 'inactive',
    createdAt: '2023-05-20',
  },
  {
    id: 'adm-009',
    username: 'deepak.verma',
    name: 'Deepak Verma',
    email: 'deepak.verma@gov.in',
    mobile: '+91 98765 43218',
    role: 'recovery',
    departmentId: 'dept-003',
    status: 'active',
    lastLogin: '2026-06-11T15:40:00',
    createdAt: '2023-08-01',
  },
  {
    id: 'adm-010',
    username: 'meena.das',
    name: 'Meena Das',
    email: 'meena.das@gov.in',
    mobile: '+91 98765 43219',
    role: 'helpdesk',
    departmentId: 'dept-005',
    status: 'locked',
    createdAt: '2024-01-10',
  },
]

const rolesSeed: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full platform governance — departments, roles, admins, and system configuration.',
    permissions: [
      'Manage all users',
      'Configure departments',
      'System settings',
      'View all reports',
      'Manage roles',
      'Override workflows',
      'Security policies',
      'Audit log access',
    ],
    isSystemRole: true,
    userCount: 1,
  },
  {
    id: 'pension_admin',
    name: 'Pension Admin',
    description: 'Pensioner onboarding, life certificates, suspensions, and profile updates.',
    permissions: [
      'Manage pensioners',
      'Approve activations',
      'Review life certificates',
      'Manage suspensions',
      'Profile update review',
      'Pension reports',
      'Bulk import',
    ],
    isSystemRole: true,
    userCount: 2,
  },
  {
    id: 'accounts',
    name: 'Accounts Officer',
    description: 'Pension disbursements, reconciliations, and financial records.',
    permissions: [
      'Process payments',
      'Reconcile accounts',
      'Create recovery cases',
      'Approve installments',
      'Financial reports',
      'Disbursement notices',
    ],
    isSystemRole: true,
    userCount: 2,
  },
  {
    id: 'recovery',
    name: 'Recovery Officer',
    description: 'Recovery cases from detection through completion.',
    permissions: [
      'Create recovery cases',
      'Track installments',
      'Send recovery notices',
      'Update case status',
      'Recovery reports',
      'Document management',
    ],
    isSystemRole: true,
    userCount: 2,
  },
  {
    id: 'audit',
    name: 'Audit Officer',
    description: 'Audit logs, compliance reports, and system integrity.',
    permissions: [
      'View audit logs',
      'Compliance reports',
      'Approve recoveries',
      'Flag anomalies',
      'Export audit data',
      'Module trail access',
    ],
    isSystemRole: true,
    userCount: 1,
  },
  {
    id: 'helpdesk',
    name: 'Helpdesk',
    description: 'Pensioner support, tickets, and document assistance.',
    permissions: [
      'View pensioner profiles',
      'Create support tickets',
      'Assist with documents',
      'Escalate issues',
      'FAQ management',
      'Grievance handling',
    ],
    isSystemRole: true,
    userCount: 2,
  },
]

const systemSettingsSeed: SystemSetting[] = [
  {
    id: 'platform-name',
    category: 'General',
    label: 'Platform Name',
    description: 'Display name shown across portals and communications',
    value: 'PensionFlow',
    type: 'text',
  },
  {
    id: 'support-email',
    category: 'General',
    label: 'Support Email',
    description: 'Primary contact email for pensioner and officer support',
    value: 'support@pensionflow.gov.in',
    type: 'text',
  },
  {
    id: 'support-phone',
    category: 'General',
    label: 'Support Helpline',
    description: 'Toll-free helpline number for pensioners',
    value: '1800-123-4567',
    type: 'text',
  },
  {
    id: 'default-language',
    category: 'General',
    label: 'Default Language',
    description: 'Default language for new user sessions',
    value: 'en',
    type: 'select',
    options: [
      { value: 'en', label: 'English' },
      { value: 'hi', label: 'Hindi' },
      { value: 'mr', label: 'Marathi' },
      { value: 'ta', label: 'Tamil' },
    ],
  },
  {
    id: 'session-timeout',
    category: 'Security',
    label: 'Session Timeout (minutes)',
    description: 'Auto-logout after inactivity for officer portals',
    value: 30,
    type: 'number',
  },
  {
    id: 'mfa-required',
    category: 'Security',
    label: 'Require MFA for Admins',
    description: 'Enforce multi-factor authentication for all admin accounts',
    value: true,
    type: 'boolean',
  },
  {
    id: 'password-expiry',
    category: 'Security',
    label: 'Password Expiry (days)',
    description: 'Force password reset after this many days',
    value: 90,
    type: 'number',
  },
  {
    id: 'max-login-attempts',
    category: 'Security',
    label: 'Max Login Attempts',
    description: 'Lock account after consecutive failed login attempts',
    value: 5,
    type: 'number',
  },
  {
    id: 'lc-reminder-days',
    category: 'Pension Operations',
    label: 'Life Certificate Reminder (days before)',
    description: 'Send reminders this many days before LC due date',
    value: 30,
    type: 'number',
  },
  {
    id: 'auto-suspend-lc',
    category: 'Pension Operations',
    label: 'Auto-suspend on LC Expiry',
    description: 'Automatically suspend pension when life certificate expires',
    value: true,
    type: 'boolean',
  },
  {
    id: 'disbursement-day',
    category: 'Pension Operations',
    label: 'Monthly Disbursement Day',
    description: 'Day of month when pension payments are processed',
    value: 1,
    type: 'number',
  },
  {
    id: 'sms-gateway',
    category: 'Integrations',
    label: 'SMS Gateway',
    description: 'Provider for outbound SMS notifications',
    value: 'nic-sms',
    type: 'select',
    options: [
      { value: 'nic-sms', label: 'NIC SMS Gateway' },
      { value: 'bsnl-sms', label: 'BSNL SMS' },
      { value: 'custom', label: 'Custom API' },
    ],
  },
  {
    id: 'email-smtp',
    category: 'Integrations',
    label: 'Email SMTP Host',
    description: 'SMTP server for outbound email notifications',
    value: 'smtp.gov.in',
    type: 'text',
  },
  {
    id: 'aadhaar-verify',
    category: 'Integrations',
    label: 'Aadhaar Verification',
    description: 'Enable UIDAI Aadhaar verification during onboarding',
    value: true,
    type: 'boolean',
  },
  {
    id: 'audit-retention',
    category: 'Compliance',
    label: 'Audit Log Retention (years)',
    description: 'Minimum retention period for immutable audit logs',
    value: 7,
    type: 'number',
  },
]

let departmentsStore = [...departmentsSeed]
let adminUsersStore = [...adminUsersSeed]
let rolesStore = [...rolesSeed]
let settingsStore = [...systemSettingsSeed]

export function getDepartmentsStore(): DepartmentRecord[] {
  return departmentsStore
}

export function getAdminUsersStore(): AdminUserRecord[] {
  return adminUsersStore
}

export function getRolesStore(): RoleDefinition[] {
  return rolesStore
}

export function getSettingsStore(): SystemSetting[] {
  return settingsStore
}

export function setDepartmentsStore(items: DepartmentRecord[]): void {
  departmentsStore = items
}

export function setAdminUsersStore(items: AdminUserRecord[]): void {
  adminUsersStore = items
}

export function setRolesStore(items: RoleDefinition[]): void {
  rolesStore = items
}

export function setSettingsStore(items: SystemSetting[]): void {
  settingsStore = items
}

export function generateAdminUserId(): string {
  const max = adminUsersStore.reduce((acc, u) => {
    const num = parseInt(u.id.replace('adm-', ''), 10)
    return Number.isNaN(num) ? acc : Math.max(acc, num)
  }, 0)
  return `adm-${String(max + 1).padStart(3, '0')}`
}

export function generateDepartmentId(): string {
  const max = departmentsStore.reduce((acc, d) => {
    const num = parseInt(d.id.replace('dept-', ''), 10)
    return Number.isNaN(num) ? acc : Math.max(acc, num)
  }, 0)
  return `dept-${String(max + 1).padStart(3, '0')}`
}
