import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeCheck,
  Clock,
  FileCheck2,
  RotateCcw,
  Sparkles,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { heroVideos } from '@/assets/media'

const scenarios: {
  input: string
  hubLabel: string
  hubTitle: string
  hubSubtitle: string
  hubIcon: LucideIcon
  output: string
  outputBrand: string
  outputIcon: LucideIcon
  outputIconBg: string
  outputIconColor: string
}[] = [
  {
    input: 'I want to register a new pensioner...',
    hubLabel: 'Step 1 · Registration',
    hubTitle: 'Register Pensioner',
    hubSubtitle: 'Officers enter personal and service details',
    hubIcon: BadgeCheck,
    output: '5 min Registration Time',
    outputBrand: 'Pension Officers',
    outputIcon: Timer,
    outputIconBg: 'bg-icy-blue-50',
    outputIconColor: 'text-icy-blue-500',
  },
  {
    input: 'I want to verify a pensioner...',
    hubLabel: 'Step 2 · Verification',
    hubTitle: 'Pension Verification',
    hubSubtitle: 'AI cross-checks eligibility records',
    hubIcon: BadgeCheck,
    output: '78% Faster Verification',
    outputBrand: 'Pension Authority',
    outputIcon: Zap,
    outputIconBg: 'bg-violet-50',
    outputIconColor: 'text-violet-500',
  },
  {
    input: 'I want to process life certificates...',
    hubLabel: 'Step 3 · Life Certificate',
    hubTitle: 'Life Certificate',
    hubSubtitle: 'Digital submission and approval flow',
    hubIcon: FileCheck2,
    output: '200+ Hours Saved Monthly',
    outputBrand: 'Civil Services',
    outputIcon: Clock,
    outputIconBg: 'bg-amber-50',
    outputIconColor: 'text-amber-500',
  },
  {
    input: 'I want to recover excess pension...',
    hubLabel: 'Step 4 · Recovery',
    hubTitle: 'Recovery Pipeline',
    hubSubtitle: 'Detect and track overpayments',
    hubIcon: RotateCcw,
    output: '60% Recovery Success',
    outputBrand: 'Treasury Board',
    outputIcon: TrendingUp,
    outputIconBg: 'bg-emerald-50',
    outputIconColor: 'text-emerald-500',
  },
]

function getIndexFromTime(currentTime: number, duration: number, count: number) {
  if (duration <= 0) return 0
  const progress = currentTime / duration
  return Math.min(count - 1, Math.floor(progress * count))
}

function getSegmentStart(index: number, duration: number, count: number) {
  return (index / count) * duration + 0.01
}

function getSegmentEnd(index: number, duration: number, count: number) {
  if (index >= count - 1) return duration
  return ((index + 1) / count) * duration
}

function getVisibleIndices(active: number, length: number) {
  return [
    (active - 1 + length) % length,
    active,
    (active + 1) % length,
  ] as const
}

type InputSlotProps = {
  index: number
  position: 'prev' | 'active' | 'next'
}

function InputSlot({ index, position }: InputSlotProps) {
  const scenario = scenarios[index]
  const isActive = position === 'active'
  const isHiddenOnMobile = !isActive

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0.35,
        scale: isActive ? 1 : 0.92,
        y: position === 'prev' ? -4 : position === 'next' ? 4 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'flex items-center gap-2.5 rounded-full border px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-3',
        isHiddenOnMobile ? 'hidden lg:flex' : 'flex',
        isActive
          ? 'border-icy-blue-200/80 bg-white shadow-[0_8px_32px_rgba(59,130,246,0.12)]'
          : 'border-transparent bg-transparent',
      ].join(' ')}
    >
      <Sparkles
        className={[
          'size-4 shrink-0 sm:size-[18px]',
          isActive ? 'text-icy-blue-500' : 'text-icy-blue-300',
        ].join(' ')}
      />
      <span
        className={[
          'text-xs font-medium sm:text-sm',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        ].join(' ')}
      >
        {scenario.input}
      </span>
    </motion.div>
  )
}

