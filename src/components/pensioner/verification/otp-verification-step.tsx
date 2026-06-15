import { motion } from 'framer-motion'
import { Loader2, Phone, RefreshCw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const DEMO_OTP = '123456'
const RESEND_COOLDOWN = 30

interface OtpVerificationStepProps {
  maskedMobile?: string
  onVerified: () => void
}

export function OtpVerificationStep({
  maskedMobile = '98XX XX 4521',
  onVerified,
}: OtpVerificationStepProps) {
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN)
  const [otpSent, setOtpSent] = useState(true)
  const verifyAttemptedRef = useRef(false)

  useEffect(() => {
    verifyAttemptedRef.current = false
  }, [otp])

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = window.setInterval(() => {
      setResendTimer((t) => Math.max(0, t - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendTimer])

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      toast.error('Enter the complete 6-digit OTP')
      return
    }

    setIsVerifying(true)
    await new Promise((r) => setTimeout(r, 1200))

    if (otp === DEMO_OTP) {
      setIsVerified(true)
      toast.success('Mobile number verified')
      setTimeout(onVerified, 600)
    } else {
      toast.error('Invalid OTP. Use 123456 for demo.')
    }
    setIsVerifying(false)
  }, [otp, onVerified])

  const handleResend = () => {
    if (resendTimer > 0) return
    setResendTimer(RESEND_COOLDOWN)
    setOtp('')
    setOtpSent(true)
    toast.success('OTP resent to your registered mobile')
  }

  useEffect(() => {
    if (otp.length === 6 && !isVerified && !isVerifying && !verifyAttemptedRef.current) {
      verifyAttemptedRef.current = true
      void handleVerify()
    }
  }, [otp, isVerified, isVerifying, handleVerify])

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-semibold">OTP Verification</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          A one-time password has been sent to your registered mobile number
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-sm rounded-2xl border border-border/60 bg-muted/30 p-5"
      >
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <Phone className="size-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">OTP sent to</p>
            <p className="font-mono text-sm font-semibold tracking-wider">{maskedMobile}</p>
          </div>
          {otpSent && (
            <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Sent
            </span>
          )}
        </div>

        <div className="flex justify-center py-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isVerified || isVerifying}
          >
            <InputOTPGroup className="gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="size-12 rounded-xl border-2 text-lg font-semibold"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Demo OTP: {DEMO_OTP}</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="inline-flex items-center gap-1 font-medium text-primary disabled:opacity-50"
          >
            <RefreshCw className="size-3" />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </div>
      </motion.div>

      {isVerified && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          <ShieldCheck className="size-4" />
          Mobile number verified successfully
        </motion.div>
      )}

      <div className="flex justify-center">
        <Button
          className="rounded-xl px-8"
          onClick={() => void handleVerify()}
          disabled={otp.length !== 6 || isVerifying || isVerified}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Verifying...
            </>
          ) : isVerified ? (
            'Verified'
          ) : (
            'Verify OTP'
          )}
        </Button>
      </div>
    </div>
  )
}
