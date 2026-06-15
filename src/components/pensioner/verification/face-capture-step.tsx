import { motion } from 'framer-motion'
import { AlertCircle, Camera, RefreshCw, Scan } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useCameraStream } from '@/hooks/use-camera-stream'
import {
  formatCaptureTimestamp,
  generateFaceMatchScore,
} from '@/lib/verification-capture'

import {
  CameraFrame,
  VerificationProgressBar,
  VerificationScoreCard,
} from './verification-ui'

const ANALYSIS_STEPS = [
  'Detecting face boundaries',
  'Checking image quality',
  'Matching with registered photo',
  'Computing biometric score',
]

interface FaceCaptureStepProps {
  onComplete: (result: {
    timestamp: string
    score: number
    imageDataUrl: string
  }) => void
  onContinue?: () => void
}

export function FaceCaptureStep({ onComplete, onContinue }: FaceCaptureStepProps) {
  const { videoRef, isReady, error, startCamera, stopCamera, captureFrame } = useCameraStream()
  const [phase, setPhase] = useState<'preview' | 'analyzing' | 'done'>('preview')
  const [progress, setProgress] = useState(0)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [timestamp, setTimestamp] = useState<string | null>(null)

  useEffect(() => {
    void startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const runAnalysis = useCallback(
    (imageDataUrl: string) => {
      setPhase('analyzing')
      setProgress(0)
      setAnalysisStep(0)

      const duration = 3200
      const start = Date.now()

      const interval = window.setInterval(() => {
        const elapsed = Date.now() - start
        const pct = Math.min(100, (elapsed / duration) * 100)
        setProgress(pct)
        setAnalysisStep(Math.min(ANALYSIS_STEPS.length - 1, Math.floor((pct / 100) * ANALYSIS_STEPS.length)))

        if (elapsed >= duration) {
          window.clearInterval(interval)
          const finalScore = generateFaceMatchScore()
          const capturedAt = new Date().toISOString()
          setScore(finalScore)
          setTimestamp(capturedAt)
          setPhase('done')
          onComplete({ timestamp: capturedAt, score: finalScore, imageDataUrl })
          toast.success('Face matched successfully')
        }
      }, 80)

      return () => window.clearInterval(interval)
    },
    [onComplete],
  )

  const handleCapture = () => {
    const frame = captureFrame()
    if (!frame) {
      toast.error('Could not capture frame. Ensure your face is visible.')
      return
    }
    setCapturedImage(frame)
    stopCamera()
    runAnalysis(frame)
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setScore(null)
    setTimestamp(null)
    setPhase('preview')
    setProgress(0)
    void startCamera()
  }

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <AlertCircle className="size-10 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button className="rounded-xl" onClick={() => void startCamera()}>
            <RefreshCw className="mr-2 size-4" />
            Retry Camera Access
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Face Capture</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Position your face within the oval and hold still for capture
        </p>
      </div>

      <CameraFrame
        videoRef={videoRef}
        capturedImage={capturedImage}
        scanning={phase === 'analyzing'}
        status={phase === 'done' ? 'success' : phase === 'analyzing' ? 'detecting' : 'idle'}
        hint={
          phase === 'preview'
            ? 'Look directly at the camera'
            : phase === 'analyzing'
              ? ANALYSIS_STEPS[analysisStep]
              : 'Face capture complete'
        }
      />

      {phase === 'analyzing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-sm space-y-3"
        >
          <VerificationProgressBar progress={progress} label="Biometric analysis" />
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Scan className="size-3.5 animate-pulse text-primary" />
            {ANALYSIS_STEPS[analysisStep]}
          </div>
        </motion.div>
      )}

      {phase === 'done' && score !== null && timestamp && (
        <VerificationScoreCard
          title="Face Match Result"
          score={score}
          timestamp={formatCaptureTimestamp(timestamp)}
          details={[
            { label: 'Quality', value: 'HD · Good lighting' },
            { label: 'Match confidence', value: score >= 95 ? 'High' : 'Moderate' },
          ]}
        />
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {phase === 'preview' && (
          <Button
            className="rounded-xl px-8"
            size="lg"
            onClick={handleCapture}
            disabled={!isReady}
          >
            <Camera className="mr-2 size-4" />
            {isReady ? 'Capture Face' : 'Starting camera...'}
          </Button>
        )}
        {phase === 'done' && (
          <>
            <Button variant="outline" className="rounded-xl" onClick={handleRetake}>
              <RefreshCw className="mr-2 size-4" />
              Retake Photo
            </Button>
            {onContinue && (
              <Button className="rounded-xl" onClick={onContinue}>
                Continue to Liveness
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
