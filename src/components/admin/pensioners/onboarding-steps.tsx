import { useFormContext } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OnboardingFormValues } from '@/lib/onboarding-schema'

export function PersonalDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField control={form.control} name="firstName" render={({ field }) => (
        <FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="middleName" render={({ field }) => (
        <FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="lastName" render={({ field }) => (
        <FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="gender" render={({ field }) => (
        <FormItem><FormLabel>Gender *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
        <FormItem><FormLabel>Date of Birth *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="aadhaarNumber" render={({ field }) => (
        <FormItem><FormLabel>Aadhaar Number *</FormLabel><FormControl><Input placeholder="XXXX XXXX XXXX" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="panNumber" render={({ field }) => (
        <FormItem><FormLabel>PAN Number *</FormLabel><FormControl><Input placeholder="ABCDE1234F" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="mobileNumber" render={({ field }) => (
        <FormItem><FormLabel>Mobile Number *</FormLabel><FormControl><Input placeholder="+91 XXXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="alternateMobile" render={({ field }) => (
        <FormItem><FormLabel>Alternate Mobile</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="emailAddress" render={({ field }) => (
        <FormItem className="sm:col-span-2"><FormLabel>Email Address *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <div className="space-y-2">
        <label className="text-sm font-medium">Photo Upload</label>
        <Input type="file" accept="image/*" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Signature Upload</label>
        <Input type="file" accept="image/*" />
      </div>
    </div>
  )
}

export function ServiceDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField control={form.control} name="employeeId" render={({ field }) => (
        <FormItem><FormLabel>Employee ID *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="department" render={({ field }) => (
        <FormItem><FormLabel>Department *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="designation" render={({ field }) => (
        <FormItem><FormLabel>Designation *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="officeName" render={({ field }) => (
        <FormItem><FormLabel>Office Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="joiningDate" render={({ field }) => (
        <FormItem><FormLabel>Joining Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="retirementDate" render={({ field }) => (
        <FormItem><FormLabel>Retirement Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="lastPayDrawn" render={({ field }) => (
        <FormItem><FormLabel>Last Pay Drawn *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="pensionType" render={({ field }) => (
        <FormItem><FormLabel>Pension Type *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
            <SelectContent>
              <SelectItem value="superannuation">Superannuation</SelectItem>
              <SelectItem value="family_pension">Family Pension</SelectItem>
              <SelectItem value="voluntary_retirement">Voluntary Retirement</SelectItem>
              <SelectItem value="compassionate">Compassionate</SelectItem>
              <SelectItem value="disability">Disability</SelectItem>
            </SelectContent>
          </Select><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="ppoNumber" render={({ field }) => (
        <FormItem><FormLabel>PPO Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="sanctionOrderNumber" render={({ field }) => (
        <FormItem><FormLabel>Sanction Order Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  )
}

export function AddressDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(['houseNumber', 'street', 'villageCity', 'district', 'state'] as const).map((name) => (
        <FormField key={name} control={form.control} name={name} render={({ field }) => (
          <FormItem><FormLabel>{name.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      ))}
      <FormField control={form.control} name="pincode" render={({ field }) => (
        <FormItem><FormLabel>Pincode *</FormLabel><FormControl><Input {...field} maxLength={6} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  )
}

export function BankDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField control={form.control} name="accountHolderName" render={({ field }) => (
        <FormItem className="sm:col-span-2"><FormLabel>Account Holder Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="bankName" render={({ field }) => (
        <FormItem><FormLabel>Bank Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="branchName" render={({ field }) => (
        <FormItem><FormLabel>Branch Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="accountNumber" render={({ field }) => (
        <FormItem><FormLabel>Account Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="confirmAccountNumber" render={({ field }) => (
        <FormItem><FormLabel>Confirm Account Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="ifscCode" render={({ field }) => (
        <FormItem><FormLabel>IFSC Code *</FormLabel><FormControl><Input placeholder="SBIN0001234" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="branchAddress" render={({ field }) => (
        <FormItem className="sm:col-span-2"><FormLabel>Branch Address *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  )
}

export function PensionDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()
  const values = form.watch()

  const creditTotal =
    (Number(values.basicPension) || 0) +
    (Number(values.dearnessRelief) || 0) +
    (Number(values.medicalAllowance) || 0) +
    (Number(values.specialAllowance) || 0) +
    (Number(values.disabilityAllowance) || 0) +
    (Number(values.familyPensionComponent) || 0) +
    (Number(values.otherAllowances) || 0) +
    (Number(values.arrears) || 0) +
    (Number(values.commutationAdjustment) || 0) +
    (Number(values.revisionAdjustment) || 0)

  const deductionTotal =
    (Number(values.taxDeduction) || 0) +
    (Number(values.recoveryDeduction) || 0) +
    (Number(values.otherDeductions) || 0)

  const gross = creditTotal
  const net = Math.max(0, gross - deductionTotal)

  const masterFields = [
    { name: 'pensionStartDate' as const, label: 'Pension Start Date', type: 'date' },
    { name: 'sanctionDate' as const, label: 'Sanction Date', type: 'date' },
    { name: 'sanctionAuthority' as const, label: 'Sanction Authority', type: 'text' },
  ]

  const creditFields = [
    { name: 'basicPension' as const, label: 'Basic Pension' },
    { name: 'dearnessRelief' as const, label: 'Dearness Relief (DR)' },
    { name: 'medicalAllowance' as const, label: 'Medical Allowance' },
    { name: 'specialAllowance' as const, label: 'Special Allowance' },
    { name: 'disabilityAllowance' as const, label: 'Disability Allowance' },
    { name: 'familyPensionComponent' as const, label: 'Family Pension Component' },
    { name: 'otherAllowances' as const, label: 'Other Allowances' },
    { name: 'arrears' as const, label: 'Arrears' },
    { name: 'commutationAdjustment' as const, label: 'Commutation Adjustment' },
    { name: 'revisionAdjustment' as const, label: 'Revision Adjustment' },
  ]

  const deductionFields = [
    { name: 'taxDeduction' as const, label: 'Income Tax (TDS)' },
    { name: 'recoveryDeduction' as const, label: 'Recovery Deduction' },
    { name: 'otherDeductions' as const, label: 'Other Deductions' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Pension Master Information</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          {masterFields.map(({ name, label, type }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl><Input type={type} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Core & Allowance Components</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {creditFields.map(({ name, label }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Deductions</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {deductionFields.map(({ name, label }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Gross Pension (Auto)</p>
          <p className="text-2xl font-bold">₹{gross.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Net Pension (Auto)</p>
          <p className="text-2xl font-bold text-emerald-600">₹{net.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  )
}

export function NomineeDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField control={form.control} name="nomineeName" render={({ field }) => (
        <FormItem><FormLabel>Nominee Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="relationship" render={({ field }) => (
        <FormItem><FormLabel>Relationship *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="nomineeDateOfBirth" render={({ field }) => (
        <FormItem><FormLabel>Date of Birth *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="nomineeAadhaar" render={({ field }) => (
        <FormItem><FormLabel>Aadhaar Number *</FormLabel><FormControl><Input placeholder="XXXX XXXX XXXX" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="nomineeMobile" render={({ field }) => (
        <FormItem><FormLabel>Mobile Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="percentageShare" render={({ field }) => (
        <FormItem><FormLabel>Percentage Share *</FormLabel><FormControl><Input type="number" min={1} max={100} {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="nomineeAddress" render={({ field }) => (
        <FormItem className="sm:col-span-2"><FormLabel>Address *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  )
}
