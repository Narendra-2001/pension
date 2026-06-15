import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { FileCheck, Heart, Lock, Shield, Smartphone, Sparkles, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { NomineeStepIndicator } from '@/components/nominee/nominee-step-indicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  DEMO_NOMINEE_CREDENTIALS,
  saveNomineeSession,
  validateNomineeCredentials,
  validateNomineeOtp,
} from '@/lib/nominee-auth'
import { nomineeLoginSchema } from '@/lib/demise-schema'
import type { NomineeLoginFormValues } from '@/lib/demise-schema'

const LOGIN_STEPS = [
  { id: 'credentials', label: 'Verify Identity', description: 'PPO & mobile' },
  { id: 'otp', label: 'OTP Confirmation', description: '6-digit code' },
  { id: 'access', label: 'Portal Access', description: 'Submit intimation' },
]

const FEATURES = [
  {
    icon: Shield,
    label: 'Secure, OTP-verified access',
    desc: 'Your identity is confirmed before anything is shown',
  },
  {
    icon: FileCheck,
    label: 'Report demise online',
    desc: 'Submit the intimation without visiting an office',
  },
  {
    icon: UserCheck,
    label: 'Track every step',
    desc: 'Follow the status of your submission in real time',
  },
]

const HOW_IT_WORKS = [
  'Use the registered nominee mobile number linked to the PPO',
  'A one-time password is sent for identity verification',
  'Submit the demise intimation with supporting documents',
]

