import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Phone, Shield } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthIllustration } from '@/components/auth/auth-illustration'
import { WizardStepper } from '@/components/pensioner/shared/wizard-stepper'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { sendActivationOtp, verifyActivationOtp } from '@/data/pensioner-api'
import {
  activatePensionerAccount,
  DEMO_ACTIVATION_CREDENTIALS,
  validateActivationMobile,
  validateActivationPpo,
} from '@/lib/pensioner-auth'
import { prefillLoginRole } from '@/lib/login-prefill'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'PPO Number' },
  { id: 2, label: 'Mobile' },
  { id: 3, label: 'Send OTP' },
  { id: 4, label: 'Verify OTP' },
  { id: 5, label: 'Password' },
  { id: 6, label: 'Confirm' },
  { id: 7, label: 'Success' },
]

const ppoSchema = z.object({ ppoNumber: z.string().min(1, 'PPO number is required') })
const mobileSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
})
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Include uppercase letter')
      .regex(/[a-z]/, 'Include lowercase letter')
      .regex(/[0-9]/, 'Include number')
      .regex(/[^A-Za-z0-9]/, 'Include special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function ActivationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [ppoNumber, setPpoNumber] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const ppoForm = useForm({ resolver: zodResolver(ppoSchema), defaultValues: { ppoNumber: '' } })
  const mobileForm = useForm({ resolver: zodResolver(mobileSchema), defaultValues: { mobile: '' } })
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const handlePpoSubmit = ppoForm.handleSubmit((values) => {
    const result = validateActivationPpo(values.ppoNumber)
    if (!result.valid) {
      toast.error(result.reason)
      return
    }
    setPpoNumber(values.ppoNumber)
    setStep(2)
  })

  const handleMobileSubmit = mobileForm.handleSubmit((values) => {
    if (!validateActivationMobile(ppoNumber, values.mobile)) {
      toast.error('Mobile number does not match registered number')
      return
    }
    setMobile(values.mobile)
    setStep(3)
  })

  const handleSendOtp = async () => {
    setIsLoading(true)
    try {
      await sendActivationOtp(mobile)
      toast.success('OTP sent to your registered mobile')
      setStep(4)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Enter 6-digit OTP')
      return
    }
    setIsLoading(true)
    try {
      const valid = await verifyActivationOtp(otp)
      if (valid) {
        toast.success('OTP verified successfully')
        setStep(5)
      } else {
        toast.error('Invalid OTP')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
    setStep(6)
    setIsLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      const success = activatePensionerAccount(ppoNumber, values.password)
      if (success) {
        setStep(7)
        toast.success('Account activated successfully!')
        setTimeout(() => {
          prefillLoginRole('pensioner')
          navigate({ to: '/login' })
        }, 3000)
      } else {
        toast.error('Activation failed')
        setStep(5)
      }
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <AuthIllustration />

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </div>

          <div className="card-surface p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Activate Your Account</h1>
                <p className="text-sm text-muted-foreground">Complete activation to access the pension portal</p>
              </div>
            </div>

            <WizardStepper steps={STEPS} currentStep={step} className="mb-8" />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Form {...ppoForm}>
                    <form onSubmit={handlePpoSubmit} className="space-y-4">
                      <FormField
                        control={ppoForm.control}
                        name="ppoNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PPO Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. PPO789012" className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Demo: Use <code className="rounded bg-muted px-1">{DEMO_ACTIVATION_CREDENTIALS.ppoNumber}</code> for activation flow
                      </p>
                      <Button type="submit" className="w-full rounded-xl">
                        Continue <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Form {...mobileForm}>
                    <form onSubmit={handleMobileSubmit} className="space-y-4">
                      <FormField
                        control={mobileForm.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registered Mobile Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input {...field} placeholder="10-digit mobile" className="rounded-xl pl-10" maxLength={10} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Demo mobile: <code className="rounded bg-muted px-1">{DEMO_ACTIVATION_CREDENTIALS.mobile}</code>
                      </p>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(1)}>
                          Back
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl">
                          Continue
                        </Button>
                      </div>
                    </form>
                  </Form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    An OTP will be sent to <strong>+91 {mobile}</strong>
                  </p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button className="flex-1 rounded-xl" onClick={handleSendOtp} disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <p className="text-center text-sm text-muted-foreground">Enter the 6-digit OTP sent to your mobile</p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} className="rounded-xl" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">Demo OTP: <code className="rounded bg-muted px-1">{DEMO_ACTIVATION_CREDENTIALS.otp}</code></p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(3)}>
                      Back
                    </Button>
                    <Button className="flex-1 rounded-xl" onClick={handleVerifyOtp} disabled={isLoading}>
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Form {...passwordForm}>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Create Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type={showPassword ? 'text' : 'password'}
                                  className="rounded-xl pl-10 pr-10"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                        Activate Account
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
                  <div className="mx-auto size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="mt-4 text-sm text-muted-foreground">Activating your account...</p>
                </motion.div>
              )}

              {step === 7 && (
                <motion.div key="step7" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40"
                  >
                    <CheckCircle2 className="size-10 text-emerald-600" />
                  </motion.div>
                  <h2 className="mt-6 text-xl font-bold">Account Activated Successfully!</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Redirecting to login page...</p>
                  <Button className="mt-6 rounded-xl" asChild>
                    <Link to="/login" onClick={() => prefillLoginRole('pensioner')}>
                      Go to Login
                    </Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className={cn('mt-6 text-center text-sm text-muted-foreground', step === 7 && 'hidden')}>
              Already activated?{' '}
              <Link
                to="/login"
                onClick={() => prefillLoginRole('pensioner')}
                className="font-medium text-primary hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
