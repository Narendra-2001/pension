import { z } from 'zod'

export const personalDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name is required'),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  aadhaarNumber: z.string().regex(/^\d{4}\s\d{4}\s\d{4}$/, 'Format: XXXX XXXX XXXX'),
  panNumber: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Invalid PAN format'),
  mobileNumber: z.string().min(10, 'Valid mobile number required'),
  alternateMobile: z.string().optional(),
  emailAddress: z.string().email('Valid email required'),
})

export const serviceDetailsSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  officeName: z.string().min(1, 'Office name is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  retirementDate: z.string().min(1, 'Retirement date is required'),
  lastPayDrawn: z.coerce.number().min(1, 'Last pay drawn is required'),
  pensionType: z.enum(['superannuation', 'family_pension', 'voluntary_retirement', 'compassionate', 'disability']),
  ppoNumber: z.string().min(1, 'PPO number is required'),
  sanctionOrderNumber: z.string().min(1, 'Sanction order number is required'),
})

export const addressDetailsSchema = z.object({
  houseNumber: z.string().min(1, 'House number is required'),
  street: z.string().min(1, 'Street is required'),
  villageCity: z.string().min(1, 'City is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
})

/** Plain object schema — safe to merge (no refinements). */
export const bankDetailsFieldsSchema = z.object({
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  branchName: z.string().min(1, 'Branch name is required'),
  accountNumber: z.string().min(9, 'Valid account number required'),
  confirmAccountNumber: z.string().min(9, 'Confirm account number'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  branchAddress: z.string().min(1, 'Branch address is required'),
})

const accountNumberMatchRefine = {
  message: 'Account numbers do not match',
  path: ['confirmAccountNumber'],
}

/** Step-level bank validation (includes cross-field refine). */
export const bankDetailsSchema = bankDetailsFieldsSchema.refine(
  (data) => data.accountNumber === data.confirmAccountNumber,
  accountNumberMatchRefine,
)

export const pensionDetailsSchema = z.object({
  pensionStartDate: z.string().min(1, 'Pension start date is required'),
  sanctionDate: z.string().min(1, 'Sanction date is required'),
  sanctionAuthority: z.string().min(2, 'Sanction authority is required'),
  basicPension: z.coerce.number().min(0),
  dearnessRelief: z.coerce.number().min(0),
  medicalAllowance: z.coerce.number().min(0),
  specialAllowance: z.coerce.number().min(0),
  disabilityAllowance: z.coerce.number().min(0).optional(),
  familyPensionComponent: z.coerce.number().min(0).optional(),
  otherAllowances: z.coerce.number().min(0).optional(),
  arrears: z.coerce.number().min(0),
  commutationAdjustment: z.coerce.number().min(0).optional(),
  revisionAdjustment: z.coerce.number().min(0).optional(),
  taxDeduction: z.coerce.number().min(0),
  recoveryDeduction: z.coerce.number().min(0),
  otherDeductions: z.coerce.number().min(0).optional(),
})

export const nomineeDetailsSchema = z.object({
  nomineeName: z.string().min(2, 'Nominee name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  nomineeDateOfBirth: z.string().min(1, 'Date of birth is required'),
  nomineeAadhaar: z.string().regex(/^\d{4}\s\d{4}\s\d{4}$/, 'Format: XXXX XXXX XXXX'),
  nomineeMobile: z.string().min(10, 'Valid mobile required'),
  percentageShare: z.coerce.number().min(1).max(100),
  nomineeAddress: z.string().min(5, 'Address is required'),
})

const onboardingFieldsSchema = personalDetailsSchema
  .merge(serviceDetailsSchema)
  .merge(addressDetailsSchema)
  .merge(bankDetailsFieldsSchema)
  .merge(pensionDetailsSchema)
  .merge(nomineeDetailsSchema)

export const onboardingSchema = onboardingFieldsSchema.refine(
  (data) => data.accountNumber === data.confirmAccountNumber,
  accountNumberMatchRefine,
)

export type OnboardingFormValues = z.infer<typeof onboardingFieldsSchema>

export const WIZARD_STEP_FIELDS: Record<number, (keyof OnboardingFormValues)[]> = {
  1: [
    'firstName', 'middleName', 'lastName', 'gender', 'dateOfBirth',
    'aadhaarNumber', 'panNumber', 'mobileNumber', 'alternateMobile', 'emailAddress',
  ],
  2: [
    'employeeId', 'department', 'designation', 'officeName', 'joiningDate',
    'retirementDate', 'lastPayDrawn', 'pensionType', 'ppoNumber', 'sanctionOrderNumber',
  ],
  3: ['houseNumber', 'street', 'villageCity', 'district', 'state', 'pincode'],
  4: [
    'accountHolderName', 'bankName', 'branchName', 'accountNumber',
    'confirmAccountNumber', 'ifscCode', 'branchAddress',
  ],
  5: [
    'pensionStartDate', 'sanctionDate', 'sanctionAuthority',
    'basicPension', 'dearnessRelief', 'medicalAllowance', 'specialAllowance',
    'disabilityAllowance', 'familyPensionComponent', 'otherAllowances',
    'arrears', 'commutationAdjustment', 'revisionAdjustment',
    'taxDeduction', 'recoveryDeduction', 'otherDeductions',
  ],
  6: [
    'nomineeName', 'relationship', 'nomineeDateOfBirth', 'nomineeAadhaar',
    'nomineeMobile', 'percentageShare', 'nomineeAddress',
  ],
}

export const WIZARD_STEPS = [
  { id: 1, title: 'Personal Details' },
  { id: 2, title: 'Service Details' },
  { id: 3, title: 'Address Details' },
  { id: 4, title: 'Bank Details' },
  { id: 5, title: 'Pension Components' },
  { id: 6, title: 'Nominee Details' },
  { id: 7, title: 'Documents Upload' },
  { id: 8, title: 'Review & Submit' },
] as const

export const REQUIRED_DOCUMENTS = [
  'Aadhaar Card',
  'PAN Card',
  'PPO Copy',
  'Retirement Order',
  'Pension Sanction Order',
  'Bank Passbook',
  'Passport Size Photo',
  'Signature',
  'Nominee Proof',
  'Address Proof',
]

export const defaultOnboardingValues: Partial<OnboardingFormValues> = {
  gender: 'male',
  pensionType: 'superannuation',
  basicPension: 0,
  dearnessRelief: 0,
  medicalAllowance: 1000,
  specialAllowance: 0,
  disabilityAllowance: 0,
  familyPensionComponent: 0,
  otherAllowances: 0,
  arrears: 0,
  commutationAdjustment: 0,
  revisionAdjustment: 0,
  taxDeduction: 0,
  recoveryDeduction: 0,
  otherDeductions: 0,
  sanctionAuthority: 'Pension Sanctioning Authority',
  percentageShare: 100,
}

/** Valid sample data for demo / testing the onboarding wizard. */
export const demoOnboardingValues: OnboardingFormValues = {
  firstName: 'Rajesh',
  middleName: 'Kumar',
  lastName: 'Sharma',
  gender: 'male',
  dateOfBirth: '1958-06-15',
  aadhaarNumber: '2345 6789 0123',
  panNumber: 'ABCDE1234F',
  mobileNumber: '9876543210',
  alternateMobile: '9123456789',
  emailAddress: 'rajesh.kumar.sharma@gov.in',
  employeeId: 'EMP-10452',
  department: 'Finance Department',
  designation: 'Deputy Secretary',
  officeName: 'Pune Regional Office',
  joiningDate: '1985-04-01',
  retirementDate: '2023-03-31',
  lastPayDrawn: 78500,
  pensionType: 'superannuation',
  ppoNumber: 'PPO104521',
  sanctionOrderNumber: 'SO/2023/5421',
  houseNumber: '42',
  street: 'MG Road',
  villageCity: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
  pincode: '411001',
  accountHolderName: 'Rajesh Kumar Sharma',
  bankName: 'State Bank of India',
  branchName: 'Pune Main Branch',
  accountNumber: '30123456789',
  confirmAccountNumber: '30123456789',
  ifscCode: 'SBIN0001234',
  branchAddress: 'Pune, Maharashtra',
  basicPension: 38500,
  dearnessRelief: 16170,
  medicalAllowance: 1000,
  specialAllowance: 2500,
  disabilityAllowance: 0,
  familyPensionComponent: 0,
  otherAllowances: 0,
  arrears: 15000,
  commutationAdjustment: 0,
  revisionAdjustment: 0,
  taxDeduction: 1200,
  recoveryDeduction: 500,
  otherDeductions: 0,
  pensionStartDate: '2023-04-01',
  sanctionDate: '2023-03-15',
  sanctionAuthority: 'Director of Pension, Maharashtra',
  nomineeName: 'Sunita Sharma',
  relationship: 'Spouse',
  nomineeDateOfBirth: '1962-08-20',
  nomineeAadhaar: '3456 7890 1234',
  nomineeMobile: '9876543211',
  percentageShare: 100,
  nomineeAddress: '42 MG Road, Pune, Maharashtra',
}
