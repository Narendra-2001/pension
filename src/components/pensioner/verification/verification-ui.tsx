import { motion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface VerificationProgressBarProps {
  progress: number
  label?: string
  className?: string
}

export function VerificationProgressBar({
  progress,
  label,
  className,
}: VerificationProgressBarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium tabular-nums">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

interface VerificationScoreCardProps {
  title: string
  score: number
  timestamp: string
  passed?: boolean
  details?: { label: string; value: string }[]
}

export function VerificationScoreCard({
  title,
  score,
  timestamp,
  passed = score >= 85,
  details = [],
}: VerificationScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border p-4',
        passed ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{timestamp}</p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              'text-2xl font-bold tabular-nums',
              passed ? 'text-emerald-600' : 'text-amber-600',
            )}
          >
            {score}%
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {passed ? 'Passed' : 'Review'}
          </p>
        </div>
      </div>
      {details.length > 0 && (
        <div className="mt-3 grid gap-1.5 border-t border-border/40 pt-3 sm:grid-cols-2">
          {details.map((item) => (
            <div key={item.label} className="text-xs">
              <span className="text-muted-foreground">{item.label}: </span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

interface CameraFrameProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  capturedImage?: string | null
  scanning?: boolean
  status?: 'idle' | 'detecting' | 'success' | 'error'
  hint?: string
  className?: string
}

export function CameraFrame({
  videoRef,
  capturedImage,
  scanning = false,
  status = 'idle',
  hint,
  className,
}: CameraFrameProps) {
  return (
    <div className={cn('relative mx-auto w-full max-w-sm', className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-neutral-950 shadow-[0_8px_32px_rgba(15,23,42,0.12)] ring-1 ring-border/50">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured face" className="size-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            className="size-full scale-x-[-1] object-cover"
            autoPlay
            playsInline
            muted
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-black/50" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-black/30" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'relative h-[72%] w-[58%] rounded-[50%] border-2 transition-colors duration-500',
              status === 'success'
                ? 'border-emerald-400'
                : status === 'detecting'
                  ? 'border-primary'
                  : 'border-white/50',
            )}
          >
            {scanning && (
              <motion.div
                className="absolute inset-x-4 h-0.5 rounded-full bg-primary"
                animate={{ top: ['15%', '85%', '15%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <span className="absolute left-0 top-0 size-6 rounded-tl-lg border-l-2 border-t-2 border-primary" />
            <span className="absolute right-0 top-0 size-6 rounded-tr-lg border-r-2 border-t-2 border-primary" />
            <span className="absolute bottom-0 left-0 size-6 rounded-bl-lg border-b-2 border-l-2 border-primary" />
            <span className="absolute bottom-0 right-0 size-6 rounded-br-lg border-b-2 border-r-2 border-primary" />
          </div>
        </div>

        <div className="absolute inset-x-0 top-4 flex justify-center">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold',
              status === 'success'
                ? 'bg-emerald-600/90 text-white'
                : status === 'detecting'
                  ? 'bg-primary/90 text-primary-foreground'
                  : 'bg-black/60 text-white',
            )}
          >
            {status === 'detecting' && <Loader2 className="size-3 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="size-3" />}
            {status === 'detecting'
              ? 'Analyzing...'
              : status === 'success'
                ? 'Verified'
                : 'Live Camera'}
          </span>
        </div>

        {hint && (
          <p className="absolute inset-x-0 bottom-4 text-center text-xs font-medium text-white drop-shadow-sm">
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}
