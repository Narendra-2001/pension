import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, FileUp, Save, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

import {
  AddressDetailsStep,
  BankDetailsStep,
  NomineeDetailsStep,
  PensionDetailsStep,
  PersonalDetailsStep,
  ServiceDetailsStep,
} from '@/components/admin/pensioners/onboarding-steps'
import {
  AdminDetailHero,
  AdminPageShell,
  AdminProcessStepper,
} from '@/components/admin/shared/admin-detail-ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { createPensioner, generatePensionerId } from '@/data/admin-api'
import {
  defaultOnboardingValues,
  demoOnboardingValues,
  onboardingSchema,
  REQUIRED_DOCUMENTS,
  WIZARD_STEP_FIELDS,
  WIZARD_STEPS,
  type OnboardingFormValues,
} from '@/lib/onboarding-schema'
import { calculatePensionAmounts } from '@/types/pensioner'
import type { PensionerRecord } from '@/types/pensioner'
import { buildStructureFromOnboardingInput, derivePensionDetails } from '@/lib/pension-structure'

function DocumentsStep({
  uploadedDocs,
  onUpload,
}: {
  uploadedDocs: Set<string>
  onUpload: (name: string) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {REQUIRED_DOCUMENTS.map((doc) => (
        <div
          key={doc}
          className="flex items-center justify-between rounded-xl border border-border/60 p-4"
        >
          <div>
            <p className="text-sm font-medium">{doc}</p>
            <p className="text-xs text-muted-foreground">Required</p>
          </div>
          {uploadedDocs.has(doc) ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
              <Check className="mr-1 size-3" /> Uploaded
            </Badge>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => onUpload(doc)}>
              <FileUp className="size-4" /> Upload
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

function ReviewStep({ values }: { values: OnboardingFormValues }) {
  const amounts = calculatePensionAmounts({
    basicPension: Number(values.basicPension),
    dearnessRelief: Number(values.dearnessRelief),
    medicalAllowance: Number(values.medicalAllowance),
    specialAllowance: Number(values.specialAllowance),
    arrears: Number(values.arrears),
    taxDeduction: Number(values.taxDeduction),
    recoveryDeduction: Number(values.recoveryDeduction),
  })

  const sections = [
    {
      title: 'Personal',
      items: [
        ['Name', `${values.firstName} ${values.middleName ?? ''} ${values.lastName}`.replace(/\s+/g, ' ').trim()],
        ['Mobile', values.mobileNumber],
        ['Email', values.emailAddress],
        ['Aadhaar', values.aadhaarNumber],
      ],
    },
    {
      title: 'Service',
      items: [
        ['PPO', values.ppoNumber],
        ['Department', values.department],
        ['Pension Type', values.pensionType],
      ],
    },
    {
      title: 'Bank',
      items: [
        ['Bank', values.bankName],
        ['Account', values.accountNumber],
        ['IFSC', values.ifscCode],
      ],
    },
    {
      title: 'Pension',
      items: [
        ['Gross', `₹${amounts.grossPension.toLocaleString()}`],
        ['Net', `₹${amounts.netPension.toLocaleString()}`],
      ],
    },
    {
      title: 'Nominee',
      items: [
        ['Name', values.nomineeName],
        ['Relationship', values.relationship],
        ['Share', `${values.percentageShare}%`],
      ],
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardContent className="space-y-2 p-4">
            <h4 className="font-semibold">{section.title}</h4>
            {section.items.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function buildPensionerRecord(values: OnboardingFormValues, status: 'draft' | 'pending_activation'): PensionerRecord {
  const now = new Date().toISOString().split('T')[0]
  const id = generatePensionerId()

  const baseRecord: PensionerRecord = {
    id,
    personal: {
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      aadhaarNumber: values.aadhaarNumber,
      panNumber: values.panNumber,
      mobileNumber: values.mobileNumber,
      alternateMobile: values.alternateMobile,
      emailAddress: values.emailAddress,
    },
    service: {
      employeeId: values.employeeId,
      department: values.department,
      designation: values.designation,
      officeName: values.officeName,
      joiningDate: values.joiningDate,
      retirementDate: values.retirementDate,
      lastPayDrawn: Number(values.lastPayDrawn),
      pensionType: values.pensionType,
      ppoNumber: values.ppoNumber,
      sanctionOrderNumber: values.sanctionOrderNumber,
    },
    address: {
      houseNumber: values.houseNumber,
      street: values.street,
      villageCity: values.villageCity,
      district: values.district,
      state: values.state,
      pincode: values.pincode,
    },
    bank: {
      accountHolderName: values.accountHolderName,
      bankName: values.bankName,
      branchName: values.branchName,
      accountNumber: values.accountNumber,
      ifscCode: values.ifscCode,
      branchAddress: values.branchAddress,
    },
    pension: {
      basicPension: 0,
      dearnessRelief: 0,
      medicalAllowance: 0,
      specialAllowance: 0,
      arrears: 0,
      taxDeduction: 0,
      recoveryDeduction: 0,
      grossPension: 0,
      netPension: 0,
    },
    nominee: {
      nomineeName: values.nomineeName,
      relationship: values.relationship,
      dateOfBirth: values.nomineeDateOfBirth,
      aadhaarNumber: values.nomineeAadhaar,
      mobileNumber: values.nomineeMobile,
      percentageShare: Number(values.percentageShare),
      address: values.nomineeAddress,
    },
    documents: REQUIRED_DOCUMENTS.map((name, i) => ({
      id: `doc-${i}`,
      name,
      required: true,
      uploaded: true,
      fileName: `${name.toLowerCase().replace(/\s/g, '_')}.pdf`,
    })),
    status,
    verificationStatus: 'pending',
    activationStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  }

  const pensionStructure = buildStructureFromOnboardingInput(baseRecord, {
    basicPension: Number(values.basicPension),
    dearnessRelief: Number(values.dearnessRelief),
    medicalAllowance: Number(values.medicalAllowance),
    specialAllowance: Number(values.specialAllowance),
    disabilityAllowance: Number(values.disabilityAllowance) || 0,
    familyPensionComponent: Number(values.familyPensionComponent) || 0,
    otherAllowances: Number(values.otherAllowances) || 0,
    arrears: Number(values.arrears),
    commutationAdjustment: Number(values.commutationAdjustment) || 0,
    revisionAdjustment: Number(values.revisionAdjustment) || 0,
    taxDeduction: Number(values.taxDeduction),
    recoveryDeduction: Number(values.recoveryDeduction),
    otherDeductions: Number(values.otherDeductions) || 0,
    pensionStartDate: values.pensionStartDate,
    sanctionDate: values.sanctionDate,
    sanctionAuthority: values.sanctionAuthority,
  })

  return {
    ...baseRecord,
    pensionStructure,
    pension: derivePensionDetails(pensionStructure.components),
  }
}

export function AddPensionerPage() {
  const [step, setStep] = useState(1)
  const [uploadedDocs, setUploadedDocs] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema) as Resolver<OnboardingFormValues>,
    defaultValues: defaultOnboardingValues as OnboardingFormValues,
    mode: 'onChange',
  })

  const createMutation = useMutation({
    mutationFn: createPensioner,
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ['pensioners'] })
      toast.success('Pensioner submitted successfully', {
        description: `ID: ${record.id} · SMS & Email sent · Status: Pending Activation`,
      })
      navigate({ to: '/admin/pensioners/$id', params: { id: record.service.ppoNumber } })
    },
  })

  const validateStep = async () => {
    if (step <= 6) {
      const fields = WIZARD_STEP_FIELDS[step]
      return form.trigger(fields)
    }
    if (step === 7 && uploadedDocs.size < 3) {
      toast.error('Please upload at least 3 required documents')
      return false
    }
    return true
  }

  const nextStep = async () => {
    const valid = await validateStep()
    if (valid) setStep((s) => Math.min(s + 1, 8))
  }

  const handleFillDemo = () => {
    form.reset(demoOnboardingValues)
    setUploadedDocs(new Set(REQUIRED_DOCUMENTS))
    setStep(1)
    toast.success('Demo data filled', {
      description: 'All steps are pre-filled — use Next to review or Submit on the last step.',
    })
  }

  const handleSaveDraft = () => {
    const values = form.getValues()
    createMutation.mutate(buildPensionerRecord(values, 'draft'))
    toast.info('Draft saved')
  }

  const handleSubmit = () => {
    const values = form.getValues()
    createMutation.mutate(buildPensionerRecord(values, 'pending_activation'))
  }

  const progress = (step / WIZARD_STEPS.length) * 100
  const stepperSteps = WIZARD_STEPS.map((s) => ({ id: String(s.id), label: s.title }))

  return (
    <AdminPageShell>
      <AdminDetailHero
        title="Add New Pensioner"
        subtitle="Multi-step onboarding wizard for new pensioner registration"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="rounded-full" onClick={handleFillDemo}>
              <Sparkles className="size-4" /> Fill Demo Data
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/admin/pensioners"><ArrowLeft className="size-4" /> Cancel</Link>
            </Button>
          </div>
        }
      />

      <AdminProcessStepper steps={stepperSteps} currentStep={step} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {step} of {WIZARD_STEPS.length}: <span className="font-medium text-foreground">{WIZARD_STEPS[step - 1].title}</span>
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      <Card className="admin-card">
        <CardContent className="p-6">
          <Form {...form}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 1 && <PersonalDetailsStep />}
                {step === 2 && <ServiceDetailsStep />}
                {step === 3 && <AddressDetailsStep />}
                {step === 4 && <BankDetailsStep />}
                {step === 5 && <PensionDetailsStep />}
                {step === 6 && <NomineeDetailsStep />}
                {step === 7 && (
                  <DocumentsStep
                    uploadedDocs={uploadedDocs}
                    onUpload={(name) => {
                      setUploadedDocs((prev) => new Set([...prev, name]))
                      toast.success(`${name} uploaded`)
                    }}
                  />
                )}
                {step === 8 && <ReviewStep values={form.getValues()} />}
              </motion.div>
            </AnimatePresence>
          </Form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" className="rounded-full" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="size-4" /> Previous
        </Button>
        <div className="flex gap-2">
          {step === 8 && (
            <>
              <Button variant="outline" className="rounded-full" onClick={handleSaveDraft}>
                <Save className="size-4" /> Save Draft
              </Button>
              <Button
                className="rounded-full"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                Submit
              </Button>
            </>
          )}
          {step < 8 && (
            <Button className="rounded-full" onClick={nextStep}>
              Next <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </AdminPageShell>
  )
}
