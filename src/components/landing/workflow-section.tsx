import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  ClipboardCheck,
  FileText,
  RotateCcw,
  UserPlus,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { workflowSteps } from '@/data/mock-data'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

const stepIcons = [UserPlus, Users, FileText, ClipboardCheck, RotateCcw, BarChart3]
const workflowVideo = workflowSteps[0].video!

type WorkflowVideoPlayerProps = {
  src: string
  title: string
  videoRef?: React.RefObject<HTMLVideoElement | null>
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: () => void
}

function WorkflowVideoPlayer({
  src,
  title,
  videoRef,
  onTimeUpdate,
  onPlay,
  onPause,
}: WorkflowVideoPlayerProps) {
  useEffect(() => {
    const video = videoRef?.current
    if (!video) return
    video.loop = true
    void video.play().catch(() => undefined)
  }, [videoRef])

  return (
    <video
      ref={videoRef}
      src={src}
      className="absolute inset-0 size-full object-cover"
      controls
      loop
      muted
      autoPlay
      playsInline
      preload="auto"
      aria-label={title}
      onTimeUpdate={(event) => {
        const video = event.currentTarget
        if (video.duration > 0) {
          onTimeUpdate?.(video.currentTime, video.duration)
        }
      }}
      onPlay={onPlay}
      onPause={onPause}
    />
  )
}

function getStepFromProgress(progress: number) {
  return Math.min(workflowSteps.length - 1, Math.floor(progress * workflowSteps.length))
}

type WorkflowProgressStripProps = {
  highlightedStep: number
  lineProgress: number
  isVideoPlaying: boolean
  onStepClick: (index: number) => void
  variant?: 'light' | 'overlay'
}

