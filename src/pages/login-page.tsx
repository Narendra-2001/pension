import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { CircleCheck, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthIllustration } from '@/components/auth/auth-illustration'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  DEMO_PASSWORD,
  getDemoPassword,
  getRoleTile,
  isNomineeDemoTile,
  LOGIN_DEMO_TILES,
  NOMINEE_DEMO_OTP,
  NOMINEE_DEMO_TILE,
  PENSIONER_DEMO_PASSWORD,
  PENSIONER_DEMO_PPONumbers,
  ROLE_TILES,
  type LoginPortalRole,
} from '@/config/demo-roles'
import { rolePath } from '@/lib/auth'
import { consumePrefillLoginRole } from '@/lib/login-prefill'
import {
  saveNomineeSession,
  validateNomineeCredentials,
  validateNomineeOtp,
} from '@/lib/nominee-auth'
import { isRegisteredPensionerPpo } from '@/lib/pensioner-auth'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/types/auth'

const nomineeLoginSchema = z.object({
  ppoNumber: z.string().min(3, 'PPO number is required'),
  mobileNumber: z
    .string()
    .min(10, 'Valid mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
})

type NomineeLoginFormValues = z.infer<typeof nomineeLoginSchema>

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginSchema>

const defaultRole = ROLE_TILES[0]

function getInitialRoleFromUrl(): LoginPortalRole | undefined {
  const fromSession = consumePrefillLoginRole()
  if (fromSession === 'nominee') return 'nominee'
  if (fromSession && ROLE_TILES.some((t) => t.role === fromSession)) {
    return fromSession as UserRole
  }
  const role = new URLSearchParams(window.location.search).get('role')
  if (role === 'nominee') return 'nominee'
  if (role && ROLE_TILES.some((t) => t.role === role)) {
    return role as UserRole
  }
  return undefined
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeRole, setActiveRole] = useState<LoginPortalRole>(defaultRole.role)
  const [nomineeOtpSent, setNomineeOtpSent] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const initialRole = getInitialRoleFromUrl()
  const initialTile = initialRole === 'nominee'
    ? NOMINEE_DEMO_TILE
    : initialRole
      ? ROLE_TILES.find((t) => t.role === initialRole) ?? defaultRole
      : defaultRole

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: isNomineeDemoTile(initialTile) ? NOMINEE_DEMO_TILE.ppoNumber : initialTile.username,
      password: isNomineeDemoTile(initialTile) ? NOMINEE_DEMO_TILE.mobile : getDemoPassword(
        isNomineeDemoTile(initialTile) ? 'pensioner' : initialTile.role,
      ),
      rememberMe: false,
    },
  })

  const nomineeForm = useForm<NomineeLoginFormValues>({
    resolver: zodResolver(nomineeLoginSchema),
    defaultValues: {
      ppoNumber: NOMINEE_DEMO_TILE.ppoNumber,
      mobileNumber: NOMINEE_DEMO_TILE.mobile,
    },
  })

  const username = form.watch('username')
  const isPensioner = activeRole === 'pensioner'
  const isNominee = activeRole === 'nominee'

  useEffect(() => {
    if (initialRole === 'nominee') {
      setActiveRole('nominee')
      nomineeForm.reset({
        ppoNumber: NOMINEE_DEMO_TILE.ppoNumber,
        mobileNumber: NOMINEE_DEMO_TILE.mobile,
      })
      return
    }
    if (initialRole) {
      const tile = ROLE_TILES.find((t) => t.role === initialRole)
      if (tile) {
        setActiveRole(tile.role)
        form.setValue('username', tile.username, { shouldValidate: true })
        form.setValue('password', getDemoPassword(tile.role))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRole])

  const selectRole = (tile: (typeof LOGIN_DEMO_TILES)[number]) => {
    if (isNomineeDemoTile(tile)) {
      setActiveRole('nominee')
      nomineeForm.reset({
        ppoNumber: tile.ppoNumber,
        mobileNumber: tile.mobile,
      })
      setNomineeOtpSent(false)
      setOtp('')
      setShowOtp(false)
      return
    }

    setActiveRole(tile.role)
    form.setValue('username', tile.username, { shouldValidate: true })
    form.setValue('password', getDemoPassword(tile.role))
    setNomineeOtpSent(false)
    if (tile.role !== 'pensioner') {
      setShowOtp(false)
      setOtp('')
    }
  }

  const onNomineeCredentialsSubmit = nomineeForm.handleSubmit(() => {
    const values = nomineeForm.getValues()
    const session = validateNomineeCredentials(values.ppoNumber, values.mobileNumber)
    if (!session) {
      toast.error('Invalid credentials', {
        description: 'PPO number and nominee mobile number do not match our records.',
      })
      return
    }
    setNomineeOtpSent(true)
    toast.info('OTP sent', { description: `Demo OTP: ${NOMINEE_DEMO_OTP}` })
  })

  const onNomineeVerify = () => {
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }
    if (!validateNomineeOtp(otp)) {
      toast.error('Invalid OTP')
      return
    }
    const values = nomineeForm.getValues()
    const session = validateNomineeCredentials(values.ppoNumber, values.mobileNumber)
    if (!session) {
      toast.error('Invalid credentials')
      return
    }
    saveNomineeSession(session)
    toast.success(`Welcome, ${session.nomineeName}`)
    navigate({ to: '/nominee/demise' })
  }

  const onSubmit = async (values: LoginFormValues) => {
    if (isPensioner && showOtp && otp.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }
    setIsLoading(true)
    try {
      const user = await login(values.username, values.password, values.rememberMe)
      if (user) {
        toast.success(`Welcome back, ${user.name}`)
        navigate({ to: rolePath(user.role) })
      } else {
        toast.error('Invalid credentials', {
          description: isPensioner
            ? 'Please check your PPO number and password'
            : 'Please check your username and password',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderRoleTile = (tile: (typeof LOGIN_DEMO_TILES)[number]) => {
    const isActive = isNomineeDemoTile(tile)
      ? activeRole === 'nominee'
      : tile.role === 'pensioner'
        ? activeRole === 'pensioner'
        : username.toLowerCase() === tile.username.toLowerCase() ||
          activeRole === tile.role

    return (
      <button
        key={isNomineeDemoTile(tile) ? 'nominee' : tile.username}
        type="button"
        onClick={() => selectRole(tile)}
        className={cn(
          'group/role relative rounded-xl border bg-card/70 p-2.5 text-left transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-icy-blue-500',
          isActive
            ? 'border-icy-blue-500/45 bg-icy-blue-50/50 shadow-md shadow-icy-blue-500/10 ring-2 ring-icy-blue-500/30 dark:bg-icy-blue-950/30'
            : 'border-border/70 hover:-translate-y-0.5 hover:border-icy-blue-200 hover:bg-icy-blue-50/30 hover:shadow-sm',
        )}
      >
        <div
          className={cn(
            'flex size-9 items-center justify-center rounded-lg ring-1 ring-foreground/[0.04]',
            tile.tile,
          )}
        >
          <tile.Icon className={cn('size-4', tile.iconColor)} strokeWidth={2.2} />
        </div>
        <div className="mt-2 text-[13px] font-semibold leading-tight">{tile.label}</div>
        <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{tile.sub}</div>
        {isActive && (
          <CircleCheck
            className="absolute right-2 top-2 size-4 text-icy-blue-500"
            strokeWidth={2.4}
          />
        )}
      </button>
    )
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <AuthIllustration />

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-icy-blue-500 to-icy-blue-600 shadow-lg glow-blue">
                <span className="text-sm font-bold text-white">PF</span>
              </div>
              <span className="text-lg font-bold">
                PensionFlow <span className="text-icy-blue-500">AI</span>
              </span>
            </Link>
          </div>

          <div className="card-surface p-8 shadow-xl">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a demo role — credentials autofill
            </p>

            <div className="mt-6">
              <p className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Demo Role
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LOGIN_DEMO_TILES.map(renderRoleTile)}
              </div>
            </div>

            {isNominee ? (
              <Form {...nomineeForm}>
                <div className="mt-6 space-y-5">
                  <FormField
                    control={nomineeForm.control}
                    name="ppoNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PPO Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input {...field} placeholder="PPO123456" className="rounded-xl pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={nomineeForm.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominee Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input {...field} placeholder="10-digit mobile" className="rounded-xl pl-10" maxLength={10} />
                          </div>
                        </FormControl>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          Demo: PPO{' '}
                          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{NOMINEE_DEMO_TILE.ppoNumber}</code>
                          {' · '}
                          Mobile{' '}
                          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{NOMINEE_DEMO_TILE.mobile}</code>
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {nomineeOtpSent && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">OTP Verification</p>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, i) => (
                              <InputOTPSlot key={i} index={i} className="rounded-xl" />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <p className="text-center text-[11px] text-muted-foreground">
                        Demo OTP:{' '}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{NOMINEE_DEMO_OTP}</code>
                      </p>
                    </div>
                  )}

                  {!nomineeOtpSent ? (
                    <Button
                      type="button"
                      className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
                      size="lg"
                      disabled={isLoading}
                      onClick={onNomineeCredentialsSubmit}
                    >
                      Send OTP
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
                      size="lg"
                      disabled={isLoading || otp.length !== 6}
                      onClick={onNomineeVerify}
                    >
                      Verify & Continue to Demise Intimation
                    </Button>
                  )}
                </div>
              </Form>
            ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isPensioner ? 'PPO Number' : 'Username'}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder={isPensioner ? 'Enter PPO Number' : 'Enter username'}
                            className="rounded-xl pl-10"
                            autoComplete="username"
                            onChange={(e) => {
                              field.onChange(e)
                              const value = e.target.value.trim()
                              const tile = getRoleTile(value)
                              if (tile) {
                                setActiveRole(tile.role)
                              } else if (isRegisteredPensionerPpo(value)) {
                                setActiveRole('pensioner')
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      {isPensioner && (
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          Demo PPO numbers:{' '}
                          {PENSIONER_DEMO_PPONumbers.map(({ ppo, hint }, i) => (
                            <span key={ppo}>
                              {i > 0 && ' · '}
                              <button
                                type="button"
                                className="font-mono text-icy-blue-600 hover:underline dark:text-icy-blue-400"
                                onClick={() => {
                                  form.setValue('username', ppo, { shouldValidate: true })
                                  setActiveRole('pensioner')
                                  form.setValue('password', PENSIONER_DEMO_PASSWORD)
                                }}
                              >
                                {ppo}
                              </button>{' '}
                              ({hint})
                            </span>
                          ))}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            className="rounded-xl pl-10 pr-10"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">Remember Me</FormLabel>
                      </FormItem>
                    )}
                  />
                  <button type="button" className="text-sm text-icy-blue-500 hover:underline">
                    Forgot Password?
                  </button>
                </div>

                {isPensioner && showOtp && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">OTP Verification (Optional)</p>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <InputOTPSlot key={i} index={i} className="rounded-xl" />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in to PensionFlow'}
                </Button>

                {isPensioner && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => setShowOtp(!showOtp)}
                  >
                    {showOtp ? 'Hide OTP Verification' : 'Enable OTP Verification'}
                  </Button>
                )}
              </form>
            </Form>
            )}

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Officer password:{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{DEMO_PASSWORD}</code>
              {' · '}
              Pensioner password:{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{PENSIONER_DEMO_PASSWORD}</code>
              {isNominee && (
                <>
                  {' · '}
                  Nominee OTP:{' '}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{NOMINEE_DEMO_OTP}</code>
                </>
              )}
            </p>

            {isPensioner && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                New pensioner?{' '}
                <Link to="/pensioner/activate" className="font-medium text-icy-blue-500 hover:underline">
                  Activate your account
                </Link>
              </p>
            )}

            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/" className="font-medium text-icy-blue-500 hover:underline">
                ← Back to Home
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