export function NomineeLoginPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otp, setOtp] = useState('')
  const [pendingSession, setPendingSession] = useState<ReturnType<typeof validateNomineeCredentials>>(null)

  const form = useForm<NomineeLoginFormValues>({
    resolver: zodResolver(nomineeLoginSchema),
    defaultValues: {
      ppoNumber: DEMO_NOMINEE_CREDENTIALS.ppoNumber,
      mobileNumber: DEMO_NOMINEE_CREDENTIALS.mobile,
    },
  })

  const currentStepIndex = step === 'credentials' ? 0 : 1

  const onCredentialsSubmit = form.handleSubmit((values) => {
    const session = validateNomineeCredentials(values.ppoNumber, values.mobileNumber)
    if (!session) {
      toast.error('Invalid credentials', {
        description: 'PPO number and nominee mobile number do not match our records.',
      })
      return
    }
    setPendingSession(session)
    setStep('otp')
    toast.info('OTP sent', { description: `Demo OTP: ${DEMO_NOMINEE_CREDENTIALS.otp}` })
  })

  const onOtpVerify = () => {
    if (!validateNomineeOtp(otp)) {
      toast.error('Invalid OTP', { description: 'Please enter the correct 6-digit OTP.' })
      return
    }
    if (!pendingSession) return
    saveNomineeSession(pendingSession)
    toast.success('Verified successfully', {
      description: `Welcome, ${pendingSession.nomineeName}`,
    })
    navigate({ to: '/nominee/demise' })
  }

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 xl:gap-16">
      {/* Left panel — assurance & narrative */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:block"
      >
        <div className="sticky top-24">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-icy-blue-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-icy-blue-700 shadow-sm backdrop-blur-sm dark:border-icy-blue-900/50 dark:bg-icy-blue-950/40 dark:text-icy-blue-300"
          >
            <Sparkles className="size-3.5" />
            Nominee Access Portal
          </motion.span>

          <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight xl:text-[2.75rem]">
            Report a demise with
            <br />
            <span className="text-gradient">care &amp; dignity</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            A dedicated, secure space for nominees to report the passing of a pensioner.
            Verify your identity and submit the intimation — no pensioner account access required.
          </p>

          {/* Assurance card */}
          <div className="nominee-frame nominee-glow mt-9 overflow-hidden rounded-3xl bg-card/70 p-6 backdrop-blur-xl">
            {/* emblem header */}
            <div className="flex items-center gap-4">
              <div className="nominee-halo relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-icy-blue-500 to-indigo-600 text-white shadow-lg">
                <Heart className="size-8" />
              </div>
              <div>
                <p className="text-sm font-semibold">A gentle, guided process</p>
                <p className="text-xs text-muted-foreground">
                  Built to support you at a difficult time
                </p>
              </div>
            </div>

            <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* feature rows */}
            <div className="grid gap-3">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="group flex items-start gap-3.5 rounded-2xl border border-transparent p-2.5 transition-colors hover:border-icy-blue-200/60 hover:bg-icy-blue-50/60 dark:hover:border-icy-blue-900/40 dark:hover:bg-icy-blue-950/30"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-icy-blue-100 text-icy-blue-600 transition-transform duration-300 group-hover:scale-110 dark:bg-icy-blue-950/60 dark:text-icy-blue-400">
                    <feature.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{feature.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How it works strip */}
          <div className="mt-6 grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              How it works
            </p>
            {HOW_IT_WORKS.map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-icy-blue-500 to-icy-blue-600 text-[10px] font-bold text-white shadow-sm">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right panel — login form */}
      <div className="mx-auto w-full min-w-0 max-w-lg">
        {/* Mobile header */}
        <div className="mb-7 text-center lg:hidden">
          <motion.div
            className="nominee-halo mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-icy-blue-500 to-indigo-600 text-white shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Heart className="size-8" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">Nominee Access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verify your identity to report the demise of a pensioner
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="nominee-frame nominee-glow overflow-hidden rounded-3xl border-0 bg-card/80 backdrop-blur-xl">
            <div className="nominee-shimmer-line h-1 w-full" />
            <CardContent className="p-6 sm:p-8">
              <div className="mb-7 hidden text-center lg:block">
                <h2 className="text-xl font-bold tracking-tight">Verify your identity</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Two quick steps to access the portal
                </p>
              </div>

              <NomineeStepIndicator steps={LOGIN_STEPS} currentStep={currentStepIndex} className="mb-8" />

              <AnimatePresence mode="wait">
                {step === 'credentials' ? (
                  <motion.div
                    key="credentials"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-icy-blue-200/50 bg-icy-blue-50/50 px-4 py-3 dark:border-icy-blue-900/40 dark:bg-icy-blue-950/20">
                      <Smartphone className="size-4 shrink-0 text-icy-blue-500" />
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Enter the PPO number and the nominee mobile registered with the pension account.
                      </p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={onCredentialsSubmit} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="ppoNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PPO Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="PPO123456"
                                  className="h-11 rounded-xl transition-shadow focus-visible:ring-icy-blue-500/40"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mobileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nominee Mobile Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="10-digit mobile"
                                  className="h-11 rounded-xl transition-shadow focus-visible:ring-icy-blue-500/40"
                                  maxLength={10}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            type="submit"
                            className="nominee-cta h-12 w-full rounded-xl bg-gradient-to-r from-icy-blue-500 to-indigo-600 text-base font-semibold shadow-lg shadow-icy-blue-500/25 hover:from-icy-blue-600 hover:to-indigo-700"
                          >
                            Send OTP
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <Smartphone className="size-3.5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                          OTP sent to {pendingSession?.nomineeMobile}
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                          Enter the 6-digit code to verify your identity
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center py-2">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup className="gap-2.5">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="size-12 rounded-xl border-2 text-lg font-semibold shadow-sm transition-all data-[active=true]:border-icy-blue-500 data-[active=true]:ring-4 data-[active=true]:ring-icy-blue-500/15"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        className="nominee-cta h-12 w-full rounded-xl bg-gradient-to-r from-icy-blue-500 to-indigo-600 text-base font-semibold shadow-lg shadow-icy-blue-500/25 hover:from-icy-blue-600 hover:to-indigo-700 disabled:shadow-none"
                        onClick={onOtpVerify}
                        disabled={otp.length !== 6}
                      >
                        Verify &amp; Continue
                      </Button>
                    </motion.div>
                    <Button
                      variant="ghost"
                      className="w-full rounded-xl text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setStep('credentials')
                        setOtp('')
                      }}
                    >
                      ← Back to credentials
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="nominee-frame mt-4 flex items-start gap-3 rounded-2xl bg-blue-50/50 p-4 backdrop-blur-sm dark:bg-blue-950/20">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
              <Lock className="size-4" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-blue-800 dark:text-blue-200">Secure nominee access</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-700/80 dark:text-blue-300/80">
                Nominees never access the pensioner account. Demo credentials — PPO{' '}
                <strong>{DEMO_NOMINEE_CREDENTIALS.ppoNumber}</strong>, Mobile{' '}
                <strong>{DEMO_NOMINEE_CREDENTIALS.mobile}</strong>, OTP{' '}
                <strong>{DEMO_NOMINEE_CREDENTIALS.otp}</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