type OutputSlotProps = {
  index: number
  position: 'prev' | 'active' | 'next'
}

function OutputSlot({ index, position }: OutputSlotProps) {
  const scenario = scenarios[index]
  const OutputIcon = scenario.outputIcon
  const isActive = position === 'active'
  const isHiddenOnMobile = !isActive
  const [metric, ...rest] = scenario.output.split(' ')

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0.3,
        scale: isActive ? 1 : 0.9,
        y: position === 'prev' ? -6 : position === 'next' ? 6 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'rounded-2xl border px-4 py-3 sm:px-5 sm:py-4',
        isHiddenOnMobile ? 'hidden lg:block' : 'block',
        isActive
          ? 'border-icy-blue-200/70 bg-white shadow-[0_8px_32px_rgba(59,130,246,0.14)]'
          : 'border-transparent bg-white/40',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            'flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10',
            isActive ? scenario.outputIconBg : 'bg-muted/60',
          ].join(' ')}
        >
          <OutputIcon
            className={[
              'size-4 sm:size-[18px]',
              isActive ? scenario.outputIconColor : 'text-muted-foreground',
            ].join(' ')}
            strokeWidth={2.25}
          />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight sm:text-base">
            <span className="text-foreground">{metric} </span>
            <span className="text-icy-blue-500">{rest.join(' ')}</span>
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
            {scenario.outputBrand}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function ConnectorLine({
  side,
  pulsePosition,
}: {
  side: 'left' | 'right'
  pulsePosition: number
  showPulse?: boolean
}) {
  const clamped = Math.min(1, Math.max(0, pulsePosition))

  return (
    <div
      className={[
        'relative hidden min-w-[56px] flex-1 items-center self-center lg:flex xl:min-w-[72px]',
        side === 'left' ? 'mr-2' : 'ml-2',
      ].join(' ')}
    >
      <div className="hero-flow-line-track relative w-full">
        {clamped > 0.01 && (
          <div
            className={[
              'hero-flow-line-fill absolute top-1/2 -translate-y-1/2',
              side === 'right' ? 'hero-flow-line-fill--out' : 'hero-flow-line-fill--in',
            ].join(' ')}
            style={{ width: `${clamped * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}

type ProcessingHubProps = {
  activeIndex: number
  videoRef: React.RefObject<HTMLVideoElement | null>
  onTimeUpdate: () => void
}

function ProcessingHub({
  activeIndex,
  videoRef,
  onTimeUpdate,
}: ProcessingHubProps) {
  const scenario = scenarios[activeIndex]
  const HubIcon = scenario.hubIcon

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <motion.div
        className="hero-hub-glow absolute size-[200px] rounded-full sm:size-[300px] lg:size-[340px]"
        animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="hero-hub-ring relative flex size-[180px] items-center justify-center rounded-full p-[6px] sm:size-[280px] sm:p-2 lg:size-[320px]">
        <div className="relative size-[156px] overflow-hidden rounded-full bg-neutral-950 sm:size-[248px] lg:size-[284px]">
          <video
            ref={videoRef}
            src={heroVideos.registerPensioner}
            className="absolute inset-0 size-full object-cover object-top"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Pension platform workflow demo"
            onTimeUpdate={onTimeUpdate}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          <div className="absolute inset-x-0 top-3 flex justify-center sm:top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-black/50 px-2 py-0.5 backdrop-blur-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[8px] font-semibold uppercase tracking-wider text-emerald-300 sm:text-[9px]">
                Live Demo
              </span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10 text-center sm:px-4 sm:pb-4"
            >
              <div className="mx-auto mb-1.5 flex size-7 items-center justify-center rounded-lg bg-icy-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.45)] sm:size-8">
                <HubIcon className="size-3.5 sm:size-4" strokeWidth={2} />
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-icy-blue-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-[10px]">
                {scenario.hubLabel}
              </p>
              <h3 className="mt-0.5 text-[11px] font-bold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:text-sm">
                {scenario.hubTitle}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] sm:text-[10px]">
                {scenario.hubSubtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export function HeroFlowVisual() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isSeekingRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [segmentProgress, setSegmentProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.loop = true
    video.muted = true
    void video.play().catch(() => undefined)
  }, [])

  const syncFromVideo = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration || isSeekingRef.current) return

    const count = scenarios.length
    const index = getIndexFromTime(video.currentTime, video.duration, count)
    const segmentStart = getSegmentStart(index, video.duration, count)
    const segmentEnd = getSegmentEnd(index, video.duration, count)
    const segmentDuration = segmentEnd - segmentStart
    const progress =
      segmentDuration > 0
        ? Math.min(1, (video.currentTime - segmentStart) / segmentDuration)
        : 0

    setActiveIndex(index)
    setSegmentProgress(progress)
  }, [])

  const handleScenarioSelect = useCallback((index: number) => {
    const video = videoRef.current
    if (video?.duration) {
      isSeekingRef.current = true
      video.currentTime = getSegmentStart(index, video.duration, scenarios.length)
      setActiveIndex(index)
      setSegmentProgress(0)
      window.setTimeout(() => {
        isSeekingRef.current = false
      }, 350)
    } else {
      setActiveIndex(index)
      setSegmentProgress(0)
    }
  }, [])

  const visible = getVisibleIndices(activeIndex, scenarios.length)
  const positions = ['prev', 'active', 'next'] as const
  const flowProgress = (activeIndex + segmentProgress) / scenarios.length
  const leftPulse = Math.min(1, flowProgress * 2)
  const rightPulse = flowProgress <= 0.5 ? 0 : (flowProgress - 0.5) * 2

  return (
    <div className="relative mx-auto mt-12 w-full max-w-5xl lg:mt-16">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-icy-blue-500">
        Synced with live demo playback
      </p>

      <div className="flex items-center justify-center gap-0 lg:gap-2">
        <div className="marquee-column flex w-[38%] max-w-[220px] flex-col gap-3 sm:max-w-[260px] lg:w-[28%] lg:max-w-none lg:gap-4">
          {visible.map((idx, i) => (
            <InputSlot key={`${activeIndex}-${idx}-${positions[i]}`} index={idx} position={positions[i]} />
          ))}
        </div>

        <ConnectorLine side="left" pulsePosition={leftPulse} />
        <ProcessingHub
          activeIndex={activeIndex}
          videoRef={videoRef}
          onTimeUpdate={syncFromVideo}
        />
        <ConnectorLine side="right" pulsePosition={rightPulse} />

        <div className="marquee-column flex w-[38%] max-w-[220px] flex-col gap-3 sm:max-w-[260px] lg:w-[28%] lg:max-w-none lg:gap-4">
          {visible.map((idx, i) => (
            <OutputSlot key={`${activeIndex}-${idx}-${positions[i]}`} index={idx} position={positions[i]} />
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex justify-center gap-2">
          {scenarios.map((scenario, i) => (
            <button
              key={scenario.hubLabel}
              type="button"
              aria-label={`Jump to ${scenario.hubTitle}`}
              aria-current={i === activeIndex ? 'step' : undefined}
              onClick={() => handleScenarioSelect(i)}
              className="group p-1"
            >
              <motion.span
                className={[
                  'block h-1.5 rounded-full transition-colors',
                  i === activeIndex ? 'bg-icy-blue-500' : 'bg-border group-hover:bg-icy-blue-200',
                  i < activeIndex ? 'bg-icy-blue-300' : '',
                ].join(' ')}
                animate={{ width: i === activeIndex ? 24 : 8 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          Now showing:{' '}
          <span className="font-medium text-foreground">{scenarios[activeIndex].hubTitle}</span>
          {' — '}
          {scenarios[activeIndex].hubSubtitle}
        </p>
      </div>
    </div>
  )
}

export { scenarios as heroScenarios }
