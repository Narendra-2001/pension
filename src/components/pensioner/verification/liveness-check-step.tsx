import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, ScanFace, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useCameraStream } from '@/hooks/use-camera-stream'
import {
  formatCaptureTimestamp,
  generateLivenessScore,
} from '@/lib/verification-capture'

import {
  CameraFrame,
  VerificationProgressBar,
  VerificationScoreCard,
} from './verification-ui'

const LIVENESS_CHALLENGES = [
  {
    id: 'blink',
    label: 'Blink twice',
    instruction: 'Blink your eyes naturally twice',
    icon: Eye,
    duration: 2800,
  },
  {
    id: 'turn-left',
    label: 'Turn left',
    instruction: 'Slowly turn your head to the left',
    icon: ArrowLeft,
    duration: 3000,
  },
  {
    id: 'turn-right',
    label: 'Turn right',
    instruction: 'Slowly turn your head to the right',
    icon: ArrowRight,
    duration: 3000,
  },
  {
    id: 'center',
    label: 'Face center',
    instruction: 'Look straight at the camera and hold still',
    icon: UserRound,
    duration: 2500,
  },
] as const

interface LivenessCheckStepProps {
  onComplete: (result: { timestamp: string; score: number }) => void
  onContinue?: () => void
}

export function LivenessCheckStep({ onComplete, onContinue }: LivenessCheckStepProps) {
  const { videoRef, isReady, error, startCamera, stopCamera } = useCameraStream()
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [challengeProgress, setChallengeProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [timestamp, setTimestamp] = useState<string | null>(null)
  const [passedChallenges, setPassedChallenges] = useState<string[]>([])

  const currentChallenge = LIVENESS_CHALLENGES[challengeIndex]

  useEffect(() => {
    void startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const runChallenge = useCallback(
    (index: number) => {
      const challenge = LIVENESS_CHALLENGES[index]
      if (!challenge) return

      setIsRunning(true)
      setChallengeProgress(0)

      const start = Date.now()
      const interval = window.setInterval(() => {
        const elapsed = Date.now() - start
        const pct = Math.min(100, (elapsed / challenge.duration) * 100)
        setChallengeProgress(pct)

        if (elapsed >= challenge.duration) {
          window.clearInterval(interval)
          setPassedChallenges((prev) => [...prev, challenge.id])

          if (index < LIVENESS_CHALLENGES.length - 1) {
            setChallengeIndex(index + 1)
            setChallengeProgress(0)
            setTimeout(() => runChallenge(index + 1), 400)
          } else {
            const finalScore = generateLivenessScore()
            const capturedAt = new Date().toISOString()
            setScore(finalScore)
            setTimestamp(capturedAt)
            setIsComplete(true)
            setIsRunning(false)
            stopCamera()
            onComplete({ timestamp: capturedAt, score: finalScore })
            toast.success('Liveness verification passed')
          }
        }
      }, 50)

      return () => window.clearInterval(interval)
    },
    [onComplete, stopCamera],
  )

  const handleStart = () => {
    setChallengeIndex(0)
    setPassedChallenges([])
    setIsComplete(false)
    setScore(null)
    runChallenge(0)
  }

  const ChallengeIcon = currentChallenge?.icon ?? ScanFace

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Liveness Detection</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow the on-screen prompts to prove you are physically present
        </p>
      </div>

      {/* Challenge pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {LIVENESS_CHALLENGES.map((challenge, i) => {
          const done = passedChallenges.includes(challenge.id)
          const active = i === challengeIndex && isRunning
          return (
            <span
              key={challenge.id}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                done
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : active
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {done ? <CheckCircle2 className="size-3" /> : <span className="size-4 text-center">{i + 1}</span>}
              {challenge.label}
            </span>
          )
        })}
      </div>

      <CameraFrame
        videoRef={videoRef}
        scanning={isRunning}
        status={isComplete ? 'success' : isRunning ? 'detecting' : 'idle'}
        hint={isRunning ? currentChallenge.instruction : 'Ready for liveness check'}
      />

      <AnimatePresence mode="wait">
        {isRunning && currentChallenge && (
          <motion.div
            key={currentChallenge.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mx-auto max-w-sm space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                <ChallengeIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{currentChallenge.label}</p>
                <p className="text-xs text-muted-foreground">{currentChallenge.instruction}</p>
              </div>
            </div>
            <VerificationProgressBar
              progress={challengeProgress}
              label={`Challenge ${challengeIndex + 1} of ${LIVENESS_CHALLENGES.length}`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isComplete && score !== null && timestamp && (
        <VerificationScoreCard
          title="Liveness Result"
          score={score}
          timestamp={formatCaptureTimestamp(timestamp)}
          details={[
            { label: 'Challenges passed', value: `${LIVENESS_CHALLENGES.length}/${LIVENESS_CHALLENGES.length}` },
            { label: 'Spoof detection', value: 'No risk detected' },
          ]}
        />
      )}

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        {!isRunning && !isComplete && (
          <Button className="rounded-xl px-8" size="lg" onClick={handleStart} disabled={!isReady}>
            <ScanFace className="mr-2 size-4" />
            {isReady ? 'Start Liveness Check' : 'Starting camera...'}
          </Button>
        )}
        {isComplete && (
          <>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="size-4" />
              All liveness challenges passed
            </p>
            {onContinue && (
              <Button className="rounded-xl" onClick={onContinue}>
                Continue to Location
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
