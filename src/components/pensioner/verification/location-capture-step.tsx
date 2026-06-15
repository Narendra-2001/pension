import { motion } from 'framer-motion'
import { Crosshair, Loader2, MapPin, Navigation, RefreshCw, Shield } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  captureGeoLocation,
  formatCaptureTimestamp,
  reverseGeocodeLabel,
} from '@/lib/verification-capture'
import type { VerificationGeoLocation } from '@/types/verification-submission'

import { VerificationProgressBar } from './verification-ui'

const CAPTURE_PHASES = [
  { label: 'Requesting GPS permission', duration: 800 },
  { label: 'Acquiring satellite signal', duration: 1200 },
  { label: 'Triangulating position', duration: 1000 },
  { label: 'Pinpointing coordinates', duration: 900 },
  { label: 'Resolving address', duration: 700 },
]

interface LocationCaptureStepProps {
  location: VerificationGeoLocation | null
  onCaptured: (location: VerificationGeoLocation) => void
  onContinue: () => void
}

export function LocationCaptureStep({
  location,
  onCaptured,
  onContinue,
}: LocationCaptureStepProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (location) setMapReady(true)
  }, [location])

  const runCaptureAnimation = useCallback(async () => {
    setIsCapturing(true)
    setProgress(0)
    setPhaseIndex(0)
    setMapReady(false)

    let elapsed = 0
    const totalDuration = CAPTURE_PHASES.reduce((sum, p) => sum + p.duration, 0)

    for (let i = 0; i < CAPTURE_PHASES.length; i++) {
      setPhaseIndex(i)
      const phase = CAPTURE_PHASES[i]
      const phaseEnd = elapsed + phase.duration

      await new Promise<void>((resolve) => {
        const tick = window.setInterval(() => {
          elapsed += 50
          setProgress(Math.min(95, (elapsed / totalDuration) * 100))
          if (elapsed >= phaseEnd) {
            window.clearInterval(tick)
            resolve()
          }
        }, 50)
      })

      elapsed = phaseEnd
    }

    try {
      const captured = await captureGeoLocation()
      const label = await reverseGeocodeLabel(captured.latitude, captured.longitude)
      const result = { ...captured, label }
      setProgress(100)
      setMapReady(true)
      onCaptured(result)
      toast.success('Location verified')
    } finally {
      setIsCapturing(false)
    }
  }, [onCaptured])

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Geo-location Verification</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your location is captured for audit compliance and fraud prevention
        </p>
      </div>

      {/* Map visualization */}
      <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-inner">
        <div className="relative aspect-[16/10]">
          {/* Grid map background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute inset-0 bg-sky-50/40" />

          {/* Roads */}
          <div className="absolute left-[20%] top-0 h-full w-1 bg-border/40" />
          <div className="absolute left-[60%] top-0 h-full w-0.5 bg-border/30" />
          <div className="absolute left-0 top-[40%] h-0.5 w-full bg-border/40" />
          <div className="absolute left-0 top-[70%] h-1 w-full bg-border/30" />

          {/* Scanning overlay while capturing */}
          {isCapturing && (
            <motion.div
              className="absolute inset-0 bg-primary/5"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Location pin */}
          {(mapReady || location) && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+8px)]">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <span className="absolute left-1/2 top-full size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 animate-ping" />
                <MapPin className="relative size-10 fill-primary text-primary drop-shadow-lg" />
              </motion.div>
            </div>
          )}

          {/* Crosshair while searching */}
          {isCapturing && !mapReady && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Crosshair className="size-12 text-primary/60" />
            </motion.div>
          )}

          {/* Status bar */}
          <div className="absolute inset-x-0 bottom-0 border-t border-border/40 bg-card/95 p-4 pt-6 backdrop-blur-sm">
            {isCapturing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  {CAPTURE_PHASES[phaseIndex]?.label}
                </div>
                <VerificationProgressBar progress={progress} />
              </div>
            ) : location ? (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <Navigation className="size-4 text-emerald-600" />
                  Location captured
                </p>
                <p className="text-xs text-muted-foreground">
                  {location.label ?? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tap below to capture your current location</p>
            )}
          </div>
        </div>
      </div>

      {/* Location details card */}
      {location && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Coordinates
              </p>
              <p className="mt-0.5 font-mono text-sm">
                {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E
              </p>
            </div>
            {location.accuracy && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Accuracy
                </p>
                <p className="mt-0.5 text-sm font-medium">±{Math.round(location.accuracy)} metres</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Address
              </p>
              <p className="mt-0.5 text-sm">{location.label ?? 'Address resolved from GPS'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Captured at
              </p>
              <p className="mt-0.5 text-sm">{formatCaptureTimestamp(location.capturedAt)}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <Shield className="size-4 shrink-0 text-primary" />
        Location data is encrypted and used only for verification audit purposes.
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          className="rounded-xl"
          onClick={() => void runCaptureAnimation()}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Capturing...
            </>
          ) : location ? (
            <>
              <RefreshCw className="mr-2 size-4" />
              Recapture Location
            </>
          ) : (
            <>
              <MapPin className="mr-2 size-4" />
              Capture Location
            </>
          )}
        </Button>
        {location && (
          <Button className="rounded-xl" variant="default" onClick={onContinue}>
            Continue to OTP
          </Button>
        )}
      </div>
    </div>
  )
}