function WorkflowProgressStrip({
  highlightedStep,
  lineProgress,
  isVideoPlaying,
  onStepClick,
  variant = 'light',
}: WorkflowProgressStripProps) {
  const isOverlay = variant === 'overlay'
  const lineFill = `${Math.min(100, Math.max(0, lineProgress * 100))}%`

  return (
    <div className={cn('relative w-full', isOverlay ? 'px-0' : 'px-2')}>
      <div
        className={cn(
          'absolute left-[8.33%] right-[8.33%] top-5 h-0.5 overflow-hidden rounded-full',
          isOverlay ? 'bg-white/20' : 'bg-border',
        )}
      >
        <motion.div
          className={cn(
            'h-full origin-left rounded-full',
            isOverlay
              ? 'bg-gradient-to-r from-white/80 via-white to-white/80'
              : 'bg-gradient-to-r from-icy-blue-400 via-icy-blue-500 to-icy-blue-600',
          )}
          animate={{ width: lineFill }}
          transition={
            isVideoPlaying
              ? { duration: 0.15, ease: 'linear' }
              : { type: 'spring', stiffness: 120, damping: 20 }
          }
        />
      </div>

      {isVideoPlaying && (
        <motion.div
          className={cn(
            'pointer-events-none absolute top-5 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
            isOverlay
              ? 'bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]'
              : 'bg-icy-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]',
          )}
          animate={{ left: lineFill }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
      )}

      <div className="relative grid grid-cols-6 gap-1 sm:gap-2">
        {workflowSteps.map((step, i) => {
          const isActive = highlightedStep === i
          const isComplete = highlightedStep > i

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => onStepClick(i)}
              className="group flex flex-col items-center gap-2"
              aria-label={`Go to step ${i + 1}: ${step.title}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <motion.div
                className={cn(
                  'relative flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold sm:size-10 sm:text-sm',
                  isOverlay
                    ? isActive
                      ? 'border-white bg-white text-icy-blue-600'
                      : isComplete
                        ? 'border-white/60 bg-white/20 text-white'
                        : 'border-white/30 bg-white/10 text-white/70 group-hover:border-white/50 group-hover:bg-white/20'
                    : isActive
                      ? 'border-icy-blue-500 bg-icy-blue-500 text-white'
                      : isComplete
                        ? 'border-icy-blue-300 bg-icy-blue-50 text-icy-blue-600'
                        : 'border-border bg-white text-muted-foreground group-hover:border-icy-blue-200',
                )}
                animate={
                  isActive
                    ? {
                        scale: isVideoPlaying ? [1, 1.12, 1] : [1, 1.08, 1],
                      }
                    : { scale: 1 }
                }
                transition={
                  isActive && isVideoPlaying
                    ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.35 }
                }
              >
                {i + 1}
                {isActive && isVideoPlaying && (
                  <motion.span
                    className={cn(
                      'absolute inset-0 rounded-full border-2',
                      isOverlay ? 'border-white/80' : 'border-icy-blue-400',
                    )}
                    animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </motion.div>

              <span
                className={cn(
                  'max-w-[72px] text-center text-[9px] font-medium leading-tight sm:max-w-[90px] sm:text-[10px]',
                  isOverlay
                    ? isActive
                      ? 'text-white'
                      : isComplete
                        ? 'text-white/80'
                        : 'text-white/55 group-hover:text-white/75'
                    : isActive
                      ? 'text-icy-blue-600'
                      : isComplete
                        ? 'text-icy-blue-500/80'
                        : 'text-muted-foreground',
                )}
              >
                {step.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepContextOverlay({
  stepIndex,
  isVideoPlaying,
}: {
  stepIndex: number
  isVideoPlaying: boolean
}) {
  const step = workflowSteps[stepIndex]
  const Icon = stepIcons[stepIndex]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, y: 16, x: -12 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -8, x: 12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none max-w-xl"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:size-11">
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                Step {stepIndex + 1} of {workflowSteps.length}
              </span>
              {isVideoPlaying && (
                <motion.span
                  className="text-[9px] font-semibold uppercase tracking-wide text-icy-blue-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
                  animate={{ opacity: [1, 0.55, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  • Live
                </motion.span>
              )}
            </div>
            <h3 className="mt-1 text-base font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-lg">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              {step.summary}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function WorkflowSection() {
  const ref = useScrollReveal<HTMLDivElement>({ stagger: 0.1 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playbackStep, setPlaybackStep] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const captionStep = workflowSteps[playbackStep]

  const handleVideoTimeUpdate = useCallback((currentTime: number, duration: number) => {
    const progress = currentTime / duration
    setVideoProgress(progress)
    setPlaybackStep(getStepFromProgress(progress))
  }, [])

  const handleProgressStepClick = useCallback((index: number) => {
    const video = videoRef.current
    if (video?.duration) {
      video.currentTime = (index / workflowSteps.length) * video.duration + 0.01
    }
    setPlaybackStep(index)
    setVideoProgress((index + 0.01) / workflowSteps.length)
  }, [])

  const lineProgress = isVideoPlaying
    ? videoProgress
    : playbackStep / Math.max(workflowSteps.length - 1, 1)

  return (
    <section id="workflow" className="overflow-hidden bg-background">
      <div className="section-padding pb-8 sm:pb-10 lg:pb-12">
        <div ref={ref} className="mx-auto max-w-7xl">
          <div className="reveal-item mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-icy-blue-500">
              End-to-End Workflow
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From Registration to{' '}
              <span className="text-gradient">Compliance Reports</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Watch the full pension lifecycle in one walkthrough. Each step highlights what
              happens on screen so anyone can follow along.
            </p>
          </div>
        </div>
      </div>

      <div className="reveal-item relative left-1/2 w-screen max-w-none -translate-x-1/2 bg-neutral-950">
        <div className="relative aspect-video w-full min-h-[300px] sm:min-h-[440px] lg:min-h-[560px]">
          <WorkflowVideoPlayer
            videoRef={videoRef}
            src={workflowVideo}
            title={workflowSteps[0].demoTitle ?? workflowSteps[0].title}
            onTimeUpdate={handleVideoTimeUpdate}
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4 sm:top-6">
            <p className="text-xs font-medium text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-sm">
              PensionFlow AI — Full workflow demo
            </p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-14 px-4 sm:top-16 sm:px-6 lg:px-8">
            <StepContextOverlay stepIndex={playbackStep} isVideoPlaying={isVideoPlaying} />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-12 px-4 sm:bottom-14 sm:px-6 lg:px-8">
            <div className="pointer-events-auto mx-auto max-w-7xl">
              <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:mb-4">
                Workflow progress — tap a step to jump
              </p>
              <WorkflowProgressStrip
                highlightedStep={playbackStep}
                lineProgress={lineProgress}
                isVideoPlaying={isVideoPlaying}
                onStepClick={handleProgressStepClick}
                variant="overlay"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="section-padding pt-8 sm:pt-10 lg:pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="reveal-item grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {workflowSteps.map((step, i) => {
            const Icon = stepIcons[i]
            const isActive = playbackStep === i

            return (
              <button
                key={step.title}
                type="button"
                onClick={() => handleProgressStepClick(i)}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                  isActive
                    ? 'border-icy-blue-200 bg-icy-blue-50/50 shadow-sm'
                    : 'border-border/60 bg-white hover:border-icy-blue-100 hover:bg-icy-blue-50/30',
                )}
              >
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    isActive
                      ? 'bg-icy-blue-500 text-white'
                      : 'bg-icy-blue-50 text-icy-blue-600',
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {i + 1}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {step.summary}
                  </p>
                </div>
              </button>
            )
          })}
          </div>

          <p className="reveal-item mt-6 text-center text-sm text-muted-foreground">
            Currently showing:{' '}
            <span className="font-medium text-foreground">{captionStep.title}</span>
            {' — '}
            {captionStep.summary}
          </p>
        </div>
      </div>
    </section>
  )
}
