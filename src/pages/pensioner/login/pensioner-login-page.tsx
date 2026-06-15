import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Eye, EyeOff, FileText, Lock } from 'lucide-react'
import { useState } from 'react'
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
import { DEMO_PENSIONER_CREDENTIALS } from '@/lib/pensioner-auth'
import { useAuth } from '@/providers/auth-provider'

const loginSchema = z.object({
  ppoNumber: z.string().min(1, 'PPO number is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function PensionerLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { loginPensioner } = useAuth()
  const navigate = useNavigate()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      ppoNumber: DEMO_PENSIONER_CREDENTIALS.ppoNumber,
      password: DEMO_PENSIONER_CREDENTIALS.password,
      rememberMe: false,
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    if (showOtp && otp.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }
    setIsLoading(true)
    try {
      const user = await loginPensioner(values.ppoNumber, values.password, values.rememberMe)
      if (user) {
        toast.success(`Welcome, ${user.name}`)
        navigate({ to: '/pensioner/dashboard' })
      } else {
        toast.error('Invalid credentials', {
          description: 'Please check your PPO number and password',
        })
      }
    } finally {
      setIsLoading(false)
    }
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
          <div className="card-surface p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Pensioner Login</h1>
                <p className="text-sm text-muted-foreground">Access your pension self-service portal</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="ppoNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PPO Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter PPO Number" className="rounded-xl" />
                      </FormControl>
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
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </button>
                </div>

                {showOtp && (
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
                  className="w-full rounded-xl"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Login'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setShowOtp(!showOtp)}
                >
                  {showOtp ? 'Hide OTP Verification' : 'Enable OTP Verification'}
                </Button>
              </form>
            </Form>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Demo: PPO <code className="rounded bg-muted px-1">{DEMO_PENSIONER_CREDENTIALS.ppoNumber}</code>{' '}
              / Password <code className="rounded bg-muted px-1">{DEMO_PENSIONER_CREDENTIALS.password}</code>
            </p>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              New pensioner?{' '}
              <Link to="/pensioner/activate" className="font-medium text-primary hover:underline">
                Activate your account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
