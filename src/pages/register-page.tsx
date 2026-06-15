import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, MapPin, Shield, User } from 'lucide-react'
import { useState } from 'react'

import { AuthIllustration } from '@/components/auth/auth-illustration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const steps = [
  { title: 'Personal Details', icon: User },
  { title: 'Identity Details', icon: Shield },
  { title: 'Address', icon: MapPin },
  { title: 'Account Setup', icon: Shield },
  { title: 'Complete', icon: Check },
]

export function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0)

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0))

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <AuthIllustration />

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-icy-blue-500 to-icy-blue-600">
                <span className="text-sm font-bold text-white">PF</span>
              </div>
              <span className="text-lg font-bold">
                PensionFlow <span className="text-icy-blue-500">AI</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                <div key={step.title} className="flex flex-1 items-center">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full border-2 transition-all',
                      i < currentStep
                        ? 'border-icy-blue-500 bg-icy-blue-500 text-white'
                        : i === currentStep
                          ? 'border-icy-blue-500 bg-icy-blue-500/20 text-icy-blue-300'
                          : 'border-border bg-muted/50 text-muted-foreground',
                    )}
                  >
                    {i < currentStep ? (
                      <Check className="size-4" />
                    ) : (
                      <step.icon className="size-4" />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        'mx-1 h-0.5 flex-1 transition-colors',
                        i < currentStep ? 'bg-icy-blue-500' : 'bg-border',
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>

          <div className="card-surface p-8 shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold">Personal Details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input placeholder="Rajesh" className="rounded-xl border-border bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input placeholder="Kumar" className="rounded-xl border-border bg-muted/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" className="rounded-xl border-border bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input placeholder="+91 98765 43210" className="rounded-xl border-border bg-muted/50" />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold">Identity Details</h2>
                    <div className="space-y-2">
                      <Label>Aadhaar Number</Label>
                      <Input placeholder="XXXX XXXX XXXX" className="rounded-xl border-border bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>PAN Number</Label>
                      <Input placeholder="ABCDE1234F" className="rounded-xl border-border bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input placeholder="EMP-2020-12345" className="rounded-xl border-border bg-muted/50" />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold">Address</h2>
                    <div className="space-y-2">
                      <Label>Street Address</Label>
                      <Input placeholder="123 Government Colony" className="rounded-xl border-border bg-muted/50" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input placeholder="New Delhi" className="rounded-xl border-border bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input placeholder="Delhi" className="rounded-xl border-border bg-muted/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>PIN Code</Label>
                      <Input placeholder="110001" className="rounded-xl border-border bg-muted/50" />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold">Account Setup</h2>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="officer@gov.in" className="rounded-xl border-border bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" placeholder="••••••••" className="rounded-xl border-border bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" placeholder="••••••••" className="rounded-xl border-border bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input placeholder="Finance Department" className="rounded-xl border-border bg-muted/50" />
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="py-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-500/20"
                    >
                      <Check className="size-10 text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold">Registration Complete!</h2>
                    <p className="mt-3 text-muted-foreground">
                      Your account has been created. You can now access the PensionFlow AI platform.
                    </p>
                    <Button className="mt-8 rounded-xl bg-icy-blue-500" asChild>
                      <Link to="/login">Go to Login</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {currentStep < 4 && (
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={prev}
                  disabled={currentStep === 0}
                  className="rounded-xl border-border"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button onClick={next} className="rounded-xl bg-icy-blue-500">
                  {currentStep === 3 ? 'Complete' : 'Continue'}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-icy-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
